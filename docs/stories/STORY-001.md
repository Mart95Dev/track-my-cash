# STORY-001 — formatCurrency/formatDate : locale dynamique

**Epic :** Bugs critiques
**Priorité :** P0
**Complexité :** S
**Statut :** pending

## User Story

En tant qu'utilisateur anglophone (locale EN),
je veux que les montants et dates soient formatés selon MA locale,
afin d'obtenir "€1,234.56" et "Feb 21, 2026" et non "1 234,56 €" et "21 févr. 2026".

## Critères d'acceptance

- [ ] `formatCurrency(1234.56, "EUR", "en")` → "€1,234.56"
- [ ] `formatCurrency(1234.56, "EUR", "fr")` → "1 234,56 €"
- [ ] `formatDate("2026-02-21", "en")` → "Feb 21, 2026"
- [ ] `formatDate("2026-02-21", "fr")` → "21 févr. 2026"
- [ ] Les appelants dans les pages Server Components passent la locale via `getLocale()`
- [ ] Les appelants dans les composants Client passent la locale via `useLocale()`
- [ ] Pas de régression : `formatCurrency(1234.56, "EUR")` sans locale → comportement fr-FR par défaut

## Fichiers à modifier

- `src/lib/format.ts` → ajouter paramètre `locale?: string` avec défaut `"fr-FR"`
- `src/lib/ai-context.ts` → remplacer `toLocaleString("fr-FR")` par la locale user
- `src/lib/queries.ts` (lignes ~283 et ~597) → `toLocaleDateString(locale)`
- Pages/composants appelant `formatCurrency` / `formatDate` → passer la locale

## Tests

- `formatCurrency(1000, "EUR", "fr")` → contient "1 000"
- `formatCurrency(1000, "EUR", "en")` → contient "1,000"
- `formatDate("2026-02-21", "fr")` → contient "févr"
- `formatDate("2026-02-21", "en")` → contient "Feb"
