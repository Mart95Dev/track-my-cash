# STORY-144 : Endpoints RGPD pour le mobile (export + suppression)

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P1
**Complexité :** S (3 pts)
**Epic :** parite-endpoints
**Bloqué par :** STORY-139

---

## Contexte

Le web offre l'export de données et la suppression de compte via Server Actions (RGPD). Le mobile a les écrans mais pas les endpoints backend.

## Fichiers impactés

**Projet web (track-my-cash) :**
- `src/app/api/mobile/user/export/route.ts` (NOUVEAU)
- `src/app/api/mobile/user/delete/route.ts` (NOUVEAU)

## Acceptance Criteria

### AC-1 : Export données RGPD

```gherkin
Given un utilisateur authentifié
When GET /api/mobile/user/export
Then la réponse est un JSON avec toutes les données de l'utilisateur :
  - accounts[], transactions[], budgets[], goals[], recurring_payments[]
  - tags[], settings[], notifications[], categorization_rules[]
And le Content-Type est application/json
And le header Content-Disposition suggère un nom de fichier
```

### AC-2 : Suppression de compte

```gherkin
Given un utilisateur authentifié
When DELETE /api/mobile/user/delete avec { reason?: "..." }
Then une deletion_request est créée (Main DB)
And la suppression est planifiée à J+30
And un email de confirmation est envoyé
And un admin_log est écrit
And la réponse contient { scheduledDeleteAt: "..." }
```

### AC-3 : Double suppression empêchée

```gherkin
Given un utilisateur a déjà une deletion_request
When DELETE /api/mobile/user/delete
Then la réponse est 409 "Suppression déjà planifiée"
```

## Spécifications de tests

**Fichier :** `tests/unit/api-mobile-user.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | export retourne toutes les tables | JSON avec accounts, transactions, etc. |
| TU-2 | export requiert auth | Status 401 sans JWT |
| TU-3 | delete crée une deletion_request | insertion DB vérifiée |
| TU-4 | delete envoie email confirmation | sendEmail appelé |
| TU-5 | delete 409 si déjà demandé | Status 409 |
