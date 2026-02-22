# STORY-026 — Récapitulatif email mensuel

**Epic :** Rétention
**Priorité :** P1
**Complexité :** M
**Statut :** pending
**Bloquée par :** ["STORY-025"]

## User Story

En tant qu'utilisateur, je veux recevoir un récapitulatif mensuel par email avec mes revenus, dépenses et cashflow du mois écoulé, afin de rester informé de ma santé financière sans avoir à me connecter.

## Contexte technique

- `getMonthlySummary(db, accountId?)` → `{ month, income, expenses, net }[]` (12 mois DESC)
- `getExpensesByBroadCategory(db, accountId?)` → dépenses par catégorie du mois en cours
- Service email : `sendEmail()` + `renderEmailBase()` dans `@/lib/email`
- Déclencheur : action manuelle depuis `/parametres` (bouton "Envoyer le récapitulatif")
- L'email est envoyé à `session.user.email`

## Fichiers à créer / modifier

- `src/lib/email-templates.ts` — ajouter `renderMonthlySummaryEmail(data: MonthlySummaryData)`
- `src/app/actions/settings-actions.ts` — ajouter `sendMonthlySummaryAction()`
- `src/app/[locale]/(app)/parametres/page.tsx` — bouton "Envoyer le récapitulatif du mois"

## Interface de données

```typescript
interface MonthlySummaryData {
  month: string;          // ex: "2026-01"
  income: number;
  expenses: number;
  net: number;
  currency: string;
  topCategories: { category: string; total: number; percentage: number }[];
}
```

## Acceptance Criteria

- AC-1 : Email contient total revenus, total dépenses, cashflow net du mois en cours
- AC-2 : Top 3 catégories de dépenses affichées avec montant et pourcentage
- AC-3 : Email envoyé à l'adresse de l'utilisateur connecté (session.user.email)
- AC-4 : Toast de confirmation après envoi réussi
- AC-5 : Si aucune transaction ce mois → email envoyé avec mention "Aucune dépense ce mois"

## Tests à créer

`tests/unit/email/monthly-summary.test.ts` (5 tests) :
- TU-1-1 : Template contient le mois formaté (ex: "janvier 2026")
- TU-1-2 : Template contient les montants revenus et dépenses
- TU-1-3 : Template contient les catégories du top 3
- TU-1-4 : Cashflow positif → mention "excédent" ou signe "+"
- TU-1-5 : topCategories vide → affiche "Aucune dépense ce mois"

## Estimation : 3 points / 2-3h
