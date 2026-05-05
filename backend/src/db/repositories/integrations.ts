/**
 * integration_status repository.
 *
 * Drives the dashboard's "外部予約サイト連携" page. Each row represents
 * the connection state for one platform (minimo / hpb / line / ...).
 */
import { query, one } from '../client.ts';

export interface IntegrationRow {
  id: string;
  display_name: string;
  connected: boolean;
  account_id: string | null;
  last_sync_at: Date | null;
  last_error: string | null;
  config: Record<string, unknown>;
  updated_at: Date;
}

export async function listIntegrations(): Promise<IntegrationRow[]> {
  return query<IntegrationRow>('SELECT * FROM integration_status ORDER BY id');
}

export async function getIntegration(id: string): Promise<IntegrationRow | null> {
  return one<IntegrationRow>('SELECT * FROM integration_status WHERE id = $1', [id]);
}

export interface SetConnectedInput {
  id: string;
  connected: boolean;
  accountId?: string | null;
  config?: Record<string, unknown>;
}

export async function setConnected(input: SetConnectedInput): Promise<IntegrationRow | null> {
  return one<IntegrationRow>(
    `UPDATE integration_status
        SET connected = $2,
            account_id = COALESCE($3, account_id),
            config     = COALESCE($4::jsonb, config),
            last_error = NULL,
            updated_at = now()
      WHERE id = $1
      RETURNING *`,
    [
      input.id,
      input.connected,
      input.accountId ?? null,
      input.config ? JSON.stringify(input.config) : null
    ]
  );
}

export async function recordSync(id: string, error: string | null = null): Promise<void> {
  await query(
    `UPDATE integration_status
        SET last_sync_at = now(),
            last_error   = $2,
            updated_at   = now()
      WHERE id = $1`,
    [id, error]
  );
}
