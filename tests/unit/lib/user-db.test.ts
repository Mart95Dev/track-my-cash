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
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-95-QA-1 : initUserSchema appelle execute avec CREATE TABLE IF NOT EXISTS notifications", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const { initUserSchema } = await import("@/lib/user-db");
    await initUserSchema(mockDb);

    const calls = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(1);

    const sqlCalls = calls.map((c: unknown[]) => c[0] as string);
    const hasCreateTable = sqlCalls.some(
      (sql: string) =>
        typeof sql === "string" &&
        sql.includes("CREATE TABLE IF NOT EXISTS notifications")
    );
    expect(hasCreateTable).toBe(true);
  });

  it("TU-95-QA-2 : initUserSchema est idempotent — continue silencieusement si une migration échoue", async () => {
    // La première migration réussit, la suivante échoue (ex: colonne déjà existante)
    (mockDb.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("duplicate column"))
      .mockResolvedValue({});

    const { initUserSchema } = await import("@/lib/user-db");
    // Ne doit pas lever d'exception
    await expect(initUserSchema(mockDb)).resolves.toBeUndefined();

    // Toutes les migrations ont été tentées malgré l'erreur intermédiaire
    const calls = (mockDb.execute as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(3);
  });
});
