import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks des dépendances
const mockGetBudgets = vi.fn();
const mockGetBudgetStatus = vi.fn();
const mockGetAccountById = vi.fn();
const mockSendEmail = vi.fn();
const mockRenderBudgetAlert = vi.fn(() => "<p>budget alert</p>");
const mockDbExecute = vi.fn().mockResolvedValue({});

vi.mock("@/lib/queries", () => ({
  getBudgets: mockGetBudgets,
  getBudgetStatus: mockGetBudgetStatus,
  getAccountById: mockGetAccountById,
}));

vi.mock("@/lib/email", () => ({
  sendEmail: mockSendEmail,
}));

vi.mock("@/lib/email-templates", () => ({
  renderBudgetAlert: mockRenderBudgetAlert,
}));

const mockDb = {
  execute: mockDbExecute,
} as unknown as import("@libsql/client").Client;

const baseBudget = {
  id: 1,
  account_id: 1,
  category: "Alimentation",
  amount_limit: 500,
  period: "monthly" as const,
  created_at: "2024-01-01T00:00:00Z",
  last_budget_alert_at: null,
  last_budget_alert_type: null,
};

const baseAccount = {
  id: 1,
  name: "Compte Courant",
  currency: "EUR",
  initial_balance: 1000,
  balance_date: "2024-01-01",
  created_at: "2024-01-01T00:00:00Z",
};

describe("checkAndSendBudgetAlerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendEmail.mockResolvedValue({ success: true });
    mockGetAccountById.mockResolvedValue(baseAccount);
  });

  it("TU-1-1 : Pas d'alerte si percentage < 80", async () => {
    mockGetBudgets.mockResolvedValue([baseBudget]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 350, limit: 500, percentage: 70, period: "monthly" },
    ]);
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await checkAndSendBudgetAlerts(mockDb, 1, "user@example.com");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("TU-1-2 : Alerte 'warning' si 80 ≤ percentage < 100", async () => {
    mockGetBudgets.mockResolvedValue([baseBudget]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 420, limit: 500, percentage: 84, period: "monthly" },
    ]);
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await checkAndSendBudgetAlerts(mockDb, 1, "user@example.com");
    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail.mock.calls[0][0].subject).toContain("⚠️");
    expect(mockRenderBudgetAlert).toHaveBeenCalledWith(
      "Alimentation", 420, 500, 84, "warning", "EUR"
    );
  });

  it("TU-1-3 : Alerte 'exceeded' si percentage ≥ 100", async () => {
    mockGetBudgets.mockResolvedValue([baseBudget]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 550, limit: 500, percentage: 110, period: "monthly" },
    ]);
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await checkAndSendBudgetAlerts(mockDb, 1, "user@example.com");
    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail.mock.calls[0][0].subject).toContain("🚨");
    expect(mockRenderBudgetAlert).toHaveBeenCalledWith(
      "Alimentation", 550, 500, 110, "exceeded", "EUR"
    );
  });

  it("TU-1-4 : Pas de double envoi si même type d'alerte dans la période", async () => {
    mockGetBudgets.mockResolvedValue([
      { ...baseBudget, last_budget_alert_type: "warning" },
    ]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 420, limit: 500, percentage: 84, period: "monthly" },
    ]);
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await checkAndSendBudgetAlerts(mockDb, 1, "user@example.com");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("TU-1-5 : last_budget_alert_at mis à jour après envoi réussi", async () => {
    mockGetBudgets.mockResolvedValue([baseBudget]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 420, limit: 500, percentage: 84, period: "monthly" },
    ]);
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await checkAndSendBudgetAlerts(mockDb, 1, "user@example.com");
    expect(mockDbExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: "UPDATE budgets SET last_budget_alert_at = ?, last_budget_alert_type = ? WHERE id = ?",
        args: expect.arrayContaining([1]),
      })
    );
  });

  it("TU-1-6 : Pas d'alerte si sendEmail échoue (erreur silencieuse)", async () => {
    mockGetBudgets.mockResolvedValue([baseBudget]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 420, limit: 500, percentage: 84, period: "monthly" },
    ]);
    mockSendEmail.mockRejectedValue(new Error("SMTP error"));
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await expect(checkAndSendBudgetAlerts(mockDb, 1, "user@example.com")).resolves.toBeUndefined();
  });

  it("TU-1-7 : si sendEmail retourne { success: false } → DB NOT mise à jour", async () => {
    mockGetBudgets.mockResolvedValue([baseBudget]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 420, limit: 500, percentage: 84, period: "monthly" },
    ]);
    mockSendEmail.mockResolvedValue({ success: false });
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await checkAndSendBudgetAlerts(mockDb, 1, "user@example.com");
    expect(mockDbExecute).not.toHaveBeenCalled();
  });

  it("TU-1-8 : escalade 'warning' → 'exceeded' autorisée (sendEmail appelé)", async () => {
    mockGetBudgets.mockResolvedValue([
      { ...baseBudget, last_budget_alert_type: "warning" },
    ]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 550, limit: 500, percentage: 110, period: "monthly" },
    ]);
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await checkAndSendBudgetAlerts(mockDb, 1, "user@example.com");
    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail.mock.calls[0][0].subject).toContain("🚨");
  });

  it("TU-1-9 : multi-budgets — deux catégories à 80%+ → deux emails envoyés", async () => {
    const budget2 = { ...baseBudget, id: 2, category: "Transport", last_budget_alert_type: null };
    mockGetBudgets.mockResolvedValue([baseBudget, budget2]);
    mockGetBudgetStatus.mockResolvedValue([
      { category: "Alimentation", spent: 420, limit: 500, percentage: 84, period: "monthly" },
      { category: "Transport", spent: 190, limit: 200, percentage: 95, period: "monthly" },
    ]);
    const { checkAndSendBudgetAlerts } = await import("@/lib/budget-alert-service");
    await checkAndSendBudgetAlerts(mockDb, 1, "user@example.com");
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
  });
});
