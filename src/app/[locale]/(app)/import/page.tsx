import { getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { ImportButton } from "@/components/import-button";

export const dynamic = "force-dynamic";

// Formats supportés : CSV, XLSX, XML (CAMT.053/ISO 20022), MT940 (SWIFT/STA),
// OFX, QFX, CFONB (CFONB 120), ASC, PDF

const SUPPORTED_FORMATS = [
  { label: "CSV", desc: "Séparateur virgule ou point-virgule", ext: ".csv" },
  { label: "XLSX", desc: "Excel — Revolut, N26, Wise…", ext: ".xlsx" },
  { label: "XML", desc: "CAMT.053 (ISO 20022) — standard SWIFT 2025", ext: ".xml" },
  { label: "MT940", desc: "SWIFT legacy — BNP, SG, Crédit Agricole", ext: ".sta / .mt940" },
  { label: "OFX", desc: "Open Financial Exchange — La Banque Postale", ext: ".ofx / .qfx" },
  { label: "CFONB", desc: "Format interbancaire français (120 chars)", ext: ".cfonb / .asc" },
  { label: "PDF", desc: "Relevés PDF — MCB Madagascar", ext: ".pdf" },
];

export default async function ImportPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const accounts = await getAllAccounts(db);

  return (
    <div className="flex flex-col pb-24 bg-background-light min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 border-b border-slate-100/50 dark:border-slate-800/50">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Import</h1>
        <p className="text-sm text-text-muted mt-1">Importez vos relevés depuis toutes les banques</p>
      </header>

      <div className="flex flex-col gap-6 px-4 pt-6">

        {/* Bouton d'import */}
        <section className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">upload_file</span>
            <h2 className="font-bold text-text-main">Sélectionner un fichier</h2>
          </div>
          <p className="text-sm text-text-muted">
            Formats acceptés : CSV, XLSX, XML, MT940, OFX, QFX, CFONB, ASC, PDF
          </p>
          <ImportButton accounts={accounts} />
        </section>

        {/* Formats supportés */}
        <section className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Formats supportés</p>
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
            {SUPPORTED_FORMATS.map((fmt) => (
              <div key={fmt.label} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-none font-mono text-xs font-bold bg-primary/10 text-primary rounded px-2 py-0.5 min-w-[52px] text-center">
                  {fmt.label}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-text-main truncate">{fmt.desc}</span>
                  <span className="text-xs text-text-muted">{fmt.ext}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <span className="material-symbols-outlined text-primary shrink-0 text-[20px]">info</span>
          <p className="text-sm text-text-muted">
            Les doublons sont automatiquement détectés et ignorés lors de l&apos;import.
            Le parser est sélectionné automatiquement selon le format du fichier.
          </p>
        </div>

      </div>
    </div>
  );
}
