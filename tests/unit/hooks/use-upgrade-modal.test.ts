import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useUpgradeModal,
  UPGRADE_CONFIGS,
} from "@/hooks/use-upgrade-modal";

describe("useUpgradeModal (STORY-082)", () => {
  it("TU-82-6 : showUpgradeModal('ai') → upgradeReason === 'ai' (AC-7)", () => {
    const { result } = renderHook(() => useUpgradeModal());

    act(() => {
      result.current.showUpgradeModal("ai");
    });

    expect(result.current.upgradeReason).toBe("ai");
  });

  it("TU-82-7 : closeUpgradeModal() → upgradeReason === null (AC-7)", () => {
    const { result } = renderHook(() => useUpgradeModal());

    act(() => {
      result.current.showUpgradeModal("ai");
    });
    act(() => {
      result.current.closeUpgradeModal();
    });

    expect(result.current.upgradeReason).toBeNull();
  });

  it("TU-82-8 : UPGRADE_CONFIGS contient les 8 reasons (AC-4 + couple_pro + couple_premium)", () => {
    expect(Object.keys(UPGRADE_CONFIGS).length).toBe(8);
    expect(UPGRADE_CONFIGS).toHaveProperty("ai");
    expect(UPGRADE_CONFIGS).toHaveProperty("accounts_limit");
    expect(UPGRADE_CONFIGS).toHaveProperty("import_pdf");
    expect(UPGRADE_CONFIGS).toHaveProperty("import_xlsx");
    expect(UPGRADE_CONFIGS).toHaveProperty("export_pdf");
    expect(UPGRADE_CONFIGS).toHaveProperty("history");
    expect(UPGRADE_CONFIGS).toHaveProperty("couple_pro");
    expect(UPGRADE_CONFIGS).toHaveProperty("couple_premium");
  });

  it("TU-82-9 : chaque config a ≥ 3 features (AC-4)", () => {
    for (const key of Object.keys(UPGRADE_CONFIGS) as (keyof typeof UPGRADE_CONFIGS)[]) {
      expect(UPGRADE_CONFIGS[key].features.length).toBeGreaterThanOrEqual(3);
    }
  });
});
