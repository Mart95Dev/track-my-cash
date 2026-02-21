"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import {
  autoCategorizeAction,
  applyCategorizationsAction,
  type CategorizationSuggestion,
} from "@/app/actions/ai-categorize-actions";

type Props = {
  uncategorizedCount: number;
};

export function AutoCategorizeButton({ uncategorizedCount }: Props) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CategorizationSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isApplying, startApplying] = useTransition();

  function handleAnalyze() {
    if (uncategorizedCount === 0) {
      toast.info("Toutes les transactions sont déjà catégorisées");
      return;
    }
    startAnalyzing(async () => {
      const result = await autoCategorizeAction();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSuggestions(result);
      setSelected(new Set(result.map((s) => s.id)));
      setOpen(true);
    });
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleApply() {
    const toApply = suggestions.filter((s) => selected.has(s.id));
    startApplying(async () => {
      const result = await applyCategorizationsAction(toApply);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.count} transaction${result.count > 1 ? "s" : ""} catégorisée${result.count > 1 ? "s" : ""}`);
      setOpen(false);
      setSuggestions([]);
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {isAnalyzing ? "Analyse en cours..." : "Catégoriser par IA"}
        {uncategorizedCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {uncategorizedCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Suggestions de catégorisation
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Sélectionnez les suggestions à appliquer :
          </p>

          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 p-3 rounded-md border"
              >
                <Checkbox
                  id={`suggestion-${s.id}`}
                  checked={selected.has(s.id)}
                  onCheckedChange={() => toggleSelect(s.id)}
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`suggestion-${s.id}`}
                    className="text-sm font-medium cursor-pointer truncate block"
                  >
                    {s.description}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {s.category}
                    </Badge>
                    {s.subcategory && (
                      <span className="text-xs text-muted-foreground">{s.subcategory}</span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {s.amount > 0 ? "+" : ""}{s.amount.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleApply}
              disabled={selected.size === 0 || isApplying}
            >
              {isApplying
                ? "Application..."
                : `Appliquer (${selected.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
