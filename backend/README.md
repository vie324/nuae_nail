# Nuae backend — external reservation ingestion

minimo / Hot Pepper Beauty (HPB) からの予約をダッシュボードに取り込むためのバックエンド。

実装ロードマップ:

| Phase | 内容 | 状態 |
|---|---|---|
| **2** | メールパーサー & IMAP watcher | ✅ 実装済み |
| **1** | 永続化レイヤ (Postgres + BullMQ + REST API) | 🚧 次の実装 |
| **3** | Playwright スクレイパー (HPB / minimo) | ⏳ 後続 |

---

## 5 分で動かす（Phase 2 デモ）

```bash
cd backend
npm install
npm test                              # ユニットテスト (vitest)
npm run demo                          # 全フィクスチャをパース
npm run parse src/fixtures/minimo-new.txt   # 単発実行
```

実行例:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📩  minimo-new.txt  [source=minimo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  source       minimo
  status       new
  externalId   M9876543
  customer     山田 花子 (09011112222)
  startAt      2026-04-24T01:00:00.000Z
  endAt        2026-04-24T02:30:00.000Z
  menu         ジェルネイル(ワンカラー)
  staff        田中 美咲
  amount       ¥6,600
```

---

## ディレクトリ構成

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── parsers/           ← メールパーサー本体
    │   ├── types.ts         ParsedReservation 型定義
    │   ├── normalize.ts     全角/日付/電話 等の正規化ヘルパ
    │   ├── router.ts        どのプラットフォームからのメールか判定
    │   ├── minimo.ts        minimo パーサー
    │   ├── hotpepper.ts     HPB (サロンボード) パーサー
    │   └── index.ts         上位の parseEmail() 1関数
    ├── fixtures/          ← サンプルメール本文
    │   ├── minimo-new.txt
    │   ├── minimo-modify.txt
    │   ├── minimo-cancel.txt
    │   ├── hpb-new.txt
    │   └── hpb-cancel.txt
    ├── tests/             ← vitest テスト
    │   ├── normalize.test.ts
    │   ├── router.test.ts
    │   ├── minimo.test.ts
    │   └── hotpepper.test.ts
    ├── imap/
    │   └── watcher.ts       IMAP IDLE で新着を監視 → パーサーに流す
    └── cli/
        └── parse.ts         デモ用 CLI
```

---

## 実メールが届くまでの運用

### 1. 受信箱の準備

サロンが minimo / HPB から通知を受け取る Gmail アドレスをひとつ用意します（既存でも可）。
推奨は専用アドレスを切ること（例: `reservations@nuae.jp`）。
2段階認証 + アプリパスワードを発行して `.env` に設定します。

### 2. 接続テスト

```bash
cp .env.example .env
# IMAP_HOST / IMAP_USER / IMAP_PASSWORD を編集

npm run imap:watch
```

直近 24h のメールを catch-up し、続いて IDLE で待機します。
受信があるたび stdout にパース結果が出力されるので、
本物のメールでフィールドが取れているか確認してください。

### 3. パーサー精度の調整

実メールでフィールドが取れなかった場合:

1. 受信したメールのソースをコピー
2. 個人情報をマスクして `src/fixtures/{source}-real.txt` として保存
3. `tests/{source}.test.ts` にケースを追加
4. `src/parsers/{source}.ts` の正規表現を調整して green に

`src/parsers/normalize.ts` の `parseJpDateTimeRange` は色々な日本語表記に対応していますが、
新しいパターンが出たらここを拡張してください。

---

## 設計メモ

### なぜ「メールパース優先」なのか

[詳細な議論はチャット履歴参照]

要点:

- ✅ 規約違反リスクが極小（自分宛のメールを読むだけ）
- ✅ DOM 変更に強い（メールフォーマットは数年スパンで安定）
- ✅ 認証が IMAP のみ、CAPTCHA / 2FA 突破不要
- ✅ リアルタイム性が高い（IDLE で即時通知）
- ⚠️ ステータス更新（自動キャンセル等）は取り逃しやすい → スクレイパーで補完

### 冪等性

`(source, external_id)` の複合 UNIQUE をDBに張り、UPSERT で重複防止。
同じ予約に対して「new → modified → cancelled」が来ても矛盾なく更新できます。

### 失敗ハンドリング

- パースに失敗したメール (id が取れない等) は `[skip] reason=...` と stdout に出して通過
- フィールドが部分的に取れた場合は `warnings: ['startAt could not be parsed']` 付きで通る
- Phase 1 では failed_messages テーブルに保管 → 後追い解析

---

## 次の Phase 1 で追加するもの

- Postgres スキーマ (`external_reservations`, `customers_match` 等)
- BullMQ ワーカー (mail-ingest / scrape-hpb / scrape-minimo)
- Fastify + REST API (`/api/reservations`, `/api/integrations/sync`)
- 既存ダッシュボード (`/integrations` 画面) を実DBに接続
- Docker Compose (postgres + redis)
