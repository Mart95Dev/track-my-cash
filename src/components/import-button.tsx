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

interface Rule {
  pattern: string;
  category: string;
}

interface PreviewTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  import_hash: string;
  category: string;
  subcategory: string;
}

interface PreviewData {
  bankName: string;
  currency: string;
  detectedBalance: number | null;
  detectedBalanceDate: string | null;
  totalCount: number;
  newCount: number;
  duplicateCount: number;
  rules: Rule[];
  transactions: PreviewTransaction[];
}

export function ImportButton({ accounts, defaultAccountId }: { accounts: Account[]; defaultAccountId?: number }) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<number, string>>({});
  const [subcategoryOverrides, setSubcategoryOverrides] = useState<Record<number, string>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<number>(defaultAccountId ?? accounts[0]?.id ?? 0);
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
        setCategoryOverrides({});
        setSubcategoryOverrides({});
        setIsOpen(true);
      }
    });

    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleConfirm() {
    if (!preview) return;

    const transactionsWithCategories = preview.transactions.map((t, i) => ({
      ...t,
      category: categoryOverrides[i] ?? t.category,
      subcategory: subcategoryOverrides[i] ?? t.subcategory,
    }));

    startTransition(async () => {
      const result = await confirmImportAction(
        selectedAccountId,
        transactionsWithCategories,
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
        setCategoryOverrides({});
        setSubcategoryOverrides({});
      }
    });
  }

  const canConfirm = preview !== null && (
    preview.newCount > 0 || preview.detectedBalance !== null
  );

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
        <DialogContent className="sm:max-w-5xl flex flex-col max-h-[85vh]">
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

              {preview.newCount === 0 && preview.detectedBalance !== null ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Toutes les transactions sont déjà importées. Seul le solde de référence sera mis à jour.
                </p>
              ) : preview.newCount === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Toutes les transactions sont déjà importées.
                </p>
              ) : (
                <div className="overflow-y-auto flex-1 border rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-24">Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-36">Catégorie</TableHead>
                        <TableHead className="w-40">Sous-catégorie</TableHead>
                        <TableHead className="text-right w-28">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.transactions.map((tx, i) => {
                        const currentCategory = categoryOverrides[i] ?? tx.category;
                        const broadCategories = [...new Set(preview.rules.map((r) => r.category))].sort();
                        const patternsForCat = preview.rules
                          .filter((r) => r.category === currentCategory)
                          .map((r) => r.pattern)
                          .sort();
                        const datalistId = `import-sub-${i}`;
                        return (
                          <TableRow key={i}>
                            <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                            <TableCell className="text-xs">{tx.description}</TableCell>
                            <TableCell>
                              <select
                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm"
                                value={currentCategory}
                                onChange={(e) => {
                                  setCategoryOverrides((prev) => ({ ...prev, [i]: e.target.value }));
                                  // Réinitialiser sous-catégorie si plus valide
                                  const sub = subcategoryOverrides[i] ?? tx.subcategory;
                                  const stillValid = preview.rules.some((r) => r.category === e.target.value && r.pattern === sub);
                                  if (!stillValid) setSubcategoryOverrides((prev) => ({ ...prev, [i]: "" }));
                                }}
                              >
                                {broadCategories.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                                {!broadCategories.includes("Autre") && <option value="Autre">Autre</option>}
                              </select>
                            </TableCell>
                            <TableCell>
                              {patternsForCat.length > 0 && (
                                <datalist id={datalistId}>
                                  {patternsForCat.map((p) => <option key={p} value={p} />)}
                                </datalist>
                              )}
                              <input
                                type="text"
                                list={patternsForCat.length > 0 ? datalistId : undefined}
                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm"
                                value={subcategoryOverrides[i] ?? tx.subcategory}
                                onChange={(e) =>
                                  setSubcategoryOverrides((prev) => ({ ...prev, [i]: e.target.value }))
                                }
                                placeholder="Libre ou suggéré…"
                                autoComplete="off"
                              />
                            </TableCell>
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex gap-2 justify-end shrink-0">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleConfirm} disabled={isPending || !canConfirm}>
                  {isPending
                    ? "Import..."
                    : preview.newCount > 0
                    ? `Importer ${preview.newCount} transaction(s)`
                    : "Mettre à jour le solde"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
