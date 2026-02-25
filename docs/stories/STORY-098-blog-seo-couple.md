# STORY-098 — Blog SEO couple — contenu statique

**Sprint :** v13 — Activation & Rétention Couple
**Priorité :** P3 — COULD HAVE
**Complexité :** S
**Points :** 2
**Epic :** acquisition
**Dépendances :** aucune

---

## Description

Créer une section `/blog` publique (groupe `(marketing)`, même layout que landing page et tarifs) avec 3 articles statiques ciblant les mots-clés SEO de la niche couple. Contenu stocké en TypeScript (pas de CMS, pas de MDX) pour la simplicité de maintenance.

**Articles initiaux :**
| Slug | Titre | Cible SEO |
|------|-------|-----------|
| `gerer-budget-couple` | "Comment gérer son budget en couple sans se disputer" | "budget couple", "gestion finances couple" |
| `partager-depenses-equitablement` | "Partager ses dépenses équitablement : 3 méthodes éprouvées" | "partager dépenses couple", "qui doit quoi" |
| `objectifs-epargne-couple` | "5 objectifs d'épargne pour les couples en 2026" | "épargne couple", "objectifs financiers couple" |

**Routes :**
- `/blog` — liste des articles (cards : titre, extrait, date de publication, CTA "Lire l'article")
- `/blog/[slug]` — article complet avec Schema.org `Article`

**SEO :**
- `metadata` dynamique par article (`title`, `description`, `openGraph`)
- Schema.org `Article` JSON-LD dans le `<head>` de chaque article
- Mise à jour de `src/app/sitemap.ts` avec les URLs blog
- CTA en bas de chaque article : "Gérez votre budget en couple avec TrackMyCash" → `/inscription`

---

## Critères d'acceptation

| # | Critère |
|---|---------|
| AC-1 | `/blog` liste les 3 articles avec titre, extrait et date |
| AC-2 | `/blog/[slug]` affiche le contenu complet de l'article |
| AC-3 | Slug inexistant → `notFound()` (404) |
| AC-4 | Chaque article a un `<title>` et `<meta description>` uniques |
| AC-5 | URLs blog présentes dans `sitemap.xml` |
| AC-6 | Schema.org `Article` présent dans le HTML de chaque article (JSON-LD) |
| AC-7 | CTA "Commencer gratuitement" présent en bas de chaque article |

---

## Cas de tests unitaires

### `BLOG_POSTS` data → `src/data/blog-posts.ts`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-98-1 | `BLOG_POSTS.length >= 3` | `true` |
| TU-98-2 | Chaque post a `slug`, `title`, `date`, `excerpt`, `content` | Tous les champs présents |
| TU-98-3 | Slugs uniques dans le tableau | Pas de doublon |
| TU-98-4 | `getBlogPost("slug-inexistant")` retourne `undefined` | `undefined` |
| TU-98-5 | `getBlogPost("gerer-budget-couple")` retourne le bon article | `title` correct |

### `sitemap.ts` — URLs blog

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-98-6 | Sitemap contient `/blog` | URL présente |
| TU-98-7 | Sitemap contient `/blog/{slug}` pour chaque article | 3 URLs blog dans le sitemap |

### Page `/blog` — liste

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-98-8 | Rendu avec 3 articles → 3 cards dans le DOM | 3 titres distincts |
| TU-98-9 | Chaque card a un lien vers `/blog/{slug}` | `href` correct |

---

## Mapping AC → Tests

| AC | Tests couvrants |
|----|----------------|
| AC-1 | TU-98-1, TU-98-8 |
| AC-2 | TU-98-5 |
| AC-3 | TU-98-4 |
| AC-4 | Vérification metadata (test de snapshot ou inspection) |
| AC-5 | TU-98-6, TU-98-7 |
| AC-6 | Vérification JSON-LD dans le rendu |
| AC-7 | TU-98-9 (contenu article) |

---

## Structure des données articles

```typescript
// src/data/blog-posts.ts
export interface BlogPost {
  slug: string;
  title: string;
  date: string;           // "2026-02-24"
  excerpt: string;        // 1-2 phrases pour la card
  content: string;        // HTML ou texte brut (sections)
  readingTime: number;    // minutes
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "gerer-budget-couple",
    title: "Comment gérer son budget en couple sans se disputer",
    date: "2026-02-24",
    excerpt: "La gestion de l'argent est l'une des premières sources de tension en couple. Voici les méthodes qui fonctionnent vraiment.",
    readingTime: 5,
    tags: ["budget", "couple", "finances"],
    content: `...`,
  },
  // ...
];
```

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/data/blog-posts.ts` | Créer — données + helper `getBlogPost(slug)` |
| `src/app/[locale]/(marketing)/blog/page.tsx` | Créer — liste articles |
| `src/app/[locale]/(marketing)/blog/[slug]/page.tsx` | Créer — article + metadata + JSON-LD |
| `src/app/sitemap.ts` | Modifier — ajouter URLs blog |
| `tests/unit/seo/blog-sitemap.test.ts` | Créer |
| `tests/unit/data/blog-posts.test.ts` | Créer |
