# STORY-149 : Tests d'intégration parité Web/Mobile

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P2
**Complexité :** M (5 pts)
**Epic :** parite-qualite
**Bloqué par :** STORY-139, STORY-140, STORY-141

---

## Contexte

Après toutes les corrections de parité, il faut valider que les flux critiques fonctionnent de bout en bout entre le backend et l'app mobile. Cette story est dédiée aux tests d'intégration.

## Description

Écrire des tests d'intégration pour les routes API mobile critiques, en validant :
1. Le flux auth complet (register → login → 2FA → token)
2. Le flux IA via proxy (chat → rate limit → plan guard)
3. Les CRUD endpoints (accounts, transactions, budgets)
4. Les endpoints RGPD (export, delete)

## Fichiers impactés

**Projet web (track-my-cash) :**
- `tests/integration/mobile-auth.test.ts` (NOUVEAU)
- `tests/integration/mobile-chat.test.ts` (NOUVEAU)
- `tests/integration/mobile-crud.test.ts` (NOUVEAU)
- `tests/integration/mobile-rgpd.test.ts` (NOUVEAU)

## Acceptance Criteria

### AC-1 : Test flux auth complet

```gherkin
Given un utilisateur s'inscrit via POST /api/mobile/auth/register
When il se déconnecte puis se reconnecte via POST /api/mobile/auth/login
Then les deux opérations retournent un JWT valide
And le JWT contient sub=userId et email
```

### AC-2 : Test flux 2FA

```gherkin
Given un utilisateur active le 2FA via /api/mobile/auth/2fa/enable
When il se connecte avec email/password
Then la réponse contient requires2FA: true
When il soumet le code TOTP via /api/mobile/auth/2fa/verify
Then un JWT final est retourné
```

### AC-3 : Test proxy chat

```gherkin
Given un utilisateur Pro authentifié
When POST /api/mobile/chat avec un message
Then la réponse contient du texte IA
And l'usage AI est incrémenté

Given un utilisateur Free
When POST /api/mobile/chat
Then la réponse est 403
```

### AC-4 : Test CRUD accounts + transactions

```gherkin
Given un utilisateur authentifié
When il crée un compte, ajoute une transaction, la modifie, puis la supprime
Then toutes les opérations réussissent
And le dashboard reflète les changements
```

### AC-5 : Test RGPD

```gherkin
Given un utilisateur avec des données
When GET /api/mobile/user/export
Then le JSON contient toutes ses données

When DELETE /api/mobile/user/delete
Then la deletion_request est créée
```

### AC-6 : Aucune régression tests existants

```gherkin
Given tous les tests sont lancés (existants + nouveaux)
When npm test
Then 0 régression, baseline >= 1588 tests
```

## Spécifications de tests

| ID | Test | Fichier |
|----|------|---------|
| TU-1 | Register + login flow | mobile-auth.test.ts |
| TU-2 | Login avec 2FA activé | mobile-auth.test.ts |
| TU-3 | 2FA enable + verify flow | mobile-auth.test.ts |
| TU-4 | Chat proxy avec auth | mobile-chat.test.ts |
| TU-5 | Chat 403 pour plan free | mobile-chat.test.ts |
| TU-6 | Chat 429 rate limit | mobile-chat.test.ts |
| TU-7 | Account CRUD | mobile-crud.test.ts |
| TU-8 | Transaction CRUD | mobile-crud.test.ts |
| TU-9 | Budget CRUD | mobile-crud.test.ts |
| TU-10 | Export RGPD | mobile-rgpd.test.ts |
| TU-11 | Delete RGPD | mobile-rgpd.test.ts |
