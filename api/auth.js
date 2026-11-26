import { adminConfigured, checkPassword, clearedCookie, isAdmin, sessionCookie } from '../lib/auth.js';

// GET    /api/auth  -> { admin, configured }
// POST   /api/auth  { password } -> signs in
// DELETE /api/auth  -> signs out
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ admin: isAdmin(req), configured: adminConfigured() });
  }

  if (req.method === 'POST') {
    if (!adminConfigured()) {
      return res.status(503).json({ error: 'Admin sign-in is not set up. Add ADMIN_PASSWORD in Vercel and redeploy.' });
    }
    const password = req.body && req.body.password;
    if (!checkPassword(password)) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      return res.status(401).json({ error: 'That password is not correct.' });
    }
    res.setHeader('Set-Cookie', sessionCookie());
    return res.status(200).json({ admin: true, configured: true });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearedCookie());
    return res.status(200).json({ admin: false, configured: adminConfigured() });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
