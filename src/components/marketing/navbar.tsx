"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "/#features" as const },
  { label: "Tarifs", href: "/tarifs" as const },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>account_balance_wallet</span>
          </div>
          <span className="text-base font-bold text-text-main tracking-tight">Track My Cash</span>
        </Link>

        {/* Navigation desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text-main"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" asChild className="rounded-xl border-slate-200 text-text-main font-semibold hover:border-primary hover:text-primary">
            <Link href="/connexion">Connexion</Link>
          </Button>
          <Button asChild className="rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90">
            <Link href="/inscription">Commencer</Link>
          </Button>
        </div>

        {/* Menu hamburger mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>TrackMyCash</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              <Button variant="outline" asChild>
                <Link href="/connexion" onClick={() => setOpen(false)}>
                  Connexion
                </Link>
              </Button>
              <Button asChild>
                <Link href="/inscription" onClick={() => setOpen(false)}>
                  Commencer
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
