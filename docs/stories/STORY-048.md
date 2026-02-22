# STORY-048 — Questions suggérées dans le chat conseiller

**Sprint :** Intelligence & UX IA (v7)
**Épique :** intelligence
**Priorité :** P1
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

Les utilisateurs ne savent pas quoi demander au conseiller IA. Un ensemble de 4 à 6 questions contextuelles (chips cliquables) s'affiche sous le champ de saisie du chat, générées selon la situation financière réelle de l'utilisateur. Cliquer sur une chip envoie directement la question. Les suggestions disparaissent après le premier envoi.

**Logique de priorisation des suggestions :**
1. Si budget(s) dépassé(s) → "Pourquoi mon budget [catégorie] est-il dépassé ?" (en premier)
2. Si objectif en retard (< 50% atteint avec deadline dans les 3 prochains mois) → "Comment atteindre mon objectif [nom] ?"
3. Si taux d'épargne < 10% → "Comment améliorer mon taux d'épargne ?"
4. Toujours présentes : "Résume ma situation financière", "Où puis-je réduire mes dépenses ?", "Quelles sont mes charges fixes ?"

Maximum 6 suggestions au total.

---

## Acceptance Criteria

- **AC-1 :** 4 à 6 suggestions s'affichent sous le champ de saisie avant le premier message
- **AC-2 :** Cliquer sur une suggestion envoie directement le message sans validation manuelle
- **AC-3 :** Les suggestions disparaissent après l'envoi du premier message de la session
- **AC-4 :** Les suggestions prioritaires reflètent la situation réelle (budget dépassé → en premier)
- **AC-5 :** `generateChatSuggestions()` est testé unitairement

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/chat-suggestions.ts` | CRÉER — logique pure `generateChatSuggestions()` |
| `src/components/chat-suggestions.tsx` | CRÉER — composant chips cliquables |
| `src/app/[locale]/(app)/conseiller/page.tsx` | MODIFIER — intégrer le composant |
| `tests/unit/lib/chat-suggestions.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/chat-suggestions.test.ts`

### Données de test

```typescript
const CONTEXT_BUDGET_EXCEEDED = {
  exceededBudgets: [{ category: "Loisirs" }],
  lateGoals: [],
  savingsRate: 15,
};

const CONTEXT_LATE_GOAL = {
  exceededBudgets: [],
  lateGoals: [{ name: "Vacances" }],
  savingsRate: 18,
};

const CONTEXT_LOW_SAVINGS = {
  exceededBudgets: [],
  lateGoals: [],
  savingsRate: 5,
};

const CONTEXT_ALL_GOOD = {
  exceededBudgets: [],
  lateGoals: [],
  savingsRate: 25,
};
```

### Cas de test

| ID | Description | Entrée | Résultat attendu |
|----|-------------|--------|-----------------|
| TU-48-1 | Budget dépassé → suggestion budget en premier | CONTEXT_BUDGET_EXCEEDED | suggestions[0] contient "Loisirs" |
| TU-48-2 | Objectif en retard → suggestion objectif | CONTEXT_LATE_GOAL | une suggestion contient "Vacances" |
| TU-48-3 | Faible taux d'épargne → suggestion épargne | CONTEXT_LOW_SAVINGS | une suggestion contient "taux d'épargne" |
| TU-48-4 | Situation saine → 4 suggestions génériques | CONTEXT_ALL_GOOD | 4 suggestions ≥ 3 et ≤ 6 |
| TU-48-5 | Jamais plus de 6 suggestions | budget × 3 + goals × 2 + savings | length ≤ 6 |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-48-4 (4-6 suggestions) |
| AC-2 | Testé UI (chip → input) |
| AC-3 | Testé UI (disparition après envoi) |
| AC-4 | TU-48-1 (budget en premier) |
| AC-5 | TU-48-1 à TU-48-5 |

---

## Interface TypeScript

```typescript
// src/lib/chat-suggestions.ts
export interface FinancialSummary {
  exceededBudgets: { category: string }[];
  lateGoals: { name: string }[];
  savingsRate: number; // pourcentage (ex: 15 pour 15%)
}

export function generateChatSuggestions(context: FinancialSummary): string[]
// Retourne 4-6 questions en français, priorisées par urgence
```

---

## Notes d'implémentation

- `generateChatSuggestions()` est une **fonction pure** — pas d'I/O
- Le composant `ChatSuggestions` est client (`"use client"`) — état local `visible` (disparaît après premier envoi)
- Récupérer le contexte dans la page `/conseiller` (Server Component) → props vers composant
- Le `FinancialSummary` est extrait des mêmes données que `buildFinancialContext()` — réutiliser les queries existantes
- Style : chips shadcn/ui `<Badge variant="outline">` cliquables, flex-wrap, max 2 lignes
- La suggestion cliquée est injectée dans le `useChat()` via `handleSubmit()` ou `input` + `append()`
