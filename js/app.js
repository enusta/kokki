/**
 * Main Application Module
 * Initializes the application and coordinates between modules
 */

// Application state
const app = {
    initialized: false,
    currentScreen: 'start'
};

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('Initializing Flag Guessing Game...');
        
        // Initialize UI components
        if (typeof initializeUI === 'function') {
            initializeUI();
        }
        
        // Initialize map
        if (typeof initializeMap === 'function') {
            const mapInitialized = initializeMap();
            if (mapInitialized) {
                console.log('Map initialized successfully');
            } else {
                console.warn('Map initialization failed, but continuing...');
            }
        }
        
        // Set up event listeners
        setupEventListeners();
        
        app.initialized = true;
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('アプリケーションの初期化に失敗しました。ページを再読み込みしてください。');
    }
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    try {
        // Difficulty selection - both cards and buttons
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        const difficultyCards = document.querySelectorAll('.difficulty-card');
        
        // Handle difficulty button clicks
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                const difficulty = e.target.dataset.difficulty;
                if (difficulty) {
                    handleDifficultySelection(difficulty);
                }
            });
        });
        
        // Handle difficulty card clicks (for better UX)
        difficultyCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Only trigger if not clicking the button directly
                if (!e.target.classList.contains('difficulty-btn')) {
                    const difficulty = card.dataset.difficulty;
                    if (difficulty) {
                        handleDifficultySelection(difficulty);
                    }
                }
            });
        });
        
        // Answer option buttons
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                handleAnswerSelection(index);
            });
        });
        
        // Control buttons
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', handleRestart);
        }
        
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', handlePlayAgain);
        }
        
        // Add keyboard support for accessibility
        document.addEventListener('keydown', handleKeyboardInput);
        
        console.log('Event listeners set up successfully');
        
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

/**
 * Handle keyboard input for accessibility and shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardInput(event) {
    try {
        // Only handle keyboard shortcuts when not typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'r':
            case 'R':
                // R key for restart
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    handleRestart();
                }
                break;
                
            case '1':
                // Number keys for difficulty selection (only on start screen)
                if (document.getElementById('start-screen') && !document.getElementById('start-screen').classList.contains('hidden')) {
                    event.preventDefault();
                    handleDifficultySelection('beginner');
                }
                break;
                
            case '2':
                if (document.getElementById('start-screen') && !document.getElementById('start-screen').classList.contains('hidden')) {
                    event.preventDefault();
                    handleDifficultySelection('intermediate');
                }
                break;
                
            case '3':
                if (document.getElementById('start-screen') && !document.getElementById('start-screen').classList.contains('hidden')) {
                    event.preventDefault();
                    handleDifficultySelection('advanced');
                }
                break;
                
            case 'Escape':
                // Escape key to return to start screen
                if (typeof gameState !== 'undefined' && gameState.isGameActive) {
                    const confirmExit = confirm('ゲームを終了してスタート画面に戻りますか？');
                    if (confirmExit) {
                        handleRestart();
                    }
                }
                break;
        }
        
    } catch (error) {
        console.error('Error handling keyboard input:', error);
    }
}

/**
 * Handle difficulty selection (Requirement 4.1)
 * @param {string} difficulty - Selected difficulty level
 */
async function handleDifficultySelection(difficulty) {
    try {
        if (!difficulty) {
            throw new Error('No difficulty selected');
        }
        
        // Validate difficulty level
        if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
            throw new Error('Invalid difficulty level');
        }
        
        // Check if we can start a new game
        if (typeof canStartGame === 'function' && !canStartGame(difficulty)) {
            console.warn('Cannot start game with current state');
            return;
        }
        
        console.log(`Starting game with difficulty: ${difficulty}`);
        
        // Show loading with specific message
        if (typeof showLoading === 'function') {
            const difficultyNames = {
                beginner: '初級',
                intermediate: '中級', 
                advanced: '上級'
            };
            showLoading(`${difficultyNames[difficulty]}ゲームを開始しています...`);
        }
        
        // Start game with selected difficulty
        if (typeof startGame === 'function') {
            await startGame(difficulty);
        } else {
            throw new Error('startGame function not available');
        }
        
    } catch (error) {
        console.error('Failed to start game:', error);
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        
        // Show appropriate error message
        const errorMessage = error.message.includes('Invalid') 
            ? '無効な難易度が選択されました。' 
            : 'ゲームの開始に失敗しました。もう一度お試しください。';
            
        showError(errorMessage);
    }
}

