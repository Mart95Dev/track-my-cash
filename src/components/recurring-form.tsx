"use client";

import { useActionState, useRef, useEffect } from "react";
import { createRecurringAction } from "@/app/actions/recurring-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySubcategoryPicker } from "@/components/category-subcategory-picker";
import { toast } from "sonner";
import type { Account } from "@/lib/queries";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("recurring");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await createRecurringAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(t("form.success"));
      formRef.current?.reset();
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state, t]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("form.name")}</Label>
          <Input id="name" name="name" placeholder={t("form.namePlaceholder")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">{t("form.type")}</Label>
          <select id="type" name="type" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
            <option value="expense">{t("form.expense")}</option>
            <option value="income">{t("form.income")}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountId">{t("form.account")}</Label>
          <select id="accountId" name="accountId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm" required>
            <option value="">{t("form.accountPlaceholder")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">{t("form.amount")}</Label>
          <Input id="amount" name="amount" type="number" step="0.01" placeholder={t("form.amountPlaceholder")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency">{t("form.frequency")}</Label>
          <select id="frequency" name="frequency" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm">
            <option value="monthly">{t("form.monthly")}</option>
            <option value="weekly">{t("form.weekly")}</option>
            <option value="yearly">{t("form.yearly")}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextDate">{t("form.nextDate")}</Label>
          <Input id="nextDate" name="nextDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">{t("form.endDate")} <span className="text-muted-foreground font-normal">{t("form.optional")}</span></Label>
          <Input id="endDate" name="endDate" type="date" />
          <p className="text-xs text-muted-foreground">{t("form.endDateHelp")}</p>
        </div>
      </div>

      <CategorySubcategoryPicker rules={rules} idPrefix="rec-new" />

      <Button type="submit" disabled={isPending}>
        {isPending ? t("form.adding") : t("form.submit")}
      </Button>
    </form>
  );
}
