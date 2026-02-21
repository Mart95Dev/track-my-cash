# STORY-004 — UI Tags dans la page Transactions

**Epic :** Fonctionnalités incomplètes
**Priorité :** P1
**Complexité :** M
**Statut :** pending

## User Story

En tant qu'utilisateur,
je veux pouvoir tagger mes transactions et filtrer par tag,
afin d'organiser mes dépenses au-delà des catégories (ex : "Vacances 2026", "Projet maison").

## Critères d'acceptance

- [ ] Les tags assignés à une transaction sont affichés comme badges colorés dans la ligne
- [ ] Un popover sur chaque ligne permet d'assigner/retirer des tags
- [ ] La barre de filtres contient un filtre "Tag" (Select ou multi-select)
- [ ] Filtrer par tag n'affiche que les transactions avec ce tag
- [ ] Si aucun tag n'existe, le popover propose "Créer un tag dans Paramètres"
- [ ] Pas de régression sur les performances (pas de requête par ligne)

## Fichiers à modifier/créer

- `src/components/transaction-tag-popover.tsx` → CRÉER (Popover + Command multi-select)
- `src/app/[locale]/(app)/transactions/page.tsx` → charger tags + afficher badges + filtre
- `src/app/actions/tag-actions.ts` → vérifier `setTransactionTagsAction`, `getTransactionTagsAction`

## Tests

- Assigner le tag "Vacances" à une transaction → badge visible sur la ligne
- Filtrer par tag "Vacances" → seulement les transactions taggées
- Transaction sans tag → aucun badge
