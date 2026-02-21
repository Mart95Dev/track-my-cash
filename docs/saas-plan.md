# Plan SaaS — Gestionnaire de Comptes Bancaires

> **Note :** Une copie de ce plan doit être créée dans le projet à `gestionnaire-comptes/docs/saas-plan.md` au démarrage de l'implémentation.

## Contexte

Transformer l'app personnelle (single-tenant, aucune auth) en SaaS multi-utilisateurs avec abonnements Stripe. La stack Next.js + Turso est déjà cloud-ready. Le travail principal : Auth + user_id + Stripe.

---

## État réel du projet (analyse 20 fév. 2026)

### Stack confirmée

| Brique | Réalité | Note |
|---|---|---|
| Framework | Next.js **16.1.6** | App Router ✅ |
| Base de données | **@libsql/client 0.17** (Turso) | ⚠️ CLAUDE.md dit "better-sqlite3" — obsolète |
| ORM | Aucun — SQL brut dans `queries.ts` | ✅ |
| UI | shadcn/ui + Tailwind CSS v4 | ✅ |
| IA | `@ai-sdk/openai ^3` via OpenRouter | Mono-modèle actuellement |
| Auth | ❌ Aucune | À implémenter (Phase 1) |
| i18n | ❌ Aucune | À implémenter (Phase 0.5) |
| Stripe | ❌ Aucun | À implémenter (Phase 3) |
| PDF parse | `pdftotext` CLI (poppler) | ⚠️ BLOQUE Vercel |

### Fichiers clés — état actuel

| Fichier | Lignes | État |
|---|---|---|
| `src/lib/db.ts` | 113 | Singleton `getDb()` — 8 tables + migrations inline |
| `src/lib/queries.ts` | ~950 | ~28 fonctions — toutes utilisent `getDb()` sans paramètre |
| `src/lib/parsers.ts` | 517 | 4 parsers + helpers — `pdftotext` CLI bloque Vercel |
| `src/lib/currency.ts` | 33 | EUR→MGA seulement, cache 1h |
| `src/app/actions/` | 9 fichiers | Aucun auth, aucun userId |
| `src/components/navigation.tsx` | 105 | Responsive, 7 routes — pas de déconnexion |
| `next.config.ts` | 6 | **Vide** — aucune config |

### Schéma DB actuel (8 tables)

```
accounts           — id, name, initial_balance, balance_date, currency, alert_threshold
transactions       — id, account_id, type, amount, date, category, subcategory, description, import_hash, reconciled
recurring_payments — id, account_id, name, type, amount, frequency, next_date, end_date, category, subcategory
categorization_rules — id, pattern, category, priority
settings           — key, value (key-value store)
tags               — id, name, color
transaction_tags   — transaction_id, tag_id
```

> **Pour la Phase 2 (multi-tenant) :** ce schéma complet sera repliqué dans chaque DB utilisateur (sans user_id — isolation physique garantit l'isolement).

### Parsers actuels (`src/lib/parsers.ts`)

| Parser | Fonction | Détection actuelle | Problème |
|---|---|---|---|
| Banque Populaire | `parseBanquePopulaire(content)` | `Solde` + `Date;Libell` | OK |
| MCB Madagascar CSV | `parseMCB(content)` | `Date de la transaction` | OK |
| Revolut | `parseRevolut(buffer)` | Headers billingues `Début`/`Started` | OK |
| MCB Madagascar PDF | `parseMCBPdf(buffer)` | `execFileSync(pdftotext ...)` | ❌ Incompatible Vercel |

Helpers existants à réutiliser : `fixMojibake()`, `parseAmount()`, `parseAmountMCB()`, `parseFRAmount()`, `parseDateFR()`, `parseCSVLine()`, `isPdfHeaderOrFooter()`, `detectAndParse()`

### IA actuelle (`src/app/api/chat/route.ts`)

Utilise `@ai-sdk/openai` avec un seul modèle via OpenRouter. La clé API est stockée dans `settings` (DB). **À refactoriser** en Phase IA pour passer en multi-modèles parallèles.

### Fichiers modifiés non commités (git)

| Fichier | Changement récent |
|---|---|
| `src/app/actions/import-actions.ts` | Amélioration catégorisation (applyRules) au moment de l'import |
| `src/components/import-button.tsx` | Dialog preview avec overrides catégorie/sous-catégorie par transaction |
| `src/lib/parsers.ts` | Fix MCB date DD-MM-YYYY (commit précédent) |

---

---

## Architecture SaaS cible

### Stack retenu

| Brique | Solution | Coût |
|---|---|---|
| App | Next.js 16 (déjà là) | 0€ |
| DB | Turso — **1 DB par utilisateur** | 0-25$/mois |
| Auth | **Better-Auth** + adapter Turso | 0€ |
| Paiements | **Stripe** | 1.5% + 0.25€/transaction |
| Hébergement | **Vercel** Pro | 20$/mois |
| Emails | **Resend** | 0€ (3000/mois gratuits) |
| IA | **Multi-modèles OpenRouter** (Claude + Gemini + DeepSeek) | ~0.004$/conversation |
| i18n | **next-intl** | 0€ |

### Pourquoi 1 DB par utilisateur (pas user_id partagé)

Turso est architecturé pour le multi-tenant DB-per-user. Pour des données financières :
- Isolation physique complète (pas de risque de fuite si query mal filtrée)
- Même coût : Turso Scaler ($25/mo) inclut 2500 DBs actives = 2500 users
- Turso crée la DB à l'inscription via leur API

---

## Grille tarifaire recommandée (marché international)

> **Analyse marché (fév. 2026) :** Bankin' 2,49€ · Linxo 4€ · Wallet 6,99€ · Bankin' Pro 8,33€. Un tarif Pro à 9€ se place dans le TOP 10% du marché FR — positionnement premium difficile à justifier sans DSP2 (agrégation bancaire directe). Pour un lancement international avec IA comme différenciateur principal, grille révisée :

| Tier | Prix | Fonctionnalités |
|---|---|---|
| **Gratuit** | 0€ | 1 compte, 3 mois d'historique, import CSV basique, sans IA |
| **Pro** | 4,90€/mois | Comptes illimités, historique illimité, 10 conv. IA/mois, multi-devises, export CSV/JSON |
| **Premium** | 7,90€/mois | Tout Pro + IA illimitée (consensus 3 modèles) + export PDF/Excel + support prioritaire |

**Pourquoi cette grille :**
- 4,90€ = sous Linxo (4€ annuel → ~4,80€ mensuel), psychologie du prix "moins de 5€"
- 7,90€ = sous Wallet (6,99€ + IA), différenciation claire par le conseiller multi-modèles
- 3 mois d'historique gratuit = standard marché, plus incitatif que 6 mois

**Projection corrigée :**

| Users | Payants (20%) | MRR (mix Pro/Premium) | Infra | Marge nette |
|---|---|---|---|---|
| 200 | 40 | ~196€ | ~30€ | ~166€ |
| 500 | 100 | ~490€ | ~60€ | ~430€ |
| 1 000 | 200 | ~980€ | ~85€ | ~895€ |
| 2 500 | 500 | ~2 450€ | ~115€ | ~2 335€ |

> **Note DSP2 (agrégation bancaire directe) :** Non prévu. Budget prohibitif pour un MVP (agrément AISP ~15 000€ + accès API banques). Différenciation par l'IA, l'import multi-formats et l'expérience UX.

---

## Coûts d'infrastructure par palier

| Users | Payants (20%) | MRR | Vercel | Turso | Total infra | Marge nette |
|---|---|---|---|---|---|---|
| 50 | 0 | 0€ | 0$ | 0$ | ~1€/an | négatif |
| 200 | 40 | 360€ | 20$ | 5$ | ~30€ | ~330€ |
| 500 | 100 | 900€ | 20$ | 25$ | ~60€ | ~840€ |
| 1000 | 200 | 1800€ | 20$ | 25$ | ~85€ | ~1715€ |
| 2500 | 500 | 4500€ | 20$ | 25$ | ~115€ | ~4385€ |

**Stripe fees :** 1.5% + 0.25€ par transaction (carte européenne via Stripe Radar)

---

## Coûts IA (conseiller financier)

- GPT-4o-mini : 0.15$/M input, 0.60$/M output
- Coût par conversation : ~0.001$ (moins d'1 centime)
- 30 conversations/mois par user Pro = **0.03$/mois en API**
- L'IA représente < 0.4% du revenu Pro — négligeable
- Limiter à 30-50 conv/mois pour éviter les abus

**Alternative moins chère :** Gemini Flash (2x moins cher que GPT-4o-mini)

---

## Phase 0.5 : Internationalisation — i18n (2-3 jours)

### Contexte

L'app est 100% française (hardcodée). ~200 chaînes UI réparties dans 48 composants + 7 pages. Zéro infrastructure i18n existante. Cible : **français, anglais, espagnol, italien, allemand** (5 langues).

### Bibliothèque retenue : **next-intl**

`next-intl` est le standard de facto pour Next.js App Router (support Server Components natif, middleware de détection, pas de client-side bundle lourd).

```bash
npm install next-intl
```

### Structure des fichiers

```
messages/
├── fr.json    — Français (langue par défaut)
├── en.json    — English
├── es.json    — Español
├── it.json    — Italiano
└── de.json    — Deutsch

src/i18n/
├── routing.ts        — locales + defaultLocale
└── request.ts        — config next-intl (messages path)

src/middleware.ts     — Fusionné avec le middleware auth (Phase 1)
```

### Structure URL avec préfixe de locale

```
/fr/          → Dashboard (français)
/en/          → Dashboard (English)
/es/          → Dashboard (Español)
/it/          → Dashboard (Italiano)
/de/          → Dashboard (Deutsch)
```

Les chemins des pages restent **identiques pour toutes les locales** (seul le préfixe change — ex: `/en/comptes` et `/fr/comptes`). Les routes marketing peuvent avoir des slugs traduits si nécessaire.

```typescript
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "es", "it", "de"],
  defaultLocale: "fr",
});
```

### Structure des clés de traduction (messages/fr.json)

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "accounts": "Comptes",
    "transactions": "Transactions",
    "recurring": "Récurrents",
    "forecasts": "Prévisions",
    "advisor": "Conseiller IA",
    "settings": "Paramètres"
  },
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "add": "Ajouter",
    "confirm": "Confirmer",
    "loading": "Chargement...",
    "error": "Une erreur est survenue"
  },
  "accounts": {
    "title": "Mes Comptes",
    "new": "Créer un nouveau compte",
    "name": "Nom du compte",
    "balance": "Solde initial",
    "balanceDate": "Date du solde",
    "currency": "Devise",
    "success": "Compte créé avec succès"
  },
  "transactions": { ... },
  "recurring": { ... },
  "forecasts": { ... },
  "import": {
    "button": "Importer CSV/Excel/PDF",
    "analyzing": "Analyse...",
    "preview": "Aperçu import",
    "detected": "transactions trouvées",
    "new": "nouvelles",
    "duplicates": "doublons ignorés",
    "unknownFormat": "Format non reconnu. Formats supportés : CSV, XLSX, PDF."
  },
  "settings": { ... },
  "advisor": { ... },
  "pricing": {
    "free": "Gratuit",
    "pro": "Pro",
    "premium": "Premium",
    "monthly": "/ mois",
    "upgrade": "Passer au plan {{plan}}"
  }
}
```

### Usage dans les composants

```typescript
// Server Component
import { getTranslations } from "next-intl/server";

