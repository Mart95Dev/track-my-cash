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
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { UpgradeModal } from "@/components/upgrade-modal";

interface Account {
  id: number;
  name: string;
  currency: string;
  calculated_balance?: number;
  initial_balance: number;
}

const DEFAULT_CHAT_MODEL = "moonshotai/kimi-k2.5";

type ConsensusChatItem =
  | { role: "user"; text: string }
  | {
      role: "assistant";
      synthesis: ConsensusSynthesis;
      sources: Array<{ model: string; text: string | null }>;
    };

const MODEL_LABELS: Record<string, string> = {
  "moonshotai/kimi-k2.5": "Kimi K2.5",
  "google/gemini-2.0-flash": "Gemini Flash",
  "qwen/qwen3.5-flash-02-23": "Qwen 3.5 Flash",
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
  canAI = true,
  hasCoupleActive = false,
  coupleId,
}: {
  accounts: Account[];
  hasApiKey: boolean;
  suggestions?: string[];
  isPremium?: boolean;
  canAI?: boolean;
  hasCoupleActive?: boolean;
  coupleId?: string;
}) {
  const t = useTranslations("advisor");
  const [selectedIds, setSelectedIds] = useState<number[]>(
    accounts.map((a) => a.id)
  );
  const [input, setInput] = useState("");
  const [consensusMode, setConsensusMode] = useState(false);
  const [consensusMessages, setConsensusMessages] = useState<
    ConsensusChatItem[]
  >([]);
  const [isConsensusLoading, setIsConsensusLoading] = useState(false);
  const { upgradeReason, showUpgradeModal, closeUpgradeModal } = useUpgradeModal();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          accountIds: selectedIds,
          coupleMode: hasCoupleActive && isPremium,
        },
      }),
    [selectedIds, hasCoupleActive, isPremium]
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
    if (!canAI) {
      showUpgradeModal("ai");
      return;
    }
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
    <>
      <UpgradeModal reason={upgradeReason} onClose={closeUpgradeModal} />
      <div className="flex flex-col">
      {/* Sélecteur de comptes + options */}
      <div className="px-4 py-3 border-b border-[#EEEEEE] bg-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-[#757575] uppercase tracking-wide">Comptes a analyser</p>
            <p className="text-[11px] text-[#BDBDBD]">{selectedIds.length} / {accounts.length} selectionne{selectedIds.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasCoupleActive && isPremium && coupleId && (
              <span className="text-xs px-3 py-1 rounded-full bg-[#F0EEFF] text-[#6C5CE7] font-medium">
                Mode couple
              </span>
            )}
            {isPremium && (
              <button
                type="button"
                onClick={() => setConsensusMode((prev) => !prev)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  consensusMode
                    ? "bg-[#6C5CE7] text-white border-[#6C5CE7]"
                    : "bg-white text-[#757575] border-[#EEEEEE] hover:border-[#6C5CE7]"
                }`}
              >
                {consensusMode ? "Multi-modeles actif" : "Multi-modeles"}
              </button>
            )}
          </div>
        </div>
        <AiAccountSelector
          accounts={accounts}
          selectedIds={selectedIds}
          onToggle={toggleAccount}
        />
      </div>

      {/* Zone de messages */}
      <div ref={scrollRef} className="overflow-y-auto pb-40">
        {/* Mode consensus */}
        {consensusMode ? (
          <>
            {consensusMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <h2 className="text-xl font-bold text-[#212121] mb-2">Conseiller IA</h2>
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
                    <div className="max-w-[80%] px-4 py-3 bg-white text-text-main rounded-2xl rounded-bl-sm shadow-soft border border-gray-100 space-y-2">
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
                  <div className="max-w-[80%] px-4 py-3 bg-white text-text-main rounded-2xl rounded-bl-sm shadow-soft border border-gray-100">
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
                <h2 className="text-xl font-bold text-[#212121] mb-2">Conseiller IA</h2>
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
                              : "bg-white text-text-main rounded-2xl rounded-bl-sm shadow-soft border border-gray-100"
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
                    <div className="px-4 py-3 bg-white text-text-main rounded-2xl rounded-bl-sm shadow-soft border border-gray-100">
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

      {/* Input fixe en bas — style Claude */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-60 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-[#F8F7FC] via-[#F8F7FC] to-transparent">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto"
        >
          <div className="relative bg-white rounded-2xl border border-[#EEEEEE] shadow-[0_2px_12px_rgba(108,92,231,0.08)] focus-within:border-[#6C5CE7] focus-within:shadow-[0_2px_16px_rgba(108,92,231,0.15)] transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              disabled={isLoading}
              className="w-full bg-transparent py-4 pl-5 pr-14 text-sm text-[#212121] placeholder:text-[#BDBDBD] outline-none disabled:opacity-50"
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center disabled:opacity-30 transition-all hover:bg-[#5A4BD1]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
