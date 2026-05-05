# Nuae backend — external reservation ingestion

minimo / Hot Pepper Beauty (HPB) からの予約をダッシュボードに取り込むためのバックエンド。

実装ロードマップ:

| Phase | 内容 | 状態 |
|---|---|---|
| **2** | メールパーサー & IMAP watcher | ✅ |
| **1** | Postgres + BullMQ + Fastify API | ✅ |
| **3** | Playwright スクレイパー骨格 + 再認証通知 | ✅ |

---

## 構成図

```
                     ┌──────────────────┐
                     │  IMAP inbox      │ (新規予約通知メール)
                     └────────┬─────────┘
                              │ IDLE
                              ▼
   ┌──────────────────────────────────────────┐
   │  watcher.ts                              │
   │  parse → enqueue mail-ingest             │
   └──────────────────────────────────────────┘
                              │
   ┌──────────────────────┐   ▼   ┌──────────────────────────────┐
   │ Playwright           │  ┌────┴───────────┐                  │
   │ HpbScraper /         │  │  BullMQ        │                  │
   │ MinimoScraper        ├──▶ "scrape" + ────▶ worker.ts ──┐   │
   │ (cron 15/30 min)     │  │ "mail-ingest"  │             │   │
   └──────────────────────┘  └────────────────┘             │   │
                                                            ▼   │
                                                    upsertReservation
                                                            │   │
                                                            ▼   │
                                                ┌──────────────────────┐
                                                │  Postgres            │
                                                │  external_reservations│
                                                └──────────┬───────────┘
                                                           │
                                                ┌──────────▼───────────┐
                                                │  Fastify REST API    │
                                                │  /api/reservations   │
                                                │  /api/integrations   │
                                                └──────────┬───────────┘
                                                           │ fetch + CORS
                                                ┌──────────▼───────────┐
                                                │  Frontend (React)    │
                                                └──────────────────────┘
```

---

## 5分でフルスタック起動

```bash
cd backend
cp .env.example .env       # IMAP_PASSWORD/SCRAPER credential は空でOK

docker compose up -d       # Postgres + Redis
npm install
npm run db:migrate

# 動作確認 (DB / IMAP / browsers いずれも不要のスモークテスト)
npm test                   # vitest 30 件
npm run scrape hpb -- --dry

# 実データ投入 (IMAP不要)
npm run ingest src/fixtures/minimo-new.txt src/fixtures/hpb-new.txt

# サーバ + ワーカー
npm run dev:api            # → http://localhost:4000
npm run dev:worker

curl http://localhost:4000/api/reservations | jq
```

---

## ディレクトリ構成

```
backend/
├── docker-compose.yml          ← Postgres + Redis (local dev)
├── package.json
├── tsconfig.json
├── .env.example
├── .npmrc                      ← Playwright auto-download skip
└── src/
    ├── config.ts               ← 環境変数の単一ソース
    ├── lib/
    │   ├── logger.ts           ← pino
    │   └── notify.ts           ← LINE 再認証通知
    ├── parsers/                ← Phase 2
    ├── fixtures/
    ├── scrapers/               ← Phase 3
    │   ├── types.ts            ← ReAuthRequired / SelectorDriftError
    │   ├── session.ts          ← storageState 永続化
    │   ├── base.ts             ← BaseScraper (browser, login, retry)
    │   ├── hpb.ts              ← HpbScraper + extractFromHpbRowHtml
    │   ├── minimo.ts           ← MinimoScraper + extractFromMinimoRowHtml
    │   ├── index.ts            ← createScraper() ファクトリ
    │   └── __tests__/          ← HTML 抽出ユニットテスト
    ├── db/
    │   ├── client.ts           ← pg pool
    │   ├── migrate.ts          ← マイグレーションランナー
    │   ├── migrations/001_init.sql
    │   └── repositories/       ← reservations / integrations / failed
    ├── queue/
    │   ├── connection.ts       ← ioredis
    │   ├── queues.ts           ← mail-ingest + scrape
    │   ├── worker.ts           ← 両キューの worker + cron 登録
    │   └── jobs/
    │       ├── mail-ingest.ts
    │       └── scrape.ts
    ├── api/
    │   ├── server.ts           ← Fastify エントリ
    │   └── routes/
    │       ├── health.ts
    │       ├── reservations.ts
    │       └── integrations.ts ← /sync が scrape job を enqueue
    ├── imap/watcher.ts         ← IMAP IDLE → BullMQ
    └── cli/
        ├── parse.ts            ← フィクスチャをコンソール出力
        ├── ingest.ts           ← フィクスチャを実DBに INSERT
        └── scrape.ts           ← ワンショットでスクレイプ実行
```

---

## REST API

