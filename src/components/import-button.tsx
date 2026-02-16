"use client";

import { useState, useRef, useTransition } from "react";
import { importFileAction, confirmImportAction } from "@/app/actions/import-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Account } from "@/lib/queries";

interface PreviewData {
  bankName: string;
  currency: string;
  detectedBalance: number | null;
  detectedBalanceDate: string | null;
  totalCount: number;
  newCount: number;
  duplicateCount: number;
  transactions: {
    date: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    import_hash: string;
  }[];
}

export function ImportButton({ accounts }: { accounts: Account[] }) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(accounts[0]?.id ?? 0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedAccountId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", String(selectedAccountId));

    startTransition(async () => {
      const result = await importFileAction(formData);
      if ("error" in result) {
        alert(result.error);
      } else if (result.preview) {
        setPreview(result.preview);
        setIsOpen(true);
      }
    });

    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleConfirm() {
    if (!preview) return;

    startTransition(async () => {
      const result = await confirmImportAction(selectedAccountId, preview.transactions);
      if ("error" in result) {
        alert(result.error);
      } else {
        alert(`${result.imported} transaction(s) importée(s)`);
        setIsOpen(false);
        setPreview(null);
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <select
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(parseInt(e.target.value))}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={isPending || accounts.length === 0}
        >
          {isPending ? "Analyse..." : "Importer CSV/Excel"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Aperçu import — {preview?.bankName}
            </DialogTitle>
          </DialogHeader>

          {preview && (
            <div className="space-y-4">
              {preview.detectedBalance !== null && (
                <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                  <p className="font-medium">
                    Solde détecté : {formatCurrency(preview.detectedBalance, preview.currency)}
                    {preview.detectedBalanceDate && ` au ${formatDate(preview.detectedBalanceDate)}`}
                  </p>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <span>{preview.totalCount} transactions trouvées</span>
                <span className="text-green-600">{preview.newCount} nouvelles</span>
                {preview.duplicateCount > 0 && (
                  <span className="text-orange-600">
                    {preview.duplicateCount} doublons ignorés
                  </span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.transactions.map((tx, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            tx.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount, preview.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleConfirm} disabled={isPending || preview.newCount === 0}>
                  {isPending ? "Import..." : `Importer ${preview.newCount} transaction(s)`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
