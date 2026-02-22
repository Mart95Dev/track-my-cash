import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn().mockReturnValue({
    messages: [],
    sendMessage: vi.fn(),
    status: "idle",
  }),
}));

vi.mock("ai", () => ({
  // vi.fn() sans mockImplementation → peut être utilisé comme constructeur (new DefaultChatTransport)
  DefaultChatTransport: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      noApiKey: "Clé API manquante",
      noApiKeyDescPre: "Ajoutez votre clé dans",
      noApiKeyDescPost: "pour commencer.",
      heading: "Bonjour",
      description: "Posez vos questions financières.",
      placeholder: "Votre question…",
      send: "Envoyer",
      thinking: "Réflexion en cours…",
    })[key] ?? key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/ai-account-selector", () => ({
  AiAccountSelector: () => <div data-testid="account-selector" />,
}));

vi.mock("@/components/chat-suggestions", () => ({
  ChatSuggestions: () => <div data-testid="chat-suggestions" />,
}));

vi.mock("@/components/tool-result-card", () => ({
  ToolResultCard: () => <div data-testid="tool-result" />,
}));

import { AiChat } from "@/components/ai-chat";

const ACCOUNTS = [
  { id: 1, name: "Compte courant", currency: "EUR", initial_balance: 0 },
];

describe("AiChat — mode consensus (AC-4)", () => {
  it("TU-59-9 : isPremium=false → bouton Multi-modèles absent", () => {
    render(<AiChat accounts={ACCOUNTS} hasApiKey isPremium={false} />);
    expect(screen.queryByText(/multi-modèles/i)).toBeNull();
  });

  it("TU-59-10 : isPremium=true → bouton Multi-modèles présent", () => {
    render(<AiChat accounts={ACCOUNTS} hasApiKey isPremium={true} />);
    expect(screen.getByText(/multi-modèles/i)).toBeDefined();
  });

  it("TU-59-11 : clic Multi-modèles → '✦ Multi-modèles' affiché + sélecteur masqué", () => {
    render(<AiChat accounts={ACCOUNTS} hasApiKey isPremium={true} />);

    const btn = screen.getByText(/multi-modèles/i);
    fireEvent.click(btn);

    expect(screen.getByText("✦ Multi-modèles")).toBeDefined();
    expect(screen.queryByLabelText("Modèle IA")).toBeNull();
    expect(screen.getByText(/claude sonnet/i)).toBeDefined();
  });

  it("TU-59-12 : isPremium=true, hasApiKey=false → message d'erreur affiché", () => {
    render(<AiChat accounts={ACCOUNTS} hasApiKey={false} isPremium={true} />);
    expect(screen.getByText("Clé API manquante")).toBeDefined();
  });
});
