#!/usr/bin/env node

/**
 * Country Data Generator
 * REST Countries APIから国データを取得して静的JSONファイルを生成
 * 開発時に一度だけ実行するスクリプト
 */

const fs = require('fs').promises;
const path = require('path');

// API設定
const API_BASE_URL = 'https://restcountries.com/v3.1';
const OUTPUT_FILE = path.join(__dirname, '..', 'countries.json');

// 難易度設定（requirements.mdとdesign.mdに基づく）
const DIFFICULTY_CONFIG = {
    beginner: {
        countries: 25,
        regions: ['Europe', 'Americas'],
        questionsCount: 10,
        priority: ['United States', 'Canada', 'Germany', 'France', 'United Kingdom', 'Japan', 'Australia', 'Italy', 'Spain']
    },
    intermediate: {
        countries: 60,
        regions: ['Europe', 'Asia', 'Americas', 'Oceania'],
        questionsCount: 15,
        priority: []
    },
    advanced: {
        countries: 150,
        regions: 'all',
        questionsCount: 20,
        priority: []
    }
};

/**
 * REST Countries APIから国データを取得
 * @returns {Promise<Array>} 国データの配列
 */
async function fetchCountriesFromAPI() {
    console.log('🌍 Fetching countries from REST Countries API...');
    
    // 複数のAPIエンドポイントを試行
    const apiUrls = [
        'https://restcountries.com/v3.1/all',
        'https://restcountries.com/v3/all',
        'https://restcountries.com/v2/all'
    ];
    
    // Node.js環境でfetchを使用するため、動的インポート
    const fetch = (await import('node-fetch')).default;
    
    for (const apiUrl of apiUrls) {
        try {
            console.log(`🔄 Trying: ${apiUrl}`);
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                console.warn(`⚠️  ${apiUrl} returned status: ${response.status}`);
                continue;
            }
            
            const countries = await response.json();
            console.log(`✅ Fetched ${countries.length} countries from ${apiUrl}`);
            
            // v2 APIの場合はデータ構造を正規化
            const normalizedCountries = apiUrl.includes('/v2/') 
                ? normalizeV2Data(countries) 
                : countries;
            
            // データの検証とクリーニング
            const validCountries = normalizedCountries.filter(country => 
                country.flags && 
                country.flags.png && 
                country.name && 
                country.name.common &&
                country.cca2
            );
            
            console.log(`✅ ${validCountries.length} countries passed validation`);
            return validCountries;
            
        } catch (error) {
            console.warn(`⚠️  Failed to fetch from ${apiUrl}:`, error.message);
            continue;
        }
    }
    
    // 全てのAPIが失敗した場合、埋め込みデータを使用
    console.log('⚠️  All APIs failed, using embedded fallback data...');
    return getEmbeddedCountryData();
}

/**
 * v2 APIのデータをv3形式に正規化
 * @param {Array} v2Countries - v2 APIのデータ
 * @returns {Array} 正規化されたデータ
 */
function normalizeV2Data(v2Countries) {
    return v2Countries.map(country => ({
        name: {
            common: country.name,
            official: country.name
        },
        cca2: country.alpha2Code,
        cca3: country.alpha3Code,
        flag: country.flag || '🏳️',
        flags: {
            png: `https://flagcdn.com/w320/${country.alpha2Code?.toLowerCase()}.png`,
            svg: `https://flagcdn.com/${country.alpha2Code?.toLowerCase()}.svg`
        },
        capital: Array.isArray(country.capital) ? country.capital : [country.capital],
        region: country.region,
        subregion: country.subregion,
        latlng: country.latlng || [0, 0],
        area: country.area || 0,
        population: country.population || 0
    }));
}

/**
 * 埋め込み国データ（API失敗時の最終手段）
 * @returns {Array} 最小限の国データ
 */
