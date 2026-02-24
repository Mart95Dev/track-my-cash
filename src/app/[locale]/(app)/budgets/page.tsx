import { getAllAccounts, getBudgets, getBudgetStatus } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getBudgetSuggestionsAction } from "@/app/actions/budget-suggestion-actions";
import { BudgetForm } from "@/components/budget-form";
import { BudgetProgress } from "@/components/budget-progress";
import { BudgetSuggestions } from "@/components/budget-suggestions";
import { AccountFilter } from "@/components/account-filter";
import { getLocale } from "next-intl/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const accounts = await getAllAccounts(db);

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <span className="material-symbols-outlined text-primary text-[64px] mb-4">savings</span>
        <h2 className="text-xl font-bold text-text-main mb-2">Aucun compte</h2>
        <p className="text-text-muted text-sm mb-6">Créez un compte pour configurer des budgets.</p>
        <Link
          href={`/${locale}/comptes`}
          className="bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20"
        >
          Créer un compte
        </Link>
      </div>
    );
  }

  const rawAccountId = params.accountId ? parseInt(params.accountId) : null;
  const accountId = rawAccountId ?? accounts[0]!.id;
  const selectedAccount = accounts.find((a) => a.id === accountId) ?? accounts[0]!;

  const [budgets, budgetStatus, suggestions] = await Promise.all([
    getBudgets(db, accountId),
    getBudgetStatus(db, accountId),
    getBudgetSuggestionsAction(accountId),
  ]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]">savings</span>
          <h1 className="text-2xl font-bold text-text-main">Budgets</h1>
        </div>
        <AccountFilter accounts={accounts} currentAccountId={accountId} basePath={`/${locale}/budgets`} />
      </div>

      {/* Suggestions IA */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
            <h2 className="font-bold text-text-main">Suggestions IA</h2>
          </div>
          <BudgetSuggestions suggestions={suggestions} accountId={accountId} />
        </div>
      )}

      {/* Budgets du mois */}
      {budgetStatus.length > 0 && (
        <div>
          <h2 className="font-bold text-text-main mb-3">Budgets du mois en cours</h2>
          <div className="flex flex-col gap-3">
            {budgetStatus.map((b) => (
              <BudgetProgress
                key={b.category}
                budget={b}
                currency={selectedAccount.currency}
                accountId={accountId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Gérer les budgets */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
          <h2 className="font-bold text-text-main">Gérer les budgets</h2>
        </div>
        <BudgetForm accountId={accountId} budgets={budgets} />
      </div>
    </div>
  );
}
