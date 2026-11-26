import {
  accountsAvailable, clearedUserCookie, createUser, currentUser, deleteUser, DuplicateEmail, dummyVerify,
  findUserByEmail, hashPassword, normaliseEmail, PASSWORD_MAX, PASSWORD_MIN, userSessionCookie, validEmail, verifyPassword,
} from '../lib/accounts.js';
import { StorageUnavailable } from '../lib/db.js';

// GET    /api/account                          -> { user, available }
// POST   /api/account { action: 'signup', email, password }
// POST   /api/account { action: 'login',  email, password }
// POST   /api/account { action: 'logout' }
// POST   /api/account { action: 'delete', password }   deletes the account and all its notes
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const user = await currentUser(req);
      return res.status(200).json({ user: user ? { email: user.email } : null, available: accountsAvailable() });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
    if (!String(req.headers['content-type'] || '').includes('application/json')) {
      return res.status(415).json({ error: 'Send the request as JSON.' });
    }
    const body = req.body || {};
    const action = body.action;

    if (action === 'logout') {
      res.setHeader('Set-Cookie', clearedUserCookie());
      return res.status(200).json({ user: null });
    }

    if (!accountsAvailable()) throw new StorageUnavailable();
    const password = typeof body.password === 'string' ? body.password : '';

    if (action === 'signup') {
      const email = normaliseEmail(body.email);
      if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
      if (password.length < PASSWORD_MIN) return res.status(400).json({ error: `Use a password of at least ${PASSWORD_MIN} characters.` });
      if (password.length > PASSWORD_MAX) return res.status(400).json({ error: 'That password is too long.' });
      try {
        const user = await createUser(email, await hashPassword(password));
        res.setHeader('Set-Cookie', userSessionCookie(user.id));
        return res.status(201).json({ user: { email: user.email } });
      } catch (err) {
        if (err instanceof DuplicateEmail) {
          return res.status(409).json({ error: 'An account with this email already exists. Sign in instead.' });
        }
        throw err;
      }
    }

    if (action === 'login') {
      const email = normaliseEmail(body.email);
      const user = email ? await findUserByEmail(email) : null;
      const ok = user && password.length <= PASSWORD_MAX
        ? await verifyPassword(password, user.passwordHash)
        : await dummyVerify(password.slice(0, PASSWORD_MAX));
      if (!ok) {
        await new Promise((r) => setTimeout(r, 400));
        return res.status(401).json({ error: 'That email and password don’t match an account.' });
      }
      res.setHeader('Set-Cookie', userSessionCookie(user.id));
      return res.status(200).json({ user: { email: user.email } });
    }

    if (action === 'delete') {
      const user = await currentUser(req);
      if (!user) return res.status(401).json({ error: 'Sign in first.' });
      if (!(await verifyPassword(password, user.passwordHash))) {
        await new Promise((r) => setTimeout(r, 400));
        return res.status(401).json({ error: 'That password is not correct.' });
      }
      await deleteUser(user.id);
      res.setHeader('Set-Cookie', clearedUserCookie());
      return res.status(200).json({ user: null, deleted: true });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    if (err instanceof StorageUnavailable) {
      return res.status(503).json({ error: 'Accounts are turned off because no database is connected.' });
    }
    console.error('account API error:', err);
    return res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
  }
}
