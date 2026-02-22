export interface ConsensusSynthesis {
  finalAnswer: string;
  confidence: "haute" | "moyenne" | "faible";
  consensus: string;
  divergences: string[];
}

/**
 * Construit le prompt système pour Claude Haiku chargé de synthétiser les réponses.
 * Fonction pure — aucun appel API.
 */
export function buildSynthesisPrompt(responses: string[]): string {
  const formatted = responses
    .map((r, i) => `### Réponse ${i + 1}\n${r}`)
    .join("\n\n");

  return `Tu es un juge financier expert. Analyse ces ${responses.length} réponses de conseillers IA et synthétise-les.

Produis UNIQUEMENT un JSON valide avec cette structure exacte :
{ "finalAnswer": string, "confidence": "haute"|"moyenne"|"faible", "consensus": string, "divergences": string[] }

- finalAnswer : synthèse finale claire et actionnable
- confidence : niveau de consensus (haute = accord fort, faible = désaccord marqué)
- consensus : ce sur quoi toutes les réponses s'accordent
- divergences : tableau des points de désaccord (vide si consensus fort)

${formatted}`;
}

/**
 * Synthèse heuristique des réponses — fonction pure sans appel API.
 * Utilisée pour les tests unitaires et comme fallback si Claude Haiku échoue.
 * La route /api/chat appelle Claude Haiku pour la synthèse IA réelle.
 */
export async function synthesizeResponses(
  responses: string[]
): Promise<ConsensusSynthesis> {
  const filtered = responses.filter((r) => r.trim().length > 0);

  if (filtered.length === 0) {
    return {
      finalAnswer: "Aucune réponse disponible.",
      confidence: "faible",
      consensus: "",
      divergences: [],
    };
  }

  if (filtered.length === 1) {
    return {
      finalAnswer: filtered[0]!,
      confidence: "haute",
      consensus: filtered[0]!,
      divergences: [],
    };
  }

  // Heuristique : compter les réponses uniques
  const unique = [...new Set(filtered)];

  const confidence: ConsensusSynthesis["confidence"] =
    unique.length === 1
      ? "haute"
      : unique.length <= Math.ceil(filtered.length / 2)
        ? "moyenne"
        : "faible";

  const divergences = unique.length > 1 ? unique.slice(1) : [];

  return {
    finalAnswer: filtered[0]!,
    confidence,
    consensus:
      unique.length === 1
        ? filtered[0]!
        : `${filtered.length} perspectives analysées — points communs identifiés`,
    divergences,
  };
}
