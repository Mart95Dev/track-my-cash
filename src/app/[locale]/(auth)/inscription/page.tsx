"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] flex flex-col gap-8">

        {/* Logo TMC */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center size-20 rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>account_balance_wallet</span>
          </div>
          <span className="text-primary text-2xl font-bold">TMC</span>
        </div>

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Rejoignez TrackMyCash</h1>
          <p className="text-text-muted text-base mt-1">Créez votre compte gratuitement</p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger text-sm font-medium">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Input Nom avec icône */}
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-text-main ml-1">Nom</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors text-[20px]">person</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-0 py-4 pl-12 pr-4 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-primary text-text-main placeholder:text-text-muted outline-none"
                placeholder="Votre nom"
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Input Email avec icône */}
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-text-main ml-1">Email</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors text-[20px]">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-0 py-4 pl-12 pr-4 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-primary text-text-main placeholder:text-text-muted outline-none"
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Input Password avec icône + toggle visibility */}
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-text-main ml-1">Mot de passe</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors text-[20px]">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-0 py-4 pl-12 pr-12 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-primary text-text-main placeholder:text-text-muted outline-none"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-text-muted hover:text-text-main"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Créer mon compte <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
            )}
          </button>
        </form>

        {/* Lien connexion */}
        <p className="text-center text-text-muted text-sm">
          Déjà un compte ?{" "}
          <Link href={`/${locale}/connexion`} className="font-bold text-primary hover:text-primary/80">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
