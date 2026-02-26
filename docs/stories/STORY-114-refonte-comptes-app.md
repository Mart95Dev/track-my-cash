# STORY-114 — Refonte Comptes App

**Epic :** ui-refonte  
**Priorité :** P2 | **Complexité :** S | **Points :** 2  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte de la page comptes d'après `comptes.html`. Header avec label primary, grand titre, bouton + flottant, cards comptes avec solde coloré.

## Maquette de référence

`/tmp/stitch-maquettes/app/comptes.html`

## Acceptance Criteria

- **AC-1** : Header : label "Track My Cash" en text-primary, titre "Mes comptes" (text-3xl font-extrabold tracking-tight)
- **AC-2** : Bouton + flottant (bg-primary rounded-full, shadow-lg shadow-primary/30) pour ajouter un compte
- **AC-3** : Cards comptes : rounded-2xl bg-white shadow-sm border border-slate-100, hover:shadow-md
- **AC-4** : Solde coloré : vert emerald si positif, rose/red si négatif
- **AC-5** : Badge devise (EUR/MGA) en haut droite de la card
- **AC-6** : Sous-titre date "Mise à jour: Aujourd'hui"
- **AC-7** : Dark mode supporté (`dark:bg-background-dark`, `dark:bg-[#1e1e2d]`)

## Specs Tests

### TU-114-1 : Label "Track My Cash" en primary
Vérifier que page.tsx contient "Track My Cash" avec une classe text-primary.

### TU-114-2 : Bouton ajout bg-primary
Vérifier que le bouton d'ajout a une classe bg-primary.

### TU-114-3 : Cards avec rounded-2xl
Vérifier que les cards comptes utilisent rounded-2xl ou rounded-xl.

## Fichiers

- `src/app/[locale]/(app)/comptes/page.tsx`
