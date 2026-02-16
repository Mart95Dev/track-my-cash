# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes

```bash
npm run dev      # Serveur de développement (http://localhost:3000)
npm run build    # Build production
npm run lint     # ESLint
```

## Architecture

App Next.js 16 (App Router) de gestion de comptes bancaires personnels. Pas d'authentification. Langue : français.

**Stack :** Next.js 16, React 19, better-sqlite3, shadcn/ui, Tailwind CSS v4, TypeScript.

### Couche données

- **SQLite** via better-sqlite3 — base stockée dans `data/finance.db` (gitignored)
- `src/lib/db.ts` — singleton de connexion + init du schéma (3 tables : `accounts`, `transactions`, `recurring_payments`)
- `src/lib/queries.ts` — toutes les requêtes SQL et types (Account, Transaction, RecurringPayment). Les fonctions sont synchrones (better-sqlite3 est synchrone)
- **Calcul de solde date-aware :** `solde_actuel = initial_balance + SUM(transactions WHERE date >= balance_date)`. Ne jamais écraser le solde directement
- **Détection de doublons :** les transactions importées ont un `import_hash` (MD5 de date+description+montant)

### Server Actions (pas d'API routes)

`src/app/actions/` — chaque fichier correspond à un domaine : `account-actions.ts`, `transaction-actions.ts`, `recurring-actions.ts`, `import-actions.ts`, `dashboard-actions.ts`. Toutes les mutations passent par des Server Actions avec `revalidatePath`.

### Parsers bancaires

`src/lib/parsers.ts` — 3 formats :
- **Banque Populaire** : CSV séparateur `;`, encodage ISO-8859-1, dates DD/MM/YYYY
- **MCB Madagascar** : CSV séparateur `,`, devise MGA, dates DD-MMM-YYYY, montants avec espaces milliers
- **Revolut** : Excel `.xlsx`, dates numériques Excel

Chaque parser retourne un `ParseResult` avec transactions + solde détecté.

### Pages

Routes françaises : `/`, `/comptes`, `/transactions`, `/recurrents`, `/previsions`, `/parametres`. Les pages sont des Server Components qui appellent directement les fonctions de `queries.ts`. Les interactions client sont isolées dans des composants `"use client"` dans `src/components/`.

### Config critique

`next.config.ts` doit inclure `serverExternalPackages: ["better-sqlite3"]` pour que le module natif fonctionne.

## Conventions

- Pas de type `any` en TypeScript
- Ne jamais référencer Claude/AI dans les messages de commit
- Couleurs unies uniquement (pas de dégradés) sauf demande explicite
- Formatage monétaire via `src/lib/format.ts` (Intl.NumberFormat fr-FR)
