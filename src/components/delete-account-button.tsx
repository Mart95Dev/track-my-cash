"use client";

import { useTransition } from "react";
import { deleteAccountAction } from "@/app/actions/account-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function DeleteAccountButton({
  accountId,
  accountName,
}: {
  accountId: number;
  accountName: string;
}) {
  const t = useTranslations("deleteAccount");
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" size="sm" disabled={isPending}>
          {isPending ? "..." : t("button")}
        </Button>
      }
      title={t("title")}
      description={t("description", { name: accountName })}
      onConfirm={() => {
        startTransition(async () => {
          try {
            await deleteAccountAction(accountId);
            toast.success(t("success", { name: accountName }));
          } catch {
            toast.error(t("error"));
          }
        });
      }}
    />
  );
}
