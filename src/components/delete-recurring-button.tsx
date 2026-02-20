"use client";

import { useTransition } from "react";
import { deleteRecurringAction } from "@/app/actions/recurring-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export function DeleteRecurringButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300" disabled={isPending}>
          {isPending ? "..." : "Suppr."}
        </Button>
      }
      title="Supprimer le paiement récurrent"
      description="Ce paiement récurrent sera supprimé définitivement."
      onConfirm={() => {
        startTransition(async () => {
          try {
            await deleteRecurringAction(id);
            toast.success("Paiement récurrent supprimé");
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        });
      }}
    />
  );
}
