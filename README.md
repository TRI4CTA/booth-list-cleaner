# booth-list-cleaner

BOOTH（booth.pm）の好きリストを自動で整理する Chrome 拡張機能です。受け取ったギフトの商品を好きリストから自動で削除します。

## できること

ギフトで受け取った商品が好きリストに入っていると、次に好きリストを開いたときに自動で外れます。

1. ギフトの受け取り画面で「ギフトを受け取る」を押す
2. 好きリストを開く
3. 受け取った商品が好きリストから外れた状態でページが表示される

- 受け取らずに閉じたギフトの商品は、好きリストに残ります
- 拡張機能を入れる前に受け取ったギフトは対象外です

## ローカルでの環境構築

### 必要なもの

- [Node.js](https://nodejs.org/) 24
- [pnpm](https://pnpm.io/) 10
- Google Chrome

pnpm が入っていない場合は次のコマンドでインストールします。

```sh
npm install -g pnpm@10
```

### セットアップ

```sh
git clone https://github.com/TRI4CTA/booth-list-cleaner.git
cd booth-list-cleaner
pnpm install
```

`pnpm install` の後に `wxt prepare` が自動で実行され、型定義などが `.wxt/` に生成されます。

### 開発サーバーの起動

```sh
pnpm dev
```

拡張機能を読み込んだ Chrome が自動で起動します。コードを保存すると拡張機能に変更が反映されます。

### 普段使いの Chrome に読み込む場合

1. `pnpm build` を実行する（`.output/chrome-mv3/` に出力される）
2. Chrome で `chrome://extensions` を開き、右上の「デベロッパー モード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」から `.output/chrome-mv3/` を選ぶ

コードを変更したら、もう一度ビルドしてから拡張機能の再読み込みボタンを押します。

### 変更後のチェック

```sh
pnpm check
```

lint・型チェック・テスト・ビルドをまとめて実行します。
