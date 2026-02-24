import { getRequiredUserId } from "@/lib/auth-utils";
import { getDb } from "@/lib/db";
import { getCoupleByUserId, getCoupleMembers } from "@/lib/couple-queries";
import { leaveCoupleFormAction } from "@/app/actions/couple-actions";
import { CopyInviteCodeButton } from "@/components/copy-invite-code-button";
import { CoupleCreateForm } from "@/components/couple-create-form";
import { CoupleJoinForm } from "@/components/couple-join-form";

export const dynamic = "force-dynamic";

export default async function CouplePage() {
  const userId = await getRequiredUserId();
  const db = getDb();

  const couple = await getCoupleByUserId(db, userId);

  if (!couple) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-[28px]">favorite</span>
          <h1 className="text-2xl font-bold text-text-main">Espace couple</h1>
        </div>

        <p className="text-sm text-text-muted">
          Partagez vos finances avec votre partenaire. Créez un espace ou rejoignez-en un avec un code.
        </p>

        {/* Créer un espace couple */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
            <h2 className="font-bold text-text-main">Créer un espace couple</h2>
          </div>
          <CoupleCreateForm />
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-text-muted font-medium">ou</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Rejoindre avec un code */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">group_add</span>
            <h2 className="font-bold text-text-main">Rejoindre avec un code</h2>
          </div>
          <CoupleJoinForm />
        </div>
      </div>
    );
  }

  const members = await getCoupleMembers(db, couple.id);
  const partner = members.find((m) => m.user_id !== userId);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary text-[28px]">favorite</span>
        <h1 className="text-2xl font-bold text-text-main">Espace couple</h1>
      </div>

      {/* Card couple actif */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">favorite</span>
          <h2 className="font-bold text-text-main">Votre espace couple</h2>
        </div>

        {couple.name && (
          <p className="text-sm font-medium text-text-main mb-3">{couple.name}</p>
        )}

        {/* Partenaire */}
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Partenaire</p>
          {partner ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {partner.user_id.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-sm text-text-main font-medium">{partner.user_id}</p>
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">En attente d&apos;un partenaire</p>
          )}
        </div>

        {/* Code d'invitation */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
              Code d&apos;invitation
            </p>
            <CopyInviteCodeButton inviteCode={couple.invite_code} />
          </div>
          <p className="text-2xl font-extrabold text-primary tracking-widest">
            {couple.invite_code}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Partagez ce code avec votre partenaire pour qu&apos;il rejoigne votre espace.
          </p>
        </div>

        {/* Quitter le couple */}
        <form action={leaveCoupleFormAction}>
          <button
            type="submit"
            className="w-full border border-danger/30 text-danger font-bold rounded-xl px-4 py-2.5 text-sm hover:bg-danger/5"
          >
            Quitter le couple
          </button>
        </form>
      </div>
    </div>
  );
}
