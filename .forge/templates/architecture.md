# Architecture technique — track-my-cash

**Version :** 1.0
**Date :** {{date}}

## Vue d'ensemble

```
┌─────────────────────────────────────────┐
│  Next.js 16 App Router                  │
│  ┌────────────┐  ┌──────────────────┐   │
│  │  Pages RSC │  │ Server Actions   │   │
│  └────────────┘  └────────┬─────────┘   │
│                           │             │
│  ┌────────────────────────▼──────────┐  │
│  │  Kysely + libsql (Turso/SQLite)   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, shadcn/ui, Tailwind CSS v4 |
| Base de données | libsql / Turso + Kysely |
| Auth | better-auth |
| Paiements | Stripe |
| IA | Vercel AI SDK (OpenAI) |
| i18n | next-intl |

## Structure des dossiers

```
src/
  app/          # Pages et layouts (App Router)
    actions/    # Server Actions
  components/   # Composants React (client)
  lib/          # Utilitaires et config
    db.ts       # Connexion base de données
    queries.ts  # Requêtes Kysely
    format.ts   # Formatage monétaire
  i18n/         # Traductions
```

## Décisions architecturales

### ADR-001 : Server Actions vs API Routes
**Décision :** Toutes les mutations passent par des Server Actions.
**Raison :** Simplicité, co-location avec les composants, revalidatePath intégré.

## Schéma de base de données

[À compléter par /forge-architect]

## Sécurité

- Authentification : better-auth (sessions)
- Variables d'environnement : .env.local (gitignored)
- Stripe : webhooks avec signature verification
