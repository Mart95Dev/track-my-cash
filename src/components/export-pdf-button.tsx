"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FileDown } from "lucide-react";

function getPreviousMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ExportPdfButton({ isProOrPremium }: { isProOrPremium: boolean }) {
  const [month, setMonth] = useState(getPreviousMonth());

  if (!isProOrPremium) return null;

  return (
    <div className="flex items-center gap-2">
      <Input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="w-40 h-9"
        aria-label="Mois du rapport PDF"
      />
      <a
        href={`/api/reports/monthly?month=${month}`}
        download={`rapport-${month}.pdf`}
        className="inline-flex items-center gap-2 px-3 h-9 text-sm font-medium border border-gray-200 rounded-md hover:bg-gray-50 bg-white text-text-main"
        aria-label="Télécharger rapport PDF mensuel couple"
      >
        <FileDown className="h-4 w-4" />
        Télécharger PDF complet
      </a>
    </div>
  );
}
