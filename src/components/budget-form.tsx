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
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer le budget"}
        </Button>
      </form>

      {budgets.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Budgets configurés</p>
          <div className="divide-y">
            {budgets.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2">
                <span className="text-sm">
                  <strong>{b.category}</strong> — {b.amount_limit.toLocaleString("fr-FR")} €
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({b.period === "monthly" ? "mensuel" : "annuel"})
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                  onClick={() => deleteBudgetAction(b.id)}
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
