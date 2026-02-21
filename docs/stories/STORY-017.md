# STORY-017 — Budgets par catégorie

**Epic :** Features Utilisateur
**Priorité :** P3
**Complexité :** L
**Statut :** pending
**Bloquée par :** aucune

---

## User Story

En tant qu'utilisateur,
je veux définir un budget mensuel ou annuel par catégorie de dépenses,
afin de savoir si je dépense trop dans certaines catégories et ajuster mon comportement.

---

## Contexte technique

- Nouvelle table `budgets` à ajouter dans le schéma (migration dans `src/lib/db.ts`)
- Les catégories larges sont dans `CATEGORIES` de `src/lib/format.ts`
- Le calcul des dépenses réelles utilise la table `transactions` de la DB per-user
- Période "mois en cours" : du 1er au dernier jour du mois actuel
- UI : dans `/parametres` (section dédiée) ou nouvelle page `/budgets`
- Dashboard : afficher les barres de progression si des budgets sont définis

---

## Schéma de la nouvelle table

```sql
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount_limit REAL NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly' CHECK(period IN ('monthly', 'yearly')),
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_account_category ON budgets(account_id, category);
```

---

## Acceptance Criteria

- [ ] AC-1 : L'utilisateur peut créer un budget mensuel ou annuel par catégorie et par compte
- [ ] AC-2 : Un seul budget par catégorie par compte (contrainte UNIQUE — `upsert` si on recrée)
- [ ] AC-3 : Le dashboard affiche une barre de progression (0→100%) pour chaque budget du mois en cours
- [ ] AC-4 : La barre passe en `text-expense` / rouge quand dépassée (>100%)
- [ ] AC-5 : `getBudgetStatus(db, accountId)` retourne `{ category, spent, limit, percentage, period }[]`
- [ ] AC-6 : Le calcul de `spent` ne prend en compte que les dépenses (`type = 'expense'`) de la période en cours
- [ ] AC-7 : Un budget peut être modifié (montant, période) ou supprimé
- [ ] AC-8 : Si aucun budget n'est défini → la section budgets est masquée dans le dashboard

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/lib/db.ts` | Modifier — ajouter création table `budgets` dans `initSchema()` |
| `src/lib/queries.ts` | Modifier — ajouter `getBudgets`, `getBudgetStatus`, `upsertBudget`, `deleteBudget` |
| `src/app/actions/budget-actions.ts` | Créer — Server Actions CRUD budgets |
| `src/components/budget-form.tsx` | Créer — formulaire création/édition budget |
| `src/components/budget-progress.tsx` | Créer — barre de progression budget |
| `src/app/[locale]/(app)/page.tsx` | Modifier — afficher les budgets si définis |
| `src/app/[locale]/(app)/parametres/page.tsx` | Modifier — section gestion des budgets |

---

## Implémentation clé

```typescript
// src/lib/queries.ts

export interface BudgetStatus {
  category: string;
  spent: number;
  limit: number;
  percentage: number; // spent / limit * 100
  period: "monthly" | "yearly";
}

export async function getBudgetStatus(
  db: Client,
  accountId: number
): Promise<BudgetStatus[]> {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const result = await db.execute({
    sql: `
      SELECT b.category, b.amount_limit, b.period,
             COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      LEFT JOIN transactions t ON t.account_id = b.account_id
        AND t.category = b.category
        AND t.type = 'expense'
        AND t.date >= ? AND t.date <= ?
      WHERE b.account_id = ?
      GROUP BY b.id
    `,
    args: [firstDay, lastDay, accountId],
  });

  return result.rows.map((row) => ({
    category: String(row.category),
    spent: Number(row.spent),
    limit: Number(row.amount_limit),
    percentage: (Number(row.spent) / Number(row.amount_limit)) * 100,
    period: String(row.period) as "monthly" | "yearly",
  }));
}
```

---

## Tests unitaires

### TU-1 : getBudgetStatus — logique de calcul
**Fichier :** `tests/unit/queries/budget-status.test.ts`

```
TU-1-1 : getBudgetStatus retourne [] si aucun budget n'est défini
TU-1-2 : spent = 0 si aucune transaction de la catégorie dans le mois
TU-1-3 : spent = somme correcte des dépenses du mois (pas les revenus)
TU-1-4 : Les transactions hors période (mois précédent) ne sont pas comptées
TU-1-5 : percentage = (spent / limit) * 100 arrondi correctement
TU-1-6 : percentage peut dépasser 100 (budget dépassé)
```

### TU-2 : BudgetProgress — rendu visuel
**Fichier :** `tests/unit/components/budget-progress.test.tsx`

```
TU-2-1 : La barre affiche "65%" si percentage = 65
TU-2-2 : La barre a la classe text-expense si percentage > 100
TU-2-3 : La barre affiche le nom de la catégorie
TU-2-4 : La barre affiche "Dépensé : X € / Budget : Y €"
```

---

## Fixtures / données de test

```typescript
const mockBudgets = [
  { category: "Alimentation", amount_limit: 400, period: "monthly" },
  { category: "Transport", amount_limit: 100, period: "monthly" },
];

const mockTransactions = [
  // Mois en cours
  { category: "Alimentation", type: "expense", amount: 150, date: "2026-02-10" },
  { category: "Alimentation", type: "expense", amount: 200, date: "2026-02-20" },
  // Mois précédent — NE DOIT PAS être compté
  { category: "Alimentation", type: "expense", amount: 500, date: "2026-01-15" },
];
// Expected: Alimentation spent=350, percentage=87.5
```

---

## Estimation

**Points :** 8
**Durée estimée :** 5-6h
