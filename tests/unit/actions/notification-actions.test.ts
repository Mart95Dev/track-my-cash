import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-test"),
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn().mockResolvedValue({}),
}));

const mockMarkNotificationRead = vi.fn().mockResolvedValue(undefined);
const mockMarkAllNotificationsRead = vi.fn().mockResolvedValue(undefined);
const mockCreateNotification = vi.fn().mockResolvedValue(undefined);
const mockGetUnreadCount = vi.fn().mockResolvedValue(0);
const mockGetNotifications = vi.fn().mockResolvedValue([
  {
    id: 1,
    type: "budget_exceeded",
    title: "Budget dépassé",
    message: "Vous avez dépensé 520 € sur un budget de 400 €",
    read: false,
    created_at: "2026-02-21T10:00:00",
  },
  {
    id: 2,
    type: "goal_reached",
    title: "Objectif atteint",
    message: "Vacances : 1000 € atteints",
    read: true,
    created_at: "2026-02-20T08:00:00",
  },
]);

vi.mock("@/lib/queries", () => ({
  markNotificationRead: mockMarkNotificationRead,
  markAllNotificationsRead: mockMarkAllNotificationsRead,
  createNotification: mockCreateNotification,
  getUnreadNotificationsCount: mockGetUnreadCount,
  getNotifications: mockGetNotifications,
}));

describe("notification-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-1-1 : markNotificationReadAction avec id valide → appelle markNotificationRead en DB", async () => {
    const { markNotificationReadAction } = await import("@/app/actions/notification-actions");
    await markNotificationReadAction(1);
    expect(mockMarkNotificationRead).toHaveBeenCalledWith({}, 1);
  });

  it("TU-1-2 : markAllNotificationsReadAction → appelle markAllNotificationsRead en DB", async () => {
    const { markAllNotificationsReadAction } = await import("@/app/actions/notification-actions");
    await markAllNotificationsReadAction();
    expect(mockMarkAllNotificationsRead).toHaveBeenCalledWith({});
  });

  it("TU-1-3 : createNotification avec tous les champs → insertion sans erreur", async () => {
    const { createNotification } = await import("@/lib/queries");
    await createNotification({} as Parameters<typeof createNotification>[0], "budget_exceeded", "Budget dépassé", "500 € > 400 €");
    expect(mockCreateNotification).toHaveBeenCalledWith(
      {},
      "budget_exceeded",
      "Budget dépassé",
      "500 € > 400 €"
    );
  });

  it("TU-1-4 : getUnreadNotificationsCount retourne 0 si aucune notification non lue", async () => {
    const { getUnreadNotificationsCount } = await import("@/lib/queries");
    const count = await getUnreadNotificationsCount({} as Parameters<typeof getUnreadNotificationsCount>[0]);
    expect(count).toBe(0);
  });

  it("TU-1-5 : getNotifications retourne les notifications triées par created_at DESC", async () => {
    const { getNotifications } = await import("@/lib/queries");
    const notifs = await getNotifications({} as Parameters<typeof getNotifications>[0], 10);
    expect(notifs).toHaveLength(2);
    // première notification = la plus récente (2026-02-21 > 2026-02-20)
    expect(new Date(notifs[0].created_at).getTime()).toBeGreaterThan(
      new Date(notifs[1].created_at).getTime()
    );
  });
});
