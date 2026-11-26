import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { RESOURCE_NOTE_PREFIX } from './resources.js';
import { isTopicId } from './structure.js';

// The original study notes ship with the site as Markdown files in content/.
// Notes for a FHIR resource live in content/resources/<ResourceName>.md and
// are optional.
const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function readOriginalNotes(id) {
  if (!isTopicId(id)) throw new Error(`Unknown topic: ${id}`);
  try {
    const file = id.startsWith(RESOURCE_NOTE_PREFIX)
      ? path.join(CONTENT_DIR, 'resources', `${id.slice(RESOURCE_NOTE_PREFIX.length)}.md`)
      : path.join(CONTENT_DIR, `${id}.md`);
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
}
