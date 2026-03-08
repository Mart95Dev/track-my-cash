// Barrel re-export — backward compatibility avec '@/lib/queries'
// Les imports comme `import { Account, getTransactions } from '@/lib/queries'`
// fonctionnent via ce barrel.

export * from "./types";
export * from "./mappers";
export * from "./account-queries";
export * from "./transaction-queries";
export * from "./recurring-queries";
export * from "./budget-queries";
export * from "./goal-queries";
export * from "./notification-queries";
export * from "./dashboard-queries";
export * from "./forecast-queries";
export * from "./settings-queries";
export * from "./categorization-queries";
export * from "./import-queries";
