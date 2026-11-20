-- Duallocke: initial D1 (SQLite) schema.
-- Apply with: npx wrangler d1 migrations apply duallocke --remote

PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  avatar_color  TEXT NOT NULL DEFAULT '#E63946',
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Only a SHA-256 hash of the session token is stored, never the token itself.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user_idx ON sessions (user_id);

CREATE TABLE login_attempts (
  key        TEXT PRIMARY KEY,
  count      INTEGER NOT NULL,
  window_end INTEGER NOT NULL
);

CREATE TABLE runs (
  id               TEXT PRIMARY KEY,
  player1_id       TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  player2_id       TEXT REFERENCES users (id) ON DELETE SET NULL,
  game             TEXT NOT NULL,
  invite_code      TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  lives_per_player INTEGER NOT NULL DEFAULT 3 CHECK (lives_per_player BETWEEN 1 AND 99),
  player1_lives    INTEGER NOT NULL DEFAULT 3,
  player2_lives    INTEGER NOT NULL DEFAULT 3,
  -- Incremented on every change so clients can cheaply detect updates.
  version          INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX runs_player1_idx ON runs (player1_id);
CREATE INDEX runs_player2_idx ON runs (player2_id);

CREATE TABLE gym_progress (
  run_id      TEXT NOT NULL REFERENCES runs (id) ON DELETE CASCADE,
  player_id   TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  gym_number  INTEGER NOT NULL CHECK (gym_number BETWEEN 1 AND 16),
  defeated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (run_id, player_id, gym_number)
);

CREATE TABLE pokemon_links (
  id               TEXT PRIMARY KEY,
  run_id           TEXT NOT NULL REFERENCES runs (id) ON DELETE CASCADE,
  route_name       TEXT NOT NULL,
  player1_pokemon  TEXT,
  player1_nickname TEXT,
  player1_in_team  INTEGER NOT NULL DEFAULT 0,
  player2_pokemon  TEXT,
  player2_nickname TEXT,
  player2_in_team  INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'box')),
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (run_id, route_name)
);
CREATE INDEX pokemon_links_run_idx ON pokemon_links (run_id);
