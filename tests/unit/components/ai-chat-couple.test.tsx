import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mocks identiques à ai-chat-consensus.test.tsx
vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn().mockReturnValue({
    messages: [],
    sendMessage: vi.fn(),
    status: "idle",
  }),
}));

vi.mock("ai", () => ({
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

const COUPLE_SUGGESTIONS = [
  "Analyse nos dépenses communes ce mois",
  "Qui a le plus dépensé ce mois-ci ?",
  "Quelle est notre balance couple ?",
];

describe("AiChat — chips couple (STORY-091)", () => {
  it("TU-91-4 : suggestions couple affichées comme chips dans l'état vide", () => {
    render(
      <AiChat
        accounts={ACCOUNTS}
        hasApiKey={true}
        isPremium={true}
        hasCoupleActive={true}
        coupleId="couple-1"
        suggestions={COUPLE_SUGGESTIONS}
      />
    );

    // Les chips de suggestions sont affichées (empty state)
    expect(screen.getByText("Analyse nos dépenses communes ce mois")).toBeDefined();
    expect(screen.getByText("Qui a le plus dépensé ce mois-ci ?")).toBeDefined();
  });

  it("TU-91-5 : hasCoupleActive=false → pas de badge couple dans le header", () => {
    render(
      <AiChat
        accounts={ACCOUNTS}
        hasApiKey={true}
        isPremium={true}
        hasCoupleActive={false}
        suggestions={[]}
      />
    );

    // Pas de badge "Mode couple" si couple non actif
    expect(screen.queryByText(/mode couple/i)).toBeNull();
  });

  it("TU-91-4b : hasCoupleActive=true + isPremium=true → badge Mode couple affiché", () => {
    render(
      <AiChat
        accounts={ACCOUNTS}
        hasApiKey={true}
        isPremium={true}
        hasCoupleActive={true}
        coupleId="couple-1"
        suggestions={COUPLE_SUGGESTIONS}
      />
    );

    expect(screen.getByText(/mode couple/i)).toBeDefined();
  });
});
