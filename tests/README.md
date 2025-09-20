# テスト実行ガイド

## 概要

このディレクトリには国旗あてゲームの統合テストファイルが含まれています。テストは機能別に分類され、効率的なテスト実行と保守を可能にします。

## ディレクトリ構造

```
tests/
├── README.md                    # このファイル - テスト実行ガイド
├── integration/                 # 統合テスト
│   ├── core/                   # コア機能テスト
│   │   ├── game-functionality.html
│   │   ├── quiz-core.html
│   │   ├── score-management.html
│   │   └── error-handling.html
│   ├── ui/                     # UI機能テスト
│   │   ├── difficulty-selection.html
│   │   ├── ui-feedback.html
│   │   └── final-integration.html
│   ├── services/               # サービス機能テスト
│   │   └── country-service.html
│   └── map/                    # 地図機能テスト
│       ├── map-functionality.html
│       ├── map-integration.html
│       └── interactive-map.html
├── utils/                      # テストユーティリティ
│   ├── test-runner.js          # 統合テストランナー
│   └── test-helpers.js         # 共通テストヘルパー
└── reports/                    # テスト結果レポート
    └── integration-summary.md  # テスト結果サマリー
```

## テスト実行方法

### 1. 全テスト実行

```bash
# Node.jsでテストランナーを実行
node tests/utils/test-runner.js

# または、ブラウザでテストランナーを開く
# tests/utils/test-runner.js をブラウザで開く
```

### 2. カテゴリ別テスト実行

#### コア機能テスト
```bash
# ゲーム機能テスト
start tests/integration/core/game-functionality.html

# クイズコアテスト
start tests/integration/core/quiz-core.html

# スコア管理テスト
start tests/integration/core/score-management.html

# エラーハンドリングテスト
start tests/integration/core/error-handling.html
```

#### UI機能テスト
```bash
# 難易度選択テスト
start tests/integration/ui/difficulty-selection.html

# UIフィードバックテスト
start tests/integration/ui/ui-feedback.html

# 最終統合テスト
start tests/integration/ui/final-integration.html
```

#### サービス機能テスト
```bash
# 国データサービステスト
start tests/integration/services/country-service.html
```

#### 地図機能テスト
```bash
# 地図機能テスト
start tests/integration/map/map-functionality.html

# 地図統合テスト
start tests/integration/map/map-integration.html

# インタラクティブ地図テスト
start tests/integration/map/interactive-map.html
```

### 3. 個別テスト実行

各テストファイルは独立して実行可能です。ブラウザで直接開くか、Live Serverを使用してください。

## テスト結果の確認

### コンソール出力
- ✅ PASS: テスト成功
- ⚠️ WARN: 警告（機能は動作するが改善推奨）
- ❌ FAIL: テスト失敗

### レポートファイル
- `tests/reports/integration-summary.md`: 全テスト結果のサマリー
- ブラウザコンソール: 詳細なテスト実行ログ

## テスト開発ガイドライン

### 新しいテストファイルの追加

1. 適切なカテゴリディレクトリに配置
2. 命名規則に従う: `[機能名].html`
3. 共通のテストヘルパーを使用
4. テストランナーの設定を更新

### テストファイル構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[テスト名] - 国旗あてゲーム</title>
    <!-- 必要なCSS/JSファイルを相対パスで読み込み -->
    <link rel="stylesheet" href="../../../styles.css">
</head>
<body>
    <!-- テスト用UI -->
    
    <!-- アプリケーションスクリプト -->
    <script src="../../../js/app.js"></script>
    <script src="../../../js/game.js"></script>
    <!-- その他必要なスクリプト -->
    
    <!-- テストスクリプト -->
    <script src="../../utils/test-helpers.js"></script>
    <script>
        // テスト実装
    </script>
</body>
</html>
```

## トラブルシューティング

### よくある問題

1. **相対パスエラー**: ファイル移動後は相対パスを確認
2. **CORS エラー**: ローカルサーバー（Live Server等）を使用
3. **API制限**: REST Countries APIの制限に注意
4. **ブラウザキャッシュ**: 強制リロード（Ctrl+F5）を試行

### デバッグ方法

1. ブラウザの開発者ツールを使用
2. コンソールログを確認
3. ネットワークタブでAPI呼び出しを監視
4. テストヘルパーのデバッグ機能を活用

## 継続的インテグレーション

### 自動テスト実行

```bash
# 全テストを自動実行してレポート生成
node tests/utils/test-runner.js --report

# 特定カテゴリのみ実行
node tests/utils/test-runner.js --category core

# 詳細ログ付き実行
node tests/utils/test-runner.js --verbose
```

### テスト結果の評価

- **成功率 90%以上**: 本番デプロイ可能
- **成功率 80-89%**: 警告レビュー推奨
- **成功率 80%未満**: 問題修正必須

## 関連ドキュメント

- [要件仕様書](../.kiro/specs/flag-guessing-game/requirements.md)
- [設計書](../.kiro/specs/flag-guessing-game/design.md)
- [実装タスク](../.kiro/specs/flag-guessing-game/tasks.md)