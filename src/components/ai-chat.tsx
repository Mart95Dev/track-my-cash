"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { AiAccountSelector } from "@/components/ai-account-selector";
import { ToolResultCard } from "@/components/tool-result-card";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { ToolCallResult } from "@/lib/ai-tools";
import type { DynamicToolUIPart } from "ai";
import type { ConsensusSynthesis } from "@/lib/ai-consensus";

interface Account {
  id: number;
  name: string;
  currency: string;
  calculated_balance?: number;
  initial_balance: number;
}

const MODELS = [
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o mini",
    description: "Rapide et efficace",
  },
  {
    id: "anthropic/claude-haiku-20240307",
    label: "Claude Haiku",
    description: "Concis et précis",
  },
  {
    id: "google/gemini-flash-1.5",
    label: "Gemini Flash 1.5",
    description: "Multimodal Google",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    label: "Llama 3.1 8B",
    description: "Open source gratuit",
  },
] as const;

type ModelId = (typeof MODELS)[number]["id"];

type ConsensusChatItem =
  | { role: "user"; text: string }
  | {
      role: "assistant";
      synthesis: ConsensusSynthesis;
      sources: Array<{ model: string; text: string | null }>;
    };

const MODEL_LABELS: Record<string, string> = {
  "anthropic/claude-sonnet-4-6": "Claude Sonnet",
  "google/gemini-2.0-flash": "Gemini Flash",
  "openai/gpt-4o-mini": "GPT-4o mini",
};

const CONFIDENCE_STYLES: Record<ConsensusSynthesis["confidence"], string> = {
  haute: "bg-green-100 text-green-800",
  moyenne: "bg-yellow-100 text-yellow-800",
  faible: "bg-red-100 text-red-800",
};

