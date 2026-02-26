import { describe, it, expect } from "vitest";
import { mt940Parser } from "@/lib/parsers/mt940";
import type { ParseResult } from "@/lib/parsers/types";

// ─── Fixtures MT940 ───────────────────────────────────────────────────────────

const MT940_FULL = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR1500,00
:61:2401150115DR50,00NTRFNONREF
:86:VIREMENT SEPA RECU JEAN DUPONT REF 12345
:61:2401200120CR150,00NTRFNONREF
:86:SALAIRE JANVIER 2024
:62F:C240120EUR1600,00
`;

const MT940_DEBIT_DR = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR2000,00
:61:2401150115DR50,00NTRFNONREF
:86:PAIEMENT CARTE
:62F:C240115EUR1950,00
`;

const MT940_DEBIT_D = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR2000,00
:61:2401150115D50,00NTRFNONREF
:86:PAIEMENT CB
:62F:C240115EUR1950,00
`;

const MT940_CREDIT_CR = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR1000,00
:61:2401200120CR150,00NTRFNONREF
:86:SALAIRE JANVIER 2024
:62F:C240120EUR1150,00
`;

const MT940_CREDIT_C = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR1000,00
:61:2401200120C150,00NTRFNONREF
:86:VIREMENT ENTRANT
:62F:C240120EUR1150,00
`;

const MT940_WITH_DESCRIPTION = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR1000,00
:61:2401200120DR30,00NTRFNONREF
:86:VIREMENT SEPA RECU JEAN DUPONT
:62F:C240120EUR970,00
`;

const MT940_CLOSING_BALANCE = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR1000,00
:61:2401200120DR30,00NTRFNONREF
:86:PAIEMENT
:62F:C240120EUR1600,00
`;

const MT940_MALFORMED = `This is not a valid MT940 file
just some random text
without any proper tags`;

const MT940_MULTI = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR3000,00
:61:2401050105DR100,00NTRFNONREF
:86:LOYER JANVIER
:61:2401100110CR2000,00NTRFNONREF
:86:SALAIRE MENSUEL
:61:2401150115DR75,50NTRFNONREF
:86:COURSES SUPERMARCHE
:62F:C240131EUR4824,50
`;

// ─── TU-120-1 : canHandle ─────────────────────────────────────────────────────

describe("TU-120-1 — mt940Parser.canHandle : détection correcte", () => {
  it("retourne true pour un fichier .sta", () => {
    expect(mt940Parser.canHandle("releve.sta")).toBe(true);
  });

  it("retourne true pour un fichier .mt940", () => {
    expect(mt940Parser.canHandle("releve.mt940")).toBe(true);
  });

  it("retourne true pour un contenu avec :20: ET :61: même si extension .txt", () => {
    const content = `:20:STMT0001\n:61:2401150115DR50,00NTRFNONREF`;
    expect(mt940Parser.canHandle("releve.txt", content)).toBe(true);
  });

  it("retourne false pour un fichier CSV normal", () => {
    expect(mt940Parser.canHandle("releve.csv", "Date;Libelle;Montant\n2024-01-01;PAIEMENT;-50.00")).toBe(false);
  });

  it("retourne false pour un fichier XML sans marqueurs MT940", () => {
    expect(mt940Parser.canHandle("releve.xml", "<root><data>test</data></root>")).toBe(false);
  });

  it("retourne false pour une extension .txt sans contenu MT940 valide", () => {
    expect(mt940Parser.canHandle("notes.txt", "just some random text")).toBe(false);
  });
});

// ─── TU-120-2 : parse transaction débit (D / DR) ─────────────────────────────

describe("TU-120-2 — parse transaction débit DR", () => {
  it("parse DR : amount négatif et type expense", () => {
    const result = mt940Parser.parse(MT940_DEBIT_DR, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: -50.00,
      type: "expense",
    });
  });

  it("parse D (sans R) : amount négatif et type expense", () => {
    const result = mt940Parser.parse(MT940_DEBIT_D, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: -50.00,
      type: "expense",
    });
  });

  it("extrait la date au format YYYY-MM-DD depuis :61: DR", () => {
    const result = mt940Parser.parse(MT940_DEBIT_DR, null) as ParseResult;
    expect(result.transactions[0].date).toBe("2024-01-15");
  });
});

// ─── TU-120-3 : parse transaction crédit (C / CR) ────────────────────────────

describe("TU-120-3 — parse transaction crédit CR", () => {
  it("parse CR : amount positif et type income", () => {
    const result = mt940Parser.parse(MT940_CREDIT_CR, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: 150.00,
      type: "income",
    });
  });

  it("parse C (sans R) : amount positif et type income", () => {
    const result = mt940Parser.parse(MT940_CREDIT_C, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: 150.00,
      type: "income",
    });
  });

  it("extrait la date au format YYYY-MM-DD depuis :61: CR", () => {
    const result = mt940Parser.parse(MT940_CREDIT_CR, null) as ParseResult;
    expect(result.transactions[0].date).toBe("2024-01-20");
  });
});

// ─── TU-120-4 : libellé depuis :86: ──────────────────────────────────────────

