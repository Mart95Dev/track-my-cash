# STORY-059 — Conseiller IA multi-modèles parallèles (3 modèles + synthèse)

**Sprint :** Production SaaS & Croissance (v8)
**Épique :** intelligence
**Priorité :** P2
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-053

---

## Description

Le conseiller IA actuel utilise un sélecteur de modèle mono-modèle. Pour les utilisateurs Premium, l'expérience peut être améliorée avec un mode "consensus multi-modèles" : 3 modèles répondent en parallèle (Claude Sonnet, Gemini Flash, GPT-4o mini), puis Claude Haiku synthétise les réponses en un rapport structuré. L'UI affiche la synthèse + les 3 réponses individuelles en accordéon.

**Architecture :**
- Free : 0 conversation IA (inchangé)
- Pro : sélecteur mono-modèle (existant, 10/mois)
- Premium : mode consensus 3 modèles + synthèse (illimité)

---

## Acceptance Criteria

- **AC-1 :** Pour plan Premium, `/api/chat` lance 3 modèles en parallèle via `Promise.allSettled`
- **AC-2 :** Claude Haiku synthétise les réponses réussies en JSON `{ finalAnswer, confidence, consensus, divergences }`
- **AC-3 :** La réponse API retourne `{ mode: "consensus", synthesis, sources }` pour Premium vs `{ mode: "single", text }` pour Pro
- **AC-4 :** `<AiChatMessage />` affiche la synthèse en premier, puis un accordéon "Voir les 3 sources"
- **AC-5 :** `synthesizeResponses(responses)` est une fonction pure testable indépendamment
- **AC-6 :** Si 1 ou 2 modèles échouent → synthèse sur les réponses disponibles (pas de crash)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/ai-consensus.ts` | CRÉER — `synthesizeResponses()`, `buildSynthesisPrompt()` (fonctions pures) |
| `src/app/api/chat/route.ts` | MODIFIER — mode consensus pour Premium |
| `src/components/ai-chat.tsx` | MODIFIER — affichage synthèse + accordéon sources |
| `tests/unit/lib/ai-consensus.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/ai-consensus.test.ts`

### Données de test

```typescript
const RESPONSE_A = "Le solde sera déficitaire dans 3 mois si les dépenses continuent.";
const RESPONSE_B = "Les dépenses dépassent 40% du budget alimentaire depuis 2 mois.";
const RESPONSE_C = "Je recommande de réduire les loisirs de 15% pour équilibrer.";

const IDENTICAL_RESPONSES = [RESPONSE_A, RESPONSE_A, RESPONSE_A];
```

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-59-1 | `synthesizeResponses([r1, r2, r3])` retourne objet structuré | `{ finalAnswer: string, confidence: string, consensus: string, divergences: array }` |
| TU-59-2 | 3 réponses identiques → `confidence` élevée, `divergences = []` | `confidence === "haute"`, `divergences.length === 0` |
| TU-59-3 | 3 réponses très différentes → `divergences.length > 0` | `divergences.length >= 1` |
| TU-59-4 | `synthesizeResponses([r1])` — 1 seule réponse | retourne résultat valide (pas de crash) |
| TU-59-5 | `buildSynthesisPrompt([r1, r2, r3])` retourne une string non vide | `typeof result === "string" && result.length > 0` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Intégration `/api/chat` (Promise.allSettled) |
| AC-2 | TU-59-1 + TU-59-2 |
| AC-3 | Intégration réponse API |
| AC-4 | Intégration UI accordéon |
| AC-5 | TU-59-1 à TU-59-5 |
| AC-6 | TU-59-4 |

---

## Interface TypeScript

```typescript
// src/lib/ai-consensus.ts

export interface ConsensusSynthesis {
  finalAnswer: string;
  confidence: "haute" | "moyenne" | "faible";
  consensus: string;
  divergences: string[];
}

export function buildSynthesisPrompt(responses: string[]): string
// Construit le prompt system pour Claude Haiku

export function synthesizeResponses(responses: string[]): Promise<ConsensusSynthesis>
// Pour les tests unitaires : version pure sans appel API (mock Claude Haiku)
// Note : la version réelle dans route.ts appellera Claude Haiku via OpenRouter
```

---

## Notes d'implémentation

- Modèles utilisés via OpenRouter :
  - `anthropic/claude-sonnet-4-6`
  - `google/gemini-2.0-flash`
  - `openai/gpt-4o-mini`
  - Synthèse : `anthropic/claude-haiku-4-5-20251001`
- Pattern `Promise.allSettled` (pas `Promise.all`) pour tolérer les échecs partiels
- Si < 2 réponses disponibles → fallback vers mode mono-modèle (premier modèle disponible)
- Prompt synthèse Haiku :
  ```
  Tu es un juge financier. Analyse ces réponses et produis un JSON :
  { "finalAnswer": string, "confidence": "haute"|"moyenne"|"faible", "consensus": string, "divergences": string[] }
  ```
- La fonctoin `synthesizeResponses()` dans `ai-consensus.ts` est une fonction pure testable
  (les tests mockent l'appel OpenRouter via `vi.mock("@ai-sdk/openai")`)
- **Coût** : 4 appels par conversation Premium (3 modèles + 1 synthèse Haiku). Prévoir guard AI usage pour compter 1 seule fois dans `ai_usage`
- Accordéon UI : `<Accordion>` shadcn/ui avec `AccordionItem` par modèle
