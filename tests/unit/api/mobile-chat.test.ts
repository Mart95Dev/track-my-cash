/**
 * Tests unitaires — /api/mobile/chat (STORY-140)
 * AC-1 : Route fonctionnelle avec JWT
 * AC-2 : Rate limiting + guard plan
 * AC-7 : CORS/OPTIONS
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("@/lib/mobile-auth", () => ({
  getMobileUserId: vi.fn(),
  handleCors: vi.fn().mockReturnValue(
    new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    })
  ),
  jsonOk: vi.fn((data: unknown) =>
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  ),
  jsonError: vi.fn((status: number, message: string) =>
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  ),
}));

vi.mock("@/lib/subscription-utils", () => ({
  canUseAI: vi.fn().mockResolvedValue({ allowed: true }),
  getUserPlanId: vi.fn().mockResolvedValue("pro"),
}));

vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockReturnValue({
    allowed: true,
    remaining: 29,
    resetAt: Date.now() + 3_600_000,
  }),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
  getDb: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/queries", () => ({
  getAllAccounts: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/ai-context", () => ({
  buildFinancialContext: vi.fn().mockResolvedValue("contexte financier mock"),
  SYSTEM_PROMPT: "System prompt mock",
}));

vi.mock("@/lib/ai-usage", () => ({
  incrementAiUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn().mockReturnValue(() => "mock-model"),
}));

vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({ text: "Réponse IA mock" }),
  convertToModelMessages: vi.fn().mockResolvedValue([]),
}));

import { getMobileUserId } from "@/lib/mobile-auth";
import { canUseAI } from "@/lib/subscription-utils";
import { checkRateLimit } from "@/lib/rate-limiter";

describe("/api/mobile/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("API_KEY_OPENROUTER", "test-key-123");
    (getMobileUserId as ReturnType<typeof vi.fn>).mockResolvedValue("user-123");
    (canUseAI as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true });
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue({
      allowed: true,
      remaining: 29,
      resetAt: Date.now() + 3_600_000,
    });
  });

  async function importRoute() {
    return await import("@/app/api/mobile/chat/route");
  }

  function makeRequest(body: Record<string, unknown> = {}) {
    return new Request("https://example.com/api/mobile/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-jwt",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Analyse mes dépenses" }],
        ...body,
      }),
    });
  }

  // TU-1 : 401 sans JWT
  it("retourne 401 sans JWT valide (AC-1)", async () => {
    (getMobileUserId as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    });

    const { POST } = await importRoute();
    const req = new Request("https://example.com/api/mobile/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });

    try {
      await POST(req);
      expect.fail("Devrait throw Response 401");
    } catch (err) {
      expect(err).toBeInstanceOf(Response);
      expect((err as Response).status).toBe(401);
    }
  });

  // TU-2 : 403 si plan free
  it("retourne 403 si plan free (AC-2)", async () => {
    (canUseAI as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed: false,
      reason: "Passez au plan Pro pour accéder au conseiller IA",
    });

    const { POST } = await importRoute();
    const res = await POST(makeRequest());

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("Pro");
  });

  // TU-3 : 429 si rate limited
  it("retourne 429 si rate limited (AC-2)", async () => {
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 600_000,
    });

    const { POST } = await importRoute();
    const res = await POST(makeRequest());

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toContain("Limite");
  });

  // TU-4 : Proxy réussi vers OpenRouter
  it("proxy vers OpenRouter avec clé serveur et retourne texte IA (AC-1)", async () => {
    const { POST } = await importRoute();
    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reply).toBe("Réponse IA mock");
  });

  // TU-5 : OPTIONS retourne CORS
  it("OPTIONS retourne headers CORS 204 (AC-7)", async () => {
    const { OPTIONS } = await importRoute();
    const res = OPTIONS();

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Authorization");
  });
});
