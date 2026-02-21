"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_dismissed_until";

export function PwaInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    const isInStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isInStandalone) return;

    if (ios) {
      setIsIos(true);
      const timer = setTimeout(() => setVisible(true), 30000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      const timer = setTimeout(() => setVisible(true), 30000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    installEvent.userChoice.then(() => {
      setVisible(false);
      setInstallEvent(null);
    });
  }

  function handleDismiss() {
    const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, String(sevenDays));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      data-testid="pwa-install-banner"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto bg-card border rounded-lg shadow-lg p-4"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

      {isIos ? (
        <div className="pr-4">
          <p className="font-medium text-sm">Installer TrackMyCash</p>
          <p className="text-xs text-muted-foreground mt-1">
            Appuyez sur <Share className="inline h-3 w-3" /> puis &quot;Sur l&apos;écran d&apos;accueil&quot;
          </p>
          <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" onClick={handleDismiss}>
            Plus tard
          </Button>
        </div>
      ) : (
        <div className="pr-4">
          <p className="font-medium text-sm">Installer TrackMyCash</p>
          <p className="text-xs text-muted-foreground mt-1">
            Accédez à votre application depuis l&apos;écran d&apos;accueil
          </p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-7 text-xs gap-1" onClick={handleInstall}>
              <Download className="h-3 w-3" />
              Installer
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleDismiss}>
              Plus tard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
