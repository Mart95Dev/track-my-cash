# STORY-158 — Infrastructure SEO — Modules utilitaires

**Epic :** SEO/GEO
**Priorité :** P0 (Must Have)
**Complexité :** M (5 pts)
**Blocked By :** —

## Description

Créer les modules fondation `src/lib/seo/` qui seront utilisés par toutes les autres stories SEO :
- `constants.ts` — Config centralisée (baseUrl, siteName, locales, defaultOgImage)
- `schemas.ts` — 6 fonctions pures générant des objets JSON-LD Schema.org
- `metadata.ts` — Helper `buildPageMetadata()` pour générer les Metadata Next.js avec canonical, alternates, OG, Twitter

## Fichiers à créer

- `src/lib/seo/constants.ts`
- `src/lib/seo/schemas.ts`
- `src/lib/seo/metadata.ts`
- `tests/unit/seo/schemas.test.ts`
- `tests/unit/seo/metadata.test.ts`

## Critères d'acceptation

- **AC-1:** `SEO_CONFIG` exporte `siteName`, `baseUrl`, `defaultOgImage`, `locales` (5), `defaultLocale` ("fr")
- **AC-2:** `schemas.ts` exporte 6 fonctions : `organizationSchema()`, `webSiteSchema()`, `softwareApplicationSchema()`, `faqPageSchema(items)`, `articleSchema(post, baseUrl)`, `breadcrumbSchema(items)`
- **AC-3:** Chaque schema retourne un objet avec `@context: "https://schema.org"` et `@type` correct
- **AC-4:** `buildPageMetadata()` retourne un objet `Metadata` avec canonical, alternates (5 locales), OG (siteName, image), Twitter (summary_large_image)
- **AC-5:** Aucune dépendance npm ajoutée

## Spécifications de tests

### Tests unitaires — `tests/unit/seo/schemas.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | `organizationSchema()` retourne un schema valide | `@type === "Organization"`, `name === "TrackMyCash"`, `contactPoint` présent |
| TU-2 | `webSiteSchema()` retourne un schema valide | `@type === "WebSite"`, `potentialAction` présent avec `SearchAction` |
| TU-3 | `softwareApplicationSchema()` inclut les 3 offres | `offers` a 3 éléments, prix 0/4.90/7.90 |
| TU-4 | `faqPageSchema()` génère N questions | items en entrée = N mainEntity en sortie, chaque `@type === "Question"` |
| TU-5 | `faqPageSchema([])` retourne un schema vide valide | `mainEntity` est un tableau vide |
| TU-6 | `articleSchema()` inclut publisher logo | `publisher.logo.@type === "ImageObject"` |
| TU-7 | `breadcrumbSchema()` génère les positions | `itemListElement[0].position === 1`, `itemListElement[1].position === 2` |
| TU-8 | Tous les schemas ont `@context` | Chaque fonction retourne `@context: "https://schema.org"` |

### Tests unitaires — `tests/unit/seo/metadata.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-9 | `buildPageMetadata()` canonical correct | `alternates.canonical === "{baseUrl}/fr/tarifs"` pour path "tarifs", locale "fr" |
| TU-10 | `buildPageMetadata()` alternates 5 locales | `alternates.languages` a les clés fr, en, es, it, de |
| TU-11 | `buildPageMetadata()` OG complet | `openGraph.siteName`, `openGraph.images`, `openGraph.url` présents |
| TU-12 | `buildPageMetadata()` Twitter card | `twitter.card === "summary_large_image"` |

### Mapping AC → Tests fonctionnels

| AC | Tests |
|----|-------|
| AC-1 | TU-1 à TU-8 (import direct) |
| AC-2 | TU-1 à TU-8 |
| AC-3 | TU-8 |
| AC-4 | TU-9 à TU-12 |
| AC-5 | Vérification manuelle package.json |

## Données de test

```typescript
const testFaqItems = [
  { question: "Test question 1?", answer: "Test answer 1" },
  { question: "Test question 2?", answer: "Test answer 2" },
];

const testBlogPost = {
  title: "Test Article",
  excerpt: "Test excerpt",
  slug: "test-article",
  publishedAt: "2026-01-15",
  updatedAt: "2026-01-20",
  categories: [{ name: "Finance" }],
};

const testBreadcrumbs = [
  { name: "Accueil", url: "https://trackmycash.com/fr" },
  { name: "Tarifs", url: "https://trackmycash.com/fr/tarifs" },
];
```
