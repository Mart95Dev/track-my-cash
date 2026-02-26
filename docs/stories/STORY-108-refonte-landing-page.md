# STORY-108 — Refonte Landing Page

**Epic :** ui-refonte  
**Priorité :** P1 | **Complexité :** L | **Points :** 5  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte complète de la landing page marketing d'après la maquette `01-landing.html`. Design premium avec police Manrope, couleurs Stitch, et copywriting couple.

## Maquette de référence

`/tmp/stitch-maquettes/landing/01-landing.html`

## Sections à implémenter

1. **Header fixe** : Logo "T" + "TrackMyCash", nav (Fonctionnalités/Concept/Tarifs), CTA "Essai gratuit" (btn-premium rounded-full)
2. **Hero** : Badge "Nouvelle version 2.0", titre "L'argent à deux,\nen toute transparence." (7xl tracking-tighter), sous-titre, 2 CTAs, maquette phone flottante
3. **Comment ça marche** : 3 étapes numérotées (01 Import, 02 Répartition, 03 Vision) — PAS de "connexion bancaire directe"
4. **Features bento grid** : Espace Couple (grand, md:col-span-2), Balance 0€ (sombre), Budgets, IA Assistant, Multi-Import
5. **Tarification** : 3 colonnes (Découverte 0€ / Couple Pro 4,90€ [Populaire] / Unlimited 7,90€)
6. **CTA dark** : Section fond slate-900
7. **Footer** : 3 colonnes Produit/Compagnie/Légal

## Acceptance Criteria

- **AC-1** : Hero titre contient "L'argent à deux" et "en toute transparence"
- **AC-2** : Section "Comment ça marche" avec TROIS étapes, AUCUNE mention "connexion directe", "Open Banking" ou "Safe Connect API"
- **AC-3** : Étape 01 = "Import" (import relevés bancaires), étape 02 = "Répartition", étape 03 = "Vision"
- **AC-4** : Section features bento grid 4 colonnes (md), card "Espace Couple" md:col-span-2
- **AC-5** : Section tarifs : 3 cards, "Couple Pro" marqué "Populaire", prix affiché "4,90€"
- **AC-6** : Section CTA dark fond slate-900, texte blanc
- **AC-7** : Footer avec colonnes Produit + Compagnie + Légal
- **AC-8** : Responsive (mobile + desktop), fond `bg-[#FAFAFA]`
- **AC-9** : `npm run lint` 0 erreur, `npm run build` PASS

## Specs Tests

### TU-108-1 : FEATURES contient au moins 5 items
Vérifier que FEATURES ou équivalent contient au moins 4 features.

### TU-108-2 : STEPS[0] = import
Vérifier que STEPS[0].title contient "Import" ou que la description mentionne "relevé" ou "CSV".

### TU-108-3 : STEPS ne mentionne pas connexion directe
Vérifier qu'aucun step ne contient "connexion directe" ou "Safe Connect".

### TU-108-4 : Pricing plans présents
Vérifier que la page contient "Découverte", "Couple Pro" et "Unlimited".

### TU-108-5 : Plan Couple Pro prix
Vérifier que le prix "4,90€" est présent dans la page.

## Fichiers

- `src/app/[locale]/(marketing)/page.tsx`
