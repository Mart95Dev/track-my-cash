"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { requestAccountDeletionAction } from "@/app/actions/account-deletion-actions";

const CONFIRM_WORD = "SUPPRIMER";

export function DeleteUserAccountDialog() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [requested, setRequested] = useState(false);

  function handleConfirm() {
    if (input !== CONFIRM_WORD) return;
    startTransition(async () => {
      const result = await requestAccountDeletionAction();
      if (result.success) {
        setRequested(true);
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setInput("");
      setRequested(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Supprimer mon compte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {requested ? (
          <>
            <DialogHeader>
              <DialogTitle>Demande enregistrée</DialogTitle>
              <DialogDescription>
                Votre demande de suppression a bien été prise en compte. Vos données seront
                supprimées dans <strong>30 jours</strong>. Un email de rappel vous sera envoyé
                5 jours avant la suppression effective.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Fermer</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Demander la suppression de mon compte
              </DialogTitle>
              <DialogDescription>
                Cette action planifie la suppression de toutes vos données (comptes, transactions,
                paiements récurrents) et l&apos;annulation de votre abonnement actif dans{" "}
                <strong>30 jours</strong>. Vous recevrez un email de rappel à J+25. Vous pouvez
                annuler la demande avant la suppression effective.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Label htmlFor="confirm-delete">
                Tapez <strong>{CONFIRM_WORD}</strong> pour confirmer
              </Label>
              <Input
                id="confirm-delete"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={CONFIRM_WORD}
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={input !== CONFIRM_WORD || isPending}
              >
                {isPending ? "Envoi…" : "Confirmer la demande"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
