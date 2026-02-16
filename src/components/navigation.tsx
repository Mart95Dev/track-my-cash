"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/comptes", label: "Comptes" },
  { href: "/transactions", label: "Transactions" },
  { href: "/recurrents", label: "Récurrents" },
  { href: "/previsions", label: "Prévisions" },
  { href: "/parametres", label: "Paramètres" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">Gestionnaire de Comptes</h1>
        </div>
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                pathname === link.href
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
