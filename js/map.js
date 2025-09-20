/**
 * Map Management Module
 * Handles world map display and country highlighting using Leaflet.js
 */

// Map instance and configuration
let map = null;
let currentHighlight = null;

// Map configuration
const MAP_CONFIG = {
    center: [20, 0], // World center coordinates
    zoom: 2,
    minZoom: 1,
    maxZoom: 10,
    zoomControl: true,
    scrollWheelZoom: true,
    // Enhanced mobile support (Requirement 5.3)
    touchZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true,
    // Mobile-specific settings
    tap: true,
    tapTolerance: 15,
    bounceAtZoomLimits: false
};

// Tile layer configuration
const TILE_LAYER = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
};

/**
 * Initialize the world map (Requirement 2.1)
 */
function initializeMap() {
    try {
        const mapContainer = document.getElementById('world-map');
        if (!mapContainer) {
            console.error('Map container not found');
            return false;
        }

        // Initialize Leaflet map with enhanced mobile support
        map = L.map('world-map', {
            center: MAP_CONFIG.center,
            zoom: MAP_CONFIG.zoom,
            minZoom: MAP_CONFIG.minZoom,
            maxZoom: MAP_CONFIG.maxZoom,
            zoomControl: MAP_CONFIG.zoomControl,
            scrollWheelZoom: MAP_CONFIG.scrollWheelZoom,
            // Enhanced mobile touch support (Requirement 5.3)
            touchZoom: MAP_CONFIG.touchZoom,
            doubleClickZoom: MAP_CONFIG.doubleClickZoom,
            boxZoom: MAP_CONFIG.boxZoom,
            keyboard: MAP_CONFIG.keyboard,
            dragging: MAP_CONFIG.dragging,
            tap: MAP_CONFIG.tap,
            tapTolerance: MAP_CONFIG.tapTolerance,
            bounceAtZoomLimits: MAP_CONFIG.bounceAtZoomLimits
        });

        // Add tile layer
        L.tileLayer(TILE_LAYER.url, {
            attribution: TILE_LAYER.attribution,
            maxZoom: TILE_LAYER.maxZoom
        }).addTo(map);

        // Set up map interactions
        setupMapInteractions();

        // Enable mobile touch gestures after a short delay (Requirement 5.3)
        setTimeout(() => {
            enableMobileTouchGestures();
        }, 100);

        // Update map controls with current language mode after initialization
        setTimeout(() => {
            updateMapControlsLanguage();
        }, 200);

        console.log('Map initialized successfully');
        return true;

    } catch (error) {
        console.error('Error initializing map:', error);
        return false;
    }
}

/**
 * Show the map container
 */
function showMap() {
    const mapContainer = document.getElementById('world-map');
    if (mapContainer) {
        mapContainer.classList.remove('hidden');

        // Invalidate map size for proper display after showing
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }
}

/**
 * Hide the map container
 */
function hideMap() {
    const mapContainer = document.getElementById('world-map');
    if (mapContainer) {
        mapContainer.classList.add('hidden');
    }
}

/**
 * Highlight a country on the map with multilingual support (Requirement 2.1, 2.2, 8.8)
 * @param {string} countryCode - Country code (cca2)
 * @param {Array} coordinates - [latitude, longitude] of the country
 * @param {string} languageMode - Language mode for display
 */
