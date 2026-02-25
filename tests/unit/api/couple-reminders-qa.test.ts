/**
 * QA-104-R — STORY-104 (QA Agent)
 * Tests complémentaires : GET /api/cron/couple-reminders
 *
 * GAPs couverts :
 *   QA-104-R1 : idempotence — pas de renvoi si reminder_couple_1d_sent=1 (AC-4)
 *   QA-104-R2 : palier J+3 envoyé quand daysSinceCreation >= 3, 3d_sent=0 (AC-2)
 *   QA-104-R3 : palier J+7 envoyé quand daysSinceCreation >= 7, 7d_sent=0 (AC-3)
 *   QA-104-R4 : priorité J+7 > J+3 > J+1 — seul J+7 envoyé si tous les paliers atteints (logique métier)
 *   QA-104-R5 : pas d'email si daysSinceCreation < 1 (palier non atteint) (AC-1)
 *   QA-104-R6 : idempotence J+7 — pas de renvoi si reminder_couple_7d_sent=1 (AC-4)
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
import * as emailTemplates from "@/lib/email-templates";

const makeRequest = (authHeader?: string): NextRequest => {
  const headers: Record<string, string> = {};
  if (authHeader !== undefined) headers["Authorization"] = authHeader;
  return new Request("http://localhost/api/cron/couple-reminders", {
    headers,
  }) as unknown as NextRequest;
};

/** Helper : simule 1 utilisateur solo avec les paramètres fournis */
const setupSingleUser = (
  mockExecute: ReturnType<typeof vi.fn>,
  opts: {
    createdAt: number;
    reminder_couple_1d_sent?: number;
    reminder_couple_3d_sent?: number;
    reminder_couple_7d_sent?: number;
    memberCount?: number;
  }
) => {
  mockExecute.mockResolvedValueOnce({
    rows: [
      {
        user_id: "u-qa-1",
        email: "qa@test.com",
        name: "QA User",
        invite_code: "QACODE1",
        couple_id: "c-qa-1",
        created_at: opts.createdAt,
        reminder_couple_1d_sent: opts.reminder_couple_1d_sent ?? 0,
        reminder_couple_3d_sent: opts.reminder_couple_3d_sent ?? 0,
        reminder_couple_7d_sent: opts.reminder_couple_7d_sent ?? 0,
      },
    ],
  });
  // COUNT membres
  mockExecute.mockResolvedValueOnce({ rows: [{ count: opts.memberCount ?? 1 }] });
  // UPDATE (utilisé seulement si un email est envoyé)
  mockExecute.mockResolvedValue({ rows: [] });
};

