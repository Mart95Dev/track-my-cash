export default function CompteSuspenduPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Demande de suppression enregistrée
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Votre demande de suppression de compte a bien été prise en compte.
            Vos données seront supprimées définitivement dans <strong>30 jours</strong>.
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground space-y-2">
          <p>Un email de rappel vous sera envoyé 5 jours avant la suppression effective.</p>
          <p>
            Pour annuler cette demande, connectez-vous à votre compte et rendez-vous dans{" "}
            <strong>Paramètres</strong>.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Des questions ?{" "}
          <a
            href="mailto:contact@trackmycash.fr"
            className="text-primary hover:underline"
          >
            contact@trackmycash.fr
          </a>
        </p>
      </div>
    </div>
  );
}
