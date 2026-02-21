import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkDuplicates, generateImportHash, importAllData } from "@/lib/queries";
import type { Client } from "@libsql/client";

// STORY-008 — checkDuplicates : WHERE IN (1 requête)
// STORY-006 — importAllData : restauration complète (subcategory + reconciled)

// ============ HELPERS ============

function makeDb(overrides: Partial<Client> = {}): Client {
  return {
    execute: vi.fn().mockResolvedValue({ rows: [], columns: [] }),
    batch: vi.fn().mockResolvedValue([]),
    transaction: vi.fn(),
    executeMultiple: vi.fn(),
    sync: vi.fn(),
    close: vi.fn(),
    closed: false,
    protocol: "http",
    ...overrides,
  } as unknown as Client;
}

// ============ generateImportHash ============

describe("generateImportHash", () => {
  it("AC-1 : même entrée → même hash", () => {
    const h1 = generateImportHash("2026-02-21", "Achat supermarché", 45.6);
    const h2 = generateImportHash("2026-02-21", "Achat supermarché", 45.6);
    expect(h1).toBe(h2);
  });

  it("AC-2 : entrées différentes → hashes différents", () => {
    const h1 = generateImportHash("2026-02-21", "Achat supermarché", 45.6);
    const h2 = generateImportHash("2026-02-21", "Achat supermarché", 46.0);
    expect(h1).not.toBe(h2);
  });

  it("AC-3 : insensible à la casse de la description", () => {
    const h1 = generateImportHash("2026-02-21", "ACHAT SUPERMARCHE", 45.6);
    const h2 = generateImportHash("2026-02-21", "achat supermarche", 45.6);
    expect(h1).toBe(h2);
  });

  it("AC-4 : hash est un MD5 de 32 caractères", () => {
    const h = generateImportHash("2026-01-01", "test", 10);
    expect(h).toHaveLength(32);
    expect(h).toMatch(/^[a-f0-9]{32}$/);
  });
});

// ============ checkDuplicates (STORY-008) ============

