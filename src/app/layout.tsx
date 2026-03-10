import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { SwRegister } from "@/components/sw-register";
import { PwaUpdateBanner } from "@/components/pwa-update-banner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com"),
  title: {
    default: "TrackMyCash — Gestion financière de couple",
    template: "%s | TrackMyCash",
  },
  description:
    "Gérez vos finances de couple : suivez vos dépenses communes, équilibrez qui doit quoi et atteignez vos objectifs ensemble. Gratuit, sécurisé, sans publicité.",
  robots: { index: true, follow: true },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${dmSans.variable} ${dmSerif.variable}`}>
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
