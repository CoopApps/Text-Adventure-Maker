/**
 * DAAD Adventure Creator - Object Location System
 * Complete object manipulation, positioning, and testing system
 */

(function() {
    'use strict';

    const ObjectLocationModule = {
        name: 'Object Location System',
        description: 'Advanced object manipulation and positioning with live testing',
        version: '1.0.0',
        author: 'DAAD Adventure Creator',

        // Module state
        state: {
            currentTab: 'location_queries',
            viewMode: 'grid',
            testMode: {
                active: false,
                operation: null,
                parameters: {},
                results: null
            },
            operations: [],
            nextOperationId: 1
        },

        /**
         * Initialize the module
         */
        init: function() {
            console.log('Initializing Object Location System Module');
            this.loadData();
            this.injectStyles();
        },

        /**
         * Inject CSS styles
         */
        injectStyles: function() {
            if (document.getElementById('object-location-styles')) return;

            const style = document.createElement('style');
            style.id = 'object-location-styles';
            style.textContent = `
                .object-location-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .location-header {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #8b5cf6;
                }

                .location-header h2 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                }

                .location-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .location-tab {
                    background: #34495e;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 20px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    min-width: 140px;
                }

                .location-tab:hover {
                    background: #3d566e;
                    transform: translateY(-2px);
                }

                .location-tab.active {
                    background: var(--tab-color, #8b5cf6);
                    font-weight: bold;
                }

                .tab-icon {
                    font-size: 24px;
                }

                .tab-label {
                    font-size: 13px;
                }

                .location-content {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }

                .category-title {
                    font-size: 24px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--category-color, #2c3e50);
                }

                .category-description {
                    color: #6c757d;
                    margin-bottom: 20px;
                    line-height: 1.6;
                }

                .operations-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
                    gap: 20px;
                }

                .operation-card {
                    background: #f8f9fa;
                    border: 2px solid #dee2e6;
                    border-left: 4px solid var(--operation-color, #3498db);
                    border-radius: 8px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .operation-card:hover {
                    border-color: var(--operation-color, #3498db);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }

                .operation-type-badge {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: var(--operation-color, #3498db);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .operation-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .operation-icon {
                    font-size: 24px;
                }

                .operation-name {
                    font-weight: 600;
                    color: #2c3e50;
                    font-size: 16px;
                    flex: 1;
                    padding-right: 80px;
                }

                .operation-complexity {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .complexity-basic {
                    background: #2ecc71;
                    color: white;
                }

                .complexity-intermediate {
                    background: #f39c12;
                    color: white;
                }

                .complexity-advanced {
                    background: #e74c3c;
                    color: white;
                }

                .operation-description {
                    color: #495057;
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 15px;
                }

                .operation-examples {
                    background: white;
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 12px;
                }

                .examples-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #3498db;
                    margin-bottom: 8px;
                }

                .example-item {
                    font-size: 13px;
                    color: #6c757d;
                    margin-bottom: 5px;
                    padding-left: 15px;
                    position: relative;
                }

                .example-item::before {
                    content: "▸";
                    position: absolute;
                    left: 0;
                    color: #3498db;
                }

                .operation-use-cases {
                    background: white;
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 12px;
                }

                .use-cases-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #2ecc71;
                    margin-bottom: 8px;
                }

                .use-case-item {
                    font-size: 13px;
                    color: #6c757d;
                    margin-bottom: 5px;
                    padding-left: 15px;
                    position: relative;
                }

                .use-case-item::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #2ecc71;
                }

                .operation-action-btn {
                    width: 100%;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .operation-action-btn:hover {
                    background: #2980b9;
                    transform: translateY(-1px);
                }

                .visualizer-panel {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .visualizer-controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    align-items: center;
                }

                .view-toggle {
                    background: #34495e;
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .view-toggle:hover {
                    background: #3d566e;
                }

                .view-toggle.active {
                    background: #8b5cf6;
                    font-weight: bold;
                }

                .visualizer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                }

                .location-card {
                    background: white;
                    border-radius: 6px;
                    padding: 15px;
                    border-left: 4px solid #3498db;
                }

                .location-name {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }

                .object-item {
                    background: #f8f9fa;
                    border-radius: 4px;
                    padding: 8px;
                    margin: 5px 0;
                    border-left: 2px solid #2ecc71;
                    font-size: 14px;
                }

                .empty-location {
                    color: #95a5a6;
                    font-style: italic;
                    font-size: 14px;
                }

                .test-panel {
                    background: #e8f4fd;
                    border: 2px solid #3498db;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                }

                .test-panel-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 15px;
                }

                .test-form {
                    background: white;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 15px;
                }

                .test-result {
                    background: white;
                    border-radius: 6px;
                    padding: 15px;
                    border-left: 4px solid #2ecc71;
                }

                .test-result.error {
                    border-left-color: #e74c3c;
                    background: #fee;
                }

                .test-result.success {
                    border-left-color: #2ecc71;
                    background: #efe;
                }

                .examples-panel {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                }

                .examples-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }

                .example-system {
                    background: white;
                    border-radius: 6px;
                    padding: 15px;
                    border-left: 4px solid var(--example-color, #8b5cf6);
                }

                .system-title {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .system-description {
                    color: #6c757d;
                    font-size: 14px;
                    margin-bottom: 10px;
                }

                .system-code {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 12px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 12px;
                    margin-bottom: 10px;
                    line-height: 1.5;
                    overflow-x: auto;
                }

                .system-explanation {
                    color: #95a5a6;
                    font-size: 13px;
                    font-style: italic;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 2px solid #dee2e6;
                }

                .modal-header h3 {
                    margin: 0;
                    color: #2c3e50;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 28px;
                    color: #95a5a6;
                    cursor: pointer;
                    line-height: 1;
                }

                .modal-close:hover {
                    color: #2c3e50;
                }

                .modal-body {
                    padding: 20px;
                }

                .parameter-form {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 15px 0;
                }

                .parameter-row {
                    margin-bottom: 15px;
                }

                .parameter-label {
                    display: block;
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 5px;
                    font-size: 14px;
                }

                .parameter-input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .parameter-input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                }

                .parameter-help {
                    font-size: 12px;
                    color: #6c757d;
                    margin-top: 5px;
                }

                .modal-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                @media (max-width: 768px) {
                    .operations-grid {
                        grid-template-columns: 1fr;
                    }

                    .visualizer-grid {
                        grid-template-columns: 1fr;
                    }

                    .examples-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        /**
         * Load saved data
         */
        loadData: function() {
            const saved = localStorage.getItem('daad_object_location_data');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.state.operations = data.operations || [];
                    this.state.nextOperationId = data.nextId || 1;
                } catch (e) {
                    console.error('Error loading object location data:', e);
                }
            }
        },

        /**
         * Save data
         */
        saveData: function() {
            const data = {
                operations: this.state.operations,
                nextId: this.state.nextOperationId
            };
            localStorage.setItem('daad_object_location_data', JSON.stringify(data));
        },

        /**
         * Get operation definitions
         */
        getOperationDefinitions: function() {
            return {
                location_queries: {
                    title: "📍 Location Queries",
                    description: "Check where objects are located and test their positions",
                    icon: "📍",
                    color: "#3498db",
                    operations: {
                        ISAT: {
                            name: "Object is at location",
                            description: "Tests if an object is currently at a particular location",
                            parameters: [
                                { name: "object", type: "object", description: "Object to check" },
                                { name: "location", type: "location", description: "Location to test" }
                            ],
                            examples: [
                                "Check if key is in treasure room",
                                "Verify statue is in temple"
                            ],
                            useCases: [
                                "Remote object tracking",
                                "Puzzle state verification",
                                "Security systems"
                            ],
                            daadCode: "ISAT",
                            category: "basic",
                            icon: "📍",
                            type: "condition"
                        },
                        ISNOTAT: {
                            name: "Object is NOT at location",
                            description: "Tests if an object is anywhere except the specified location",
                            parameters: [
                                { name: "object", type: "object", description: "Object to check" },
                                { name: "location", type: "location", description: "Location it shouldn't be at" }
                            ],
                            examples: [
                                "Detect artifact stolen from museum",
                                "Notice guard left post"
                            ],
                            useCases: [
                                "Theft detection",
                                "Missing object alerts",
                                "Dynamic story branching"
                            ],
                            daadCode: "ISNOTAT",
                            category: "basic",
                            icon: "❌",
                            type: "condition"
                        }
                    }
                },
                object_copying: {
                    title: "📋 Object Copying",
                    description: "Copy object locations and properties",
                    icon: "📋",
                    color: "#2ecc71",
                    operations: {
                        COPYOF: {
                            name: "Copy object location to flag",
                            description: "Copies the current location number of an object into a flag",
                            parameters: [
                                { name: "object", type: "object", description: "Object to track" },
                                { name: "flag", type: "flag", description: "Flag to store location" }
                            ],
                            examples: [
                                "Remember where player dropped sword",
                                "Track NPC position"
                            ],
                            useCases: [
                                "Object tracking systems",
                                "Save/restore positions",
                                "Movement algorithms"
                            ],
                            daadCode: "COPYOF",
                            category: "intermediate",
                            icon: "📋",
                            type: "action"
                        },
                        COPYOO: {
                            name: "Copy object location to object",
                            description: "Moves second object to wherever first object is",
                            parameters: [
                                { name: "source_object", type: "object", description: "Object to copy from" },
                                { name: "target_object", type: "object", description: "Object to move" }
                            ],
                            examples: [
                                "Make dog follow player",
                                "Synchronize paired items"
                            ],
                            useCases: [
                                "Companion systems",
                                "Item synchronization",
                                "Object mirroring"
                            ],
                            daadCode: "COPYOO",
                            category: "advanced",
                            icon: "🔗",
                            type: "action"
                        },
                        COPYFO: {
                            name: "Copy flag value to object location",
                            description: "Moves object to location number stored in flag",
                            parameters: [
                                { name: "flag", type: "flag", description: "Flag with location number" },
                                { name: "object", type: "object", description: "Object to move" }
                            ],
                            examples: [
                                "Teleport to calculated location",
                                "Restore saved position"
                            ],
                            useCases: [
                                "Calculated placement",
                                "Random distribution",
                                "Save/load systems"
                            ],
                            daadCode: "COPYFO",
                            category: "advanced",
                            icon: "🎯",
                            type: "action"
                        }
                    }
                },
                positioning: {
                    title: "📐 Positioning",
                    description: "Direct object placement and movement",
                    icon: "📐",
                    color: "#8b5cf6",
                    operations: {
                        PLACE: {
                            name: "Place object at location",
                            description: "Directly moves object to specified location",
                            parameters: [
                                { name: "object", type: "object", description: "Object to move" },
                                { name: "location", type: "location", description: "Destination location" }
                            ],
                            examples: [
                                "Place key in hidden chamber",
                                "Teleport crystal to tower"
                            ],
                            useCases: [
                                "Direct positioning",
                                "Teleportation",
                                "Puzzle setup"
                            ],
                            daadCode: "PLACE",
                            category: "basic",
                            icon: "📍",
                            type: "action"
                        },
                        PUTO: {
                            name: "Put object in current room",
                            description: "Moves object to player's current location",
                            parameters: [
                                { name: "object", type: "object", description: "Object to bring here" }
                            ],
                            examples: [
                                "Summon wares to display",
                                "Materialize needed item"
                            ],
                            useCases: [
                                "Item summoning",
                                "Context delivery",
                                "NPC interaction"
                            ],
                            daadCode: "PUTO",
                            category: "basic",
                            icon: "📦",
                            type: "action"
                        }
                    }
                },
                containers: {
                    title: "📦 Containers",
                    description: "Objects within objects",
                    icon: "📦",
                    color: "#f39c12",
                    operations: {
                        PUTIN: {
                            name: "Put object in container",
                            description: "Places object inside another object",
                            parameters: [
                                { name: "object", type: "object", description: "Object to put inside" },
                                { name: "container", type: "object", description: "Container object" }
                            ],
                            examples: [
                                "Put coins in pouch",
                                "Hide key in statue"
                            ],
                            useCases: [
                                "Inventory organization",
                                "Hidden compartments",
                                "Nested objects"
                            ],
                            daadCode: "PUTIN",
                            category: "intermediate",
                            icon: "📥",
                            type: "action"
                        },
                        TAKEOUT: {
                            name: "Remove from container",
                            description: "Takes object out of another object",
                            parameters: [
                                { name: "object", type: "object", description: "Object to remove" },
                                { name: "container", type: "object", description: "Container it's in" }
                            ],
                            examples: [
                                "Remove scroll from tube",
                                "Extract gem from case"
                            ],
                            useCases: [
                                "Container unpacking",
                                "Object revelation",
                                "Puzzle solving"
                            ],
                            daadCode: "TAKEOUT",
                            category: "intermediate",
                            icon: "📤",
                            type: "action"
                        }
                    }
                }
            };
        },

        /**
         * Render the module
         */
        render: function() {
            const currentTab = this.state.currentTab;
            const definitions = this.getOperationDefinitions();

            return `
                <div class="object-location-container">
                    <div class="location-header">
                        <h2>📍 Object Location System</h2>
                        <p style="color: #6c757d; margin: 5px 0;">
                            Advanced object manipulation, positioning, and container mechanics with live testing.
                        </p>
                    </div>

                    <div class="location-tabs">
                        ${this.renderTabs(definitions, currentTab)}
                    </div>

                    <div class="location-content">
                        ${this.renderContent(definitions, currentTab)}
                    </div>

                    ${this.renderVisualizer()}
                    ${this.renderExamples()}
                </div>
            `;
        },

        /**
         * Render tabs
         */
        renderTabs: function(definitions, currentTab) {
            return Object.entries(definitions).map(([key, def]) => `
                <button class="location-tab ${currentTab === key ? 'active' : ''}"
                        style="--tab-color: ${def.color}"
                        onclick="AdventureCreator.getModule('object-location-system').switchTab('${key}')">
                    <div class="tab-icon">${def.icon}</div>
                    <div class="tab-label">${def.title.replace(/[📍📋📐📦]/g, '').trim()}</div>
                </button>
            `).join('');
        },

        /**
         * Render content for current tab
         */
        renderContent: function(definitions, currentTab) {
            const def = definitions[currentTab];
            if (!def) return '<div>Category not found</div>';

            return `
                <div class="category-title" style="--category-color: ${def.color}">
                    ${def.icon} ${def.title}
                </div>
                <div class="category-description">${def.description}</div>

                <div class="operations-grid">
                    ${Object.entries(def.operations).map(([key, op]) =>
                        this.renderOperationCard(key, op, def.color)
                    ).join('')}
                </div>
            `;
        },

        /**
         * Render operation card
         */
        renderOperationCard: function(key, operation, color) {
            return `
                <div class="operation-card" style="--operation-color: ${color}">
                    <div class="operation-type-badge">${operation.type}</div>

                    <div class="operation-header">
                        <div class="operation-icon">${operation.icon}</div>
                        <div class="operation-name">${operation.name}</div>
                    </div>

                    <span class="operation-complexity complexity-${operation.category}">
                        ${operation.category}
                    </span>

                    <div class="operation-description">${operation.description}</div>

                    <div class="operation-examples">
                        <div class="examples-title">💡 Examples</div>
                        ${operation.examples.map(ex => `
                            <div class="example-item">${ex}</div>
                        `).join('')}
                    </div>

                    <div class="operation-use-cases">
                        <div class="use-cases-title">🎯 Use Cases</div>
                        ${operation.useCases.map(uc => `
                            <div class="use-case-item">${uc}</div>
                        `).join('')}
                    </div>

                    <button class="operation-action-btn"
                            onclick="AdventureCreator.getModule('object-location-system').testOperation('${key}')">
                        🧪 Test ${operation.name}
                    </button>
                </div>
            `;
        },

        /**
         * Render object visualizer
         */
        renderVisualizer: function() {
            return `
                <div class="visualizer-panel">
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">🗺️ Object Location Visualizer</h3>

                    <div class="visualizer-controls">
                        <span style="color: #6c757d; font-weight: 600;">View:</span>
                        <button class="view-toggle ${this.state.viewMode === 'grid' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('object-location-system').setViewMode('grid')">
                            📋 Grid
                        </button>
                        <button class="view-toggle ${this.state.viewMode === 'list' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('object-location-system').setViewMode('list')">
                            📝 List
                        </button>
                    </div>

                    <div class="visualizer-grid">
                        ${this.renderLocationCards()}
                    </div>
                </div>
            `;
        },

        /**
         * Render location cards
         */
        renderLocationCards: function() {
            // Mock data for demonstration
            const mockLocations = [
                { id: 0, name: "Forest Path", objects: ["Sword", "Shield"] },
                { id: 1, name: "Village Square", objects: [] },
                { id: 2, name: "Castle Gate", objects: ["Key", "Torch"] },
                { id: 252, name: "Carried by Player", objects: ["Map", "Coins"], special: true },
                { id: 253, name: "Limbo", objects: ["Hidden Item"], special: true }
            ];

            return mockLocations.map(loc => `
                <div class="location-card" style="border-left-color: ${loc.special ? '#f39c12' : '#3498db'}">
                    <div class="location-name">
                        ${loc.special ? '✨' : '📍'} ${loc.name}
                    </div>
                    <div>
                        ${loc.objects.length === 0 ? `
                            <div class="empty-location">No objects here</div>
                        ` : loc.objects.map(obj => `
                            <div class="object-item">📦 ${obj}</div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        },

        /**
         * Render examples
         */
        renderExamples: function() {
            const examples = [
                {
                    title: "🔍 Object Tracking",
                    description: "Monitor object movement",
                    color: "#3498db",
                    code: "ISNOTAT key 0\nMESSAGE 'Key moved!'\nCOPYOF key 50\nDESC",
                    explanation: "Detect and track object positions"
                },
                {
                    title: "🪄 Item Synchronization",
                    description: "Link paired objects",
                    color: "#8b5cf6",
                    code: "COPYOO ring1 ring2\nMESSAGE 'Rings reunite!'",
                    explanation: "Keep related objects together"
                },
                {
                    title: "📦 Container System",
                    description: "Hide and reveal objects",
                    color: "#f39c12",
                    code: "PUTIN gold chest\nMESSAGE 'Hidden!'\nTAKEOUT gold chest\nPUTO gold",
                    explanation: "Create storage mechanics"
                }
            ];

            return `
                <div class="examples-panel">
                    <h3 style="color: #2c3e50; margin-bottom: 10px;">💡 Complete Systems</h3>
                    <div class="examples-grid">
                        ${examples.map(ex => `
                            <div class="example-system" style="--example-color: ${ex.color}">
                                <div class="system-title">${ex.title}</div>
                                <div class="system-description">${ex.description}</div>
                                <div class="system-code">${ex.code}</div>
                                <div class="system-explanation">${ex.explanation}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        /**
         * Switch tab
         */
        switchTab: function(tabKey) {
            this.state.currentTab = tabKey;
            AdventureCreator.navigate('object-location-system');
        },

        /**
         * Set view mode
         */
        setViewMode: function(mode) {
            this.state.viewMode = mode;
            AdventureCreator.navigate('object-location-system');
        },

        /**
         * Test operation
         */
        testOperation: function(operationKey) {
            const definitions = this.getOperationDefinitions();
            let operation = null;

            // Find the operation
            Object.values(definitions).forEach(category => {
                if (category.operations[operationKey]) {
                    operation = { key: operationKey, ...category.operations[operationKey] };
                }
            });

            if (!operation) return;

            this.showTestModal(operation);
        },

        /**
         * Show test modal
         */
        showTestModal: function(operation) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };

            modal.innerHTML = `
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${operation.icon} Test: ${operation.name}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>

                    <div class="modal-body">
                        <div style="background: ${operation.type === 'condition' ? '#d4edda' : '#cce5ff'};
                                    padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                            <strong>Type:</strong> ${operation.type.toUpperCase()}<br>
                            <strong>DAAD Code:</strong> <code>${operation.daadCode}</code>
                        </div>

                        <p style="color: #495057; margin-bottom: 15px;">${operation.description}</p>

                        ${operation.parameters && operation.parameters.length > 0 ? `
                            <div class="parameter-form">
                                ${operation.parameters.map((param, idx) => `
                                    <div class="parameter-row">
                                        <label class="parameter-label">${param.name}:</label>
                                        <input type="number" class="parameter-input"
                                               id="param-${idx}"
                                               placeholder="Enter ${param.type} ID">
                                        <div class="parameter-help">${param.description}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="background: #d4edda; padding: 12px; border-radius: 6px; margin: 15px 0;">
                                ✅ This operation requires no parameters
                            </div>
                        `}

                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                                Cancel
                            </button>
                            <button class="btn btn-primary"
                                    onclick="AdventureCreator.getModule('object-location-system').executeTest('${operation.key}')">
                                Execute Test
                            </button>
                        </div>

                        <div id="test-result"></div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        /**
         * Execute test
         */
        executeTest: function(operationKey) {
            const definitions = this.getOperationDefinitions();
            let operation = null;

            Object.values(definitions).forEach(category => {
                if (category.operations[operationKey]) {
                    operation = category.operations[operationKey];
                }
            });

            if (!operation) return;

            // Get parameter values
            const params = [];
            if (operation.parameters) {
                operation.parameters.forEach((param, idx) => {
                    const input = document.getElementById(`param-${idx}`);
                    if (input) params.push(input.value);
                });
            }

            // Build DAAD code
            let code = operation.daadCode;
            params.forEach(p => {
                code += ` ${p}`;
            });

            // Show result
            const resultDiv = document.getElementById('test-result');
            resultDiv.innerHTML = `
                <div class="test-result success" style="margin-top: 15px;">
                    <h4 style="margin-top: 0; color: #2c3e50;">✅ Test Complete</h4>
                    <div style="background: #282c34; color: #abb2bf; padding: 10px;
                                border-radius: 4px; font-family: monospace; margin: 10px 0;">
                        ${code}
                    </div>
                    <p style="color: #495057; margin: 0;">
                        Operation syntax is correct. Copy this code into your DAAD game to use it.
                    </p>
                </div>
            `;

            // Save to history
            this.state.operations.push({
                id: this.state.nextOperationId++,
                operation: operationKey,
                code: code,
                timestamp: new Date().toISOString()
            });
            this.saveData();
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
        AdventureCreator.registerModule('object-location-system', ObjectLocationModule);
    }

})();
