/**
 * TU-106-1 à TU-106-5 — STORY-106
 * Tests unitaires : getActiveMemberCount + getCoupleState
 */
import { describe, it, expect } from "vitest";
import { getActiveMemberCount, getCoupleState } from "@/lib/couple-hub";

describe("getActiveMemberCount (STORY-106)", () => {
  it("TU-106-1 : retourne 1 si 1 membre actif", () => {
    const members = [
      { status: "active" },
      { status: "inactive" },
    ];
    expect(getActiveMemberCount(members)).toBe(1);
  });

  it("TU-106-2 : retourne 2 si 2 membres actifs", () => {
    const members = [
      { status: "active" },
      { status: "active" },
    ];
    expect(getActiveMemberCount(members)).toBe(2);
  });

  it("retourne 0 si aucun membre actif", () => {
    const members = [
      { status: "inactive" },
      { status: "left" },
    ];
    expect(getActiveMemberCount(members)).toBe(0);
  });

  it("retourne 0 pour un tableau vide", () => {
    expect(getActiveMemberCount([])).toBe(0);
  });
});

describe("getCoupleState (STORY-106)", () => {
  it("TU-106-3 : retourne 'none' si couple=null", () => {
    expect(getCoupleState(null, 0)).toBe("none");
  });

  it("TU-106-4 : retourne 'pending' si 1 membre actif", () => {
    const couple = { id: "c-1" };
    expect(getCoupleState(couple, 1)).toBe("pending");
  });

  it("TU-106-5 : retourne 'complete' si 2 membres actifs", () => {
    const couple = { id: "c-1" };
    expect(getCoupleState(couple, 2)).toBe("complete");
  });

  it("retourne 'pending' si 0 membre mais couple existe", () => {
    const couple = { id: "c-1" };
    expect(getCoupleState(couple, 0)).toBe("pending");
  });

  it("retourne 'complete' si plus de 2 membres actifs", () => {
    const couple = { id: "c-1" };
    expect(getCoupleState(couple, 3)).toBe("complete");
  });
});
