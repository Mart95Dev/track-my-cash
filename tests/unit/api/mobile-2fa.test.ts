/**
 * Tests unitaires — /api/mobile/auth/2fa/* (STORY-141)
 * AC-1 : Login détecte 2FA
 * AC-2 : Verify code TOTP
 * AC-3 : Enable 2FA
 * AC-4 : Disable 2FA
 * AC-5 : Backup codes
 * AC-6 : CORS
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockSignMobileToken = vi.fn().mockResolvedValue("jwt-mobile-30d");
const mockSignTempToken = vi.fn().mockResolvedValue("temp-token-5m");
const mockVerifyTempToken = vi.fn().mockResolvedValue({ userId: "user-123", email: "test@example.com" });
const mockHas2FAEnabled = vi.fn().mockResolvedValue(false);
const mockGet2FARecord = vi.fn().mockResolvedValue(null);
const mockVerifyTOTPCode = vi.fn().mockResolvedValue(true);
const mockVerifyAndConsumeBackupCode = vi.fn().mockResolvedValue(false);
const mockInitiate2FASetup = vi.fn().mockResolvedValue({
  totpURI: "otpauth://totp/Track%20My%20Cash:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Track%20My%20Cash",
  backupCodes: ["ABCD-1234", "EFGH-5678", "IJKL-9012", "MNOP-3456", "QRST-7890", "UVWX-1234", "YZAB-5678", "CDEF-9012"],
  secret: "encrypted-secret",
});
const mockConfirm2FAEnable = vi.fn().mockResolvedValue(undefined);
const mockDisable2FA = vi.fn().mockResolvedValue(undefined);
const mockGetMobileUserId = vi.fn().mockResolvedValue("user-123");

vi.mock("@/lib/mobile-auth", () => ({
  signMobileToken: (...args: unknown[]) => mockSignMobileToken(...args),
  getMobileUserId: (...args: unknown[]) => mockGetMobileUserId(...args),
  jsonOk: vi.fn((data: unknown) =>
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  ),
  jsonCreated: vi.fn((data: unknown) =>
    new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  ),
  jsonError: vi.fn((status: number, message: string) =>
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  ),
  handleCors: vi.fn(() =>
    new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    })
  ),
}));

vi.mock("@/lib/mobile-2fa", () => ({
  signTempToken: (...args: unknown[]) => mockSignTempToken(...args),
  verifyTempToken: (...args: unknown[]) => mockVerifyTempToken(...args),
  has2FAEnabled: (...args: unknown[]) => mockHas2FAEnabled(...args),
  get2FARecord: (...args: unknown[]) => mockGet2FARecord(...args),
  verifyTOTPCode: (...args: unknown[]) => mockVerifyTOTPCode(...args),
  verifyAndConsumeBackupCode: (...args: unknown[]) => mockVerifyAndConsumeBackupCode(...args),
  initiate2FASetup: (...args: unknown[]) => mockInitiate2FASetup(...args),
  confirm2FAEnable: (...args: unknown[]) => mockConfirm2FAEnable(...args),
  disable2FA: (...args: unknown[]) => mockDisable2FA(...args),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    handler: vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ user: { id: "user-123", email: "test@example.com", name: "Test" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    ),
  },
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockReturnValue({
    execute: vi.fn().mockResolvedValue({
      rows: [{ email: "test@example.com", twoFactorEnabled: 0 }],
    }),
  }),
}));

vi.mock("@/lib/platform-tracker", () => ({
  upsertUserPlatform: vi.fn().mockResolvedValue(undefined),
}));

// ── Tests ───────────────────────────────────────────────────────────────────

describe("/api/mobile/auth — 2FA (STORY-141)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockHas2FAEnabled.mockResolvedValue(false);
    mockGet2FARecord.mockResolvedValue(null);
    mockVerifyTOTPCode.mockResolvedValue(true);
    mockVerifyAndConsumeBackupCode.mockResolvedValue(false);
    mockGetMobileUserId.mockResolvedValue("user-123");
    mockVerifyTempToken.mockResolvedValue({ userId: "user-123", email: "test@example.com" });
  });

  // ─── AC-1 : Login détecte le 2FA ─────────────────────────────────────────

  describe("Login + 2FA (AC-1)", () => {
    it("TU-1 : login retourne requires2FA si 2FA activé", async () => {
      mockHas2FAEnabled.mockResolvedValue(true);

      const { POST } = await import("@/app/api/mobile/auth/login/route");
      const req = new Request("https://example.com/api/mobile/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.requires2FA).toBe(true);
      expect(json.tempToken).toBeDefined();
      expect(json.token).toBeUndefined();
    });

    it("TU-2 : login retourne JWT normalement si pas de 2FA", async () => {
      mockHas2FAEnabled.mockResolvedValue(false);

      const { POST } = await import("@/app/api/mobile/auth/login/route");
      const req = new Request("https://example.com/api/mobile/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.token).toBeDefined();
      expect(json.requires2FA).toBeUndefined();
    });
  });

  // ─── AC-2 : Verify TOTP ──────────────────────────────────────────────────

  describe("2FA Verify (AC-2)", () => {
    it("TU-3 : verify avec code valide retourne JWT", async () => {
      mockGet2FARecord.mockResolvedValue({ id: "1", userId: "user-123", secret: "encrypted", backupCodes: "[]", enabled: 1 });
      mockVerifyTOTPCode.mockResolvedValue(true);

      const { POST } = await import("@/app/api/mobile/auth/2fa/verify/route");
      const req = new Request("https://example.com/api/mobile/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: "temp-token", code: "123456" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.token).toBeDefined();
      expect(json.user).toBeDefined();
    });

    it("TU-4 : verify avec code invalide retourne 401", async () => {
      mockGet2FARecord.mockResolvedValue({ id: "1", userId: "user-123", secret: "encrypted", backupCodes: "[]", enabled: 1 });
      mockVerifyTOTPCode.mockResolvedValue(false);

      const { POST } = await import("@/app/api/mobile/auth/2fa/verify/route");
      const req = new Request("https://example.com/api/mobile/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: "temp-token", code: "000000" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain("invalide");
    });

    it("TU-5 : verify avec tempToken expiré retourne 401", async () => {
      mockVerifyTempToken.mockRejectedValue(new Error("expired"));

      const { POST } = await import("@/app/api/mobile/auth/2fa/verify/route");
      const req = new Request("https://example.com/api/mobile/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: "expired-token", code: "123456" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain("expiré");
    });
  });

  // ─── AC-3 : Enable 2FA ───────────────────────────────────────────────────

  describe("2FA Enable (AC-3)", () => {
    it("TU-6 : enable retourne totpURI + backupCodes", async () => {
      const { POST } = await import("@/app/api/mobile/auth/2fa/enable/route");
      const req = new Request("https://example.com/api/mobile/auth/2fa/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totpURI).toBeDefined();
      expect(json.backupCodes).toHaveLength(8);
      // qrDataUrl supprimé — le QR est généré côté client
    });
  });

  // ─── AC-4 : Disable 2FA ──────────────────────────────────────────────────

  describe("2FA Disable (AC-4)", () => {
    it("TU-7 : disable avec code valide désactive le 2FA", async () => {
      mockGet2FARecord.mockResolvedValue({ id: "1", userId: "user-123", secret: "encrypted", backupCodes: "[]", enabled: 1 });
      mockVerifyTOTPCode.mockResolvedValue(true);

      const { POST } = await import("@/app/api/mobile/auth/2fa/disable/route");
      const req = new Request("https://example.com/api/mobile/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({ code: "123456" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.disabled).toBe(true);
      expect(mockDisable2FA).toHaveBeenCalledWith("user-123");
    });

    it("TU-8 : disable avec code invalide retourne 401", async () => {
      mockGet2FARecord.mockResolvedValue({ id: "1", userId: "user-123", secret: "encrypted", backupCodes: "[]", enabled: 1 });
      mockVerifyTOTPCode.mockResolvedValue(false);

      const { POST } = await import("@/app/api/mobile/auth/2fa/disable/route");
      const req = new Request("https://example.com/api/mobile/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-jwt",
        },
        body: JSON.stringify({ code: "000000" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  // ─── AC-5 : Backup codes ─────────────────────────────────────────────────

  describe("Backup codes (AC-5)", () => {
    it("TU-9 : verify avec backupCode valide fonctionne", async () => {
      mockVerifyAndConsumeBackupCode.mockResolvedValue(true);

      const { POST } = await import("@/app/api/mobile/auth/2fa/verify/route");
      const req = new Request("https://example.com/api/mobile/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: "temp-token", backupCode: "ABCD-1234" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.token).toBeDefined();
    });

    it("TU-10 : backupCode invalide retourne 401", async () => {
      mockVerifyAndConsumeBackupCode.mockResolvedValue(false);

      const { POST } = await import("@/app/api/mobile/auth/2fa/verify/route");
      const req = new Request("https://example.com/api/mobile/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: "temp-token", backupCode: "INVALID" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain("récupération");
    });
  });

  // ─── AC-6 : CORS ─────────────────────────────────────────────────────────

  describe("CORS (AC-6)", () => {
    it("verify OPTIONS retourne CORS 204", async () => {
      const { OPTIONS } = await import("@/app/api/mobile/auth/2fa/verify/route");
      const res = OPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });

    it("enable OPTIONS retourne CORS 204", async () => {
      const { OPTIONS } = await import("@/app/api/mobile/auth/2fa/enable/route");
      const res = OPTIONS();
      expect(res.status).toBe(204);
    });

    it("disable OPTIONS retourne CORS 204", async () => {
      const { OPTIONS } = await import("@/app/api/mobile/auth/2fa/disable/route");
      const res = OPTIONS();
      expect(res.status).toBe(204);
    });
  });
});
