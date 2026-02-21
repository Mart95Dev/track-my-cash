"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sendMonthlySummaryAction } from "@/app/actions/settings-actions";
import { Mail } from "lucide-react";

export function MonthlySummaryEmailButton() {
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    try {
      const result = await sendMonthlySummaryAction();
      if (result.error) {
        toast.error("Échec de l'envoi", { description: result.error });
      } else {
        toast.success("Récapitulatif envoyé !", {
          description: "Vérifiez votre boîte email.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSend} disabled={loading}>
      <Mail className="h-4 w-4 mr-2" />
      {loading ? "Envoi en cours…" : "Envoyer le récapitulatif du mois"}
    </Button>
  );
}
