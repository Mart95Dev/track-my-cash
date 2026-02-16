import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestionnaire de Comptes",
  description: "Gérez vos finances simplement et efficacement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} font-sans antialiased bg-background text-foreground`}>
        <div className="min-h-screen">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </div>
        <Toaster richColors />
      </body>
    </html>
  );
}
