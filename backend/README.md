# Nuae backend — external reservation ingestion

minimo / Hot Pepper Beauty (HPB) からの予約をダッシュボードに取り込むためのバックエンド。

実装ロードマップ:

| Phase | 内容 | 状態 |
|---|---|---|
| **2** | メールパーサー & IMAP watcher | ✅ |
| **1** | Postgres + BullMQ + Fastify API | ✅ |
| **3** | Playwright スクレイパー | ⏳ 次 |

---

## 構成図

```
┌─────────────────────┐
│  IMAP inbox (Gmail) │       (新規通知メール)
└──────────┬──────────┘
           │ IDLE
┌──────────▼──────────┐    enqueue
│  watcher.ts         │ ───────────┐
│  (parse + push)     │            │
└─────────────────────┘            ▼
                                ┌────────────────┐
                                │ BullMQ queue   │
                                │ "mail-ingest"  │
                                └───────┬────────┘
                                        │ process
                                ┌───────▼────────┐
                                │ worker.ts      │
                                │ → upsert DB    │
                                └───────┬────────┘
                                        ▼
                                ┌────────────────┐         ┌────────────────┐
                                │  Postgres      │ ◀───── │  Fastify API   │
                                │ external_      │  query │  (REST)        │
                                │  reservations  │         │  CORS open     │
                                └────────────────┘         └───────┬────────┘
                                                                   │ fetch
                                                          ┌────────▼────────┐
                                                          │ Frontend        │
                                                          │ (React static)  │
                                                          └─────────────────┘
```

---

## 5分でフルスタックを動かす

```bash
cd backend
cp .env.example .env       # 既定値で動きます。IMAP_PASSWORD は空でOK

docker compose up -d       # Postgres + Redis を起動
npm install
npm run db:migrate         # スキーマ適用

# サンプル予約を直接DBに入れる（IMAP不要のスモークテスト）
npm run ingest src/fixtures/minimo-new.txt src/fixtures/hpb-new.txt

# API + worker を別ターミナルで起動
npm run dev:api            # → http://localhost:4000
npm run dev:worker

# 確認
curl http://localhost:4000/api/reservations | jq
curl http://localhost:4000/api/integrations  | jq
```

### フロントエンドを実APIに接続

ブラウザで `index.html` を開き、DevTools コンソールで:

```js
localStorage.setItem('nuae:apiBase', 'http://localhost:4000');
location.reload();
```

`/integrations` ページのヘッダに「API: http://localhost:4000」バッジが緑で表示されたら成功。
モックに戻すときは `localStorage.removeItem('nuae:apiBase')` → reload。

### IMAP も繋ぐ（実メール取り込み）

```bash
# .env を編集
IMAP_HOST=imap.gmail.com
IMAP_USER=salon-inbox@nuae.jp
IMAP_PASSWORD=xxxx_xxxx_xxxx_xxxx     # Gmailアプリパスワード

npm run imap:watch
```

直近24hのメールを取り込み、その後はIDLE待機します。

---

## ディレクトリ構成

```
backend/
├── docker-compose.yml          ← Postgres + Redis (local dev)
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── config.ts               ← 環境変数の単一ソース
    ├── lib/logger.ts           ← pino
    ├── parsers/                ← Phase 2
    │   ├── types.ts
    │   ├── normalize.ts
    │   ├── router.ts
    │   ├── minimo.ts
    │   ├── hotpepper.ts
    │   └── index.ts
    ├── fixtures/               ← サンプルメール
    ├── tests/                  ← vitest 21テスト (全green)
    ├── db/
    │   ├── client.ts           ← pg pool
    │   ├── migrate.ts          ← マイグレーションランナー
    │   ├── migrations/001_init.sql
    │   └── repositories/
    │       ├── reservations.ts ← UPSERT(source, external_id)
    │       ├── integrations.ts
    │       └── failed.ts
    ├── queue/
    │   ├── connection.ts       ← ioredis
    │   ├── queues.ts           ← BullMQ "mail-ingest"
    │   ├── worker.ts           ← ワーカープロセスエントリ
    │   └── jobs/mail-ingest.ts ← processor
    ├── api/
    │   ├── server.ts           ← Fastify エントリ
    │   └── routes/
    │       ├── health.ts       ← /health, /health/ready
    │       ├── reservations.ts ← /api/reservations[/stats]
    │       └── integrations.ts ← /api/integrations[/:id][/connection|/sync]
    ├── imap/watcher.ts         ← IMAP IDLE → BullMQ
    └── cli/
        ├── parse.ts            ← フィクスチャをコンソール出力
        └── ingest.ts           ← フィクスチャを実DBに INSERT
```

---

## REST API

| Method | Path | 用途 |
|---|---|---|
| GET   | `/health`                                 | ライブネス |
| GET   | `/health/ready`                           | DB ping 含む |
| GET   | `/api/reservations`                       | 予約一覧 (filters: from, to, source, status, limit) |
| GET   | `/api/reservations/stats`                 | ステータス別件数 |
| GET   | `/api/integrations`                       | 全プラットフォーム連携状況 |
| GET   | `/api/integrations/:id`                   | 1件 |
| PATCH | `/api/integrations/:id/connection`        | 接続/切断 (`{connected, accountId?, config?}`) |
| POST  | `/api/integrations/:id/sync`              | 手動同期トリガ (Phase 3 でスクレイプ起動) |

---

## DBスキーマ要点

```sql
external_reservations (
  source, external_id,                    -- UNIQUE 複合キー
  status: 'new' | 'modified' | 'cancelled',
  customer_*, start_at, end_at, menu_text, staff_text, amount,
  raw_text, warnings (jsonb),
  ingested_at, updated_at
)

integration_status ( id PK, connected, last_sync_at, last_error, config jsonb )
failed_messages   ( source, reason, raw_*, failed_at )
schema_migrations ( version PK )
```

UPSERT は `(source, external_id)` 複合 UNIQUE を使い、`new → modified → cancelled`
の各イベントを矛盾なく統合します。COALESCE で部分情報の上書きを防止。

---

## 運用コマンド

```bash
npm run db:migrate     # マイグレーション
npm run dev:api        # API サーバ (auto-reload)
npm run dev:worker     # ワーカー (auto-reload)
npm run start:api      # 本番モード
npm run start:worker
npm run imap:watch     # IMAP 監視 → キュー投入
npm run ingest <file>  # フィクスチャを直接DBに入れる (IMAP不要)
npm run parse <file>   # コンソールにパース結果を表示 (DB不要)
npm run demo           # 全フィクスチャをパース表示
npm test               # vitest
npm run typecheck      # tsc --noEmit
```

---

## 次の Phase 3 で追加するもの

- Playwright + stealth でサロンボード/minimo管理画面を週次/日次スクレイプ
- 予約の双方向マージ（メール + スクレイプ） — 取り逃しゼロを目指す
- スタッフへ「再ログイン要求」をLINE通知するフロー（セッション失効対応）
- E2Eテスト（fastify.inject + ephemeral postgres）
