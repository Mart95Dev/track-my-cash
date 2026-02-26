import { Link } from "@/i18n/navigation";

const FOOTER_COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/fonctionnalites" as const },
      { label: "Sécurité", href: "/cgu" as const },
      { label: "Blog", href: "/blog" as const },
    ],
  },
  {
    title: "Compagnie",
    links: [
      { label: "À propos", href: "/cgu" as const },
      { label: "Contact", href: "/contact" as const },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "CGU", href: "/cgu" as const },
      { label: "Politique de confidentialité", href: "/politique-confidentialite" as const },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Colonnes */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                T
              </div>
              <span className="font-bold tracking-tighter text-slate-900">TrackMyCash</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Nous construisons le standard de la gestion financière collaborative.
            </p>
          </div>

          {/* 3 colonnes Produit / Compagnie / Légal */}
          <div className="flex gap-12 md:gap-16 flex-wrap">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm text-slate-900 mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {year} TrackMyCash — Gérez vos finances simplement
          </p>
        </div>

      </div>
    </footer>
  );
}
