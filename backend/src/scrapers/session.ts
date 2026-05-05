/**
 * Persists Playwright `storageState` so subsequent scrapes can skip
 * the login step. The file contains cookies + localStorage so it MUST
 * be treated as credentials — keep it under .sessions/ which is in
 * .gitignore by default.
 */
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { BrowserContext } from 'playwright';
import { config } from '../config.ts';
import type { ReservationSource } from '../parsers/types.ts';

function ensureDir(): string {
  const dir = resolve(config.scrapers.sessionDir);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function pathFor(source: ReservationSource): string {
  return resolve(ensureDir(), `state-${source}.json`);
}

export function loadSession(source: ReservationSource): string | undefined {
  const p = pathFor(source);
  if (!existsSync(p)) return undefined;
  // Just verify it's valid JSON before handing the path back.
  try { JSON.parse(readFileSync(p, 'utf8')); return p; }
  catch { return undefined; }
}

export async function saveSession(source: ReservationSource, ctx: BrowserContext): Promise<void> {
  const state = await ctx.storageState();
  await writeFile(pathFor(source), JSON.stringify(state, null, 2));
}

export function clearSession(source: ReservationSource): void {
  const p = pathFor(source);
  if (existsSync(p)) unlinkSync(p);
}
