import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SLUG_RE, normalizeFlow, validateFlow } from '../assets/validate.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FLOWS_DIR = path.join(ROOT, 'flows');

// Reads every flows/*.json file and returns the site data plus any problems found.
export async function loadFlows() {
  const files = (await readdir(FLOWS_DIR)).filter((name) => name.endsWith('.json')).sort();
  const flows = [];
  const errors = [];

  for (const file of files) {
    const slug = file.slice(0, -'.json'.length);
    const where = `flows/${file}`;
    if (!SLUG_RE.test(slug)) {
      errors.push(`${where}: el nombre del archivo solo puede tener minúsculas, números y guiones.`);
      continue;
    }
    let raw;
    try {
      raw = JSON.parse(await readFile(path.join(FLOWS_DIR, file), 'utf8'));
    } catch (err) {
      errors.push(`${where}: JSON inválido (${err.message}).`);
      continue;
    }
    const problems = validateFlow(raw);
    if (problems.length) {
      errors.push(...problems.map((p) => `${where}: ${p}`));
      continue;
    }
    flows.push({ slug, ...normalizeFlow(raw) });
  }

  flows.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  return {
    data: {
      repo: process.env.GITHUB_REPOSITORY || 'sebastarre/flow-library',
      branch: process.env.GITHUB_REF_NAME || 'main',
      flows,
    },
    errors,
  };
}
