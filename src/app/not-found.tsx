import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-xl font-semibold">Page introuvable</h2>
          <p className="text-muted-foreground">
            Cette page n&apos;existe pas ou a été déplacée.
          </p>
        </div>
        <Button asChild>
          <Link href="/fr">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}
