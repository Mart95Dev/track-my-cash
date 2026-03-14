"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
    } catch {
      // Anti-enumeration : toujours afficher le même message
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-8 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary rounded-xl p-2">
              <span className="text-white text-lg font-bold leading-none">T</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Koupli</span>
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
              <h1 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                Mot de passe oublié
              </h1>
              <p className="text-slate-500 text-base font-medium">
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </p>
            </div>

            {/* Card */}
            <div className="w-full bg-white rounded-3xl shadow p-8 md:p-10 border border-border-light">
              {sent ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-success/10">
                      <span className="material-symbols-outlined text-[32px] text-success">
                        mark_email_read
                      </span>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Email envoyé</h2>
                  <p className="text-slate-500 text-sm">
                    Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation d&apos;ici quelques minutes.
                  </p>
                  <Link
                    href="/connexion"
                    className="inline-flex items-center gap-1.5 text-primary text-sm font-bold hover:text-primary/80 transition-colors mt-4"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Retour à la connexion
                  </Link>
                </div>
              ) : (
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Envoyer le lien
                        <span className="material-symbols-outlined text-[1.1rem]">send</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Lien connexion */}
            {!sent && (
              <p className="mt-8 text-sm text-slate-500 font-medium">
                Vous vous souvenez ?{" "}
                <Link href="/connexion" className="text-primary font-bold hover:text-primary/80 transition-colors">
                  Se connecter
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
