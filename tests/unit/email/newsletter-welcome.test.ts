/**
 * STORY-155 — TU-155-6 : renderNewsletterWelcomeEmail
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/email", () => ({
  renderEmailBase: vi.fn((title: string, body: string) => `<!DOCTYPE html>${title}${body}`),
}));

describe("renderNewsletterWelcomeEmail (STORY-155)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-155-6 : contient un lien de désabonnement", async () => {
    const { renderNewsletterWelcomeEmail } = await import("@/lib/email-templates");
    const html = renderNewsletterWelcomeEmail(
      "test@example.com",
      "https://koupli.com/api/newsletter/unsubscribe?email=test%40example.com"
    );
    expect(html).toContain("desabonnement");
    expect(html).toContain("unsubscribe");
  });

  it("contient l'email du destinataire", async () => {
    const { renderNewsletterWelcomeEmail } = await import("@/lib/email-templates");
    const html = renderNewsletterWelcomeEmail("user@test.fr", "https://example.com/unsub");
    expect(html).toContain("user@test.fr");
  });

  it("contient le mot 'Bienvenue'", async () => {
    const { renderNewsletterWelcomeEmail } = await import("@/lib/email-templates");
    const html = renderNewsletterWelcomeEmail("user@test.fr", "https://example.com/unsub");
    expect(html).toContain("Bienvenue");
  });

  it("contient la promesse de fréquence (semaine)", async () => {
    const { renderNewsletterWelcomeEmail } = await import("@/lib/email-templates");
    const html = renderNewsletterWelcomeEmail("user@test.fr", "https://example.com/unsub");
    expect(html).toContain("semaine");
  });
});
