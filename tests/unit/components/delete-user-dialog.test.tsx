import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mocks des dépendances externes
vi.mock("@/app/actions/account-deletion-actions", () => ({
  requestAccountDeletionAction: vi.fn().mockResolvedValue({ success: false }),
}));

vi.mock("@/components/ui/dialog", () => ({
  // Toujours rendre les enfants pour que les tests puissent interagir avec le contenu
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

import { DeleteUserAccountDialog } from "@/components/delete-user-account-dialog";

describe("DeleteUserAccountDialog — validation du champ de confirmation", () => {
  it("TU-2-1 : le bouton 'Confirmer la demande' est désactivé si le champ est vide", () => {
    render(<DeleteUserAccountDialog />);
    const confirmBtn = screen.getByText("Confirmer la demande");
    expect(confirmBtn).toBeDisabled();
  });

  it("TU-2-2 : le bouton est désactivé si le champ ne contient pas 'SUPPRIMER'", () => {
    render(<DeleteUserAccountDialog />);
    const input = screen.getByPlaceholderText("SUPPRIMER");
    fireEvent.change(input, { target: { value: "suppr" } });
    expect(screen.getByText("Confirmer la demande")).toBeDisabled();
  });

  it("TU-2-3 : le bouton est activé si le champ contient exactement 'SUPPRIMER'", () => {
    render(<DeleteUserAccountDialog />);
    const input = screen.getByPlaceholderText("SUPPRIMER");
    fireEvent.change(input, { target: { value: "SUPPRIMER" } });
    expect(screen.getByText("Confirmer la demande")).not.toBeDisabled();
  });

  it("TU-2-4 : la casse est stricte ('supprimer' ≠ 'SUPPRIMER')", () => {
    render(<DeleteUserAccountDialog />);
    const input = screen.getByPlaceholderText("SUPPRIMER");
    fireEvent.change(input, { target: { value: "supprimer" } });
    expect(screen.getByText("Confirmer la demande")).toBeDisabled();
  });
});
