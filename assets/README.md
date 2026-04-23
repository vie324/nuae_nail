# Assets

ロゴ画像をここに配置します。

## 置き換え方法

デフォルトでは `assets/logo.svg`（フルロゴ） と `assets/logo-mark.svg`（短縮マーク）を参照します。
お手持ちの画像ファイル (PNG / JPG / SVG) に差し替える場合は、以下のいずれかの方法で。

### 方法 A: ファイルを上書き

同じファイル名で保存して上書きするだけ。コード変更不要。
推奨サイズ:
- `logo.svg` … 横長 (推奨 460 × 220 相当)
- `logo-mark.svg` … 正方形 (推奨 72 × 72)

### 方法 B: 別ファイルに差し替え

`logo.png` 等を置いたら、以下のファイルで参照先を変更してください:
- `index.html` の `#splash .splash-img`
- `js/components/Sidebar.js` のロゴ `<img>` 要素

```html
<img src="assets/logo.png" class="..." />
```
