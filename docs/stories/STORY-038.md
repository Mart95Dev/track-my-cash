# STORY-038 — Prévisions intelligentes (AI spending forecast)

**Sprint :** Sprint Objectifs & Intelligence
**Priorité :** P2
**Complexité :** M (3 points)
**Bloquée par :** STORY-034
**Statut :** pending

---

## Description

La page `/previsions` affiche actuellement uniquement les paiements récurrents. Cette story l'enrichit avec des prévisions IA de dépenses basées sur les 3 derniers mois de transactions. L'IA analyse les tendances par catégorie et prédit les dépenses du mois prochain, en les comparant aux budgets définis.

---

## Contexte technique

- Page existante : `src/app/[locale]/(app)/previsions/page.tsx` — étendre (ne pas remplacer)
- Données sources : `getSpendingTrend(db, 3)` (STORY-027) + `getBudgets(db, userId)`
- IA : Vercel AI SDK + OpenAI (même setup que `/api/chat`)
- Freemium guard : feature réservée aux plans Pro/Premium (`canUseAI()`)
- Catégorisation fiable grâce à STORY-034 (transactions mieux catégorisées)

---

## Architecture

1. **Calcul côté serveur** (pas d'appel IA pour la logique de base) :
   - Moyenne des 3 derniers mois par catégorie = `AVG(amount) GROUP BY category`
   - Comparaison avec le budget de la catégorie
   - Statut : `on_track` (prévu < budget × 0.8), `at_risk` (prévu entre 80-100% budget), `exceeded` (prévu > budget)

2. **Enrichissement IA** (optionnel, Pro/Premium) :
   - Prompt : "Analyse ces tendances et identifie 3 insights pour améliorer les finances"
   - Génère des insights textuels (pas de calculs — l'IA commente, pas calcule)
   - `generateText()` du Vercel AI SDK, modèle `gpt-4o-mini`

3. **UI** :
   - Nouvelle section "Prévisions IA" dans `/previsions`
   - Tableau : Catégorie | Moyenne 3 mois | Budget | Statut | Tendance (↑↓→)
   - Section "Insights IA" : 3 bullets générés par l'IA (si Pro/Premium)

---

## Acceptance Criteria

**AC-1 :** La page `/previsions` affiche une nouvelle section "Prévisions du mois prochain" après la section des récurrents

**AC-2 :** Le tableau montre au minimum : catégorie, dépense prévue (moyenne 3 mois), budget si défini, statut coloré

**AC-3 :** Le statut est visuellement distinct : vert (`on_track`), orange (`at_risk`), rouge (`exceeded`)

**AC-4 :** La tendance (↑↓→) compare le mois le plus récent à la moyenne 3 mois

**AC-5 :** Pour les plans Pro/Premium, une section "Insights IA" génère 3 recommandations personnalisées via OpenAI

**AC-6 :** Si < 2 mois de données disponibles, affiche "Données insuffisantes pour les prévisions (minimum 2 mois)"

**AC-7 :** La section prévisions est accessible sans erreur même si `getSpendingTrend` retourne un tableau vide

---

## Spécifications techniques

### `src/lib/forecasting.ts` — à créer

```typescript
export interface CategoryForecast {
  category: string;
  avgAmount: number;        // Moyenne 3 derniers mois
  lastMonthAmount: number;  // Mois le plus récent
  budgetLimit: number | null;
  trend: "up" | "down" | "stable";
  status: "on_track" | "at_risk" | "exceeded" | "no_budget";
}

export function computeForecast(
  trendData: SpendingTrendEntry[],
  budgets: Budget[]
): CategoryForecast[]
```

### `src/app/actions/forecast-actions.ts` — à créer

```typescript
export async function getAIForecastInsightsAction(
  forecasts: CategoryForecast[]
): Promise<{ insights: string[] } | { error: string }>
// Appelle OpenAI avec les données de forecast, retourne 3 insights textuels
```

### `src/components/forecast-table.tsx` — à créer

```typescript
// Server Component
// Props: forecasts: CategoryForecast[]
// Tableau avec couleurs conditionnelles selon statut
```

### `src/components/ai-forecast-insights.tsx` — à créer

```typescript
"use client";
// Props: forecasts: CategoryForecast[]
// Bouton "Générer des insights IA" → appelle getAIForecastInsightsAction
// Affiche 3 bullets d'insights dans une Card
// Visible uniquement si plan Pro/Premium (props: canUseAI: boolean)
```

---

## Tests unitaires à créer

**Fichier :** `tests/unit/lib/forecasting.test.ts`

**TU-1-1 :** `computeForecast` avec 3 mois de données → retourne tableau de CategoryForecast
**TU-1-2 :** `computeForecast` — catégorie avec dépense > budget → status = "exceeded"
**TU-1-3 :** `computeForecast` — catégorie sans budget → status = "no_budget"
**TU-1-4 :** `computeForecast` — tendance : dernier mois > moyenne → trend = "up"
**TU-1-5 :** `computeForecast` avec 0 données → retourne tableau vide

---

## Données de test

```typescript
const trendData: SpendingTrendEntry[] = [
  { month: "2025-11", category: "Alimentation", amount: 380 },
  { month: "2025-12", category: "Alimentation", amount: 420 },
  { month: "2026-01", category: "Alimentation", amount: 450 },
];
const budgets = [
  { category: "Alimentation", amount_limit: 400, period: "monthly" }
];
// → forecast: avgAmount=416, lastMonth=450, budgetLimit=400, trend="up", status="exceeded"
```

---

## Fichiers à créer/modifier

- `src/lib/forecasting.ts` — créer (logique pure, testable sans mock)
- `src/app/actions/forecast-actions.ts` — créer
- `src/components/forecast-table.tsx` — créer
- `src/components/ai-forecast-insights.tsx` — créer
- `src/app/[locale]/(app)/previsions/page.tsx` — étendre avec nouvelle section
- `tests/unit/lib/forecasting.test.ts` — créer (5 tests)
