import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { readCookie } from './auth.js';
import { db, storageMode, StorageUnavailable } from './db.js';

// Visitor accounts (email + password) and each visitor's private notes.
// Passwords are hashed with scrypt; a signed HttpOnly cookie keeps the
// visitor signed in for 30 days.

const scrypt = promisify(crypto.scrypt);
const COOKIE = 'fhirprep_user';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 200;

export class DuplicateEmail extends Error {}

// ---------- In-memory store for local development ----------
const memUsers = new Map(); // id -> { id, email, passwordHash }
const memNotes = new Map(); // `${userId}\u0000${pageId}` -> { markdown, updatedAt }

export function accountsAvailable() {
  return storageMode() !== 'read-only';
}

function requireStorage() {
  if (!accountsAvailable()) throw new StorageUnavailable();
}

// ---------- Passwords ----------
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  const [alg, N, r, p, salt, key] = String(stored).split('$');
  if (alg !== 'scrypt') return false;
  const expected = Buffer.from(key, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length, { N: Number(N), r: Number(r), p: Number(p) });
  return crypto.timingSafeEqual(actual, expected);
}

// A real hash to compare against when the email is unknown, so a failed
// sign-in takes the same time whether or not the account exists.
let dummyHash = null;
export async function dummyVerify(password) {
  if (!dummyHash) dummyHash = await hashPassword('not-a-real-password');
  await verifyPassword(password, dummyHash);
  return false;
}

export function normaliseEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- Sessions ----------
function sessionKey() {
  const base = process.env.SESSION_SECRET
    || process.env.DATABASE_URL
    || (process.env.VERCEL ? null : 'local-development-only');
  if (!base) throw new StorageUnavailable();
  return crypto.createHash('sha256').update(`fhirprep-user-session:${base}`).digest();
}

const sign = (value) => crypto.createHmac('sha256', sessionKey()).update(value).digest('base64url');

function cookieAttributes(maxAge) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function userSessionCookie(userId) {
  const value = `${userId}.${Date.now() + MAX_AGE_SECONDS * 1000}`;
  return `${COOKIE}=${value}.${sign(value)}; ${cookieAttributes(MAX_AGE_SECONDS)}`;
}

export function clearedUserCookie() {
  return `${COOKIE}=; ${cookieAttributes(0)}`;
}

function sessionUserId(req) {
  const raw = readCookie(req, COOKIE);
  if (!raw) return null;
  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  const [id, expires, mac] = parts;
  if (Number(expires) < Date.now()) return null;
  let expected;
  try { expected = sign(`${id}.${expires}`); } catch { return null; }
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return id;
}

/** The signed-in visitor ({ id, email }) or null. */
export async function currentUser(req) {
  const id = sessionUserId(req);
  if (!id || !accountsAvailable()) return null;
  return findUserById(id);
}

// ---------- Users ----------
export async function createUser(email, passwordHash) {
  requireStorage();
  if (storageMode() === 'memory') {
    if ([...memUsers.values()].some((u) => u.email === email)) throw new DuplicateEmail();
    const user = { id: crypto.randomUUID(), email, passwordHash };
    memUsers.set(user.id, user);
    return { id: user.id, email };
  }
  const sql = await db();
  const rows = await sql`
    INSERT INTO app_users (email, password_hash) VALUES (${email}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email`;
  if (!rows.length) throw new DuplicateEmail();
  return { id: rows[0].id, email: rows[0].email };
}

export async function findUserByEmail(email) {
  requireStorage();
  if (storageMode() === 'memory') return [...memUsers.values()].find((u) => u.email === email) || null;
  const sql = await db();
  const rows = await sql`SELECT id, email, password_hash FROM app_users WHERE email = ${email}`;
  return rows.length ? { id: rows[0].id, email: rows[0].email, passwordHash: rows[0].password_hash } : null;
}

export async function findUserById(id) {
  requireStorage();
  if (storageMode() === 'memory') {
    const u = memUsers.get(id);
    return u ? { id: u.id, email: u.email, passwordHash: u.passwordHash } : null;
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = await db();
  const rows = await sql`SELECT id, email, password_hash FROM app_users WHERE id = ${id}`;
  return rows.length ? { id: rows[0].id, email: rows[0].email, passwordHash: rows[0].password_hash } : null;
}

export async function deleteUser(id) {
  requireStorage();
  if (storageMode() === 'memory') {
    memUsers.delete(id);
    for (const key of [...memNotes.keys()]) if (key.startsWith(`${id}\u0000`)) memNotes.delete(key);
    return;
  }
  const sql = await db();
  await sql`DELETE FROM app_users WHERE id = ${id}`; // notes are removed by ON DELETE CASCADE
}

// ---------- Visitor notes ----------
export async function getUserNotes(userId) {
  requireStorage();
  if (storageMode() === 'memory') {
    const out = {};
    for (const [key, v] of memNotes) {
      const [uid, page] = key.split('\u0000');
      if (uid === userId) out[page] = v;
    }
    return out;
  }
  const sql = await db();
  const rows = await sql`SELECT page_id, notes, updated_at FROM user_notes WHERE user_id = ${userId}`;
  return Object.fromEntries(rows.map((r) => [r.page_id, { markdown: r.notes, updatedAt: new Date(r.updated_at).toISOString() }]));
}

export async function saveUserNote(userId, pageId, markdown) {
  requireStorage();
  if (!markdown.trim()) {
    await deleteUserNote(userId, pageId);
    return { markdown: '', updatedAt: null };
  }
  if (storageMode() === 'memory') {
    const v = { markdown, updatedAt: new Date().toISOString() };
    memNotes.set(`${userId}\u0000${pageId}`, v);
    return v;
  }
  const sql = await db();
  const rows = await sql`
    INSERT INTO user_notes (user_id, page_id, notes, updated_at)
    VALUES (${userId}, ${pageId}, ${markdown}, now())
    ON CONFLICT (user_id, page_id) DO UPDATE SET notes = EXCLUDED.notes, updated_at = now()
    RETURNING updated_at`;
  return { markdown, updatedAt: new Date(rows[0].updated_at).toISOString() };
}

export async function deleteUserNote(userId, pageId) {
  requireStorage();
  if (storageMode() === 'memory') return void memNotes.delete(`${userId}\u0000${pageId}`);
  const sql = await db();
  await sql`DELETE FROM user_notes WHERE user_id = ${userId} AND page_id = ${pageId}`;
}
