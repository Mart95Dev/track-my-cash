"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Account } from "@/lib/queries";
import type { Tag } from "@/app/actions/tag-actions";
import { useTranslations } from "next-intl";

export function TransactionSearch({
  accounts,
  currentAccountId,
  currentSearch,
  currentSort,
  tags = [],
  currentTagId,
}: {
  accounts: Account[];
  currentAccountId?: number;
  currentSearch?: string;
  currentSort?: string;
  tags?: Tag[];
  currentTagId?: number;
}) {
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 px-4 mb-3">
      {/* Barre de recherche */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted text-[20px]">
          search
        </span>
        <input
          type="search"
          placeholder={t("placeholder")}
          defaultValue={currentSearch}
          className="w-full rounded-xl border-0 py-3.5 pl-12 pr-4 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-primary text-text-main placeholder:text-text-muted outline-none text-sm shadow-sm"
          onChange={(e) => {
            const timer = setTimeout(() => updateParams("q", e.target.value), 400);
            return () => clearTimeout(timer);
          }}
        />
      </div>

      {/* Filtres — chips style Stitch */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {/* Filtre compte */}
        <div className="relative shrink-0">
          <select
            className="h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-text-main focus:ring-2 focus:ring-primary outline-none shadow-sm appearance-none cursor-pointer"
            value={currentAccountId ?? ""}
            onChange={(e) => updateParams("accountId", e.target.value)}
          >
            <option value="">{t("selectAccount")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-[20px]">
            account_balance
          </span>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
            expand_more
          </span>
        </div>

        {/* Filtre tri */}
        <div className="relative shrink-0">
          <select
            className="h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-text-main focus:ring-2 focus:ring-primary outline-none shadow-sm appearance-none cursor-pointer"
            value={currentSort ?? "date_desc"}
            onChange={(e) => updateParams("sort", e.target.value)}
          >
            <option value="date_desc">{t("sortRecent")}</option>
            <option value="date_asc">{t("sortOldest")}</option>
            <option value="amount_desc">{t("sortAmountHigh")}</option>
            <option value="amount_asc">{t("sortAmountLow")}</option>
          </select>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-[20px]">
            sort
          </span>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
            expand_more
          </span>
        </div>

        {/* Filtre tags */}
        {tags.length > 0 && (
          <div className="relative shrink-0">
            <select
              className="h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-text-main focus:ring-2 focus:ring-primary outline-none shadow-sm appearance-none cursor-pointer"
              value={currentTagId ?? ""}
              onChange={(e) => updateParams("tagId", e.target.value)}
            >
              <option value="">Tous les tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-[20px]">
              label
            </span>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
              expand_more
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
