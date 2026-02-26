import { getAllAccounts, getBudgets, getBudgetStatus } from "@/lib/queries";
import { getUserDb, getDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getBudgetSuggestionsAction } from "@/app/actions/budget-suggestion-actions";
import { BudgetForm } from "@/components/budget-form";
import { BudgetProgress } from "@/components/budget-progress";
import { BudgetSuggestions } from "@/components/budget-suggestions";
import { AccountFilter } from "@/components/account-filter";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import {
  getCoupleByUserId,
  getCoupleMembers,
  getCoupleSharedBudgets,
  type CoupleBudgetItem,
} from "@/lib/couple-queries";
import { canUseCoupleFeature } from "@/lib/subscription-utils";

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
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background-light dark:bg-background-dark">
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

  // ─── Couple section ────────────────────────────────────────────────────────
  let hasCoupleActive = false;
  let isPro = false;
  let coupleId: string | undefined;
  let coupleSharedBudgets: CoupleBudgetItem[] = [];

  try {
    const mainDb = getDb();
    const couple = await getCoupleByUserId(mainDb, userId);
    if (couple) {
      hasCoupleActive = true;
      coupleId = couple.id;
      const gate = await canUseCoupleFeature(userId);
      isPro = gate.allowed;

      if (isPro) {
        const members = await getCoupleMembers(mainDb, couple.id);
        const partner = members.find((m) => m.user_id !== userId);
        if (partner) {
          const partnerDb = await getUserDb(partner.user_id);
          coupleSharedBudgets = await getCoupleSharedBudgets(db, partnerDb, couple.id);
        }
      }
    }
  } catch {
    // Silently ignore — couple feature non critique
  }

  return (
    <div className="flex flex-col pb-24 bg-background-light dark:bg-background-dark min-h-screen">

      {/* Header sticky — AC-1 */}
      <header className="px-6 pt-12 pb-4 flex items-end justify-between sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-100/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Budgets</h1>
        </div>
        {/* Bouton add — AC-1 (bg-primary rounded-full) */}
        <a
          href="#budget-form"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors shrink-0"
          aria-label="Ajouter un budget"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </a>
      </header>

      {/* Filtre compte */}
      <div className="px-6 pt-3 pb-1">
        <AccountFilter accounts={accounts} currentAccountId={accountId} basePath={`/${locale}/budgets`} />
      </div>

      <div className="px-4 flex flex-col gap-4 mt-2">

        {/* Suggestions IA — AC-2 glass-panel backdrop-blur */}
        {suggestions.length > 0 && (
          <div className="rounded-2xl border border-white/50 shadow-lg backdrop-blur-md bg-white/70 dark:bg-white/5 dark:border-white/5 p-4 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                <h2 className="font-bold text-text-main">Suggestions IA</h2>
              </div>
              <BudgetSuggestions suggestions={suggestions} accountId={accountId} />
            </div>
          </div>
        )}

        {/* Budgets du mois — AC-3 progress bars colorées / AC-4 icône catégorie */}
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

        {/* Budgets communs couple */}
        {hasCoupleActive && isPro && coupleSharedBudgets.length > 0 && (
          <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-slate-800 shadow-soft p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">favorite</span>
              <h2 className="font-bold text-text-main">Budgets communs</h2>
            </div>
            <div className="flex flex-col gap-2">
              {coupleSharedBudgets.map((b, i) => (
                <div
                  key={`${b.id}-${i}`}
                  className="flex items-center justify-between rounded-xl bg-background-light px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-main">{b.category}</span>
                    <span className="text-xs font-bold rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                      {b.period === "monthly" ? "mensuel" : "annuel"}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-text-main">
                    {b.amount_limit.toLocaleString("fr-FR")} €
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banner upgrade couple si actif sans Pro */}
        {hasCoupleActive && !isPro && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">favorite</span>
            <div>
              <p className="text-sm font-bold text-text-main">Budgets couple disponibles avec Pro</p>
              <p className="text-xs text-text-muted">Créez des budgets partagés avec votre partenaire.</p>
            </div>
          </div>
        )}

        {/* Formulaire budgets */}
        <div id="budget-form" className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-slate-800 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <h2 className="font-bold text-text-main">Gérer les budgets</h2>
          </div>
          <BudgetForm
            accountId={accountId}
            budgets={budgets}
            hasCoupleActive={hasCoupleActive}
            isPro={isPro}
            coupleId={coupleId}
          />
        </div>
      </div>
    </div>
  );
}