function highlightCountry(countryCode, coordinates, languageMode = null) {
    if (!map || !coordinates || coordinates.length < 2) {
        console.error('Map not initialized or invalid coordinates');
        return;
    }

    try {
        // Clear previous highlight
        clearHighlight();

        // Show map if hidden
        showMap();

        const [lat, lng] = coordinates;

        // Get current language mode from game state if not provided
        const currentLanguageMode = languageMode || (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');

        // Create custom marker for country highlighting with multilingual support (Requirement 8.8)
        const marker = createCountryMarker([lat, lng], gameState.currentCountry, currentLanguageMode);

        if (marker) {
            marker.addTo(map);
            currentHighlight = marker;

            // Zoom to country with smooth animation
            map.setView([lat, lng], 4, {
                animate: true,
                duration: 1.5
            });

            // Get country name in selected language for logging (Requirement 8.8)
            const countryName = (typeof getCountryName === 'function')
                ? getCountryName(gameState.currentCountry, currentLanguageMode)
                : (gameState.currentCountry?.name?.common || countryCode);

            console.log(`Country highlighted: ${countryName} (${countryCode}) at [${lat}, ${lng}] in ${currentLanguageMode} mode`);
        }

    } catch (error) {
        console.error('Error highlighting country:', error);
    }
}

/**
 * Clear current country highlight
 */
function clearHighlight() {
    if (currentHighlight && map) {
        map.removeLayer(currentHighlight);
        currentHighlight = null;
    }
}

/**
 * Show country information popup with multilingual support (Requirement 2.2, 8.7, 8.10, 8.11)
 * @param {Object} country - Country data object
 * @param {Array} coordinates - [latitude, longitude]
 * @param {string} languageMode - Language mode for display
 */
function showCountryInfo(country, coordinates, languageMode = null) {
    if (!country || !coordinates || coordinates.length < 2) {
        console.error('Invalid country data or coordinates');
        return;
    }

    const [lat, lng] = coordinates;

    // Get current language mode from game state if not provided
    const currentLanguageMode = languageMode || (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');

    // Create popup content with multilingual country information (Requirement 8.7, 8.10, 8.11)
    const popupContent = createCountryInfoPopup(country, currentLanguageMode);

    // Create and show popup
    const popup = L.popup({
        maxWidth: 300,
        className: 'country-info-popup'
    })
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);

    return popup;
}

/**
 * Reset map to initial view
 */
function resetMapView() {
    if (!map) {
        return;
    }

    try {
        // Clear all highlights and popups
        clearHighlight();
        map.closePopup();

        // Reset to world view
        map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom, {
            animate: true,
            duration: 1
        });

        console.log('Map view reset to initial state');

    } catch (error) {
        console.error('Error resetting map view:', error);
    }
}

/**
 * Handle map click events with multilingual support (Requirement 2.4, 8.9)
 * @param {Object} event - Leaflet map click event
 */
