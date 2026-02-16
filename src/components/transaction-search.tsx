"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import type { Account } from "@/lib/queries";

export function TransactionSearch({
  accounts,
  currentAccountId,
  currentSearch,
  currentSort,
}: {
  accounts: Account[];
  currentAccountId?: number;
  currentSearch?: string;
  currentSort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset page on filter change
    router.push(`/transactions?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Input
        placeholder="Rechercher..."
        defaultValue={currentSearch}
        className="max-w-xs"
        onChange={(e) => {
          const timer = setTimeout(() => updateParams("q", e.target.value), 400);
          return () => clearTimeout(timer);
        }}
      />
      <select
        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        value={currentAccountId ?? ""}
        onChange={(e) => updateParams("accountId", e.target.value)}
      >
        <option value="">Tous les comptes</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <select
        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        value={currentSort ?? "date_desc"}
        onChange={(e) => updateParams("sort", e.target.value)}
      >
        <option value="date_desc">Date (récent)</option>
        <option value="date_asc">Date (ancien)</option>
        <option value="amount_desc">Montant (haut)</option>
        <option value="amount_asc">Montant (bas)</option>
      </select>
    </div>
  );
}
