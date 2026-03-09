export default function LoadingSkeleton({ type = 'list', count = 5 }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6 shadow-lg">
            <div className="h-5 bg-slate-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-slate-700 rounded w-20"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-card rounded-xl p-6 shadow-lg">
          <div className="h-5 bg-slate-700 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}
