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

- `079dec6` feat(story-032): cache devises persisté en base de données
- `706988a` feat(story-031): tests server actions account + budget
- `7f63231` feat(story-029+030): rate limiting /api/chat 30 req/h
- `ea59753` feat(story-028): widget taux d'épargne dans MonthlySummary
- `6fbd6d5` feat(story-027): graphique tendances dépenses 6 mois
- `846d010` feat(story-026): récapitulatif email mensuel
- `c045d0a` feat(story-025,029): export CSV RFC 4180 + en-têtes sécurité HTTP

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

## Sprint Objectifs & Intelligence — TERMINÉ + QA PASS (2026-02-21)

6/6 stories complétées, 258 tests, 0 échec, TypeScript clean. QA PASS (commit `dc214d6`).

- STORY-033 : Objectifs d'épargne — table `goals`, page /objectifs, SavingsGoalsWidget dashboard
- STORY-034 : Catégorisation IA — autoCategorizeAction (OpenRouter gpt-4o-mini), AutoCategorizeButton
- STORY-035 : PWA installable — manifest.ts, icônes 192/512, PwaInstallBanner (beforeinstallprompt + iOS)
- STORY-036 : Rapport PDF mensuel — generateMonthlyReportAction (jspdf), MonthlyReportButton dans /parametres
- STORY-037 : Notifications in-app — table `notifications`, NotificationsBell (Popover + badge), layout.tsx
- STORY-038 : Prévisions IA — computeForecast() logique pure, ForecastTable, AIForecastInsights (3 insights via OpenRouter)

**Patterns nouveaux :**
- Freemium AI guard : `canUseAI(userId)` → `{ allowed, reason }`
- Navigation rightSlot : `<Navigation rightSlot={...} />` pour injecter contenu serveur dans header client
- vi.hoisted() pour mocks de classes dans Vitest (évite hoisting issues avec vi.fn() dans factory)
- Dynamic import jspdf/jspdf-autotable dans les Server Actions (évite erreur SSR)

## Sprint Rétention & Technique — TERMINÉ + QA PASS (2026-02-21)

8/8 stories complétées, 223 tests, 0 échec, TypeScript clean (commit `079dec6`).

**Sprint Rétention :**
- STORY-025 : Export CSV RFC 4180 — `src/lib/csv-export.ts`, BOM UTF-8, 8 colonnes
- STORY-026 : Email récapitulatif mensuel — `sendMonthlySummaryAction()`, template HTML, bouton dans /parametres
- STORY-027 : Graphique tendances dépenses — `SpendingTrendChart` (Recharts stacked), `getSpendingTrend()` dans queries
- STORY-028 : Widget taux d'épargne — `savingsRate` dans getMonthlySummary, `SavingsRateBadge` dans MonthlySummary

**Sprint Technique :**
- STORY-029 : En-têtes sécurité HTTP — `headers()` dans next.config.ts (X-Frame-Options, CSP, etc.)
- STORY-030 : Rate limiting /api/chat — `src/lib/rate-limiter.ts`, 30 req/h par userId, Map en mémoire
- STORY-031 : Tests server actions — account-actions (4 tests) + budget-actions (4 tests), vi.mock complet
- STORY-032 : Cache devises DB — fire-and-forget setSetting + fallback getSetting dans getAllRates()

**Coverage QA — scope actuel :**
- `src/lib/format.ts` : 100%
- `src/lib/currency.ts` : 100% (avec cache DB)
- `src/lib/rate-limiter.ts` : 100%
- `src/lib/csv-export.ts` : 100%
- Server actions account + budget : testés avec vi.mock
- 35 fichiers de test, 223 tests au total

### Consolidation — 2026-02-21

**STORY-038**:
- 2026-02-21 21:44:48 [qa] — QA PASS STORY-038 : computeForecast() 10 tests (5 gaps couverts), 258 tests total, sprint Objectifs & Intelligence certifié

## Sprint Intelligence & UX IA (v7) — EN COURS 🚧 (2026-02-22)

