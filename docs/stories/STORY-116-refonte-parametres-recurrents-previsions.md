# STORY-116 — Refonte Paramètres + Récurrents + Prévisions

**Epic :** ui-refonte  
**Priorité :** P2 | **Complexité :** M | **Points :** 3  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte de parametres/page.tsx, recurrents/page.tsx et previsions/page.tsx d'après leurs maquettes Stitch respectives.

## Maquettes de référence

- `/tmp/stitch-maquettes/app/parametres-1.html`
- `/tmp/stitch-maquettes/app/recurrents.html`
- `/tmp/stitch-maquettes/app/previsions.html`

## Acceptance Criteria (Paramètres)

- **AC-1** : Style iOS — grouped lists avec sections (compte, abonnement, préférences, données)
- **AC-2** : Toggle switch style iOS (custom CSS via `.ios-toggle` ou shadcn Switch)
- **AC-3** : Fond `bg-[#f2f2f7]` (iOS system background), cards bg-white
- **AC-4** : Séparateurs entre items `border-b border-separator-light`

## Acceptance Criteria (Récurrents)

- **AC-5** : Card "Insight IA" en haut avec effet glass-panel ou bg-primary/5
- **AC-6** : Liste récurrents avec icône, montant, fréquence
- **AC-7** : Bouton "Ajouter" visible

## Acceptance Criteria (Prévisions)

- **AC-8** : Navigation mois (onglets ou pills : Oct/Nov/Déc ou mois actuels)
- **AC-9** : Filtres comptes en chips

## Acceptance Criteria (commun)

- **AC-10** : Dark mode sur les 3 pages
- **AC-11** : Fonctionnalités existantes préservées (Server Actions, données)

## Specs Tests

### TU-116-1 : Paramètres fond iOS
Vérifier que parametres/page.tsx contient "#f2f2f7" ou "background-light" dans le fond.

### TU-116-2 : Récurrents card insight
Vérifier que recurrents/page.tsx contient "Insight" ou "Suggestion" ou "glass-panel".

### TU-116-3 : Prévisions onglets mois
Vérifier que previsions/page.tsx contient des boutons ou onglets pour la navigation mois.

## Fichiers

- `src/app/[locale]/(app)/parametres/page.tsx`
- `src/app/[locale]/(app)/recurrents/page.tsx`
- `src/app/[locale]/(app)/previsions/page.tsx`
