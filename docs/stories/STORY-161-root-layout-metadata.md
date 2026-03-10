# STORY-161 — Root Layout — Metadata globale enrichie

**Epic :** SEO/GEO
**Priorité :** P0 (Must Have)
**Complexité :** XS (2 pts)
**Blocked By :** —

## Description

Enrichir la metadata du root layout (`src/app/layout.tsx`) avec `metadataBase`, un title template, une description SEO optimisée, `robots`, et `icons`.

## Fichiers à modifier

- `src/app/layout.tsx`

## Critères d'acceptation

- **AC-1:** `metadataBase` = `new URL("https://trackmycash.com")` (ou env var)
- **AC-2:** `title` utilise un template : `{ default: "TrackMyCash — Gestion financière de couple", template: "%s | TrackMyCash" }`
- **AC-3:** `description` fait 150-160 chars avec mots-clés cibles (couple, finances, dépenses, budget)
- **AC-4:** `robots: { index: true, follow: true }`
- **AC-5:** `icons` pointe vers `/icons/icon-192.png` (icon + apple)

## Spécifications de tests

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Le title par défaut est correct | `metadata.title.default` contient "TrackMyCash" |
| TU-2 | Le template title fonctionne | `metadata.title.template` contient "%s" et "TrackMyCash" |

Note : Validation principalement visuelle et via les tests des pages enfants.
