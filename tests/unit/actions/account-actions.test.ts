import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks déclarés avant les imports
vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-123"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockDb = {};
vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue(mockDb),
}));

const mockAccount = {
  id: 1,
  name: "Compte test",
  initial_balance: 1000,
  balance_date: "2026-01-01",
  currency: "EUR",
  created_at: "2026-01-01",
};

vi.mock("@/lib/queries", () => ({
  getAllAccounts: vi.fn().mockResolvedValue([]),
  createAccount: vi.fn().mockResolvedValue(mockAccount),
  deleteAccount: vi.fn().mockResolvedValue(undefined),
  getAccountById: vi.fn().mockResolvedValue(mockAccount),
  updateAccount: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/subscription-utils", () => ({
  canCreateAccount: vi.fn().mockResolvedValue({ allowed: true }),
}));

describe("account-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-1-1 : createAccountAction avec données valides → retourne { success: true, account }", async () => {
    const { createAccountAction } = await import("@/app/actions/account-actions");
    const form = new FormData();
    form.set("name", "Compte test");
    form.set("initialBalance", "1000");
    form.set("balanceDate", "2026-01-01");
    form.set("currency", "EUR");

    const result = await createAccountAction(null, form);
    expect(result).toMatchObject({ success: true });
    expect((result as { account: unknown }).account).toBeDefined();
  });

  it("TU-1-2 : createAccountAction sans nom → retourne { error }", async () => {
    const { createAccountAction } = await import("@/app/actions/account-actions");
    const form = new FormData();
    form.set("initialBalance", "1000");
    form.set("balanceDate", "2026-01-01");

    const result = await createAccountAction(null, form);
    expect((result as { error: string }).error).toBeDefined();
  });

  it("TU-1-3 : deleteAccountAction → retourne { success: true }", async () => {
    const { deleteAccountAction } = await import("@/app/actions/account-actions");
    const result = await deleteAccountAction(1);
    expect(result).toEqual({ success: true });
  });

  it("TU-1-4 : deleteAccountAction sur compte inexistant → retourne { success: true } sans exception", async () => {
    const { deleteAccount } = await import("@/lib/queries");
    vi.mocked(deleteAccount).mockResolvedValueOnce(undefined);
    const { deleteAccountAction } = await import("@/app/actions/account-actions");
    const result = await deleteAccountAction(9999);
    expect(result).toEqual({ success: true });
  });
});
