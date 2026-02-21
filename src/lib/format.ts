export function formatCurrency(amount: number, currency: string = "EUR", locale: string = "fr"): string {
  const bcp47 = locale.includes("-") ? locale : `${locale}-${locale.toUpperCase()}`;
  return new Intl.NumberFormat(bcp47, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(dateString: string, locale: string = "fr"): string {
  const date = new Date(dateString + "T00:00:00");
  const bcp47 = locale.includes("-") ? locale : `${locale}-${locale.toUpperCase()}`;
  return new Intl.DateTimeFormat(bcp47, {
    day: "2-digit",
    month: "short",
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
