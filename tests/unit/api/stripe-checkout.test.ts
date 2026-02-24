import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks hoistés avant tous les imports
vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
      },
    },
  },
}));

vi.mock("@/lib/stripe-plans", () => ({
  PLANS: {
    free: {
      id: "free",
      name: "Gratuit",
      price: 0,
      stripePriceId: null,
      features: [],
      limits: { maxAccounts: 2, ai: false },
    },
    pro: {
      id: "pro",
      name: "Pro",
      price: 4.9,
      stripePriceId: "price_pro_test",
      features: [],
      limits: { maxAccounts: 5, ai: true },
    },
    premium: {
      id: "premium",
      name: "Premium",
      price: 7.9,
      stripePriceId: "price_premium_test",
      features: [],
      limits: { maxAccounts: -1, ai: true },
    },
  },
}));

vi.mock("@/lib/auth-utils", () => ({
  getRequiredSession: vi.fn().mockResolvedValue({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

import { POST } from "@/app/api/stripe/checkout/route";
import * as stripeModule from "@/lib/stripe";

const makePostRequest = (body: unknown): Request =>
  new Request("http://localhost/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/stripe/checkout (STORY-079 — Stripe Tax)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stripeModule.stripe.checkout.sessions.create).mockResolvedValue(
      { url: "https://checkout.stripe.com/test" } as never
    );
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
  });

  it("TU-79-1 : la session Stripe contient automatic_tax.enabled = true (AC-1)", async () => {
    const res = await POST(makePostRequest({ planId: "pro" }));
    expect(res.status).toBe(200);
    expect(stripeModule.stripe.checkout.sessions.create).toHaveBeenCalledOnce();
    const callArgs = vi.mocked(stripeModule.stripe.checkout.sessions.create).mock
      .calls[0][0] as Record<string, unknown>;
    expect(callArgs.automatic_tax).toEqual({ enabled: true });
  });

  it("TU-79-2 : la session Stripe contient tax_id_collection.enabled = true (AC-2)", async () => {
    const res = await POST(makePostRequest({ planId: "pro" }));
    expect(res.status).toBe(200);
    const callArgs = vi.mocked(stripeModule.stripe.checkout.sessions.create).mock
      .calls[0][0] as Record<string, unknown>;
    expect(callArgs.tax_id_collection).toEqual({ enabled: true });
  });

  it("TU-79-3 : retourne 400 si planId = 'free' (stripePriceId null) (AC-3)", async () => {
    const res = await POST(makePostRequest({ planId: "free" }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Plan invalide");
    expect(stripeModule.stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("TU-79-4 : retourne 400 si planId invalide (AC-3)", async () => {
    const res = await POST(makePostRequest({ planId: "inexistant" }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Plan invalide");
    expect(stripeModule.stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("TU-79-5 : retourne { url } si planId valide (AC-3)", async () => {
    const res = await POST(makePostRequest({ planId: "pro" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { url: string };
    expect(body.url).toBe("https://checkout.stripe.com/test");
  });

  it("TU-79-6 : fonctionne aussi avec le plan premium (AC-3)", async () => {
    const res = await POST(makePostRequest({ planId: "premium" }));
    expect(res.status).toBe(200);
    const callArgs = vi.mocked(stripeModule.stripe.checkout.sessions.create).mock
      .calls[0][0] as Record<string, unknown>;
    expect(callArgs.automatic_tax).toEqual({ enabled: true });
    expect(callArgs.tax_id_collection).toEqual({ enabled: true });
  });

  it("TU-83-7 : success_url contient '/bienvenue' (AC-6)", async () => {
    const res = await POST(makePostRequest({ planId: "pro" }));
    expect(res.status).toBe(200);
    const callArgs = vi.mocked(stripeModule.stripe.checkout.sessions.create).mock
      .calls[0][0] as Record<string, unknown>;
    expect(typeof callArgs.success_url).toBe("string");
    expect((callArgs.success_url as string)).toContain("/bienvenue");
  });

  it("TU-83-8 : success_url contient le planId souscrit (AC-6)", async () => {
    const res = await POST(makePostRequest({ planId: "pro" }));
    expect(res.status).toBe(200);
    const callArgs = vi.mocked(stripeModule.stripe.checkout.sessions.create).mock
      .calls[0][0] as Record<string, unknown>;
    expect((callArgs.success_url as string)).toContain("plan=pro");
  });
});
