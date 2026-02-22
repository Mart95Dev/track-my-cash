export interface MoMVariation {
  current: number;
  previous: number | null;
  percentChange: number | null;
  direction: "up" | "down" | "stable" | "no_previous";
}

export function computeMoMVariation(current: number, previous: number | null): MoMVariation {
  if (previous === null || previous === 0) {
    return { current, previous, percentChange: null, direction: "no_previous" };
  }
  const percentChange = ((current - previous) / previous) * 100;
  const direction = percentChange > 0.5 ? "up" : percentChange < -0.5 ? "down" : "stable";
  return { current, previous, percentChange, direction };
}
