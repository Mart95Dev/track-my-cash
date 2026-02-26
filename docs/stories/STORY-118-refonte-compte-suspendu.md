# STORY-118 — Refonte Compte Suspendu

**Epic :** ui-refonte  
**Priorité :** P3 | **Complexité :** XS | **Points :** 1  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte de compte-suspendu/page.tsx d'après `compte-suspendu.html`. Design clair et rassurant avec étapes de récupération.

## Maquette de référence

`/tmp/stitch-maquettes/app/compte-suspendu.html`

## Acceptance Criteria

- **AC-1** : Badge pulsant "Compte restreint" avec animation pulse, couleur danger/rouge
- **AC-2** : Titre "Compte Suspendu" avec icône lock
- **AC-3** : Card warning avec information sur le délai de suppression programmée
- **AC-4** : Steps numérotés (1 et 2) pour récupérer le compte
- **AC-5** : Lien mailto ou lien vers support visible
- **AC-6** : Design épuré sans bottom nav visible

## Specs Tests

### TU-118-1 : Badge pulsant
Vérifier que page.tsx contient "animate-pulse" ou "pulse" et "Compte restreint".

### TU-118-2 : Steps numérotés
Vérifier que la page contient au moins 2 étapes numérotées pour récupérer le compte.

### TU-118-3 : Lien support
Vérifier que la page contient un lien href avec "mailto:" ou "support".

## Fichiers

- `src/app/[locale]/compte-suspendu/page.tsx`
