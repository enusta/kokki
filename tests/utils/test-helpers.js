/**
 * Common Test Helpers for Flag Guessing Game
 * Provides utility functions for all test files
 */

/**
 * Test result tracking
 */
class TestTracker {
    constructor(testName) {
        this.testName = testName;
        this.results = [];
        this.startTime = performance.now();
    }
    
    addResult(testCase, passed, message = '', details = null) {
        const result = {
            testCase,
            passed,
            message,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        
        // Log to console
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`  ${status}: ${testCase} ${message ? '- ' + message : ''}`);
        
        if (details && typeof details === 'object') {
            console.log('    Details:', details);
        }
        
        return result;
    }
    
    addWarning(testCase, message, details = null) {
        const result = {
            testCase,
            passed: null, // null indicates warning
            message,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        console.log(`  ⚠️  WARN: ${testCase} - ${message}`);
        
        if (details) {
            console.log('    Details:', details);
        }
        
        return result;
    }
    
    getSummary() {
        const passed = this.results.filter(r => r.passed === true).length;
        const failed = this.results.filter(r => r.passed === false).length;
        const warnings = this.results.filter(r => r.passed === null).length;
        const total = passed + failed;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        const duration = performance.now() - this.startTime;
        
        return {
            testName: this.testName,
            total,
            passed,
            failed,
            warnings,
            successRate,
            duration: Math.round(duration),
            results: this.results
        };
    }
    
    printSummary() {
        const summary = this.getSummary();
        
        console.log('\n' + '='.repeat(50));
        console.log(`📊 ${summary.testName} Summary`);
        console.log('='.repeat(50));
        console.log(`⏱️  Duration: ${summary.duration}ms`);
        console.log(`📈 Success Rate: ${summary.successRate}%`);
        console.log(`✅ Passed: ${summary.passed}`);
        console.log(`❌ Failed: ${summary.failed}`);
        console.log(`⚠️  Warnings: ${summary.warnings}`);
        console.log(`📊 Total: ${summary.total}`);
        
        if (summary.failed > 0) {
            console.log('\n🚨 Failed Tests:');
            summary.results
                .filter(r => r.passed === false)
                .forEach((result, index) => {
                    console.log(`  ${index + 1}. ${result.testCase}: ${result.message}`);
                });
        }
        
        console.log('='.repeat(50));
        
        return summary;
    }
}

/**
 * Mock DOM elements for testing
 */
class MockDOM {
    constructor() {
        this.elements = new Map();
    }
    
    createElement(tagName, id = null, attributes = {}) {
        const element = {
            tagName: tagName.toUpperCase(),
            id: id,
            className: '',
            textContent: '',
            innerHTML: '',
            style: {},
            attributes: { ...attributes },
            children: [],
            parentElement: null,
            
            // Mock methods
            addEventListener: (event, handler) => {
                if (!element._eventListeners) element._eventListeners = {};
                if (!element._eventListeners[event]) element._eventListeners[event] = [];
                element._eventListeners[event].push(handler);
            },
            
            removeEventListener: (event, handler) => {
                if (element._eventListeners && element._eventListeners[event]) {
                    const index = element._eventListeners[event].indexOf(handler);
                    if (index > -1) element._eventListeners[event].splice(index, 1);
                }
            },
            
            click: () => {
                if (element._eventListeners && element._eventListeners.click) {
                    element._eventListeners.click.forEach(handler => handler());
                }
            },
            
            appendChild: (child) => {
                element.children.push(child);
                child.parentElement = element;
            },
            
            removeChild: (child) => {
                const index = element.children.indexOf(child);
                if (index > -1) {
                    element.children.splice(index, 1);
                    child.parentElement = null;
                }
            },
            
            querySelector: (selector) => {
                // Simple implementation for basic selectors
                if (selector.startsWith('#')) {
                    const id = selector.substring(1);
                    return element.children.find(child => child.id === id) || null;
                }
                return null;
            },
            
            querySelectorAll: (selector) => {
                // Simple implementation
                return [];
            }
        };
        
        if (id) {
            this.elements.set(id, element);
        }
        
        return element;
    }
    
    getElementById(id) {
        return this.elements.get(id) || null;
    }
    
