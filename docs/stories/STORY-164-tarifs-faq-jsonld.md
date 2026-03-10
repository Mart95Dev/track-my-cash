# STORY-164 — Tarifs — FAQPage JSON-LD

**Epic :** SEO/GEO
**Priorité :** P0 (Must Have)
**Complexité :** S (3 pts)
**Blocked By :** STORY-158

## Description

Enrichir la page tarifs avec un schema FAQPage JSON-LD (4 questions existantes), un BreadcrumbList, et convertir la metadata en `generateMetadata` async avec canonical, alternates, OG image, Twitter.

## Fichiers à modifier

- `src/app/[locale]/(marketing)/tarifs/page.tsx`
- `tests/unit/seo/tarifs-seo.test.ts` (nouveau)

## Critères d'acceptation

- **AC-1:** `generateMetadata` async remplace `export const metadata` avec canonical, alternates (5 locales), OG (image `/og/tarifs.png`), Twitter
- **AC-2:** Script JSON-LD FAQPage injecté avec les 4 questions de `FAQ_ITEMS`
- **AC-3:** Script JSON-LD BreadcrumbList injecté (Accueil → Tarifs)
- **AC-4:** Le contenu existant (PlanCards, comparatif, FaqAccordion) est inchangé

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/tarifs-seo.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | FAQPage schema a 4 questions | `mainEntity.length === 4` |
| TU-2 | Les questions matchent FAQ_ITEMS | `mainEntity[i].name === FAQ_ITEMS[i].question` |
| TU-3 | BreadcrumbList a 2 items | `itemListElement.length === 2` |
| TU-4 | Le breadcrumb commence par Accueil | `itemListElement[0].name === "Accueil"` |
| TU-5 | COMPARISON_FEATURES est toujours exporté | Export accessible pour tests existants |
