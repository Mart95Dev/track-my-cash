/**
 * STORY-105 : Barre de progression onboarding gamifiée
 */
import type { OnboardingProgress } from "@/lib/onboarding-progress";

interface OnboardingProgressBarProps {
  progress: OnboardingProgress;
  locale: string;
}

export function OnboardingProgressBar({
  progress,
}: OnboardingProgressBarProps) {
  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-main">Votre progression</h3>
        <span className="text-xs text-text-muted font-medium">
          {progress.completed} / {progress.total} complétées
        </span>
      </div>

      {/* Barre de progression */}
      <div className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-2 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Étapes */}
      <div className="grid grid-cols-4 gap-2">
        {progress.steps.map((step) => (
          <div key={step.label} className="flex flex-col items-center gap-1">
            <div
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                step.completed ? "bg-primary" : "bg-gray-200",
              ].join(" ")}
            >
              {step.completed ? (
                <span className="material-symbols-outlined text-[16px]">check</span>
              ) : (
                <span className="material-symbols-outlined text-[16px] text-gray-400">{step.icon}</span>
              )}
            </div>
            <span className="text-[10px] text-text-muted text-center leading-tight">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
