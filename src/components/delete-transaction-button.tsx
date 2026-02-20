"use client";

import { useTransition } from "react";
import { deleteTransactionAction } from "@/app/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function DeleteTransactionButton({ id }: { id: number }) {
  const t = useTranslations("deleteTransaction");
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
            await deleteTransactionAction(id);
            toast.success(t("success"));
          } catch {
            toast.error(t("error"));
          }
        });
      }}
    />
  );
}
