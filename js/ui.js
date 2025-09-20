/**
 * UI Management Module
 * Handles all user interface updates and interactions
 */

// DOM Element References
const elements = {
    // Screens
    startScreen: null,
    gameScreen: null,
    resultScreen: null,
    
    // Game elements
    flagImage: null,
    optionButtons: null,
    scoreDisplay: null,
    questionCounter: null,
    feedbackMessage: null,
    progressFill: null,
    
    // Controls
    difficultyButtons: null,
    nextButton: null,
    restartButton: null,
    playAgainButton: null,
    
    // Loading
    loadingOverlay: null
};

/**
 * Initialize UI elements and event listeners
 */
function initializeUI() {
    // Get DOM element references
    elements.startScreen = document.getElementById('start-screen');
    elements.gameScreen = document.getElementById('game-screen');
    elements.resultScreen = document.getElementById('result-screen');
    
    elements.flagImage = document.getElementById('flag-image');
    elements.optionButtons = document.querySelectorAll('.option-btn');
    elements.scoreDisplay = document.getElementById('current-score');
    elements.questionCounter = document.getElementById('question-counter');
    elements.feedbackMessage = document.getElementById('feedback-message');
    elements.progressFill = document.getElementById('progress-fill');
    
    elements.difficultyButtons = document.querySelectorAll('.difficulty-btn');
    elements.nextButton = document.getElementById('next-btn');
    elements.restartButton = document.getElementById('restart-btn');
    elements.playAgainButton = document.getElementById('play-again-btn');
    
    elements.loadingOverlay = document.getElementById('loading-overlay');
    
    // Debug: Log element references
    console.log('UI Elements initialized:');
    console.log('- startScreen:', elements.startScreen);
    console.log('- gameScreen:', elements.gameScreen);
    console.log('- flagImage:', elements.flagImage);
    console.log('- optionButtons:', elements.optionButtons, 'length:', elements.optionButtons.length);
    console.log('- scoreDisplay:', elements.scoreDisplay);
    console.log('- loadingOverlay:', elements.loadingOverlay);
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('UI initialized successfully');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Note: Main event listeners are handled in app.js
    // This function sets up UI-specific listeners
    
    // Responsive handling
    window.addEventListener('resize', handleResize);
    
    // Add hover effects for difficulty cards
    const difficultyCards = document.querySelectorAll('.difficulty-card');
    difficultyCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    console.log('UI event listeners set up');
}

/**
 * Show loading overlay
 * @param {string} message - Loading message to display
 */
function showLoading(message = '読み込み中...') {
    if (!elements.loadingOverlay) {
        console.error('Loading overlay element not found');
        return;
    }
    
    // Update message if provided
    const messageElement = elements.loadingOverlay.querySelector('p');
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    elements.loadingOverlay.classList.remove('hidden');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    if (!elements.loadingOverlay) {
        return;
    }
    
    elements.loadingOverlay.classList.add('hidden');
}

/**
 * Switch between different screens
 * @param {string} screenName - Name of screen to show (start, game, result)
 */
function showScreen(screenName) {
    // Hide all screens first
    if (elements.startScreen) elements.startScreen.classList.add('hidden');
    if (elements.gameScreen) elements.gameScreen.classList.add('hidden');
    if (elements.resultScreen) elements.resultScreen.classList.add('hidden');
    
    // Show the requested screen
    switch (screenName) {
        case 'start':
            if (elements.startScreen) {
                elements.startScreen.classList.remove('hidden');
            }
            break;
        case 'game':
            if (elements.gameScreen) {
                elements.gameScreen.classList.remove('hidden');
            }
            break;
        case 'result':
            if (elements.resultScreen) {
                elements.resultScreen.classList.remove('hidden');
            }
            break;
        default:
            console.error('Unknown screen name:', screenName);
    }
}

/**
 * Display flag image with enhanced error handling and fallback
 * @param {string} flagUrl - URL of the flag image
 * @param {string} altText - Alt text for accessibility
 * @param {Object} country - Country object for fallback options
 */
