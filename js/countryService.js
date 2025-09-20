/**
 * Country Data Service
 * Handles fetching country data from REST Countries API
 * Manages caching and difficulty-based filtering
 */

// API Configuration
const API_BASE_URL = 'https://restcountries.com/v3.1';
const CACHE_KEY = 'flag_game_countries';
const CACHE_EXPIRY_KEY = 'flag_game_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Difficulty Configuration
const DIFFICULTY_CONFIG = {
    beginner: {
        countries: 25,
        regions: ['Europe', 'Americas'],
        questionsCount: 10
    },
    intermediate: {
        countries: 60,
        regions: ['Europe', 'Asia', 'Americas', 'Oceania'],
        questionsCount: 15
    },
    advanced: {
        countries: 150,
        regions: 'all',
        questionsCount: 20
    }
};

/**
 * Fetch countries data from API or cache
 * @returns {Promise<Array>} Array of country objects
 */
async function fetchCountries() {
    try {
        // Check if we have valid cached data first
        if (isCacheValid()) {
            const cachedData = loadFromCache();
            if (cachedData && cachedData.length > 0) {
                console.log('Using cached countries data');
                return cachedData;
            }
        }

        // Try embedded fallback data first for faster loading
        const fallbackData = getEmbeddedFallbackData();
        if (fallbackData && fallbackData.length > 0) {
            console.log('Using embedded fallback data for immediate availability');
            saveToCache(fallbackData);
            return fallbackData;
        }

        console.log('Fetching countries from API...');
        
        // Try primary API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
            const response = await fetch(`${API_BASE_URL}/all?fields=name,cca2,cca3,flag,flags,capital,region,subregion,latlng,area,population`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const countries = await response.json();
            
            // Filter out countries without flags or essential data
            const validCountries = countries.filter(country => 
                country.flags && 
                country.flags.png && 
                country.name && 
                country.name.common &&
                country.cca2
            );

            // Save to cache
            saveToCache(validCountries);
            
            console.log(`Fetched ${validCountries.length} countries from API`);
            return validCountries;
            
        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            // If primary API fails, try fallback sources
            console.warn('Primary API failed, trying fallback sources:', fetchError.message);
            
            // Try alternative API endpoints
            const fallbackSources = [
                'https://restcountries.com/v3.1/all',
                'https://restcountries.com/v2/all?fields=name;alpha2Code;alpha3Code;flag;capital;region;subregion;latlng;area;population'
            ];
            
            for (const fallbackUrl of fallbackSources) {
                try {
                    console.log(`Trying fallback API: ${fallbackUrl}`);
                    const fallbackController = new AbortController();
                    const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 8000);
                    
                    const fallbackResponse = await fetch(fallbackUrl, {
                        signal: fallbackController.signal
                    });
                    
                    clearTimeout(fallbackTimeoutId);
                    
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json();
                        const normalizedData = normalizeFallbackData(fallbackData, fallbackUrl);
                        
                        if (normalizedData && normalizedData.length > 0) {
                            saveToCache(normalizedData);
                            console.log(`Successfully fetched ${normalizedData.length} countries from fallback API`);
                            return normalizedData;
                        }
                    }
                } catch (fallbackError) {
                    console.warn(`Fallback API failed: ${fallbackError.message}`);
                    continue;
                }
            }
            
            throw fetchError; // Re-throw original error if all fallbacks fail
        }

    } catch (error) {
        console.error('Error fetching countries:', error);
        
        // Try to use cached data as fallback (even expired cache)
        const cachedData = loadFromCache();
        if (cachedData && cachedData.length > 0) {
            console.log('Using cached data as fallback (may be expired)');
            return cachedData;
        }
        
        // Try to use embedded fallback data as last resort
        const fallbackData = getEmbeddedFallbackData();
        if (fallbackData && fallbackData.length > 0) {
            console.log('Using embedded fallback data as last resort');
            return fallbackData;
        }
        
        // If no fallback available, throw error
        throw new Error('Failed to fetch countries data and no fallback available');
    }
}

/**
 * Get filtered countries based on difficulty
 * @param {Array} countries - All countries data
 * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
 * @returns {Array} Filtered countries array
 */
