"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    icon: "space_dashboard",        label: "Dashboard" },
  { href: "/comptes",      icon: "account_balance_wallet", label: "Comptes" },
  { href: "/transactions", icon: "receipt_long",           label: "Transactions" },
  { href: "/couple",       icon: "favorite",               label: "Couple" },
  { href: "/conseiller",   icon: "smart_toy",              label: "IA" },
];

export function BottomNav({
  unreadCount = 0,
  coupleIncomplete = false,
}: {
  unreadCount?: number;
  coupleIncomplete?: boolean;
}) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <>
      {/* ── Sidebar desktop (md+) ── */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 z-50 w-60 flex-col bg-white border-r border-border-light shadow-[4px_0_20px_-2px_rgba(0,0,0,0.03)]">
        {/* Logo */}
        <div className="px-5 pt-6 pb-8">
          <Link href={`/${locale}/dashboard`}>
            <img src="/koupli-logo-horizontal.svg" alt="Koupli" className="h-8" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const fullHref = `/${locale}${item.href}`;
            const isActive = pathname.startsWith(fullHref);
            const isCouple = item.href === "/couple";

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={`relative flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-slate-50 hover:text-text-main"
                }`}
              >
                {/* Barre laterale active */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />
                )}
                {isCouple && coupleIncomplete && (
                  <span
                    aria-label="couple incomplet"
                    className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-danger"
                  />
                )}
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Notifications + bottom */}
        <div className="px-3 pb-6 space-y-2">
          {unreadCount > 0 && (
            <Link
              href={`/${locale}/notifications`}
              className="flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium text-text-muted hover:bg-slate-50 hover:text-text-main transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              Notifications
              <span className="ml-auto flex items-center justify-center min-w-5 h-5 px-1 bg-danger text-white text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            </Link>
          )}
          <Link
            href={`/${locale}/parametres`}
            className={`flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith(`/${locale}/parametres`)
                ? "bg-primary/10 text-primary"
                : "text-text-muted hover:bg-slate-50 hover:text-text-main"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Parametres
          </Link>
          <div className="border-t border-border-light my-2" />
          <Link
            href="/"
            className="flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium text-text-muted hover:bg-slate-50 hover:text-text-main transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Retour au site
          </Link>
        </div>
      </aside>

      {/* ── BottomNav mobile (< md) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light h-16 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {unreadCount > 0 && (
          <a
            href={`/${locale}/notifications`}
            aria-label={`${unreadCount} notifications non lues`}
            className="absolute top-0 right-4 -translate-y-1/2 flex items-center justify-center min-w-5 h-5 px-1 bg-danger text-white text-[10px] font-bold rounded-full z-10"
          >
            {unreadCount}
          </a>
        )}
        <div className="flex h-full items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const fullHref = `/${locale}${item.href}`;
            const isActive = pathname.startsWith(fullHref);
            const isCouple = item.href === "/couple";

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-text-muted hover:text-primary/70"
                }`}
              >
                {isCouple && coupleIncomplete && (
                  <span
                    aria-label="couple incomplet"
                    className="absolute top-0 right-2 w-2 h-2 rounded-full bg-danger"
                  />
                )}
                {/* Pill indicateur actif */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary" />
                )}
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
