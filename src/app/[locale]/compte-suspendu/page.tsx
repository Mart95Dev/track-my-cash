import Link from "next/link";

export default function CompteSuspenduPage() {
  return (
    <main className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-8">

        {/* Icône warning */}
        <div className="flex items-center justify-center size-24 rounded-full bg-warning/10">
          <span
            className="material-symbols-outlined text-warning"
            style={{ fontSize: "64px", fontVariationSettings: "'FILL' 1" }}
          >warning</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-text-main">Compte suspendu</h1>
          <p className="text-text-muted">Votre compte a été marqué pour suppression suite à votre demande.</p>
        </div>

        {/* Card alerte 30j */}
        <div className="w-full bg-warning/10 border border-warning/20 rounded-xl p-5 flex items-start gap-4 text-left">
          <span className="material-symbols-outlined text-warning shrink-0 mt-0.5">schedule</span>
          <div>
            <h3 className="font-bold text-text-main text-sm">Action requise sous 30 jours</h3>
            <p className="text-sm text-text-muted mt-1">
              Votre compte sera définitivement supprimé si aucune action n&apos;est entreprise.
              Un email de rappel vous sera envoyé 5 jours avant la suppression.
            </p>
          </div>
        </div>

        {/* Steps réactivation */}
        <div className="w-full flex flex-col gap-4 text-left">
          <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Comment annuler ?</p>
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">1</div>
            <div>
              <p className="font-semibold text-text-main">Connectez-vous à votre compte</p>
              <p className="text-sm text-text-muted mt-1">Accédez à la page Paramètres de votre compte.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-slate-100 text-text-muted font-bold text-sm flex items-center justify-center">2</div>
            <div>
              <p className="font-semibold text-text-main">Annulez la suppression</p>
              <p className="text-sm text-text-muted mt-1">
                Dans la zone Danger, cliquez sur &quot;Annuler la suppression&quot;. Ou contactez-nous :{" "}
                <a href="mailto:support@trackmycash.fr" className="text-primary font-medium">support@trackmycash.fr</a>
              </p>
            </div>
          </div>
        </div>

        {/* Bouton retour */}
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold py-3.5 rounded-xl hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
