# PRD — Sprint Engagement & Analyse Avancée (v9)

**Version :** 9.0
**Date :** 2026-02-22
**Statut :** Prêt pour décomposition en stories
**Périmètre :** Email hebdomadaire IA, récurrents via chat, vue multi-comptes, comparaison YoY, export RGPD, notes transactions, parsers ING/Boursorama

---

## Contexte

Le Sprint Production SaaS & Croissance (v8) est **entièrement livré** :
- ✅ 8/8 stories PASS (429 tests, QA PASS)
- ✅ Suivi IA, trial 14j, RGPD crons, skeletons, pages d'erreur, parsers UK, IA consensus Premium, bannière freemium + page tarifs
- ✅ 60 stories livrées sur 8 sprints — SaaS mature, full-stack, freemium opérationnel

**Opportunités identifiées :**

1. **Engagement faible hors de l'app** : les utilisateurs n'ont aucune raison de revenir s'ils ne se connectent pas. Un email hebdomadaire IA généré automatiquement crée un point de contact régulier (rétention) et valorise le plan Pro/Premium.
2. **Tool calling incomplet** : la création de récurrents via le chat IA était explicitement différée au sprint suivant (PRD v7 hors-scope).
3. **Multi-comptes sans vue globale** : les utilisateurs avec plusieurs comptes ne peuvent pas voir leur situation financière agrégée. Le sélecteur actuel force un compte à la fois.
4. **Pas de vision pluriannuelle** : la comparaison Année/Année (YoY) a été différée du PRD v7 — c'est une métrique clé pour les utilisateurs qui utilisent l'app depuis 12+ mois.
5. **Portabilité des données incomplète** : l'export CSV des transactions existe (STORY-025) mais pas l'export complet du profil (comptes + budgets + objectifs) — requis pour la conformité RGPD complète.
6. **Pas de contexte sur les transactions** : les utilisateurs ne peuvent pas annoter une transaction avec une note, ce qui force à se souvenir du contexte (remboursement ami, frais professionnel, etc.).
7. **Couverture parsers EU limitée** : ING Direct et Boursorama sont les deux principales banques françaises/EU encore absentes.

---

## Architecture existante (à respecter)

- **Crons Vercel** : `vercel.json` avec 4 crons actifs, `CRON_SECRET` en env, pattern `GET` + `Authorization: Bearer CRON_SECRET`
- **Email** : `src/lib/email.ts` (Nodemailer/Hostinger) + `src/lib/email-templates.ts` (templates HTML)
- **Tool calling** : `src/lib/ai-tools.ts` — `createAiTools(db, accountId)` retourne `createBudget` + `createGoal`
- **Récurrents** : table `recurring_payments`, `addRecurringPayment(db, ...)` dans `queries.ts`
- **Queries** : `src/lib/queries.ts` — toutes les requêtes SQL et types
- **Multi-devises** : `getAllRates()` + `convertToReference()` + `reference_currency` en settings
- **Freemium guard** : `canUseAI(userId)` → `{ allowed, reason }`, `getUserPlanId(userId)`
- **Settings** : `getSetting(db, key)` / `setSetting(db, key, value)` — préférences utilisateur
- **Parsers** : `src/lib/parsers/` + `registry.ts` (genericCsv en dernier — catch-all)
- **Transactions** : table `transactions` (champs actuels : id, account_id, type, amount, date, category, subcategory, description, import_hash, created_at)

---

## Périmètre — Stories MoSCoW

---

### 🔴 MUST HAVE

#### STORY-061 : Email récapitulatif hebdomadaire IA (Pro/Premium)

**Description :** Un email automatique envoyé chaque lundi matin aux utilisateurs Pro/Premium actifs, résumant la semaine financière écoulée avec un insight IA. Crée un point de contact régulier qui incite à revenir dans l'app même sans connexion.

**Architecture :**
- `src/app/api/cron/weekly-summary/route.ts` — route `GET` protégée par `CRON_SECRET`
  ```typescript
  // Boucle sur users_databases (DB principale)
  // Pour chaque user Pro/Premium + setting weekly_summary_email !== "false" :
  //   getUserDb(userId) → getWeeklySummaryData(db, accountId)
  //   Génère email HTML via weeklyEmailTemplate()
  //   sendEmail()
  // Retourne { processed: N, sent: M }
  ```
- `src/lib/queries.ts` — `getWeeklySummaryData(db, accountId, weekStart, weekEnd)` :
  ```typescript
  export interface WeeklySummaryData {
    totalExpenses: number;
    totalIncome: number;
    topCategories: { category: string; amount: number }[];  // top 3
    budgetsOver: { category: string; spent: number; limit: number }[];
    goalsProgress: { name: string; percent: number }[];
  }
  ```
