# STORY-102 — Deep link invitation couple (partage mobile)

**Sprint :** v14 — Couple-First Onboarding  
**Priorité :** P2  
**Complexité :** S (2 points)  
**Epic :** couple-activation

---

## Objectif

Générer un lien de partage direct `/rejoindre/[CODE]` qui pré-remplit le code d'invitation.

---

## Acceptance Criteria

- **AC-1** : Route `/[locale]/rejoindre/[code]` redirige vers `/couple?code=CODE`
- **AC-2** : Le lien est copié/partagé depuis CoupleChoiceModal (bouton "Partager le lien")
- **AC-3** : Compatibilité Web Share API avec fallback clipboard

---

## Status

**Pending** — à implémenter après STORY-100
