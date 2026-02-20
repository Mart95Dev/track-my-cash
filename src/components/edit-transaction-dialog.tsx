"use client";

import { useState, useActionState, useEffect } from "react";
import { updateTransactionAction } from "@/app/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Account, Transaction } from "@/lib/queries";

interface Rule {
  pattern: string;
  category: string;
}

export function EditTransactionDialog({
  transaction,
  accounts,
  rules,
}: {
  transaction: Transaction;
  accounts: Account[];
  rules: Rule[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await updateTransactionAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Transaction mise à jour");
      setOpen(false);
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state]);

  const grouped = rules.reduce<Record<string, string[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r.pattern);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Éditer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la transaction</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={transaction.id} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <select name="type" defaultValue={transaction.type} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                <option value="expense">Dépense</option>
                <option value="income">Revenu</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Compte</Label>
              <select name="accountId" defaultValue={transaction.account_id} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Montant</Label>
              <Input name="amount" type="number" step="0.01" defaultValue={transaction.amount} required />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input name="date" type="date" defaultValue={transaction.date} required />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <select name="category" defaultValue={transaction.category} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, patterns]) => (
                  <optgroup key={cat} label={cat}>
                    {patterns.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </optgroup>
                ))}
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input name="description" defaultValue={transaction.description} />
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
