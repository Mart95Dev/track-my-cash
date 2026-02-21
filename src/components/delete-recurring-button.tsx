"use client";

import { useTransition } from "react";
import { deleteRecurringAction } from "@/app/actions/recurring-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function DeleteRecurringButton({ id }: { id: number }) {
  const t = useTranslations("deleteRecurring");
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive/80 border-destructive/20 hover:border-destructive/40" disabled={isPending}>
          {isPending ? "..." : t("button")}
        </Button>
      }
      title={t("title")}
      description={t("description")}
      onConfirm={() => {
        startTransition(async () => {
          try {
            await deleteRecurringAction(id);
            toast.success(t("success"));
          } catch {
            toast.error(t("error"));
          }
        });
      }}
    />
  );
}
