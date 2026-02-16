"use client";

import { useTransition } from "react";
import { importDataAction } from "@/app/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export function ResetButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" disabled={isPending}>
          {isPending ? "Suppression..." : "Réinitialiser toutes les données"}
        </Button>
      }
      title="Réinitialiser toutes les données"
      description="ATTENTION : Tous les comptes, transactions et paiements récurrents seront supprimés. Cette action est irréversible."
      onConfirm={() => {
        startTransition(async () => {
          const result = await importDataAction(
            JSON.stringify({ accounts: [], transactions: [], recurring: [] })
          );
          if (result.error) {
            toast.error("Erreur lors de la réinitialisation");
          } else {
            toast.success("Toutes les données ont été réinitialisées");
            window.location.reload();
          }
        });
      }}
    />
  );
}
