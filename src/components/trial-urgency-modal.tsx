"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TrialUrgencyModalProps = {
  daysRemaining: number;
  status: string;
};

const MODAL_KEY = "trial_modal_shown_date";

export function TrialUrgencyModal({ daysRemaining, status }: TrialUrgencyModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== "trialing" || daysRemaining > 3) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem(MODAL_KEY);
    if (lastShown === today) return;

    setVisible(true); // eslint-disable-line
  }, [daysRemaining, status]);

  function handleDismiss() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(MODAL_KEY, today);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-5 shadow-xl">
        {/* Icône + Titre */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center size-16 rounded-full bg-warning/10">
            <span
              className="material-symbols-outlined text-warning"
              style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}
            >
              hourglass_empty
            </span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-text-main">
              Votre essai expire bientôt
            </h2>
            <p className="text-text-muted text-sm mt-1">
              {daysRemaining === 1
                ? "Dernier jour de votre essai Pro"
                : `Plus que ${daysRemaining} jours`}
            </p>
          </div>
        </div>

        {/* Features Pro */}
        <ul className="flex flex-col gap-2">
          {[
            "Import PDF & Excel toutes banques",
            "Conseiller IA financier",
            "5 comptes bancaires",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-text-main">
              <span
                className="material-symbols-outlined text-success text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <Link
            href="/tarifs"
            onClick={handleDismiss}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
          >
            Souscrire maintenant
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <button
            onClick={handleDismiss}
            className="w-full text-text-muted text-sm py-2 hover:text-text-main"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
