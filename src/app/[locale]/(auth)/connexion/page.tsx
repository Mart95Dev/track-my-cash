"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export default function ConnexionPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(result.error.code === "INVALID_EMAIL_OR_PASSWORD" ? t("errorInvalid") : t("errorGeneric"));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      <div className="min-h-screen flex flex-col">
        {/* Auth header */}
        <header className="flex items-center justify-between px-6 md:px-8 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary rounded-xl p-2">
              <span className="text-white text-lg font-bold leading-none">T</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">TrackMyCash</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Retour à l&apos;accueil
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[480px] flex flex-col items-center">

            {/* Titre */}
            <div className="mb-8 text-center max-w-sm">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
                Bon retour !
              </h1>
              <p className="text-slate-500 text-base md:text-lg font-medium">
                Connectez-vous pour gérer vos finances.
              </p>
            </div>

            {/* Card */}
            <div className="w-full bg-white rounded-3xl shadow p-8 md:p-10 border border-border-light">

              {/* Boutons OAuth Google + Apple */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => authClient.signIn.social({ provider: "google" })}
                  className="flex items-center justify-center gap-2.5 h-14 rounded-xl border border-border-light bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700 text-sm"
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
                  className="flex items-center justify-center gap-2.5 h-14 rounded-xl border border-border-light bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700 text-sm"
                >
                  <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.96.00-1.76-.31-2.6-.31s-1.65.31-2.58.31c-2.05.00-4.04-1.25-5.05-3.03-2.05-3.58-.52-8.87 1.48-11.75 1-1.44 2.5-2.34 4.15-2.34 1.25.00 2.44.44 3.2.44s2.05-.44 3.4-.44c1.55.00 2.94.81 3.75 2.05-3.13 1.31-2.62 5.8 0 7.05-.73 1.83-1.7 3.63-3.2 5.37-.8.93-1.6 1.76-2.55 2.65-.58.55-.8.59-1.3.59zM12.03 7.25c.00-2.73 2.22-4.94 4.92-4.94.05.62-.18 1.25-.52 1.82-.41.68-1.05 1.24-1.8 1.58-.65.31-1.38.48-2.1.48-.05-.33-.05-.62-.5-.94z" />
                  </svg>
                  Apple
                </button>
              </div>

              {/* Séparateur */}
              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-border-light" />
                <span className="flex-shrink mx-4 text-xs font-medium text-slate-400">
                  ou avec email
                </span>
                <div className="flex-grow border-t border-border-light" />
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger text-sm font-medium mb-6">
                  {error}
                </div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1" htmlFor="email">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 h-14 rounded-xl bg-[#FAFAF9] border border-border-light focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 text-base font-medium outline-none"
                    placeholder="nom@exemple.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-sm font-bold text-slate-700" htmlFor="password">
                      Mot de passe
                    </label>
                    <Link
                      href={`/${locale}/mot-de-passe-oublie`}
                      className="text-primary text-xs font-bold hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 h-14 pr-12 rounded-xl bg-[#FAFAF9] border border-border-light focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 text-base font-medium outline-none"
                      placeholder="Votre mot de passe"
                      required
                      autoComplete="current-password"
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>
            </div>

            {/* Lien inscription */}
            <p className="mt-8 text-sm text-slate-500 font-medium">
              Pas encore de compte ?{" "}
              <Link href={`/${locale}/inscription`} className="text-primary font-bold hover:text-primary/80 transition-colors">
                Créer un compte
              </Link>
            </p>

            <div className="mt-6 flex gap-4 justify-center">
              <Link href="/cgu" className="text-xs text-slate-400 hover:text-primary transition-colors font-medium">
                Conditions
              </Link>
              <span className="text-xs text-slate-300">·</span>
              <Link href="/confidentialite" className="text-xs text-slate-400 hover:text-primary transition-colors font-medium">
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
