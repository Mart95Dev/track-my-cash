# STORY-008 — checkDuplicates : WHERE IN (1 requête)

**Epic :** Optimisations qualité
**Priorité :** P2
**Complexité :** XS
**Statut :** pending

## User Story

En tant qu'utilisateur qui importe 500 transactions,
je veux que la détection de doublons soit rapide,
afin que l'import ne prenne pas plusieurs secondes.

## Critères d'acceptance

- [ ] `checkDuplicates(hashes)` fait exactement 1 requête SQL au lieu de N
- [ ] La requête utilise `WHERE import_hash IN (?, ?, ?)` avec placeholders
- [ ] Le résultat retourne le même Set<string> de hashes existants
- [ ] Fonctionne avec un tableau vide (retourne Set vide sans requête)
- [ ] Fonctionne avec 1, 10, 100, 1000 hashes

## Fichiers à modifier

- `src/lib/queries.ts` → refactoriser `checkDuplicates()` avec WHERE IN

## Tests

- Appel avec 5 hashes dont 2 en DB → retourne Set avec les 2 hashes DB
- Appel avec [] → retourne Set vide (0 requêtes)
- Appel avec 100 hashes → 1 seule requête SQL
