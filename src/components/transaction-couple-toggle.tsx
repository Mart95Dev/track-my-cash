"use client";

import { useTransition } from "react";
import { updateTransactionCoupleAction } from "@/app/actions/couple-actions";

interface TransactionCoupleToggleProps {
  txId: number;
  isShared: boolean;
  userId: string;
}

export function TransactionCoupleToggle({
  txId,
  isShared,
  userId,
}: TransactionCoupleToggleProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await updateTransactionCoupleAction(txId, !isShared, userId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isShared ? "Transaction partagée — cliquer pour retirer" : "Partager avec partenaire"}
      className={`flex items-center justify-center rounded-lg w-7 h-7 transition-colors ${
        isPending ? "opacity-50" : ""
      } ${
        isShared
          ? "text-primary"
          : "text-text-muted hover:text-primary"
      }`}
      aria-pressed={isShared}
    >
      <span
        className="material-symbols-outlined text-[18px]"
        style={{ fontVariationSettings: isShared ? "'FILL' 1" : "'FILL' 0" }}
      >
        group
      </span>
    </button>
  );
}
