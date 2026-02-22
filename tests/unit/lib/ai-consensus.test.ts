import { describe, it, expect } from "vitest";
import { synthesizeResponses, buildSynthesisPrompt } from "@/lib/ai-consensus";

const RESPONSE_A = "Le solde sera déficitaire dans 3 mois si les dépenses continuent.";
const RESPONSE_B = "Les dépenses dépassent 40% du budget alimentaire depuis 2 mois.";
const RESPONSE_C = "Je recommande de réduire les loisirs de 15% pour équilibrer.";

const IDENTICAL_RESPONSES = [RESPONSE_A, RESPONSE_A, RESPONSE_A];

describe("ai-consensus — synthesizeResponses", () => {
  it("TU-59-1 : [r1, r2, r3] retourne un objet structuré ConsensusSynthesis", async () => {
    const result = await synthesizeResponses([RESPONSE_A, RESPONSE_B, RESPONSE_C]);
    expect(result).toMatchObject({
      finalAnswer: expect.any(String),
      confidence: expect.stringMatching(/^(haute|moyenne|faible)$/),
      consensus: expect.any(String),
      divergences: expect.any(Array),
    });
  });

  it("TU-59-2 : 3 réponses identiques → confidence 'haute', divergences vide", async () => {
    const result = await synthesizeResponses(IDENTICAL_RESPONSES);
    expect(result.confidence).toBe("haute");
    expect(result.divergences).toHaveLength(0);
  });

  it("TU-59-3 : 3 réponses très différentes → divergences.length >= 1", async () => {
    const result = await synthesizeResponses([RESPONSE_A, RESPONSE_B, RESPONSE_C]);
    expect(result.divergences.length).toBeGreaterThanOrEqual(1);
  });

  it("TU-59-4 : synthesizeResponses([r1]) — 1 seule réponse → résultat valide", async () => {
    const result = await synthesizeResponses([RESPONSE_A]);
    expect(result.finalAnswer).toBe(RESPONSE_A);
    expect(result.confidence).toBe("haute");
    expect(result.divergences).toHaveLength(0);
  });

  it("TU-59-4b : synthesizeResponses([]) — aucune réponse → résultat valide sans crash", async () => {
    const result = await synthesizeResponses([]);
    expect(result).toMatchObject({
      finalAnswer: expect.any(String),
      confidence: "faible",
    });
  });
});

describe("ai-consensus — buildSynthesisPrompt", () => {
  it("TU-59-5 : buildSynthesisPrompt([r1, r2, r3]) retourne une string non vide", () => {
    const result = buildSynthesisPrompt([RESPONSE_A, RESPONSE_B, RESPONSE_C]);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // Doit inclure les réponses sources
    expect(result).toContain(RESPONSE_A);
    expect(result).toContain(RESPONSE_B);
  });
});
