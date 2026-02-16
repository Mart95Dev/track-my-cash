"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function BalanceEvolutionChart({
  data,
}: {
  data: { month: string; total: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
        <YAxis className="text-xs" tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(Number(value))
          }
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Solde total"
          stroke="oklch(0.6 0.118 184.704)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
