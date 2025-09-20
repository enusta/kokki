/**
 * Game Logic Module
 * Manages game state, flow, and core game mechanics
 */

// Game state object
const gameState = {
    currentQuestion: 0,
    totalQuestions: 10,
    score: 0,
    difficulty: 'beginner',
    languageMode: 'japanese', // 言語表示モード（hiragana/japanese/english）
    countries: [],
    currentCountry: null,
    options: [],
    correctOptionIndex: 0,
    isGameActive: false,
    isAnswered: false,
    usedCountries: [] // Track countries that have been used in questions
};

/**
 * Start a new game with selected difficulty (Requirements 4.1, 4.5)
 * @param {string} difficulty - Game difficulty (beginner, intermediate, advanced)
 */
async function startGame(difficulty) {
    try {
        // Validate difficulty parameter
        if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
            throw new Error('Invalid difficulty level');
        }

        // Show loading while fetching data
        showLoading('国データを読み込み中...');

        // Initialize game state
        resetGameState();
        gameState.difficulty = difficulty;

        // Get difficulty configuration and set question count (Requirement 4.5)
        const config = getDifficultyConfig(difficulty);
        gameState.totalQuestions = config.questionsCount;

        console.log(`Starting ${config.name} game with ${config.questionsCount} questions`);

        // Load countries data based on difficulty
        console.log('Fetching countries data...');
        const allCountries = await fetchCountries();
        console.log(`Fetched ${allCountries ? allCountries.length : 0} countries from API/cache`);
        
        gameState.countries = getCountriesByDifficulty(allCountries, difficulty);
        console.log(`Filtered to ${gameState.countries.length} countries for ${difficulty} difficulty`);

        if (gameState.countries.length < 4) {
            console.error('Insufficient countries data:', {
                allCountriesCount: allCountries ? allCountries.length : 0,
                filteredCount: gameState.countries.length,
                difficulty: difficulty,
                config: getDifficultyConfig(difficulty)
            });
            throw new Error('Insufficient countries data for quiz');
        }

        // Validate that we have enough countries for the selected difficulty
        if (gameState.countries.length < config.countries) {
            console.warn(`Expected ${config.countries} countries but got ${gameState.countries.length}`);
        }

        // Set game as active
        gameState.isGameActive = true;

        // Initialize score display (Requirement 3.1)
        initializeScoreDisplay();

        // Hide loading and show game screen
        hideLoading();
        showScreen('game');

        // Initialize and show map for the game
        if (typeof showMap === 'function') {
            showMap();
        }

        // Start first question
        await nextQuestion();

        console.log(`Game started with ${difficulty} difficulty (${config.name}), ${gameState.countries.length} countries available, ${gameState.totalQuestions} questions`);

    } catch (error) {
        console.error('Error starting game:', error);
        hideLoading();

        // Show user-friendly error message
        if (typeof showError === 'function') {
            showError('ゲームの開始に失敗しました。もう一度お試しください。');
        } else {
            alert('ゲームの開始に失敗しました。もう一度お試しください。');
        }

        // Return to start screen on error
        showScreen('start');
    }
}

/**
 * Generate and display the next question
 */
