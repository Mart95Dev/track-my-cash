import { describe, it, expect, vi } from "vitest";
import type { Client, ResultSet } from "@libsql/client";
import { getWeeklySummaryData } from "@/lib/queries";

function makeDb(rows: Record<string, unknown>[][]): Partial<Client> {
  let callIndex = 0;
  return {
    execute: vi.fn().mockImplementation(() => {
      const result: ResultSet = {
        rows: (rows[callIndex] ?? []) as ResultSet["rows"],
        columns: [],
        columnTypes: [],
        rowsAffected: 0,
        lastInsertRowid: undefined,
        toJSON: () => "{}",
      };
      callIndex++;
      return Promise.resolve(result);
    }),
  };
}

const WEEK_START = "2026-02-16";
const WEEK_END = "2026-02-22";

describe("getWeeklySummaryData (STORY-061, AC-4)", () => {
  it("TU-61-10 : retourne les totaux revenus et dépenses de la semaine", async () => {
    const db = makeDb([
      [{ total_income: 1200, total_expenses: 450 }],
      [],
      [],
      [],
    ]);

    const data = await getWeeklySummaryData(db as Client, WEEK_START, WEEK_END);
    expect(data.totalIncome).toBe(1200);
    expect(data.totalExpenses).toBe(450);
  });

  it("TU-61-11 : retourne le top 3 catégories de dépenses", async () => {
    const db = makeDb([
      [{ total_income: 0, total_expenses: 600 }],
      [
        { category: "Alimentation", amount: 250 },
        { category: "Transport", amount: 200 },
        { category: "Loisirs", amount: 150 },
      ],
      [],
      [],
    ]);

    const data = await getWeeklySummaryData(db as Client, WEEK_START, WEEK_END);
    expect(data.topCategories).toHaveLength(3);
    expect(data.topCategories[0].category).toBe("Alimentation");
    expect(data.topCategories[0].amount).toBe(250);
  });

  it("TU-61-12 : top catégories vide si pas de transactions", async () => {
    const db = makeDb([[{ total_income: 0, total_expenses: 0 }], [], [], []]);

    const data = await getWeeklySummaryData(db as Client, WEEK_START, WEEK_END);
    expect(data.topCategories).toHaveLength(0);
  });

  it("TU-61-13 : totaux à 0 si aucune ligne retournée par la DB", async () => {
    const db = makeDb([[], [], [], []]);

    const data = await getWeeklySummaryData(db as Client, WEEK_START, WEEK_END);
    expect(data.totalIncome).toBe(0);
    expect(data.totalExpenses).toBe(0);
  });

  it("TU-61-14 : accepte un accountId optionnel sans erreur", async () => {
    const db = makeDb([
      [{ total_income: 500, total_expenses: 200 }],
      [],
      [],
      [],
    ]);

    await expect(
      getWeeklySummaryData(db as Client, WEEK_START, WEEK_END, 42)
    ).resolves.toBeDefined();
  });
});
