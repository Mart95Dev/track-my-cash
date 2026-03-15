import type { Metadata } from "next";
import { BottomNav } from "@/components/bottom-nav";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { NavProgress } from "@/components/nav-progress";
import { PlanBanner } from "@/components/plan-banner";
import { TrialUrgencyModal } from "@/components/trial-urgency-modal";
import { CoupleInviteBanner } from "@/components/couple-invite-banner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, getUserDb, ensureSchema } from "@/lib/db";
import { getDaysRemaining } from "@/lib/trial-utils";
import { getUnreadCount } from "@/lib/notification-queries";
import { getOnboardingChoice, getCoupleByUserId, getCoupleMembers } from "@/lib/couple-queries";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Koupli" },
  themeColor: "#0f172a",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout({ children, params }: Props) {
  const [{ locale }, session] = await Promise.all([
    params,
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!session) {
    redirect(`/${locale}/connexion`);
  }

  const userId = session.user.id;

  // ensureSchema + getUserDb + getDb en parallèle
  const [, userDb] = await Promise.all([
    ensureSchema(),
    getUserDb(userId),
  ]);
  const mainDb = getDb();

  // Toutes les requêtes layout en parallèle (incluant coupleMembers via sous-requête)
  const [subResult, unreadCount, onboardingChoice, coupleWithMembers] = await Promise.all([
    mainDb.execute({
      sql: "SELECT plan_id, status, trial_ends_at FROM subscriptions WHERE user_id = ?",
      args: [userId],
    }),
    getUnreadCount(userDb).catch(() => 0),
    getOnboardingChoice(userDb).catch(() => null),
    getCoupleByUserId(mainDb, userId)
      .then(async (c) => {
        if (!c) return { couple: null, members: [] as Awaited<ReturnType<typeof getCoupleMembers>> };
        const members = await getCoupleMembers(mainDb, c.id).catch(() => [] as Awaited<ReturnType<typeof getCoupleMembers>>);
        return { couple: c, members };
      })
      .catch(() => ({ couple: null, members: [] as Awaited<ReturnType<typeof getCoupleMembers>> })),
  ]);

  const couple = coupleWithMembers.couple;
  const coupleMembers = coupleWithMembers.members;

  const activeMemberCount = coupleMembers.length;

  // La bannière s'affiche si : choix=couple ET (pas de couple OU couple solo)
  const showInviteBanner =
    onboardingChoice === "couple" && (couple === null || activeMemberCount < 2);

  // Badge BottomNav : couple incomplet si couple solo OU veut couple mais pas encore de couple
  const coupleIncomplete =
    onboardingChoice === "couple" && (couple === null || activeMemberCount < 2);

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
    <div className="min-h-screen bg-background-light marketing-light">
      <NavProgress />
      <BottomNav unreadCount={unreadCount} coupleIncomplete={coupleIncomplete} />
      <div className="md:ml-60">
        <PlanBanner plan={bannerPlan} status={bannerStatus} daysRemaining={bannerDaysRemaining} />
        {showInviteBanner && couple && (
          <CoupleInviteBanner inviteCode={couple.invite_code} locale={locale} />
        )}
        <main className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 min-h-screen">
          {children}
        </main>
      </div>
      <PwaInstallBanner />
      <TrialUrgencyModal
        daysRemaining={bannerDaysRemaining ?? 0}
        status={bannerStatus ?? "active"}
      />
    </div>
  );
}