function displayFlag(flagUrl, altText, country = null) {
    if (!elements.flagImage) {
        console.error('Flag image element not found');
        return;
    }
    
    // Show loading state
    elements.flagImage.style.opacity = '0.5';
    elements.flagImage.classList.add('loading');
    
    // Try to load the image with multiple fallback options
    loadFlagImageWithFallback(flagUrl, country)
        .then(({ src, alt }) => {
            // Image loaded successfully
            elements.flagImage.src = src;
            elements.flagImage.alt = alt || altText || '国旗';
            elements.flagImage.style.opacity = '1';
            elements.flagImage.classList.remove('loading', 'error');
            
            // Add fade-in animation
            elements.flagImage.style.transform = 'scale(0.9)';
            setTimeout(() => {
                elements.flagImage.style.transform = 'scale(1)';
            }, 100);
        })
        .catch((error) => {
            // All fallbacks failed, show error placeholder
            console.error('All flag image sources failed:', error);
            showFlagError(altText || '国旗');
        });
}

/**
 * Load flag image with multiple fallback sources
 * @param {string} primaryUrl - Primary flag image URL
 * @param {Object} country - Country object for generating fallback URLs
 * @returns {Promise<Object>} Promise resolving to {src, alt}
 */
async function loadFlagImageWithFallback(primaryUrl, country) {
    const fallbackSources = [];
    
    // Add primary URL
    if (primaryUrl) {
        fallbackSources.push(primaryUrl);
    }
    
    // Generate fallback URLs if country data is available
    if (country && country.cca2) {
        const countryCode = country.cca2.toLowerCase();
        fallbackSources.push(
            `https://flagcdn.com/w320/${countryCode}.png`,
            `https://flagcdn.com/w160/${countryCode}.png`,
            `https://flagcdn.com/${countryCode}.svg`,
            `https://flagpedia.net/data/flags/w580/${countryCode}.png`,
            `https://www.countryflags.io/${countryCode}/flat/64.png`
        );
    }
    
    // Try each source in order
    for (const url of fallbackSources) {
        try {
            const result = await loadImageWithTimeout(url, 5000);
            return { src: url, alt: country?.name?.common || 'Flag' };
        } catch (error) {
            console.warn(`Failed to load flag from ${url}:`, error.message);
            continue;
        }
    }
    
    // If all sources fail, throw error
    throw new Error('All flag image sources failed');
}

/**
 * Load image with timeout
 * @param {string} url - Image URL
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<HTMLImageElement>} Promise resolving to loaded image
 */
function loadImageWithTimeout(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        let timeoutId;
        
        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            img.onload = null;
            img.onerror = null;
        };
        
        img.onload = () => {
            cleanup();
            resolve(img);
        };
        
        img.onerror = () => {
            cleanup();
            reject(new Error(`Failed to load image: ${url}`));
        };
        
        // Set timeout
        timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error(`Image load timeout: ${url}`));
        }, timeout);
        
        // Start loading
        img.src = url;
    });
}

/**
 * Show flag loading error with styled placeholder
 * @param {string} countryName - Name of the country for the error message
 */
function showFlagError(countryName) {
    if (!elements.flagImage) return;
    
    // Create SVG placeholder with country name
    const errorSvg = `
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="200" fill="#f7fafc" stroke="#e2e8f0" stroke-width="2"/>
            <text x="150" y="90" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#718096">
                国旗を読み込めません
            </text>
            <text x="150" y="110" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#a0aec0">
                ${countryName || ''}
            </text>
            <circle cx="150" cy="130" r="20" fill="#fed7d7" stroke="#fc8181" stroke-width="2"/>
            <text x="150" y="137" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#e53e3e">!</text>
        </svg>
    `;
    
    const svgBlob = new Blob([errorSvg], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    elements.flagImage.src = svgUrl;
    elements.flagImage.alt = `国旗が読み込めませんでした: ${countryName || ''}`;
    elements.flagImage.style.opacity = '1';
    elements.flagImage.classList.remove('loading');
    elements.flagImage.classList.add('error');
    
    // Clean up blob URL after a delay
    setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
    }, 10000);
}

/**
 * Show answer options
 * @param {Array} options - Array of country names for options
 */
