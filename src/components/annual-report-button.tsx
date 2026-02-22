"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { generateAnnualReportAction } from "@/app/actions/annual-report-actions";
import type { Account } from "@/lib/queries";

interface AnnualReportButtonProps {
  accounts: Account[];
}

export function AnnualReportButton({ accounts }: AnnualReportButtonProps) {
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [accountId, setAccountId] = useState<number | undefined>(accounts[0]?.id);
  const [isPending, startTransition] = useTransition();

  function handleDownload() {
    if (!accountId) {
      toast.error("Sélectionnez un compte");
      return;
    }
    startTransition(async () => {
      const result = await generateAnnualReportAction(accountId, year);
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
      toast.success(`Bilan téléchargé : ${result.filename}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {accounts.length > 1 && (
        <Select
          value={accountId?.toString() ?? ""}
          onValueChange={(v) => setAccountId(parseInt(v))}
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Compte…" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id.toString()}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Input
        type="number"
        min={2000}
        max={new Date().getFullYear()}
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value))}
        className="w-24 h-9"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isPending || !accountId}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        {isPending ? "Génération…" : "Bilan annuel PDF"}
      </Button>
    </div>
  );
}
