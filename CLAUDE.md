# booth-list-cleaner

booth(booth.pm)のリストを自動で整理するgoogle拡張機能

## 仕様

受け取ったギフトが好きリストに入っている商品なら好きリストから削除する。
ギフトの受け取り画面に行くとその商品のIDを保存しておいて好きリストを開いたときに保存されている商品をリストから自動で削除する。

## 技術スタック

- [WXT](https://wxt.dev) — 拡張機能フレームワーク（Vite ベース、manifest 自動生成）
- TypeScript / Vitest (happy-dom) / ESLint（lint） / Prettier（整形）
- パッケージマネージャ: pnpm

## 構成

- `entrypoints/` — WXT のエントリポイント。ファイル名で種別が決まる
  - `content.ts` — booth.pm に注入されるコンテンツスクリプト
  - `background.ts` — Service Worker
  - `popup/` — ツールバーのポップアップ
- `utils/` — 共有ロジック（自動 import 対象）。DOM 操作ロジックはここに置く
- `tests/` — テスト（`*.test.ts`）。対象は `@/utils/...` で import する
- `wxt.config.ts` — manifest（権限・名前など）はここで定義する。`public/manifest.json` は作らない

## コマンド

- 開発（Chrome が自動起動し HMR）: `pnpm dev`
- ビルド: `pnpm build` → `.output/chrome-mv3/`
- 配布用 zip: `pnpm zip`
- 整形: `pnpm format`
- チェック一式（lint・型・テスト・ビルド）: `pnpm check` — 変更後は必ず通すこと

## 規約

- `browser`, `storage`, `defineContentScript` などは WXT の自動 import。`chrome.*` ではなく `browser.*` を使う
- 権限は必要最小限にする
- BOOTH の DOM セレクタは `utils/` に定数として集約する（サイト変更時の修正箇所を1か所に）。`utils/items.ts` の `ITEM_SELECTOR` は仮の値

## コーディング規約

- 関数はなるべく純粋関数にする
- コメントは簡潔にwhyを書くようにする。ただし書かなくてもコードを見れば自明なことは書かない。
- exportはなるべく少なくなるような設計にしてください。
