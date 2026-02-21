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
import { useTranslations } from "next-intl";

export function EditAccountDialog({ account }: { account: Account }) {
  const t = useTranslations("editAccount");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await updateAccountAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(t("success"));
      const timer = setTimeout(() => setOpen(false), 0);
      return () => clearTimeout(timer);
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state, t]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{t("button")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={account.id} />
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t("name")}</Label>
            <Input id="edit-name" name="name" defaultValue={account.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-balance">{t("balance")}</Label>
            <Input id="edit-balance" name="initialBalance" type="number" step="0.01" defaultValue={account.initial_balance} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-date">{t("balanceDate")}</Label>
            <Input id="edit-date" name="balanceDate" type="date" defaultValue={account.balance_date} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-currency">{t("currency")}</Label>
            <select
              id="edit-currency"
              name="currency"
              defaultValue={account.currency}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="EUR">EUR — Euro</option>
              <option value="MGA">MGA — Ariary malgache</option>
              <option value="USD">USD — Dollar américain</option>
              <option value="GBP">GBP — Livre sterling</option>
              <option value="CHF">CHF — Franc suisse</option>
              <option value="CAD">CAD — Dollar canadien</option>
              <option value="AUD">AUD — Dollar australien</option>
              <option value="JPY">JPY — Yen japonais</option>
              <option value="CNY">CNY — Yuan chinois</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-threshold">{t("alertThreshold")}</Label>
            <Input id="edit-threshold" name="alertThreshold" type="number" step="0.01" placeholder={t("alertPlaceholder")} />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("saving") : t("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
