import type { HealthScore } from "@/lib/health-score";

const SCORE_COLORS: Record<HealthScore["label"], string> = {
  Excellent: "text-success",
  Bon: "text-primary",
  "À améliorer": "text-warning",
  Attention: "text-danger",
};

const GAUGE_COLORS: Record<HealthScore["label"], string> = {
  Excellent: "#078841",
  Bon: "#4848e5",
  "À améliorer": "#e7a008",
  Attention: "#e74008",
};

const SCORE_BG_COLORS: Record<HealthScore["label"], string> = {
  Excellent: "bg-success/10",
  Bon: "bg-primary/10",
  "À améliorer": "bg-warning/10",
  Attention: "bg-danger/10",
};

interface HealthScoreWidgetProps {
  score: HealthScore;
}

export function HealthScoreWidget({ score }: HealthScoreWidgetProps) {
  const circumference = 2 * Math.PI * 15.9155;
  const dashArray = `${(score.total / 100) * circumference} ${circumference}`;
  const gaugeColor = GAUGE_COLORS[score.label];
  const textColor = SCORE_COLORS[score.label];
  const bgColor = SCORE_BG_COLORS[score.label];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100">
      <p className="text-text-main text-sm font-bold mb-3">Santé financière</p>
      <div className="flex items-center gap-4">
        {/* Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              fill="none"
              stroke={gaugeColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-text-main leading-none">{score.total}</span>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">/100</span>
          </div>
        </div>

        {/* Score details */}
        <div className="flex-1 space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgColor}`}>
            <span className={`text-xs font-bold ${textColor}`}>{score.label}</span>
          </div>
          <div className="space-y-1">
            {[
              { label: "Épargne", value: score.savingsScore, max: 25 },
              { label: "Budgets", value: score.budgetsScore, max: 25 },
              { label: "Stabilité", value: score.stabilityScore, max: 25 },
            ].map(({ label, value, max }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted w-14 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: gaugeColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
