/**
 * Tests QA complémentaires — STORY-119 Parser CAMT.053 (XML ISO 20022)
 * FORGE QA Agent (TEA) — Audit des gaps de couverture
 *
 * Gaps identifiés non couverts par les tests Dev :
 * - AC-1 : extension .XML en majuscules (case insensitivity)
 * - AC-2 : Ntry sans libellé → description auto-générée (fallback)
 * - AC-2 : montant = 0 → skip silencieux
 * - AC-3 : solde CLBD avec CdtDbtInd = DBIT (solde débiteur)
 * - AC-3 : fichier avec uniquement OPBD (pas de CLBD) → detectedBalance null
 * - AC-8 : Ntry sans CdtDbtInd → skip silencieux
 * - AC-8 : Ntry sans BookgDt avec fallback ValDt
 * - AC-8 : plusieurs blocs <Stmt> dans un même fichier → fusion des transactions
 * - Positionnement registry : camt053 avant genericCsvParser
 */

import { describe, it, expect } from "vitest";
import { camt053Parser } from "@/lib/parsers/camt053";
import { parsers } from "@/lib/parsers/registry";
import type { ParseResult } from "@/lib/parsers/types";

// ─── AC-1 : canHandle — extension en majuscules ───────────────────────────────

describe("QA-AC-1 — canHandle avec extension .XML en majuscules", () => {
  it("retourne true pour un fichier .XML (majuscules) contenant BkToCstmrStmt", () => {
    const xml = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt></Stmt></BkToCstmrStmt>
</Document>`;
    expect(camt053Parser.canHandle("RELEVE.XML", xml)).toBe(true);
  });

  it("retourne true pour une extension mixte .Xml contenant BkToCstmrStmt", () => {
    const xml = `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt/>
</Document>`;
    expect(camt053Parser.canHandle("export.Xml", xml)).toBe(true);
  });
});

// ─── AC-2 : Ntry sans libellé → description auto-générée ─────────────────────

describe("QA-AC-2 — Ntry sans libellé du tout → description de fallback", () => {
  const XML_NO_DESCRIPTION = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">75.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2025-03-01</Dt></BookgDt>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("ne crash pas quand Ntry n'a ni Ustrd ni AddtlNtryInf", () => {
    expect(() => camt053Parser.parse(XML_NO_DESCRIPTION, null)).not.toThrow();
  });

  it("retourne une transaction même sans libellé (description non vide)", () => {
    const result = camt053Parser.parse(XML_NO_DESCRIPTION, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].description).toBeTruthy();
    expect(result.transactions[0].description.length).toBeGreaterThan(0);
  });
});

// ─── AC-2 : montant = 0 → skip silencieux ────────────────────────────────────

describe("QA-AC-2 — Ntry avec montant = 0 → skip silencieux", () => {
  const XML_ZERO_AMOUNT = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">0.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2025-03-05</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Transaction à zéro euro</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">100.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2025-03-06</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Virement normal</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("ignore une Ntry avec montant 0.00 (skip silencieux)", () => {
    const result = camt053Parser.parse(XML_ZERO_AMOUNT, null) as ParseResult;
    // Seule la transaction à 100 EUR doit être retournée
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(100.00);
  });
});

// ─── AC-3 : solde CLBD débiteur (CdtDbtInd = DBIT sur le Bal) ────────────────

describe("QA-AC-3 — Solde CLBD avec CdtDbtInd DBIT (compte débiteur)", () => {
  const XML_DEBIT_BALANCE = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">500.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Dt><Dt>2025-01-31</Dt></Dt>
      </Bal>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("extrait le montant du solde CLBD même si CdtDbtInd = DBIT", () => {
    const result = camt053Parser.parse(XML_DEBIT_BALANCE, null) as ParseResult;
    // Le solde doit être extrait (positif ou négatif selon l'implémentation)
    expect(result.detectedBalance).not.toBeNull();
    expect(result.detectedBalanceDate).toBe("2025-01-31");
  });
});

// ─── AC-3 : OPBD uniquement, pas de CLBD → detectedBalance null ───────────────

describe("QA-AC-3 — Fichier avec uniquement OPBD (ouverture), pas de CLBD", () => {
  const XML_OPBD_ONLY = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Bal>
        <Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">1000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2025-01-01</Dt></Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">200.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2025-01-10</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Loyer janvier</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("retourne detectedBalance = null si seul OPBD est présent (pas de CLBD)", () => {
    const result = camt053Parser.parse(XML_OPBD_ONLY, null) as ParseResult;
    expect(result.detectedBalance).toBeNull();
  });

  it("parse quand même les transactions même sans CLBD", () => {
    const result = camt053Parser.parse(XML_OPBD_ONLY, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].description).toContain("Loyer");
  });
});

// ─── AC-8 : Ntry sans CdtDbtInd → skip silencieux ────────────────────────────

describe("QA-AC-8 — Ntry sans CdtDbtInd → skip silencieux", () => {
  const XML_MISSING_CDTDBTIND = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">80.00</Amt>
        <BookgDt><Dt>2025-02-05</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Transaction sans sens débit/crédit</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">50.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2025-02-06</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Virement valide</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("ne crash pas si CdtDbtInd est absent dans une Ntry", () => {
    expect(() => camt053Parser.parse(XML_MISSING_CDTDBTIND, null)).not.toThrow();
  });

  it("ignore la Ntry sans CdtDbtInd et conserve les Ntry valides", () => {
    const result = camt053Parser.parse(XML_MISSING_CDTDBTIND, null) as ParseResult;
    // La Ntry sans CdtDbtInd doit être sautée
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(50.00);
    expect(result.transactions[0].type).toBe("income");
  });
});

// ─── AC-8 : Ntry sans BookgDt → fallback ValDt ────────────────────────────────

describe("QA-AC-8 — Ntry sans BookgDt → fallback sur ValDt", () => {
  const XML_VALDT_FALLBACK = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">45.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <ValDt><Dt>2025-04-12</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Paiement sans date comptable</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("utilise ValDt comme date si BookgDt est absent", () => {
    const result = camt053Parser.parse(XML_VALDT_FALLBACK, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].date).toBe("2025-04-12");
  });

  it("la transaction avec date ValDt conserve les autres propriétés correctes", () => {
    const result = camt053Parser.parse(XML_VALDT_FALLBACK, null) as ParseResult;
    expect(result.transactions[0]).toMatchObject({
      type: "expense",
      amount: 45.00,
    });
  });
});

// ─── AC-8 : Ntry sans BookgDt ni ValDt → skip silencieux ─────────────────────

describe("QA-AC-8 — Ntry sans aucune date → skip silencieux", () => {
  const XML_NO_DATE = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">60.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Paiement sans date</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("ignore une Ntry sans aucune date (pas de crash)", () => {
    const result = camt053Parser.parse(XML_NO_DATE, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });
});

// ─── AC-8 : Plusieurs blocs <Stmt> → fusion des transactions ─────────────────

describe("QA-AC-8 — Plusieurs blocs <Stmt> dans un même fichier CAMT.053", () => {
  const XML_MULTI_STMT = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">3000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2025-01-31</Dt></Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">1500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2025-01-05</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>SALAIRE STMT1</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">300.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2025-01-10</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>LOYER STMT2</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("agrège les transactions de plusieurs blocs Stmt", () => {
    const result = camt053Parser.parse(XML_MULTI_STMT, null) as ParseResult;
    expect(result.transactions).toHaveLength(2);
  });

  it("le solde CLBD du premier Stmt est utilisé", () => {
    const result = camt053Parser.parse(XML_MULTI_STMT, null) as ParseResult;
    expect(result.detectedBalance).toBe(3000.00);
    expect(result.detectedBalanceDate).toBe("2025-01-31");
  });

  it("les transactions des deux Stmt ont les bons types", () => {
    const result = camt053Parser.parse(XML_MULTI_STMT, null) as ParseResult;
    const income = result.transactions.find((t) => t.type === "income");
    const expense = result.transactions.find((t) => t.type === "expense");
    expect(income).toBeDefined();
    expect(expense).toBeDefined();
    expect(income!.amount).toBe(1500.00);
    expect(expense!.amount).toBe(300.00);
  });
});

// ─── AC-6 : Positionnement dans le registry (avant genericCsvParser) ──────────

describe("QA-AC-6 — Positionnement du camt053Parser dans le registry", () => {
  it("camt053Parser est présent dans le tableau parsers", () => {
    const names = parsers.map((p) => p.name);
    expect(names).toContain("CAMT.053 (ISO 20022)");
  });

  it("camt053Parser est positionné avant le CSV générique", () => {
    const camt053Idx = parsers.findIndex((p) => p.name === "CAMT.053 (ISO 20022)");
    const genericIdx = parsers.findIndex((p) => p.name === "CSV générique");
    expect(camt053Idx).toBeGreaterThanOrEqual(0);
    expect(genericIdx).toBeGreaterThanOrEqual(0);
    expect(camt053Idx).toBeLessThan(genericIdx);
  });
});
