"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface WeeklyEmailToggleProps {
  enabled: boolean;
  isPro: boolean;
  onToggle: (enabled: boolean) => Promise<{ success: boolean }>;
}

export function WeeklyEmailToggle({ enabled, isPro, onToggle }: WeeklyEmailToggleProps) {
  const [checked, setChecked] = useState(enabled);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: boolean) => {
    if (!isPro) return;
    setChecked(value);
    startTransition(async () => {
      await onToggle(value);
    });
  };

  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id="weekly-email"
        checked={checked}
        onCheckedChange={(v) => handleChange(v === true)}
        disabled={!isPro || isPending}
      />
      <div className="space-y-1">
        <Label htmlFor="weekly-email" className={!isPro ? "text-muted-foreground" : ""}>
          Récapitulatif hebdomadaire par email (lundi matin)
        </Label>
        {isPro ? (
          <p className="text-xs text-muted-foreground">
            Recevez chaque lundi un résumé IA de vos dépenses, budgets et objectifs de la semaine.
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Pro / Premium</Badge>
            <span className="text-xs text-muted-foreground">Fonctionnalité réservée aux plans Pro/Premium</span>
          </div>
        )}
      </div>
    </div>
  );
}
