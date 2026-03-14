import { getRecurringPayments, getAllAccounts, getCategorizationRules } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { RecurringForm } from "@/components/recurring-form";
import { DeleteRecurringButton } from "@/components/delete-recurring-button";
import { EditRecurringDialog } from "@/components/edit-recurring-dialog";
import { AccountFilter } from "@/components/account-filter";
import { getLocale } from "next-intl/server";
import { detectRecurringSuggestionsAction } from "@/app/actions/recurring-actions";
import { RecurringSuggestions } from "@/components/recurring-suggestions";
import { RecurringTimelineChart } from "@/components/charts/recurring-timeline-chart";

export const dynamic = "force-dynamic";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Hebdo",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  yearly: "Annuel",
};

export default async function RecurrentsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const accountId = params.accountId ? parseInt(params.accountId) : undefined;
  const locale = await getLocale();

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  const [accounts, rules] = await Promise.all([
    getAllAccounts(db),
    getCategorizationRules(db),
  ]);

  const [payments, suggestions] = await Promise.all([
    accountId ? getRecurringPayments(db, accountId) : Promise.resolve([]),
    accountId ? detectRecurringSuggestionsAction(accountId) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col bg-background-light min-h-screen pb-24">
      {/* Header sticky — AC-7 */}
      <header className="sticky top-0 z-10 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 border-b border-slate-100/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Récurrents</h1>
          <p className="text-sm text-text-muted font-medium mt-0.5">Gérez vos abonnements</p>
        </div>
      </header>

      {/* Formulaire ajout */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
          <h2 className="font-bold text-text-main">Nouveau paiement récurrent</h2>
        </div>
        <RecurringForm accounts={accounts} rules={rules} />
      </div>

      {/* Section À venir — titre + sélecteur compte */}
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-lg font-bold text-text-main">À venir</h2>
        <AccountFilter
          accounts={accounts}
          currentAccountId={accountId}
          basePath={`/recurrents`}
        />
      </div>

      {/* Suggestions IA — AC-5 glass/bg-primary/5 */}
      {suggestions.length > 0 && accountId && (
        <div className="mx-4 mb-4">
          <details className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <summary className="cursor-pointer font-semibold text-text-main flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
              Suggestions IA ({suggestions.length})
            </summary>
            <div className="mt-3">
              <RecurringSuggestions suggestions={suggestions} accountId={accountId} />
            </div>
          </details>
        </div>
      )}

      {/* Timeline récurrents — STORY-137 AC-3 */}
      {payments.length > 0 && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-slate-100 shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-main">Prévisions récurrentes</h3>
            <span className="text-xs text-text-muted">3 mois</span>
          </div>
          <RecurringTimelineChart payments={payments} months={3} />
        </div>
      )}

      {/* Liste des paiements */}
      {!accountId ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">filter_list</span>
          <p className="text-text-muted text-sm">Sélectionnez un compte pour voir les paiements récurrents</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">autorenew</span>
          <p className="text-text-muted text-sm">Aucun paiement récurrent configuré</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4">
          {payments.map((p) => {
            const isIncome = p.type === "income";
            const freqLabel = FREQUENCY_LABELS[p.frequency] ?? p.frequency;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 flex items-center gap-4"
              >
                {/* Icône circulaire style Stitch */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isIncome ? "bg-green-100" : "bg-primary/10"}`}>
                  <span className={`material-symbols-outlined text-[24px] ${isIncome ? "text-green-600" : "text-primary"}`}>
                    autorenew
                  </span>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-text-main truncate">{p.name}</p>
                    <p className={`font-bold text-base shrink-0 ${isIncome ? "text-success" : "text-danger"}`}>
                      {isIncome ? "+" : "-"}{formatCurrency(p.amount, "EUR", locale)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {freqLabel}
                      </span>
                      {p.next_date && (
                        <span className="text-xs text-text-muted">
                          Prochain : {formatDate(p.next_date, locale)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <EditRecurringDialog payment={p} accounts={accounts} rules={rules} />
                      <DeleteRecurringButton id={p.id} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
