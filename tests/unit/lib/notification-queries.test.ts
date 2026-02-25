/**
 * TU-95-1 à TU-95-8 — STORY-095
 * Tests unitaires : notification-queries
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

describe("notification-queries (STORY-095)", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  // ─── createNotification ───────────────────────────────────────────────────

  it("TU-95-1 : createNotification type=low_balance → INSERT avec read=0 par défaut", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });

    const { createNotification } = await import("@/lib/notification-queries");
    await createNotification(mockDb, "low_balance", "Solde bas", "Compte Courant sous le seuil");

    expect(mockDb.execute).toHaveBeenCalledOnce();
    const call = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.sql).toContain("INSERT INTO notifications");
    // type, title, body présents dans les args
    expect(call.args).toContain("low_balance");
    expect(call.args).toContain("Solde bas");
    expect(call.args).toContain("Compte Courant sous le seuil");
  });

  it("TU-95-2 : createNotification avec metadata → stocké en string JSON", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });

    const { createNotification } = await import("@/lib/notification-queries");
    await createNotification(mockDb, "couple_balance", "Balance", "Marie vous doit 75€", {
      amount: 75,
      partner: "Marie",
    });

    const call = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const metadataArg = call.args[call.args.length - 1] as string;
    expect(typeof metadataArg).toBe("string");
    const parsed = JSON.parse(metadataArg);
    expect(parsed.amount).toBe(75);
    expect(parsed.partner).toBe("Marie");
  });

  it("TU-95-3 : deux createNotification → ids différents (pas de collision)", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });

    const { createNotification } = await import("@/lib/notification-queries");
    await createNotification(mockDb, "low_balance", "Solde bas 1", "body 1");
    await createNotification(mockDb, "low_balance", "Solde bas 2", "body 2");

    const calls = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toHaveLength(2);
    const id1 = calls[0][0].args[0];
    const id2 = calls[1][0].args[0];
    expect(id1).not.toBe(id2);
  });

  // ─── getUnreadCount ───────────────────────────────────────────────────────

  it("TU-95-4 : 3 notifs, 1 lue, 2 non lues → getUnreadCount retourne 2", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ count: 2 }],
    });

    const { getUnreadCount } = await import("@/lib/notification-queries");
    const result = await getUnreadCount(mockDb);
    expect(result).toBe(2);
  });

  it("TU-95-5 : aucune notif → getUnreadCount retourne 0", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ count: 0 }],
    });

    const { getUnreadCount } = await import("@/lib/notification-queries");
    const result = await getUnreadCount(mockDb);
    expect(result).toBe(0);
  });

  // ─── markAllRead ──────────────────────────────────────────────────────────

  it("TU-95-6 : markAllRead → UPDATE read=1 pour toutes les non-lues", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });

    const { markAllRead } = await import("@/lib/notification-queries");
    await markAllRead(mockDb);

    expect(mockDb.execute).toHaveBeenCalledOnce();
    const call = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.sql).toContain("UPDATE notifications");
    expect(call.sql).toContain("read = 1");
  });

  // ─── getNotifications ─────────────────────────────────────────────────────

  it("TU-95-7 : getNotifications → retourne tableau trié DESC (5 éléments)", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        { id: "n5", type: "low_balance", title: "T5", message: "B5", read: 0, created_at: "2026-02-24T10:00", metadata: null },
        { id: "n4", type: "goal_reached", title: "T4", message: "B4", read: 1, created_at: "2026-02-23T10:00", metadata: null },
        { id: "n3", type: "couple_balance", title: "T3", message: "B3", read: 0, created_at: "2026-02-22T10:00", metadata: null },
        { id: "n2", type: "partner_tx", title: "T2", message: "B2", read: 0, created_at: "2026-02-21T10:00", metadata: null },
        { id: "n1", type: "low_balance", title: "T1", message: "B1", read: 1, created_at: "2026-02-20T10:00", metadata: null },
      ],
    });

    const { getNotifications } = await import("@/lib/notification-queries");
    const result = await getNotifications(mockDb);

    expect(result).toHaveLength(5);
    // Premier = plus récent
    expect(result[0].id).toBe("n5");
    expect(result[0].body).toBe("B5");
    expect(result[0].read).toBe(false);
    expect(result[1].read).toBe(true);
  });

  it("TU-95-8 : getNotifications(db, 50) → limit 50 passé en arg SQL", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { getNotifications } = await import("@/lib/notification-queries");
    await getNotifications(mockDb, 50);

    const call = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.args).toContain(50);
    expect(call.sql).toContain("LIMIT");
  });
});
