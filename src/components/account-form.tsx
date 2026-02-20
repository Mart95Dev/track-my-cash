"use client";

import { useActionState, useRef, useEffect } from "react";
import { createAccountAction } from "@/app/actions/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function AccountForm() {
  const t = useTranslations("accounts");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await createAccountAction(prev, formData);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("form.name")}</Label>
          <Input id="name" name="name" placeholder={t("form.namePlaceholder")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="initialBalance">{t("form.balance")}</Label>
          <Input
            id="initialBalance"
            name="initialBalance"
            type="number"
            step="0.01"
            placeholder={t("form.balancePlaceholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="balanceDate">{t("form.balanceDate")}</Label>
          <Input
            id="balanceDate"
            name="balanceDate"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">{t("form.currency")}</Label>
          <select
            id="currency"
            name="currency"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue="EUR"
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
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? t("form.creating") : t("form.submit")}
      </Button>
    </form>
  );
}
