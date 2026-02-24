import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(""),
}));

import { DashboardViewToggle } from "@/components/dashboard-view-toggle";

describe("DashboardViewToggle — toggle Ma vue / Vue couple (STORY-088)", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("TU-88-1 : hasCoupleActive=true → rend les 2 pills 'Ma vue' et 'Vue couple'", () => {
    render(<DashboardViewToggle hasCoupleActive={true} locale="fr" />);

    expect(screen.getByText("Ma vue")).toBeDefined();
    expect(screen.getByText("Vue couple")).toBeDefined();
  });

  it("TU-88-2 : hasCoupleActive=false → rend les 2 pills mais 'Vue couple' est grisée (opacity-60)", () => {
    render(<DashboardViewToggle hasCoupleActive={false} locale="fr" />);

    expect(screen.getByText("Ma vue")).toBeDefined();

    // Trouver le bouton "Vue couple"
    const buttons = screen.getAllByRole("button");
    const coupleBtn = buttons.find((btn) => btn.textContent?.includes("Vue couple"));
    expect(coupleBtn).toBeDefined();
    expect(coupleBtn?.className).toContain("opacity-60");
  });

  it("TU-88-1b : par défaut (view != couple), 'Ma vue' est active (bg-primary)", () => {
    render(<DashboardViewToggle hasCoupleActive={true} locale="fr" />);

    const buttons = screen.getAllByRole("button");
    const maVueBtn = buttons.find((btn) => btn.textContent === "Ma vue");
    expect(maVueBtn?.className).toContain("bg-primary");
  });

  it("TU-88-2b : hasCoupleActive=false → icône lock présente dans le bouton Vue couple", () => {
    render(<DashboardViewToggle hasCoupleActive={false} locale="fr" />);

    const lockIcon = screen.getByText("lock");
    expect(lockIcon).toBeDefined();
  });
});
