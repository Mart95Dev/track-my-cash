# STORY-153 — Lecture dynamique des articles cote public

**Epic :** blog-dynamique
**Complexite :** M (5 pts)
**Priorite :** P0
**Projet :** track-my-cash
**blockedBy :** [STORY-150]

## Description

Remplacer les articles hardcodes (`src/data/blog-posts.ts`) par des queries Turso. Le composant BlogContent recoit les articles et categories en props depuis le Server Component parent. Les filtres par categorie deviennent dynamiques.

## Fichiers a creer/modifier

- **CREER** `src/lib/queries/blog.ts` — Queries lecture (getPublishedPosts, getAllCategories, getPublishedSlugs)
- **MODIFIER** `src/app/[locale]/(marketing)/blog/page.tsx` — Appeler les queries et passer les donnees en props a BlogContent
- **MODIFIER** `src/app/[locale]/(marketing)/blog/blog-content.tsx` — Recevoir `posts` et `categories` en props au lieu d'importer BLOG_POSTS. Adapter le filtrage.
- **SUPPRIMER** `src/data/blog-posts.ts` — Apres verification que plus rien ne l'importe

## Criteres d'acceptation

| # | Critere |
|---|---------|
| AC-153-1 | La page `/blog` affiche uniquement les articles avec statut "published" |
| AC-153-2 | Les filtres categories sont dynamiques (depuis blog_categories en DB) |
| AC-153-3 | L'article a la une est le plus recent publie |
| AC-153-4 | Un article publie dans l'admin apparait sur le blog public sans redeploiement |
| AC-153-5 | L'ancien fichier `src/data/blog-posts.ts` est supprime |
| AC-153-6 | Le design existant (cards, badges, featured article) est preserve |

## Specs de tests

### Tests unitaires

| ID | Test | Fichier |
|----|------|---------|
| TU-153-1 | getPublishedPosts retourne uniquement les articles publies | `tests/unit/lib/queries/blog.test.ts` |
| TU-153-2 | getPublishedPosts avec categorySlug filtre correctement | `tests/unit/lib/queries/blog.test.ts` |
| TU-153-3 | getPublishedPosts retourne les articles tries par published_at DESC | `tests/unit/lib/queries/blog.test.ts` |
| TU-153-4 | getPublishedPosts joint les categories via json_group_array | `tests/unit/lib/queries/blog.test.ts` |
| TU-153-5 | getAllCategories retourne toutes les categories triees par nom | `tests/unit/lib/queries/blog.test.ts` |
| TU-153-6 | getPublishedSlugs retourne un tableau de strings | `tests/unit/lib/queries/blog.test.ts` |
| TU-153-7 | getPublishedPosts sans articles retourne tableau vide | `tests/unit/lib/queries/blog.test.ts` |

### Tests composants

| ID | Test | Fichier |
|----|------|---------|
| TC-153-1 | BlogContent affiche le premier article en featured | `tests/unit/components/blog-content.test.tsx` |
| TC-153-2 | BlogContent affiche les badges categories dynamiques | `tests/unit/components/blog-content.test.tsx` |
| TC-153-3 | BlogContent filtre par categorie au clic sur un badge | `tests/unit/components/blog-content.test.tsx` |
| TC-153-4 | BlogContent avec tableau vide affiche un message | `tests/unit/components/blog-content.test.tsx` |

### Mapping AC → tests

| AC | Tests |
|----|-------|
| AC-153-1 | TU-153-1 |
| AC-153-2 | TU-153-5, TC-153-2 |
| AC-153-3 | TU-153-3, TC-153-1 |
| AC-153-4 | (test d'integration manuel) |
| AC-153-5 | (verification fichier supprime) |
| AC-153-6 | TC-153-1, TC-153-3 |

### Types

```typescript
type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  readingTime: number;
  status: "draft" | "published";
  publishedAt: string | null;
  authorName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  categories: { id: string; name: string; slug: string; color: string }[];
};

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  color: string;
};
```

### Donnees de test

- Mock `getDb()` avec DB in-memory contenant 5 articles (3 published, 2 draft) et 5 categories
- Fixture categories : Budget, Couple, Epargne, IA, Securite
