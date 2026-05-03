function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-overlay rounded-sm ${className}`}
    />
  );
}

export default function RepoLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar skeleton */}
      <header className="bg-surface-raised border-b-2 border-accent-gold-dim px-4 py-2 flex items-center gap-4">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="flex-1 max-w-md h-8" />
        <Skeleton className="w-40 h-5 hidden md:block" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Left sidebar skeleton */}
        <aside className="w-full lg:w-56 shrink-0 space-y-4">
          <div className="ornate-border rounded-sm bg-surface-raised p-3 space-y-3">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
          </div>
          <div className="ornate-border rounded-sm bg-surface-raised p-3 space-y-3">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
          </div>
        </aside>

        {/* Center content skeleton */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="ornate-border rounded-sm bg-surface-raised p-4 space-y-4">
            <Skeleton className="w-64 h-6" />
            <div className="flex gap-2">
              <Skeleton className="w-16 h-8" />
              <Skeleton className="w-16 h-8" />
              <Skeleton className="w-24 h-8" />
              <Skeleton className="w-16 h-8" />
            </div>
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-8" />
              ))}
            </div>
          </div>
          <div className="ornate-border rounded-sm bg-panel p-4 space-y-3">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-full h-32" />
          </div>
        </main>

        {/* Right sidebar skeleton */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="ornate-border rounded-sm bg-surface-raised p-3 space-y-3">
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-full h-12" />
            <div className="flex gap-1">
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
            </div>
          </div>
          <div className="ornate-border rounded-sm bg-surface-raised p-3 space-y-3">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-full h-20" />
          </div>
          <div className="ornate-border rounded-sm bg-surface-raised p-3 space-y-3">
            <Skeleton className="w-32 h-3" />
            <Skeleton className="w-full h-32" />
          </div>
        </aside>
      </div>
    </div>
  );
}
