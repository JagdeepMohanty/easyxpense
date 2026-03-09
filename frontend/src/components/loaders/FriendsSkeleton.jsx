export default function FriendsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-slate-700 rounded flex-1"></div>
            <div className="h-8 bg-slate-700 rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
