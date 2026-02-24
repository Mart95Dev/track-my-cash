"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Account } from "@/lib/queries";

export function AccountFilter({
  accounts,
  currentAccountId,
  basePath,
}: {
  accounts: Account[];
  currentAccountId?: number | "all";
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("accountId", value);
    } else {
      params.delete("accountId");
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  const items = [
    { value: "all", label: "Tous les comptes" },
    ...accounts.map((a) => ({ value: String(a.id), label: a.name })),
  ];

  const activeValue =
    currentAccountId === "all"
      ? "all"
      : currentAccountId
      ? String(currentAccountId)
      : "all";

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-4">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            activeValue === item.value
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-text-muted border border-gray-200 hover:border-primary/40 hover:text-primary"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
