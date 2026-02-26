import { describe, it, expect } from "vitest";
import { ofxParser } from "@/lib/parsers/ofx";
import type { ParseResult } from "@/lib/parsers/types";

// ─── Fixtures OFX ─────────────────────────────────────────────────────────────

const OFX_V1_FULL = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>EUR</CURDEF>
<BANKACCTFROM>
<ACCTID>12345</ACCTID>
</BANKACCTFROM>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115120000</DTPOSTED>
<TRNAMT>-50.00</TRNAMT>
<NAME>PAIEMENT FACTURE</NAME>
<MEMO>Facture EDF janvier</MEMO>
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20240120120000</DTPOSTED>
<TRNAMT>1500.00</TRNAMT>
<NAME>VIREMENT SALAIRE</NAME>
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>1600.00</BALAMT>
<DTASOF>20240120</DTASOF>
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

const OFX_V2_XML = `<?xml version="1.0" encoding="UTF-8"?>
<OFX>
  <BANKTRANLIST>
    <STMTTRN>
      <TRNTYPE>DEBIT</TRNTYPE>
      <DTPOSTED>20240115</DTPOSTED>
      <TRNAMT>-50.00</TRNAMT>
      <NAME>PAIEMENT FACTURE</NAME>
    </STMTTRN>
  </BANKTRANLIST>
  <LEDGERBAL>
    <BALAMT>1600.00</BALAMT>
  </LEDGERBAL>
</OFX>`;

const OFX_DEBIT_ONLY = `OFXHEADER:100
DATA:OFXSGML

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115120000</DTPOSTED>
<TRNAMT>-50.00</TRNAMT>
<NAME>PAIEMENT FACTURE</NAME>
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

const OFX_CREDIT_ONLY = `OFXHEADER:100
DATA:OFXSGML

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20240120120000</DTPOSTED>
<TRNAMT>1500.00</TRNAMT>
<NAME>VIREMENT SALAIRE</NAME>
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

const OFX_NAME_AND_MEMO = `OFXHEADER:100

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115</DTPOSTED>
<TRNAMT>-30.00</TRNAMT>
<NAME>PAIEMENT</NAME>
<MEMO>Facture EDF</MEMO>
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

const OFX_NAME_ONLY = `OFXHEADER:100

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115</DTPOSTED>
<TRNAMT>-30.00</TRNAMT>
<NAME>PAIEMENT</NAME>
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

const OFX_WITH_BALANCE = `OFXHEADER:100

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20240120</DTPOSTED>
<TRNAMT>100.00</TRNAMT>
<NAME>TEST</NAME>
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>1600.00</BALAMT>
<DTASOF>20240120</DTASOF>
</LEDGERBAL>
</OFX>`;

