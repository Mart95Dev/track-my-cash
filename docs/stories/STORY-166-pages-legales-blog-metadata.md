# STORY-166 — Pages légales + blog index — Metadata enrichie

**Epic :** SEO/GEO
**Priorité :** P1 (Should Have)
**Complexité :** S (3 pts)
**Blocked By :** STORY-158

## Description

Enrichir les 4 pages légales (CGU, mentions légales, confidentialité, cookies) et le blog index avec `generateMetadata` async, canonical, alternates, OG fallback et BreadcrumbList JSON-LD.

## Fichiers à modifier

- `src/app/[locale]/(marketing)/cgu/page.tsx`
- `src/app/[locale]/(marketing)/mentions-legales/page.tsx`
- `src/app/[locale]/(marketing)/politique-confidentialite/page.tsx`
- `src/app/[locale]/(marketing)/cookies/page.tsx`
- `src/app/[locale]/(marketing)/blog/page.tsx`
- `tests/unit/seo/pages-legales-seo.test.ts` (nouveau)

## Critères d'acceptation

- **AC-1:** Les 5 pages utilisent `generateMetadata` async avec canonical et alternates (5 locales)
- **AC-2:** OG image = `/og/home.png` (fallback) pour les légales, `/og/blog.png` pour le blog
- **AC-3:** Chaque page injecte un BreadcrumbList JSON-LD
- **AC-4:** Contenu existant inchangé

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/pages-legales-seo.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | CGU a un BreadcrumbList | JSON-LD avec item "Conditions Générales" |
| TU-2 | Blog a un BreadcrumbList avec "Blog" | `itemListElement[1].name === "Blog"` |
| TU-3 | Les pages légales ont OG fallback | OG image = `/og/home.png` |
| TU-4 | Le blog a OG `/og/blog.png` | OG image spécifique blog |
| TU-5 | Les alternates couvrent 5 locales | Chaque page a fr/en/es/it/de |
