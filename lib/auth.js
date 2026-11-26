import crypto from 'node:crypto';

// Single-admin sign-in. The password comes from the ADMIN_PASSWORD environment
// variable; a signed, HttpOnly cookie keeps the admin signed in for 8 hours.

const COOKIE = 'fhirprep_admin';
const MAX_AGE_SECONDS = 8 * 60 * 60;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function secret() {
  if (process.env.SESSION_SECRET) return `admin:${process.env.SESSION_SECRET}`;
  // Fall back to a key derived from the password, so changing the password
  // also signs out every existing session.
  return crypto.createHash('sha256').update(`fhirprep-session:${process.env.ADMIN_PASSWORD}`).digest('hex');
}

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest();
const sign = (value) => crypto.createHmac('sha256', secret()).update(value).digest('base64url');

// Reads one cookie from the request.
export function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

export function checkPassword(password) {
  if (!adminConfigured() || typeof password !== 'string') return false;
  return crypto.timingSafeEqual(sha256(password), sha256(process.env.ADMIN_PASSWORD));
}

function cookieAttributes(maxAge) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function sessionCookie() {
  const expires = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${COOKIE}=${expires}.${sign(expires)}; ${cookieAttributes(MAX_AGE_SECONDS)}`;
}

export function clearedCookie() {
  return `${COOKIE}=; ${cookieAttributes(0)}`;
}

export function isAdmin(req) {
  if (!adminConfigured()) return false;
  const value = readCookie(req, COOKIE);
  if (!value) return false;
  const [expires, mac] = value.split('.');
  if (!expires || !mac || Number(expires) < Date.now()) return false;
  const expected = sign(expires);
  return mac.length === expected.length && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
}
