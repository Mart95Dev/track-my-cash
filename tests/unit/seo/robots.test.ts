import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots.txt", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

  const findRule = (ua: string) => rules.find((r) => r.userAgent === ua);

  // TU-3 : Les règles wildcard sont conservées
  it("TU-3 : User-agent: * est présent avec allow et disallow", () => {
    const wildcardRule = findRule("*");
    expect(wildcardRule).toBeDefined();
    expect(wildcardRule?.allow).toContain("/");
  });

  // TU-5 : Les pages app sont interdites
  it("TU-5 : les pages app sont interdites pour le wildcard", () => {
    const wildcardRule = findRule("*");
    const disallow = Array.isArray(wildcardRule?.disallow)
      ? wildcardRule.disallow
      : [wildcardRule?.disallow];
    expect(disallow).toContain("/*/dashboard");
    expect(disallow).toContain("/*/comptes");
    expect(disallow).toContain("/*/transactions");
    expect(disallow).toContain("/*/recurrents");
    expect(disallow).toContain("/*/previsions");
    expect(disallow).toContain("/*/conseiller");
    expect(disallow).toContain("/*/parametres");
    expect(disallow).toContain("/api/");
  });

  // TU-1 : Les bots IA ont des règles Allow
  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "PerplexityBot",
    "ClaudeBot",
    "anthropic-ai",
    "Google-Extended",
  ];

  it.each(aiBots)("TU-1 : %s a une règle Allow /", (bot) => {
    const rule = findRule(bot);
    expect(rule).toBeDefined();
    expect(rule?.allow).toContain("/");
  });

  it.each(aiBots)("TU-1 : %s a les mêmes disallow que le wildcard", (bot) => {
    const rule = findRule(bot);
    const disallow = Array.isArray(rule?.disallow) ? rule.disallow : [rule?.disallow];
    expect(disallow).toContain("/*/dashboard");
    expect(disallow).toContain("/api/");
  });

  // TU-2 : Bytespider est bloqué
  it("TU-2 : Bytespider est bloqué avec Disallow: /", () => {
    const rule = findRule("Bytespider");
    expect(rule).toBeDefined();
    expect(rule?.disallow).toContain("/");
  });

  // TU-4 : Le sitemap est référencé
  it("TU-4 : sitemap URL est référencé", () => {
    expect(result.sitemap).toBeDefined();
    expect(typeof result.sitemap === "string" ? result.sitemap : "").toContain("sitemap.xml");
  });
});
