import { describe, it, expect } from "vitest";

// STORY-002 — Redirections Stripe : locale dynamique
// extractLocale est une fonction privée du route.ts — on teste la logique ici

const LOCALES = ["fr", "en", "es", "it", "de"];

function extractLocale(referer: string | null, baseUrl: string): string {
  if (!referer) return "fr";
  try {
    const url = new URL(referer);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length > 0 && LOCALES.includes(segments[0])) {
      return segments[0];
    }
  } catch {
    // ignore
  }
  return "fr";
}

const BASE = "https://app.trackmycash.com";

describe("extractLocale (STORY-002)", () => {
  it("AC-1 : referer null → locale par défaut fr", () => {
    expect(extractLocale(null, BASE)).toBe("fr");
  });

  it("AC-2 : referer sans chemin → locale par défaut fr", () => {
    expect(extractLocale(`${BASE}/`, BASE)).toBe("fr");
  });

  it("AC-3 : referer /fr/... → extrait fr", () => {
    expect(extractLocale(`${BASE}/fr/parametres`, BASE)).toBe("fr");
  });

  it("AC-4 : referer /en/... → extrait en", () => {
    expect(extractLocale(`${BASE}/en/tarifs`, BASE)).toBe("en");
  });

  it("AC-5 : referer /es/... → extrait es", () => {
    expect(extractLocale(`${BASE}/es/parametres`, BASE)).toBe("es");
  });

  it("AC-6 : referer /it/... → extrait it", () => {
    expect(extractLocale(`${BASE}/it/dashboard`, BASE)).toBe("it");
  });

  it("AC-7 : referer /de/... → extrait de", () => {
    expect(extractLocale(`${BASE}/de/comptes`, BASE)).toBe("de");
  });

  it("AC-8 : referer /xx/ (locale invalide) → locale par défaut fr", () => {
    expect(extractLocale(`${BASE}/zh/dashboard`, BASE)).toBe("fr");
  });

  it("AC-9 : referer URL invalide → locale par défaut fr", () => {
    expect(extractLocale("not-a-url", BASE)).toBe("fr");
  });

  it("AC-10 : referer /en/parametres?tab=billing → extrait en", () => {
    expect(extractLocale(`${BASE}/en/parametres?tab=billing`, BASE)).toBe("en");
  });
});
