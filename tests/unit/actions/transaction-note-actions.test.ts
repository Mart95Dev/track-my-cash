import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-123"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockDb = {};
vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue(mockDb),
  getDb: vi.fn().mockReturnValue({}),
}));

const mockUpdateNote = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/queries", () => ({
  updateTransactionNote: mockUpdateNote,
}));

describe("updateTransactionNoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateNote.mockResolvedValue(undefined);
  });

  it("TU-66-1 : note non vide → appelle updateTransactionNote avec la note", async () => {
    const { updateTransactionNoteAction } = await import(
      "@/app/actions/transaction-actions"
    );
    const result = await updateTransactionNoteAction(42, "Remboursement Jean");
    expect(result.success).toBe(true);
    expect(mockUpdateNote).toHaveBeenCalledWith(mockDb, 42, "Remboursement Jean");
  });

  it("TU-66-2 : note vide (\"\") → appelle updateTransactionNote avec null", async () => {
    const { updateTransactionNoteAction } = await import(
      "@/app/actions/transaction-actions"
    );
    await updateTransactionNoteAction(42, "");
    expect(mockUpdateNote).toHaveBeenCalledWith(mockDb, 42, null);
  });

  it("TU-66-3 : note espace uniquement → appelle updateTransactionNote avec null", async () => {
    const { updateTransactionNoteAction } = await import(
      "@/app/actions/transaction-actions"
    );
    await updateTransactionNoteAction(42, "   ");
    expect(mockUpdateNote).toHaveBeenCalledWith(mockDb, 42, null);
  });
});

describe("generateTransactionsCsv avec note", () => {
  it("TU-66-4 : CSV inclut colonne Note", async () => {
    const { generateTransactionsCsv } = await import("@/lib/csv-export");
    const rows = [
      {
        date: "2026-01-15",
        description: "Netflix",
        category: "Abonnement",
        subcategory: "netflix",
        type: "expense" as const,
        amount: 13.99,
        currency: "EUR",
        account_name: "Courant",
        note: "Abonnement annuel",
      },
    ];
    const csv = generateTransactionsCsv(rows);
    expect(csv).toContain("Note");
    expect(csv).toContain("Abonnement annuel");
  });

  it("TU-66-5 : note null → cellule vide dans le CSV", async () => {
    const { generateTransactionsCsv } = await import("@/lib/csv-export");
    const rows = [
      {
        date: "2026-01-15",
        description: "Courses",
        category: "Alimentation",
        subcategory: null,
        type: "expense" as const,
        amount: 45.0,
        currency: "EUR",
        account_name: "Courant",
        note: null,
      },
    ];
    const csv = generateTransactionsCsv(rows);
    // La dernière colonne de la ligne de données doit être vide
    const dataLine = csv.split("\n")[1];
    expect(dataLine).toBeDefined();
    expect(dataLine).toMatch(/,$/); // finit par virgule (champ vide en dernier)
  });
});
