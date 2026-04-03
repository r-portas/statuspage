function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="h-3.5 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-5 w-16 shrink-0 rounded-full bg-muted" />
      </div>
      <div className="h-3 w-full rounded bg-muted" />
      <div className="flex gap-4">
        <div className="h-3 w-12 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
      <div className="h-3 w-1/3 rounded bg-muted" />
    </div>
  );
}

function SkeletonGroup({ cards }: { cards: number }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3.5 w-28 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 animate-pulse p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-7 w-20 rounded bg-muted" />
        <div className="h-3 w-32 rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-8">
        <SkeletonGroup cards={3} />
        <SkeletonGroup cards={2} />
      </div>
    </main>
  );
}