export default async function AccountsPage() {
  const t = await getTranslations("accounts");
  return <h1>{t("title")}</h1>;
}

// Client Component
"use client";
import { useTranslations } from "next-intl";

export function AccountForm() {
  const t = useTranslations("accounts");
  return <label>{t("name")}</label>;
}
```

### Middleware i18n (fusionné avec auth en Phase 1)

```typescript
// src/middleware.ts — version finale (Phase 1 + Phase 0.5)
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// La locale est détectée via Accept-Language header
// Redirect automatique vers /fr/, /en/, etc.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

### Sélecteur de langue dans la Navigation

```typescript
// Composant LanguageSwitcher (shadcn DropdownMenu)
// Affiche le drapeau/code de la locale active
// useRouter() + usePathname() de next-intl pour switcher
const localeLabels = { fr: "🇫🇷 FR", en: "🇬🇧 EN", es: "🇪🇸 ES", it: "🇮🇹 IT", de: "🇩🇪 DE" };
```

### Adaptation de currencies.ts (multilingue)

Le fichier `src/lib/currencies.ts` (prévu en Phase 2.5) stocke les noms de devises en français. Avec i18n, les noms de devises sont gérés via les fichiers de traduction ou via l'API native `Intl.DisplayNames` :

```typescript
// Plus besoin d'un dictionnaire statique FR — utiliser Intl.DisplayNames
export function getCurrencyName(code: string, locale: string): string {
  return new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code;
}
// getCurrencyName("USD", "fr") → "dollar des États-Unis"
// getCurrencyName("USD", "en") → "US Dollar"
// getCurrencyName("USD", "de") → "US-Dollar"
```

**Avantage :** zéro maintenance, noms natifs corrects pour toutes les locales, ~160 devises couvertes automatiquement.

### ⚠️ Points critiques

- **Fichier `src/app/layout.tsx` :** `lang="fr"` → dynamique via locale : `lang={locale}`
- **Emails Resend :** les templates email (confirmation, réinitialisation) devront aussi être traduits (templates par locale dans `src/emails/`)
- **Pages marketing :** landing page + tarifs → traduites et potentiellement avec slugs localisés pour le SEO

### Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `messages/fr.json` | CRÉER — ~200 clés FR |
| `messages/en.json` | CRÉER — traduction anglaise |
| `messages/es.json` | CRÉER — traduction espagnole |
| `messages/it.json` | CRÉER — traduction italienne |
| `messages/de.json` | CRÉER — traduction allemande |
| `src/i18n/routing.ts` | CRÉER — config locales |
| `src/i18n/request.ts` | CRÉER — config next-intl |
| `src/app/[locale]/layout.tsx` | CRÉER — layout avec NextIntlClientProvider |
| `src/middleware.ts` | CRÉER — middleware i18n (fusionné Phase 1) |
| `src/components/language-switcher.tsx` | CRÉER — sélecteur langue |
| Tous les composants + pages | MODIFIER — remplacer strings FR par `t("clé")` |
| `src/lib/currencies.ts` | **SUPPRIMER** — remplacé par `Intl.DisplayNames` |

### Route groups avec locale

```
src/app/
└── [locale]/
    ├── layout.tsx           — NextIntlClientProvider + locale propagée
    ├── (app)/               — routes protégées (authentifiées)
    │   ├── layout.tsx
    │   ├── page.tsx         — Dashboard
    │   ├── comptes/
    │   ├── transactions/
    │   ├── recurrents/
    │   ├── previsions/
    │   ├── conseiller/
    │   └── parametres/
    ├── (auth)/              — connexion / inscription
    └── (marketing)/         — landing page + tarifs (publics)
```

---

## Phase 1 : Authentification (3-5 jours)

### Nouveaux fichiers à créer

