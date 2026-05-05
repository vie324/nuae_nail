# Email fixtures

これらは parser のリグレッションテスト用の合成メール本文です。
**実装当初の参考フォーマット**として書いていますが、実際のメール文面は
プラットフォーム側で予告なく変わるため、本番運用前に必ず実メールで上書きしてください。

## 命名規約

`{source}-{event}.txt`

- source: `minimo` | `hpb`
- event:  `new` | `modify` | `cancel`

## 1件目の本物が届いたら

1. メールクライアントで「メッセージのソースを表示」→ 全文コピー
2. `*.eml.txt` として `fixtures/real/` (gitignore対象) に保存
3. 同じ内容を `*.txt` のコピーとしても用意し、個人情報をマスク
4. `tests/*.test.ts` を更新して assertion を増やす