function getEmbeddedCountryData() {
    return [
        {
            name: { common: "United States", official: "United States of America" },
            cca2: "US", cca3: "USA", flag: "🇺🇸",
            flags: { png: "https://flagcdn.com/w320/us.png", svg: "https://flagcdn.com/us.svg" },
            capital: ["Washington, D.C."], region: "Americas", subregion: "North America",
            latlng: [38.0, -97.0], area: 9372610, population: 329484123
        },
        {
            name: { common: "Canada", official: "Canada" },
            cca2: "CA", cca3: "CAN", flag: "🇨🇦",
            flags: { png: "https://flagcdn.com/w320/ca.png", svg: "https://flagcdn.com/ca.svg" },
            capital: ["Ottawa"], region: "Americas", subregion: "North America",
            latlng: [60.0, -95.0], area: 9984670, population: 38005238
        },
        {
            name: { common: "Germany", official: "Federal Republic of Germany" },
            cca2: "DE", cca3: "DEU", flag: "🇩🇪",
            flags: { png: "https://flagcdn.com/w320/de.png", svg: "https://flagcdn.com/de.svg" },
            capital: ["Berlin"], region: "Europe", subregion: "Western Europe",
            latlng: [51.0, 9.0], area: 357114, population: 83240525
        },
        {
            name: { common: "France", official: "French Republic" },
            cca2: "FR", cca3: "FRA", flag: "🇫🇷",
            flags: { png: "https://flagcdn.com/w320/fr.png", svg: "https://flagcdn.com/fr.svg" },
            capital: ["Paris"], region: "Europe", subregion: "Western Europe",
            latlng: [46.0, 2.0], area: 551695, population: 67391582
        },
        {
            name: { common: "United Kingdom", official: "United Kingdom of Great Britain and Northern Ireland" },
            cca2: "GB", cca3: "GBR", flag: "🇬🇧",
            flags: { png: "https://flagcdn.com/w320/gb.png", svg: "https://flagcdn.com/gb.svg" },
            capital: ["London"], region: "Europe", subregion: "Northern Europe",
            latlng: [54.0, -2.0], area: 242495, population: 67886011
        },
        {
            name: { common: "Japan", official: "Japan" },
            cca2: "JP", cca3: "JPN", flag: "🇯🇵",
            flags: { png: "https://flagcdn.com/w320/jp.png", svg: "https://flagcdn.com/jp.svg" },
            capital: ["Tokyo"], region: "Asia", subregion: "Eastern Asia",
            latlng: [36.0, 138.0], area: 377930, population: 125836021
        },
        {
            name: { common: "Australia", official: "Commonwealth of Australia" },
            cca2: "AU", cca3: "AUS", flag: "🇦🇺",
            flags: { png: "https://flagcdn.com/w320/au.png", svg: "https://flagcdn.com/au.svg" },
            capital: ["Canberra"], region: "Oceania", subregion: "Australia and New Zealand",
            latlng: [-27.0, 133.0], area: 7692024, population: 25687041
        },
        {
            name: { common: "Brazil", official: "Federative Republic of Brazil" },
            cca2: "BR", cca3: "BRA", flag: "🇧🇷",
            flags: { png: "https://flagcdn.com/w320/br.png", svg: "https://flagcdn.com/br.svg" },
            capital: ["Brasília"], region: "Americas", subregion: "South America",
            latlng: [-10.0, -55.0], area: 8515767, population: 214326223
        },
        {
            name: { common: "China", official: "People's Republic of China" },
            cca2: "CN", cca3: "CHN", flag: "🇨🇳",
            flags: { png: "https://flagcdn.com/w320/cn.png", svg: "https://flagcdn.com/cn.svg" },
            capital: ["Beijing"], region: "Asia", subregion: "Eastern Asia",
            latlng: [35.0, 105.0], area: 9596961, population: 1402112000
        },
        {
            name: { common: "India", official: "Republic of India" },
            cca2: "IN", cca3: "IND", flag: "🇮🇳",
            flags: { png: "https://flagcdn.com/w320/in.png", svg: "https://flagcdn.com/in.svg" },
            capital: ["New Delhi"], region: "Asia", subregion: "Southern Asia",
            latlng: [20.0, 77.0], area: 3287263, population: 1380004385
        },
        {
            name: { common: "Italy", official: "Italian Republic" },
            cca2: "IT", cca3: "ITA", flag: "🇮🇹",
            flags: { png: "https://flagcdn.com/w320/it.png", svg: "https://flagcdn.com/it.svg" },
            capital: ["Rome"], region: "Europe", subregion: "Southern Europe",
            latlng: [42.83333333, 12.83333333], area: 301336, population: 59554023
        },
        {
            name: { common: "Spain", official: "Kingdom of Spain" },
            cca2: "ES", cca3: "ESP", flag: "🇪🇸",
            flags: { png: "https://flagcdn.com/w320/es.png", svg: "https://flagcdn.com/es.svg" },
            capital: ["Madrid"], region: "Europe", subregion: "Southern Europe",
            latlng: [40.0, -4.0], area: 505992, population: 47351567
        },
        {
            name: { common: "Mexico", official: "United Mexican States" },
            cca2: "MX", cca3: "MEX", flag: "🇲🇽",
            flags: { png: "https://flagcdn.com/w320/mx.png", svg: "https://flagcdn.com/mx.svg" },
            capital: ["Mexico City"], region: "Americas", subregion: "North America",
            latlng: [23.0, -102.0], area: 1964375, population: 128932753
        },
        {
            name: { common: "Russia", official: "Russian Federation" },
            cca2: "RU", cca3: "RUS", flag: "🇷🇺",
            flags: { png: "https://flagcdn.com/w320/ru.png", svg: "https://flagcdn.com/ru.svg" },
            capital: ["Moscow"], region: "Europe", subregion: "Eastern Europe",
            latlng: [60.0, 100.0], area: 17098242, population: 144104080
        },
        {
            name: { common: "South Korea", official: "Republic of Korea" },
            cca2: "KR", cca3: "KOR", flag: "🇰🇷",
            flags: { png: "https://flagcdn.com/w320/kr.png", svg: "https://flagcdn.com/kr.svg" },
            capital: ["Seoul"], region: "Asia", subregion: "Eastern Asia",
            latlng: [37.0, 127.5], area: 100210, population: 51780579
        }
    ];
}

