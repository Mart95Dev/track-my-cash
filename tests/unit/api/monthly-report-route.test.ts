/**
 * TU-97-9 à TU-97-10 — STORY-097
 * Tests unitaires : GET /api/reports/monthly — gate plan + validation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({ user: { id: "u1" } }),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({ execute: vi.fn() }),
  getDb: vi.fn().mockReturnValue({ execute: vi.fn() }),
}));

vi.mock("@/lib/queries", () => ({
  getSetting: vi.fn().mockResolvedValue(null),
  getMonthlySummary: vi.fn().mockResolvedValue([]),
  getExpensesByBroadCategory: vi.fn().mockResolvedValue([]),
  searchTransactions: vi.fn().mockResolvedValue({ transactions: [] }),
}));

vi.mock("@/lib/pdf-report", () => ({
  validateMonthParam: (month: string | null) =>
    typeof month === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(month),
  generateMonthlyReport: vi.fn().mockReturnValue(new Uint8Array([37, 80, 68, 70, 0])),
}));

vi.mock("@/lib/subscription-utils", () => ({
  getUserPlanId: vi.fn(),
}));

import type { NextRequest } from "next/server";
import * as subscriptionUtils from "@/lib/subscription-utils";

const makeRequest = (url: string): NextRequest =>
  new Request(url, { method: "GET" }) as unknown as NextRequest;

describe("GET /api/reports/monthly (STORY-097)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-97-9 : plan Gratuit → retourne 403", async () => {
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("free");

    const { GET } = await import("@/app/api/reports/monthly/route");
    const response = await GET(makeRequest("http://localhost/api/reports/monthly?month=2026-01"));

    expect(response.status).toBe(403);
  });

  it("TU-97-10 : paramètre month manquant → retourne 400", async () => {
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("pro");

    const { GET } = await import("@/app/api/reports/monthly/route");
    const response = await GET(makeRequest("http://localhost/api/reports/monthly"));

    expect(response.status).toBe(400);
  });
});
