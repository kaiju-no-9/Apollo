# Remote Controlling Claude Code

Backend engineering contest starter repository.

Build the backend that powers a remote terminal — similar to Claude Code Remote. Students implement session management, WebSocket handling, and terminal forwarding during a 2.5-hour contest.

**Students modify backend code only.** The frontend, CLI scripts, and `TerminalRunner` are frozen.

## Quick start

```bash
bun install
bun setup
```

In another terminal:

```bash
bun remote
```

Open the printed LAN URL on another device (phone, tablet, or browser) on the same Wi-Fi network.

## Commands

### `bun install`

Installs dependencies for the root workspace, frontend (`client/`), backend (`server/`), and demo project (`project/`).

### `bun setup`

- Installs missing frontend and backend dependencies
- Starts the backend on port `3000`
- Starts the frontend on port `5173`
- Detects your LAN IP and prints connection URLs
- Keeps running until you stop it (`Ctrl+C`)

### `bun remote`

- Calls `POST http://localhost:3000/api/setup`
- Prints a session URL using your LAN IP (never `localhost`)
- Waits for a remote client to connect

**Do not modify** `scripts/remote.ts`.

## Architecture

```
/
├── client/          # Frontend (complete — do not edit)
├── server/          # Backend (students implement here)
├── project/         # Working directory for remote terminal commands
└── scripts/         # CLI tooling (setup + remote)
```

### Expected flow

1. Developer runs `bun setup`
2. Backend and frontend start
3. Developer runs `bun remote`
4. `POST /api/setup` creates a session
5. CLI prints a remote URL like `http://192.168.x.x:5173/session/abc123`
6. User opens the URL on another device
7. Browser connects via WebSocket
8. User types commands; output streams back live

## Student scope

### Implement

- `POST /api/setup` — create a session, return `{ sessionId, url }`
- `GET /api/sessions/:sessionId/messages` — restore message history
- `POST /api/sessions/:sessionId/close` — close a session
- WebSocket handling at `/ws?sessionId=<id>`
- Session persistence (configure SQLite + Drizzle yourself)
- Terminal command forwarding via `TerminalRunner`

### Do not modify

- `client/` — frontend is complete
- `server/src/lib/terminalRunner.ts` — terminal process manager
- `scripts/remote.ts` — remote session CLI

### Do not pre-install

SQLite, Drizzle, and database tooling are intentionally absent. Configure them during the contest.

## WebSocket protocol

**Client → Server**

```json
{ "type": "terminal_input", "content": "pwd" }
```

**Server → Client**

```json
{ "type": "terminal_output", "content": "/project" }
```

```json
{ "type": "session_closed" }
```

WebSocket URL: `ws://<host>:3000/ws?sessionId=<sessionId>`

The frontend derives `<host>` from `window.location.hostname` so LAN devices work without code changes.

## Backend structure

```
server/src/
├── index.ts                 # Express + WebSocket server bootstrap
├── routes/                  # HTTP route handlers (currently return 501)
├── services/                # Business logic (throw TODO)
├── repositories/            # Data access (throw TODO)
├── lib/terminalRunner.ts    # Shell process manager (complete)
├── types/
└── utils/
```

## Terminal runner

`TerminalRunner` spawns an interactive shell per session inside `/project`:

- **Windows:** `powershell.exe`
- **macOS/Linux:** `process.env.SHELL` (never hardcoded `bash`)

```typescript
terminalRunner.start(sessionId);
terminalRunner.send(sessionId, "ls");
terminalRunner.stop(sessionId);

terminalRunner.on("output", (sessionId, content) => { /* ... */ });
terminalRunner.on("exit", (sessionId, code) => { /* ... */ });
terminalRunner.on("error", (sessionId, error) => { /* ... */ });
```

## Development

```bash
# Typecheck backend
cd server && bun run typecheck

# Typecheck frontend
cd client && bun run typecheck

# Lint
bun run lint

# Format
bun run format
```

## Ports

| Service  | Port |
|----------|------|
| Backend  | 3000 |
| Frontend | 5173 |

Both bind to `0.0.0.0` for LAN access.

## License

Internal contest use.