/**
 * 難易度別に国をフィルタリング
 * @param {Array} countries - 全国データ
 * @param {string} difficulty - 難易度
 * @returns {Array} フィルタリングされた国データ
 */
function filterCountriesByDifficulty(countries, difficulty) {
    const config = DIFFICULTY_CONFIG[difficulty];
    if (!config) {
        throw new Error(`Unknown difficulty: ${difficulty}`);
    }
    
    let filtered = [...countries];
    
    // 地域でフィルタリング
    if (config.regions !== 'all') {
        filtered = filtered.filter(country => 
            config.regions.includes(country.region)
        );
        console.log(`📍 Filtered by regions ${config.regions.join(', ')}: ${filtered.length} countries`);
    }
    
    // 優先国を先頭に移動
    if (config.priority.length > 0) {
        const priorityCountries = [];
        const otherCountries = [];
        
        filtered.forEach(country => {
            if (config.priority.includes(country.name.common)) {
                priorityCountries.push(country);
            } else {
                otherCountries.push(country);
            }
        });
        
        // 人口順でソート（大きい順）
        otherCountries.sort((a, b) => (b.population || 0) - (a.population || 0));
        filtered = [...priorityCountries, ...otherCountries];
        
        console.log(`⭐ Priority countries found: ${priorityCountries.length}`);
    } else {
        // 人口順でソート（大きい順）
        filtered.sort((a, b) => (b.population || 0) - (a.population || 0));
    }
    
    // 指定数に制限
    if (config.countries < filtered.length) {
        filtered = filtered.slice(0, config.countries);
    }
    
    console.log(`🎯 Final ${difficulty} countries: ${filtered.length}`);
    return filtered;
}

/**
 * 必要なフィールドのみ抽出してデータサイズを最適化
 * @param {Array} countries - 国データ配列
 * @returns {Array} 最適化された国データ
 */
function optimizeCountryData(countries) {
    return countries.map(country => ({
        name: {
            common: country.name.common,
            official: country.name.official || country.name.common
        },
        cca2: country.cca2,
        cca3: country.cca3,
        flag: country.flag || '🏳️',
        flags: {
            png: country.flags.png,
            svg: country.flags.svg
        },
        capital: Array.isArray(country.capital) ? country.capital : [country.capital || 'Unknown'],
        region: country.region,
        subregion: country.subregion || '',
        latlng: Array.isArray(country.latlng) ? country.latlng : [0, 0],
        area: country.area || 0,
        population: country.population || 0
    }));
}

/**
 * 静的JSONファイルを生成
 * @returns {Promise<Object>} 生成されたデータ
 */
