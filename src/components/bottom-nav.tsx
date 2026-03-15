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
  { href: "/notifications", icon: "notifications",         label: "Notifs" },
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
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 z-50 w-60 flex-col bg-white border-r border-[#EEEEEE] shadow-[0_1px_3px_rgba(108,92,231,0.06)]">
        {/* Logo */}
        <div className="px-5 pt-6 pb-8">
          <Link href={`/${locale}/dashboard`}>
            <img src="/koupli-logo-horizontal.svg" alt="Koupli" className="h-8" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {NAV_ITEMS.map((item) => {
            const fullHref = `/${locale}${item.href}`;
            const isActive = pathname.startsWith(fullHref);
            const isCouple = item.href === "/couple";

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={`relative flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] transition-all ${
                  isActive
                    ? "bg-[#F0EEFF] text-[#6C5CE7] font-semibold"
                    : "text-text-muted font-medium hover:bg-[#FAFAFA] hover:text-text-main"
                }`}
              >
                {/* Barre laterale active */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#6C5CE7]" />
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
        <div className="px-3 pb-6 space-y-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <Link
            href={`/${locale}/notifications`}
            className={`relative flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] transition-all ${
              pathname.startsWith(`/${locale}/notifications`)
                ? "bg-[#F0EEFF] text-[#6C5CE7] font-semibold"
                : "text-text-muted font-medium hover:bg-[#FAFAFA] hover:text-text-main"
            }`}
          >
            {pathname.startsWith(`/${locale}/notifications`) && (
              <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#6C5CE7]" />
            )}
            <span
              className="material-symbols-outlined text-[20px]"
              style={{
                fontVariationSettings: pathname.startsWith(`/${locale}/notifications`) ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              notifications
            </span>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto flex items-center justify-center min-w-5 h-5 px-1 bg-danger text-white text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href={`/${locale}/parametres`}
            className={`flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] transition-all ${
              pathname.startsWith(`/${locale}/parametres`)
                ? "bg-[#F0EEFF] text-[#6C5CE7] font-semibold"
                : "text-text-muted font-medium hover:bg-[#FAFAFA] hover:text-text-main"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Parametres
          </Link>
          <div className="border-t border-[#EEEEEE] my-2" />
          <Link
            href="/"
            className="flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] font-medium text-text-muted hover:bg-[#FAFAFA] hover:text-text-main transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Retour au site
          </Link>
        </div>
      </aside>

      {/* ── BottomNav mobile (< md) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EEEEEE] h-16 pb-safe shadow-[0_1px_3px_rgba(108,92,231,0.06)]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex h-full items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const fullHref = `/${locale}${item.href}`;
            const isActive = pathname.startsWith(fullHref);
            const isCouple = item.href === "/couple";
            const isNotif = item.href === "/notifications";

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
                  isActive
                    ? "text-[#6C5CE7]"
                    : "text-text-muted hover:text-[#6C5CE7]/70"
                }`}
              >
                {isCouple && coupleIncomplete && (
                  <span
                    aria-label="couple incomplet"
                    className="absolute top-0 right-1 w-2 h-2 rounded-full bg-danger"
                  />
                )}
                {isNotif && unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} notifications non lues`}
                    className="absolute -top-0.5 right-0 flex items-center justify-center min-w-4 h-4 px-0.5 bg-danger text-white text-[9px] font-bold rounded-full"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                {/* Pill indicateur actif */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#6C5CE7]" />
                )}
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className={`text-[10px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
