"use client";

import { useTransition } from "react";
import { importDataAction } from "@/app/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function ResetButton() {
  const t = useTranslations("settings.danger");
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" disabled={isPending}>
          {isPending ? t("resetting") : t("reset")}
        </Button>
      }
      title={t("resetTitle")}
      description={t("resetDesc")}
      onConfirm={() => {
        startTransition(async () => {
          const result = await importDataAction(
            JSON.stringify({ accounts: [], transactions: [], recurring: [] })
          );
          if (result.error) {
            toast.error(t("error"));
          } else {
            toast.success(t("success"));
            window.location.reload();
          }
        });
      }}
    />
  );
}
