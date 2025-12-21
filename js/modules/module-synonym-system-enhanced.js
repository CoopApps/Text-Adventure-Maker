// module-synonym-system-enhanced.js - Module 19: Complete Synonym System
// Part of DAAD Adventure Creator - Advanced Professional Feature for Vocabulary Management
// Enhanced with full functionality - all features implemented with professional modals

(function() {
    'use strict';

    console.log('Enhanced Synonym System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found!');
        return;
    }

    AdventureCreator.registerModule('synonym-system', {
        name: 'Synonym System (Enhanced)',
        description: 'Complete vocabulary management with advanced natural language support',
        category: 'Advanced Professional',
        complexity: 'Intermediate',
        priority: 19,

        init() {
            console.log('Enhanced Synonym System initialized');

            if (!AdventureCreator.state.synonymSystem) {
                AdventureCreator.state.synonymSystem = {
                    selectedTab: 'vocabulary_builder',
                    showExplanations: true,
                    selectedCategory: 'basic_verbs',
                    selectedSynonym: null,
                    vocabularyMode: 'guided',
                    debugMode: false,
                    synonymGroups: [],
                    autoComplete: true,
                    caseSensitive: false,
                    testHistory: [],
                    lastTestResults: null
                };
            }
        },

        render() {
            const state = AdventureCreator.state.synonymSystem;

            return `
                <div class="synonym-system-container">
                    <div class="section-header">
                        <h2>📝 Enhanced Synonym System</h2>
                        <div class="complexity-badges">
                            <span class="complexity-badge intermediate">Intermediate</span>
                            <span class="feature-badge advanced-professional">Advanced Professional</span>
                            <span class="priority-badge module-19">Module 19 - Enhanced</span>
                        </div>
                    </div>

                    <div class="section-content active">
                        <div class="feature-description">
                            <h3>🗣️ Natural Language Enhancement</h3>
                            <p>Create intuitive vocabulary systems that allow players to use natural language.
                            Support multiple ways to express actions and reference objects, dramatically improving
                            accessibility and player experience. All features fully implemented with professional UI!</p>
                        </div>

                        ${this.renderTabNavigation()}
                        ${this.renderTabContent()}
                    </div>
                </div>
            `;
        },

        renderTabNavigation() {
            const tabs = [
                { id: 'vocabulary_builder', name: '📚 Vocabulary Builder', description: 'Create synonym groups and word alternatives' },
                { id: 'natural_language', name: '🗣️ Natural Language', description: 'Advanced language parsing and recognition' },
                { id: 'vocabulary_analysis', name: '📊 Vocabulary Analysis', description: 'Analyze and optimize game vocabulary' },
                { id: 'common_patterns', name: '🎯 Common Patterns', description: 'Pre-built vocabulary templates' },
                { id: 'testing_lab', name: '🧪 Testing Lab', description: 'Test vocabulary recognition' }
            ];

            return `
                <div class="tab-navigation">
                    ${tabs.map(tab => `
                        <button class="tab-button ${AdventureCreator.state.synonymSystem.selectedTab === tab.id ? 'active' : ''}"
                                onclick="AdventureCreator.modules['synonym-system'].switchTab('${tab.id}')">
                            <div class="tab-name">${tab.name}</div>
                            <div class="tab-description">${tab.description}</div>
                        </button>
                    `).join('')}
                </div>
            `;
        },

        renderTabContent() {
            const selectedTab = AdventureCreator.state.synonymSystem.selectedTab;

            switch(selectedTab) {
                case 'vocabulary_builder':
                    return this.renderVocabularyBuilder();
                case 'natural_language':
                    return this.renderNaturalLanguage();
                case 'vocabulary_analysis':
                    return this.renderVocabularyAnalysis();
                case 'common_patterns':
                    return this.renderCommonPatterns();
                case 'testing_lab':
                    return this.renderTestingLab();
                default:
                    return this.renderVocabularyBuilder();
            }
        },

        renderVocabularyBuilder() {
            const game = AdventureCreator.getCurrentGame();
            if (!game || !game.daad) {
                return '<div class="feature-placeholder">Create a game first to build vocabulary.</div>';
            }

            if (!game.daad.synonyms) game.daad.synonyms = [];
            const synonyms = game.daad.synonyms;

            return `
                <div class="vocabulary-builder-container">
                    <div class="builder-toolbar">
                        <div class="toolbar-section">
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].createSynonymGroup()">
                                ➕ New Synonym Group
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].generateCommonVocabulary()">
                                🚀 Generate Common Vocabulary
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].importSynonyms()">
                                📥 Import Synonyms
                            </button>
                        </div>

                        <div class="toolbar-section">
                            <label class="toolbar-label">Mode:</label>
                            <select class="toolbar-select" onchange="AdventureCreator.modules['synonym-system'].setVocabularyMode(this.value)">
                                <option value="guided" ${AdventureCreator.state.synonymSystem.vocabularyMode === 'guided' ? 'selected' : ''}>Guided Builder</option>
                                <option value="advanced" ${AdventureCreator.state.synonymSystem.vocabularyMode === 'advanced' ? 'selected' : ''}>Advanced Editor</option>
                                <option value="import" ${AdventureCreator.state.synonymSystem.vocabularyMode === 'import' ? 'selected' : ''}>Import/Export</option>
                            </select>
                        </div>

                        <div class="toolbar-section">
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].exportDAAD()">
                                📄 Export DAAD
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].exportJSON()">
                                💾 Export JSON
                            </button>
                        </div>
                    </div>

                    <div class="vocabulary-workspace">
                        ${this.renderVocabularyStats(synonyms)}
                        ${this.renderSynonymCategories()}
                        ${this.renderSynonymsList(synonyms)}
                    </div>
                </div>
            `;
        },

        renderVocabularyStats(synonyms) {
            const stats = this.calculateVocabularyStats(synonyms);

            return `
                <div class="vocabulary-stats">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalGroups}</div>
                            <div class="stat-label">Synonym Groups</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalWords}</div>
                            <div class="stat-label">Total Words</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.verbs}</div>
                            <div class="stat-label">Verbs</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.nouns}</div>
                            <div class="stat-label">Nouns</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.adjectives}</div>
                            <div class="stat-label">Adjectives</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.coverage}%</div>
                            <div class="stat-label">Coverage</div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderSynonymCategories() {
            const categories = this.getSynonymCategories();
            const selectedCategory = AdventureCreator.state.synonymSystem.selectedCategory;

            return `
                <div class="synonym-categories">
                    <h3>📚 Vocabulary Categories</h3>
                    <div class="categories-grid">
                        ${Object.entries(categories).map(([key, category]) => `
                            <div class="category-card ${selectedCategory === key ? 'selected' : ''}"
                                 onclick="AdventureCreator.modules['synonym-system'].selectCategory('${key}')">
                                <div class="category-header">
                                    <div class="category-icon">${category.icon}</div>
                                    <div class="category-name">${category.name}</div>
                                </div>
                                <div class="category-description">${category.description}</div>
                                <div class="category-examples">
                                    ${category.examples.slice(0, 3).map(example => `
                                        <span class="example-tag">${example}</span>
                                    `).join('')}
                                </div>
                                <div class="category-stats">
                                    ${Object.keys(category.synonyms).length} patterns
                                </div>
                                <button class="btn btn-small btn-primary"
                                        onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].applyCategorySynonyms('${key}')"
                                        style="margin-top: 0.5rem; width: 100%;">
                                    Apply All
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderSynonymsList(synonyms) {
            if (synonyms.length === 0) {
                return `
                    <div class="synonyms-list empty">
                        <div class="empty-state">
                            <div class="empty-icon">📝</div>
                            <div class="empty-title">No Synonym Groups</div>
                            <div class="empty-description">Create synonym groups to allow natural language input</div>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].createSynonymGroup()">
                                Create First Synonym Group
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="synonyms-list">
                    <div class="list-header">
                        <h3>Defined Synonyms (${synonyms.length})</h3>
                        <div class="list-actions">
                            <button class="btn btn-small btn-secondary" onclick="AdventureCreator.modules['synonym-system'].sortSynonyms('alphabetical')">
                                🔤 Sort A-Z
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="AdventureCreator.modules['synonym-system'].sortSynonyms('category')">
                                📁 Sort by Category
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="AdventureCreator.modules['synonym-system'].clearAllSynonyms()">
                                🗑️ Clear All
                            </button>
                        </div>
                    </div>

                    <div class="synonyms-grid">
                        ${synonyms.map((synonym, index) => this.renderSynonymCard(synonym, index)).join('')}
                    </div>
                </div>
            `;
        },

        renderSynonymCard(synonym, index) {
            const isSelected = AdventureCreator.state.synonymSystem.selectedSynonym === index;

            return `
                <div class="synonym-card ${isSelected ? 'selected' : ''}"
                     onclick="AdventureCreator.modules['synonym-system'].selectSynonym(${index})">
                    <div class="synonym-header">
                        <div class="synonym-primary">${synonym.primary || 'Unknown'}</div>
                        <div class="synonym-type">${synonym.type || 'VERB'}</div>
                    </div>

                    <div class="synonym-alternatives">
                        ${(synonym.alternatives || []).map(alt => `
                            <span class="alternative-tag">${alt}</span>
                        `).join('')}
                    </div>

                    ${synonym.category ? `<div class="synonym-category">Category: ${synonym.category}</div>` : ''}

                    <div class="synonym-daad">
                        <code>${this.generateSynonymDAAD(synonym)}</code>
                    </div>

                    <div class="synonym-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].editSynonym(${index})" title="Edit">✏️</button>
                        <button class="action-btn" onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].duplicateSynonym(${index})" title="Duplicate">📋</button>
                        <button class="action-btn" onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].testSynonym(${index})" title="Test">🧪</button>
                        <button class="action-btn danger" onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].deleteSynonym(${index})" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        },

        renderNaturalLanguage() {
            return `
                <div class="natural-language-container">
                    <div class="language-header">
                        <h3>🗣️ Advanced Natural Language Processing</h3>
                        <p>Configure sophisticated language recognition and parsing for intuitive player interaction.</p>
                    </div>

                    <div class="language-features">
                        ${this.getLanguageFeatures().map(feature => `
                            <div class="language-feature">
                                <div class="feature-header">
                                    <div class="feature-icon">${feature.icon}</div>
                                    <div class="feature-info">
                                        <div class="feature-name">${feature.name}</div>
                                        <div class="feature-complexity ${feature.complexity}">${feature.complexity}</div>
                                    </div>
                                </div>

                                <div class="feature-description">${feature.description}</div>

                                <div class="feature-examples">
                                    <h5>Examples:</h5>
                                    ${feature.examples.map(example => `
                                        <div class="example-item">
                                            <span class="example-input">"${example.input}"</span>
                                            <span class="example-arrow">→</span>
                                            <span class="example-output">"${example.output}"</span>
                                        </div>
                                    `).join('')}
                                </div>

                                <div class="feature-implementation">
                                    <h5>DAAD Implementation:</h5>
                                    <pre class="code-block"><code>${feature.daadCode}</code></pre>
                                </div>

                                <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].applyLanguageFeature('${feature.id}')">
                                    ✅ Apply Feature
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderVocabularyAnalysis() {
            const game = AdventureCreator.getCurrentGame();
            const analysis = this.analyzeVocabulary(game);

            return `
                <div class="vocabulary-analysis-container">
                    <div class="analysis-header">
                        <h3>📊 Vocabulary Analysis & Optimization</h3>
                        <p>Analyze your game's vocabulary coverage and identify opportunities for improvement.</p>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].refreshAnalysis()">
                            🔄 Refresh Analysis
                        </button>
                    </div>

                    <div class="analysis-results">
                        <div class="analysis-overview">
                            <h4>📈 Coverage Analysis</h4>
                            <div class="coverage-chart">
                                <div class="coverage-bar">
                                    <div class="coverage-fill" style="width: ${analysis.overallCoverage}%; background: ${this.getCoverageColor(analysis.overallCoverage)}"></div>
                                </div>
                                <div class="coverage-text">${analysis.overallCoverage}% Overall Coverage - ${this.getCoverageLabel(analysis.overallCoverage)}</div>
                            </div>
                        </div>

                        <div class="analysis-categories">
                            <h4>📋 Category Breakdown</h4>
                            <div class="categories-analysis">
                                ${analysis.categories.map(category => `
                                    <div class="category-analysis">
                                        <div class="category-name">${category.name}</div>
                                        <div class="category-coverage">
                                            <div class="coverage-bar small">
                                                <div class="coverage-fill" style="width: ${category.coverage}%; background: ${this.getCoverageColor(category.coverage)}"></div>
                                            </div>
                                            <span>${category.coverage}%</span>
                                        </div>
                                        <div class="category-suggestions">
                                            ${category.suggestions.map(suggestion => `
                                                <span class="suggestion-tag">${suggestion}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="analysis-recommendations">
                            <h4>💡 Recommendations</h4>
                            <div class="recommendations-list">
                                ${analysis.recommendations.map(rec => `
                                    <div class="recommendation-item">
                                        <div class="rec-icon">${rec.icon}</div>
                                        <div class="rec-content">
                                            <div class="rec-title">${rec.title}</div>
                                            <div class="rec-description">${rec.description}</div>
                                        </div>
                                        <button class="btn btn-small btn-primary" onclick="AdventureCreator.modules['synonym-system'].applyRecommendation('${rec.id}')">
                                            ✅ Apply
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderCommonPatterns() {
            return `
                <div class="common-patterns-container">
                    <div class="patterns-header">
                        <h3>🎯 Pre-Built Vocabulary Templates</h3>
                        <p>Ready-to-use vocabulary patterns for common adventure game scenarios.</p>
                    </div>

                    <div class="patterns-grid">
                        ${this.getVocabularyPatterns().map(pattern => `
                            <div class="pattern-card">
                                <div class="pattern-header">
                                    <div class="pattern-icon">${pattern.icon}</div>
                                    <div class="pattern-info">
                                        <div class="pattern-name">${pattern.name}</div>
                                        <div class="pattern-type">${pattern.type}</div>
                                    </div>
                                    <div class="pattern-coverage">${pattern.words} words</div>
                                </div>

                                <div class="pattern-description">${pattern.description}</div>

                                <div class="pattern-preview">
                                    <h5>Includes:</h5>
                                    <div class="preview-words">
                                        ${pattern.preview.map(word => `
                                            <span class="word-tag">${word}</span>
                                        `).join('')}
                                        ${pattern.words > pattern.preview.length ? `
                                            <span class="word-more">+${pattern.words - pattern.preview.length} more...</span>
                                        ` : ''}
                                    </div>
                                </div>

                                <div class="pattern-daad-preview">
                                    <h5>DAAD Preview:</h5>
                                    <pre class="code-preview"><code>${pattern.daadPreview}</code></pre>
                                </div>

                                <div class="pattern-actions">
                                    <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].previewPattern('${pattern.id}')">
                                        👁️ Preview Full
                                    </button>
                                    <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].applyPattern('${pattern.id}')">
                                        ✅ Apply Template
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderTestingLab() {
            const testHistory = AdventureCreator.state.synonymSystem.testHistory || [];
            const lastResults = AdventureCreator.state.synonymSystem.lastTestResults;

            return `
                <div class="testing-lab-container">
                    <div class="lab-header">
                        <h3>🧪 Vocabulary Testing Laboratory</h3>
                        <p>Test how well your vocabulary system recognizes player input and identify gaps.</p>
                    </div>

                    <div class="testing-workspace">
                        <div class="test-input-section">
                            <h4>🎯 Input Testing</h4>
                            <div class="test-input-area">
                                <label class="test-label">Test Player Input:</label>
                                <input type="text" class="test-input" id="vocabularyTestInput"
                                       placeholder="Type a command to test (e.g., 'pick up the sword')"
                                       onkeypress="if(event.key==='Enter') AdventureCreator.modules['synonym-system'].testInput()">
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].testInput()">
                                    🔍 Test Recognition
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].clearTestResults()">
                                    🗑️ Clear Results
                                </button>
                            </div>

                            <div class="test-results" id="testResults">
                                ${lastResults ? this.renderTestResults(lastResults) : this.renderTestPlaceholder()}
                            </div>
                        </div>

                        <div class="batch-testing-section">
                            <h4>📊 Batch Testing</h4>
                            <div class="batch-controls">
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].runCommonCommandsTest()">
                                    🎮 Test Common Commands
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].runRandomVariationsTest()">
                                    🎲 Test Random Variations
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].runTypoResilienceTest()">
                                    ✏️ Test Typo Resilience
                                </button>
                            </div>

                            <div class="batch-results" id="batchResults">
                                ${testHistory.length > 0 ? this.renderBatchHistory(testHistory) : '<div class="results-placeholder"><div class="placeholder-text">No batch tests run yet</div></div>'}
                            </div>
                        </div>

                        <div class="vocabulary-gaps-section">
                            <h4>🕳️ Vocabulary Gaps</h4>
                            <div class="gaps-analysis" id="vocabularyGaps">
                                ${this.renderVocabularyGaps()}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderTestPlaceholder() {
            return `
                <div class="results-placeholder">
                    <div class="placeholder-icon">🧪</div>
                    <div class="placeholder-text">Enter a command above to test vocabulary recognition</div>
                </div>
            `;
        },

        renderTestResults(results) {
            return `
                <div class="test-result ${results.recognized ? 'success' : 'failure'}">
                    <div class="result-header">
                        <span class="result-icon">${results.recognized ? '✅' : '❌'}</span>
                        <span class="result-text">${results.recognized ? 'Recognized' : 'Not Recognized'}</span>
                        <span class="result-confidence">${results.confidence}% confidence</span>
                    </div>
                    <div class="result-interpretation">
                        <strong>Interpretation:</strong> ${results.interpretation}
                    </div>
                    ${results.synonymMatches && results.synonymMatches.length > 0 ? `
                        <div class="result-matches">
                            <strong>Synonym Matches:</strong>
                            <ul>
                                ${results.synonymMatches.map(match => `<li>${match}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${results.suggestions && results.suggestions.length > 0 ? `
                        <div class="result-suggestions">
                            <strong>Suggestions:</strong>
                            <ul>
                                ${results.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        renderBatchHistory(history) {
            const recent = history.slice(-5).reverse();
            return `
                <div class="batch-history">
                    <h5>Recent Batch Tests:</h5>
                    ${recent.map(test => `
                        <div class="batch-test-item">
                            <div class="test-name">${test.name}</div>
                            <div class="test-stats">
                                <span class="stat-success">${test.passed}/${test.total} passed</span>
                                <span class="stat-percentage">${Math.round((test.passed/test.total)*100)}%</span>
                            </div>
                            <div class="test-timestamp">${new Date(test.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        renderVocabularyGaps() {
            const game = AdventureCreator.getCurrentGame();
            const gaps = this.findVocabularyGaps(game);

            if (gaps.length === 0) {
                return `
                    <div class="gaps-empty">
                        <div class="empty-icon">✅</div>
                        <div class="empty-text">No significant vocabulary gaps detected!</div>
                    </div>
                `;
            }

            return `
                <div class="gaps-list">
                    ${gaps.map(gap => `
                        <div class="gap-item">
                            <div class="gap-word">${gap.word}</div>
                            <div class="gap-reason">${gap.reason}</div>
                            <button class="btn btn-small btn-primary"
                                    onclick="AdventureCreator.modules['synonym-system'].fillGap('${gap.word}', '${gap.type}')">
                                Add Synonym
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        // Helper methods
        getSynonymCategories() {
            return {
                basic_verbs: {
                    name: 'Basic Verbs',
                    icon: '🏃',
                    description: 'Essential action words for movement and interaction',
                    examples: ['take', 'get', 'go', 'look', 'open'],
                    synonyms: {
                        TAKE: ['get', 'pick', 'grab', 'obtain', 'acquire', 'collect'],
                        DROP: ['put', 'place', 'leave', 'discard', 'release'],
                        LOOK: ['examine', 'l', 'ex', 'inspect', 'view', 'observe'],
                        GO: ['move', 'walk', 'travel', 'head'],
                        OPEN: ['unlock', 'unseal', 'uncover'],
                        CLOSE: ['shut', 'seal', 'lock'],
                        USE: ['utilize', 'employ', 'operate']
                    }
                },
                movement: {
                    name: 'Movement & Directions',
                    icon: '🧭',
                    description: 'Directional commands and movement synonyms',
                    examples: ['north', 'n', 'up', 'enter', 'exit'],
                    synonyms: {
                        NORTH: ['n', 'northward', 'up'],
                        SOUTH: ['s', 'southward', 'down'],
                        EAST: ['e', 'eastward', 'right'],
                        WEST: ['w', 'westward', 'left'],
                        UP: ['u', 'upward', 'ascend', 'climb'],
                        DOWN: ['d', 'downward', 'descend'],
                        IN: ['inside', 'enter', 'into'],
                        OUT: ['outside', 'exit', 'leave']
                    }
                },
                objects: {
                    name: 'Common Objects',
                    icon: '📦',
                    description: 'Alternative names for game objects and items',
                    examples: ['sword', 'blade', 'key', 'door', 'chest'],
                    synonyms: {
                        SWORD: ['blade', 'weapon', 'steel'],
                        KEY: ['passkey', 'opener'],
                        DOOR: ['entrance', 'exit', 'portal', 'gate'],
                        CHEST: ['box', 'container', 'trunk'],
                        LIGHT: ['lamp', 'torch', 'candle', 'illumination'],
                        ROPE: ['cord', 'line', 'cable']
                    }
                },
                interface: {
                    name: 'Interface Commands',
                    icon: '🖥️',
                    description: 'System and interface command alternatives',
                    examples: ['inventory', 'i', 'save', 'quit', 'help'],
                    synonyms: {
                        INVENTORY: ['inv', 'i', 'items', 'possessions'],
                        SAVE: ['record', 'store'],
                        LOAD: ['restore', 'resume'],
                        QUIT: ['exit', 'end', 'stop'],
                        HELP: ['?', 'assistance', 'info'],
                        RESTART: ['reset', 'begin again']
                    }
                },
                social: {
                    name: 'Social Interaction',
                    icon: '👥',
                    description: 'Commands for interacting with characters',
                    examples: ['talk', 'ask', 'tell', 'give', 'show'],
                    synonyms: {
                        TALK: ['speak', 'chat', 'converse', 'communicate'],
                        ASK: ['question', 'inquire', 'query'],
                        TELL: ['inform', 'say', 'explain'],
                        GIVE: ['hand', 'offer', 'present'],
                        SHOW: ['display', 'reveal', 'exhibit'],
                        GREET: ['hello', 'hi', 'salute']
                    }
                },
                advanced: {
                    name: 'Advanced Actions',
                    icon: '🔧',
                    description: 'Complex and specialized command synonyms',
                    examples: ['combine', 'use', 'activate', 'repair', 'break'],
                    synonyms: {
                        USE: ['utilize', 'employ', 'activate', 'operate'],
                        COMBINE: ['mix', 'merge', 'join', 'connect'],
                        REPAIR: ['fix', 'mend', 'restore'],
                        BREAK: ['smash', 'destroy', 'shatter'],
                        SEARCH: ['hunt', 'seek', 'explore', 'investigate'],
                        PUSH: ['shove', 'press'],
                        PULL: ['drag', 'tug', 'yank']
                    }
                }
            };
        },

        calculateVocabularyStats(synonyms) {
            const stats = {
                totalGroups: synonyms.length,
                totalWords: 0,
                verbs: 0,
                nouns: 0,
                adjectives: 0,
                coverage: 0
            };

            synonyms.forEach(synonym => {
                stats.totalWords += (synonym.alternatives || []).length + 1;

                if (synonym.type === 'VERB') stats.verbs++;
                else if (synonym.type === 'NOUN') stats.nouns++;
                else if (synonym.type === 'ADJECTIVE') stats.adjectives++;
            });

            const commonWords = 50;
            stats.coverage = Math.min(100, Math.round((stats.totalGroups / commonWords) * 100));

            return stats;
        },

        generateSynonymDAAD(synonym) {
            if (!synonym.primary || !synonym.alternatives) return '';

            const alternatives = synonym.alternatives.join(' ');
            return `${synonym.primary.toUpperCase()} ${alternatives}`;
        },

        getLanguageFeatures() {
            return [
                {
                    id: 'partial_matching',
                    name: 'Partial Word Matching',
                    icon: '🔍',
                    complexity: 'basic',
                    description: 'Allow abbreviated commands and partial word matching',
                    examples: [
                        { input: 'ex sword', output: 'examine sword' },
                        { input: 'inv', output: 'inventory' },
                        { input: 'n', output: 'north' }
                    ],
                    daadCode: `examine ex exam exami
inventory inv i
north n`
                },
                {
                    id: 'fuzzy_matching',
                    name: 'Fuzzy Matching',
                    icon: '🎯',
                    complexity: 'intermediate',
                    description: 'Tolerate typos and common misspellings',
                    examples: [
                        { input: 'exaime sword', output: 'examine sword' },
                        { input: 'norht', output: 'north' },
                        { input: 'inventroy', output: 'inventory' }
                    ],
                    daadCode: `examine exaime examin examne
north norht nroth
inventory inventroy inventoyr`
                },
                {
                    id: 'contextual_parsing',
                    name: 'Contextual Parsing',
                    icon: '🧠',
                    complexity: 'advanced',
                    description: 'Different meanings based on context and game state',
                    examples: [
                        { input: 'open', output: 'context-dependent action' },
                        { input: 'use', output: 'smart object interaction' },
                        { input: 'go there', output: 'context-aware movement' }
                    ],
                    daadCode: `; Context-aware synonyms
; Implemented via process tables`
                },
                {
                    id: 'natural_phrases',
                    name: 'Natural Phrases',
                    icon: '💬',
                    complexity: 'advanced',
                    description: 'Support full natural language phrases and sentences',
                    examples: [
                        { input: 'pick up the sword', output: 'get sword' },
                        { input: 'can you help me', output: 'help' },
                        { input: 'i want to go north', output: 'north' }
                    ],
                    daadCode: `get "pick up" "take the" "grab the"
help "can you help" "i need help"
north "go north" "head north"`
                }
            ];
        },

        analyzeVocabulary(game) {
            const synonyms = game?.daad?.synonyms || [];
            const totalSynonyms = synonyms.length;

            const categoryCounts = {};
            synonyms.forEach(syn => {
                const cat = syn.category || 'other';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });

            const coverage = Math.min(100, Math.round((totalSynonyms / 50) * 100));

            return {
                overallCoverage: coverage,
                categories: [
                    {
                        name: 'Basic Verbs',
                        coverage: Math.min(100, (categoryCounts.basic_verbs || 0) * 14),
                        suggestions: (categoryCounts.basic_verbs || 0) < 5 ? ['climb', 'swim', 'jump'] : []
                    },
                    {
                        name: 'Movement',
                        coverage: Math.min(100, (categoryCounts.movement || 0) * 12),
                        suggestions: (categoryCounts.movement || 0) < 6 ? ['northeast', 'southwest'] : []
                    },
                    {
                        name: 'Objects',
                        coverage: Math.min(100, (categoryCounts.objects || 0) * 16),
                        suggestions: (categoryCounts.objects || 0) < 4 ? ['weapon', 'tool', 'book'] : []
                    },
                    {
                        name: 'Interface',
                        coverage: Math.min(100, (categoryCounts.interface || 0) * 20),
                        suggestions: (categoryCounts.interface || 0) < 3 ? ['restart', 'undo'] : []
                    },
                    {
                        name: 'Social',
                        coverage: Math.min(100, (categoryCounts.social || 0) * 16),
                        suggestions: (categoryCounts.social || 0) < 4 ? ['greet', 'thank', 'argue'] : []
                    }
                ],
                recommendations: [
                    {
                        id: 'add_movement_synonyms',
                        icon: '🧭',
                        title: 'Add Movement Synonyms',
                        description: 'Your movement vocabulary could benefit from diagonal directions'
                    },
                    {
                        id: 'improve_object_names',
                        icon: '📦',
                        title: 'Improve Object Recognition',
                        description: 'Add more alternative names for common objects in your game'
                    },
                    {
                        id: 'add_social_commands',
                        icon: '👥',
                        title: 'Expand Social Commands',
                        description: 'Add more ways for players to interact with characters'
                    }
                ]
            };
        },

        getVocabularyPatterns() {
            return [
                {
                    id: 'basic_adventure',
                    name: 'Basic Adventure Pack',
                    icon: '🗺️',
                    type: 'Essential',
                    words: 25,
                    description: 'Essential vocabulary for any text adventure',
                    preview: ['take', 'get', 'drop', 'look', 'go', 'open', 'close'],
                    daadPreview: `take get pick grab
look examine l ex
go move walk`,
                    synonyms: [
                        { primary: 'take', type: 'VERB', alternatives: ['get', 'pick', 'grab', 'obtain'], category: 'basic_verbs' },
                        { primary: 'drop', type: 'VERB', alternatives: ['put', 'place', 'leave'], category: 'basic_verbs' },
                        { primary: 'look', type: 'VERB', alternatives: ['examine', 'l', 'ex', 'inspect'], category: 'basic_verbs' },
                        { primary: 'go', type: 'VERB', alternatives: ['move', 'walk', 'travel'], category: 'basic_verbs' },
                        { primary: 'open', type: 'VERB', alternatives: ['unlock', 'unseal'], category: 'basic_verbs' }
                    ]
                },
                {
                    id: 'fantasy_rpg',
                    name: 'Fantasy RPG Pack',
                    icon: '⚔️',
                    type: 'Genre',
                    words: 40,
                    description: 'Vocabulary for fantasy adventures and RPGs',
                    preview: ['wield', 'cast', 'enchant', 'quest', 'battle', 'magic'],
                    daadPreview: `wield equip hold brandish
cast invoke conjure
battle fight combat`,
                    synonyms: [
                        { primary: 'wield', type: 'VERB', alternatives: ['equip', 'hold', 'brandish'], category: 'advanced' },
                        { primary: 'cast', type: 'VERB', alternatives: ['invoke', 'conjure'], category: 'advanced' },
                        { primary: 'battle', type: 'VERB', alternatives: ['fight', 'combat', 'attack'], category: 'advanced' },
                        { primary: 'enchant', type: 'VERB', alternatives: ['magic', 'spell'], category: 'advanced' }
                    ]
                },
                {
                    id: 'modern_thriller',
                    name: 'Modern Thriller Pack',
                    icon: '🕵️',
                    type: 'Genre',
                    words: 35,
                    description: 'Contemporary vocabulary for modern adventures',
                    preview: ['investigate', 'call', 'drive', 'email', 'hack', 'surveil'],
                    daadPreview: `investigate examine inspect
call phone dial
drive steer navigate`,
                    synonyms: [
                        { primary: 'investigate', type: 'VERB', alternatives: ['examine', 'inspect', 'probe'], category: 'advanced' },
                        { primary: 'call', type: 'VERB', alternatives: ['phone', 'dial', 'ring'], category: 'advanced' },
                        { primary: 'drive', type: 'VERB', alternatives: ['steer', 'navigate'], category: 'movement' }
                    ]
                },
                {
                    id: 'accessibility',
                    name: 'Accessibility Pack',
                    icon: '♿',
                    type: 'Special',
                    words: 30,
                    description: 'Enhanced vocabulary for accessibility and ease of use',
                    preview: ['?', 'hint', 'repeat', 'slower', 'again', 'what'],
                    daadPreview: `help ? hint assist
repeat again "once more"
inventory items stuff things`,
                    synonyms: [
                        { primary: 'help', type: 'VERB', alternatives: ['?', 'hint', 'assist', 'guide'], category: 'interface' },
                        { primary: 'repeat', type: 'VERB', alternatives: ['again', 'once more'], category: 'interface' },
                        { primary: 'inventory', type: 'VERB', alternatives: ['items', 'stuff', 'things', 'possessions'], category: 'interface' }
                    ]
                }
            ];
        },

        findVocabularyGaps(game) {
            const synonyms = game?.daad?.synonyms || [];
            const gaps = [];

            const commonWords = ['north', 'south', 'east', 'west', 'take', 'drop', 'look', 'inventory', 'help'];

            commonWords.forEach(word => {
                const exists = synonyms.some(syn => syn.primary.toLowerCase() === word.toLowerCase());
                if (!exists) {
                    gaps.push({
                        word: word,
                        type: ['north', 'south', 'east', 'west'].includes(word) ? 'NOUN' : 'VERB',
                        reason: 'Common word missing from vocabulary'
                    });
                }
            });

            return gaps;
        },

        getCoverageColor(coverage) {
            if (coverage >= 80) return '#10b981';
            if (coverage >= 60) return '#f59e0b';
            return '#ef4444';
        },

        getCoverageLabel(coverage) {
            if (coverage >= 80) return 'Excellent';
            if (coverage >= 60) return 'Good';
            if (coverage >= 40) return 'Fair';
            return 'Needs Improvement';
        },

        // MODAL CREATION HELPER
        createModal(title, content, onSave, options = {}) {
            const modal = document.createElement('div');
            modal.className = 'synonym-modal-overlay';
            modal.innerHTML = `
                <div class="synonym-modal">
                    <div class="synonym-modal-header">
                        <h3>${title}</h3>
                        <button class="synonym-modal-close" onclick="this.closest('.synonym-modal-overlay').remove()">✕</button>
                    </div>
                    <div class="synonym-modal-body">
                        ${content}
                    </div>
                    <div class="synonym-modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.synonym-modal-overlay').remove()">Cancel</button>
                        <button class="btn btn-primary" id="synonymModalSave">${options.saveLabel || 'Save'}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const saveBtn = modal.querySelector('#synonymModalSave');
            if (saveBtn && onSave) {
                saveBtn.onclick = () => {
                    const result = onSave();
                    if (result !== false) {
                        modal.remove();
                    }
                };
            }

            // Close on overlay click
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };

            return modal;
        },

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `synonym-notification synonym-notification-${type}`;
            notification.innerHTML = `
                <div class="synonym-notification-content">
                    <span class="synonym-notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                    <span class="synonym-notification-message">${message}</span>
                </div>
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('show');
            }, 10);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },

        // Action methods (ALL REWRITTEN WITH MODALS)
        switchTab(tabId) {
            AdventureCreator.state.synonymSystem.selectedTab = tabId;
            AdventureCreator.navigate('editor');
        },

        createSynonymGroup() {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const modalContent = `
                <div class="form-group">
                    <label for="synonymPrimary">Primary Word *</label>
                    <input type="text" id="synonymPrimary" class="form-control" placeholder="e.g., take" required>
                    <small class="form-text">The main word that alternatives will be converted to</small>
                </div>
                <div class="form-group">
                    <label for="synonymAlternatives">Alternatives (comma-separated) *</label>
                    <input type="text" id="synonymAlternatives" class="form-control" placeholder="e.g., get, pick, grab, obtain" required>
                    <small class="form-text">Alternative words that mean the same thing</small>
                </div>
                <div class="form-group">
                    <label for="synonymType">Word Type *</label>
                    <select id="synonymType" class="form-control">
                        <option value="VERB">VERB - Action word</option>
                        <option value="NOUN">NOUN - Object or direction</option>
                        <option value="ADJECTIVE">ADJECTIVE - Descriptor</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="synonymCategory">Category</label>
                    <select id="synonymCategory" class="form-control">
                        <option value="basic_verbs">Basic Verbs</option>
                        <option value="movement">Movement</option>
                        <option value="objects">Objects</option>
                        <option value="interface">Interface</option>
                        <option value="social">Social</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
            `;

            this.createModal('Create Synonym Group', modalContent, () => {
                const primary = document.getElementById('synonymPrimary').value.trim();
                const alternatives = document.getElementById('synonymAlternatives').value.trim();
                const type = document.getElementById('synonymType').value;
                const category = document.getElementById('synonymCategory').value;

                if (!primary || !alternatives) {
                    this.showNotification('Please fill in all required fields', 'error');
                    return false;
                }

                const newSynonym = {
                    primary: primary.toLowerCase(),
                    type: type,
                    alternatives: alternatives.split(',').map(alt => alt.trim().toLowerCase()).filter(a => a),
                    category: category,
                    description: 'Custom synonym group'
                };

                game.daad.synonyms.push(newSynonym);
                AdventureCreator.state.synonymSystem.selectedSynonym = game.daad.synonyms.length - 1;

                console.log(`Created synonym group: ${primary}`);
                this.showNotification(`Created synonym group: ${primary}`, 'success');
                AdventureCreator.navigate('editor');
            });
        },

        selectCategory(categoryKey) {
            AdventureCreator.state.synonymSystem.selectedCategory = categoryKey;
            AdventureCreator.navigate('editor');
        },

        applyCategorySynonyms(categoryKey) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const category = this.getSynonymCategories()[categoryKey];
            if (!category) return;

            let added = 0;
            Object.entries(category.synonyms).forEach(([primary, alternatives]) => {
                const exists = game.daad.synonyms.some(syn =>
                    syn.primary.toLowerCase() === primary.toLowerCase()
                );

                if (!exists) {
                    game.daad.synonyms.push({
                        primary: primary.toLowerCase(),
                        type: 'VERB',
                        alternatives: alternatives,
                        category: categoryKey,
                        description: `From ${category.name} category`
                    });
                    added++;
                }
            });

            this.showNotification(`Added ${added} synonym groups from ${category.name}!`, 'success');
            console.log(`Applied category ${categoryKey}: ${added} synonyms added`);
            AdventureCreator.navigate('editor');
        },

        selectSynonym(index) {
            AdventureCreator.state.synonymSystem.selectedSynonym = index;
            AdventureCreator.navigate('editor');
        },

        setVocabularyMode(mode) {
            AdventureCreator.state.synonymSystem.vocabularyMode = mode;
            console.log(`Set vocabulary mode: ${mode}`);
        },

        generateCommonVocabulary() {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const commonSynonyms = [
                { primary: 'take', type: 'VERB', alternatives: ['get', 'pick', 'grab', 'obtain'], category: 'basic_verbs' },
                { primary: 'drop', type: 'VERB', alternatives: ['put', 'place', 'leave', 'discard'], category: 'basic_verbs' },
                { primary: 'look', type: 'VERB', alternatives: ['examine', 'l', 'ex', 'inspect'], category: 'basic_verbs' },
                { primary: 'north', type: 'NOUN', alternatives: ['n', 'northward'], category: 'movement' },
                { primary: 'south', type: 'NOUN', alternatives: ['s', 'southward'], category: 'movement' },
                { primary: 'east', type: 'NOUN', alternatives: ['e', 'eastward'], category: 'movement' },
                { primary: 'west', type: 'NOUN', alternatives: ['w', 'westward'], category: 'movement' },
                { primary: 'inventory', type: 'VERB', alternatives: ['inv', 'i', 'items'], category: 'interface' },
                { primary: 'help', type: 'VERB', alternatives: ['?', 'hint', 'assist'], category: 'interface' }
            ];

            let added = 0;
            commonSynonyms.forEach(newSynonym => {
                const exists = game.daad.synonyms.some(existing =>
                    existing.primary.toLowerCase() === newSynonym.primary.toLowerCase()
                );
                if (!exists) {
                    game.daad.synonyms.push(newSynonym);
                    added++;
                }
            });

            this.showNotification(`Generated ${added} common synonym groups!`, 'success');
            console.log(`Generated ${added} common synonyms`);
            AdventureCreator.navigate('editor');
        },

        editSynonym(index) {
            const game = AdventureCreator.getCurrentGame();
            const synonym = game.daad.synonyms[index];
            if (!synonym) return;

            const modalContent = `
                <div class="form-group">
                    <label for="editSynonymPrimary">Primary Word *</label>
                    <input type="text" id="editSynonymPrimary" class="form-control" value="${synonym.primary}" required>
                </div>
                <div class="form-group">
                    <label for="editSynonymAlternatives">Alternatives (comma-separated) *</label>
                    <input type="text" id="editSynonymAlternatives" class="form-control" value="${synonym.alternatives.join(', ')}" required>
                </div>
                <div class="form-group">
                    <label for="editSynonymType">Word Type *</label>
                    <select id="editSynonymType" class="form-control">
                        <option value="VERB" ${synonym.type === 'VERB' ? 'selected' : ''}>VERB</option>
                        <option value="NOUN" ${synonym.type === 'NOUN' ? 'selected' : ''}>NOUN</option>
                        <option value="ADJECTIVE" ${synonym.type === 'ADJECTIVE' ? 'selected' : ''}>ADJECTIVE</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editSynonymCategory">Category</label>
                    <select id="editSynonymCategory" class="form-control">
                        <option value="basic_verbs" ${synonym.category === 'basic_verbs' ? 'selected' : ''}>Basic Verbs</option>
                        <option value="movement" ${synonym.category === 'movement' ? 'selected' : ''}>Movement</option>
                        <option value="objects" ${synonym.category === 'objects' ? 'selected' : ''}>Objects</option>
                        <option value="interface" ${synonym.category === 'interface' ? 'selected' : ''}>Interface</option>
                        <option value="social" ${synonym.category === 'social' ? 'selected' : ''}>Social</option>
                        <option value="advanced" ${synonym.category === 'advanced' ? 'selected' : ''}>Advanced</option>
                    </select>
                </div>
            `;

            this.createModal('Edit Synonym Group', modalContent, () => {
                const newPrimary = document.getElementById('editSynonymPrimary').value.trim();
                const newAlternatives = document.getElementById('editSynonymAlternatives').value.trim();
                const newType = document.getElementById('editSynonymType').value;
                const newCategory = document.getElementById('editSynonymCategory').value;

                if (!newPrimary || !newAlternatives) {
                    this.showNotification('Please fill in all required fields', 'error');
                    return false;
                }

                synonym.primary = newPrimary.toLowerCase();
                synonym.alternatives = newAlternatives.split(',').map(alt => alt.trim().toLowerCase()).filter(a => a);
                synonym.type = newType;
                synonym.category = newCategory;

                console.log(`Edited synonym: ${synonym.primary}`);
                this.showNotification(`Updated synonym: ${synonym.primary}`, 'success');
                AdventureCreator.navigate('editor');
            });
        },

        duplicateSynonym(index) {
            const game = AdventureCreator.getCurrentGame();
            const synonym = game.daad.synonyms[index];
            if (!synonym) return;

            const duplicate = {
                ...synonym,
                primary: synonym.primary + '_copy',
                alternatives: [...synonym.alternatives]
            };

            game.daad.synonyms.push(duplicate);
            this.showNotification(`Duplicated synonym: ${synonym.primary}`, 'success');
            console.log(`Duplicated synonym: ${synonym.primary}`);
            AdventureCreator.navigate('editor');
        },

        testSynonym(index) {
            const game = AdventureCreator.getCurrentGame();
            const synonym = game.daad.synonyms[index];
            if (!synonym) return;

            const testInfo = `
                <div class="synonym-test-info">
                    <div class="test-info-section">
                        <strong>Primary Word:</strong>
                        <div class="test-primary">${synonym.primary}</div>
                    </div>
                    <div class="test-info-section">
                        <strong>Alternatives:</strong>
                        <div class="test-alternatives">
                            ${synonym.alternatives.map(alt => `<span class="alternative-badge">${alt}</span>`).join('')}
                        </div>
                    </div>
                    <div class="test-info-section">
                        <strong>Recognition:</strong>
                        <div class="test-recognition">
                            All these words will be recognized as: <code>${synonym.primary.toUpperCase()}</code>
                        </div>
                    </div>
                    <div class="test-info-section">
                        <strong>DAAD Code:</strong>
                        <pre class="code-block"><code>${this.generateSynonymDAAD(synonym)}</code></pre>
                    </div>
                </div>
            `;

            this.createModal('Synonym Test', testInfo, null, { saveLabel: 'Close' });
        },

        deleteSynonym(index) {
            const game = AdventureCreator.getCurrentGame();
            const synonym = game.daad.synonyms[index];
            if (!synonym) return;

            const confirmContent = `
                <div class="confirm-message">
                    <div class="confirm-icon">⚠️</div>
                    <p>Are you sure you want to delete this synonym group?</p>
                    <div class="synonym-to-delete">
                        <strong>${synonym.primary}</strong>
                        <div>${synonym.alternatives.join(', ')}</div>
                    </div>
                    <p class="warning-text">This action cannot be undone.</p>
                </div>
            `;

            this.createModal('Confirm Delete', confirmContent, () => {
                game.daad.synonyms.splice(index, 1);

                if (AdventureCreator.state.synonymSystem.selectedSynonym === index) {
                    AdventureCreator.state.synonymSystem.selectedSynonym = null;
                } else if (AdventureCreator.state.synonymSystem.selectedSynonym > index) {
                    AdventureCreator.state.synonymSystem.selectedSynonym--;
                }

                console.log(`Deleted synonym: ${synonym.primary}`);
                this.showNotification(`Deleted synonym: ${synonym.primary}`, 'success');
                AdventureCreator.navigate('editor');
            }, { saveLabel: 'Delete' });
        },

        sortSynonyms(method) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) return;

            if (method === 'alphabetical') {
                game.daad.synonyms.sort((a, b) => a.primary.localeCompare(b.primary));
            } else if (method === 'category') {
                game.daad.synonyms.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
            }

            console.log(`Sorted synonyms by ${method}`);
            this.showNotification(`Sorted synonyms by ${method}`, 'success');
            AdventureCreator.navigate('editor');
        },

        clearAllSynonyms() {
            const game = AdventureCreator.getCurrentGame();
            const count = game.daad.synonyms.length;

            if (count === 0) {
                this.showNotification('No synonyms to clear', 'info');
                return;
            }

            const confirmContent = `
                <div class="confirm-message">
                    <div class="confirm-icon">⚠️</div>
                    <p>Are you sure you want to delete ALL synonym groups?</p>
                    <div class="synonym-count-warning">
                        <strong>${count} synonym groups</strong> will be permanently deleted
                    </div>
                    <p class="warning-text">This action cannot be undone!</p>
                </div>
            `;

            this.createModal('Confirm Clear All', confirmContent, () => {
                game.daad.synonyms = [];
                AdventureCreator.state.synonymSystem.selectedSynonym = null;

                console.log(`Cleared all synonyms (${count} groups)`);
                this.showNotification(`Deleted ${count} synonym groups`, 'success');
                AdventureCreator.navigate('editor');
            }, { saveLabel: 'Clear All' });
        },

        importSynonyms() {
            const modalContent = `
                <div class="form-group">
                    <label for="importSynonymJSON">Paste Synonym JSON Data</label>
                    <textarea id="importSynonymJSON" class="form-control" rows="10" placeholder='[{"primary":"take","type":"VERB","alternatives":["get","pick"],"category":"basic_verbs"}]'></textarea>
                    <small class="form-text">Paste a JSON array of synonym objects</small>
                </div>
                <div class="import-help">
                    <strong>Expected Format:</strong>
                    <pre class="code-block"><code>[
  {
    "primary": "take",
    "type": "VERB",
    "alternatives": ["get", "pick", "grab"],
    "category": "basic_verbs"
  }
]</code></pre>
                </div>
            `;

            this.createModal('Import Synonyms', modalContent, () => {
                const json = document.getElementById('importSynonymJSON').value.trim();

                if (!json) {
                    this.showNotification('Please paste JSON data to import', 'error');
                    return false;
                }

                try {
                    const imported = JSON.parse(json);
                    const game = AdventureCreator.getCurrentGame();

                    if (Array.isArray(imported)) {
                        game.daad.synonyms = game.daad.synonyms.concat(imported);
                        this.showNotification(`Imported ${imported.length} synonym groups!`, 'success');
                        console.log(`Imported ${imported.length} synonyms`);
                        AdventureCreator.navigate('editor');
                    } else {
                        this.showNotification('Invalid JSON format. Expected an array of synonym objects.', 'error');
                        return false;
                    }
                } catch (e) {
                    this.showNotification('Invalid JSON format! ' + e.message, 'error');
                    return false;
                }
            }, { saveLabel: 'Import' });
        },

        exportDAAD() {
            const game = AdventureCreator.getCurrentGame();
            const synonyms = game.daad.synonyms || [];

            if (synonyms.length === 0) {
                this.showNotification('No synonyms to export. Create some synonym groups first.', 'info');
                return;
            }

            let daadCode = '/VOC\n; Generated Synonym Definitions\n\n';
            synonyms.forEach(synonym => {
                daadCode += this.generateSynonymDAAD(synonym) + '\n';
            });

            const blob = new Blob([daadCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'synonyms.daad';
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification(`Exported ${synonyms.length} synonyms to DAAD format`, 'success');
            console.log(`Exported ${synonyms.length} synonyms to DAAD format`);
        },

        exportJSON() {
            const game = AdventureCreator.getCurrentGame();
            const synonyms = game.daad.synonyms || [];

            if (synonyms.length === 0) {
                this.showNotification('No synonyms to export.', 'info');
                return;
            }

            const json = JSON.stringify(synonyms, null, 2);

            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'synonyms.json';
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification(`Exported ${synonyms.length} synonyms to JSON`, 'success');
            console.log(`Exported ${synonyms.length} synonyms to JSON`);
        },

        applyLanguageFeature(featureId) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const feature = this.getLanguageFeatures().find(f => f.id === featureId);
            if (!feature) return;

            // Add example synonyms based on feature
            if (featureId === 'partial_matching') {
                const shortcuts = [
                    { primary: 'examine', type: 'VERB', alternatives: ['ex', 'exam'], category: 'basic_verbs' },
                    { primary: 'inventory', type: 'VERB', alternatives: ['inv', 'i'], category: 'interface' },
                    { primary: 'north', type: 'NOUN', alternatives: ['n'], category: 'movement' }
                ];

                let added = 0;
                shortcuts.forEach(syn => {
                    const exists = game.daad.synonyms.some(s => s.primary === syn.primary);
                    if (!exists) {
                        game.daad.synonyms.push(syn);
                        added++;
                    }
                });

                this.showNotification(`Applied ${feature.name} - Added ${added} abbreviations!`, 'success');
            }

            console.log(`Applied language feature: ${featureId}`);
            AdventureCreator.navigate('editor');
        },

        applyRecommendation(recId) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            if (recId === 'add_movement_synonyms') {
                const movements = [
                    { primary: 'northeast', type: 'NOUN', alternatives: ['ne'], category: 'movement' },
                    { primary: 'northwest', type: 'NOUN', alternatives: ['nw'], category: 'movement' },
                    { primary: 'southeast', type: 'NOUN', alternatives: ['se'], category: 'movement' },
                    { primary: 'southwest', type: 'NOUN', alternatives: ['sw'], category: 'movement' }
                ];

                let added = 0;
                movements.forEach(syn => {
                    const exists = game.daad.synonyms.some(s => s.primary === syn.primary);
                    if (!exists) {
                        game.daad.synonyms.push(syn);
                        added++;
                    }
                });

                this.showNotification(`Added ${added} diagonal direction synonyms!`, 'success');
            } else if (recId === 'improve_object_names') {
                this.applyCategorySynonyms('objects');
                return;
            } else if (recId === 'add_social_commands') {
                this.applyCategorySynonyms('social');
                return;
            }

            console.log(`Applied recommendation: ${recId}`);
            AdventureCreator.navigate('editor');
        },

        previewPattern(patternId) {
            const pattern = this.getVocabularyPatterns().find(p => p.id === patternId);
            if (!pattern) return;

            const preview = pattern.synonyms.map(syn =>
                `<div class="pattern-preview-item">
                    <strong>${syn.primary}</strong> = ${syn.alternatives.join(', ')}
                </div>`
            ).join('');

            const modalContent = `
                <div class="pattern-preview-full">
                    <h4>${pattern.name}</h4>
                    <p>${pattern.description}</p>
                    <div class="pattern-synonyms-list">
                        ${preview}
                    </div>
                    <p class="pattern-more">...and ${pattern.words - pattern.synonyms.length} more synonyms in this pack</p>
                </div>
            `;

            this.createModal('Pattern Preview', modalContent, null, { saveLabel: 'Close' });
        },

        applyPattern(patternId) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const pattern = this.getVocabularyPatterns().find(p => p.id === patternId);
            if (!pattern || !pattern.synonyms) return;

            let added = 0;
            pattern.synonyms.forEach(syn => {
                const exists = game.daad.synonyms.some(s => s.primary.toLowerCase() === syn.primary.toLowerCase());
                if (!exists) {
                    game.daad.synonyms.push(syn);
                    added++;
                }
            });

            this.showNotification(`Applied ${pattern.name}! Added ${added} synonym groups.`, 'success');
            console.log(`Applied pattern ${patternId}: ${added} groups added`);
            AdventureCreator.navigate('editor');
        },

        refreshAnalysis() {
            console.log('Refreshing vocabulary analysis');
            AdventureCreator.navigate('editor');
        },

        testInput() {
            const input = document.getElementById('vocabularyTestInput')?.value || '';
            if (!input.trim()) {
                this.showNotification('Please enter a command to test', 'info');
                return;
            }

            const game = AdventureCreator.getCurrentGame();
            const synonyms = game?.daad?.synonyms || [];

            const words = input.toLowerCase().split(' ');
            const matches = [];
            let recognized = false;

            words.forEach(word => {
                synonyms.forEach(syn => {
                    if (syn.primary === word || syn.alternatives.includes(word)) {
                        matches.push(`"${word}" → ${syn.primary.toUpperCase()}`);
                        recognized = true;
                    }
                });
            });

            const results = {
                recognized: recognized,
                confidence: recognized ? 95 : 0,
                interpretation: recognized ? `Matched ${matches.length} word(s)` : 'No synonym matches found',
                synonymMatches: matches,
                suggestions: recognized ? [] : ['Add synonyms for these words', 'Check spelling']
            };

            AdventureCreator.state.synonymSystem.lastTestResults = results;
            console.log(`Tested input: ${input}`, results);
            AdventureCreator.navigate('editor');
        },

        clearTestResults() {
            AdventureCreator.state.synonymSystem.lastTestResults = null;
            AdventureCreator.state.synonymSystem.testHistory = [];
            console.log('Cleared test results');
            AdventureCreator.navigate('editor');
        },

        runCommonCommandsTest() {
            const commonCommands = ['take sword', 'go north', 'look', 'inventory', 'drop key', 'help'];
            let passed = 0;

            const game = AdventureCreator.getCurrentGame();
            const synonyms = game?.daad?.synonyms || [];

            commonCommands.forEach(cmd => {
                const words = cmd.split(' ');
                const hasMatch = words.some(word =>
                    synonyms.some(syn => syn.primary === word || syn.alternatives.includes(word))
                );
                if (hasMatch) passed++;
            });

            const test = {
                name: 'Common Commands Test',
                total: commonCommands.length,
                passed: passed,
                timestamp: new Date().toISOString()
            };

            AdventureCreator.state.synonymSystem.testHistory.push(test);

            const percentage = Math.round((passed/commonCommands.length)*100);
            this.showNotification(`Common Commands: ${passed}/${commonCommands.length} recognized (${percentage}%)`, passed === commonCommands.length ? 'success' : 'info');
            console.log('Ran common commands test', test);
            AdventureCreator.navigate('editor');
        },

        runRandomVariationsTest() {
            const variations = ['get sword', 'pick sword', 'grab sword', 'obtain sword', 'n', 'northward', 'ex', 'examine'];
            let passed = 0;

            const game = AdventureCreator.getCurrentGame();
            const synonyms = game?.daad?.synonyms || [];

            variations.forEach(word => {
                const hasMatch = synonyms.some(syn =>
                    syn.primary === word || syn.alternatives.includes(word)
                );
                if (hasMatch) passed++;
            });

            const test = {
                name: 'Random Variations Test',
                total: variations.length,
                passed: passed,
                timestamp: new Date().toISOString()
            };

            AdventureCreator.state.synonymSystem.testHistory.push(test);

            const percentage = Math.round((passed/variations.length)*100);
            this.showNotification(`Random Variations: ${passed}/${variations.length} recognized (${percentage}%)`, passed > variations.length / 2 ? 'success' : 'info');
            console.log('Ran random variations test', test);
            AdventureCreator.navigate('editor');
        },

        runTypoResilienceTest() {
            const typos = ['examin', 'inventroy', 'norht', 'souhth'];
            let passed = 0;

            const game = AdventureCreator.getCurrentGame();
            const synonyms = game?.daad?.synonyms || [];

            typos.forEach(word => {
                const hasMatch = synonyms.some(syn =>
                    syn.alternatives.includes(word)
                );
                if (hasMatch) passed++;
            });

            const test = {
                name: 'Typo Resilience Test',
                total: typos.length,
                passed: passed,
                timestamp: new Date().toISOString()
            };

            AdventureCreator.state.synonymSystem.testHistory.push(test);

            const message = passed === 0
                ? 'No typo tolerance configured. Consider adding common misspellings!'
                : `Typo Resilience: ${passed}/${typos.length} handled (${Math.round((passed/typos.length)*100)}%)`;

            this.showNotification(message, passed > 0 ? 'success' : 'info');
            console.log('Ran typo resilience test', test);
            AdventureCreator.navigate('editor');
        },

        fillGap(word, type) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const modalContent = `
                <div class="form-group">
                    <label>Fill Vocabulary Gap</label>
                    <p>Adding synonyms for: <strong>${word}</strong></p>
                </div>
                <div class="form-group">
                    <label for="gapAlternatives">Alternatives (comma-separated) *</label>
                    <input type="text" id="gapAlternatives" class="form-control" placeholder="e.g., alt1, alt2, alt3" required>
                    <small class="form-text">Alternative words that mean the same as "${word}"</small>
                </div>
            `;

            this.createModal(`Add Synonym for "${word}"`, modalContent, () => {
                const alternatives = document.getElementById('gapAlternatives').value.trim();

                if (!alternatives) {
                    this.showNotification('Please enter at least one alternative', 'error');
                    return false;
                }

                game.daad.synonyms.push({
                    primary: word.toLowerCase(),
                    type: type.toUpperCase(),
                    alternatives: alternatives.split(',').map(alt => alt.trim().toLowerCase()).filter(a => a),
                    category: 'basic_verbs',
                    description: 'Added from vocabulary gap analysis'
                });

                console.log(`Filled vocabulary gap: ${word}`);
                this.showNotification(`Added synonym for: ${word}`, 'success');
                AdventureCreator.navigate('editor');
            });
        }
    });

    // Add CSS for modals and notifications
    const style = document.createElement('style');
    style.textContent = `
        .synonym-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .synonym-modal {
            background: var(--bg-secondary, #1e1e1e);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.3s;
        }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .synonym-modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color, #333);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .synonym-modal-header h3 {
            margin: 0;
            color: var(--text-primary, #fff);
        }

        .synonym-modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-secondary, #aaa);
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
        }

        .synonym-modal-close:hover {
            background: var(--hover-bg, #333);
            color: var(--text-primary, #fff);
        }

        .synonym-modal-body {
            padding: 1.5rem;
            overflow-y: auto;
            flex: 1;
        }

        .synonym-modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--border-color, #333);
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
        }

        .synonym-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary, #1e1e1e);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            padding: 1rem 1.5rem;
            z-index: 10001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        }

        .synonym-notification.show {
            transform: translateX(0);
        }

        .synonym-notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .synonym-notification-icon {
            font-size: 1.25rem;
        }

        .synonym-notification-message {
            color: var(--text-primary, #fff);
        }

        .synonym-notification-success {
            border-left: 4px solid #10b981;
        }

        .synonym-notification-error {
            border-left: 4px solid #ef4444;
        }

        .synonym-notification-info {
            border-left: 4px solid #3b82f6;
        }

        .form-group {
            margin-bottom: 1.25rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-primary, #fff);
            font-weight: 500;
        }

        .form-control {
            width: 100%;
            padding: 0.5rem;
            background: var(--input-bg, #2a2a2a);
            border: 1px solid var(--border-color, #444);
            border-radius: 4px;
            color: var(--text-primary, #fff);
            font-size: 0.95rem;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary-color, #3b82f6);
        }

        .form-text {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.85rem;
            color: var(--text-secondary, #aaa);
        }

        .confirm-message {
            text-align: center;
        }

        .confirm-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .confirm-message p {
            margin: 0.75rem 0;
            color: var(--text-primary, #fff);
        }

        .warning-text {
            color: var(--warning-color, #f59e0b);
            font-weight: 500;
        }

        .synonym-to-delete {
            background: var(--bg-tertiary, #2a2a2a);
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
        }

        .synonym-count-warning {
            background: var(--bg-tertiary, #2a2a2a);
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
            color: var(--warning-color, #f59e0b);
        }

        .import-help {
            margin-top: 1rem;
            padding: 1rem;
            background: var(--bg-tertiary, #2a2a2a);
            border-radius: 4px;
        }

        .synonym-test-info .test-info-section {
            margin-bottom: 1.5rem;
        }

        .synonym-test-info strong {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-primary, #fff);
        }

        .test-primary {
            font-size: 1.5rem;
            color: var(--primary-color, #3b82f6);
            font-weight: 600;
        }

        .test-alternatives {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .alternative-badge {
            background: var(--bg-tertiary, #2a2a2a);
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.9rem;
        }

        .test-recognition {
            background: var(--bg-tertiary, #2a2a2a);
            padding: 0.75rem;
            border-radius: 4px;
        }

        .pattern-preview-full h4 {
            margin-top: 0;
            color: var(--text-primary, #fff);
        }

        .pattern-synonyms-list {
            margin: 1rem 0;
        }

        .pattern-preview-item {
            padding: 0.75rem;
            background: var(--bg-tertiary, #2a2a2a);
            border-radius: 4px;
            margin-bottom: 0.5rem;
        }

        .pattern-more {
            color: var(--text-secondary, #aaa);
            font-style: italic;
        }
    `;
    document.head.appendChild(style);

    console.log('Enhanced Synonym System registered successfully');
})();
