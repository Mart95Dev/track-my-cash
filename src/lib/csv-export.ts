export type TransactionCsvRow = {
  date: string;
  description: string;
  category: string;
  subcategory: string | null;
  type: "income" | "expense";
  amount: number;
  currency: string;
  account_name: string;
};

function escapeField(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Génère un fichier CSV RFC 4180 avec BOM UTF-8 (compatible Excel français).
 * Colonnes : Date, Description, Catégorie, Sous-catégorie, Type, Montant, Devise, Compte
 */
export function generateTransactionsCsv(rows: TransactionCsvRow[]): string {
  const headers = [
    "Date",
    "Description",
    "Catégorie",
    "Sous-catégorie",
    "Type",
    "Montant",
    "Devise",
    "Compte",
  ];

  const lines = [
    headers.map(escapeField).join(","),
    ...rows.map((row) =>
      [
        escapeField(row.date),
        escapeField(row.description ?? ""),
        escapeField(row.category),
        escapeField(row.subcategory ?? ""),
        escapeField(row.type === "income" ? "Revenu" : "Dépense"),
        escapeField(row.amount.toFixed(2)),
        escapeField(row.currency),
        escapeField(row.account_name ?? ""),
      ].join(",")
    ),
  ];

  return "\uFEFF" + lines.join("\n");
}
