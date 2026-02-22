"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { importWithMappingAction } from "@/app/actions/import-actions";
import type { ColumnMapping } from "@/lib/parsers";
import { toast } from "sonner";

interface CsvMappingDialogProps {
  open: boolean;
  onClose: () => void;
  headers: string[];
  preview: string[][];
  fingerprint: string;
  content: string;
  accountId: number;
  onImported: (previewData: {
    bankName: string;
    currency: string;
    detectedBalance: number | null;
    detectedBalanceDate: string | null;
    totalCount: number;
    newCount: number;
    duplicateCount: number;
    rules: { pattern: string; category: string }[];
    transactions: {
      date: string;
      description: string;
      amount: number;
      type: "income" | "expense";
      import_hash: string;
      category: string;
      subcategory: string;
    }[];
  }) => void;
}

const SEPARATORS: { value: ColumnMapping["separator"]; label: string }[] = [
  { value: ";", label: "Point-virgule ( ; )" },
  { value: ",", label: "Virgule ( , )" },
  { value: "\t", label: "Tabulation" },
];

const DATE_FORMATS: { value: ColumnMapping["dateFormat"]; label: string }[] = [
  { value: "YYYY-MM-DD", label: "AAAA-MM-JJ (2026-01-15)" },
  { value: "DD/MM/YYYY", label: "JJ/MM/AAAA (15/01/2026)" },
  { value: "DD-MM-YYYY", label: "JJ-MM-AAAA (15-01-2026)" },
  { value: "DD-MMM-YYYY", label: "JJ-MMM-AAAA (15-Jan-2026)" },
];

const NONE_VALUE = "__none__";

