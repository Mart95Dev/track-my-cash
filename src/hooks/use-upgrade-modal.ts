"use client";

import { useState } from "react";

export type UpgradeReason =
  | "ai"
  | "accounts_limit"
  | "import_pdf"
  | "import_xlsx"
  | "export_pdf"
  | "history";

export type UpgradeConfig = {
  targetPlan: "pro" | "premium";
  title: string;
  description: string;
  features: string[];
};

export const UPGRADE_CONFIGS: Record<UpgradeReason, UpgradeConfig> = {
  ai: {
    targetPlan: "pro",
    title: "Débloquez le Conseiller IA",
    description: "Posez vos questions financières à notre assistant IA.",
    features: ["10 requêtes IA par mois", "Analyse de vos dépenses", "Conseils personnalisés"],
  },
  accounts_limit: {
    targetPlan: "pro",
    title: "Ajoutez plus de comptes",
    description: "Le plan Gratuit est limité à 2 comptes bancaires.",
    features: ["Jusqu'à 5 comptes", "Multi-devises", "Vue agrégée"],
  },
  import_pdf: {
    targetPlan: "pro",
    title: "Importez vos relevés PDF",
    description: "L'import PDF est disponible à partir du plan Pro.",
    features: ["Import PDF & Excel", "Toutes les banques françaises", "Détection auto des doublons"],
  },
  import_xlsx: {
    targetPlan: "pro",
    title: "Importez vos relevés Excel",
    description: "L'import Excel (.xlsx) est disponible à partir du plan Pro.",
    features: ["Import PDF & Excel", "Parsers ING, Boursorama, Revolut", "Détection auto des doublons"],
  },
  export_pdf: {
    targetPlan: "pro",
    title: "Exportez en PDF",
    description: "L'export de rapports PDF mensuel est disponible en Pro.",
    features: ["Rapport mensuel PDF", "Historique complet", "Multi-devises"],
  },
  history: {
    targetPlan: "pro",
    title: "Accédez à tout votre historique",
    description: "Le plan Gratuit limite l'historique à 3 mois.",
    features: ["Historique illimité", "Comparaisons YoY", "Tendances long terme"],
  },
};

/**
 * Détecte si un message d'erreur correspond à un blocage par plan.
 * Retourne la UpgradeReason correspondante, ou null si c'est une erreur normale.
 */
export function detectUpgradeReason(errorMsg: string): UpgradeReason | null {
  if (errorMsg.includes("import") && errorMsg.includes("PDF")) return "import_pdf";
  if (errorMsg.includes("import") && errorMsg.includes("Excel")) return "import_xlsx";
  if (errorMsg.includes("Limite atteinte")) return "accounts_limit";
  if (errorMsg.includes("conseiller IA")) return "ai";
  return null;
}

export function useUpgradeModal() {
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);

  function showUpgradeModal(reason: UpgradeReason) {
    setUpgradeReason(reason);
  }

  function closeUpgradeModal() {
    setUpgradeReason(null);
  }

  return { upgradeReason, showUpgradeModal, closeUpgradeModal };
}
