import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { resolve } from "path";

const SRC = resolve(__dirname, "../../../src");

describe("Pages d'erreur — structure", () => {
  it("TU-1-1 : not-found.tsx localisé existe dans app/[locale]/", () => {
    const path = resolve(SRC, "app/[locale]/not-found.tsx");
    expect(existsSync(path)).toBe(true);
  });

  it("TU-1-2 : error.tsx existe dans app/[locale]/ et contient 'use client'", () => {
    const path = resolve(SRC, "app/[locale]/error.tsx");
    expect(existsSync(path)).toBe(true);
    const content = require("fs").readFileSync(path, "utf-8");
    expect(content).toContain('"use client"');
  });

  it("TU-1-3 : not-found.tsx global existe dans app/", () => {
    const path = resolve(SRC, "app/not-found.tsx");
    expect(existsSync(path)).toBe(true);
  });
});
