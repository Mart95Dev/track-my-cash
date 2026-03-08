import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SwRegister } from "@/components/sw-register";
import { PwaUpdateBanner } from "@/components/pwa-update-banner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrackMyCash — Gestionnaire de Comptes",
  description: "Gérez vos finances simplement et efficacement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={manrope.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-sans antialiased bg-background-light text-text-main">
        <SwRegister />
        <PwaUpdateBanner />
        {children}
      </body>
    </html>
  );
}
