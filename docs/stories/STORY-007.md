# STORY-007 — Webhook Stripe : utiliser getDb()

**Epic :** Fonctionnalités incomplètes
**Priorité :** P1
**Complexité :** XS
**Statut :** pending

## User Story

En tant que développeur,
je veux que le webhook Stripe utilise getDb() comme partout ailleurs,
afin d'éviter la duplication de configuration et les incohérences.

## Critères d'acceptance

- [ ] `src/app/api/stripe/webhook/route.ts` utilise `getDb()` de `@/lib/db`
- [ ] Plus de `createClient({ url: ..., authToken: ... })` inline dans le webhook
- [ ] Le webhook continue de fonctionner correctement (checkout.session.completed, subscription.updated/deleted)

## Fichiers à modifier

- `src/app/api/stripe/webhook/route.ts` → remplacer le `createClient` inline par `import { getDb } from "@/lib/db"`

## Tests

- Le fichier webhook n'importe plus `createClient` de `@libsql/client`
- `getDb()` est bien appelé pour les opérations DB dans le webhook
