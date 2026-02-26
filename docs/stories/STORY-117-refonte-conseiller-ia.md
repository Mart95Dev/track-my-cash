# STORY-117 — Refonte Conseiller IA

**Epic :** ui-refonte  
**Priorité :** P2 | **Complexité :** S | **Points :** 2  
**Sprint :** v15  
**Statut :** pending  
**Bloquée par :** STORY-107

## Description

Refonte de conseiller/page.tsx et ai-chat.tsx d'après `conseiller-ia-1/2.html`. Chat interface premium avec bulles messages, avatar IA, structured data cards, chips suggestions.

## Maquettes de référence

- `/tmp/stitch-maquettes/app/conseiller-ia-1.html`
- `/tmp/stitch-maquettes/app/conseiller-ia-2.html`

## Acceptance Criteria

- **AC-1** : Header : bouton back `arrow_back_ios_new`, titre "Conseiller IA", badge "Premium" bg-primary/10 text-primary
- **AC-2** : Messages utilisateur : alignés à droite, bg-primary text-white, rounded-2xl rounded-br-sm
- **AC-3** : Messages IA : alignés à gauche, bg-card, rounded-2xl rounded-bl-sm, avatar gradient indigo→purple ou icône smart_toy
- **AC-4** : Structured data card (analyse avec progress bar dans le message IA)
- **AC-5** : Chips suggestions scroll horizontal : "Analyse nos dépenses communes", "Optimise notre budget", "Qui a le plus dépensé ?"
- **AC-6** : Input zone fixe en bas (rounded-full bg-card border, icône envoi bg-primary)
- **AC-7** : Dark mode supporté
- **AC-8** : Fonctionnalité IA existante (API /api/chat) préservée

## Specs Tests

### TU-117-1 : Badge Premium header
Vérifier que conseiller/page.tsx ou ai-chat.tsx contient "Premium" dans le header.

### TU-117-2 : Bulles messages user
Vérifier que ai-chat.tsx contient des messages avec classes d'alignement (ml-auto ou justify-end) et bg-primary.

### TU-117-3 : Chips suggestions
Vérifier que les suggestions rapides sont présentes (au moins 2 chips).

### TU-117-4 : API /api/chat préservée
Vérifier que ai-chat.tsx appelle toujours /api/chat dans son fetch.

## Fichiers

- `src/app/[locale]/(app)/conseiller/page.tsx`
- `src/components/ai-chat.tsx`
