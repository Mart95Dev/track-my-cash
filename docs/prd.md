# PRD — Sprint Intelligence & UX IA (v7)

**Version :** 7.0
**Date :** 2026-02-22
**Statut :** Prêt pour décomposition en stories
**Périmètre :** Score de santé financière, amélioration conseiller IA, tool calling, simulateur de scénarios, catégorisation auto à l'import, suggestions de budgets

---

## Contexte

Le Sprint Compatibilité, IA & Analyse Avancée (v6) est **entièrement livré** :
- ✅ 8/8 stories PASS (325 tests, QA PASS)
- ✅ Parsers BNP/SG/CE/N26/Wise, CSV générique, MoM dashboard, récurrents auto-détectés, anomalies, bilan annuel IA
- ✅ 46 stories livrées sur 6 sprints — SaaS complet et mature

**Opportunité actuelle :** Le conseiller IA (chat) existe mais reste passif — il répond aux questions mais n'initie rien. Les utilisateurs ne savent pas comment bien l'utiliser ni quoi lui demander. Le contexte financier est riche mais l'IA n'a aucun pouvoir d'action (elle ne peut que conseiller, pas créer des budgets). Par ailleurs, l'expérience d'import (catégorisation manuelle après coup) crée de la friction, et il n'y a aucune métrique synthétique de santé financière visible immédiatement.

---

## Objectifs de ce sprint

1. **Créer un score de santé financière** visible immédiatement sur le dashboard (0-100, algorithmique)
2. **Rendre le chat IA actionnable** via tool calling (créer budgets/objectifs depuis le chat)
3. **Guider les utilisateurs** dans le chat avec des questions suggérées contextuelles
4. **Réduire la friction à l'import** avec la catégorisation IA automatique en option
5. **Aider à définir des budgets réalistes** grâce à des suggestions IA basées sur l'historique
6. **Permettre des simulations "Et si..."** dans les prévisions

---

## Architecture existante (à respecter)

- **Conseiller chat** : `/api/chat/route.ts` — `streamText()` Vercel AI SDK, 4 modèles OpenRouter, `buildFinancialContext()` enrichi
- **Tool calling** : Vercel AI SDK supporte `tools:` dans `streamText()` — `tool()` de `ai` package
- **Catégorisation IA** : `ai-categorize-actions.ts` — `autoCategorizeAction()` via gpt-4o-mini, pattern réutilisable
- **Import** : `import-actions.ts` — `importFileAction()` + `confirmImportAction()`
- **Contexte IA** : `src/lib/ai-context.ts` — goals, budgets, récurrents, dépenses, revenus, résumé mensuel
- **Prévisions** : `src/lib/forecasting.ts` → `computeForecast()` — `CategoryForecast[]`
- **Budgets** : table `budgets`, `getBudgets(db, accountId)` dans queries.ts
- **Objectifs** : table `goals`, `getGoals(db, accountId)` dans queries.ts
- **Settings** : `getSetting(db, key)` / `setSetting(db, key, value)` — pour les préférences user
- **Freemium guard** : `canUseAI(userId)` → `{ allowed, reason }` — Pro/Premium only
- **Notifications** : table `notifications`, `createNotification()` — STORY-037

---

## Périmètre — Stories MoSCoW

---

### 🔴 MUST HAVE — Score de santé financière

#### STORY-047 : Score de santé financière (widget dashboard)

**Description :** Un indicateur synthétique 0-100 visible sur le dashboard qui résume immédiatement la situation financière de l'utilisateur. Calculé algorithmiquement (pas d'appel IA = instantané et gratuit pour tous les plans). Décomposé en 4 dimensions : taux d'épargne, respect des budgets, progression des objectifs, stabilité des revenus.

**Formule de calcul :**
- **Taux d'épargne** (25 pts) : 0% → 0 pts, ≥20% → 25 pts (linéaire)
- **Budgets respectés** (25 pts) : (nb budgets ok / total budgets) × 25 — si aucun budget : 12.5 pts
- **Objectifs d'épargne** (25 pts) : moyenne(% atteint) × 0.25 — si aucun objectif : 12.5 pts
- **Stabilité des revenus** (25 pts) : écart-type des revenus mensuels / moyenne ≤ 10% → 25 pts, >50% → 0 pts (linéaire)

**Score global → badge :**
- 80-100 : 🟢 Excellent
- 60-79 : 🟡 Bon
- 40-59 : 🟠 À améliorer
- 0-39 : 🔴 Attention

