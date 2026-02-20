"use client";

import { useActionState, useRef, useEffect } from "react";
import { createRecurringAction } from "@/app/actions/recurring-actions";
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

export function RecurringForm({
  accounts,
  rules,
}: {
  accounts: Account[];
  rules: Rule[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await createRecurringAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Paiement récurrent ajouté");
      formRef.current?.reset();
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
          <Label htmlFor="endDate">Date de fin <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
          <Input id="endDate" name="endDate" type="date" />
          <p className="text-xs text-muted-foreground">Laisser vide si le paiement est permanent</p>
        </div>
      </div>

      <CategorySubcategoryPicker rules={rules} idPrefix="rec-new" />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter"}
      </Button>
    </form>
  );
}
