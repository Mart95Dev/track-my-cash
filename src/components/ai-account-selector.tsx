"use client";

import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface Account {
  id: number;
  name: string;
  currency: string;
  calculated_balance?: number;
  initial_balance: number;
}

export function AiAccountSelector({
  accounts,
  selectedIds,
  onToggle,
}: {
  accounts: Account[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  const allSelected = accounts.length > 0 && selectedIds.length === accounts.length;

  function toggleAll() {
    if (allSelected) {
      accounts.forEach((a) => {
        if (selectedIds.includes(a.id)) onToggle(a.id);
      });
    } else {
      accounts.forEach((a) => {
        if (!selectedIds.includes(a.id)) onToggle(a.id);
      });
    }
  }

  if (accounts.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun compte créé</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Comptes à analyser
      </p>

      <div className="space-y-1.5">
        {accounts.map((account) => {
          const balance = account.calculated_balance ?? account.initial_balance;
          const isSelected = selectedIds.includes(account.id);
          return (
            <button
              key={account.id}
              onClick={() => onToggle(account.id)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-transparent opacity-50 hover:opacity-75"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{account.name}</span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {account.currency}
                </Badge>
              </div>
              <p
                className={`text-xs mt-0.5 font-mono ${
                  balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(balance, account.currency)}
              </p>
            </button>
          );
        })}
      </div>

      <button
        onClick={toggleAll}
        className="w-full text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg py-2 transition-colors"
      >
        {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
      </button>
    </div>
  );
}
