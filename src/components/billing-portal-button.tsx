"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createBillingPortalSession } from "@/app/actions/billing-actions";
import { useLocale } from "next-intl";

export function BillingPortalButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await createBillingPortalSession(locale);
      if ("error" in result) {
        setError(result.error ?? "Erreur inconnue");
      } else if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={isPending}>
        {isPending ? "Redirection…" : "Gérer mon abonnement"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
