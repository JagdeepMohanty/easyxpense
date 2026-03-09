export default function GroupsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-slate-700 rounded w-1/2"></div>
            <div className="h-8 bg-slate-700 rounded w-8"></div>
          </div>
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 bg-slate-700 rounded w-4/6"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
