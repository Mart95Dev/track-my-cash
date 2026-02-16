"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PERIODS = [3, 6, 9, 12];

export function ForecastControls({ currentMonths }: { currentMonths: number }) {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      {PERIODS.map((m) => (
        <Button
          key={m}
          variant={currentMonths === m ? "default" : "outline"}
          size="sm"
          onClick={() => router.push(`/previsions?months=${m}`)}
        >
          {m} mois
        </Button>
      ))}
    </div>
  );
}
