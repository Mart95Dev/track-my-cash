import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock server actions that initialize auth/db at module level
vi.mock("@/app/actions/budget-history-actions", () => ({
  getBudgetHistoryAction: vi.fn().mockResolvedValue([]),
}));
