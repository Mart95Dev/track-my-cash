# STORY-109 — Refonte Page Tarifs

**Epic :** ui-refonte  
**Priorité :** P1 | **Complexité :** M | **Points :** 3  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte de la page tarifs d'après `02-tarifs.html`. Design premium avec toggle mensuel/annuel, card animée pour Couple Pro, tableau comparatif.

## Maquette de référence

`/tmp/stitch-maquettes/landing/02-tarifs.html`

## Acceptance Criteria

- **AC-1** : Toggle mensuel/annuel (pill buttons), state côté client ("use client")
- **AC-2** : Badge "Économisez 20% en annuel" avec icône `auto_awesome`
- **AC-3** : Card "Couple Pro" avec bordure animée (`animated-border-wrapper` gradient primary→pink)
- **AC-4** : Prix 4,90€/mois (mensuel) sur la card Pro
- **AC-5** : Card "Unlimited" avec prix 7,90€/mois
- **AC-6** : Tableau comparatif `COMPARISON_FEATURES` préservé et re-stylé
- **AC-7** : Fond `bg-[#f6f6f8]`

## Specs Tests

### TU-109-1 : COMPARISON_FEATURES conservées
Vérifier que COMPARISON_FEATURES contient "Partage couple".

### TU-109-2 : Toggle composant client
Vérifier qu'il existe un composant avec "use client" pour le toggle.

### TU-109-3 : Prix plan Pro
Vérifier que "4,90€" est dans la page.

### TU-109-4 : animated-border-wrapper
Vérifier que la classe animated-border-wrapper est utilisée ou que l'animation CSS est présente.

## Fichiers

- `src/app/[locale]/(marketing)/tarifs/page.tsx`
- `src/components/pricing-toggle.tsx` (nouveau composant client)
