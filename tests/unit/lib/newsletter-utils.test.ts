/**
 * STORY-157 — TU-157-1 à TU-157-4 : newsletter-utils (HMAC unsubscribe)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.stubEnv("NEWSLETTER_SECRET", "test-secret-key-for-hmac-signing");

import {
  generateUnsubscribeUrl,
  verifyUnsubscribeToken,
} from "@/lib/newsletter-utils";

describe("generateUnsubscribeUrl (TU-157-1)", () => {
  it("TU-157-1 — génère une URL avec email et token HMAC", () => {
    const url = generateUnsubscribeUrl("test@example.com", "https://koupli.com");

    expect(url).toContain("/api/newsletter/unsubscribe");
    expect(url).toContain("email=test%40example.com");
    expect(url).toContain("token=");

    // Le token est un hex string non vide
    const parsed = new URL(url);
    const token = parsed.searchParams.get("token");
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);
    expect(/^[a-f0-9]+$/.test(token!)).toBe(true);
  });

  it("génère des tokens différents pour des emails différents", () => {
    const url1 = generateUnsubscribeUrl("a@test.com", "https://koupli.com");
    const url2 = generateUnsubscribeUrl("b@test.com", "https://koupli.com");

    const token1 = new URL(url1).searchParams.get("token");
    const token2 = new URL(url2).searchParams.get("token");
    expect(token1).not.toBe(token2);
  });

  it("génère le même token pour le même email (déterministe)", () => {
    const url1 = generateUnsubscribeUrl("same@test.com", "https://koupli.com");
    const url2 = generateUnsubscribeUrl("same@test.com", "https://koupli.com");

    const token1 = new URL(url1).searchParams.get("token");
    const token2 = new URL(url2).searchParams.get("token");
    expect(token1).toBe(token2);
  });
});

describe("verifyUnsubscribeToken (TU-157-2, TU-157-3, TU-157-4)", () => {
  it("TU-157-2 — retourne true pour un token valide", () => {
    const url = generateUnsubscribeUrl("valid@test.com", "https://koupli.com");
    const token = new URL(url).searchParams.get("token")!;

    expect(verifyUnsubscribeToken("valid@test.com", token)).toBe(true);
  });

  it("TU-157-3 — retourne false pour un token invalide", () => {
    expect(verifyUnsubscribeToken("valid@test.com", "fake-token-123")).toBe(false);
  });

  it("TU-157-4 — retourne false si email modifié (token d'un autre email)", () => {
    const url = generateUnsubscribeUrl("original@test.com", "https://koupli.com");
    const token = new URL(url).searchParams.get("token")!;

    // Utiliser le token d'un email avec un autre email
    expect(verifyUnsubscribeToken("tampered@test.com", token)).toBe(false);
  });

  it("retourne false pour un token vide", () => {
    expect(verifyUnsubscribeToken("test@test.com", "")).toBe(false);
  });
});

// ── QA-157 — Gaps comblés ─────────────────────────────────────────────

describe("QA-157 — generateUnsubscribeUrl edge cases", () => {
  it("QA-157-1 — l'URL générée contient un paramètre token non vide", () => {
    const url = generateUnsubscribeUrl("qa@test.com", "https://example.com");
    const parsed = new URL(url);
    const token = parsed.searchParams.get("token");
    expect(token).toBeTruthy();
    // HMAC-SHA256 hex = 64 caractères
    expect(token!.length).toBe(64);
  });

  it("QA-157-2 — l'URL générée est une URL valide parseable", () => {
    const url = generateUnsubscribeUrl("special+char@test.com", "https://koupli.com");
    expect(() => new URL(url)).not.toThrow();
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/api/newsletter/unsubscribe");
  });

  it("QA-157-3 — email avec caractères spéciaux est correctement encodé dans l'URL", () => {
    const url = generateUnsubscribeUrl("user+tag@test.com", "https://koupli.com");
    // Le + doit être encodé en %2B dans le query param
    expect(url).toContain("user%2Btag%40test.com");
  });
});

describe("QA-157 — newsletter-actions intégration", () => {
  it("QA-157-4 — newsletter-actions.ts importe et utilise generateUnsubscribeUrl", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      process.cwd() + "/src/app/actions/newsletter-actions.ts",
      "utf-8"
    );
    expect(content).toContain("import { generateUnsubscribeUrl }");
    expect(content).toContain("generateUnsubscribeUrl(rawEmail, baseUrl)");
    // Ne doit plus contenir l'ancienne URL construite manuellement
    expect(content).not.toContain("encodeURIComponent(rawEmail)");
  });
});
