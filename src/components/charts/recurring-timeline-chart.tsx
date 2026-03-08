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
import type { RecurringPayment } from "@/lib/queries";

interface TimelineEntry {
  month: string;
  income: number;
  expenses: number;
}

function getMonthlyAmount(payment: RecurringPayment): number {
  switch (payment.frequency) {
    case "weekly":
      return payment.amount * 4.33;
    case "monthly":
      return payment.amount;
    case "quarterly":
      return payment.amount / 3;
    case "yearly":
      return payment.amount / 12;
    default:
      return payment.amount;
  }
}

function buildTimeline(payments: RecurringPayment[], months: number): TimelineEntry[] {
  const now = new Date();
  const entries: TimelineEntry[] = [];

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }).replace(".", "");

    let income = 0;
    let expenses = 0;

    for (const p of payments) {
      const amount = getMonthlyAmount(p);
      if (p.type === "income") {
        income += amount;
      } else {
        expenses += amount;
      }
    }

    entries.push({
      month: label,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
    });
  }

  return entries;
}

export function RecurringTimelineChart({
  payments,
  months = 3,
  currency = "EUR",
}: {
  payments: RecurringPayment[];
  months?: number;
  currency?: string;
}) {
  if (payments.length === 0) return null;

  const timeline = buildTimeline(payments, months);

  const fmt = (value: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={timeline} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => fmt(Number(v))} width={80} />
        <Tooltip formatter={(value) => fmt(Number(value))} />
        <Legend />
        <Bar dataKey="income" name="Revenus récurrents" fill="#2e7d32" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Charges récurrentes" fill="#d32f2f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