async function nextQuestion() {
    if (!gameState.isGameActive || gameState.currentQuestion >= gameState.totalQuestions) {
        endGame();
        return;
    }

    try {
        // Reset answer state
        gameState.isAnswered = false;

        // Clear previous map highlight
        if (typeof clearHighlight === 'function') {
            clearHighlight();
        }

        // Hide feedback from previous question
        if (typeof hideFeedback === 'function') {
            hideFeedback();
        }

        // Select random country for question (excluding already used countries)
        gameState.currentCountry = getRandomUnusedCountry(gameState.countries, gameState.usedCountries);

        if (!gameState.currentCountry) {
            throw new Error('No country available for question');
        }

        // Add current country to used countries list
        gameState.usedCountries.push(gameState.currentCountry.cca2);
        console.log(`Question ${gameState.currentQuestion + 1}: ${gameState.currentCountry.name.common} (${gameState.currentCountry.cca2})`);
        console.log(`Used countries: [${gameState.usedCountries.join(', ')}] (${gameState.usedCountries.length}/${gameState.countries.length})`);
        console.log(`Available countries remaining: ${gameState.countries.length - gameState.usedCountries.length}`);

        // Generate answer options (1 correct + 3 wrong)
        const answerOptions = generateAnswerOptions(gameState.currentCountry, gameState.countries);
        gameState.options = answerOptions.options;
        gameState.correctOptionIndex = answerOptions.correctIndex;

        // Update UI with new question using multilingual names (Requirement 8.2, 8.3, 8.4)
        const countryDisplayName = getCountryName(gameState.currentCountry);
        console.log(`Displaying flag for: ${countryDisplayName}`);
        console.log(`Flag URL: ${gameState.currentCountry.flags.png}`);
        displayFlag(gameState.currentCountry.flags.png, countryDisplayName, gameState.currentCountry);

        // Generate multilingual options for display (Requirement 8.2)
        const multilingualOptions = gameState.options.map(country => getCountryName(country));
        console.log(`Showing options:`, multilingualOptions);
        showOptions(multilingualOptions);

        updateQuestionCounter(gameState.currentQuestion + 1, gameState.totalQuestions);
        updateProgress(calculateProgress());

        console.log(`Question ${gameState.currentQuestion + 1}: ${gameState.currentCountry.name.common}`);

    } catch (error) {
        console.error('Error generating next question:', error);
        // Handle error gracefully - could show error message or retry
    }
}

/**
 * Check user's answer
 * @param {number} selectedIndex - Index of selected option
 */
function checkAnswer(selectedIndex) {
    // Prevent multiple answers for the same question
    if (gameState.isAnswered || !gameState.isGameActive) {
        return;
    }

    gameState.isAnswered = true;

    // Compare selected answer with correct answer
    const isCorrect = selectedIndex === gameState.correctOptionIndex;
    const correctCountry = gameState.currentCountry;

    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        // Use multilingual name for feedback (Requirement 8.6)
        const correctCountryName = getCountryName(correctCountry);
        handleIncorrectAnswer(correctCountryName);
    }

    // Show visual feedback with multilingual name (Requirement 8.6)
    highlightOptions(gameState.correctOptionIndex, selectedIndex);
    const correctCountryName = getCountryName(correctCountry);
    showFeedback(isCorrect, correctCountryName);

    // Move to next question after a delay
    setTimeout(() => {
        gameState.currentQuestion++;

        if (gameState.currentQuestion < gameState.totalQuestions) {
            nextQuestion();
        } else {
            endGame();
        }
    }, 2000); // 2 second delay to show feedback
}

/**
 * Generate answer options for current question
 * @param {Object} correctCountry - The correct country
 * @param {Array} allCountries - All available countries
 * @returns {Object} Object with options array and correct index
 */
function generateAnswerOptions(correctCountry, allCountries) {
    if (!correctCountry || !allCountries || allCountries.length < 4) {
        throw new Error('Insufficient data to generate answer options');
    }

    // Get 3 wrong answers using the country service function, excluding used countries
    const wrongAnswers = generateWrongAnswers(correctCountry, allCountries, 3, gameState.usedCountries);

    if (wrongAnswers.length < 3) {
        throw new Error('Could not generate enough wrong answers');
    }

    // Create options array with correct answer and wrong answers
    const options = [correctCountry, ...wrongAnswers];

    // Shuffle the options to randomize correct answer position
    const shuffledOptions = shuffleArray([...options]);

    // Find the index of the correct answer after shuffling
    const correctIndex = shuffledOptions.findIndex(country =>
        country.cca2 === correctCountry.cca2
    );

    return {
        options: shuffledOptions,
        correctIndex: correctIndex
    };
}

/**
 * End the current game and show results
 */
function endGame() {
    // Set game as inactive
    gameState.isGameActive = false;

    // Calculate final score and accuracy (Requirement 3.4)
    const accuracy = calculateAccuracy();
    const finalScore = {
        score: gameState.score,
        total: gameState.totalQuestions,
        accuracy: accuracy,
        questionsAnswered: gameState.currentQuestion
    };

    // Show results screen with comprehensive final score (Requirement 3.4)
    showFinalResults(finalScore);
    showScreen('result');

    console.log(`Game ended. Final score: ${gameState.score}/${gameState.totalQuestions} (${accuracy}%)`);
}

