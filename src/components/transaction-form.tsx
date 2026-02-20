"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTransactionAction } from "@/app/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySubcategoryPicker } from "@/components/category-subcategory-picker";
import { toast } from "sonner";
import type { Account } from "@/lib/queries";

interface Rule {
  pattern: string;
  category: string;
}

export function TransactionForm({
  accounts,
  rules,
  defaultAccountId,
}: {
  accounts: Account[];
  rules: Rule[];
  defaultAccountId?: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await createTransactionAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Transaction ajoutée");
      formRef.current?.reset();
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
          >
            <option value="expense">Dépense</option>
            <option value="income">Revenu</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountId">Compte</Label>
          <select
            id="accountId"
            name="accountId"
            defaultValue={defaultAccountId ?? ""}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
            required
          >
            <option value="">Sélectionner...</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant</Label>
          <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Ex: Courses" />
        </div>
      </div>
      <CategorySubcategoryPicker rules={rules} idPrefix="tx-new" />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Ajouter"}
      </Button>
    </form>
  );
}
