# STORY-044 — Enrichissement du contexte conseiller IA (objectifs + budgets)

**Sprint :** Sprint Compatibilité, IA & Analyse Avancée (v6)
**Priorité :** P1
**Complexité :** S (2 points)
**Bloquée par :** aucune
**Statut :** pending

---

## Description

Le conseiller IA actuel (`/api/chat`) dispose d'un contexte financier riche (solde, dépenses par catégorie, revenus, résumé mensuel, récurrents). Mais il **ignore les objectifs d'épargne** (table `goals`, STORY-033) et les **budgets définis** (table `budgets`, STORY-017). Conséquence : les conseils sont génériques, déconnectés des engagements pris par l'utilisateur.

L'IA doit connaître :
- "L'utilisateur vise 500€ d'épargne mensuelle — il en est à 60% ce mois"
- "Le budget Loisirs est dépassé à 120% — Restauration à 95%"

Cela transforme le conseiller en vrai coach personnalisé, pas en chatbot générique.

---

## Contexte technique

- `buildFinancialContext(db, accounts)` dans `src/lib/ai-context.ts` — à enrichir
- `SYSTEM_PROMPT` dans `src/lib/ai-context.ts` — à améliorer
- `getBudgets(db, accountId)` dans `queries.ts` — retourne les budgets (table `budgets`)
- Table `goals` : `id, account_id, name, target_amount, current_amount, deadline, status`
- Table `budgets` : `id, account_id, category, amount_limit, period`

---

## Acceptance Criteria

**AC-1 :** Le contexte injecté dans le conseiller inclut une section "Objectifs d'épargne" avec : nom, cible, progression actuelle, % atteint, deadline

**AC-2 :** Le contexte injecté inclut une section "Budgets définis" avec : catégorie, limite, dépensé ce mois, % consommé, statut (on_track/at_risk/exceeded)

**AC-3 :** Si au moins 1 budget est dépassé, une ligne d'alerte est ajoutée au contexte : `⚠ ALERTE : X budget(s) dépassé(s) ce mois — l'IA doit le signaler proactivement`

**AC-4 :** Le `SYSTEM_PROMPT` est enrichi pour instruire l'IA d'utiliser activement les objectifs et budgets dans ses réponses

**AC-5 :** Tests unitaires sur `buildFinancialContext()` vérifiant la présence des sections goals et budgets dans l'output

---

## Spécifications techniques

### Modification `src/lib/ai-context.ts` — `buildFinancialContext()`

```typescript
// Ajouter APRÈS la section "Charges récurrentes" pour chaque compte :

// Section objectifs d'épargne
const goals = await db.execute({
  sql: `SELECT name, target_amount, current_amount, deadline, status
        FROM goals WHERE account_id = ? AND status != 'completed'`,
  args: [account.id],
});

if (goals.rows.length > 0) {
  lines.push(`\n### Objectifs d'épargne`);
  for (const g of goals.rows) {
    const target = Number(g.target_amount);
    const current = Number(g.current_amount);
    const pct = target > 0 ? ((current / target) * 100).toFixed(0) : "0";
    const deadline = g.deadline ? ` (échéance : ${g.deadline})` : "";
    lines.push(`- ${g.name} : ${current.toLocaleString("fr-FR")}/${target.toLocaleString("fr-FR")} ${account.currency} (${pct}% atteint)${deadline}`);
  }
}

// Section budgets
const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const budgets = await db.execute({
  sql: `SELECT b.category, b.amount_limit,
               COALESCE(SUM(t.amount), 0) as spent
        FROM budgets b
        LEFT JOIN transactions t ON t.account_id = b.account_id
          AND t.category = b.category
          AND t.type = 'expense'
          AND strftime('%Y-%m', t.date) = ?
        WHERE b.account_id = ?
        GROUP BY b.id`,
  args: [currentMonth, account.id],
});

let exceededCount = 0;
if (budgets.rows.length > 0) {
  lines.push(`\n### Budgets du mois en cours`);
  for (const b of budgets.rows) {
    const limit = Number(b.amount_limit);
    const spent = Number(b.spent);
    const pct = limit > 0 ? ((spent / limit) * 100).toFixed(0) : "0";
    const status = spent > limit ? "DÉPASSÉ" : spent > limit * 0.8 ? "à risque" : "ok";
    if (status === "DÉPASSÉ") exceededCount++;
    lines.push(`- ${b.category} : ${spent.toLocaleString("fr-FR")}/${limit.toLocaleString("fr-FR")} ${account.currency} (${pct}%, ${status})`);
  }
  if (exceededCount > 0) {
    lines.push(`\n⚠ ALERTE : ${exceededCount} budget(s) dépassé(s) ce mois — mentionner proactivement dans la réponse`);
  }
}
```

### Amélioration `SYSTEM_PROMPT` dans `src/lib/ai-context.ts`

```typescript
export const SYSTEM_PROMPT = `Tu es un conseiller financier expert, spécialisé en gestion budgétaire, épargne et optimisation financière personnelle.
Tu parles français. Tu es direct, honnête, sans langue de bois. Pas de formules de politesse inutiles.
Tu analyses les données financières fournies et tu donnes des conseils concrets et actionnables.

Règles importantes :
- Si des budgets sont dépassés (indiqués par "DÉPASSÉ"), MENTIONNE-LE dans ta première phrase. Ne l'oublie pas.
- Si l'utilisateur a des objectifs d'épargne, intègre-les dans tes calculs. Si il est en retard, recalcule le montant mensuel nécessaire pour les atteindre.
- Tu identifies les dépenses superflues, calcules le reste à vivre après charges fixes, et proposes un plan d'épargne réaliste.
- Si la situation est critique (surendettement, découvert chronique), tu le dis clairement et tu orientes vers les solutions adaptées.
- Tu ne tournes pas autour du pot. Tu donnes des chiffres précis basés sur les données.
- Quand tu fais des calculs, montre-les.`;
```

---

## Tests unitaires

**Fichier :** `tests/unit/lib/ai-context.test.ts`

**TU-1-1 :** `buildFinancialContext()` avec goals actifs → output contient "Objectifs d'épargne" et le nom du goal
**TU-1-2 :** `buildFinancialContext()` avec budget dépassé → output contient "DÉPASSÉ" et "⚠ ALERTE"
**TU-1-3 :** `buildFinancialContext()` sans goals → section "Objectifs d'épargne" absente (pas de section vide)
**TU-1-4 :** `buildFinancialContext()` sans budgets → section "Budgets" absente
**TU-1-5 :** `buildFinancialContext()` avec budget à 85% → statut "à risque" dans l'output

> **Note technique pour les tests :** Mocker `db.execute()` avec `vi.fn()` retournant des données de test. Pattern existant dans `tests/unit/lib/` pour référence.

---

## Données de test

```typescript
// Mock db retournant un goal "Épargne vacances" à 60%
const mockGoal = { name: "Épargne vacances", target_amount: 1000, current_amount: 600, deadline: "2026-07-01", status: "active" };

// Mock db retournant un budget Loisirs dépassé
const mockBudget = { category: "Loisirs", amount_limit: 200, spent: 250 };
// → output devra contenir "DÉPASSÉ" et "⚠ ALERTE"
```

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `src/lib/ai-context.ts` | MODIFIER — ajouter sections goals + budgets dans `buildFinancialContext()` + améliorer `SYSTEM_PROMPT` |
| `tests/unit/lib/ai-context.test.ts` | CRÉER — 5 tests |
