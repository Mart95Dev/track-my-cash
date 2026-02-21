import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-456"),
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/queries", () => ({
  getBudgets: vi.fn().mockResolvedValue([]),
  getBudgetStatus: vi.fn().mockResolvedValue([]),
  upsertBudget: vi.fn().mockResolvedValue(undefined),
  deleteBudget: vi.fn().mockResolvedValue(undefined),
}));

describe("budget-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-2-1 : upsertBudgetAction avec données valides → retourne { success: true }", async () => {
    const { upsertBudgetAction } = await import("@/app/actions/budget-actions");
    const result = await upsertBudgetAction(1, "Alimentation", 400, "monthly");
    expect(result).toEqual({ success: true });
  });

  it("TU-2-2 : upsertBudgetAction avec amountLimit = 0 → retourne { error }", async () => {
    const { upsertBudgetAction } = await import("@/app/actions/budget-actions");
    const result = await upsertBudgetAction(1, "Alimentation", 0, "monthly");
    expect((result as { error: string }).error).toBeDefined();
  });

  it("TU-2-3 : deleteBudgetAction → retourne { success: true }", async () => {
    const { deleteBudgetAction } = await import("@/app/actions/budget-actions");
    const result = await deleteBudgetAction(1);
    expect(result).toEqual({ success: true });
  });

  it("TU-2-4 : revalidatePath est appelé après upsertBudgetAction", async () => {
    const { upsertBudgetAction } = await import("@/app/actions/budget-actions");
    await upsertBudgetAction(1, "Transport", 200, "monthly");
    expect(mockRevalidatePath).toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