describe("checkDuplicates (STORY-008)", () => {
  it("AC-1 : tableau vide → Set vide sans appel DB", async () => {
    const db = makeDb();
    const result = await checkDuplicates(db, []);
    expect(result.size).toBe(0);
    expect(db.execute).not.toHaveBeenCalled();
  });

  it("AC-2 : 1 hash trouvé → retourne Set avec ce hash", async () => {
    const db = makeDb({
      execute: vi.fn().mockResolvedValue({
        rows: [{ import_hash: "abc123" }],
        columns: ["import_hash"],
      }),
    });
    const result = await checkDuplicates(db, ["abc123"]);
    expect(result.has("abc123")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("AC-3 : N hashes → 1 seule requête SQL (pas N+1)", async () => {
    const hashes = ["h1", "h2", "h3", "h4", "h5"];
    const db = makeDb({
      execute: vi.fn().mockResolvedValue({
        rows: [{ import_hash: "h2" }, { import_hash: "h4" }],
        columns: ["import_hash"],
      }),
    });
    const result = await checkDuplicates(db, hashes);
    // UNE seule requête
    expect(db.execute).toHaveBeenCalledTimes(1);
    // Bons doublons retournés
    expect(result.has("h2")).toBe(true);
    expect(result.has("h4")).toBe(true);
    expect(result.has("h1")).toBe(false);
    expect(result.size).toBe(2);
  });

  it("AC-4 : la requête utilise IN avec N placeholders", async () => {
    const hashes = ["a", "b", "c"];
    const db = makeDb({
      execute: vi.fn().mockResolvedValue({ rows: [], columns: [] }),
    });
    await checkDuplicates(db, hashes);
    const callArg = (db.execute as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.sql).toContain("WHERE import_hash IN (?, ?, ?)");
    expect(callArg.args).toEqual(["a", "b", "c"]);
  });

  it("AC-5 : aucun doublon → retourne Set vide", async () => {
    const db = makeDb({
      execute: vi.fn().mockResolvedValue({ rows: [], columns: [] }),
    });
    const result = await checkDuplicates(db, ["h1", "h2"]);
    expect(result.size).toBe(0);
  });
});

// ============ importAllData (STORY-006) ============

describe("importAllData (STORY-006)", () => {
  const sampleData = {
    accounts: [
      {
        id: 1,
        name: "Compte Principal",
        initial_balance: 1000,
        balance_date: "2026-01-01",
        currency: "EUR",
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ],
    transactions: [
      {
        id: 1,
        account_id: 1,
        type: "expense",
        amount: 50,
        date: "2026-02-01",
        category: "Alimentation",
        subcategory: "carrefour",
        description: "Courses",
        import_hash: "hash123",
        reconciled: 1,
        created_at: "2026-02-01T00:00:00.000Z",
      },
    ],
    recurring: [],
  };

  it("AC-1 : appelle db.batch pour vider les tables", async () => {
    const db = makeDb();
    await importAllData(db, sampleData);
    expect(db.batch).toHaveBeenCalled();
    // Premier batch : DELETE
    const firstCall = (db.batch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(firstCall).toContain("DELETE FROM transactions");
    expect(firstCall).toContain("DELETE FROM accounts");
  });

  it("AC-2 : INSERT transactions inclut la colonne subcategory", async () => {
    const db = makeDb();
    await importAllData(db, sampleData);
    const calls = (db.batch as ReturnType<typeof vi.fn>).mock.calls;
    // Trouver le batch avec les transactions
    const txBatch = calls.find((c: unknown[][]) =>
      Array.isArray(c[0]) &&
      typeof (c[0] as {sql?: string}[])[0]?.sql === "string" &&
      (c[0] as {sql: string}[])[0].sql.includes("subcategory")
    );
    expect(txBatch).toBeDefined();
    const stmt = (txBatch![0] as {sql: string}[])[0];
    expect(stmt.sql).toContain("subcategory");
  });

  it("AC-3 : INSERT transactions inclut la colonne reconciled", async () => {
    const db = makeDb();
    await importAllData(db, sampleData);
    const calls = (db.batch as ReturnType<typeof vi.fn>).mock.calls;
    const txBatch = calls.find((c: unknown[][]) =>
      Array.isArray(c[0]) &&
      typeof (c[0] as {sql?: string}[])[0]?.sql === "string" &&
      (c[0] as {sql: string}[])[0].sql.includes("reconciled")
    );
    expect(txBatch).toBeDefined();
    const stmt = (txBatch![0] as {sql: string}[])[0];
    expect(stmt.sql).toContain("reconciled");
  });

  it("AC-4 : valeur subcategory est transmise dans les args", async () => {
    const db = makeDb();
    await importAllData(db, sampleData);
    const calls = (db.batch as ReturnType<typeof vi.fn>).mock.calls;
    const txBatch = calls.find((c: unknown[][]) =>
      Array.isArray(c[0]) &&
      typeof (c[0] as {sql?: string}[])[0]?.sql === "string" &&
      (c[0] as {sql: string}[])[0].sql.includes("subcategory")
    );
    const args = (txBatch![0] as {args: unknown[]}[])[0].args;
    expect(args).toContain("carrefour");
  });

  it("AC-5 : valeur reconciled=1 est transmise dans les args", async () => {
    const db = makeDb();
    await importAllData(db, sampleData);
    const calls = (db.batch as ReturnType<typeof vi.fn>).mock.calls;
    const txBatch = calls.find((c: unknown[][]) =>
      Array.isArray(c[0]) &&
      typeof (c[0] as {sql?: string}[])[0]?.sql === "string" &&
      (c[0] as {sql: string}[])[0].sql.includes("reconciled")
    );
    const args = (txBatch![0] as {args: unknown[]}[])[0].args;
    expect(args).toContain(1); // reconciled = 1
  });

  it("AC-6 : subcategory null quand absente dans les données source", async () => {
    const db = makeDb();
    const dataWithoutSubcat = {
      ...sampleData,
      transactions: [
        {
          ...sampleData.transactions[0],
          subcategory: undefined,
        },
      ],
    };
    await importAllData(db, dataWithoutSubcat as Parameters<typeof importAllData>[1]);
    const calls = (db.batch as ReturnType<typeof vi.fn>).mock.calls;
    const txBatch = calls.find((c: unknown[][]) =>
      Array.isArray(c[0]) &&
      typeof (c[0] as {sql?: string}[])[0]?.sql === "string" &&
      (c[0] as {sql: string}[])[0].sql.includes("subcategory")
    );
    const args = (txBatch![0] as {args: unknown[]}[])[0].args;
    // subcategory doit être null
    expect(args).toContain(null);
  });

  it("AC-7 : données vides → seul le DELETE est exécuté", async () => {
    const db = makeDb();
    await importAllData(db, { accounts: [], transactions: [], recurring: [] });
    // Seul 1 batch (les DELETEs)
    expect((db.batch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });
});
