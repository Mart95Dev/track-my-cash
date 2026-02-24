"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const t = useTranslations("pagination");
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <button
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          currentPage <= 1
            ? "text-text-muted cursor-not-allowed opacity-50"
            : "bg-white border border-gray-200 text-text-main hover:border-primary hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        {t("previous")}
      </button>
      <span className="text-text-muted text-sm">
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          currentPage >= totalPages
            ? "text-text-muted cursor-not-allowed opacity-50"
            : "bg-white border border-gray-200 text-text-main hover:border-primary hover:text-primary"
        }`}
      >
        {t("next")}
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>
  );
}
