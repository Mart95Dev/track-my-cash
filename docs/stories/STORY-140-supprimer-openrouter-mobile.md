# STORY-140 : Supprimer la clé OpenRouter du mobile + créer proxy API chat

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P0 (CRITIQUE — sécurité)
**Complexité :** M (5 pts)
**Epic :** securite-parite
**Bloqué par :** STORY-139

---

## Contexte

Le projet mobile utilise `EXPO_PUBLIC_OPENROUTER_API_KEY` pour appeler directement l'API OpenRouter depuis le client. Cette clé est extractible par décompilation APK — c'est un risque de sécurité critique.

Le web a déjà un endpoint `/api/chat` qui proxifie les appels OpenRouter avec la clé côté serveur, rate limiting (30 req/h), guard IA (plan freemium), et tool calling.

## Description

1. **Backend** : Créer `/api/mobile/chat` — proxy IA avec auth JWT (reprend la logique de `/api/chat`)
2. **Mobile** : Refactorer `openrouter-client.ts` pour appeler `/api/mobile/chat` via le client API authentifié
3. **Mobile** : Supprimer `EXPO_PUBLIC_OPENROUTER_API_KEY` de `.env` et `.env.example`
4. **Mobile** : Refactorer tous les fichiers AI qui appellent OpenRouter directement

## Fichiers impactés

**Projet web (track-my-cash) :**
- `src/app/api/mobile/chat/route.ts` (NOUVEAU) — proxy IA avec JWT auth

**Projet mobile (track-my-cash-mobile) :**
- `src/lib/ai/openrouter-client.ts` — refactorer vers `/api/mobile/chat`
- `src/lib/ai/auto-categorize.ts` — utiliser le proxy
- `src/lib/ai/couple-advisor.ts` — utiliser le proxy
- `src/lib/ai/annual-report.ts` — utiliser le proxy
- `src/lib/ai/forecast-insights.ts` — utiliser le proxy (si existe)
- `.env.example` — supprimer `EXPO_PUBLIC_OPENROUTER_API_KEY`

## Acceptance Criteria

### AC-1 : Route `/api/mobile/chat` créée et fonctionnelle

```gherkin
Given la route /api/mobile/chat existe
When un POST est envoyé avec Authorization: Bearer <JWT> et { messages: [...] }
Then la réponse contient le texte généré par l'IA
And la clé OpenRouter est utilisée côté serveur uniquement
```

### AC-2 : Rate limiting et guard plan appliqués

```gherkin
Given un utilisateur free appelle /api/mobile/chat
When canUseAI(userId) retourne { allowed: false }
Then la réponse est 403 avec message explicatif

Given un utilisateur a dépassé 30 req/heure
When il appelle /api/mobile/chat
Then la réponse est 429 avec message "Limite atteinte"
```

### AC-3 : Le mobile n'appelle plus OpenRouter directement

```gherkin
Given le code mobile est refactoré
When je cherche "openrouter.ai" dans le code source mobile
Then aucune occurrence n'est trouvée
And EXPO_PUBLIC_OPENROUTER_API_KEY n'est plus dans .env
```

### AC-4 : Auto-catégorisation passe par le proxy

```gherkin
Given suggestCategory() est appelée sur mobile
When une transaction est à catégoriser
Then l'appel passe par /api/mobile/chat (pas OpenRouter direct)
```

### AC-5 : Conseiller couple et rapport annuel passent par le proxy

```gherkin
Given getCoupleAdvice() ou generateAnnualReport() est appelée
When l'IA génère la réponse
Then l'appel passe par /api/mobile/chat
```

### AC-6 : Tool calling fonctionne via le proxy

```gherkin
Given l'utilisateur demande au conseiller de créer un budget
When l'IA retourne un appel de tool createBudget
Then le tool est exécuté côté serveur
And le résultat est retourné au mobile
```

### AC-7 : CORS et OPTIONS handler présents

```gherkin
Given une requête OPTIONS est envoyée à /api/mobile/chat
Then la réponse contient les headers CORS
And le status est 204
```

## Spécifications de tests

### Tests unitaires

**Fichier backend :** `tests/unit/api-mobile-chat.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Route retourne 401 sans JWT | Status 401 |
| TU-2 | Route retourne 403 si plan free | Status 403 + message |
| TU-3 | Route retourne 429 si rate limited | Status 429 |
| TU-4 | Route proxifie vers OpenRouter avec la clé serveur | fetch appelé avec API_KEY_OPENROUTER |
| TU-5 | OPTIONS retourne les headers CORS | Headers CORS présents |

**Fichier mobile :** `tests/unit/ai-client.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-6 | sendChatMessage() appelle /api/mobile/chat | URL contient `/api/mobile/chat` |
| TU-7 | sendChatMessage() envoie le JWT | Header Authorization présent |
| TU-8 | suggestCategory() passe par le proxy | Pas d'appel direct OpenRouter |
| TU-9 | Pas de référence à EXPO_PUBLIC_OPENROUTER_API_KEY | Grep du code = 0 résultats |

### Mapping AC → Tests

| AC | Tests |
|----|-------|
| AC-1 | TU-4, TU-6, TU-7 |
| AC-2 | TU-2, TU-3 |
| AC-3 | TU-9 |
| AC-4 | TU-8 |
| AC-5 | TU-8 (étendu) |
| AC-6 | TU-4 |
| AC-7 | TU-5 |
