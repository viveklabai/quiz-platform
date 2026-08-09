export default function LeaderboardLoading() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-12">
      <div className="animate-pulse">
        <div className="h-9 w-48 rounded bg-foreground/10" />
        <div className="mt-2 h-5 w-72 max-w-full rounded bg-foreground/10" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-xl bg-foreground/10" />
          <div className="h-28 rounded-xl bg-foreground/10" />
        </div>

        <div className="mt-8 h-64 rounded-xl bg-foreground/10" />
      </div>
    </main>
  );
}
