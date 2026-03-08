"use client";

import { useState, useEffect } from "react";

interface PushNotificationToggleProps {
  vapidPublicKey: string;
  initialEnabled: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle({ vapidPublicKey, initialEnabled }: PushNotificationToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
    }
  }, []);

  async function handleToggle() {
    if (!supported || loading) return;
    setLoading(true);

    try {
      if (enabled) {
        // Désactiver les push
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        await fetch("/api/push/unsubscribe", { method: "POST" });
        setEnabled(false);
      } else {
        // Demander la permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setLoading(false);
          return;
        }

        // S'abonner
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });
        setEnabled(true);
      }
    } catch {
      console.error("[push] Erreur lors du toggle push");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-main">Notifications push</p>
          <p className="text-xs text-text-muted mt-0.5">Non supporté par ce navigateur</p>
        </div>
        <span className="text-xs text-text-muted bg-slate-100 px-2 py-1 rounded-full">Indisponible</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text-main">Notifications push</p>
        <p className="text-xs text-text-muted mt-0.5">
          {enabled ? "Alertes solde bas et budgets dépassés" : "Recevez des alertes en temps réel"}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-60 ${
          enabled ? "bg-primary" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
