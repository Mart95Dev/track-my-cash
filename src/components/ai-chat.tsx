"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AiAccountSelector } from "@/components/ai-account-selector";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface Account {
  id: number;
  name: string;
  currency: string;
  calculated_balance?: number;
  initial_balance: number;
}

export function AiChat({
  accounts,
  hasApiKey,
}: {
  accounts: Account[];
  hasApiKey: boolean;
}) {
  const t = useTranslations("advisor");
  const [selectedIds, setSelectedIds] = useState<number[]>(
    accounts.map((a) => a.id)
  );
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { accountIds: selectedIds },
      }),
    [selectedIds]
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12 space-y-2">
              <p className="text-lg font-medium">{t("heading")}</p>
              <p className="text-sm">{t("description")}</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[t("suggestion1"), t("suggestion2"), t("suggestion3")].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const text = getMessageText(message);
            if (!text) return null;
            return (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
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
