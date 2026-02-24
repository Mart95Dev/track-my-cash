import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategoryForecast } from "@/lib/forecasting";

type Props = {
  forecasts: CategoryForecast[];
};

const STATUS_BADGE: Record<CategoryForecast["status"], { label: string; className: string }> = {
  on_track: { label: "OK", className: "bg-success/10 text-success" },
  at_risk: { label: "Risque", className: "bg-warning/10 text-warning" },
  exceeded: { label: "Dépassé", className: "bg-danger/10 text-danger" },
  no_budget: { label: "—", className: "bg-gray-100 text-text-muted" },
};

const TREND_ICON: Record<CategoryForecast["trend"], string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const TREND_CLASS: Record<CategoryForecast["trend"], string> = {
  up: "text-danger",
  down: "text-success",
  stable: "text-text-muted",
};

export function ForecastTable({ forecasts }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Catégorie</TableHead>
          <TableHead className="text-right">Moy. 3 mois</TableHead>
          <TableHead className="text-right">Budget</TableHead>
          <TableHead className="text-center">Tendance</TableHead>
          <TableHead className="text-center">Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forecasts.map((f) => {
          const badge = STATUS_BADGE[f.status];
          return (
            <TableRow key={f.category}>
              <TableCell className="font-bold text-text-main">{f.category}</TableCell>
              <TableCell className="text-right font-medium text-text-main">
                {f.avgAmount.toFixed(2)} €
              </TableCell>
              <TableCell className="text-right text-text-muted">
                {f.budgetLimit !== null ? `${f.budgetLimit.toFixed(2)} €` : "—"}
              </TableCell>
              <TableCell className={`text-center font-bold ${TREND_CLASS[f.trend]}`}>
                {TREND_ICON[f.trend]}
              </TableCell>
              <TableCell className="text-center">
                <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${badge.className}`}>
                  {badge.label}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
