import { Link } from "@/i18n/navigation";

const PRODUIT_LINKS = [
  { label: "Fonctionnalités", href: "/fonctionnalites" as const },
  { label: "Tarifs", href: "/tarifs" as const },
  { label: "Sécurité", href: "/securite" as const },
  { label: "Blog", href: "/blog" as const },
];

const COMPAGNIE_LINKS = [
  { label: "À propos", href: "/a-propos" as const },
  { label: "Contact", href: null },
];

const LEGAL_LINKS = [
  { label: "CGU", href: "/cgu" as const },
  { label: "Confidentialité", href: "/politique-confidentialite" as const },
  { label: "Mentions légales", href: null },
];

export function Footer() {
  return (
    <footer className="bg-[#1C1917] text-[#D6D3D1] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                T
              </div>
              <span className="font-bold tracking-tighter text-white text-lg">
                TrackMyCash
              </span>
            </div>
            <p className="text-[#A8A29E] text-sm leading-relaxed max-w-xs">
              La gestion financière de couple réinventée. Fini les tableurs,
              place à la sérénité.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-white font-semibold text-[14px] mb-4">
              Produit
            </h4>
            <ul className="space-y-3">
              {PRODUIT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A8A29E] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compagnie */}
          <div>
            <h4 className="text-white font-semibold text-[14px] mb-4">
              Compagnie
            </h4>
            <ul className="space-y-3">
              {COMPAGNIE_LINKS.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="text-sm text-[#A8A29E] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-sm text-[#A8A29E]">
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-white font-semibold text-[14px] mb-4">
              Légal
            </h4>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="text-sm text-[#A8A29E] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-sm text-[#A8A29E]">
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm text-[#A8A29E]">
            &copy; 2026 TrackMyCash &mdash; Gérez vos finances simplement
          </p>
          <p className="text-sm text-[#A8A29E]">Fait en France</p>
        </div>
      </div>
    </footer>
  );
}
