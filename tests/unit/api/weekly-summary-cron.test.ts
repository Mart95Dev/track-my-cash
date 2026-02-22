import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
  getUserDb: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/queries", () => ({
  getSetting: vi.fn().mockResolvedValue(null),
  getWeeklySummaryData: vi.fn().mockResolvedValue({
    weekStart: "2026-02-16",
    weekEnd: "2026-02-22",
    totalExpenses: 1200,
    totalIncome: 2500,
    topCategories: [{ category: "Alimentation", amount: 400 }],
    budgetsOver: [],
    goalsProgress: [],
  }),
}));

vi.mock("@/lib/email-templates", () => ({
  renderWeeklyEmail: vi.fn().mockReturnValue("<html>weekly</html>"),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import type { NextRequest } from "next/server";
import { GET } from "@/app/api/cron/weekly-summary/route";
import * as dbModule from "@/lib/db";
import * as queriesModule from "@/lib/queries";
import * as emailModule from "@/lib/email";

const makeRequest = (authHeader?: string): NextRequest =>
  new Request("http://localhost/api/cron/weekly-summary", {
    method: "GET",
    headers: authHeader ? { Authorization: authHeader } : {},
  }) as unknown as NextRequest;

describe("GET /api/cron/weekly-summary (STORY-061)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";

    vi.mocked(dbModule.getDb).mockReturnValue({
      execute: vi.fn().mockResolvedValue({
        rows: [{ user_id: "u1", email: "user1@example.com", name: "Alice" }],
      }),
    } as never);

    vi.mocked(queriesModule.getSetting).mockResolvedValue(null);
  });

  it("TU-61-1 : sans header Authorization → 401 Unauthorized (AC-1)", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Unauthorized");
  });

  it("TU-61-2 : mauvais secret → 401 Unauthorized (AC-1)", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Unauthorized");
  });

  it("TU-61-3 : bon secret → retourne { processed, sent } (AC-2)", async () => {
    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { processed: number; sent: number };
    expect(body).toHaveProperty("processed");
    expect(body).toHaveProperty("sent");
    expect(typeof body.processed).toBe("number");
    expect(typeof body.sent).toBe("number");
    expect(body.processed).toBe(1);
    expect(body.sent).toBe(1);
  });

  it("TU-61-4 : setting 'weekly_summary_email' = 'false' → email non envoyé (AC-3)", async () => {
    vi.mocked(queriesModule.getSetting).mockResolvedValue("false");

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { processed: number; sent: number };
    expect(body.sent).toBe(0);
    expect(emailModule.sendEmail).not.toHaveBeenCalled();
  });
});
