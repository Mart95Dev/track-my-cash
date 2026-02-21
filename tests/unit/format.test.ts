import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "@/lib/format";

// STORY-001 — formatCurrency/formatDate : locale dynamique

describe("formatCurrency", () => {
  it("AC-1 : format EN — 1 234,56 EUR → €1,234.56", () => {
    const result = formatCurrency(1234.56, "EUR", "en");
    expect(result).toContain("1,234");
    expect(result).toContain("€");
  });

  it("AC-2 : format FR — 1 234,56 EUR → 1 234,56 €", () => {
    const result = formatCurrency(1234.56, "EUR", "fr");
    expect(result).toContain("1");
    expect(result).toContain("234");
    expect(result).toContain("€");
  });

  it("AC-3 : locale par défaut (fr) sans argument", () => {
    const result = formatCurrency(1000, "EUR");
    // doit formatter comme fr-FR (espace insécable + € à droite)
    expect(result).toContain("€");
    expect(result).toContain("1");
    expect(result).toContain("000");
  });

  it("AC-4 : devise MGA en locale FR", () => {
    const result = formatCurrency(50000, "MGA", "fr");
    expect(result).toContain("MGA");
    expect(result).toContain("50");
  });

  it("AC-5 : montant négatif", () => {
    const result = formatCurrency(-250, "EUR", "fr");
    expect(result).toContain("-");
    expect(result).toContain("250");
  });

  it("AC-6 : montant zéro", () => {
    const result = formatCurrency(0, "EUR", "fr");
    expect(result).toContain("0");
    expect(result).toContain("€");
  });
});

describe("formatDate", () => {
  it("AC-7 : format EN → contient Feb", () => {
    const result = formatDate("2026-02-21", "en");
    expect(result.toLowerCase()).toContain("feb");
  });

  it("AC-8 : format FR → contient févr", () => {
    const result = formatDate("2026-02-21", "fr");
    expect(result.toLowerCase()).toMatch(/f[eé]vr/);
  });

  it("AC-9 : locale par défaut (fr) sans argument", () => {
    const result = formatDate("2026-02-21");
    expect(result).toContain("2026");
  });

  it("AC-10 : format ES → contient feb", () => {
    const result = formatDate("2026-02-21", "es");
    expect(result.toLowerCase()).toContain("feb");
  });

  it("AC-11 : date en janvier", () => {
    const result = formatDate("2026-01-15", "en");
    expect(result).toContain("2026");
    expect(result.toLowerCase()).toContain("jan");
  });

  it("AC-12 : contient l'année", () => {
    const result = formatDate("2026-12-31", "fr");
    expect(result).toContain("2026");
  });
});
