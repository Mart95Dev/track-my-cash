import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const swContent = readFileSync(join(process.cwd(), "public/sw.js"), "utf-8");

describe("Service Worker (public/sw.js)", () => {
  it("defines CACHE_NAME", () => {
    expect(swContent).toContain("CACHE_NAME");
    expect(swContent).toContain("trackmycash-v");
  });

  it("pre-caches offline URL", () => {
    expect(swContent).toContain("/offline");
  });

  it("handles install event with skipWaiting", () => {
    expect(swContent).toContain("self.addEventListener(\"install\"");
    expect(swContent).toContain("self.skipWaiting()");
  });

  it("handles activate event with clients.claim", () => {
    expect(swContent).toContain("self.addEventListener(\"activate\"");
    expect(swContent).toContain("self.clients.claim()");
  });

  it("handles fetch event", () => {
    expect(swContent).toContain("self.addEventListener(\"fetch\"");
  });

  it("uses Cache-First for static assets (_next/static)", () => {
    expect(swContent).toContain("/_next/static/");
    expect(swContent).toContain("caches.match(request)");
  });

  it("uses Network-First for navigation with offline fallback", () => {
    expect(swContent).toContain("request.mode === \"navigate\"");
    expect(swContent).toContain("caches.match(OFFLINE_URL)");
  });

  it("skips non-GET requests", () => {
    expect(swContent).toContain("request.method !== \"GET\"");
  });

  it("handles SKIP_WAITING message for update flow", () => {
    expect(swContent).toContain("SKIP_WAITING");
    expect(swContent).toContain("self.addEventListener(\"message\"");
  });

  it("cleans up old caches on activate", () => {
    expect(swContent).toContain("caches.keys()");
    expect(swContent).toContain("caches.delete(key)");
  });
});

describe("manifest.ts", () => {
  // Dynamic import of the manifest function
  it("has correct theme_color (#4848e5)", async () => {
    const { default: manifest } = await import("@/app/manifest");
    const m = manifest();
    expect(m.theme_color).toBe("#4848e5");
  });

  it("has shortcuts including Dashboard and Transactions", async () => {
    const { default: manifest } = await import("@/app/manifest");
    const m = manifest();
    expect(m.shortcuts).toBeDefined();
    const names = m.shortcuts!.map((s) => s.name);
    expect(names).toContain("Tableau de bord");
    expect(names).toContain("Transactions");
  });

  it("has at least 1 screenshot with narrow form_factor", async () => {
    const { default: manifest } = await import("@/app/manifest");
    const m = manifest();
    expect(m.screenshots).toBeDefined();
    expect(m.screenshots!.length).toBeGreaterThanOrEqual(1);
    expect(m.screenshots![0].form_factor).toBe("narrow");
  });
});
