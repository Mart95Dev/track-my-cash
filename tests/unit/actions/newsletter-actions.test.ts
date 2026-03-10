/**
 * STORY-155 — Newsletter inscription (Server Action)
 * TU-155-1 à TU-155-5
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient, type Client } from "@libsql/client";

// ── Mocks ────────────────────────────────────────────────────────────────

const { mockSendEmail, mockDb } = vi.hoisted(() => ({
  mockSendEmail: vi.fn().mockResolvedValue({ success: true }),
  mockDb: { current: null as Client | null },
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => mockDb.current),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: mockSendEmail,
  renderEmailBase: vi.fn((title: string, body: string) => `<html>${body}</html>`),
}));

import { subscribeNewsletterAction } from "@/app/actions/newsletter-actions";

// ── DB Setup ─────────────────────────────────────────────────────────────

async function setupDb() {
  const db = createClient({ url: "file::memory:" });
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed')),
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
      unsubscribed_at TEXT
    );
  `);
  mockDb.current = db;
  return db;
}

function makeFormData(email: string, honeypot = "") {
  const fd = new FormData();
  fd.set("email", email);
  fd.set("website", honeypot);
  return fd;
}

// ── Tests ────────────────────────────────────────────────────────────────

describe("subscribeNewsletterAction (STORY-155)", () => {
  let db: Client;

  beforeEach(async () => {
    db = await setupDb();
    vi.clearAllMocks();
    mockSendEmail.mockResolvedValue({ success: true });
  });

  it("TU-155-1 : email valide est inséré en DB avec statut active", async () => {
    const result = await subscribeNewsletterAction(makeFormData("test@example.com"));
    expect(result.success).toBe(true);

    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'test@example.com'");
    expect(rows.rows).toHaveLength(1);
    expect(rows.rows[0].status).toBe("active");
  });

  it("TU-155-2 : email invalide retourne une erreur sans insertion", async () => {
    const result = await subscribeNewsletterAction(makeFormData("pas-un-email"));
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    const rows = await db.execute("SELECT * FROM newsletter_subscribers");
    expect(rows.rows).toHaveLength(0);
  });

  it("TU-155-2b : email vide retourne une erreur", async () => {
    const result = await subscribeNewsletterAction(makeFormData(""));
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("TU-155-3 : email doublon retourne message gracieux sans erreur", async () => {
    await subscribeNewsletterAction(makeFormData("duplicate@example.com"));
    vi.clearAllMocks();

    const result = await subscribeNewsletterAction(makeFormData("duplicate@example.com"));
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();

    // Pas de doublon en DB
    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'duplicate@example.com'");
    expect(rows.rows).toHaveLength(1);
  });

  it("TU-155-4 : honeypot rempli retourne succès silencieux sans insertion", async () => {
    const result = await subscribeNewsletterAction(makeFormData("bot@spam.com", "gotcha"));
    expect(result.success).toBe(true);

    // Pas d'insertion en DB
    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'bot@spam.com'");
    expect(rows.rows).toHaveLength(0);

    // Pas d'email envoyé
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("TU-155-5 : sendEmail est appelé avec le bon destinataire et sujet", async () => {
    await subscribeNewsletterAction(makeFormData("welcome@example.com"));

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "welcome@example.com",
        subject: expect.stringContaining("Bienvenue"),
      })
    );
  });

  it("TU-155-5b : l'email HTML contient un lien de désabonnement", async () => {
    await subscribeNewsletterAction(makeFormData("unsub@example.com"));

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const callArgs = mockSendEmail.mock.calls[0][0];
    expect(callArgs.html).toContain("desabonnement");
  });

  it("inscription réussie même si l'envoi d'email échoue", async () => {
    mockSendEmail.mockResolvedValue({ success: false, error: "SMTP down" });

    const result = await subscribeNewsletterAction(makeFormData("nomail@example.com"));
    expect(result.success).toBe(true);

    // L'email est quand même en DB
    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'nomail@example.com'");
    expect(rows.rows).toHaveLength(1);
  });

  it("email avec espaces est trimé", async () => {
    const result = await subscribeNewsletterAction(makeFormData("  spaces@example.com  "));
    expect(result.success).toBe(true);

    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'spaces@example.com'");
    expect(rows.rows).toHaveLength(1);
  });

  it("email en majuscules est normalisé en minuscules", async () => {
    const result = await subscribeNewsletterAction(makeFormData("UPPER@EXAMPLE.COM"));
    expect(result.success).toBe(true);

    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'upper@example.com'");
    expect(rows.rows).toHaveLength(1);
  });

  // ── Gaps corrigés (ex-QA) ─────────────────────────────────────────

  it("TU-155-7 : un utilisateur désabonné peut se réinscrire (status → active)", async () => {
    await db.execute({
      sql: "INSERT INTO newsletter_subscribers (id, email, status, unsubscribed_at) VALUES ('unsub-1', 'revenu@test.com', 'unsubscribed', datetime('now'))",
      args: [],
    });

    const result = await subscribeNewsletterAction(makeFormData("revenu@test.com"));
    expect(result.success).toBe(true);
    expect(result.message).toContain("nouveau");

    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'revenu@test.com'");
    expect(rows.rows[0].status).toBe("active");
    expect(rows.rows[0].unsubscribed_at).toBeNull();
  });

  it("TU-155-8 : un email doublon (déjà actif) ne renvoie pas d'email", async () => {
    await subscribeNewsletterAction(makeFormData("already@test.com"));
    vi.clearAllMocks();

    await subscribeNewsletterAction(makeFormData("already@test.com"));
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("TU-155-9 : l'URL de désabonnement contient l'email encodé", async () => {
    await subscribeNewsletterAction(makeFormData("test+alias@example.com"));

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const callArgs = mockSendEmail.mock.calls[0][0];
    expect(callArgs.html).toContain(encodeURIComponent("test+alias@example.com"));
  });

  it("TU-155-10 : email avec + est accepté et inséré", async () => {
    const result = await subscribeNewsletterAction(makeFormData("user+tag@example.com"));
    expect(result.success).toBe(true);

    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'user+tag@example.com'");
    expect(rows.rows).toHaveLength(1);
  });

  it("TU-155-11 : honeypot vide ne bloque pas l'inscription", async () => {
    const result = await subscribeNewsletterAction(makeFormData("legit@test.com", ""));
    expect(result.success).toBe(true);

    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'legit@test.com'");
    expect(rows.rows).toHaveLength(1);
  });

  it("TU-155-12 : honeypot avec espaces seulement ne bloque pas", async () => {
    const result = await subscribeNewsletterAction(makeFormData("spaces-hp@test.com", "   "));
    expect(result.success).toBe(true);

    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'spaces-hp@test.com'");
    expect(rows.rows).toHaveLength(1);
  });
});