async function handleMapClick(event) {
    const { lat, lng } = event.latlng;

    console.log(`Map clicked at: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);

    // Get current language mode from game state
    const currentLanguageMode = (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');

    // Try to find country information based on coordinates
    const countryInfo = await findCountryByCoordinates(lat, lng);

    if (countryInfo) {
        // Show country information popup with multilingual support (Requirement 8.9)
        const popupContent = createCountryInfoPopup(countryInfo, currentLanguageMode);
        L.popup({
            maxWidth: 300,
            className: 'country-info-popup'
        })
            .setLatLng(event.latlng)
            .setContent(popupContent)
            .openOn(map);
    } else {
        // Show coordinates if no country found - localize the label (Requirement 8.9)
        const labels = getLocalizedLabels(currentLanguageMode);
        L.popup()
            .setLatLng(event.latlng)
            .setContent(`${labels.coordinates}: ${lat.toFixed(2)}, ${lng.toFixed(2)}`)
            .openOn(map);
    }
}

/**
 * Add interactive features to the map (Requirement 2.3, 2.4)
 */
function setupMapInteractions() {
    if (!map) {
        return;
    }

    try {
        // Add click event listener for country information
        map.on('click', handleMapClick);

        // Enhanced zoom controls (Requirement 2.3)
        map.on('zoomstart', () => {
            console.log('Zoom started');
        });

        map.on('zoomend', () => {
            const zoomLevel = map.getZoom();
            console.log(`Map zoom level: ${zoomLevel}`);

            // Adjust marker sizes based on zoom level
            adjustMarkersForZoom(zoomLevel);
        });

        // Enhanced pan controls (Requirement 2.3)
        map.on('movestart', () => {
            console.log('Pan started');
        });

        map.on('moveend', () => {
            const center = map.getCenter();
            console.log(`Map center: [${center.lat.toFixed(2)}, ${center.lng.toFixed(2)}]`);
        });

        // Mobile touch gesture support (Requirement 5.3)
        map.on('touchstart', () => {
            console.log('Touch started');
        });

        map.on('touchend', () => {
            console.log('Touch ended');
        });

        // Double tap zoom for mobile
        map.on('dblclick', (e) => {
            const currentZoom = map.getZoom();
            const newZoom = Math.min(currentZoom + 2, MAP_CONFIG.maxZoom);
            map.setZoomAround(e.latlng, newZoom);
        });

        // Add custom zoom controls
        addCustomZoomControls();

        // Add pan controls for better UX
        addCustomPanControls();

        console.log('Enhanced map interactions set up successfully');

    } catch (error) {
        console.error('Error setting up map interactions:', error);
    }
}

/**
 * Resize map to fit container (Requirement 5.3)
 */
function resizeMap() {
    if (map) {
        try {
            // Invalidate map size for responsive design
            map.invalidateSize();
            console.log('Map resized successfully');
        } catch (error) {
            console.error('Error resizing map:', error);
        }
    }
}

/**
 * Handle orientation change for mobile devices (Requirement 5.3)
 */
function handleOrientationChange() {
    // Wait for orientation change to complete
    setTimeout(() => {
        resizeMap();
    }, 100);
}

// Add event listeners for responsive behavior
if (typeof window !== 'undefined') {
    // Handle window resize
    window.addEventListener('resize', resizeMap);

    // Handle orientation change on mobile
    window.addEventListener('orientationchange', handleOrientationChange);

    // Handle device motion for enhanced mobile experience
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            // Could be used for compass-based map rotation in the future
            console.log('Device orientation:', event.alpha, event.beta, event.gamma);
        });
    }
}

/**
 * Get country coordinates from country data
 * @param {Object} country - Country object with latlng property
 * @returns {Array|null} [latitude, longitude] or null if not available
 */
function getCountryCoordinates(country) {
    if (!country) {
        return null;
    }

    try {
        // Check for latlng property (REST Countries API format)
        if (country.latlng && Array.isArray(country.latlng) && country.latlng.length >= 2) {
            return [country.latlng[0], country.latlng[1]];
        }

        // Check for alternative coordinate formats
        if (country.coordinates && Array.isArray(country.coordinates) && country.coordinates.length >= 2) {
            return [country.coordinates[0], country.coordinates[1]];
        }

        // Check for lat/lng properties
        if (country.lat !== undefined && country.lng !== undefined) {
            return [country.lat, country.lng];
        }

        console.warn('No valid coordinates found for country:', country.name?.common || 'Unknown');
        return null;

    } catch (error) {
        console.error('Error extracting coordinates:', error);
        return null;
    }
}

/**
 * Create custom marker for country highlighting with multilingual support (Requirement 2.1, 2.2, 8.8)
 * @param {Array} coordinates - [latitude, longitude]
 * @param {Object} country - Country information
 * @param {string} languageMode - Language mode for popup content
 * @returns {Object} Leaflet marker object
 */
function createCountryMarker(coordinates, country, languageMode = null) {
    if (!coordinates || coordinates.length < 2 || !country) {
        console.error('Invalid coordinates or country data for marker');
        return null;
    }

    try {
        const [lat, lng] = coordinates;

        // Get current language mode from game state if not provided
        const currentLanguageMode = languageMode || (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');

        // Get country name in selected language for marker title (Requirement 8.8)
        const countryName = (typeof getCountryName === 'function')
            ? getCountryName(country, currentLanguageMode)
            : (country.name?.common || 'Unknown');

        // Create custom icon with country flag emoji
        const flagIcon = L.divIcon({
            html: `
                <div class="country-marker" title="${countryName}">
                    <div class="flag-emoji">${country.flag || '🏳️'}</div>
                    <div class="marker-pulse"></div>
                </div>
            `,
            className: 'custom-country-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        // Create marker with popup
        const marker = L.marker([lat, lng], { icon: flagIcon });

        // Create and bind popup with multilingual country information (Requirement 8.7, 8.8, 8.9, 8.10, 8.11)
        const popupContent = createCountryInfoPopup(country, currentLanguageMode);
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'country-info-popup'
        });

        // Auto-open popup when marker is added
        marker.on('add', () => {
            setTimeout(() => {
                marker.openPopup();
            }, 500);
        });

        return marker;

    } catch (error) {
        console.error('Error creating country marker:', error);
        return null;
    }
}

/**
 * Create country information popup content with multilingual support (Requirement 2.2, 8.7, 8.8, 8.9, 8.10, 8.11)
 * @param {Object} country - Country data object
 * @param {string} languageMode - Language mode (hiragana/japanese/english), defaults to current game language
 * @returns {string} HTML content for popup
 */
function createCountryInfoPopup(country, languageMode = null) {
    if (!country) {
        return '<div>国情報が利用できません</div>';
    }

    // Get current language mode from game state if not provided
    const currentLanguageMode = languageMode || (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');

    // Use multilingual helper functions with proper language mode (Requirements 8.7, 8.8, 8.9, 8.10, 8.11)
    const countryName = (typeof getCountryName === 'function')
        ? getCountryName(country, currentLanguageMode)
        : (country.name?.common || 'Unknown');

    const capital = (typeof getCapitalName === 'function')
        ? getCapitalName(country, currentLanguageMode)
        : (country.capital?.[0] || '不明');

    const region = (typeof getRegionName === 'function')
        ? getRegionName(country, currentLanguageMode)
        : (country.region || '不明');

    const subregion = (typeof getSubregionName === 'function')
        ? getSubregionName(country, currentLanguageMode)
        : (country.subregion || '');

    const population = country.population ? country.population.toLocaleString() : '不明';
    const area = country.area ? country.area.toLocaleString() + ' km²' : '不明';
    const flag = country.flag || '🏳️';

    // Get localized labels based on language mode (Requirement 8.11)
    const labels = getLocalizedLabels(currentLanguageMode);

    return `
        <div class="country-popup">
            <div class="country-header">
                <span class="country-flag-large">${flag}</span>
                <h3 class="country-name">${countryName}</h3>
            </div>
            <div class="country-details">
                <div class="detail-item">
                    <strong>${labels.capital}:</strong> ${capital}
                </div>
                <div class="detail-item">
                    <strong>${labels.region}:</strong> ${region}${subregion ? ` (${subregion})` : ''}
                </div>
                <div class="detail-item">
                    <strong>${labels.population}:</strong> ${population}
                </div>
                <div class="detail-item">
                    <strong>${labels.area}:</strong> ${area}
                </div>
            </div>
        </div>
    `;
}

/**
 * Find country by coordinates (Requirement 2.4)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object|null} Country object or null if not found
 */
async function findCountryByCoordinates(lat, lng) {
    try {
        // Get all countries from the country service
        const countries = await getAllCountriesForMap();

        if (!countries || countries.length === 0) {
            return null;
        }

        // Find the closest country based on coordinates
        let closestCountry = null;
        let minDistance = Infinity;

        countries.forEach(country => {
            const countryCoords = getCountryCoordinates(country);
            if (countryCoords) {
                const [countryLat, countryLng] = countryCoords;
                const distance = calculateDistance(lat, lng, countryLat, countryLng);

                // Consider countries within a reasonable distance (about 500km)
                if (distance < 500 && distance < minDistance) {
                    minDistance = distance;
                    closestCountry = country;
                }
            }
        });

        return closestCountry;

    } catch (error) {
        console.error('Error finding country by coordinates:', error);
        return null;
    }
}

/**
 * Calculate distance between two coordinates in kilometers
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Get all countries for map functionality
 * @returns {Promise<Array>} Array of country objects
 */
async function getAllCountriesForMap() {
    try {
        // Try to get from global countries array first
        if (window.allCountries && window.allCountries.length > 0) {
            return Promise.resolve(window.allCountries);
        }

        // Fallback to fetching countries
        if (typeof fetchCountries === 'function') {
            const countries = await fetchCountries();
            return countries || [];
        }

        return [];

    } catch (error) {
        console.error('Error getting countries for map:', error);
        return [];
    }
}

/**
 * Add custom zoom controls with multilingual support (Requirement 2.3)
 */
function addCustomZoomControls() {
    if (!map) return;

    try {
        // Get current language mode from game state
        const currentLanguageMode = (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');
        const labels = getLocalizedLabels(currentLanguageMode);

        // Create custom zoom control
        const zoomControl = L.control({ position: 'topright' });

        zoomControl.onAdd = function () {
            const div = L.DomUtil.create('div', 'custom-zoom-control');
            div.innerHTML = `
                <button class="zoom-btn zoom-in" title="${labels.zoomIn}">+</button>
                <button class="zoom-btn zoom-out" title="${labels.zoomOut}">−</button>
                <button class="zoom-btn zoom-reset" title="${labels.reset}">🌍</button>
            `;

            // Prevent map events on control
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);

            return div;
        };

        zoomControl.addTo(map);

        // Add event listeners for custom zoom buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('zoom-in')) {
                map.zoomIn();
            } else if (e.target.classList.contains('zoom-out')) {
                map.zoomOut();
            } else if (e.target.classList.contains('zoom-reset')) {
                resetMapView();
            }
        });

    } catch (error) {
        console.error('Error adding custom zoom controls:', error);
    }
}

/**
 * Add custom pan controls with multilingual support (Requirement 2.3)
 */
function addCustomPanControls() {
    if (!map) return;

    try {
        // Get current language mode from game state
        const currentLanguageMode = (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');
        const labels = getLocalizedLabels(currentLanguageMode);

        // Create custom pan control
        const panControl = L.control({ position: 'topleft' });

        panControl.onAdd = function () {
            const div = L.DomUtil.create('div', 'custom-pan-control');
            div.innerHTML = `
                <div class="pan-buttons">
                    <button class="pan-btn pan-up" title="${labels.moveUp}">↑</button>
                    <div class="pan-middle">
                        <button class="pan-btn pan-left" title="${labels.moveLeft}">←</button>
                        <button class="pan-btn pan-center" title="${labels.returnCenter}">⌂</button>
                        <button class="pan-btn pan-right" title="${labels.moveRight}">→</button>
                    </div>
                    <button class="pan-btn pan-down" title="${labels.moveDown}">↓</button>
                </div>
            `;

            // Prevent map events on control
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);

            return div;
        };

        panControl.addTo(map);

        // Add event listeners for pan buttons
        document.addEventListener('click', (e) => {
            const panDistance = 100; // pixels

            if (e.target.classList.contains('pan-up')) {
                map.panBy([0, -panDistance]);
            } else if (e.target.classList.contains('pan-down')) {
                map.panBy([0, panDistance]);
            } else if (e.target.classList.contains('pan-left')) {
                map.panBy([-panDistance, 0]);
            } else if (e.target.classList.contains('pan-right')) {
                map.panBy([panDistance, 0]);
            } else if (e.target.classList.contains('pan-center')) {
                resetMapView();
            }
        });

    } catch (error) {
        console.error('Error adding custom pan controls:', error);
    }
}

/**
 * Adjust marker sizes based on zoom level (Requirement 2.3)
 * @param {number} zoomLevel - Current zoom level
 */
function adjustMarkersForZoom(zoomLevel) {
    if (!currentHighlight) return;

    try {
        // Calculate marker size based on zoom level
        const baseSize = 40;
        const scaleFactor = Math.max(0.5, Math.min(2, zoomLevel / 5));
        const newSize = Math.round(baseSize * scaleFactor);

        // Update marker icon size
        const icon = currentHighlight.getIcon();
        if (icon && icon.options) {
            icon.options.iconSize = [newSize, newSize];
            icon.options.iconAnchor = [newSize / 2, newSize / 2];
            currentHighlight.setIcon(icon);
        }

    } catch (error) {
        console.error('Error adjusting markers for zoom:', error);
    }
}

/**
 * Enable mobile-friendly touch gestures (Requirement 5.3)
 */
function enableMobileTouchGestures() {
    if (!map) return;

    try {
        // Check if touch handlers exist before enabling them
        if (map.touchZoom && typeof map.touchZoom.enable === 'function') {
            map.touchZoom.enable();
        }

        if (map.dragging && typeof map.dragging.enable === 'function') {
            map.dragging.enable();
        }

        if (map.tap && typeof map.tap.enable === 'function') {
            map.tap.enable();
        }

        // Add mobile-specific event handlers
        let touchStartTime = 0;
        let touchStartPos = null;

        map.on('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartPos = e.latlng;
        });

        map.on('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;

            // Handle long press (> 500ms) for mobile context menu
            if (touchDuration > 500 && touchStartPos) {
                handleLongPress(touchStartPos);
            }
        });

        console.log('Mobile touch gestures enabled');

    } catch (error) {
        console.error('Error enabling mobile touch gestures:', error);
    }
}

/**
 * Get localized labels for map interface (Requirement 8.11)
 * @param {string} languageMode - Language mode (hiragana/japanese/english)
 * @returns {Object} Object with localized labels
 */
function getLocalizedLabels(languageMode) {
    const labels = {
        hiragana: {
            capital: 'しゅと',
            region: 'ちいき',
            population: 'じんこう',
            area: 'めんせき',
            coordinates: 'ざひょう',
            mapOptions: 'ちずおぷしょん',
            resetMap: 'ちずをりせっと',
            zoomIn: 'ずーむいん',
            zoomOut: 'ずーむあうと',
            reset: 'りせっと',
            moveUp: 'うえにいどう',
            moveDown: 'したにいどう',
            moveLeft: 'ひだりにいどう',
            moveRight: 'みぎにいどう',
            returnCenter: 'ちゅうおうにもどる'
        },
        japanese: {
            capital: '首都',
            region: '地域',
            population: '人口',
            area: '面積',
            coordinates: '座標',
            mapOptions: '地図オプション',
            resetMap: '地図をリセット',
            zoomIn: 'ズームイン',
            zoomOut: 'ズームアウト',
            reset: 'リセット',
            moveUp: '上に移動',
            moveDown: '下に移動',
            moveLeft: '左に移動',
            moveRight: '右に移動',
            returnCenter: '中央に戻る'
        },
        english: {
            capital: 'Capital',
            region: 'Region',
            population: 'Population',
            area: 'Area',
            coordinates: 'Coordinates',
            mapOptions: 'Map Options',
            resetMap: 'Reset Map',
            zoomIn: 'Zoom In',
            zoomOut: 'Zoom Out',
            reset: 'Reset',
            moveUp: 'Move Up',
            moveDown: 'Move Down',
            moveLeft: 'Move Left',
            moveRight: 'Move Right',
            returnCenter: 'Return to Center'
        }
    };

    return labels[languageMode] || labels.japanese;
}

/**
 * Update map controls language based on current language mode (Requirement 8.11)
 */
function updateMapControlsLanguage() {
    if (!map) return;

    try {
        // Get current language mode from game state
        const currentLanguageMode = (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');
        const labels = getLocalizedLabels(currentLanguageMode);

        // Update zoom control button titles
        const zoomButtons = document.querySelectorAll('.custom-zoom-control .zoom-btn');
        zoomButtons.forEach(btn => {
            if (btn.classList.contains('zoom-in')) {
                btn.title = labels.zoomIn;
            } else if (btn.classList.contains('zoom-out')) {
                btn.title = labels.zoomOut;
            } else if (btn.classList.contains('zoom-reset')) {
                btn.title = labels.reset;
            }
        });

        // Update pan control button titles
        const panButtons = document.querySelectorAll('.custom-pan-control .pan-btn');
        panButtons.forEach(btn => {
            if (btn.classList.contains('pan-up')) {
                btn.title = labels.moveUp;
            } else if (btn.classList.contains('pan-down')) {
                btn.title = labels.moveDown;
            } else if (btn.classList.contains('pan-left')) {
                btn.title = labels.moveLeft;
            } else if (btn.classList.contains('pan-right')) {
                btn.title = labels.moveRight;
            } else if (btn.classList.contains('pan-center')) {
                btn.title = labels.returnCenter;
            }
        });

        console.log(`Map controls language updated to: ${currentLanguageMode}`);

    } catch (error) {
        console.error('Error updating map controls language:', error);
    }
}

/**
 * Handle long press on mobile devices with multilingual support
 * @param {Object} latlng - Coordinates of long press
 */
function handleLongPress(latlng) {
    try {
        // Get current language mode from game state
        const currentLanguageMode = (typeof gameState !== 'undefined' ? gameState.languageMode : 'japanese');

        // Get localized labels for mobile context menu
        const labels = getLocalizedLabels(currentLanguageMode);

        // Show context menu or additional options on long press
        L.popup()
            .setLatLng(latlng)
            .setContent(`
                <div class="mobile-context-menu">
                    <h4>${labels.mapOptions}</h4>
                    <button onclick="resetMapView()" class="context-btn">${labels.resetMap}</button>
                    <button onclick="map.setView([${latlng.lat}, ${latlng.lng}], ${map.getZoom() + 1})" class="context-btn">${labels.zoomIn}</button>
                </div>
            `)
            .openOn(map);

    } catch (error) {
        console.error('Error handling long press:', error);
    }
}