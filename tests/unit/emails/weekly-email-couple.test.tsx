/**
 * TU-96-7 à TU-96-10 — STORY-096
 * Tests unitaires : renderWeeklyEmail — section couple
 */
import { describe, it, expect } from "vitest";
import { renderWeeklyEmail } from "@/lib/email-templates";
import type { CoupleWeeklyData } from "@/lib/couple-queries";

const BASE_DATA = {
  weekStart: "2026-02-17",
  weekEnd: "2026-02-23",
  totalExpenses: 500,
  totalIncome: 1000,
  currency: "EUR",
  topCategories: [],
  budgetsOver: [],
  goalsProgress: [],
};

const mockCoupleWeekly: CoupleWeeklyData = {
  sharedExpenses: 245.5,
  balance: 35,
  topSharedCategory: "Courses alimentaires",
  transactionCount: 4,
  partnerName: "Marie",
};

describe("renderWeeklyEmail — section couple (STORY-096)", () => {
  it("TU-96-7 : coupleWeekly défini → section 'en couple' dans le rendu", () => {
    const html = renderWeeklyEmail(
      { ...BASE_DATA, coupleWeekly: mockCoupleWeekly },
      "Thomas",
      "https://app.test"
    );
    expect(html).toContain("Cette semaine en couple");
    expect(html).toContain("Marie");
    expect(html).toContain("4");
  });

  it("TU-96-8 : coupleWeekly undefined → section couple absente", () => {
    const html = renderWeeklyEmail(BASE_DATA, "Thomas", "https://app.test");
    expect(html).not.toContain("Cette semaine en couple");
  });

  it("TU-96-9 : balance positive (35) → 'partenaire vous doit'", () => {
    const html = renderWeeklyEmail(
      { ...BASE_DATA, coupleWeekly: mockCoupleWeekly },
      "Thomas",
      "https://app.test"
    );
    expect(html).toContain("partenaire vous doit");
  });

  it("TU-96-10 : balance négative (-20) → 'vous devez'", () => {
    const html = renderWeeklyEmail(
      { ...BASE_DATA, coupleWeekly: { ...mockCoupleWeekly, balance: -20 } },
      "Thomas",
      "https://app.test"
    );
    expect(html).toContain("vous devez");
  });
});
