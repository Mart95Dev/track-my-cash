"use client";

import { useTransition } from "react";
import { deleteRecurringAction } from "@/app/actions/recurring-actions";
import { Button } from "@/components/ui/button";

export function DeleteRecurringButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700"
      disabled={isPending}
      onClick={() => {
        if (confirm("Supprimer ce paiement récurrent ?")) {
          startTransition(() => {
            deleteRecurringAction(id);
          });
        }
      }}
    >
      {isPending ? "..." : "Suppr."}
    </Button>
  );
}
