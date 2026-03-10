/**
 * STORY-155 — TC-155-1, TC-155-2 : Formulaire newsletter dans blog-content
 * Vérification statique du source code (pas de DOM rendering)
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/app/[locale]/(marketing)/blog/blog-content.tsx"),
  "utf-8"
);

describe("Newsletter form dans BlogContent (STORY-155)", () => {
  it("TC-155-1 : contient un champ honeypot hidden nommé 'website'", () => {
    expect(source).toContain('name="website"');
    expect(source).toContain("aria-hidden");
    expect(source).toContain("tabIndex={-1}");
  });

  it("TC-155-2 : affiche un message de succès après soumission", () => {
    expect(source).toContain("newsletter-success");
    expect(source).toContain("newsletterStatus");
  });

  it("le formulaire appelle subscribeNewsletterAction", () => {
    expect(source).toContain("subscribeNewsletterAction");
  });

  it("le champ email a l'attribut name='email' et required", () => {
    expect(source).toContain('name="email"');
    expect(source).toContain("required");
  });

  it("le bouton est désactivé pendant la soumission (isPending)", () => {
    expect(source).toContain("disabled={isPending}");
    expect(source).toContain("Envoi...");
  });

  it("affiche un message d'erreur quand la soumission échoue", () => {
    expect(source).toContain("newsletter-error");
  });
});
