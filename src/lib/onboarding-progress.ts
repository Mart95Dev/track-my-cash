/**
 * STORY-105 : Barre de progression onboarding gamifiée
 * Logique pure de calcul des étapes d'onboarding.
 */

export interface OnboardingStep {
  label: string;
  completed: boolean;
  icon: string;
}

export interface OnboardingProgress {
  steps: OnboardingStep[];
  completed: number;
  total: number;
  percentage: number;
}

export function computeOnboardingProgress(params: {
  hasTransactions: boolean;
  hasPartner: boolean;
  hasCoupleBudget: boolean;
}): OnboardingProgress {
  const steps: OnboardingStep[] = [
    {
      label: "Compte créé",
      completed: true,
      icon: "account_balance_wallet",
    },
    {
      label: "1ère transaction",
      completed: params.hasTransactions,
      icon: "receipt_long",
    },
    {
      label: "Partenaire invité",
      completed: params.hasPartner,
      icon: "favorite",
    },
    {
      label: "Budget commun",
      completed: params.hasCoupleBudget,
      icon: "savings",
    },
  ];

  const completed = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const percentage = Math.round((completed / total) * 100);

  return { steps, completed, total, percentage };
}
