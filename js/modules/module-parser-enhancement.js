/**
 * DAAD Adventure Creator - Parser Enhancement Module
 * Interactive parser configuration with DAAD vocabulary generation
 */

(function() {
    'use strict';

    const ParserEnhancementModule = {
        name: 'Parser Enhancement',
        description: 'Advanced input parsing and DAAD vocabulary management',
        version: '1.0.0',
        author: 'DAAD Adventure Creator',

        // Module state
        state: {
            synonyms: [],
            abbreviations: [],
            vocabulary: [],
            currentView: 'synonyms', // synonyms, testing, settings, export
            testInput: '',
            testResults: null,
            settings: {
                caseInsensitive: true,
                autoSuggest: true,
                maxSynonyms: 50
            },
            nextSynonymId: 1,
            stats: {
                totalSynonyms: 0,
                totalTests: 0,
                lastModified: null
            }
        },

        /**
         * Initialize the module
         */
        init: function() {
            console.log('Initializing Parser Enhancement Module');
            this.loadData();
            this.injectStyles();
        },

        /**
         * Inject CSS styles
         */
        injectStyles: function() {
            if (document.getElementById('parser-enhancement-styles')) return;

            const style = document.createElement('style');
            style.id = 'parser-enhancement-styles';
            style.textContent = `
                .parser-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .parser-nav-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #8b5cf6;
                    padding-bottom: 10px;
                }

                .parser-nav-tab {
                    padding: 10px 20px;
                    background: #34495e;
                    color: white;
                    border: none;
                    border-radius: 5px 5px 0 0;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .parser-nav-tab:hover {
                    background: #3d566e;
                    transform: translateY(-2px);
                }

                .parser-nav-tab.active {
                    background: #8b5cf6;
                    font-weight: bold;
                }

                .parser-content {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .synonym-form {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border: 2px solid #8b5cf6;
                }

                .synonym-form-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 15px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 150px 1fr;
                    gap: 15px;
                    margin-bottom: 15px;
                    align-items: center;
                }

                .form-label {
                    font-weight: 500;
                    color: #34495e;
                }

                .form-input,
                .form-select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .form-input:focus,
                .form-select:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }

                .form-help {
                    grid-column: 2;
                    font-size: 12px;
                    color: #6c757d;
                    margin-top: -10px;
                }

                .synonym-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                .synonym-table th {
                    background: #8b5cf6;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }

                .synonym-table td {
                    padding: 12px;
                    border-bottom: 1px solid #dee2e6;
                }

                .synonym-table tr:hover {
                    background: #f8f9fa;
                }

                .synonym-word {
                    font-weight: 600;
                    color: #2c3e50;
                }

                .synonym-target {
                    color: #8b5cf6;
                    font-family: monospace;
                }

                .synonym-type-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .synonym-type-verb {
                    background: #3498db;
                    color: white;
                }

                .synonym-type-noun {
                    background: #2ecc71;
                    color: white;
                }

                .synonym-type-adverb {
                    background: #f39c12;
                    color: white;
                }

                .action-btn {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s ease;
                }

                .action-btn.delete {
                    background: #e74c3c;
                    color: white;
                }

                .action-btn.delete:hover {
                    background: #c0392b;
                }

                .test-panel {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .test-input-area {
                    margin-bottom: 20px;
                }

                .test-input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #8b5cf6;
                    border-radius: 6px;
                    font-size: 16px;
                    font-family: monospace;
                }

                .test-results {
                    background: white;
                    border-radius: 6px;
                    padding: 15px;
                    margin-top: 15px;
                }

                .test-result-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #dee2e6;
                }

                .test-result-label {
                    font-weight: 600;
                    color: #34495e;
                }

                .test-result-value {
                    color: #8b5cf6;
                    font-family: monospace;
                }

                .code-output {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 20px;
                    border-radius: 6px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    overflow-x: auto;
                    line-height: 1.6;
                    margin-top: 15px;
                }

                .code-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .code-title {
                    font-weight: bold;
                    color: #61afef;
                }

                .settings-grid {
                    display: grid;
                    gap: 20px;
                    margin-top: 20px;
                }

                .setting-item {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    border-left: 4px solid #8b5cf6;
                }

                .setting-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .setting-label {
                    font-weight: 600;
                    color: #2c3e50;
                }

                .setting-description {
                    font-size: 13px;
                    color: #6c757d;
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.4s;
                    border-radius: 24px;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }

                input:checked + .toggle-slider {
                    background-color: #8b5cf6;
                }

                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 20px;
                }

                .stat-card {
                    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .stat-label {
                    font-size: 14px;
                    opacity: 0.9;
                }

                .info-box {
                    background: #e8f4fd;
                    border: 1px solid #b3d7f2;
                    border-left: 4px solid #3498db;
                    padding: 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }

                .info-box-title {
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .info-box-content {
                    color: #34495e;
                    font-size: 14px;
                    line-height: 1.6;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #7f8c8d;
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                }

                .vocabulary-example {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    padding: 15px;
                    margin-top: 15px;
                }

                .vocabulary-example-title {
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }

                .vocabulary-code {
                    font-family: monospace;
                    font-size: 13px;
                    color: #8b5cf6;
                    line-height: 1.8;
                }
            `;
            document.head.appendChild(style);
        },

        /**
         * Load saved data
         */
        loadData: function() {
            const saved = localStorage.getItem('daad_parser_data');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.state.synonyms = data.synonyms || [];
                    this.state.abbreviations = data.abbreviations || [];
                    this.state.settings = data.settings || this.state.settings;
                    this.state.stats = data.stats || this.state.stats;
                    this.state.nextSynonymId = data.nextId || 1;
                } catch (e) {
                    console.error('Error loading parser data:', e);
                }
            }
        },

        /**
         * Save data
         */
        saveData: function() {
            const data = {
                synonyms: this.state.synonyms,
                abbreviations: this.state.abbreviations,
                settings: this.state.settings,
                stats: this.state.stats,
                nextId: this.state.nextSynonymId
            };
            localStorage.setItem('daad_parser_data', JSON.stringify(data));
            this.state.stats.lastModified = new Date().toISOString();
        },

        /**
         * Render the module
         */
        render: function() {
            return `
                <div class="parser-container">
                    <div class="parser-nav-tabs">
                        <button class="parser-nav-tab ${this.state.currentView === 'synonyms' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('parser-enhancement').switchView('synonyms')">
                            📝 Synonym Editor
                        </button>
                        <button class="parser-nav-tab ${this.state.currentView === 'testing' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('parser-enhancement').switchView('testing')">
                            🧪 Input Testing
                        </button>
                        <button class="parser-nav-tab ${this.state.currentView === 'export' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('parser-enhancement').switchView('export')">
                            📤 DAAD Export
                        </button>
                        <button class="parser-nav-tab ${this.state.currentView === 'settings' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('parser-enhancement').switchView('settings')">
                            ⚙️ Settings
                        </button>
                    </div>

                    <div class="parser-content">
                        ${this.renderCurrentView()}
                    </div>
                </div>
            `;
        },

        /**
         * Render current view
         */
        renderCurrentView: function() {
            switch (this.state.currentView) {
                case 'synonyms':
                    return this.renderSynonymEditor();
                case 'testing':
                    return this.renderTestingPanel();
                case 'export':
                    return this.renderExportPanel();
                case 'settings':
                    return this.renderSettingsPanel();
                default:
                    return this.renderSynonymEditor();
            }
        },

        /**
         * Render synonym editor
         */
        renderSynonymEditor: function() {
            return `
                <div class="info-box">
                    <div class="info-box-title">💡 About DAAD Synonyms</div>
                    <div class="info-box-content">
                        DAAD uses vocabulary tables to define synonyms. Each word can map to a primary verb or noun.
                        This system allows players to use different words for the same action (e.g., "take" = "get" = "grab").
                    </div>
                </div>

                <div class="synonym-form">
                    <div class="synonym-form-title">Add New Synonym</div>
                    <div class="form-row">
                        <label class="form-label">Synonym Word:</label>
                        <input type="text" class="form-input" id="synonym-word"
                               placeholder="e.g., grab, examine, n">
                    </div>
                    <div class="form-help">The alternative word players can type</div>

                    <div class="form-row">
                        <label class="form-label">Maps To:</label>
                        <input type="text" class="form-input" id="synonym-target"
                               placeholder="e.g., take, look, north">
                    </div>
                    <div class="form-help">The primary word this synonym represents</div>

                    <div class="form-row">
                        <label class="form-label">Type:</label>
                        <select class="form-select" id="synonym-type">
                            <option value="verb">Verb (Action)</option>
                            <option value="noun">Noun (Object/Direction)</option>
                            <option value="adverb">Adverb (Modifier)</option>
                        </select>
                    </div>
                    <div class="form-help">Word type for proper vocabulary table placement</div>

                    <div class="form-row">
                        <label class="form-label"></label>
                        <button class="btn btn-primary" onclick="AdventureCreator.getModule('parser-enhancement').addSynonym()">
                            Add Synonym
                        </button>
                    </div>
                </div>

                ${this.state.synonyms.length > 0 ? `
                    <div style="margin-top: 20px;">
                        <h3 style="color: #2c3e50; margin-bottom: 15px;">Defined Synonyms (${this.state.synonyms.length})</h3>
                        <table class="synonym-table">
                            <thead>
                                <tr>
                                    <th>Synonym</th>
                                    <th>Maps To</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.state.synonyms.map(syn => `
                                    <tr>
                                        <td class="synonym-word">${this.escapeHtml(syn.word)}</td>
                                        <td class="synonym-target">${this.escapeHtml(syn.target)}</td>
                                        <td>
                                            <span class="synonym-type-badge synonym-type-${syn.type}">
                                                ${syn.type}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="action-btn delete"
                                                    onclick="AdventureCreator.getModule('parser-enhancement').deleteSynonym(${syn.id})">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">📚</div>
                        <h3>No Synonyms Defined</h3>
                        <p>Add your first synonym to enhance player input recognition</p>
                    </div>
                `}

                <div class="vocabulary-example">
                    <div class="vocabulary-example-title">Example DAAD Vocabulary Entry:</div>
                    <div class="vocabulary-code">
                        _ GRAB      ; Synonym word<br>
                        _ TAKE      ; Maps to primary verb<br>
                        _ *         ; End marker
                    </div>
                </div>
            `;
        },

        /**
         * Render testing panel
         */
        renderTestingPanel: function() {
            return `
                <div class="info-box">
                    <div class="info-box-title">🧪 Test Parser Input</div>
                    <div class="info-box-content">
                        Test how player input would be interpreted with your current synonym definitions.
                        Type a command as players would enter it.
                    </div>
                </div>

                <div class="test-panel">
                    <div class="test-input-area">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #2c3e50;">
                            Enter Command:
                        </label>
                        <input type="text" class="test-input" id="test-input"
                               placeholder="e.g., grab sword, x door, n"
                               onkeyup="if(event.key === 'Enter') AdventureCreator.getModule('parser-enhancement').testInput()">
                        <button class="btn btn-primary" style="margin-top: 10px;"
                                onclick="AdventureCreator.getModule('parser-enhancement').testInput()">
                            Test Input
                        </button>
                    </div>

                    ${this.state.testResults ? `
                        <div class="test-results">
                            <h4 style="color: #2c3e50; margin-bottom: 15px;">Parse Results:</h4>
                            <div class="test-result-row">
                                <span class="test-result-label">Original Input:</span>
                                <span class="test-result-value">${this.escapeHtml(this.state.testResults.original)}</span>
                            </div>
                            <div class="test-result-row">
                                <span class="test-result-label">Processed Input:</span>
                                <span class="test-result-value">${this.escapeHtml(this.state.testResults.processed)}</span>
                            </div>
                            <div class="test-result-row">
                                <span class="test-result-label">Words Found:</span>
                                <span class="test-result-value">${this.state.testResults.wordCount}</span>
                            </div>
                            <div class="test-result-row">
                                <span class="test-result-label">Synonyms Applied:</span>
                                <span class="test-result-value">${this.state.testResults.synonymsApplied}</span>
                            </div>
                            ${this.state.testResults.replacements.length > 0 ? `
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                                    <strong style="color: #2c3e50;">Replacements Made:</strong>
                                    <ul style="margin: 10px 0; padding-left: 20px;">
                                        ${this.state.testResults.replacements.map(r => `
                                            <li style="color: #6c757d; margin: 5px 0;">
                                                "${r.from}" → "${r.to}" (${r.type})
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="empty-state" style="padding: 40px 20px;">
                            <div class="empty-icon">⌨️</div>
                            <p>Enter a command above to see how it would be parsed</p>
                        </div>
                    `}
                </div>

                <div style="margin-top: 20px;">
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Testing Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${this.state.stats.totalTests}</div>
                            <div class="stat-label">Tests Run</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${this.state.synonyms.length}</div>
                            <div class="stat-label">Active Synonyms</div>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Render export panel
         */
        renderExportPanel: function() {
            const daadCode = this.generateDAADVocabulary();

            return `
                <div class="info-box">
                    <div class="info-box-title">📤 Export to DAAD</div>
                    <div class="info-box-content">
                        Generate DAAD vocabulary table code from your synonyms. Copy this code into your DAAD game's
                        vocabulary section to enable all defined synonyms.
                    </div>
                </div>

                ${this.state.synonyms.length > 0 ? `
                    <div style="margin-top: 20px;">
                        <div class="code-header">
                            <h3 class="code-title">Generated DAAD Vocabulary Code</h3>
                            <button class="btn btn-primary" onclick="AdventureCreator.getModule('parser-enhancement').copyCode()">
                                Copy to Clipboard
                            </button>
                        </div>
                        <div class="code-output" id="daad-vocab-code">
<pre>${daadCode}</pre>
                        </div>

                        <div style="margin-top: 20px;">
                            <button class="btn btn-success" onclick="AdventureCreator.getModule('parser-enhancement').downloadVocab()">
                                Download as .txt
                            </button>
                        </div>
                    </div>

                    <div class="vocabulary-example" style="margin-top: 20px;">
                        <div class="vocabulary-example-title">How to Use in DAAD:</div>
                        <div class="info-box-content">
                            <ol style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                                <li>Copy the generated vocabulary code above</li>
                                <li>Open your DAAD game source file</li>
                                <li>Find the /VOC (vocabulary) section</li>
                                <li>Paste the code into the appropriate verb or noun tables</li>
                                <li>Compile your game to activate the synonyms</li>
                            </ol>
                        </div>
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h3>No Synonyms to Export</h3>
                        <p>Add some synonyms first to generate DAAD vocabulary code</p>
                        <button class="btn btn-primary" style="margin-top: 15px;"
                                onclick="AdventureCreator.getModule('parser-enhancement').switchView('synonyms')">
                            Add Synonyms
                        </button>
                    </div>
                `}
            `;
        },

        /**
         * Render settings panel
         */
        renderSettingsPanel: function() {
            return `
                <h2 style="color: #2c3e50; margin-bottom: 20px;">Parser Settings</h2>

                <div class="settings-grid">
                    <div class="setting-item">
                        <div class="setting-header">
                            <div>
                                <div class="setting-label">Case Insensitive Parsing</div>
                                <div class="setting-description">Treat uppercase and lowercase as identical</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-case-insensitive"
                                       ${this.state.settings.caseInsensitive ? 'checked' : ''}
                                       onchange="AdventureCreator.getModule('parser-enhancement').updateSetting('caseInsensitive', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="setting-header">
                            <div>
                                <div class="setting-label">Auto Suggestions</div>
                                <div class="setting-description">Show command suggestions during testing</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-auto-suggest"
                                       ${this.state.settings.autoSuggest ? 'checked' : ''}
                                       onchange="AdventureCreator.getModule('parser-enhancement').updateSetting('autoSuggest', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="setting-header">
                            <div>
                                <div class="setting-label">Maximum Synonyms</div>
                                <div class="setting-description">Limit total number of synonym definitions</div>
                            </div>
                            <input type="number" class="form-input" style="width: 100px;"
                                   value="${this.state.settings.maxSynonyms}"
                                   onchange="AdventureCreator.getModule('parser-enhancement').updateSetting('maxSynonyms', parseInt(this.value))">
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${this.state.synonyms.length}</div>
                            <div class="stat-label">Total Synonyms</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${this.state.stats.totalTests}</div>
                            <div class="stat-label">Tests Performed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${this.state.stats.lastModified ? new Date(this.state.stats.lastModified).toLocaleDateString() : 'Never'}</div>
                            <div class="stat-label">Last Modified</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Data Management</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="AdventureCreator.getModule('parser-enhancement').exportData()">
                            Export All Data
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.getModule('parser-enhancement').importData()">
                            Import Data
                        </button>
                        <button class="btn btn-danger" onclick="AdventureCreator.getModule('parser-enhancement').clearAllData()">
                            Clear All Data
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * Switch view
         */
        switchView: function(view) {
            this.state.currentView = view;
            AdventureCreator.navigate('parser-enhancement');
        },

        /**
         * Add synonym
         */
        addSynonym: function() {
            const word = document.getElementById('synonym-word').value.trim().toLowerCase();
            const target = document.getElementById('synonym-target').value.trim().toLowerCase();
            const type = document.getElementById('synonym-type').value;

            if (!word || !target) {
                alert('Please enter both synonym word and target word');
                return;
            }

            if (this.state.synonyms.length >= this.state.settings.maxSynonyms) {
                alert(`Maximum synonyms limit (${this.state.settings.maxSynonyms}) reached`);
                return;
            }

            // Check for duplicates
            if (this.state.synonyms.some(s => s.word === word)) {
                alert(`Synonym "${word}" already exists`);
                return;
            }

            this.state.synonyms.push({
                id: this.state.nextSynonymId++,
                word: word,
                target: target,
                type: type
            });

            this.state.stats.totalSynonyms = this.state.synonyms.length;
            this.saveData();

            // Clear form
            document.getElementById('synonym-word').value = '';
            document.getElementById('synonym-target').value = '';

            AdventureCreator.navigate('parser-enhancement');
        },

        /**
         * Delete synonym
         */
        deleteSynonym: function(id) {
            if (confirm('Delete this synonym?')) {
                this.state.synonyms = this.state.synonyms.filter(s => s.id !== id);
                this.state.stats.totalSynonyms = this.state.synonyms.length;
                this.saveData();
                AdventureCreator.navigate('parser-enhancement');
            }
        },

        /**
         * Test input
         */
        testInput: function() {
            const input = document.getElementById('test-input').value.trim();

            if (!input) {
                alert('Please enter a command to test');
                return;
            }

            const processed = this.state.settings.caseInsensitive ? input.toLowerCase() : input;
            const words = processed.split(/\s+/);
            const replacements = [];

            // Apply synonyms
            const processedWords = words.map(word => {
                const synonym = this.state.synonyms.find(s => s.word === word);
                if (synonym) {
                    replacements.push({
                        from: word,
                        to: synonym.target,
                        type: synonym.type
                    });
                    return synonym.target;
                }
                return word;
            });

            this.state.testResults = {
                original: input,
                processed: processedWords.join(' '),
                wordCount: words.length,
                synonymsApplied: replacements.length,
                replacements: replacements
            };

            this.state.stats.totalTests++;
            this.saveData();

            AdventureCreator.navigate('parser-enhancement');
        },

        /**
         * Generate DAAD vocabulary code
         */
        generateDAADVocabulary: function() {
            let code = '; Generated DAAD Vocabulary Code\n';
            code += '; Created by DAAD Adventure Creator Parser Enhancement\n';
            code += '; ' + new Date().toISOString() + '\n\n';

            // Group by type
            const verbs = this.state.synonyms.filter(s => s.type === 'verb');
            const nouns = this.state.synonyms.filter(s => s.type === 'noun');
            const adverbs = this.state.synonyms.filter(s => s.type === 'adverb');

            if (verbs.length > 0) {
                code += '; VERB SYNONYMS\n';
                code += '; Add these to your verb vocabulary table\n\n';
                verbs.forEach(syn => {
                    code += `_ ${syn.word.toUpperCase().padEnd(12)} ; Synonym for ${syn.target}\n`;
                    code += `_ ${syn.target.toUpperCase().padEnd(12)} ; Primary verb\n`;
                    code += `_ *\n\n`;
                });
            }

            if (nouns.length > 0) {
                code += '; NOUN SYNONYMS\n';
                code += '; Add these to your noun vocabulary table\n\n';
                nouns.forEach(syn => {
                    code += `_ ${syn.word.toUpperCase().padEnd(12)} ; Synonym for ${syn.target}\n`;
                    code += `_ ${syn.target.toUpperCase().padEnd(12)} ; Primary noun\n`;
                    code += `_ *\n\n`;
                });
            }

            if (adverbs.length > 0) {
                code += '; ADVERB SYNONYMS\n';
                code += '; Add these to your adverb vocabulary table\n\n';
                adverbs.forEach(syn => {
                    code += `_ ${syn.word.toUpperCase().padEnd(12)} ; Synonym for ${syn.target}\n`;
                    code += `_ ${syn.target.toUpperCase().padEnd(12)} ; Primary adverb\n`;
                    code += `_ *\n\n`;
                });
            }

            return code;
        },

        /**
         * Copy code to clipboard
         */
        copyCode: function() {
            const code = this.generateDAADVocabulary();
            navigator.clipboard.writeText(code).then(() => {
                alert('DAAD vocabulary code copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        },

        /**
         * Download vocabulary
         */
        downloadVocab: function() {
            const code = this.generateDAADVocabulary();
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'daad-vocabulary.txt';
            a.click();
            URL.revokeObjectURL(url);
        },

        /**
         * Update setting
         */
        updateSetting: function(key, value) {
            this.state.settings[key] = value;
            this.saveData();
        },

        /**
         * Export all data
         */
        exportData: function() {
            const data = {
                synonyms: this.state.synonyms,
                settings: this.state.settings,
                stats: this.state.stats,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'parser-enhancement-data.json';
            a.click();
            URL.revokeObjectURL(url);
        },

        /**
         * Import data
         */
        importData: function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const data = JSON.parse(event.target.result);
                            if (confirm('This will replace all current data. Continue?')) {
                                this.state.synonyms = data.synonyms || [];
                                this.state.settings = data.settings || this.state.settings;
                                this.state.stats = data.stats || this.state.stats;
                                this.saveData();
                                AdventureCreator.navigate('parser-enhancement');
                                alert('Data imported successfully!');
                            }
                        } catch (err) {
                            alert('Error importing data: ' + err.message);
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        },

        /**
         * Clear all data
         */
        clearAllData: function() {
            if (confirm('Delete ALL synonyms and data? This cannot be undone!')) {
                this.state.synonyms = [];
                this.state.abbreviations = [];
                this.state.stats = {
                    totalSynonyms: 0,
                    totalTests: 0,
                    lastModified: null
                };
                this.saveData();
                AdventureCreator.navigate('parser-enhancement');
                alert('All data cleared');
            }
        },

        /**
         * Escape HTML
         */
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text || '';
            return div.innerHTML;
        }
    };

    // Register the module
    if (typeof AdventureCreator !== 'undefined') {
        AdventureCreator.registerModule('parser-enhancement', ParserEnhancementModule);
    }

})();
