export interface RecurringSuggestion {
  normalizedName: string;
  displayName: string;
  avgAmount: number;
  type: "expense" | "income";
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  confidence: number;
  nextDate: string;
  occurrences: number;
  category: string;
}

export interface RecurringDetectorInput {
  transactions: {
    id: number;
    description: string;
    amount: number;
    type: "income" | "expense";
    date: string;
    category: string;
  }[];
  existingRecurrings: {
    name: string;
    amount: number;
    frequency: string;
  }[];
}

export function normalizeDescription(description: string): string {
  return description
    .toLowerCase()
    .replace(/\d{4,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectFrequency(intervalDays: number): "weekly" | "monthly" | "quarterly" | "yearly" | null {
  if (intervalDays >= 5 && intervalDays <= 9) return "weekly";
  if (intervalDays >= 25 && intervalDays <= 35) return "monthly";
  if (intervalDays >= 80 && intervalDays <= 100) return "quarterly";
  if (intervalDays >= 335 && intervalDays <= 395) return "yearly";
  return null;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]!;
}

function frequencyDays(frequency: "weekly" | "monthly" | "quarterly" | "yearly"): number {
  const map = { weekly: 7, monthly: 30, quarterly: 90, yearly: 365 };
  return map[frequency];
}

export function detectRecurringPatterns(input: RecurringDetectorInput): RecurringSuggestion[] {
  const { transactions, existingRecurrings } = input;

  // Grouper par description normalisée
  const groups = new Map<string, typeof transactions>();
  for (const tx of transactions) {
    const key = normalizeDescription(tx.description);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tx);
  }

  // Noms normalisés des récurrents existants
  const existingNormalized = new Set(
    existingRecurrings.map((r) => normalizeDescription(r.name))
  );

  const suggestions: RecurringSuggestion[] = [];

  for (const [normalizedName, group] of groups) {
    if (group.length < 3) continue;

    // Exclure si déjà couvert par un récurrent existant
    if (existingNormalized.has(normalizedName)) continue;

    // Trier par date
    const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));

    // Calculer les intervalles
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i - 1]!.date).getTime();
      const d2 = new Date(sorted[i]!.date).getTime();
      intervals.push(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    }

    const medianInterval = intervals.sort((a, b) => a - b)[Math.floor(intervals.length / 2)]!;
    const frequency = detectFrequency(medianInterval);
    if (!frequency) continue;

    // Calculer la stabilité du montant
    const amounts = group.map((t) => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const maxDeviation = Math.max(...amounts.map((a) => Math.abs(a - avgAmount) / avgAmount));

    if (maxDeviation > 0.1) continue; // Montants trop variables (>10%)

    // Calculer la confiance
    const intervalVariance =
      intervals.reduce((sum, i) => sum + Math.abs(i - medianInterval), 0) / intervals.length;
    const intervalConfidence = Math.max(0, 1 - intervalVariance / medianInterval);
    const amountConfidence = 1 - maxDeviation;
    const confidence = (intervalConfidence + amountConfidence) / 2;

    if (confidence < 0.5) continue;

    // Catégorie la plus fréquente
    const categoryCounts = new Map<string, number>();
    for (const tx of group) {
      categoryCounts.set(tx.category, (categoryCounts.get(tx.category) ?? 0) + 1);
    }
    const category = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]![0];

    // Type le plus fréquent
    const expenseCount = group.filter((t) => t.type === "expense").length;
    const type = expenseCount >= group.length / 2 ? "expense" : "income";

    // Meilleur nom (le plus court non vide)
    const displayName = group
      .map((t) => t.description.trim())
      .sort((a, b) => a.length - b.length)[0]!;

    // Date suivante estimée
    const lastDate = sorted[sorted.length - 1]!.date;
    const nextDate = addDays(lastDate, frequencyDays(frequency));

    suggestions.push({
      normalizedName,
      displayName,
      avgAmount: Math.round(avgAmount * 100) / 100,
      type,
      frequency,
      confidence: Math.round(confidence * 100) / 100,
      nextDate,
      occurrences: group.length,
      category,
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}
