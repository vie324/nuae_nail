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
 * Hot Pepper Beauty (salonboard) notification email parser.
 *
 * Email subjects observed in the wild include:
 *   - 【ホットペッパービューティー】予約完了のお知らせ
 *   - 【ホットペッパービューティー】予約キャンセルのお知らせ
 *   - 【ホットペッパービューティー】予約内容変更のお知らせ
 *
 * Body uses 【ラベル】value 形式 instead of "ラベル: value".
 */

function detectStatus(subject: string, body: string): ReservationStatus {
  const blob = `${subject}\n${body}`;
  if (/(キャンセル|取り?消し)/.test(blob)) return 'cancelled';
  if (/(変更|修正|内容変更)/.test(blob)) return 'modified';
  return 'new';
}

/**
 * HPB style: 【ラベル】値 — also tolerates legacy "ラベル：値".
 *  We build patterns that match BOTH so a minor format change on the
 *  source side does not break us instantly.
 */
const dual = (label: string, value: string) =>
  new RegExp(`(?:【\\s*${label}\\s*】|${label}\\s*[:：])\\s*(${value})`);

const PATTERNS = {
  // 予約番号: HPB-789012345 / 予約ID: ABC123
  externalId:    dual('予約(?:番号|ID|No\\.?)', '[\\w-]+'),

  // ご予約者 / お客様名
  customerName:  dual('(?:ご?予約者(?:氏名)?|お客様(?:氏名|名)?)', '[^\\n\\r【]+'),

  // 電話番号
  customerPhone: dual('(?:電話番号|お電話番号|連絡先)', '[\\d\\-（）()\\s]+'),

  // メールアドレス
  customerEmail: dual('(?:メール(?:アドレス)?|E\\-?mail)', '[\\w._%+-]+@[\\w.-]+'),

  // ご来店日時: 2026年04月24日(金)　13:00〜14:15
  dateTimeLine:  dual('(?:ご?来店(?:日時)?|ご?予約(?:日時)?|施術日時)', '[^\\n\\r【]+'),

  // ご利用コース / コース名 / メニュー
  menu:          dual('(?:ご?利用コース|コース(?:名)?|メニュー(?:名)?|施術内容)', '[^\\n\\r【]+'),

  // 担当者 / 指名
  staff:         dual('(?:担当(?:者|スタッフ)?|指名(?:スタッフ)?)', '[^\\n\\r【]+'),

  // お会計予定 / 料金 / 合計金額
  amount:        dual('(?:お会計予定|料金|合計(?:金額)?|ご?利用料金)', '[¥0-9,，円\\s]+')
};

export function parseHotpepper(rawText: string, subject = ''): ParsedReservation | null {
  const body = toHankaku(normalizeBody(rawText));
  const warnings: string[] = [];

  const externalId = extract(body, PATTERNS.externalId);
  if (!externalId) return null;

  const dateLine = extract(body, PATTERNS.dateTimeLine);
  const { startAt, endAt } = dateLine ? parseJpDateTimeRange(dateLine) : {};
  if (!startAt) warnings.push('startAt could not be parsed');

  const customerName = extract(body, PATTERNS.customerName);
  if (!customerName) warnings.push('customer.name missing');

  const status = detectStatus(subject, body);
  if (status === 'cancelled' && !startAt) warnings.length = 0;

  return {
    source: 'hpb',
    externalId,
    status,
    customer: {
      name:  customerName?.replace(/(様|さま)$/, '').trim(),
      phone: normalizePhone(extract(body, PATTERNS.customerPhone)),
      email: extract(body, PATTERNS.customerEmail)
    },
    startAt: startAt ?? '',
    endAt,
    menu:   extract(body, PATTERNS.menu),
    staff:  extract(body, PATTERNS.staff),
    amount: parseYen(extract(body, PATTERNS.amount)),
    rawText,
    parsedAt: new Date().toISOString(),
    warnings
  };
}
