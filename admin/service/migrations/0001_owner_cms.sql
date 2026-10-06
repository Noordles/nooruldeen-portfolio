
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY CHECK (id IN ('draft', 'published')),
  body TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY, filename TEXT NOT NULL, kind TEXT NOT NULL,
  metadata TEXT NOT NULL, public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS publish_lock (id INTEGER PRIMARY KEY CHECK(id=1), token TEXT NOT NULL, until_ms INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT, owner TEXT NOT NULL, action TEXT NOT NULL,
  details TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS releases (
  sha TEXT PRIMARY KEY, revision INTEGER NOT NULL, commit_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
