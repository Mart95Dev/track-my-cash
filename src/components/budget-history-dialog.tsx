"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History } from "lucide-react";
import { getBudgetHistoryAction } from "@/app/actions/budget-history-actions";
import type { BudgetHistoryEntry } from "@/lib/queries";

interface BudgetHistoryDialogProps {
  accountId: number;
  category: string;
  currency?: string;
}

function fmt(n: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function BudgetHistoryDialog({ accountId, category, currency = "EUR" }: BudgetHistoryDialogProps) {
  const [history, setHistory] = useState<BudgetHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function handleOpen(open: boolean) {
    if (open && !loaded) {
      const data = await getBudgetHistoryAction(accountId, category);
      setHistory(data);
      setLoaded(true);
    }
  }

  return (
    <Dialog onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
          <History className="h-3 w-3" />
          Historique
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Historique — {category}</DialogTitle>
        </DialogHeader>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Aucun historique disponible. Les données s&apos;accumuleront au fil des mois.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium">Mois</th>
                  <th className="text-right py-2 pr-3 font-medium">Limite</th>
                  <th className="text-right py-2 pr-3 font-medium">Dépensé</th>
                  <th className="text-right py-2 pr-3 font-medium">%</th>
                  <th className="text-right py-2 font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, i) => {
                  const pct = entry.limit_amount > 0
                    ? (entry.spent_amount / entry.limit_amount) * 100
                    : 0;
                  const prev = history[i + 1];
                  const delta = prev !== undefined ? entry.spent_amount - prev.spent_amount : null;
                  return (
                    <tr key={entry.id} className="border-b border-border/40">
                      <td className="py-2 pr-3 font-medium">{entry.month}</td>
                      <td className="text-right py-2 pr-3 text-muted-foreground">
                        {fmt(entry.limit_amount, currency)}
                      </td>
                      <td className="text-right py-2 pr-3">{fmt(entry.spent_amount, currency)}</td>
                      <td className={`text-right py-2 pr-3 font-medium ${
                        pct > 100 ? "text-expense" : pct > 80 ? "text-warning" : "text-income"
                      }`}>
                        {Math.round(pct)}%
                      </td>
                      <td className="text-right py-2">
                        {delta !== null ? (
                          <span className={
                            delta > 0 ? "text-expense" : delta < 0 ? "text-income" : "text-muted-foreground"
                          }>
                            {delta > 0 ? "+" : ""}{fmt(delta, currency)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
