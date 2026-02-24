# STORY-072 — Dashboard : Refonte complète

**Sprint :** Design Stitch (v10)
**Épique :** app-ui
**Priorité :** P1
**Complexité :** L (4 points)
**Statut :** pending
**Bloqué par :** STORY-069

---

## Description

Refonte complète de la page Dashboard — la page la plus complexe de l'application. Le nouveau design mobile-first utilise un header personnalisé avec avatar, des pills de sélection de compte en scroll horizontal, une balance card proéminente, 3 KPI cards en grille, un Health Score en SVG circulaire, un graphe SVG de l'évolution du solde, et des sections budgets/objectifs avec design card.

**Logique préservée :** toutes les Server Actions et queries existantes (`getAccounts`, `getMonthlySummary`, `getBudgetStatuses`, `getGoals`, `computeHealthScore`, etc.).

---

## Acceptance Criteria

- **AC-1 :** Le header affiche les initiales de l'utilisateur dans un cercle `bg-primary` + "Bonjour, [prénom]"
- **AC-2 :** Les account pills permettent de changer de compte (logique `AccountFilter` préservée)
- **AC-3 :** La balance card affiche le solde total calculé réel avec badge variation MoM
- **AC-4 :** Les 3 KPI cards (Revenus / Dépenses / Récurrents) affichent les données réelles du mois
- **AC-5 :** Le `<HealthScoreWidget>` affiche le score calculé avec SVG circle progress
- **AC-6 :** La section Budgets affiche jusqu'à 3 budgets avec progress bar colorée (success/warning/danger)
- **AC-7 :** La section Goals affiche jusqu'à 2 objectifs dans une card `bg-primary`
- **AC-8 :** Pas de données fictives — toutes les valeurs viennent des queries existantes
- **AC-9 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(app)/dashboard/page.tsx` | MODIFIER | Restructuration complète du JSX |
| `src/components/health-score-widget.tsx` | MODIFIER | Adapter au nouveau design SVG |
| `src/components/kpi-cards.tsx` | CRÉER | 3 colonnes KPI avec icônes Material Symbols |
| `src/components/balance-card.tsx` | CRÉER | Card solde total avec badge variation |
| `src/components/spending-donut.tsx` | CRÉER | Donut SVG inline par catégorie |
| `src/components/balance-evolution-chart.tsx` | MODIFIER | SVG path inline, sans Recharts |
| `src/components/savings-goals-widget.tsx` | MODIFIER | Adapter au nouveau design card primary |
| `src/components/budget-progress.tsx` | MODIFIER | Adapter couleur dynamique (success/warning/danger) |

---

## Composant KpiCards

```typescript
// src/components/kpi-cards.tsx
type KpiCardsProps = {
  revenue: number;
  expenses: number;
  recurring: number;
  currency: string;
  locale: string;
};

export function KpiCards({ revenue, expenses, recurring, currency, locale }: KpiCardsProps) {
  const fmt = (n: number) => formatCurrency(n, currency, locale);
  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      <KpiCard icon="arrow_downward" iconBg="bg-green-100" iconColor="text-success"  label="Revenus"   value={fmt(revenue)} />
      <KpiCard icon="arrow_upward"   iconBg="bg-red-100"   iconColor="text-danger"   label="Dépenses"  value={fmt(expenses)} />
      <KpiCard icon="autorenew"      iconBg="bg-primary/10" iconColor="text-primary" label="Récurrents" value={fmt(recurring)} />
    </div>
  );
}

