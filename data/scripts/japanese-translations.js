/**
 * Japanese Translation Data
 * 国名・首都名・地域名の日本語翻訳データ
 */

const JAPANESE_TRANSLATIONS = {
    countries: {
        // 北米・ヨーロッパ（初級レベル）
        "United States": { japanese: "アメリカ合衆国", hiragana: "あめりかがっしゅうこく" },
        "Canada": { japanese: "カナダ", hiragana: "かなだ" },
        "Mexico": { japanese: "メキシコ", hiragana: "めきしこ" },
        "Germany": { japanese: "ドイツ", hiragana: "どいつ" },
        "France": { japanese: "フランス", hiragana: "ふらんす" },
        "United Kingdom": { japanese: "イギリス", hiragana: "いぎりす" },
        "Italy": { japanese: "イタリア", hiragana: "いたりあ" },
        "Spain": { japanese: "スペイン", hiragana: "すぺいん" },
        "Netherlands": { japanese: "オランダ", hiragana: "おらんだ" },
        "Sweden": { japanese: "スウェーデン", hiragana: "すうぇーでん" },
        "Norway": { japanese: "ノルウェー", hiragana: "のるうぇー" },
        "Switzerland": { japanese: "スイス", hiragana: "すいす" },
        "Belgium": { japanese: "ベルギー", hiragana: "べるぎー" },
        "Austria": { japanese: "オーストリア", hiragana: "おーすとりあ" },
        "Denmark": { japanese: "デンマーク", hiragana: "でんまーく" },
        "Finland": { japanese: "フィンランド", hiragana: "ふぃんらんど" },
        "Portugal": { japanese: "ポルトガル", hiragana: "ぽるとがる" },
        "Greece": { japanese: "ギリシャ", hiragana: "ぎりしゃ" },
        "Russia": { japanese: "ロシア", hiragana: "ろしあ" },
        "Poland": { japanese: "ポーランド", hiragana: "ぽーらんど" },
        
        // アジア（中級レベル）
        "Japan": { japanese: "日本", hiragana: "にほん" },
        "China": { japanese: "中国", hiragana: "ちゅうごく" },
        "India": { japanese: "インド", hiragana: "いんど" },
        "South Korea": { japanese: "韓国", hiragana: "かんこく" },
        "Thailand": { japanese: "タイ", hiragana: "たい" },
        "Indonesia": { japanese: "インドネシア", hiragana: "いんどねしあ" },
        "Malaysia": { japanese: "マレーシア", hiragana: "まれーしあ" },
        "Singapore": { japanese: "シンガポール", hiragana: "しんがぽーる" },
        "Philippines": { japanese: "フィリピン", hiragana: "ふぃりぴん" },
        "Vietnam": { japanese: "ベトナム", hiragana: "べとなむ" },
        "Turkey": { japanese: "トルコ", hiragana: "とるこ" },
        "Belgium": { japanese: "ベルギー", hiragana: "べるぎー" },
        "Austria": { japanese: "オーストリア", hiragana: "おーすとりあ" },
        "Denmark": { japanese: "デンマーク", hiragana: "でんまーく" },
        "Finland": { japanese: "フィンランド", hiragana: "ふぃんらんど" },
        "Portugal": { japanese: "ポルトガル", hiragana: "ぽるとがる" },
        "Greece": { japanese: "ギリシャ", hiragana: "ぎりしゃ" },
        "Indonesia": { japanese: "インドネシア", hiragana: "いんどねしあ" },
        "Philippines": { japanese: "フィリピン", hiragana: "ふぃりぴん" },
        "Vietnam": { japanese: "ベトナム", hiragana: "べとなむ" },
        
        // 南米・オセアニア・アフリカ（上級レベル）
        "Brazil": { japanese: "ブラジル", hiragana: "ぶらじる" },
        "Argentina": { japanese: "アルゼンチン", hiragana: "あるぜんちん" },
        "Australia": { japanese: "オーストラリア", hiragana: "おーすとらりあ" },
        "New Zealand": { japanese: "ニュージーランド", hiragana: "にゅーじーらんど" },
        "South Africa": { japanese: "南アフリカ", hiragana: "みなみあふりか" },
        "Egypt": { japanese: "エジプト", hiragana: "えじぷと" },
        "Nigeria": { japanese: "ナイジェリア", hiragana: "ないじぇりあ" }
    },
    
    capitals: {
        // 北米・ヨーロッパ
        "Washington, D.C.": { japanese: "ワシントンD.C.", hiragana: "わしんとんでぃーしー" },
        "Ottawa": { japanese: "オタワ", hiragana: "おたわ" },
        "Mexico City": { japanese: "メキシコシティ", hiragana: "めきしこしてぃ" },
        "Berlin": { japanese: "ベルリン", hiragana: "べるりん" },
        "Paris": { japanese: "パリ", hiragana: "ぱり" },
        "London": { japanese: "ロンドン", hiragana: "ろんどん" },
        "Rome": { japanese: "ローマ", hiragana: "ろーま" },
        "Madrid": { japanese: "マドリード", hiragana: "まどりーど" },
        "Amsterdam": { japanese: "アムステルダム", hiragana: "あむすてるだむ" },
        "Stockholm": { japanese: "ストックホルム", hiragana: "すとっくほるむ" },
        "Oslo": { japanese: "オスロ", hiragana: "おすろ" },
        "Bern": { japanese: "ベルン", hiragana: "べるん" },
        "Brussels": { japanese: "ブリュッセル", hiragana: "ぶりゅっせる" },
        "Vienna": { japanese: "ウィーン", hiragana: "うぃーん" },
        "Copenhagen": { japanese: "コペンハーゲン", hiragana: "こぺんはーげん" },
        "Helsinki": { japanese: "ヘルシンキ", hiragana: "へるしんき" },
        "Lisbon": { japanese: "リスボン", hiragana: "りすぼん" },
        "Athens": { japanese: "アテネ", hiragana: "あてね" },
        "Moscow": { japanese: "モスクワ", hiragana: "もすくわ" },
        "Warsaw": { japanese: "ワルシャワ", hiragana: "わるしゃわ" },
        
        // アジア
        "Tokyo": { japanese: "東京", hiragana: "とうきょう" },
        "Beijing": { japanese: "北京", hiragana: "ぺきん" },
        "New Delhi": { japanese: "ニューデリー", hiragana: "にゅーでりー" },
        "Seoul": { japanese: "ソウル", hiragana: "そうる" },
        "Bangkok": { japanese: "バンコク", hiragana: "ばんこく" },
        "Jakarta": { japanese: "ジャカルタ", hiragana: "じゃかるた" },
        "Kuala Lumpur": { japanese: "クアラルンプール", hiragana: "くあらるんぷーる" },
        "Singapore": { japanese: "シンガポール", hiragana: "しんがぽーる" },
        "Manila": { japanese: "マニラ", hiragana: "まにら" },
        "Hanoi": { japanese: "ハノイ", hiragana: "はのい" },
        "Ankara": { japanese: "アンカラ", hiragana: "あんから" },
        "Brussels": { japanese: "ブリュッセル", hiragana: "ぶりゅっせる" },
        "Vienna": { japanese: "ウィーン", hiragana: "うぃーん" },
        "Copenhagen": { japanese: "コペンハーゲン", hiragana: "こぺんはーげん" },
        "Helsinki": { japanese: "ヘルシンキ", hiragana: "へるしんき" },
        "Lisbon": { japanese: "リスボン", hiragana: "りすぼん" },
        "Athens": { japanese: "アテネ", hiragana: "あてね" },
        "Jakarta": { japanese: "ジャカルタ", hiragana: "じゃかるた" },
        "Manila": { japanese: "マニラ", hiragana: "まにら" },
        "Hanoi": { japanese: "ハノイ", hiragana: "はのい" },
        
        // 南米・オセアニア・アフリカ
        "Brasília": { japanese: "ブラジリア", hiragana: "ぶらじりあ" },
        "Buenos Aires": { japanese: "ブエノスアイレス", hiragana: "ぶえのすあいれす" },
        "Canberra": { japanese: "キャンベラ", hiragana: "きゃんべら" },
        "Wellington": { japanese: "ウェリントン", hiragana: "うぇりんとん" },
        "Cape Town": { japanese: "ケープタウン", hiragana: "けーぷたうん" },
        "Pretoria": { japanese: "プレトリア", hiragana: "ぷれとりあ" },
        "Bloemfontein": { japanese: "ブルームフォンテーン", hiragana: "ぶるーむふぉんてーん" },
        "Cairo": { japanese: "カイロ", hiragana: "かいろ" },
        "Abuja": { japanese: "アブジャ", hiragana: "あぶじゃ" }
    },
    
    regions: {
        "Americas": { japanese: "アメリカ大陸", hiragana: "あめりかたいりく" },
        "Europe": { japanese: "ヨーロッパ", hiragana: "よーろっぱ" },
        "Asia": { japanese: "アジア", hiragana: "あじあ" },
        "Africa": { japanese: "アフリカ", hiragana: "あふりか" },
        "Oceania": { japanese: "オセアニア", hiragana: "おせあにあ" }
    },
    
    subregions: {
        "North America": { japanese: "北アメリカ", hiragana: "きたあめりか" },
        "South America": { japanese: "南アメリカ", hiragana: "みなみあめりか" },
        "Western Europe": { japanese: "西ヨーロッパ", hiragana: "にしよーろっぱ" },
        "Northern Europe": { japanese: "北ヨーロッパ", hiragana: "きたよーろっぱ" },
        "Southern Europe": { japanese: "南ヨーロッパ", hiragana: "みなみよーろっぱ" },
        "Eastern Europe": { japanese: "東ヨーロッパ", hiragana: "ひがしよーろっぱ" },
        "Eastern Asia": { japanese: "東アジア", hiragana: "ひがしあじあ" },
        "Southern Asia": { japanese: "南アジア", hiragana: "みなみあじあ" },
        "South-Eastern Asia": { japanese: "東南アジア", hiragana: "とうなんあじあ" },
        "Western Asia": { japanese: "西アジア", hiragana: "にしあじあ" },
        "Australia and New Zealand": { japanese: "オーストラリア・ニュージーランド", hiragana: "おーすとらりあ・にゅーじーらんど" },
        "Northern Africa": { japanese: "北アフリカ", hiragana: "きたあふりか" },
        "Southern Africa": { japanese: "南アフリカ", hiragana: "みなみあふりか" },
        "Western Africa": { japanese: "西アフリカ", hiragana: "にしあふりか" },
        "Central Europe": { japanese: "中央ヨーロッパ", hiragana: "ちゅうおうよーろっぱ" }
    }
};

module.exports = JAPANESE_TRANSLATIONS;