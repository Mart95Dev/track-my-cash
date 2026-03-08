import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { removePushSubscription } from "@/lib/push-notifications";

export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  await removePushSubscription(session.user.id);
  return NextResponse.json({ success: true });
}
