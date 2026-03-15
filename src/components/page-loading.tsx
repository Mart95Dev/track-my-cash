import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading({ title = true }: { title?: boolean }) {
  return (
    <div className="flex flex-col pb-2 bg-[#F8F7FC] w-full px-4 pt-6 space-y-4">
      {title && <Skeleton className="h-7 w-40" />}
      <div className="bg-white rounded-2xl border border-[#EEEEEE] p-5 space-y-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="bg-white rounded-2xl border border-[#EEEEEE] p-5 space-y-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
