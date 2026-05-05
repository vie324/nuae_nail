import type { MailHeaders, ReservationSource } from './types.ts';

/**
 * Detect which source an inbound email belongs to.
 *
 * Implementation note:
 *   We match against multiple signals (From / Subject / Reply-To) so a
 *   single domain change on the source side does not silently break the
 *   pipeline. The first matching signal wins.
 */
const FROM_SIGNALS: Array<{ source: ReservationSource; pattern: RegExp }> = [
  // minimo notifications come from minimodel.jp / minimo.mu
  { source: 'minimo', pattern: /(?:[\w.-]+\.)?minimo(?:del)?\.(?:jp|mu)/i },
  // Hot Pepper Beauty (salonboard) typically uses *.salonboard.com or *.hotpepper.jp
  { source: 'hpb',    pattern: /(?:[\w.-]+\.)?(?:salonboard|hotpepper)\.(?:com|jp|net)/i }
];

const SUBJECT_SIGNALS: Array<{ source: ReservationSource; pattern: RegExp }> = [
  { source: 'minimo', pattern: /\[?【?\s*minimo\s*】?\]?/i },
  { source: 'hpb',    pattern: /(ホットペッパービューティー|HOT\s*PEPPER\s*Beauty|サロンボード)/i }
];

export function detectSource(headers: MailHeaders): ReservationSource | null {
  const from    = headers.from?.toLowerCase()    ?? '';
  const replyTo = headers.replyTo?.toLowerCase() ?? '';
  const subject = headers.subject ?? '';

  for (const { source, pattern } of FROM_SIGNALS) {
    if (pattern.test(from) || pattern.test(replyTo)) return source;
  }
  for (const { source, pattern } of SUBJECT_SIGNALS) {
    if (pattern.test(subject)) return source;
  }
  return null;
}