function showOptions(options) {
    console.log('showOptions called with:', options);
    console.log('Option buttons element:', elements.optionButtons);
    
    if (!elements.optionButtons || !options || options.length !== 4) {
        console.error('Invalid options or option buttons not found');
        console.error('elements.optionButtons:', elements.optionButtons);
        console.error('options:', options);
        return;
    }
    
    // Reset all button states first
    resetOptions();
    
    // Set text and enable buttons
    elements.optionButtons.forEach((btn, index) => {
        if (options[index]) {
            console.log(`Setting button ${index} to: ${options[index]}`);
            btn.textContent = options[index];
            btn.disabled = false;
            btn.style.opacity = '0';
            
            // Staggered animation for options
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
    
    console.log('Options set successfully');
}

/**
 * Update score display with enhanced animations (Requirement 3.3)
 * @param {number} score - Current score
 * @param {number} total - Total questions answered
 */
function updateScore(score, total) {
    if (!elements.scoreDisplay) {
        console.error('Score display element not found');
        return;
    }
    
    const previousText = elements.scoreDisplay.textContent;
    const newText = `スコア: ${score}/${total}`;
    
    // Only animate if the score actually changed
    if (previousText !== newText) {
        elements.scoreDisplay.textContent = newText;
        
        // Add animation when score increases
        if (score > 0) {
            elements.scoreDisplay.style.animation = 'scoreUpdate 0.5s ease';
            elements.scoreDisplay.style.color = '#48bb78';
            
            setTimeout(() => {
                elements.scoreDisplay.style.animation = '';
                elements.scoreDisplay.style.color = '#2d3748';
            }, 500);
        }
    }
}

/**
 * Update question counter
 * @param {number} current - Current question number
 * @param {number} total - Total number of questions
 */
function updateQuestionCounter(current, total) {
    if (!elements.questionCounter) {
        console.error('Question counter element not found');
        return;
    }
    
    elements.questionCounter.textContent = `問題: ${current}/${total}`;
}

/**
 * Update progress bar
 * @param {number} progress - Progress percentage (0-100)
 */
function updateProgress(progress) {
    if (!elements.progressFill) {
        console.error('Progress fill element not found');
        return;
    }
    
    elements.progressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
}

/**
 * Show feedback message
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {string} correctAnswer - The correct answer (for wrong answers)
 */
function showFeedback(isCorrect, correctAnswer = '') {
    if (!elements.feedbackMessage) {
        console.error('Feedback message element not found');
        return;
    }
    
    // Clear previous classes
    elements.feedbackMessage.className = 'feedback';
    
    if (isCorrect) {
        elements.feedbackMessage.classList.add('correct');
        elements.feedbackMessage.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <span style="font-size: 1.5em;">🎉</span>
                <span>正解です！</span>
            </div>
        `;
    } else {
        elements.feedbackMessage.classList.add('incorrect');
        elements.feedbackMessage.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5em;">❌</span>
                    <span>不正解です</span>
                </div>
                <div style="font-size: 0.9em; opacity: 0.8;">
                    正解: <strong>${correctAnswer}</strong>
                </div>
            </div>
        `;
    }
    
    // Show with animation
    elements.feedbackMessage.classList.remove('hidden');
    elements.feedbackMessage.style.transform = 'translateY(20px)';
    elements.feedbackMessage.style.opacity = '0';
    
    setTimeout(() => {
        elements.feedbackMessage.style.transform = 'translateY(0)';
        elements.feedbackMessage.style.opacity = '1';
    }, 50);
}

/**
 * Hide feedback message
 */
function hideFeedback() {
    if (!elements.feedbackMessage) {
        return;
    }
    
    // Hide with animation
    elements.feedbackMessage.style.transform = 'translateY(-20px)';
    elements.feedbackMessage.style.opacity = '0';
    
    setTimeout(() => {
        elements.feedbackMessage.classList.add('hidden');
        elements.feedbackMessage.style.transform = 'translateY(0)';
    }, 300);
}

/**
 * Highlight correct/incorrect options
 * @param {number} correctIndex - Index of correct option
 * @param {number} selectedIndex - Index of selected option
 */
function highlightOptions(correctIndex, selectedIndex) {
    if (!elements.optionButtons) {
        console.error('Option buttons not found');
        return;
    }
    
    // Disable all buttons to prevent further clicks
    elements.optionButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Highlight correct answer
    const correctBtn = elements.optionButtons[correctIndex];
    if (correctBtn) {
        correctBtn.classList.add('correct');
        
        // Add success animation to correct answer
        setTimeout(() => {
            correctBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                correctBtn.style.transform = 'scale(1)';
            }, 200);
        }, 100);
    }
    
    // If selected answer is wrong, highlight it as incorrect
    if (selectedIndex !== correctIndex) {
        const incorrectBtn = elements.optionButtons[selectedIndex];
        if (incorrectBtn) {
            incorrectBtn.classList.add('incorrect');
            
            // Add shake animation to incorrect answer
            setTimeout(() => {
                incorrectBtn.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    incorrectBtn.style.animation = '';
                }, 500);
            }, 100);
        }
    }
    
    // Fade out non-selected options slightly
    elements.optionButtons.forEach((btn, index) => {
        if (index !== correctIndex && index !== selectedIndex) {
            btn.style.opacity = '0.6';
        }
    });
}

