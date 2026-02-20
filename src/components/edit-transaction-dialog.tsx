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
import { CategorySubcategoryPicker } from "@/components/category-subcategory-picker";
import type { Account, Transaction } from "@/lib/queries";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("editTransaction");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await updateTransactionAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(t("success"));
      setOpen(false);
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
          <input type="hidden" name="id" value={transaction.id} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("type")}</Label>
              <select name="type" defaultValue={transaction.type} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                <option value="expense">{t("expense")}</option>
                <option value="income">{t("income")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("account")}</Label>
              <select name="accountId" defaultValue={transaction.account_id} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("amount")}</Label>
              <Input name="amount" type="number" step="0.01" defaultValue={transaction.amount} required />
            </div>
            <div className="space-y-2">
              <Label>{t("date")}</Label>
              <Input name="date" type="date" defaultValue={transaction.date} required />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("description")}</Label>
              <Input name="description" defaultValue={transaction.description} />
            </div>
          </div>
          <CategorySubcategoryPicker
            rules={rules}
            defaultCategory={transaction.category}
            defaultSubcategory={transaction.subcategory ?? undefined}
            idPrefix={`tx-edit-${transaction.id}`}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? t("saving") : t("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
