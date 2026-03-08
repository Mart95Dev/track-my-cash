"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { sendWelcomeEmailAction, createTrialSubscriptionAction } from "@/app/actions/auth-actions";

export default function InscriptionPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (password.length === 0) return null;
    if (password.length < 8) return { label: "Faible", color: "text-danger", bars: 1 };
    if (password.length < 12 && !/[^a-zA-Z0-9]/.test(password)) return { label: "Moyen", color: "text-warning", bars: 2 };
    return { label: "Fort", color: "text-success", bars: 3 };
  }, [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authClient.signUp.email({ email, password, name });

    if (result.error) {
      setError(t("errorGeneric"));
      setLoading(false);
      return;
    }

    // Fire-and-forget : ne bloquent jamais l'inscription
    sendWelcomeEmailAction(email).catch(() => {});
    createTrialSubscriptionAction().catch(() => {});

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-[#fcfcfd] min-h-screen relative overflow-x-hidden">
      {/* ── AC-1 : Blur spots background ─────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-70" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-couple-pink/5 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-blue-200/10 rounded-full blur-[80px]" />
      </div>

      <div className="min-h-screen flex flex-col">
        {/* Header desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary/10 rounded-lg p-2">
              <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">Track My Cash</span>
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Déjà un compte ?</span>
            <Link href={`/${locale}/connexion`} className="text-primary hover:text-primary/80 transition-colors">
              Se connecter
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[520px] flex flex-col items-center">

            {/* Logo mobile */}
            <div className="mb-8 text-center md:hidden">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Track My Cash</h1>
            </div>

            {/* Titre + AC-3 badge */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-slate-900">
                Créer un compte
              </h2>
              <p className="text-slate-500 text-base flex items-center justify-center gap-2 flex-wrap">
                Gérez vos finances à deux
                <span
                  className="material-symbols-outlined text-couple-pink text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                {/* AC-3 : Badge essai 14j offert */}
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  Essai 14j offert
                </span>
              </p>
            </div>

            {/* AC-4 : Card bg-white rounded-3xl */}
            <div className="w-full bg-white rounded-3xl shadow-sm p-8 sm:p-10 border border-slate-100/60">

              {/* AC-2 : Boutons OAuth Google + Apple */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => authClient.signIn.social({ provider: "google" })}
                  className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-slate-50 border border-transparent hover:bg-slate-100 hover:border-slate-200 transition-all font-medium text-slate-700 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => authClient.signIn.social({ provider: "apple" })}
                  className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-slate-50 border border-transparent hover:bg-slate-100 hover:border-slate-200 transition-all font-medium text-slate-700 text-sm"
                >
                  <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.96.00-1.76-.31-2.6-.31s-1.65.31-2.58.31c-2.05.00-4.04-1.25-5.05-3.03-2.05-3.58-.52-8.87 1.48-11.75 1-1.44 2.5-2.34 4.15-2.34 1.25.00 2.44.44 3.2.44s2.05-.44 3.4-.44c1.55.00 2.94.81 3.75 2.05-3.13 1.31-2.62 5.8 0 7.05-.73 1.83-1.7 3.63-3.2 5.37-.8.93-1.6 1.76-2.55 2.65-.58.55-.8.59-1.3.59zM12.03 7.25c.00-2.73 2.22-4.94 4.92-4.94.05.62-.18 1.25-.52 1.82-.41.68-1.05 1.24-1.8 1.58-.65.31-1.38.48-2.1.48-.05-.33-.05-.62-.5-.94z" />
                  </svg>
                  Apple
                </button>
              </div>

              {/* Séparateur */}
              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-slate-100" />
                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400">Ou continuer avec l&apos;email</span>
                <div className="flex-grow border-t border-slate-100" />
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger text-sm font-medium mb-6">
                  {error}
                </div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 ml-1" htmlFor="name">
                    Prénom
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 h-[50px] rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 text-slate-800 text-base outline-none"
                    placeholder="Votre prénom"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 ml-1" htmlFor="email">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 h-[50px] rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 text-slate-800 text-base outline-none"
                    placeholder="nom@exemple.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 ml-1" htmlFor="password">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 h-[50px] pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 text-slate-800 text-base outline-none"
                      placeholder="Min. 8 caractères"
                      required
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {/* Indicateur de force du mot de passe */}
                  {passwordStrength && (
                    <div className="flex items-center gap-2 mt-2 ml-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((bar) => (
                          <div
                            key={bar}
                            className={`h-1 w-8 rounded-full transition-colors ${
                              bar <= passwordStrength.bars
                                ? passwordStrength.bars === 1
                                  ? "bg-danger"
                                  : passwordStrength.bars === 2
                                  ? "bg-warning"
                                  : "bg-success"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                        {passwordStrength.bars === 1 && " · 8 caractères min."}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 text-[15px] disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Créer mon compte
                      <span className="material-symbols-outlined text-[1.1rem]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* AC-7 : Lien connexion */}
            <p className="mt-8 text-sm text-slate-500 font-medium">
              Déjà un compte ?{" "}
              <Link href={`/${locale}/connexion`} className="text-primary hover:text-primary/80 transition-colors">
                Se connecter
              </Link>
            </p>

            <p className="mt-4 text-xs text-slate-400 text-center leading-relaxed max-w-[360px]">
              En cliquant sur &quot;Créer mon compte&quot;, vous acceptez nos{" "}
              <Link href="/cgu" className="underline hover:text-slate-600 transition-colors">
                Conditions d&apos;utilisation
              </Link>{" "}
              et notre{" "}
              <Link href="/confidentialite" className="underline hover:text-slate-600 transition-colors">
                Politique de confidentialité
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
