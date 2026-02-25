"use client";

import { useState, useTransition } from "react";
import { updateTransactionCoupleAction, updateTransactionCategoryAction } from "@/app/actions/couple-actions";
import { COUPLE_CATEGORIES, isCategoryEmpty } from "@/lib/couple-categories";

interface TransactionCoupleToggleProps {
  txId: number;
  isShared: boolean;
  userId: string;
  category?: string;
  onCategorySelect?: (category: string) => void;
}

export function TransactionCoupleToggle({
  txId,
  isShared,
  userId,
  category,
  onCategorySelect,
}: TransactionCoupleToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [showAll, setShowAll] = useState(false);

  function handleClick() {
    startTransition(async () => {
      await updateTransactionCoupleAction(txId, !isShared, userId);
    });
  }

  function handleCategorySelect(cat: string) {
    onCategorySelect?.(cat);
    startTransition(async () => {
      await updateTransactionCategoryAction(txId, cat);
    });
  }

  const showPills = isShared && isCategoryEmpty(category);
  const visibleCategories = showAll
    ? COUPLE_CATEGORIES
    : COUPLE_CATEGORIES.slice(0, 4);

  return (
    <div className="flex flex-col gap-1.5">
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

      {showPills && (
        <div className="flex flex-wrap gap-1 mt-1">
          {visibleCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              disabled={isPending}
              className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-colors"
            >
              {cat}
            </button>
          ))}
          {!showAll && COUPLE_CATEGORIES.length > 4 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-muted hover:bg-gray-200 transition-colors"
            >
              Voir plus
            </button>
          )}
        </div>
      )}
    </div>
  );
}
