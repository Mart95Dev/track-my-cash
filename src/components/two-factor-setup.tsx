"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type SetupStep = "idle" | "qr" | "verify" | "done";

export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const [step, setStep] = useState<SetupStep>("idle");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(enabled);

  async function handleEnable() {
    if (!password.trim()) {
      setError("Veuillez saisir votre mot de passe");
      return;
    }
    setError("");
    setLoading(true);

    const result = await authClient.twoFactor.enable({ password });

    if (result.error) {
      setError("Mot de passe incorrect ou erreur serveur");
      setLoading(false);
      return;
    }

    setTotpURI(result.data?.totpURI ?? "");
    setBackupCodes(result.data?.backupCodes ?? []);
    setStep("qr");
    setLoading(false);
    setPassword("");
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres");
      return;
    }
    setError("");
    setLoading(true);

    const result = await authClient.twoFactor.verifyTotp({ code });

    if (result.error) {
      setError("Code invalide. Réessayez.");
      setLoading(false);
      return;
    }

    setStep("done");
    setIs2FAEnabled(true);
    setLoading(false);
  }

  async function handleDisable() {
    if (!password.trim()) {
      setError("Veuillez saisir votre mot de passe");
      return;
    }
    setError("");
    setLoading(true);

    const result = await authClient.twoFactor.disable({ password });

    if (result.error) {
      setError("Mot de passe incorrect");
      setLoading(false);
      return;
    }

    setIs2FAEnabled(false);
    setStep("idle");
    setPassword("");
    setLoading(false);
  }

  // Extraire la clé secrète du TOTP URI pour affichage textuel (accessibilité AC-QR)
  const secretKey = totpURI ? new URL(totpURI).searchParams.get("secret") ?? "" : "";

  if (is2FAEnabled && step !== "done") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-success text-[20px]">verified_user</span>
          <span className="text-sm font-bold text-success">2FA activé</span>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700" htmlFor="disable-password">
            Mot de passe pour désactiver
          </label>
          <input
            id="disable-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
            placeholder="Votre mot de passe"
          />
          {error && <p className="text-danger text-xs font-medium">{error}</p>}
          <button
            type="button"
            onClick={handleDisable}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-danger bg-danger/10 hover:bg-danger/20 rounded-xl transition-all disabled:opacity-60"
          >
            {loading ? "Désactivation..." : "Désactiver le 2FA"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
        <span className="text-sm font-bold text-success">2FA activé avec succès</span>
      </div>
    );
  }

  if (step === "qr") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Scannez ce QR code avec votre application d&apos;authentification (Google Authenticator, Authy, etc.)
        </p>

        {/* QR Code via API externe */}
        <div className="flex justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpURI)}`}
            alt="QR Code TOTP"
            width={200}
            height={200}
            className="rounded-xl border border-slate-200"
          />
        </div>

        {/* Clé secrète copiable (accessibilité) */}
        {secretKey && (
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-text-muted mb-1">Ou entrez cette clé manuellement :</p>
            <code className="text-sm font-mono font-bold text-text-main select-all">{secretKey}</code>
          </div>
        )}

        {/* Codes de récupération */}
        {backupCodes.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <p className="text-sm font-bold text-text-main mb-2">
              Codes de récupération (à conserver en lieu sûr)
            </p>
            <div className="grid grid-cols-2 gap-1">
              {backupCodes.map((bc) => (
                <code key={bc} className="text-xs font-mono bg-white rounded px-2 py-1 text-center">
                  {bc}
                </code>
              ))}
            </div>
          </div>
        )}

        {/* Vérification du code */}
        <div className="space-y-3 pt-2">
          <label className="block text-sm font-bold text-slate-700" htmlFor="totp-code">
            Entrez le code affiché dans l&apos;app
          </label>
          <input
            id="totp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 h-12 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-center text-xl font-mono tracking-[0.5em] outline-none"
            placeholder="000000"
          />
          {error && <p className="text-danger text-xs font-medium">{error}</p>}
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm"
          >
            {loading ? "Vérification..." : "Vérifier et activer"}
          </button>
        </div>
      </div>
    );
  }

  // Step: idle — formulaire activation
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        Ajoutez une couche de sécurité supplémentaire avec un code temporaire (TOTP).
      </p>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700" htmlFor="enable-password">
          Mot de passe
        </label>
        <input
          id="enable-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
          placeholder="Votre mot de passe"
        />
        {error && <p className="text-danger text-xs font-medium">{error}</p>}
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm"
        >
          {loading ? "Activation..." : "Activer l'authentification à deux facteurs"}
        </button>
      </div>
    </div>
  );
}
