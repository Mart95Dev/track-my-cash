"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";

export function PwaUpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setShowUpdate(true);
          }
        });
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  function handleUpdate() {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    });
  }

  if (!showUpdate) return null;

  return (
    <div
      data-testid="pwa-update-banner"
      className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto bg-card border rounded-lg shadow-lg p-4"
    >
      <button
        onClick={() => setShowUpdate(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-4">
        <p className="font-medium text-sm">Mise à jour disponible</p>
        <p className="text-xs text-muted-foreground mt-1">
          Une nouvelle version de Koupli est disponible.
        </p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" className="h-7 text-xs gap-1" onClick={handleUpdate}>
            <RefreshCw className="h-3 w-3" />
            Mettre à jour
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowUpdate(false)}>
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
}
