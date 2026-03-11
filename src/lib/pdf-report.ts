import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type JsPDFWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } };

export interface MonthlyReportCoupleData {
  sharedExpenses: number;
  balance: number;
  partnerName: string;
  topSharedCategory: string;
}

export interface MonthlyReportData {
  month: string;
  revenues: number;
  expenses: number;
  net: number;
  topCategories: { category: string; amount: number; pct: number }[];
  transactions: { date: string; description: string; category: string; amount: number }[];
  coupleData?: MonthlyReportCoupleData;
  currency?: string;
}

export function validateMonthParam(month: string | null | undefined): boolean {
  if (!month) return false;
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function generateMonthlyReport(data: MonthlyReportData): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const currency = data.currency ?? "EUR";

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(n);

  const monthLabel = new Date(data.month + "-02").toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  // ── En-tête ──────────────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Koupli — Rapport Mensuel", 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(monthLabel, 14, 28);
  doc.setFontSize(9);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 35);

  let yPos = 44;

  // ── Résumé financier ─────────────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("RÉSUMÉ DU MOIS", 14, yPos);
  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    head: [["Revenus", "Dépenses", "Solde net"]],
    body: [[fmt(data.revenues), fmt(data.expenses), fmt(data.net)]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [15, 23, 42] },
    margin: { left: 14, right: 14 },
  });
  yPos = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;

  // ── Top 5 catégories ─────────────────────────────────────────────────────────
  if (data.topCategories.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("TOP CATÉGORIES DE DÉPENSES", 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Catégorie", "Montant", "Part"]],
      body: data.topCategories.slice(0, 5).map((c) => [
        c.category,
        fmt(c.amount),
        `${c.pct}%`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;
  }

  // ── Transactions du mois ─────────────────────────────────────────────────────
  if (data.transactions.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("TRANSACTIONS DU MOIS", 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Description", "Catégorie", "Montant"]],
      body: data.transactions.map((t) => [t.date, t.description, t.category, fmt(t.amount)]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Section couple (page séparée si présente) ─────────────────────────────────
  if (data.coupleData) {
    doc.addPage();
    const cw = data.coupleData;
    const absBalance = Math.abs(cw.balance);
    const balanceLabel =
      cw.balance > 0
        ? `${cw.partnerName} vous doit ${fmt(absBalance)}`
        : cw.balance < 0
          ? `Vous devez ${fmt(absBalance)} à ${cw.partnerName}`
          : "Balance à l'équilibre";

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("FINANCES DU COUPLE", 14, 20);

    autoTable(doc, {
      startY: 28,
      head: [["Dépenses partagées", "Balance", "Catégorie principale"]],
      body: [[fmt(cw.sharedExpenses), balanceLabel, cw.topSharedCategory]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [124, 58, 237] },
      margin: { left: 14, right: 14 },
    });
  }

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}
