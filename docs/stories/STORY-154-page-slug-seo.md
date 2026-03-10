# STORY-154 — Page article [slug] avec SEO

**Epic :** blog-dynamique
**Complexite :** M (5 pts)
**Priorite :** P0
**Projet :** track-my-cash
**blockedBy :** [STORY-153]

## Description

Modifier la page `[slug]` existante pour lire l'article depuis Turso au lieu du fichier hardcode. Ajouter la sanitization HTML, les metadata dynamiques, le JSON-LD Schema.org, et l'integration au sitemap.

## Fichiers a creer/modifier

- **CREER** `src/lib/queries/blog.ts` — Ajouter `getPostBySlug(slug)` (si pas deja fait dans STORY-153)
- **MODIFIER** `src/app/[locale]/(marketing)/blog/[slug]/page.tsx` — Query DB, sanitize-html, metadata dynamique
- **MODIFIER** `src/app/sitemap.ts` — Ajouter les slugs publies
- **INSTALLER** `sanitize-html` + `@types/sanitize-html`

## Criteres d'acceptation

| # | Critere |
|---|---------|
| AC-154-1 | `/blog/[slug]` affiche le contenu complet de l'article |
| AC-154-2 | Slug inexistant → `notFound()` (404) |
| AC-154-3 | Article en brouillon → `notFound()` (404) |
| AC-154-4 | Metadata dynamique (title, description) generee par article |
| AC-154-5 | Schema.org Article JSON-LD present dans le head |
| AC-154-6 | CTA vers `/inscription` present en bas de l'article |
| AC-154-7 | Le contenu HTML est sanitize avant rendu (pas de XSS) |
| AC-154-8 | Les URLs des articles publies sont dans `sitemap.xml` |

## Specs de tests

### Tests unitaires

| ID | Test | Fichier |
|----|------|---------|
| TU-154-1 | getPostBySlug retourne l'article publie avec categories | `tests/unit/lib/queries/blog.test.ts` |
| TU-154-2 | getPostBySlug avec slug inexistant retourne null | `tests/unit/lib/queries/blog.test.ts` |
| TU-154-3 | getPostBySlug avec article draft retourne null | `tests/unit/lib/queries/blog.test.ts` |
| TU-154-4 | sanitizeHtml retire les balises script et onerror | `tests/unit/lib/blog-sanitize.test.ts` |
| TU-154-5 | sanitizeHtml preserve les balises autorisees (p, h2, h3, ul, li, a, strong, em, table) | `tests/unit/lib/blog-sanitize.test.ts` |
| TU-154-6 | getPublishedSlugs retourne les slugs pour le sitemap | `tests/unit/lib/queries/blog.test.ts` |

### Tests composants

| ID | Test | Fichier |
|----|------|---------|
| TC-154-1 | La page [slug] genere les metadata correctes | `tests/unit/app/blog-slug.test.tsx` |
| TC-154-2 | La page [slug] contient le JSON-LD Schema.org | `tests/unit/app/blog-slug.test.tsx` |
| TC-154-3 | La page [slug] contient le CTA inscription | `tests/unit/app/blog-slug.test.tsx` |

### Mapping AC → tests

| AC | Tests |
|----|-------|
| AC-154-1 | TU-154-1 |
| AC-154-2 | TU-154-2 |
| AC-154-3 | TU-154-3 |
| AC-154-4 | TC-154-1 |
| AC-154-5 | TC-154-2 |
| AC-154-6 | TC-154-3 |
| AC-154-7 | TU-154-4, TU-154-5 |
| AC-154-8 | TU-154-6 |

### Config sanitize-html

```typescript
const SANITIZE_OPTIONS = {
  allowedTags: ["h2", "h3", "h4", "p", "ul", "ol", "li", "a", "strong", "em", "br", "table", "thead", "tbody", "tr", "th", "td", "blockquote", "img", "code", "pre"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "loading"],
  },
  allowedSchemes: ["https"],
};
```
