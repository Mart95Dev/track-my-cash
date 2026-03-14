"use client";

import { useState, useRef, useTransition } from "react";
import { importFileAction, confirmImportAction } from "@/app/actions/import-actions";
import { CsvMappingDialog } from "@/components/csv-mapping-dialog";
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
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useUpgradeModal, detectUpgradeReason } from "@/hooks/use-upgrade-modal";
import { UpgradeModal } from "@/components/upgrade-modal";

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

interface PreviewFirst5Item {
  date: string;
  description: string;
  amount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge "Parser détecté"
// ─────────────────────────────────────────────────────────────────────────────

function ParserBadge({ parserName }: { parserName: string }) {
  return (
    <div className="flex items-center gap-2 text-sm shrink-0">
      <span className="text-muted-foreground dark:text-text-muted">Parser détecté :</span>
      <span className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary dark:text-primary border border-primary/20 dark:border-primary/30">
        {parserName}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tableau prévisualisation des 5 premières transactions
// ─────────────────────────────────────────────────────────────────────────────

function PreviewFirst5Table({
  rows,
  currency,
  locale,
}: {
  rows: PreviewFirst5Item[];
  currency: string;
  locale: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <p className="text-xs font-medium text-muted-foreground dark:text-text-muted uppercase tracking-wide">
        Aperçu des 5 premières transactions
      </p>
      <div className="border dark:border-border/40 rounded-md overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="dark:border-border/30">
              <TableHead className="w-24 dark:text-text-muted">Date</TableHead>
              <TableHead className="dark:text-text-muted">Libellé</TableHead>
              <TableHead className="text-right w-28 dark:text-text-muted">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className="dark:border-border/20">
                <TableCell className="text-xs whitespace-nowrap dark:text-text-main">
                  {formatDate(row.date, locale)}
                </TableCell>
                <TableCell className="text-xs dark:text-text-main truncate max-w-[220px]">
                  {row.description}
                </TableCell>
                <TableCell
                  className={`text-right text-xs font-medium ${
                    row.amount >= 0 ? "text-income" : "text-expense"
                  }`}
                >
                  {row.amount >= 0 ? "+" : ""}
                  {formatCurrency(Math.abs(row.amount), currency, locale)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Écran Step-3 : succès post-import (AC-8)
// ─────────────────────────────────────────────────────────────────────────────

interface SuccessInfo {
  imported: number;
  duplicateCount: number;
  balanceUpdated: boolean;
  newBalance: number | null;
  currency: string;
}

function ImportSuccessScreen({
  info,
  locale,
  onViewTransactions,
  onImportAnother,
}: {
  info: SuccessInfo;
  locale: string;
  onViewTransactions: () => void;
  onImportAnother: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 animate-in fade-in-0 zoom-in-95 duration-300">
      {/* Icône check animée */}
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-income/10 animate-in zoom-in-50 duration-500">
        <svg
          className="w-10 h-10 text-income"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Résumé */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-2xl font-bold dark:text-text-main">
          {info.imported} importée{info.imported > 1 ? "s" : ""}
        </p>
        {info.duplicateCount > 0 && (
          <p className="text-sm text-muted-foreground dark:text-text-muted">
            · {info.duplicateCount} doublon{info.duplicateCount > 1 ? "s" : ""} ignoré{info.duplicateCount > 1 ? "s" : ""}
          </p>
        )}
        {info.balanceUpdated && info.newBalance !== null && (
          <p className="text-sm text-primary font-medium mt-1">
            Solde mis à jour :{" "}
            {formatCurrency(info.newBalance, info.currency, locale)}
          </p>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button variant="outline" className="flex-1" onClick={onImportAnother}>
          Importer un autre fichier
        </Button>
        <Button className="flex-1" onClick={onViewTransactions}>
          Voir les transactions
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

export function ImportButton({ accounts, defaultAccountId }: { accounts: Account[]; defaultAccountId?: number }) {
  const t = useTranslations("import");
  const locale = useLocale();
  const router = useRouter();
  const { upgradeReason, showUpgradeModal, closeUpgradeModal } = useUpgradeModal();
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewFirst5, setPreviewFirst5] = useState<PreviewFirst5Item[]>([]);
  const [parserName, setParserName] = useState<string | null>(null);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<number, string>>({});
  const [subcategoryOverrides, setSubcategoryOverrides] = useState<Record<number, string>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<number>(defaultAccountId ?? accounts[0]?.id ?? 0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [mappingInfo, setMappingInfo] = useState<{
    headers: string[];
    preview: string[][];
    fingerprint: string;
    content: string;
    suggestedMapping?: { dateCol: number; amountCol: number; labelCol: number; confidence: number };
  } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedAccountId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", String(selectedAccountId));

    startTransition(async () => {
      const result = await importFileAction(formData);
      if ("error" in result) {
        const errorMsg = result.error ?? "";
        const upgradeNeeded = detectUpgradeReason(errorMsg);
        if (upgradeNeeded) {
          showUpgradeModal(upgradeNeeded);
        } else {
          toast.error(errorMsg);
        }
      } else if ("needsMapping" in result && result.needsMapping) {
        setMappingInfo({
          headers: result.headers,
          preview: result.preview,
          fingerprint: result.fingerprint,
          content: result.content,
          suggestedMapping: (result as { suggestedMapping?: { dateCol: number; amountCol: number; labelCol: number; confidence: number } }).suggestedMapping,
        });
      } else if (result.preview) {
        // Stocker parserName et previewFirst5 enrichis (STORY-124)
        if ("parserName" in result && typeof result.parserName === "string") {
          setParserName(result.parserName);
        }
        if ("previewFirst5" in result && Array.isArray(result.previewFirst5)) {
          setPreviewFirst5(result.previewFirst5 as PreviewFirst5Item[]);
        }
        setPreview(result.preview);
        setCategoryOverrides({});
        setSubcategoryOverrides({});
        setIsOpen(true);
      }
    });

    if (fileRef.current) fileRef.current.value = "";
  }

  function handleReset() {
    setSuccessInfo(null);
    setIsOpen(false);
    setPreview(null);
    setPreviewFirst5([]);
    setParserName(null);
    setCategoryOverrides({});
    setSubcategoryOverrides({});
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleConfirm() {
    if (!preview) return;

    const transactionsWithCategories = preview.transactions.map((tx, i) => ({
      ...tx,
      category: categoryOverrides[i] ?? tx.category,
      subcategory: subcategoryOverrides[i] ?? tx.subcategory,
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
        setSuccessInfo({
          imported: result.imported ?? 0,
          duplicateCount: preview.duplicateCount,
          balanceUpdated: result.balanceUpdated ?? false,
          newBalance: result.newBalance ?? null,
          currency: preview.currency,
        });
        setPreview(null);
        setPreviewFirst5([]);
        setParserName(null);
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
      <UpgradeModal reason={upgradeReason} onClose={closeUpgradeModal} />
      {mappingInfo && (
        <CsvMappingDialog
          open={!!mappingInfo}
          onClose={() => setMappingInfo(null)}
          headers={mappingInfo.headers}
          preview={mappingInfo.preview}
          fingerprint={mappingInfo.fingerprint}
          content={mappingInfo.content}
          accountId={selectedAccountId}
          onImported={(previewData) => {
            setPreview(previewData);
            setCategoryOverrides({});
            setSubcategoryOverrides({});
            setIsOpen(true);
          }}
        />
      )}

      <div className="flex items-center gap-2">
        <select
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm dark:border-border/40 dark:text-text-main"
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
          {isPending ? t("analyzing") : t("button")}
        </Button>
        {/* Formats supportés (AC-11) : CSV, XLSX, XML/CAMT.053, MT940/STA, OFX, QFX, CFONB, ASC, PDF */}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xml,.sta,.mt940,.ofx,.qfx,.cfonb,.asc,.pdf"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleReset(); else setIsOpen(true); }}>
        <DialogContent className="sm:max-w-5xl flex flex-col max-h-[85vh] bg-background dark:border-border/40">
          <DialogHeader>
            <DialogTitle className="dark:text-text-main">
              {successInfo ? "Import terminé" : t("previewTitle", { bankName: preview?.bankName ?? "" })}
            </DialogTitle>
          </DialogHeader>

          {/* ── Step 3 : écran de succès (AC-8) ── */}
          {successInfo && (
            <ImportSuccessScreen
              info={successInfo}
              locale={locale}
              onViewTransactions={() => {
                handleReset();
                router.push("/transactions");
              }}
              onImportAnother={() => handleReset()}
            />
          )}

          {preview && !successInfo && (
            <div className="flex flex-col gap-4 flex-1 overflow-hidden">

              {/* Badge "Parser détecté" — AC-1 */}
              {parserName && <ParserBadge parserName={parserName} />}

              {/* Solde détecté */}
              {preview.detectedBalance !== null && (
                <div className="rounded-lg border dark:border-border/40 bg-info-subtle dark:bg-primary/5 p-4 shrink-0 space-y-1">
                  <p className="font-medium dark:text-text-main">
                    {t("detectedBalance", {
                      amount: formatCurrency(preview.detectedBalance, preview.currency, locale),
                      date: preview.detectedBalanceDate ? formatDate(preview.detectedBalanceDate, locale) : "",
                    })}
                  </p>
                  <p className="text-sm text-info dark:text-primary">
                    {t("balanceInfo")}
                  </p>
                </div>
              )}

              {/* Stats import — AC-2 */}
              <div className="flex flex-wrap gap-3 text-sm shrink-0">
                <span className="dark:text-text-main">{t("transactionsFound", { total: preview.totalCount })}</span>
                <span className="text-income font-medium">{t("newTransactions", { count: preview.newCount })}</span>
                {preview.duplicateCount > 0 && (
                  <span className="text-warning dark:text-amber-400">
                    {t("duplicatesIgnored", { count: preview.duplicateCount })}
                  </span>
                )}
              </div>

              {/* Tableau prévisualisation 5 premières transactions — AC-3 */}
              {previewFirst5.length > 0 && (
                <PreviewFirst5Table
                  rows={previewFirst5}
                  currency={preview.currency}
                  locale={locale}
                />
              )}

              {/* Liste complète des transactions à importer */}
              {preview.newCount === 0 && preview.detectedBalance !== null ? (
                <p className="text-sm text-muted-foreground dark:text-text-muted text-center py-4">
                  {t("allImportedWithBalance")}
                </p>
              ) : preview.newCount === 0 ? (
                <p className="text-sm text-muted-foreground dark:text-text-muted text-center py-4">
                  {t("allImported")}
                </p>
              ) : (
                <div className="overflow-y-auto flex-1 border dark:border-border/40 rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow className="dark:border-border/30">
                        <TableHead className="w-24 dark:text-text-muted">{t("date")}</TableHead>
                        <TableHead className="dark:text-text-muted">{t("description")}</TableHead>
                        <TableHead className="w-36 dark:text-text-muted">{t("category")}</TableHead>
                        <TableHead className="w-40 dark:text-text-muted">{t("subcategory")}</TableHead>
                        <TableHead className="text-right w-28 dark:text-text-muted">{t("amount")}</TableHead>
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
                          <TableRow key={i} className="dark:border-border/20">
                            <TableCell className="whitespace-nowrap dark:text-text-main">{formatDate(tx.date, locale)}</TableCell>
                            <TableCell className="text-xs dark:text-text-main">{tx.description}</TableCell>
                            <TableCell>
                              <select
                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm dark:border-border/40 dark:text-text-main"
                                value={currentCategory}
                                onChange={(e) => {
                                  setCategoryOverrides((prev) => ({ ...prev, [i]: e.target.value }));
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
                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm dark:border-border/40 dark:text-text-main"
                                value={subcategoryOverrides[i] ?? tx.subcategory}
                                onChange={(e) =>
                                  setSubcategoryOverrides((prev) => ({ ...prev, [i]: e.target.value }))
                                }
                                placeholder={t("categoryPlaceholder")}
                                autoComplete="off"
                              />
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${
                                tx.type === "income"
                                  ? "text-income"
                                  : "text-expense"
                              }`}
                            >
                              {tx.type === "income" ? "+" : "-"}
                              {formatCurrency(tx.amount, preview.currency, locale)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex gap-2 justify-end shrink-0">
                <Button variant="outline" onClick={handleReset}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleConfirm} disabled={isPending || !canConfirm}>
                  {isPending
                    ? t("importing")
                    : preview.newCount > 0
                    ? t("importButton", { count: preview.newCount })
                    : t("updateBalance")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
