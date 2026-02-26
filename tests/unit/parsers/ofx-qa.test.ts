/**
 * Tests QA STORY-121 — Parser OFX/QFX
 * Auteur : FORGE QA Agent (TEA)
 * Objectif : couvrir les gaps identifiés lors de l'audit de ofx.test.ts
 *
 * Gaps couverts :
 *   GAP-1 (CRITIQUE) : detectedBalanceDate jamais assertée (AC-5)
 *   GAP-2 (MINEUR)   : MEMO seul sans NAME → libellé = MEMO (AC-6 edge case)
 *   GAP-3 (MINEUR)   : canHandle sans contenu et extension neutre → false (AC-1)
 *   GAP-4 (MINEUR)   : Date OFX avec timezone offset ignoré (AC-4 edge case)
 *   GAP-5 (MINEUR)   : OFX v2 XML — detectedBalanceDate extraite depuis DTASOF (AC-8 + AC-5)
 */

import { describe, it, expect } from "vitest";
import { ofxParser } from "@/lib/parsers/ofx";
import type { ParseResult } from "@/lib/parsers/types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** OFX v1 avec LEDGERBAL incluant DTASOF → valide detectedBalanceDate */
const OFX_BALANCE_WITH_DATE = `OFXHEADER:100
DATA:OFXSGML

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20250110</DTPOSTED>
<TRNAMT>200.00</TRNAMT>
<NAME>VIREMENT TEST</NAME>
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>1234.56</BALAMT>
<DTASOF>20250131</DTASOF>
</LEDGERBAL>
</OFX>`;

/** OFX avec MEMO présent mais sans NAME → libellé doit être le MEMO */
const OFX_MEMO_ONLY = `OFXHEADER:100

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115</DTPOSTED>
<TRNAMT>-45.00</TRNAMT>
<MEMO>CB BOULANGERIE CENTRE</MEMO>
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

/** OFX avec date OFX au format YYYYMMDD[HH:MM:SS] incluant timezone (ex: Wells Fargo) */
const OFX_DATE_WITH_TIMEZONE = `OFXHEADER:100

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20250320120000[+5:30]</DTPOSTED>
<TRNAMT>-75.00</TRNAMT>
<NAME>ACHAT AMAZON</NAME>
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

/** OFX v2 XML avec DTASOF dans LEDGERBAL */
const OFX_V2_WITH_BALANCE_DATE = `<?xml version="1.0" encoding="UTF-8"?>
<OFX>
  <BANKTRANLIST>
    <STMTTRN>
      <TRNTYPE>CREDIT</TRNTYPE>
      <DTPOSTED>20240301</DTPOSTED>
      <TRNAMT>500.00</TRNAMT>
      <NAME>REMBOURSEMENT</NAME>
    </STMTTRN>
  </BANKTRANLIST>
  <LEDGERBAL>
    <BALAMT>2500.00</BALAMT>
    <DTASOF>20240331</DTASOF>
  </LEDGERBAL>
</OFX>`;

/** OFX sans BALAMT mais avec DTASOF seul → detectedBalance null, detectedBalanceDate null */
const OFX_LEDGERBAL_NO_BALAMT = `OFXHEADER:100

<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20240101</DTPOSTED>
<TRNAMT>100.00</TRNAMT>
<NAME>TEST</NAME>
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<DTASOF>20240131</DTASOF>
</LEDGERBAL>
</OFX>`;

/** Fichier sans extension OFX et sans contenu OFX → canHandle false */
const CONTENT_NON_OFX = `Date;Libelle;Montant
2024-01-15;VIREMENT;100.00`;

// ─── GAP-1 (CRITIQUE) : AC-5 — detectedBalanceDate jamais assertée ─────────

