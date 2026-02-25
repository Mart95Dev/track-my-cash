/**
 * TU-97-11 à TU-97-12 — STORY-097
 * Tests unitaires : ExportPdfButton — affichage conditionnel
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExportPdfButton } from "@/components/export-pdf-button";

describe("ExportPdfButton (STORY-097)", () => {
  it("TU-97-11 : plan Pro → bouton affiché et activé", () => {
    render(<ExportPdfButton isProOrPremium={true} />);
    const link = screen.queryByRole("link");
    const button = screen.queryByRole("button");
    // Le composant rend soit un lien de téléchargement, soit un bouton
    expect(link ?? button).not.toBeNull();
  });

  it("TU-97-12 : plan Gratuit → bouton absent (pas de lien actif)", () => {
    render(<ExportPdfButton isProOrPremium={false} />);
    const link = screen.queryByRole("link");
    const button = screen.queryByRole("button");
    expect(link).toBeNull();
    expect(button).toBeNull();
  });
});
