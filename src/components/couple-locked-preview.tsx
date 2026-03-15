/**
 * STORY-103 : Dashboard zones verrouillées couple
 */
import Link from "next/link";

interface CoupleLockedPreviewProps {
  locale: string;
  hasCoupleActive: boolean;
}

const LOCKED_FEATURES = [
  {
    icon: "balance",
    title: "Qui doit combien ?",
    description: "Suivez les depenses de chacun et equilibrez automatiquement.",
  },
  {
    icon: "monitoring",
    title: "Dashboard partage",
    description: "Visualisez vos finances communes en un coup d'oeil.",
  },
  {
    icon: "savings",
    title: "Objectifs a deux",
    description: "Epargnez ensemble pour vos projets communs.",
  },
];

export function CoupleLockedPreview({
  locale,
  hasCoupleActive,
}: CoupleLockedPreviewProps) {
  if (hasCoupleActive) return null;

  return (
    <section className="mx-4 mb-4 bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6C5CE7] text-[20px]">favorite</span>
          <h3 className="text-sm font-bold text-[#212121]">Espace couple</h3>
        </div>
        <span className="text-xs font-semibold text-[#6C5CE7] bg-[#F0EEFF] px-2.5 py-1 rounded-full">
          Pro / Premium
        </span>
      </div>

      {/* Features list */}
      <div className="px-5 pb-2">
        {LOCKED_FEATURES.map((feature) => (
          <div
            key={feature.icon}
            className="flex items-start gap-3 py-3 border-t border-[#EEEEEE]/60"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[#6C5CE7] text-[18px]">{feature.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#212121]">{feature.title}</p>
              <p className="text-xs text-[#757575] mt-0.5">{feature.description}</p>
            </div>
            <span className="material-symbols-outlined text-[#BDBDBD] text-[18px] mt-1 shrink-0">lock</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-1">
        <Link
          href={`/${locale}/couple`}
          className="flex items-center justify-center gap-2 w-full h-11 bg-[#6C5CE7] text-white font-bold rounded-xl text-sm transition-colors hover:bg-[#5A4BD1]"
          style={{ boxShadow: "0 4px 12px rgba(108,92,231,0.25)" }}
        >
          <span className="material-symbols-outlined text-[18px]">favorite</span>
          Activer l'espace couple
        </Link>
      </div>
    </section>
  );
}
