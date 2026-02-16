"use client";

import { useTransition } from "react";
import { deleteAccountAction } from "@/app/actions/account-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export function DeleteAccountButton({
  accountId,
  accountName,
}: {
  accountId: number;
  accountName: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" size="sm" disabled={isPending}>
          {isPending ? "..." : "Supprimer"}
        </Button>
      }
      title="Supprimer le compte"
      description={`Le compte "${accountName}" et toutes ses transactions seront supprimés. Cette action est irréversible.`}
      onConfirm={() => {
        startTransition(async () => {
          try {
            await deleteAccountAction(accountId);
            toast.success(`Compte "${accountName}" supprimé`);
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        });
      }}
    />
  );
}
