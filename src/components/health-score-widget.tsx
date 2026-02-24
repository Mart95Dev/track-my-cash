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

interface HealthScoreWidgetProps {
  score: HealthScore;
}

export function HealthScoreWidget({ score }: HealthScoreWidgetProps) {
  const circumference = 2 * Math.PI * 15.9155;
  const dashArray = `${(score.total / 100) * circumference} ${circumference}`;
  const gaugeColor = GAUGE_COLORS[score.label];
  const textColor = SCORE_COLORS[score.label];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
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
          <span className="text-2xl font-black text-text-main">{score.total}</span>
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{score.label}</span>
        </div>
      </div>
      <p className={`mt-3 text-xs font-bold ${textColor}`}>Santé financière</p>
    </div>
  );
}