/**
 * Handle answer selection
 * @param {number} optionIndex - Index of selected option
 */
function handleAnswerSelection(optionIndex) {
    try {
        // Check if game is active and not already answered
        if (typeof gameState === 'undefined' || !gameState.isGameActive || gameState.isAnswered) {
            console.log('Game not active or already answered');
            return;
        }
        
        // Process answer through game logic
        if (typeof checkAnswer === 'function') {
            checkAnswer(optionIndex);
        } else {
            console.error('checkAnswer function not available');
        }
        
    } catch (error) {
        console.error('Error handling answer selection:', error);
        handleError(error, 'AnswerSelection');
    }
}

/**
 * Handle next question button
 */
function handleNextQuestion() {
    // TODO: Clear current feedback and highlights
    // TODO: Generate next question or end game
    console.log('handleNextQuestion function - to be implemented');
}

/**
 * Handle restart button (Requirement 3.5)
 */
function handleRestart() {
    try {
        // Check if game is currently active
        const isGameActive = typeof gameState !== 'undefined' && gameState.isGameActive;
        
        if (isGameActive) {
            // Get current game status for better confirmation message
            const status = typeof getGameStatus === 'function' ? getGameStatus() : null;
            let confirmMessage = 'ゲームを中断してリスタートしますか？';
            
            if (status) {
                confirmMessage = `現在のゲーム（${status.difficultyName}、${status.currentQuestion}/${status.totalQuestions}問目）を中断してリスタートしますか？`;
            }
            
            const confirmRestart = confirm(confirmMessage);
            if (!confirmRestart) {
                return;
            }
        }
        
        console.log('Restarting game...');
        
        // Reset game and return to start screen
        if (typeof restartGame === 'function') {
            restartGame();
        } else {
            // Fallback: manually reset to start screen
            showScreen('start');
        }
        
    } catch (error) {
        console.error('Error handling restart:', error);
        handleError(error, 'Restart');
    }
}

/**
 * Handle quick restart with same difficulty
 */
function handleQuickRestart() {
    try {
        if (typeof gameState === 'undefined' || !gameState.difficulty) {
            // No current game, go to regular restart
            handleRestart();
            return;
        }
        
        const confirmMessage = `同じ難易度（${gameState.difficulty}）でもう一度プレイしますか？`;
        const confirmRestart = confirm(confirmMessage);
        
        if (!confirmRestart) {
            return;
        }
        
        console.log('Quick restarting with same difficulty...');
        
        if (typeof restartSameDifficulty === 'function') {
            restartSameDifficulty();
        } else {
            // Fallback to regular restart
            handleRestart();
        }
        
    } catch (error) {
        console.error('Error handling quick restart:', error);
        handleError(error, 'QuickRestart');
    }
}

/**
 * Handle play again button
 */
function handlePlayAgain() {
    try {
        // Reset game state and return to start screen
        if (typeof restartGame === 'function') {
            restartGame();
        }
        
    } catch (error) {
        console.error('Error handling play again:', error);
        handleError(error, 'PlayAgain');
    }
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // TODO: Adjust UI layout for new window size
    // TODO: Resize map if visible
    console.log('handleWindowResize function - to be implemented');
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    console.error('Application Error:', message);
    
    // Use UI error display if available
    if (typeof showErrorMessage === 'function') {
        showErrorMessage(message);
    } else {
        // Fallback to alert
        alert(message);
    }
}

