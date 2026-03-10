/**
 * STORY-157 — TF-157-1 à TF-157-5 : API route newsletter unsubscribe
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient, type Client } from "@libsql/client";

// ── Mocks ────────────────────────────────────────────────────────────────

vi.stubEnv("NEWSLETTER_SECRET", "test-secret-key-for-hmac-signing");

const { mockDb } = vi.hoisted(() => ({
  mockDb: { current: null as Client | null },
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => mockDb.current),
}));

import { generateUnsubscribeUrl } from "@/lib/newsletter-utils";
import { GET } from "@/app/api/newsletter/unsubscribe/route";

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

// ── Tests ────────────────────────────────────────────────────────────────

describe("GET /api/newsletter/unsubscribe (STORY-157)", () => {
  let db: Client;

  beforeEach(async () => {
    db = await setupDb();
    vi.clearAllMocks();
  });

  function makeRequest(params: Record<string, string>) {
    const url = new URL("http://localhost:3000/api/newsletter/unsubscribe");
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    return new Request(url.toString());
  }

  function getEmailAndToken(email: string) {
    const url = generateUnsubscribeUrl(email, "http://localhost:3000");
    const parsed = new URL(url);
    return {
      email: parsed.searchParams.get("email")!,
      token: parsed.searchParams.get("token")!,
    };
  }

  it("TF-157-1 — token valide → status 200 + HTML de confirmation", async () => {
    await db.execute({
      sql: "INSERT INTO newsletter_subscribers (id, email, status) VALUES ('sub-1', 'user@test.com', 'active')",
      args: [],
    });

    const { email, token } = getEmailAndToken("user@test.com");
    const response = await GET(makeRequest({ email, token }));

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(html).toContain("Désinscription confirmée");
  });

  it("TF-157-2 — token invalide → status 403", async () => {
    const response = await GET(makeRequest({ email: "user@test.com", token: "invalid-token" }));
    expect(response.status).toBe(403);
  });

  it("TF-157-3 — sans params → status 400", async () => {
    const response = await GET(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it("TF-157-3b — email sans token → status 400", async () => {
    const response = await GET(makeRequest({ email: "user@test.com" }));
    expect(response.status).toBe(400);
  });

  it("TF-157-4 — met à jour status=unsubscribed et unsubscribed_at en DB", async () => {
    await db.execute({
      sql: "INSERT INTO newsletter_subscribers (id, email, status) VALUES ('sub-2', 'unsub@test.com', 'active')",
      args: [],
    });

    const { email, token } = getEmailAndToken("unsub@test.com");
    await GET(makeRequest({ email, token }));

    const rows = await db.execute("SELECT * FROM newsletter_subscribers WHERE email = 'unsub@test.com'");
    expect(rows.rows[0].status).toBe("unsubscribed");
    expect(rows.rows[0].unsubscribed_at).not.toBeNull();
  });

  it("TF-157-5 — email déjà désabonné → status 200 (idempotent)", async () => {
    await db.execute({
      sql: "INSERT INTO newsletter_subscribers (id, email, status, unsubscribed_at) VALUES ('sub-3', 'already@test.com', 'unsubscribed', datetime('now'))",
      args: [],
    });

    const { email, token } = getEmailAndToken("already@test.com");
    const response = await GET(makeRequest({ email, token }));

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Désinscription confirmée");
  });

  it("email inexistant en DB avec token valide → status 404", async () => {
    const { email, token } = getEmailAndToken("ghost@test.com");
    const response = await GET(makeRequest({ email, token }));
    expect(response.status).toBe(404);
  });

  // ── QA-157 — Gaps comblés ─────────────────────────────────────────────

  it("QA-157-5 — idempotent : unsubscribed_at n'est PAS modifié si déjà désabonné", async () => {
    const originalDate = "2026-01-15T10:00:00.000Z";
    await db.execute({
      sql: "INSERT INTO newsletter_subscribers (id, email, status, unsubscribed_at) VALUES ('sub-idem', 'idem@test.com', 'unsubscribed', ?)",
      args: [originalDate],
    });

    const { email, token } = getEmailAndToken("idem@test.com");
    await GET(makeRequest({ email, token }));

    const rows = await db.execute("SELECT unsubscribed_at FROM newsletter_subscribers WHERE email = 'idem@test.com'");
    // La date originale doit être préservée, pas écrasée
    expect(String(rows.rows[0].unsubscribed_at)).toBe(originalDate);
  });

  it("QA-157-6 — la réponse HTML est un document complet avec doctype et meta viewport", async () => {
    await db.execute({
      sql: "INSERT INTO newsletter_subscribers (id, email, status) VALUES ('sub-html', 'html@test.com', 'active')",
      args: [],
    });

    const { email, token } = getEmailAndToken("html@test.com");
    const response = await GET(makeRequest({ email, token }));
    const html = await response.text();

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<html lang="fr">');
    expect(html).toContain('name="viewport"');
    expect(html).toContain("charset=");
  });

  it("QA-157-7 — token seulement (sans email) → status 400", async () => {
    const response = await GET(makeRequest({ token: "some-token" }));
    expect(response.status).toBe(400);
  });
});
