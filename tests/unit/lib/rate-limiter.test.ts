import { describe, it, expect, vi, beforeEach } from "vitest";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useRealTimers();
  });

  it("TU-1-1 : premier appel → allowed: true, remaining: 29", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limiter");
    const result = checkRateLimit("user-A", 30, 3600_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it("TU-1-2 : exactement 30 appels → dernier allowed: true", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limiter");
    for (let i = 0; i < 29; i++) checkRateLimit("user-B", 30, 3600_000);
    const last = checkRateLimit("user-B", 30, 3600_000);
    expect(last.allowed).toBe(true);
    expect(last.remaining).toBe(0);
  });

  it("TU-1-3 : 31ème appel → allowed: false", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limiter");
    for (let i = 0; i < 30; i++) checkRateLimit("user-C", 30, 3600_000);
    const over = checkRateLimit("user-C", 30, 3600_000);
    expect(over.allowed).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it("TU-1-4 : userId différent → compteur indépendant, allowed: true", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limiter");
    for (let i = 0; i < 30; i++) checkRateLimit("user-D", 30, 3600_000);
    const other = checkRateLimit("user-E", 30, 3600_000);
    expect(other.allowed).toBe(true);
    expect(other.remaining).toBe(29);
  });

  it("TU-1-5 : après expiration de la fenêtre → allowed: true", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limiter");
    for (let i = 0; i < 30; i++) checkRateLimit("user-F", 30, 3600_000);
    // Avancer le temps au-delà de la fenêtre
    vi.advanceTimersByTime(3600_001);
    const after = checkRateLimit("user-F", 30, 3600_000);
    expect(after.allowed).toBe(true);
    expect(after.remaining).toBe(29);
  });
});
