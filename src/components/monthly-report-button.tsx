"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { generateMonthlyReportAction } from "@/app/actions/report-actions";

function getPreviousMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function MonthlyReportButton() {
  const [month, setMonth] = useState(getPreviousMonth());
  const [isPending, startTransition] = useTransition();

  function handleDownload() {
    startTransition(async () => {
      const result = await generateMonthlyReportAction(month);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Rapport téléchargé : ${result.filename}`);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="w-40 h-9"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isPending || !month}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        {isPending ? "Génération..." : "Télécharger rapport PDF"}
      </Button>
    </div>
  );
}
