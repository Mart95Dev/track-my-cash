import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks des dépendances
const mockGetAccountById = vi.fn();
const mockSendEmail = vi.fn();
const mockDbExecute = vi.fn().mockResolvedValue({});

vi.mock("@/lib/queries", () => ({
  getAccountById: mockGetAccountById,
}));

vi.mock("@/lib/email", () => ({
  sendEmail: mockSendEmail,
  renderEmailBase: vi.fn((t: string, b: string) => `${t}${b}`),
}));

vi.mock("@/lib/email-templates", () => ({
  renderLowBalanceAlert: vi.fn(() => "<p>alerte</p>"),
}));

const mockDb = {
  execute: mockDbExecute,
} as unknown as import("@libsql/client").Client;

const baseAccount = {
  id: 1,
  name: "Compte Courant",
  alert_threshold: 500,
  calculated_balance: 250,
  currency: "EUR",
  last_alert_sent_at: null,
  initial_balance: 1000,
  balance_date: "2024-01-01",
  created_at: "2024-01-01T00:00:00Z",
};

describe("checkAndSendLowBalanceAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendEmail.mockResolvedValue({ success: true });
  });

  it("TU-1-1 : si alert_threshold est NULL → sendEmail n'est PAS appelé", async () => {
    mockGetAccountById.mockResolvedValue({ ...baseAccount, alert_threshold: null });
    const { checkAndSendLowBalanceAlert } = await import("@/lib/alert-service");
    await checkAndSendLowBalanceAlert(mockDb, 1, "user@example.com");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("TU-1-2 : si balance >= threshold → sendEmail n'est PAS appelé", async () => {
    mockGetAccountById.mockResolvedValue({ ...baseAccount, calculated_balance: 600 });
    const { checkAndSendLowBalanceAlert } = await import("@/lib/alert-service");
    await checkAndSendLowBalanceAlert(mockDb, 1, "user@example.com");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("TU-1-3 : si balance < threshold ET last_alert_sent_at NULL → sendEmail est appelé", async () => {
    mockGetAccountById.mockResolvedValue({ ...baseAccount, last_alert_sent_at: null });
    const { checkAndSendLowBalanceAlert } = await import("@/lib/alert-service");
    await checkAndSendLowBalanceAlert(mockDb, 1, "user@example.com");
    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail.mock.calls[0][0].to).toBe("user@example.com");
  });

  it("TU-1-4 : si last_alert_sent_at > 24h ago → sendEmail est appelé", async () => {
    const oldDate = new Date(Date.now() - 25 * 3600 * 1000).toISOString();
    mockGetAccountById.mockResolvedValue({ ...baseAccount, last_alert_sent_at: oldDate });
    const { checkAndSendLowBalanceAlert } = await import("@/lib/alert-service");
    await checkAndSendLowBalanceAlert(mockDb, 1, "user@example.com");
    expect(mockSendEmail).toHaveBeenCalledOnce();
  });

  it("TU-1-5 : si last_alert_sent_at < 24h ago → sendEmail n'est PAS appelé (anti-spam)", async () => {
    const recentDate = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    mockGetAccountById.mockResolvedValue({ ...baseAccount, last_alert_sent_at: recentDate });
    const { checkAndSendLowBalanceAlert } = await import("@/lib/alert-service");
    await checkAndSendLowBalanceAlert(mockDb, 1, "user@example.com");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("TU-1-6 : après envoi réussi → last_alert_sent_at est mis à jour en DB", async () => {
    mockGetAccountById.mockResolvedValue({ ...baseAccount });
    const { checkAndSendLowBalanceAlert } = await import("@/lib/alert-service");
    await checkAndSendLowBalanceAlert(mockDb, 1, "user@example.com");
    expect(mockDbExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: "UPDATE accounts SET last_alert_sent_at = ? WHERE id = ?",
        args: expect.arrayContaining([1]),
      })
    );
  });

  it("TU-1-7 : si sendEmail échoue → la fonction ne throw pas", async () => {
    mockGetAccountById.mockResolvedValue({ ...baseAccount });
    mockSendEmail.mockRejectedValue(new Error("SMTP failed"));
    const { checkAndSendLowBalanceAlert } = await import("@/lib/alert-service");
    await expect(checkAndSendLowBalanceAlert(mockDb, 1, "user@example.com")).resolves.toBeUndefined();
  });
});
