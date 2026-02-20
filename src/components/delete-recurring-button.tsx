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
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300" disabled={isPending}>
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
