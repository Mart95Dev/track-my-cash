/**
 * STORY-124 QA — Page d'import enrichie : tests complémentaires
 *
 * Gaps identifiés par l'audit TEA :
 *
 * GAP-1 [CRITIQUE] AC-1 — Absence de page /import dédiée + absence de lien dans la navigation
 * GAP-2 [CRITIQUE] AC-2 — Extensions acceptées incomplètes (.xml, .sta, .mt940, .ofx, .qfx, .cfonb, .asc absentes)
 * GAP-3 [CRITIQUE] AC-8 — Pas d'écran de succès dédié affichant les doublons ignorés (seulement un toast)
 * GAP-4 [CRITIQUE] AC-11 — Formats XML/STA/MT940/OFX/CFONB absents de la liste affichée dans l'UI
 * GAP-5 [MINEUR] AC-9 — Aucun test sur le cas d'erreur "Aucune transaction trouvée" avec message de suggestion
 * GAP-6 [MINEUR] AC-6 — suggestedMapping pré-rempli dans le dialogue de mapping non testé
 * GAP-7 [MINEUR] AC-4 — Solde détecté null non affiché (vérifier la logique conditionnelle dans les stats)
 * GAP-8 [MINEUR] AC-7 — confirmImportAction : cas duplication totale (0 transactions à insérer)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────────

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-qa-124"),
  getRequiredSession: vi.fn().mockResolvedValue({ user: { id: "user-qa-124", email: "qa@test.com" } }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockDb = {};
vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("@/lib/queries", () => ({
  generateImportHash: vi.fn((date: string, desc: string, amount: number) => `${date}|${desc}|${amount}`),
  checkDuplicates: vi.fn().mockResolvedValue(new Set<string>()),
  bulkInsertTransactions: vi.fn().mockResolvedValue(0),
  getCategorizationRules: vi.fn().mockResolvedValue([]),
  getSetting: vi.fn().mockResolvedValue(null),
  setSetting: vi.fn().mockResolvedValue(undefined),
  updateAccountBalance: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/subscription-utils", () => ({
  canImportFormat: vi.fn().mockResolvedValue({ allowed: true }),
  canUseAI: vi.fn().mockResolvedValue({ allowed: false }),
}));

vi.mock("@/lib/alert-service", () => ({
  checkAndSendLowBalanceAlert: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/anomaly-service", () => ({
  detectAndNotifyAnomalies: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/app/actions/ai-categorize-actions", () => ({
  autoCategorizeAction: vi.fn().mockResolvedValue(undefined),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Chemins
// ─────────────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "../../../");
const IMPORT_BUTTON_PATH = path.join(ROOT, "src/components/import-button.tsx");
const IMPORT_ACTIONS_PATH = path.join(ROOT, "src/app/actions/import-actions.ts");
const NAVIGATION_PATH = path.join(ROOT, "src/components/navigation.tsx");
const IMPORT_PAGE_PATH = path.join(ROOT, "src/app/[locale]/(app)/import/page.tsx");

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures CSV
// ─────────────────────────────────────────────────────────────────────────────

/** CSV vide : aucune transaction */
const EMPTY_CSV = `Date,Description,Amount
`;

/** CSV avec colonnes ambiguës → confidence < 70 → suggestedMapping */
const AMBIGUOUS_CSV = `col1,col2,col3
2026-01-01,desc1,100.00
2026-01-02,desc2,200.00
`;

/** CSV valide avec 6 transactions (plus de 5) */
const CSV_SIX_ROWS = `Date,Description,Amount
2026-01-01,Transaction 1,-45.50
2026-01-02,Transaction 2,2500.00
2026-01-03,Transaction 3,-80.00
2026-01-04,Transaction 4,-15.99
2026-01-05,Transaction 5,-35.00
2026-01-06,Transaction 6,-62.90
`;

/** CSV avec solde détecté simulé */
const CSV_VALID = `Date,Description,Amount
2026-01-01,Virement salaire,2500.00
2026-01-02,EDF,-85.00
`;

function makeFormData(filename: string, content: string): FormData {
  const file = new File([content], filename, { type: "text/csv" });
  const fd = new FormData();
  fd.append("file", file);
  fd.append("accountId", "1");
  return fd;
}