describe("GAP-1 (AC-5) — detectedBalanceDate correctement extraite", () => {
  it("extrait detectedBalanceDate = '2025-01-31' depuis DTASOF 20250131", () => {
    const result = ofxParser.parse(OFX_BALANCE_WITH_DATE, null) as ParseResult;
    expect(result.detectedBalanceDate).toBe("2025-01-31");
  });

  it("extrait detectedBalance = 1234.56 en même temps que la date", () => {
    const result = ofxParser.parse(OFX_BALANCE_WITH_DATE, null) as ParseResult;
    expect(result.detectedBalance).toBe(1234.56);
  });

  it("retourne detectedBalanceDate = null si LEDGERBAL absent", () => {
    const noBalanceOfx = `OFXHEADER:100
<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115</DTPOSTED>
<TRNAMT>-10.00</TRNAMT>
<NAME>TEST</NAME>
</STMTTRN>
</BANKTRANLIST>
</OFX>`;
    const result = ofxParser.parse(noBalanceOfx, null) as ParseResult;
    expect(result.detectedBalance).toBeNull();
    expect(result.detectedBalanceDate).toBeNull();
  });

  it("extrait detectedBalanceDate si DTASOF présent même sans BALAMT", () => {
    // Comportement documenté : la date est extraite indépendamment du montant
    const result = ofxParser.parse(OFX_LEDGERBAL_NO_BALAMT, null) as ParseResult;
    expect(result.detectedBalance).toBeNull(); // Pas de BALAMT → balance null
    expect(result.detectedBalanceDate).toBe("2024-01-31"); // DTASOF présent → date extraite
  });
});

// ─── GAP-2 (MINEUR) : AC-6 — MEMO seul sans NAME ──────────────────────────

describe("GAP-2 (AC-6) — MEMO seul sans NAME → libellé = MEMO", () => {
  it("utilise MEMO comme libellé si NAME absent", () => {
    const result = ofxParser.parse(OFX_MEMO_ONLY, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].description).toBe("CB BOULANGERIE CENTRE");
  });

  it("la transaction avec MEMO seul a bien le bon montant et type", () => {
    const result = ofxParser.parse(OFX_MEMO_ONLY, null) as ParseResult;
    expect(result.transactions[0]).toMatchObject({
      amount: -45.00,
      type: "expense",
      date: "2024-01-15",
    });
  });
});

// ─── GAP-3 (MINEUR) : AC-1 — canHandle comportements défensifs ────────────

describe("GAP-3 (AC-1) — canHandle comportements défensifs", () => {
  it("retourne false pour extension .txt sans contenu fourni", () => {
    expect(ofxParser.canHandle("releve.txt")).toBe(false);
  });

  it("retourne false pour extension .txt avec contenu non-OFX", () => {
    expect(ofxParser.canHandle("releve.txt", CONTENT_NON_OFX)).toBe(false);
  });

  it("retourne false pour chaîne vide en contenu", () => {
    expect(ofxParser.canHandle("releve.txt", "")).toBe(false);
  });

  it("retourne true pour .qfx même sans contenu (extension seule suffit)", () => {
    expect(ofxParser.canHandle("quicken.qfx")).toBe(true);
  });

  it("retourne false pour extension .ofx.bak (ne doit pas matcher)", () => {
    // .ofx.bak ne se termine pas par .ofx
    expect(ofxParser.canHandle("backup.ofx.bak", CONTENT_NON_OFX)).toBe(false);
  });
});

// ─── GAP-4 (MINEUR) : AC-4 — Date OFX avec timezone offset ───────────────

describe("GAP-4 (AC-4) — Date OFX avec timezone offset ignoré", () => {
  it("extrait 2025-03-20 d'une date DTPOSTED avec timezone [+5:30]", () => {
    const result = ofxParser.parse(OFX_DATE_WITH_TIMEZONE, null) as ParseResult;
    // La date doit être extraite correctement, le timezone offset est ignoré
    // L'implémentation prend les 8 premiers caractères donc 20250320
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].date).toBe("2025-03-20");
  });
});

// ─── GAP-5 (MINEUR) : AC-8 + AC-5 — OFX v2 XML avec detectedBalanceDate ──

describe("GAP-5 (AC-8 + AC-5) — OFX v2 XML : detectedBalanceDate depuis DTASOF", () => {
  it("extrait detectedBalance = 2500.00 depuis OFX v2 XML", () => {
    const result = ofxParser.parse(OFX_V2_WITH_BALANCE_DATE, null) as ParseResult;
    expect(result.detectedBalance).toBe(2500.00);
  });

  it("extrait detectedBalanceDate = '2024-03-31' depuis DTASOF 20240331 en OFX v2", () => {
    const result = ofxParser.parse(OFX_V2_WITH_BALANCE_DATE, null) as ParseResult;
    expect(result.detectedBalanceDate).toBe("2024-03-31");
  });

  it("parse correctement la transaction depuis OFX v2 XML avec solde", () => {
    const result = ofxParser.parse(OFX_V2_WITH_BALANCE_DATE, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: 500.00,
      type: "income",
      date: "2024-03-01",
      description: "REMBOURSEMENT",
    });
  });
});
