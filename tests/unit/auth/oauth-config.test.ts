import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const SRC = join(process.cwd(), "src");

describe("STORY-134/135 — OAuth Google", () => {
  const authSource = readFileSync(join(SRC, "lib/auth.ts"), "utf-8");

  // AC-1 : socialProviders Google configuré dans auth.ts
  it("AC-1 auth.ts configure Google socialProvider", () => {
    expect(authSource).toContain("google:");
    expect(authSource).toContain("GOOGLE_CLIENT_ID");
    expect(authSource).toContain("GOOGLE_CLIENT_SECRET");
  });

  // AC-2 : Apple retiré (pas de compte Apple Developer)
  it("AC-2 auth.ts ne configure pas Apple socialProvider", () => {
    expect(authSource).not.toContain("apple:");
    expect(authSource).not.toContain("APPLE_CLIENT_ID");
  });

  // AC-4 : Page connexion wire le bouton Google OAuth
  it("AC-4 connexion page wires Google OAuth button", () => {
    const connexion = readFileSync(
      join(SRC, "app/[locale]/(auth)/connexion/page.tsx"),
      "utf-8"
    );
    expect(connexion).toContain('provider: "google"');
    expect(connexion).toContain('callbackURL: "/dashboard"');
    expect(connexion).not.toContain('provider: "apple"');
  });

  // AC-5 : Page inscription wire le bouton Google OAuth
  it("AC-5 inscription page wires Google OAuth button", () => {
    const inscription = readFileSync(
      join(SRC, "app/[locale]/(auth)/inscription/page.tsx"),
      "utf-8"
    );
    expect(inscription).toContain('provider: "google"');
    expect(inscription).toContain('callbackURL: "/dashboard"');
    expect(inscription).not.toContain('provider: "apple"');
  });

  // AC-6 : Les deux pages importent authClient
  it("AC-6 both auth pages import authClient", () => {
    const connexion = readFileSync(
      join(SRC, "app/[locale]/(auth)/connexion/page.tsx"),
      "utf-8"
    );
    const inscription = readFileSync(
      join(SRC, "app/[locale]/(auth)/inscription/page.tsx"),
      "utf-8"
    );
    expect(connexion).toContain("authClient");
    expect(inscription).toContain("authClient");
  });
});
