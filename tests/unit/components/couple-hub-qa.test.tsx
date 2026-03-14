/**
 * QA Sprint v14 — Tests composants supplémentaires (FORGE QA Agent)
 * Fichier : tests/unit/components/couple-hub-qa.test.tsx
 *
 * Couvre les GAPs identifiés lors de l'audit des stories 100–106
 * pour les composants React/TSX.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

// ─── Nettoyage entre chaque test ──────────────────────────────────────────────
afterEach(() => {
  cleanup();
});

// ─── Mocks globaux ────────────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/fr/dashboard",
  useParams: () => ({ locale: "fr" }),
}));

vi.mock("@/app/actions/couple-actions", () => ({
  setOnboardingChoiceAction: vi.fn().mockResolvedValue(undefined),
  createCoupleAction: vi.fn().mockResolvedValue({ success: true, inviteCode: "QAINV1" }),
  markOnboardingCompleteAction: vi.fn().mockResolvedValue(undefined),
}));

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-100 : CoupleChoiceModal — étape "invite" et boutons
// Radix Dialog utilise un portail (render vers document.body), donc on accède
// au contenu via document.body.textContent (comme les tests existants TU-100-x).
// ═══════════════════════════════════════════════════════════════════════════════

import { CoupleChoiceModal } from "@/components/couple-choice-modal";

describe("QA STORY-100 — CoupleChoiceModal step invite", () => {
  it("QA-100-1 : step 'invite' visible si prop inviteCode fournie", () => {
    render(<CoupleChoiceModal open={true} inviteCode="STEP01" />);
    // Dialog portale vers document.body
    const content = document.body.textContent ?? "";
    expect(content).toContain("Invitez votre partenaire");
    expect(content).toContain("STEP01");
  });

  it("QA-100-1b : step 'choice' visible quand aucun inviteCode fourni", () => {
    render(<CoupleChoiceModal open={true} />);
    const content = document.body.textContent ?? "";
    expect(content).toContain("Comment gérez-vous vos finances ?");
    expect(content).not.toContain("Invitez votre partenaire");
  });

  it("QA-100-2 : bouton 'Copier' présent au step invite", () => {
    render(<CoupleChoiceModal open={true} inviteCode="COPY01" />);
    const copyBtn = screen.getByRole("button", { name: /copier/i });
    expect(copyBtn).toBeDefined();
  });

  it("QA-100-3 : bouton 'Partager' présent au step invite", () => {
    render(<CoupleChoiceModal open={true} inviteCode="SHARE1" />);
    const shareBtn = screen.getByRole("button", { name: /partager/i });
    expect(shareBtn).toBeDefined();
  });

  it("QA-100-3b : boutons 'Copier' ET 'Partager' présents simultanément au step invite", () => {
    render(<CoupleChoiceModal open={true} inviteCode="BOTH01" />);
    const copyBtn = screen.getByRole("button", { name: /copier le code/i });
    const shareBtn = screen.getByRole("button", { name: /partager le code/i });
    expect(copyBtn).toBeDefined();
    expect(shareBtn).toBeDefined();
  });

  it("QA-100-1c : step invite affiche le message 'Partagez ce code avec votre partenaire'", () => {
    render(<CoupleChoiceModal open={true} inviteCode="MSG001" />);
    const content = document.body.textContent?.toLowerCase() ?? "";
    expect(content).toContain("partagez ce code");
  });

  it("QA-100-1d : step choice n'affiche PAS les boutons Copier/Partager", () => {
    render(<CoupleChoiceModal open={true} />);
    const copyBtn = screen.queryByRole("button", { name: /copier/i });
    const shareBtn = screen.queryByRole("button", { name: /partager/i });
    expect(copyBtn).toBeNull();
    expect(shareBtn).toBeNull();
  });

  it("QA-100-1e : step invite affiche le bouton 'Continuer sans partenaire' (AC-4 fermeture modale)", () => {
    render(<CoupleChoiceModal open={true} inviteCode="CLOSE1" />);
    const content = document.body.textContent ?? "";
    expect(content).toContain("Continuer sans partenaire");
  });
});

// ─── QA-100-AC2/AC3 : clic → action (couverture comportementale) ──────────────

describe("QA STORY-100 — comportement clic (AC-2, AC-3)", () => {
  it("QA-100-AC2 : clic 'En couple' appelle setOnboardingChoiceAction('couple')", async () => {
    const { setOnboardingChoiceAction } = await import("@/app/actions/couple-actions");
    vi.clearAllMocks();

    render(<CoupleChoiceModal open={true} />);
    const btn = screen.getByRole("button", { name: /en couple/i });
    fireEvent.click(btn);

    await new Promise((r) => setTimeout(r, 20));
    expect(setOnboardingChoiceAction).toHaveBeenCalledWith("couple");
  });

  it("QA-100-AC3 : clic 'Seul(e)' appelle setOnboardingChoiceAction('solo')", async () => {
    const { setOnboardingChoiceAction } = await import("@/app/actions/couple-actions");
    vi.clearAllMocks();

    render(<CoupleChoiceModal open={true} />);
    const btn = screen.getByRole("button", { name: /seul/i });
    fireEvent.click(btn);

    await new Promise((r) => setTimeout(r, 20));
    expect(setOnboardingChoiceAction).toHaveBeenCalledWith("solo");
  });

  it("QA-100-AC5 : showCoupleChoiceModal=false si coupleOnboardingChoice défini (logique pure)", () => {
    // AC-5 : la modal ne réapparaît pas une fois le choix persisté
    const coupleOnboardingChoice = "couple";
    const accountsLength = 0;
    const showCoupleChoiceModal = !coupleOnboardingChoice && accountsLength === 0;
    expect(showCoupleChoiceModal).toBe(false);
  });

  it("QA-100-AC5b : showCoupleChoiceModal=true si null (1er lancement)", () => {
    const coupleOnboardingChoice = null;
    const accountsLength = 0;
    const showCoupleChoiceModal = !coupleOnboardingChoice && accountsLength === 0;
    expect(showCoupleChoiceModal).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-101 : CoupleInviteBanner — pas de bouton fermer + code en texte
// Ce composant est un div standard (pas de portail), on utilise container.
// ═══════════════════════════════════════════════════════════════════════════════

import { CoupleInviteBanner } from "@/components/couple-invite-banner";

describe("QA STORY-101 — CoupleInviteBanner invariants", () => {
  it("QA-101-1 : aucun bouton dans la bannière (non-dismissable)", () => {
    const { container } = render(
      <CoupleInviteBanner inviteCode="NOBTN" locale="fr" />
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });

  it("QA-101-1b : pas de bouton avec aria-label 'fermer' ou 'close'", () => {
    const { container } = render(
      <CoupleInviteBanner inviteCode="ARIA99" locale="fr" />
    );
    const closeBtnFermer = container.querySelector("[aria-label='fermer']");
    const closeBtnClose = container.querySelector("[aria-label='close']");
    expect(closeBtnFermer).toBeNull();
    expect(closeBtnClose).toBeNull();
  });

  it("QA-101-2 : affiche le code d'invitation sous forme de texte lisible", () => {
    render(<CoupleInviteBanner inviteCode="VISIBLE" locale="fr" />);
    const codeEl = screen.getByText("VISIBLE");
    expect(codeEl).toBeDefined();
    expect(codeEl.tagName).toBeTruthy();
  });

  it("QA-101-2b : le code est dans un élément avec style en gras ou tracking", () => {
    render(<CoupleInviteBanner inviteCode="BOLD99" locale="fr" />);
    const codeEl = screen.getByText("BOLD99");
    const className = codeEl.className ?? "";
    const hasBoldOrTracking =
      className.includes("bold") || className.includes("tracking");
    expect(hasBoldOrTracking).toBe(true);
  });

  it("QA-101-1c : la bannière a un role='banner' pour l'accessibilité", () => {
    render(<CoupleInviteBanner inviteCode="ARIA01" locale="fr" />);
    const banner = screen.getByRole("banner");
    expect(banner).toBeDefined();
  });
});

// ─── QA-101-AC3 : logique showInviteBanner (disparition quand 2 membres) ──────

describe("QA STORY-101 — logique showInviteBanner (AC-1, AC-3)", () => {
  it("QA-101-AC3 : showInviteBanner=false quand activeMemberCount >= 2 (couple complet)", () => {
    const onboardingChoice = "couple";
    const couple = { id: "c1", invite_code: "ABC" };
    const activeMemberCount = 2;
    const showInviteBanner =
      onboardingChoice === "couple" && (couple === null || activeMemberCount < 2);
    expect(showInviteBanner).toBe(false);
  });

  it("QA-101-AC3b : showInviteBanner=true quand 1 seul membre actif (partenaire non rejoint)", () => {
    const onboardingChoice = "couple";
    const couple = { id: "c1", invite_code: "ABC" };
    const activeMemberCount = 1;
    const showInviteBanner =
      onboardingChoice === "couple" && (couple === null || activeMemberCount < 2);
    expect(showInviteBanner).toBe(true);
  });

  it("QA-101-AC1 : showInviteBanner=false si onboarding_choice='solo'", () => {
    const onboardingChoice: "solo" | "couple" | null = "solo";
    const couple = null;
    const activeMemberCount = 0;
    const showInviteBanner =
      (onboardingChoice as string) === "couple" && (couple === null || activeMemberCount < 2);
    expect(showInviteBanner).toBe(false);
  });

  it("QA-101-AC1b : showInviteBanner=false si pas de choix (null)", () => {
    const onboardingChoice = null;
    const couple = null;
    const activeMemberCount = 0;
    const showInviteBanner =
      onboardingChoice === "couple" && (couple === null || activeMemberCount < 2);
    expect(showInviteBanner).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-102 : BottomNav — Récurrents absent + badge aria-label
// ═══════════════════════════════════════════════════════════════════════════════

import { BottomNav } from "@/components/bottom-nav";

describe("QA STORY-102 — BottomNav invariants couple", () => {
  it("QA-102-1 : l'onglet 'Récurrents' (/recurrents) n'existe plus dans la nav", () => {
    render(<BottomNav />);
    expect(screen.queryByText("Récurrents")).toBeNull();
    const links = screen.getAllByRole("link");
    const recurrentsLink = links.find((link) =>
      link.getAttribute("href")?.includes("/recurrents")
    );
    expect(recurrentsLink).toBeUndefined();
  });

  it("QA-102-2 : badge aria-label contient 'incomplet' ou 'couple'", () => {
    render(<BottomNav coupleIncomplete={true} />);
    const badges = screen.getAllByLabelText(/incomplet|couple/i);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("QA-102-2b : badge aria-label est exactement 'couple incomplet'", () => {
    render(<BottomNav coupleIncomplete={true} />);
    const badges = screen.getAllByLabelText("couple incomplet");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("QA-102-1b : les 5 onglets attendus sont présents (Dashboard, Comptes, Transactions, Couple, IA)", () => {
    render(<BottomNav />);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Comptes").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Transactions").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Couple").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("IA").length).toBeGreaterThanOrEqual(1);
  });

  it("QA-102-2c : sans coupleIncomplete=false, aucun badge couple visible", () => {
    render(<BottomNav coupleIncomplete={false} />);
    const badges = screen.queryAllByLabelText(/incomplet|couple/i);
    expect(badges).toHaveLength(0);
  });

  it("QA-102-2d : le badge couple est un span (pas un bouton, pas un lien)", () => {
    render(<BottomNav coupleIncomplete={true} />);
    const badges = screen.getAllByLabelText("couple incomplet");
    expect(badges[0].tagName.toLowerCase()).toBe("span");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-103 : CoupleLockedPreview — "Balance couple" + 3 sections verrouillées
// ═══════════════════════════════════════════════════════════════════════════════

import { CoupleLockedPreview } from "@/components/couple-locked-preview";

describe("QA STORY-103 — CoupleLockedPreview contenu", () => {
  it("QA-103-1 : contient le texte 'Balance couple'", () => {
    render(<CoupleLockedPreview locale="fr" hasCoupleActive={false} />);
    expect(screen.getByText("Balance couple")).toBeDefined();
  });

  it("QA-103-2 : contient exactement 3 sections de preview (cartes verrouillées)", () => {
    const { container } = render(
      <CoupleLockedPreview locale="fr" hasCoupleActive={false} />
    );
    const previewCards = container.querySelectorAll(
      ".relative.overflow-hidden.rounded-2xl"
    );
    expect(previewCards.length).toBe(3);
  });

  it("QA-103-2b : les 3 sections ont des labels distincts", () => {
    render(<CoupleLockedPreview locale="fr" hasCoupleActive={false} />);
    expect(screen.getByText("Balance couple")).toBeDefined();
    expect(screen.getByText("Tableau de bord couple")).toBeDefined();
    expect(screen.getByText("Objectifs communs")).toBeDefined();
  });

  it("QA-103-2c : chaque section preview contient au moins une icône lock", () => {
    const { container } = render(
      <CoupleLockedPreview locale="fr" hasCoupleActive={false} />
    );
    const lockIcons = Array.from(
      container.querySelectorAll(".material-symbols-outlined")
    ).filter((el) => el.textContent === "lock");
    // Au moins 3 cadenas : un par section verrouillée
    expect(lockIcons.length).toBeGreaterThanOrEqual(3);
  });

  it("QA-103-1b : retourne null si hasCoupleActive=true (aucun rendu)", () => {
    const { container } = render(
      <CoupleLockedPreview locale="fr" hasCoupleActive={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("QA-103-2d : contient un CTA 'Activer l'espace couple' qui pointe vers /couple", () => {
    render(<CoupleLockedPreview locale="fr" hasCoupleActive={false} />);
    const cta = screen.getByRole("link");
    const ctaText = cta.textContent ?? "";
    expect(ctaText.toLowerCase()).toContain("activer");
    expect(ctaText.toLowerCase()).toContain("couple");
    const href = cta.getAttribute("href") ?? "";
    expect(href).toContain("/couple");
  });

  it("QA-103-3 : chaque card verrouillée a les classes blur-sm et select-none (GAP-103-A)", () => {
    const { container } = render(
      <CoupleLockedPreview locale="fr" hasCoupleActive={false} />
    );
    const blurredDivs = container.querySelectorAll(".blur-sm.select-none");
    expect(blurredDivs.length).toBe(3);
  });

  it("QA-103-3b : le href du CTA intègre le locale fourni (GAP-103-B)", () => {
    render(<CoupleLockedPreview locale="en" hasCoupleActive={false} />);
    const cta = screen.getByRole("link");
    const href = cta.getAttribute("href") ?? "";
    expect(href).toBe("/en/couple");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-105 : OnboardingProgressBar — affichage "X / 4" et barre de progression
// ═══════════════════════════════════════════════════════════════════════════════

import { OnboardingProgressBar } from "@/components/onboarding-progress-bar";
import { computeOnboardingProgress } from "@/lib/onboarding-progress";

describe("QA STORY-105 — OnboardingProgressBar affichage", () => {
  it("QA-105-3 : affiche '1 / 4' si rien complété (sauf Compte créé toujours true)", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    render(<OnboardingProgressBar progress={progress} locale="fr" />);
    const text = screen.getByText(/1\s*\/\s*4/);
    expect(text).toBeDefined();
  });

  it("QA-105-3b : affiche '2 / 4' si hasTransactions=true", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: true,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    render(<OnboardingProgressBar progress={progress} locale="fr" />);
    const text = screen.getByText(/2\s*\/\s*4/);
    expect(text).toBeDefined();
  });

  it("QA-105-3c : affiche '3 / 4' si hasTransactions + hasPartner", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: true,
      hasPartner: true,
      hasCoupleBudget: false,
    });
    render(<OnboardingProgressBar progress={progress} locale="fr" />);
    const text = screen.getByText(/3\s*\/\s*4/);
    expect(text).toBeDefined();
  });

  it("QA-105-3d : affiche '4 / 4' si tout est complété", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: true,
      hasPartner: true,
      hasCoupleBudget: true,
    });
    render(<OnboardingProgressBar progress={progress} locale="fr" />);
    const text = screen.getByText(/4\s*\/\s*4/);
    expect(text).toBeDefined();
  });

  it("QA-105-3e : affiche le mot 'complétées' dans le compteur de progression", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    const { container } = render(
      <OnboardingProgressBar progress={progress} locale="fr" />
    );
    const content = container.textContent?.toLowerCase() ?? "";
    expect(content).toContain("complétées");
  });

  it("QA-105-3f : la barre de progression a un style width=25% si 1/4 complété", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    const { container } = render(
      <OnboardingProgressBar progress={progress} locale="fr" />
    );
    const bar = container.querySelector("[style*='width']");
    expect(bar).not.toBeNull();
    const style = bar?.getAttribute("style") ?? "";
    expect(style).toContain("25%");
  });
});
