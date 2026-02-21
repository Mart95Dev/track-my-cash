import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock nodemailer avant l'import
const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
const mockCreateTransport = vi.fn(() => ({ sendMail: mockSendMail }));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mockCreateTransport,
  },
}));

describe("sendEmail — graceful degradation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("TU-1-1 : si EMAIL_HOST absent → retourne { success: false } sans throw", async () => {
    vi.stubEnv("EMAIL_HOST", "");
    vi.stubEnv("EMAIL_USER", "test@example.com");

    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("TU-1-2 : si EMAIL_USER absent → retourne { success: false } sans throw", async () => {
    vi.stubEnv("EMAIL_HOST", "smtp.hostinger.com");
    vi.stubEnv("EMAIL_USER", "");

    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("TU-1-3 : si sendMail échoue → retourne { success: false, error: '...' }", async () => {
    vi.stubEnv("EMAIL_HOST", "smtp.hostinger.com");
    vi.stubEnv("EMAIL_USER", "test@example.com");
    vi.stubEnv("EMAIL_FROM", "test@example.com");
    mockSendMail.mockRejectedValueOnce(new Error("SMTP connection failed"));

    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("SMTP connection failed");
  });
});

describe("renderEmailBase — structure HTML", () => {
  it("TU-2-1 : contient le titre passé en param", async () => {
    const { renderEmailBase } = await import("@/lib/email");
    const html = renderEmailBase("Mon Titre", "<p>Contenu</p>");
    expect(html).toContain("Mon Titre");
  });

  it("TU-2-2 : contient le bodyHtml passé en param", async () => {
    const { renderEmailBase } = await import("@/lib/email");
    const html = renderEmailBase("Titre", "<p>Contenu spécial</p>");
    expect(html).toContain("<p>Contenu spécial</p>");
  });

  it("TU-2-3 : contient 'TrackMyCash' (branding)", async () => {
    const { renderEmailBase } = await import("@/lib/email");
    const html = renderEmailBase("Test", "<p>test</p>");
    expect(html).toContain("TrackMyCash");
  });

  it("TU-2-4 : commence par '<!DOCTYPE html>'", async () => {
    const { renderEmailBase } = await import("@/lib/email");
    const html = renderEmailBase("Test", "<p>test</p>");
    expect(html.trim()).toMatch(/^<!DOCTYPE html>/i);
  });
});
