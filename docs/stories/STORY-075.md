# STORY-075 — Pages Récurrents + Prévisions : Refonte

**Sprint :** Design Stitch (v10)
**Épique :** app-ui
**Priorité :** P2
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-069

---

## Description

Refonte des pages `/recurrents` et `/previsions`. Les paiements récurrents passent à des cards avec badge de fréquence coloré et icônes Material Symbols. La page prévisions intègre 4 KPI cards en scroll horizontal, un tableau mensuel propre, et conserve le ScenarioSimulator existant.

**Logique préservée :** `getRecurringPayments()`, `detectRecurringSuggestionsAction`, `RecurringForm`, `EditRecurringDialog`, `DeleteRecurringButton`, `RecurringSuggestions`, `computeForecast()`, `ForecastTable`, `AIForecastInsights`, `ScenarioSimulator`.

---

## Acceptance Criteria

### Récurrents
- **AC-1 :** Chaque paiement récurrent est dans une card blanche avec badge fréquence
- **AC-2 :** Le badge fréquence utilise `bg-indigo-50 text-primary` : "Mensuel" / "Hebdo" / "Annuel" / "Trimestriel"
- **AC-3 :** Le montant est `text-success` pour income, `text-danger` pour expense
- **AC-4 :** La prochaine date est affichée en `text-text-muted text-xs`
- **AC-5 :** Les suggestions IA s'affichent dans une section collapsible (`<details>`) si disponibles

### Prévisions
- **AC-6 :** 4 KPI cards en scroll horizontal (Solde actuel / Revenus/mois / Dépenses/mois / Solde projeté)
- **AC-7 :** Le tableau mensuel est dans une card blanche avec lignes alternées
- **AC-8 :** Les insights IA (Premium) s'affichent si disponibles (guard préservé)
- **AC-9 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(app)/recurrents/page.tsx` | MODIFIER | Restructuration JSX |
| `src/app/[locale]/(app)/previsions/page.tsx` | MODIFIER | Restructuration JSX |

---

## Design Recurring Item

```tsx
const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Hebdo",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  yearly: "Annuel",
};

function RecurringItem({ payment }: { payment: RecurringPayment }) {
  const isIncome = payment.type === "income";
  const freqLabel = FREQUENCY_LABELS[payment.frequency] ?? payment.frequency;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icône catégorie */}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">autorenew</span>
          </div>
          <div>
            <p className="font-medium text-text-main">{payment.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-indigo-50 text-primary text-xs font-medium rounded-full px-2 py-0.5">
                {freqLabel}
              </span>
              {payment.next_date && (
                <span className="text-text-muted text-xs">
                  Prochain : {formatDate(payment.next_date)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className={`font-bold text-lg ${isIncome ? "text-success" : "text-danger"}`}>
            {isIncome ? "+" : "-"}{formatCurrency(Math.abs(payment.amount), payment.currency ?? "EUR")}
          </p>
          <EditRecurringDialog payment={payment}>
            <button className="p-1 rounded-lg hover:bg-gray-100 text-text-muted">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </EditRecurringDialog>
          <DeleteRecurringButton paymentId={payment.id} />
        </div>
      </div>
    </div>
  );
}
```

## Design Prévisions KPI

```tsx
{/* 4 KPIs en scroll horizontal */}
<div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2 mb-4">
  {[
    { label: "Solde actuel", value: forecast.currentBalance, icon: "account_balance", color: "text-primary" },
    { label: "Revenus/mois", value: forecast.monthlyRevenue, icon: "arrow_downward", color: "text-success" },
    { label: "Dépenses/mois", value: forecast.monthlyExpenses, icon: "arrow_upward", color: "text-danger" },
    { label: "Solde projeté", value: forecast.projectedBalance, icon: "trending_up", color: forecast.projectedBalance >= 0 ? "text-success" : "text-danger" },
  ].map((kpi) => (
    <div key={kpi.label} className="flex-shrink-0 w-36 bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
      <span className={`material-symbols-outlined ${kpi.color} text-[20px]`}>{kpi.icon}</span>
      <p className="text-text-muted text-xs font-medium mt-2">{kpi.label}</p>
      <p className="text-text-main font-bold mt-0.5">{formatCurrency(kpi.value, currency)}</p>
    </div>
  ))}
</div>
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/recurring-item.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-75-1 | Paiement income → montant `text-success` | classe présente |
| TU-75-2 | Paiement expense → montant `text-danger` | classe présente |
| TU-75-3 | Fréquence "monthly" → badge "Mensuel" | `getByText("Mensuel")` |
| TU-75-4 | Fréquence "weekly" → badge "Hebdo" | `getByText("Hebdo")` |
| TU-75-5 | Fréquence "yearly" → badge "Annuel" | `getByText("Annuel")` |
| TU-75-6 | `FREQUENCY_LABELS` : 4 entrées correctes | test objet |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | Code review card style |
| AC-2 | TU-75-3 à TU-75-6 |
| AC-3 | TU-75-1, TU-75-2 |
| AC-4 | Code review prochaine date |
| AC-5 | Code review `<details>` |
| AC-6 à AC-9 | `npm run build` |

---

## Notes d'implémentation

1. **`<RecurringSuggestions>`** : wrapper dans `<details><summary>Suggestions IA ({count})</summary>...</details>` pour le collapsible
2. **`<ForecastTable>`** : adapter le style table (card blanche, `divide-y divide-gray-100`, alternance `bg-gray-50/50`)
3. **`<ScenarioSimulator>`** : préserver intégralement — juste wrapper dans une card blanche
4. **`<ForecastControls>`** : adapter le style des selects (rounded-xl, ring-1)