/**
 * Reset option buttons to default state
 */
function resetOptions() {
    if (!elements.optionButtons) {
        return;
    }
    
    elements.optionButtons.forEach(btn => {
        // Reset classes
        btn.className = 'option-btn';
        
        // Reset styles
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(10px)';
        btn.style.animation = '';
        
        // Reset state
        btn.disabled = false;
        btn.textContent = '';
    });
}

/**
 * Show final results with comprehensive score information (Requirement 3.4)
 * @param {Object} scoreData - Score data object with detailed statistics
 */
function showFinalResults(scoreData) {
    const finalScoreElement = document.getElementById('final-score-text');
    const accuracyElement = document.getElementById('accuracy-text');
    const detailsElement = document.getElementById('score-details');
    
    if (finalScoreElement) {
        finalScoreElement.textContent = `最終スコア: ${scoreData.score}/${scoreData.total}`;
        
        // Add animation to final score
        finalScoreElement.style.transform = 'scale(0.8)';
        finalScoreElement.style.opacity = '0';
        setTimeout(() => {
            finalScoreElement.style.transform = 'scale(1)';
            finalScoreElement.style.opacity = '1';
            finalScoreElement.style.transition = 'all 0.5s ease';
        }, 100);
    }
    
    if (accuracyElement) {
        accuracyElement.textContent = `正解率: ${scoreData.accuracy}%`;
        
        // Add color based on performance
        if (scoreData.accuracy >= 80) {
            accuracyElement.style.color = '#48bb78'; // Green for excellent
            accuracyElement.innerHTML = `正解率: ${scoreData.accuracy}% 🎉 素晴らしい！`;
        } else if (scoreData.accuracy >= 60) {
            accuracyElement.style.color = '#ed8936'; // Orange for good
            accuracyElement.innerHTML = `正解率: ${scoreData.accuracy}% 👍 良い結果です！`;
        } else {
            accuracyElement.style.color = '#f56565'; // Red for needs improvement
            accuracyElement.innerHTML = `正解率: ${scoreData.accuracy}% 📚 もう少し頑張りましょう！`;
        }
        
        // Add animation to accuracy
        setTimeout(() => {
            accuracyElement.style.transform = 'scale(0.8)';
            accuracyElement.style.opacity = '0';
            setTimeout(() => {
                accuracyElement.style.transform = 'scale(1)';
                accuracyElement.style.opacity = '1';
                accuracyElement.style.transition = 'all 0.5s ease';
            }, 100);
        }, 200);
    }
    
    // Show additional score details if element exists
    if (detailsElement) {
        const correctAnswers = scoreData.score;
        const incorrectAnswers = scoreData.questionsAnswered - scoreData.score;
        
        detailsElement.innerHTML = `
            <div class="score-breakdown">
                <div class="score-item correct">
                    <span class="score-icon">✅</span>
                    <span>正解: ${correctAnswers}問</span>
                </div>
                <div class="score-item incorrect">
                    <span class="score-icon">❌</span>
                    <span>不正解: ${incorrectAnswers}問</span>
                </div>
            </div>
        `;
        
        // Add animation to details
        setTimeout(() => {
            detailsElement.style.transform = 'translateY(20px)';
            detailsElement.style.opacity = '0';
            setTimeout(() => {
                detailsElement.style.transform = 'translateY(0)';
                detailsElement.style.opacity = '1';
                detailsElement.style.transition = 'all 0.5s ease';
            }, 100);
        }, 400);
    }
}

