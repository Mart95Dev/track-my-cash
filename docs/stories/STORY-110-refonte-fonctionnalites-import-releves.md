# STORY-110 — Refonte Fonctionnalités + Import Relevés

**Epic :** ui-refonte  
**Priorité :** P1 | **Complexité :** M | **Points :** 3  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte de la page fonctionnalités d'après `03-features.html`. Contrainte critique : remplacer la section "Multi-Banques / Safe Connect API" par "Import de relevés bancaires (CSV/XLSX/PDF)".

## Maquette de référence

`/tmp/stitch-maquettes/landing/03-features.html`

## Contrainte fonctionnelle

L'application ne propose PAS de connexion bancaire directe. À la place : import manuel de relevés depuis sa banque.
- Parsers supportés : CSV (Banque Populaire, générique), XLSX (Revolut), PDF (basique)
- La section "Multi-Banques" doit devenir "Import Multi-Formats"

## Acceptance Criteria

- **AC-1** : Hero : "L'argent dans votre couple, enfin clarifié."
- **AC-2** : Section "Mode Couple" avec liste fonctionnalités couple
- **AC-3** : Section "Import Multi-Formats" — PAS de "Safe Connect API", "connexion bancaire directe", ni logos de banques avec API
- **AC-4** : Formats d'import mentionnés : CSV, XLSX (et optionnellement PDF)
- **AC-5** : Section IA Assistant
- **AC-6** : CTA Essai gratuit
- **AC-7** : Parsers.ts vérifié : 3 parsers existants (Banque Populaire, MCB, Revolut) documentés dans la copie

## Specs Tests

### TU-110-1 : Aucune mention connexion directe
Vérifier que page.tsx ne contient pas "Safe Connect" ni "connexion directe".

### TU-110-2 : Section import formats
Vérifier que la page contient "CSV" et "XLSX".

### TU-110-3 : Section couple
Vérifier que la page mentionne "couple" ou "partenaire".

### TU-110-4 : Parsers existants confirmés
Vérifier que parsers.ts contient "banque_populaire" ou "Banque Populaire" et "Revolut".

## Fichiers

- `src/app/[locale]/(marketing)/fonctionnalites/page.tsx`
