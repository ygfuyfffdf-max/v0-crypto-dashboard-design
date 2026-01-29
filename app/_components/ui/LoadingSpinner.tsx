export function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="h-12 w-12 animate-pulse rounded-full border-2 border-purple-500/20" />
        {/* Spinning ring */}
        <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-purple-500" />
        {/* Inner glow */}
        <div className="absolute inset-2 h-8 w-8 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-violet-500/10" />
      </div>
    </div>
  )
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl bg-white/5"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="mb-4 h-4 w-24 rounded bg-white/10" />
      <div className="mb-2 h-8 w-32 rounded bg-white/10" />
      <div className="h-3 w-20 rounded bg-white/5" />
    </div>
  )
}