function getCountriesByDifficulty(countries, difficulty) {
    if (!countries || countries.length === 0) {
        console.log('No countries data provided');
        return [];
    }

    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.beginner;
    console.log(`Filtering countries for ${difficulty} difficulty:`, config);
    console.log(`Total countries available:`, countries.length);
    
    let filteredCountries = [...countries];

    // Filter by regions if specified
    if (config.regions !== 'all') {
        console.log('Filtering by regions:', config.regions);
        console.log('Available regions in data:', [...new Set(countries.map(c => c.region))]);
        
        filteredCountries = filteredCountries.filter(country => 
            config.regions.includes(country.region)
        );
        console.log(`After region filtering: ${filteredCountries.length} countries`);
    }

    // Sort by population (larger countries first for beginner/intermediate)
    if (difficulty === 'beginner' || difficulty === 'intermediate') {
        filteredCountries.sort((a, b) => (b.population || 0) - (a.population || 0));
    }

    // Limit to specified number of countries
    if (config.countries < filteredCountries.length) {
        filteredCountries = filteredCountries.slice(0, config.countries);
    }

    console.log(`Final filtered countries: ${filteredCountries.length} for ${difficulty} difficulty`);
    return filteredCountries;
}

/**
 * Get a random country from the filtered list
 * @param {Array} countries - Filtered countries array
 * @returns {Object} Random country object
 */
function getRandomCountry(countries) {
    if (!countries || countries.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex];
}

/**
 * Generate wrong answer options for multiple choice
 * @param {Object} correctCountry - The correct country
 * @param {Array} allCountries - All available countries
 * @param {number} count - Number of wrong answers needed (default: 3)
 * @param {Array} usedCountries - Array of country codes to exclude (optional)
 * @returns {Array} Array of wrong answer countries
 */
function generateWrongAnswers(correctCountry, allCountries, count = 3, usedCountries = []) {
    if (!correctCountry || !allCountries || allCountries.length < count + 1) {
        return [];
    }

    // Filter out the correct country and already used countries
    const availableCountries = allCountries.filter(country => 
        country.cca2 !== correctCountry.cca2 && 
        !usedCountries.includes(country.cca2)
    );

    // If not enough unused countries, fall back to excluding only the correct country
    const countriesToUse = availableCountries.length >= count 
        ? availableCountries 
        : allCountries.filter(country => country.cca2 !== correctCountry.cca2);

    // Shuffle the array and take the required count
    const shuffled = [...countriesToUse];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
}

/**
 * Check if cached data is still valid
 * @returns {boolean} True if cache is valid
 */
function isCacheValid() {
    try {
        const expiryTime = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (!expiryTime) {
            return false;
        }

        const now = new Date().getTime();
        return now < parseInt(expiryTime);
    } catch (error) {
        console.error('Error checking cache validity:', error);
        return false;
    }
}

/**
 * Save countries data to localStorage
 * @param {Array} countries - Countries data to cache
 */
function saveToCache(countries) {
    try {
        const now = new Date().getTime();
        const expiryTime = now + CACHE_DURATION;
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(countries));
        localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
        
        console.log('Countries data saved to cache');
    } catch (error) {
        console.error('Error saving to cache:', error);
        // If localStorage is full or unavailable, continue without caching
    }
}

/**
 * Load countries data from localStorage
 * @returns {Array|null} Cached countries data or null
 */
function loadFromCache() {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (!cachedData) {
            return null;
        }

        const countries = JSON.parse(cachedData);
        return Array.isArray(countries) ? countries : null;
    } catch (error) {
        console.error('Error loading from cache:', error);
        return null;
    }
}
/**
 * Clear cached countries data
 */
function clearCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        console.log('Cache cleared');
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

/**
 * Get cache info for debugging
 * @returns {Object} Cache information
 */
function getCacheInfo() {
    try {
        const hasCache = localStorage.getItem(CACHE_KEY) !== null;
        const expiryTime = localStorage.getItem(CACHE_EXPIRY_KEY);
        const isValid = isCacheValid();
        
        return {
            hasCache,
            expiryTime: expiryTime ? new Date(parseInt(expiryTime)) : null,
            isValid,
            size: hasCache ? localStorage.getItem(CACHE_KEY).length : 0
        };
    } catch (error) {
        console.error('Error getting cache info:', error);
        return { hasCache: false, isValid: false, error: error.message };
    }
}

/**
 * Normalize data from fallback APIs to match expected format
 * @param {Array} data - Raw data from fallback API
 * @param {string} source - Source URL to determine format
 * @returns {Array} Normalized country data
 */
