"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { createAccountAction } from "@/app/actions/account-actions";
import { completeOnboardingAction } from "@/app/actions/onboarding-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface OnboardingWizardProps {
  open: boolean;
  initialStep?: number;
}

export function OnboardingWizard({ open, initialStep = 1 }: OnboardingWizardProps) {
  const [step, setStep] = useState(initialStep);
  const [isOpen, setIsOpen] = useState(open);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await createAccountAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Compte créé !");
      setStep(2);
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state]);

  async function handleClose() {
    setIsOpen(false);
    await completeOnboardingAction();
  }

  async function handleFinish() {
    setIsOpen(false);
    await completeOnboardingAction();
  }

  const TOTAL_STEPS = 3;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {step === 1 && "Bienvenue sur TrackMyCash !"}
              {step === 2 && "Importez vos transactions"}
              {step === 3 && "Tout est prêt !"}
            </DialogTitle>
            <button
              onClick={handleClose}
              aria-label="Fermer"
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Étape {step} / {TOTAL_STEPS}
          </p>
        </DialogHeader>

        {/* Étape 1 — Créer un compte */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Commencez par créer votre premier compte bancaire pour suivre vos finances.
            </p>
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="onb-name">Nom du compte</Label>
                <Input
                  id="onb-name"
                  name="name"
                  placeholder="Ex : Compte courant"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="onb-balance">Solde initial</Label>
                  <Input
                    id="onb-balance"
                    name="initialBalance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onb-currency">Devise</Label>
                  <select
                    id="onb-currency"
                    name="currency"
                    defaultValue="EUR"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="EUR">EUR</option>
                    <option value="MGA">MGA</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="onb-date">Date du solde</Label>
                <Input
                  id="onb-date"
                  name="balanceDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Création..." : "Créer mon compte →"}
              </Button>
            </form>
          </div>
        )}

        {/* Étape 2 — Importer (optionnel) */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Importez vos relevés bancaires pour voir l&apos;historique de vos transactions automatiquement. Vous pouvez aussi le faire plus tard depuis la page Transactions.
            </p>
            <div className="rounded-lg border border-dashed p-6 text-center space-y-2">
              <p className="text-sm font-medium">Formats supportés</p>
              <p className="text-xs text-muted-foreground">CSV, Excel (.xlsx), PDF — Banque Populaire, MCB, Revolut, Crédit Agricole</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => setStep(3)}>
                Passer cette étape →
              </Button>
            </div>
          </div>
        )}

        {/* Étape 3 — Terminé */}
        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <CheckCircle className="h-12 w-12 text-income mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Félicitations !</h3>
              <p className="text-sm text-muted-foreground">
                Votre compte est configuré. Vous pouvez maintenant suivre vos finances, importer des relevés et analyser vos dépenses.
              </p>
            </div>
            <Button className="w-full" onClick={handleFinish}>
              Accéder à mon tableau de bord →
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
