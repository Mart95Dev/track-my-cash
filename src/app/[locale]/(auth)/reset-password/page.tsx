"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");

  // Lien expiré ou invalide
  if (error || !token) {
    return (
      <div className="bg-[#FAFAF9] min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="flex items-center justify-between px-6 md:px-8 py-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-primary rounded-xl p-2">
                <span className="text-white text-lg font-bold leading-none">T</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">Koupli</span>
            </Link>
          </header>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-sm">
              <div className="flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-danger/10">
                  <span className="material-symbols-outlined text-[32px] text-danger">link_off</span>
                </div>
              </div>
              <h1 className="font-serif text-2xl font-extrabold text-slate-900">Lien expiré</h1>
              <p className="text-slate-500 text-sm">Ce lien de réinitialisation est invalide ou a expiré.</p>
              <Link
                href="/mot-de-passe-oublie"
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
              >
                Demander un nouveau lien
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setFormError("Erreur lors de la réinitialisation. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      setDone(true);
    } catch {
      setFormError("Erreur lors de la réinitialisation. Veuillez réessayer.");
    }

    setLoading(false);
  }

  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      <div className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 md:px-8 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary rounded-xl p-2">
              <span className="text-white text-lg font-bold leading-none">T</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Koupli</span>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[480px] flex flex-col items-center">
            <div className="mb-8 text-center max-w-sm">
              <h1 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                Nouveau mot de passe
              </h1>
              <p className="text-slate-500 text-base font-medium">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>
            </div>

            <div className="w-full bg-white rounded-3xl shadow p-8 md:p-10 border border-border-light">
              {done ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-success/10">
                      <span className="material-symbols-outlined text-[32px] text-success">check_circle</span>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Mot de passe modifié</h2>
                  <p className="text-slate-500 text-sm">
                    Votre mot de passe a été réinitialisé avec succès.
                  </p>
                  <Link
                    href="/connexion"
                    className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all mt-2"
                  >
                    Se connecter
                  </Link>
                </div>
              ) : (
                <>
                  {formError && (
                    <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger text-sm font-medium mb-6">
                      {formError}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1" htmlFor="password">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-5 h-14 pr-12 rounded-xl bg-[#FAFAF9] border border-border-light focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 text-base font-medium outline-none"
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
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Réinitialiser le mot de passe"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
