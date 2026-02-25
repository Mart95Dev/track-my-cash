# STORY-101 — Emails de rappel couple (J+1, J+3, J+7)

**Sprint :** v14 — Couple-First Onboarding  
**Priorité :** P2  
**Complexité :** S (2 points)  
**Epic :** couple-activation

---

## Objectif

Envoyer des emails de rappel aux utilisateurs qui ont choisi "En couple" mais n'ont pas encore de partenaire connecté.

---

## Acceptance Criteria

- **AC-1** : Email J+1 si `onboarding_choice='couple'` et aucun partenaire actif
- **AC-2** : Email J+3 si toujours sans partenaire
- **AC-3** : Email J+7 si toujours sans partenaire
- **AC-4** : Chaque rappel n'est envoyé qu'une seule fois (flags `reminder_couple_1d_sent`, etc.)
- **AC-5** : Route cron `/api/cron/couple-reminders` protégée par `CRON_SECRET`

---

## Status

**Pending** — à implémenter après STORY-100