describe("TU-120-4 — parse le libellé depuis :86:", () => {
  it("utilise le contenu de :86: comme description de la transaction", () => {
    const result = mt940Parser.parse(MT940_WITH_DESCRIPTION, null) as ParseResult;
    expect(result.transactions[0].description).toBe("VIREMENT SEPA RECU JEAN DUPONT");
  });

  it("associe correctement :86: à la transaction :61: précédente", () => {
    const result = mt940Parser.parse(MT940_FULL, null) as ParseResult;
    expect(result.transactions[0].description).toBe("VIREMENT SEPA RECU JEAN DUPONT REF 12345");
    expect(result.transactions[1].description).toBe("SALAIRE JANVIER 2024");
  });
});

// ─── TU-120-5 : solde de clôture :62F: ───────────────────────────────────────

describe("TU-120-5 — parse le solde de clôture :62F:", () => {
  it("extrait le montant de :62F: dans detectedBalance", () => {
    const result = mt940Parser.parse(MT940_CLOSING_BALANCE, null) as ParseResult;
    expect(result.detectedBalance).toBe(1600.00);
  });

  it("extrait la date du solde de clôture dans detectedBalanceDate", () => {
    const result = mt940Parser.parse(MT940_CLOSING_BALANCE, null) as ParseResult;
    expect(result.detectedBalanceDate).toBe("2024-01-20");
  });

  it("solde :62M: également reconnu", () => {
    const mt940WithM = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:C240101EUR1000,00
:61:2401200120DR30,00NTRFNONREF
:86:PAIEMENT
:62M:C240120EUR970,00
`;
    const result = mt940Parser.parse(mt940WithM, null) as ParseResult;
    expect(result.detectedBalance).toBe(970.00);
  });

  it("solde débiteur D dans :62F: → valeur négative", () => {
    const mt940Neg = `
:20:STMT0001
:25:12345/67890
:28C:00001/001
:60F:D240101EUR500,00
:61:2401200120DR800,00NTRFNONREF
:86:DEPASSEMENT
:62F:D240120EUR300,00
`;
    const result = mt940Parser.parse(mt940Neg, null) as ParseResult;
    expect(result.detectedBalance).toBe(-300.00);
  });
});

// ─── TU-120-6 : fichier malformé → tableau vide ───────────────────────────────

describe("TU-120-6 — fichier malformé → tableau vide, pas de crash", () => {
  it("retourne un tableau vide pour un contenu sans structure MT940", () => {
    const result = mt940Parser.parse(MT940_MALFORMED, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("retourne null pour detectedBalance si pas de :62F:", () => {
    const result = mt940Parser.parse(MT940_MALFORMED, null) as ParseResult;
    expect(result.detectedBalance).toBeNull();
  });

  it("retourne un tableau vide pour un contenu null (pas de crash)", () => {
    const result = mt940Parser.parse(null, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("retourne un tableau vide pour un contenu vide string", () => {
    const result = mt940Parser.parse("", null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });
});

// ─── TU-120-7 : multi-transactions ───────────────────────────────────────────

describe("TU-120-7 — multi-transactions (3 :61: dans le même fichier)", () => {
  it("parse 3 transactions correctement", () => {
    const result = mt940Parser.parse(MT940_MULTI, null) as ParseResult;
    expect(result.transactions).toHaveLength(3);
  });

  it("première transaction est un débit (DR)", () => {
    const result = mt940Parser.parse(MT940_MULTI, null) as ParseResult;
    expect(result.transactions[0]).toMatchObject({
      type: "expense",
      amount: -100.00,
      date: "2024-01-05",
      description: "LOYER JANVIER",
    });
  });

  it("deuxième transaction est un crédit (CR)", () => {
    const result = mt940Parser.parse(MT940_MULTI, null) as ParseResult;
    expect(result.transactions[1]).toMatchObject({
      type: "income",
      amount: 2000.00,
      date: "2024-01-10",
      description: "SALAIRE MENSUEL",
    });
  });

  it("troisième transaction est un débit (DR)", () => {
    const result = mt940Parser.parse(MT940_MULTI, null) as ParseResult;
    expect(result.transactions[2]).toMatchObject({
      type: "expense",
      amount: -75.50,
      date: "2024-01-15",
      description: "COURSES SUPERMARCHE",
    });
  });

  it("solde de clôture correct depuis :62F:", () => {
    const result = mt940Parser.parse(MT940_MULTI, null) as ParseResult;
    expect(result.detectedBalance).toBe(4824.50);
  });
});

// ─── Tests supplémentaires : devise et bankName ───────────────────────────────

describe("Devise et bankName", () => {
  it("bankName = 'MT940 (SWIFT)'", () => {
    const result = mt940Parser.parse(MT940_FULL, null) as ParseResult;
    expect(result.bankName).toBe("MT940 (SWIFT)");
  });

  it("devise EUR détectée depuis :60F:", () => {
    const result = mt940Parser.parse(MT940_FULL, null) as ParseResult;
    expect(result.currency).toBe("EUR");
  });

  it("devise USD détectée si présente dans :62F:", () => {
    const mt940Usd = `
:20:STMT0001
:25:USD123/456
:28C:00001/001
:60F:C240101USD500,00
:61:2401200120CR200,00NTRFNONREF
:86:TRANSFER USD
:62F:C240120USD700,00
`;
    const result = mt940Parser.parse(mt940Usd, null) as ParseResult;
    expect(result.currency).toBe("USD");
  });
});
