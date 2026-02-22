"use client";

import { useState, useTransition } from "react";
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
import { toast } from "sonner";
import { createGoalAction, updateGoalAction } from "@/app/actions/goals-actions";
import type { Account, Goal } from "@/lib/queries";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

type Props = {
  goal?: Goal;
  accounts?: Account[];
  onSuccess?: () => void;
};

export function GoalForm({ goal, accounts = [], onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(goal?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(goal ? String(goal.target_amount) : "");
  const [currentAmount, setCurrentAmount] = useState(goal ? String(goal.current_amount) : "0");
  const [currency, setCurrency] = useState(goal?.currency ?? "EUR");
  const [deadline, setDeadline] = useState(goal?.deadline ?? "");
  const [accountId, setAccountId] = useState(goal?.account_id ? String(goal.account_id) : "");
  const [monthlyContribution, setMonthlyContribution] = useState(
    goal?.monthly_contribution ? String(goal.monthly_contribution) : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const target = parseFloat(targetAmount);
      const current = parseFloat(currentAmount);
      if (isNaN(target) || target <= 0) {
        toast.error("Le montant cible doit être supérieur à 0");
        return;
      }
      const parsedAccountId = accountId ? parseInt(accountId) : undefined;
      const parsedContrib = monthlyContribution ? parseFloat(monthlyContribution) : undefined;

      const result = goal
        ? await updateGoalAction(goal.id, {
            name,
            target_amount: target,
            current_amount: current,
            currency,
            deadline: deadline || null,
            account_id: parsedAccountId ?? null,
            monthly_contribution: parsedContrib ?? 0,
          })
        : await createGoalAction(name, target, current, currency, deadline || undefined, parsedAccountId, parsedContrib);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(goal ? "Objectif modifié" : "Objectif créé");
        onSuccess?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="goal-name">Nom de l&apos;objectif</Label>
        <Input
          id="goal-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Voyage Japon, Fonds d'urgence..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="goal-target">Montant cible</Label>
          <Input
            id="goal-target"
            type="number"
            min="0.01"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="3000"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goal-current">Montant actuel</Label>
          <Input
            id="goal-current"
            type="number"
            min="0"
            step="0.01"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="goal-currency">Devise</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="goal-currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goal-deadline">Échéance (optionnel)</Label>
          <Input
            id="goal-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      {accounts.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-account">Compte associé (optionnel)</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger id="goal-account">
                <SelectValue placeholder="Aucun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-contribution">Versement mensuel auto. (optionnel)</Label>
            <Input
              id="goal-contribution"
              type="number"
              min="0"
              step="0.01"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enregistrement..." : goal ? "Modifier" : "Créer l'objectif"}
      </Button>
    </form>
  );
}
