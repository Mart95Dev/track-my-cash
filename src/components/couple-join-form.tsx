"use client";

import { useActionState } from "react";
import { joinCoupleAction } from "@/app/actions/couple-actions";

export function CoupleJoinForm() {
  const [state, formAction, isPending] = useActionState(joinCoupleAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="inviteCode"
        type="text"
        placeholder="Code à 6 caractères"
        maxLength={6}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary uppercase"
      />
      {state && "error" in state && (
        <p className="text-xs text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="border border-primary text-primary font-bold rounded-xl px-4 py-2.5 text-sm w-full hover:bg-primary/5 disabled:opacity-60"
      >
        {isPending ? "Connexion..." : "Rejoindre"}
      </button>
    </form>
  );
}
