import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SRC = join(process.cwd(), "src");

describe("STORY-136 — 2FA TOTP", () => {
  const authSource = readFileSync(join(SRC, "lib/auth.ts"), "utf-8");
  const authClientSource = readFileSync(join(SRC, "lib/auth-client.ts"), "utf-8");

  // AC-1 : Plugin twoFactor configuré côté serveur
  it("AC-1 auth.ts importe et configure le plugin twoFactor", () => {
    expect(authSource).toContain('import { twoFactor } from "better-auth/plugins"');
    expect(authSource).toContain("twoFactor(");
    expect(authSource).toContain("Koupli");
  });

  // AC-1 : Plugin twoFactorClient configuré côté client
  it("AC-1 auth-client.ts importe et configure twoFactorClient", () => {
    expect(authClientSource).toContain('import { twoFactorClient } from "better-auth/client/plugins"');
    expect(authClientSource).toContain("twoFactorClient(");
    expect(authClientSource).toContain("two-factor");
  });

  // AC-1 : Composant TwoFactorSetup existe
  it("AC-1 TwoFactorSetup component exists", () => {
    expect(existsSync(join(SRC, "components/two-factor-setup.tsx"))).toBe(true);
  });

  // AC-1 : TwoFactorSetup gère activation avec mot de passe
  it("AC-1 TwoFactorSetup demande un mot de passe pour activer", () => {
    const source = readFileSync(join(SRC, "components/two-factor-setup.tsx"), "utf-8");
    expect(source).toContain("twoFactor.enable");
    expect(source).toContain("password");
    expect(source).toContain("totpURI");
    expect(source).toContain("backupCodes");
  });

  // AC-1 : QR code affiché + clé secrète copiable (accessibilité)
  it("AC-1 TwoFactorSetup affiche QR code et clé secrète copiable", () => {
    const source = readFileSync(join(SRC, "components/two-factor-setup.tsx"), "utf-8");
    expect(source).toContain("QR Code TOTP");
    expect(source).toContain("secretKey");
    expect(source).toContain("select-all");
  });

  // AC-2 : Page two-factor pour vérification à la connexion
  it("AC-2 page two-factor existe pour vérification à la connexion", () => {
    expect(existsSync(join(SRC, "app/[locale]/(auth)/two-factor/page.tsx"))).toBe(true);
    const source = readFileSync(join(SRC, "app/[locale]/(auth)/two-factor/page.tsx"), "utf-8");
    expect(source).toContain("TwoFactorVerify");
  });

  // AC-2 : TwoFactorVerify vérifie le code TOTP
  it("AC-2 TwoFactorVerify appelle verifyTOTP et redirige vers dashboard", () => {
    const source = readFileSync(join(SRC, "components/two-factor-verify.tsx"), "utf-8");
    expect(source).toContain("twoFactor.verifyTotp");
    expect(source).toContain('"/dashboard"');
    expect(source).toContain("trustDevice");
  });

  // AC-3 : Codes de récupération — bascule possible dans TwoFactorVerify
  it("AC-3 TwoFactorVerify supporte les codes de récupération", () => {
    const source = readFileSync(join(SRC, "components/two-factor-verify.tsx"), "utf-8");
    expect(source).toContain("useBackup");
    expect(source).toContain("code de récupération");
  });

  // AC-4 : Désactivation 2FA avec mot de passe
  it("AC-4 TwoFactorSetup permet de désactiver le 2FA avec mot de passe", () => {
    const source = readFileSync(join(SRC, "components/two-factor-setup.tsx"), "utf-8");
    expect(source).toContain("twoFactor.disable");
    expect(source).toContain("Désactiver le 2FA");
  });

  // AC-5 : Section sécurité dans les paramètres
  it("AC-5 page paramètres inclut la section sécurité 2FA", () => {
    const source = readFileSync(join(SRC, "app/[locale]/(app)/parametres/page.tsx"), "utf-8");
    expect(source).toContain("TwoFactorSetup");
    expect(source).toContain("Sécurité");
    expect(source).toContain("twoFactorEnabled");
  });

  // AC-6 : Redirection client configurée vers /two-factor
  it("AC-6 auth-client redirige vers /two-factor quand 2FA requis", () => {
    expect(authClientSource).toContain("onTwoFactorRedirect");
    expect(authClientSource).toContain("/two-factor");
  });
});
