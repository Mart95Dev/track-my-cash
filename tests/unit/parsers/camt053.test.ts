import { describe, it, expect } from "vitest";
import { camt053Parser } from "@/lib/parsers/camt053";
import type { ParseResult } from "@/lib/parsers/types";

// ─── Fixtures XML ────────────────────────────────────────────────────────────

const VALID_CAMT_HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>`;

const XML_DBIT = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">50.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2024-01-15</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>CARTE LECLERC PAIEMENT</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

const XML_CRDT = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">150.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2024-01-10</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>VIREMENT SALAIRE</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

const XML_WITH_BALANCE = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">1234.56</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2024-01-31</Dt></Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">50.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2024-01-15</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Paiement facture #123</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

const XML_MALFORMED = `<?xml not well-formed <<<<`;

const XML_EMPTY_STMT = `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt><Stmt></Stmt></BkToCstmrStmt>
</Document>`;

const XML_NON_CAMT = `<?xml version="1.0"?>
<root><data>some data</data></root>`;

// ─── TU-119-1 : canHandle ────────────────────────────────────────────────────

describe("TU-119-1 — camt053Parser.canHandle", () => {
  it("retourne true pour un fichier .xml contenant BkToCstmrStmt", () => {
    expect(camt053Parser.canHandle("releve.xml", VALID_CAMT_HEADER)).toBe(true);
  });

  it("retourne true même si le contenu a uniquement le namespace camt.053", () => {
    const xmlWithNamespace = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt/>
</Document>`;
    expect(camt053Parser.canHandle("export.xml", xmlWithNamespace)).toBe(true);
  });

  it("retourne false pour un fichier .xml sans BkToCstmrStmt ni namespace camt.053", () => {
    expect(camt053Parser.canHandle("data.xml", XML_NON_CAMT)).toBe(false);
  });

  it("retourne false pour un fichier non-.xml même avec contenu CAMT", () => {
    expect(camt053Parser.canHandle("releve.csv", XML_DBIT)).toBe(false);
  });

  it("retourne false pour un fichier .csv sans contenu", () => {
    expect(camt053Parser.canHandle("releve.csv", "Date;Libelle;Montant")).toBe(false);
  });
});

// ─── TU-119-2 : parse transaction DBIT ───────────────────────────────────────

describe("TU-119-2 — parse transaction DBIT (débit = expense)", () => {
  it("extrait une transaction avec type expense et amount négatif en valeur absolue", () => {
    const result = camt053Parser.parse(XML_DBIT, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: 50.00,
      type: "expense",
    });
  });

  it("extrait la description depuis Ustrd", () => {
    const result = camt053Parser.parse(XML_DBIT, null) as ParseResult;
    expect(result.transactions[0].description).toContain("CARTE");
  });

  it("extrait la date au format YYYY-MM-DD depuis BookgDt", () => {
    const result = camt053Parser.parse(XML_DBIT, null) as ParseResult;
    expect(result.transactions[0].date).toBe("2024-01-15");
  });
});

// ─── TU-119-3 : parse transaction CRDT ───────────────────────────────────────

describe("TU-119-3 — parse transaction CRDT (crédit = income)", () => {
  it("extrait une transaction avec type income et amount positif", () => {
    const result = camt053Parser.parse(XML_CRDT, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: 150.00,
      type: "income",
    });
  });

  it("extrait la date correctement pour CRDT", () => {
    const result = camt053Parser.parse(XML_CRDT, null) as ParseResult;
    expect(result.transactions[0].date).toBe("2024-01-10");
  });
});

// ─── TU-119-4 : solde de clôture CLBD ────────────────────────────────────────

describe("TU-119-4 — parse solde de clôture CLBD", () => {
  it("extrait le solde CLBD dans detectedBalance", () => {
    const result = camt053Parser.parse(XML_WITH_BALANCE, null) as ParseResult;
    expect(result.detectedBalance).toBe(1234.56);
  });

  it("extrait la date du solde CLBD dans detectedBalanceDate", () => {
    const result = camt053Parser.parse(XML_WITH_BALANCE, null) as ParseResult;
    expect(result.detectedBalanceDate).toBe("2024-01-31");
  });
});

