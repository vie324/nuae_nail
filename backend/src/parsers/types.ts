/**
 * Common shape produced by every email parser.
 * The field set is normalized so the queue worker / DB writer
 * can stay source-agnostic.
 */
export type ReservationSource = 'minimo' | 'hpb';
export type ReservationStatus = 'new' | 'modified' | 'cancelled';

export interface ParsedReservation {
  /** Which platform this came from. */
  source: ReservationSource;

  /** Source-side reservation id. Composite UNIQUE with `source`. */
  externalId: string;

  /** new / modified / cancelled. Detected from subject + body. */
  status: ReservationStatus;

  customer: {
    name?: string;
    nameKana?: string;
    phone?: string;
    email?: string;
  };

  /** Reservation start, ISO 8601 (with +09:00). */
  startAt: string;
  /** Reservation end, ISO 8601. Optional - HPB sometimes only sends start. */
  endAt?: string;

  /** Free-text menu description. Mapping to internal menu happens later. */
  menu?: string;

  /** Staff name as shown on the source. May be "指名なし" etc. */
  staff?: string;

  /** Yen amount, integer. */
  amount?: number;

  /** Original email body, kept for debugging / re-parsing. */
  rawText: string;

  /** When the parser ran. */
  parsedAt: string;

  /**
   * Parser warnings. Populated when an expected field could not be
   * extracted but parsing partially succeeded. Used for monitoring.
   */
  warnings: string[];
}

/** Headers needed for source detection. */
export interface MailHeaders {
  from?: string;
  subject?: string;
  /** Optional - some sources use a stable Reply-To. */
  replyTo?: string;
}
