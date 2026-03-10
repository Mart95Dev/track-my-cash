/**
 * Tests unitaires — /api/mobile/anomalies (STORY-146)
 * AC-1 : Detection d'anomalies
 * AC-2 : Filtre par account_id
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockGetMobileUserId = vi.fn().mockResolvedValue("user-123");

vi.mock("@/lib/mobile-auth", () => ({
  getMobileUserId: (...args: unknown[]) => mockGetMobileUserId(...args),
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

const mockDbExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({
    execute: (...args: unknown[]) => mockDbExecute(...args),
  }),
}));

// ── Tests ───────────────────────────────────────────────────────────────────

describe("/api/mobile/anomalies (STORY-146)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
  });

  it("TU-1 : retourne les anomalies avec score >= 2.0", async () => {
    // Transactions recentes (1er appel)
    mockDbExecute.mockResolvedValueOnce({
      rows: [
        { id: 1, description: "RESTAURANT LUXE", amount: 200, category: "Restaurant", type: "expense", date: "2026-03-01" },
        { id: 2, description: "SUPERMARCHE", amount: 30, category: "Alimentation", type: "expense", date: "2026-03-02" },
      ],
    });
    // Moyennes historiques (2e appel)
    mockDbExecute.mockResolvedValueOnce({
      rows: [
        { category: "Restaurant", avg_amount: 50 },
        { category: "Alimentation", avg_amount: 40 },
      ],
    });

    const { GET } = await import("@/app/api/mobile/anomalies/route");
    const req = new Request("https://example.com/api/mobile/anomalies?months=3", {
      headers: { Authorization: "Bearer valid-jwt" },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.anomalies.length).toBeGreaterThan(0);
    // Restaurant 200 vs avg 50 → ratio 4.0 >= 2.0 ✓
    expect(json.anomalies[0].category).toBe("Restaurant");
    expect(json.anomalies[0].ratio).toBeGreaterThanOrEqual(2.0);
  });

  it("TU-2 : filtre par account_id", async () => {
    mockDbExecute.mockResolvedValueOnce({ rows: [] });
    mockDbExecute.mockResolvedValueOnce({ rows: [] });

    const { GET } = await import("@/app/api/mobile/anomalies/route");
    const req = new Request("https://example.com/api/mobile/anomalies?account_id=5", {
      headers: { Authorization: "Bearer valid-jwt" },
    });

    await GET(req);

    // Verifier que le SQL contient le filtre account_id
    const firstCall = mockDbExecute.mock.calls[0][0];
    expect(firstCall.sql).toContain("account_id");
    expect(firstCall.args).toContain(5);
  });

  it("TU-3 : auth requise", async () => {
    mockGetMobileUserId.mockRejectedValue(
      new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 })
    );

    const { GET } = await import("@/app/api/mobile/anomalies/route");
    const req = new Request("https://example.com/api/mobile/anomalies");

    try {
      await GET(req);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(Response);
      expect((err as Response).status).toBe(401);
    }
  });

  it("TU-4 : retourne tableau vide si pas d'anomalie", async () => {
    mockDbExecute.mockResolvedValueOnce({ rows: [] });
    mockDbExecute.mockResolvedValueOnce({ rows: [] });

    const { GET } = await import("@/app/api/mobile/anomalies/route");
    const req = new Request("https://example.com/api/mobile/anomalies", {
      headers: { Authorization: "Bearer valid-jwt" },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.anomalies).toEqual([]);
  });

  it("OPTIONS retourne 204", async () => {
    const { OPTIONS } = await import("@/app/api/mobile/anomalies/route");
    const res = OPTIONS();
    expect(res.status).toBe(204);
  });
});
