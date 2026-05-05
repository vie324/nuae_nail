/**
 * Public entry-point for parsers. Used by IMAP watcher (Phase 1)
 * and by the CLI demo (Phase 2).
 */
import { detectSource } from './router.ts';
import { parseMinimo }  from './minimo.ts';
import { parseHotpepper } from './hotpepper.ts';
import type { MailHeaders, ParsedReservation } from './types.ts';

export interface ParseInput {
  /** From: header value, e.g. `"Minimo <noreply@minimodel.jp>"` */
  from?: string;
  /** Reply-To header value */
  replyTo?: string;
  /** Subject header value */
  subject?: string;
  /** Plain-text body of the email (extracted via mailparser). */
  text: string;
}

export interface ParseResult {
  parsed: ParsedReservation | null;
  /** When null, why? */
  reason?:
    | 'unknown_source'
    | 'parse_failed_no_id'
    | 'empty_body';
}

/** End-to-end: detect source then dispatch. */
export function parseEmail(input: ParseInput): ParseResult {
  if (!input.text || input.text.trim().length < 10) {
    return { parsed: null, reason: 'empty_body' };
  }
  const headers: MailHeaders = {
    from: input.from,
    replyTo: input.replyTo,
    subject: input.subject
  };
  const source = detectSource(headers);
  if (!source) return { parsed: null, reason: 'unknown_source' };

  const parsed = source === 'minimo'
    ? parseMinimo(input.text, input.subject)
    : parseHotpepper(input.text, input.subject);

  if (!parsed) return { parsed: null, reason: 'parse_failed_no_id' };
  return { parsed };
}

export { detectSource, parseMinimo, parseHotpepper };
export type { ParsedReservation, MailHeaders };
