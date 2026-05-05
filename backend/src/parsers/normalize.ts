/**
 * Text / number / date normalization shared by parsers.
 * Real Japanese reservation emails mix:
 *  - 全角 / 半角 数字、コロン、カッコ
 *  - スペース・全角スペース・改行コード
 *  - 「2026年04月24日」「2026/04/24」「4月24日」 などの日付表記
 *  - 「10:00〜11:30」「10:00 〜 11:30」「10時00分」 などの時刻表記
 */

/** Convert all 全角 alphanumerics + symbols to 半角. */
export function toHankaku(s: string): string {
  return s
    .replace(/[０-９Ａ-Ｚａ-ｚ]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[！-／：-＠［-｀｛-～]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/　/g, ' ');
}

/** Strip phone formatting like dashes, parens, etc. Retains digits. */
export function normalizePhone(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = toHankaku(raw).replace(/[^\d+]/g, '');
  return digits.length >= 10 ? digits : undefined;
}

/** Parse strings like "¥6,600" / "6600円" / "6,600" → 6600. */
export function parseYen(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const m = toHankaku(raw).replace(/[¥,円\s]/g, '');
  const n = Number.parseInt(m, 10);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Parse a Japanese date+time string and return ISO 8601 in JST.
 *
 * Accepts (case-insensitive, mixed widths):
 *   - "2026年4月24日(金) 10:00〜11:30"
 *   - "2026/04/24 10:00 〜 11:30"
 *   - "2026-04-24 13:00 から 14:15 まで"
 *   - "4月24日(金) 10:00"      (year inferred from `now`)
 *
 * Returns { startAt, endAt } where endAt is undefined if absent.
 */
export function parseJpDateTimeRange(
  raw: string,
  now: Date = new Date()
): { startAt?: string; endAt?: string } {
  const text = toHankaku(raw)
    .replace(/[(（].+?[)）]/g, ' ')   // strip 曜日 in parens
    .replace(/\s+/g, ' ')
    .trim();

  // Try YYYY?年MM月DD日 or YYYY/MM/DD or YYYY-MM-DD
  const dateMatch =
    text.match(/(\d{4})\s*[年/\-]\s*(\d{1,2})\s*[月/\-]\s*(\d{1,2})\s*日?/) ||
    text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);

  if (!dateMatch) return {};

  let year: number, month: number, day: number;
  if (dateMatch.length === 4) {
    year  = Number(dateMatch[1]);
    month = Number(dateMatch[2]);
    day   = Number(dateMatch[3]);
  } else {
    year  = now.getFullYear();
    month = Number(dateMatch[1]);
    day   = Number(dateMatch[2]);
    // If parsed month/day already passed this year, assume next year.
    const candidate = new Date(year, month - 1, day);
    if (candidate.getTime() < now.getTime() - 86400_000) year += 1;
  }

  // Time range: e.g. "10:00 〜 11:30" or "10:00 から 11:30 まで" or "10:00 - 11:30" or "10:00"
  const timeMatch = text.match(
    /(\d{1,2})\s*[:時]\s*(\d{1,2})(?:\s*分?)?(?:\s*[〜~\-–ー]\s*|\s*から\s*|\s+)(\d{1,2})\s*[:時]\s*(\d{1,2})/
  );
  const singleMatch = text.match(/(\d{1,2})\s*[:時]\s*(\d{1,2})/);

  const fmt = (h: number, m: number) =>
    new Date(Date.UTC(year, month - 1, day, h - 9, m, 0)).toISOString();
  // JST = UTC+9 → subtract 9h when constructing UTC

  if (timeMatch) {
    const sh = Number(timeMatch[1]);
    const sm = Number(timeMatch[2]);
    const eh = Number(timeMatch[3]);
    const em = Number(timeMatch[4]);
    return { startAt: fmt(sh, sm), endAt: fmt(eh, em) };
  }
  if (singleMatch) {
    const sh = Number(singleMatch[1]);
    const sm = Number(singleMatch[2]);
    return { startAt: fmt(sh, sm) };
  }
  return {};
}

/**
 * Pull the first capture group, trimmed. Returns undefined when not found
 * or the result was empty after trim. Designed for "label: value" extraction.
 */
export function extract(text: string, pattern: RegExp): string | undefined {
  const m = text.match(pattern);
  if (!m || !m[1]) return undefined;
  const v = m[1].trim();
  return v.length ? v : undefined;
}

/** Normalize CR/LF to LF and strip BOM. */
export function normalizeBody(text: string): string {
  return text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
