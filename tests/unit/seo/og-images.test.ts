import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { resolve } from "path";

const OG_DIR = resolve(process.cwd(), "public/og");

const EXPECTED_FILES = [
  "home.png",
  "tarifs.png",
  "fonctionnalites.png",
  "securite.png",
  "a-propos.png",
  "blog.png",
];

describe("OG Images — STORY-168", () => {
  it("TU-1: Les 6 fichiers OG existent", () => {
    for (const file of EXPECTED_FILES) {
      const filePath = resolve(OG_DIR, file);
      expect(existsSync(filePath), `${file} doit exister`).toBe(true);
    }
  });
});
