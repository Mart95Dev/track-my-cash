"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BillingCycle } from "@/lib/stripe-plans";

type SubscribeButtonProps = {
  planId: string;
  label: string;
  billingCycle?: BillingCycle;
};

export function SubscribeButton({ planId, label, billingCycle = "mensuel" }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Erreur lors du paiement");
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="w-full">
      {loading ? "Redirection..." : label}
    </Button>
  );
}
