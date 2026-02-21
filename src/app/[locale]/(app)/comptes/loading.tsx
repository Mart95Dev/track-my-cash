import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ComptesLoading() {
  return (
    <div className="space-y-6">
      {/* Titre */}
      <Skeleton className="h-8 w-32" />

      {/* Formulaire création */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>

      {/* Titre section comptes */}
      <Skeleton className="h-6 w-40" />

      {/* 3 cartes de compte */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-24 shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
