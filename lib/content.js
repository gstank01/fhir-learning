import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { isTopicId } from './structure.js';

// The original study notes ship with the site as Markdown files in content/.
const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function readOriginalNotes(id) {
  if (!isTopicId(id)) throw new Error(`Unknown topic: ${id}`);
  try {
    return await readFile(path.join(CONTENT_DIR, `${id}.md`), 'utf8');
  } catch {
    return '';
  }
}
