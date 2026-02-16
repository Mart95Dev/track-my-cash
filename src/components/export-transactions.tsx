"use client";

import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export function ExportTransactions({ transactions }: { transactions: Transaction[] }) {
  function exportCSV() {
    const headers = ["Date", "Compte", "Type", "Montant", "Catégorie", "Description"];
    const rows = transactions.map((tx) => [
      tx.date,
      tx.account_name ?? "",
      tx.type === "income" ? "Revenu" : "Dépense",
      tx.amount.toFixed(2),
      tx.category,
      tx.description,
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Transactions BankSolo", 14, 20);
    doc.setFontSize(10);
    doc.text(`Export du ${formatDate(new Date().toISOString().split("T")[0])}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Compte", "Type", "Montant", "Catégorie", "Description"]],
      body: transactions.map((tx) => [
        tx.date,
        tx.account_name ?? "",
        tx.type === "income" ? "Revenu" : "Dépense",
        `${tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}`,
        tx.category,
        tx.description,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
    });

    doc.save(`transactions-${new Date().toISOString().split("T")[0]}.pdf`);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV} disabled={transactions.length === 0}>
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF} disabled={transactions.length === 0}>
        Export PDF
      </Button>
    </div>
  );
}
