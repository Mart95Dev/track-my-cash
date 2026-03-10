# STORY-152 — Gestion des categories dans l'admin

**Epic :** blog-dynamique
**Complexite :** S (3 pts)
**Priorite :** P0
**Projet :** track-my-cash-admin
**blockedBy :** [STORY-150]

## Description

Implementer la gestion des categories de blog dans l'admin : liste, creation, modification, suppression. Interface inline sur la page `/blog` (sidebar ou section dediee).

## Fichiers a creer/modifier

### track-my-cash-admin
- **MODIFIER** `src/lib/blog-queries.ts` — Ajouter getCategories, createCategory, updateCategory, deleteCategory
- **MODIFIER** `src/app/actions/blog-actions.ts` — Ajouter createCategoryAction, updateCategoryAction, deleteCategoryAction
- **CREER** `src/components/blog/category-manager.tsx` — Composant inline CRUD categories (liste + formulaire d'ajout + boutons modifier/supprimer)
- **MODIFIER** `src/app/(admin)/blog/page.tsx` — Integrer CategoryManager dans la page

## Criteres d'acceptation

| # | Critere |
|---|---------|
| AC-152-1 | Les categories sont listees dans la page /blog admin |
| AC-152-2 | Creer une categorie avec nom et couleur persiste en DB |
| AC-152-3 | Modifier le nom ou la couleur d'une categorie met a jour la DB |
| AC-152-4 | Supprimer une categorie detache les articles lies (pas de suppression en cascade des articles) |
| AC-152-5 | Le slug est auto-genere depuis le nom |
| AC-152-6 | Les categories sont disponibles dans le formulaire d'article (multi-select) |

## Specs de tests

### Tests unitaires

| ID | Test | Fichier |
|----|------|---------|
| TU-152-1 | getCategories retourne toutes les categories triees par nom | `tests/unit/lib/blog-queries.test.ts` |
| TU-152-2 | createCategory insere une categorie avec slug auto-genere | `tests/unit/lib/blog-queries.test.ts` |
| TU-152-3 | createCategory avec nom doublon retourne erreur UNIQUE | `tests/unit/lib/blog-queries.test.ts` |
| TU-152-4 | updateCategory met a jour nom, slug et couleur | `tests/unit/lib/blog-queries.test.ts` |
| TU-152-5 | deleteCategory supprime la categorie et les liaisons (pas les articles) | `tests/unit/lib/blog-queries.test.ts` |

### Tests fonctionnels (Server Actions)

| ID | Test | Fichier |
|----|------|---------|
| TF-152-1 | createCategoryAction avec nom valide cree une categorie | `tests/unit/actions/blog-actions.test.ts` |
| TF-152-2 | createCategoryAction avec nom vide retourne erreur | `tests/unit/actions/blog-actions.test.ts` |
| TF-152-3 | deleteCategoryAction supprime la categorie | `tests/unit/actions/blog-actions.test.ts` |

### Mapping AC → tests

| AC | Tests |
|----|-------|
| AC-152-1 | TU-152-1 |
| AC-152-2 | TU-152-2, TF-152-1 |
| AC-152-3 | TU-152-4 |
| AC-152-4 | TU-152-5 |
| AC-152-5 | TU-152-2 |
| AC-152-6 | (teste dans STORY-151 formulaire article) |
