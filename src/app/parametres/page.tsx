import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportImportButtons } from "@/components/export-import-buttons";
import { ResetButton } from "@/components/reset-button";
import { CategorizationRules } from "@/components/categorization-rules";
import { TagManager } from "@/components/tag-manager";
import { CurrencySettings } from "@/components/currency-settings";
import { getCategorizationRules, getSetting } from "@/lib/queries";
import { getTagsAction } from "@/app/actions/tag-actions";
import { saveExchangeRateAction } from "@/app/actions/settings-actions";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const [rules, tags, exchangeRate] = await Promise.all([
    getCategorizationRules(),
    getTagsAction(),
    getSetting("exchange_rate_eur_mga"),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paramètres</h2>

      <Card>
        <CardHeader>
          <CardTitle>Sauvegarde & Restauration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportImportButtons />
          <p className="text-sm text-muted-foreground">
            Exportez vos données en JSON pour les sauvegarder ou les transférer.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taux de change</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencySettings
            currentRate={exchangeRate ? parseFloat(exchangeRate) : 5000}
            onSave={saveExchangeRateAction}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags personnalisés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Créez des tags pour organiser vos transactions (ex: Urgent, Professionnel, Vacances).
          </p>
          <TagManager tags={tags} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto-catégorisation à l'import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Définissez des règles pour catégoriser automatiquement les transactions lors de l'import.
            Les patterns sont testés par priorité décroissante (regex ou texte simple).
          </p>
          <CategorizationRules rules={rules} />
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Zone de danger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResetButton />
          <p className="text-sm text-muted-foreground">
            Cette action supprimera définitivement toutes les données. Irréversible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
