import { describe, it, expect, vi } from "vitest";

// Mock renderEmailBase pour isoler le template du transport
vi.mock("@/lib/email", () => ({
  renderEmailBase: vi.fn((_title: string, body: string) => body),
  sendEmail: vi.fn(),
}));

import { renderTrialReminderEmail } from "@/lib/email-templates";

describe("renderTrialReminderEmail (STORY-080)", () => {
  it("TU-80-1 : J-3 contient '3 jours' dans le contenu (AC-3)", () => {
    const html = renderTrialReminderEmail(3, "Alice", "http://localhost:3000");
    expect(html).toContain("3 jours");
  });

  it("TU-80-2 : J-3 contient le lien /tarifs (AC-6)", () => {
    const html = renderTrialReminderEmail(3, "Alice", "http://localhost:3000");
    expect(html).toContain("/tarifs");
  });

  it("TU-80-3 : J-1 contient 'demain' (AC-4)", () => {
    const html = renderTrialReminderEmail(1, "Alice", "http://localhost:3000");
    expect(html).toContain("demain");
  });

  it("TU-80-4 : J-1 contient le CTA 'Continuer avec Pro' (AC-6)", () => {
    const html = renderTrialReminderEmail(1, "Alice", "http://localhost:3000");
    expect(html).toContain("Continuer avec Pro");
  });

  it("TU-80-9 : J-3 contient aussi le CTA (AC-6)", () => {
    const html = renderTrialReminderEmail(3, "Alice", "http://localhost:3000");
    expect(html).toContain("Continuer avec Pro");
  });

  it("TU-80-10 : le baseUrl est intégré dans le lien CTA (AC-6)", () => {
    const html = renderTrialReminderEmail(3, "Alice", "https://trackmycash.fr");
    expect(html).toContain("https://trackmycash.fr/tarifs");
  });

  it("TU-80-11 : J-3 contient la liste des features Pro (AC-3)", () => {
    const html = renderTrialReminderEmail(3, "Alice", "http://localhost:3000");
    expect(html).toContain("Import PDF");
  });

  it("TU-80-12 : J-1 est plus urgent que J-3 (texte différent)", () => {
    const html3 = renderTrialReminderEmail(3, "Alice", "http://localhost:3000");
    const html1 = renderTrialReminderEmail(1, "Alice", "http://localhost:3000");
    expect(html3).not.toBe(html1);
    expect(html1).toContain("demain");
    expect(html3).not.toContain("demain");
  });
});
