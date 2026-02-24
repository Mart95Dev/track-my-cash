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
  { href: "/recurrents",   icon: "autorenew",              label: "Récurrents" },
  { href: "/conseiller",   icon: "smart_toy",              label: "IA" },
];

export function BottomNav() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 h-16 pb-safe">
      <div className="max-w-md mx-auto flex h-full items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(fullHref);
          return (
            <Link
              key={item.href}
              href={fullHref}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-primary/70"
              }`}
            >
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
  );
}
