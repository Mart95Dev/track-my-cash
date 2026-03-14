"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  setOnboardingChoiceAction,
  createCoupleAction,
} from "@/app/actions/couple-actions";

interface CoupleChoiceModalProps {
  open?: boolean;
  inviteCode?: string;
}

export function CoupleChoiceModal({
  open = true,
  inviteCode: initialInviteCode,
}: CoupleChoiceModalProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [step, setStep] = useState<"choice" | "invite">(
    initialInviteCode ? "invite" : "choice"
  );
  const [inviteCode, setInviteCode] = useState<string>(
    initialInviteCode ?? ""
  );
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCouple() {
    setLoading(true);
    try {
      await setOnboardingChoiceAction("couple");
      // Créer automatiquement un couple
      const formData = new FormData();
      const result = await createCoupleAction(undefined, formData);
      if ("inviteCode" in result) {
        setInviteCode(result.inviteCode);
      }
      setStep("invite");
    } finally {
      setLoading(false);
    }
  }

  async function handleSolo() {
    setLoading(true);
    try {
      await setOnboardingChoiceAction("solo");
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Rejoins-moi sur Koupli",
          text: `Utilise le code ${inviteCode} pour rejoindre mon espace couple sur Koupli.`,
          url: `${window.location.origin}/fr/couple?code=${inviteCode}`,
        });
      } catch {
        // Share cancelled or not available
        await handleCopy();
      }
    } else {
      await handleCopy();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) setIsOpen(false); }}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border-border-light">
        <DialogHeader>
          <DialogTitle>
            {step === "choice" ? "Comment gérez-vous vos finances ?" : "Invitez votre partenaire"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Étape 1 : Choix couple / solo ── */}
        {step === "choice" && (
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-text-muted text-sm text-center mb-2">
              Choisissez comment vous souhaitez utiliser Koupli
            </p>

            {/* Carte En couple */}
            <button
              onClick={handleCouple}
              disabled={loading}
              aria-label="En couple"
              className="flex items-center gap-4 p-4 bg-white border-2 border-primary/20 rounded-2xl text-left hover:border-primary hover:shadow-soft transition-all disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[28px]">
                  favorite
                </span>
              </div>
              <div>
                <p className="font-bold text-text-main text-sm">En couple</p>
                <p className="text-text-muted text-xs mt-0.5">
                  Gérez vos finances ensemble
                </p>
              </div>
              <span className="material-symbols-outlined text-text-muted ml-auto text-[20px]">
                chevron_right
              </span>
            </button>

            {/* Carte Seul(e) */}
            <button
              onClick={handleSolo}
              disabled={loading}
              aria-label="Seul(e)"
              className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl text-left hover:border-gray-300 hover:shadow-soft transition-all disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-text-muted text-[28px]">
                  person
                </span>
              </div>
              <div>
                <p className="font-bold text-text-main text-sm">Seul(e)</p>
                <p className="text-text-muted text-xs mt-0.5">
                  Continuez en solo
                </p>
              </div>
              <span className="material-symbols-outlined text-text-muted ml-auto text-[20px]">
                chevron_right
              </span>
            </button>
          </div>
        )}

        {/* ── Étape 2 : Code d'invitation ── */}
        {step === "invite" && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <span className="material-symbols-outlined text-primary text-[48px]">
                favorite
              </span>
              <p className="text-text-muted text-sm leading-relaxed">
                Partagez ce code avec votre partenaire pour qu&apos;il rejoigne
                votre espace couple.
              </p>
            </div>

            {/* Code d'invitation */}
            <div className="bg-background-light rounded-xl p-4 text-center">
              <p className="text-text-muted text-xs mb-1">Code d&apos;invitation</p>
              <p className="text-text-main font-bold text-2xl tracking-widest font-mono">
                {inviteCode}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                aria-label="Copier le code"
                className="flex-1 flex items-center justify-center gap-2 h-11 bg-primary text-white font-bold rounded-xl text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "Copié !" : "Copier"}
              </button>
              <button
                onClick={handleShare}
                aria-label="Partager le code"
                className="flex-1 flex items-center justify-center gap-2 h-11 bg-white border-2 border-primary/20 text-primary font-bold rounded-xl text-sm hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  share
                </span>
                Partager
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-text-muted text-sm py-2 hover:text-text-main transition-colors"
            >
              Continuer sans partenaire
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
