import { Link } from "@/i18n/navigation";

const FOOTER_LINKS = [
  { label: "CGU", href: "/cgu" as const },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" as const },
  { label: "Contact", href: "/contact" as const },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-text-muted">
          © {year} TrackMyCash — Gérez vos finances simplement
        </p>
        <nav className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted transition-colors hover:text-text-main"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
