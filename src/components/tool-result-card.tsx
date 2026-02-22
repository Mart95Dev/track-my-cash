import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ToolCallResult } from "@/lib/ai-tools";

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
