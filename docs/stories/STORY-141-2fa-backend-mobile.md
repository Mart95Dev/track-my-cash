# STORY-141 : Routes API 2FA TOTP pour le mobile

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P0 (HAUTE)
**Complexité :** M (5 pts)
**Epic :** auth-parite
**Bloqué par :** STORY-139

---

## Contexte

Le web supporte le 2FA TOTP via Better-Auth (plugin twoFactor). Le mobile n'a pas les routes pour :
1. Activer le 2FA (génération QR code + backup codes)
2. Vérifier un code TOTP lors de la connexion
3. Désactiver le 2FA

Les routes login et register existantes doivent aussi être adaptées pour signaler quand le 2FA est requis.

## Description

Créer 3 routes API mobile pour le 2FA et adapter la route login pour gérer le cas 2FA.

## Fichiers impactés

**Projet web (track-my-cash) :**
- `src/app/api/mobile/auth/2fa/verify/route.ts` (NOUVEAU)
- `src/app/api/mobile/auth/2fa/enable/route.ts` (NOUVEAU)
- `src/app/api/mobile/auth/2fa/disable/route.ts` (NOUVEAU)
- `src/app/api/mobile/auth/login/route.ts` (MODIFIER — ajouter détection 2FA)

## Acceptance Criteria

### AC-1 : Login détecte le 2FA et retourne `requires2FA: true`

```gherkin
Given un utilisateur a le 2FA activé
When POST /api/mobile/auth/login avec email + password corrects
Then la réponse est { requires2FA: true, tempToken: "..." }
And PAS de JWT final retourné
And le tempToken est un JWT court (5 min) avec sub=userId
```

### AC-2 : Vérification du code TOTP

```gherkin
Given un tempToken valide et un code TOTP valide
When POST /api/mobile/auth/2fa/verify avec { tempToken, code }
Then la réponse contient { user, token } (JWT mobile 30j)
And le tempToken est invalidé après usage

Given un code TOTP invalide
When POST /api/mobile/auth/2fa/verify avec { tempToken, code: "000000" }
Then la réponse est 401 "Code invalide"
```

### AC-3 : Activation du 2FA

```gherkin
Given un utilisateur authentifié (JWT valide)
When POST /api/mobile/auth/2fa/enable
Then la réponse contient { totpURI, backupCodes: string[8], qrDataUrl }
And le secret TOTP est stocké dans la table twoFactor (Main DB)
And le 2FA n'est pas encore actif (confirmation requise)

When POST /api/mobile/auth/2fa/enable/confirm avec { code } (code TOTP valide)
Then le 2FA est activé définitivement
```

### AC-4 : Désactivation du 2FA

```gherkin
Given un utilisateur avec 2FA activé et authentifié
When POST /api/mobile/auth/2fa/disable avec { code } (code TOTP valide)
Then le 2FA est désactivé
And la table twoFactor est nettoyée pour cet utilisateur

Given un code TOTP invalide
When POST /api/mobile/auth/2fa/disable avec { code: "000000" }
Then la réponse est 401 "Code invalide"
```

### AC-5 : Codes de récupération (backup codes)

```gherkin
Given un utilisateur avec 2FA activé qui a perdu son appareil
When POST /api/mobile/auth/2fa/verify avec { tempToken, backupCode: "XXXX-XXXX" }
Then le code de récupération est accepté
And le backup code est marqué comme utilisé (usage unique)
And un JWT mobile est retourné
```

### AC-6 : CORS et OPTIONS handler sur toutes les routes 2FA

```gherkin
Given une requête OPTIONS sur /api/mobile/auth/2fa/*
Then les headers CORS sont retournés
```

## Spécifications de tests

### Tests unitaires

**Fichier :** `tests/unit/api-mobile-2fa.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Login retourne requires2FA si 2FA activé | `{ requires2FA: true, tempToken }` |
| TU-2 | Login retourne JWT normalement si pas de 2FA | `{ user, token }` |
| TU-3 | verify avec code valide retourne JWT | Status 200, token présent |
| TU-4 | verify avec code invalide retourne 401 | Status 401 |
| TU-5 | verify avec tempToken expiré retourne 401 | Status 401 |
| TU-6 | enable retourne totpURI + backupCodes | 8 backup codes |
| TU-7 | disable avec code valide désactive le 2FA | Status 200 |
| TU-8 | disable avec code invalide retourne 401 | Status 401 |
| TU-9 | verify avec backupCode valide fonctionne | Status 200, token présent |
| TU-10 | backupCode usage unique | 2e tentative retourne 401 |

### Mapping AC → Tests

| AC | Tests |
|----|-------|
| AC-1 | TU-1, TU-2 |
| AC-2 | TU-3, TU-4, TU-5 |
| AC-3 | TU-6 |
| AC-4 | TU-7, TU-8 |
| AC-5 | TU-9, TU-10 |

### Fixtures

- Mock Better-Auth `twoFactor` plugin
- Mock TOTP generation/verification (secret, code)
- JWT tempToken signé (5 min expiry)
