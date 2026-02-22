import Link from "next/link";

type TrialBannerProps = {
  daysRemaining: number;
};

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  return (
    <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-orange-800">
          <span className="font-semibold">Essai Pro</span> —{" "}
          {daysRemaining > 0
            ? `${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} restant${daysRemaining > 1 ? "s" : ""}`
            : "Dernier jour"}
        </p>
        <Link
          href="/tarifs"
          className="text-sm font-semibold text-orange-900 underline hover:no-underline shrink-0"
        >
          Souscrire
        </Link>
      </div>
    </div>
  );
}
