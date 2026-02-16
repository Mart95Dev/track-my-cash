"use client";

import { useActionState } from "react";
import { createRecurringAction } from "@/app/actions/recurring-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/format";
import type { Account } from "@/lib/queries";

export function RecurringForm({ accounts }: { accounts: Account[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await createRecurringAction(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" placeholder="Ex: Netflix" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
            <option value="expense">Dépense</option>
            <option value="income">Revenu</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountId">Compte</Label>
          <select id="accountId" name="accountId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm" required>
            <option value="">Sélectionner...</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant</Label>
          <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency">Fréquence</Label>
          <select id="frequency" name="frequency" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
            <option value="monthly">Mensuel</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="yearly">Annuel</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextDate">Prochaine date</Label>
          <Input id="nextDate" name="nextDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <select id="category" name="category" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter"}
      </Button>
    </form>
  );
}
