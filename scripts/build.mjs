// Builds the static site into _site/ (used by the GitHub Pages workflow).
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadFlows } from './flows.mjs';

const OUT = path.join(ROOT, '_site');
const { data, errors } = await loadFlows();

if (errors.length) {
  console.error('Hay flows con problemas. Corregilos y volvé a subirlos:\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(path.join(ROOT, 'index.html'), path.join(OUT, 'index.html'));
await cp(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });
await writeFile(path.join(OUT, 'flows.json'), JSON.stringify(data));
await writeFile(path.join(OUT, '.nojekyll'), '');

console.log(`Listo: ${data.flows.length} flows en _site/`);