6 stories, 15 points, objectif ~35 tests.

- STORY-047 : Score de santé financière — `computeHealthScore(HealthScoreInput): HealthScore` (4 dimensions, 0-100) + `HealthScoreWidget`
- STORY-048 : Suggestions chat — `generateChatSuggestions(FinancialSummary): string[]` + chips cliquables
- STORY-049 : Catégorisation auto import — setting `auto_categorize_on_import` + fire-and-forget dans `confirmImportAction`
- STORY-050 : Tool calling — `createBudgetTool` + `createGoalTool` (Vercel AI SDK `tool()`, schemas Zod) + `ToolResultCard`
- STORY-051 : Simulateur scénarios — `simulateScenario(BaseForecast, Scenario): SimulationResult` + UI client-side useMemo
- STORY-052 : Suggestions budgets — `suggestBudgets(CategoryExpense[], existingBudgets): BudgetSuggestion[]`

**Patterns Sprint v7 :**
- Tool calling Vercel AI SDK : `import { tool } from "ai"` + `z.object()` schema + `execute()` async + `maxSteps: 3` dans streamText
- Tous les modules lib sont des **fonctions pures** (pas d'I/O) pour faciliter les tests unitaires
- Fire-and-forget pattern : `someAction().catch(() => {})` — ne jamais bloquer l'action principale

## Sprint Compatibilité, IA & Analyse Avancée (v6) — TERMINÉ ✅ (2026-02-22)

316 tests, 0 échec, TypeScript 0 erreur. Sprint 100% complété (8/8 stories, 22/22 points).

**Fichiers créés ce sprint :**
- `src/lib/parsers/bnp-paribas.ts`, `societe-generale.ts`, `caisse-epargne.ts` (STORY-039)
- `src/lib/parsers/n26.ts`, `wise.ts` (STORY-043)
- `src/lib/mom-calculator.ts` + `src/components/variation-badge.tsx` (STORY-041)
- `src/lib/recurring-detector.ts` + `src/components/recurring-suggestions.tsx` (STORY-042)
- `src/lib/anomaly-detector.ts` + `src/lib/anomaly-service.ts` (STORY-045)
- `src/lib/annual-report.ts` + `src/app/actions/annual-report-actions.ts` + `src/components/annual-report-button.tsx` (STORY-046)

**Architecture parsers (IMPORTANT) :**
- `BankParser` interface avec `parse(content: string | null, _buffer: Buffer | null): ParseResult` (2 params)
- Nouveaux parsers utilisent `export const parser = { ... } satisfies BankParser` (préserve le type retour concret)
- Registry order : mcbPdf, revolut, mcbCsv, n26, wise, caisseEpargne, societeGenerale, creditAgricole, bnp, banquePopulaire, **genericCsv (DERNIER — catch-all)**
- STORY-040 : `genericCsvParser` avec `detectHeaders()` + `parseWithMapping()` + `CsvMappingDialog` + `importWithMappingAction()` + mapping sauvegardé via `setSetting(db, "csv_mapping_[fingerprint]", JSON)`
- `detectAndParseFile()` retourne `ParseResult | GenericParseResult` — narrowing par `"needsMapping" in result`
- fixMojibake : NE PAS appliquer si le contenu est déjà UTF-8 valide (corrompt les chaînes)

**Patterns nouveaux :**
- `computeMoMVariation(current, previous)` → `MoMVariation { direction, percentChange }` (lib pure)
- `detectRecurringPatterns({ transactions, existingRecurrings })` → `RecurringSuggestion[]`
- `detectAnomalies(txs, avgByCategory, options)` → `Anomaly[]` (threshold=2.0, minAmount=50)
- Fire-and-forget anomalies dans `confirmImportAction` (comme `checkAndSendLowBalanceAlert`)
- Services fire-and-forget : créer dans `src/lib/xxx-service.ts`, appeler `.catch(() => {})` depuis server action
- `satisfies BankParser` plutôt que `: BankParser` pour préserver les types de retour concrets