```
src/lib/auth.ts                          — instance Better-Auth + adapter Turso
src/lib/auth-utils.ts                    — helper getRequiredUserId()
src/middleware.ts                        — protection des routes
src/app/api/auth/[...all]/route.ts       — handler Better-Auth
src/app/(auth)/layout.tsx                — layout centré sans Navigation
src/app/(auth)/connexion/page.tsx        — page connexion
src/app/(auth)/inscription/page.tsx      — page inscription
src/app/(app)/layout.tsx                 — layout app avec Navigation
src/app/(marketing)/layout.tsx           — layout marketing public
src/app/(marketing)/page.tsx             — landing page
src/app/(marketing)/tarifs/page.tsx      — page pricing
```

### Fichiers à modifier

- `src/app/layout.tsx` — retirer la Navigation (gérée par route groups)

### Helper central (pattern à utiliser partout)

```typescript
// src/lib/auth-utils.ts
export async function getRequiredUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/connexion");
  return session.user.id;
}
```

### Middleware

```typescript
// src/middleware.ts
// Chemins publics : /, /connexion, /inscription, /tarifs, /api/auth/*
// Tout le reste → redirect /connexion si pas de session
```

---

## Phase 2 : Multi-tenant avec 1 DB par user (4-6 jours)

### Changement d'architecture DB

Au lieu d'une seule DB partagée avec `user_id` partout, chaque user a sa propre base Turso.

**Provisioning à l'inscription :**
```typescript
// src/lib/turso-manager.ts (nouveau)
import { createClient } from "@libsql/client";

export async function createUserDatabase(userId: string): Promise<string> {
  // Appel API Turso pour créer une nouvelle DB
  const response = await fetch("https://api.turso.tech/v1/organizations/[org]/databases", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.TURSO_API_TOKEN}` },
    body: JSON.stringify({ name: `user-${userId}`, group: "default" }),
  });
  const { database } = await response.json();
  // Stocker l'URL de la DB dans la DB principale (auth DB)
  return database.hostname;
}

