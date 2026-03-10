# STORY-160 — Sitemap complet × 5 locales

**Epic :** SEO/GEO
**Priorité :** P0 (Must Have)
**Complexité :** S (3 pts)
**Blocked By :** —

## Description

Enrichir `src/app/sitemap.ts` pour inclure les 11 chemins marketing dans les 5 locales (55 URLs) avec des priorités différenciées par type de page. Conserver le blog dynamique.

## Fichiers à modifier

- `src/app/sitemap.ts`
- `tests/unit/seo/sitemap.test.ts` (mise à jour)

## Critères d'acceptation

- **AC-1:** 11 chemins marketing : home, tarifs, fonctionnalites, securite, a-propos, cgu, mentions-legales, politique-confidentialite, cookies, connexion, inscription
- **AC-2:** Chaque chemin décliné en 5 locales = 55 URLs minimum
- **AC-3:** Priorités : homepage 1.0, tarifs/fonctionnalités 0.9, sécurité/à-propos 0.8, auth 0.5, légal 0.3
- **AC-4:** Blog (index + articles) reste en fr uniquement
- **AC-5:** `changeFrequency` : homepage/blog=weekly, marketing=monthly, légal=yearly

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/sitemap.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Le sitemap contient ≥ 55 URLs marketing | `entries.length >= 55` |
| TU-2 | Chaque chemin marketing existe en 5 locales | Pour chaque path, 5 URLs (fr/en/es/it/de) |
| TU-3 | La homepage a priority 1.0 | Entrées path="" ont `priority: 1.0` |
| TU-4 | Les pages légales ont priority 0.3 | Entrées cgu/mentions/etc. ont `priority: 0.3` |
| TU-5 | Le blog est en fr uniquement | URLs `/fr/blog` présentes, pas `/en/blog` |
| TU-6 | changeFrequency est correct | Homepage=weekly, tarifs=monthly, cgu=yearly |
