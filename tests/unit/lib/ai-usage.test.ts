import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

const MONTH_NOW = new Date().toISOString().slice(0, 7);

describe("ai-usage — getAiUsageCount", () => {
  let mockDb: Client;

  beforeEach(() => {
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-53-1 : aucun enregistrement ce mois → retourne 0", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });

    const { getAiUsageCount } = await import("@/lib/ai-usage");
    const count = await getAiUsageCount(mockDb, "user-1", MONTH_NOW);

    expect(count).toBe(0);
  });

  it("TU-53-2 : enregistrement avec count = 7 → retourne 7", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [{ count: 7 }],
    });

    const { getAiUsageCount } = await import("@/lib/ai-usage");
    const count = await getAiUsageCount(mockDb, "user-1", MONTH_NOW);

    expect(count).toBe(7);
  });
});

describe("ai-usage — checkAiLimit", () => {
  it("TU-53-3 : plan pro, count = 9 → allowed: true", async () => {
    const { checkAiLimit } = await import("@/lib/ai-usage");
    const result = checkAiLimit("pro", 9);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("TU-53-4 : plan pro, count = 10 → quota atteint, allowed: false", async () => {
    const { checkAiLimit } = await import("@/lib/ai-usage");
    const result = checkAiLimit("pro", 10);

    expect(result.allowed).toBe(false);
    expect(typeof result.reason).toBe("string");
    expect((result.reason ?? "").length).toBeGreaterThan(0);
  });

  it("TU-53-5 : plan premium, count = 999 → toujours allowed: true", async () => {
    const { checkAiLimit } = await import("@/lib/ai-usage");
    const result = checkAiLimit("premium", 999);

    expect(result.allowed).toBe(true);
  });
});
