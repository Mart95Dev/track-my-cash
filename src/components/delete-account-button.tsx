"use client";

import { useTransition } from "react";
import { deleteAccountAction } from "@/app/actions/account-actions";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton({
  accountId,
  accountName,
}: {
  accountId: number;
  accountName: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Supprimer le compte "${accountName}" et toutes ses données ?`)) {
          startTransition(() => {
            deleteAccountAction(accountId);
          });
        }
      }}
    >
      {isPending ? "..." : "Supprimer"}
    </Button>
  );
}
