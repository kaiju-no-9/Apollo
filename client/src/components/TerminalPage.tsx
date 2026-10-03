import { useMemo, useState } from "react";
import { useSessionHistory, useTerminalScroll } from "@/hooks/useSessionHistory";
import { useTerminalSocket } from "@/hooks/useTerminalSocket";

interface TerminalPageProps {
  sessionId: string;
}

function StatusIndicator({
  status,
}: {
  status: "connecting" | "connected" | "disconnected" | "closed";
}) {
  const label = {
    connecting: "Connecting",
    connected: "Connected",
    disconnected: "Reconnecting",
    closed: "Session closed",
  }[status];

  const color = {
    connecting: "bg-amber-400",
    connected: "bg-emerald-400",
    disconnected: "bg-amber-400",
    closed: "bg-red-400",
  }[status];

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

export function TerminalPage({ sessionId }: TerminalPageProps) {
  const { history, isLoading } = useSessionHistory(sessionId);
  const { status, output, sendCommand } = useTerminalSocket(sessionId);
  const [command, setCommand] = useState("");

  const restoredHistory = useMemo(() => {
    if (history.length === 0) return "";

    return history
      .map((message) => {
        if (message.type === "input") {
          return `$ ${message.content}`;
        }

        return message.content;
      })
      .join("\n");
  }, [history]);

  const displayOutput = restoredHistory
    ? `${restoredHistory}${output ? `\n${output}` : ""}`
    : output;

  const { containerRef } = useTerminalScroll<HTMLDivElement>(displayOutput);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (status !== "connected") {
      return;
    }

    sendCommand(command);
    setCommand("");
  }

  const isInputDisabled = status !== "connected";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/70 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Remote Claude Code
            </h1>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              session/{sessionId}
            </p>
          </div>
          <StatusIndicator status={status} />
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-black/60">
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 py-4 font-mono text-sm leading-6 text-zinc-100 whitespace-pre-wrap break-words"
        >
          {isLoading && !displayOutput ? (
            <span className="text-zinc-500">Loading session history...</span>
          ) : (
            displayOutput || (
              <span className="text-zinc-500">
                Connected. Type a command to begin.
              </span>
            )
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-zinc-800 bg-zinc-950/80 p-4"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-400">&gt;</span>
            <input
              type="text"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              disabled={isInputDisabled}
              placeholder={
                isInputDisabled
                  ? "Waiting for connection..."
                  : "Enter command"
              }
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={isInputDisabled || !command.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
