"use client";

import { useActionState, useRef, useEffect, useTransition } from "react";
import { createRuleAction, deleteRuleAction } from "@/app/actions/categorization-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/format";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import type { CategorizationRule } from "@/lib/queries";
import { useTranslations } from "next-intl";

export function CategorizationRules({ rules }: { rules: CategorizationRule[] }) {
  const t = useTranslations("settings.categorization");
  const formRef = useRef<HTMLFormElement>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await createRuleAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(t("added"));
      formRef.current?.reset();
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state, t]);

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="flex flex-col sm:flex-row gap-3">
        <div className="space-y-1 flex-1">
          <Label htmlFor="pattern" className="text-xs">{t("patternLabel")}</Label>
          <Input id="pattern" name="pattern" placeholder={t("patternPlaceholder")} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="rule-category" className="text-xs">{t("categoryLabel")}</Label>
          <select id="rule-category" name="category" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1 w-20">
          <Label htmlFor="priority" className="text-xs">{t("priorityLabel")}</Label>
          <Input id="priority" name="priority" type="number" defaultValue="0" />
        </div>
        <div className="flex items-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? t("adding") : t("add")}
          </Button>
        </div>
      </form>

      {rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between py-2 px-3 rounded-md border text-sm">
              <div className="flex gap-4">
                <code className="bg-muted px-2 py-0.5 rounded text-xs">{rule.pattern}</code>
                <span>{rule.category}</span>
                <span className="text-muted-foreground">P:{rule.priority}</span>
              </div>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm" className="text-destructive" disabled={deletePending}>
                    {t("delete")}
                  </Button>
                }
                title={t("deleteTitle")}
                description={t("deleteDesc", { pattern: rule.pattern })}
                onConfirm={() => {
                  startDeleteTransition(async () => {
                    await deleteRuleAction(rule.id);
                    toast.success(t("deleted"));
                  });
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