**Travail attendu :**
- `src/lib/health-score.ts` — `computeHealthScore(data: HealthScoreInput): HealthScore` — logique pure, testable
  ```typescript
  export interface HealthScoreInput {
    monthlySummaries: { income: number; expenses: number }[];
    budgets: { category: string; amount_limit: number; spent: number }[];
    goals: { target_amount: number; current_amount: number }[];
  }
  export interface HealthScore {
    total: number;        // 0-100
    savingsScore: number; // 0-25
    budgetsScore: number; // 0-25
    goalsScore: number;   // 0-25
    stabilityScore: number; // 0-25
    label: "Excellent" | "Bon" | "À améliorer" | "Attention";
  }
  ```
- `src/components/health-score-widget.tsx` — Composant dashboard : jauge circulaire (SVG), score numérique, badge coloré, 4 barres de sous-scores
- Intégration dans la page dashboard (`src/app/[locale]/(app)/page.tsx`) — position : sous le total des soldes

**Acceptance Criteria :**
- AC-1 : Le widget affiche un score de 0 à 100 sur le dashboard
- AC-2 : Le badge coloré correspond à la plage du score (4 couleurs)
- AC-3 : Les 4 sous-scores sont visibles avec leur label
- AC-4 : Si aucun budget ni objectif, les dimensions concernées valent 12,5 pts chacune
- AC-5 : `computeHealthScore()` est testé unitairement (nominal, edge cases)

---

### 🔴 MUST HAVE — Chat IA amélioré

#### STORY-048 : Questions suggérées dans le chat conseiller

**Description :** Les utilisateurs ne savent pas quoi demander au conseiller IA. 6 suggestions contextuelles (chips cliquables) s'affichent sous le champ de saisie et changent selon la situation financière (budgets dépassés → question budget, objectifs en retard → question objectifs). Cela réduit le friction d'onboarding et augmente l'engagement.

**Logique des suggestions :**
- Si budgets dépassés → "Pourquoi mon budget [catégorie] est-il dépassé ?"
- Si objectif en retard → "Comment atteindre mon objectif [nom] ?"
- Si taux d'épargne < 10% → "Comment améliorer mon taux d'épargne ?"
- Questions toujours présentes : "Résume ma situation financière", "Où puis-je réduire mes dépenses ?", "Quelles sont mes charges fixes ?"

**Travail attendu :**
- `src/lib/chat-suggestions.ts` — `generateChatSuggestions(context: FinancialSummary): string[]` — logique pure, 4-6 suggestions
  ```typescript
  export interface FinancialSummary {
    exceededBudgets: { category: string }[];
    lateGoals: { name: string }[];
    savingsRate: number; // pourcentage
  }
  ```
- `src/components/chat-suggestions.tsx` — Composant client : chips cliquables qui remplissent l'input du chat, affichage en flex-wrap, disparaissent après le premier envoi
- Intégration dans la page `/conseiller` (ou composant chat) — affichage initial avant la première question

**Acceptance Criteria :**
- AC-1 : 4 à 6 suggestions s'affichent sous le champ de saisie avant le premier message
- AC-2 : Cliquer sur une suggestion envoie directement le message (pas de validation manuelle)
- AC-3 : Les suggestions disparaissent après l'envoi du premier message
- AC-4 : Les suggestions prioritaires reflètent la situation réelle (budget dépassé → question budget en premier)
- AC-5 : `generateChatSuggestions()` est testé unitairement (budget dépassé, objectif en retard, aucun problème)

---

#### STORY-049 : Catégorisation IA automatique à l'import (option)

**Description :** Actuellement, l'utilisateur doit cliquer "Auto-catégoriser" dans `/transactions` après l'import. Cette étape manuelle crée de la friction. Une option dans `/parametres` permet d'activer la catégorisation IA automatiquement pendant l'import (pour les plans Pro/Premium). Si activée, les transactions sont catégorisées par IA pendant `confirmImportAction()` sans action supplémentaire.

**Travail attendu :**
- Setting DB : `auto_categorize_on_import` (valeur: `"true"` / `"false"`)
- Toggle dans `/parametres` (section IA) : "Catégorisation automatique à l'import" — visible uniquement Pro/Premium
- Modifier `confirmImportAction()` dans `import-actions.ts` :
  - Après `bulkInsertTransactions()`, lire le setting
  - Si activé + `canUseAI(userId)` → appeler `autoCategorizeAction(accountId)` (fire-and-forget style)
- `src/components/auto-categorize-toggle.tsx` — Toggle client avec label explicatif

**Acceptance Criteria :**
- AC-1 : Le toggle est visible dans `/parametres` pour les plans Pro/Premium uniquement
- AC-2 : Si activé, les transactions sont catégorisées par IA immédiatement après un import réussi
- AC-3 : La catégorisation auto ne bloque pas l'import (fire-and-forget, erreur silencieuse)
- AC-4 : Le toggle est persisté en DB (survit aux rechargements)
- AC-5 : Si l'utilisateur est sur plan Free, le toggle affiche un message "Fonctionnalité Pro/Premium"

---

### 🟡 SHOULD HAVE — IA actionnelle

