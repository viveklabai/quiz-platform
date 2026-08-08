export default function AdminLoading() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-6 py-12">
      <div className="animate-pulse">
        <div className="h-9 w-32 rounded bg-foreground/10" />
        <div className="mt-2 h-5 w-72 max-w-full rounded bg-foreground/10" />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-foreground/10 p-6"
            >
              <div className="h-4 w-24 rounded bg-foreground/10" />
              <div className="mt-4 h-8 w-16 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
