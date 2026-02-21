import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-test"),
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
}));

const mockGoal = {
  id: 1,
  name: "Voyage Japon",
  target_amount: 3000,
  current_amount: 1200,
  currency: "EUR",
  deadline: "2026-12-31",
  created_at: "2026-01-01T00:00:00",
};

vi.mock("@/lib/queries", () => ({
  getGoals: vi.fn().mockResolvedValue([]),
  createGoal: vi.fn().mockResolvedValue(mockGoal),
  updateGoal: vi.fn().mockResolvedValue(undefined),
  deleteGoal: vi.fn().mockResolvedValue(undefined),
}));

describe("goals-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-1-1 : createGoalAction avec données valides → retourne { success: true }", async () => {
    const { createGoalAction } = await import("@/app/actions/goals-actions");
    const result = await createGoalAction("Voyage Japon", 3000, 1200, "EUR", "2026-12-31");
    expect(result).toEqual({ success: true });
  });

  it("TU-1-2 : createGoalAction avec targetAmount = 0 → retourne { error }", async () => {
    const { createGoalAction } = await import("@/app/actions/goals-actions");
    const result = await createGoalAction("Test", 0, 0, "EUR");
    expect((result as { error: string }).error).toBeDefined();
  });

  it("TU-1-3 : createGoalAction sans nom → retourne { error }", async () => {
    const { createGoalAction } = await import("@/app/actions/goals-actions");
    const result = await createGoalAction("", 3000, 0, "EUR");
    expect((result as { error: string }).error).toBeDefined();
  });

  it("TU-1-4 : deleteGoalAction → retourne { success: true }", async () => {
    const { deleteGoalAction } = await import("@/app/actions/goals-actions");
    const result = await deleteGoalAction(1);
    expect(result).toEqual({ success: true });
  });

  it("TU-1-5 : updateGoalAction avec current_amount > target_amount → retourne { success: true }", async () => {
    const { updateGoalAction } = await import("@/app/actions/goals-actions");
    // Un objectif dépassé est valide (ex: objectif de 1000€ atteint avec 1500€)
    const result = await updateGoalAction(1, { current_amount: 5000, target_amount: 3000 });
    expect(result).toEqual({ success: true });
  });
});
