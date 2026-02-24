import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({ children, params }: Props) {
  const { locale } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session) {
      redirect(`/${locale}`);
    }
  } catch {
    // BetterAuth non disponible — laisser passer vers la page auth
  }

  return <>{children}</>;
}
