"use server";

import { setSetting } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function completeOnboardingAction() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  setSetting(db, "onboarding_completed", "true");
  revalidatePath("/dashboard");
}
