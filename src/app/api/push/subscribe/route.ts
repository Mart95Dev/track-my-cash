import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { savePushSubscription } from "@/lib/push-notifications";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const subscription = await request.json();
  await savePushSubscription(session.user.id, subscription);
  return NextResponse.json({ success: true });
}
