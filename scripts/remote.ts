import { getLanIp } from "./utils/lanIp";

const BACKEND_URL = "http://localhost:3000";
const SETUP_ENDPOINT = `${BACKEND_URL}/api/setup`;

interface SetupResponse {
  sessionId: string;
  url: string;
}

function printBackendError(): void {
  console.error(`
----------------------------------------------------------

❌ Backend is not running

Start the development environment first:

  bun setup

Then run:

  bun remote

----------------------------------------------------------
`);
}

function printSessionStarted(sessionId: string, lanIp: string): void {
  console.log(`
----------------------------------------------------------

🚀 Remote Session Started

Session ID
${sessionId}

Open this URL on another browser or phone

http://${lanIp}:5173/session/${sessionId}

Waiting for remote connection...

----------------------------------------------------------
`);
}

function printLanUnavailable(): void {
  console.error(`
----------------------------------------------------------

❌ LAN IP unavailable

Could not detect a local network address.
Connect to Wi-Fi or Ethernet, then try again.

----------------------------------------------------------
`);
}

async function createRemoteSession(): Promise<void> {
  let response: Response;

  try {
    response = await fetch(SETUP_ENDPOINT, { method: "POST" });
  } catch {
    printBackendError();
    process.exit(1);
  }

  if (response.status === 501) {
    console.error(`
----------------------------------------------------------

⚠️  POST /api/setup is not implemented yet

Implement session creation in the backend to continue.

----------------------------------------------------------
`);
    process.exit(1);
  }

  if (!response.ok) {
    console.error(`Failed to create session (HTTP ${response.status}).`);
    process.exit(1);
  }

  const data = (await response.json()) as SetupResponse;
  const lanIp = getLanIp();

  if (!lanIp) {
    printLanUnavailable();
    process.exit(1);
  }

  printSessionStarted(data.sessionId, lanIp);

  await new Promise(() => {
    // Keep the CLI open while waiting for a remote connection.
  });
}

createRemoteSession().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
