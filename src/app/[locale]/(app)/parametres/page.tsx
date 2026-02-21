import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportImportButtons } from "@/components/export-import-buttons";
import { ResetButton } from "@/components/reset-button";
import { CategorizationRules } from "@/components/categorization-rules";
import { TagManager } from "@/components/tag-manager";
import { CurrencySettings } from "@/components/currency-settings";
import { OpenRouterKeySettings } from "@/components/openrouter-key-settings";
import { BillingPortalButton } from "@/components/billing-portal-button";
import { getCategorizationRules, getSetting } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getExchangeRate } from "@/lib/currency";
import { getTagsAction } from "@/app/actions/tag-actions";
import { saveExchangeRateAction, saveOpenRouterKeyAction } from "@/app/actions/settings-actions";
import { getUserSubscription } from "@/app/actions/billing-actions";
import { getPlan } from "@/lib/stripe-plans";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  const [rules, tags, liveRate, fallbackRateStr, openrouterKey, subscription, t] = await Promise.all([
    getCategorizationRules(db),
    getTagsAction(),
    getExchangeRate(db),
    getSetting(db, "exchange_rate_eur_mga"),
    getSetting(db, "openrouter_api_key"),
    getUserSubscription(),
    getTranslations("settings"),
  ]);

  const plan = getPlan(subscription.planId);
  const renewalDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()
    : null;

  const fallbackRate = fallbackRateStr ? parseFloat(fallbackRateStr) : 5000;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>

      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="font-medium">{plan.name}</p>
            <Badge variant={plan.id === "free" ? "secondary" : "default"}>
              {plan.id === "free" ? "Gratuit" : `${plan.price}€/mois`}
            </Badge>
            {subscription.status === "active" && plan.id !== "free" && (
              <Badge variant="outline" className="text-green-600 border-green-400">Actif</Badge>
            )}
          </div>
          {renewalDate && !subscription.cancelAtPeriodEnd && (
            <p className="text-sm text-muted-foreground">Renouvellement le {renewalDate}</p>
          )}
          {renewalDate && subscription.cancelAtPeriodEnd && (
            <p className="text-sm text-orange-600">Annulation en cours — actif jusqu&apos;au {renewalDate}</p>
          )}
          {subscription.stripeCustomerId && <BillingPortalButton />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("backup.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportImportButtons />
          <p className="text-sm text-muted-foreground">
            {t("backup.description")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("currency.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencySettings
            liveRate={liveRate}
            fallbackRate={fallbackRate}
            onSaveFallback={saveExchangeRateAction}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("openrouter.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <OpenRouterKeySettings
            hasKey={!!openrouterKey}
            onSave={saveOpenRouterKeyAction}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("tags.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("tags.description")}
          </p>
          <TagManager tags={tags} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("categorization.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("categorization.description")}
          </p>
          <CategorizationRules rules={rules} />
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">{t("danger.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResetButton />
          <p className="text-sm text-muted-foreground">
            {t("danger.description")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
