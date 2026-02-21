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
import { deleteUserAccountAction } from "@/app/actions/delete-account-actions";

const CONFIRM_WORD = "SUPPRIMER";

export function DeleteUserAccountDialog() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (input !== CONFIRM_WORD) return;
    startTransition(async () => {
      await deleteUserAccountAction();
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setInput("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Supprimer mon compte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Supprimer définitivement mon compte
          </DialogTitle>
          <DialogDescription>
            Cette action est <strong>irréversible</strong>. Toutes vos données (comptes, transactions,
            paiements récurrents) seront supprimées définitivement. Votre abonnement actif sera également
            annulé immédiatement.
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
            {isPending ? "Suppression…" : "Confirmer la suppression"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
