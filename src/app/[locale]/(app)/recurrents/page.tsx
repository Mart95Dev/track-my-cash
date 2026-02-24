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
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary text-[28px]">autorenew</span>
        <h1 className="text-2xl font-bold text-text-main">Récurrents</h1>
      </div>

      {/* Formulaire ajout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
          <h2 className="font-bold text-text-main">Nouveau paiement récurrent</h2>
        </div>
        <RecurringForm accounts={accounts} rules={rules} />
      </div>

      {/* Sélecteur de compte */}
      <div className="flex items-center gap-3">
        <h3 className="font-bold text-text-main">Mes récurrents</h3>
        <AccountFilter
          accounts={accounts}
          currentAccountId={accountId}
          basePath={`/recurrents`}
        />
      </div>

      {/* Suggestions IA (collapsible) */}
      {suggestions.length > 0 && accountId && (
        <details className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
          <summary className="cursor-pointer font-semibold text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
            Suggestions IA ({suggestions.length})
          </summary>
          <div className="mt-3">
            <RecurringSuggestions suggestions={suggestions} accountId={accountId} />
          </div>
        </details>
      )}

      {/* Liste des paiements */}
      {!accountId ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">filter_list</span>
          <p className="text-text-muted text-sm">Sélectionnez un compte pour voir les paiements récurrents</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">autorenew</span>
          <p className="text-text-muted text-sm">Aucun paiement récurrent configuré</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((p) => {
            const isIncome = p.type === "income";
            const freqLabel = FREQUENCY_LABELS[p.frequency] ?? p.frequency;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[20px]">autorenew</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-text-main truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="bg-indigo-50 text-primary text-xs font-medium rounded-full px-2 py-0.5">
                          {freqLabel}
                        </span>
                        {p.next_date && (
                          <span className="text-text-muted text-xs">
                            Prochain : {formatDate(p.next_date, locale)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <p className={`font-bold text-lg ${isIncome ? "text-success" : "text-danger"}`}>
                      {isIncome ? "+" : "-"}{formatCurrency(p.amount, "EUR", locale)}
                    </p>
                    <EditRecurringDialog payment={p} accounts={accounts} rules={rules} />
                    <DeleteRecurringButton id={p.id} />
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
