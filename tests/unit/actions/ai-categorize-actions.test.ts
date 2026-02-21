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

vi.mock("@/lib/subscription-utils", () => ({
  canUseAI: vi.fn().mockResolvedValue({ allowed: true }),
}));

const mockBatchUpdateCategories = vi.fn().mockResolvedValue(undefined);
const mockGetSetting = vi.fn().mockResolvedValue("sk-test-key");
const mockGetUncategorized = vi.fn().mockResolvedValue([]);

vi.mock("@/lib/queries", () => ({
  batchUpdateCategories: mockBatchUpdateCategories,
  getSetting: mockGetSetting,
  getUncategorizedTransactions: mockGetUncategorized,
}));

describe("ai-categorize-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-1-1 : applyCategorizationsAction avec 2 catégorisations → retourne { success: true, count: 2 }", async () => {
    const { applyCategorizationsAction } = await import("@/app/actions/ai-categorize-actions");
    const result = await applyCategorizationsAction([
      { id: 1, category: "Alimentation", subcategory: "Supermarché" },
      { id: 2, category: "Transport", subcategory: "Train" },
    ]);
    expect(result).toEqual({ success: true, count: 2 });
  });

  it("TU-1-2 : applyCategorizationsAction avec tableau vide → retourne { error }", async () => {
    const { applyCategorizationsAction } = await import("@/app/actions/ai-categorize-actions");
    const result = await applyCategorizationsAction([]);
    expect((result as { error: string }).error).toBeDefined();
  });

  it("TU-1-3 : applyCategorizationsAction appelle revalidatePath('/transactions')", async () => {
    const { applyCategorizationsAction } = await import("@/app/actions/ai-categorize-actions");
    await applyCategorizationsAction([
      { id: 1, category: "Alimentation" },
    ]);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/transactions");
  });

  it("TU-1-4 : applyCategorizationsAction appelle batchUpdateCategories avec les bonnes données", async () => {
    const { applyCategorizationsAction } = await import("@/app/actions/ai-categorize-actions");
    const cats = [{ id: 5, category: "Loisirs", subcategory: "Cinéma" }];
    await applyCategorizationsAction(cats);
    expect(mockBatchUpdateCategories).toHaveBeenCalledWith({}, cats);
  });

  it("TU-1-5 : plan Free → autoCategorizeAction retourne { error }", async () => {
    const { canUseAI } = await import("@/lib/subscription-utils");
    vi.mocked(canUseAI).mockResolvedValueOnce({
      allowed: false,
      reason: "Fonctionnalité réservée aux plans Pro/Premium",
    });
    const { autoCategorizeAction } = await import("@/app/actions/ai-categorize-actions");
    const result = await autoCategorizeAction();
    expect((result as { error: string }).error).toBeDefined();
  });
});
