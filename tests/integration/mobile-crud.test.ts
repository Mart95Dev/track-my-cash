/**
 * Tests d'intégration — CRUD accounts + transactions (STORY-149)
 * AC-4 : Créer un compte, ajouter/modifier/supprimer une transaction
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockGetMobileUserId = vi.fn().mockResolvedValue("user-123");

vi.mock("@/lib/mobile-auth", () => ({
  getMobileUserId: (...args: unknown[]) => mockGetMobileUserId(...args),
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
  jsonNoContent: vi.fn(() => new Response(null, { status: 204 })),
  handleCors: vi.fn(() => new Response(null, { status: 204 })),
}));

// ── Account queries mock ─────────────────────────────────────────────────────

const mockAccount = {
  id: 1,
  name: "Compte Courant",
  initial_balance: 1000,
  balance_date: "2026-01-01",
  currency: "EUR",
  alert_threshold: null,
};

const mockGetAllAccounts = vi.fn().mockResolvedValue([mockAccount]);
const mockCreateAccount = vi.fn().mockResolvedValue(mockAccount);
const mockGetAccountById = vi.fn().mockResolvedValue(mockAccount);
const mockUpdateAccount = vi.fn().mockResolvedValue(undefined);
const mockDeleteAccount = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/queries/account-queries", () => ({
  getAllAccounts: (...args: unknown[]) => mockGetAllAccounts(...args),
  createAccount: (...args: unknown[]) => mockCreateAccount(...args),
  getAccountById: (...args: unknown[]) => mockGetAccountById(...args),
  updateAccount: (...args: unknown[]) => mockUpdateAccount(...args),
  deleteAccount: (...args: unknown[]) => mockDeleteAccount(...args),
}));

// ── Transaction queries mock ─────────────────────────────────────────────────

const mockTransaction = {
  id: 10,
  account_id: 1,
  type: "expense",
  amount: 50,
  date: "2026-03-01",
  category: "Alimentation",
  subcategory: "",
  description: "Courses",
};

const mockSearchTransactions = vi.fn().mockResolvedValue({
  transactions: [mockTransaction],
  total: 1,
});
const mockCreateTransaction = vi.fn().mockResolvedValue(mockTransaction);
const mockUpdateTransaction = vi.fn().mockResolvedValue(undefined);
const mockDeleteTransaction = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/queries/transaction-queries", () => ({
  searchTransactions: (...args: unknown[]) => mockSearchTransactions(...args),
  createTransaction: (...args: unknown[]) => mockCreateTransaction(...args),
  updateTransaction: (...args: unknown[]) => mockUpdateTransaction(...args),
  deleteTransaction: (...args: unknown[]) => mockDeleteTransaction(...args),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
  getDb: vi.fn(() => ({})),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(url: string, method: string, body?: Record<string, unknown>) {
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-jwt",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return new Request(url, opts);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Intégration — CRUD Accounts (STORY-149 AC-4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
  });

  it("TU-7a : GET /accounts → liste des comptes", async () => {
    const { GET } = await import("@/app/api/mobile/accounts/route");
    const res = await GET(
      makeRequest("https://app.test/api/mobile/accounts", "GET")
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].name).toBe("Compte Courant");
  });

  it("TU-7b : POST /accounts → crée un compte (201)", async () => {
    const { POST } = await import("@/app/api/mobile/accounts/route");
    const res = await POST(
      makeRequest("https://app.test/api/mobile/accounts", "POST", {
        name: "Épargne",
        initial_balance: 5000,
        balance_date: "2026-03-01",
        currency: "EUR",
      })
    );

    expect(res.status).toBe(201);
    expect(mockCreateAccount).toHaveBeenCalledWith(
      expect.anything(),
      "Épargne", 5000, "2026-03-01", "EUR"
    );
  });

  it("TU-7c : GET /accounts/[id] → détail d'un compte", async () => {
    const { GET } = await import("@/app/api/mobile/accounts/[id]/route");
    const res = await GET(
      makeRequest("https://app.test/api/mobile/accounts/1", "GET"),
      { params: Promise.resolve({ id: "1" }) }
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(1);
  });

  it("TU-7d : PUT /accounts/[id] → modifie un compte", async () => {
    mockGetAccountById.mockResolvedValue({ ...mockAccount, name: "Épargne MAJ" });

    const { PUT } = await import("@/app/api/mobile/accounts/[id]/route");
    const res = await PUT(
      makeRequest("https://app.test/api/mobile/accounts/1", "PUT", {
        name: "Épargne MAJ",
        initial_balance: 6000,
        balance_date: "2026-03-01",
        currency: "EUR",
      }),
      { params: Promise.resolve({ id: "1" }) }
    );

    expect(res.status).toBe(200);
    expect(mockUpdateAccount).toHaveBeenCalled();
  });

  it("TU-7e : DELETE /accounts/[id] → supprime un compte (204)", async () => {
    const { DELETE } = await import("@/app/api/mobile/accounts/[id]/route");
    const res = await DELETE(
      makeRequest("https://app.test/api/mobile/accounts/1", "DELETE"),
      { params: Promise.resolve({ id: "1" }) }
    );

    expect(res.status).toBe(204);
    expect(mockDeleteAccount).toHaveBeenCalledWith(expect.anything(), 1);
  });

  it("TU-7f : GET /accounts/[id] → 404 si introuvable", async () => {
    mockGetAccountById.mockResolvedValue(null);

    const { GET } = await import("@/app/api/mobile/accounts/[id]/route");
    const res = await GET(
      makeRequest("https://app.test/api/mobile/accounts/999", "GET"),
      { params: Promise.resolve({ id: "999" }) }
    );

    expect(res.status).toBe(404);
  });
});

describe("Intégration — CRUD Transactions (STORY-149 AC-4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
  });

  it("TU-8a : GET /transactions → liste paginée", async () => {
    const { GET } = await import("@/app/api/mobile/transactions/route");
    const res = await GET(
      makeRequest("https://app.test/api/mobile/transactions?page=1&limit=20", "GET")
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.transactions).toHaveLength(1);
    expect(json.total).toBe(1);
    expect(json.page).toBe(1);
  });

  it("TU-8b : POST /transactions → crée une transaction (201)", async () => {
    const { POST } = await import("@/app/api/mobile/transactions/route");
    const res = await POST(
      makeRequest("https://app.test/api/mobile/transactions", "POST", {
        account_id: 1,
        type: "expense",
        amount: 42.50,
        date: "2026-03-10",
        category: "Restaurant",
        description: "Déjeuner",
      })
    );

    expect(res.status).toBe(201);
    expect(mockCreateTransaction).toHaveBeenCalledWith(
      expect.anything(), 1, "expense", 42.50, "2026-03-10", "Restaurant", "", "Déjeuner"
    );
  });

  it("TU-8c : PUT /transactions/[id] → modifie une transaction", async () => {
    const { PUT } = await import("@/app/api/mobile/transactions/[id]/route");
    const res = await PUT(
      makeRequest("https://app.test/api/mobile/transactions/10", "PUT", {
        account_id: 1,
        type: "expense",
        amount: 55,
        date: "2026-03-10",
        category: "Restaurant",
        description: "Déjeuner modifié",
      }),
      { params: Promise.resolve({ id: "10" }) }
    );

    expect(res.status).toBe(200);
    expect(mockUpdateTransaction).toHaveBeenCalledWith(
      expect.anything(), 10, 1, "expense", 55, "2026-03-10", "Restaurant", "", "Déjeuner modifié"
    );
  });

  it("TU-8d : DELETE /transactions/[id] → supprime une transaction", async () => {
    const { DELETE } = await import("@/app/api/mobile/transactions/[id]/route");
    const res = await DELETE(
      makeRequest("https://app.test/api/mobile/transactions/10", "DELETE"),
      { params: Promise.resolve({ id: "10" }) }
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("supprimée");
  });

  it("TU-8e : POST /transactions validation → 400 si champs manquants", async () => {
    const { POST } = await import("@/app/api/mobile/transactions/route");
    const res = await POST(
      makeRequest("https://app.test/api/mobile/transactions", "POST", {
        type: "expense",
        // manque account_id, amount, date
      })
    );

    expect(res.status).toBe(400);
  });
});

describe("Intégration — Flux CRUD complet (STORY-149 AC-4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMobileUserId.mockResolvedValue("user-123");
  });

  it("TU-9 : Créer compte → créer transaction → modifier → supprimer", async () => {
    // 1. Créer un compte
    const { POST: createAccount } = await import("@/app/api/mobile/accounts/route");
    const accountRes = await createAccount(
      makeRequest("https://app.test/api/mobile/accounts", "POST", {
        name: "Test Intégration",
        initial_balance: 1000,
        balance_date: "2026-03-01",
        currency: "EUR",
      })
    );
    expect(accountRes.status).toBe(201);

    // 2. Créer une transaction
    const { POST: createTx } = await import("@/app/api/mobile/transactions/route");
    const txRes = await createTx(
      makeRequest("https://app.test/api/mobile/transactions", "POST", {
        account_id: 1,
        type: "expense",
        amount: 100,
        date: "2026-03-05",
        category: "Courses",
        description: "Supermarché",
      })
    );
    expect(txRes.status).toBe(201);

    // 3. Modifier la transaction
    const { PUT: updateTx } = await import("@/app/api/mobile/transactions/[id]/route");
    const updateRes = await updateTx(
      makeRequest("https://app.test/api/mobile/transactions/10", "PUT", {
        account_id: 1,
        type: "expense",
        amount: 120,
        date: "2026-03-05",
        category: "Courses",
        description: "Supermarché (corrigé)",
      }),
      { params: Promise.resolve({ id: "10" }) }
    );
    expect(updateRes.status).toBe(200);

    // 4. Supprimer la transaction
    const { DELETE: deleteTx } = await import("@/app/api/mobile/transactions/[id]/route");
    const deleteRes = await deleteTx(
      makeRequest("https://app.test/api/mobile/transactions/10", "DELETE"),
      { params: Promise.resolve({ id: "10" }) }
    );
    expect(deleteRes.status).toBe(200);
  });
});
