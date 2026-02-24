"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertBudgetAction, deleteBudgetAction } from "@/app/actions/budget-actions";
import { CATEGORIES } from "@/lib/format";
import type { Budget } from "@/lib/queries";

type Props = {
  accountId: number;
  budgets: Budget[];
};

export function BudgetForm({ accountId, budgets }: Props) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amountNum = parseFloat(amount);
    if (!category || isNaN(amountNum) || amountNum <= 0) {
      setError("Veuillez sélectionner une catégorie et saisir un montant valide.");
      return;
    }
    setLoading(true);
    const result = await upsertBudgetAction(accountId, category, amountNum, period);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setCategory("");
      setAmount("");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="budget-category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="budget-category">
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((c) => c.id !== "salaire" && c.id !== "virement").map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="budget-amount">Montant limite (€)</Label>
            <Input
              id="budget-amount"
              type="number"
              min="1"
              step="1"
              placeholder="ex: 400"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="budget-period">Période</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as "monthly" | "yearly")}>
              <SelectTrigger id="budget-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="yearly">Annuel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="sm" disabled={loading} className="bg-primary text-white font-bold rounded-full px-5">
          {loading ? "Enregistrement…" : "Enregistrer le budget"}
        </Button>
      </form>

      {budgets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Budgets configurés</p>
          <div className="flex flex-col gap-2">
            {budgets.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl bg-background-light px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-main">{b.category}</span>
                  <span className="text-xs font-bold rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                    {b.period === "monthly" ? "mensuel" : "annuel"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-text-main">
                    {b.amount_limit.toLocaleString("fr-FR")} €
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-muted hover:text-danger"
                    onClick={() => deleteBudgetAction(b.id)}
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
