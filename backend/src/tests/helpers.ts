import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(HERE, '..', 'fixtures');

export function loadFixture(name: string): string {
  return readFileSync(resolve(FIXTURES, name), 'utf8');
}