export function AiChat({
  accounts,
  hasApiKey,
  suggestions = [],
  isPremium = false,
}: {
  accounts: Account[];
  hasApiKey: boolean;
  suggestions?: string[];
  isPremium?: boolean;
}) {
  const t = useTranslations("advisor");
  const [selectedIds, setSelectedIds] = useState<number[]>(
    accounts.map((a) => a.id)
  );
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    "openai/gpt-4o-mini"
  );
  const [input, setInput] = useState("");
  const [consensusMode, setConsensusMode] = useState(false);
  const [consensusMessages, setConsensusMessages] = useState<
    ConsensusChatItem[]
  >([]);
  const [isConsensusLoading, setIsConsensusLoading] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { accountIds: selectedIds, modelId: selectedModel },
      }),
    [selectedIds, selectedModel]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading =
    status === "submitted" || status === "streaming" || isConsensusLoading;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, consensusMessages]);

  const toggleAccount = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConsensusSubmit = async (text: string) => {
    setConsensusMessages((prev) => [...prev, { role: "user", text }]);
    setIsConsensusLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: Date.now().toString(),
              role: "user",
              parts: [{ type: "text", text }],
            },
          ],
          accountIds: selectedIds,
          consensusMode: true,
        }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        mode: string;
        synthesis: ConsensusSynthesis;
        sources: Array<{ model: string; text: string | null }>;
      };
      if (data.mode === "consensus") {
        setConsensusMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            synthesis: data.synthesis,
            sources: data.sources,
          },
        ]);
      }
    } catch {
      // Silencieux — l'utilisateur peut réessayer
    } finally {
      setIsConsensusLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    if (consensusMode && isPremium) {
      void handleConsensusSubmit(text);
    } else {
      sendMessage({ text });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const getMessageText = (message: (typeof messages)[0]): string => {
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  };

  const getToolResults = (message: (typeof messages)[0]): ToolCallResult[] => {
    return message.parts
      .filter(
        (
          p
        ): p is DynamicToolUIPart & {
          state: "output-available";
          output: ToolCallResult;
        } =>
          p.type === "dynamic-tool" &&
          (p as DynamicToolUIPart).state === "output-available"
      )
      .map((p) => p.output);
  };

  if (!hasApiKey) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>smart_toy</span>
        </div>
        <p className="text-base font-semibold text-text-main">{t("noApiKey")}</p>
        <p className="text-sm text-text-muted">
          {t("noApiKeyDescPre")}{" "}
          <Link href="/parametres" className="underline text-primary">
            Paramètres
          </Link>{" "}
          {t("noApiKeyDescPost")}
        </p>
      </div>
    );
  }

  const currentMessages = consensusMode ? consensusMessages : messages;
  const hasMessages = currentMessages.length > 0;

  return (
    <div className="flex flex-col">
      {/* Toolbar : sélecteur modèle / comptes / consensus */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-100 bg-background-light">
        {isPremium && (
          <button
            type="button"
            onClick={() => setConsensusMode((prev) => !prev)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              consensusMode
                ? "bg-primary text-white border-primary"
                : "bg-white text-text-muted border-gray-200 hover:border-primary"
            }`}
          >
            {consensusMode ? "✦ Multi-modèles" : "Multi-modèles"}
          </button>
        )}
        {!consensusMode && (
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelId)}
            disabled={isLoading}
            className="flex-1 text-xs rounded-full border border-gray-200 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-text-main"
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label} — {model.description}
              </option>
            ))}
          </select>
        )}
        {consensusMode && (
          <span className="text-xs text-text-muted flex-1">
            Claude Sonnet · Gemini Flash · GPT-4o mini
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowAccountSelector((prev) => !prev)}
          className="w-8 h-8 rounded-full bg-indigo-50 text-primary flex items-center justify-center shrink-0"
          title="Sélectionner les comptes"
        >
          <span className="material-symbols-outlined text-[18px]">account_balance</span>
        </button>
      </div>

      {/* Sélecteur de comptes — accordéon */}
      {showAccountSelector && (
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          <AiAccountSelector
            accounts={accounts}
            selectedIds={selectedIds}
            onToggle={toggleAccount}
          />
        </div>
      )}

      {/* Zone de messages */}
      <div ref={scrollRef} className="overflow-y-auto pb-40">
        {/* Mode consensus */}
        {consensusMode ? (
          <>
            {consensusMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>smart_toy</span>
                </div>
                <h2 className="text-xl font-bold text-text-main mb-2">Conseiller IA</h2>
                <p className="text-text-muted text-sm mb-6">
                  3 modèles répondent en parallèle et synthétisent leurs réponses.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="bg-indigo-50 text-primary rounded-full px-4 py-2 text-sm font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 pt-4 space-y-4">
              {consensusMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start gap-2"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                  )}
                  {msg.role === "user" ? (
                    <div className="max-w-[80%] px-4 py-3 bg-primary text-white rounded-2xl rounded-tr-sm shadow-lg shadow-primary/20">
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  ) : (
                    <div className="max-w-[80%] px-4 py-3 bg-white text-text-main rounded-2xl rounded-tl-sm shadow-soft border border-gray-100 space-y-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONFIDENCE_STYLES[msg.synthesis.confidence]}`}
                      >
                        Consensus {msg.synthesis.confidence}
                      </span>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.synthesis.finalAnswer}</ReactMarkdown>
                      </div>
                      <details>
                        <summary className="cursor-pointer text-xs text-text-muted hover:text-text-main select-none">
                          Voir les{" "}
                          {msg.sources.filter((s) => s.text).length} sources
                        </summary>
                        <div className="mt-2 space-y-3 pl-3 border-l border-gray-200">
                          {msg.sources.map((source) =>
                            source.text ? (
                              <div key={source.model}>
                                <p className="text-xs font-semibold text-text-muted mb-1">
                                  {MODEL_LABELS[source.model] ?? source.model}
                                </p>
                                <p className="text-sm text-text-main">{source.text}</p>
                              </div>
                            ) : (
                              <div key={source.model}>
                                <p className="text-xs text-text-muted italic">
                                  {MODEL_LABELS[source.model] ?? source.model}{" "}
                                  — non disponible
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}

              {isConsensusLoading && (
                <div className="flex justify-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  </div>
                  <div className="max-w-[80%] px-4 py-3 bg-white text-text-main rounded-2xl rounded-tl-sm shadow-soft border border-gray-100">
                    <p className="text-sm text-text-muted">
                      Analyse en cours (3 modèles)…
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Mode streaming standard */
          <>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>smart_toy</span>
                </div>
                <h2 className="text-xl font-bold text-text-main mb-2">Conseiller IA</h2>
                <p className="text-text-muted text-sm mb-6">
                  {t("description")}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="bg-indigo-50 text-primary rounded-full px-4 py-2 text-sm font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 pt-4 space-y-4">
              {messages.map((message) => {
                const text = getMessageText(message);
                const toolResults = getToolResults(message);
                if (!text && toolResults.length === 0) return null;
                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start gap-2"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                        <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 max-w-[80%]">
                      {toolResults.map((result, i) => (
                        <ToolResultCard key={i} result={result} />
                      ))}
                      {text && (
                        <div
                          className={`px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-white rounded-2xl rounded-tr-sm shadow-lg shadow-primary/20"
                              : "bg-white text-text-main rounded-2xl rounded-tl-sm shadow-soft border border-gray-100"
                          }`}
                        >
                          {message.role === "user" ? (
                            <p className="text-sm">{text}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{text}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="px-4 py-3 bg-white text-text-main rounded-2xl rounded-tl-sm shadow-soft border border-gray-100">
                      <p className="text-sm text-text-muted">{t("thinking")}</p>
                    </div>
                  </div>
                )}
            </div>
          </>
        )}
      </div>

      {/* Chips suggestions (scroll horizontal) — visibles quand des messages existent */}
      {hasMessages && suggestions.length > 0 && (
        <div className="fixed bottom-28 left-0 right-0 z-30 pointer-events-none">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-4 pointer-events-auto max-w-md mx-auto">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="shrink-0 bg-white border border-gray-200 text-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-indigo-50 hover:border-primary transition-colors whitespace-nowrap shadow-soft"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input fixe en bas */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background-light border-t border-gray-100 p-3">
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            disabled={isLoading}
            className="flex-1 rounded-full bg-white border border-gray-200 py-3 px-5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && input.trim()) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-soft disabled:opacity-50 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
