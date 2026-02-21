import { describe, it, expect } from "vitest";
import { parseDateFR, parseAmount } from "@/lib/parsers/utils";

describe("parseDateFR", () => {
  it("TU-2-1 : parseDateFR('15/02/2026') → '2026-02-15'", () => {
    expect(parseDateFR("15/02/2026")).toBe("2026-02-15");
  });

  it("TU-2-2 : parseDateFR('01/01/2026') → '2026-01-01'", () => {
    expect(parseDateFR("01/01/2026")).toBe("2026-01-01");
  });

  it("TU-2-3 : parseDateFR('') → retourne la chaîne vide (pas de slash)", () => {
    // La fonction retourne le string d'origine si le format n'est pas DD/MM/YYYY
    expect(parseDateFR("")).toBe("");
  });

  it("TU-2-4 : parseDateFR('invalid') → retourne la chaîne d'origine", () => {
    expect(parseDateFR("invalid")).toBe("invalid");
  });
});

describe("parseAmount", () => {
  it("TU-2-5 : parseAmount('1 234,56') → 1234.56", () => {
    expect(parseAmount("1 234,56")).toBe(1234.56);
  });

  it("TU-2-6 : parseAmount('-567,89') → -567.89", () => {
    expect(parseAmount("-567,89")).toBe(-567.89);
  });

  it("TU-2-7 : parseAmount('0') → 0", () => {
    expect(parseAmount("0")).toBe(0);
  });

  it("TU-2-8 : parseAmount('abc') → NaN", () => {
    expect(parseAmount("abc")).toBeNaN();
  });
});
