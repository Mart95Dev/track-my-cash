import { getRequiredSession } from "@/lib/auth-utils";
import { getUserDb } from "@/lib/db";
import { getNotifications, getUnreadCount } from "@/lib/notification-queries";
import { markAllNotificationsReadAction } from "@/app/actions/notification-actions";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const locale = await getLocale();
  const session = await getRequiredSession(locale);
  const userId = session.user.id;
  const db = await getUserDb(userId);

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(db, 50),
    getUnreadCount(db),
  ]);

  const TYPE_ICONS: Record<string, string> = {
    low_balance: "account_balance_wallet",
    couple_balance: "balance",
    goal_reached: "emoji_events",
    partner_tx: "person_add",
  };

  const TYPE_COLORS: Record<string, string> = {
    low_balance: "text-danger",
    couple_balance: "text-warning",
    goal_reached: "text-success",
    partner_tx: "text-primary",
  };

  return (
    <div className="px-4 py-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="text-sm text-primary font-medium hover:underline"
            >
              Tout marquer comme lu
            </button>
          </form>
        )}
      </div>

      {/* Liste */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-text-muted mb-3">
            notifications_none
          </span>
          <p className="text-text-muted text-sm">Aucune notification pour l&apos;instant</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`rounded-2xl border p-4 transition-colors ${
                notif.read
                  ? "bg-white border-gray-100"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 flex-shrink-0 ${
                    TYPE_COLORS[notif.type] ?? "text-text-muted"
                  }`}
                >
                  {TYPE_ICONS[notif.type] ?? "notifications"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary leading-snug">
                    {notif.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 leading-snug">
                    {notif.body}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">
                    {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
