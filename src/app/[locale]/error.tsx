"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] marketing-light">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-32 md:py-40">
        <div className="text-center space-y-8 max-w-md">
          {/* Icône */}
          <div className="flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-danger/10">
              <span className="material-symbols-outlined text-[40px] text-danger">
                error
              </span>
            </div>
          </div>

          {/* Texte */}
          <div className="space-y-3">
            <h1 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Une erreur est survenue
            </h1>
            <p className="text-slate-500 text-base font-medium">
              Quelque chose s&apos;est mal passé. Veuillez réessayer.
            </p>
            {error.digest && (
              <p className="text-xs text-slate-400 font-mono">
                Code : {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={reset}
              className="rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 h-12 px-6"
            >
              <span className="material-symbols-outlined text-[18px] mr-2">refresh</span>
              Réessayer
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-border-light text-slate-700 font-semibold hover:bg-slate-50 h-12 px-6"
            >
              <a href="/">
                <span className="material-symbols-outlined text-[18px] mr-2">home</span>
                Retour à l&apos;accueil
              </a>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
