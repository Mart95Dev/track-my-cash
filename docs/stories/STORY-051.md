# STORY-051 — Simulateur de scénarios "Et si..." dans les prévisions

**Sprint :** Intelligence & UX IA (v7)
**Épique :** analytics
**Priorité :** P2
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** —

---

## Description

La page prévisions montre les tendances actuelles passées mais l'utilisateur ne peut pas explorer l'impact de changements comportementaux. Le simulateur de scénarios permet de modifier des paramètres et voir l'impact instantané sur la projection financière — entièrement client-side (useMemo, aucun appel serveur).

**Scénarios disponibles :**
1. **Économies supplémentaires** : "Si j'économise X€ de plus par mois" → impact sur épargne annuelle + date d'atteinte des objectifs
2. **Suppression de dépense** : "Si je supprime X€/mois de [catégorie]" → réduction des dépenses sur 12 mois
3. **Hausse de revenus** : "Si mes revenus augmentent de X%" → nouveau taux d'épargne projeté

---

## Acceptance Criteria

- **AC-1 :** 3 types de scénarios disponibles (économies extra, suppression dépense, hausse revenus)
- **AC-2 :** La simulation est instantanée (client-side, useMemo, pas d'appel serveur)
- **AC-3 :** L'impact annuel estimé est affiché (ex: "+2 400€ épargnés sur 12 mois")
- **AC-4 :** Si l'utilisateur a des objectifs, le nombre de mois pour les atteindre est recalculé
- **AC-5 :** `simulateScenario()` est testé unitairement (3 types × cas nominal + edge cases)

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/scenario-simulator.ts` | CRÉER — logique pure `simulateScenario()` |
| `src/components/scenario-simulator.tsx` | CRÉER — section interactive dans /previsions |
| `src/app/[locale]/(app)/previsions/page.tsx` | MODIFIER — ajouter la section simulateur |
| `tests/unit/lib/scenario-simulator.test.ts` | CRÉER — tests unitaires |

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/lib/scenario-simulator.test.ts`

### Données de test

```typescript
const BASE_FORECAST = {
  avgMonthlyIncome: 3000,
  avgMonthlyExpenses: 2500,
  goals: [{ target_amount: 6000, current_amount: 1200 }],
};

const SCENARIO_EXTRA_SAVINGS: Scenario = {
  type: "extra_savings",
  amount: 200,
};

const SCENARIO_CUT_EXPENSE: Scenario = {
  type: "cut_expense",
  amount: 100,
  category: "Loisirs",
};

const SCENARIO_INCOME_INCREASE: Scenario = {
  type: "income_increase",
  amount: 10, // 10%
};
```

### Cas de test

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-51-1 | Extra savings 200€/mois → impact annuel | annualImpact = 2400, projectedSavingsRate augmente |
| TU-51-2 | Couper dépense 100€/mois → impact annuel | annualImpact = 1200, dépenses réduites |
| TU-51-3 | Hausse revenus +10% → nouveau taux épargne | projectedSavingsRate calculé correctement |
| TU-51-4 | Avec objectif → mois pour atteindre recalculé | monthsToGoal < baseline si épargne augmente |
| TU-51-5 | Sans objectif → monthsToGoal = null | monthsToGoal === null |
| TU-51-6 | Extra savings 0€ → impact nul | annualImpact = 0, taux identique à la baseline |
| TU-51-7 | Revenus déjà couvrent tout (taux 100%) → pas de dépassement | projectedSavingsRate plafonné à 100 |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-51-1 (extra), TU-51-2 (cut), TU-51-3 (income) |
| AC-2 | Logique pure, pas d'I/O → confirmation par nature |
| AC-3 | TU-51-1 (annualImpact = 2400), TU-51-2 (annualImpact = 1200) |
| AC-4 | TU-51-4 (monthsToGoal recalculé) |
| AC-5 | TU-51-1 à TU-51-7 |

---

## Interface TypeScript

```typescript
// src/lib/scenario-simulator.ts

export interface BaseForecast {
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  goals: { target_amount: number; current_amount: number }[];
}

export interface Scenario {
  type: "extra_savings" | "cut_expense" | "income_increase";
  amount: number;    // €/mois pour extra_savings et cut_expense, % pour income_increase
  category?: string; // utilisé uniquement pour cut_expense (informatif)
}

export interface SimulationResult {
  projectedSavingsRate: number;  // % après scénario
  baselineSavingsRate: number;   // % avant scénario
  monthlyNetSavings: number;     // épargne nette mensuelle projetée
  annualImpact: number;          // différence annuelle vs baseline (positif = meilleur)
  monthsToGoal: number | null;   // null si pas d'objectif ou si jamais atteint
}

export function simulateScenario(base: BaseForecast, scenario: Scenario): SimulationResult
```

---

## Notes d'implémentation

**Calculs :**
```
extra_savings :
  newSavings = (income - expenses) + amount
  projectedSavingsRate = newSavings / income × 100
  annualImpact = amount × 12

cut_expense :
  newExpenses = expenses - amount
  projectedSavingsRate = (income - newExpenses) / income × 100
  annualImpact = amount × 12

income_increase :
  newIncome = income × (1 + amount / 100)
  projectedSavingsRate = (newIncome - expenses) / newIncome × 100
  annualImpact = (newIncome - income) × 12 - expenses × 12 + income × 12 (pas de changement dépenses)
              = (newIncome - income) × 12

monthsToGoal :
  if goals.length === 0 → null
  remaining = sum(goal.target_amount - goal.current_amount)
  monthlySavings = projectedMonthlyNet  (income - expenses après scénario)
  if monthlySavings ≤ 0 → null
  monthsToGoal = Math.ceil(remaining / monthlySavings)
```

**UI :**
- Section collapsible dans la page `/previsions` sous le tableau de prévisions
- 3 onglets (Économies / Dépenses / Revenus)
- Slider `<input type="range">` ou input numérique
- Tableau comparatif : Avant / Après — taux d'épargne, épargne annuelle, objectif
- Tout calculé via `useMemo` — zéro appel serveur
