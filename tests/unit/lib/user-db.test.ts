/**
 * TU-95-QA-1 à TU-95-QA-2 — STORY-095 QA
 * Tests QA : initUserSchema (user-db.ts)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

describe("initUserSchema (STORY-095 QA)", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = {
      execute: vi.fn().mockResolvedValue({}),
      executeMultiple: vi.fn().mockResolvedValue({}),
    } as unknown as Client;
  });

  it("TU-95-QA-1 : initUserSchema crée les tables de base et notifications", async () => {
    const { initUserSchema } = await import("@/lib/user-db");
    await initUserSchema(mockDb);

    // executeMultiple appelé pour le schéma de base
    const multiCalls = (mockDb.executeMultiple as ReturnType<typeof vi.fn>).mock.calls;
    expect(multiCalls.length).toBe(1);
    const baseSchema = multiCalls[0][0] as string;
    expect(baseSchema).toContain("CREATE TABLE IF NOT EXISTS accounts");
    expect(baseSchema).toContain("CREATE TABLE IF NOT EXISTS transactions");

    // execute appelé pour les migrations individuelles
    const calls = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(1);
    const sqlCalls = calls.map((c: unknown[]) => c[0] as string);
    const hasNotifications = sqlCalls.some(
      (sql: string) => typeof sql === "string" && sql.includes("notifications")
    );
    expect(hasNotifications).toBe(true);
  });

  it("TU-95-QA-2 : initUserSchema est idempotent — continue silencieusement si une migration échoue", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("duplicate column"))
      .mockResolvedValue({});

    const { initUserSchema } = await import("@/lib/user-db");
    await expect(initUserSchema(mockDb)).resolves.toBeUndefined();

    const calls = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(3);
  });
});
