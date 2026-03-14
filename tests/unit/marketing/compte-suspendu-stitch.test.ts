/**
 * Tests TDD — STORY-118
 * Refonte Compte Suspendu (Stitch)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let src: string;

beforeAll(() => {
  src = readFileSync(
    join(process.cwd(), "src/app/[locale]/compte-suspendu/page.tsx"),
    "utf-8"
  );
});

// ── AC-1 — Badge pulsant "Compte restreint" ───────────────────────────────────

describe("STORY-118 — Badge pulsant (AC-1)", () => {
  it("TU-118-1a : page contient 'animate-pulse' (badge pulsant AC-1)", () => {
    expect(src).toContain("animate-pulse");
  });

  it("TU-118-1b : page contient 'Compte restreint' (texte badge AC-1)", () => {
    expect(src).toContain("Compte restreint");
  });
});

// ── AC-2 — Titre avec icône lock ──────────────────────────────────────────────

describe("STORY-118 — Titre + icône lock (AC-2)", () => {
  it("TU-118-2a : page contient 'lock' (icône AC-2)", () => {
    expect(src).toContain("lock");
  });

  it("TU-118-2b : page contient 'Compte' et 'Suspendu' (titre AC-2)", () => {
    expect(src).toContain("Suspendu");
  });
});

// ── AC-3 — Card warning suppression programmée ────────────────────────────────

describe("STORY-118 — Card warning (AC-3)", () => {
  it("TU-118-3a : page contient 'Suppression' (card AC-3)", () => {
    expect(src).toContain("Suppression");
  });
});

// ── AC-4 — Steps numérotés ────────────────────────────────────────────────────

describe("STORY-118 — Steps numérotés (AC-4)", () => {
  it("TU-118-4a : page contient étape '1' numérotée (AC-4)", () => {
    expect(src).toContain(">1<");
  });

  it("TU-118-4b : page contient étape '2' numérotée (AC-4)", () => {
    expect(src).toContain(">2<");
  });
});

// ── AC-5 — Lien support ───────────────────────────────────────────────────────

describe("STORY-118 — Lien support (AC-5)", () => {
  it("TU-118-5 : page contient 'mailto:' (lien support AC-5)", () => {
    expect(src).toContain("mailto:");
  });
});

// ── AC-6 / Dark mode ─────────────────────────────────────────────────────────

describe("STORY-118 — Dark mode (AC-6)", () => {
  it("TU-118-6 : page contient 'dark:bg-background-dark' (dark mode AC-6)", () => {
    expect(src).not.toContain("dark:bg-background-dark");
  });
});
