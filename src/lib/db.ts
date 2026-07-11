import path from "node:path";
import fs from "node:fs";

let _db: any = null;

export async function getDbAsync(): Promise<any> {
  if (_db) return _db;
  const { Database } = await import("bun:sqlite");
  const dbDir = path.resolve(process.cwd(), "data");
  const dbPath = path.resolve(dbDir, "newbuild.db");
  fs.mkdirSync(dbDir, { recursive: true });
  _db = new Database(dbPath);
  _db.exec("PRAGMA journal_mode = WAL");
  _db.exec("PRAGMA foreign_keys = ON");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '',
      email TEXT UNIQUE NOT NULL, phone TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL, photo_url TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', city TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '', lat REAL NOT NULL DEFAULT 0, lng REAL NOT NULL DEFAULT 0,
      property_types TEXT NOT NULL DEFAULT '[]', price_min INTEGER NOT NULL DEFAULT 0,
      price_max INTEGER NOT NULL DEFAULT 0, unit_count INTEGER NOT NULL DEFAULT 0,
      handover_date TEXT, status TEXT NOT NULL DEFAULT 'pre-sale',
      photo_urls TEXT NOT NULL DEFAULT '[]', floor_plan_urls TEXT NOT NULL DEFAULT '[]',
      website_url TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS project_agents (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, agent_id)
    );
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
      name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return _db;
}
