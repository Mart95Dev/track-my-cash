/**
 * TU-104-1 à TU-104-4 — STORY-104
 * Tests unitaires : renderCoupleReminderEmail
 */
import { describe, it, expect } from "vitest";
import { renderCoupleReminderEmail } from "@/lib/email-templates";

describe("renderCoupleReminderEmail (STORY-104)", () => {
  it("TU-104-1 : retourne HTML contenant le code d'invitation", () => {
    const html = renderCoupleReminderEmail("ABC123", 1);
    expect(html).toContain("ABC123");
  });

  it("TU-104-2 : retourne HTML contenant 'partenaire' et 'Koupli'", () => {
    const html = renderCoupleReminderEmail("XYZ789", 3);
    expect(html).toContain("partenaire");
    expect(html).toContain("Koupli");
  });

  it("TU-104-3 : accepte days=7 et retourne du HTML valide", () => {
    const html = renderCoupleReminderEmail("CODE77", 7);
    expect(html).toContain("CODE77");
    expect(html).toContain("Koupli");
    expect(html.length).toBeGreaterThan(100);
  });

  it("TU-104-4 : retourne une chaîne non-vide pour tous les paliers", () => {
    const html1 = renderCoupleReminderEmail("AAA111", 1);
    const html3 = renderCoupleReminderEmail("BBB222", 3);
    const html7 = renderCoupleReminderEmail("CCC333", 7);
    expect(html1.length).toBeGreaterThan(0);
    expect(html3.length).toBeGreaterThan(0);
    expect(html7.length).toBeGreaterThan(0);
  });
});