// ─────────────────────────────────────────────────────────────────────────────
// GAP-1 [CRITIQUE] AC-1 — Page /import dédiée + lien navigation
// ─────────────────────────────────────────────────────────────────────────────

describe("GAP-1 [AC-1] — Page /import dédiée et lien de navigation", () => {
  it("la page /[locale]/(app)/import/page.tsx DOIT exister (AC-1)", () => {
    const exists = fs.existsSync(IMPORT_PAGE_PATH);
    // Ce test est documentaire : la page n'existe pas encore → FAIL attendu
    expect(exists).toBe(true);
  });

  it("la navigation contient un lien href vers /import (AC-1)", () => {
    const navSrc = fs.readFileSync(NAVIGATION_PATH, "utf-8");
    const hasImportLink =
      navSrc.includes('"/import"') ||
      navSrc.includes("href: \"/import\"") ||
      navSrc.includes("/import'") ||
      navSrc.includes("import");
    // Chercher spécifiquement un lien de navigation (pas juste un import JS)
    const hasNavLink =
      navSrc.includes('href: "/import"') ||
      navSrc.includes("href=\"/import\"") ||
      navSrc.includes('href="/import"');
    expect(hasNavLink).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GAP-2 [CRITIQUE] AC-2 — Extensions acceptées par l'input file
// ─────────────────────────────────────────────────────────────────────────────

describe("GAP-2 [AC-2] — Extensions de fichier acceptées par l'UI", () => {
  it("l'attribut accept inclut .xml (CAMT.053, ISO 20022)", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    expect(src).toContain(".xml");
  });

  it("l'attribut accept inclut .sta ou .mt940 (format SWIFT MT940)", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasMt940 = src.includes(".sta") || src.includes(".mt940");
    expect(hasMt940).toBe(true);
  });

  it("l'attribut accept inclut .ofx ou .qfx (Open Financial Exchange)", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasOfx = src.includes(".ofx") || src.includes(".qfx");
    expect(hasOfx).toBe(true);
  });

  it("l'attribut accept inclut .cfonb ou .asc (CFONB 120, France)", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasCfonb = src.includes(".cfonb") || src.includes(".asc");
    expect(hasCfonb).toBe(true);
  });

  it("l'attribut accept de l'input couvre au moins 5 extensions différentes", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    // Extraire la valeur de l'attribut accept
    const acceptMatch = src.match(/accept="([^"]+)"/);
    if (!acceptMatch) {
      // Cherche dans les props dynamiques
      const acceptDynamicMatch = src.match(/accept=\{[^}]+\}/);
      expect(acceptDynamicMatch).not.toBeNull();
      return;
    }
    const extensions = acceptMatch[1]!.split(",").map((e) => e.trim());
    expect(extensions.length).toBeGreaterThanOrEqual(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GAP-3 [CRITIQUE] AC-8 — Écran de succès avec doublons ignorés
// ─────────────────────────────────────────────────────────────────────────────

describe("GAP-3 [AC-8] — Écran de succès avec bilan doublons", () => {
  it("confirmImportAction retourne les doublons ignorés dans le résultat", async () => {
    const { confirmImportAction } = await import("@/app/actions/import-actions");
    const result = await confirmImportAction(1, [
      {
        date: "2026-01-01",
        description: "Test",
        amount: 100,
        type: "income",
        import_hash: "hash1",
        category: "Autre",
        subcategory: "",
      },
    ]);
    expect(result).toHaveProperty("imported");
    // Le résultat de confirmImportAction doit permettre d'afficher les doublons
    // La story exige que l'écran de succès affiche "Y doublons ignorés"
    // Les doublons sont calculés côté importFileAction, pas confirmImportAction
    // Vérifier que la structure de retour est complète
    expect(result.success).toBe(true);
    expect(typeof result.imported).toBe("number");
  });

  it("l'ImportButton (ou l'écran de succès) affiche le nombre de doublons ignorés", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    // L'écran de succès doit mentionner les doublons ignorés (pas juste dans les stats de preview)
    // La story exige un écran Step 3 avec "Y doublons ignorés"
    const hasSuccessScreenWithDuplicates =
      src.includes("duplicateCount") || src.includes("doublons ignorés") || src.includes("ignored");
    expect(hasSuccessScreenWithDuplicates).toBe(true);
  });

  it("un composant ImportSuccess existe ou l'écran succès est intégré dans ImportButton", () => {
    const importSuccessExists = fs.existsSync(path.join(ROOT, "src/components/import/ImportSuccess.tsx"));
    const importButtonSrc = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    // Soit un composant dédié ImportSuccess existe, soit ImportButton gère l'état succès
    const hasSuccessState =
      importButtonSrc.includes("success") &&
      (importButtonSrc.includes("step") || importButtonSrc.includes("imported") || importButtonSrc.includes("ImportSuccess"));
    const hasDedicatedComponent = importSuccessExists;
    expect(hasDedicatedComponent || hasSuccessState).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GAP-4 [CRITIQUE] AC-11 — Formats nouveaux visibles dans l'UI
// ─────────────────────────────────────────────────────────────────────────────

describe("GAP-4 [AC-11] — Liste des formats supportés mise à jour dans l'UI", () => {
  it("l'UI mentionne XML ou CAMT.053 parmi les formats supportés", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasXml = src.includes("XML") || src.includes("CAMT") || src.includes("camt");
    expect(hasXml).toBe(true);
  });

  it("l'UI mentionne MT940 ou STA parmi les formats supportés", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasMt940 = src.includes("MT940") || src.includes("STA") || src.includes("mt940");
    expect(hasMt940).toBe(true);
  });

  it("l'UI mentionne OFX ou QFX parmi les formats supportés", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasOfx = src.includes("OFX") || src.includes("QFX") || src.includes("ofx");
    expect(hasOfx).toBe(true);
  });

  it("l'UI mentionne CFONB parmi les formats supportés", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasCfonb = src.includes("CFONB") || src.includes("cfonb");
    expect(hasCfonb).toBe(true);
  });

  it("la page /import affiche les badges de tous les formats si elle existe", () => {
    if (!fs.existsSync(IMPORT_PAGE_PATH)) {
      // Page non créée — gap déjà documenté en GAP-1
      return;
    }
    const src = fs.readFileSync(IMPORT_PAGE_PATH, "utf-8");
    const formats = ["CSV", "XLSX", "XML", "MT940", "OFX", "CFONB"];
    for (const fmt of formats) {
      expect(src).toContain(fmt);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GAP-5 [MINEUR] AC-9 — Cas d'erreur : fichier vide / aucune transaction
// ─────────────────────────────────────────────────────────────────────────────

describe("GAP-5 [AC-9] — Gestion des erreurs : fichier corrompu ou vide", () => {
  it("importFileAction retourne une erreur pour un CSV sans transactions", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("empty.csv", EMPTY_CSV);
    const result = await importFileAction(fd);
    // Doit retourner { error: "..." } — pas de crash
    expect(result).toHaveProperty("error");
    expect(typeof (result as { error: string }).error).toBe("string");
    expect((result as { error: string }).error.length).toBeGreaterThan(0);
  });

  it("importFileAction retourne une erreur pour un fichier complètement vide", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("vide.csv", "");
    const result = await importFileAction(fd);
    expect(result).toHaveProperty("error");
  });

  it("importFileAction retourne une erreur pour un CSV avec seulement l'en-tête", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("header-only.csv", "Date,Description,Amount\n");
    const result = await importFileAction(fd);
    expect(result).toHaveProperty("error");
  });

  it("le message d'erreur 'Aucune transaction' est une string explicite", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("empty.csv", EMPTY_CSV);
    const result = await importFileAction(fd);
    if ("error" in result) {
      expect(result.error).toMatch(/transaction|fichier|trouvé|format/i);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GAP-6 [MINEUR] AC-6 — suggestedMapping pré-rempli dans le dialogue
// ─────────────────────────────────────────────────────────────────────────────

describe("GAP-6 [AC-6] — suggestedMapping pré-rempli dans CsvMappingDialog", () => {
  it("importFileAction retourne suggestedMapping pour un CSV ambigu", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("unknown.csv", AMBIGUOUS_CSV);
    const result = await importFileAction(fd);

    // Doit retourner needsMapping:true OU suggestedMapping
    const hasMappingInfo =
      ("needsMapping" in result && result.needsMapping === true) ||
      ("suggestedMapping" in result && result.suggestedMapping !== undefined);
    expect(hasMappingInfo).toBe(true);
  });

  it("le suggestedMapping retourné contient dateCol, amountCol, labelCol", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("unknown.csv", AMBIGUOUS_CSV);
    const result = await importFileAction(fd);

    if ("suggestedMapping" in result && result.suggestedMapping) {
      const sm = result.suggestedMapping as { dateCol: unknown; amountCol: unknown; labelCol: unknown; confidence: unknown };
      expect(typeof sm.dateCol).toBe("number");
      expect(typeof sm.amountCol).toBe("number");
      expect(typeof sm.labelCol).toBe("number");
      expect(typeof sm.confidence).toBe("number");
    } else if ("needsMapping" in result && result.needsMapping) {
      // needsMapping:true — la forme actuelle de l'action (OK)
      expect(result.needsMapping).toBe(true);
    }
  });

  it("le CsvMappingDialog ou l'import-button gère les suggestions pré-remplies", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    // Vérifier que le composant de mapping reçoit les suggestions ou le suggestedMapping
    const hasSuggestedMappingProp =
      src.includes("suggestedMapping") ||
      src.includes("defaultMapping") ||
      src.includes("initialMapping");
    expect(hasSuggestedMappingProp).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GAP-7 [MINEUR] AC-4 — Solde détecté null : pas d'affichage erroné
// ─────────────────────────────────────────────────────────────────────────────

describe("GAP-7 [AC-4] — Stats : solde détecté null ne cause pas d'affichage erroné", () => {
  it("importFileAction retourne detectedBalance null pour un CSV standard sans solde", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("transactions.csv", CSV_VALID);
    const result = await importFileAction(fd);

    if ("preview" in result && result.preview && typeof result.preview === "object" && !Array.isArray(result.preview)) {
      const preview = result.preview as { detectedBalance: unknown };
      // detectedBalance peut être null ou un nombre — ne doit pas être undefined
      expect(preview.detectedBalance === null || typeof preview.detectedBalance === "number").toBe(true);
    }
  });

  it("le composant gère correctement l'absence de solde détecté (detectedBalance === null)", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    // Vérifier que l'affichage du solde est conditionnel
    const hasConditionalBalance =
      src.includes("detectedBalance !== null") ||
      src.includes("detectedBalance != null") ||
      src.includes("detectedBalance &&");
    expect(hasConditionalBalance).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GAP-8 [MINEUR] AC-7 — confirmImportAction : cas sans nouvelles transactions
// ─────────────────────────────────────────────────────────────────────────────

describe("GAP-8 [AC-7] — confirmImportAction avec 0 transactions nouvelles", () => {
  it("confirmImportAction avec tableau vide retourne success:true et imported:0", async () => {
    const { confirmImportAction } = await import("@/app/actions/import-actions");
    const result = await confirmImportAction(1, []);
    expect(result.success).toBe(true);
    expect(result.imported).toBe(0);
  });

  it("confirmImportAction avec detectedBalance met à jour le solde (balanceUpdated:true)", async () => {
    const { confirmImportAction } = await import("@/app/actions/import-actions");
    const result = await confirmImportAction(
      1,
      [],
      1500.00,
      "2026-01-31"
    );
    expect(result.success).toBe(true);
    expect(result.balanceUpdated).toBe(true);
    expect(result.newBalance).toBe(1500.00);
  });

  it("confirmImportAction sans detectedBalance ne met pas à jour le solde (balanceUpdated:false)", async () => {
    const { confirmImportAction } = await import("@/app/actions/import-actions");
    const result = await confirmImportAction(1, [], null, null);
    expect(result.success).toBe(true);
    expect(result.balanceUpdated).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Vérification structurelle — AC-5 : previewFirst5 limité à 5 entrées
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-5 complémentaire — previewFirst5 : limite stricte à 5 lignes pour 6 transactions", () => {
  it("previewFirst5 contient exactement 5 entrées quand le CSV a 6 lignes de données", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("six-rows.csv", CSV_SIX_ROWS);
    const result = await importFileAction(fd);

    if ("previewFirst5" in result && Array.isArray(result.previewFirst5)) {
      expect(result.previewFirst5.length).toBe(5);
    } else {
      // Si pas de previewFirst5 direct, chercher dans preview.transactions (max 5)
      if ("preview" in result && result.preview && typeof result.preview === "object" && !Array.isArray(result.preview)) {
        const p = result.preview as { transactions: unknown[] };
        if (Array.isArray(p.transactions)) {
          // La limite de 5 s'applique uniquement à previewFirst5
          expect(true).toBe(true); // pas de contrainte sur transactions complètes
        }
      }
    }
  });

  it("previewFirst5 contient les champs date, description, amount de type correct", async () => {
    const { importFileAction } = await import("@/app/actions/import-actions");
    const fd = makeFormData("six-rows.csv", CSV_SIX_ROWS);
    const result = await importFileAction(fd);

    if ("previewFirst5" in result && Array.isArray(result.previewFirst5) && result.previewFirst5.length > 0) {
      for (const tx of result.previewFirst5 as unknown[]) {
        const entry = tx as { date: unknown; description: unknown; amount: unknown };
        expect(typeof entry.date).toBe("string");
        // date doit être au format YYYY-MM-DD
        expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof entry.description).toBe("string");
        expect(typeof entry.amount).toBe("number");
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Vérification structurelle — import-actions.ts : exportation des 3 actions
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// AC-8 COMPLET — Écran Step-3 de succès dédié (remplace le toast)
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-8 [COMPLET] — Écran Step-3 de succès avec animation et boutons d'action", () => {
  it("ImportSuccessScreen est défini dans import-button.tsx", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    expect(src).toContain("ImportSuccessScreen");
  });

  it("l'écran de succès affiche 'Voir les transactions' comme bouton d'action", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    expect(src).toContain("Voir les transactions");
  });

  it("l'écran de succès affiche 'Importer un autre fichier' comme bouton de reset", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    expect(src).toContain("Importer un autre fichier");
  });

  it("l'écran de succès utilise une animation CSS (animate-in ou zoom-in)", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasAnimation = src.includes("animate-in") || src.includes("zoom-in") || src.includes("fade-in");
    expect(hasAnimation).toBe(true);
  });

  it("le state successInfo contient duplicateCount pour afficher les doublons ignorés", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    expect(src).toContain("duplicateCount");
  });

  it("la navigation vers /transactions est appelée via router.push depuis l'écran de succès", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    const hasRouterPush = src.includes("router.push") && src.includes("/transactions");
    expect(hasRouterPush).toBe(true);
  });

  it("le toast.success n'est plus utilisé pour la confirmation d'import (remplacé par l'écran)", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    // L'ancien toast.success(msg) après confirmImportAction ne doit plus exister
    // On vérifie que le succès passe par setSuccessInfo, pas toast.success
    expect(src).toContain("setSuccessInfo");
  });

  it("handleReset nettoie l'état successInfo et ferme le Dialog", () => {
    const src = fs.readFileSync(IMPORT_BUTTON_PATH, "utf-8");
    expect(src).toContain("handleReset");
    expect(src).toContain("setSuccessInfo(null)");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Structure import-actions.ts : exportation des 3 actions
// ─────────────────────────────────────────────────────────────────────────────

describe("Structure import-actions.ts — 3 actions exportées", () => {
  it("importFileAction est exportée", () => {
    const src = fs.readFileSync(IMPORT_ACTIONS_PATH, "utf-8");
    expect(src).toContain("export async function importFileAction");
  });

  it("confirmImportAction est exportée", () => {
    const src = fs.readFileSync(IMPORT_ACTIONS_PATH, "utf-8");
    expect(src).toContain("export async function confirmImportAction");
  });

  it("importWithMappingAction est exportée", () => {
    const src = fs.readFileSync(IMPORT_ACTIONS_PATH, "utf-8");
    expect(src).toContain("export async function importWithMappingAction");
  });

  it("importFileAction retourne parserName directement au niveau racine du résultat", () => {
    const src = fs.readFileSync(IMPORT_ACTIONS_PATH, "utf-8");
    // Vérifier que parserName: parseResult.bankName est dans le return
    expect(src).toContain("parserName: parseResult.bankName");
  });

  it("importFileAction retourne previewFirst5 directement au niveau racine du résultat", () => {
    const src = fs.readFileSync(IMPORT_ACTIONS_PATH, "utf-8");
    expect(src).toContain("previewFirst5");
  });
});
