import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const REQUEST_25_DAYS_AGO = {
  user_id: "user-1",
  requested_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  scheduled_delete_at: new Date(Date.now() + 5 * 86400000).toISOString(),
};

const REQUEST_OVERDUE = {
  user_id: "user-2",
  requested_at: new Date(Date.now() - 31 * 86400000).toISOString(),
  scheduled_delete_at: new Date(Date.now() - 1 * 86400000).toISOString(),
};

describe("deletion-utils — isEligibleForReminder", () => {
  it("TU-55-3 : J+25 atteint, notified_at null → true", async () => {
    const { isEligibleForReminder } = await import("@/lib/deletion-utils");
    expect(isEligibleForReminder(REQUEST_25_DAYS_AGO)).toBe(true);
  });

  it("J+25 atteint, mais déjà notifié → false", async () => {
    const { isEligibleForReminder } = await import("@/lib/deletion-utils");
    const alreadyNotified = {
      ...REQUEST_25_DAYS_AGO,
      notified_at: new Date().toISOString(),
    };
    expect(isEligibleForReminder(alreadyNotified)).toBe(false);
  });
});

describe("deletion-utils — isEligibleForDeletion", () => {
  it("TU-55-4 : scheduled_delete_at passé → true", async () => {
    const { isEligibleForDeletion } = await import("@/lib/deletion-utils");
    expect(isEligibleForDeletion(REQUEST_OVERDUE)).toBe(true);
  });

  it("TU-55-5 : scheduled_delete_at futur → false", async () => {
    const { isEligibleForDeletion } = await import("@/lib/deletion-utils");
    expect(isEligibleForDeletion(REQUEST_25_DAYS_AGO)).toBe(false);
  });
});

describe("cron deletion-reminder — autorisation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      }),
    }));
    vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
    vi.mock("@/lib/email-templates", () => ({
      renderDeletionReminderEmail: vi.fn().mockReturnValue("<html/>"),
    }));
    process.env.CRON_SECRET = "test-secret";
  });

  it("TU-55-1 : GET sans Authorization → 401", async () => {
    const { GET } = await import("@/app/api/cron/deletion-reminder/route");
    const req = new Request("http://localhost/api/cron/deletion-reminder") as unknown as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe("cron delete-accounts — autorisation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      }),
      getUserDb: vi.fn().mockResolvedValue({
        executeMultiple: vi.fn().mockResolvedValue(undefined),
        execute: vi.fn().mockResolvedValue({ rows: [] }),
      }),
    }));
    process.env.CRON_SECRET = "test-secret";
  });

  it("TU-55-2 : GET sans Authorization → 401", async () => {
    const { GET } = await import("@/app/api/cron/delete-accounts/route");
    const req = new Request("http://localhost/api/cron/delete-accounts") as unknown as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
