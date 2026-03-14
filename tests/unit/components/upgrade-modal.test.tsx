import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

import { UpgradeModal } from "@/components/upgrade-modal";

describe("UpgradeModal (STORY-082)", () => {
  it("TU-82-1 : reason='ai' → affiche le titre de config AI (AC-2)", () => {
    render(<UpgradeModal reason="ai" onClose={() => {}} />);
    expect(screen.getByText("Débloquez le Conseiller IA")).toBeDefined();
  });

  it("TU-82-2 : reason='ai' → affiche le plan Pro et son prix (AC-4)", () => {
    render(<UpgradeModal reason="ai" onClose={() => {}} />);
    expect(screen.getByText("Pro")).toBeDefined();
    expect(screen.getByText(/5[.,]9/)).toBeDefined();
  });

  it("TU-82-3 : reason='import_pdf' → affiche le titre import PDF (AC-1)", () => {
    render(<UpgradeModal reason="import_pdf" onClose={() => {}} />);
    expect(screen.getByText(/Importez vos relevés PDF/)).toBeDefined();
  });

  it("TU-82-4 : reason={null} → ne rend rien (AC-6)", () => {
    const { container } = render(<UpgradeModal reason={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("TU-82-5 : clic 'Fermer' (×) appelle onClose (AC-6)", () => {
    const onClose = vi.fn();
    render(<UpgradeModal reason="ai" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
