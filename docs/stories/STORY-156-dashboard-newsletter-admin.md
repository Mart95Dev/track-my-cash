# STORY-156 — Dashboard inscrits newsletter dans l'admin

**Epic :** blog-dynamique
**Complexite :** S (3 pts)
**Priorite :** P1
**Projet :** track-my-cash-admin
**blockedBy :** [STORY-150, STORY-151]

## Description

Ajouter une page dans l'admin pour visualiser les inscrits newsletter, avec metriques (actifs, desinscrits, nouveaux ce mois) et export CSV.

## Fichiers a creer/modifier

### track-my-cash-admin
- **MODIFIER** `src/lib/blog-queries.ts` — Ajouter getNewsletterSubscribers, getNewsletterStats, exportNewsletterCsv
- **CREER** `src/app/(admin)/blog/newsletter/page.tsx` — Page liste inscrits + KPIs
- **CREER** `src/components/blog/newsletter-table.tsx` — Tableau inscrits (email, date, statut)
- **CREER** `src/components/blog/newsletter-stats.tsx` — 3 KPI cards (actifs, desinscrits, nouveaux ce mois)
- **CREER** `src/app/actions/newsletter-admin-actions.ts` — exportNewsletterCsvAction

## Criteres d'acceptation

| # | Critere |
|---|---------|
| AC-156-1 | La page `/blog/newsletter` affiche la liste des inscrits avec email, date et statut |
| AC-156-2 | Les compteurs (actifs, desinscrits, nouveaux ce mois) sont calcules correctement |
| AC-156-3 | L'export CSV telecharge un fichier valide avec colonnes email, status, subscribed_at |
| AC-156-4 | Le lien vers la page newsletter est accessible depuis `/blog` |

## Specs de tests

### Tests unitaires

| ID | Test | Fichier |
|----|------|---------|
| TU-156-1 | getNewsletterSubscribers retourne tous les inscrits | `tests/unit/lib/blog-queries.test.ts` |
| TU-156-2 | getNewsletterSubscribers avec filtre status="active" fonctionne | `tests/unit/lib/blog-queries.test.ts` |
| TU-156-3 | getNewsletterStats calcule correctement actifs/desinscrits/nouveaux | `tests/unit/lib/blog-queries.test.ts` |
| TU-156-4 | exportNewsletterCsv genere un CSV valide avec BOM UTF-8 | `tests/unit/lib/blog-queries.test.ts` |

### Mapping AC → tests

| AC | Tests |
|----|-------|
| AC-156-1 | TU-156-1, TU-156-2 |
| AC-156-2 | TU-156-3 |
| AC-156-3 | TU-156-4 |

### Donnees de test

- 10 inscrits dont 7 actifs, 3 desinscrits, 2 inscrits ce mois
