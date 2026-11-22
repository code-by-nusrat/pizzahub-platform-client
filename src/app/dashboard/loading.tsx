// Shown instantly while any dashboard page is loading
export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-[#1F2A1F]/10" />
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[#1F2A1F]/10" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#1F2A1F]/10" />
        ))}
      </div>

      <div className="h-72 animate-pulse rounded-2xl bg-[#1F2A1F]/10" />
    </div>
  )
}