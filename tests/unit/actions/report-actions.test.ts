import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-test"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/subscription-utils", () => ({
  canUseAI: vi.fn().mockResolvedValue({ allowed: true }),
}));

const mockGetMonthlySummary = vi.fn().mockResolvedValue([
  { month: "2026-01", income: 2500, expenses: 1850, net: 650, savingsRate: 26 },
]);
const mockGetExpensesByBroadCategory = vi.fn().mockResolvedValue([
  { category: "Alimentation", total: 500 },
]);
const mockSearchTransactions = vi.fn().mockResolvedValue({
  transactions: [
    { id: 1, date: "2026-01-15", description: "SNCF", category: "Transport", type: "expense", amount: 85, subcategory: "" },
  ],
  total: 1,
});
const mockGetGoals = vi.fn().mockResolvedValue([
  { id: 1, name: "Vacances", target_amount: 1000, current_amount: 400, currency: "EUR", deadline: null, created_at: "" },
]);

vi.mock("@/lib/queries", () => ({
  getMonthlySummary: mockGetMonthlySummary,
  getExpensesByBroadCategory: mockGetExpensesByBroadCategory,
  searchTransactions: mockSearchTransactions,
  getGoals: mockGetGoals,
}));

// Mock jsPDF minimal avec vi.hoisted pour éviter les problèmes de hoisting
const { MockJsPDF } = vi.hoisted(() => {
  class MockJsPDF {
    lastAutoTable = { finalY: 100 };
    setFontSize() {}
    setTextColor() {}
    text() {}
    output() { return "data:application/pdf;base64,FAKEPDFBASE64CONTENT"; }
  }
  return { MockJsPDF };
});

vi.mock("jspdf", () => ({ jsPDF: MockJsPDF }));
vi.mock("jspdf-autotable", () => ({ default: () => {} }));

describe("report-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMonthlySummary.mockResolvedValue([
      { month: "2026-01", income: 2500, expenses: 1850, net: 650, savingsRate: 26 },
    ]);
    mockSearchTransactions.mockResolvedValue({
      transactions: [{ id: 1, date: "2026-01-15", description: "SNCF", category: "Transport", type: "expense", amount: 85, subcategory: "" }],
      total: 1,
    });
  });

  it("TU-1-1 : generateMonthlyReportAction avec données valides → retourne { pdfBase64: string }", async () => {
    const { generateMonthlyReportAction } = await import("@/app/actions/report-actions");
    const result = await generateMonthlyReportAction("2026-01");
    expect("pdfBase64" in result).toBe(true);
    expect(typeof (result as { pdfBase64: string }).pdfBase64).toBe("string");
  });

  it("TU-1-2 : generateMonthlyReportAction retourne un pdfBase64 non vide (longueur > 10)", async () => {
    const { generateMonthlyReportAction } = await import("@/app/actions/report-actions");
    const result = await generateMonthlyReportAction("2026-01");
    expect("pdfBase64" in result).toBe(true);
    expect((result as { pdfBase64: string }).pdfBase64.length).toBeGreaterThan(10);
  });

  it("TU-1-3 : generateMonthlyReportAction inclut le mois dans le filename", async () => {
    const { generateMonthlyReportAction } = await import("@/app/actions/report-actions");
    const result = await generateMonthlyReportAction("2026-01");
    expect("filename" in result).toBe(true);
    expect((result as { filename: string }).filename).toContain("2026-01");
  });

  it("TU-1-4 : generateMonthlyReportAction sans données pour le mois → retourne { error }", async () => {
    mockGetMonthlySummary.mockResolvedValueOnce([]);
    mockSearchTransactions.mockResolvedValueOnce({ transactions: [], total: 0 });
    const { generateMonthlyReportAction } = await import("@/app/actions/report-actions");
    const result = await generateMonthlyReportAction("2020-01");
    expect("error" in result).toBe(true);
    expect((result as { error: string }).error).toBeDefined();
  });

  it("TU-1-5 : plan Free → retourne { error } feature réservée Pro/Premium", async () => {
    const { canUseAI } = await import("@/lib/subscription-utils");
    vi.mocked(canUseAI).mockResolvedValueOnce({
      allowed: false,
      reason: "Fonctionnalité réservée aux plans Pro/Premium",
    });
    const { generateMonthlyReportAction } = await import("@/app/actions/report-actions");
    const result = await generateMonthlyReportAction("2026-01");
    expect("error" in result).toBe(true);
    expect((result as { error: string }).error).toContain("Pro");
  });
});
