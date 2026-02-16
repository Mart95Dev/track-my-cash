"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

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
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Comptes à analyser</p>
      {accounts.map((account) => {
        const balance = account.calculated_balance ?? account.initial_balance;
        return (
          <div key={account.id} className="flex items-center gap-2">
            <Checkbox
              id={`account-${account.id}`}
              checked={selectedIds.includes(account.id)}
              onCheckedChange={() => onToggle(account.id)}
            />
            <Label htmlFor={`account-${account.id}`} className="text-sm cursor-pointer">
              {account.name} — {formatCurrency(balance, account.currency)}
            </Label>
          </div>
        );
      })}
      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucun compte créé</p>
      )}
    </div>
  );
}
