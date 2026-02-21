# STORY-024 — Alerte email budget (seuil 80% et dépassement)

**Epic :** UX & Stabilité
**Priorité :** P2
**Complexité :** S
**Statut :** pending
**Bloquée par :** STORY-023

## User Story

En tant qu'utilisateur ayant configuré des budgets par catégorie, je veux recevoir un email automatiquement quand j'approche ou dépasse ma limite, afin d'ajuster mes dépenses avant qu'il ne soit trop tard.

## Contexte technique

- La table `budgets` existe (STORY-017) : `id, account_id, category, amount_limit, period, created_at`
- `getBudgetStatus(db, accountId)` retourne `{ category, spent, limit, percentage }[]`
- Le service email est configuré (STORY-012)
- L'alerte solde bas (STORY-014) est le modèle à suivre
- Déclencheur : après chaque `createTransactionAction`

## Règles métier

| Condition | Action | Sujet email |
|-----------|--------|-------------|
| `80% ≤ percentage < 100%` | Email "approche limite" | `⚠️ Budget [catégorie] bientôt épuisé` |
| `percentage ≥ 100%` | Email "dépassement" | `🚨 Budget [catégorie] dépassé` |
| Déjà alerté dans la période | Pas d'envoi (anti-spam) | — |

## Migration DB requise

```sql
ALTER TABLE budgets ADD COLUMN last_budget_alert_at TEXT;
ALTER TABLE budgets ADD COLUMN last_budget_alert_type TEXT; -- "warning" ou "exceeded"
```

## Fichiers à créer / modifier

- `src/lib/db.ts` — Migration `last_budget_alert_at` + `last_budget_alert_type` sur `budgets`
- `src/lib/email-templates.ts` — Ajouter `renderBudgetAlert(category, spent, limit, percentage, type, currency)`
- `src/lib/budget-alert-service.ts` — Créer `checkAndSendBudgetAlerts(db, accountId, userEmail)`
- `src/app/actions/transaction-actions.ts` — Appeler `checkAndSendBudgetAlerts` après création
- `src/lib/queries.ts` — Mettre à jour `Budget` interface avec les nouveaux champs

## Acceptance Criteria

- AC-1 : Email "approche limite" envoyé quand un budget atteint 80% (seuil configurable)
- AC-2 : Email "dépassement" envoyé quand un budget atteint 100%
- AC-3 : Anti-spam : pas de double envoi pour le même type d'alerte dans la même période
- AC-4 : Si `sendEmail` échoue → `createTransactionAction` réussit quand même
- AC-5 : `last_budget_alert_at` et `last_budget_alert_type` mis à jour après envoi
- AC-6 : Template email affiche : catégorie, dépensé, limite, pourcentage, barre visuelle

## Tests à créer

`tests/unit/email/budget-alert-service.test.ts` (6 tests) :
- TU-1-1 : Pas d'alerte si `percentage < 80`
- TU-1-2 : Alerte "warning" si `80 ≤ percentage < 100`
- TU-1-3 : Alerte "exceeded" si `percentage ≥ 100`
- TU-1-4 : Pas de double envoi si même type d'alerte dans la période
- TU-1-5 : `last_budget_alert_at` mis à jour après envoi réussi
- TU-1-6 : Pas d'alerte si `sendEmail` échoue (erreur silencieuse)

`tests/unit/email/email-templates.test.ts` — Étendre avec 3 tests pour `renderBudgetAlert`

## Estimation : 3 points / 2-3h
