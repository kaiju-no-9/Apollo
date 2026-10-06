import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Subprocess } from "bun";
import { getLanIp } from "./utils/lanIp";

const ROOT_DIR = join(import.meta.dir, "..");
const CLIENT_DIR = join(ROOT_DIR, "client");
const SERVER_DIR = join(ROOT_DIR, "server");
const BACKEND_PORT = Number(process.env.PORT) || 3000;

const processes: Subprocess[] = [];

async function ensureDependencies(directory: string, label: string): Promise<void> {
  const nodeModulesPath = join(directory, "node_modules");

  if (!existsSync(nodeModulesPath)) {
    console.log(`Installing ${label} dependencies...`);
    const install = Bun.spawn(["bun", "install"], {
      cwd: directory,
      stdout: "inherit",
      stderr: "inherit",
    });
    const exitCode = await install.exited;

    if (exitCode !== 0) {
      throw new Error(`Failed to install ${label} dependencies.`);
    }
  }
}

function startProcess(directory: string, label: string): Subprocess {
  const proc = Bun.spawn(["bun", "run", "dev"], {
    cwd: directory,
    stdout: "inherit",
    stderr: "inherit",
  });

  processes.push(proc);
  console.log(`Starting ${label}...`);

  return proc;
}

async function waitForBackend(): Promise<void> {
  const deadline = Date.now() + 30_000;
  const healthUrl = `http://127.0.0.1:${BACKEND_PORT}/health`;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(healthUrl, {
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) return;
    } catch {
      await Bun.sleep(300);
    }
  }

  throw new Error(
    `Backend did not become ready at ${healthUrl}. Check the backend output above.`,
  );
}

function shutdown(): void {
  for (const proc of processes) {
    proc.kill();
  }

  process.exit(0);
}

function printBanner(lanIp: string | null): void {
  const lanLine = lanIp
    ? `http://${lanIp}:5173`
    : "(LAN IP unavailable — check your network connection)";

  console.log(`
----------------------------------------------------------

🚀 Remote Control Server Started

Backend
http://localhost:3000

Frontend
http://localhost:5173

LAN
${lanLine}

Run
bun remote
to create a remote session.

----------------------------------------------------------
`);
}

async function main(): Promise<void> {
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await ensureDependencies(CLIENT_DIR, "frontend");
  await ensureDependencies(SERVER_DIR, "backend");

  startProcess(SERVER_DIR, "backend");
  startProcess(CLIENT_DIR, "frontend");

  await waitForBackend();

  printBanner(getLanIp());

  await Promise.all(processes.map((proc) => proc.exited));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  shutdown();
});
