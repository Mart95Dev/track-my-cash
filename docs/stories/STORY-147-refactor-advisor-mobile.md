# STORY-147 : Refactorer l'écran Conseiller IA mobile pour utiliser le proxy backend

**Sprint :** v18 — Parité Web/Mobile
**Priorité :** P1
**Complexité :** M (5 pts)
**Epic :** securite-parite
**Bloqué par :** STORY-140

---

## Contexte

Après la création de `/api/mobile/chat` (STORY-140), l'écran Advisor mobile et tous les composants AI doivent être refactorés pour utiliser le proxy backend au lieu d'appeler OpenRouter directement.

## Fichiers impactés

**Projet mobile (track-my-cash-mobile) :**
- `src/lib/ai/openrouter-client.ts` — refactorer en `api-chat-client.ts`
- `src/lib/ai/auto-categorize.ts` — utiliser le nouveau client
- `src/lib/ai/couple-advisor.ts` — utiliser le nouveau client
- `src/lib/ai/annual-report.ts` — utiliser le nouveau client
- `src/lib/ai/tools.ts` — adapter pour le flow proxy (tools exécutés côté serveur)
- `src/lib/ai/tool-executor.ts` — simplifier (tools exécutés côté serveur)
- `app/(tabs)/advisor.tsx` — utiliser le nouveau client
- `src/components/advisor/ChatMessage.tsx` — inchangé
- `src/components/advisor/ChatInput.tsx` — inchangé
- `src/components/advisor/ToolResultMessage.tsx` — adapter si format change

## Acceptance Criteria

### AC-1 : Le client AI appelle `/api/mobile/chat`

```gherkin
Given openrouter-client.ts est refactoré
When sendChatMessage() est appelée
Then la requête est envoyée à /api/mobile/chat via le client API authentifié
And aucun appel direct à openrouter.ai n'est fait
```

### AC-2 : Le conseiller IA fonctionne comme avant

```gherkin
Given l'utilisateur est sur l'onglet Conseiller
When il pose une question financière
Then il reçoit une réponse pertinente en français
And le rate limiting est appliqué (30 req/h)
And le guard plan est vérifié (free = pas d'accès)
```

### AC-3 : Les tools fonctionnent via le proxy

```gherkin
Given l'utilisateur demande "Crée-moi un budget alimentation de 300€"
When l'IA retourne un appel tool createBudget
Then le tool est exécuté côté serveur
And le résultat est affiché dans ToolResultMessage
```

### AC-4 : Auto-catégorisation passe par le proxy

```gherkin
Given une nouvelle transaction sans catégorie
When suggestCategory() est appelée
Then l'appel passe par /api/mobile/chat avec un prompt de catégorisation
And la catégorie suggérée est retournée
```

### AC-5 : Rapport annuel et couple advisor passent par le proxy

```gherkin
Given generateAnnualReport() ou getCoupleAdvice() est appelée
When le proxy est sollicité
Then la réponse est identique à l'ancien comportement
```

### AC-6 : Gestion d'erreur utilisateur-friendly

```gherkin
Given le backend retourne 403 (plan free)
When l'utilisateur essaie d'utiliser le conseiller
Then un message "Passez au plan Pro pour accéder au conseiller IA" est affiché
And un bouton "Voir les plans" est visible

Given le backend retourne 429 (rate limit)
When l'utilisateur envoie trop de messages
Then un message "Limite atteinte. Réessayez dans X minutes" est affiché
```

## Spécifications de tests

**Fichier :** `tests/unit/advisor-screen.test.tsx`

| ID | Test | Assertion |
|----|------|-----------|
| TU-1 | Advisor appelle /api/mobile/chat | URL contient /api/mobile/chat |
| TU-2 | JWT envoyé dans le header | Authorization: Bearer présent |
| TU-3 | Erreur 403 affiche message upgrade | Texte "plan Pro" visible |
| TU-4 | Erreur 429 affiche message rate limit | Texte "Limite atteinte" visible |
| TU-5 | suggestCategory() passe par le proxy | Pas d'appel openrouter.ai |
| TU-6 | Tool result affiché correctement | ToolResultMessage rendu |

**Fichier :** `tests/unit/api-chat-client.test.ts`

| ID | Test | Assertion |
|----|------|-----------|
| TU-7 | sendChatMessage envoie à /api/mobile/chat | URL vérifiée |
| TU-8 | Pas de référence openrouter.ai dans le fichier | Grep = 0 |
| TU-9 | Pas de EXPO_PUBLIC_OPENROUTER_API_KEY | Grep = 0 |

### Mapping AC → Tests

| AC | Tests |
|----|-------|
| AC-1 | TU-1, TU-7, TU-8, TU-9 |
| AC-2 | TU-1, TU-2 |
| AC-3 | TU-6 |
| AC-4 | TU-5 |
| AC-6 | TU-3, TU-4 |
