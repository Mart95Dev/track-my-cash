# FORGE Memory — track-my-cash

**Initialisé :** 2026-02-21
**Dernière mise à jour :** 2026-03-08

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

## Sprint Design Stitch (v10) — PLANIFIÉ 📋 (2026-02-24)

11 stories (STORY-068 à STORY-078), 26 points. PRD v10 rédigé.
**Objectif :** Reskin complet des 14 pages selon maquettes Google Stitch.

**Design system :**
- Primary: #4848e5 | Background: #f6f6f8 | Card: #ffffff | Text: #0e0e1b | Muted: #505095
- Success: #078841 | Warning: #e7a008 | Danger: #e74008
- Font: Manrope (Google Fonts) | Icônes: Material Symbols Outlined
- Radius: 0.5/1/1.5/2rem | Shadow-soft: 0 4px 20px -2px rgba(0,0,0,0.05)

**Patterns clés maquettes :**
- Mobile-first : max-w-md mx-auto pb-24 (BottomNav)
- BottomNav : 5 onglets (Dashboard/Comptes/Transactions/Récurrents/Conseiller)
- Cards : bg-white rounded-2xl border border-gray-100 shadow-soft p-5
- Inputs : rounded-xl ring-1 ring-slate-200 py-4 pl-12 (icône Material Symbol gauche)
- KPI 3col : icône dans cercle coloré + label xs + montant bold
- Progress budgets : h-2 rounded-full, couleur dynamique (success/warning/danger)
- Health Score : SVG circle progress

**Contraintes :** Ne pas modifier Server Actions, queries.ts, db.ts, parsers, types.
Tests existants (495) doivent rester PASS.

**Ordre :** 068 (foundation) → 069 (layout+nav) → [070+071 auth+marketing] → 072 (dashboard) → [073-076 core app] → [077-078 IA+settings]

## Sprint Engagement & Analyse Avancée (v9) — TERMINÉ ✅ (2026-02-24)

7 stories, 17 points. PRD v9 rédigé.

- STORY-061 : Email récapitulatif hebdomadaire IA (cron lundi 8h, Pro/Premium)
- STORY-062 : Récurrents via tool calling chat IA (createRecurringSchema)
- STORY-063 : Vue agrégée "Tous les comptes" dans le dashboard
- STORY-064 : Comparaison YoY (computeYoYComparison + widget)
- STORY-065 : Export données personnelles RGPD (JSON complet)
- STORY-066 : Notes sur les transactions (migration + UI)
- STORY-067 : Parsers ING Direct + Boursorama (FR)

## Sprint Production SaaS & Croissance (v8) — EN COURS 🚧 (2026-02-22)

8 stories, 18 points. 3/8 complétées (8/18 pts), 392 tests, 0 échec.

- STORY-053 ✅ : Suivi IA — table `ai_usage` + `incrementAiUsage()` + décompte dans /parametres
- STORY-054 ✅ : Trial 14j — `createTrialSubscription()` + `<TrialBanner />` + cron `check-trials`
- STORY-055 ✅ : RGPD — `deletion_requests` + crons J+25 (rappel) + J+30 (suppression) + page `/compte-suspendu`
- STORY-056 ✅ : Skeletons — `loading.tsx` dashboard/transactions/comptes + `<SkeletonCard />`
- STORY-057 ✅ : Erreurs — `not-found.tsx` + `error.tsx` (boundary reset)
- STORY-058 ✅ : Parsers UK — `HsbcParser` + `MonzoParser` (registry)
- STORY-059 ✅ : IA parallèle — `ai-consensus.ts` + route consensus Premium (Promise.allSettled 3 modèles + Haiku JSON) + AiChat `isPremium` toggle + `<details>` accordéon sources
- STORY-060 ✅ : Freemium — `<PlanBanner />` (orangé trialing / bleu free / null pro+premium) + layout migration + tableau comparatif /tarifs 12 lignes + boutons Stripe

**Sprint v8 terminé — 8/8 stories, 18/18 pts, 429 tests, QA PASS.**

