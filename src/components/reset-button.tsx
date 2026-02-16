"use client";

import { useTransition } from "react";
import { importDataAction } from "@/app/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ResetButton() {
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    if (!confirm("ATTENTION : Toutes les données seront supprimées. Continuer ?")) return;
    if (!confirm("DERNIÈRE CONFIRMATION : Cette action est irréversible.")) return;

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
  }

  return (
    <Button variant="destructive" onClick={handleReset} disabled={isPending}>
      {isPending ? "Suppression..." : "Réinitialiser toutes les données"}
    </Button>
  );
}
