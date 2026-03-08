"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#4848e5",
  "#2e7d32",
  "#d32f2f",
  "#f57c00",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#65a30d",
  "#c2410c",
  "#6366f1",
];

interface CategoryData {
  category: string;
  total: number;
}

function groupSmallCategories(data: CategoryData[]): CategoryData[] {
  const grandTotal = data.reduce((s, d) => s + d.total, 0);
  if (grandTotal === 0) return data;

  const threshold = grandTotal * 0.05;
  const major: CategoryData[] = [];
  let otherTotal = 0;

  for (const item of data) {
    if (item.total < threshold) {
      otherTotal += item.total;
    } else {
      major.push(item);
    }
  }

  if (otherTotal > 0) {
    major.push({ category: "Autres", total: otherTotal });
  }

  return major;
}

export function CategoryPieChart({
  data,
  currency = "EUR",
}: {
  data: CategoryData[];
  currency?: string;
}) {
  if (data.length === 0) return null;

  const grouped = groupSmallCategories(data);
  const grandTotal = grouped.reduce((s, d) => s + d.total, 0);

  const fmt = (value: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={grouped}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }) =>
            `${name} ${grandTotal > 0 ? Math.round((Number(value) / grandTotal) * 100) : 0}%`
          }
        >
          {grouped.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => fmt(Number(value))}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