function normalizeFallbackData(data, source) {
    if (!Array.isArray(data)) {
        return [];
    }
    
    try {
        // Handle v2 API format
        if (source.includes('/v2/')) {
            return data.map(country => ({
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
            })).filter(country => 
                country.name?.common && 
                country.cca2 && 
                country.flags?.png
            );
        }
        
        // Handle v3 API format (should be same as primary)
        return data.filter(country => 
            country.flags && 
            country.flags.png && 
            country.name && 
            country.name.common &&
            country.cca2
        );
        
    } catch (error) {
        console.error('Error normalizing fallback data:', error);
        return [];
    }
}

/**
 * Get embedded fallback data for offline functionality
 * @returns {Array} Extended country data for basic functionality
 */
function getEmbeddedFallbackData() {
    // Extended dataset for better game experience
    return [
        // North America & Europe (Beginner level)
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
            name: { common: "Mexico", official: "United Mexican States" },
            cca2: "MX", cca3: "MEX", flag: "🇲🇽",
            flags: { png: "https://flagcdn.com/w320/mx.png", svg: "https://flagcdn.com/mx.svg" },
            capital: ["Mexico City"], region: "Americas", subregion: "North America",
            latlng: [23.0, -102.0], area: 1964375, population: 128932753
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
            name: { common: "Netherlands", official: "Kingdom of the Netherlands" },
            cca2: "NL", cca3: "NLD", flag: "🇳🇱",
            flags: { png: "https://flagcdn.com/w320/nl.png", svg: "https://flagcdn.com/nl.svg" },
            capital: ["Amsterdam"], region: "Europe", subregion: "Western Europe",
            latlng: [52.5, 5.75], area: 41850, population: 17441139
        },
        {
            name: { common: "Sweden", official: "Kingdom of Sweden" },
            cca2: "SE", cca3: "SWE", flag: "🇸🇪",
            flags: { png: "https://flagcdn.com/w320/se.png", svg: "https://flagcdn.com/se.svg" },
            capital: ["Stockholm"], region: "Europe", subregion: "Northern Europe",
            latlng: [62.0, 15.0], area: 450295, population: 10353442
        },
        // Asia (Intermediate level)
        {
            name: { common: "Japan", official: "Japan" },
            cca2: "JP", cca3: "JPN", flag: "🇯🇵",
            flags: { png: "https://flagcdn.com/w320/jp.png", svg: "https://flagcdn.com/jp.svg" },
            capital: ["Tokyo"], region: "Asia", subregion: "Eastern Asia",
            latlng: [36.0, 138.0], area: 377930, population: 125836021
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
            name: { common: "South Korea", official: "Republic of Korea" },
            cca2: "KR", cca3: "KOR", flag: "🇰🇷",
            flags: { png: "https://flagcdn.com/w320/kr.png", svg: "https://flagcdn.com/kr.svg" },
            capital: ["Seoul"], region: "Asia", subregion: "Eastern Asia",
            latlng: [37.0, 127.5], area: 100210, population: 51780579
        },
        {
            name: { common: "Thailand", official: "Kingdom of Thailand" },
            cca2: "TH", cca3: "THA", flag: "🇹🇭",
            flags: { png: "https://flagcdn.com/w320/th.png", svg: "https://flagcdn.com/th.svg" },
            capital: ["Bangkok"], region: "Asia", subregion: "South-Eastern Asia",
            latlng: [15.0, 100.0], area: 513120, population: 69799978
        },
        // South America
        {
            name: { common: "Brazil", official: "Federative Republic of Brazil" },
            cca2: "BR", cca3: "BRA", flag: "🇧🇷",
            flags: { png: "https://flagcdn.com/w320/br.png", svg: "https://flagcdn.com/br.svg" },
            capital: ["Brasília"], region: "Americas", subregion: "South America",
            latlng: [-10.0, -55.0], area: 8515767, population: 214326223
        },
        {
            name: { common: "Argentina", official: "Argentine Republic" },
            cca2: "AR", cca3: "ARG", flag: "🇦🇷",
            flags: { png: "https://flagcdn.com/w320/ar.png", svg: "https://flagcdn.com/ar.svg" },
            capital: ["Buenos Aires"], region: "Americas", subregion: "South America",
            latlng: [-34.0, -64.0], area: 2780400, population: 45376763
        },
        // Oceania
        {
            name: { common: "Australia", official: "Commonwealth of Australia" },
            cca2: "AU", cca3: "AUS", flag: "🇦🇺",
            flags: { png: "https://flagcdn.com/w320/au.png", svg: "https://flagcdn.com/au.svg" },
            capital: ["Canberra"], region: "Oceania", subregion: "Australia and New Zealand",
            latlng: [-27.0, 133.0], area: 7692024, population: 25687041
        },
        // Africa (Advanced level)
        {
            name: { common: "South Africa", official: "Republic of South Africa" },
            cca2: "ZA", cca3: "ZAF", flag: "🇿🇦",
            flags: { png: "https://flagcdn.com/w320/za.png", svg: "https://flagcdn.com/za.svg" },
            capital: ["Cape Town", "Pretoria", "Bloemfontein"], region: "Africa", subregion: "Southern Africa",
            latlng: [-29.0, 24.0], area: 1221037, population: 59308690
        },
        {
            name: { common: "Egypt", official: "Arab Republic of Egypt" },
            cca2: "EG", cca3: "EGY", flag: "🇪🇬",
            flags: { png: "https://flagcdn.com/w320/eg.png", svg: "https://flagcdn.com/eg.svg" },
            capital: ["Cairo"], region: "Africa", subregion: "Northern Africa",
            latlng: [27.0, 30.0], area: 1002450, population: 102334403
        },
        // Additional European countries
        {
            name: { common: "Russia", official: "Russian Federation" },
            cca2: "RU", cca3: "RUS", flag: "🇷🇺",
            flags: { png: "https://flagcdn.com/w320/ru.png", svg: "https://flagcdn.com/ru.svg" },
            capital: ["Moscow"], region: "Europe", subregion: "Eastern Europe",
            latlng: [60.0, 100.0], area: 17098242, population: 144104080
        },
        {
            name: { common: "Norway", official: "Kingdom of Norway" },
            cca2: "NO", cca3: "NOR", flag: "🇳🇴",
            flags: { png: "https://flagcdn.com/w320/no.png", svg: "https://flagcdn.com/no.svg" },
            capital: ["Oslo"], region: "Europe", subregion: "Northern Europe",
            latlng: [62.0, 10.0], area: 323802, population: 5379475
        },
        {
            name: { common: "Switzerland", official: "Swiss Confederation" },
            cca2: "CH", cca3: "CHE", flag: "🇨🇭",
            flags: { png: "https://flagcdn.com/w320/ch.png", svg: "https://flagcdn.com/ch.svg" },
            capital: ["Bern"], region: "Europe", subregion: "Western Europe",
            latlng: [47.0, 8.0], area: 41285, population: 8636896
        },
        {
            name: { common: "Poland", official: "Republic of Poland" },
            cca2: "PL", cca3: "POL", flag: "🇵🇱",
            flags: { png: "https://flagcdn.com/w320/pl.png", svg: "https://flagcdn.com/pl.svg" },
            capital: ["Warsaw"], region: "Europe", subregion: "Central Europe",
            latlng: [52.0, 20.0], area: 312679, population: 37950802
        },
        {
            name: { common: "Turkey", official: "Republic of Turkey" },
            cca2: "TR", cca3: "TUR", flag: "🇹🇷",
            flags: { png: "https://flagcdn.com/w320/tr.png", svg: "https://flagcdn.com/tr.svg" },
            capital: ["Ankara"], region: "Asia", subregion: "Western Asia",
            latlng: [39.0, 35.0], area: 783562, population: 84339067
        }
    ];
}

