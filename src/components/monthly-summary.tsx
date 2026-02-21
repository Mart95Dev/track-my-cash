"use client";

import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations, useLocale } from "next-intl";

interface MonthData {
  month: string;
  income: number;
  expenses: number;
  net: number;
  savingsRate?: number | null;
}

function SavingsRateBadge({ rate }: { rate: number | null | undefined }) {
  if (rate == null) {
    return <span className="text-muted-foreground">—</span>;
  }
  const isPositive = rate >= 0;
  return (
    <span
      data-testid="savings-rate-badge"
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
        isPositive
          ? "bg-income/10 text-income border border-income/20"
          : "bg-expense/10 text-expense border border-expense/20"
      }`}
    >
      {rate >= 0 ? "+" : ""}
      {rate.toFixed(1)}%
    </span>
  );
}

export function MonthlySummary({ data }: { data: MonthData[] }) {
  const t = useTranslations("monthlySummary");
  const locale = useLocale();

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("month")}</TableHead>
                <TableHead className="text-right">{t("income")}</TableHead>
                <TableHead className="text-right">{t("expenses")}</TableHead>
                <TableHead className="text-right">{t("netBalance")}</TableHead>
                <TableHead className="text-right">Épargne</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((m, i) => {
                const prevNet = data[i + 1]?.net;
                const evolution = prevNet ? ((m.net - prevNet) / Math.abs(prevNet)) * 100 : null;
                return (
                  <TableRow key={m.month}>
                    <TableCell className="font-medium">{m.month}</TableCell>
                    <TableCell className="text-right text-income">
                      {formatCurrency(m.income, "EUR", locale)}
                    </TableCell>
                    <TableCell className="text-right text-expense">
                      {formatCurrency(m.expenses, "EUR", locale)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${m.net >= 0 ? "text-income" : "text-expense"}`}>
                      {formatCurrency(m.net, "EUR", locale)}
                      {evolution !== null && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({evolution >= 0 ? "+" : ""}{evolution.toFixed(0)}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <SavingsRateBadge rate={m.savingsRate} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
