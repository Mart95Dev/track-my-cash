# STORY-041 — Comparaisons Mois/Mois (MoM) dans le Dashboard

**Sprint :** Sprint Compatibilité, IA & Analyse Avancée (v6)
**Priorité :** P1
**Complexité :** S (2 points)
**Bloquée par :** aucune
**Statut :** pending

---

## Description

Le dashboard affiche le solde total, les dépenses du mois en cours et les revenus — mais sans aucune comparaison avec le mois précédent. L'utilisateur ne sait pas s'il dépense plus ou moins qu'avant. L'ajout de variations mois/mois (MoM) transforme le dashboard en véritable tableau de bord décisionnel.

---

## Contexte technique

- `getMonthlySummary(db, accountId)` dans `queries.ts` retourne les données du mois en cours
- La logique de variation est simple : `((actuel - précédent) / précédent) × 100`
- Le composant dashboard est un Server Component qui charge les données en haut de page

---

## Acceptance Criteria

**AC-1 :** Le dashboard affiche la variation % des dépenses vs le mois précédent (ex : "+12% vs janvier")

**AC-2 :** La variation est en rouge si les dépenses ont augmenté, en vert si elles ont diminué (convention intuitive)

**AC-3 :** La variation s'affiche aussi pour les revenus : vert si revenus en hausse, rouge si en baisse

**AC-4 :** Si le mois précédent n'a pas de données (premier mois), affiche "Premier mois enregistré" à la place du %

**AC-5 :** La logique de calcul MoM est testée unitairement (cas nominal, cas premier mois, cas mois précédent à zéro)

---

## Spécifications techniques

### Modification `src/lib/queries.ts` — `getMonthlySummary()`

```typescript
export interface MonthlySummaryData {
  currentMonth: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number;
    month: string; // "2026-02"
  };
  previousMonth: {
    income: number;
    expenses: number;
    net: number;
    month: string; // "2026-01"
  } | null;
}

// Modifier getMonthlySummary() pour retourner aussi le mois précédent :
export async function getMonthlySummary(db: Client, accountId: number): Promise<MonthlySummaryData>
```

### Nouvelle lib `src/lib/mom-calculator.ts` (logique pure, testable)

```typescript
export interface MoMVariation {
  current: number;
  previous: number | null;
  percentChange: number | null;   // null si pas de données précédentes
  direction: "up" | "down" | "stable" | "no_previous";
}

export function computeMoMVariation(current: number, previous: number | null): MoMVariation {
  if (previous === null || previous === 0) {
    return { current, previous, percentChange: null, direction: "no_previous" };
  }
  const percentChange = ((current - previous) / previous) * 100;
  const direction = percentChange > 0.5 ? "up" : percentChange < -0.5 ? "down" : "stable";
  return { current, previous, percentChange, direction };
}
```

### Nouveau composant `src/components/variation-badge.tsx`

```typescript
// Props: variation: MoMVariation, isExpense?: boolean (pour inverser couleurs)
// Si direction === "no_previous" → affiche "Premier mois"
// Si direction === "up" + isExpense → rouge (dépenses en hausse = mauvais)
// Si direction === "up" + !isExpense → vert (revenus en hausse = bon)
// Affichage : "+12%" avec flèche ↑↓→

interface VariationBadgeProps {
  variation: MoMVariation;
  isExpense?: boolean;
  previousMonthLabel?: string; // "jan. 2026"
}

// Utilise shadcn Badge avec variant conditionnel
// Exemple rendu : <Badge variant="destructive">↑ +12% vs jan.</Badge>
```

### Intégration dans le Dashboard

```typescript
// src/app/[locale]/(app)/page.tsx (Server Component)
const summary = await getMonthlySummary(db, primaryAccountId);
const expenseVariation = computeMoMVariation(
  summary.currentMonth.expenses,
  summary.previousMonth?.expenses ?? null
);
const incomeVariation = computeMoMVariation(
  summary.currentMonth.income,
  summary.previousMonth?.income ?? null
);

// Passer à la carte dépenses du mois :
// <VariationBadge variation={expenseVariation} isExpense previousMonthLabel="jan." />
```

---

## Tests unitaires

**Fichier :** `tests/unit/lib/mom-calculator.test.ts`

**TU-1-1 :** `computeMoMVariation(1200, 1000)` → `{ percentChange: 20, direction: "up" }`
**TU-1-2 :** `computeMoMVariation(800, 1000)` → `{ percentChange: -20, direction: "down" }`
**TU-1-3 :** `computeMoMVariation(1005, 1000)` → `{ direction: "stable" }` (variation < 0.5%)
**TU-1-4 :** `computeMoMVariation(500, null)` → `{ percentChange: null, direction: "no_previous" }`
**TU-1-5 :** `computeMoMVariation(500, 0)` → `{ percentChange: null, direction: "no_previous" }` (division par zéro)

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `src/lib/queries.ts` | MODIFIER — `getMonthlySummary()` retourne aussi `previousMonth` |
| `src/lib/mom-calculator.ts` | CRÉER — `computeMoMVariation()` logique pure |
| `src/components/variation-badge.tsx` | CRÉER — badge coloré avec direction |
| `src/app/[locale]/(app)/page.tsx` | MODIFIER — intégrer `VariationBadge` sur les cartes dépenses/revenus |
| `tests/unit/lib/mom-calculator.test.ts` | CRÉER — 5 tests |
