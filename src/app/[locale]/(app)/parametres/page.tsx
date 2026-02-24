import { ExportImportButtons } from "@/components/export-import-buttons";
import { ResetButton } from "@/components/reset-button";
import { CategorizationRules } from "@/components/categorization-rules";
import { TagManager } from "@/components/tag-manager";
import { CurrencySettings } from "@/components/currency-settings";
import { BillingPortalButton } from "@/components/billing-portal-button";
import { DeleteUserAccountDialog } from "@/components/delete-user-account-dialog";
import { MonthlySummaryEmailButton } from "@/components/monthly-summary-email-button";
import { MonthlyReportButton } from "@/components/monthly-report-button";
import { AnnualReportButton } from "@/components/annual-report-button";
import { AutoCategorizeToggle } from "@/components/auto-categorize-toggle";
import { WeeklyEmailToggle } from "@/components/weekly-email-toggle";
import { ExportDataButton } from "@/components/export-data-button";
import { getCategorizationRules, getSetting, getAllAccounts } from "@/lib/queries";
import { getUserDb, getDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getAiUsageCount } from "@/lib/ai-usage";
import { getExchangeRate } from "@/lib/currency";
import { getTagsAction } from "@/app/actions/tag-actions";
import { saveExchangeRateAction, toggleAutoCategorizationAction, toggleWeeklyEmailAction } from "@/app/actions/settings-actions";
import { getUserSubscription } from "@/app/actions/billing-actions";
import { getPlan } from "@/lib/stripe-plans";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

function SettingsCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        <h2 className="font-bold text-text-main">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default async function ParametresPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const mainDb = getDb();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const aiAccess = await (await import("@/lib/subscription-utils")).canUseAI(userId);

  const [rules, tags, liveRate, fallbackRateStr, subscription, accounts, autoCategorizeSetting, aiUsageCount, weeklyEmailSetting] = await Promise.all([
    getCategorizationRules(db),
    getTagsAction(),
    getExchangeRate(db),
    getSetting(db, "exchange_rate_eur_mga"),
    getUserSubscription(),
    getAllAccounts(db),
    getSetting(db, "auto_categorize_on_import"),
    getAiUsageCount(mainDb, userId, currentMonth),
    getSetting(db, "weekly_summary_email"),
  ]);

  const plan = getPlan(subscription.planId);
  const renewalDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString("fr-FR")
    : null;

  const fallbackRate = fallbackRateStr ? parseFloat(fallbackRateStr) : 5000;

  const isPro = subscription.planId === "pro";
  const isPremium = subscription.planId === "premium";
  const isProOrPremium = isPro || isPremium;

  const aiLimit = isPremium ? Infinity : isPro ? 10 : 0;

  const planBadgeColor = isPremium
    ? "bg-primary text-white"
    : isPro
    ? "bg-indigo-50 text-primary"
    : "bg-gray-100 text-text-muted";

  const statusLabel =
    subscription.status === "trialing"
      ? "Période d'essai"
      : subscription.status === "active"
      ? "Actif"
      : subscription.status === "canceled"
      ? "Annulé"
      : "Inactif";

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary text-[28px]">settings</span>
        <h1 className="text-2xl font-bold text-text-main">Paramètres</h1>
      </div>

      {/* 1. Abonnement */}
      <SettingsCard icon="workspace_premium" title="Abonnement">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-text-main">{plan.name}</p>
            <p className="text-text-muted text-sm">{statusLabel}</p>
          </div>
          <span className={`text-xs font-bold rounded-full px-3 py-1 ${planBadgeColor}`}>
            {plan.name}
          </span>
        </div>
        {renewalDate && !subscription.cancelAtPeriodEnd && (
          <p className="text-text-muted text-sm mb-4">Renouvellement : {renewalDate}</p>
        )}
        {renewalDate && subscription.cancelAtPeriodEnd && (
          <p className="text-warning text-sm mb-4">Annulation en cours — actif jusqu&apos;au {renewalDate}</p>
        )}
        {subscription.stripeCustomerId && (
          <BillingPortalButton />
        )}
      </SettingsCard>

      {/* 2. Intelligence artificielle */}
      <SettingsCard icon="auto_awesome" title="Intelligence artificielle">
        {isProOrPremium ? (
          <>
            {aiUsageCount !== undefined && aiLimit !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-muted">Conversations ce mois</span>
                  <span className="font-bold text-text-main">
                    {aiUsageCount} / {aiLimit === Infinity ? "∞" : aiLimit}
                  </span>
                </div>
                {aiLimit !== Infinity && (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        aiUsageCount / aiLimit >= 0.9
                          ? "bg-danger"
                          : aiUsageCount / aiLimit >= 0.6
                          ? "bg-warning"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min((aiUsageCount / aiLimit) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )}
            <AutoCategorizeToggle
              enabled={autoCategorizeSetting === "true"}
              isPro={aiAccess.allowed}
              onToggle={toggleAutoCategorizationAction}
            />
          </>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Disponible avec un abonnement Pro ou Premium</p>
            <span className="text-xs font-bold rounded-full px-3 py-1 bg-gray-100 text-text-muted">Free</span>
          </div>
        )}
      </SettingsCard>

      {/* 3. Données */}
      <SettingsCard icon="database" title="Mes données">
        <div className="flex flex-col gap-3">
          <ExportImportButtons />
          <ExportDataButton />
        </div>
      </SettingsCard>

      {/* 4. Devises */}
      <SettingsCard icon="currency_exchange" title="Devises">
        <CurrencySettings
          liveRate={liveRate}
          fallbackRate={fallbackRate}
          onSaveFallback={saveExchangeRateAction}
        />
      </SettingsCard>

      {/* 5. Rapports */}
      <SettingsCard icon="summarize" title="Rapports">
        <div className="flex flex-col gap-3">
          {aiAccess.allowed && <MonthlyReportButton />}
          {aiAccess.allowed && accounts.length > 0 && <AnnualReportButton accounts={accounts} />}
          <MonthlySummaryEmailButton />
          <WeeklyEmailToggle
            enabled={weeklyEmailSetting !== "false"}
            isPro={aiAccess.allowed}
            onToggle={toggleWeeklyEmailAction}
          />
        </div>
      </SettingsCard>

      {/* 6. Tags */}
      <SettingsCard icon="label" title="Tags">
        <TagManager tags={tags} />
      </SettingsCard>

      {/* 7. Catégorisation */}
      <SettingsCard icon="category" title="Règles de catégorisation">
        <CategorizationRules rules={rules} />
      </SettingsCard>

      {/* 8. Zone danger */}
      <div className="bg-danger/5 border border-danger/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-danger text-[20px]">warning</span>
          <h2 className="font-bold text-danger">Zone de danger</h2>
        </div>
        <div className="flex flex-col gap-3">
          <ResetButton />
          <DeleteUserAccountDialog />
        </div>
      </div>
    </div>
  );
}
