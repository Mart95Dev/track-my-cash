"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CurrencySettings({
  liveRate,
  fallbackRate,
  onSaveFallback,
}: {
  liveRate: number;
  fallbackRate: number;
  onSaveFallback: (rate: number) => Promise<{ success?: boolean; error?: string }>;
}) {
  const [rate, setRate] = useState(String(fallbackRate));
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-1">
        <p className="text-sm font-medium">Taux en temps réel (Frankfurter API)</p>
        <p className="text-2xl font-bold">1 EUR = {liveRate.toLocaleString("fr-FR")} MGA</p>
        <p className="text-xs text-muted-foreground">Mis à jour automatiquement toutes les heures. Utilisé pour la conversion sur le dashboard.</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Taux de secours (si l'API est indisponible)</p>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="fallback-rate" className="text-xs">Taux EUR/MGA</Label>
            <Input
              id="fallback-rate"
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await onSaveFallback(parseFloat(rate));
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Taux de secours mis à jour");
                }
              });
            }}
          >
            {isPending ? "..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
