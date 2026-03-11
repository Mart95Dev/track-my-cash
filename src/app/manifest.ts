import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Koupli",
    short_name: "Koupli",
    description: "Gérez vos comptes bancaires personnels simplement",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4848e5",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Tableau de bord",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Transactions",
        short_name: "Transactions",
        url: "/transactions",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Comptes",
        short_name: "Comptes",
        url: "/comptes",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
    screenshots: [
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
    categories: ["finance", "productivity"],
    lang: "fr",
    dir: "ltr",
  };
}
