import { formatCurrency } from "@/lib/format";

interface CoupleBalanceCardProps {
  user1Paid: number;
  user2Paid: number;
  partnerName: string;
  diff: number;
  locale: string;
}

export function CoupleBalanceCard({
  user1Paid,
  user2Paid,
  partnerName,
  diff,
  locale,
}: CoupleBalanceCardProps) {
  const amount = Math.abs(diff);

  let badgeText: string;
  let badgeClass: string;

  if (diff > 0) {
    badgeText = `Partenaire vous doit ${formatCurrency(amount, "EUR", locale)}`;
    badgeClass = "text-success bg-success/10";
  } else if (diff < 0) {
    badgeText = `Vous devez ${formatCurrency(amount, "EUR", locale)} à votre partenaire`;
    badgeClass = "text-danger bg-danger/10";
  } else {
    badgeText = "Vous êtes à égalité";
    badgeClass = "text-primary bg-primary/10";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">balance</span>
        <h2 className="font-bold text-text-main text-sm">Balance couple</h2>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Vous avez payé</span>
          <span className="font-semibold text-text-main">
            {formatCurrency(user1Paid, "EUR", locale)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">{partnerName} a payé</span>
          <span className="font-semibold text-text-main">
            {formatCurrency(user2Paid, "EUR", locale)}
          </span>
        </div>
      </div>

      <div className={`rounded-xl px-3 py-2 text-sm font-medium text-center ${badgeClass}`}>
        {badgeText}
      </div>
    </div>
  );
}
