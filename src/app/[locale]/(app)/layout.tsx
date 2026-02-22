import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { NotificationsBell } from "@/components/notifications-bell";
import { PlanBanner } from "@/components/plan-banner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDb, getDb } from "@/lib/db";
import { getNotifications, getUnreadNotificationsCount } from "@/lib/queries";
import { getDaysRemaining } from "@/lib/trial-utils";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "TrackMyCash" },
  themeColor: "#0f172a",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/${locale}/connexion`);
  }

  const db = await getUserDb(session.user.id);
  const mainDb = getDb();

  const [notifications, unreadCount, subResult] = await Promise.all([
    getNotifications(db, 10),
    getUnreadNotificationsCount(db),
    mainDb.execute({
      sql: "SELECT plan_id, status, trial_ends_at FROM subscriptions WHERE user_id = ?",
      args: [session.user.id],
    }),
  ]);

  const subRow = subResult.rows[0] ?? null;
  const bannerPlan = subRow
    ? (String(subRow.plan_id ?? "free") as "free" | "pro" | "premium")
    : "free";
  const bannerStatus = subRow
    ? (String(subRow.status ?? "active") as "inactive" | "active" | "trialing" | "canceled" | "expired")
    : undefined;
  const bannerDaysRemaining =
    bannerStatus === "trialing" && subRow?.trial_ends_at
      ? getDaysRemaining(String(subRow.trial_ends_at))
      : undefined;

  return (
    <div className="min-h-screen">
      <Navigation
        rightSlot={
          <NotificationsBell
            initialNotifications={notifications}
            unreadCount={unreadCount}
          />
        }
      />
      <PlanBanner plan={bannerPlan} status={bannerStatus} daysRemaining={bannerDaysRemaining} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <PwaInstallBanner />
    </div>
  );
}