/**
 * Handle application errors with recovery attempts
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Categorize error types and provide appropriate responses
    const errorType = categorizeError(error);
    
    switch (errorType) {
        case 'NETWORK_ERROR':
            handleNetworkError(error, context);
            break;
            
        case 'DATA_ERROR':
            handleDataError(error, context);
            break;
            
        case 'UI_ERROR':
            handleUIError(error, context);
            break;
            
        case 'GAME_STATE_ERROR':
            handleGameStateError(error, context);
            break;
            
        default:
            handleGenericError(error, context);
    }
}

/**
 * Categorize error types for appropriate handling
 * @param {Error} error - Error object
 * @returns {string} Error category
 */
function categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
        return 'NETWORK_ERROR';
    }
    
    if (message.includes('countries') || message.includes('data') || message.includes('api')) {
        return 'DATA_ERROR';
    }
    
    if (message.includes('element') || message.includes('dom') || message.includes('ui')) {
        return 'UI_ERROR';
    }
    
    if (message.includes('game') || message.includes('state') || message.includes('invalid')) {
        return 'GAME_STATE_ERROR';
    }
    
    return 'GENERIC_ERROR';
}

/**
 * Handle network-related errors
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleNetworkError(error, context) {
    console.warn(`Network error in ${context}:`, error.message);
    
    // Check if we're in offline mode
    if (!navigator.onLine) {
        showError('インターネット接続が切断されています。接続を確認してから再試行してください。');
        return;
    }
    
    // Attempt to use cached data
    if (typeof loadFromCache === 'function') {
        const cachedData = loadFromCache();
        if (cachedData && cachedData.length > 0) {
            showError('ネットワークエラーが発生しましたが、キャッシュされたデータを使用して続行します。');
            return;
        }
    }
    
    showError('ネットワークエラーが発生しました。しばらく待ってから再試行してください。');
}

/**
 * Handle data-related errors
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleDataError(error, context) {
    console.warn(`Data error in ${context}:`, error.message);
    
    // Try to recover with fallback data
    if (context === 'GameStart' || context === 'DifficultySelection') {
        showError('データの読み込みに失敗しました。基本的な国のデータで続行します。');
        
        // Attempt to start with embedded fallback data
        setTimeout(() => {
            if (typeof getEmbeddedFallbackData === 'function') {
                console.log('Attempting to use embedded fallback data');
            }
        }, 1000);
        
        return;
    }
    
    showError('データエラーが発生しました。ゲームを再開してください。');
}

/**
 * Handle UI-related errors
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleUIError(error, context) {
    console.warn(`UI error in ${context}:`, error.message);
    
    // Try to reinitialize UI elements
    if (typeof initializeUI === 'function') {
        try {
            initializeUI();
            showError('画面の表示に問題がありましたが、修復を試みました。');
            return;
        } catch (reinitError) {
            console.error('Failed to reinitialize UI:', reinitError);
        }
    }
    
    showError('画面の表示に問題があります。ページを再読み込みしてください。');
}

/**
 * Handle game state errors
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleGameStateError(error, context) {
    console.warn(`Game state error in ${context}:`, error.message);
    
    // Try to reset game state
    if (typeof resetGameState === 'function') {
        try {
            resetGameState();
            showScreen('start');
            showError('ゲーム状態にエラーが発生したため、スタート画面に戻りました。');
            return;
        } catch (resetError) {
            console.error('Failed to reset game state:', resetError);
        }
    }
    
    showError('ゲーム状態にエラーが発生しました。ページを再読み込みしてください。');
}

/**
 * Handle generic errors
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleGenericError(error, context) {
    console.error(`Generic error in ${context}:`, error);
    
    // Log error details for debugging
    logErrorDetails(error, context);
    
    showError('予期しないエラーが発生しました。ページを再読み込みしてください。');
}

/**
 * Log detailed error information for debugging
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function logErrorDetails(error, context) {
    const errorDetails = {
        message: error.message,
        stack: error.stack,
        context: context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        gameState: typeof gameState !== 'undefined' ? { ...gameState } : null
    };
    
    console.error('Detailed error information:', errorDetails);
    
    // Store error in localStorage for debugging (keep only last 5 errors)
    try {
        const storedErrors = JSON.parse(localStorage.getItem('flag_game_errors') || '[]');
        storedErrors.push(errorDetails);
        
        // Keep only last 5 errors
        if (storedErrors.length > 5) {
            storedErrors.splice(0, storedErrors.length - 5);
        }
        
        localStorage.setItem('flag_game_errors', JSON.stringify(storedErrors));
    } catch (storageError) {
        console.warn('Failed to store error details:', storageError);
    }
}

/**
 * Check if application is ready
 * @returns {boolean} True if app is initialized and ready
 */
