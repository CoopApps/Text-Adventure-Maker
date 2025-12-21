/**
 * DAAD Adventure Creator - Puzzle Mechanics Module
 * Complete puzzle design, implementation, and DAAD code generation system
 */

(function() {
    'use strict';

    const PuzzleMechanicsModule = {
        name: 'Puzzle Mechanics',
        description: 'Design and implement puzzles with proper DAAD code generation',
        version: '1.0.0',
        author: 'DAAD Adventure Creator',

        // Module state
        state: {
            puzzles: [],
            currentPuzzle: null,
            templates: {},
            currentView: 'builder', // builder, library, testing
            testMode: {
                active: false,
                currentPuzzle: null,
                testResults: []
            },
            nextPuzzleId: 1,
            categories: ['locked-door', 'item-combination', 'riddle', 'sequence', 'inventory', 'conversation', 'custom']
        },

        /**
         * Initialize the module
         */
        init: function() {
            console.log('Initializing Puzzle Mechanics Module');
            this.loadTemplates();
            this.loadPuzzles();
            this.injectStyles();
        },

        /**
         * Inject CSS styles for the module
         */
        injectStyles: function() {
            if (document.getElementById('puzzle-mechanics-styles')) return;

            const style = document.createElement('style');
            style.id = 'puzzle-mechanics-styles';
            style.textContent = `
                /* Main Container */
                .puzzle-mechanics-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                /* Navigation Tabs */
                .puzzle-nav-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #2c3e50;
                    padding-bottom: 10px;
                }

                .puzzle-nav-tab {
                    padding: 10px 20px;
                    background: #34495e;
                    color: white;
                    border: none;
                    border-radius: 5px 5px 0 0;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .puzzle-nav-tab:hover {
                    background: #3d566e;
                    transform: translateY(-2px);
                }

                .puzzle-nav-tab.active {
                    background: #2c3e50;
                    font-weight: bold;
                }

                /* Builder Container */
                .puzzle-builder-container {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                /* Puzzle Grid */
                .puzzles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                /* Puzzle Card */
                .puzzle-card {
                    background: white;
                    border: 2px solid #ecf0f1;
                    border-radius: 8px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .puzzle-card:hover {
                    border-color: #3498db;
                    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
                    transform: translateY(-2px);
                }

                .puzzle-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 10px;
                }

                .puzzle-card-title {
                    font-weight: bold;
                    font-size: 16px;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }

                .puzzle-card-category {
                    display: inline-block;
                    padding: 3px 8px;
                    background: #3498db;
                    color: white;
                    border-radius: 12px;
                    font-size: 11px;
                    text-transform: uppercase;
                }

                .puzzle-card-description {
                    color: #7f8c8d;
                    font-size: 13px;
                    margin-bottom: 10px;
                    line-height: 1.4;
                }

                .puzzle-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #ecf0f1;
                }

                .puzzle-card-actions {
                    display: flex;
                    gap: 5px;
                }

                .puzzle-action-btn {
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s ease;
                }

                .puzzle-action-btn.edit {
                    background: #3498db;
                    color: white;
                }

                .puzzle-action-btn.delete {
                    background: #e74c3c;
                    color: white;
                }

                .puzzle-action-btn.test {
                    background: #2ecc71;
                    color: white;
                }

                .puzzle-action-btn:hover {
                    opacity: 0.8;
                    transform: scale(1.05);
                }

                /* Puzzle Editor */
                .puzzle-editor {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                }

                .puzzle-editor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #dee2e6;
                }

                .puzzle-editor-title {
                    font-size: 20px;
                    font-weight: bold;
                    color: #2c3e50;
                }

                .puzzle-editor-actions {
                    display: flex;
                    gap: 10px;
                }

                /* Property Sections */
                .property-section {
                    background: white;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 15px;
                    border: 1px solid #dee2e6;
                }

                .property-section-title {
                    font-weight: bold;
                    font-size: 14px;
                    color: #2c3e50;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #ecf0f1;
                }

                .property-row {
                    display: grid;
                    grid-template-columns: 150px 1fr;
                    gap: 15px;
                    margin-bottom: 12px;
                    align-items: start;
                }

                .property-label {
                    font-weight: 500;
                    color: #34495e;
                    padding-top: 8px;
                    font-size: 13px;
                }

                .property-input,
                .property-select,
                .property-textarea {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    font-size: 13px;
                    font-family: inherit;
                    transition: border-color 0.2s ease;
                }

                .property-input:focus,
                .property-select:focus,
                .property-textarea:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                }

                .property-textarea {
                    min-height: 80px;
                    resize: vertical;
                    font-family: 'Courier New', monospace;
                }

                .property-checkbox-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .property-checkbox {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                /* Template Grid */
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 15px;
                    margin-top: 20px;
                }

                .template-card {
                    background: white;
                    border: 2px solid #ecf0f1;
                    border-radius: 8px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .template-card:hover {
                    border-color: #9b59b6;
                    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.2);
                    transform: translateY(-2px);
                }

                .template-card-title {
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .template-card-description {
                    color: #7f8c8d;
                    font-size: 13px;
                    line-height: 1.4;
                    margin-bottom: 10px;
                }

                .template-card-category {
                    display: inline-block;
                    padding: 3px 10px;
                    background: #9b59b6;
                    color: white;
                    border-radius: 12px;
                    font-size: 11px;
                }

                /* Code Preview */
                .code-preview {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 15px;
                    border-radius: 6px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    overflow-x: auto;
                    margin-top: 10px;
                    line-height: 1.5;
                }

                .code-preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .code-preview-title {
                    font-weight: bold;
                    color: #61afef;
                }

                .code-copy-btn {
                    padding: 5px 12px;
                    background: #61afef;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .code-copy-btn:hover {
                    background: #4fa3e8;
                }

                /* Testing Panel */
                .testing-panel {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                }

                .test-results {
                    margin-top: 20px;
                }

                .test-result-item {
                    background: #f8f9fa;
                    border-left: 4px solid #3498db;
                    padding: 12px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                }

                .test-result-item.success {
                    border-left-color: #2ecc71;
                    background: #d4edda;
                }

                .test-result-item.warning {
                    border-left-color: #f39c12;
                    background: #fff3cd;
                }

                .test-result-item.error {
                    border-left-color: #e74c3c;
                    background: #f8d7da;
                }

                .test-result-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .test-result-message {
                    font-size: 13px;
                    color: #495057;
                }

                /* Buttons */
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .btn-primary {
                    background: #3498db;
                    color: white;
                }

                .btn-primary:hover {
                    background: #2980b9;
                }

                .btn-success {
                    background: #2ecc71;
                    color: white;
                }

                .btn-success:hover {
                    background: #27ae60;
                }

                .btn-danger {
                    background: #e74c3c;
                    color: white;
                }

                .btn-danger:hover {
                    background: #c0392b;
                }

                .btn-secondary {
                    background: #95a5a6;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #7f8c8d;
                }

                /* Validation Messages */
                .validation-message {
                    padding: 10px;
                    border-radius: 4px;
                    margin-top: 10px;
                    font-size: 13px;
                }

                .validation-message.error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .validation-message.success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .validation-message.warning {
                    background: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeaa7;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #7f8c8d;
                }

                .empty-state-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                }

                .empty-state-title {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .empty-state-message {
                    font-size: 14px;
                    margin-bottom: 20px;
                }

                /* Requirement List */
                .requirement-list {
                    background: #f8f9fa;
                    border-radius: 4px;
                    padding: 10px;
                }

                .requirement-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 5px;
                    font-size: 13px;
                }

                .requirement-item input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                }

                /* Solution Panel */
                .solution-panel {
                    background: #e8f5e9;
                    border: 1px solid #c8e6c9;
                    border-radius: 6px;
                    padding: 15px;
                    margin-top: 10px;
                }

                .solution-panel-title {
                    font-weight: bold;
                    color: #2e7d32;
                    margin-bottom: 10px;
                }

                /* Utility Classes */
                .mt-10 { margin-top: 10px; }
                .mt-20 { margin-top: 20px; }
                .mb-10 { margin-bottom: 10px; }
                .mb-20 { margin-bottom: 20px; }
                .text-center { text-align: center; }
                .text-muted { color: #6c757d; }
                .font-mono { font-family: 'Courier New', monospace; }
            `;
            document.head.appendChild(style);
        },

        /**
         * Load puzzle templates
         */
        loadTemplates: function() {
            this.state.templates = {
                'locked-door': {
                    name: 'Locked Door',
                    category: 'locked-door',
                    description: 'Door that requires a key to unlock',
                    requirements: [
                        { type: 'object', name: 'Key Object', value: '' },
                        { type: 'object', name: 'Door Object', value: '' },
                        { type: 'location', name: 'Locked Location', value: '' }
                    ],
                    solution: {
                        flagToSet: '',
                        itemRequired: '',
                        itemConsumed: false
                    }
                },
                'item-combination': {
                    name: 'Item Combination',
                    category: 'item-combination',
                    description: 'Combine multiple items to create a new item',
                    requirements: [
                        { type: 'object', name: 'First Item', value: '' },
                        { type: 'object', name: 'Second Item', value: '' },
                        { type: 'object', name: 'Result Item', value: '' }
                    ],
                    solution: {
                        flagToSet: '',
                        itemsRequired: [],
                        itemsConsumed: true,
                        resultItem: ''
                    }
                },
                'riddle': {
                    name: 'Riddle Puzzle',
                    category: 'riddle',
                    description: 'Player must answer a riddle correctly',
                    requirements: [
                        { type: 'text', name: 'Riddle Question', value: '' },
                        { type: 'text', name: 'Correct Answer', value: '' }
                    ],
                    solution: {
                        flagToSet: '',
                        correctAnswer: '',
                        reward: ''
                    }
                },
                'sequence': {
                    name: 'Sequence Puzzle',
                    category: 'sequence',
                    description: 'Actions must be performed in specific order',
                    requirements: [
                        { type: 'sequence', name: 'Action Sequence', value: [] }
                    ],
                    solution: {
                        flagToSet: '',
                        sequence: [],
                        resetOnError: true
                    }
                }
            };
        },

        /**
         * Load saved puzzles
         */
        loadPuzzles: function() {
            const saved = localStorage.getItem('daad_puzzles');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.state.puzzles = data.puzzles || [];
                    this.state.nextPuzzleId = data.nextId || 1;
                } catch (e) {
                    console.error('Error loading puzzles:', e);
                }
            }
        },

        /**
         * Save puzzles to storage
         */
        savePuzzles: function() {
            const data = {
                puzzles: this.state.puzzles,
                nextId: this.state.nextPuzzleId
            };
            localStorage.setItem('daad_puzzles', JSON.stringify(data));
        },

        /**
         * Render the module
         */
        render: function() {
            const state = this.state;

            return `
                <div class="puzzle-mechanics-container">
                    <div class="puzzle-nav-tabs">
                        <button class="puzzle-nav-tab ${state.currentView === 'builder' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('puzzle-mechanics').switchView('builder')">
                            Puzzle Builder
                        </button>
                        <button class="puzzle-nav-tab ${state.currentView === 'library' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('puzzle-mechanics').switchView('library')">
                            Template Library
                        </button>
                        <button class="puzzle-nav-tab ${state.currentView === 'testing' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('puzzle-mechanics').switchView('testing')">
                            Testing & Validation
                        </button>
                    </div>

                    ${this.renderCurrentView()}
                </div>
            `;
        },

        /**
         * Render current view
         */
        renderCurrentView: function() {
            switch (this.state.currentView) {
                case 'builder':
                    return this.renderBuilder();
                case 'library':
                    return this.renderLibrary();
                case 'testing':
                    return this.renderTesting();
                default:
                    return this.renderBuilder();
            }
        },

        /**
         * Render puzzle builder
         */
        renderBuilder: function() {
            if (this.state.currentPuzzle) {
                return this.renderPuzzleEditor();
            }

            return `
                <div class="puzzle-builder-container">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #2c3e50;">My Puzzles</h2>
                        <button class="btn btn-primary" onclick="AdventureCreator.getModule('puzzle-mechanics').createNewPuzzle()">
                            + Create New Puzzle
                        </button>
                    </div>

                    ${this.state.puzzles.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-state-icon">🧩</div>
                            <div class="empty-state-title">No Puzzles Yet</div>
                            <div class="empty-state-message">
                                Create your first puzzle or choose from the template library
                            </div>
                            <button class="btn btn-primary" onclick="AdventureCreator.getModule('puzzle-mechanics').createNewPuzzle()">
                                Create Puzzle
                            </button>
                        </div>
                    ` : `
                        <div class="puzzles-grid">
                            ${this.state.puzzles.map(puzzle => this.renderPuzzleCard(puzzle)).join('')}
                        </div>
                    `}
                </div>
            `;
        },

        /**
         * Render puzzle card
         */
        renderPuzzleCard: function(puzzle) {
            return `
                <div class="puzzle-card" onclick="AdventureCreator.getModule('puzzle-mechanics').editPuzzle(${puzzle.id})">
                    <div class="puzzle-card-header">
                        <div>
                            <div class="puzzle-card-title">${this.escapeHtml(puzzle.name)}</div>
                            <span class="puzzle-card-category">${puzzle.category}</span>
                        </div>
                    </div>
                    <div class="puzzle-card-description">
                        ${this.escapeHtml(puzzle.description || 'No description')}
                    </div>
                    <div class="puzzle-card-footer">
                        <div class="text-muted" style="font-size: 12px;">
                            ID: ${puzzle.id}
                        </div>
                        <div class="puzzle-card-actions">
                            <button class="puzzle-action-btn edit" onclick="event.stopPropagation(); AdventureCreator.getModule('puzzle-mechanics').editPuzzle(${puzzle.id})">
                                Edit
                            </button>
                            <button class="puzzle-action-btn test" onclick="event.stopPropagation(); AdventureCreator.getModule('puzzle-mechanics').testPuzzle(${puzzle.id})">
                                Test
                            </button>
                            <button class="puzzle-action-btn delete" onclick="event.stopPropagation(); AdventureCreator.getModule('puzzle-mechanics').deletePuzzle(${puzzle.id})">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Render puzzle editor
         */
        renderPuzzleEditor: function() {
            const puzzle = this.state.currentPuzzle;

            return `
                <div class="puzzle-editor">
                    <div class="puzzle-editor-header">
                        <div class="puzzle-editor-title">
                            ${puzzle.id ? 'Edit Puzzle' : 'Create New Puzzle'}
                        </div>
                        <div class="puzzle-editor-actions">
                            <button class="btn btn-success" onclick="AdventureCreator.getModule('puzzle-mechanics').savePuzzle()">
                                Save Puzzle
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.getModule('puzzle-mechanics').cancelEdit()">
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div class="property-section">
                        <div class="property-section-title">Basic Information</div>
                        <div class="property-row">
                            <label class="property-label">Puzzle Name:</label>
                            <input type="text" class="property-input" id="puzzle-name"
                                   value="${this.escapeHtml(puzzle.name)}"
                                   placeholder="e.g., Castle Gate Key">
                        </div>
                        <div class="property-row">
                            <label class="property-label">Category:</label>
                            <select class="property-select" id="puzzle-category">
                                ${this.state.categories.map(cat => `
                                    <option value="${cat}" ${puzzle.category === cat ? 'selected' : ''}>
                                        ${cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="property-row">
                            <label class="property-label">Description:</label>
                            <textarea class="property-textarea" id="puzzle-description"
                                      placeholder="Describe what this puzzle does...">${this.escapeHtml(puzzle.description)}</textarea>
                        </div>
                    </div>

                    <div class="property-section">
                        <div class="property-section-title">Requirements</div>
                        <div class="property-row">
                            <label class="property-label">Required Items:</label>
                            <input type="text" class="property-input" id="puzzle-items-required"
                                   value="${puzzle.requirements.itemsRequired || ''}"
                                   placeholder="e.g., 1,2,3 (object IDs)">
                        </div>
                        <div class="property-row">
                            <label class="property-label">Required Flags:</label>
                            <input type="text" class="property-input" id="puzzle-flags-required"
                                   value="${puzzle.requirements.flagsRequired || ''}"
                                   placeholder="e.g., 10,11,12">
                        </div>
                        <div class="property-row">
                            <label class="property-label">Required Location:</label>
                            <input type="number" class="property-input" id="puzzle-location"
                                   value="${puzzle.requirements.location || ''}"
                                   placeholder="Location ID">
                        </div>
                    </div>

                    <div class="property-section">
                        <div class="property-section-title">Solution</div>
                        <div class="property-row">
                            <label class="property-label">Success Flag:</label>
                            <input type="number" class="property-input" id="puzzle-flag-set"
                                   value="${puzzle.solution.flagToSet || ''}"
                                   placeholder="Flag to set when solved">
                        </div>
                        <div class="property-row">
                            <label class="property-label">Item Reward:</label>
                            <input type="number" class="property-input" id="puzzle-item-reward"
                                   value="${puzzle.solution.itemReward || ''}"
                                   placeholder="Object ID to give">
                        </div>
                        <div class="property-row">
                            <label class="property-label">Points Reward:</label>
                            <input type="number" class="property-input" id="puzzle-points-reward"
                                   value="${puzzle.solution.pointsReward || ''}"
                                   placeholder="Points to add (flag 50 = score)">
                        </div>
                        <div class="property-row">
                            <label class="property-label">Consume Items:</label>
                            <div class="property-checkbox-row">
                                <input type="checkbox" class="property-checkbox" id="puzzle-consume-items"
                                       ${puzzle.solution.consumeItems ? 'checked' : ''}>
                                <label for="puzzle-consume-items">Remove items when puzzle is solved</label>
                            </div>
                        </div>
                    </div>

                    <div class="property-section">
                        <div class="property-section-title">DAAD Code Preview</div>
                        <div class="code-preview">
                            <div class="code-preview-header">
                                <span class="code-preview-title">Generated DAAD Code</span>
                                <button class="code-copy-btn" onclick="AdventureCreator.getModule('puzzle-mechanics').copyCode()">
                                    Copy Code
                                </button>
                            </div>
                            <pre id="puzzle-code-preview">${this.generateDAADCode(puzzle)}</pre>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Render template library
         */
        renderLibrary: function() {
            return `
                <div class="puzzle-builder-container">
                    <h2 style="margin-bottom: 20px; color: #2c3e50;">Puzzle Templates</h2>
                    <div class="template-grid">
                        ${Object.entries(this.state.templates).map(([key, template]) => `
                            <div class="template-card" onclick="AdventureCreator.getModule('puzzle-mechanics').useTemplate('${key}')">
                                <div class="template-card-title">${template.name}</div>
                                <div class="template-card-description">${template.description}</div>
                                <span class="template-card-category">${template.category}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        /**
         * Render testing panel
         */
        renderTesting: function() {
            return `
                <div class="testing-panel">
                    <h2 style="margin-bottom: 20px; color: #2c3e50;">Puzzle Testing & Validation</h2>

                    <div class="property-section">
                        <div class="property-section-title">Quick Validation</div>
                        <p class="text-muted">Check all puzzles for common issues</p>
                        <button class="btn btn-primary" onclick="AdventureCreator.getModule('puzzle-mechanics').validateAllPuzzles()">
                            Validate All Puzzles
                        </button>
                    </div>

                    <div class="test-results" id="test-results">
                        ${this.state.testMode.testResults.length > 0 ? `
                            ${this.state.testMode.testResults.map(result => `
                                <div class="test-result-item ${result.type}">
                                    <div class="test-result-title">${result.title}</div>
                                    <div class="test-result-message">${result.message}</div>
                                </div>
                            `).join('')}
                        ` : `
                            <div class="empty-state">
                                <div class="empty-state-icon">✓</div>
                                <div class="empty-state-title">No Test Results</div>
                                <div class="empty-state-message">Run validation to see results</div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        },

        /**
         * Generate DAAD code for puzzle
         */
        generateDAADCode: function(puzzle) {
            let code = '; Puzzle: ' + puzzle.name + '\n';
            code += '; Category: ' + puzzle.category + '\n';
            code += '; ' + puzzle.description + '\n\n';

            // Determine process based on category
            const process = puzzle.category === 'locked-door' ? 1 : 2;

            code += `; Add to Process ${process}\n`;
            code += 'AT _\n';

            // Add location check if specified
            if (puzzle.requirements.location) {
                code += `AT ${puzzle.requirements.location}\n`;
            }

            // Add item requirements
            if (puzzle.requirements.itemsRequired) {
                const items = puzzle.requirements.itemsRequired.toString().split(',').map(i => i.trim()).filter(i => i);
                items.forEach(item => {
                    code += `CARRIED ${item}\n`;
                });
            }

            // Add flag requirements
            if (puzzle.requirements.flagsRequired) {
                const flags = puzzle.requirements.flagsRequired.toString().split(',').map(f => f.trim()).filter(f => f);
                flags.forEach(flag => {
                    code += `EQ ${flag} 1\n`;
                });
            }

            code += 'THEN\n';

            // Consume items if specified
            if (puzzle.solution.consumeItems && puzzle.requirements.itemsRequired) {
                const items = puzzle.requirements.itemsRequired.toString().split(',').map(i => i.trim()).filter(i => i);
                items.forEach(item => {
                    code += `  DROP ${item}  ; Remove item\n`;
                    code += `  PLACE ${item} 253  ; Put in limbo\n`;
                });
            }

            // Give reward item
            if (puzzle.solution.itemReward) {
                code += `  PLACE ${puzzle.solution.itemReward} 252  ; Give to player\n`;
                code += `  GET ${puzzle.solution.itemReward}\n`;
            }

            // Add points
            if (puzzle.solution.pointsReward) {
                code += `  PLUS ${puzzle.solution.pointsReward} 50  ; Add to score\n`;
            }

            // Set success flag
            if (puzzle.solution.flagToSet) {
                code += `  SET ${puzzle.solution.flagToSet} 1  ; Mark solved\n`;
            }

            code += '  MESSAGE 0  ; Success message\n';
            code += '  DESC  ; Redescribe\n';
            code += 'DONE\n';

            return code;
        },

        /**
         * Switch view
         */
        switchView: function(view) {
            this.state.currentView = view;
            this.state.currentPuzzle = null;
            AdventureCreator.navigate('puzzle-mechanics');
        },

        /**
         * Create new puzzle
         */
        createNewPuzzle: function() {
            this.state.currentPuzzle = {
                id: null,
                name: '',
                category: 'locked-door',
                description: '',
                requirements: {
                    itemsRequired: '',
                    flagsRequired: '',
                    location: ''
                },
                solution: {
                    flagToSet: '',
                    itemReward: '',
                    pointsReward: '',
                    consumeItems: false
                }
            };
            AdventureCreator.navigate('puzzle-mechanics');
        },

        /**
         * Edit puzzle
         */
        editPuzzle: function(id) {
            const puzzle = this.state.puzzles.find(p => p.id === id);
            if (puzzle) {
                this.state.currentPuzzle = JSON.parse(JSON.stringify(puzzle));
                AdventureCreator.navigate('puzzle-mechanics');
            }
        },

        /**
         * Save puzzle
         */
        savePuzzle: function() {
            const puzzle = this.state.currentPuzzle;

            // Get values from form
            puzzle.name = document.getElementById('puzzle-name').value.trim();
            puzzle.category = document.getElementById('puzzle-category').value;
            puzzle.description = document.getElementById('puzzle-description').value.trim();
            puzzle.requirements.itemsRequired = document.getElementById('puzzle-items-required').value.trim();
            puzzle.requirements.flagsRequired = document.getElementById('puzzle-flags-required').value.trim();
            puzzle.requirements.location = document.getElementById('puzzle-location').value.trim();
            puzzle.solution.flagToSet = document.getElementById('puzzle-flag-set').value.trim();
            puzzle.solution.itemReward = document.getElementById('puzzle-item-reward').value.trim();
            puzzle.solution.pointsReward = document.getElementById('puzzle-points-reward').value.trim();
            puzzle.solution.consumeItems = document.getElementById('puzzle-consume-items').checked;

            // Validate
            if (!puzzle.name) {
                alert('Please enter a puzzle name');
                return;
            }

            // Save or update
            if (puzzle.id) {
                const index = this.state.puzzles.findIndex(p => p.id === puzzle.id);
                if (index !== -1) {
                    this.state.puzzles[index] = puzzle;
                }
            } else {
                puzzle.id = this.state.nextPuzzleId++;
                this.state.puzzles.push(puzzle);
            }

            this.savePuzzles();
            this.state.currentPuzzle = null;
            AdventureCreator.navigate('puzzle-mechanics');
        },

        /**
         * Cancel edit
         */
        cancelEdit: function() {
            this.state.currentPuzzle = null;
            AdventureCreator.navigate('puzzle-mechanics');
        },

        /**
         * Delete puzzle
         */
        deletePuzzle: function(id) {
            if (confirm('Are you sure you want to delete this puzzle?')) {
                this.state.puzzles = this.state.puzzles.filter(p => p.id !== id);
                this.savePuzzles();
                AdventureCreator.navigate('puzzle-mechanics');
            }
        },

        /**
         * Test puzzle
         */
        testPuzzle: function(id) {
            const puzzle = this.state.puzzles.find(p => p.id === id);
            if (!puzzle) return;

            const results = [];

            // Check if puzzle has name
            if (!puzzle.name) {
                results.push({
                    type: 'error',
                    title: 'Missing Name',
                    message: 'Puzzle must have a name'
                });
            }

            // Check if puzzle has requirements or solution
            const hasRequirements = puzzle.requirements.itemsRequired ||
                                   puzzle.requirements.flagsRequired ||
                                   puzzle.requirements.location;
            const hasSolution = puzzle.solution.flagToSet ||
                               puzzle.solution.itemReward ||
                               puzzle.solution.pointsReward;

            if (!hasRequirements && !hasSolution) {
                results.push({
                    type: 'warning',
                    title: 'Incomplete Puzzle',
                    message: 'Puzzle has no requirements or solution defined'
                });
            }

            // Validate DAAD code
            const code = this.generateDAADCode(puzzle);
            if (code.includes('undefined') || code.includes('NaN')) {
                results.push({
                    type: 'error',
                    title: 'Invalid DAAD Code',
                    message: 'Generated code contains invalid values'
                });
            } else {
                results.push({
                    type: 'success',
                    title: 'Valid DAAD Code',
                    message: 'Generated code looks correct'
                });
            }

            this.state.testMode.testResults = results;
            this.switchView('testing');
        },

        /**
         * Validate all puzzles
         */
        validateAllPuzzles: function() {
            const results = [];

            if (this.state.puzzles.length === 0) {
                results.push({
                    type: 'warning',
                    title: 'No Puzzles',
                    message: 'No puzzles to validate'
                });
            } else {
                this.state.puzzles.forEach(puzzle => {
                    // Check name
                    if (!puzzle.name || puzzle.name.trim() === '') {
                        results.push({
                            type: 'error',
                            title: `Puzzle ${puzzle.id}: Missing Name`,
                            message: 'Puzzle must have a name'
                        });
                    }

                    // Check if puzzle does something
                    const hasRequirements = puzzle.requirements.itemsRequired ||
                                           puzzle.requirements.flagsRequired ||
                                           puzzle.requirements.location;
                    const hasSolution = puzzle.solution.flagToSet ||
                                       puzzle.solution.itemReward ||
                                       puzzle.solution.pointsReward;

                    if (!hasRequirements && !hasSolution) {
                        results.push({
                            type: 'warning',
                            title: `Puzzle ${puzzle.id}: ${puzzle.name}`,
                            message: 'Puzzle has no requirements or solution'
                        });
                    } else {
                        results.push({
                            type: 'success',
                            title: `Puzzle ${puzzle.id}: ${puzzle.name}`,
                            message: 'Puzzle configuration looks good'
                        });
                    }
                });
            }

            this.state.testMode.testResults = results;
            AdventureCreator.navigate('puzzle-mechanics');
        },

        /**
         * Use template
         */
        useTemplate: function(templateKey) {
            const template = this.state.templates[templateKey];
            if (!template) return;

            this.state.currentPuzzle = {
                id: null,
                name: template.name,
                category: template.category,
                description: template.description,
                requirements: {
                    itemsRequired: '',
                    flagsRequired: '',
                    location: ''
                },
                solution: JSON.parse(JSON.stringify(template.solution))
            };

            this.switchView('builder');
        },

        /**
         * Copy code to clipboard
         */
        copyCode: function() {
            const code = document.getElementById('puzzle-code-preview').textContent;
            navigator.clipboard.writeText(code).then(() => {
                alert('Code copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
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
        AdventureCreator.registerModule('puzzle-mechanics', PuzzleMechanicsModule);
    }

})();