- `src/lib/email-templates.ts` — `weeklyEmailTemplate(data, userName, locale)` : HTML responsive avec résumé + CTA "Voir mon dashboard"
- `vercel.json` — ajouter `{ "path": "/api/cron/weekly-summary", "schedule": "0 8 * * 1" }` (lundi 8h)
- `/parametres` — toggle "Email récapitulatif hebdomadaire" (setting `weekly_summary_email`)

**Acceptance Criteria :**
- AC-1 : La route `GET /api/cron/weekly-summary` retourne 401 sans `CRON_SECRET` valide
- AC-2 : La route retourne `{ processed: N, sent: M }` avec les bons comptes
- AC-3 : Seuls les utilisateurs Pro/Premium avec `weekly_summary_email !== "false"` reçoivent l'email
- AC-4 : `getWeeklySummaryData()` retourne les 3 top catégories de dépenses de la semaine
- AC-5 : Le template email contient le total dépenses, top catégories et un CTA vers le dashboard
- AC-6 : Le toggle dans `/parametres` sauvegarde le setting `weekly_summary_email`

---

#### STORY-063 : Vue agrégée "Tous les comptes" (dashboard global)

**Description :** Ajouter une option "Tous les comptes" dans le sélecteur de compte du dashboard. Quand sélectionné, le dashboard affiche les données agrégées de tous les comptes : solde total en devise de référence, dépenses/revenus du mois agrégés, health score global.

**Architecture :**
- `src/lib/queries.ts` — `getAggregatedSummary(db, accountIds, referenceRate)` : somme pondérée par devise
- `src/components/account-filter.tsx` — ajouter option `value="all"` en tête de liste
- `src/app/[locale]/(app)/dashboard/page.tsx` (ou équivalent) — si `accountId === "all"` : appeler `getAggregatedSummary()`
- `health-score.ts` — `computeGlobalHealthScore(perAccountScores)` : moyenne pondérée par solde

**Acceptance Criteria :**
- AC-1 : L'option "Tous les comptes" apparaît en premier dans le sélecteur de compte
- AC-2 : Le solde total affiché est la somme des soldes convertis en devise de référence
- AC-3 : Les dépenses/revenus du mois sont agrégés sur tous les comptes
- AC-4 : Le health score global est calculé (moyenne pondérée des scores par compte)
- AC-5 : La sélection "Tous les comptes" est persistée dans l'URL (query param `account=all`)

---

#### STORY-065 : Export données personnelles (portabilité RGPD)

**Description :** Bouton "Télécharger mes données" dans `/parametres` qui génère et télécharge un fichier JSON complet contenant toutes les données de l'utilisateur : comptes, transactions, récurrents, budgets, objectifs, paramètres. Complète la conformité RGPD (droit à la portabilité — article 20 RGPD).

**Architecture :**
- `src/app/actions/account-deletion-actions.ts` (ou nouveau fichier) — `exportUserDataAction()` :
  ```typescript
  // Récupère : getAccounts(), getTransactions(all), getRecurringPayments(), getBudgets(), getGoals(), getAllSettings()
  // Retourne JSON stringifié avec { exportDate, version, accounts, transactions, recurring, budgets, goals, settings }
  ```
- `/parametres` — section "Mes données" avec bouton "Télécharger mes données (JSON)" + `<a download>`
- Fichier nommé `track-my-cash-export-YYYY-MM-DD.json`

**Acceptance Criteria :**
- AC-1 : Le bouton "Télécharger mes données" apparaît dans `/parametres`
- AC-2 : Le fichier JSON téléchargé contient accounts, transactions, recurring, budgets, goals
- AC-3 : Le JSON inclut une clé `exportDate` (ISO 8601) et `version: "1.0"`
- AC-4 : `exportUserDataAction()` est testée unitairement (structure du JSON retourné)
- AC-5 : Le nom du fichier inclut la date du jour (`track-my-cash-export-YYYY-MM-DD.json`)

---

### 🟡 SHOULD HAVE

#### STORY-062 : Création de récurrents via tool calling chat IA

**Description :** Étendre le système de tool calling (STORY-050) pour permettre la création de paiements récurrents depuis le chat IA. Était explicitement différé au sprint suivant dans le PRD v7.

