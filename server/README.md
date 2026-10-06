# Server

Express and WebSocket backend for the remote terminal application. Sessions, projects, and ordered terminal messages are persisted with Drizzle ORM and SQLite.

Run `bun run dev` from this directory to start the API. The default database is created at `server/data/remote-control.sqlite`; set `DB_FILE_NAME` to use another location.

The API provides session creation, message history, session closure, and live terminal input/output over `/ws?sessionId=<id>`. A session is closed automatically if its terminal exits or if the server restarts while it was active.
