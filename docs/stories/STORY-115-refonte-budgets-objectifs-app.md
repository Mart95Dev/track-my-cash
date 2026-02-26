# STORY-115 — Refonte Budgets & Objectifs App

**Epic :** ui-refonte  
**Priorité :** P2 | **Complexité :** M | **Points :** 3  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte de budgets/page.tsx et objectifs/page.tsx d'après `budgets-1/2.html` et `objectifs-1/2.html`.

## Maquettes de référence

- `/tmp/stitch-maquettes/app/budgets-1.html`
- `/tmp/stitch-maquettes/app/objectifs-1.html`

## Acceptance Criteria (Budgets)

- **AC-1** : Header "Budgets" + bouton add (bg-primary rounded-full)
- **AC-2** : Card "Suggestions IA" avec effet glass-panel (icône auto_awesome, text primaire)
- **AC-3** : Liste budgets avec progress bars colorées : primary si <80%, warning si 80-100%, danger si >100%
- **AC-4** : Chaque budget : icône catégorie cercle coloré, titre, montant dépensé / total, pourcentage

## Acceptance Criteria (Objectifs)

- **AC-5** : Header "Objectifs d'épargne"
- **AC-6** : Stats summary : "Total épargné X€" + "N projets actifs"
- **AC-7** : Cards objectifs : émoji/icône, titre, progress bar, montant actuel/cible, badge "J-X jours"

## Acceptance Criteria (commun)

- **AC-8** : Dark mode supporté sur les 2 pages
- **AC-9** : Fond `bg-background-light`, mobile-first

## Specs Tests

### TU-115-1 : Budgets glass-panel suggestion
Vérifier que budgets/page.tsx contient "glass-panel" ou "backdrop-filter" ou "Suggestion".

### TU-115-2 : Progress bar budgets
Vérifier que les budgets ont des progress bars (div avec width% ou rôle progressbar).

### TU-115-3 : Objectifs stats summary
Vérifier que objectifs/page.tsx contient "Total" ou "épargné" et un compteur de projets.

### TU-115-4 : Objectifs badge jours
Vérifier que les cards objectifs contiennent "J-" ou "jours restants".

## Fichiers

- `src/app/[locale]/(app)/budgets/page.tsx`
- `src/app/[locale]/(app)/objectifs/page.tsx`
