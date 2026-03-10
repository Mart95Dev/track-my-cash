# STORY-168 — OG Images — Placeholders statiques

**Epic :** SEO/GEO
**Priorité :** P2 (Could Have)
**Complexité :** XS (2 pts)
**Blocked By :** —

## Description

Créer 6 images PNG 1200×630 dans `/public/og/` pour les previews sociaux. Les images utilisent les couleurs de marque et incluent le nom TrackMyCash + titre de la page.

## Fichiers à créer

- `public/og/home.png`
- `public/og/tarifs.png`
- `public/og/fonctionnalites.png`
- `public/og/securite.png`
- `public/og/a-propos.png`
- `public/og/blog.png`

## Critères d'acceptation

- **AC-1:** 6 images PNG présentes dans `/public/og/`
- **AC-2:** Chaque image fait 1200×630 pixels
- **AC-3:** Couleurs de marque utilisées (primary #4848e5, background #F5F3FF)
- **AC-4:** Chaque image affiche "TrackMyCash" + titre de la page

## Spécifications de tests

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Les 6 fichiers existent | `fs.existsSync("public/og/home.png")` etc. |

## Note

Ces images sont des placeholders. La génération dynamique (`@vercel/og`) est prévue en phase 2 pour les articles de blog.
