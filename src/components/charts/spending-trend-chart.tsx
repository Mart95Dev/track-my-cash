"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SpendingTrendEntry } from "@/lib/queries";

const COLORS = [
  "oklch(0.6 0.118 184.704)",
  "oklch(0.65 0.15 30)",
  "oklch(0.6 0.14 270)",
  "oklch(0.65 0.13 140)",
  "oklch(0.6 0.12 60)",
];

function formatMonthLabel(month: string): string {
  const date = new Date(month + "-02");
  return date
    .toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
    .replace(".", "");
}

type ChartRow = Record<string, string | number>;

function buildChartData(
  data: SpendingTrendEntry[],
  top5: string[]
): ChartRow[] {
  const months = Array.from(new Set(data.map((d) => d.month))).sort();

  return months.map((month) => {
    const row: ChartRow = { month: formatMonthLabel(month) };
    for (const cat of top5) {
      const entry = data.find((d) => d.month === month && d.category === cat);
      row[cat] = entry?.amount ?? 0;
    }
    return row;
  });
}

export function SpendingTrendChart({
  data,
  currency = "EUR",
}: {
  data: SpendingTrendEntry[];
  currency?: string;
}) {
  if (data.length === 0) return null;

  // Top 5 catégories par montant total sur la période
  const totals = new Map<string, number>();
  for (const entry of data) {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount);
  }
  const top5 = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);

  const chartData = buildChartData(data, top5);

  const fmt = (value: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => fmt(Number(v))} width={80} />
        <Tooltip formatter={(value) => fmt(Number(value))} />
        <Legend />
        {top5.map((cat, i) => (
          <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
