"use client";

import { useState, useTransition } from "react";
import type { Goal } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoalForm } from "@/components/goal-form";
import { deleteGoalAction } from "@/app/actions/goals-actions";
import { toast } from "sonner";

type Props = {
  goals: Goal[];
};

function getProgressColor(pct: number): string {
  if (pct >= 100) return "bg-success";
  if (pct >= 50) return "bg-warning";
  return "bg-primary";
}

function getProgressBadgeColor(pct: number): string {
  if (pct >= 100) return "bg-success/10 text-success";
  if (pct >= 50) return "bg-warning/10 text-warning";
  return "bg-primary/10 text-primary";
}

function formatCurrencyDisplay(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDaysRemaining(deadline: string): string {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Dépassé";
  if (diff === 0) return "Aujourd'hui";
  if (diff > 365) return "Long terme";
  return `J-${diff}`;
}

export function GoalList({ goals }: Props) {
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteGoalAction(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Objectif supprimé");
      }
    });
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">savings</span>
        <p className="text-text-muted text-sm">Aucun objectif pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {goals.map((goal) => {
          const pct = goal.target_amount > 0
            ? Math.round((goal.current_amount / goal.target_amount) * 100)
            : 0;
          const clampedPct = Math.min(pct, 100);
          const badgeColor = getProgressBadgeColor(pct);
          const barColor = getProgressColor(pct);

          return (
            <div key={goal.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
              {/* Top row: name + actions */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-text-main">{goal.name}</p>
                    {pct >= 100 && (
                      <span className="material-symbols-outlined text-success text-[16px]">check_circle</span>
                    )}
                  </div>
                  {goal.deadline && (
                    <p className="text-xs text-text-muted mt-0.5">
                      Échéance&nbsp;: {new Date(goal.deadline).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {goal.deadline && (
                    <span className="text-xs font-bold rounded-full px-2.5 py-1 bg-primary/10 text-primary mr-1">
                      {getDaysRemaining(goal.deadline)}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-muted hover:text-text-main"
                    onClick={() => setEditGoal(goal)}
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-muted hover:text-danger"
                    onClick={() => handleDelete(goal.id)}
                    disabled={isPending}
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </Button>
                </div>
              </div>

              {/* Amounts row */}
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-text-muted text-xs">
                  {formatCurrencyDisplay(goal.current_amount, goal.currency)} sur {formatCurrencyDisplay(goal.target_amount, goal.currency)}
                </p>
                <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${badgeColor}`}>
                  {clampedPct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${clampedPct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              {/* Monthly contribution */}
              {goal.monthly_contribution > 0 && (
                <p className="text-xs text-text-muted mt-2">
                  Versement mensuel&nbsp;: {formatCurrencyDisplay(goal.monthly_contribution, goal.currency)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={editGoal !== null} onOpenChange={(o) => !o && setEditGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;objectif</DialogTitle>
          </DialogHeader>
          {editGoal && (
            <GoalForm
              goal={editGoal}
              onSuccess={() => setEditGoal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