/**
 * Show final results (legacy function for backward compatibility)
 * @param {number} score - Final score
 * @param {number} total - Total questions
 */
function showResults(score, total) {
    const scoreData = {
        score: score,
        total: total,
        accuracy: total > 0 ? Math.round((score / total) * 100) : 0,
        questionsAnswered: total
    };
    
    showFinalResults(scoreData);
}

/**
 * Show/hide control buttons
 * @param {Object} buttons - Object with button names and visibility
 */
function toggleButtons(buttons) {
    if (!buttons || typeof buttons !== 'object') {
        return;
    }
    
    Object.keys(buttons).forEach(buttonName => {
        const element = document.getElementById(buttonName);
        if (element) {
            if (buttons[buttonName]) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    });
}

/**
 * Add click animation to buttons
 * @param {HTMLElement} button - Button element to animate
 */
function animateButton(button) {
    if (!button) {
        return;
    }
    
    // Add click animation class
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);
    
    // Add ripple effect
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    
    // Ensure button has relative positioning for ripple
    const originalPosition = button.style.position;
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
        button.style.position = originalPosition;
    }, 600);
}

/**
 * Show game information in header or status area
 * @param {Object} gameInfo - Game information object
 */
function showGameInfo(gameInfo) {
    if (!gameInfo) return;
    
    // Update header with difficulty info if available
    const header = document.querySelector('.header h1');
    if (header && gameInfo.difficultyName) {
        header.textContent = `国旗あてゲーム - ${gameInfo.difficultyName}`;
    }
    
    // Add difficulty indicator to score display
    const scoreDisplay = document.querySelector('.score-display');
    if (scoreDisplay && gameInfo.difficultyName) {
        let difficultyIndicator = scoreDisplay.querySelector('.difficulty-indicator');
        if (!difficultyIndicator) {
            difficultyIndicator = document.createElement('span');
            difficultyIndicator.className = 'difficulty-indicator';
            scoreDisplay.appendChild(difficultyIndicator);
        }
        difficultyIndicator.textContent = `難易度: ${gameInfo.difficultyName}`;
    }
}

/**
 * Clear game information from UI
 */
function clearGameInfo() {
    // Reset header title
    const header = document.querySelector('.header h1');
    if (header) {
        header.textContent = '国旗あてゲーム';
    }
    
    // Remove difficulty indicator
    const difficultyIndicator = document.querySelector('.difficulty-indicator');
    if (difficultyIndicator) {
        difficultyIndicator.remove();
    }
}

/**
 * Show error message in UI with different types
 * @param {string} message - Error message to display
 * @param {string} type - Message type (error, warning, success, info)
 */
function showErrorMessage(message, type = 'error') {
    // Create or update error message element
    let errorElement = document.getElementById('error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        
        // Insert after header
        const header = document.querySelector('.header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(errorElement, header.nextSibling);
        } else {
            // Fallback: insert at top of main content
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(errorElement, mainContent.firstChild);
            }
        }
    }
    
    // Set appropriate classes based on type
    errorElement.className = `error-message ${type}`;
    
    // Choose appropriate icon based on type
    const icons = {
        error: '⚠️',
        warning: '⚡',
        success: '✅',
        info: 'ℹ️'
    };
    
    errorElement.innerHTML = `
        <div class="error-content">
            <span class="error-icon">${icons[type] || icons.error}</span>
            <span class="error-text">${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.style.display='none'" aria-label="エラーメッセージを閉じる">×</button>
        </div>
    `;
    
    errorElement.style.display = 'block';
    
    // Auto-hide timing based on type
    const autoHideDelay = {
        error: 8000,    // Errors stay longer
        warning: 6000,  // Warnings stay medium time
        success: 4000,  // Success messages shorter
        info: 5000      // Info messages medium time
    };
    
    setTimeout(() => {
        if (errorElement && errorElement.style.display !== 'none') {
            errorElement.style.display = 'none';
        }
    }, autoHideDelay[type] || 5000);
}