export function getUserDbClient(dbHostname: string) {
  return createClient({
    url: `libsql://${dbHostname}`,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}
```

**DB principale (auth + métadonnées users) :** Table `users_databases`
```sql
CREATE TABLE users_databases (
  user_id TEXT PRIMARY KEY,
  db_hostname TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

**DB par user :** Contient `accounts`, `transactions`, `recurring_payments`, etc. — **schéma identique à l'actuel mais sans user_id** (isolation physique = plus besoin)

### Adaptation de db.ts

```typescript
// src/lib/db.ts — refactoring
// Plus de singleton global. Chaque requête reçoit le client de l'user.
export async function getUserDb(userId: string) {
  const mainDb = getMainDb(); // DB principale (auth + user_databases)
  const result = await mainDb.execute({
    sql: "SELECT db_hostname FROM users_databases WHERE user_id = ?",
    args: [userId],
  });
  const hostname = result.rows[0]?.db_hostname as string;
  return getUserDbClient(hostname);
}
```

### Adaptation des Server Actions (pattern uniforme)

```typescript
// Avant
export async function getAccountsAction() {
  return getAllAccounts();
}

// Après
export async function getAccountsAction() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getAllAccounts(db);  // queries.ts reçoit le client en param
}
```

### Adaptation de queries.ts

**~28 fonctions confirmées** toutes à modifier. Elles utilisent toutes `getDb()` (singleton global) à remplacer par le paramètre `db` reçu en argument :

```typescript
// Avant (toutes les fonctions actuelles)
export async function getAllAccounts(): Promise<Account[]> {
  const db = getDb();   // ← singleton global à supprimer
  ...
}

// Après
export async function getAllAccounts(db: Client): Promise<Account[]> {
  // db est passé depuis la Server Action
  ...
}
```

**Fonctions à modifier (liste exhaustive de queries.ts) :**
- `getAllAccounts`, `getAccountById`, `createAccount`, `deleteAccount`, `updateAccount`, `getCalculatedBalance`
- `getTransactions`, `searchTransactions`, `createTransaction`, `deleteTransaction`, `updateTransaction`, `generateImportHash`, `checkDuplicates`, `bulkInsertTransactions`
- `getMonthlyBalanceHistory`, `getMonthlySummary`, `getExpensesByCategory`, `getExpensesByBroadCategory`
- `getRecurringPayments`, `createRecurringPayment`, `deleteRecurringPayment`, `updateRecurringPayment`, `generateForecast`
- `getCategorizationRules`, `createCategorizationRule`, `deleteCategorizationRule`
- `getSetting`, `setSetting`
- `getTags`, `createTag`, `deleteTag`, `getTransactionTags`, `addTagToTransaction`, `removeTagFromTransaction`

### ⚠️ Pièges critiques à traiter
- `applyRules()` dans `import-actions.ts` — appelle `getCategorizationRules()` → doit recevoir `db`
- `bulkInsertTransactions()` dans `import-actions.ts` — doit passer le bon client DB user
- `exportAllData()` dans `export-import-buttons` — export complet de la DB user uniquement
- Schéma DB user (8 tables) identique à l'actuel mais **sans user_id** (isolation physique garantit l'isolement)
- `bulkInsertTransactions()` — le batch doit passer par le bon client DB

---

## Phase 2.3 : Architecture d'import extensible (3-4 jours)

### État actuel de parsers.ts (517 lignes)

Le fichier existe et contient déjà toutes les fonctions — c'est un **refactoring** (pas une réécriture complète) :

| Problème | Impact |
|---|---|
| `detectAndParse()` = gros `if/else` sur des chaînes | Fragile, impossible à étendre sans toucher au fichier core |
| `parseMCBPdf()` utilise `execFileSync(pdftotext ...)` | **Bloque le déploiement sur Vercel** — outil système inexistant en serverless |
| Toute la logique dans un seul fichier de 517 lignes | Impossible d'ajouter une banque sans risquer de casser les autres |
| Pas de fallback pour formats inconnus | L'utilisateur obtient une erreur opaque |

**Helpers déjà présents à migrer dans `utils.ts` :** `fixMojibake()`, `parseAmount()`, `parseAmountMCB()`, `parseFRAmount()`, `parseDateFR()`, `parseCSVLine()`, `isPdfHeaderOrFooter()`

**Logique déjà existante à préserver et migrer :**
- `parseBanquePopulaire()` → `BanquePopulaireParser.parse()`
- `parseMCB()` → `MCBCsvParser.parse()`
- `parseRevolut()` → `RevolutParser.parse()`
- `parseMCBPdf()` → `MCBPdfParser.parse()` (remplace `execFileSync` par `pdf-parse`)

### Architecture cible : Registre de parsers (Strategy pattern)

```
Fichier uploadé
      ↓
  Détection format brut (extension + encodage)
      ↓
  ParserRegistry.detect(file) → score de confiance par parser
      ↓
  Parser gagnant (score le plus élevé)
      ↓
  ParseResult → preview → import
      ↓ (si aucun parser ≥ 0.5)
  GenericCsvParser → mapping colonnes manuel par l'utilisateur
```

### Nouvelle structure des fichiers

```
src/lib/parsers/
├── types.ts              — interfaces BankParser + ParseResult + ParsedTransaction
├── registry.ts           — ParserRegistry (register, detect, parse)
├── utils.ts              — fonctions partagées (parseAmount, parseDate, fixMojibake, parseCSVLine)
├── index.ts              — export public + registre pré-chargé avec tous les parsers
├── banque-populaire.ts   — BanquePopulaireParser
├── mcb-csv.ts            — MCBCsvParser
├── mcb-pdf.ts            — MCBPdfParser (pdf-parse, plus de pdftotext)
├── revolut.ts            — RevolutParser
└── generic-csv.ts        — GenericCsvParser (fallback colonnes configurables)
```

**Ajouter une nouvelle banque à l'avenir = créer 1 fichier + 1 ligne dans index.ts. Rien d'autre.**

### Interface standard `BankParser`

```typescript
// src/lib/parsers/types.ts

export interface ParsedTransaction {
  date: string;         // YYYY-MM-DD
  description: string;
  amount: number;       // toujours positif
  type: "income" | "expense";
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  detectedBalance: number | null;
  detectedBalanceDate: string | null;
  bankName: string;
  currency: string;
}

export type FileFormat = "csv" | "xlsx" | "pdf";

export interface ParseInput {
  filename: string;
  format: FileFormat;
  content: string;    // texte décodé pour CSV
  buffer: Buffer;     // binaire pour XLSX et PDF
}

export interface BankParser {
  id: string;           // ex: "banque-populaire"
  name: string;         // ex: "Banque Populaire"
  supportedFormats: FileFormat[];

  // Retourne un score 0-1. 0 = incompatible, 1 = certitude absolue.
  detect(input: ParseInput): number;

  // Parse et retourne les transactions.
  parse(input: ParseInput): ParseResult;
}
```

### Registre de parsers

```typescript
// src/lib/parsers/registry.ts

export class ParserRegistry {
  private parsers: BankParser[] = [];

  register(parser: BankParser): void {
    this.parsers.push(parser);
  }

  // Retourne le parser le plus confiant (score > 0.3), ou null
  findParser(input: ParseInput): BankParser | null {
    let best: BankParser | null = null;
    let bestScore = 0.3; // seuil minimum

    for (const parser of this.parsers) {
      if (!parser.supportedFormats.includes(input.format)) continue;
      const score = parser.detect(input);
      if (score > bestScore) {
        best = parser;
        bestScore = score;
      }
    }
    return best;
  }

  // Liste tous les parsers supportant un format donné (pour l'UI)
  listParsers(format?: FileFormat): BankParser[] {
    if (!format) return this.parsers;
    return this.parsers.filter((p) => p.supportedFormats.includes(format));
  }
}
```

### Exemple : parser Banque Populaire refactorisé

```typescript
// src/lib/parsers/banque-populaire.ts

export class BanquePopulaireParser implements BankParser {
  id = "banque-populaire";
  name = "Banque Populaire / Banque Postale";
  supportedFormats: FileFormat[] = ["csv"];

  detect({ format, content }: ParseInput): number {
    if (format !== "csv") return 0;
    if (content.includes("Montant(EUROS)")) return 0.95;
    if (content.includes("Solde (EUROS)")) return 0.95;
    if (content.match(/^Date;Libell/im)) return 0.85;
    if (content.includes(";") && content.includes("Solde")) return 0.4;
    return 0;
  }

  parse({ content }: ParseInput): ParseResult {
    // ... logique existante extraite de parseBanquePopulaire()
  }
}
```

### Exemple : parser générique CSV (fallback)

```typescript
// src/lib/parsers/generic-csv.ts

export class GenericCsvParser implements BankParser {
  id = "generic-csv";
  name = "CSV générique";
  supportedFormats: FileFormat[] = ["csv"];

  // Détecte n'importe quel CSV — score bas pour laisser la priorité aux parsers spécialisés
  detect({ format }: ParseInput): number {
    return format === "csv" ? 0.1 : 0;
  }

  // Le mapping de colonnes est fourni en paramètre (configuré par l'utilisateur)
  parse({ content }: ParseInput, mapping?: ColumnMapping): ParseResult {
    // Si pas de mapping → retourne les headers pour que l'UI propose le mapping
    if (!mapping) return { transactions: [], needsMapping: true, headers: detectHeaders(content) };
    // Sinon → parse avec les colonnes configurées
    // ...
  }
}

// L'UI affiche ce dialog si needsMapping = true :
// "Quelle colonne contient la date ? Le montant ? La description ?"
```

### Remplacement de pdftotext → pdf-parse

`pdftotext` est un outil CLI système (poppler). **Impossible sur Vercel**. Remplacement par `pdf-parse` (npm, pure JS) :

```bash
npm install pdf-parse
npm install -D @types/pdf-parse
```

```typescript
// src/lib/parsers/mcb-pdf.ts

import pdfParse from "pdf-parse";

export class MCBPdfParser implements BankParser {
  id = "mcb-pdf";
  name = "MCB Madagascar (PDF)";
  supportedFormats: FileFormat[] = ["pdf"];

  detect({ format, buffer }: ParseInput): number {
    if (format !== "pdf") return 0;
    // pdf-parse extrait un peu de texte pour la détection
    // On détecte via le nom du fichier ou les premiers bytes
    return 0.7; // PDF = probablement MCB (seul parser PDF)
  }

  async parse({ buffer }: ParseInput): Promise<ParseResult> {
    const data = await pdfParse(buffer);
    const text = data.text;
    return parseMCBPdfText(text); // réutilise la logique existante
  }
}
```

**Note :** `pdf-parse` est moins précis que `pdftotext -layout` pour les tableaux complexes. Si la précision est insuffisante, alternative : **`pdfjs-dist`** (Mozilla, plus robuste mais plus lourd ~2MB).

### Mise à jour import-actions.ts

```typescript
// src/app/actions/import-actions.ts — après refactoring

import { parserRegistry } from "@/lib/parsers"; // registre pré-chargé

export async function importFileAction(formData: FormData) {
  const file = formData.get("file") as File;
  const accountId = parseInt(formData.get("accountId") as string);

  const filename = file.name.toLowerCase();
  const format: FileFormat = filename.endsWith(".pdf") ? "pdf"
    : filename.endsWith(".xlsx") ? "xlsx"
    : "csv";

  const buffer = Buffer.from(await file.arrayBuffer());
  const content = format === "csv"
    ? decodeContent(buffer)  // gère UTF-8 / ISO-8859-1
    : "";

  const input: ParseInput = { filename, format, content, buffer };

  // Trouver le meilleur parser
  const parser = parserRegistry.findParser(input);

  if (!parser) {
    // Aucun parser reconnu → retourner les infos pour le mapping manuel
    if (format === "csv") {
      const genericParser = parserRegistry.getById("generic-csv");
      const result = genericParser.parse(input); // sans mapping → retourne headers
      return { needsMapping: true, headers: result.headers };
    }
    return { error: "Format non reconnu. Formats supportés : CSV (Banque Populaire, MCB), XLSX (Revolut), PDF (MCB)." };
  }

  const parseResult = await parser.parse(input);
  // ... reste identique à aujourd'hui
}
```

### UI : mapping manuel pour CSV inconnu

Si `needsMapping: true` est retourné, afficher un dialog :

```
Format CSV non reconnu automatiquement.

Colonnes détectées : Date | Libellé | Débit | Crédit | Solde

[ Colonne DATE    ] → [Date      ▼]
[ Colonne MONTANT ] → [Débit     ▼]  Type: [Dépense ▼]
[ Colonne LIBELLÉ ] → [Libellé   ▼]
[ Séparateur      ] → [;    ▼]
[ Format de date  ] → [DD/MM/YYYY ▼]

[Mémoriser pour cette banque] [Importer]
```

Le mapping peut être sauvegardé dans `user_settings` pour ne pas avoir à le reconfigurer à chaque fois.

### Parsers V1 (existants — à refactoriser)

| Parser | Formats | Détection |
|---|---|---|
| `BanquePopulaireParser` | CSV | `Montant(EUROS)`, `Date;Libell`, `Solde (EUROS)` |
| `MCBCsvParser` | CSV | `Date de la transaction`, `Devise du compte MGA` |
| `RevolutParser` | XLSX | Headers `Début`/`Started`, `Montant`/`Amount` |
| `MCBPdfParser` | PDF | Seul parser PDF = score 0.7 par défaut |
| `GenericCsvParser` | CSV | Score 0.1 — fallback avec mapping manuel |

### Formats bancaires internationaux (roadmap parsers V2)

L'app étant internationale (FR, EN, ES, IT, DE), les exports bancaires varient selon les pays. Chaque banque a ses propres colonnes, séparateurs, formats de date et d'encodage.

**Formats CSV courants par zone géographique :**

| Pays | Banque | Séparateur | Date | Encodage | Signal de détection |
|---|---|---|---|---|---|
| 🇫🇷 France | Banque Postale | `;` | DD/MM/YYYY | ISO-8859-1 | `Montant(EUROS)` |
| 🇫🇷 France | BNP Paribas | `;` | DD/MM/YYYY | UTF-8 | `Référence;Libellé;Montant` |
| 🇫🇷 France | Société Générale | `;` | DD/MM/YYYY | UTF-8 | `Date;Libellé;Débit;Crédit` |
| 🇫🇷 France | Crédit Agricole | `;` | DD/MM/YYYY | ISO-8859-1 | `dateOp;libelle;debit;credit` |
| 🇬🇧 UK | HSBC | `,` | DD/MM/YYYY | UTF-8 | `Date,Description,Amount` |
| 🇬🇧 UK | Barclays | `,` | DD/MM/YYYY | UTF-8 | `Number,Date,Account,Amount,Subcategory` |
| 🇬🇧 UK | Monzo | `,` | YYYY-MM-DD | UTF-8 | `Transaction ID,Date,Time,Type` |
| 🇩🇪 Allemagne | N26 | `,` | YYYY-MM-DD | UTF-8 | `Date,Payee,Account number,Transaction type,Payment reference,Amount (EUR)` |
| 🇩🇪 Allemagne | Sparkasse | `;` | DD.MM.YYYY | ISO-8859-1 | `Buchungstag;Valutadatum;Auftraggeber/Beguenstigter` |
| 🇪🇸 Espagne | BBVA | `;` | DD/MM/YYYY | UTF-8 | `Fecha;Concepto;Importe;Divisa;Disponible` |
| 🇪🇸 Espagne | Santander | `;` | DD/MM/YYYY | ISO-8859-1 | `Fecha;Concepto;Importe` |
| 🇮🇹 Italie | Fineco | `;` | DD/MM/YYYY | UTF-8 | `Data;Entrate;Uscite;Descrizione` |
| 🌍 International | Wise | `,` | YYYY-MM-DD | UTF-8 | `TransferWise ID,Date,Amount,Currency,Description` |
| 🌍 International | Revolut | XLSX | — | — | Headers `Started Date`, `Amount`, `Currency` |

**Stratégie d'implémentation internationale :**

1. **Détection robuste** : Le `GenericCsvParser` avec mapping manuel couvre en dernier recours n'importe quelle banque inconnue
2. **Parsers prioritaires V2** (après lancement) : Crédit Agricole, BNP Paribas, N26, Wise, HSBC — les 5 plus demandés selon la base users
3. **Collecte de données** : Créer une section dans les paramètres "Proposer votre format de banque" avec upload d'un exemple anonymisé → permet de prioriser les développements
4. **`Intl.DateTimeFormat`** : Utiliser l'API native pour parser les dates selon la locale, pas des regex hardcodées

```typescript
// Exemple : Sparkasse (Allemagne) — DD.MM.YYYY → YYYY-MM-DD
function parseGermanDate(str: string): string {
  const [day, month, year] = str.split(".");
  return `${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}`;
}

// Exemple : N26 — YYYY-MM-DD (déjà ISO, rien à faire)
// Exemple : BBVA — DD/MM/YYYY
function parseSpanishDate(str: string): string {
  const [day, month, year] = str.split("/");
  return `${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}`;
}
```

5. **Détection d'encodage** : La fonction `fixMojibake()` de `utils.ts` doit supporter ISO-8859-1 ET Windows-1252 (encodage Sparkasse, Crédit Agricole)

### Ajouter une banque à l'avenir (procédure)

```typescript
// 1. Créer src/lib/parsers/bnp-paribas.ts
export class BNPParser implements BankParser {
  id = "bnp-paribas";
  name = "BNP Paribas";
  supportedFormats = ["csv"] as const;
  detect({ content, format }) {
    if (format !== "csv") return 0;
    if (content.includes("BNP PARIBAS")) return 0.95;
    return 0;
  }
  parse({ content }) { /* ... */ }
}

// 2. Ajouter dans src/lib/parsers/index.ts
registry.register(new BNPParser());
// C'est tout. Rien d'autre à toucher.
```

### Variables d'environnement — aucun changement

Pas de nouvelle clé API. `pdf-parse` est une lib npm, pas un service externe.

### Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `src/lib/parsers/types.ts` | CRÉER — interfaces |
| `src/lib/parsers/registry.ts` | CRÉER — ParserRegistry |
| `src/lib/parsers/utils.ts` | CRÉER — fonctions utilitaires extraites de parsers.ts |
| `src/lib/parsers/banque-populaire.ts` | CRÉER — BanquePopulaireParser |
| `src/lib/parsers/mcb-csv.ts` | CRÉER — MCBCsvParser |
| `src/lib/parsers/mcb-pdf.ts` | CRÉER — MCBPdfParser (pdf-parse) |
| `src/lib/parsers/revolut.ts` | CRÉER — RevolutParser |
| `src/lib/parsers/generic-csv.ts` | CRÉER — GenericCsvParser |
| `src/lib/parsers/index.ts` | CRÉER — registre + exports |
| `src/lib/parsers.ts` | SUPPRIMER (remplacé par le dossier) |
| `src/app/actions/import-actions.ts` | MODIFIER — utiliser parserRegistry |
| `src/components/import-button.tsx` | MODIFIER — gérer `needsMapping` |

---

## Phase 2.5 : Multi-devises généralisé (2-3 jours)

### Contexte

L'API `open.er-api.com` déjà en place retourne **~160 devises** en une seule requête (`/v6/latest/EUR`). Le code actuel ne lit que `data.rates.MGA`. La colonne `currency TEXT` dans `accounts` est déjà flexible. `formatCurrency(amount, currency)` accepte n'importe quelle devise ISO. Le travail est donc : élargir le système sans changer d'API.

### Concept clé : devise de référence

Chaque utilisateur choisit une **devise de référence** (ex: EUR, USD, GBP…) stockée dans `user_settings`. Le dashboard affiche les totaux convertis dans cette devise. Chaque compte garde sa propre devise native.

```
Compte A (USD 1000) ─┐
Compte B (GBP 500)  ──→ Conversion vers EUR (référence) → Total : 1 823 EUR
Compte C (MGA 2M)  ─┘
```

### Fichiers à modifier

#### `src/lib/currency.ts` — refactoring complet
```typescript
// Nouveau : cache de TOUS les taux (pas juste MGA)
let cachedRates: { rates: Record<string, number>; fetchedAt: number } | null = null;

// Fetch une fois, retourne tous les taux
export async function getAllRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cachedRates.fetchedAt < CACHE_DURATION) {
    return cachedRates.rates;
  }
  const res = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: 3600 } });
  const data = await res.json();
  cachedRates = { rates: data.rates, fetchedAt: Date.now() };
  return data.rates;
}

// Convertit n'importe quelle devise vers la devise de référence
export function convertToReference(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  // Pivot EUR : fromCurrency → EUR → toCurrency
  const inEUR = fromCurrency === "EUR" ? amount : amount / (rates[fromCurrency] ?? 1);
  return toCurrency === "EUR" ? inEUR : inEUR * (rates[toCurrency] ?? 1);
}

// Retourne la liste triée des devises disponibles
export function getAvailableCurrencies(rates: Record<string, number>): string[] {
  return Object.keys(rates).sort();
}
```

#### `src/lib/currencies.ts` — NOUVEAU fichier : noms complets des devises
```typescript
// Dictionnaire statique des noms de devises (ISO 4217)
// Pour afficher "EUR — Euro" dans le sélecteur
export const CURRENCY_NAMES: Record<string, string> = {
  EUR: "Euro",
  USD: "Dollar américain",
  GBP: "Livre sterling",
  MGA: "Ariary malgache",
  CHF: "Franc suisse",
  JPY: "Yen japonais",
  CAD: "Dollar canadien",
  AUD: "Dollar australien",
  MAD: "Dirham marocain",
  XOF: "Franc CFA Ouest",
  XAF: "Franc CFA Centre",
  // ... ~50 devises principales avec noms en français
};
```

#### `src/components/account-form.tsx` et `edit-account-dialog.tsx`
- Remplacer le `<select>` avec seulement EUR/MGA
- Par un **Combobox shadcn/ui** (recherchable) avec les ~160 devises
- Format affiché : `EUR — Euro`

```typescript
// Combobox avec recherche (shadcn Command)
<CurrencySelector
  value={currency}
  onChange={setCurrency}
  rates={rates}  // passé en prop depuis le Server Component parent
/>
```

#### `src/app/page.tsx` — dashboard, généraliser la conversion
```typescript
// Avant (hardcodé EUR/MGA)
const total = accounts.reduce((sum, account) => {
  return sum + (account.currency === "MGA" ? balance / exchangeRate : balance);
}, 0);

// Après (toutes devises)
const total = accounts.reduce((sum, account) => {
  const balance = account.calculated_balance ?? account.initial_balance;
  return sum + convertToReference(balance, account.currency, referenceCurrency, rates);
}, 0);
```

#### `src/components/currency-settings.tsx` — redesign complet
- Supprimer le widget EUR/MGA spécifique
- Ajouter : sélecteur de **devise de référence** (Combobox)
- Afficher les taux des devises utilisées par l'utilisateur (dynamique)
- Supprimer le champ "taux de secours manuel" (l'API est fiable)

#### `src/app/parametres/page.tsx`
- Supprimer l'appel `getSetting("exchange_rate_eur_mga")`
- Ajouter l'appel `getSetting("reference_currency")` → défaut "EUR"
- Passer `rates` (tous les taux) et `referenceCurrency` au composant

#### `src/app/actions/settings-actions.ts`
- Supprimer `saveExchangeRateAction`
- Ajouter `saveReferenceCurrencyAction(currency: string)` qui sauvegarde `reference_currency` dans `user_settings`

### Stockage en DB (user_settings)

```
key: "reference_currency"    value: "EUR"   (ou "USD", "GBP", etc.)
```
La clé `exchange_rate_eur_mga` devient obsolète et peut être ignorée.

### Parseurs bancaires — aucun changement

| Parser | Devise retournée | Action |
|---|---|---|
| Banque Populaire | EUR (fixe) | Inchangé |
| MCB Madagascar | MGA (fixe) | Inchangé |
| Revolut | Extraite du fichier | Déjà multi-devises |

### ⚠️ Point attention : MGA dans l'API

`open.er-api.com` supporte MGA. Tester que `data.rates.MGA` est bien présent au déploiement. Si l'API retire MGA, fallback vers la valeur précédemment stockée ou `5000` par défaut.

### Nouveau fichier à créer

```
src/lib/currencies.ts          — noms FR des ~160 devises ISO 4217
src/components/currency-selector.tsx  — Combobox shadcn recherchable
```

### Fichiers à modifier

| Fichier | Changement |
|---|---|
| `src/lib/currency.ts` | Refactoring : `getAllRates()`, `convertToReference()`, `getAvailableCurrencies()` |
| `src/app/page.tsx` | Conversion générique (toutes devises → référence) |
| `src/app/parametres/page.tsx` | Sélecteur devise de référence |
| `src/components/currency-settings.tsx` | Redesign complet |
| `src/components/account-form.tsx` | CurrencySelector (Combobox) |
| `src/components/edit-account-dialog.tsx` | CurrencySelector (Combobox) |
| `src/app/actions/settings-actions.ts` | `saveReferenceCurrencyAction` |

---

## Phase 2.6 : IA Multi-modèles (1-2 jours)

### État actuel

`src/app/api/chat/route.ts` utilise `@ai-sdk/openai` (déjà installé, v3) via un **seul modèle** OpenRouter. La clé API est stockée dans `settings` (DB). Il faut passer en appels parallèles sur 3 modèles + synthèse.

### Refactoring de route.ts

```typescript
// src/app/api/chat/route.ts — après refactoring

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

// 3 clients OpenRouter distincts (même base URL, même clé)
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages, financialContext } = await req.json();

  // 3 appels parallèles
  const [r1, r2, r3] = await Promise.all([
    generateText({ model: openrouter("anthropic/claude-sonnet-4-6"), messages, system: financialContext }),
    generateText({ model: openrouter("google/gemini-2.0-flash"), messages, system: financialContext }),
    generateText({ model: openrouter("deepseek/deepseek-r1"), messages, system: financialContext }),
  ]);

  // Synthèse par Claude Haiku
  const synthesis = await generateText({
    model: openrouter("anthropic/claude-haiku-4-5-20251001"),
    system: `Tu es un juge financier. Analyse ces 3 réponses et produis un rapport JSON :
    { "finalAnswer": string, "confidence": "haute"|"moyenne"|"faible", "consensus": string, "divergences": string[] }`,
    messages: [{ role: "user", content: `Réponse 1: ${r1.text}\n\nRéponse 2: ${r2.text}\n\nRéponse 3: ${r3.text}` }],
  });

  return Response.json(JSON.parse(synthesis.text));
}
```

### Limites d'utilisation (guards Phase 4)

| Tier | Conversations IA/mois |
|---|---|
| Gratuit | 0 (IA bloquée) |
| Pro | 10 |
| Premium | Illimitée |

Compteur stocké dans la DB principale : `ai_usage(user_id, month, count)`.

### Variables d'environnement

`OPENROUTER_API_KEY` — déjà présente dans le projet. Aucun ajout nécessaire.

---

## Phase 3 : Stripe Abonnements (2-3 jours)

### Nouveaux fichiers

```
src/app/api/webhooks/stripe/route.ts     — handler webhook
src/app/actions/billing-actions.ts       — createCheckoutAction, createPortalAction
```

### Table dans la DB principale

```sql
CREATE TABLE subscriptions (
  user_id TEXT PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',  -- inactive, active, trialing, canceled
  plan TEXT DEFAULT 'free',                 -- free, pro, premium
  period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Webhooks Stripe à gérer

- `checkout.session.completed` → activer subscription
- `customer.subscription.updated` → mettre à jour status/period_end
- `customer.subscription.deleted` → passer en `canceled`

### Variables d'environnement à ajouter

```bash
BETTER_AUTH_SECRET=<32-chars-random>
BETTER_AUTH_URL=https://ton-domaine.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_xxx       # 9€/mois
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx   # 15€/mois
NEXT_PUBLIC_URL=https://ton-domaine.vercel.app
TURSO_API_TOKEN=...                      # Pour créer des DBs via API
TURSO_AUTH_TOKEN=...                     # Pour accéder aux DBs users
TURSO_MAIN_DB_URL=...                    # DB principale (auth + subscriptions)
```

---

## Phase 3.5 : Backoffice Admin — Application séparée (2-3 jours)

### Architecture : projet distinct, domaine distinct

> **Principe de sécurité :** Le backoffice est une **application Next.js totalement indépendante** du projet principal. Aucun code commun exposé, aucune route partagée. L'app cliente n'a aucune connaissance du backoffice.

```
gestionnaire-comptes/          ← App utilisateur (actuelle)
  → app.votredomaine.com

gestionnaire-comptes-admin/    ← Backoffice admin (nouveau projet séparé)
  → admin.votredomaine.com
```

Deux déploiements Vercel distincts, deux repos (ou monorepo avec deux apps). Le backoffice se connecte à la **même DB principale Turso** (uniquement — jamais aux DBs utilisateurs).

### Authentification du backoffice

Le backoffice n'utilise **pas** Better-Auth (trop complexe pour 1-2 admins). À la place : **mot de passe unique** protégé par middleware Next.js + cookie signé.

```typescript
// gestionnaire-comptes-admin/src/middleware.ts

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;
  const validToken = process.env.ADMIN_SECRET_TOKEN; // hash bcrypt du mot de passe

  if (!token || !verifyToken(token, validToken)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = { matcher: ["/((?!login|_next|favicon).*)"] };
```

**Alternative plus simple** : activer la **Vercel Password Protection** (inclus dans Vercel Pro, $20/mo déjà prévu) — protection au niveau CDN, sans une ligne de code.

### Variables d'environnement backoffice

```bash
# Partagées avec l'app principale (même DB Turso principale)
TURSO_MAIN_DB_URL=...
TURSO_AUTH_TOKEN=...

# Propres au backoffice
ADMIN_SECRET_TOKEN=...          # Hash du mot de passe admin
STRIPE_SECRET_KEY=...           # Pour accès API Stripe (stats revenus)
RESEND_API_KEY=...              # Pour emails broadcast
```

### Structure du projet backoffice

```
gestionnaire-comptes-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx           — Layout sidebar admin
│   │   ├── login/page.tsx       — Page de connexion (formulaire mot de passe)
│   │   ├── page.tsx             — Dashboard overview
│   │   ├── clients/
│   │   │   ├── page.tsx         — Liste clients paginée
│   │   │   └── [id]/page.tsx    — Fiche client détaillée
│   │   ├── revenus/
│   │   │   └── page.tsx         — MRR / ARR / churn / Stripe
│   │   ├── utilisation/
│   │   │   └── page.tsx         — Usage IA + activité
│   │   └── emails/
│   │       └── page.tsx         — Broadcast email
│   ├── lib/
│   │   ├── admin-db.ts          — Client Turso DB principale (lecture seule)
│   │   └── admin-queries.ts     — Requêtes stats, liste users, etc.
│   └── middleware.ts            — Auth par token
├── package.json
└── next.config.ts
```

### Dashboard overview (`/`)

Métriques en temps réel depuis la DB principale :

```
┌─────────────────────────────────────────────────────┐
│  MRR actuel      ARR estimé     Users actifs         │
│  486€            5 832€         98 (30j)             │
├──────────────────┬──────────────────────────────────┤
│  Nouveaux (30j)  │  Churned (30j) │  Conversion      │
│  +12             │  -3            │  18%             │
├──────────────────┴──────────────────────────────────┤
│  Distribution plans :                               │
│  Gratuit: 68%   Pro: 24%   Premium: 8%             │
└─────────────────────────────────────────────────────┘
```

### Calculs MRR / ARR (`admin-queries.ts`)

```typescript
export async function getAdminStats() {
  const db = getAdminDb(); // client Turso DB principale

  const subs = await db.execute(`
    SELECT plan, COUNT(*) as count
    FROM subscriptions WHERE status = 'active'
    GROUP BY plan
  `);

  const mrr = subs.rows.reduce((total, row) => {
    const price = row.plan === "pro" ? 4.90 : row.plan === "premium" ? 7.90 : 0;
    return total + (price * Number(row.count));
  }, 0);

  return { mrr, arr: mrr * 12, ... };
}
```

### Page clients (`/clients`)

| Email | Plan | Statut | Inscrit le | Dernière activité | Stripe |
|---|---|---|---|---|---|
| user@ex.com | Pro | Actif | 12 jan 2026 | Il y a 2h | Portail ↗ |

**Actions disponibles :**
- Voir la fiche détaillée (plan, dates, usage IA)
- Lien direct vers le portail admin Stripe du client
- Changer le plan manuellement (UPDATE subscriptions)
- Suspendre / réactiver le compte (flag `suspended` en DB principale)
- Déclencher la suppression RGPD (grâce 30j)
- Annuler une suppression en cours
- Envoyer un email individuel

### Emails admin (Resend)

```typescript
// Email individuel depuis la fiche client
await resend.emails.send({ from: "contact@votredomaine.com", to: user.email, subject, html });

// Broadcast (tous les users d'un plan)
const users = await getUsersByPlan("pro"); // depuis DB principale
await resend.batch.send(users.map((u) => ({ to: u.email, subject, html })));
```

### Suppression RGPD — Grâce 30 jours

La table `deletion_requests` est dans la **DB principale** (accessible depuis les deux apps) :

```sql
CREATE TABLE deletion_requests (
  user_id TEXT PRIMARY KEY,
  requested_at TEXT DEFAULT (datetime('now')),
  scheduled_delete_at TEXT,   -- requested_at + 30j
  reason TEXT
);
```

**Flux :**
- **J+0** : Admin backoffice déclenche → `suspended = 1` + email au client (via Resend)
- **J+25** : Email de rappel au client (cron dans l'app principale `/api/cron/deletion-reminder`)
- **J+30** : Cron dans l'app principale `/api/cron/delete-accounts` → :
  1. DELETE Better-Auth user
  2. DELETE DB Turso via API (`turso-manager.ts`)
  3. CLEANUP DB principale (subscriptions, ai_usage, user_activity)
  4. Email de confirmation de suppression

> **Note :** Les crons (J+25 et J+30) sont dans l'**app principale** car elle gère Better-Auth et turso-manager. Le backoffice déclenche seulement la demande via la DB principale.

L'app principale vérifie `suspended = 1` dans le middleware → redirige vers page `/compte-suspendu` (avec message et date limite pour annuler via email de contact).

### Sécurité

| Vecteur | Protection |
|---|---|
| Accès backoffice | Mot de passe unique (middleware) ou Vercel Password Protection |
| Données financières users | Jamais accessibles — backoffice lit uniquement DB principale |
| Données DB principale | `admin-db.ts` configuré en lecture seule sauf actions explicites |
| URL backoffice | Pas indexée (robots.txt noindex + domaine différent) |

### Nouvelles tables en DB principale (partagées avec les deux apps)

```sql
CREATE TABLE ai_usage (
  user_id TEXT, month TEXT, count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

CREATE TABLE user_activity (
  user_id TEXT PRIMARY KEY,
  last_seen_at TEXT, import_count INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE deletion_requests (
  user_id TEXT PRIMARY KEY,
  requested_at TEXT DEFAULT (datetime('now')),
  scheduled_delete_at TEXT, reason TEXT
);
```

### Fichiers backoffice à créer (projet séparé)

| Fichier | Rôle |
|---|---|
| `gestionnaire-comptes-admin/src/app/login/page.tsx` | Login mot de passe |
| `gestionnaire-comptes-admin/src/app/page.tsx` | Dashboard MRR / ARR |
| `gestionnaire-comptes-admin/src/app/clients/page.tsx` | Liste clients |
| `gestionnaire-comptes-admin/src/app/clients/[id]/page.tsx` | Fiche client |
| `gestionnaire-comptes-admin/src/app/revenus/page.tsx` | Graphique MRR + Stripe |
| `gestionnaire-comptes-admin/src/app/utilisation/page.tsx` | Usage IA + activité |
| `gestionnaire-comptes-admin/src/app/emails/page.tsx` | Broadcast email |
| `gestionnaire-comptes-admin/src/lib/admin-db.ts` | Client Turso DB principale |
| `gestionnaire-comptes-admin/src/lib/admin-queries.ts` | Requêtes stats admin |
| `gestionnaire-comptes-admin/src/middleware.ts` | Auth token |

### Fichiers à créer dans l'app principale (crons)

| Fichier | Rôle |
|---|---|
| `src/app/api/cron/delete-accounts/route.ts` | Suppression effective J+30 |
| `src/app/api/cron/deletion-reminder/route.ts` | Rappel email J+25 |
| `src/app/compte-suspendu/page.tsx` | Page d'info pour compte suspendu/en suppression |

---

## Phase 4 : Guards Freemium (1 jour)

```typescript
// src/lib/subscription-utils.ts
export async function checkCanCreateAccount(userId: string): Promise<void> {
  const sub = await getSubscription(userId); // depuis DB principale
  if (sub.plan === "free") {
    const db = await getUserDb(userId);
    const accounts = await getAllAccounts(db);
    if (accounts.length >= 1) {
      throw new Error("Limite freemium : 1 compte bancaire. Passez au plan Pro.");
    }
  }
}

export async function checkCanUseAI(userId: string): Promise<void> {
  const sub = await getSubscription(userId);
  if (sub.plan === "free") {
    throw new Error("L'IA est disponible à partir du plan Pro.");
  }
}
```

---

## Phase 5 : Hébergement (1 jour)

### Vercel

1. Connecter le repo GitHub à Vercel
2. Framework : Next.js (auto-détecté)
3. Ajouter toutes les variables d'environnement dans Vercel Dashboard
4. Domaine personnalisé → DNS chez registrar
5. Webhook Stripe : configurer `https://ton-domaine.vercel.app/api/webhooks/stripe`

**Important :** Passer sur Vercel Pro ($20/mo) dès que tu as des vrais utilisateurs. Les Server Actions consomment les invocations gratuites (150k/mois) rapidement.

### Turso

- DB principale : `finance-saas-main` (auth + subscriptions + users_databases)
- DBs utilisateurs : créées automatiquement à l'inscription
- Plan Free → Developer ($5/mo) → Scaler ($25/mo) selon la croissance

### Stripe

- Créer 2 produits : Pro Mensuel (9€) + Premium Mensuel (15€)
- Activer événements webhook : `checkout.session.completed`, `customer.subscription.*`
- Tester localement : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Fichiers critiques à créer / modifier

| Fichier | Action | Priorité |
|---|---|---|
| `src/lib/auth.ts` | CRÉER — instance Better-Auth | Phase 1 |
| `src/lib/auth-utils.ts` | CRÉER — getRequiredUserId() | Phase 1 |
| `src/middleware.ts` | CRÉER — protection routes | Phase 1 |
| `src/lib/turso-manager.ts` | CRÉER — création DB par user | Phase 2 |
| `src/lib/db.ts` | MODIFIER — getUserDb(userId) | Phase 2 |
| `src/lib/queries.ts` | MODIFIER — toutes les fonctions reçoivent `db` | Phase 2 |
| `src/app/actions/*.ts` | MODIFIER — 9 fichiers, getRequiredUserId() | Phase 2 |
| `src/app/api/webhooks/stripe/route.ts` | CRÉER — handler Stripe | Phase 3 |
| `src/app/actions/billing-actions.ts` | CRÉER — checkout + portail | Phase 3 |
| `src/lib/subscription-utils.ts` | CRÉER — guards freemium | Phase 4 |
| `src/app/layout.tsx` | MODIFIER — simplifier | Phase 1 |
| `src/components/navigation.tsx` | MODIFIER — bouton déconnexion | Phase 1 |

---

## Vérification / Tests

1. **Auth :** Inscription → confirmation email → connexion → déconnexion → redirect OK
2. **DB provisioning :** À l'inscription, une nouvelle DB Turso est bien créée
3. **Isolation :** 2 comptes différents → chacun ne voit que ses données
4. **Freemium guards :** User gratuit ne peut pas créer 2 comptes bancaires
5. **Stripe :** Checkout test → webhook reçu → subscription activée en DB
6. **IA :** User gratuit bloqué, user Pro peut utiliser le conseiller
7. **Production :** Deploy Vercel → webhook Stripe prod → test E2E

---

## Ordre d'implémentation

```
Phase 0.5  i18n — next-intl (2-3j)
           ↓ structure URL [locale]/ + extraction ~200 strings FR→EN/ES/IT/DE
Phase 1    Auth — Better-Auth (3-5j)
           ↓ middleware fusionné i18n + auth
Phase 2    Multi-tenant DB-per-user (4-6j)
           ↓ turso-manager.ts + refactoring db.ts + 28 fonctions queries.ts + 9 actions
Phase 2.3  Import extensible — ParserRegistry (3-4j)
           ↓ src/lib/parsers/ + pdf-parse + GenericCsvParser + formats internationaux
Phase 2.5  Multi-devises généralisé (2-3j)
           ↓ getAllRates() + convertToReference() + CurrencySelector Combobox
Phase 2.6  IA Multi-modèles — OpenRouter (1-2j)
           ↓ route.ts 3 modèles parallèles + synthèse Haiku
Phase 3    Stripe Abonnements (2-3j)
           ↓ webhook + billing-actions + subscriptions table
Phase 3.5  Backoffice Admin — projet séparé (2-3j)
           ↓ gestionnaire-comptes-admin/ → admin.votredomaine.com
           ↓ auth par token/Vercel Password + stats MRR/clients/usage/emails + RGPD 30j
Phase 4    Guards Freemium (1j)
           ↓ checkCanCreateAccount + checkCanUseAI + ui bandeaux upgrade
Phase 5    Deploy Vercel (1j)
           ↓ env vars + domaine + webhook Stripe prod
```

**Durée totale estimée :** 21-31 jours de développement solo.

## Résumé des décisions clés

| Sujet | Décision | Justification |
|---|---|---|
| i18n | **next-intl** | Standard App Router, Server Components natif |
| Locales | FR, EN, ES, IT, DE | Marchés prioritaires Europe |
| Noms devises | **Intl.DisplayNames** | Zéro maintenance, natif JS, multilingue auto |
| Tarif Pro | **4,90€/mois** | Psychologie "moins de 5€", accessible marché international |
| Tarif Premium | **7,90€/mois** | Sous Wallet + IA illimitée multi-modèles comme justificatif |
| Backoffice | **Projet séparé** (`gestionnaire-comptes-admin/`) | Isolation totale — aucune route admin dans l'app user |
| Auth admin | **Token middleware** ou Vercel Password Protection | Simple pour 1-2 admins, pas de Better-Auth |
| PDF parse | **pdf-parse** (npm) | Remplace pdftotext CLI incompatible Vercel |
| IA actuelle | Mono-modèle @ai-sdk/openai | À refactoriser Phase 2.6 |
| queries.ts | ~28 fonctions sans `db` param | Toutes à refactoriser Phase 2 |
| CLAUDE.md | Dit "better-sqlite3" | ⚠️ Obsolète — projet utilise @libsql/client |
| DSP2 | **Non prévu** | Coût prohibitif (agrément AISP), différenciation par IA |
| Formats internationaux | **V2 roadmap** | GenericCsvParser comme filet V1, parsers spécifiques V2 |
| Auth | **Better-Auth** | Gratuit, Turso adapter, Stripe plugin |
| DB architecture | **1 DB par user** | Isolation physique données financières |
| IA | **OpenRouter multi-modèles** | Claude 4.6 + Gemini Flash + DeepSeek R1 → synthèse Haiku |
