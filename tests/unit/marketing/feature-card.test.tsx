import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import type { LucideIcon } from "lucide-react";

// Mock des composants shadcn/ui
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const MockIcon: LucideIcon = (({ className, "aria-hidden": ariaHidden, ...props }: React.SVGProps<SVGSVGElement> & { "aria-hidden"?: boolean | "true" | "false" }) => (
  <svg className={className} aria-hidden={ariaHidden as "true" | "false" | undefined} {...props} data-testid="feature-icon-svg" />
)) as unknown as LucideIcon;

describe("FeatureCard", () => {
  it("TU-1-1 : affiche le titre passé en props", async () => {
    const { FeatureCard } = await import("@/components/marketing/feature-card");
    render(<FeatureCard icon={MockIcon} title="Comptes multiples" description="Gérez vos comptes." />);
    expect(screen.getByText("Comptes multiples")).toBeDefined();
  });

  it("TU-1-2 : affiche la description passée en props", async () => {
    const { FeatureCard } = await import("@/components/marketing/feature-card");
    render(<FeatureCard icon={MockIcon} title="Test" description="Description de test" />);
    expect(screen.getByText("Description de test")).toBeDefined();
  });

  it("TU-1-3 : affiche l'icône (data-testid feature-icon)", async () => {
    const { FeatureCard } = await import("@/components/marketing/feature-card");
    render(<FeatureCard icon={MockIcon} title="Test" description="Desc" />);
    expect(screen.getByTestId("feature-icon")).toBeDefined();
  });
});
