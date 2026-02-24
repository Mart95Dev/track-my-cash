/**
 * INT02 — AC-1, AC-3 à AC-7 : Intégration admin_logs dans track-my-cash
 * Tests source-based : vérifie que chaque fichier contient les appels à writeAdminLog
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd(); // track-my-cash root

describe("INT02 — AC-1 : admin_logs dans initSchema de db.ts", () => {
  it("TINT02-6 : db.ts contient CREATE TABLE IF NOT EXISTS admin_logs", () => {
    const content = readFileSync(join(ROOT, "src/lib/db.ts"), "utf-8");
    expect(content).toContain("admin_logs");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS");
  });

  it("TINT02-7 : la définition admin_logs inclut les colonnes id, type, user_id, message, payload, created_at", () => {
    const content = readFileSync(join(ROOT, "src/lib/db.ts"), "utf-8");
    // Extraire le bloc admin_logs
    const adminLogsIdx = content.indexOf("admin_logs");
    const snippet = content.slice(adminLogsIdx, adminLogsIdx + 400);
    expect(snippet).toContain("type");
    expect(snippet).toContain("user_id");
    expect(snippet).toContain("message");
    expect(snippet).toContain("payload");
    expect(snippet).toContain("created_at");
  });
});

describe("INT02 — AC-3 : check-trials appelle writeAdminLog", () => {
  it("TINT02-8 : check-trials importe writeAdminLog", () => {
    const content = readFileSync(
      join(ROOT, "src/app/api/cron/check-trials/route.ts"),
      "utf-8"
    );
    expect(content).toContain("writeAdminLog");
  });

  it("TINT02-9 : check-trials appelle writeAdminLog avec le type 'trial_expired'", () => {
    const content = readFileSync(
      join(ROOT, "src/app/api/cron/check-trials/route.ts"),
      "utf-8"
    );
    expect(content).toContain("trial_expired");
  });
});

describe("INT02 — AC-4 : delete-accounts appelle writeAdminLog", () => {
  it("TINT02-10 : delete-accounts importe writeAdminLog", () => {
    const content = readFileSync(
      join(ROOT, "src/app/api/cron/delete-accounts/route.ts"),
      "utf-8"
    );
    expect(content).toContain("writeAdminLog");
  });

  it("TINT02-11 : delete-accounts appelle writeAdminLog avec le type 'deletion_executed'", () => {
    const content = readFileSync(
      join(ROOT, "src/app/api/cron/delete-accounts/route.ts"),
      "utf-8"
    );
    expect(content).toContain("deletion_executed");
  });
});

describe("INT02 — AC-5 : deletion-reminder appelle writeAdminLog", () => {
  it("TINT02-12 : deletion-reminder importe writeAdminLog", () => {
    const content = readFileSync(
      join(ROOT, "src/app/api/cron/deletion-reminder/route.ts"),
      "utf-8"
    );
    expect(content).toContain("writeAdminLog");
  });

  it("TINT02-13 : deletion-reminder appelle writeAdminLog avec 'deletion_reminder_sent'", () => {
    const content = readFileSync(
      join(ROOT, "src/app/api/cron/deletion-reminder/route.ts"),
      "utf-8"
    );
    expect(content).toContain("deletion_reminder_sent");
  });
});

describe("INT02 — AC-6 : webhook Stripe appelle writeAdminLog", () => {
  it("TINT02-14 : webhook Stripe contient writeAdminLog", () => {
    const content = readFileSync(
      join(ROOT, "src/app/api/stripe/webhook/route.ts"),
      "utf-8"
    );
    expect(content).toContain("writeAdminLog");
  });

  it("TINT02-15 : webhook Stripe logue 'subscription_activated' pour checkout.session.completed", () => {
    const content = readFileSync(
      join(ROOT, "src/app/api/stripe/webhook/route.ts"),
      "utf-8"
    );
    expect(content).toContain("subscription_activated");
  });
});

describe("INT02 — AC-7 : createTrialSubscription appelle writeAdminLog", () => {
  it("TINT02-16 : trial-utils.ts contient writeAdminLog", () => {
    const content = readFileSync(join(ROOT, "src/lib/trial-utils.ts"), "utf-8");
    expect(content).toContain("writeAdminLog");
  });

  it("TINT02-17 : trial-utils.ts logue 'trial_started'", () => {
    const content = readFileSync(join(ROOT, "src/lib/trial-utils.ts"), "utf-8");
    expect(content).toContain("trial_started");
  });
});
