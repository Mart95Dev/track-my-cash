"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function OpenRouterKeySettings({
  hasKey,
  onSave,
}: {
  hasKey: boolean;
  onSave: (key: string) => Promise<{ success?: boolean; error?: string }>;
}) {
  const [key, setKey] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Entrez votre clé API OpenRouter pour utiliser le conseiller IA.
        Obtenez-la sur{" "}
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary"
        >
          openrouter.ai/keys
        </a>
      </p>
      {hasKey && (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          Clé API configurée
        </p>
      )}
      <div className="flex items-end gap-3">
        <div className="space-y-1 flex-1">
          <Label htmlFor="openrouter-key" className="text-xs">
            {hasKey ? "Remplacer la clé" : "Clé API OpenRouter"}
          </Label>
          <Input
            id="openrouter-key"
            type="password"
            placeholder="sk-or-..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          disabled={isPending || !key.trim()}
          onClick={() => {
            startTransition(async () => {
              const result = await onSave(key);
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success("Clé API enregistrée");
                setKey("");
              }
            });
          }}
        >
          {isPending ? "..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
