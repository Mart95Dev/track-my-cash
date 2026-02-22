import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted permet d'utiliser la variable avant le hoisting des vi.mock()
const { VALID_JSON } = vi.hoisted(() => ({
  VALID_JSON:
    '{"finalAnswer":"Réponse synthèse","confidence":"haute","consensus":"Accord","divergences":[]}',
}));

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-123"),
}));

vi.mock("@/lib/subscription-utils", () => ({
  canUseAI: vi.fn().mockResolvedValue({ allowed: true }),
  getUserPlanId: vi.fn().mockResolvedValue("premium"),
}));

vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockReturnValue({
    allowed: true,
    remaining: 29,
    resetAt: Date.now() + 3_600_000,
  }),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
  getDb: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/queries", () => ({
  getSetting: vi.fn().mockResolvedValue("test-api-key"),
  getAllAccounts: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/ai-context", () => ({
  buildFinancialContext: vi.fn().mockResolvedValue(""),
  SYSTEM_PROMPT: "System prompt",
}));

vi.mock("@/lib/ai-usage", () => ({
  incrementAiUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn().mockReturnValue(() => "mock-model"),
}));

vi.mock("ai", () => ({
  streamText: vi.fn().mockReturnValue({
    toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response("stream")),
  }),
  generateText: vi.fn().mockResolvedValue({ text: VALID_JSON }),
  convertToModelMessages: vi.fn().mockResolvedValue([]),
  stepCountIs: vi.fn().mockReturnValue(3),
}));

vi.mock("@/lib/ai-tools", () => ({
  createAiTools: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/ai-consensus", () => ({
  buildSynthesisPrompt: vi.fn().mockReturnValue("synthesis prompt"),
  synthesizeResponses: vi.fn().mockResolvedValue({
    finalAnswer: "Fallback",
    confidence: "faible",
    consensus: "",
    divergences: [],
  }),
}));

import { POST } from "@/app/api/chat/route";
import * as aiModule from "ai";
import * as subscriptionUtils from "@/lib/subscription-utils";
import * as consensusModule from "@/lib/ai-consensus";

const makeRequest = (body: object) =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const BASE_BODY = {
  messages: [
    {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Analyse mes finances" }],
    },
  ],
  accountIds: [],
  consensusMode: true,
};

describe("POST /api/chat — mode consensus (AC-1 à AC-3, AC-6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simuler la variable d'environnement centralisée
    process.env.API_KEY_OPENROUTER = "test-openrouter-key";
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("premium");
    vi.mocked(aiModule.generateText).mockResolvedValue({
      text: VALID_JSON,
    } as never);
    vi.mocked(aiModule.streamText).mockReturnValue({
      toUIMessageStreamResponse: vi
        .fn()
        .mockReturnValue(new Response("stream")),
    } as never);
  });

  it("TU-59-6 : Premium + consensusMode → JSON { mode: 'consensus', synthesis, sources }", async () => {
    const response = await POST(makeRequest(BASE_BODY));
    const data = (await response.json()) as {
      mode: string;
      synthesis: unknown;
      sources: unknown[];
    };

    expect(response.status).toBe(200);
    expect(data.mode).toBe("consensus");
    expect(data).toHaveProperty("synthesis");
    expect(data).toHaveProperty("sources");
    expect(Array.isArray(data.sources)).toBe(true);
  });

  it("TU-59-7 : Plan Pro + consensusMode → mode streaming (streamText appelé, pas consensus)", async () => {
    vi.mocked(subscriptionUtils.getUserPlanId).mockResolvedValue("pro");

    await POST(makeRequest(BASE_BODY));

    expect(aiModule.streamText).toHaveBeenCalled();
    expect(aiModule.generateText).not.toHaveBeenCalled();
  });

  it("TU-59-8 : AC-6 — tous modèles échouent → synthesizeResponses() appelé (pas de crash)", async () => {
    vi.mocked(aiModule.generateText).mockRejectedValue(new Error("API down"));

    const response = await POST(makeRequest(BASE_BODY));
    const data = (await response.json()) as { mode: string };

    expect(response.status).toBe(200);
    expect(data.mode).toBe("consensus");
    expect(consensusModule.synthesizeResponses).toHaveBeenCalled();
  });
});
