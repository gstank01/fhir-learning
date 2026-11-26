import { neon } from '@neondatabase/serverless';

// Admin edits, visitor accounts and visitors' own notes are stored in
// Postgres (Neon) when DATABASE_URL is set. Without it, local development
// keeps everything in memory, and a deployment without a database is
// read-only.

const memory = new Map();
let tableReady = null;

export function storageMode() {
  if (process.env.DATABASE_URL) return 'database';
  if (process.env.VERCEL) return 'read-only';
  return 'memory';
}

async function createTables(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS exam_topic_notes (
      topic_id   TEXT PRIMARY KEY,
      notes      TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS app_users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS user_notes (
      user_id    UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      page_id    TEXT NOT NULL,
      notes      TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, page_id)
    )`;
}

export async function db() {
  const sql = neon(process.env.DATABASE_URL);
  if (!tableReady) {
    tableReady = createTables(sql).catch((err) => {
      tableReady = null;
      throw err;
    });
  }
  await tableReady;
  return sql;
}

/** Returns { [topicId]: { markdown, updatedAt } } for every edited topic. */
export async function getEditedNotes() {
  const mode = storageMode();
  if (mode === 'memory') return Object.fromEntries(memory);
  if (mode !== 'database') return {};
  const sql = await db();
  const rows = await sql`SELECT topic_id, notes, updated_at FROM exam_topic_notes`;
  return Object.fromEntries(
    rows.map((r) => [r.topic_id, { markdown: r.notes, updatedAt: new Date(r.updated_at).toISOString() }]),
  );
}

export async function saveNotes(id, markdown) {
  const mode = storageMode();
  const updatedAt = new Date().toISOString();
  if (mode === 'memory') {
    memory.set(id, { markdown, updatedAt });
    return { markdown, updatedAt };
  }
  if (mode !== 'database') throw new StorageUnavailable();
  const sql = await db();
  const rows = await sql`
    INSERT INTO exam_topic_notes (topic_id, notes, updated_at)
    VALUES (${id}, ${markdown}, now())
    ON CONFLICT (topic_id) DO UPDATE SET notes = EXCLUDED.notes, updated_at = now()
    RETURNING updated_at`;
  return { markdown, updatedAt: new Date(rows[0].updated_at).toISOString() };
}

export async function deleteNotes(id) {
  const mode = storageMode();
  if (mode === 'memory') return void memory.delete(id);
  if (mode !== 'database') throw new StorageUnavailable();
  const sql = await db();
  await sql`DELETE FROM exam_topic_notes WHERE topic_id = ${id}`;
}

export class StorageUnavailable extends Error {
  constructor() {
    super('Saving is turned off because no database is connected. Add DATABASE_URL in Vercel and redeploy.');
  }
}
