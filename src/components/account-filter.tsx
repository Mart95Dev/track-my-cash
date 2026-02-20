"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Account } from "@/lib/queries";

export function AccountFilter({
  accounts,
  currentAccountId,
  basePath,
}: {
  accounts: Account[];
  currentAccountId?: number;
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

  return (
    <select
      className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
      value={currentAccountId ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">— Choisir un compte —</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
