export interface Account {
  id: number;
  name: string;
  initial_balance: number;
  balance_date: string;
  currency: string;
  created_at: string;
  calculated_balance?: number;
  alert_threshold?: number | null;
  last_alert_sent_at?: string | null;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;       // catégorie large (ex: "Abonnement", "Transport")
  subcategory: string | null; // pattern/sous-catégorie (ex: "netflix", "sncf")
  description: string;
  import_hash: string | null;
  created_at: string;
  account_name?: string;
  note: string | null;
}

export interface RecurringPayment {
  id: number;
  account_id: number;
  name: string;
  type: "income" | "expense";
  amount: number;
  frequency: string;
  next_date: string;
  end_date: string | null;
  category: string;
  subcategory: string | null;
  created_at: string;
  account_name?: string;
}

export interface ForecastItem {
  name: string;
  amount: number;
  category: string;
  frequency: string;
  accountName: string;
  startsFrom: string;
  endsAt: string | null;
}

export interface AccountForecastBreakdown {
  accountId: number;
  accountName: string;
  currency: string;
  startBalance: number;
  income: number;
  expenses: number;
  endBalance: number;
}

export interface MonthDetail {
  month: string;
  monthKey: string;
  startBalance: number;
  income: number;
  expenses: number;
  netCashflow: number;
  endBalance: number;
  incomeItems: ForecastItem[];
  expenseItems: ForecastItem[];
  accountBreakdown: AccountForecastBreakdown[];
}

export interface DetailedForecastResult {
  monthDetails: MonthDetail[];
  currentBalance: number;
  projectedBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface Budget {
  id: number;
  account_id: number;
  category: string;
  amount_limit: number;
  period: "monthly" | "yearly";
  created_at: string;
  last_budget_alert_at?: string | null;
  last_budget_alert_type?: "warning" | "exceeded" | null;
}

export interface BudgetStatus {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
  period: "monthly" | "yearly";
}

export interface BudgetHistoryEntry {
  id: number;
  account_id: number;
  category: string;
  period: string;
  limit_amount: number;
  spent_amount: number;
  month: string;
  created_at: string;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  deadline: string | null;
  created_at: string;
  account_id: number | null;
  monthly_contribution: number;
}

export interface Notification {
  id: number;
  type: "budget_exceeded" | "low_balance" | "import_complete" | "goal_reached";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface CategorizationRule {
  id: number;
  pattern: string;
  category: string;
  priority: number;
}

export interface SpendingTrendEntry {
  month: string;
  category: string;
  amount: number;
}

export interface CategoryExpense {
  category: string;
  total: number;
}

export interface WeeklySummaryData {
  weekStart: string;
  weekEnd: string;
  totalExpenses: number;
  totalIncome: number;
  currency: string;
  topCategories: { category: string; amount: number }[];
  budgetsOver: { category: string; spent: number; limit: number }[];
  goalsProgress: { name: string; percent: number }[];
}
