"use client";

import { useTransition } from "react";
import { deleteTransactionAction } from "@/app/actions/transaction-actions";
import { Button } from "@/components/ui/button";

export function DeleteTransactionButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700"
      disabled={isPending}
      onClick={() => {
        if (confirm("Supprimer cette transaction ?")) {
          startTransition(() => {
            deleteTransactionAction(id);
          });
        }
      }}
    >
      {isPending ? "..." : "Suppr."}
    </Button>
  );
}
