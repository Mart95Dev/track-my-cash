# STORY-006 — importAllData : restauration complète

**Epic :** Fonctionnalités incomplètes
**Priorité :** P1
**Complexité :** XS
**Statut :** pending

## User Story

En tant qu'utilisateur qui restaure un backup JSON,
je veux que TOUS les champs de mes transactions soient restaurés,
afin de ne pas perdre la sous-catégorie et le statut de rapprochement.

## Critères d'acceptance

- [ ] `importAllData` insère `subcategory` dans les transactions
- [ ] `importAllData` insère `reconciled` dans les transactions
- [ ] Un export puis import immédiat produit des données identiques à l'original
- [ ] Pas de régression sur les autres champs (date, amount, description, category, import_hash)

## Fichiers à modifier

- `src/lib/queries.ts` → fonction `importAllData` : ajouter `subcategory` et `reconciled` dans le INSERT

## Tests

- Exporter un compte avec transactions ayant subcategory="Resto" reconciled=1
- Importer le JSON → vérifier subcategory="Resto" et reconciled=1 présents
