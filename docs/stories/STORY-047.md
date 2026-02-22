# STORY-047 — Score de santé financière (widget dashboard)

**Sprint :** Intelligence & UX IA (v7)
**Épique :** intelligence
**Priorité :** P1
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

Un indicateur synthétique 0-100 visible immédiatement sur le dashboard qui résume la situation financière de l'utilisateur en 4 dimensions. Calculé algorithmiquement (pas d'appel IA = instantané, gratuit pour tous les plans). Affichage sous le total des soldes.

**Formule de calcul :**
- **Taux d'épargne** (25 pts max) : savingsRate% × 25 / 20 (plafonné à 25 si savingsRate ≥ 20%)
- **Budgets respectés** (25 pts max) : (nb budgets ok / total budgets) × 25 — si aucun budget : 12,5 pts par défaut
- **Progression objectifs** (25 pts max) : moyenne(current/target × 100) × 0,25 — si aucun objectif : 12,5 pts par défaut
- **Stabilité revenus** (25 pts max) : si cv (écart-type/moyenne) ≤ 0.1 → 25 pts, ≥ 0.5 → 0 pts (linéaire inverse)

**Score global → badge :**
- 80–100 : Excellent (vert)
- 60–79 : Bon (bleu)
- 40–59 : À améliorer (orange)
- 0–39 : Attention (rouge)

---

## Acceptance Criteria

- **AC-1 :** Le widget affiche un score numérique de 0 à 100 sur le dashboard
- **AC-2 :** Le badge coloré (4 couleurs) correspond à la plage du score
- **AC-3 :** Les 4 sous-scores sont visibles avec leur label et valeur
- **AC-4 :** Sans budget ni objectif, les dimensions concernées valent 12,5 pts chacune (score de base 50 si revenus stables)
- **AC-5 :** `computeHealthScore()` est testé unitairement avec cas nominal et edge cases

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/health-score.ts` | CRÉER — logique pure `computeHealthScore()` |
| `src/components/health-score-widget.tsx` | CRÉER — widget dashboard |
| `src/app/[locale]/(app)/page.tsx` | MODIFIER — ajouter le widget |
| `tests/unit/lib/health-score.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/health-score.test.ts`

### Données de test

```typescript
const SUMMARIES_STABLE = [
  { income: 3000, expenses: 2000 },
  { income: 3100, expenses: 2100 },
  { income: 2900, expenses: 1900 },
];

const BUDGETS_ALL_OK = [
  { category: "Alimentation", amount_limit: 400, spent: 300 },
  { category: "Loisirs", amount_limit: 200, spent: 150 },
];

const BUDGETS_ONE_EXCEEDED = [
  { category: "Alimentation", amount_limit: 400, spent: 300 },
  { category: "Loisirs", amount_limit: 200, spent: 250 },
];

const GOALS_PROGRESSING = [
  { target_amount: 1000, current_amount: 600 },
  { target_amount: 500, current_amount: 250 },
];
```

### Cas de test

| ID | Description | Entrée | Résultat attendu |
|----|-------------|--------|-----------------|
| TU-47-1 | Score nominal — revenus stables, budgets ok, objectifs 50% | SUMMARIES_STABLE + BUDGETS_ALL_OK + GOALS_PROGRESSING | total ≥ 70, label "Bon" ou "Excellent" |
| TU-47-2 | Aucun budget ni objectif | SUMMARIES_STABLE, [], [] | budgetsScore = 12.5, goalsScore = 12.5 |
| TU-47-3 | Taux d'épargne 0% (dépenses = revenus) | income = expenses pour tous les mois | savingsScore = 0 |
| TU-47-4 | Taux d'épargne ≥ 20% | income = 3000, expenses = 2000 (33%) | savingsScore = 25 |
| TU-47-5 | Budget dépassé → score réduit | BUDGETS_ONE_EXCEEDED | budgetsScore < 25 |
| TU-47-6 | Revenus très instables (CV > 0.5) | [{ income: 5000 }, { income: 100 }, { income: 3000 }] | stabilityScore = 0 |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-47-1 (score numérique 0-100) |
| AC-2 | TU-47-1 (label "Bon"/"Excellent") |
| AC-3 | TU-47-1 (sous-scores non nuls) |
| AC-4 | TU-47-2 (défauts 12,5 pts) |
| AC-5 | TU-47-1 à TU-47-6 |

---

## Interfaces TypeScript

```typescript
// src/lib/health-score.ts
export interface HealthScoreInput {
  monthlySummaries: { income: number; expenses: number }[];
  budgets: { category: string; amount_limit: number; spent: number }[];
  goals: { target_amount: number; current_amount: number }[];
}

export interface HealthScore {
  total: number;            // 0-100 (arrondi)
  savingsScore: number;     // 0-25
  budgetsScore: number;     // 0-25
  goalsScore: number;       // 0-25
  stabilityScore: number;   // 0-25
  label: "Excellent" | "Bon" | "À améliorer" | "Attention";
}

export function computeHealthScore(data: HealthScoreInput): HealthScore
```

---

## Notes d'implémentation

- `computeHealthScore()` est une **fonction pure** (pas d'I/O) — facilement testable
- Le widget fait un seul appel Server Component pour récupérer `{ summaries, budgets, goals }` du compte principal
- SVG ou div simple pour la jauge — pas de librairie externe
- Couleurs : utiliser les CSS variables Tailwind (vert = `text-green-600`, orange = `text-orange-500`, rouge = `text-red-600`, bleu = `text-blue-600`)
- Le widget est visible pour **tous les plans** (calcul algorithmic, pas d'IA)
