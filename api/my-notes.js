import { currentUser, getUserNotes, saveUserNote } from '../lib/accounts.js';
import { StorageUnavailable } from '../lib/db.js';
import { isTopicId } from '../lib/structure.js';

const MAX_NOTES_LENGTH = 50_000;

// A signed-in visitor's private notes.
// GET /api/my-notes                     -> { notes: { [pageId]: { markdown, updatedAt } } }
// PUT /api/my-notes?id=<page>  { markdown } (empty text deletes the note)
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ error: 'Sign in to keep your own notes.' });

    if (req.method === 'GET') {
      return res.status(200).json({ notes: await getUserNotes(user.id) });
    }

    if (req.method === 'PUT') {
      const id = req.query && req.query.id;
      if (!isTopicId(id)) return res.status(404).json({ error: 'Unknown page.' });
      if (!String(req.headers['content-type'] || '').includes('application/json')) {
        return res.status(415).json({ error: 'Send the notes as JSON.' });
      }
      const markdown = req.body && req.body.markdown;
      if (typeof markdown !== 'string') return res.status(400).json({ error: 'Notes are missing.' });
      if (markdown.length > MAX_NOTES_LENGTH) return res.status(413).json({ error: 'These notes are too long to save (50,000 characters at most).' });
      const saved = await saveUserNote(user.id, id, markdown);
      return res.status(200).json({ id, ...saved });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    if (err instanceof StorageUnavailable) {
      return res.status(503).json({ error: 'Notes can’t be saved because no database is connected.' });
    }
    console.error('my-notes API error:', err);
    return res.status(500).json({ error: 'Your notes couldn’t be saved. Please try again.' });
  }
}
