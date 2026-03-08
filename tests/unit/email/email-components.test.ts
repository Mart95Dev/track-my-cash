import { describe, it, expect } from "vitest";
import {
  renderHeading,
  renderSubtitle,
  renderParagraph,
  renderNote,
  renderCTA,
  renderSummaryTable,
  renderDataTable,
  renderProgressBar,
} from "@/lib/email/components";
import { EMAIL_COLORS } from "@/lib/email/styles";

describe("email/components", () => {
  describe("renderHeading", () => {
    it("renders h2 by default", () => {
      const html = renderHeading("Test");
      expect(html).toContain("<h2");
      expect(html).toContain("Test");
      expect(html).toContain("22px");
    });

    it("renders h3 when level=3", () => {
      const html = renderHeading("Sub", 3);
      expect(html).toContain("<h3");
      expect(html).toContain("16px");
    });
  });

  describe("renderSubtitle", () => {
    it("renders muted text", () => {
      const html = renderSubtitle("Mars 2026");
      expect(html).toContain("Mars 2026");
      expect(html).toContain(EMAIL_COLORS.textMuted);
    });
  });

  describe("renderParagraph", () => {
    it("renders with default color", () => {
      const html = renderParagraph("Hello");
      expect(html).toContain("Hello");
      expect(html).toContain(EMAIL_COLORS.textSecondary);
    });

    it("uses custom color", () => {
      const html = renderParagraph("Red", "#ff0000");
      expect(html).toContain("#ff0000");
    });
  });

  describe("renderNote", () => {
    it("renders small muted text", () => {
      const html = renderNote("Disclaimer");
      expect(html).toContain("Disclaimer");
      expect(html).toContain("13px");
    });
  });

  describe("renderCTA", () => {
    it("renders dark variant by default", () => {
      const html = renderCTA("Click", "https://example.com");
      expect(html).toContain("Click");
      expect(html).toContain("https://example.com");
      expect(html).toContain(EMAIL_COLORS.dark);
    });

    it("renders primary variant", () => {
      const html = renderCTA("Go", "/url", "primary");
      expect(html).toContain(EMAIL_COLORS.primary);
      expect(html).toContain("8px"); // border-radius
    });
  });

  describe("renderSummaryTable", () => {
    it("renders rows with labels and values", () => {
      const html = renderSummaryTable([
        { label: "Revenus", value: "100 €", valueColor: EMAIL_COLORS.income, highlight: true },
        { label: "Dépenses", value: "50 €", valueColor: EMAIL_COLORS.expense },
      ]);
      expect(html).toContain("Revenus");
      expect(html).toContain("100 €");
      expect(html).toContain(EMAIL_COLORS.income);
      expect(html).toContain("Dépenses");
      expect(html).toContain(EMAIL_COLORS.bgLight);
    });

    it("renders without highlight", () => {
      const html = renderSummaryTable([
        { label: "Test", value: "42" },
      ]);
      expect(html).toContain("Test");
      expect(html).toContain("42");
      expect(html).not.toContain("border-radius");
    });
  });

  describe("renderDataTable", () => {
    it("renders headers and data rows", () => {
      const html = renderDataTable(
        [{ header: "Cat" }, { header: "Montant", align: "right" }],
        [["Loisirs", "120 €"], ["Transport", "80 €"]],
      );
      expect(html).toContain("Cat");
      expect(html).toContain("Montant");
      expect(html).toContain("Loisirs");
      expect(html).toContain("120 €");
      expect(html).toContain("text-align: right");
    });
  });

  describe("renderProgressBar", () => {
    it("renders with percentage", () => {
      const html = renderProgressBar(75, "#d32f2f");
      expect(html).toContain("width: 75%");
      expect(html).toContain("#d32f2f");
    });

    it("caps at 100%", () => {
      const html = renderProgressBar(150, "#000");
      expect(html).toContain("width: 100%");
    });
  });
});

describe("EMAIL_COLORS", () => {
  it("has all required colors", () => {
    expect(EMAIL_COLORS.primary).toBe("#4848e5");
    expect(EMAIL_COLORS.income).toBe("#2e7d32");
    expect(EMAIL_COLORS.expense).toBe("#d32f2f");
    expect(EMAIL_COLORS.dark).toBe("#1a1a1a");
  });
});
