import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import manifest from "@/app/manifest";

describe("PWA Manifest", () => {
  const data = manifest();

  it("TU-1-1 : display est 'standalone'", () => {
    expect(data.display).toBe("standalone");
  });

  it("TU-1-2 : le manifest contient 2 icônes (192 et 512)", () => {
    expect(data.icons).toHaveLength(2);
    const sizes = data.icons!.map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("TU-1-3 : start_url est '/'", () => {
    expect(data.start_url).toBe("/");
  });

  it("TU-1-4 : theme_color est défini et non vide", () => {
    expect(data.theme_color).toBeTruthy();
    expect(typeof data.theme_color).toBe("string");
    expect((data.theme_color as string).length).toBeGreaterThan(0);
  });

  it("TU-1-5 : les icônes existent dans /public/icons/", () => {
    const root = join(process.cwd(), "public", "icons");
    expect(existsSync(join(root, "icon-192.png"))).toBe(true);
    expect(existsSync(join(root, "icon-512.png"))).toBe(true);
  });
});
