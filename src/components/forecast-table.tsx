import { Badge } from "@/components/ui/badge";
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

const STATUS_BADGE: Record<CategoryForecast["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  on_track: { label: "OK", variant: "default" },
  at_risk: { label: "Risque", variant: "secondary" },
  exceeded: { label: "Dépassé", variant: "destructive" },
  no_budget: { label: "—", variant: "outline" },
};

const TREND_ICON: Record<CategoryForecast["trend"], string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const TREND_CLASS: Record<CategoryForecast["trend"], string> = {
  up: "text-expense",
  down: "text-income",
  stable: "text-muted-foreground",
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
              <TableCell className="font-medium">{f.category}</TableCell>
              <TableCell className="text-right">
                {f.avgAmount.toFixed(2)} €
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {f.budgetLimit !== null ? `${f.budgetLimit.toFixed(2)} €` : "—"}
              </TableCell>
              <TableCell className={`text-center font-bold ${TREND_CLASS[f.trend]}`}>
                {TREND_ICON[f.trend]}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
