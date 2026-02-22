import type { MoMVariation } from "@/lib/mom-calculator";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface VariationBadgeProps {
  variation: MoMVariation;
  /** "income" = hausse verte / baisse rouge ; "expense" = hausse rouge / baisse verte */
  variant?: "income" | "expense";
}

export function VariationBadge({ variation, variant = "income" }: VariationBadgeProps) {
  if (variation.direction === "no_previous" || variation.percentChange === null) return null;

  const { direction, percentChange } = variation;
  const abs = Math.abs(percentChange).toFixed(1);

  let colorClass: string;
  if (direction === "stable") {
    colorClass = "text-muted-foreground";
  } else if (direction === "up") {
    colorClass = variant === "income" ? "text-income" : "text-expense";
  } else {
    colorClass = variant === "income" ? "text-expense" : "text-income";
  }

  return (
    <span className={`flex items-center gap-1 text-xs font-medium mt-1 ${colorClass}`}>
      {direction === "up" && <TrendingUp className="h-3 w-3" />}
      {direction === "down" && <TrendingDown className="h-3 w-3" />}
      {direction === "stable" && <Minus className="h-3 w-3" />}
      {direction === "up" ? "+" : direction === "down" ? "-" : ""}
      {abs}%{" "}
      <span className="text-muted-foreground font-normal">vs mois préc.</span>
    </span>
  );
}
