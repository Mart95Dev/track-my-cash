"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "/fonctionnalites" as const },
  { label: "Tarifs", href: "/tarifs" as const },
  { label: "Blog", href: "/blog" as const },
  { label: "Sécurité", href: "/securite" as const },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-border-light shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
      style={{ padding: scrolled ? "12px 0" : "18px 0" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary font-bold text-white text-lg">
            T
          </div>
          <span className="text-base font-bold tracking-tight text-text-main">
            Koupli
          </span>
        </Link>

        {/* Navigation desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors pb-1 ${
                  isActive
                    ? "text-primary"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {session?.user ? (
            <>
              <Button
                asChild
                className="rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                <Link href="/dashboard">Mon espace</Link>
              </Button>
              <button
                type="button"
                onClick={() => authClient.signOut().then(() => window.location.reload())}
                className="text-sm font-medium text-text-muted transition-colors hover:text-danger"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="text-sm font-medium text-text-muted transition-colors hover:text-primary"
              >
                Connexion
              </Link>
              <Button
                asChild
                className="rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                <Link href="/inscription">Essai gratuit</Link>
              </Button>
            </>
          )}
        </div>

        {/* Menu hamburger mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-white text-sm">
                  T
                </div>
                Koupli
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base font-medium transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-text-muted hover:text-text-main"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-border-light" />
              {session?.user ? (
                <>
                  <Button asChild className="rounded-xl bg-primary text-white font-semibold">
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      Mon espace
                    </Link>
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      authClient.signOut().then(() => window.location.reload());
                    }}
                    className="text-base font-medium text-text-muted transition-colors hover:text-danger"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    className="text-base font-medium text-text-muted transition-colors hover:text-primary"
                    onClick={() => setOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Button asChild className="rounded-xl bg-primary text-white font-semibold">
                    <Link href="/inscription" onClick={() => setOpen(false)}>
                      Essai gratuit
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
