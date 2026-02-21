# STORY-003 — Dashboard : conversion multi-devises complète

**Epic :** Bugs critiques
**Priorité :** P0
**Complexité :** S
**Statut :** pending

## User Story

En tant qu'utilisateur avec des comptes en USD, GBP et EUR,
je veux que le total affiché sur le dashboard convertisse TOUTES les devises vers ma devise de référence,
afin d'avoir un total consolidé cohérent.

## Critères d'acceptance

- [ ] Le dashboard utilise `getAllRates()` pour récupérer tous les taux
- [ ] Le dashboard lit `reference_currency` depuis les settings user (défaut "EUR")
- [ ] Chaque compte est converti via `convertToReference(balance, account.currency, refCurrency, rates)`
- [ ] L'ancienne logique `getExchangeRate()` binaire EUR/MGA est supprimée du dashboard
- [ ] Si l'API de taux échoue, le dashboard affiche les soldes sans conversion (graceful degradation)

## Fichiers à modifier

- `src/app/[locale]/(app)/page.tsx` → migrer vers `getAllRates()` + `convertToReference()`
- `src/lib/currency.ts` → vérifier que `getAllRates()` et `convertToReference()` sont bien exportés

## Tests

- Compte USD 100 + compte EUR 100 + taux USD=1.05 → total EUR ≈ 195.24
- Compte MGA 500000 + taux MGA=5000 → total EUR = 100
