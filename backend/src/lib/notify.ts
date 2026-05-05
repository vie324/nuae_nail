/**
 * Owner notifications.
 *
 * Used by the scraper layer when a session expires and only manual
 * intervention can recover (e.g. CAPTCHA / 2FA prompted).
 *
 * Currently sends via LINE Messaging API push if `LINE_ACCESS_TOKEN`
 * + `LINE_OWNER_USER_ID` are configured. Falls back to logging.
 */
import { config } from '../config.ts';
import { logger } from './logger.ts';
import type { ReservationSource } from '../parsers/types.ts';

interface LinePushBody {
  to: string;
  messages: Array<{ type: 'text'; text: string }>;
}

async function lineDirectPush(text: string): Promise<boolean> {
  const { accessToken, ownerUserId } = config.line;
  if (!accessToken || !ownerUserId) return false;

  const body: LinePushBody = {
    to: ownerUserId,
    messages: [{ type: 'text', text }]
  };

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      logger.error({ status: res.status, body: await res.text() }, 'LINE push failed');
      return false;
    }
    return true;
  } catch (err) {
    logger.error({ err }, 'LINE push error');
    return false;
  }
}

export async function notifyReauthNeeded(source: ReservationSource, reason: string): Promise<void> {
  const text =
    `🔐 ${source.toUpperCase()} の自動取得が止まりました\n` +
    `理由: ${reason}\n` +
    `ダッシュボードから再ログインをお願いします。`;
  logger.warn({ source, reason }, 'reauth needed');
  await lineDirectPush(text);
}

export async function notifyScrapeError(source: ReservationSource, message: string): Promise<void> {
  const text = `⚠️ ${source.toUpperCase()} スクレイプ失敗: ${message}`;
  logger.error({ source, message }, 'scrape error');
  await lineDirectPush(text);
}
