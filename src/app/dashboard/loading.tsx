export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-16">
        <div className="w-32 h-2 bg-zinc-900 rounded-full mb-6" />
        <div className="w-64 h-12 bg-zinc-900 rounded-2xl mb-4" />
        <div className="w-48 h-4 bg-zinc-900 rounded-lg" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-zinc-900/50 rounded-[40px] border border-white/5" />
        ))}
      </div>

      {/* Main Cards Skeleton */}
      <div className="space-y-12">
        <div className="h-64 bg-zinc-900/50 rounded-[40px] border border-white/5" />
        <div className="h-96 bg-zinc-900/50 rounded-[40px] border border-white/5" />
      </div>
    </div>
  );
}
