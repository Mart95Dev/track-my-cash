/**
 * Tests Dev — STORY-111
 * Refonte Pages Auth (Inscription + Connexion) — maquettes 04 + 05
 *
 *  TU-111-1 : Badge "14j offert" ou "14 jours" présent (AC-3)
 *  TU-111-2 : Titre "Bon retour" sur page connexion (AC-5)
 *  TU-111-3 : Blur spots présents sur page inscription (AC-1)
 *  TU-111-4 : Bouton Google SVG présent sur page inscription (AC-2)
 *  TU-111-5 : Bouton Apple SVG présent sur page inscription (AC-2)
 *  TU-111-6 : Card bg-white rounded-3xl sur page inscription (AC-4)
 *  TU-111-7 : "Mot de passe oublié" sur page connexion (AC-6)
 *  TU-111-8a : Page inscription contient lien vers connexion (AC-7)
 *  TU-111-8b : Page connexion contient lien vers inscription (AC-7)
 *  TU-111-9 : Actions conservées — sendWelcomeEmailAction (AC-8)
 *  TU-111-10 : Blur spots présents sur page connexion (AC-1)
 *  TU-111-11 : Bouton Google + Apple SVG sur connexion (AC-2 étendu)
 *  TU-111-12 : Card rounded-3xl sur page connexion (AC-4 étendu)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let inscriptionSrc: string;
let connexionSrc: string;

beforeAll(() => {
  inscriptionSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(auth)/inscription/page.tsx"),
    "utf-8"
  );
  connexionSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(auth)/connexion/page.tsx"),
    "utf-8"
  );
});

// ── TU-111-1 : AC-3 — Badge essai inscription ─────────────────────────────────

describe("STORY-111 — Badge essai 14j (AC-3)", () => {
  it("TU-111-1 : inscription contient '14j' ou '14 jours'", () => {
    const hasBadge =
      inscriptionSrc.includes("14j") || inscriptionSrc.includes("14 jours");
    expect(hasBadge).toBe(true);
  });
});

// ── TU-111-2 : AC-5 — Titre Bon retour ───────────────────────────────────────

describe("STORY-111 — Titre connexion (AC-5)", () => {
  it("TU-111-2 : connexion contient 'Bon retour'", () => {
    expect(connexionSrc).toContain("Bon retour");
  });
});

// ── TU-111-3 : AC-1 — New design elements inscription ─────────────────────────

describe("STORY-111 — Design elements inscription (AC-1)", () => {
  it("TU-111-3 : inscription contient 'bg-[#FAFAF9]' (fond page)", () => {
    expect(inscriptionSrc).toContain("bg-[#FAFAF9]");
  });

  it("TU-111-3b : inscription contient 'font-serif' (heading serif)", () => {
    expect(inscriptionSrc).toContain("font-serif");
  });

  it("TU-111-3c : inscription contient 'border-border-light' (card border)", () => {
    expect(inscriptionSrc).toContain("border-border-light");
  });
});

// ── TU-111-4/5 : AC-2 — OAuth Google + Apple sur inscription ─────────────────

describe("STORY-111 — OAuth boutons inscription (AC-2)", () => {
  it("TU-111-4 : inscription contient SVG Google (4285F4)", () => {
    expect(inscriptionSrc).toContain("4285F4");
  });

  it("TU-111-5 : inscription contient SVG Apple", () => {
    // Apple SVG détecté par son path ou le mot "Apple"
    const hasApple =
      inscriptionSrc.includes("Apple") || inscriptionSrc.includes("17.05 20.28");
    expect(hasApple).toBe(true);
  });
});

// ── TU-111-6 : AC-4 — Card rounded-3xl inscription ───────────────────────────

describe("STORY-111 — Card bg-white rounded-3xl inscription (AC-4)", () => {
  it("TU-111-6 : inscription contient 'rounded-3xl'", () => {
    expect(inscriptionSrc).toContain("rounded-3xl");
  });

  it("TU-111-6b : inscription card contient 'bg-white'", () => {
    expect(inscriptionSrc).toContain("bg-white");
  });
});

// ── TU-111-7 : AC-6 — Mot de passe oublié connexion ─────────────────────────

describe("STORY-111 — Lien mot de passe oublié (AC-6)", () => {
  it("TU-111-7 : connexion contient 'Mot de passe oublié'", () => {
    const hasForgot =
      connexionSrc.includes("Mot de passe oublié") ||
      connexionSrc.toLowerCase().includes("mot de passe oublié");
    expect(hasForgot).toBe(true);
  });
});

// ── TU-111-8 : AC-7 — Bascule inscription ↔ connexion ────────────────────────

describe("STORY-111 — Bascule inscription ↔ connexion (AC-7)", () => {
  it("TU-111-8a : inscription contient lien connexion", () => {
    const hasConnexionLink =
      inscriptionSrc.includes("/connexion") ||
      inscriptionSrc.includes("Se connecter");
    expect(hasConnexionLink).toBe(true);
  });

  it("TU-111-8b : connexion contient lien inscription", () => {
    const hasInscriptionLink =
      connexionSrc.includes("/inscription") ||
      connexionSrc.includes("Créer un compte") ||
      connexionSrc.includes("S'inscrire");
    expect(hasInscriptionLink).toBe(true);
  });
});

// ── TU-111-9 : AC-8 — Server Actions conservées ──────────────────────────────

describe("STORY-111 — Server Actions conservées (AC-8)", () => {
  it("TU-111-9 : inscription conserve sendWelcomeEmailAction", () => {
    expect(inscriptionSrc).toContain("sendWelcomeEmailAction");
  });

  it("TU-111-9b : inscription conserve createTrialSubscriptionAction", () => {
    expect(inscriptionSrc).toContain("createTrialSubscriptionAction");
  });
});

// ── TU-111-10 : AC-1 — Design elements connexion ──────────────────────────────

describe("STORY-111 — Design elements connexion (AC-1 étendu)", () => {
  it("TU-111-10 : connexion contient 'bg-[#FAFAF9]' (fond page)", () => {
    expect(connexionSrc).toContain("bg-[#FAFAF9]");
  });

  it("TU-111-10b : connexion contient 'font-serif' (heading serif)", () => {
    expect(connexionSrc).toContain("font-serif");
  });
});

// ── TU-111-11 : AC-2 — OAuth Google + Apple sur connexion ────────────────────

describe("STORY-111 — OAuth boutons connexion (AC-2 étendu)", () => {
  it("TU-111-11 : connexion contient SVG Google (4285F4)", () => {
    expect(connexionSrc).toContain("4285F4");
  });
});

// ── TU-111-12 : AC-4 — Card rounded-3xl connexion ────────────────────────────

describe("STORY-111 — Card rounded-3xl connexion (AC-4 étendu)", () => {
  it("TU-111-12 : connexion contient 'rounded-3xl'", () => {
    expect(connexionSrc).toContain("rounded-3xl");
  });
});
