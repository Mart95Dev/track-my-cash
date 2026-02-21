import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock renderEmailBase pour isoler renderWelcomeEmail
vi.mock("@/lib/email", () => ({
  renderEmailBase: vi.fn((title: string, body: string) => `<!DOCTYPE html>${title}${body}`),
}));

describe("renderWelcomeEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-1-1 : contient l'email utilisateur dans le corps", async () => {
    const { renderWelcomeEmail } = await import("@/lib/email-templates");
    const html = renderWelcomeEmail("user@example.com", "https://track-my-cash.fr");
    expect(html).toContain("user@example.com");
  });

  it("TU-1-2 : construit l'URL dashboard à partir de appUrl", async () => {
    const { renderWelcomeEmail } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderWelcomeEmail("user@example.com", "https://track-my-cash.fr");
    const callArg = vi.mocked(renderEmailBase).mock.calls[0][1];
    expect(callArg).toContain("https://track-my-cash.fr/dashboard");
  });

  it("TU-1-3 : si appUrl est vide, utilise '/dashboard' comme fallback", async () => {
    const { renderWelcomeEmail } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderWelcomeEmail("user@example.com", "");
    const callArg = vi.mocked(renderEmailBase).mock.calls[0][1];
    expect(callArg).toContain('href="/dashboard"');
  });

  it("TU-1-4 : passe le titre 'Bienvenue sur TrackMyCash' à renderEmailBase", async () => {
    const { renderWelcomeEmail } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderWelcomeEmail("user@example.com", "https://track-my-cash.fr");
    expect(vi.mocked(renderEmailBase).mock.calls[0][0]).toContain("TrackMyCash");
  });

  it("TU-1-5 : si userEmail vide, affiche '—' à la place", async () => {
    const { renderWelcomeEmail } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderWelcomeEmail("", "https://track-my-cash.fr");
    const callArg = vi.mocked(renderEmailBase).mock.calls[0][1];
    expect(callArg).toContain("—");
  });
});
