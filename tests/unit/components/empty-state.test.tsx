import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/empty-state";
import { Landmark } from "lucide-react";

describe("EmptyState", () => {
  it("TU-1-1 : affiche le titre passé en prop", () => {
    render(
      <EmptyState
        icon={<Landmark />}
        title="Aucun compte"
        description="Créez votre premier compte."
      />
    );
    expect(screen.getByText("Aucun compte")).toBeTruthy();
  });

  it("TU-1-2 : affiche le bouton CTA avec le bon label", () => {
    render(
      <EmptyState
        icon={<Landmark />}
        title="Aucun compte"
        description="Créez votre premier compte."
        action={{ label: "Créer un compte", href: "/comptes" }}
      />
    );
    expect(screen.getByText("Créer un compte")).toBeTruthy();
  });

  it("TU-1-3 : le CTA est un lien <a> avec le bon href si fourni", () => {
    const { container } = render(
      <EmptyState
        icon={<Landmark />}
        title="Aucun compte"
        description="Créez votre premier compte."
        action={{ label: "Créer un compte", href: "/fr/comptes" }}
      />
    );
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("/fr/comptes");
  });

  it("TU-1-4 : la description est affichée", () => {
    render(
      <EmptyState
        icon={<Landmark />}
        title="Aucun compte"
        description="Commencez par créer votre premier compte."
      />
    );
    expect(screen.getByText("Commencez par créer votre premier compte.")).toBeTruthy();
  });
});