#### STORY-050 : Tool calling — l'IA peut créer des budgets et objectifs depuis le chat

**Description :** Le conseiller IA est purement consultatif. Grâce au tool calling Vercel AI SDK, l'IA peut maintenant **agir** : créer un budget, créer un objectif d'épargne, ou créer un récurrent depuis le chat en une phrase naturelle. Ex : "Crée un budget Restaurants de 200€" → l'IA appelle le tool, crée l'entrée en DB, confirme à l'utilisateur.

**Tools à implémenter :**
```typescript
createBudget: tool({
  description: "Crée un budget mensuel pour une catégorie",
  parameters: z.object({
    category: z.string(),
    amount_limit: z.number().positive(),
  }),
  execute: async ({ category, amount_limit }) => { /* Server Action */ }
}),
createGoal: tool({
  description: "Crée un objectif d'épargne",
  parameters: z.object({
    name: z.string(),
    target_amount: z.number().positive(),
    deadline: z.string().optional(), // YYYY-MM-DD
  }),
  execute: async ({ name, target_amount, deadline }) => { /* Server Action */ }
}),
```

**Travail attendu :**
- `src/lib/ai-tools.ts` — définition des tools (`createBudgetTool`, `createGoalTool`) avec `z.object()` schemas et `execute()` appelant les Server Actions existantes
- Modifier `/api/chat/route.ts` pour passer `tools:` à `streamText()` (uniquement pour Pro/Premium)
- Les tools réutilisent `addBudgetAction()` et `createGoalAction()` existants — pas de duplication logique
- `src/components/tool-result-card.tsx` — Composant pour afficher le résultat d'un tool call dans le chat (carte verte "Budget créé : Restaurants — 200€/mois")

**Acceptance Criteria :**
- AC-1 : L'utilisateur peut créer un budget en langage naturel depuis le chat ("Crée un budget Loisirs de 150€")
- AC-2 : L'utilisateur peut créer un objectif d'épargne depuis le chat ("Objectif vacances : 1500€ pour juillet")
- AC-3 : Après création, l'IA confirme en français avec le récapitulatif de ce qui a été créé
- AC-4 : Le résultat du tool call est affiché visuellement dans le chat (carte de confirmation)
- AC-5 : Les tools ne sont disponibles que pour les plans Pro/Premium (guard dans la route)
- AC-6 : Tests unitaires sur les schemas Zod des tools (validation des paramètres)

---

### 🟡 SHOULD HAVE — Prévisions améliorées

#### STORY-051 : Simulateur de scénarios "Et si..." dans les prévisions

