#!/usr/bin/env node

/**
 * Fallback Data Generator
 * REST Countries APIから国データを取得してフォールバックJSONファイルを生成
 */

const fs = require('fs').promises;
const path = require('path');

// API設定
const API_BASE_URL = 'https://restcountries.com/v3.1';
const OUTPUT_DIR = path.join(__dirname, '..');
const FALLBACK_FILE = path.join(OUTPUT_DIR, 'fallback-countries.json');
const MINIMAL_FILE = path.join(OUTPUT_DIR, 'minimal-countries.json');

// 難易度設定
const DIFFICULTY_CONFIG = {
    beginner: {
        countries: 25,
        regions: ['Europe', 'Americas'],
        priority: ['United States', 'Canada', 'Germany', 'France', 'United Kingdom', 'Japan', 'Australia']
    },
    intermediate: {
        countries: 60,
        regions: ['Europe', 'Asia', 'Americas', 'Oceania'],
        priority: []
    },
    advanced: {
        countries: 150,
        regions: 'all',
        priority: []
    }
};

/**
 * REST Countries APIから国データを取得
 */
async function fetchCountriesFromAPI() {
    console.log('Fetching countries from REST Countries API...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/all?fields=name,cca2,cca3,flag,flags,capital,region,subregion,latlng,area,population`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const countries = await response.json();
        console.log(`Fetched ${countries.length} countries from API`);
        
        // データの検証とクリーニング
        const validCountries = countries.filter(country => 
            country.flags && 
            country.flags.png && 
            country.name && 
            country.name.common &&
            country.cca2
        );
        
        console.log(`${validCountries.length} countries passed validation`);
        return validCountries;
        
    } catch (error) {
        console.error('Failed to fetch from API:', error.message);
        throw error;
    }
}

/**
 * 難易度別に国をフィルタリング
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
        
        // 人口順でソート
        otherCountries.sort((a, b) => (b.population || 0) - (a.population || 0));
        filtered = [...priorityCountries, ...otherCountries];
    } else {
        // 人口順でソート
        filtered.sort((a, b) => (b.population || 0) - (a.population || 0));
    }
    
    // 指定数に制限
    if (config.countries < filtered.length) {
        filtered = filtered.slice(0, config.countries);
    }
    
    console.log(`Filtered to ${filtered.length} countries for ${difficulty} difficulty`);
    return filtered;
}

/**
 * 必要なフィールドのみ抽出してデータサイズを最適化
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
 * フォールバックデータファイルを生成
 */
async function generateFallbackData() {
    try {
        console.log('Starting fallback data generation...');
        
        // APIから国データを取得
        const allCountries = await fetchCountriesFromAPI();
        
        // 難易度別にデータを生成
        const fallbackData = {
            generated: new Date().toISOString(),
            version: '1.0.0',
            source: 'REST Countries API v3.1',
            difficulties: {}
        };
        
        for (const [difficulty, config] of Object.entries(DIFFICULTY_CONFIG)) {
            console.log(`Processing ${difficulty} difficulty...`);
            
            const filteredCountries = filterCountriesByDifficulty(allCountries, difficulty);
            const optimizedCountries = optimizeCountryData(filteredCountries);
            
            fallbackData.difficulties[difficulty] = {
                countries: optimizedCountries,
                count: optimizedCountries.length,
                questionsCount: config.questionsCount || 10,
                regions: config.regions
            };
        }
        
        // フォールバックファイルを保存
        await fs.writeFile(FALLBACK_FILE, JSON.stringify(fallbackData, null, 2), 'utf8');
        console.log(`Fallback data saved to: ${FALLBACK_FILE}`);
        
        // 最小限データファイルも生成（初級の最初の10カ国）
        const minimalData = {
            generated: new Date().toISOString(),
            version: '1.0.0',
            countries: fallbackData.difficulties.beginner.countries.slice(0, 10)
        };
        
        await fs.writeFile(MINIMAL_FILE, JSON.stringify(minimalData, null, 2), 'utf8');
        console.log(`Minimal data saved to: ${MINIMAL_FILE}`);
        
        // 統計情報を表示
        console.log('\n=== Generation Summary ===');
        Object.entries(fallbackData.difficulties).forEach(([difficulty, data]) => {
            console.log(`${difficulty}: ${data.count} countries`);
        });
        console.log(`Total file size: ${(JSON.stringify(fallbackData).length / 1024).toFixed(2)} KB`);
        
        return fallbackData;
        
    } catch (error) {
        console.error('Failed to generate fallback data:', error);
        process.exit(1);
    }
}

/**
 * ファイルが古いかチェック
 */
async function isFileOld(filePath, maxAgeHours = 168) { // 7日 = 168時間
    try {
        const stats = await fs.stat(filePath);
        const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        return ageHours > maxAgeHours;
    } catch (error) {
        // ファイルが存在しない場合は古いとみなす
        return true;
    }
}

/**
 * メイン実行関数
 */
async function main() {
    const args = process.argv.slice(2);
    const forceUpdate = args.includes('--force') || args.includes('-f');
    
    try {
        // 出力ディレクトリを作成
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        
        if (forceUpdate) {
            console.log('Force update requested, generating new data...');
            await generateFallbackData();
        } else {
            const isOld = await isFileOld(FALLBACK_FILE);
            if (isOld) {
                console.log('Fallback data is old or missing, generating new data...');
                await generateFallbackData();
            } else {
                console.log('Fallback data is up to date, skipping generation.');
                console.log('Use --force flag to force regeneration.');
            }
        }
        
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main();
}

module.exports = {
    generateFallbackData,
    fetchCountriesFromAPI,
    filterCountriesByDifficulty,
    optimizeCountryData
};