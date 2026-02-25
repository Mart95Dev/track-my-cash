/**
 * STORY-103 : Dashboard zones verrouillées couple
 */
import Link from "next/link";

interface CoupleLockedPreviewProps {
  locale: string;
  hasCoupleActive: boolean;
}

export function CoupleLockedPreview({
  locale,
  hasCoupleActive,
}: CoupleLockedPreviewProps) {
  if (hasCoupleActive) return null;

  return (
    <section className="px-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-main">Espace couple</h3>
        <span className="material-symbols-outlined text-text-muted text-[18px]">lock</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-4">
          <div className="blur-sm select-none">
            <p className="text-sm font-bold text-text-main">Balance couple</p>
            <div className="h-8 bg-gray-100 rounded-lg w-3/4 mt-1" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="material-symbols-outlined text-text-muted text-[32px]">lock</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-4">
          <div className="blur-sm select-none">
            <p className="text-sm font-bold text-text-main">Tableau de bord couple</p>
            <div className="h-8 bg-gray-100 rounded-lg w-full mt-1" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="material-symbols-outlined text-text-muted text-[32px]">lock</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-4">
          <div className="blur-sm select-none">
            <p className="text-sm font-bold text-text-main">Objectifs communs</p>
            <div className="h-8 bg-gray-100 rounded-lg w-5/6 mt-1" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="material-symbols-outlined text-text-muted text-[32px]">lock</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Link
          href={`/${locale}/couple`}
          className="inline-flex items-center justify-center h-11 px-6 bg-primary text-white font-bold rounded-xl text-sm"
        >
          Activer l’espace couple
        </Link>
      </div>
    </section>
  );
}
