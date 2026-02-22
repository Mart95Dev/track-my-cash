import type { YoYResult } from "@/lib/mom-calculator";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

interface YoYComparisonWidgetProps {
  data: YoYResult[];
  currency?: string;
  locale?: string;
  currentYear: number;
  previousYear: number;
}

export function YoYComparisonWidget({
  data,
  currency = "EUR",
  locale = "fr",
  currentYear,
  previousYear,
}: YoYComparisonWidgetProps) {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Comparaison {currentYear} vs {previousYear} (par catégorie)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Catégorie</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">{currentYear}</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">{previousYear}</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Écart</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.category} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{row.category}</td>
                  <td className="text-right px-4 py-2">
                    {formatCurrency(row.currentAmount, currency, locale)}
                  </td>
                  <td className="text-right px-4 py-2 text-muted-foreground">
                    {row.previousAmount > 0
                      ? formatCurrency(row.previousAmount, currency, locale)
                      : "—"}
                  </td>
                  <td className="text-right px-4 py-2">
                    <TrendBadge result={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendBadge({ result }: { result: YoYResult }) {
  const { trend, deltaPercent, previousAmount } = result;

  if (previousAmount === 0) {
    return <span className="text-xs text-muted-foreground">nouveau</span>;
  }

  const abs = Math.abs(deltaPercent).toFixed(1);

  if (trend === "stable") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        {abs}%
      </span>
    );
  }

  // Pour les dépenses : hausse = mauvais (rouge), baisse = bon (vert)
  const colorClass = trend === "up" ? "text-expense" : "text-income";
  const sign = trend === "up" ? "+" : "-";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      {trend === "up" ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {sign}{abs}%
    </span>
  );
}
