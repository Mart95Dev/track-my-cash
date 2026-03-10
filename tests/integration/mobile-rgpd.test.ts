/**
 * Tests d'intégration — RGPD export + suppression (STORY-149)
 * AC-5 : Export données, demande de suppression 30j
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockGetMobileUserId = vi.fn().mockResolvedValue("user-123");

vi.mock("@/lib/mobile-auth", () => ({
  getMobileUserId: (...args: unknown[]) => mockGetMobileUserId(...args),
  jsonOk: vi.fn((data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  ),
  jsonError: vi.fn((status: number, message: string) =>
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  ),
  handleCors: vi.fn(() => new Response(null, { status: 204 })),
}));

// ── DB mock ──────────────────────────────────────────────────────────────────

const mockDbExecute = vi.fn();
const mockMainDb = { execute: (...args: unknown[]) => mockDbExecute(...args) };

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
  getDb: vi.fn(() => mockMainDb),
}));

// ── Queries mock (export) ────────────────────────────────────────────────────

const mockAccounts = [
  { id: 1, name: "Courant", initial_balance: 1000, balance_date: "2026-01-01", currency: "EUR" },
];
const mockTransactions = [
  { id: 10, account_id: 1, type: "expense", amount: 50, date: "2026-03-01", category: "Alimentation" },
];
const mockBudgets = [{ id: 1, category: "Alimentation", amount: 300, month: "2026-03" }];

vi.mock("@/lib/queries", () => ({
  getAllAccounts: vi.fn().mockResolvedValue(mockAccounts),
  getTransactions: vi.fn().mockResolvedValue(mockTransactions),
  getRecurringPayments: vi.fn().mockResolvedValue([]),
  getAllBudgets: vi.fn().mockResolvedValue(mockBudgets),
  getGoals: vi.fn().mockResolvedValue([]),
  getAllSettings: vi.fn().mockResolvedValue({ theme: "dark" }),
}));

vi.mock("@/lib/admin-logger", () => ({
  writeAdminLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(url: string, method: string, body?: Record<string, unknown>) {
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-jwt",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return new Request(url, opts);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Intégration — Export RGPD (STORY-149 AC-5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
  });

  it("TU-10 : GET /user/export → JSON avec toutes les données", async () => {
    const { GET } = await import("@/app/api/mobile/user/export/route");
    const res = await GET(
      makeRequest("https://app.test/api/mobile/user/export", "GET")
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Content-Disposition")).toContain("track-my-cash-export");

    const json = await res.json();
    expect(json.version).toBe("1.0");
    expect(json.exportDate).toBeTruthy();
    expect(json.accounts).toEqual(mockAccounts);
    expect(json.transactions).toEqual(mockTransactions);
    expect(json.budgets).toEqual(mockBudgets);
    expect(json.goals).toEqual([]);
    expect(json.settings).toEqual({ theme: "dark" });
  });

  it("TU-10b : Export requiert auth", async () => {
    mockGetMobileUserId.mockImplementation(() => {
      throw new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
    });

    const { GET } = await import("@/app/api/mobile/user/export/route");
    try {
      await GET(makeRequest("https://app.test/api/mobile/user/export", "GET"));
      expect.unreachable("Devrait throw");
    } catch (err) {
      expect(err).toBeInstanceOf(Response);
      expect((err as Response).status).toBe(401);
    }
  });
});

describe("Intégration — Suppression RGPD (STORY-149 AC-5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
    // Pas de demande existante
    mockDbExecute.mockResolvedValueOnce({ rows: [] });
    // Email de l'utilisateur
    mockDbExecute.mockResolvedValueOnce({ rows: [{ email: "test@example.com" }] });
    // INSERT deletion_request
    mockDbExecute.mockResolvedValueOnce({ rowsAffected: 1 });
  });

  it("TU-11 : DELETE /user/delete → crée deletion_request (30j)", async () => {
    const { DELETE } = await import("@/app/api/mobile/user/delete/route");
    const res = await DELETE(
      makeRequest("https://app.test/api/mobile/user/delete", "DELETE", {
        reason: "Test intégration",
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.scheduledDeleteAt).toBeTruthy();

    // Vérifie que la date est ~30 jours dans le futur
    const deleteDate = new Date(json.scheduledDeleteAt);
    const now = new Date();
    const diffDays = Math.round((deleteDate.getTime() - now.getTime()) / 86400000);
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });

  it("TU-11b : Double suppression → 409", async () => {
    // Reset les mocks pour simuler une demande existante
    mockDbExecute.mockReset();
    mockDbExecute.mockResolvedValueOnce({
      rows: [{ user_id: "user-123", scheduled_delete_at: "2026-04-10" }],
    });

    const { DELETE } = await import("@/app/api/mobile/user/delete/route");
    const res = await DELETE(
      makeRequest("https://app.test/api/mobile/user/delete", "DELETE")
    );

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("déjà planifiée");
  });

  it("TU-11c : Suppression avec raison optionnelle", async () => {
    const { DELETE } = await import("@/app/api/mobile/user/delete/route");
    await DELETE(
      makeRequest("https://app.test/api/mobile/user/delete", "DELETE", {
        reason: "Je quitte l'app",
      })
    );

    // Le 3e appel à db.execute est l'INSERT avec la raison
    const insertCall = mockDbExecute.mock.calls[2];
    expect(insertCall[0].sql).toContain("deletion_requests");
    expect(insertCall[0].args).toContain("Je quitte l'app");
  });

  it("TU-11d : Suppression requiert auth", async () => {
    mockGetMobileUserId.mockImplementation(() => {
      throw new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
    });

    const { DELETE } = await import("@/app/api/mobile/user/delete/route");
    try {
      await DELETE(
        makeRequest("https://app.test/api/mobile/user/delete", "DELETE")
      );
      expect.unreachable("Devrait throw");
    } catch (err) {
      expect(err).toBeInstanceOf(Response);
      expect((err as Response).status).toBe(401);
    }
  });
});
