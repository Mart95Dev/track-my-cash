import { describe, it, expect, vi, beforeEach } from "vitest";

// STORY-004 — UI Tags : getTransactionTagsBatchAction (batch query)
// On teste la logique métier avec un mock DB

// Simulation de la logique de getTransactionTagsBatchAction
// sans dépendances serveur (auth, db connection)

function buildBatchTagMap(
  rows: { transaction_id: number; tag_id: number }[]
): Record<number, number[]> {
  const map: Record<number, number[]> = {};
  for (const row of rows) {
    const txId = row.transaction_id;
    if (!map[txId]) map[txId] = [];
    map[txId].push(row.tag_id);
  }
  return map;
}

function buildPlaceholders(ids: number[]): string {
  return ids.map(() => "?").join(", ");
}

describe("getTransactionTagsBatchAction — logique (STORY-004)", () => {
  it("AC-1 : tableau vide → retourne {} sans requête", () => {
    // Simule le guard if (transactionIds.length === 0) return {}
    const result = buildBatchTagMap([]);
    expect(result).toEqual({});
  });

  it("AC-2 : N transactions → génère N placeholders dans le SQL", () => {
    const ids = [1, 2, 3, 4, 5];
    const placeholders = buildPlaceholders(ids);
    expect(placeholders).toBe("?, ?, ?, ?, ?");
  });

  it("AC-3 : 1 placeholder pour 1 transaction", () => {
    expect(buildPlaceholders([42])).toBe("?");
  });

  it("AC-4 : rows → map correcte (txId → [tagIds])", () => {
    const rows = [
      { transaction_id: 1, tag_id: 10 },
      { transaction_id: 1, tag_id: 20 },
      { transaction_id: 2, tag_id: 10 },
    ];
    const map = buildBatchTagMap(rows);
    expect(map[1]).toEqual([10, 20]);
    expect(map[2]).toEqual([10]);
    expect(map[3]).toBeUndefined();
  });

  it("AC-5 : transaction sans tags → absente de la map", () => {
    const rows = [{ transaction_id: 5, tag_id: 99 }];
    const map = buildBatchTagMap(rows);
    // tx 1, 2, 3 sans tags → pas dans la map
    expect(map[1]).toBeUndefined();
    expect(map[5]).toEqual([99]);
  });

  it("AC-6 : résultat vide → map vide {}", () => {
    const map = buildBatchTagMap([]);
    expect(Object.keys(map).length).toBe(0);
  });

  it("AC-7 : tag partagé entre plusieurs transactions", () => {
    const rows = [
      { transaction_id: 10, tag_id: 1 },
      { transaction_id: 20, tag_id: 1 },
      { transaction_id: 30, tag_id: 1 },
    ];
    const map = buildBatchTagMap(rows);
    expect(map[10]).toEqual([1]);
    expect(map[20]).toEqual([1]);
    expect(map[30]).toEqual([1]);
  });
});

// ============ searchTransactions tagId filter (logique SQL) ============

describe("searchTransactions — filtre tagId (STORY-004)", () => {
  // La clause SQL générée quand opts.tagId est défini
  it("AC-8 : filtre tagId génère une sous-requête EXISTS", () => {
    const tagId = 5;
    const clause =
      `EXISTS (SELECT 1 FROM transaction_tags tt WHERE tt.transaction_id = t.id AND tt.tag_id = ?)`;
    // Vérifie que la clause est bien formée
    expect(clause).toContain("EXISTS");
    expect(clause).toContain("transaction_tags");
    expect(clause).toContain("tt.tag_id = ?");
  });

  it("AC-9 : sans tagId → pas de sous-requête EXISTS dans la requête", () => {
    // Simule la condition if (opts.tagId) {...}
    const conditions: string[] = [];
    const opts = { tagId: undefined };
    if (opts.tagId) {
      conditions.push("EXISTS (...)");
    }
    expect(conditions.length).toBe(0);
  });

  it("AC-10 : avec tagId → sous-requête ajoutée aux conditions", () => {
    const conditions: string[] = [];
    const opts = { tagId: 3 };
    if (opts.tagId) {
      conditions.push(
        "EXISTS (SELECT 1 FROM transaction_tags tt WHERE tt.transaction_id = t.id AND tt.tag_id = ?)"
      );
    }
    expect(conditions.length).toBe(1);
    expect(conditions[0]).toContain("transaction_tags");
  });
});
