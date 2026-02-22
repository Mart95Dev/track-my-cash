# STORY-028 — Widget taux d'épargne dashboard

**Epic :** Rétention
**Priorité :** P2
**Complexité :** S
**Statut :** pending
**Bloquée par :** ["STORY-027"]

## User Story

En tant qu'utilisateur, je veux voir mon taux d'épargne du mois en cours directement sur le dashboard afin d'avoir une vision rapide de ma santé financière mensuelle.

## Contexte technique

- `getMonthlySummary(db, accountId?)` retourne `{ month, income, expenses, net }[]` — déjà appelé dans dashboard
- Composant `MonthlySummary` déjà importé dans dashboard/page.tsx — vérifier son contenu
- Le taux d'épargne = `(net / income) * 100` si `income > 0`, sinon `null`
- Utiliser les données du mois en cours (premier élément du tableau si `month === YYYY-MM`)

## Fichiers à modifier

- `src/lib/queries.ts` — `getMonthlySummary` : ajouter `savingsRate: number | null`
- `src/components/monthly-summary.tsx` — ajouter section taux d'épargne avec couleur conditionnelle
- `src/app/[locale]/(app)/dashboard/page.tsx` — vérifier prop passée à MonthlySummary

## Acceptance Criteria

- AC-1 : Taux d'épargne affiché en % pour le mois en cours
- AC-2 : Cashflow positif (épargne) → texte/badge vert
- AC-3 : Cashflow négatif (déficit) → texte/badge rouge
- AC-4 : Revenus = 0 → taux affiché comme "—" (pas de division par zéro)
- AC-5 : Le widget s'intègre dans la section MonthlySummary existante

## Tests à créer

`tests/unit/components/monthly-summary.test.ts` (4 tests) :
- TU-1-1 : savingsRate positif (ex: 20%) → badge de couleur verte dans le rendu
- TU-1-2 : savingsRate négatif (ex: -10%) → badge de couleur rouge
- TU-1-3 : savingsRate null (revenus = 0) → affiche "—"
- TU-1-4 : MonthlySummary rend sans erreur avec props minimales

## Estimation : 2 points / 1-2h
