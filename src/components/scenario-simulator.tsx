"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { simulateScenario } from "@/lib/scenario-simulator";
import type { BaseForecast } from "@/lib/scenario-simulator";

type TabType = "extra_savings" | "cut_expense" | "income_increase";

const TABS: { id: TabType; label: string }[] = [
  { id: "extra_savings", label: "Économies supplémentaires" },
  { id: "cut_expense", label: "Supprimer une dépense" },
  { id: "income_increase", label: "Hausse de revenus" },
];

interface ScenarioSimulatorProps {
  base: BaseForecast;
}

export function ScenarioSimulator({ base }: ScenarioSimulatorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("extra_savings");
  const [amount, setAmount] = useState(200);
  const [category, setCategory] = useState("Loisirs");

  const result = useMemo(
    () =>
      simulateScenario(base, {
        type: activeTab,
        amount,
        category: activeTab === "cut_expense" ? category : undefined,
      }),
    [base, activeTab, amount, category]
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  const fmtRate = (n: number) =>
    `${Math.max(0, n).toFixed(1)}%`;

  const impactLabel =
    activeTab === "income_increase" ? "Hausse annuelle de revenus" : "Gain d'épargne annuel";

  const inputLabel =
    activeTab === "extra_savings"
      ? "Montant supplémentaire à épargner (€/mois)"
      : activeTab === "cut_expense"
      ? "Dépense à supprimer (€/mois)"
      : "Hausse de revenus (%)";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Simulateur — Et si...</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Onglets */}
        <div className="flex gap-1 border-b">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setAmount(tab.id === "income_increase" ? 10 : 200); }}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{inputLabel}</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={activeTab === "income_increase" ? 100 : 2000}
                step={activeTab === "income_increase" ? 1 : 50}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <input
                type="number"
                min={0}
                max={activeTab === "income_increase" ? 100 : 9999}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground w-6">
                {activeTab === "income_increase" ? "%" : "€"}
              </span>
            </div>
          </div>

          {activeTab === "cut_expense" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Catégorie (informatif)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ex: Loisirs, Restaurants..."
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>

        {/* Tableau comparatif */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Indicateur</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Avant</th>
                <th className="px-4 py-2 text-right font-medium text-primary">Après</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground">Taux d&apos;épargne</td>
                <td className="px-4 py-2.5 text-right font-medium">
                  {fmtRate(result.baselineSavingsRate)}
                </td>
                <td className={`px-4 py-2.5 text-right font-semibold ${
                  result.projectedSavingsRate > result.baselineSavingsRate
                    ? "text-income"
                    : "text-muted-foreground"
                }`}>
                  {fmtRate(result.projectedSavingsRate)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-muted-foreground">Épargne mensuelle nette</td>
                <td className="px-4 py-2.5 text-right font-medium">
                  {fmt(base.avgMonthlyIncome - base.avgMonthlyExpenses)}
                </td>
                <td className={`px-4 py-2.5 text-right font-semibold ${
                  result.monthlyNetSavings >= (base.avgMonthlyIncome - base.avgMonthlyExpenses)
                    ? "text-income"
                    : "text-expense"
                }`}>
                  {fmt(result.monthlyNetSavings)}
                </td>
              </tr>
              <tr className="bg-muted/20">
                <td className="px-4 py-2.5 font-medium">{impactLabel}</td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">—</td>
                <td className={`px-4 py-2.5 text-right font-bold text-lg ${
                  result.annualImpact > 0 ? "text-income" : "text-muted-foreground"
                }`}>
                  {result.annualImpact > 0 ? "+" : ""}{fmt(result.annualImpact)}
                </td>
              </tr>
              {base.goals.length > 0 && (
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">Mois pour atteindre les objectifs</td>
                  <td className="px-4 py-2.5 text-right font-medium">
                    {(() => {
                      const baseline = base.avgMonthlyIncome - base.avgMonthlyExpenses;
                      if (baseline <= 0) return "—";
                      const remaining = base.goals.reduce(
                        (s, g) => s + Math.max(0, g.target_amount - g.current_amount), 0
                      );
                      return `${Math.ceil(remaining / baseline)} mois`;
                    })()}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${
                    result.monthsToGoal !== null ? "text-income" : "text-muted-foreground"
                  }`}>
                    {result.monthsToGoal !== null ? `${result.monthsToGoal} mois` : "—"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {amount === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Déplacez le curseur pour simuler un scénario.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
