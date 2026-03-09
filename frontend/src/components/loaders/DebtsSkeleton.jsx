export default function DebtsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl p-6 shadow-lg">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Debts List */}
      <div className="bg-card rounded-xl p-6 shadow-lg">
        <div className="h-6 bg-slate-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-main rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                    <div className="w-6 h-6 bg-slate-700 rounded"></div>
                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-700 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-10 bg-slate-700 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
