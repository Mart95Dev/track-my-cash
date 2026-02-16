import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportImportButtons } from "@/components/export-import-buttons";
import { ResetButton } from "@/components/reset-button";

export const dynamic = "force-dynamic";

export default function ParametresPage() {
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

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zone de danger</CardTitle>
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
