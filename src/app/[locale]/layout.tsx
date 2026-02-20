import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <NextIntlClientProvider>
      <ThemeProvider>
        <div className="min-h-screen">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </div>
        <Toaster richColors />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
