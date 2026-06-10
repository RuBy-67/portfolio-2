import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export type GameId = "tetris" | "flappy";

export interface ScoreRow {
  name: string;
  score: number;
  date: string;
}

const MAX_STORED = 100;

let db: Database.Database | null = null;

function getDbPath(): string {
  if (process.env.SCORES_DB_PATH) {
    return process.env.SCORES_DB_PATH;
  }
  return path.join(process.cwd(), "data", "scores.db");
}

function getDb(): Database.Database {
  if (db) return db;

  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game TEXT NOT NULL CHECK (game IN ('tetris', 'flappy')),
      name TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 0),
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_scores_game_score ON scores (game, score DESC);
  `);

  return db;
}

export function isValidGame(game: string): game is GameId {
  return game === "tetris" || game === "flappy";
}

export function sanitizeName(raw: string): string {
  const cleaned = raw.trim().replace(/[^A-Za-z0-9 _-]/g, "").slice(0, 12);
  return cleaned || "ANON";
}

export function sanitizeScore(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n < 0 || n > 9_999_999) return null;
  return Math.floor(n);
}

export function getTopScores(game: GameId, limit = 10): ScoreRow[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT name, score, created_at as date
       FROM scores
       WHERE game = ?
       ORDER BY score DESC, id ASC
       LIMIT ?`
    )
    .all(game, limit) as ScoreRow[];

  return rows;
}

export function addScore(game: GameId, name: string, score: number): ScoreRow[] {
  const database = getDb();
  const createdAt = new Date().toISOString();

  const insert = database.prepare(
    `INSERT INTO scores (game, name, score, created_at) VALUES (?, ?, ?, ?)`
  );

  const trim = database.prepare(
    `DELETE FROM scores
     WHERE game = ?
     AND id NOT IN (
       SELECT id FROM scores
       WHERE game = ?
       ORDER BY score DESC, id ASC
       LIMIT ?
     )`
  );

  const tx = database.transaction(() => {
    insert.run(game, name, score, createdAt);
    trim.run(game, game, MAX_STORED);
  });

  tx();

  return getTopScores(game, 10);
}