| Method | Path | 用途 |
|---|---|---|
| GET   | `/health`                           | ライブネス |
| GET   | `/health/ready`                     | DB ping 含む |
| GET   | `/api/reservations`                 | filters: from, to, source, status, limit |
| GET   | `/api/reservations/stats`           | ステータス別件数 |
| GET   | `/api/integrations`                 | 連携状況 |
| GET   | `/api/integrations/:id`             | 1件 |
| PATCH | `/api/integrations/:id/connection`  | 接続/切断 |
| POST  | `/api/integrations/:id/sync`        | minimo/hpb は scrape ジョブ enqueue、それ以外は timestamp のみ |

---

## Phase 3: スクレイパーを実運用へ

### 1. ブラウザのインストール

`.npmrc` に `playwright_skip_browser_download=1` を入れているので
`npm install` ではブラウザはダウンロードされません。一度だけ:

```bash
npm run browsers:install   # = npx playwright install chromium
```

### 2. クレデンシャルの設定

`.env` に追加:

```
SALONBOARD_USER=...
SALONBOARD_PASSWORD=...
MINIMO_USER=...
MINIMO_PASSWORD=...
SCRAPER_HEADLESS=false      # ← 初回はキャプチャモードで目視確認したい
```

### 3. セレクタを実際の DOM で確定する

⚠️ **超重要**: `src/scrapers/{hpb,minimo}.ts` の `SEL = { ... }` には
プレースホルダのセレクタしか入っていません。実機キャプチャで埋めてください。

```bash
# Capture モード (headless=false で起動、DevTools で要素を Copy selector)
npm run scrape hpb -- --capture

# 1) 表示された Chromium で実際にログインする (手動)
# 2) 予約一覧ページを開く
# 3) DevTools → Elements → 必要な要素を右クリック → "Copy selector"
# 4) src/scrapers/hpb.ts の SEL を埋める
```

埋めるべきもの:
- ログインフォームの input セレクタ + submit ボタン
- ログイン済み判定の何か (例: アカウントメニューの存在)
- 予約一覧の各行の selector + 列ごとのセレクタ

### 4. headless で本番モードへ

セレクタが固まったら `.env` を `SCRAPER_HEADLESS=true` に戻し:

```bash
npm run scrape hpb         # ワンショット実行
npm run dev:worker         # 15分ごとに自動スクレイプが走る
```

### 5. UI からの手動同期

ダッシュボードの「外部予約サイト連携」画面で「全て同期」/「sync」ボタンを押すと
`POST /api/integrations/:id/sync` が呼ばれ、worker が即座にスクレイプを実行します。

### 6. セッション失効時

セッションが切れて再ログインが必要になったとき:
- `failed_messages` に `ReAuthRequired` のエントリが残ります
- `LINE_ACCESS_TOKEN` + `LINE_OWNER_USER_ID` を設定していれば、オーナーへ LINE 通知
- セッションファイル `.sessions/state-{source}.json` は自動削除されるので、
  次回実行時にログイン処理から再開されます

---

## 運用コマンド

```bash
# テストとビルド
npm test                       # vitest (30 件)
npm run typecheck              # tsc --noEmit

# データレイヤ
npm run db:migrate             # マイグレーション

# パーサー / インジェスト
npm run parse <file>           # フィクスチャをコンソール表示 (DB不要)
npm run ingest <file>          # フィクスチャを直接DBに INSERT
npm run imap:watch             # IMAP IDLE → BullMQ

# スクレイパー
npm run browsers:install       # 初回のみ
npm run scrape hpb             # ワンショット実行 (DB保存)
npm run scrape hpb -- --dry    # ブラウザ起動なしで配線確認
npm run scrape hpb -- --capture  # 目視で selector 確認 (headed)
npm run scrape hpb -- --force-login   # 保存セッション無視

# サーバ / ワーカー
npm run dev:api                # API (auto-reload)
npm run dev:worker             # ワーカー + cron 登録
```

---

## 法的・運用上の注意

| 項目 | 内容 |
|---|---|
| ToS | サロンボード/minimo の利用規約は自動アクセスを禁じる条項あり。本番運用は **オーナーの自己責任** + 文書同意が必要 |
| Rate limit | cron 間隔は HPB=15分、minimo=30分。これより短くしないこと |
| セッション窃盗 | `.sessions/*.json` は **クレデンシャル相当**。`.gitignore` 済み、本番ではボリューム暗号化推奨 |
| 検出回避 | UA / locale / timezone は固定。IP rotation はしない（むしろ怪しまれる） |
| 監視 | `failed_messages` の件数を Datadog / Sentry に流して 24h 取れていなければアラート |
| 法的グレー | 本人クレデンシャルでの本人データ取得は不正アクセス禁止法の判例的にセーフだが、規約違反でアカウント凍結リスクは残る |

---

## 次にやるとよいこと

- メール + スクレイプの **double-source マージ**（取り逃しゼロ）
- `failed_messages` の Slack 通知 webhook
- E2E テスト (`fastify.inject` + ephemeral postgres)
- 顧客カルテ自動マッチング (電話番号 → customer_id)
- 予約画面の React 統合（`/reservations` ページを実 API に接続）
