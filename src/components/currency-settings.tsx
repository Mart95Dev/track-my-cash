"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CurrencySettings({
  currentRate,
  onSave,
}: {
  currentRate: number;
  onSave: (rate: number) => Promise<{ success?: boolean; error?: string }>;
}) {
  const [rate, setRate] = useState(String(currentRate));
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="exchange-rate" className="text-sm">Taux EUR/MGA</Label>
        <Input
          id="exchange-rate"
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
            const result = await onSave(parseFloat(rate));
            if (result.error) {
              toast.error(result.error);
            } else {
              toast.success("Taux de change mis à jour");
            }
          });
        }}
      >
        {isPending ? "..." : "Enregistrer"}
      </Button>
      <p className="text-xs text-muted-foreground">
        1 EUR = {rate} MGA
      </p>
    </div>
  );
}
