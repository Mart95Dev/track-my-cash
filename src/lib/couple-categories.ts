export const COUPLE_CATEGORIES = [
  "Loyer / charges",
  "Courses alimentaires",
  "Restaurants & sorties",
  "Voyages",
  "Factures communes",
  "Loisirs communs",
  "Santé commune",
  "Éducation",
] as const;

const EMPTY_CATEGORY_VALUES = new Set(["", "autre", "Autre", "other"]);

export function isCategoryEmpty(
  category: string | undefined | null
): boolean {
  if (category == null) return true;
  return EMPTY_CATEGORY_VALUES.has(category) || category.trim() === "";
}
