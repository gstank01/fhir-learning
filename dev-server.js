// Local preview server: serves public/ and runs the api/ functions the same
// way Vercel does. Usage:  ADMIN_PASSWORD=secret npm run dev
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const port = Number(process.env.PORT) || 3000;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      const name = url.pathname.slice(5).replace(/[^a-z-]/gi, '');
      const mod = await import(pathToFileURL(path.join(root, 'api', `${name}.js`)).href);
      req.query = Object.fromEntries(url.searchParams);
      let raw = '';
      for await (const chunk of req) raw += chunk;
      try { req.body = raw && String(req.headers['content-type']).includes('json') ? JSON.parse(raw) : raw; } catch { req.body = undefined; }
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res; };
      return await mod.default(req, res);
    }
    const file = path.normalize(path.join(publicDir, url.pathname === '/' ? 'index.html' : url.pathname));
    if (!file.startsWith(publicDir)) throw Object.assign(new Error('forbidden'), { code: 'ENOENT' });
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (err) {
    res.statusCode = err.code === 'ENOENT' || err.code === 'ERR_MODULE_NOT_FOUND' ? 404 : 500;
    if (res.statusCode === 500) console.error(err);
    res.end(res.statusCode === 404 ? 'Not found' : 'Server error');
  }
}).listen(port, () => console.log(`FHIR exam prep running at http://localhost:${port}`));
