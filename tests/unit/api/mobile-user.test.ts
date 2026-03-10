/**
 * Tests unitaires — /api/mobile/user/* (STORY-144)
 * AC-1 : Export donnees RGPD
 * AC-2 : Suppression de compte
 * AC-3 : Double suppression empechee
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

const mockMainDbExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockReturnValue({
    execute: (...args: unknown[]) => mockMainDbExecute(...args),
  }),
  getUserDb: vi.fn().mockResolvedValue({
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  }),
}));

vi.mock("@/lib/queries", () => ({
  getAllAccounts: vi.fn().mockResolvedValue([{ id: 1, name: "Compte courant" }]),
  getTransactions: vi.fn().mockResolvedValue([{ id: 1, amount: -50 }]),
  getRecurringPayments: vi.fn().mockResolvedValue([]),
  getAllBudgets: vi.fn().mockResolvedValue([]),
  getGoals: vi.fn().mockResolvedValue([]),
  getAllSettings: vi.fn().mockResolvedValue([{ key: "lang", value: "fr" }]),
}));

const mockWriteAdminLog = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/admin-logger", () => ({
  writeAdminLog: (...args: unknown[]) => mockWriteAdminLog(...args),
}));

const mockSendEmail = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

// ── Tests ───────────────────────────────────────────────────────────────────

describe("/api/mobile/user (STORY-144)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
    mockMainDbExecute.mockResolvedValue({ rows: [] });
  });

  // ── AC-1 : Export donnees RGPD ──────────────────────────────────────────

  describe("Export (AC-1)", () => {
    it("TU-1 : export retourne toutes les tables utilisateur", async () => {
      const { GET } = await import("@/app/api/mobile/user/export/route");
      const req = new Request("https://example.com/api/mobile/user/export", {
        method: "GET",
        headers: { Authorization: "Bearer valid-jwt" },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Disposition")).toContain("track-my-cash-export");
      const json = await res.json();
      expect(json.accounts).toBeDefined();
      expect(json.transactions).toBeDefined();
      expect(json.settings).toBeDefined();
    });

    it("TU-2 : export requiert auth JWT", async () => {
      mockGetMobileUserId.mockRejectedValue(
        new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 })
      );

      const { GET } = await import("@/app/api/mobile/user/export/route");
      const req = new Request("https://example.com/api/mobile/user/export", {
        method: "GET",
      });

      try {
        await GET(req);
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(Response);
        expect((err as Response).status).toBe(401);
      }
    });
  });

  // ── AC-2 : Suppression de compte ───────────────────────────────────────

  describe("Delete (AC-2)", () => {
    it("TU-3 : delete cree une deletion_request", async () => {
      mockMainDbExecute
        // Premier appel : check existing request
        .mockResolvedValueOnce({ rows: [] })
        // Deuxieme appel : get user email
        .mockResolvedValueOnce({ rows: [{ email: "test@example.com" }] })
        // Troisieme appel : insert
        .mockResolvedValueOnce({ rows: [] });

      const { DELETE } = await import("@/app/api/mobile/user/delete/route");
      const req = new Request("https://example.com/api/mobile/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({ reason: "Je n'utilise plus l'app" }),
      });

      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.scheduledDeleteAt).toBeDefined();
    });

    it("TU-4 : delete ecrit un admin_log", async () => {
      mockMainDbExecute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ email: "test@example.com" }] })
        .mockResolvedValueOnce({ rows: [] });

      const { DELETE } = await import("@/app/api/mobile/user/delete/route");
      const req = new Request("https://example.com/api/mobile/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({}),
      });

      await DELETE(req);
      expect(mockWriteAdminLog).toHaveBeenCalled();
    });
  });

  // ── AC-3 : Double suppression empechee ─────────────────────────────────

  describe("Double suppression (AC-3)", () => {
    it("TU-5 : delete 409 si deja demande", async () => {
      mockMainDbExecute.mockResolvedValueOnce({
        rows: [{ user_id: "user-123", scheduled_delete_at: "2026-04-10T00:00:00Z" }],
      });

      const { DELETE } = await import("@/app/api/mobile/user/delete/route");
      const req = new Request("https://example.com/api/mobile/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({}),
      });

      const res = await DELETE(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toContain("planifiée");
    });
  });

  // ── CORS ────────────────────────────────────────────────────────────────

  describe("CORS", () => {
    it("export OPTIONS retourne 204", async () => {
      const { OPTIONS } = await import("@/app/api/mobile/user/export/route");
      const res = OPTIONS();
      expect(res.status).toBe(204);
    });

    it("delete OPTIONS retourne 204", async () => {
      const { OPTIONS } = await import("@/app/api/mobile/user/delete/route");
      const res = OPTIONS();
      expect(res.status).toBe(204);
    });
  });
});