async function generateCountriesData() {
    try {
        console.log('🚀 Starting country data generation...');
        
        // APIから国データを取得
        const allCountries = await fetchCountriesFromAPI();
        
        // 難易度別にデータを生成
        const countriesData = {
            generated: new Date().toISOString(),
            version: '1.0.0',
            source: 'REST Countries API v3.1',
            description: 'Static fallback data for Flag Guessing Game',
            difficulties: {}
        };
        
        // 全ての国を統合したリストも作成
        const allFilteredCountries = new Set();
        
        for (const [difficulty, config] of Object.entries(DIFFICULTY_CONFIG)) {
            console.log(`\n📊 Processing ${difficulty} difficulty...`);
            
            const filteredCountries = filterCountriesByDifficulty(allCountries, difficulty);
            const optimizedCountries = optimizeCountryData(filteredCountries);
            
            countriesData.difficulties[difficulty] = {
                countries: optimizedCountries,
                count: optimizedCountries.length,
                questionsCount: config.questionsCount,
                regions: config.regions,
                description: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level countries`
            };
            
            // 全体リストに追加（重複除去のため）
            optimizedCountries.forEach(country => {
                allFilteredCountries.add(JSON.stringify(country));
            });
        }
        
        // 全ての国を統合したリストを作成
        const allCountriesList = Array.from(allFilteredCountries).map(countryStr => JSON.parse(countryStr));
        countriesData.allCountries = allCountriesList;
        countriesData.totalCountries = allCountriesList.length;
        
        // 出力ディレクトリを作成
        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
        
        // JSONファイルを保存
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(countriesData, null, 2), 'utf8');
        console.log(`\n💾 Countries data saved to: ${OUTPUT_FILE}`);
        
        // 統計情報を表示
        console.log('\n📈 Generation Summary:');
        console.log('='.repeat(50));
        Object.entries(countriesData.difficulties).forEach(([difficulty, data]) => {
            console.log(`${difficulty.padEnd(12)}: ${data.count.toString().padStart(3)} countries (${data.questionsCount} questions)`);
        });
        console.log('-'.repeat(50));
        console.log(`Total unique : ${countriesData.totalCountries.toString().padStart(3)} countries`);
        console.log(`File size    : ${(JSON.stringify(countriesData).length / 1024).toFixed(2)} KB`);
        console.log('='.repeat(50));
        
        return countriesData;
        
    } catch (error) {
        console.error('❌ Failed to generate countries data:', error);
        process.exit(1);
    }
}

/**
 * メイン実行関数
 */
async function main() {
    const args = process.argv.slice(2);
    
    console.log('🏁 Flag Guessing Game - Country Data Generator');
    console.log('='.repeat(50));
    
    try {
        const data = await generateCountriesData();
        
        console.log('\n✅ Generation completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Commit the generated countries.json file to your repository');
        console.log('2. Update your application to use the external JSON file');
        console.log('3. Test the application with the new data');
        
        if (args.includes('--verify')) {
            console.log('\n🔍 Verifying generated data...');
            await verifyGeneratedData(data);
        }
        
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

/**
 * 生成されたデータを検証
 * @param {Object} data - 生成されたデータ
 */
async function verifyGeneratedData(data) {
    try {
        // 基本構造の検証
        const requiredFields = ['generated', 'version', 'source', 'difficulties', 'allCountries'];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // 難易度データの検証
        const requiredDifficulties = ['beginner', 'intermediate', 'advanced'];
        for (const difficulty of requiredDifficulties) {
            if (!data.difficulties[difficulty]) {
                throw new Error(`Missing difficulty: ${difficulty}`);
            }
            
            const diffData = data.difficulties[difficulty];
            if (!diffData.countries || diffData.countries.length === 0) {
                throw new Error(`No countries for difficulty: ${difficulty}`);
            }
            
            // 各国データの検証
            diffData.countries.forEach((country, index) => {
                const requiredCountryFields = ['name', 'cca2', 'flags'];
                for (const field of requiredCountryFields) {
                    if (!country[field]) {
                        throw new Error(`Country ${index} in ${difficulty} missing field: ${field}`);
                    }
                }
            });
        }
        
        console.log('✅ Data verification passed!');
        
    } catch (error) {
        console.error('❌ Data verification failed:', error);
        throw error;
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main();
}

module.exports = {
    generateCountriesData,
    fetchCountriesFromAPI,
    filterCountriesByDifficulty,
    optimizeCountryData,
    verifyGeneratedData
};