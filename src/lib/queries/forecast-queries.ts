import type { Client } from "@libsql/client";
import type { Account, RecurringPayment, ForecastItem, AccountForecastBreakdown, MonthDetail, DetailedForecastResult } from "./types";
import { getMonthlyContribution } from "./mappers";
import { getAllAccounts } from "./account-queries";
import { getRecurringPayments } from "./recurring-queries";

function collectForecastItems(
  recurringPayments: RecurringPayment[],
  accounts: Account[],
  forecastDate: Date,
): { incomeItems: ForecastItem[]; expenseItems: ForecastItem[] } {
  const incomeItems: ForecastItem[] = [];
  const expenseItems: ForecastItem[] = [];

  for (const r of recurringPayments) {
    const amount = getMonthlyContribution(r, forecastDate);
    if (amount === 0) continue;
    const account = accounts.find((a) => a.id === r.account_id);
    const item: ForecastItem = {
      name: r.name,
      amount,
      category: r.category,
      frequency: r.frequency,
      accountName: account?.name ?? "",
      startsFrom: r.next_date,
      endsAt: r.end_date,
    };
    if (r.type === "income") {
      incomeItems.push(item);
    } else {
      expenseItems.push(item);
    }
  }

  return { incomeItems, expenseItems };
}

function computeAccountBreakdown(
  accounts: Account[],
  recurringPayments: RecurringPayment[],
  accountRunning: Record<number, number>,
  forecastDate: Date,
): AccountForecastBreakdown[] {
  return accounts.map((a) => {
    const accStart = accountRunning[a.id];
    const accRecurring = recurringPayments.filter((r) => r.account_id === a.id);
    const accIncome = accRecurring
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + getMonthlyContribution(r, forecastDate), 0);
    const accExpenses = accRecurring
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + getMonthlyContribution(r, forecastDate), 0);
    const accEnd = accStart + accIncome - accExpenses;
    accountRunning[a.id] = accEnd;
    return {
      accountId: a.id,
      accountName: a.name,
      currency: a.currency,
      startBalance: accStart,
      income: accIncome,
      expenses: accExpenses,
      endBalance: accEnd,
    };
  });
}

export async function getDetailedForecast(db: Client, months: number, accountId?: number): Promise<DetailedForecastResult> {
  const allAccounts = await getAllAccounts(db);
  const accounts = accountId ? allAccounts.filter((a) => a.id === accountId) : allAccounts;
  const allRecurring = await getRecurringPayments(db);
  const recurringPayments = accountId ? allRecurring.filter((r) => r.account_id === accountId) : allRecurring;
  const now = new Date();

  const currentBalance = accounts.reduce(
    (sum, a) => sum + (a.calculated_balance ?? a.initial_balance),
    0
  );

  let runningBalance = currentBalance;
  const accountRunning: Record<number, number> = {};
  for (const a of accounts) {
    accountRunning[a.id] = a.calculated_balance ?? a.initial_balance;
  }

  const monthDetails: MonthDetail[] = [];
  let totalIncome = 0;
  let totalExpenses = 0;

  for (let i = 0; i < months; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, "0")}`;
    const monthName = forecastDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    const startBalance = runningBalance;
    const { incomeItems, expenseItems } = collectForecastItems(recurringPayments, accounts, forecastDate);

    const income = incomeItems.reduce((s, item) => s + item.amount, 0);
    const expenses = expenseItems.reduce((s, item) => s + item.amount, 0);
    const netCashflow = income - expenses;
    const endBalance = startBalance + netCashflow;

    const accountBreakdown = computeAccountBreakdown(accounts, recurringPayments, accountRunning, forecastDate);

    totalIncome += income;
    totalExpenses += expenses;
    runningBalance = endBalance;

    monthDetails.push({
      month: monthName,
      monthKey,
      startBalance,
      income,
      expenses,
      netCashflow,
      endBalance,
      incomeItems,
      expenseItems,
      accountBreakdown,
    });
  }

  return {
    monthDetails,
    currentBalance,
    projectedBalance: runningBalance,
    totalIncome,
    totalExpenses,
  };
}
