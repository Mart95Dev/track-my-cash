"use client";

import { useState } from "react";
import { markOnboardingCompleteAction } from "@/app/actions/couple-actions";
import { CoupleCreateForm } from "@/components/couple-create-form";
import { CoupleJoinForm } from "@/components/couple-join-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CoupleOnboardingWizardProps {
  locale: string;
}

const TOTAL_STEPS = 4;

export function CoupleOnboardingWizard({ locale }: CoupleOnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(true);
  const [tab, setTab] = useState<"create" | "join">("create");

  async function handleSkip() {
    setIsOpen(false);
    await markOnboardingCompleteAction();
  }

  async function handleFinish() {
    setIsOpen(false);
    await markOnboardingCompleteAction();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleSkip(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-1">
            <DialogTitle>
              {step === 1 && "Gérez votre argent de couple"}
              {step === 2 && "Créer ou rejoindre un couple"}
              {step === 3 && "Invitez votre partenaire"}
              {step === 4 && "Vos premières transactions"}
            </DialogTitle>
          </div>
          <p className="text-xs text-text-muted">
            Étape {step} / {TOTAL_STEPS}
          </p>
        </DialogHeader>

        {/* ── Step 1 : Bienvenue ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <span className="material-symbols-outlined text-primary text-[56px]">
                favorite
              </span>
              <p className="text-text-muted text-sm leading-relaxed">
                Koupli vous permet de gérer vos finances en couple —
                partagez vos dépenses, suivez votre balance et atteignez vos
                objectifs communs.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white font-bold rounded-xl py-3 text-sm shadow-lg shadow-primary/20"
            >
              Commencer →
            </button>
            <button
              onClick={handleSkip}
              className="w-full text-text-muted text-sm py-2 hover:text-text-main transition-colors"
            >
              Passer
            </button>
          </div>
        )}

        {/* ── Step 2 : Créer / Rejoindre ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4 pt-2">
            {/* Tabs */}
            <div className="flex gap-2 bg-background-light rounded-xl p-1">
              <button
                onClick={() => setTab("create")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                  tab === "create"
                    ? "bg-white text-primary shadow-soft"
                    : "text-text-muted"
                }`}
              >
                Créer un espace
              </button>
              <button
                onClick={() => setTab("join")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                  tab === "join"
                    ? "bg-white text-primary shadow-soft"
                    : "text-text-muted"
                }`}
              >
                Rejoindre
              </button>
            </div>

            {tab === "create" ? <CoupleCreateForm /> : <CoupleJoinForm />}

            <button
              onClick={() => setStep(3)}
              className="w-full border border-gray-200 text-text-muted font-medium rounded-xl py-2.5 text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Continuer →
            </button>
            <button
              onClick={handleSkip}
              className="w-full text-text-muted text-xs py-1 hover:text-text-main transition-colors"
            >
              Passer
            </button>
          </div>
        )}

        {/* ── Step 3 : Code invite ── */}
        {step === 3 && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <span className="material-symbols-outlined text-primary text-[48px]">
                share
              </span>
              <p className="text-text-muted text-sm leading-relaxed">
                Partagez le code d&apos;invitation avec votre partenaire pour
                qu&apos;il rejoigne votre espace couple.
              </p>
            </div>
            <a
              href={`/${locale}/couple`}
              className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary font-bold rounded-xl py-3 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                content_copy
              </span>
              Voir mon code d&apos;invitation
            </a>
            <button
              onClick={() => setStep(4)}
              className="w-full border border-gray-200 text-text-muted font-medium rounded-xl py-2.5 text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Suivant →
            </button>
            <button
              onClick={handleSkip}
              className="w-full text-text-muted text-xs py-1 hover:text-text-main transition-colors"
            >
              Passer
            </button>
          </div>
        )}

        {/* ── Step 4 : Premières transactions ── */}
        {step === 4 && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <span className="material-symbols-outlined text-success text-[48px]">
                check_circle
              </span>
              <p className="text-text-main font-bold text-base">
                Tout est prêt !
              </p>
              <p className="text-text-muted text-sm leading-relaxed">
                Importez vos relevés ou ajoutez vos premières transactions pour
                commencer à suivre vos finances en couple.
              </p>
            </div>
            <a
              href={`/${locale}/transactions`}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl py-3 text-sm shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">
                receipt_long
              </span>
              Voir mes transactions
            </a>
            <button
              onClick={handleFinish}
              className="w-full border border-gray-200 text-text-muted font-medium rounded-xl py-2.5 text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Terminer
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
