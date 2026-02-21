import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots.txt", () => {
  it("TU-1-1 : retourne un objet avec des rules", () => {
    const result = robots();
    expect(result.rules).toBeDefined();
    expect(Array.isArray(result.rules)).toBe(true);
  });

  it("TU-1-2 : User-agent: * est présent", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === "*");
    expect(wildcardRule).toBeDefined();
  });

  it("TU-1-3 : Allow: / est présent", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === "*");
    expect(wildcardRule?.allow).toContain("/");
  });

  it("TU-1-4 : /*/parametres est bloqué (pages app)", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === "*");
    const disallow = wildcardRule?.disallow;
    const disallowArr = Array.isArray(disallow) ? disallow : [disallow];
    const blocksApp = disallowArr.some(
      (d) => d?.includes("parametres") || d?.includes("dashboard") || d?.includes("transactions")
    );
    expect(blocksApp).toBe(true);
  });

  it("TU-1-5 : sitemap URL est référencé", () => {
    const result = robots();
    expect(result.sitemap).toBeDefined();
    expect(typeof result.sitemap === "string" ? result.sitemap : "").toContain("sitemap.xml");
  });
});
