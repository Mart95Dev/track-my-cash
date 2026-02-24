import { CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ToolCallResult } from "@/lib/ai-tools";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "semaine",
  monthly: "mois",
  quarterly: "trimestre",
  yearly: "an",
};

interface ToolResultCardProps {
  result: ToolCallResult;
}

export function ToolResultCard({ result }: ToolResultCardProps) {
  if (result.type === "budget") {
    return (
      <Card className="border-income/30 bg-income/5 my-2">
        <CardContent className="py-3 px-4 flex items-start gap-3">
          <CheckCircle className="h-4 w-4 text-income mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Budget créé</p>
            <p className="text-xs text-muted-foreground">
              {result.category} — {result.amount_limit}€/mois
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.type === "recurring") {
    const freqLabel = FREQUENCY_LABELS[result.frequency] ?? result.frequency;
    return (
      <Card className="border-income/30 bg-income/5 my-2">
        <CardContent className="py-3 px-4 flex items-start gap-3">
          <RefreshCw className="h-4 w-4 text-income mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Récurrent créé</p>
            <p className="text-xs text-muted-foreground">
              {result.name} — {result.amount}€/{freqLabel}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.type === "couple_balance") {
    return (
      <Card className="border-primary/30 bg-primary/5 my-2">
        <CardContent className="py-3 px-4 flex items-start gap-3">
          <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Balance couple</p>
            <p className="text-xs text-muted-foreground">{result.message}</p>
            <p className="text-xs text-muted-foreground">
              Vous : {result.user1Paid.toFixed(2)}€ · Partenaire : {result.user2Paid.toFixed(2)}€
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.type === "couple_summary") {
    return (
      <Card className="border-primary/30 bg-primary/5 my-2">
        <CardContent className="py-3 px-4 flex items-start gap-3">
          <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Dépenses communes — {result.period}</p>
            <p className="text-xs text-muted-foreground">
              {result.totalExpenses.toFixed(2)}€ · {result.transactionCount} transaction{result.transactionCount !== 1 ? "s" : ""}
            </p>
            {result.topCategories.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Top : {result.topCategories.slice(0, 3).map((c) => c.category).join(", ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-income/30 bg-income/5 my-2">
      <CardContent className="py-3 px-4 flex items-start gap-3">
        <CheckCircle className="h-4 w-4 text-income mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Objectif créé</p>
          <p className="text-xs text-muted-foreground">
            {result.name} — {result.target_amount}€
            {result.deadline ? ` · échéance ${result.deadline}` : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
