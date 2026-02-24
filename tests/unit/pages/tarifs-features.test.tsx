import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/subscription-utils", () => ({
  getUserPlanId: vi.fn().mockResolvedValue("free"),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
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

vi.mock("@/components/subscribe-button", () => ({
  SubscribeButton: ({ label }: { planId: string; label: string }) => (
    <button>{label}</button>
  ),
}));

import TarifsPage from "@/app/[locale]/(marketing)/tarifs/page";
import { PLANS } from "@/lib/stripe-plans";

describe("Tarifs — features bullets (STORY-084)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-84-1 : la page contient ≥ 9 bullets de features au total (AC-1)", async () => {
    render(await TarifsPage());
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeGreaterThanOrEqual(9);
  });

  it("TU-84-2 : les features Free ≠ features Pro (AC-5)", () => {
    expect(PLANS.free.features).not.toEqual(PLANS.pro.features);
  });

  it("TU-84-3 : PLANS.free.features.length >= 5 (AC-5)", () => {
    expect(PLANS.free.features.length).toBeGreaterThanOrEqual(5);
  });

  it("TU-84-4 : PLANS.pro.features.length >= 5 (AC-5)", () => {
    expect(PLANS.pro.features.length).toBeGreaterThanOrEqual(5);
  });

  it("TU-84-5 : PLANS.premium.features.length >= 5 (AC-5)", () => {
    expect(PLANS.premium.features.length).toBeGreaterThanOrEqual(5);
  });

  it("TU-84-6 : la page /tarifs rend sans erreur (AC-6)", async () => {
    let error: unknown = null;
    try {
      render(await TarifsPage());
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });
});