    createMockDocument() {
        const mockDocument = {
            getElementById: (id) => this.getElementById(id),
            createElement: (tagName) => this.createElement(tagName),
            querySelector: (selector) => {
                if (selector.startsWith('#')) {
                    return this.getElementById(selector.substring(1));
                }
                return null;
            },
            querySelectorAll: () => [],
            body: this.createElement('body', 'body')
        };
        
        return mockDocument;
    }
}

/**
 * Mock game state for testing
 */
function createMockGameState(overrides = {}) {
    return {
        currentQuestion: 0,
        totalQuestions: 10,
        score: 0,
        difficulty: 'beginner',
        isGameActive: false,
        countries: [],
        currentCountry: null,
        options: [],
        timeStarted: null,
        ...overrides
    };
}

/**
 * Mock country data for testing
 */
function createMockCountries(count = 5) {
    const countries = [];
    const names = ['Japan', 'USA', 'France', 'Germany', 'Italy', 'Spain', 'Brazil', 'Canada', 'Australia', 'India'];
    const codes = ['JP', 'US', 'FR', 'DE', 'IT', 'ES', 'BR', 'CA', 'AU', 'IN'];
    
    for (let i = 0; i < Math.min(count, names.length); i++) {
        countries.push({
            name: { 
                common: names[i],
                official: `Official ${names[i]}`
            },
            cca2: codes[i],
            cca3: codes[i] + 'X',
            flags: {
                png: `https://flagcdn.com/w320/${codes[i].toLowerCase()}.png`,
                svg: `https://flagcdn.com/${codes[i].toLowerCase()}.svg`
            },
            capital: [`Capital of ${names[i]}`],
            region: i < 3 ? 'Europe' : i < 6 ? 'Americas' : 'Asia',
            subregion: `Sub-${names[i]}`,
            latlng: [Math.random() * 180 - 90, Math.random() * 360 - 180],
            area: Math.floor(Math.random() * 1000000),
            population: Math.floor(Math.random() * 100000000)
        });
    }
    
    return countries;
}

/**
 * Async test runner with timeout
 */
async function runAsyncTest(testFunction, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Test timed out after ${timeout}ms`));
        }, timeout);
        
        Promise.resolve(testFunction())
            .then(result => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}

/**
 * Wait for condition to be true
 */
async function waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Simulate user interaction
 */
function simulateClick(element) {
    if (element && typeof element.click === 'function') {
        element.click();
        return true;
    }
    return false;
}

function simulateInput(element, value) {
    if (element) {
        element.value = value;
        // Trigger input event if listeners exist
        if (element._eventListeners && element._eventListeners.input) {
            element._eventListeners.input.forEach(handler => 
                handler({ target: element, type: 'input' })
            );
        }
        return true;
    }
    return false;
}

/**
 * Performance measurement utilities
 */
function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    return { result, duration };
}

async function measureAsyncPerformance(name, fn) {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    return { result, duration };
}

/**
 * Memory usage tracking (if available)
 */
function getMemoryUsage() {
    if (performance.memory) {
        return {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
            total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
        };
    }
    return null;
}

/**
 * Network simulation utilities
 */
function simulateNetworkDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function simulateNetworkError(message = 'Network error') {
    return Promise.reject(new Error(message));
}

/**
 * Local storage mock
 */
class MockLocalStorage {
    constructor() {
        this.store = new Map();
    }
    
    getItem(key) {
        return this.store.get(key) || null;
    }
    
    setItem(key, value) {
        this.store.set(key, String(value));
    }
    
    removeItem(key) {
        this.store.delete(key);
    }
    
    clear() {
        this.store.clear();
    }
    
    get length() {
        return this.store.size;
    }
    
    key(index) {
        const keys = Array.from(this.store.keys());
        return keys[index] || null;
    }
}

/**
 * Test suite runner
 */
class TestSuite {
    constructor(name) {
        this.name = name;
        this.tests = [];
        this.beforeEach = null;
        this.afterEach = null;
        this.beforeAll = null;
        this.afterAll = null;
    }
    
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    setBeforeEach(fn) {
        this.beforeEach = fn;
    }
    
    setAfterEach(fn) {
        this.afterEach = fn;
    }
    
    setBeforeAll(fn) {
        this.beforeAll = fn;
    }
    
    setAfterAll(fn) {
        this.afterAll = fn;
    }
    
    async run() {
        const tracker = new TestTracker(this.name);
        
        console.log(`\n🧪 Running Test Suite: ${this.name}`);
        console.log('-'.repeat(50));
        
        try {
            if (this.beforeAll) {
                await this.beforeAll();
            }
            
            for (const test of this.tests) {
                try {
                    if (this.beforeEach) {
                        await this.beforeEach();
                    }
                    
                    await runAsyncTest(test.testFunction);
                    tracker.addResult(test.name, true);
                    
                    if (this.afterEach) {
                        await this.afterEach();
                    }
                } catch (error) {
                    tracker.addResult(test.name, false, error.message);
                }
            }
            
            if (this.afterAll) {
                await this.afterAll();
            }
            
        } catch (error) {
            tracker.addResult('Suite Setup/Teardown', false, error.message);
        }
        
        return tracker.printSummary();
    }
}

// Export all utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TestTracker,
        MockDOM,
        TestSuite,
        createMockGameState,
        createMockCountries,
        runAsyncTest,
        waitFor,
        simulateClick,
        simulateInput,
        measurePerformance,
        measureAsyncPerformance,
        getMemoryUsage,
        simulateNetworkDelay,
        simulateNetworkError,
        MockLocalStorage
    };
}

// Browser globals
if (typeof window !== 'undefined') {
    window.TestHelpers = {
        TestTracker,
        MockDOM,
        TestSuite,
        createMockGameState,
        createMockCountries,
        runAsyncTest,
        waitFor,
        simulateClick,
        simulateInput,
        measurePerformance,
        measureAsyncPerformance,
        getMemoryUsage,
        simulateNetworkDelay,
        simulateNetworkError,
        MockLocalStorage
    };
}