import Link from "next/link";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CoupleInviteBannerProps {
  inviteCode: string;
  locale: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Bannière persistante (non-dismissable) affichée quand l'utilisateur a
 * choisi le mode couple mais n'a pas encore de partenaire actif.
 * Affiche le code d'invitation et un lien vers la page /couple.
 */
export function CoupleInviteBanner({ inviteCode, locale }: CoupleInviteBannerProps) {
  return (
    <div
      role="banner"
      className="w-full bg-primary/10 border-b border-primary/20 px-4 py-2"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
            favorite
          </span>
          <p className="text-sm text-primary font-medium truncate">
            Invitez votre partenaire avec le code{" "}
            <span className="font-bold tracking-wider">{inviteCode}</span>
          </p>
        </div>
        <Link
          href={`/${locale}/couple`}
          className="shrink-0 text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          Voir
        </Link>
      </div>
    </div>
  );
}
