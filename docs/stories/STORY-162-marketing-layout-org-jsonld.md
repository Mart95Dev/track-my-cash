# STORY-162 — Marketing Layout — Organization JSON-LD

**Epic :** SEO/GEO
**Priorité :** P0 (Must Have)
**Complexité :** S (3 pts)
**Blocked By :** STORY-158

## Description

Injecter un schema JSON-LD Organization dans le marketing layout (`src/app/[locale]/(marketing)/layout.tsx`) pour qu'il soit présent sur TOUTES les pages marketing.

## Fichiers à modifier

- `src/app/[locale]/(marketing)/layout.tsx`
- `tests/unit/seo/marketing-layout.test.ts` (nouveau)

## Critères d'acceptation

- **AC-1:** Le layout injecte un `<script type="application/ld+json">` avec `organizationSchema()`
- **AC-2:** Le schema inclut : name, url, logo, description, foundingDate, contactPoint
- **AC-3:** Les composants existants (Navbar, Footer, CookieBanner) sont inchangés
- **AC-4:** Le schema utilise la fonction de `src/lib/seo/schemas.ts`

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/marketing-layout.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Le schema Organization est injecté | Le composant rend un `<script type="application/ld+json">` |
| TU-2 | Le JSON parsé est valide | `@type === "Organization"`, `name === "TrackMyCash"` |
| TU-3 | Le logo est une URL absolue | `logo` commence par `https://` |
