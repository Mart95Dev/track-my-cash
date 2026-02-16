"use client";

import { useRouter } from "next/navigation";
import type { Account } from "@/lib/queries";

export function TransactionFilters({
  accounts,
  currentAccountId,
}: {
  accounts: Account[];
  currentAccountId?: number;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium">Filtrer par compte :</label>
      <select
        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        value={currentAccountId ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          router.push(val ? `/transactions?accountId=${val}` : "/transactions");
        }}
      >
        <option value="">Tous les comptes</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
