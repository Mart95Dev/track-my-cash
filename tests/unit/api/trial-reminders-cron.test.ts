import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import type { Client } from "@libsql/client";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  renderEmailBase: vi.fn(),
}));

vi.mock("@/lib/email-templates", () => ({
  renderTrialReminderEmail: vi.fn().mockReturnValue("<html>test</html>"),
}));

import { GET } from "@/app/api/cron/trial-reminders/route";
import * as dbModule from "@/lib/db";
import * as emailModule from "@/lib/email";

const makeRequest = (authHeader?: string): NextRequest => {
  const headers: Record<string, string> = {};
  if (authHeader !== undefined) headers["Authorization"] = authHeader;
  return new Request("http://localhost/api/cron/trial-reminders", {
    headers,
  }) as unknown as NextRequest;
};

describe("GET /api/cron/trial-reminders (STORY-080)", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    vi.mocked(dbModule.getDb).mockReturnValue({
      execute: mockExecute,
    } as unknown as Client);
    mockExecute.mockResolvedValue({ rows: [] });
  });

  it("TU-80-5 : retourne 401 sans Authorization header (AC-2)", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("TU-80-6 : retourne 401 avec mauvais CRON_SECRET (AC-2)", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("TU-80-7 : retourne { sent: 0 } si aucun trial dans la fenêtre (AC-7)", async () => {
    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(0);
  });

  it("TU-80-8 : le SQL référence reminder_3d_sent et reminder_1d_sent (AC-1)", async () => {
    await GET(makeRequest("Bearer test-secret"));
    const allSql = mockExecute.mock.calls
      .map((c: unknown[]) => String(c[0]))
      .join(" ");
    expect(allSql).toContain("reminder_3d_sent");
    expect(allSql).toContain("reminder_1d_sent");
  });

  it("TU-80-13 : cron envoie 1 email J-3 et retourne sent=1 (AC-3, AC-7)", async () => {
    // SELECT J-3 → 1 user ; UPDATE → défaut ; SELECT J-1 → défaut (vide)
    mockExecute.mockResolvedValueOnce({
      rows: [{ user_id: "u-1", email: "alice@test.com", name: "Alice" }],
    });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(1);
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledOnce();
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledWith(
      expect.objectContaining({ to: "alice@test.com" })
    );
    // Le flag doit être mis à jour (appel avec { sql, args })
    const updateCall = mockExecute.mock.calls.find((c: unknown[]) =>
      JSON.stringify(c[0]).includes("reminder_3d_sent = 1")
    );
    expect(updateCall).toBeDefined();
  });

  it("TU-80-14 : cron envoie 1 email J-1 et retourne sent=1 (AC-4, AC-7)", async () => {
    // SELECT J-3 → vide (défaut) ; SELECT J-1 → 1 user
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
      rows: [{ user_id: "u-2", email: "bob@test.com", name: "Bob" }],
    });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(1);
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledOnce();
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledWith(
      expect.objectContaining({ to: "bob@test.com" })
    );
    // Le flag doit être mis à jour (appel avec { sql, args })
    const updateCall = mockExecute.mock.calls.find((c: unknown[]) =>
      JSON.stringify(c[0]).includes("reminder_1d_sent = 1")
    );
    expect(updateCall).toBeDefined();
  });
});
