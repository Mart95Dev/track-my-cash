"use client";

import { useState, useActionState, useEffect } from "react";
import { updateAccountAction } from "@/app/actions/account-actions";
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
import type { Account } from "@/lib/queries";

export function EditAccountDialog({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await updateAccountAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Compte mis à jour");
      setOpen(false);
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Modifier</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le compte</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={account.id} />
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom</Label>
            <Input id="edit-name" name="name" defaultValue={account.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-balance">Solde initial</Label>
            <Input id="edit-balance" name="initialBalance" type="number" step="0.01" defaultValue={account.initial_balance} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date du solde</Label>
            <Input id="edit-date" name="balanceDate" type="date" defaultValue={account.balance_date} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-currency">Devise</Label>
            <select id="edit-currency" name="currency" defaultValue={account.currency} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
              <option value="EUR">EUR</option>
              <option value="MGA">MGA</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-threshold">Alerte solde bas (optionnel)</Label>
            <Input id="edit-threshold" name="alertThreshold" type="number" step="0.01" placeholder="Ex: 100" />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
