import {
  toHankaku,
  normalizePhone,
  normalizeBody,
  parseYen,
  parseJpDateTimeRange,
  extract
} from './normalize.ts';
import type { ParsedReservation, ReservationStatus } from './types.ts';

/**
 * minimo notification email parser.
 *
 * Detected sub-types (mapped to status):
 *   - 新規予約 / 予約確定          -> new
 *   - 予約変更                     -> modified
 *   - 予約キャンセル / キャンセル  -> cancelled
 *
 * The text patterns below are conservative and tolerant of:
 *   - 全角 vs 半角 数字
 *   - "▼予約番号" vs "予約番号:" vs "予約ID："
 *   - line endings (CR/LF/LF)
 *
 * NOTE: minimo does not publish a stable email format. When you
 * receive your first real notifications, capture them and put them
 * in fixtures/ for regression testing.
 */

function detectStatus(subject: string, body: string): ReservationStatus {
  const blob = `${subject}\n${body}`;
  if (/(キャンセル|取消|お取り消し)/.test(blob)) return 'cancelled';
  if (/(変更|修正)/.test(blob)) return 'modified';
  return 'new';
}

const PATTERNS = {
  // ▼予約番号: M9876543 / 予約ID：M-1234 / 予約番号 : 12345
  externalId:  /(?:予約(?:番号|ID|No\.?)?)\s*[:：]\s*([\w-]+)/,

  // ▼お客様氏名: 山田 花子 / お名前：山田 花子 / ご予約者氏名:山田花子
  customerName:
    /(?:お(?:客様)?(?:氏名|名前|名)|予約者(?:氏名|名)?)\s*[:：]\s*([^\n\r]+?)(?:\s*様)?$/m,

  // フリガナ
  customerKana:
    /(?:フリガナ|ふりがな|カナ)\s*[:：]\s*([\p{Script=Katakana}ー\s]+)/u,

  // ご連絡先 / 電話番号 / TEL
  customerPhone:
    /(?:ご?連絡先|電話番号?|TEL|お電話)\s*[:：]\s*([\d\-（）()\s]+)/,

  // 来店日時: 2026年4月24日(金) 10:00 〜 11:30
  // (extract whole tail line so date+time helper can consume it)
  dateTimeLine:
    /(?:ご?(?:予約|来店)日時|来店日|施術日時)\s*[:：]\s*([^\n\r]+)/,

  // メニュー（複数行可）: 続く行に「詳細」が入るケースがあるので最初の1行のみ拾う
  menu:
    /(?:ご?(?:希望)?メニュー|メニュー名|コース)\s*[:：]\s*([^\n\r]+)/,

  // 担当指名 / 指名スタッフ
  staff:
    /(?:担当(?:者|スタッフ|指名)?|指名)\s*[:：]\s*([^\n\r]+)/,

  // 金額: ¥6,600 / 6600円 / 合計：6,600
  amount:
    /(?:ご?(?:予約)?金額|料金|合計|お会計)\s*[:：]\s*([¥0-9,，円\s]+)/
};

export function parseMinimo(rawText: string, subject = ''): ParsedReservation | null {
  const body = toHankaku(normalizeBody(rawText));
  const warnings: string[] = [];

  const externalId = extract(body, PATTERNS.externalId);
  if (!externalId) {
    // Without an id we cannot dedupe, so refuse to parse.
    return null;
  }

  const dateLine = extract(body, PATTERNS.dateTimeLine);
  const { startAt, endAt } = dateLine ? parseJpDateTimeRange(dateLine) : {};
  if (!startAt) warnings.push('startAt could not be parsed');

  const customerName = extract(body, PATTERNS.customerName);
  if (!customerName) warnings.push('customer.name missing');

  const status = detectStatus(subject, body);
  // For cancellations the source rarely re-includes full details.
  // Acceptable to have only id + status set.
  if (status === 'cancelled' && !startAt) warnings.length = 0;

  return {
    source: 'minimo',
    externalId,
    status,
    customer: {
      name:     customerName?.replace(/様$/, '').trim(),
      nameKana: extract(body, PATTERNS.customerKana),
      phone:    normalizePhone(extract(body, PATTERNS.customerPhone))
    },
    startAt: startAt ?? '',
    endAt,
    menu:    extract(body, PATTERNS.menu),
    staff:   extract(body, PATTERNS.staff),
    amount:  parseYen(extract(body, PATTERNS.amount)),
    rawText,
    parsedAt: new Date().toISOString(),
    warnings
  };
}
