# 技術スタック

## 開発環境
- **プラットフォーム**: Windows (win32)
- **シェル**: cmd
- **エディタ**: VS Code（推奨設定あり）
- **ブラウザ**: モダンブラウザ（Chrome、Firefox、Safari、Edge）

## ビルドシステム
- **ビルドツール**: 不要（Vanilla JavaScript使用）
- **開発サーバー**: Live Server拡張機能またはローカルHTTPサーバー
- **デプロイ**: 静的ファイルホスティング（GitHub Pages、Netlify等）

## フレームワーク・ライブラリ
- **フロントエンド**: Vanilla JavaScript (ES6+)、HTML5、CSS3
- **地図ライブラリ**: Leaflet.js v1.9.4（CDN経由）
- **データAPI**: REST Countries API (https://restcountries.com/)
- **テストフレームワーク**: カスタムHTML統合テスト
- **アイコン**: なし（シンプルなCSS実装）

## 共通コマンド

### 開発
```cmd
# ローカル開発サーバー起動（Live Server使用）
# VS Codeでindex.htmlを右クリック → "Open with Live Server"

# または、Pythonを使用してローカルサーバー起動
python -m http.server 8000

# Node.jsを使用する場合
npx http-server
```

### テスト
```cmd
# 統合テスト実行
node run_integration_tests.js

# 個別テストファイルをブラウザで開く
start test_game_functionality.html
start test_map_integration.html
start test_error_handling.html
```

### ビルド・デプロイ
```cmd
# ファイル圧縮（オプション）
# 本プロジェクトは静的ファイルのため、ビルドプロセス不要

# GitHub Pagesへのデプロイ
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## コードスタイルガイドライン

### JavaScript
- **ES6+構文**: アロー関数、const/let、テンプレートリテラル使用
- **命名規則**: camelCase（変数・関数）、PascalCase（クラス）、UPPER_SNAKE_CASE（定数）
- **JSDoc**: 全関数に詳細なドキュメント記述
- **エラーハンドリング**: try-catch文とユーザーフレンドリーなエラーメッセージ
- **非同期処理**: async/await パターン使用

### HTML
- **セマンティック**: 適切なHTML5セマンティック要素使用
- **アクセシビリティ**: ARIA属性とalt属性の適切な使用
- **構造**: 論理的な要素階層とクリーンなマークアップ

### CSS
- **命名規則**: BEM記法またはkebab-case
- **レスポンシブ**: モバイルファーストアプローチ
- **フレックスボックス**: レイアウトにFlexbox使用
- **カスタムプロパティ**: CSS変数で色とサイズ管理

## パフォーマンス最適化
- **画像プリロード**: 国旗画像の効率的な読み込み
- **メモリ管理**: 不要なイベントリスナーの適切な削除
- **API呼び出し**: 必要最小限のデータ取得とキャッシュ活用
- **DOM操作**: 効率的なDOM更新とバッチ処理

## セキュリティ考慮事項
- **XSS対策**: ユーザー入力の適切なサニタイゼーション
- **API使用**: 外部APIの適切なエラーハンドリング
- **HTTPS**: 本番環境でのHTTPS使用必須