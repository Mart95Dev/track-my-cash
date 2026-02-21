import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mocks des Server Actions
vi.mock("@/app/actions/account-actions", () => ({
  createAccountAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/app/actions/onboarding-actions", () => ({
  completeOnboardingAction: vi.fn().mockResolvedValue(undefined),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock Dialog pour toujours afficher le contenu quand open=true
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
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

import { OnboardingWizard } from "@/components/onboarding-wizard";

describe("OnboardingWizard", () => {
  it("TU-1-1 : affiche l'étape 1 par défaut avec le titre de bienvenue", () => {
    render(<OnboardingWizard open={true} />);
    expect(screen.getByText("Bienvenue sur TrackMyCash !")).toBeTruthy();
    expect(screen.getByText("Créer mon compte →")).toBeTruthy();
  });

  it("TU-1-2 : cliquer 'Passer cette étape' à l'étape 2 avance à l'étape 3", () => {
    render(<OnboardingWizard open={true} initialStep={2} />);
    expect(screen.getByText("Importez vos transactions")).toBeTruthy();
    fireEvent.click(screen.getByText("Passer cette étape →"));
    expect(screen.getByText("Félicitations !")).toBeTruthy();
  });

  it("TU-1-3 : l'indicateur d'étapes est affiché (Étape 1 / 3)", () => {
    render(<OnboardingWizard open={true} />);
    expect(screen.getByText("Étape 1 / 3")).toBeTruthy();
  });

  it("TU-1-4 : le bouton de fermeture est présent", () => {
    render(<OnboardingWizard open={true} />);
    const closeBtn = screen.getByLabelText("Fermer");
    expect(closeBtn).toBeTruthy();
  });

  it("TU-1-5 : l'étape 3 affiche le message de félicitations", () => {
    render(<OnboardingWizard open={true} initialStep={3} />);
    expect(screen.getByText("Félicitations !")).toBeTruthy();
    expect(screen.getByText("Accéder à mon tableau de bord →")).toBeTruthy();
  });
});
