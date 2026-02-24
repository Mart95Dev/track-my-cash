# STORY-076 — Pages Budgets + Objectifs : Refonte

**Sprint :** Design Stitch (v10)
**Épique :** app-ui
**Priorité :** P2
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-069

---

## Description

Refonte des pages `/budgets` et `/objectifs`. Les budgets passent à des cards avec progress bar colorée dynamiquement selon le taux d'utilisation (vert/orange/rouge). Les objectifs passent à des cards avec barre de progression `bg-primary` et badge deadline contextualisé.

**Logique préservée :** `getBudgetStatuses()`, `getGoals()`, `BudgetForm`, `BudgetSuggestions`, `GoalForm`, `GoalList`.

---

## Acceptance Criteria

### Budgets
- **AC-1 :** Chaque budget a une card blanche avec l'icône de catégorie, montant dépensé/total, et progress bar
- **AC-2 :** Progress bar colorée dynamiquement : < 60% → `bg-success`, 60-90% → `bg-warning`, ≥ 90% → `bg-danger`
- **AC-3 :** Badge % à droite avec la même couleur sémantique
- **AC-4 :** Section "Suggestions IA" présente si suggestions disponibles
- **AC-5 :** Le formulaire d'ajout de budget est accessible

### Objectifs
- **AC-6 :** Chaque objectif a une card blanche avec icône, nom, montant actuel/cible, progression
- **AC-7 :** La barre de progression est `bg-primary`
- **AC-8 :** Badge % atteint affiché
- **AC-9 :** Badge deadline : `bg-warning/10 text-warning` si deadline dans les 3 prochains mois, `bg-success/10 text-success` sinon
- **AC-10 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(app)/budgets/page.tsx` | MODIFIER | Restructuration JSX |
| `src/app/[locale]/(app)/objectifs/page.tsx` | MODIFIER | Restructuration JSX |
| `src/components/budget-progress.tsx` | MODIFIER | Couleur dynamique progress bar |

---

## Design BudgetProgress (refonte)

```typescript
// src/components/budget-progress.tsx
type BudgetProgressProps = {
  budget: BudgetStatus;
  currency: string;
  locale?: string;
};

function getBudgetColor(percent: number): string {
  if (percent >= 90) return "bg-danger";
  if (percent >= 60) return "bg-warning";
  return "bg-success";
}

function getBudgetBadgeColor(percent: number): string {
  if (percent >= 90) return "bg-danger/10 text-danger";
  if (percent >= 60) return "bg-warning/10 text-warning";
  return "bg-success/10 text-success";
}

export function BudgetProgress({ budget, currency, locale }: BudgetProgressProps) {
  const percent = Math.min(Math.round((budget.spent / budget.limit) * 100), 100);
  const barColor = getBudgetColor(percent);
  const badgeColor = getBudgetBadgeColor(percent);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-warning">
            <span className="material-symbols-outlined text-[20px]">{getCategoryIcon(budget.category)}</span>
          </div>
          <div>
            <p className="font-bold text-text-main text-sm">{budget.category}</p>
            <p className="text-text-muted text-xs">
              {formatCurrency(budget.spent, currency, locale)} sur {formatCurrency(budget.limit, currency, locale)}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold rounded-md px-2 py-1 ${badgeColor}`}>
          {percent}%
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// Mapping catégorie → icône Material Symbol
function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    "Alimentation": "shopping_cart",
    "Transport": "directions_car",
    "Logement": "home",
    "Loisirs": "sports_esports",
    "Santé": "local_hospital",
    "Abonnements": "subscriptions",
    "Vêtements": "checkroom",
    "Restaurants": "restaurant",
  };
  return map[category] ?? "category";
}
```

## Design Goal Card

```tsx
function GoalCard({ goal }: { goal: Goal }) {
  const percent = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
  const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  const isSoonDeadline = deadlineDate && deadlineDate <= threeMonthsFromNow;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">savings</span>
          </div>
          <div>
            <p className="font-bold text-text-main">{goal.name}</p>
            <p className="text-text-muted text-sm">Objectif : {formatCurrency(goal.target_amount, "EUR")}</p>
          </div>
        </div>
        <span className="bg-primary/10 text-primary text-xs font-bold rounded-md px-2 py-1">
          {percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-text-muted text-sm">
          {formatCurrency(goal.current_amount, "EUR")} atteint
        </p>
        {deadlineDate && (
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
            isSoonDeadline ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
          }`}>
            <span className="material-symbols-outlined text-[12px] mr-1">event</span>
            {formatDate(goal.deadline!)}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/budget-goal-components.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-76-1 | `getBudgetColor(30)` → `"bg-success"` | valeur correcte |
| TU-76-2 | `getBudgetColor(70)` → `"bg-warning"` | valeur correcte |
| TU-76-3 | `getBudgetColor(95)` → `"bg-danger"` | valeur correcte |
| TU-76-4 | `getBudgetColor(60)` → `"bg-warning"` (seuil exact) | valeur correcte |
| TU-76-5 | `getBudgetColor(90)` → `"bg-danger"` (seuil exact) | valeur correcte |
| TU-76-6 | `<BudgetProgress>` budget 30% → classe `bg-success` sur la barre | présente dans le DOM |
| TU-76-7 | `<BudgetProgress>` budget 95% → classe `bg-danger` sur la barre | présente |
| TU-76-8 | `<GoalCard>` progress 50% → affiche "50%" | `getByText("50%")` |
| TU-76-9 | `<GoalCard>` deadline dans 1 mois → badge warning | classe `text-warning` |
| TU-76-10 | `<GoalCard>` deadline dans 6 mois → badge success | classe `text-success` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Code review card style |
| AC-2 | TU-76-1 à TU-76-7 |
| AC-3 | TU-76-6, TU-76-7 |
| AC-4 | Code review BudgetSuggestions |
| AC-6 à AC-8 | TU-76-8 |
| AC-9 | TU-76-9, TU-76-10 |
| AC-5, AC-10 | `npm run build` |

---

## Notes d'implémentation

1. **`getBudgetColor` et `getBudgetBadgeColor`** : fonctions pures exportées pour tests unitaires
2. **`BudgetSuggestions`** : wrapper dans card blanche avec titre "Suggestions IA" + icône `auto_awesome`
3. **`GoalForm`** et **`BudgetForm`** : composants shadcn Dialog préservés — wrappés dans card ou accessible via bouton "+" avec icône
4. **`GoalList`** : remplacer par `GoalCard` itéré, ou adapter `GoalList` pour afficher le nouveau design
5. **Percent clamp** : `Math.min(percent, 100)` pour éviter les barres dépassant 100%
