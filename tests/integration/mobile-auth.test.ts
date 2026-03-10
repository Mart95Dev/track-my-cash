/**
 * Tests d'intégration — Flux auth mobile (STORY-149)
 * AC-1 : Register → Login → JWT valide
 * AC-2 : Login avec 2FA → tempToken → verify → JWT final
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks communs ────────────────────────────────────────────────────────────

const mockSignMobileToken = vi.fn().mockResolvedValue("jwt-final-token");
const mockGetMobileUserId = vi.fn().mockResolvedValue("user-123");
const mockSignTempToken = vi.fn().mockResolvedValue("temp-token-5min");

vi.mock("@/lib/mobile-auth", () => ({
  getMobileUserId: (...args: unknown[]) => mockGetMobileUserId(...args),
  signMobileToken: (...args: unknown[]) => mockSignMobileToken(...args),
  jsonOk: vi.fn((data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
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
  handleCors: vi.fn(() => new Response(null, { status: 204 })),
}));

vi.mock("@/lib/mobile-2fa", () => ({
  has2FAEnabled: vi.fn().mockResolvedValue(false),
  signTempToken: (...args: unknown[]) => mockSignTempToken(...args),
  verifyTempToken: vi.fn().mockResolvedValue({ userId: "user-123", email: "test@example.com" }),
  get2FARecord: vi.fn().mockResolvedValue({ secret: "encrypted-secret", enabled: true }),
  verifyTOTPCode: vi.fn().mockResolvedValue(true),
  initiate2FASetup: vi.fn().mockResolvedValue({
    totpURI: "otpauth://totp/TrackMyCash:test@example.com?secret=ABC",
    backupCodes: ["1111-2222", "3333-4444"],
  }),
  confirm2FAEnable: vi.fn().mockResolvedValue(undefined),
  verifyAndConsumeBackupCode: vi.fn().mockResolvedValue(true),
}));

const mockAuthHandler = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: {
    handler: (...args: unknown[]) => mockAuthHandler(...args),
  },
}));

const mockDbExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({ execute: (...args: unknown[]) => mockDbExecute(...args) })),
  getUserDb: vi.fn().mockResolvedValue({ execute: vi.fn() }),
}));

vi.mock("@/lib/trial-utils", () => ({
  createTrialSubscription: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email-templates", () => ({
  renderWelcomeEmail: vi.fn().mockReturnValue("<p>Welcome</p>"),
}));

vi.mock("@/lib/admin-logger", () => ({
  writeAdminLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/platform-tracker", () => ({
  upsertUserPlatform: vi.fn().mockResolvedValue(undefined),
}));

// ── Imports ──────────────────────────────────────────────────────────────────

import { has2FAEnabled } from "@/lib/mobile-2fa";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(url: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Intégration — Flux auth mobile (STORY-149 AC-1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthHandler.mockResolvedValue(
      new Response(JSON.stringify({
        user: { id: "user-123", email: "test@example.com", name: "Test" },
      }), { status: 200, headers: { "Content-Type": "application/json" } })
    );
    (has2FAEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it("TU-1 : Register retourne 201 + JWT + isNewUser", async () => {
    const { POST } = await import("@/app/api/mobile/auth/register/route");

    const req = makeRequest("https://app.test/api/mobile/auth/register", {
      email: "new@example.com",
      password: "Str0ng!Pass",
      name: "Nouveau",
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.user.id).toBe("user-123");
    expect(json.user.email).toBe("test@example.com");
    expect(json.token).toBe("jwt-final-token");
    expect(json.isNewUser).toBe(true);

    expect(mockSignMobileToken).toHaveBeenCalledWith("user-123", "test@example.com");
  });

  it("TU-1b : Login retourne 200 + JWT (sans 2FA)", async () => {
    const { POST } = await import("@/app/api/mobile/auth/login/route");

    const req = makeRequest("https://app.test/api/mobile/auth/login", {
      email: "test@example.com",
      password: "Str0ng!Pass",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.user.id).toBe("user-123");
    expect(json.token).toBe("jwt-final-token");
    expect(json.requires2FA).toBeUndefined();
  });

  it("TU-1c : Register → Login enchaîné — même user obtient un JWT", async () => {
    // Configurer le mock pour retourner une nouvelle Response à chaque appel
    const makeAuthResponse = () =>
      new Response(JSON.stringify({
        user: { id: "user-123", email: "chain@example.com", name: "Chain" },
      }), { status: 200, headers: { "Content-Type": "application/json" } });

    mockAuthHandler.mockResolvedValueOnce(makeAuthResponse());

    // Simule register
    const { POST: registerPost } = await import("@/app/api/mobile/auth/register/route");
    const registerRes = await registerPost(
      makeRequest("https://app.test/api/mobile/auth/register", {
        email: "chain@example.com",
        password: "Str0ng!Pass",
      })
    );
    expect(registerRes.status).toBe(201);
    const registerJson = await registerRes.json();
    expect(registerJson.token).toBeTruthy();

    // Reconfigurer pour le login
    mockAuthHandler.mockResolvedValueOnce(makeAuthResponse());

    // Simule login avec le même user
    const { POST: loginPost } = await import("@/app/api/mobile/auth/login/route");
    const loginRes = await loginPost(
      makeRequest("https://app.test/api/mobile/auth/login", {
        email: "chain@example.com",
        password: "Str0ng!Pass",
      })
    );
    expect(loginRes.status).toBe(200);
    const loginJson = await loginRes.json();
    expect(loginJson.token).toBeTruthy();

    // Les deux appels signent un JWT pour le même user
    expect(mockSignMobileToken).toHaveBeenCalledTimes(2);
  });

  it("TU-1d : Login échoue avec mauvais credentials → 401", async () => {
    mockAuthHandler.mockResolvedValue(
      new Response("", { status: 401 })
    );

    const { POST } = await import("@/app/api/mobile/auth/login/route");
    const res = await POST(
      makeRequest("https://app.test/api/mobile/auth/login", {
        email: "bad@example.com",
        password: "wrong",
      })
    );
    expect(res.status).toBe(401);
  });
});

describe("Intégration — Flux 2FA (STORY-149 AC-2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthHandler.mockResolvedValue(
      new Response(JSON.stringify({
        user: { id: "user-123", email: "test@example.com", name: "Test" },
      }), { status: 200, headers: { "Content-Type": "application/json" } })
    );
    (has2FAEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    mockDbExecute.mockResolvedValue({ rows: [{ email: "test@example.com" }] });
  });

  it("TU-2 : Login avec 2FA → requires2FA + tempToken", async () => {
    const { POST } = await import("@/app/api/mobile/auth/login/route");
    const res = await POST(
      makeRequest("https://app.test/api/mobile/auth/login", {
        email: "test@example.com",
        password: "Str0ng!Pass",
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.requires2FA).toBe(true);
    expect(json.tempToken).toBe("temp-token-5min");
    // Pas de JWT final à ce stade
    expect(json.token).toBeUndefined();
  });

  it("TU-3 : 2FA verify avec code TOTP → JWT final", async () => {
    const { POST } = await import("@/app/api/mobile/auth/2fa/verify/route");
    const res = await POST(
      makeRequest("https://app.test/api/mobile/auth/2fa/verify", {
        tempToken: "temp-token-5min",
        code: "123456",
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBe("jwt-final-token");
    expect(json.user.id).toBe("user-123");
  });

  it("TU-3b : 2FA verify avec backup code → JWT final", async () => {
    const { POST } = await import("@/app/api/mobile/auth/2fa/verify/route");
    const res = await POST(
      makeRequest("https://app.test/api/mobile/auth/2fa/verify", {
        tempToken: "temp-token-5min",
        backupCode: "1111-2222",
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBe("jwt-final-token");
  });

  it("TU-3c : Flux complet Login → 2FA verify enchaîné", async () => {
    // Étape 1 : Login retourne tempToken
    const { POST: loginPost } = await import("@/app/api/mobile/auth/login/route");
    const loginRes = await loginPost(
      makeRequest("https://app.test/api/mobile/auth/login", {
        email: "test@example.com",
        password: "Str0ng!Pass",
      })
    );
    const loginJson = await loginRes.json();
    expect(loginJson.requires2FA).toBe(true);

    // Étape 2 : Verify retourne JWT
    const { POST: verifyPost } = await import("@/app/api/mobile/auth/2fa/verify/route");
    const verifyRes = await verifyPost(
      makeRequest("https://app.test/api/mobile/auth/2fa/verify", {
        tempToken: loginJson.tempToken,
        code: "123456",
      })
    );
    const verifyJson = await verifyRes.json();
    expect(verifyJson.token).toBe("jwt-final-token");
    expect(verifyJson.user.id).toBe("user-123");
  });

  it("TU-3d : Enable 2FA (setup + confirm)", async () => {
    mockGetMobileUserId.mockResolvedValue("user-123");

    const { POST } = await import("@/app/api/mobile/auth/2fa/enable/route");

    // Étape 1 : Initier le setup (pas de code)
    const setupRes = await POST(
      makeRequest("https://app.test/api/mobile/auth/2fa/enable", {},
        { Authorization: "Bearer valid-jwt" }
      )
    );
    expect(setupRes.status).toBe(200);
    const setupJson = await setupRes.json();
    expect(setupJson.totpURI).toContain("otpauth://totp/");
    expect(setupJson.backupCodes).toHaveLength(2);

    // Étape 2 : Confirmer avec un code TOTP
    const confirmRes = await POST(
      makeRequest("https://app.test/api/mobile/auth/2fa/enable", { code: "123456" },
        { Authorization: "Bearer valid-jwt" }
      )
    );
    expect(confirmRes.status).toBe(200);
    const confirmJson = await confirmRes.json();
    expect(confirmJson.enabled).toBe(true);
  });
});
