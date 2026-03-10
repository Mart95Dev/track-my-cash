/**
 * Tests unitaires — /api/mobile/settings & categorization-rules (STORY-145)
 * AC-1 : GET settings
 * AC-2 : PUT settings
 * AC-3 : GET rules
 * AC-4 : POST rules
 * AC-5 : DELETE rules/[id]
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockGetMobileUserId = vi.fn().mockResolvedValue("user-123");

vi.mock("@/lib/mobile-auth", () => ({
  getMobileUserId: (...args: unknown[]) => mockGetMobileUserId(...args),
  jsonOk: vi.fn((data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  ),
  jsonCreated: vi.fn((data: unknown) =>
    new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  ),
  jsonNoContent: vi.fn(() =>
    new Response(null, { status: 204 })
  ),
  jsonError: vi.fn((status: number, message: string) =>
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  ),
  handleCors: vi.fn(() =>
    new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    })
  ),
}));

const mockGetAllSettings = vi.fn().mockResolvedValue([
  { key: "theme", value: "dark" },
  { key: "currency", value: "EUR" },
]);
const mockSetSetting = vi.fn().mockResolvedValue(undefined);
const mockGetCategorizationRules = vi.fn().mockResolvedValue([
  { id: 1, pattern: "CARREFOUR", category: "Alimentation", priority: 10 },
  { id: 2, pattern: "SNCF", category: "Transport", priority: 5 },
]);
const mockCreateCategorizationRule = vi.fn().mockResolvedValue(undefined);
const mockDeleteCategorizationRule = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/queries", () => ({
  getAllSettings: (...args: unknown[]) => mockGetAllSettings(...args),
  setSetting: (...args: unknown[]) => mockSetSetting(...args),
  getCategorizationRules: (...args: unknown[]) => mockGetCategorizationRules(...args),
  createCategorizationRule: (...args: unknown[]) => mockCreateCategorizationRule(...args),
  deleteCategorizationRule: (...args: unknown[]) => mockDeleteCategorizationRule(...args),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({ execute: vi.fn() }),
}));

// ── Tests ───────────────────────────────────────────────────────────────────

describe("/api/mobile/settings (STORY-145)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
  });

  // ── AC-1 : GET settings ─────────────────────────────────────────────────

  it("TU-1 : GET settings retourne les paires cle/valeur", async () => {
    const { GET } = await import("@/app/api/mobile/settings/route");
    const req = new Request("https://example.com/api/mobile/settings", {
      headers: { Authorization: "Bearer valid-jwt" },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.settings).toBeDefined();
    expect(json.settings.theme).toBe("dark");
    expect(json.settings.currency).toBe("EUR");
  });

  // ── AC-2 : PUT settings ─────────────────────────────────────────────────

  it("TU-2 : PUT settings upsert une valeur", async () => {
    const { PUT } = await import("@/app/api/mobile/settings/route");
    const req = new Request("https://example.com/api/mobile/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-jwt",
      },
      body: JSON.stringify({ key: "theme", value: "dark" }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(mockSetSetting).toHaveBeenCalled();
  });

  // ── AC-6 : Auth requise ─────────────────────────────────────────────────

  it("TU-6 : settings requiert auth JWT", async () => {
    mockGetMobileUserId.mockRejectedValue(
      new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 })
    );

    const { GET } = await import("@/app/api/mobile/settings/route");
    const req = new Request("https://example.com/api/mobile/settings");

    try {
      await GET(req);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(Response);
      expect((err as Response).status).toBe(401);
    }
  });
});

describe("/api/mobile/categorization-rules (STORY-145)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
  });

  // ── AC-3 : GET rules ───────────────────────────────────────────────────

  it("TU-3 : GET rules retourne les regles triees par priority", async () => {
    const { GET } = await import("@/app/api/mobile/categorization-rules/route");
    const req = new Request("https://example.com/api/mobile/categorization-rules", {
      headers: { Authorization: "Bearer valid-jwt" },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.rules).toHaveLength(2);
    expect(json.rules[0].priority).toBeGreaterThanOrEqual(json.rules[1].priority);
  });

  // ── AC-4 : POST rules ──────────────────────────────────────────────────

  it("TU-4 : POST rules cree une regle", async () => {
    const { POST } = await import("@/app/api/mobile/categorization-rules/route");
    const req = new Request("https://example.com/api/mobile/categorization-rules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-jwt",
      },
      body: JSON.stringify({ pattern: "CARREFOUR", category: "Alimentation", priority: 10 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.pattern).toBe("CARREFOUR");
    expect(mockCreateCategorizationRule).toHaveBeenCalled();
  });

  // ── AC-5 : DELETE rules/[id] ───────────────────────────────────────────

  it("TU-5 : DELETE rules/[id] supprime la regle", async () => {
    const { DELETE } = await import("@/app/api/mobile/categorization-rules/[id]/route");
    const req = new Request("https://example.com/api/mobile/categorization-rules/5", {
      method: "DELETE",
      headers: { Authorization: "Bearer valid-jwt" },
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "5" }) });
    expect(res.status).toBe(204);
    expect(mockDeleteCategorizationRule).toHaveBeenCalled();
  });

  // ── CORS ────────────────────────────────────────────────────────────────

  it("settings OPTIONS retourne 204", async () => {
    const { OPTIONS } = await import("@/app/api/mobile/settings/route");
    const res = OPTIONS();
    expect(res.status).toBe(204);
  });

  it("rules OPTIONS retourne 204", async () => {
    const { OPTIONS } = await import("@/app/api/mobile/categorization-rules/route");
    const res = OPTIONS();
    expect(res.status).toBe(204);
  });

  it("rules/[id] OPTIONS retourne 204", async () => {
    const { OPTIONS } = await import("@/app/api/mobile/categorization-rules/[id]/route");
    const res = OPTIONS();
    expect(res.status).toBe(204);
  });
});
