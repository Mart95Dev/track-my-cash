"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function OpenRouterKeySettings({
  hasKey,
  onSave,
}: {
  hasKey: boolean;
  onSave: (key: string) => Promise<{ success?: boolean; error?: string }>;
}) {
  const t = useTranslations("settings.openrouter");
  const [key, setKey] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t("description")}{" "}
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary"
        >
          {t("linkText")}
        </a>
      </p>
      {hasKey && (
        <p className="text-sm text-income font-medium">
          {t("configured")}
        </p>
      )}
      <div className="flex items-end gap-3">
        <div className="space-y-1 flex-1">
          <Label htmlFor="openrouter-key" className="text-xs">
            {hasKey ? t("replaceLabel") : t("label")}
          </Label>
          <Input
            id="openrouter-key"
            type="password"
            placeholder={t("placeholder")}
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
                toast.success(t("success"));
                setKey("");
              }
            });
          }}
        >
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
