"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Vous êtes hors ligne</h1>

      <p className="text-muted-foreground max-w-md mb-8">
        Cette page n&apos;est pas disponible sans connexion internet.
        Vérifiez votre connexion et réessayez.
      </p>

      <Button
        onClick={() => window.location.reload()}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </Button>
    </div>
  );
}
