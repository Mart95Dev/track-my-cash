import type { HealthScore } from "@/lib/health-score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LABEL_COLORS: Record<HealthScore["label"], string> = {
  Excellent: "text-green-600",
  Bon: "text-blue-600",
  "À améliorer": "text-orange-500",
  Attention: "text-red-600",
};

const GAUGE_COLORS: Record<HealthScore["label"], string> = {
  Excellent: "#16a34a",
  Bon: "#2563eb",
  "À améliorer": "#f97316",
  Attention: "#dc2626",
};

const SCORE_LABELS: Record<HealthScore["label"], string> = {
  Excellent: "Excellent",
  Bon: "Bon",
  "À améliorer": "À améliorer",
  Attention: "Attention",
};

const SUB_SCORES = [
  { key: "savingsScore" as const, label: "Épargne" },
  { key: "budgetsScore" as const, label: "Budgets" },
  { key: "goalsScore" as const, label: "Objectifs" },
  { key: "stabilityScore" as const, label: "Stabilité" },
];

interface HealthScoreWidgetProps {
  score: HealthScore;
}

export function HealthScoreWidget({ score }: HealthScoreWidgetProps) {
  const color = GAUGE_COLORS[score.label];
  const textColor = LABEL_COLORS[score.label];

  // Jauge semi-circulaire SVG
  const radius = 40;
  const cx = 60;
  const cy = 60;
  const circumference = Math.PI * radius; // demi-cercle
  const offset = circumference * (1 - score.total / 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Score de santé financière
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Jauge SVG */}
          <div className="flex flex-col items-center shrink-0">
            <svg width="120" height="70" viewBox="0 0 120 70" aria-label={`Score : ${score.total}/100`}>
              {/* Arc de fond */}
              <path
                d={`M 20 60 A 40 40 0 0 1 100 60`}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Arc de progression */}
              <path
                d={`M 20 60 A 40 40 0 0 1 100 60`}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
              {/* Score numérique */}
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                className="font-bold"
                fill={color}
                fontSize="20"
                fontWeight="700"
              >
                {score.total}
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="9"
              >
                /100
              </text>
            </svg>
            <span className={`text-sm font-semibold mt-1 ${textColor}`}>
              {SCORE_LABELS[score.label]}
            </span>
          </div>

          {/* Sous-scores */}
          <div className="flex-1 w-full space-y-2">
            {SUB_SCORES.map(({ key, label }) => {
              const value = score[key];
              const pct = (value / 25) * 100;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value.toFixed(1)}/25</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
