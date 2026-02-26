/**
 * Tests TDD — STORY-117
 * Refonte Conseiller IA (Stitch)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let conseillerSrc: string;
let aiChatSrc: string;

beforeAll(() => {
  conseillerSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/conseiller/page.tsx"),
    "utf-8"
  );
  aiChatSrc = readFileSync(
    join(process.cwd(), "src/components/ai-chat.tsx"),
    "utf-8"
  );
});

// ── AC-1 — Header bouton back + badge Premium ─────────────────────────────────

describe("STORY-117 — Header (AC-1)", () => {
  it("TU-117-1a : conseiller contient 'arrow_back_ios_new' (bouton back AC-1)", () => {
    expect(conseillerSrc).toContain("arrow_back_ios_new");
  });

  it("TU-117-1b : conseiller contient badge 'bg-primary/10' (style iOS AC-1)", () => {
    expect(conseillerSrc).toContain("bg-primary/10");
  });

  it("TU-117-1c : conseiller contient 'Premium' (texte badge AC-1)", () => {
    expect(conseillerSrc).toContain("Premium");
  });
});

// ── AC-2 — Messages utilisateur ───────────────────────────────────────────────

describe("STORY-117 — Messages user (AC-2)", () => {
  it("TU-117-2a : ai-chat contient 'justify-end' (alignement droite AC-2)", () => {
    expect(aiChatSrc).toContain("justify-end");
  });

  it("TU-117-2b : ai-chat contient 'bg-primary text-white rounded-2xl' (bulle user AC-2)", () => {
    expect(aiChatSrc).toContain("bg-primary text-white rounded-2xl");
  });
});

// ── AC-3 — Messages IA ────────────────────────────────────────────────────────

describe("STORY-117 — Messages IA (AC-3)", () => {
  it("TU-117-3a : ai-chat contient 'justify-start' (alignement gauche AC-3)", () => {
    expect(aiChatSrc).toContain("justify-start");
  });

  it("TU-117-3b : ai-chat contient 'smart_toy' (avatar IA AC-3)", () => {
    expect(aiChatSrc).toContain("smart_toy");
  });

  it("TU-117-3c : ai-chat contient 'rounded-bl-sm' (coin bas-gauche bulle IA AC-3)", () => {
    expect(aiChatSrc).toContain("rounded-bl-sm");
  });
});

// ── AC-5 — Chips suggestions ──────────────────────────────────────────────────

describe("STORY-117 — Chips suggestions (AC-5)", () => {
  it("TU-117-5 : ai-chat contient 'suggestions.slice' (chips scroll horizontal AC-5)", () => {
    expect(aiChatSrc).toContain("suggestions.slice");
  });
});

// ── AC-6 — Input fixe ────────────────────────────────────────────────────────

describe("STORY-117 — Input fixe (AC-6)", () => {
  it("TU-117-6 : ai-chat contient 'rounded-full' (input arrondi AC-6)", () => {
    expect(aiChatSrc).toContain("rounded-full");
  });
});

// ── AC-7 — Dark mode ─────────────────────────────────────────────────────────

describe("STORY-117 — Dark mode (AC-7)", () => {
  it("TU-117-7 : ai-chat ou conseiller contient 'dark:bg-background-dark' (AC-7)", () => {
    const combined = aiChatSrc + conseillerSrc;
    expect(combined).toContain("dark:bg-background-dark");
  });
});

// ── AC-8 — API /api/chat ──────────────────────────────────────────────────────

describe("STORY-117 — API chat préservée (AC-8)", () => {
  it("TU-117-8 : ai-chat appelle '/api/chat' (AC-8)", () => {
    expect(aiChatSrc).toContain("/api/chat");
  });
});
