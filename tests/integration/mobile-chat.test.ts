/**
 * Tests d'intégration — Proxy chat IA mobile (STORY-149)
 * AC-3 : Chat avec auth, rate limit, plan guard
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockGetMobileUserId = vi.fn().mockResolvedValue("user-pro");

vi.mock("@/lib/mobile-auth", () => ({
  getMobileUserId: (...args: unknown[]) => mockGetMobileUserId(...args),
  handleCors: vi.fn(() => new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  })),
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

const mockCanUseAI = vi.fn().mockResolvedValue({ allowed: true });
vi.mock("@/lib/subscription-utils", () => ({
  canUseAI: (...args: unknown[]) => mockCanUseAI(...args),
  getUserPlanId: vi.fn().mockResolvedValue("pro"),
}));

const mockCheckRateLimit = vi.fn().mockReturnValue({
  allowed: true,
  remaining: 29,
  resetAt: Date.now() + 3_600_000,
});
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
  getDb: vi.fn(() => ({})),
}));

vi.mock("@/lib/queries", () => ({
  getAllAccounts: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/ai-context", () => ({
  buildFinancialContext: vi.fn().mockResolvedValue("contexte financier"),
  SYSTEM_PROMPT: "System prompt",
}));

vi.mock("@/lib/ai-usage", () => ({
  incrementAiUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => () => "mock-model"),
}));

vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({ text: "Voici votre analyse financière." }),
  convertToModelMessages: vi.fn().mockResolvedValue([]),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function chatRequest(messages: { role: string; content: string }[] = []) {
  return new Request("https://app.test/api/mobile/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-jwt",
    },
    body: JSON.stringify({
      messages: messages.length > 0 ? messages : [{ role: "user", content: "Analyse mes dépenses" }],
    }),
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Intégration — Chat proxy IA (STORY-149 AC-3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("API_KEY_OPENROUTER", "test-key-123");
    mockGetMobileUserId.mockResolvedValue("user-pro");
    mockCanUseAI.mockResolvedValue({ allowed: true });
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 29,
      resetAt: Date.now() + 3_600_000,
    });
  });

  it("TU-4 : Chat avec utilisateur Pro → 200 + réponse IA", async () => {
    const { POST } = await import("@/app/api/mobile/chat/route");
    const res = await POST(chatRequest());

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reply).toBe("Voici votre analyse financière.");
  });

  it("TU-4b : Chat propage le userId pour le rate limit", async () => {
    const { POST } = await import("@/app/api/mobile/chat/route");
    await POST(chatRequest());

    expect(mockCheckRateLimit).toHaveBeenCalledWith("user-pro", 30, expect.any(Number));
  });

  it("TU-5 : Chat avec utilisateur Free → 403", async () => {
    mockCanUseAI.mockResolvedValue({
      allowed: false,
      reason: "Passez au plan Pro pour accéder au conseiller IA",
    });

    const { POST } = await import("@/app/api/mobile/chat/route");
    const res = await POST(chatRequest());

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("Pro");
  });

  it("TU-6 : Chat rate limited → 429", async () => {
    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 600_000,
    });

    const { POST } = await import("@/app/api/mobile/chat/route");
    const res = await POST(chatRequest());

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toContain("Limite");
  });

  it("TU-6b : Chat sans clé API → 500", async () => {
    vi.stubEnv("API_KEY_OPENROUTER", "");

    const { POST } = await import("@/app/api/mobile/chat/route");
    const res = await POST(chatRequest());

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain("Clé API");
  });

  it("TU-6c : Chat 401 sans auth", async () => {
    mockGetMobileUserId.mockImplementation(() => {
      throw new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    });

    const { POST } = await import("@/app/api/mobile/chat/route");

    try {
      await POST(chatRequest());
      expect.unreachable("Devrait throw");
    } catch (err) {
      expect(err).toBeInstanceOf(Response);
      expect((err as Response).status).toBe(401);
    }
  });
});
