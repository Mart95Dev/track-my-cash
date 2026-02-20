"use client";

import { useTransition } from "react";
import { deleteTransactionAction } from "@/app/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export function DeleteTransactionButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300" disabled={isPending}>
          {isPending ? "..." : "Suppr."}
        </Button>
      }
      title="Supprimer la transaction"
      description="Cette transaction sera supprimée définitivement."
      onConfirm={() => {
        startTransition(async () => {
          try {
            await deleteTransactionAction(id);
            toast.success("Transaction supprimée");
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        });
      }}
    />
  );
}
