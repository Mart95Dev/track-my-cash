"use client";

import { useState, useTransition } from "react";
import type { Goal } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
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
import { Pencil, Trash2, Target } from "lucide-react";

type Props = {
  goals: Goal[];
};

function getProgressColor(pct: number): string {
  if (pct >= 100) return "bg-income";
  if (pct >= 50) return "bg-amber-500";
  return "bg-expense";
}

function formatCurrencyDisplay(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
      <div className="text-center py-8 text-muted-foreground">
        <Target className="mx-auto h-10 w-10 mb-2 opacity-30" />
        <p className="text-sm">Aucun objectif pour l&apos;instant.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {goals.map((goal) => {
          const pct = goal.target_amount > 0
            ? Math.round((goal.current_amount / goal.target_amount) * 100)
            : 0;
          const clampedPct = Math.min(pct, 100);

          return (
            <Card key={goal.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Échéance&nbsp;: {new Date(goal.deadline).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditGoal(goal)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(goal.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrencyDisplay(goal.current_amount, goal.currency)}</span>
                    <span className={`font-semibold ${pct >= 100 ? "text-income" : ""}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(pct)}`}
                      style={{ width: `${clampedPct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    Objectif&nbsp;: {formatCurrencyDisplay(goal.target_amount, goal.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
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
