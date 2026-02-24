"use client";

import { useActionState } from "react";
import { createCoupleAction } from "@/app/actions/couple-actions";

export function CoupleCreateForm() {
  const [state, formAction, isPending] = useActionState(createCoupleAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="name"
        type="text"
        placeholder="Nom du couple (optionnel)"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary"
      />
      {state && "error" in state && (
        <p className="text-xs text-danger">{state.error}</p>
      )}
      {state && "success" in state && "inviteCode" in state && (
        <div className="bg-primary/5 rounded-xl p-3">
          <p className="text-xs text-text-muted mb-1">Votre code d&apos;invitation :</p>
          <p className="text-xl font-extrabold text-primary tracking-widest">{state.inviteCode}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-white font-bold rounded-xl px-4 py-2.5 text-sm w-full disabled:opacity-60"
      >
        {isPending ? "Création..." : "Créer notre espace"}
      </button>
    </form>
  );
}