**Description :** La page prévisions montre les tendances actuelles, mais l'utilisateur ne peut pas simuler l'impact de changements comportementaux. Le simulateur permet de modifier les paramètres (économies supplémentaires, suppression d'un abonnement, hausse de salaire) et voit l'impact en temps réel sur les prévisions.

**Scénarios pré-définis :**
- "Si j'économise X€ de plus par mois" → impact sur taux d'épargne et date d'atteinte des objectifs
- "Si je supprime un abonnement de X€/mois" → réduction des dépenses sur 12 mois
- "Si mes revenus augmentent de X%" → nouveau taux d'épargne projeté

**Travail attendu :**
- `src/lib/scenario-simulator.ts` — `simulateScenario(baseForecast, scenario): SimulationResult` — logique pure
  ```typescript
  export interface Scenario {
    type: "extra_savings" | "cut_expense" | "income_increase";
    amount: number;      // montant absolu ou pourcentage selon le type
    category?: string;   // pour cut_expense
  }
  export interface SimulationResult {
    projectedSavingsRate: number;   // %
    monthsToGoal: number | null;    // null si pas d'objectif
    monthlySavings: number;         // épargne mensuelle projetée
    annualImpact: number;           // impact sur 12 mois
  }
  ```
- `src/components/scenario-simulator.tsx` — Section dans la page `/previsions` :
  - 3 onglets (type de scénario)
  - Slider ou input numérique pour le montant
  - Affichage immédiat (client-side, `useMemo`) des résultats comparatifs : avant / après

**Acceptance Criteria :**
- AC-1 : 3 types de scénarios disponibles (économies extra, suppression dépense, hausse revenus)
- AC-2 : La simulation est instantanée (client-side, pas d'appel serveur)
- AC-3 : L'impact annuel estimé est affiché (ex : "+2 400€ épargnés sur 12 mois")
- AC-4 : Si l'utilisateur a des objectifs, le nombre de mois pour les atteindre est recalculé
- AC-5 : `simulateScenario()` est testé unitairement (3 types × cas nominal + edge case)

---

### 🟢 COULD HAVE — Budgets intelligents

#### STORY-052 : Suggestions de budgets IA basées sur l'historique

**Description :** Les utilisateurs ont du mal à définir des budgets réalistes. L'IA analyse les dépenses des 3 derniers mois par catégorie et suggère des limites cohérentes avec les habitudes réelles (±10% de la moyenne). L'utilisateur peut accepter en un clic ou ajuster avant de créer.

**Logique de suggestion :**
- Pour chaque catégorie dépensée ≥ 2 fois ces 3 derniers mois :
  - Moyenne mensuelle → suggérer cette valeur arrondie à la dizaine supérieure
  - Ex : moyenne 183€ → suggestion 190€, ou 200€ si très variable
- Exclure les catégories déjà budgétées
- Limiter à 8 suggestions maximum

**Travail attendu :**
- `src/lib/budget-suggester.ts` — `suggestBudgets(expenses: CategoryExpense[]): BudgetSuggestion[]` — logique pure
  ```typescript
  export interface CategoryExpense {
    category: string;
    monthlyAmounts: number[];  // montants des 3 derniers mois
  }
  export interface BudgetSuggestion {
    category: string;
    suggestedLimit: number;  // arrondi cohérent
    avgAmount: number;
    confidence: "high" | "medium" | "low";
  }
  ```
- `src/app/actions/budget-suggestion-actions.ts` — `getBudgetSuggestionsAction(accountId)` : requête SQL + appel à `suggestBudgets()`
- `src/components/budget-suggestions.tsx` — Section dans `/budgets` : liste des suggestions avec bouton "Créer ce budget" (appelle `addBudgetAction()`) + option d'ajustement du montant avant création

**Acceptance Criteria :**
- AC-1 : Les suggestions apparaissent dans `/budgets` pour les catégories sans budget défini
- AC-2 : Chaque suggestion affiche la catégorie, le montant suggéré et la moyenne historique
- AC-3 : "Créer ce budget" crée directement le budget avec le montant suggéré
- AC-4 : Les catégories déjà budgétées ne sont pas proposées
- AC-5 : `suggestBudgets()` est testé unitairement (catégorie stable, catégorie variable, déjà budgétée)

---

## Critères de succès global

- [ ] Un utilisateur voit son score de santé financière (0-100) sur le dashboard dès la connexion
- [ ] Le chat propose des questions pertinentes selon la situation (budget dépassé → question budget)
- [ ] L'utilisateur peut activer la catégorisation IA automatique à l'import (Pro/Premium)
- [ ] L'utilisateur peut créer un budget ou un objectif en langage naturel depuis le chat
- [ ] L'utilisateur peut simuler "Et si j'économisais 200€ de plus ?" et voir l'impact
- [ ] Des suggestions de budgets réalistes sont proposées basées sur les 3 derniers mois

---

## Ordre de priorité recommandé

```
P1 → STORY-047 (Score santé financière — dashboard, aucune dépendance)
   → STORY-048 (Questions suggérées — chat, indépendant)
   → STORY-049 (Catégorisation auto import — setting + hook sur confirmImport)
P2 → STORY-050 (Tool calling chat — Vercel AI SDK tools)
   → STORY-051 (Simulateur scénarios — pure logic + UI)
P3 → STORY-052 (Suggestions budgets IA — pure logic + UI)
```

## Parallélisation possible

```
STORY-047 + STORY-048 + STORY-049   (aucune dépendance entre elles)
      ↓           ↓
STORY-050    STORY-051 (indépendant de 050)
                  ↓
             STORY-052
```

---

## Métriques sprint

| Metric | Valeur |
|--------|--------|
| Total stories | 6 |
| Points total | 15 (3+2+2+3+3+2) |
| MUST HAVE | 3 × P1 (047, 048, 049) |
| SHOULD HAVE | 2 × P2 (050, 051) |
| COULD HAVE | 1 × P3 (052) |
| Tests attendus | ~35 nouveaux tests |

---

## Hors scope

- DSP2 / connexion bancaire directe (agrément AISP requis)
- Application mobile native
- Backoffice admin
- Multi-tenant / équipes
- Email récapitulatif hebdomadaire IA (sprint suivant)
- Tool calling : créer des récurrents (complexité supplémentaire, sprint suivant)
- Comparaison YoY dans les transactions

---

## Dépendances techniques

| Story | Dépend de |
|-------|-----------|
| STORY-047 | `getMonthlySummary()`, `getBudgets()`, `getGoals()` existants |
| STORY-048 | `buildFinancialContext()` existant — extraire summary structuré |
| STORY-049 | `autoCategorizeAction()` existant, `confirmImportAction()` existant |
| STORY-050 | Vercel AI SDK `tool()`, `addBudgetAction()`, `createGoalAction()` existants |
| STORY-051 | `computeForecast()` existant (STORY-038), `getGoals()` |
| STORY-052 | `getBudgets()`, `getTransactions()` existants |

---

*PRD généré par FORGE PM Agent — 2026-02-22*
