/**
 * QA — STORY-097 — Route GET /api/reports/monthly — tests complémentaires
 * TU-97-QA-8 à TU-97-QA-12
 *
 * GAPs couverts :
 *  QA-8  : plan Pro + month valide → status 200 (AC-1 côté route — non testé par dev)
 *  QA-9  : plan Pro + month valide → Content-Type: application/pdf (AC-1)
 *  QA-10 : plan Pro + month valide → Content-Disposition: attachment; filename="rapport-..." (AC-1)
 *  QA-11 : plan Premium + month valide → status 200 (gate Premium aussi autorisé — AC-4)
 *  QA-12 : month invalide "2026-1" → 400 (doublon positif AC-5 avec mock aligné route)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({ user: { id: "u-qa" } }),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
  getDb: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/queries", () => ({
  getSetting: vi.fn().mockResolvedValue(null),
  getMonthlySummary: vi.fn().mockResolvedValue([
    { month: "2026-01", income: 3200, expenses: 1950, net: 1250 },
  ]),
  getExpensesByBroadCategory: vi.fn().mockResolvedValue([
    { category: "Courses", total: 450 },
    { category: "Loyer", total: 800 },
  ]),
  searchTransactions: vi.fn().mockResolvedValue({
    transactions: [
      {
        date: "2026-01-15",
        description: "Test transaction",
        category: "Divers",
        amount: -100,
      },
    ],
  }),
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

describe("GET /api/reports/monthly — QA (STORY-097)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-97-QA-8 : plan Pro + month valide → status 200 (AC-1 côté route)", async () => {
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("pro");
    const { GET } = await import("@/app/api/reports/monthly/route");
    const response = await GET(makeRequest("http://localhost/api/reports/monthly?month=2026-01"));
    expect(response.status).toBe(200);
  });

  it("TU-97-QA-9 : plan Pro + month valide → Content-Type: application/pdf (AC-1)", async () => {
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("pro");
    const { GET } = await import("@/app/api/reports/monthly/route");
    const response = await GET(makeRequest("http://localhost/api/reports/monthly?month=2026-01"));
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("TU-97-QA-10 : plan Pro + month valide → Content-Disposition contient filename rapport-2026-01.pdf (AC-1)", async () => {
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("pro");
    const { GET } = await import("@/app/api/reports/monthly/route");
    const response = await GET(makeRequest("http://localhost/api/reports/monthly?month=2026-01"));
    const disposition = response.headers.get("Content-Disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toContain("rapport-2026-01.pdf");
  });

  it("TU-97-QA-11 : plan Premium + month valide → status 200 (gate Pro ou Premium — AC-4)", async () => {
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("premium");
    const { GET } = await import("@/app/api/reports/monthly/route");
    const response = await GET(makeRequest("http://localhost/api/reports/monthly?month=2026-02"));
    expect(response.status).toBe(200);
  });

  it("TU-97-QA-12 : month invalide '2026-1' → 400 (AC-5 doublon — validation format côté route)", async () => {
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("pro");
    const { GET } = await import("@/app/api/reports/monthly/route");
    const response = await GET(
      makeRequest("http://localhost/api/reports/monthly?month=2026-1")
    );
    expect(response.status).toBe(400);
  });
});
