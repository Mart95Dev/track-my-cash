import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { NotificationsBell } from "@/components/notifications-bell";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDb } from "@/lib/db";
import { getNotifications, getUnreadNotificationsCount } from "@/lib/queries";

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
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(db, 10),
    getUnreadNotificationsCount(db),
  ]);

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
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <PwaInstallBanner />
    </div>
  );
}
