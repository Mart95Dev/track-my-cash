"use client";

import { useState, useActionState, useEffect } from "react";
import { updateRecurringAction } from "@/app/actions/recurring-actions";
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
import type { Account, RecurringPayment } from "@/lib/queries";

export function EditRecurringDialog({
  payment,
  accounts,
  categories,
}: {
  payment: RecurringPayment;
  accounts: Account[];
  categories: string[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await updateRecurringAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Paiement récurrent mis à jour");
      setOpen(false);
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Éditer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le paiement récurrent</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={payment.id} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input name="name" defaultValue={payment.name} required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select name="type" defaultValue={payment.type} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                <option value="expense">Dépense</option>
                <option value="income">Revenu</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Compte</Label>
              <select name="accountId" defaultValue={payment.account_id} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Montant</Label>
              <Input name="amount" type="number" step="0.01" defaultValue={payment.amount} required />
            </div>
            <div className="space-y-2">
              <Label>Fréquence</Label>
              <select name="frequency" defaultValue={payment.frequency} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                <option value="monthly">Mensuel</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="yearly">Annuel</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Prochaine date</Label>
              <Input name="nextDate" type="date" defaultValue={payment.next_date} required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Catégorie</Label>
              <select name="category" defaultValue={payment.category} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Date de fin <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
              <Input name="endDate" type="date" defaultValue={payment.end_date ?? ""} />
              <p className="text-xs text-muted-foreground">Laisser vide si le paiement est permanent</p>
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
