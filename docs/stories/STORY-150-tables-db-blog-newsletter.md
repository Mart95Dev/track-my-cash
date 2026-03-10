# STORY-150 — Tables DB blog + newsletter + seed data

**Epic :** blog-dynamique
**Complexite :** S (3 pts)
**Priorite :** P0
**Projet(s) :** track-my-cash + track-my-cash-admin
**blockedBy :** []

## Description

Creer les 4 tables dans la Main DB Turso (`blog_posts`, `blog_categories`, `blog_post_categories`, `newsletter_subscribers`) et inserer les donnees initiales (5 categories + 3 articles existants).

## Fichiers a creer/modifier

### track-my-cash
- **MODIFIER** `src/lib/db.ts` — Ajouter les CREATE TABLE dans `initMainDb()` (ou fonction dediee `ensureBlogTables`)

### track-my-cash-admin
- **MODIFIER** `src/lib/db.ts` — Ajouter `ensureBlogTables(db)` appele au demarrage

### Seed script
- **CREER** `scripts/seed-blog.ts` — Script executable pour inserer les 5 categories + 3 articles migres depuis `src/data/blog-posts.ts`

## Criteres d'acceptation

| # | Critere |
|---|---------|
| AC-150-1 | Les 4 tables existent dans Turso apres execution de la migration |
| AC-150-2 | Contrainte UNIQUE sur `blog_posts.slug` et `newsletter_subscribers.email` |
| AC-150-3 | ON DELETE CASCADE fonctionne sur `blog_post_categories` |
| AC-150-4 | 5 categories initiales presentes (Budget, Couple, Epargne, IA, Securite) |
| AC-150-5 | 3 articles existants migres avec statut `published` et categories liees |
| AC-150-6 | Les index sur slug, status, published_at et email existent |

## Specs de tests

### Tests unitaires

| ID | Test | Fichier |
|----|------|---------|
| TU-150-1 | Les 4 CREATE TABLE sont appeles dans ensureBlogTables | `tests/unit/lib/db-blog-tables.test.ts` |
| TU-150-2 | INSERT doublon slug → erreur UNIQUE | `tests/unit/lib/db-blog-tables.test.ts` |
| TU-150-3 | INSERT doublon email newsletter → erreur UNIQUE | `tests/unit/lib/db-blog-tables.test.ts` |
| TU-150-4 | DELETE blog_post → CASCADE supprime blog_post_categories | `tests/unit/lib/db-blog-tables.test.ts` |
| TU-150-5 | Seed insere 5 categories et 3 articles | `tests/unit/lib/db-blog-tables.test.ts` |

### Mapping AC → tests

| AC | Tests |
|----|-------|
| AC-150-1 | TU-150-1 |
| AC-150-2 | TU-150-2, TU-150-3 |
| AC-150-3 | TU-150-4 |
| AC-150-4, AC-150-5 | TU-150-5 |

### Donnees de test

- DB SQLite in-memory pour les tests unitaires
- 5 categories seed : `{ name: "Budget", slug: "budget", color: "#4F46E5" }`, etc.
- 3 articles seed : reprendre slug, title, excerpt, content, readingTime, tags de `src/data/blog-posts.ts`
