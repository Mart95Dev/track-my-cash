"use server";

import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { computeAnnualReport } from "@/lib/annual-report";

export async function generateAnnualReportAction(
  accountId: number,
  year: number
): Promise<{ pdfBase64: string; filename: string } | { error: string }> {
  const userId = await getRequiredUserId();

  const guard = await canUseAI(userId);
  if (!guard.allowed) {
    return { error: guard.reason ?? "Fonctionnalité réservée aux plans Pro/Premium" };
  }

  if (!accountId || !year || year < 2000 || year > 2100) {
    return { error: "Compte et année requis" };
  }

  const db = await getUserDb(userId);
  const report = await computeAnnualReport(db, accountId, year);

  if (report.monthlyData.length === 0) {
    return { error: `Aucune transaction trouvée pour l'année ${year}` };
  }

  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("track-my-cash — Bilan Annuel", 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Année ${year}`, 14, 28);

  let yPos = 38;

  // Résumé annuel
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("RÉSUMÉ DE L'ANNÉE", 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Revenus totaux : ${fmtEur(report.totalIncome)}`, 14, yPos); yPos += 6;
  doc.text(`Dépenses totales : ${fmtEur(report.totalExpenses)}`, 14, yPos); yPos += 6;
  doc.text(`Balance nette : ${report.totalNet >= 0 ? "+" : ""}${fmtEur(report.totalNet)}`, 14, yPos); yPos += 6;
  doc.text(`Taux d'épargne annuel : ${report.annualSavingsRate.toFixed(1)}%`, 14, yPos); yPos += 6;

  if (report.bestMonth) {
    doc.text(`Meilleur mois : ${report.bestMonth.month} (+${fmtEur(report.bestMonth.net)})`, 14, yPos);
    yPos += 6;
  }
  if (report.worstMonth) {
    doc.text(`Mois le plus chargé : ${report.worstMonth.month} (${fmtEur(report.worstMonth.expenses)} dépenses)`, 14, yPos);
    yPos += 6;
  }
  yPos += 4;

  // Tableau mensuel
  if (report.monthlyData.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("DÉTAIL MENSUEL", 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Mois", "Revenus", "Dépenses", "Balance"]],
      body: report.monthlyData.map((m) => [
        m.month,
        fmtEur(m.income),
        fmtEur(m.expenses),
        `${m.net >= 0 ? "+" : ""}${fmtEur(m.net)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // Top catégories de dépenses
  if (report.topExpenseCategories.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("TOP CATÉGORIES DE DÉPENSES", 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Catégorie", "Total", "% des dépenses"]],
      body: report.topExpenseCategories.map((c) => [
        c.category,
        fmtEur(c.total),
        `${c.percentage.toFixed(1)}%`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
  }

  const pdfBase64 = doc.output("datauristring").split(",")[1];
  const filename = `bilan-annuel-${year}.pdf`;

  return { pdfBase64, filename };
}

function fmtEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}
