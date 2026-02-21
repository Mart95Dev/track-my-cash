import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetSetting = vi.fn().mockResolvedValue(undefined);
const mockGetSetting = vi.fn();

vi.mock("@/lib/queries", () => ({
  setSetting: mockSetSetting,
  getSetting: mockGetSetting,
}));

const mockDb = {} as import("@libsql/client").Client;

describe("getAllRates — cache DB", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("TU-1-1 : fetch réussi + db → setSetting appelé avec exchange_rates_cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { USD: 1.08, MGA: 5000 } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getAllRates } = await import("@/lib/currency");
    await getAllRates(mockDb);

    await vi.waitFor(() => {
      expect(mockSetSetting).toHaveBeenCalledWith(
        mockDb,
        "exchange_rates_cache",
        expect.stringContaining("USD")
      );
    });
  });

  it("TU-1-2 : fetch réussi sans db → setSetting non appelé", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { USD: 1.08 } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getAllRates } = await import("@/lib/currency");
    await getAllRates(); // pas de db

    expect(mockSetSetting).not.toHaveBeenCalled();
  });

  it("TU-1-3 : fetch échoue + db avec cache → retourne les taux du cache DB", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("réseau")));
    mockGetSetting.mockImplementation((_db: unknown, key: string) => {
      if (key === "exchange_rates_cache") {
        return Promise.resolve(
          JSON.stringify({ rates: { EUR: 1, USD: 1.15, MGA: 4800 } })
        );
      }
      return Promise.resolve(null);
    });

    const { getAllRates } = await import("@/lib/currency");
    const rates = await getAllRates(mockDb);

    expect(rates.USD).toBe(1.15);
    expect(rates.MGA).toBe(4800);
  });

  it("TU-1-4 : fetch échoue + db sans cache → retourne valeurs codées en dur", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("réseau")));
    mockGetSetting.mockResolvedValue(null);

    const { getAllRates } = await import("@/lib/currency");
    const rates = await getAllRates(mockDb);

    expect(rates.EUR).toBe(1);
    expect(rates.MGA).toBe(5000); // valeur codée en dur
  });

  it("TU-1-5 : setSetting qui échoue → erreur silencieuse, getAllRates retourne les taux", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { USD: 1.08 } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    mockSetSetting.mockRejectedValue(new Error("DB error"));

    const { getAllRates } = await import("@/lib/currency");
    const rates = await getAllRates(mockDb);

    // Doit retourner les taux même si setSetting échoue
    expect(rates.USD).toBe(1.08);
  });
});
