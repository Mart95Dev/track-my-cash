/**
 * INT02 — AC-2 : writeAdminLog
 * Vérifie que la fonction insère correctement dans admin_logs
 */

import { describe, it, expect, vi } from "vitest";
import type { Client } from "@libsql/client";
import { writeAdminLog } from "@/lib/admin-logger";

function makeMockDb(): Client {
  return {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  } as unknown as Client;
}

describe("INT02 — AC-2 : writeAdminLog — insertion dans admin_logs", () => {
  it("TINT02-1 : insère une row avec les champs type, user_id, message, payload", async () => {
    const db = makeMockDb();
    await writeAdminLog(db, "trial_expired", "user123", "Trial expiré", { planId: "free" });
    const call = (db.execute as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      sql: string;
      args: unknown[];
    };
    expect(call.sql).toContain("INSERT INTO admin_logs");
    expect(call.args).toContain("trial_expired");
    expect(call.args).toContain("user123");
    expect(call.args).toContain("Trial expiré");
  });

  it("TINT02-2 : payload est null si non fourni", async () => {
    const db = makeMockDb();
    await writeAdminLog(db, "test_event", "u1", "Test message");
    const call = (db.execute as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      args: unknown[];
    };
    // Le dernier arg est payloadStr (index 3)
    const payloadArg = call.args[call.args.length - 1];
    expect(payloadArg).toBeNull();
  });

  it("TINT02-3 : payload est JSON stringifié si fourni", async () => {
    const db = makeMockDb();
    const payload = { planId: "pro", stripeSubscriptionId: "sub_123" };
    await writeAdminLog(db, "subscription_activated", "u2", "Activé", payload);
    const call = (db.execute as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      args: unknown[];
    };
    const payloadArg = call.args[call.args.length - 1];
    expect(payloadArg).toBe(JSON.stringify(payload));
  });

  it("TINT02-4 : userId peut être null", async () => {
    const db = makeMockDb();
    await writeAdminLog(db, "system_event", null, "Événement système");
    const call = (db.execute as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      args: unknown[];
    };
    expect(call.args).toContain(null);
  });

  it("TINT02-5 : le SQL référence les colonnes type, user_id, message, payload", async () => {
    const db = makeMockDb();
    await writeAdminLog(db, "type_test", "u3", "msg");
    const call = (db.execute as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      sql: string;
    };
    expect(call.sql).toContain("admin_logs");
    expect(call.sql).toContain("type");
    expect(call.sql).toContain("user_id");
    expect(call.sql).toContain("message");
    expect(call.sql).toContain("payload");
  });
});
