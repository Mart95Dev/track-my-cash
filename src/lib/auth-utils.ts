import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getRequiredSession(locale = "fr") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/${locale}/connexion`);
  }
  return session;
}

export async function getRequiredUserId(locale = "fr"): Promise<string> {
  const session = await getRequiredSession(locale);
  return session.user.id;
}