function isAppReady() {
    return app.initialized;
}

/**
 * Get current application state
 * @returns {Object} Current app state
 */
function getAppState() {
    return { ...app };
}

// Global error handler
window.addEventListener('error', (event) => {
    handleError(event.error, 'Global');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, 'Promise');
});

/**
 * Monitor network status and handle connectivity changes
 */
function setupNetworkMonitoring() {
    // Handle online/offline events
    window.addEventListener('online', () => {
        console.log('Network connection restored');
        showError('インターネット接続が復旧しました。', 'success');
        
        // Attempt to refresh data if game is active
        if (typeof gameState !== 'undefined' && gameState.isGameActive) {
            // Optionally refresh country data
            console.log('Attempting to refresh data after reconnection');
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('Network connection lost');
        showError('インターネット接続が切断されました。キャッシュされたデータで続行します。', 'warning');
    });
    
    // Periodic connectivity check
    setInterval(async () => {
        if (navigator.onLine && typeof checkNetworkConnectivity === 'function') {
            const isConnected = await checkNetworkConnectivity();
            if (!isConnected) {
                console.warn('Network appears to be down despite navigator.onLine being true');
            }
        }
    }, 30000); // Check every 30 seconds
}

/**
 * Enhanced error display with different types
 * @param {string} message - Error message
 * @param {string} type - Error type (error, warning, success, info)
 */
function showError(message, type = 'error') {
    console.log(`Showing ${type} message:`, message);
    
    // Use UI error display if available
    if (typeof showErrorMessage === 'function') {
        showErrorMessage(message, type);
    } else {
        // Fallback to alert for critical errors
        if (type === 'error') {
            alert(message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

/**
 * Performance monitoring and optimization
 */
function setupPerformanceMonitoring() {
    // Monitor memory usage
    if (performance.memory) {
        setInterval(() => {
            const memoryInfo = performance.memory;
            const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1048576);
            const totalMB = Math.round(memoryInfo.totalJSHeapSize / 1048576);
            
            // Warn if memory usage is high
            if (usedMB > 100) {
                console.warn(`High memory usage detected: ${usedMB}MB / ${totalMB}MB`);
                
                // Attempt cleanup if available
                if (typeof clearPreloadedFlags === 'function') {
                    clearPreloadedFlags();
                    console.log('Cleared preloaded flags to free memory');
                }
            }
        }, 60000); // Check every minute
    }
    
    // Monitor page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                console.log(`Page load time: ${loadTime}ms`);
                
                if (loadTime > 3000) {
                    console.warn('Slow page load detected, consider optimizations');
                }
            }
        }, 0);
    });
}

/**
 * Cleanup resources and prevent memory leaks
 */
function cleanup() {
    // Clear any intervals or timeouts
    if (window.gameIntervals) {
        window.gameIntervals.forEach(id => clearInterval(id));
        window.gameIntervals = [];
    }
    
    if (window.gameTimeouts) {
        window.gameTimeouts.forEach(id => clearTimeout(id));
        window.gameTimeouts = [];
    }
    
    // Clear preloaded images
    if (typeof clearPreloadedFlags === 'function') {
        clearPreloadedFlags();
    }
    
    // Clear cached data if needed
    if (typeof clearCache === 'function') {
        // Only clear if cache is very old or corrupted
        const cacheInfo = typeof getCacheInfo === 'function' ? getCacheInfo() : null;
        if (cacheInfo && cacheInfo.error) {
            clearCache();
            console.log('Cleared corrupted cache');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupNetworkMonitoring();
    setupPerformanceMonitoring();
});

// Handle window resize
window.addEventListener('resize', handleWindowResize);

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);