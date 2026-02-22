# STORY-050 — Tool calling : l'IA peut créer des budgets et objectifs depuis le chat

**Sprint :** Intelligence & UX IA (v7)
**Épique :** intelligence
**Priorité :** P2
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

Le conseiller IA est actuellement purement consultatif — il conseille mais ne peut pas agir. Via le tool calling de Vercel AI SDK, l'IA peut maintenant **créer des budgets** et **des objectifs d'épargne** directement depuis le chat en réponse à une commande naturelle.

Exemples de conversations :
- "Crée un budget Restaurants de 200€" → budget créé, confirmation affichée dans le chat
- "Objectif vacances 1500€ pour juillet 2026" → objectif créé, confirmation
- "Fixe-moi un budget Loisirs de 150€" → budget créé

Les tools réutilisent les Server Actions existantes (`addBudgetAction`, `createGoalAction`). Disponible uniquement Pro/Premium.

---

## Acceptance Criteria

- **AC-1 :** L'utilisateur peut créer un budget en langage naturel depuis le chat
- **AC-2 :** L'utilisateur peut créer un objectif d'épargne depuis le chat
- **AC-3 :** Après création, l'IA confirme en français avec le récapitulatif
- **AC-4 :** Le résultat du tool call est affiché visuellement dans le chat (carte de confirmation)
- **AC-5 :** Les tools ne sont disponibles que pour les plans Pro/Premium
- **AC-6 :** Les schemas Zod des tools valident correctement les paramètres

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/ai-tools.ts` | CRÉER — définition tools Vercel AI SDK |
| `src/app/api/chat/route.ts` | MODIFIER — passer `tools:` à `streamText()` |
| `src/components/tool-result-card.tsx` | CRÉER — carte de confirmation dans le chat |
| `tests/unit/lib/ai-tools.test.ts` | CRÉER — tests schemas Zod |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/ai-tools.test.ts`

Les tests portent sur la **validation des schemas Zod** des tools (inputs valides, invalides, edge cases).

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-50-1 | Schema `createBudget` — input valide | `{ category: "Restaurants", amount_limit: 200 }` → parse OK |
| TU-50-2 | Schema `createBudget` — montant négatif | `{ category: "X", amount_limit: -50 }` → ZodError |
| TU-50-3 | Schema `createBudget` — montant zéro | `{ amount_limit: 0 }` → ZodError |
| TU-50-4 | Schema `createGoal` — input valide sans deadline | `{ name: "Vacances", target_amount: 1500 }` → parse OK |
| TU-50-5 | Schema `createGoal` — input valide avec deadline | `{ name: "X", target_amount: 500, deadline: "2026-07-01" }` → parse OK |
| TU-50-6 | Schema `createGoal` — montant cible nul | `{ name: "X", target_amount: 0 }` → ZodError |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-50-1 (schema createBudget valide) |
| AC-2 | TU-50-4, TU-50-5 (schema createGoal valide) |
| AC-3 | Testé via integration (conversation IA) |
| AC-4 | Testé UI (ToolResultCard) |
| AC-5 | Testé via guard canUseAI dans route.ts |
| AC-6 | TU-50-2, TU-50-3, TU-50-6 (rejets invalides) |

---

## Architecture technique

```typescript
// src/lib/ai-tools.ts
import { tool } from "ai";
import { z } from "zod";

export const createBudgetTool = tool({
  description: "Crée un budget mensuel pour une catégorie de dépenses. Utilise quand l'utilisateur demande à définir ou fixer un budget.",
  parameters: z.object({
    category: z.string().min(1).describe("Catégorie de dépenses (ex: Restaurants, Loisirs, Transport)"),
    amount_limit: z.number().positive().describe("Montant limite mensuel en euros"),
  }),
  execute: async ({ category, amount_limit }) => {
    // Appel direct Server Action (pas d'import dynamic nécessaire dans les tools)
    const result = await addBudgetAction(accountId, { category, amount_limit });
    return { success: true, category, amount_limit, message: `Budget ${category} créé : ${amount_limit}€/mois` };
  },
});

export const createGoalTool = tool({
  description: "Crée un objectif d'épargne. Utilise quand l'utilisateur veut épargner pour un projet.",
  parameters: z.object({
    name: z.string().min(1).describe("Nom de l'objectif (ex: Vacances, Voiture, Urgences)"),
    target_amount: z.number().positive().describe("Montant cible à atteindre en euros"),
    deadline: z.string().optional().describe("Date limite au format YYYY-MM-DD (optionnel)"),
  }),
  execute: async ({ name, target_amount, deadline }) => {
    const result = await createGoalAction({ name, target_amount, deadline });
    return { success: true, name, target_amount, deadline, message: `Objectif "${name}" créé : ${target_amount}€` };
  },
});
```

```typescript
// Dans /api/chat/route.ts — ajout de tools (Pro/Premium uniquement)
const result = streamText({
  model: openrouter(selectedModel),
  system: systemMessage,
  messages: await convertToModelMessages(messages),
  tools: aiCheck.allowed ? { createBudget: createBudgetTool, createGoal: createGoalTool } : undefined,
  maxSteps: 3, // permettre les multi-step tool calls
});
```

---

## Notes d'implémentation

- Le `accountId` pour les tools doit être passé depuis la requête (`accountIds[0]` par défaut) — à inclure dans le body POST du chat
- `ToolResultCard` : carte compacte avec icône ✓, titre "Budget créé" / "Objectif créé", détails en gris
- Le tool `execute()` dans la route API est côté serveur — il peut appeler directement les queries Kysely sans passer par les Server Actions publiques
- **maxSteps: 3** dans `streamText()` pour permettre : tool call → tool result → réponse IA finale
- Pour les tests : exporter les schemas `z.object()` séparément pour les tester indépendamment du tool wrapper