/**
 * Check network connectivity
 * @returns {Promise<boolean>} True if network is available
 */
async function checkNetworkConnectivity() {
    try {
        // Try to fetch a small resource to test connectivity
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('https://httpbin.org/status/200', {
            method: 'HEAD',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
        
    } catch (error) {
        console.log('Network connectivity check failed:', error.message);
        return false;
    }
}

/**
 * Initialize country service - can be called to preload data
 * @param {string} difficulty - Optional difficulty to preload
 * @returns {Promise<Array>} Countries data
 */
async function initializeCountryService(difficulty = 'beginner') {
    try {
        console.log('Initializing country service...');
        
        // Check network connectivity first
        const isOnline = await checkNetworkConnectivity();
        if (!isOnline) {
            console.warn('Network connectivity limited, using cached/fallback data');
        }
        
        const allCountries = await fetchCountries();
        const filteredCountries = getCountriesByDifficulty(allCountries, difficulty);
        console.log(`Country service initialized with ${filteredCountries.length} countries for ${difficulty} difficulty`);
        
        // Preload flag images for better performance
        if (typeof preloadFlagImages === 'function') {
            preloadFlagImages(filteredCountries.slice(0, 10)); // Preload first 10 flags
        }
        
        return filteredCountries;
    } catch (error) {
        console.error('Failed to initialize country service:', error);
        throw error;
    }
}