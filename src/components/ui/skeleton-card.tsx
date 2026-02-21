import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonCardProps {
  lines?: number;
  hasHeader?: boolean;
}

export function SkeletonCard({ lines = 3, hasHeader = true }: SkeletonCardProps) {
  return (
    <Card>
      {hasHeader && (
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
