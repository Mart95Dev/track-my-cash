import Link from "next/link";

export default function CompteSuspenduPage() {
  return (
    <main className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-8">

        {/* Badge pulsant "Compte restreint" — AC-1 */}
        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-red-100 dark:border-red-900/30 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Compte restreint
        </div>

        {/* Icône lock + Titre — AC-2 */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center size-24 rounded-full bg-danger/10">
            <span
              className="material-symbols-outlined text-danger"
              style={{ fontSize: "64px", fontVariationSettings: "'FILL' 1" }}
            >lock</span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-text-main">Compte Suspendu</h1>
            <p className="text-text-muted">L&apos;accès à votre compte a été temporairement restreint par sécurité.</p>
          </div>
        </div>

        {/* Card warning Suppression programmée — AC-3 */}
        <div className="w-full bg-warning/10 border border-warning/20 rounded-xl p-5 flex items-start gap-4 text-left relative overflow-hidden">
          <span className="material-symbols-outlined text-[80px] text-warning/10 absolute top-0 right-0 pointer-events-none">lock_clock</span>
          <span className="material-symbols-outlined text-warning shrink-0 mt-0.5 relative z-10">warning</span>
          <div className="relative z-10">
            <h3 className="font-bold text-text-main text-sm">Suppression programmée</h3>
            <p className="text-sm text-text-muted mt-1">
              Sans action de votre part, votre compte et toutes les données associées seront supprimés définitivement.
              Un email de rappel vous sera envoyé 5 jours avant la suppression.
            </p>
          </div>
        </div>

        {/* Steps réactivation — AC-4 */}
        <div className="w-full flex flex-col gap-4 text-left">
          <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Procédure de récupération</p>
          <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex gap-3 items-center p-4">
              <div className="flex-none w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">1</div>
              <div>
                <p className="font-semibold text-text-main">Contacter le support</p>
                <p className="text-sm text-text-muted mt-0.5">Envoyez-nous un email pour expliquer votre situation.</p>
              </div>
            </div>
            <div className="flex gap-3 items-center p-4 opacity-60">
              <div className="flex-none w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted font-bold text-sm flex items-center justify-center">2</div>
              <div>
                <p className="font-semibold text-text-main">Vérification d&apos;identité</p>
                <p className="text-sm text-text-muted mt-0.5">Votre compte sera restauré après vérification.</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-text-muted">
            Besoin d&apos;aide immédiate ?{" "}
            <a href="mailto:support@koupli.com" className="text-primary underline">
              support@koupli.com
            </a>
          </p>
        </div>

        {/* Bouton retour — AC-5 */}
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Retour à l&apos;accueil
        </Link>

      </div>
    </main>
  );
}