**Patterns Sprint v8 (STORY-059) :**
- `vi.hoisted()` pour pré-définir constantes dans `vi.mock()` factories (évite "Cannot access before init")
- Mock classe/constructeur : `vi.fn()` seul (sans `mockImplementation(() => ({}))`) pour que `new Class()` fonctionne
- `flatMap((s) => s.text !== null ? [s.text] : [])` → string[] bien typé sans predicate complexe
- Consensus route : `Promise.allSettled` + `generateText` × 3 + Haiku JSON, `NextResponse.json({ mode: "consensus", ... })`
- `<details>/<summary>` HTML natif pour accordéon (alternative à shadcn Accordion non installé)

## Sprint Intelligence & UX IA (v7) — TERMINÉ ✅ (2026-02-22)

6/6 stories, 15/15 points, 375 tests, QA PASS.

- STORY-047 : Score de santé financière — `computeHealthScore()` + `HealthScoreWidget`
- STORY-048 : Suggestions chat — `generateChatSuggestions()` + chips cliquables
- STORY-049 : Catégorisation auto import — setting `auto_categorize_on_import`
- STORY-050 : Tool calling — `createBudgetTool` + `createGoalTool` + `ToolResultCard`
- STORY-051 : Simulateur scénarios — `simulateScenario()` + UI ScenarioSimulator
- STORY-052 : Suggestions budgets — `suggestBudgets()` + page `/budgets` créée

**4 corrections post-sprint (2026-02-22) :**
1. **Fix 1** — Bug `getBudgetStatus()` : dates via SQL `CASE b.period` (yearly vs monthly)
2. **Fix 2** — Goals : `account_id` + `monthly_contribution` (migration + queries + GoalForm)
3. **Fix 3** — Vercel Cron : route `GET /api/cron/monthly-contributions` + `vercel.json` (`0 6 1 * *`)
4. **Fix 4** — Historique budgets : table `budget_history` + `snapshotBudgetHistory()` + `getBudgetHistory()` + `BudgetHistoryDialog`

**Patterns Sprint v7 :**
- Tool calling Vercel AI SDK : `import { tool } from "ai"` + `z.object()` schema + `execute()` async
- Tous les modules lib sont des **fonctions pures** (pas d'I/O) pour faciliter les tests unitaires
- Fire-and-forget pattern : `someAction().catch(() => {})` — ne jamais bloquer l'action principale
- Vercel Cron : `vercel.json` `"crons"` + route `GET` + `Authorization: Bearer CRON_SECRET`
- Boucle SaaS multi-user : `SELECT user_id FROM users_databases` (main DB) → `getUserDb(userId)` par user
- Mock server actions dans tests : `vi.mock("@/app/actions/xxx")` dans `tests/setup.ts` si l'import cause BetterAuth init

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

### Consolidation — 2026-03-10

**STORY-082**:
- 2026-02-24 17:32:29 [dev] — STORY-082 terminée : 9 tests, useUpgradeModal hook + UpgradeModal component + detectUpgradeReason — intégré import-button / account-form / ai-chat (canAI prop) — fix TS string|undefined import-button result.error ?? ''

**STORY-083**:
- 2026-02-24 17:37:50 [dev] — STORY-083 terminée : 9 tests, page /bienvenue Server Component + success_url checkout modifiée — plan depuis searchParams, features PLANS[planId], session optionnelle try/catch

**STORY-084**:
- 2026-02-24 17:42:15 [dev] — STORY-084 terminée : 6 tests, stripe-plans enrichi 5 features/plan, bullets inlinées dans tarifs/PlanCard + landing pricing — SPRINT v11 COMPLET 6/6 stories 564 tests

**STORY-149**:
- 2026-03-10 16:20:33 [dev] — STORY-149 terminée : 33 tests intégration (4 suites), couverture auth/2FA/CRUD/chat/RGPD. Sprint v18 complet : 11/11 stories, 1668 tests (baseline 1588)