/**
 * Show network status indicator
 * @param {boolean} isOnline - Whether network is online
 */
function showNetworkStatus(isOnline) {
    let statusElement = document.getElementById('network-status');
    
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'network-status';
        statusElement.className = 'network-status';
        document.body.appendChild(statusElement);
    }
    
    statusElement.className = `network-status ${isOnline ? 'online' : 'offline'}`;
    statusElement.textContent = isOnline ? 'オンライン' : 'オフライン';
    statusElement.style.display = 'block';
    
    // Hide online status after a few seconds, keep offline status visible
    if (isOnline) {
        setTimeout(() => {
            if (statusElement) {
                statusElement.style.display = 'none';
            }
        }, 3000);
    }
}

/**
 * Show preload progress indicator
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Progress message
 */
function showPreloadProgress(progress, message = 'プリロード中...') {
    let progressElement = document.getElementById('preload-progress');
    
    if (!progressElement) {
        progressElement = document.createElement('div');
        progressElement.id = 'preload-progress';
        progressElement.className = 'preload-progress';
        progressElement.innerHTML = `
            <div class="preload-text">${message}</div>
            <div class="preload-bar">
                <div class="preload-fill"></div>
            </div>
            <div class="preload-percentage">0%</div>
        `;
        document.body.appendChild(progressElement);
    }
    
    const fillElement = progressElement.querySelector('.preload-fill');
    const percentageElement = progressElement.querySelector('.preload-percentage');
    const textElement = progressElement.querySelector('.preload-text');
    
    if (fillElement) {
        fillElement.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    }
    
    if (percentageElement) {
        percentageElement.textContent = `${Math.round(progress)}%`;
    }
    
    if (textElement) {
        textElement.textContent = message;
    }
    
    progressElement.style.display = 'block';
    
    // Hide when complete
    if (progress >= 100) {
        setTimeout(() => {
            if (progressElement) {
                progressElement.style.display = 'none';
            }
        }, 1000);
    }
}

/**
 * Hide preload progress indicator
 */
function hidePreloadProgress() {
    const progressElement = document.getElementById('preload-progress');
    if (progressElement) {
        progressElement.style.display = 'none';
    }
}

/**
 * Update language selection UI to show selected mode
 * @param {string} selectedLanguage - Selected language mode
 */
