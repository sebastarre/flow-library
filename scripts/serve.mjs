// Local preview: serves the site and rebuilds flows.json on every request.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadFlows } from './flows.mjs';

const PORT = Number(process.env.PORT) || 4173;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = (status, type, body) => {
    res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(body);
  };

  if (url.pathname === '/flows.json') {
    const { data, errors } = await loadFlows();
    return errors.length ? send(500, TYPES['.json'], JSON.stringify({ errors })) : send(200, TYPES['.json'], JSON.stringify(data));
  }

  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(ROOT, rel);
  const allowed = file === path.join(ROOT, 'index.html') || file.startsWith(path.join(ROOT, 'assets') + path.sep);
  if (!allowed) return send(404, 'text/plain', 'No encontrado');
  try {
    send(200, TYPES[path.extname(file)] || 'application/octet-stream', await readFile(file));
  } catch {
    send(404, 'text/plain', 'No encontrado');
  }
}).listen(PORT, () => console.log(`Librería en http://localhost:${PORT}`));
