# STORY-027 — Graphique tendances dépenses 6 mois

**Epic :** Rétention
**Priorité :** P2
**Complexité :** M
**Statut :** pending
**Bloquée par :** ["STORY-026"]

## User Story

En tant qu'utilisateur, je veux voir l'évolution de mes dépenses par catégorie sur les 6 derniers mois afin d'identifier mes tendances de consommation.

## Contexte technique

- Recharts `^3.7.0` installé → `BarChart` groupé par mois
- Nouvelle query `getSpendingTrend(db, months, accountId?)` → `{ month, category, amount }[]`
- Dashboard déjà riche : insérer après la section BudgetProgress
- Le composant est `"use client"` (Recharts nécessite le DOM)

## Fichiers à créer / modifier

- `src/lib/queries.ts` — ajouter `getSpendingTrend(db, months, accountId?)`
- `src/components/charts/spending-trend-chart.tsx` — BarChart Recharts, top 5 catégories
- `src/app/[locale]/(app)/dashboard/page.tsx` — appel `getSpendingTrend(db, 6, accountId)` + rendu
- `src/app/[locale]/(app)/dashboard/loading.tsx` — skeleton pour la nouvelle section

## Schéma SQL

```sql
SELECT strftime('%Y-%m', date) as month, category, SUM(amount) as total
FROM transactions
WHERE type = 'expense'
  AND date >= date('now', '-6 months')
  [AND account_id = ?]
GROUP BY month, category
ORDER BY month ASC, total DESC
```

## Acceptance Criteria

- AC-1 : 6 mois de données sur l'axe X (labels "Jan 26", "Fév 26", etc.)
- AC-2 : Top 5 catégories représentées en barres de couleurs distinctes
- AC-3 : Tooltip au survol : catégorie + montant formaté en devise
- AC-4 : Composant responsive (fullWidth Recharts)
- AC-5 : Skeleton loader pendant le chargement initial

## Tests à créer

`tests/unit/queries/spending-trend.test.ts` (4 tests) :
- TU-1-1 : 0 transactions → tableau vide
- TU-1-2 : Transactions sur 2 mois → 2 entrées distinctes par mois
- TU-1-3 : Filtre accountId → seules les transactions du compte retournées
- TU-1-4 : Catégories regroupées correctement par mois (SUM correct)

## Estimation : 3 points / 2-3h