// ─── TU-119-5 : date ISO 2024-01-15 ──────────────────────────────────────────

describe("TU-119-5 — parsing de la date ISO (YYYY-MM-DD)", () => {
  it("conserve la date au format YYYY-MM-DD natif ISO", () => {
    const result = camt053Parser.parse(XML_DBIT, null) as ParseResult;
    expect(result.transactions[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.transactions[0].date).toBe("2024-01-15");
  });
});

// ─── TU-119-6 : fichier malformé → tableau vide, pas de crash ────────────────

describe("TU-119-6 — fichier XML malformé ou sans transactions", () => {
  it("retourne un tableau vide si XML totalement malformé (pas de crash)", () => {
    const result = camt053Parser.parse(XML_MALFORMED, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("retourne un tableau vide si le Stmt est vide", () => {
    const result = camt053Parser.parse(XML_EMPTY_STMT, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("retourne null pour detectedBalance si aucune balise Bal présente", () => {
    const result = camt053Parser.parse(XML_DBIT, null) as ParseResult;
    expect(result.detectedBalance).toBeNull();
  });

  it("retourne null pour contenu null (pas de crash)", () => {
    const result = camt053Parser.parse(null, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });
});

// ─── Tests supplémentaires : devise et bankName ───────────────────────────────

describe("Devise et bankName", () => {
  it("extrait la devise EUR depuis l'attribut Ccy", () => {
    const result = camt053Parser.parse(XML_WITH_BALANCE, null) as ParseResult;
    expect(result.currency).toBe("EUR");
  });

  it("bankName = 'CAMT.053 (ISO 20022)'", () => {
    const result = camt053Parser.parse(XML_DBIT, null) as ParseResult;
    expect(result.bankName).toBe("CAMT.053 (ISO 20022)");
  });

  it("détecte la devise USD si présente", () => {
    const xmlUsd = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="USD">100.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2024-02-01</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>Transfer USD</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
    const result = camt053Parser.parse(xmlUsd, null) as ParseResult;
    expect(result.currency).toBe("USD");
  });
});

// ─── Test avec plusieurs transactions ────────────────────────────────────────

describe("Plusieurs transactions dans un même relevé", () => {
  const XML_MULTI = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">2500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2024-01-31</Dt></Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">50.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2024-01-15</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>CARREFOUR COURSES</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">2000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2024-01-02</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>VIREMENT SALAIRE MENSUEL</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">120.50</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2024-01-20</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>PRELEVEMENT EDF ENERGIE</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

  it("parse 3 transactions depuis un relevé multi-entrées", () => {
    const result = camt053Parser.parse(XML_MULTI, null) as ParseResult;
    expect(result.transactions).toHaveLength(3);
  });

  it("première transaction est bien une dépense (DBIT)", () => {
    const result = camt053Parser.parse(XML_MULTI, null) as ParseResult;
    expect(result.transactions[0]).toMatchObject({
      type: "expense",
      amount: 50.00,
      date: "2024-01-15",
    });
  });

  it("deuxième transaction est un revenu (CRDT)", () => {
    const result = camt053Parser.parse(XML_MULTI, null) as ParseResult;
    expect(result.transactions[1]).toMatchObject({
      type: "income",
      amount: 2000.00,
      date: "2024-01-02",
    });
  });

  it("solde clôture extrait correctement depuis CLBD", () => {
    const result = camt053Parser.parse(XML_MULTI, null) as ParseResult;
    expect(result.detectedBalance).toBe(2500.00);
    expect(result.detectedBalanceDate).toBe("2024-01-31");
  });
});

// ─── Test description depuis AddtlNtryInf ────────────────────────────────────

describe("Description alternative : AddtlNtryInf", () => {
  it("utilise AddtlNtryInf si Ustrd absent", () => {
    const xml = `<?xml version="1.0"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">30.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2024-03-10</Dt></BookgDt>
        <AddtlNtryInf>ABONNEMENT NETFLIX</AddtlNtryInf>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
    const result = camt053Parser.parse(xml, null) as ParseResult;
    expect(result.transactions[0].description).toContain("NETFLIX");
  });
});
