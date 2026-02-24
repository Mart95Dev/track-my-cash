"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface DashboardViewToggleProps {
  hasCoupleActive: boolean;
  locale: string;
}

export function DashboardViewToggle({
  hasCoupleActive,
  locale,
}: DashboardViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  const isPersonal = view !== "couple";
  const isCouple = view === "couple";

  function handlePersonalClick() {
    router.push(`/${locale}/dashboard`);
  }

  function handleCoupleClick() {
    if (hasCoupleActive) {
      router.push(`/${locale}/dashboard?view=couple`);
    } else {
      router.push(`/${locale}/couple`);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePersonalClick}
        className={`h-9 px-4 rounded-full text-sm font-bold transition-colors ${
          isPersonal
            ? "bg-primary text-white"
            : "bg-white border border-gray-100 shadow-soft text-text-muted"
        }`}
      >
        Ma vue
      </button>
      <button
        onClick={handleCoupleClick}
        className={`h-9 px-4 rounded-full text-sm font-bold transition-colors flex items-center gap-1.5 ${
          isCouple
            ? "bg-primary text-white"
            : "bg-white border border-gray-100 shadow-soft text-text-muted"
        } ${!hasCoupleActive ? "opacity-60" : ""}`}
      >
        {!hasCoupleActive && (
          <span className="material-symbols-outlined text-[16px]">lock</span>
        )}
        Vue couple
      </button>
    </div>
  );
}