/**
 * Restart the current game (Requirement 3.5)
 */
function restartGame() {
    try {
        // Reset game state completely
        resetGameState();

        // Clear any UI feedback
        if (typeof hideFeedback === 'function') {
            hideFeedback();
        }

        // Reset option buttons
        if (typeof resetOptions === 'function') {
            resetOptions();
        }

        // Clear map highlights and hide map
        if (typeof clearHighlight === 'function') {
            clearHighlight();
        }
        if (typeof hideMap === 'function') {
            hideMap();
        }
        if (typeof resetMapView === 'function') {
            resetMapView();
        }

        // Reset score display
        if (typeof updateScore === 'function') {
            updateScore(0, 0);
        }
        if (typeof updateQuestionCounter === 'function') {
            updateQuestionCounter(0, 0);
        }
        if (typeof updateProgress === 'function') {
            updateProgress(0);
        }

        // Hide loading overlay if visible
        if (typeof hideLoading === 'function') {
            hideLoading();
        }

        // Return to start screen for new difficulty selection
        showScreen('start');

        console.log('Game restarted successfully - returned to difficulty selection');

    } catch (error) {
        console.error('Error restarting game:', error);

        // Fallback: force return to start screen
        showScreen('start');
    }
}

/**
 * Start a new game with the same difficulty (quick restart)
 */
async function restartSameDifficulty() {
    try {
        const currentDifficulty = gameState.difficulty;

        if (!currentDifficulty) {
            // No current difficulty, go to start screen
            restartGame();
            return;
        }

        console.log(`Restarting game with same difficulty: ${currentDifficulty}`);

        // Start new game with same difficulty
        await startGame(currentDifficulty);

    } catch (error) {
        console.error('Error restarting with same difficulty:', error);

        // Fallback to full restart
        restartGame();
    }
}

/**
 * Handle correct answer
 */
function handleCorrectAnswer() {
    // Increment score (Requirement 3.2)
    gameState.score++;

    // Update score and progress display (Requirement 3.3)
    updateScoreDisplay();
    updateProgressDisplay();

    // Highlight country on map when correct (Requirement 2.1, 8.8)
    if (typeof highlightCountry === 'function' && gameState.currentCountry.latlng) {
        highlightCountry(gameState.currentCountry.cca2, gameState.currentCountry.latlng, gameState.languageMode);
    }

    console.log(`Correct! Score: ${gameState.score}/${gameState.currentQuestion + 1}`);
}

/**
 * Handle incorrect answer
 * @param {string} correctAnswer - The correct country name
 */
function handleIncorrectAnswer(correctAnswer) {
    // Update progress display (score doesn't increase, but question count does) (Requirement 3.3)
    updateProgressDisplay();

    // Still highlight country on map for learning purposes (Requirement 2.1, 8.8)
    if (typeof highlightCountry === 'function' && gameState.currentCountry.latlng) {
        highlightCountry(gameState.currentCountry.cca2, gameState.currentCountry.latlng, gameState.languageMode);
    }

    console.log(`Incorrect. Correct answer: ${correctAnswer}. Score: ${gameState.score}/${gameState.currentQuestion + 1}`);
}

/**
 * Get game configuration for difficulty (Requirement 4.5)
 * @param {string} difficulty - Difficulty level
 * @returns {Object} Configuration object
 */
function getDifficultyConfig(difficulty) {
    // Import difficulty config from countryService
    const DIFFICULTY_CONFIG = {
        beginner: {
            countries: 25,
            regions: ['Europe', 'North America'],
            questionsCount: 10,
            name: '初級',
            description: '有名な国の国旗'
        },
        intermediate: {
            countries: 60,
            regions: ['Europe', 'Asia', 'North America', 'South America'],
            questionsCount: 15,
            name: '中級',
            description: 'より多くの国の国旗'
        },
        advanced: {
            countries: 150,
            regions: 'all',
            questionsCount: 20,
            name: '上級',
            description: '世界中の国の国旗'
        }
    };

    return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.beginner;
}

