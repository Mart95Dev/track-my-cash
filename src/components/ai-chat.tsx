"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AiAccountSelector } from "@/components/ai-account-selector";
import { ChatSuggestions } from "@/components/chat-suggestions";
import { ToolResultCard } from "@/components/tool-result-card";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { ToolCallResult } from "@/lib/ai-tools";
import type { DynamicToolUIPart } from "ai";

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

export function AiChat({
  accounts,
  hasApiKey,
  suggestions = [],
}: {
  accounts: Account[];
  hasApiKey: boolean;
  suggestions?: string[];
}) {
  const t = useTranslations("advisor");
  const [selectedIds, setSelectedIds] = useState<number[]>(
    accounts.map((a) => a.id)
  );
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    "openai/gpt-4o-mini"
  );
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { accountIds: selectedIds, modelId: selectedModel },
      }),
    [selectedIds, selectedModel]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleAccount = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
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
        (p): p is DynamicToolUIPart & { state: "output-available"; output: ToolCallResult } =>
          p.type === "dynamic-tool" &&
          (p as DynamicToolUIPart).state === "output-available"
      )
      .map((p) => p.output);
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-2">
          <p className="text-lg font-medium">{t("noApiKey")}</p>
          <p className="text-sm text-muted-foreground">
            {t("noApiKeyDescPre")}{" "}
            <Link href="/parametres" className="underline text-primary">
              Paramètres
            </Link>{" "}
            {t("noApiKeyDescPost")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <Card className="h-fit">
        <CardContent className="pt-4">
          <AiAccountSelector
            accounts={accounts}
            selectedIds={selectedIds}
            onToggle={toggleAccount}
          />
        </CardContent>
      </Card>

      <Card className="flex flex-col" style={{ minHeight: "500px" }}>
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <label
            htmlFor="model-select"
            className="text-sm font-medium text-muted-foreground whitespace-nowrap"
          >
            Modèle IA
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelId)}
            disabled={isLoading}
            className="flex-1 text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label} — {model.description}
              </option>
            ))}
          </select>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12 space-y-2">
              <p className="text-lg font-medium">{t("heading")}</p>
              <p className="text-sm">{t("description")}</p>
              <ChatSuggestions
                suggestions={suggestions}
                onSelect={(text) => sendMessage({ text })}
              />
            </div>
          )}

          {messages.map((message) => {
            const text = getMessageText(message);
            const toolResults = getToolResults(message);
            if (!text && toolResults.length === 0) return null;
            return (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {toolResults.map((result, i) => (
                  <ToolResultCard key={i} result={result} />
                ))}
                {text && (
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm">{text}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    {t("thinking")}
                  </p>
                </div>
              </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {t("send")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
