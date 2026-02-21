# FORGE Memory — track-my-cash

**Initialisé :** 2026-02-21
**Dernière mise à jour :** 2026-02-21

## Contexte projet

Application Next.js 16 de gestion de comptes bancaires personnels (track-my-cash).
SaaS freemium avec abonnements Stripe, conseiller IA multi-modèles, multi-devises.

## Stack technique

- **Framework :** Next.js 16 (App Router), React 19
- **UI :** shadcn/ui, Tailwind CSS v4
- **Base de données :** libsql (Turso/SQLite) via Kysely
- **Auth :** better-auth
- **Paiements :** Stripe (subscriptions freemium)
- **IA :** Vercel AI SDK (OpenAI)
- **i18n :** next-intl
- **Déploiement :** Vercel

## Architecture clé

- Toutes les mutations passent par des **Server Actions** (pas d'API routes)
- Formatage monétaire via `src/lib/format.ts`
- Parsers bancaires dans `src/lib/parsers.ts` (Banque Populaire, MCB Madagascar, Revolut)
- Calcul de solde date-aware : `solde = initial_balance + SUM(transactions WHERE date >= balance_date)`

## Commits récents

- `afb8c73` feat(phase-5): préparation déploiement Vercel
- `60288da` feat(phase-4): freemium guards selon le plan
- `e6cdb32` feat(phase-3): Stripe subscriptions
- `3b2a392` feat(phase-2.6): conseiller IA multi-modèles
- `3a8555e` feat(phase-2.5): multi-devises généralisé

## Décisions architecturales

| Décision | Choix | Raison |
|----------|-------|--------|
| Mutations | Server Actions | Simplicité, revalidatePath |
| ORM | Kysely | Type-safe, léger, compatible libsql |
| Auth | better-auth | Simple, flexible |
| Monétaire | Intl.NumberFormat fr-FR | Standard, multi-devises |

## Conventions

- Langue : **français** (UI + code commentaires)
- Pas de `any` TypeScript
- Couleurs unies (pas de dégradés)
- Commits : `feat/fix/chore(scope): description` (sans référence à Claude/AI)

## Stories actives

Aucune story en cours.

## Notes de session

_Les sessions FORGE seront loguées dans `.forge/memory/sessions/`_
