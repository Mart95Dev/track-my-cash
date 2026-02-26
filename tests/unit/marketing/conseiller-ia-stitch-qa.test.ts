/**
 * Tests QA — STORY-117 (forge-verify)
 * Comble les gaps identifiés lors de l audit QA :
 *
 *  GAP-117-A : AC-1 — Header sticky non testé
 *  GAP-117-B : AC-1 — text-primary sur le badge + titre Conseiller IA non testés
 *  GAP-117-C : AC-2 — rounded-tr-sm (coin bulle user) non testé
 *  GAP-117-D : AC-3 — Fond bulle IA (bg-card ou bg-white) + rounded-2xl rounded-bl-sm complet
 *  GAP-117-E : AC-4 — ToolResultCard import et utilisation non testés
 *  GAP-117-F : AC-5 — Textes chips suggestions + overflow-x-auto non testés
 *  GAP-117-G : AC-6 — bg-primary bouton envoi + icône send + fixed bottom non testés
 *  GAP-117-H : AC-7 — dark:bg-background-dark header + dark:border-slate-800 input non testés
 *  GAP-117-I : AC-8 — DefaultChatTransport + import @ai-sdk/react non testés
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

describe("STORY-117 QA — Header sticky (AC-1, GAP-A)", () => {
  it("QA-117-A : conseiller contient sticky top-0 (header collé en haut AC-1)", () => {
    expect(conseillerSrc).toContain("sticky top-0");
  });
});

describe("STORY-117 QA — Badge text-primary + titre (AC-1, GAP-B)", () => {
  it("QA-117-B : conseiller contient text-primary (couleur texte badge AC-1)", () => {
    expect(conseillerSrc).toContain("text-primary");
  });

  it("QA-117-B2 : conseiller contient Conseiller IA (titre du header AC-1)", () => {
    expect(conseillerSrc).toContain("Conseiller IA");
  });
});

describe("STORY-117 QA — Bulle user coin arrondi (AC-2, GAP-C)", () => {
  it("QA-117-C : ai-chat contient rounded-tr-sm (coin bulle user AC-2)", () => {
    expect(aiChatSrc).toContain("rounded-tr-sm");
  });

  it("QA-117-C2 : ai-chat contient bg-primary text-white rounded-2xl rounded-tr-sm (bulle user complète AC-2)", () => {
    expect(aiChatSrc).toContain("bg-primary text-white rounded-2xl rounded-tr-sm");
  });
});

describe("STORY-117 QA — Fond bulle IA (AC-3, GAP-D)", () => {
  it("QA-117-D : ai-chat utilise un fond pour les bulles IA bg-card ou bg-white (AC-3)", () => {
    const hasBgCard = aiChatSrc.includes("bg-card");
    const hasBgWhite = aiChatSrc.includes("bg-white");
    expect(hasBgCard || hasBgWhite).toBe(true);
  });

  it("QA-117-D2 : ai-chat contient rounded-2xl rounded-bl-sm (forme bulle IA complète AC-3)", () => {
    expect(aiChatSrc).toContain("rounded-2xl rounded-bl-sm");
  });
});

describe("STORY-117 QA — ToolResultCard (AC-4, GAP-E)", () => {
  it("QA-117-E : ai-chat importe ToolResultCard (structured data card AC-4)", () => {
    expect(aiChatSrc).toContain("ToolResultCard");
  });

  it("QA-117-E2 : ai-chat utilise JSX ToolResultCard dans le rendu (AC-4)", () => {
    expect(aiChatSrc).toContain("<ToolResultCard");
  });

  it("QA-117-E3 : ai-chat importe depuis tool-result-card (chemin composant AC-4)", () => {
    expect(aiChatSrc).toContain("tool-result-card");
  });
});

describe("STORY-117 QA — Textes suggestions (AC-5, GAP-F)", () => {
  it("QA-117-F : conseiller contient suggestion Analyse nos dépenses communes (AC-5)", () => {
    expect(conseillerSrc).toContain("Analyse nos d");
  });

  it("QA-117-F2 : conseiller contient suggestion Qui a le plus dépensé (AC-5)", () => {
    expect(conseillerSrc).toContain("Qui a le plus d");
  });

  it("QA-117-F3 : ai-chat contient handleSuggestionClick (chips cliquables AC-5)", () => {
    expect(aiChatSrc).toContain("handleSuggestionClick");
  });

  it("QA-117-F4 : ai-chat contient overflow-x-auto (scroll horizontal chips AC-5)", () => {
    expect(aiChatSrc).toContain("overflow-x-auto");
  });
});

describe("STORY-117 QA — Bouton envoi (AC-6, GAP-G)", () => {
  it("QA-117-G : ai-chat contient rounded-full bg-primary text-white (bouton envoi AC-6)", () => {
    expect(aiChatSrc).toContain("rounded-full bg-primary text-white");
  });

  it("QA-117-G2 : ai-chat contient icône send (bouton envoi AC-6)", () => {
    expect(aiChatSrc).toContain(">send<");
  });

  it("QA-117-G3 : ai-chat contient fixed bottom (zone input fixe en bas AC-6)", () => {
    expect(aiChatSrc).toContain("fixed bottom");
  });
});

describe("STORY-117 QA — Dark mode header (AC-7, GAP-H)", () => {
  it("QA-117-H : conseiller contient dark:bg-background-dark (fond header dark AC-7)", () => {
    expect(conseillerSrc).toContain("dark:bg-background-dark");
  });

  it("QA-117-H2 : ai-chat contient dark:border-slate-800 (bordures dark mode AC-7)", () => {
    expect(aiChatSrc).toContain("dark:border-slate-800");
  });
});

describe("STORY-117 QA — DefaultChatTransport SDK AI (AC-8, GAP-I)", () => {
  it("QA-117-I : ai-chat importe DefaultChatTransport (SDK AI moderne AC-8)", () => {
    expect(aiChatSrc).toContain("DefaultChatTransport");
  });

  it("QA-117-I2 : ai-chat configure le transport avec api /api/chat (AC-8)", () => {
    expect(aiChatSrc).toContain("api/chat");
  });

  it("QA-117-I3 : ai-chat importe useChat depuis @ai-sdk/react (AC-8)", () => {
    expect(aiChatSrc).toContain("@ai-sdk/react");
  });
});
