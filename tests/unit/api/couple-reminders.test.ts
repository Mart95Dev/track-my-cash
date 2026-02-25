/**
 * TU-104-5 à TU-104-7 — STORY-104
 * Tests unitaires : GET /api/cron/couple-reminders
 */
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
  renderCoupleReminderEmail: vi.fn().mockReturnValue("<html>couple-reminder</html>"),
}));

import { GET } from "@/app/api/cron/couple-reminders/route";
import * as dbModule from "@/lib/db";
import * as emailModule from "@/lib/email";

const makeRequest = (authHeader?: string): NextRequest => {
  const headers: Record<string, string> = {};
  if (authHeader !== undefined) headers["Authorization"] = authHeader;
  return new Request("http://localhost/api/cron/couple-reminders", {
    headers,
  }) as unknown as NextRequest;
};

describe("GET /api/cron/couple-reminders (STORY-104)", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    vi.mocked(dbModule.getDb).mockReturnValue({
      execute: mockExecute,
    } as unknown as Client);
    // Par défaut : aucun utilisateur à notifier
    mockExecute.mockResolvedValue({ rows: [] });
  });

  it("TU-104-5 : retourne 401 sans Authorization header (AC-1)", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("TU-104-6 : retourne 401 avec un mauvais token (AC-1)", async () => {
    const res = await GET(makeRequest("Bearer wrong-token"));
    expect(res.status).toBe(401);
  });

  it("TU-104-7 : retourne 200 avec sent=0 si aucun utilisateur à notifier (AC-6)", async () => {
    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(0);
  });

  it("TU-104-8 : retourne 200 et sent=1 quand 1 user solo J+1 non notifié (AC-3, AC-5, AC-6)", async () => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = now - 2 * 86400; // Il y a 2 jours → palier J+1 et J+3 atteints

    // SELECT users → 1 user
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          user_id: "u-solo-1",
          email: "solo@test.com",
          name: "Solo",
          invite_code: "INV123",
          couple_id: "c-1",
          created_at: createdAt,
          reminder_couple_1d_sent: 0,
          reminder_couple_3d_sent: 0,
          reminder_couple_7d_sent: 0,
        },
      ],
    });
    // COUNT members → 1 seul membre
    mockExecute.mockResolvedValueOnce({ rows: [{ count: 1 }] });
    // UPDATE → success
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(1);
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledOnce();
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledWith(
      expect.objectContaining({ to: "solo@test.com" })
    );
  });

  it("TU-104-9 : ne notifie pas si couple avec 2 membres (AC-2)", async () => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = now - 2 * 86400;

    // SELECT users → 1 user
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          user_id: "u-complete-1",
          email: "complete@test.com",
          name: "Complete",
          invite_code: "FULL99",
          couple_id: "c-2",
          created_at: createdAt,
          reminder_couple_1d_sent: 0,
          reminder_couple_3d_sent: 0,
          reminder_couple_7d_sent: 0,
        },
      ],
    });
    // COUNT members → 2 membres (couple complet)
    mockExecute.mockResolvedValueOnce({ rows: [{ count: 2 }] });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(0);
    expect(vi.mocked(emailModule.sendEmail)).not.toHaveBeenCalled();
  });
});
