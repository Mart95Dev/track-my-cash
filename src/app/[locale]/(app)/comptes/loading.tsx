import { Skeleton } from "@/components/ui/skeleton";

export default function ComptesLoading() {
  return (
    <div className="flex flex-col pb-2 bg-[#F8F7FC] w-full px-4 pt-6 space-y-4">
      {/* Titre */}
      <Skeleton className="h-7 w-32" />

      {/* 3 cartes de compte */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#EEEEEE] p-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
