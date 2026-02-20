"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTransactionAction } from "@/app/actions/transaction-actions";
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

export function TransactionForm({
  accounts,
  rules,
  defaultAccountId,
}: {
  accounts: Account[];
  rules: Rule[];
  defaultAccountId?: number;
}) {
  const t = useTranslations("transactions");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await createTransactionAction(prev, formData);
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
          <Label htmlFor="type">{t("form.type")}</Label>
          <select
            id="type"
            name="type"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
          >
            <option value="expense">{t("form.expense")}</option>
            <option value="income">{t("form.income")}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountId">{t("form.account")}</Label>
          <select
            id="accountId"
            name="accountId"
            defaultValue={defaultAccountId ?? ""}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
            required
          >
            <option value="">{t("form.accountPlaceholder")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">{t("form.amount")}</Label>
          <Input id="amount" name="amount" type="number" step="0.01" placeholder={t("form.amountPlaceholder")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">{t("form.date")}</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t("form.description")}</Label>
          <Input id="description" name="description" placeholder={t("form.descriptionPlaceholder")} />
        </div>
      </div>
      <CategorySubcategoryPicker rules={rules} idPrefix="tx-new" />

      <Button type="submit" disabled={isPending}>
        {isPending ? t("form.saving") : t("form.submit")}
      </Button>
    </form>
  );
}
