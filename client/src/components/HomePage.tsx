export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 shadow-2xl shadow-black/40">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Remote Claude Code
        </h1>

        <div className="mt-8 space-y-4 font-mono text-sm leading-relaxed text-zinc-300">
          <p>No active session.</p>
          <p>
            Run{" "}
            <code className="rounded-md bg-zinc-800 px-2 py-1 text-emerald-400">
              bun remote
            </code>{" "}
            from your terminal to create a new remote session.
          </p>
        </div>
      </div>
    </main>
  );
}
