"use server";

import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { getMonthlySummary, getExpensesByBroadCategory, searchTransactions, getGoals } from "@/lib/queries";

export async function generateMonthlyReportAction(
  month: string
): Promise<{ pdfBase64: string; filename: string } | { error: string }> {
  const userId = await getRequiredUserId();

  const guard = await canUseAI(userId);
  if (!guard.allowed) {
    return { error: guard.reason ?? "Fonctionnalité réservée aux plans Pro/Premium" };
  }

  const db = await getUserDb(userId);

  const [allMonthlySummaries, categories, { transactions }, goals] = await Promise.all([
    getMonthlySummary(db),
    getExpensesByBroadCategory(db),
    searchTransactions(db, { page: 1, perPage: 10, sort: "amount_desc" }),
    getGoals(db),
  ]);

  const summary = allMonthlySummaries.find((s) => s.month === month);
  if (!summary && transactions.length === 0) {
    return { error: "Aucune donnée pour ce mois" };
  }

  const monthLabel = formatMonthLabel(month);

  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("track-my-cash — Rapport Financier", 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(monthLabel, 14, 28);

  let yPos = 38;

  // Section résumé
  if (summary) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("RÉSUMÉ DU MOIS", 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Revenus : ${fmtEur(summary.income)}`, 14, yPos);
    yPos += 6;
    doc.text(`Dépenses : ${fmtEur(summary.expenses)}`, 14, yPos);
    yPos += 6;
    doc.text(`Balance : ${summary.net >= 0 ? "+" : ""}${fmtEur(summary.net)}`, 14, yPos);
    yPos += 6;
    if (summary.savingsRate !== null) {
      doc.text(`Taux d'épargne : ${summary.savingsRate.toFixed(1)}%`, 14, yPos);
      yPos += 6;
    }
    yPos += 4;
  }

  // Section catégories
  if (categories.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("RÉPARTITION PAR CATÉGORIE", 14, yPos);
    yPos += 6;

    const totalCats = categories.reduce((acc, c) => acc + c.total, 0);
    autoTable(doc, {
      startY: yPos,
      head: [["Catégorie", "Montant", "%"]],
      body: categories.map((c) => [
        c.category,
        fmtEur(c.total),
        totalCats > 0 ? `${((c.total / totalCats) * 100).toFixed(1)}%` : "0%",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // Section top transactions
  if (transactions.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("TOP 10 TRANSACTIONS", 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Description", "Montant"]],
      body: transactions.slice(0, 10).map((tx) => [
        tx.date,
        tx.description || tx.category || "—",
        `${tx.type === "income" ? "+" : "-"}${fmtEur(tx.amount)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // Section objectifs d'épargne
  if (goals.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("OBJECTIFS D'ÉPARGNE", 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Objectif", "Progression", "%"]],
      body: goals.map((g) => {
        const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
        return [
          g.name,
          `${fmtEur(g.current_amount)} / ${fmtEur(g.target_amount)}`,
          `${Math.min(pct, 100).toFixed(1)}%`,
        ];
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
  }

  const pdfBase64 = doc.output("datauristring").split(",")[1];
  const filename = `rapport-${month}.pdf`;

  return { pdfBase64, filename };
}

function fmtEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
