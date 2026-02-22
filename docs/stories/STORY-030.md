# STORY-030 — Rate limiting /api/chat

**Epic :** Technique
**Priorité :** P1
**Complexité :** S
**Statut :** pending
**Bloquée par :** ["STORY-029"]

## User Story

En tant qu'administrateur, je veux limiter le nombre de requêtes au conseiller IA par utilisateur afin d'éviter les abus et de maîtriser les coûts OpenRouter.

## Contexte technique

- `src/app/api/chat/route.ts` : route POST sans rate limiting actuellement
- `userId` disponible via `getRequiredUserId()` (l'utilisateur est toujours authentifié)
- Limite raisonnable : **30 requêtes par heure** par userId
- Implémentation in-memory (Map) suffisante — pas de Redis pour ce projet
- En production Vercel : les instances peuvent redémarrer → limite reset acceptée
- Réponse 429 avec message JSON en cas de dépassement

## Fichiers à créer / modifier

- `src/lib/rate-limiter.ts` — classe/fonction de rate limiting in-memory
- `src/app/api/chat/route.ts` — appel du rate limiter avant le traitement

## Interface

```typescript
// src/lib/rate-limiter.ts
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export function checkRateLimit(
  userId: string,
  limit: number,        // ex: 30
  windowMs: number      // ex: 60 * 60 * 1000 (1h)
): { allowed: boolean; remaining: number; resetAt: number }
```

## Acceptance Criteria

- AC-1 : 30 requêtes max par userId par heure
- AC-2 : Réponse 429 `{ error: "Limite atteinte. Réessayez dans X minutes." }` après dépassement
- AC-3 : Header `X-RateLimit-Remaining` dans la réponse
- AC-4 : Le compteur se réinitialise après 1h
- AC-5 : Un userId différent n'est pas affecté par les limites d'un autre

## Tests à créer

`tests/unit/lib/rate-limiter.test.ts` (5 tests) :
- TU-1-1 : Premier appel → `allowed: true`, `remaining: 29`
- TU-1-2 : Exactement 30 appels → dernier `allowed: true`
- TU-1-3 : 31ème appel → `allowed: false`
- TU-1-4 : userId différent → compteur indépendant, `allowed: true`
- TU-1-5 : Après expiration de la fenêtre (windowStart + windowMs) → `allowed: true`

## Estimation : 2 points / 1-2h

