# STORY-052 — Suggestions de budgets IA basées sur l'historique

**Sprint :** Intelligence & UX IA (v7)
**Épique :** intelligence
**Priorité :** P3
**Complexité :** S (2 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

Les utilisateurs ont du mal à définir des budgets réalistes. L'algorithme analyse les dépenses des 3 derniers mois par catégorie et suggère des limites cohérentes avec les habitudes réelles. Les suggestions apparaissent dans `/budgets` pour les catégories sans budget défini, avec un bouton "Créer ce budget" en un clic.

**Logique de suggestion (algorithmique, sans IA model) :**
- Pour chaque catégorie : calculer la moyenne mensuelle des 3 derniers mois
- Si ≥ 2 mois de données pour cette catégorie → proposition
- Arrondir le montant suggéré à la dizaine supérieure
- Niveau de confiance :
  - `high` : 3 mois de données + faible variance (CV ≤ 0.15)
  - `medium` : 2-3 mois + variance modérée (CV ≤ 0.30)
  - `low` : moins de données ou forte variance
- Exclure les catégories déjà budgétées
- Maximum 8 suggestions

---

## Acceptance Criteria

- **AC-1 :** Les suggestions apparaissent dans `/budgets` pour les catégories sans budget défini
- **AC-2 :** Chaque suggestion affiche : catégorie, montant suggéré, moyenne historique, badge confiance
- **AC-3 :** "Créer ce budget" crée directement le budget avec le montant suggéré (appelle `addBudgetAction()`)
- **AC-4 :** Les catégories déjà budgétées ne sont pas proposées
- **AC-5 :** `suggestBudgets()` est testé unitairement (catégorie stable, variable, déjà budgétée, données insuffisantes)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/budget-suggester.ts` | CRÉER — logique pure `suggestBudgets()` |
| `src/app/actions/budget-suggestion-actions.ts` | CRÉER — `getBudgetSuggestionsAction()` |
| `src/components/budget-suggestions.tsx` | CRÉER — section dans /budgets |
| `src/app/[locale]/(app)/budgets/page.tsx` | MODIFIER — intégrer les suggestions |
| `tests/unit/lib/budget-suggester.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/budget-suggester.test.ts`

### Données de test

```typescript
const EXPENSES_STABLE = [
  { category: "Alimentation", monthlyAmounts: [350, 380, 360] },
];

const EXPENSES_VARIABLE = [
  { category: "Loisirs", monthlyAmounts: [100, 300, 50] },
];

const EXPENSES_INSUFFICIENT = [
  { category: "Vêtements", monthlyAmounts: [200] }, // 1 seul mois
];

const EXISTING_BUDGET_CATEGORIES = ["Alimentation"];
```

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-52-1 | Catégorie stable (3 mois) → suggestion high confidence | suggestedLimit = 390 (arrondi ↑), confidence = "high" |
| TU-52-2 | Catégorie variable → confidence = "low" ou "medium" | confidence !== "high" |
| TU-52-3 | Catégorie déjà budgétée → exclue | aucune suggestion pour "Alimentation" |
| TU-52-4 | 1 seul mois de données → non suggérée | length = 0 |
| TU-52-5 | Maximum 8 suggestions retournées | length ≤ 8 même avec 15 catégories |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Intégration UI (suggestions visibles) |
| AC-2 | TU-52-1 (détails suggestion) |
| AC-3 | Intégration (bouton → addBudgetAction) |
| AC-4 | TU-52-3 (catégorie exclue) |
| AC-5 | TU-52-1 à TU-52-5 |

---

## Interface TypeScript

```typescript
// src/lib/budget-suggester.ts

export interface CategoryExpense {
  category: string;
  monthlyAmounts: number[];  // montants des mois disponibles (max 3)
}

export interface BudgetSuggestion {
  category: string;
  suggestedLimit: number;  // arrondi à la dizaine supérieure
  avgAmount: number;       // moyenne brute (non arrondie)
  confidence: "high" | "medium" | "low";
}

export function suggestBudgets(
  expenses: CategoryExpense[],
  existingBudgetCategories: string[],  // catégories déjà budgétées → à exclure
  maxSuggestions?: number              // défaut : 8
): BudgetSuggestion[]
```

**Arrondi à la dizaine supérieure :**
```typescript
function roundUpToTen(n: number): number {
  return Math.ceil(n / 10) * 10;
}
```

**Calcul CV (coefficient de variation) :**
```typescript
function coefficientOfVariation(amounts: number[]): number {
  const avg = amounts.reduce((s, v) => s + v, 0) / amounts.length;
  if (avg === 0) return 0;
  const variance = amounts.reduce((s, v) => s + (v - avg) ** 2, 0) / amounts.length;
  return Math.sqrt(variance) / avg;
}
```

---

## Notes d'implémentation

- `suggestBudgets()` est une **fonction pure** — facilement testable
- `getBudgetSuggestionsAction(accountId)` :
  1. Requête SQL : dépenses des 3 derniers mois GROUP BY catégorie, mois
  2. Récupère les catégories déjà budgétées avec `getBudgets(db, accountId)`
  3. Appelle `suggestBudgets(expenses, budgetedCategories)`
- La section dans `/budgets` s'affiche seulement s'il y a ≥ 1 suggestion
- Bouton "Créer" → `addBudgetAction()` existant + `revalidatePath("/budgets")`
- UI : liste de cards avec badge de confiance coloré (high=vert, medium=orange, low=gris)