describe("QA GET /api/cron/couple-reminders — GAPs STORY-104", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    vi.mocked(dbModule.getDb).mockReturnValue({
      execute: mockExecute,
    } as unknown as Client);
    mockExecute.mockResolvedValue({ rows: [] });
  });

  // ─── QA-104-R1 : Idempotence palier J+1 ──────────────────────────────────
  it("QA-104-R1 : aucun email si reminder_couple_1d_sent=1 et daysSinceCreation=2 (AC-4)", async () => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = now - 2 * 86400; // J+2 atteint → palier J+1 normalement éligible

    setupSingleUser(mockExecute, {
      createdAt,
      reminder_couple_1d_sent: 1, // déjà envoyé
      reminder_couple_3d_sent: 0,
      reminder_couple_7d_sent: 0,
    });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    // J+3 pas encore atteint (2 < 3), J+1 déjà envoyé → aucun email
    expect(body.sent).toBe(0);
    expect(vi.mocked(emailModule.sendEmail)).not.toHaveBeenCalled();
  });

  // ─── QA-104-R2 : Palier J+3 ──────────────────────────────────────────────
  it("QA-104-R2 : email J+3 envoyé quand daysSinceCreation=4 et 3d_sent=0 (AC-2)", async () => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = now - 4 * 86400; // J+4 → palier J+3 atteint, J+7 pas encore

    setupSingleUser(mockExecute, {
      createdAt,
      reminder_couple_1d_sent: 1, // J+1 déjà envoyé
      reminder_couple_3d_sent: 0, // J+3 pas encore envoyé
      reminder_couple_7d_sent: 0,
    });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(1);
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledOnce();
    // Vérifie que le palier 3 est passé à renderCoupleReminderEmail
    expect(vi.mocked(emailTemplates.renderCoupleReminderEmail)).toHaveBeenCalledWith(
      "QACODE1",
      3
    );
  });

  // ─── QA-104-R3 : Palier J+7 ──────────────────────────────────────────────
  it("QA-104-R3 : email J+7 envoyé quand daysSinceCreation=8 et 7d_sent=0 (AC-3)", async () => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = now - 8 * 86400; // J+8 → tous les paliers atteints

    setupSingleUser(mockExecute, {
      createdAt,
      reminder_couple_1d_sent: 1, // J+1 déjà envoyé
      reminder_couple_3d_sent: 1, // J+3 déjà envoyé
      reminder_couple_7d_sent: 0, // J+7 pas encore
    });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(1);
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledOnce();
    expect(vi.mocked(emailTemplates.renderCoupleReminderEmail)).toHaveBeenCalledWith(
      "QACODE1",
      7
    );
  });

  // ─── QA-104-R4 : Priorité J+7 > J+3 > J+1 ───────────────────────────────
  it("QA-104-R4 : seul J+7 envoyé quand J+1/J+3/J+7 tous atteints et aucun flag posé (priorité)", async () => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = now - 10 * 86400; // J+10 → tous les paliers atteints

    setupSingleUser(mockExecute, {
      createdAt,
      reminder_couple_1d_sent: 0,
      reminder_couple_3d_sent: 0,
      reminder_couple_7d_sent: 0,
    });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    // Un seul email envoyé (le plus élevé : J+7)
    expect(body.sent).toBe(1);
    expect(vi.mocked(emailModule.sendEmail)).toHaveBeenCalledOnce();
    expect(vi.mocked(emailTemplates.renderCoupleReminderEmail)).toHaveBeenCalledWith(
      "QACODE1",
      7
    );
    // Vérifie que les paliers inférieurs NE sont PAS appelés
    expect(vi.mocked(emailTemplates.renderCoupleReminderEmail)).not.toHaveBeenCalledWith(
      expect.any(String),
      3
    );
    expect(vi.mocked(emailTemplates.renderCoupleReminderEmail)).not.toHaveBeenCalledWith(
      expect.any(String),
      1
    );
  });

  // ─── QA-104-R5 : Pas d'email si palier non atteint ───────────────────────
  it("QA-104-R5 : aucun email si daysSinceCreation < 1 (palier J+1 non atteint) (AC-1)", async () => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = now - 43200; // 12 heures — palier J+1 non atteint

    setupSingleUser(mockExecute, {
      createdAt,
      reminder_couple_1d_sent: 0,
      reminder_couple_3d_sent: 0,
      reminder_couple_7d_sent: 0,
    });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(0);
    expect(vi.mocked(emailModule.sendEmail)).not.toHaveBeenCalled();
  });

  // ─── QA-104-R6 : Idempotence tous paliers envoyés ────────────────────────
  it("QA-104-R6 : aucun email si tous les flags sont déjà posés à 1 (AC-4)", async () => {
    const now = Math.floor(Date.now() / 1000);
    const createdAt = now - 10 * 86400; // J+10 → tous les paliers atteints mais déjà envoyés

    setupSingleUser(mockExecute, {
      createdAt,
      reminder_couple_1d_sent: 1,
      reminder_couple_3d_sent: 1,
      reminder_couple_7d_sent: 1,
    });

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number };
    expect(body.sent).toBe(0);
    expect(vi.mocked(emailModule.sendEmail)).not.toHaveBeenCalled();
  });
});
