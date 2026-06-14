-- CatCoder Turso (libSQL/SQLite) schema
--
-- Apply with the Turso CLI:
--   turso db shell <your-db> < worker/schema.sql
--
-- Unlike Supabase there is no built-in auth or row-level security, so the
-- Worker API is the only thing allowed to touch this database (it holds the
-- token). All access-control is enforced in worker/ code.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,   -- PBKDF2: salt:hash, both base64
  username      TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profiles (
  id              TEXT PRIMARY KEY,
  username        TEXT,
  avatar_url      TEXT,
  xp              INTEGER NOT NULL DEFAULT 0,
  level           INTEGER NOT NULL DEFAULT 1,
  rank            TEXT NOT NULL DEFAULT 'bronze',
  streak_current  INTEGER NOT NULL DEFAULT 0,
  streak_best     INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT,
  last_activity_date TEXT,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_progress (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  content_type  TEXT NOT NULL,
  content_id    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'completed',
  score         INTEGER,
  duration_seconds INTEGER,
  completed_at  TEXT,
  created_at    TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_logs (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL,   -- 'security' | 'app_error'
  user_id    TEXT,
  payload    TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles (xp DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_unique
  ON user_progress (user_id, content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