/**
 * Calculate game progress percentage
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress() {
    if (gameState.totalQuestions === 0) {
        return 0;
    }

    return Math.round((gameState.currentQuestion / gameState.totalQuestions) * 100);
}

/**
 * Calculate accuracy percentage
 * @returns {number} Accuracy percentage
 */
function calculateAccuracy() {
    if (gameState.currentQuestion === 0) {
        return 0;
    }

    return Math.round((gameState.score / gameState.currentQuestion) * 100);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating original

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Get a random country that hasn't been used yet
 * @param {Array} countries - Available countries
 * @param {Array} usedCountries - Array of country codes that have been used
 * @returns {Object|null} Random unused country or null if none available
 */
function getRandomUnusedCountry(countries, usedCountries) {
    if (!countries || countries.length === 0) {
        return null;
    }

    // Filter out countries that have already been used
    const availableCountries = countries.filter(country =>
        !usedCountries.includes(country.cca2)
    );

    if (availableCountries.length === 0) {
        console.warn('🔄 All countries have been used! Resetting used countries list to continue...');
        console.log(`Total countries available: ${countries.length}, All used: [${usedCountries.join(', ')}]`);
        // If all countries have been used, reset the used list and start over
        gameState.usedCountries = [];
        return getRandomCountry(countries);
    }

    // Select random country from available ones
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    return availableCountries[randomIndex];
}

/**
 * Reset game state to initial values
 */
function resetGameState() {
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.totalQuestions = 10;
    gameState.difficulty = 'beginner';
    // 言語モードはリセットしない（ユーザーの選択を保持）
    gameState.countries = [];
    gameState.currentCountry = null;
    gameState.options = [];
    gameState.correctOptionIndex = 0;
    gameState.isGameActive = false;
    gameState.isAnswered = false;
    gameState.usedCountries = [];
}

/**
 * Initialize score display at game start (Requirement 3.1)
 */
function initializeScoreDisplay() {
    // Initialize score counter to 0
    updateScore(0, 0);
    updateQuestionCounter(0, gameState.totalQuestions);
    updateProgress(0);

    console.log('Score display initialized');
}

/**
 * Update score display during game (Requirement 3.3)
 */
function updateScoreDisplay() {
    const questionsAnswered = gameState.currentQuestion + 1;
    updateScore(gameState.score, questionsAnswered);
}

/**
 * Update progress display during game (Requirement 3.3)
 */
function updateProgressDisplay() {
    const questionsAnswered = gameState.currentQuestion + 1;
    updateQuestionCounter(questionsAnswered, gameState.totalQuestions);
    updateProgress(calculateProgress());
}

/**
 * Calculate current accuracy percentage
 * @returns {number} Accuracy percentage (0-100)
 */
function calculateCurrentAccuracy() {
    const questionsAnswered = gameState.currentQuestion + 1;
    if (questionsAnswered === 0) {
        return 0;
    }
    return Math.round((gameState.score / questionsAnswered) * 100);
}

/**
 * Get comprehensive score statistics
 * @returns {Object} Score statistics object
 */
function getScoreStatistics() {
    const questionsAnswered = gameState.currentQuestion;
    const accuracy = questionsAnswered > 0 ? Math.round((gameState.score / questionsAnswered) * 100) : 0;

    return {
        score: gameState.score,
        totalQuestions: gameState.totalQuestions,
        questionsAnswered: questionsAnswered,
        accuracy: accuracy,
        correctAnswers: gameState.score,
        incorrectAnswers: questionsAnswered - gameState.score,
        remainingQuestions: gameState.totalQuestions - questionsAnswered
    };
}

/**
 * Validate game state
 * @returns {boolean} True if game state is valid
 */
function validateGameState() {
    // Check if game state is in valid condition
    const isValid = (
        gameState.score >= 0 &&
        gameState.currentQuestion >= 0 &&
        gameState.totalQuestions > 0 &&
        gameState.score <= gameState.currentQuestion &&
        gameState.currentQuestion <= gameState.totalQuestions
    );

    if (!isValid) {
        console.error('Invalid game state detected:', gameState);
    }

    return isValid;
}

/**
 * Get country name based on selected language mode (Requirement 8.2, 8.3, 8.4)
 * @param {Object} country - Country object with multilingual names
 * @param {string} languageMode - Language mode (hiragana/japanese/english)
 * @returns {string} Country name in selected language
 */
function getCountryName(country, languageMode = gameState.languageMode) {
    if (!country || !country.name) {
        return '不明な国';
    }

    switch (languageMode) {
        case 'hiragana':
            return country.name.hiragana || country.name.japanese || country.name.common;
        case 'japanese':
            return country.name.japanese || country.name.common;
        case 'english':
        default:
            return country.name.common;
    }
}

/**
 * Get capital name based on selected language mode (Requirement 8.10, 8.11)
 * @param {Object} country - Country object with multilingual capital names
 * @param {string} languageMode - Language mode (hiragana/japanese/english)
 * @returns {string} Capital name in selected language
 */
function getCapitalName(country, languageMode = gameState.languageMode) {
    if (!country || !country.capital) {
        return '不明';
    }

    switch (languageMode) {
        case 'hiragana':
            return country.capital.hiragana?.[0] || country.capital.japanese?.[0] || country.capital.english?.[0] || country.capital[0] || '不明';
        case 'japanese':
            return country.capital.japanese?.[0] || country.capital.english?.[0] || country.capital[0] || '不明';
        case 'english':
        default:
            return country.capital.english?.[0] || country.capital[0] || 'Unknown';
    }
}

/**
 * Get region name based on selected language mode (Requirement 8.11)
 * @param {Object} country - Country object with multilingual region names
 * @param {string} languageMode - Language mode (hiragana/japanese/english)
 * @returns {string} Region name in selected language
 */
function getRegionName(country, languageMode = gameState.languageMode) {
    if (!country || !country.region) {
        return '不明';
    }

    switch (languageMode) {
        case 'hiragana':
            return country.region.hiragana || country.region.japanese || country.region.english || country.region || '不明';
        case 'japanese':
            return country.region.japanese || country.region.english || country.region || '不明';
        case 'english':
        default:
            return country.region.english || country.region || 'Unknown';
    }
}

/**
 * Get subregion name based on selected language mode (Requirement 8.11)
 * @param {Object} country - Country object with multilingual subregion names
 * @param {string} languageMode - Language mode (hiragana/japanese/english)
 * @returns {string} Subregion name in selected language
 */
function getSubregionName(country, languageMode = gameState.languageMode) {
    if (!country || !country.subregion) {
        return '不明';
    }

    switch (languageMode) {
        case 'hiragana':
            return country.subregion.hiragana || country.subregion.japanese || country.subregion.english || country.subregion || '不明';
        case 'japanese':
            return country.subregion.japanese || country.subregion.english || country.subregion || '不明';
        case 'english':
        default:
            return country.subregion.english || country.subregion || 'Unknown';
    }
}

/**
 * Get current game status information
 * @returns {Object} Game status object
 */
function getGameStatus() {
    const config = getDifficultyConfig(gameState.difficulty);

    return {
        isActive: gameState.isGameActive,
        difficulty: gameState.difficulty,
        difficultyName: config.name,
        currentQuestion: gameState.currentQuestion,
        totalQuestions: gameState.totalQuestions,
        score: gameState.score,
        accuracy: calculateCurrentAccuracy(),
        progress: calculateProgress(),
        isAnswered: gameState.isAnswered,
        remainingQuestions: gameState.totalQuestions - gameState.currentQuestion,
        countriesAvailable: gameState.countries.length
    };
}

/**
 * Check if game can be started with given difficulty
 * @param {string} difficulty - Difficulty level to check
 * @returns {boolean} True if game can be started
 */
function canStartGame(difficulty) {
    if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
        return false;
    }

    // Check if we're not already in an active game
    if (gameState.isGameActive) {
        console.warn('Game is already active');
        return false;
    }

    return true;
}

/**
 * Pause the current game (if needed for future features)
 */
function pauseGame() {
    if (gameState.isGameActive) {
        gameState.isGameActive = false;
        console.log('Game paused');
    }
}

/**
 * Resume the current game (if needed for future features)
 */
function resumeGame() {
    if (!gameState.isGameActive && gameState.currentQuestion < gameState.totalQuestions) {
        gameState.isGameActive = true;
        console.log('Game resumed');
    }
}