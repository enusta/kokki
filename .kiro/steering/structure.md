# プロジェクト構造

## 現在の構成
```
.
├── .kiro/
│   ├── specs/
│   │   └── flag-guessing-game/    # 国旗あてゲームのスペック
│   └── steering/                  # AI アシスタント ガイダンス
├── .vscode/                       # VS Code 設定
│   └── settings.json
├── js/                           # JavaScript モジュール
│   ├── app.js                    # メインアプリケーション
│   ├── game.js                   # ゲームロジック
│   ├── countryService.js         # 国データ管理
│   ├── ui.js                     # UI 管理
│   └── map.js                    # 地図統合
├── test_*.html                   # 統合テストファイル
├── index.html                    # メインゲームページ
├── styles.css                    # スタイルシート
└── run_integration_tests.js      # テストランナー
```

## アーキテクチャパターン
- **モジュラー設計**: 機能別にJavaScriptファイルを分離
- **関心の分離**: UI、ゲームロジック、データ管理を独立したモジュールに分割
- **テスト駆動開発**: 各機能に対応する統合テストファイル
- **レスポンシブデザイン**: モバイルファーストアプローチ

## フォルダー規則
- `.kiro/specs/` - 機能仕様書とタスク管理
- `.kiro/steering/` - AI アシスタント用ガイダンス文書
- `.vscode/` - VS Code ワークスペース設定
- `js/` - JavaScript モジュール（ES6+）
- `test_*.html` - 統合テストファイル

## ファイル命名規則
- **JavaScript**: camelCase（例：`countryService.js`）
- **HTML**: kebab-case（例：`test-game-functionality.html`）
- **CSS**: kebab-case クラス名
- **テストファイル**: `test_[機能名].html` 形式
- **変数・関数**: camelCase（JavaScript）
- **定数**: UPPER_SNAKE_CASE

## 依存関係管理
- **外部ライブラリ**: CDN経由でLeaflet.js を読み込み
- **API**: REST Countries API を使用
- **モジュール間**: ES6 モジュールパターンで依存関係を管理
- **テスト**: 各テストファイルは独立して実行可能

## コード品質基準
- **JSDoc**: 全関数に詳細なドキュメント
- **エラーハンドリング**: 包括的なエラー処理とユーザーフィードバック
- **パフォーマンス**: 画像プリロードとメモリ効率的な実装
- **アクセシビリティ**: セマンティックHTMLとキーボードナビゲーション