function KpiCard({ icon, iconBg, iconColor, label, value }: {
  icon: string; iconBg: string; iconColor: string; label: string; value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl p-4 bg-white shadow-soft border border-gray-100">
      <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor} mb-1`}>
        <span className="material-symbols-outlined" style={{fontSize: "18px"}}>{icon}</span>
      </div>
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p className="text-text-main text-base font-bold tracking-tight">{value}</p>
    </div>
  );
}
```

## Composant BalanceCard

```typescript
// src/components/balance-card.tsx
type BalanceCardProps = {
  totalBalance: number;
  currency: string;
  locale: string;
  momVariation?: number;   // % variation MoM, peut être undefined
};

export function BalanceCard({ totalBalance, currency, locale, momVariation }: BalanceCardProps) {
  const isPositive = (momVariation ?? 0) >= 0;
  return (
    <div className="mx-4 mb-4 p-6 rounded-2xl bg-white shadow-soft border border-gray-100">
      <p className="text-text-muted text-sm font-medium mb-1">Solde total</p>
      <div className="flex items-end gap-2 mb-4">
        <h1 className="text-4xl font-extrabold text-text-main tracking-tight">
          {formatCurrency(totalBalance, currency, locale)}
        </h1>
        {momVariation !== undefined && (
          <span className={`mb-1.5 px-2 py-0.5 text-xs font-bold rounded-md ${
            isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}>
            {isPositive ? "+" : ""}{momVariation.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
```

## Health Score Widget (adapté)

```typescript
// src/components/health-score-widget.tsx (version refonte)
type HealthScoreWidgetProps = {
  score: number;  // 0-100
};

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bien";
  if (score >= 40) return "Attention";
  return "Critique";
}

export function HealthScoreWidget({ score }: HealthScoreWidgetProps) {
  const circumference = 2 * Math.PI * 15.9155;
  const dashArray = `${(score / 100) * circumference} ${circumference}`;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path fill="none" stroke="currentColor" strokeWidth="3"
            className="text-gray-100"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
            className="text-primary"
            strokeDasharray={dashArray}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-text-main">{score}</span>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{getScoreLabel(score)}</span>
        </div>
      </div>
      <p className="mt-3 text-xs font-bold text-text-main">Santé financière</p>
    </div>
  );
}
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/dashboard-components.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-72-1 | `<KpiCards>` rendu : 3 valeurs affichées | 3 éléments avec les montants formatés |
| TU-72-2 | `<KpiCards>` : icône `arrow_downward` présente | dans le DOM |
| TU-72-3 | `<BalanceCard>` : affiche le montant formaté | `getByText` avec montant |
| TU-72-4 | `<BalanceCard>` : badge MoM positif → `text-success` | classe CSS correcte |
| TU-72-5 | `<BalanceCard>` : badge MoM négatif → `text-danger` | classe CSS correcte |
| TU-72-6 | `<HealthScoreWidget score={72}>` : affiche "72" | `getByText("72")` |
| TU-72-7 | `<HealthScoreWidget score={85}>` : label "Excellent" | `getByText("Excellent")` |
| TU-72-8 | `<HealthScoreWidget score={50}>` : label "Bien" | `getByText("Bien")` |
| TU-72-9 | `<HealthScoreWidget score={30}>` : label "Attention" | `getByText("Attention")` |
| TU-72-10 | `getScoreLabel(80)` retourne "Excellent" | test fonction pure |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Intégration page (initiales user) |
| AC-2 | Intégration AccountFilter |
| AC-3 | TU-72-3, TU-72-4, TU-72-5 |
| AC-4 | TU-72-1, TU-72-2 |
| AC-5 | TU-72-6 à TU-72-10 |
| AC-6 | Intégration budgets + BudgetProgress |
| AC-7 | Intégration goals |
| AC-8 | Code review (pas de props fictives) |
| AC-9 | `npm run build` |

---

## Structure page Dashboard (ordre d'affichage)

```tsx
// src/app/[locale]/(app)/dashboard/page.tsx
export default async function DashboardPage({ searchParams }) {
  const session = await getSession();
  const user = session.user;
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);

  // ... chargement données existant (Promise.all) ...

  return (
    <div className="flex flex-col pb-2">
      {/* 1. Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
            {initials}
          </div>
          <div>
            <p className="text-text-muted text-sm">Bonjour,</p>
            <h2 className="text-text-main text-xl font-bold">{user.name.split(" ")[0]}</h2>
          </div>
        </div>
        <NotificationsBell ... />
      </header>

      {/* 2. Account Selector Pills */}
      <AccountFilter ... />

      {/* 3. Balance Card */}
      <BalanceCard totalBalance={...} currency={...} momVariation={...} />

      {/* 4. KPI Cards */}
      <KpiCards revenue={...} expenses={...} recurring={...} />

      {/* 5. Health Score + Spending (grid 2 col) */}
      <div className="grid grid-cols-2 gap-4 px-4 my-4">
        <HealthScoreWidget score={healthScore} />
        <SpendingDonut categories={topCategories} />
      </div>

      {/* 6. Balance Evolution */}
      <div className="px-4 mb-4">
        <BalanceEvolutionChart data={monthlySummary} />
      </div>

      {/* 7. Budgets (3 max) */}
      <section className="px-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-text-main">Budgets</h3>
          <Link href="/budgets" className="text-primary text-sm font-bold">Voir tout</Link>
        </div>
        {budgetStatuses.slice(0, 3).map(b => <BudgetProgress key={b.category} budget={b} />)}
      </section>

      {/* 8. Savings Goals */}
      <section className="px-4 mb-4">
        <h3 className="text-lg font-bold text-text-main mb-3">Objectifs d'épargne</h3>
        <SavingsGoalsWidget goals={goals.slice(0, 2)} />
      </section>
    </div>
  );
}
```

---

## Notes d'implémentation

1. **`<AccountFilter>`** : déjà `"use client"` — s'assure qu'il utilise les classes tokens (pill style)
2. **`<BudgetProgress>`** : ajouter couleur dynamique → `< 60%` = `bg-success`, `< 90%` = `bg-warning`, `>= 90%` = `bg-danger`
3. **`<SpendingDonut>`** : nouveau composant SVG inline — ne nécessite pas Recharts. Utiliser les mêmes couleurs que les catégories (tableau fixe de 8 couleurs)
4. **`<BalanceEvolutionChart>`** : peut rester Recharts (déjà implémenté) mais adapter le style (fond blanc, pas de grille visible, couleur primary)
5. **Pas de données fictives** : toutes les valeurs viennent des queries — si vides, afficher un `EmptyState` cohérent
6. **`SavingsGoalsWidget`** : card `bg-primary` (fond uni, pas de dégradé) — adapter l'existant
