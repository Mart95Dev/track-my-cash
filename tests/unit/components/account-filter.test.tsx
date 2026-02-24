import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const msgs: Record<string, string> = {
      selectAccount: "— Choisir un compte —",
      allAccounts: "Tous les comptes",
    };
    return msgs[key] ?? key;
  },
}));

import { AccountFilter } from "@/components/account-filter";

const ACCOUNTS = [
  {
    id: 1,
    name: "Compte Principal",
    currency: "EUR",
    initial_balance: 1000,
    balance_date: "2024-01-01",
    created_at: "2024-01-01",
  },
  {
    id: 2,
    name: "Livret A",
    currency: "EUR",
    initial_balance: 5000,
    balance_date: "2024-01-01",
    created_at: "2024-01-01",
  },
];

describe("AccountFilter — option 'Tous les comptes' (STORY-063, AC-1/AC-5)", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("TU-63-6 : option 'Tous les comptes' est présente (AC-1)", () => {
    render(<AccountFilter accounts={ACCOUNTS} basePath="/dashboard" />);
    expect(screen.getByText("Tous les comptes")).toBeDefined();
  });

  it("TU-63-7 : 'Tous les comptes' est le premier bouton (AC-1)", () => {
    render(<AccountFilter accounts={ACCOUNTS} basePath="/dashboard" />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].textContent).toBe("Tous les comptes");
  });

  it("TU-63-8 : currentAccountId='all' active le bouton 'Tous les comptes' (AC-5)", () => {
    render(
      <AccountFilter
        accounts={ACCOUNTS}
        currentAccountId="all"
        basePath="/dashboard"
      />
    );
    const allBtn = screen.getByText("Tous les comptes");
    expect(allBtn.className).toContain("bg-primary");
  });

  it("TU-63-9 : clic sur 'Tous les comptes' navigue avec accountId=all (AC-5)", () => {
    render(<AccountFilter accounts={ACCOUNTS} basePath="/dashboard" />);
    const allBtn = screen.getByText("Tous les comptes");
    fireEvent.click(allBtn);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("accountId=all")
    );
  });
});
