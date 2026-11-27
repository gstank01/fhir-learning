import { isAdmin } from '../lib/auth.js';
import { readOriginalNotes } from '../lib/content.js';
import { deleteNotes, getEditedNotes, saveNotes, storageMode, StorageUnavailable } from '../lib/db.js';
import { RESOURCE_CATEGORIES, SPEC_BASE } from '../lib/resources.js';
import { RESOURCE_TIPS } from '../lib/resourcetips.js';
import { QUESTIONS } from '../lib/questions.js';
import { SCENARIO_CARDS } from '../lib/studycards.js';
import { allTopicIds, DOMAINS, EXAM, isTopicId } from '../lib/structure.js';

const MAX_NOTES_LENGTH = 200_000;

// GET    /api/topics           -> exam structure, FHIR resources, and notes for every topic
// PUT    /api/topics?id=<id>   { markdown } -> save edited notes (admin)
// DELETE /api/topics?id=<id>   -> restore the original notes (admin)
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') return await getAll(req, res);

    if (req.method === 'PUT' || req.method === 'DELETE') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Sign in as admin to change notes.' });

      const id = req.query && req.query.id;
      if (!isTopicId(id)) return res.status(404).json({ error: 'Unknown topic.' });

      if (req.method === 'DELETE') {
        await deleteNotes(id);
        return res.status(200).json({ id, markdown: await readOriginalNotes(id), edited: false, updatedAt: null });
      }

      if (!String(req.headers['content-type'] || '').includes('application/json')) {
        return res.status(415).json({ error: 'Send the notes as JSON.' });
      }
      const markdown = req.body && req.body.markdown;
      if (typeof markdown !== 'string') return res.status(400).json({ error: 'Notes are missing.' });
      if (markdown.length > MAX_NOTES_LENGTH) return res.status(413).json({ error: 'Notes are too long.' });

      const saved = await saveNotes(id, markdown);
      return res.status(200).json({ id, markdown: saved.markdown, edited: true, updatedAt: saved.updatedAt });
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    if (err instanceof StorageUnavailable) return res.status(503).json({ error: err.message });
    console.error('topics API error:', err);
    return res.status(500).json({ error: 'Something went wrong on the server. Check the Vercel function logs.' });
  }
}

async function getAll(req, res) {
  const ids = allTopicIds();
  let edited = {};
  let storageError = null;
  try {
    edited = await getEditedNotes();
  } catch (err) {
    console.error('Could not load edited notes:', err);
    storageError = 'Could not reach the database, so the original notes are shown.';
  }

  const notes = {};
  await Promise.all(
    ids.map(async (id) => {
      const e = edited[id];
      notes[id] = e
        ? { markdown: e.markdown, edited: true, updatedAt: e.updatedAt }
        : { markdown: await readOriginalNotes(id), edited: false, updatedAt: null };
    }),
  );

  return res.status(200).json({
    exam: EXAM,
    domains: DOMAINS,
    resources: { specBase: SPEC_BASE, categories: RESOURCE_CATEGORIES },
    cards: SCENARIO_CARDS,
    tips: RESOURCE_TIPS,
    questions: QUESTIONS,
    notes,
    storage: storageMode(),
    storageError,
    admin: isAdmin(req),
  });
}
