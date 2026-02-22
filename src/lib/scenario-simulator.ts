export interface BaseForecast {
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  goals: { target_amount: number; current_amount: number }[];
}

export interface Scenario {
  type: "extra_savings" | "cut_expense" | "income_increase";
  amount: number; // €/mois pour extra_savings et cut_expense, % pour income_increase
  category?: string; // informatif — utilisé uniquement pour cut_expense
}

export interface SimulationResult {
  projectedSavingsRate: number; // % après scénario (plafonné à 100)
  baselineSavingsRate: number;  // % avant scénario
  monthlyNetSavings: number;    // épargne nette mensuelle projetée
  annualImpact: number;         // différence annuelle vs baseline (positif = meilleur)
  monthsToGoal: number | null;  // null si pas d'objectif ou épargne mensuelle ≤ 0
}

export function simulateScenario(
  base: BaseForecast,
  scenario: Scenario
): SimulationResult {
  const income = base.avgMonthlyIncome;
  const expenses = base.avgMonthlyExpenses;

  const baselineSavings = income - expenses;
  const baselineSavingsRate =
    income > 0 ? Math.min((baselineSavings / income) * 100, 100) : 0;

  let monthlyNetSavings: number;
  let annualImpact: number;
  let projectedSavingsRate: number;

  switch (scenario.type) {
    case "extra_savings": {
      monthlyNetSavings = baselineSavings + scenario.amount;
      annualImpact = scenario.amount * 12;
      projectedSavingsRate =
        income > 0 ? Math.min((monthlyNetSavings / income) * 100, 100) : 0;
      break;
    }
    case "cut_expense": {
      const newExpenses = expenses - scenario.amount;
      monthlyNetSavings = income - newExpenses;
      annualImpact = scenario.amount * 12;
      projectedSavingsRate =
        income > 0 ? Math.min((monthlyNetSavings / income) * 100, 100) : 0;
      break;
    }
    case "income_increase": {
      const newIncome = income * (1 + scenario.amount / 100);
      monthlyNetSavings = newIncome - expenses;
      annualImpact = (newIncome - income) * 12;
      projectedSavingsRate =
        newIncome > 0 ? Math.min((monthlyNetSavings / newIncome) * 100, 100) : 0;
      break;
    }
  }

  let monthsToGoal: number | null = null;
  if (base.goals.length > 0 && monthlyNetSavings > 0) {
    const remaining = base.goals.reduce(
      (sum, g) => sum + Math.max(0, g.target_amount - g.current_amount),
      0
    );
    monthsToGoal = Math.ceil(remaining / monthlyNetSavings);
  }

  return {
    projectedSavingsRate,
    baselineSavingsRate,
    monthlyNetSavings,
    annualImpact,
    monthsToGoal,
  };
}
