#!/usr/bin/env node

/**
 * Country Data Update Script
 * 定期的にフォールバックデータを更新するスクリプト
 */

const { generateFallbackData } = require('./generate-fallback.js');
const fs = require('fs').promises;
const path = require('path');

const FALLBACK_FILE = path.join(__dirname, '..', 'fallback-countries.json');
const LOG_FILE = path.join(__dirname, '..', 'update.log');

/**
 * ログメッセージを記録
 */
async function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    
    try {
        await fs.appendFile(LOG_FILE, logMessage, 'utf8');
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
}

/**
 * 現在のデータの情報を取得
 */
async function getCurrentDataInfo() {
    try {
        const data = await fs.readFile(FALLBACK_FILE, 'utf8');
        const parsed = JSON.parse(data);
        
        return {
            exists: true,
            generated: parsed.generated,
            version: parsed.version,
            countriesCount: Object.values(parsed.difficulties).reduce((sum, diff) => sum + diff.count, 0)
        };
    } catch (error) {
        return {
            exists: false,
            generated: null,
            version: null,
            countriesCount: 0
        };
    }
}

/**
 * データの更新が必要かチェック
 */
function shouldUpdate(currentInfo, maxAgeHours = 168) { // 7日
    if (!currentInfo.exists) {
        return { should: true, reason: 'No fallback data exists' };
    }
    
    if (!currentInfo.generated) {
        return { should: true, reason: 'No generation timestamp found' };
    }
    
    const ageHours = (Date.now() - new Date(currentInfo.generated).getTime()) / (1000 * 60 * 60);
    
    if (ageHours > maxAgeHours) {
        return { 
            should: true, 
            reason: `Data is ${Math.round(ageHours)} hours old (max: ${maxAgeHours})` 
        };
    }
    
    return { should: false, reason: `Data is ${Math.round(ageHours)} hours old` };
}

/**
 * 更新処理を実行
 */
async function performUpdate() {
    try {
        await log('Starting data update process...');
        
        const currentInfo = await getCurrentDataInfo();
        await log(`Current data info: ${JSON.stringify(currentInfo)}`);
        
        const updateCheck = shouldUpdate(currentInfo);
        await log(`Update check: ${updateCheck.reason}`);
        
        if (!updateCheck.should) {
            await log('Update not needed, skipping...');
            return false;
        }
        
        await log('Generating new fallback data...');
        const newData = await generateFallbackData();
        
        const newInfo = await getCurrentDataInfo();
        await log(`Update completed. New data has ${newInfo.countriesCount} countries total`);
        
        return true;
        
    } catch (error) {
        await log(`Update failed: ${error.message}`);
        throw error;
    }
}

/**
 * ヘルスチェック - データの整合性を確認
 */
async function healthCheck() {
    try {
        const currentInfo = await getCurrentDataInfo();
        
        if (!currentInfo.exists) {
            return { healthy: false, issues: ['No fallback data file exists'] };
        }
        
        const data = await fs.readFile(FALLBACK_FILE, 'utf8');
        const parsed = JSON.parse(data);
        
        const issues = [];
        
        // 必要な難易度が全て存在するかチェック
        const requiredDifficulties = ['beginner', 'intermediate', 'advanced'];
        for (const difficulty of requiredDifficulties) {
            if (!parsed.difficulties[difficulty]) {
                issues.push(`Missing difficulty: ${difficulty}`);
            } else {
                const diffData = parsed.difficulties[difficulty];
                if (!diffData.countries || diffData.countries.length === 0) {
                    issues.push(`No countries for difficulty: ${difficulty}`);
                }
                
                // 最小限の国数チェック
                const minCountries = { beginner: 10, intermediate: 20, advanced: 50 };
                if (diffData.countries.length < minCountries[difficulty]) {
                    issues.push(`Insufficient countries for ${difficulty}: ${diffData.countries.length} < ${minCountries[difficulty]}`);
                }
            }
        }
        
        // データの新しさチェック
        const ageHours = (Date.now() - new Date(parsed.generated).getTime()) / (1000 * 60 * 60);
        if (ageHours > 336) { // 14日
            issues.push(`Data is very old: ${Math.round(ageHours)} hours`);
        }
        
        return {
            healthy: issues.length === 0,
            issues: issues,
            info: currentInfo
        };
        
    } catch (error) {
        return {
            healthy: false,
            issues: [`Health check failed: ${error.message}`],
            info: null
        };
    }
}

/**
 * メイン実行関数
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'update';
    
    try {
        switch (command) {
            case 'update':
                const updated = await performUpdate();
                process.exit(updated ? 0 : 1);
                break;
                
            case 'check':
                const health = await healthCheck();
                console.log('Health Check Results:');
                console.log(`Status: ${health.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
                if (health.info) {
                    console.log(`Generated: ${health.info.generated}`);
                    console.log(`Countries: ${health.info.countriesCount}`);
                }
                if (health.issues.length > 0) {
                    console.log('Issues:');
                    health.issues.forEach(issue => console.log(`  - ${issue}`));
                }
                process.exit(health.healthy ? 0 : 1);
                break;
                
            case 'info':
                const info = await getCurrentDataInfo();
                console.log('Current Data Info:');
                console.log(JSON.stringify(info, null, 2));
                break;
                
            default:
                console.log('Usage: node update-countries.js [update|check|info]');
                console.log('  update: Update fallback data if needed (default)');
                console.log('  check:  Perform health check on current data');
                console.log('  info:   Show current data information');
                process.exit(1);
        }
        
    } catch (error) {
        await log(`Script failed: ${error.message}`);
        console.error('Script failed:', error);
        process.exit(1);
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main();
}

module.exports = {
    performUpdate,
    healthCheck,
    getCurrentDataInfo,
    shouldUpdate
};