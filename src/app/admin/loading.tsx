export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-16">
        <div className="w-40 h-2 bg-zinc-900 rounded-full mb-6" />
        <div className="w-80 h-16 bg-zinc-900 rounded-2xl mb-4" />
        <div className="w-56 h-4 bg-zinc-900 rounded-lg" />
      </div>

      {/* Quick Links Skeleton */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-zinc-900/50 rounded-xl border border-white/5" />
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[400px] bg-zinc-900/50 rounded-[32px] border border-white/5" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="h-[500px] bg-zinc-900/50 rounded-[40px] border border-white/5" />
    </div>
  );
}
