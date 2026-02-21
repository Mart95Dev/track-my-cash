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

describe("renderLowBalanceAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-2-1 : contient le nom du compte", async () => {
    const { renderLowBalanceAlert } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderLowBalanceAlert("Compte Courant", 250, 500, "EUR");
    const body = vi.mocked(renderEmailBase).mock.calls[0][1];
    expect(body).toContain("Compte Courant");
  });

  it("TU-2-2 : contient le solde formaté en euros", async () => {
    const { renderLowBalanceAlert } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderLowBalanceAlert("Compte Courant", 250, 500, "EUR");
    const body = vi.mocked(renderEmailBase).mock.calls[0][1];
    // Intl.NumberFormat fr-FR formate 250 en "250,00 €" ou "250 €"
    expect(body).toMatch(/250/);
  });

  it("TU-2-3 : contient le seuil d'alerte formaté", async () => {
    const { renderLowBalanceAlert } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderLowBalanceAlert("Compte Courant", 250, 500, "EUR");
    const body = vi.mocked(renderEmailBase).mock.calls[0][1];
    expect(body).toMatch(/500/);
  });

  it("TU-2-4 : contient '⚠️' ou 'alerte' dans le titre passé à renderEmailBase", async () => {
    const { renderLowBalanceAlert } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderLowBalanceAlert("Compte Courant", 250, 500, "EUR");
    const title = vi.mocked(renderEmailBase).mock.calls[0][0];
    expect(title.toLowerCase()).toMatch(/alerte|⚠️/);
  });
});

describe("renderBudgetAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-3-1 : type 'warning' — sujet contient ⚠️ et la catégorie", async () => {
    const { renderBudgetAlert } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderBudgetAlert("Alimentation", 420, 500, 84, "warning", "EUR");
    const title = vi.mocked(renderEmailBase).mock.calls[0][0];
    expect(title).toContain("⚠️");
    expect(title).toContain("Alimentation");
  });

  it("TU-3-2 : type 'exceeded' — sujet contient 🚨 et le pourcentage dans le corps", async () => {
    const { renderBudgetAlert } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderBudgetAlert("Transport", 550, 500, 110, "exceeded", "EUR");
    const title = vi.mocked(renderEmailBase).mock.calls[0][0];
    const body = vi.mocked(renderEmailBase).mock.calls[0][1];
    expect(title).toContain("🚨");
    expect(body).toContain("110");
  });

  it("TU-3-3 : les montants dépensé et limite sont présents dans le corps", async () => {
    const { renderBudgetAlert } = await import("@/lib/email-templates");
    const { renderEmailBase } = await import("@/lib/email");
    renderBudgetAlert("Loisirs", 80, 100, 80, "warning", "EUR");
    const body = vi.mocked(renderEmailBase).mock.calls[0][1];
    expect(body).toMatch(/80/);
    expect(body).toMatch(/100/);
  });
});
