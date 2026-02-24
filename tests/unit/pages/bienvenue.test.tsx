import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import BienvenueePage from "@/app/[locale]/(app)/bienvenue/page";
import { PLANS } from "@/lib/stripe-plans";

describe("BienvenueePage (STORY-083)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-83-1 : plan=pro → rend sans erreur et contient check_circle (AC-1)", async () => {
    const { container } = render(
      await BienvenueePage({ searchParams: Promise.resolve({ plan: "pro" }) })
    );
    expect(container.textContent).toContain("check_circle");
  });

  it("TU-83-2 : plan=pro → affiche le nom 'Pro' dans la page (AC-2)", async () => {
    render(
      await BienvenueePage({ searchParams: Promise.resolve({ plan: "pro" }) })
    );
    expect(screen.getByText(/Pro/)).toBeTruthy();
  });

  it("TU-83-3 : plan=pro → affiche toutes les features Pro (AC-3)", async () => {
    render(
      await BienvenueePage({ searchParams: Promise.resolve({ plan: "pro" }) })
    );
    for (const feature of PLANS.pro.features) {
      expect(screen.getByText(feature)).toBeTruthy();
    }
  });

  it("TU-83-4 : plan=premium → affiche les features Premium (AC-3)", async () => {
    render(
      await BienvenueePage({
        searchParams: Promise.resolve({ plan: "premium" }),
      })
    );
    for (const feature of PLANS.premium.features) {
      expect(screen.getByText(feature)).toBeTruthy();
    }
  });

  it("TU-83-5 : plan=invalid → fallback vers pro sans crash (AC-5)", async () => {
    let error: unknown = null;
    try {
      render(
        await BienvenueePage({
          searchParams: Promise.resolve({ plan: "invalid" }),
        })
      );
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });

  it("TU-83-6 : 3 liens d'action → transactions, conseiller, dashboard (AC-4)", async () => {
    render(
      await BienvenueePage({ searchParams: Promise.resolve({ plan: "pro" }) })
    );
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href") ?? "");
    expect(hrefs.some((h) => h.includes("/transactions"))).toBe(true);
    expect(hrefs.some((h) => h.includes("/conseiller"))).toBe(true);
    expect(hrefs.some((h) => h.includes("/dashboard"))).toBe(true);
  });

  it("TU-83-7 : le lien 'Gérer mon abonnement' pointe vers /parametres?tab=billing (AC-7)", async () => {
    render(
      await BienvenueePage({ searchParams: Promise.resolve({ plan: "pro" }) })
    );
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href") ?? "");
    expect(hrefs.some((h) => h.includes("/parametres"))).toBe(true);
  });
});
