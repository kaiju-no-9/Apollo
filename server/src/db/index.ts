import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { REPO_ROOT } from "../utils/paths";
import * as schema from "./schema";

const configuredPath = process.env.DB_FILE_NAME ?? "server/data/remote-control.sqlite";
const databasePath = resolve(REPO_ROOT, configuredPath);

mkdirSync(dirname(databasePath), { recursive: true });

export const sqlite = new Database(databasePath, { create: true });
sqlite.exec("PRAGMA foreign_keys = ON;");
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    root_path TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CLOSED')),
    created_at INTEGER NOT NULL,
    closed_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS sessions_project_id_idx ON sessions(project_id);
  CREATE TABLE IF NOT EXISTS messages (
    sequence INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('input', 'output')),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS messages_session_order_idx ON messages(session_id, sequence);
`);

export const db = drizzle({ client: sqlite, schema });
