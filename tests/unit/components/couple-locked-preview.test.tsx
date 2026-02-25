/**
 * TU-103-1 à TU-103-5 — STORY-103
 * Tests unitaires : CoupleLockedPreview component
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { CoupleLockedPreview } from "@/components/couple-locked-preview";

describe("CoupleLockedPreview (STORY-103)", () => {
  it("TU-103-1 : retourne null si hasCoupleActive=true", () => {
    const { container } = render(
      <CoupleLockedPreview locale="fr" hasCoupleActive={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("TU-103-2 : affiche la section si hasCoupleActive=false", () => {
    render(<CoupleLockedPreview locale="fr" hasCoupleActive={false} />);
    const section = document.querySelector("section");
    expect(section).not.toBeNull();
  });

  it("TU-103-3 : contient le texte 'Balance couple'", () => {
    render(<CoupleLockedPreview locale="fr" hasCoupleActive={false} />);
    expect(screen.getByText("Balance couple")).toBeTruthy();
  });

  it("TU-103-4 : contient une icône lock (cadenas)", () => {
    render(<CoupleLockedPreview locale="fr" hasCoupleActive={false} />);
    const lockIcons = document.querySelectorAll(".material-symbols-outlined");
    const hasLock = Array.from(lockIcons).some(
      (el) => el.textContent === "lock"
    );
    expect(hasLock).toBe(true);
  });

  it("TU-103-5 : contient un lien href contenant '/couple'", () => {
    render(<CoupleLockedPreview locale="fr" hasCoupleActive={false} />);
    const links = document.querySelectorAll("a");
    const hasCoupleLin = Array.from(links).some((link) =>
      link.getAttribute("href")?.includes("/couple")
    );
    expect(hasCoupleLin).toBe(true);
  });
});
