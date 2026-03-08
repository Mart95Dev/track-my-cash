import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SRC = join(process.cwd(), "src");
const PUBLIC = join(process.cwd(), "public");

describe("STORY-138 — Notifications Push (Web Push API)", () => {
  // AC-1 : Toggle activation push dans les paramètres
  it("AC-1 PushNotificationToggle component existe", () => {
    expect(existsSync(join(SRC, "components/push-notification-toggle.tsx"))).toBe(true);
    const source = readFileSync(join(SRC, "components/push-notification-toggle.tsx"), "utf-8");
    expect(source).toContain("PushNotificationToggle");
    expect(source).toContain("Notification.requestPermission");
    expect(source).toContain("pushManager.subscribe");
    expect(source).toContain("pushManager.getSubscription");
  });

  // AC-1 : Page paramètres inclut le toggle push
  it("AC-1 paramètres page inclut PushNotificationToggle", () => {
    const source = readFileSync(join(SRC, "app/[locale]/(app)/parametres/page.tsx"), "utf-8");
    expect(source).toContain("PushNotificationToggle");
    expect(source).toContain("vapidPublicKey");
    expect(source).toContain("pushEnabled");
    expect(source).toContain("Notifications");
  });

  // AC-1 : API routes subscribe/unsubscribe existent
  it("AC-1 API routes push subscribe et unsubscribe existent", () => {
    expect(existsSync(join(SRC, "app/api/push/subscribe/route.ts"))).toBe(true);
    expect(existsSync(join(SRC, "app/api/push/unsubscribe/route.ts"))).toBe(true);

    const subscribe = readFileSync(join(SRC, "app/api/push/subscribe/route.ts"), "utf-8");
    expect(subscribe).toContain("savePushSubscription");
    expect(subscribe).toContain("getSession");

    const unsubscribe = readFileSync(join(SRC, "app/api/push/unsubscribe/route.ts"), "utf-8");
    expect(unsubscribe).toContain("removePushSubscription");
  });

  // AC-1 : Table push_subscriptions créée dans le schéma
  it("AC-1 push_subscriptions table définie dans db.ts", () => {
    const dbSource = readFileSync(join(SRC, "lib/db.ts"), "utf-8");
    expect(dbSource).toContain("push_subscriptions");
    expect(dbSource).toContain("endpoint");
    expect(dbSource).toContain("keys_p256dh");
    expect(dbSource).toContain("keys_auth");
  });

  // AC-2 : Alert service envoie des push pour solde bas
  it("AC-2 alert-service envoie une notification push en plus de l'email", () => {
    const source = readFileSync(join(SRC, "lib/alert-service.ts"), "utf-8");
    expect(source).toContain("sendPushNotification");
    expect(source).toContain("Solde bas");
    expect(source).toContain("userId");
  });

  // AC-3 : Budget alert service envoie des push pour dépassement
  it("AC-3 budget-alert-service envoie une notification push pour budget dépassé", () => {
    const source = readFileSync(join(SRC, "lib/budget-alert-service.ts"), "utf-8");
    expect(source).toContain("sendPushNotification");
    expect(source).toContain("Budget");
    expect(source).toContain("userId");
  });

  // AC-4 : Service Worker gère l'événement push
  it("AC-4 SW écoute les événements push et notificationclick", () => {
    const sw = readFileSync(join(PUBLIC, "sw.js"), "utf-8");
    expect(sw).toContain('addEventListener("push"');
    expect(sw).toContain("showNotification");
    expect(sw).toContain('addEventListener("notificationclick"');
    expect(sw).toContain("openWindow");
  });

  // AC-5 : Le toggle permet la désactivation
  it("AC-5 PushNotificationToggle gère la désactivation", () => {
    const source = readFileSync(join(SRC, "components/push-notification-toggle.tsx"), "utf-8");
    expect(source).toContain("unsubscribe");
    expect(source).toContain("/api/push/unsubscribe");
    expect(source).toContain('role="switch"');
    expect(source).toContain("aria-checked");
  });

  // AC-6 : Fallback — les services d'alerte envoient toujours un email en plus du push
  it("AC-6 alert services conservent l'envoi email (fallback)", () => {
    const alertSource = readFileSync(join(SRC, "lib/alert-service.ts"), "utf-8");
    const budgetSource = readFileSync(join(SRC, "lib/budget-alert-service.ts"), "utf-8");
    expect(alertSource).toContain("sendEmail");
    expect(budgetSource).toContain("sendEmail");
  });

  // AC-7 : push-notifications.ts module complet
  it("AC-7 push-notifications.ts exporte les fonctions nécessaires", () => {
    const source = readFileSync(join(SRC, "lib/push-notifications.ts"), "utf-8");
    expect(source).toContain("savePushSubscription");
    expect(source).toContain("removePushSubscription");
    expect(source).toContain("sendPushNotification");
    expect(source).toContain("hasPushSubscription");
    expect(source).toContain("getVapidPublicKey");
    expect(source).toContain("VAPID_PUBLIC_KEY");
    expect(source).toContain("webpush");
  });

  // AC-7 : VAPID keys via variables d'environnement
  it("AC-7 VAPID keys sont lues depuis les variables d'environnement", () => {
    const source = readFileSync(join(SRC, "lib/push-notifications.ts"), "utf-8");
    expect(source).toContain("process.env.VAPID_PUBLIC_KEY");
    expect(source).toContain("process.env.VAPID_PRIVATE_KEY");
    expect(source).toContain("process.env.VAPID_EMAIL");
  });

  // Non-régression : SW contient toujours les stratégies de cache existantes
  it("non-régression SW conserve Cache-First et Network-First", () => {
    const sw = readFileSync(join(PUBLIC, "sw.js"), "utf-8");
    expect(sw).toContain("CACHE_NAME");
    expect(sw).toContain("_next/static");
    expect(sw).toContain("SKIP_WAITING");
    expect(sw).toContain("/offline");
  });
});
