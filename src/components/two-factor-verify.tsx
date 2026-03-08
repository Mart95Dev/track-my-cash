"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function TwoFactorVerify() {
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (code.length < 6) {
      setError(useBackup ? "Entrez un code de récupération valide" : "Le code doit contenir 6 chiffres");
      return;
    }
    setError("");
    setLoading(true);

    const result = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice: true,
    });

    if (result.error) {
      setError("Code invalide. Réessayez.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-5">
          <span className="material-symbols-outlined text-primary text-4xl">security</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
          Vérification 2FA
        </h2>
        <p className="text-slate-500 text-sm">
          {useBackup
            ? "Entrez un de vos codes de récupération"
            : "Entrez le code à 6 chiffres de votre application d'authentification"}
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1" htmlFor="verify-code">
              {useBackup ? "Code de récupération" : "Code TOTP"}
            </label>
            <input
              id="verify-code"
              type="text"
              inputMode={useBackup ? "text" : "numeric"}
              maxLength={useBackup ? 20 : 6}
              value={code}
              onChange={(e) => {
                const val = useBackup ? e.target.value : e.target.value.replace(/\D/g, "");
                setCode(val);
              }}
              className="w-full px-4 h-14 rounded-2xl bg-slate-50 border border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-center text-2xl font-mono tracking-[0.5em] outline-none"
              placeholder={useBackup ? "XXXX-XXXX" : "000000"}
              autoFocus
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-danger text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || code.length < 6}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Vérifier"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setUseBackup(!useBackup);
              setCode("");
              setError("");
            }}
            className="w-full text-sm text-primary font-medium hover:underline"
          >
            {useBackup ? "Utiliser le code TOTP" : "Utiliser un code de récupération"}
          </button>
        </div>
      </div>
    </div>
  );
}
