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

interface MonthData {
  month: string;
  income: number;
  expenses: number;
}

export function IncomeExpenseBarChart({
  data,
  currency = "EUR",
}: {
  data: MonthData[];
  currency?: string;
}) {
  if (data.length === 0) return null;

  const fmt = (value: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => fmt(Number(v))} width={80} />
        <Tooltip formatter={(value) => fmt(Number(value))} />
        <Legend />
        <Bar dataKey="income" name="Revenus" fill="#2e7d32" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Dépenses" fill="#d32f2f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
