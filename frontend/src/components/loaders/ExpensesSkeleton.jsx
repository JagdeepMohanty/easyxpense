export default function ExpensesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-5 bg-slate-700 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            </div>
            <div className="h-8 bg-slate-700 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