**Architecture :**
- `src/lib/ai-tools.ts` — ajouter `createRecurringSchema` (z.object) + `createRecurring` tool :
  ```typescript
  export const createRecurringSchema = z.object({
    name: z.string().describe("Nom du paiement récurrent (ex: Loyer, Netflix, EDF)"),
    amount: z.number().positive().describe("Montant en euros"),
    type: z.enum(["income", "expense"]).describe("Revenu ou dépense"),
    frequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]).describe("Fréquence"),
    category: z.string().describe("Catégorie (ex: Logement, Abonnement, Revenus)"),
    next_date: z.string().describe("Prochaine date au format YYYY-MM-DD"),
  });
  // execute: addRecurringPayment(db, accountId, ...) → ToolCallResult { type: "recurring" }
  ```
- `src/lib/ai-tools.ts` — `ToolCallResult` : ajouter le variant `{ type: "recurring", name, amount, frequency, message }`
- `src/app/api/chat/route.ts` — intégrer le nouveau tool (Pro/Premium, même guard que createBudget)
- `src/components/tool-result-card.tsx` — ajouter rendu pour `type === "recurring"`

**Acceptance Criteria :**
- AC-1 : Dire "Crée un récurrent Netflix 17€/mois" crée l'entrée en base et affiche une `ToolResultCard`
- AC-2 : Le tool est uniquement disponible pour les plans Pro et Premium
- AC-3 : `createRecurringSchema` valide que `next_date` est au format YYYY-MM-DD
- AC-4 : La `ToolResultCard` pour les récurrents affiche nom, montant et fréquence
- AC-5 : `createRecurring` tool est testé unitairement (nominal + validation schema)

---

#### STORY-064 : Comparaison Année/Année (YoY) dans le dashboard

**Description :** Widget dans le dashboard affichant la comparaison entre le mois en cours et le même mois de l'année précédente, par catégorie principale. Mettre en évidence les tendances significatives (hausse/baisse >10%).

**Architecture :**
- `src/lib/queries.ts` — `getMonthlyExpensesByCategory(db, accountId, year, month)` → `CategoryExpense[]`
- `src/lib/mom-calculator.ts` — étendre : `computeYoYComparison(current, previous)` → `YoYResult[]` :
  ```typescript
  export interface YoYResult {
    category: string;
    currentAmount: number;
    previousAmount: number;
    delta: number;        // absolu
    deltaPercent: number; // relatif
    trend: "up" | "down" | "stable";
  }
  ```
- `src/components/yoy-comparison-widget.tsx` — tableau de comparaison avec `VariationBadge` existant
- Dashboard page — intégrer le widget (conditionnel : s'affiche si données N-1 disponibles)

**Acceptance Criteria :**
- AC-1 : Le widget s'affiche dans le dashboard si des transactions existent pour le même mois l'année précédente
- AC-2 : Chaque ligne affiche : catégorie, montant N, montant N-1, delta %
- AC-3 : `computeYoYComparison()` est testé unitairement (hausse, baisse, stable, catégorie absente)
- AC-4 : Le widget est masqué si aucune donnée N-1 n'est disponible (pas d'erreur)
- AC-5 : `getMonthlyExpensesByCategory()` filtre par account_id et par mois/année

---

#### STORY-066 : Notes et mémos sur les transactions

**Description :** Permettre aux utilisateurs d'ajouter une note libre sur chaque transaction (remboursement, contexte, remarque). Stockée en base, visible dans la liste, incluse dans l'export CSV.

**Architecture :**
- `src/lib/db.ts` — migration silencieuse : `ALTER TABLE transactions ADD COLUMN note TEXT DEFAULT NULL`
- `src/lib/queries.ts` — `Transaction` interface : ajouter `note: string | null` ; `updateTransactionNote(db, txId, note)` query
- `src/app/actions/transaction-actions.ts` — `updateTransactionNoteAction(txId, note)` Server Action
- `src/components/edit-transaction-dialog.tsx` — ajouter champ `<textarea>` "Note" (optionnel, max 500 chars)
- `src/lib/csv-export.ts` — ajouter colonne "Note" en dernière position
- Liste transactions — icône 📝 sur les transactions qui ont une note (tooltip au hover)

**Acceptance Criteria :**
- AC-1 : Le champ "Note" apparaît dans la dialog d'édition d'une transaction
- AC-2 : La note est sauvegardée et rechargée correctement (aller-retour DB)
- AC-3 : Une icône distingue visuellement les transactions avec note dans la liste
- AC-4 : La colonne "Note" est présente dans l'export CSV (vide si null)
- AC-5 : `updateTransactionNote()` est testée unitairement (nominal + note vide → null)

---

### 🟢 COULD HAVE

#### STORY-067 : Parsers ING Direct + Boursorama (marché FR)

