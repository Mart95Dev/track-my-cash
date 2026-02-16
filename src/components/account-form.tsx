"use client";

import { useActionState } from "react";
import { createAccountAction } from "@/app/actions/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await createAccountAction(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du compte</Label>
          <Input id="name" name="name" placeholder="Ex: Compte Courant BP" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="initialBalance">Solde initial</Label>
          <Input
            id="initialBalance"
            name="initialBalance"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="balanceDate">Date du solde</Label>
          <Input
            id="balanceDate"
            name="balanceDate"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Devise</Label>
          <select
            id="currency"
            name="currency"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue="EUR"
          >
            <option value="EUR">EUR</option>
            <option value="MGA">MGA</option>
          </select>
        </div>
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Ajouter le compte"}
      </Button>
    </form>
  );
}
