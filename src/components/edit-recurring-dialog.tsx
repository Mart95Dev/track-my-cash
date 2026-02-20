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
import { CategorySubcategoryPicker } from "@/components/category-subcategory-picker";
import type { Account, RecurringPayment } from "@/lib/queries";
import { useTranslations } from "next-intl";

interface Rule {
  pattern: string;
  category: string;
}

export function EditRecurringDialog({
  payment,
  accounts,
  rules,
}: {
  payment: RecurringPayment;
  accounts: Account[];
  rules: Rule[];
}) {
  const t = useTranslations("editRecurring");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await updateRecurringAction(prev, formData);
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
          <input type="hidden" name="id" value={payment.id} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input name="name" defaultValue={payment.name} required />
            </div>
            <div className="space-y-2">
              <Label>{t("type")}</Label>
              <select name="type" defaultValue={payment.type} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                <option value="expense">{t("expense")}</option>
                <option value="income">{t("income")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("account")}</Label>
              <select name="accountId" defaultValue={payment.account_id} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("amount")}</Label>
              <Input name="amount" type="number" step="0.01" defaultValue={payment.amount} required />
            </div>
            <div className="space-y-2">
              <Label>{t("frequency")}</Label>
              <select name="frequency" defaultValue={payment.frequency} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
                <option value="monthly">{t("monthly")}</option>
                <option value="weekly">{t("weekly")}</option>
                <option value="yearly">{t("yearly")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("nextDate")}</Label>
              <Input name="nextDate" type="date" defaultValue={payment.next_date} required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{t("endDate")} <span className="text-muted-foreground font-normal">{t("optional")}</span></Label>
              <Input name="endDate" type="date" defaultValue={payment.end_date ?? ""} />
              <p className="text-xs text-muted-foreground">{t("endDateHelp")}</p>
            </div>
          </div>
          <CategorySubcategoryPicker
            rules={rules}
            defaultCategory={payment.category}
            defaultSubcategory={payment.subcategory ?? undefined}
            idPrefix={`rec-edit-${payment.id}`}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? t("saving") : t("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
