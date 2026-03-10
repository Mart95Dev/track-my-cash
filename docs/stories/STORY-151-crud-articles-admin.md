# STORY-151 — CRUD articles dans l'admin

**Epic :** blog-dynamique
**Complexite :** L (8 pts)
**Priorite :** P0
**Projet :** track-my-cash-admin
**blockedBy :** [STORY-150]

## Description

Implementer le CRUD complet des articles de blog dans track-my-cash-admin : liste, creation, edition, publication, depublication, suppression. Routes `/blog`, `/blog/new`, `/blog/[id]/edit`.

## Fichiers a creer/modifier

### track-my-cash-admin
- **CREER** `src/lib/blog-queries.ts` — Queries CRUD articles (getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost, publishBlogPost, unpublishBlogPost)
- **CREER** `src/app/actions/blog-actions.ts` — Server Actions (createPostAction, updatePostAction, deletePostAction, publishPostAction, unpublishPostAction)
- **CREER** `src/app/(admin)/blog/page.tsx` — Page liste articles (tableau avec statut, date, categories, actions)
- **CREER** `src/app/(admin)/blog/new/page.tsx` — Page creation article
- **CREER** `src/app/(admin)/blog/[id]/edit/page.tsx` — Page edition article
- **CREER** `src/components/blog/blog-table.tsx` — Composant tableau articles
- **CREER** `src/components/blog/blog-form.tsx` — Formulaire article (shared create/edit)
- **MODIFIER** `src/components/layout/sidebar.tsx` — Ajouter lien "Blog" dans la navigation

## Criteres d'acceptation

| # | Critere |
|---|---------|
| AC-151-1 | La page `/blog` affiche tous les articles avec titre, statut, date et categories |
| AC-151-2 | Le formulaire `/blog/new` cree un article en DB avec statut "draft" |
| AC-151-3 | Le formulaire `/blog/[id]/edit` pre-remplit les champs et sauvegarde les modifications |
| AC-151-4 | Le bouton "Publier" passe le statut a "published" et renseigne `published_at` |
| AC-151-5 | Le bouton "Depublier" repasse le statut a "draft" |
| AC-151-6 | La suppression demande confirmation et supprime l'article + liaisons categories |
| AC-151-7 | Le slug est auto-genere depuis le titre (slugify) mais peut etre modifie manuellement |
| AC-151-8 | Le lien "Blog" apparait dans la sidebar admin |

## Specs de tests

### Tests unitaires

| ID | Test | Fichier |
|----|------|---------|
| TU-151-1 | getBlogPosts retourne les articles avec categories jointes | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-2 | getBlogPosts avec filtre status="draft" ne retourne que les brouillons | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-3 | getBlogPosts avec filtre search filtre par titre | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-4 | getBlogPostById retourne l'article avec ses categories | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-5 | getBlogPostById avec id inexistant retourne null | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-6 | createBlogPost insere un article avec statut draft | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-7 | updateBlogPost met a jour titre, contenu et updated_at | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-8 | deleteBlogPost supprime l'article et ses liaisons categories | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-9 | publishBlogPost met status=published et renseigne published_at | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-10 | unpublishBlogPost remet status=draft | `tests/unit/lib/blog-queries.test.ts` |
| TU-151-11 | slugify genere un slug correct (accents, espaces, caracteres speciaux) | `tests/unit/lib/blog-queries.test.ts` |

### Tests fonctionnels (Server Actions)

| ID | Test | Fichier |
|----|------|---------|
| TF-151-1 | createPostAction avec donnees valides cree un article | `tests/unit/actions/blog-actions.test.ts` |
| TF-151-2 | createPostAction avec titre vide retourne erreur | `tests/unit/actions/blog-actions.test.ts` |
| TF-151-3 | updatePostAction met a jour un article existant | `tests/unit/actions/blog-actions.test.ts` |
| TF-151-4 | deletePostAction supprime l'article | `tests/unit/actions/blog-actions.test.ts` |
| TF-151-5 | publishPostAction change le statut a published | `tests/unit/actions/blog-actions.test.ts` |

### Mapping AC → tests

| AC | Tests |
|----|-------|
| AC-151-1 | TU-151-1, TU-151-2, TU-151-3 |
| AC-151-2 | TU-151-6, TF-151-1, TF-151-2 |
| AC-151-3 | TU-151-4, TU-151-7, TF-151-3 |
| AC-151-4 | TU-151-9, TF-151-5 |
| AC-151-5 | TU-151-10 |
| AC-151-6 | TU-151-8, TF-151-4 |
| AC-151-7 | TU-151-11 |

### Donnees de test

- DB SQLite in-memory avec tables blog creees
- Fixture : 3 articles (1 draft, 2 published) + 3 categories liees
- FormData mock pour les Server Actions
