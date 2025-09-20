# Country Data Generation

このフォルダーには、国旗あてゲーム用の国データを生成するスクリプトが含まれています。

## ファイル構成

```
data/
├── countries.json              # 生成された静的国データ（このファイルをコミット）
├── scripts/
│   └── generate-countries.js   # データ生成スクリプト
└── README.md                   # このファイル
```

## データ生成方法

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 国データの生成

```bash
# 基本的な生成
npm run generate-countries

# 検証付きで生成
npm run generate-countries-verify
```

### 3. 生成されるデータ

スクリプトは以下の構造でJSONファイルを生成します：

```json
{
  "generated": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "source": "REST Countries API v3.1",
  "description": "Static fallback data for Flag Guessing Game",
  "difficulties": {
    "beginner": {
      "countries": [...],
      "count": 25,
      "questionsCount": 10,
      "regions": ["Europe", "Americas"]
    },
    "intermediate": {
      "countries": [...],
      "count": 60,
      "questionsCount": 15,
      "regions": ["Europe", "Asia", "Americas", "Oceania"]
    },
    "advanced": {
      "countries": [...],
      "count": 150,
      "questionsCount": 20,
      "regions": "all"
    }
  },
  "allCountries": [...],
  "totalCountries": 150
}
```

## 難易度設定

### 初級 (Beginner)
- **国数**: 25カ国
- **問題数**: 10問
- **地域**: ヨーロッパ、南北アメリカ
- **優先国**: アメリカ、カナダ、ドイツ、フランス、イギリス、日本、オーストラリア、イタリア、スペイン

### 中級 (Intermediate)
- **国数**: 60カ国
- **問題数**: 15問
- **地域**: ヨーロッパ、アジア、南北アメリカ、オセアニア
- **選択基準**: 人口順

### 上級 (Advanced)
- **国数**: 150カ国
- **問題数**: 20問
- **地域**: 全世界
- **選択基準**: 人口順

## データ更新のタイミング

このスクリプトは開発時に一度だけ実行することを想定しています：

- **新しい国が追加された場合**
- **国旗のURLが変更された場合**
- **難易度設定を変更したい場合**
- **データソースを更新したい場合**

## トラブルシューティング

### ネットワークエラー
```bash
❌ Failed to fetch from API: fetch failed
```
- インターネット接続を確認してください
- REST Countries APIが利用可能か確認してください

### Node.jsバージョンエラー
```bash
Error: node-fetch requires Node.js 14 or higher
```
- Node.js 14以上をインストールしてください

### 権限エラー
```bash
Error: EACCES: permission denied
```
- ファイルの書き込み権限を確認してください
- `sudo`を使用しないでください（推奨されません）

## 生成されたファイルについて

- `countries.json`ファイルは**必ずリポジトリにコミット**してください
- このファイルは本番環境で静的ファイルとして使用されます
- ファイルサイズは通常50-100KB程度です
- 自動更新は行われません（手動で再生成が必要）