const OFX_DATE_LONG = `OFXHEADER:100

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115120000</DTPOSTED>
<TRNAMT>-50.00</TRNAMT>
<NAME>TEST DATE</NAME>
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

const OFX_MALFORMED = `NOT A VALID OFX FILE
random content here
nothing useful`;

const OFX_MULTI = `OFXHEADER:100
DATA:OFXSGML

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240101</DTPOSTED>
<TRNAMT>-25.00</TRNAMT>
<NAME>LECLERC COURSES</NAME>
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20240102</DTPOSTED>
<TRNAMT>2000.00</TRNAMT>
<NAME>VIREMENT SALAIRE</NAME>
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240105</DTPOSTED>
<TRNAMT>-120.50</TRNAMT>
<NAME>EDF PRELEVEMENT</NAME>
<MEMO>Electricite janvier</MEMO>
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>3500.00</BALAMT>
</LEDGERBAL>
</OFX>`;

const CSV_NORMAL = `Date;Libelle;Montant
2024-01-15;VIREMENT;100.00
2024-01-16;PRELEVEMENT;-50.00`;

// ─── TU-121-1 : canHandle ─────────────────────────────────────────────────────

describe("TU-121-1 — ofxParser.canHandle", () => {
  it("retourne true pour extension .ofx", () => {
    expect(ofxParser.canHandle("releve.ofx")).toBe(true);
  });

  it("retourne true pour extension .qfx", () => {
    expect(ofxParser.canHandle("releve.qfx")).toBe(true);
  });

  it("retourne true pour extension .OFX (majuscules)", () => {
    expect(ofxParser.canHandle("RELEVE.OFX")).toBe(true);
  });

  it("retourne true pour un fichier .txt contenant OFXHEADER", () => {
    expect(ofxParser.canHandle("export.txt", OFX_V1_FULL)).toBe(true);
  });

  it("retourne true pour un fichier .txt contenant <OFX>", () => {
    const contentWithOfxTag = `<?xml version="1.0"?>\n<OFX>\n</OFX>`;
    expect(ofxParser.canHandle("export.txt", contentWithOfxTag)).toBe(true);
  });

  it("retourne false pour un CSV normal", () => {
    expect(ofxParser.canHandle("export.csv", CSV_NORMAL)).toBe(false);
  });

  it("retourne false pour une extension .csv sans contenu OFX", () => {
    expect(ofxParser.canHandle("releve.csv", CSV_NORMAL)).toBe(false);
  });

  it("retourne false pour une extension .xml sans contenu OFX", () => {
    expect(ofxParser.canHandle("data.xml", "<root><data>test</data></root>")).toBe(false);
  });
});

// ─── TU-121-2 : parse transaction DEBIT (montant négatif) ─────────────────────

describe("TU-121-2 — parse transaction DEBIT (montant négatif)", () => {
  it("extrait amount = -50.00 pour TRNAMT -50.00", () => {
    const result = ofxParser.parse(OFX_DEBIT_ONLY, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(-50.00);
  });

  it("extrait type = expense pour TRNAMT négatif", () => {
    const result = ofxParser.parse(OFX_DEBIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].type).toBe("expense");
  });
});

// ─── TU-121-3 : parse transaction CREDIT (montant positif) ────────────────────

describe("TU-121-3 — parse transaction CREDIT (montant positif)", () => {
  it("extrait amount = 1500.00 pour TRNAMT 1500.00", () => {
    const result = ofxParser.parse(OFX_CREDIT_ONLY, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(1500.00);
  });

  it("extrait type = income pour TRNAMT positif", () => {
    const result = ofxParser.parse(OFX_CREDIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].type).toBe("income");
  });
});

// ─── TU-121-4 : parse le libellé (NAME + MEMO) ────────────────────────────────

describe("TU-121-4 — parse le libellé (NAME + MEMO)", () => {
  it("concatène NAME et MEMO avec ' — ' si les deux présents", () => {
    const result = ofxParser.parse(OFX_NAME_AND_MEMO, null) as ParseResult;
    expect(result.transactions[0].description).toBe("PAIEMENT — Facture EDF");
  });

  it("utilise uniquement NAME si MEMO absent", () => {
    const result = ofxParser.parse(OFX_NAME_ONLY, null) as ParseResult;
    expect(result.transactions[0].description).toBe("PAIEMENT");
  });

  it("utilise NAME depuis OFX v1 complet", () => {
    const result = ofxParser.parse(OFX_V1_FULL, null) as ParseResult;
    expect(result.transactions[0].description).toBe("PAIEMENT FACTURE — Facture EDF janvier");
  });
});

// ─── TU-121-5 : parse le solde LEDGERBAL ──────────────────────────────────────

describe("TU-121-5 — parse le solde LEDGERBAL", () => {
  it("extrait detectedBalance = 1600.00 depuis BALAMT", () => {
    const result = ofxParser.parse(OFX_WITH_BALANCE, null) as ParseResult;
    expect(result.detectedBalance).toBe(1600.00);
  });

  it("extrait le solde depuis OFX v1 complet", () => {
    const result = ofxParser.parse(OFX_V1_FULL, null) as ParseResult;
    expect(result.detectedBalance).toBe(1600.00);
  });

  it("retourne null si LEDGERBAL absent", () => {
    const result = ofxParser.parse(OFX_DEBIT_ONLY, null) as ParseResult;
    expect(result.detectedBalance).toBeNull();
  });
});

// ─── TU-121-6 : parse la date (format OFX → ISO) ──────────────────────────────

describe("TU-121-6 — parse la date (format OFX → ISO YYYY-MM-DD)", () => {
  it("convertit DTPOSTED 20240115120000 en 2024-01-15", () => {
    const result = ofxParser.parse(OFX_DATE_LONG, null) as ParseResult;
    expect(result.transactions[0].date).toBe("2024-01-15");
  });

  it("convertit DTPOSTED 20240115 (8 chiffres) en 2024-01-15", () => {
    const result = ofxParser.parse(OFX_NAME_AND_MEMO, null) as ParseResult;
    expect(result.transactions[0].date).toBe("2024-01-15");
  });

  it("la date est au format YYYY-MM-DD", () => {
    const result = ofxParser.parse(OFX_CREDIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ─── TU-121-7 : fichier malformé → tableau vide ────────────────────────────────

describe("TU-121-7 — fichier malformé → tableau vide, pas de crash", () => {
  it("retourne un tableau vide pour un fichier non-OFX (pas de crash)", () => {
    const result = ofxParser.parse(OFX_MALFORMED, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("retourne un tableau vide pour contenu null (pas de crash)", () => {
    const result = ofxParser.parse(null, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("retourne null pour detectedBalance si fichier vide", () => {
    const result = ofxParser.parse(null, null) as ParseResult;
    expect(result.detectedBalance).toBeNull();
  });
});

// ─── TU-121-8 : multi-transactions ────────────────────────────────────────────

describe("TU-121-8 — multi-transactions (au moins 3 STMTTRN)", () => {
  it("parse 3 transactions depuis un fichier multi-entrées", () => {
    const result = ofxParser.parse(OFX_MULTI, null) as ParseResult;
    expect(result.transactions).toHaveLength(3);
  });

  it("première transaction : expense -25.00 LECLERC COURSES", () => {
    const result = ofxParser.parse(OFX_MULTI, null) as ParseResult;
    expect(result.transactions[0]).toMatchObject({
      amount: -25.00,
      type: "expense",
      description: "LECLERC COURSES",
      date: "2024-01-01",
    });
  });

  it("deuxième transaction : income 2000.00 VIREMENT SALAIRE", () => {
    const result = ofxParser.parse(OFX_MULTI, null) as ParseResult;
    expect(result.transactions[1]).toMatchObject({
      amount: 2000.00,
      type: "income",
      description: "VIREMENT SALAIRE",
      date: "2024-01-02",
    });
  });

  it("troisième transaction : expense avec MEMO concaténé", () => {
    const result = ofxParser.parse(OFX_MULTI, null) as ParseResult;
    expect(result.transactions[2]).toMatchObject({
      amount: -120.50,
      type: "expense",
      description: "EDF PRELEVEMENT — Electricite janvier",
      date: "2024-01-05",
    });
  });

  it("extrait le solde LEDGERBAL du fichier multi", () => {
    const result = ofxParser.parse(OFX_MULTI, null) as ParseResult;
    expect(result.detectedBalance).toBe(3500.00);
  });
});

// ─── Tests supplémentaires : bankName, currency, OFX v2 ───────────────────────

describe("bankName, currency, et OFX v2 XML", () => {
  it("bankName = 'OFX/QFX'", () => {
    const result = ofxParser.parse(OFX_V1_FULL, null) as ParseResult;
    expect(result.bankName).toBe("OFX/QFX");
  });

  it("détecte la devise EUR depuis CURDEF", () => {
    const result = ofxParser.parse(OFX_V1_FULL, null) as ParseResult;
    expect(result.currency).toBe("EUR");
  });

  it("parse OFX v2 (XML valide avec <?xml?>)", () => {
    const result = ofxParser.parse(OFX_V2_XML, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: -50.00,
      type: "expense",
      date: "2024-01-15",
    });
    expect(result.detectedBalance).toBe(1600.00);
  });

  it("parse 2 transactions depuis OFX v1 complet", () => {
    const result = ofxParser.parse(OFX_V1_FULL, null) as ParseResult;
    expect(result.transactions).toHaveLength(2);
  });
});
