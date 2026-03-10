# STORY-165 — Pages marketing — Metadata enrichie (fonctionnalités, sécurité, à propos)

**Epic :** SEO/GEO
**Priorité :** P1 (Should Have)
**Complexité :** M (5 pts)
**Blocked By :** STORY-158

## Description

Convertir les pages fonctionnalités, sécurité et à propos en `generateMetadata` async avec canonical, alternates, OG image dédiée, Twitter card et BreadcrumbList JSON-LD.

## Fichiers à modifier

- `src/app/[locale]/(marketing)/fonctionnalites/page.tsx`
- `src/app/[locale]/(marketing)/securite/page.tsx`
- `src/app/[locale]/(marketing)/a-propos/page.tsx`
- `tests/unit/seo/pages-marketing-seo.test.ts` (nouveau)

## Critères d'acceptation

- **AC-1:** Les 3 pages utilisent `generateMetadata` async
- **AC-2:** Chaque page a canonical, alternates (5 locales), OG image dédiée, Twitter card
- **AC-3:** Chaque page injecte un BreadcrumbList JSON-LD (Accueil → Nom)
- **AC-4:** Le contenu existant est inchangé
- **AC-5:** Titles optimisés 50-60 chars avec mots-clés

### Titles cibles

- Fonctionnalités : "Fonctionnalités — Balance couple, import bancaire, IA"
- Sécurité : "Sécurité — Protection de vos données financières"
- À propos : "À propos — L'histoire de TrackMyCash"

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/pages-marketing-seo.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | fonctionnalités a un BreadcrumbList | JSON-LD avec `@type: "BreadcrumbList"` et item "Fonctionnalités" |
| TU-2 | sécurité a un BreadcrumbList | JSON-LD avec item "Sécurité" |
| TU-3 | à propos a un BreadcrumbList | JSON-LD avec item "À propos" |
| TU-4 | Les OG images sont dédiées par page | fonctionnalites → `/og/fonctionnalites.png`, etc. |
| TU-5 | Les exports existants sont préservés | `IMPORT_FORMATS`, `CONVICTIONS`, `STATS` toujours exportés |
| TU-6 | Les alternates couvrent 5 locales | Chaque page a fr/en/es/it/de |
