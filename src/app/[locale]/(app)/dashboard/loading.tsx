import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col pb-2 bg-[#F8F7FC] w-full">
      {/* Header skeleton */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </header>

      {/* Account pills */}
      <div className="flex gap-2 px-4 mb-3">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-full" />
      </div>

      {/* Balance card */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-[#EEEEEE] p-5" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-10 w-40 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#EEEEEE] p-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
            <Skeleton className="h-8 w-8 rounded-xl mb-3" />
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>

      {/* Health Score */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-[#EEEEEE] p-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Chart */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-[#EEEEEE] p-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
        <Skeleton className="h-4 w-40 mb-3" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
