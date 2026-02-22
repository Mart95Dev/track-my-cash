import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const FUTURE_DATE = new Date(Date.now() + 5 * 86400000).toISOString(); // +5 jours
const PAST_DATE = new Date(Date.now() - 1 * 86400000).toISOString(); // -1 jour

describe("trial-utils — isInTrial", () => {
  it("TU-54-1 : status=trialing + trial_ends_at futur → true", async () => {
    const { isInTrial } = await import("@/lib/trial-utils");
    expect(isInTrial({ plan: "pro", status: "trialing", trial_ends_at: FUTURE_DATE })).toBe(true);
  });

  it("TU-54-2 : status=trialing + trial_ends_at passé → false", async () => {
    const { isInTrial } = await import("@/lib/trial-utils");
    expect(isInTrial({ plan: "pro", status: "trialing", trial_ends_at: PAST_DATE })).toBe(false);
  });

  it("TU-54-3 : status=active, plan=pro → false", async () => {
    const { isInTrial } = await import("@/lib/trial-utils");
    expect(isInTrial({ plan: "pro", status: "active" })).toBe(false);
  });
});

describe("trial-utils — getDaysRemaining", () => {
  it("TU-54-4 : date dans 5 jours → retourne environ 5", async () => {
    const { getDaysRemaining } = await import("@/lib/trial-utils");
    const days = getDaysRemaining(FUTURE_DATE);
    expect(days).toBeGreaterThanOrEqual(4);
    expect(days).toBeLessThanOrEqual(5);
  });

  it("TU-54-5 : date passée → retourne 0 (jamais négatif)", async () => {
    const { getDaysRemaining } = await import("@/lib/trial-utils");
    const days = getDaysRemaining(PAST_DATE);
    expect(days).toBe(0);
  });
});

describe("cron check-trials — autorisation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      }),
    }));
    process.env.CRON_SECRET = "test-secret";
  });

  it("TU-54-6 : GET sans Authorization → 401", async () => {
    const { GET } = await import("@/app/api/cron/check-trials/route");
    const request = new Request("http://localhost/api/cron/check-trials") as unknown as NextRequest;
    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
