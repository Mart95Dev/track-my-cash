"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Account } from "@/lib/queries";

const PERIODS = [3, 6, 9, 12];

export function ForecastControls({
  currentMonths,
  currentAccountId,
  accounts,
}: {
  currentMonths: number;
  currentAccountId: number | null;
  accounts: Account[];
}) {
  const router = useRouter();

  function navigate(months: number, accountId: number | null) {
    const params = new URLSearchParams();
    params.set("months", String(months));
    if (accountId) params.set("accountId", String(accountId));
    router.push(`/previsions?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        {PERIODS.map((m) => (
          <Button
            key={m}
            variant={currentMonths === m ? "default" : "outline"}
            size="sm"
            onClick={() => navigate(m, currentAccountId)}
          >
            {m} mois
          </Button>
        ))}
      </div>

      {accounts.length > 1 && (
        <select
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          value={currentAccountId ?? ""}
          onChange={(e) => navigate(currentMonths, e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Tous les comptes</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
