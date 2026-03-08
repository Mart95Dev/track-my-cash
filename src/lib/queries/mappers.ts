import type { Row } from "@libsql/client";
import type { Account, Transaction, RecurringPayment, Goal, Notification } from "./types";

export function rowToAccount(row: Row): Account {
  return {
    id: Number(row.id),
    name: String(row.name),
    initial_balance: Number(row.initial_balance),
    balance_date: String(row.balance_date),
    currency: String(row.currency),
    created_at: String(row.created_at),
    alert_threshold: row.alert_threshold != null ? Number(row.alert_threshold) : null,
    last_alert_sent_at: row.last_alert_sent_at != null ? String(row.last_alert_sent_at) : null,
  };
}

export function rowToTransaction(row: Row): Transaction {
  return {
    id: Number(row.id),
    account_id: Number(row.account_id),
    type: String(row.type) as "income" | "expense",
    amount: Number(row.amount),
    date: String(row.date),
    category: String(row.category),
    subcategory: row.subcategory ? String(row.subcategory) : null,
    description: String(row.description),
    import_hash: row.import_hash ? String(row.import_hash) : null,
    created_at: String(row.created_at),
    account_name: row.account_name ? String(row.account_name) : undefined,
    note: row.note != null ? String(row.note) : null,
  };
}

export function rowToRecurring(row: Row): RecurringPayment {
  return {
    id: Number(row.id),
    account_id: Number(row.account_id),
    name: String(row.name),
    type: String(row.type) as "income" | "expense",
    amount: Number(row.amount),
    frequency: String(row.frequency),
    next_date: String(row.next_date),
    end_date: row.end_date ? String(row.end_date) : null,
    category: String(row.category),
    subcategory: row.subcategory ? String(row.subcategory) : null,
    created_at: String(row.created_at),
    account_name: row.account_name ? String(row.account_name) : undefined,
  };
}

export function rowToGoal(row: Row): Goal {
  return {
    id: Number(row.id),
    name: String(row.name),
    target_amount: Number(row.target_amount),
    current_amount: Number(row.current_amount),
    currency: String(row.currency),
    deadline: row.deadline != null ? String(row.deadline) : null,
    created_at: String(row.created_at),
    account_id: row.account_id != null ? Number(row.account_id) : null,
    monthly_contribution: row.monthly_contribution != null ? Number(row.monthly_contribution) : 0,
  };
}

export function rowToNotification(row: Row): Notification {
  return {
    id: Number(row.id),
    type: String(row.type) as Notification["type"],
    title: String(row.title),
    message: String(row.message),
    read: Number(row.read) === 1,
    created_at: String(row.created_at),
  };
}

export function getMonthlyContribution(r: RecurringPayment, forecastDate: Date): number {
  const nextDate = new Date(r.next_date);
  const monthsDiff =
    (forecastDate.getFullYear() - nextDate.getFullYear()) * 12 +
    (forecastDate.getMonth() - nextDate.getMonth());

  if (monthsDiff < 0) return 0;

  if (r.end_date) {
    const endDate = new Date(r.end_date);
    const afterEnd =
      (forecastDate.getFullYear() - endDate.getFullYear()) * 12 +
      (forecastDate.getMonth() - endDate.getMonth());
    if (afterEnd > 0) return 0;
  }

  switch (r.frequency) {
    case "monthly":
      return r.amount;
    case "weekly":
      return r.amount * 4;
    case "yearly":
      return forecastDate.getMonth() === nextDate.getMonth() ? r.amount : 0;
    default:
      return r.amount;
  }
}