**Description :** Ajouter deux parsers pour les banques françaises très utilisées manquantes : ING Direct (CSV avec tabulations, format spécifique) et Boursorama (CSV séparateur `;`, encodage UTF-8).

**Architecture :**
- `src/lib/parsers/ing.ts` — `ingParser satisfies BankParser` :
  - Format : CSV tabulé, colonnes `Date | Libellé | Montant | Solde`
  - Détection : présence de "ING" dans les premières lignes ou en-tête `Date\tLibellé`
  - Dates : `DD/MM/YYYY`
- `src/lib/parsers/boursorama.ts` — `boursoramaParser satisfies BankParser` :
  - Format : CSV `;`, colonnes `dateOp;dateVal;label;category;amount`
  - Détection : en-tête `dateOp;dateVal;label`
  - Montants : format français avec virgule (`,` → `.`)
- `src/lib/parsers/registry.ts` — enregistrer avant `genericCsv` (catch-all en dernier)
- Tests : `tests/unit/parsers/ing.test.ts` + `tests/unit/parsers/boursorama.test.ts`

**Acceptance Criteria :**
- AC-1 : Un fichier CSV ING Direct type est correctement parsé (dates, montants, description)
- AC-2 : Un fichier CSV Boursorama type est correctement parsé
- AC-3 : Les deux parsers sont enregistrés avant `genericCsv` dans `registry.ts`
- AC-4 : Les montants négatifs sont détectés comme `expense`, positifs comme `income`
- AC-5 : Chaque parser a ≥5 tests unitaires (nominal, montant négatif, solde détecté, encodage)

---

## Critères de succès global

- [ ] Un utilisateur Pro reçoit un email récapitulatif le lundi avec ses dépenses de la semaine
- [ ] L'utilisateur peut dire "Crée un récurrent loyer 900€/mois" dans le chat et le voir créé
- [ ] La vue "Tous les comptes" affiche le solde total en devise de référence
- [ ] Le widget YoY compare ce mois vs même mois N-1 par catégorie
- [ ] L'utilisateur peut télécharger un JSON complet de toutes ses données
- [ ] L'utilisateur peut annoter une transaction avec une note libre
- [ ] Les fichiers ING Direct et Boursorama sont importés sans mapping manuel

---

## Ordre de priorité recommandé

```
P1 → STORY-061 (email hebdo — cron, indépendant)
   → STORY-063 (multi-comptes — dashboard)
   → STORY-065 (export RGPD — /parametres)
P2 → STORY-062 (récurrents tool calling — extension ai-tools.ts)
   → STORY-064 (YoY — queries + widget)
   → STORY-066 (notes transactions — migration + UI)
P3 → STORY-067 (parsers ING + Boursorama)
```

## Parallélisation possible

```
STORY-061  STORY-063  STORY-065   (aucune dépendance entre elles)
     ↓
STORY-062              STORY-064  STORY-066   (indépendants)
                                       ↓
                                  STORY-067
```

---

## Métriques sprint

| Métrique | Valeur |
|----------|--------|
| Total stories | 7 |
| Points total | 17 (3+3+2+2+2+2+3) |
| MUST HAVE | 3 × P1 (061, 063, 065) |
| SHOULD HAVE | 3 × P2 (062, 064, 066) |
| COULD HAVE | 1 × P3 (067) |
| Tests attendus | ~45 nouveaux tests |
| Total cumulé après sprint | ~474 tests |

---

## Hors scope (sprint suivant)

- Connexion bancaire directe Open Banking (agrément AISP requis)
- Dashboard widgets réordonnables par drag-and-drop (complexité UI)
- Notifications push PWA (service worker — complexité)
- Partage de rapport avec un tiers (comptable, partenaire)
- Comparaison multi-utilisateurs / équipes
- Import automatique depuis API bancaire

---

## Dépendances techniques

| Story | Dépend de |
|-------|-----------|
| STORY-061 | `email.ts`, `weeklyEmailTemplate()`, pattern cron CRON_SECRET existant |
| STORY-062 | `addRecurringPayment()` existant, `createAiTools()` existant |
| STORY-063 | `getAccounts()`, `convertToReference()`, `computeHealthScore()` existants |
| STORY-064 | `getTransactions()` existant, `computeMoMVariation()` (mom-calculator.ts) |
| STORY-065 | `getAccounts()`, `getTransactions()`, `getBudgets()`, `getGoals()` existants |
| STORY-066 | migration `ALTER TABLE transactions`, `updateTransactionNote()` |
| STORY-067 | `BankParser` interface, `registry.ts` pattern `satisfies BankParser` |

---

*PRD généré par FORGE PM Agent — 2026-02-22*