function updateLanguageSelection(selectedLanguage) {
    const languageCards = document.querySelectorAll('.language-card');
    
    languageCards.forEach(card => {
        const cardLanguage = card.dataset.language;
        if (cardLanguage === selectedLanguage) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
    
    console.log(`Language selection updated: ${selectedLanguage}`);
}

/**
 * Show difficulty selection section
 */
function showDifficultySelection() {
    const difficultySection = document.querySelector('.difficulty-selection');
    if (difficultySection) {
        difficultySection.classList.remove('hidden');
        
        // Smooth scroll to difficulty selection
        difficultySection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

/**
 * Hide difficulty selection section
 */
function hideDifficultySelection() {
    const difficultySection = document.querySelector('.difficulty-selection');
    if (difficultySection) {
        difficultySection.classList.add('hidden');
    }
}

/**
 * Show cache status indicator
 * @param {string} status - Cache status (fresh, stale, offline)
 * @param {string} message - Status message
 */
function showCacheStatus(status, message) {
    let cacheElement = document.getElementById('cache-status');
    
    if (!cacheElement) {
        cacheElement = document.createElement('div');
        cacheElement.id = 'cache-status';
        cacheElement.className = 'cache-status';
        document.body.appendChild(cacheElement);
    }
    
    cacheElement.className = `cache-status ${status}`;
    cacheElement.textContent = message;
    cacheElement.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (cacheElement) {
            cacheElement.style.display = 'none';
        }
    }, 3000);
}

/**
 * Handle responsive layout adjustments (Requirement 5.3)
 */
function handleResize() {
    // Adjust map size if it exists
    if (typeof resizeMap === 'function') {
        resizeMap();
    }
    
    // Adjust flag container aspect ratio on very small screens
    const flagContainer = document.querySelector('.flag-container');
    if (flagContainer && window.innerWidth < 480) {
        flagContainer.style.maxWidth = '250px';
    } else if (flagContainer) {
        flagContainer.style.maxWidth = '300px';
    }
    
    // Adjust difficulty cards layout on very small screens
    const difficultySelection = document.querySelector('.difficulty-selection');
    if (difficultySelection) {
        if (window.innerWidth < 600) {
            difficultySelection.style.gridTemplateColumns = '1fr';
        } else if (window.innerWidth < 900) {
            difficultySelection.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            difficultySelection.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }
}

/**
 * Preload flag images for better performance
 * @param {Array} countries - Array of country objects
 * @param {number} maxConcurrent - Maximum concurrent downloads
 * @returns {Promise<Object>} Promise resolving to preload results
 */
async function preloadFlagImages(countries, maxConcurrent = 3) {
    if (!countries || countries.length === 0) {
        return { success: 0, failed: 0, total: 0 };
    }
    
    console.log(`Starting preload of ${countries.length} flag images...`);
    
    let successCount = 0;
    let failedCount = 0;
    const preloadedImages = new Map();
    
    // Process countries in batches to avoid overwhelming the browser
    const batches = [];
    for (let i = 0; i < countries.length; i += maxConcurrent) {
        batches.push(countries.slice(i, i + maxConcurrent));
    }
    
    for (const batch of batches) {
        const batchPromises = batch.map(async (country) => {
            try {
                if (!country.flags?.png) {
                    throw new Error('No flag URL available');
                }
                
                const img = await loadImageWithTimeout(country.flags.png, 3000);
                preloadedImages.set(country.cca2, img.src);
                successCount++;
                
                console.log(`Preloaded flag for ${country.name.common}`);
                
            } catch (error) {
                console.warn(`Failed to preload flag for ${country.name?.common || 'unknown'}:`, error.message);
                failedCount++;
            }
        });
        
        // Wait for current batch to complete before starting next
        await Promise.allSettled(batchPromises);
        
        // Small delay between batches to prevent overwhelming the browser
        if (batches.indexOf(batch) < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    const results = {
        success: successCount,
        failed: failedCount,
        total: countries.length,
        preloadedImages: preloadedImages
    };
    
    console.log(`Flag preloading completed: ${successCount} success, ${failedCount} failed out of ${countries.length} total`);
    
    // Store preloaded images for quick access
    if (typeof window !== 'undefined') {
        window.preloadedFlags = preloadedImages;
    }
    
    return results;
}

/**
 * Check if flag image is preloaded
 * @param {string} countryCode - Country code (cca2)
 * @returns {boolean} True if flag is preloaded
 */
function isFlagPreloaded(countryCode) {
    return window.preloadedFlags && window.preloadedFlags.has(countryCode);
}

/**
 * Get preloaded flag URL
 * @param {string} countryCode - Country code (cca2)
 * @returns {string|null} Preloaded flag URL or null
 */
function getPreloadedFlagUrl(countryCode) {
    if (window.preloadedFlags && window.preloadedFlags.has(countryCode)) {
        return window.preloadedFlags.get(countryCode);
    }
    return null;
}

/**
 * Clear preloaded images cache
 */
function clearPreloadedFlags() {
    if (window.preloadedFlags) {
        window.preloadedFlags.clear();
        console.log('Preloaded flags cache cleared');
    }
}

/**
 * Get preload statistics
 * @returns {Object} Preload statistics
 */
function getPreloadStats() {
    const preloadedCount = window.preloadedFlags ? window.preloadedFlags.size : 0;
    return {
        preloadedCount,
        hasPreloadedFlags: preloadedCount > 0,
        preloadedCountries: window.preloadedFlags ? Array.from(window.preloadedFlags.keys()) : []
    };
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeUI);