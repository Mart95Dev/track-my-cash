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
import { toast } from "sonner";
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
        toast.error(result.error);
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
      const result = await confirmImportAction(
        selectedAccountId,
        preview.transactions,
        preview.detectedBalance,
        preview.detectedBalanceDate
      ) as { error?: string; imported?: number; balanceUpdated?: boolean; newBalance?: number; newBalanceDate?: string };
      if (result.error) {
        toast.error(result.error);
      } else {
        const msg = result.balanceUpdated && result.newBalance != null
          ? `${result.imported} transaction(s) importée(s) — solde de référence mis à jour : ${result.newBalance.toLocaleString("fr-FR", { style: "currency", currency: preview.currency })}`
          : `${result.imported} transaction(s) importée(s)`;
        toast.success(msg);
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
          {isPending ? "Analyse..." : "Importer CSV/Excel/PDF"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.pdf"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              Aperçu import — {preview?.bankName}
            </DialogTitle>
          </DialogHeader>

          {preview && (
            <div className="flex flex-col gap-4 flex-1 overflow-hidden">
              {preview.detectedBalance !== null && (
                <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950 shrink-0 space-y-1">
                  <p className="font-medium">
                    Solde détecté : {formatCurrency(preview.detectedBalance, preview.currency)}
                    {preview.detectedBalanceDate && ` au ${formatDate(preview.detectedBalanceDate)}`}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Le solde de référence du compte sera automatiquement mis à jour à cette valeur. Les transactions importées seront dans l&apos;historique mais non recomptées dans le calcul du solde.
                  </p>
                </div>
              )}

              <div className="flex gap-4 text-sm shrink-0">
                <span>{preview.totalCount} transactions trouvées</span>
                <span className="text-green-600 dark:text-green-400">{preview.newCount} nouvelles</span>
                {preview.duplicateCount > 0 && (
                  <span className="text-orange-600 dark:text-orange-400">
                    {preview.duplicateCount} doublons ignorés
                  </span>
                )}
              </div>

              <div className="overflow-y-auto flex-1 border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-28">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right w-32">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.transactions.map((tx, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            tx.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
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

              <div className="flex gap-2 justify-end shrink-0">
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
