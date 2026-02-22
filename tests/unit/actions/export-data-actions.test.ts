import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks avant imports
vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-123"),
}));

const mockDb = {};
vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue(mockDb),
  getDb: vi.fn().mockReturnValue({}),
}));

const mockAccounts = [{ id: 1, name: "Compte courant", currency: "EUR" }];
const mockTransactions = [
  { id: 1, account_id: 1, date: "2026-01-15", description: "Loyer", amount: -800, type: "expense" },
];
const mockRecurring = [{ id: 1, name: "Netflix", amount: 13.99 }];
const mockBudgets = [{ id: 1, account_id: 1, category: "Alimentation", amount_limit: 400 }];
const mockGoals = [{ id: 1, name: "Vacances", target_amount: 2000, current_amount: 500 }];
const mockSettings = [{ key: "reference_currency", value: "EUR" }];

vi.mock("@/lib/queries", () => ({
  getAllAccounts: vi.fn().mockResolvedValue(mockAccounts),
  getTransactions: vi.fn().mockResolvedValue(mockTransactions),
  getRecurringPayments: vi.fn().mockResolvedValue(mockRecurring),
  getAllBudgets: vi.fn().mockResolvedValue(mockBudgets),
  getGoals: vi.fn().mockResolvedValue(mockGoals),
  getAllSettings: vi.fn().mockResolvedValue(mockSettings),
}));

describe("exportUserDataAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-65-1 : retourne un JSON avec les 6 clés de données (accounts, transactions, recurring, budgets, goals, settings)", async () => {
    const { exportUserDataAction } = await import("@/app/actions/account-deletion-actions");
    const result = await exportUserDataAction();
    expect(result.success).toBe(true);
    if (!result.success) return;
    const data = JSON.parse(result.json);
    expect(data).toHaveProperty("accounts");
    expect(data).toHaveProperty("transactions");
    expect(data).toHaveProperty("recurring");
    expect(data).toHaveProperty("budgets");
    expect(data).toHaveProperty("goals");
    expect(data).toHaveProperty("settings");
  });

  it("TU-65-2 : le JSON inclut version: \"1.0\"", async () => {
    const { exportUserDataAction } = await import("@/app/actions/account-deletion-actions");
    const result = await exportUserDataAction();
    expect(result.success).toBe(true);
    if (!result.success) return;
    const data = JSON.parse(result.json);
    expect(data.version).toBe("1.0");
  });

  it("TU-65-3 : le JSON inclut exportDate au format ISO 8601", async () => {
    const { exportUserDataAction } = await import("@/app/actions/account-deletion-actions");
    const result = await exportUserDataAction();
    expect(result.success).toBe(true);
    if (!result.success) return;
    const data = JSON.parse(result.json);
    expect(data.exportDate).toBeDefined();
    // Vérification ISO 8601 : la date doit être parseable et cohérente
    const parsed = new Date(data.exportDate);
    expect(isNaN(parsed.getTime())).toBe(false);
    expect(data.exportDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("TU-65-4 : les données contiennent les valeurs retournées par les queries", async () => {
    const { exportUserDataAction } = await import("@/app/actions/account-deletion-actions");
    const result = await exportUserDataAction();
    expect(result.success).toBe(true);
    if (!result.success) return;
    const data = JSON.parse(result.json);
    expect(data.accounts).toEqual(mockAccounts);
    expect(data.transactions).toEqual(mockTransactions);
    expect(data.recurring).toEqual(mockRecurring);
    expect(data.budgets).toEqual(mockBudgets);
    expect(data.goals).toEqual(mockGoals);
    expect(data.settings).toEqual(mockSettings);
  });
});