export function CsvMappingDialog({
  open,
  onClose,
  headers,
  preview,
  fingerprint,
  content,
  accountId,
  onImported,
}: CsvMappingDialogProps) {
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({
    separator: ";",
    dateFormat: "YYYY-MM-DD",
  });
  const [useDebitCredit, setUseDebitCredit] = useState(false);
  const [saveMapping, setSaveMapping] = useState(true);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof ColumnMapping>(key: K, value: ColumnMapping[K] | typeof NONE_VALUE) {
    setMapping((prev) => {
      if (value === NONE_VALUE) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  }

  // Aperçu live calculé côté client à partir des 5 premières lignes de preview
  const parsedPreview = useMemo(() => {
    if (!mapping.dateColumn || !mapping.descriptionColumn) return [];

    const sep = mapping.separator ?? ";";
    // Re-split depuis le content brut pour être sûr des colonnes
    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    const rawHeaders = lines[0]?.split(sep).map((h) => h.replace(/^"|"$/g, "").trim()) ?? headers;

    const colIdx = (col: string) => rawHeaders.indexOf(col);
    const dateIdx = colIdx(mapping.dateColumn);
    const descIdx = colIdx(mapping.descriptionColumn);
    const amtIdx = !useDebitCredit && mapping.amountColumn ? colIdx(mapping.amountColumn) : -1;
    const debitIdx = useDebitCredit && mapping.debitColumn ? colIdx(mapping.debitColumn) : -1;
    const creditIdx = useDebitCredit && mapping.creditColumn ? colIdx(mapping.creditColumn) : -1;

    return preview.slice(0, 5).flatMap((row) => {
      const date = row[dateIdx] ?? "";
      const description = row[descIdx] ?? "";
      if (!date || !description) return [];

      let amount = 0;
      let type: "income" | "expense" = "expense";

      if (amtIdx >= 0) {
        const raw = parseFloat((row[amtIdx] ?? "").replace(/\s/g, "").replace(",", "."));
        if (isNaN(raw) || raw === 0) return [];
        amount = Math.abs(raw);
        type = raw < 0 ? "expense" : "income";
      } else if (debitIdx >= 0 || creditIdx >= 0) {
        const debit = parseFloat((row[debitIdx] ?? "").replace(/\s/g, "").replace(",", ".")) || 0;
        const credit = parseFloat((row[creditIdx] ?? "").replace(/\s/g, "").replace(",", ".")) || 0;
        if (debit > 0) { amount = debit; type = "expense"; }
        else if (credit > 0) { amount = credit; type = "income"; }
        else return [];
      }

      return [{ date, description, amount, type }];
    });
  }, [mapping, useDebitCredit, preview, content, headers]);

  function isValid() {
    if (!mapping.dateColumn || !mapping.descriptionColumn || !mapping.separator || !mapping.dateFormat) return false;
    if (!useDebitCredit && !mapping.amountColumn) return false;
    if (useDebitCredit && !mapping.debitColumn && !mapping.creditColumn) return false;
    return true;
  }

  function handleImport() {
    if (!isValid()) return;

    const finalMapping: ColumnMapping = {
      dateColumn: mapping.dateColumn!,
      descriptionColumn: mapping.descriptionColumn!,
      separator: mapping.separator!,
      dateFormat: mapping.dateFormat!,
      ...(useDebitCredit
        ? { debitColumn: mapping.debitColumn, creditColumn: mapping.creditColumn }
        : { amountColumn: mapping.amountColumn }),
    };

    startTransition(async () => {
      const result = await importWithMappingAction(accountId, content, finalMapping, fingerprint, saveMapping);
      if ("error" in result) {
        toast.error(result.error);
      } else if (result.preview) {
        onImported(result.preview);
        onClose();
      }
    });
  }

  const colOptions = [
    { value: NONE_VALUE, label: "— Sélectionner —" },
    ...headers.map((h) => ({ value: h, label: h })),
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Format CSV non reconnu — Configurez le mapping des colonnes</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto flex-1 pr-1">
          {/* Séparateur */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Séparateur de colonnes</Label>
              <Select
                value={mapping.separator ?? ";"}
                onValueChange={(v) => update("separator", v as ColumnMapping["separator"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEPARATORS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Format de date</Label>
              <Select
                value={mapping.dateFormat ?? "YYYY-MM-DD"}
                onValueChange={(v) => update("dateFormat", v as ColumnMapping["dateFormat"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Colonnes obligatoires */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Colonne date <span className="text-destructive">*</span></Label>
              <Select
                value={mapping.dateColumn ?? NONE_VALUE}
                onValueChange={(v) => update("dateColumn", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {colOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Colonne description <span className="text-destructive">*</span></Label>
              <Select
                value={mapping.descriptionColumn ?? NONE_VALUE}
                onValueChange={(v) => update("descriptionColumn", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {colOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggle montant unique vs débit/crédit */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="use-debit-credit"
              checked={useDebitCredit}
              onCheckedChange={(v) => setUseDebitCredit(!!v)}
            />
            <Label htmlFor="use-debit-credit" className="cursor-pointer">
              Colonnes Débit et Crédit séparées
            </Label>
          </div>

          {!useDebitCredit ? (
            <div className="flex flex-col gap-1.5">
              <Label>Colonne montant <span className="text-destructive">*</span></Label>
              <Select
                value={mapping.amountColumn ?? NONE_VALUE}
                onValueChange={(v) => update("amountColumn", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {colOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Montant négatif = dépense, positif = revenu</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Colonne débit (dépenses)</Label>
                <Select
                  value={mapping.debitColumn ?? NONE_VALUE}
                  onValueChange={(v) => update("debitColumn", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {colOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Colonne crédit (revenus)</Label>
                <Select
                  value={mapping.creditColumn ?? NONE_VALUE}
                  onValueChange={(v) => update("creditColumn", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {colOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Aperçu live */}
          <div className="flex flex-col gap-2">
            <Label>Aperçu des premières transactions</Label>
            {parsedPreview.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Sélectionnez les colonnes pour voir l'aperçu.
              </p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right w-28">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedPreview.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">{row.date}</TableCell>
                        <TableCell className="text-xs">{row.description}</TableCell>
                        <TableCell className={`text-right text-xs font-medium ${row.type === "income" ? "text-income" : "text-expense"}`}>
                          {row.type === "income" ? "+" : "-"}{row.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Mémoriser */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="save-mapping"
              checked={saveMapping}
              onCheckedChange={(v) => setSaveMapping(!!v)}
            />
            <Label htmlFor="save-mapping" className="cursor-pointer">
              Mémoriser ce format pour les prochains imports
            </Label>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t shrink-0">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={!isValid() || isPending}>
            {isPending ? "Analyse en cours…" : "Importer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
