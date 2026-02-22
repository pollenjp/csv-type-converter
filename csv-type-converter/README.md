# CSV Type Converter

CSV の各カラムに型（string / integer / float / datetime）を指定し、変換結果を CSV または TSV で出力する静的 Web アプリ。

## 機能

- 左パネルに CSV テキストを貼り付け、右パネルに変換結果を表示
- 1 行目をヘッダーとして認識し、カラムごとに型を選択可能
- 初回貼り付け時は値から型を自動推測
- CSV 内容を差し替えても、インデックスごとの型設定は保持
- 出力形式を CSV / TSV で切り替え可能
- ワンクリックでクリップボードにコピー

## セットアップ

```bash
cd csv-type-converter
npm install
```

## 開発

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

`dist/` に静的ファイルが生成される。GitHub Pages 等でそのままホスティング可能。

## mise タスク

プロジェクトルート (`~/workdir/name1`) で mise タスクを利用可能。

```bash
mise run build   # ビルド
mise run debug   # 開発サーバー起動
```

## 技術スタック

- React 19 + TypeScript
- Vite
