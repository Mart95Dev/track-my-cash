/**
 * Tests unitaires — /api/mobile/subscription/* (STORY-143)
 * AC-1 : Checkout session
 * AC-2 : Portal URL
 * AC-3 : Plans validés
 * AC-4 : Auth JWT requise
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

const mockCheckoutCreate = vi.fn().mockResolvedValue({
  url: "https://checkout.stripe.com/pay/cs_test_xxx",
});
const mockPortalCreate = vi.fn().mockResolvedValue({
  url: "https://billing.stripe.com/p/session/xxx",
});

vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: { sessions: { create: (...args: unknown[]) => mockCheckoutCreate(...args) } },
    billingPortal: { sessions: { create: (...args: unknown[]) => mockPortalCreate(...args) } },
  },
  getStripe: vi.fn(),
}));

vi.mock("@/lib/stripe-plans", () => ({
  PLANS: {
    free: { id: "free", name: "Gratuit", price: 0, stripePriceId: null, features: [], limits: { maxAccounts: 2, ai: false } },
    pro: { id: "pro", name: "Pro", price: 4.9, stripePriceId: "price_pro_test", features: [], limits: { maxAccounts: 5, ai: true } },
    premium: { id: "premium", name: "Premium", price: 7.9, stripePriceId: "price_premium_test", features: [], limits: { maxAccounts: -1, ai: true } },
  },
}));

const mockDbExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockReturnValue({
    execute: (...args: unknown[]) => mockDbExecute(...args),
  }),
}));

// ── Tests ───────────────────────────────────────────────────────────────────

describe("/api/mobile/subscription (STORY-143)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
    mockDbExecute.mockResolvedValue({
      rows: [{ email: "test@example.com", stripe_customer_id: "cus_test123", plan_id: "pro", status: "active" }],
    });
  });

  // ── AC-1 : Checkout session ─────────────────────────────────────────────

  describe("Checkout (AC-1)", () => {
    it("TU-1 : checkout retourne URL Stripe pour plan pro", async () => {
      mockDbExecute.mockResolvedValue({
        rows: [{ email: "test@example.com" }],
      });

      const { POST } = await import("@/app/api/mobile/subscription/checkout/route");
      const req = new Request("https://example.com/api/mobile/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({ planId: "pro" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.url).toContain("checkout.stripe.com");
    });

    // ── AC-3 : Plan invalide ──────────────────────────────────────────────

    it("TU-2 : checkout rejette plan invalide", async () => {
      const { POST } = await import("@/app/api/mobile/subscription/checkout/route");
      const req = new Request("https://example.com/api/mobile/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({ planId: "invalid-plan" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("invalide");
    });

    it("TU-2b : checkout rejette plan free (pas de stripePriceId)", async () => {
      const { POST } = await import("@/app/api/mobile/subscription/checkout/route");
      const req = new Request("https://example.com/api/mobile/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({ planId: "free" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    // ── AC-4 : Auth requise ───────────────────────────────────────────────

    it("TU-3 : checkout requiert auth JWT", async () => {
      mockGetMobileUserId.mockRejectedValue(
        new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 })
      );

      const { POST } = await import("@/app/api/mobile/subscription/checkout/route");
      const req = new Request("https://example.com/api/mobile/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "pro" }),
      });

      try {
        await POST(req);
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(Response);
        expect((err as Response).status).toBe(401);
      }
    });
  });

  // ── AC-2 : Portal URL ──────────────────────────────────────────────────

  describe("Portal URL (AC-2)", () => {
    it("TU-4 : portal-url retourne URL Stripe", async () => {
      mockDbExecute.mockResolvedValue({
        rows: [{ stripe_customer_id: "cus_test123" }],
      });

      const { GET } = await import("@/app/api/mobile/subscription/portal-url/route");
      const req = new Request("https://example.com/api/mobile/subscription/portal-url", {
        method: "GET",
        headers: { Authorization: "Bearer valid-jwt" },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.url).toContain("billing.stripe.com");
    });

    it("TU-5 : portal-url 404 sans abonnement", async () => {
      mockDbExecute.mockResolvedValue({ rows: [] });

      const { GET } = await import("@/app/api/mobile/subscription/portal-url/route");
      const req = new Request("https://example.com/api/mobile/subscription/portal-url", {
        method: "GET",
        headers: { Authorization: "Bearer valid-jwt" },
      });

      const res = await GET(req);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain("abonnement");
    });
  });

  // ── CORS ────────────────────────────────────────────────────────────────

  describe("CORS", () => {
    it("checkout OPTIONS retourne 204", async () => {
      const { OPTIONS } = await import("@/app/api/mobile/subscription/checkout/route");
      const res = OPTIONS();
      expect(res.status).toBe(204);
    });

    it("portal-url OPTIONS retourne 204", async () => {
      const { OPTIONS } = await import("@/app/api/mobile/subscription/portal-url/route");
      const res = OPTIONS();
      expect(res.status).toBe(204);
    });
  });
});
