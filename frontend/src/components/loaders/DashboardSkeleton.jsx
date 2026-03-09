export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl p-6 shadow-lg">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-lg">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-lg">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl p-6 shadow-lg">
        <div className="h-6 bg-slate-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/4"></div>
              </div>
              <div className="h-6 bg-slate-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
