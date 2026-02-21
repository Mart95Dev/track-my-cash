import { describe, it, expect } from "vitest";
import { PLANS } from "@/lib/stripe-plans";

describe("PLANS — données utilisées sur la landing page", () => {
  it("TU-2-1 : PLANS.free.price === 0", () => {
    expect(PLANS.free.price).toBe(0);
  });

  it("TU-2-2 : PLANS.pro.price === 4.9", () => {
    expect(PLANS.pro.price).toBe(4.9);
  });

  it("TU-2-3 : PLANS.premium.price === 7.9", () => {
    expect(PLANS.premium.price).toBe(7.9);
  });

  it("TU-2-4 : chaque plan a au moins 3 features", () => {
    expect(PLANS.free.features.length).toBeGreaterThanOrEqual(3);
    expect(PLANS.pro.features.length).toBeGreaterThanOrEqual(3);
    expect(PLANS.premium.features.length).toBeGreaterThanOrEqual(3);
  });

  it("TU-2-5 : stripePriceId est null pour free", () => {
    expect(PLANS.free.stripePriceId).toBeNull();
  });
});
