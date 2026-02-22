# STORY-025 — Export CSV des transactions

**Epic :** Rétention
**Priorité :** P1
**Complexité :** XS
**Statut :** pending
**Bloquée par :** []

## User Story

En tant qu'utilisateur, je veux pouvoir exporter mes transactions en CSV afin d'importer mes données dans Excel ou de les partager avec mon comptable.

## Contexte technique

- `getTransactions(db, accountId?)` retourne toutes les transactions
- Pas de package externe — génération CSV manuelle avec échappement des guillemets
- Téléchargement côté client via `URL.createObjectURL(blob)`

## Fichiers à créer / modifier

- `src/lib/csv-export.ts` — `generateTransactionsCsv(transactions[])` : pure function
- `src/app/actions/export-actions.ts` — `exportTransactionsAction(accountId?)` : Server Action
- `src/components/export-csv-button.tsx` — bouton client qui appelle l'action et déclenche le download
- `src/app/[locale]/(app)/transactions/page.tsx` — intégrer `<ExportCsvButton />`

## Acceptance Criteria

- AC-1 : Le CSV contient les colonnes : Date, Description, Catégorie, Sous-catégorie, Type, Montant, Devise, Compte
- AC-2 : Le fichier est nommé `transactions-YYYY-MM-DD.csv`
- AC-3 : Encodage UTF-8 avec BOM `\uFEFF` (compatible Excel français)
- AC-4 : Si accountId fourni → seules les transactions de ce compte sont exportées
- AC-5 : Les champs contenant des virgules ou guillemets sont correctement échappés (RFC 4180)

## Tests à créer

`tests/unit/export/csv-export.test.ts` (5 tests) :
- TU-1-1 : `generateTransactionsCsv([])` → contient les headers CSV
- TU-1-2 : Une transaction → une ligne avec les 8 champs dans l'ordre
- TU-1-3 : BOM UTF-8 `\uFEFF` présent au début du fichier
- TU-1-4 : Champ avec virgule → entouré de guillemets doubles
- TU-1-5 : Champ avec guillemet → guillemet doublé (`""`)

## Estimation : 1 point / 30min-1h
