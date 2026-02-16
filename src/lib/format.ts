export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export const CATEGORIES = [
  { id: "alimentation", name: "Alimentation" },
  { id: "logement", name: "Logement" },
  { id: "transport", name: "Transport" },
  { id: "loisirs", name: "Loisirs" },
  { id: "sante", name: "Santé" },
  { id: "shopping", name: "Shopping" },
  { id: "salaire", name: "Salaire" },
  { id: "services", name: "Services" },
  { id: "virement", name: "Virement" },
  { id: "autre", name: "Autre" },
];
