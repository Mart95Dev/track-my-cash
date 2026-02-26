# STORY-111 — Refonte Pages Auth (Inscription + Connexion)

**Epic :** ui-refonte  
**Priorité :** P2 | **Complexité :** S | **Points :** 2  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte des pages d'authentification d'après `04-inscription.html` et `05-login.html`. Design épuré avec blur spots background, card blanche arrondie, OAuth buttons.

## Maquettes de référence

- `/tmp/stitch-maquettes/landing/04-inscription.html`
- `/tmp/stitch-maquettes/landing/05-login.html`

## Acceptance Criteria

- **AC-1** : Page inscription — background avec 3 blur spots (primary/5, couple-pink/5, blue-200/10)
- **AC-2** : Page inscription — boutons OAuth Google et Apple présents (SVG inline)
- **AC-3** : Page inscription — badge "Essai 14j offert" visible
- **AC-4** : Page inscription — card bg-white rounded-3xl
- **AC-5** : Page connexion — titre "Bon retour !"
- **AC-6** : Page connexion — lien "Mot de passe oublié ?"
- **AC-7** : Bascule inscription ↔ connexion (liens présents)
- **AC-8** : Server Actions existantes conservées (pas de changement fonctionnel)

## Specs Tests

### TU-111-1 : Badge essai inscription
Vérifier que inscription/page.tsx contient "14j" ou "14 jours".

### TU-111-2 : Titre connexion
Vérifier que connexion/page.tsx contient "Bon retour".

### TU-111-3 : Blur spots
Vérifier que les pages auth contiennent "blur-[" dans les styles.

## Fichiers

- `src/app/[locale]/(auth)/inscription/page.tsx`
- `src/app/[locale]/(auth)/connexion/page.tsx`
