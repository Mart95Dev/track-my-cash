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

- `f664d8c` feat(sprint-qualite): 8 stories — corrections bugs et finitions
- `afb8c73` feat(phase-5): préparation déploiement Vercel
- `60288da` feat(phase-4): freemium guards selon le plan
- `e6cdb32` feat(phase-3): Stripe subscriptions
- `3b2a392` feat(phase-2.6): conseiller IA multi-modèles

## Décisions architecturales

| Décision | Choix | Raison |
|----------|-------|--------|
| Mutations | Server Actions | Simplicité, revalidatePath |
| ORM | Kysely | Type-safe, léger, compatible libsql |
| Auth | better-auth | Simple, flexible |
| Monétaire | Intl.NumberFormat + locale param | Dynamique selon la locale user |
| DB main | getDb() depuis @/lib/db | Singleton partagé, jamais createClient inline |
| Taux de change | getAllRates() + convertToReference() | Multi-devises, pas binaire EUR/MGA |
| Tags | table transaction_tags, batch query | Évite N+1, popover + filtre |

## Conventions

- Langue : **français** (UI + code commentaires)
- Pas de `any` TypeScript
- Couleurs unies (pas de dégradés)
- Commits : `feat/fix/chore(scope): description` (sans référence à Claude/AI)

## Sprint Qualité & Finitions — TERMINÉ + QA PASS (2026-02-21)

8 stories complétées, build TypeScript sans erreur (commit `f664d8c`).
QA automatisé : 64 tests, 5 fichiers, 86.84% lignes, 100% fonctions — PASS.

## Sprint Growth & Qualité — TERMINÉ + QA PASS (2026-02-21)

10/10 stories complétées, commit `f7af356`.
- Landing page marketing (Navbar, Footer, Landing, SEO/sitemap)
- Service email Nodemailer/Hostinger + email bienvenue + alerte solde bas
- Suppression compte RGPD (droit à l'oubli, best-effort)
- Tests parsers étendus : Banque Populaire, MCB CSV, Crédit Agricole
- Budgets par catégorie (table `budgets`, BudgetProgress, BudgetForm)
- Parser Crédit Agricole CSV enregistré dans registry.ts
QA : 156 tests, 0 fail, couverture 90.54% lignes, TypeScript 0 erreur.

**Test infrastructure :**
- Framework : Vitest v4.0.18 + happy-dom + @vitest/coverage-v8
- Config : `vitest.config.ts` — alias `@` → `src/`, coverage sur lib utilities purs
- Setup : `tests/setup.ts` (jest-dom)
- Scripts : `npm test` (run), `npm run test:coverage` (avec rapport)
- Pour mocker fetch dans les tests : `vi.stubGlobal("fetch", vi.fn())` + `vi.resetModules()`

**Patterns établis :**
- `formatCurrency(amount, currency, locale)` — 3 params, locale optionnel (défaut "fr")
- `formatDate(dateString, locale)` — locale optionnel (défaut "fr")
- Server Components : `const locale = await getLocale()` de next-intl/server
- Client Components : `const locale = useLocale()` de next-intl
- Ne jamais créer `createClient()` inline, toujours `getDb()` ou `getUserDb()`
- Dashboard : `getAllRates()` + `convertToReference()`, lire `reference_currency` en settings
- Tags transactions : `getTransactionTagsBatchAction(txIds)` pour batch (1 requête)

**Coverage QA — scope actuel :**
- `src/lib/format.ts` : 100% (formatCurrency, formatDate)
- `src/lib/currency.ts` : 84% (convertToReference, convertFromReference, getAllRates, getExchangeRate)
- Server actions et parsers : non testés (nécessitent mocks auth+db complexes — sprint suivant)
