// Object Containers System - DAAD Adventure Creator
// Complete container mechanics with professional UI and persistence
(function() {
    'use strict';

    console.log('Object Containers System module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Object Containers System module requires the Adventure Creator framework.');
        return;
    }

    AdventureCreator.registerModule('objects', {
        name: 'Object Containers System',
        version: '1.0.0',
        description: 'Complete container mechanics (PUTIN, TAKEOUT, container relationships) with professional UI',
        category: 'Advanced Systems',
        author: 'DAAD Adventure Creator',

        init: function() {
            console.log('Object Containers System module initialized');
            this.initializeState();
            this.loadFromStorage();
            this.setupKeyboardShortcuts();
        },

        initializeState: function() {
            if (!AdventureCreator.state.objectContainersSystem) {
                AdventureCreator.state.objectContainersSystem = {
                    selectedTab: 'container_actions',
                    showExplanations: true,
                    viewMode: 'detailed',
                    simulatorObjects: this.generateDefaultObjects(),
                    favoriteOperations: new Set(),
                    recentOperations: [],
                    savedTemplates: [],
                    searchFilter: '',
                    expandedCategories: new Set(),
                    simulatorHistory: []
                };
            }
        },

        setupKeyboardShortcuts: function() {
            document.addEventListener('keydown', (e) => {
                if (!document.querySelector('.containers-system-container')) return;

                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveToStorage();
                    this.showNotification('Container system saved successfully', 'success');
                }
                if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault();
                    const searchInput = document.querySelector('.container-search-input');
                    if (searchInput) searchInput.focus();
                }
                if (e.key === 'Escape') {
                    const modal = document.querySelector('.operation-modal');
                    if (modal) modal.remove();
                }
                if (e.ctrlKey && e.key === 'z') {
                    e.preventDefault();
                    this.undoSimulatorAction();
                }
            });
        },

        saveToStorage: function() {
            try {
                const state = AdventureCreator.state.objectContainersSystem;
                const toSave = {
                    ...state,
                    favoriteOperations: Array.from(state.favoriteOperations),
                    expandedCategories: Array.from(state.expandedCategories)
                };
                localStorage.setItem('objectContainersSystem_state', JSON.stringify(toSave));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                this.showNotification('Failed to save container system', 'error');
            }
        },

        loadFromStorage: function() {
            try {
                const saved = localStorage.getItem('objectContainersSystem_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const state = AdventureCreator.state.objectContainersSystem;

                    Object.assign(state, parsed);
                    state.favoriteOperations = new Set(parsed.favoriteOperations || []);
                    state.expandedCategories = new Set(parsed.expandedCategories || []);

                    // Reset simulator to defaults
                    state.simulatorObjects = this.generateDefaultObjects();
                    state.simulatorHistory = [];
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        // Generate default objects for simulation
        generateDefaultObjects: function() {
            return [
                { id: 0, name: 'leather bag', location: 252, isContainer: true, capacity: 5, contents: [] },
                { id: 1, name: 'gold coins', location: 252, weight: 2, isPortable: true },
                { id: 2, name: 'magic scroll', location: 252, weight: 1, isPortable: true },
                { id: 3, name: 'wooden chest', location: 0, isContainer: true, capacity: 10, contents: [] },
                { id: 4, name: 'silver key', location: 0, weight: 1, isPortable: true },
                { id: 5, name: 'glass bottle', location: 0, isContainer: true, capacity: 1, contents: [] },
                { id: 6, name: 'healing potion', location: 253, weight: 1, isPortable: true }
            ];
        },

        // Complete container operations with explanations
        getContainerDefinitions: function() {
            return {
                container_actions: {
                    title: "📦 Container Actions",
                    description: "Put objects inside containers and take them out - create realistic storage and organization systems",
                    icon: "📦",
                    color: "#3b82f6",
                    operations: {
                        PUTIN: {
                            name: "Put object inside container",
                            description: "Places one object inside another object, creating container relationships. The contained object is no longer visible separately but exists within the container, making for realistic inventory organization and hidden object mechanics.",
                            parameters: [
                                { name: "object", type: "object", description: "Object to put inside the container" },
                                { name: "container", type: "object", description: "Container object to put it in" }
                            ],
                            examples: [
                                "Put gold coins into the leather pouch for organization",
                                "Store the magic scroll inside a protective tube",
                                "Hide the key inside the hollow statue for concealment"
                            ],
                            useCases: [
                                "Inventory organization and storage systems",
                                "Hidden object and secret compartment mechanics",
                                "Realistic container and packaging simulation",
                                "Puzzle mechanics with nested objects",
                                "Weight and space management systems"
                            ],
                            daadCode: "PUTIN {object} {container}",
                            category: "intermediate",
                            icon: "📥",
                            type: "action",
                            effect: "Moves object inside container, making it invisible"
                        },
                        TAKEOUT: {
                            name: "Remove object from container",
                            description: "Takes an object out of another object and places it in the same location as the container. The object becomes separately visible and accessible again, allowing players to access stored items.",
                            parameters: [
                                { name: "object", type: "object", description: "Object to remove from container" },
                                { name: "container", type: "object", description: "Container to remove it from" }
                            ],
                            examples: [
                                "Take coins out of the purse to spend them",
                                "Remove the scroll from the tube to read it",
                                "Extract the key from the statue's hidden compartment"
                            ],
                            useCases: [
                                "Accessing stored items when needed",
                                "Unpacking and organizing inventory",
                                "Revealing hidden objects and secrets",
                                "Multi-step puzzle solving with nested items",
                                "Realistic container interaction"
                            ],
                            daadCode: "TAKEOUT {object} {container}",
                            category: "intermediate",
                            icon: "📤",
                            type: "action",
                            effect: "Moves object out of container to container's location"
                        }
                    }
                },

                container_conditions: {
                    title: "🔍 Container Conditions",
                    description: "Check what's inside containers and test container relationships",
                    icon: "🔍",
                    color: "#10b981",
                    operations: {
                        INVEN: {
                            name: "Check if object is inside container",
                            description: "Tests whether a specific object is currently contained within another object. Essential for checking container contents before taking actions, verifying storage states, and implementing container-based puzzles.",
                            parameters: [
                                { name: "object", type: "object", description: "Object to check for" },
                                { name: "container", type: "object", description: "Container to check inside" }
                            ],
                            examples: [
                                "Check if coins are in the purse before buying",
                                "Verify the scroll is safely stored in the tube",
                                "Test if the key is hidden in the statue"
                            ],
                            useCases: [
                                "Verifying container contents before actions",
                                "Implementing container-based conditional logic",
                                "Creating storage verification systems",
                                "Puzzle solutions requiring specific contained items",
                                "Inventory management and organization checking"
                            ],
                            daadCode: "INVEN {object} {container}",
                            category: "intermediate",
                            icon: "🔍",
                            type: "condition",
                            effect: "True if object is inside the specified container"
                        },
                        NOTINVEN: {
                            name: "Check if object is NOT inside container",
                            description: "Tests whether a specific object is not contained within another object. Useful for detecting when items have been removed, checking for empty containers, or ensuring items are not stored when they should be accessible.",
                            parameters: [
                                { name: "object", type: "object", description: "Object to check for absence" },
                                { name: "container", type: "object", description: "Container to check inside" }
                            ],
                            examples: [
                                "Detect that coins were spent from the purse",
                                "Notice the scroll was removed from safe storage",
                                "Check if the container is empty and available"
                            ],
                            useCases: [
                                "Detecting when container contents change",
                                "Checking for empty containers and available space",
                                "Implementing theft or loss detection",
                                "Verifying items are accessible outside containers",
                                "Container capacity and management logic"
                            ],
                            daadCode: "NOTINVEN {object} {container}",
                            category: "intermediate",
                            icon: "🚫",
                            type: "condition",
                            effect: "True if object is NOT inside the specified container"
                        }
                    }
                }
            };
        },

        // Render the complete object containers system interface
        render: function() {
            const game = AdventureCreator.getCurrentGame();
            if (!game || game.format !== 'daad') {
                return '<div>Object Containers System is only available for DAAD format games.</div>';
            }

            const state = AdventureCreator.state.objectContainersSystem;
            const currentTab = state.selectedTab;
            const definitions = this.getContainerDefinitions();

            return `
                <div class="containers-system-container">
                    <div class="containers-system-header">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <h3 style="margin: 0;">📦 Object Containers System</h3>
                                <p style="color: #666; margin: 0.5rem 0;">
                                    Advanced container mechanics for realistic storage, organization, and nested object relationships
                                </p>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="AdventureCreator.modules['objects'].showTemplatesModal()" class="btn-small btn-add">
                                    💾 Templates
                                </button>
                                <button onclick="AdventureCreator.modules['objects'].showHelpModal()" class="btn-small btn-edit">
                                    ❓ Help (F1)
                                </button>
                            </div>
                        </div>

                        <div style="position: relative; margin-bottom: 1rem;">
                            <input type="text"
                                   class="container-search-input"
                                   placeholder="Search container operations... (Ctrl+F)"
                                   value="${this.escapeHtml(state.searchFilter)}"
                                   onkeyup="AdventureCreator.modules['objects'].updateSearchFilter(this.value)"
                                   style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white; font-size: 0.875rem;">
                            <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #666;">🔍</span>
                        </div>
                    </div>

                    <div class="containers-system-tabs">
                        ${this.renderContainersTabs(definitions, currentTab)}
                    </div>

                    <div class="containers-system-content">
                        ${this.renderContainersContent(definitions, currentTab, game)}
                    </div>

                    <div class="containers-visualizer">
                        <h4>📦 Container Relationships Visualizer</h4>
                        ${this.renderContainersVisualizer()}
                    </div>

                    <div class="containers-examples">
                        <h4>💡 Complete Container Systems</h4>
                        ${this.renderContainersExamples()}
                    </div>
                </div>

                ${this.renderStyles()}
            `;
        },

        renderStyles: function() {
            return `<style>
                .containers-system-container {
                    background: #1a1a1a;
                    border-radius: 12px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .containers-system-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #333;
                }

                .containers-system-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    overflow-x: auto;
                    flex-wrap: wrap;
                }

                .containers-system-tab {
                    background: #333;
                    border: none;
                    border-radius: 8px;
                    padding: 1rem 1.5rem;
                    color: #ccc;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 140px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .containers-system-tab:hover {
                    background: #444;
                    color: #fff;
                }

                .containers-system-tab.active {
                    background: var(--tab-color);
                    color: white;
                    transform: translateY(-2px);
                }

                .tab-icon {
                    font-size: 1.5rem;
                }

                .tab-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .containers-system-content {
                    background: #0a0a0a;
                    border-radius: 8px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .category-title {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .category-description {
                    font-size: 1rem;
                    color: #ccc;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }

                .operations-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
                    gap: 1.5rem;
                }

                .operation-card {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-left: 4px solid var(--operation-color);
                    position: relative;
                }

                .operation-card:hover {
                    border-color: var(--operation-color);
                    background: rgba(59, 130, 246, 0.05);
                    transform: translateY(-2px);
                }

                .operation-card.is-favorite {
                    border-color: #f59e0b;
                }

                .favorite-star {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    font-size: 1.25rem;
                    cursor: pointer;
                    z-index: 10;
                }

                .operation-type-badge {
                    position: absolute;
                    top: 1rem;
                    right: 3rem;
                    background: var(--operation-color);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .operation-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .operation-icon {
                    font-size: 1.5rem;
                }

                .operation-name {
                    font-weight: 600;
                    color: #fff;
                    font-size: 1.1rem;
                    flex: 1;
                }

                .operation-complexity {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .complexity-intermediate {
                    background: #f59e0b;
                    color: white;
                }

                .operation-description {
                    font-size: 0.875rem;
                    color: #ccc;
                    line-height: 1.4;
                    margin-bottom: 1rem;
                }

                .operation-effect {
                    background: #1e3a8a;
                    border-left: 4px solid #3b82f6;
                    padding: 0.75rem;
                    margin-bottom: 1rem;
                    border-radius: 0 6px 6px 0;
                    font-size: 0.875rem;
                    color: #93c5fd;
                }

                .operation-examples {
                    background: #0a0a0a;
                    border-radius: 6px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .examples-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #3b82f6;
                    margin-bottom: 0.5rem;
                }

                .example-item {
                    font-size: 0.875rem;
                    color: #999;
                    margin-bottom: 0.25rem;
                    padding-left: 1rem;
                    position: relative;
                }

                .example-item::before {
                    content: "▸";
                    position: absolute;
                    left: 0;
                    color: #3b82f6;
                }

                .operation-use-cases {
                    background: #0a0a0a;
                    border-radius: 6px;
                    padding: 1rem;
                }

                .use-cases-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #10b981;
                    margin-bottom: 0.5rem;
                }

                .use-case-item {
                    font-size: 0.875rem;
                    color: #999;
                    margin-bottom: 0.25rem;
                    padding-left: 1rem;
                    position: relative;
                }

                .use-case-item::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #10b981;
                }

                .containers-visualizer {
                    background: #0a0a0a;
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .visualizer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .container-visual {
                    background: #1a1a1a;
                    border-radius: 8px;
                    padding: 1rem;
                    border-left: 4px solid var(--container-color);
                }

                .container-title {
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .container-contents {
                    background: #0a0a0a;
                    border-radius: 4px;
                    padding: 0.75rem;
                    min-height: 60px;
                }

                .contained-item {
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid #3b82f6;
                    border-radius: 4px;
                    padding: 0.5rem;
                    margin: 0.25rem 0;
                    font-size: 0.875rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .item-name {
                    color: #93c5fd;
                }

                .item-button {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .item-button:hover {
                    background: #2563eb;
                }

                .empty-container {
                    color: #666;
                    font-style: italic;
                    text-align: center;
                    padding: 1rem;
                }

                .simulator-controls {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .simulator-button {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }

                .simulator-button:hover {
                    background: #2563eb;
                }

                .containers-examples {
                    background: #0a0a0a;
                    border-radius: 8px;
                    padding: 1.5rem;
                }

                .examples-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .example-system {
                    background: #1a1a1a;
                    border-radius: 6px;
                    padding: 1rem;
                    border-left: 4px solid var(--example-color);
                }

                .system-title {
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .system-description {
                    font-size: 0.875rem;
                    color: #ccc;
                    margin-bottom: 1rem;
                }

                .system-code {
                    background: #0a0a0a;
                    border-radius: 4px;
                    padding: 0.75rem;
                    font-family: 'Courier New', monospace;
                    font-size: 0.75rem;
                    color: #3b82f6;
                    margin-bottom: 0.75rem;
                    white-space: pre-line;
                }

                .system-explanation {
                    font-size: 0.75rem;
                    color: #666;
                    font-style: italic;
                }

                .btn-operation {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 0.75rem 1rem;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    width: 100%;
                    margin-top: 1rem;
                }

                .btn-operation:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }

                .btn-small {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-edit {
                    background: #333;
                    color: #ccc;
                }

                .btn-edit:hover {
                    background: #444;
                    color: #fff;
                }

                .btn-add {
                    background: #3b82f6;
                    color: white;
                }

                .btn-add:hover {
                    background: #2563eb;
                }

                .operation-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                }

                .modal-overlay {
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .modal-content {
                    background: #1a1a1a;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    border: 1px solid #333;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #333;
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .parameter-builder {
                    background: #1a1a1a;
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin: 1rem 0;
                }

                .parameter-row {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .parameter-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #3b82f6;
                    min-width: 100px;
                }

                .parameter-input {
                    flex: 1;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    color: #fff;
                    padding: 0.5rem;
                    border-radius: 4px;
                    font-size: 0.875rem;
                }

                .parameter-help {
                    font-size: 0.75rem;
                    color: #666;
                    margin-top: 0.25rem;
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

                    .containers-system-tabs {
                        flex-direction: column;
                    }

                    .containers-system-tab {
                        min-width: auto;
                    }

                    .simulator-controls {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            </style>`;
        },

        renderContainersTabs: function(definitions, currentTab) {
            const tabs = [
                { key: 'container_actions', def: definitions.container_actions },
                { key: 'container_conditions', def: definitions.container_conditions }
            ];

            return tabs.map(({ key, def }) => `
                <button class="containers-system-tab ${currentTab === key ? 'active' : ''}"
                        style="--tab-color: ${def.color}"
                        onclick="AdventureCreator.modules['objects'].switchTab('${key}')">
                    <div class="tab-icon">${def.icon}</div>
                    <div class="tab-label">${def.title.replace('📦 ', '').replace('🔍 ', '')}</div>
                </button>
            `).join('');
        },

        renderContainersContent: function(definitions, currentTab, game) {
            const def = definitions[currentTab];
            if (!def) return '<div>Category not found</div>';

            const state = AdventureCreator.state.objectContainersSystem;
            const filteredOps = this.filterOperationsBySearch(def.operations, state.searchFilter);

            return `
                <div class="category-title" style="color: ${def.color}">
                    ${def.icon} ${def.title}
                </div>

                <div class="category-description">
                    ${def.description}
                </div>

                <div class="operations-grid">
                    ${Object.entries(filteredOps).map(([key, operation]) => {
                        const operationId = `${currentTab}_${key}`;
                        const isFavorite = state.favoriteOperations.has(operationId);

                        return `
                            <div class="operation-card ${isFavorite ? 'is-favorite' : ''}" style="--operation-color: ${def.color}"
                                 onclick="AdventureCreator.modules['objects'].selectOperation('${key}', '${currentTab}')">
                                <span class="favorite-star" onclick="event.stopPropagation(); AdventureCreator.modules['objects'].toggleFavorite('${operationId}')">${isFavorite ? '⭐' : '☆'}</span>
                                <div class="operation-type-badge">${operation.type}</div>

                                <div class="operation-header">
                                    <div class="operation-icon">${operation.icon}</div>
                                    <div class="operation-name">${this.escapeHtml(operation.name)}</div>
                                    <div class="operation-complexity complexity-${operation.category}">
                                        ${operation.category.toUpperCase()}
                                    </div>
                                </div>

                                <div class="operation-description">
                                    ${this.escapeHtml(operation.description)}
                                </div>

                                <div class="operation-effect">
                                    📦 <strong>Effect:</strong> ${this.escapeHtml(operation.effect)}
                                </div>

                                <div class="operation-examples">
                                    <div class="examples-title">💡 Examples</div>
                                    ${operation.examples.map(example => `
                                        <div class="example-item">${this.escapeHtml(example)}</div>
                                    `).join('')}
                                </div>

                                <div class="operation-use-cases">
                                    <div class="use-cases-title">🎯 Use Cases</div>
                                    ${operation.useCases.map(useCase => `
                                        <div class="use-case-item">${this.escapeHtml(useCase)}</div>
                                    `).join('')}
                                </div>

                                <button class="btn-operation">
                                    ➕ Add ${this.escapeHtml(operation.name)}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        },

        renderContainersVisualizer: function() {
            try {
                const objects = AdventureCreator.state.objectContainersSystem.simulatorObjects;
                const containers = objects.filter(obj => obj.isContainer);
                const portableItems = objects.filter(obj => obj.isPortable);

                return `
                    <div class="simulator-controls">
                        <span style="color: #ccc; font-weight: 600;">Interactive Container Simulator:</span>
                        <button class="simulator-button" onclick="AdventureCreator.modules['objects'].resetSimulator()">
                            🔄 Reset
                        </button>
                        <button class="simulator-button" onclick="AdventureCreator.modules['objects'].undoSimulatorAction()">
                            ↩️ Undo (Ctrl+Z)
                        </button>
                    </div>

                    <div class="visualizer-grid">
                        ${containers.map(container => `
                            <div class="container-visual" style="--container-color: ${this.getContainerColor(container)};">
                                <div class="container-title">
                                    ${this.getContainerIcon(container)} ${this.escapeHtml(container.name)}
                                    <span style="color: #666; font-size: 0.75rem; margin-left: auto;">
                                        ${container.contents.length}/${container.capacity}
                                    </span>
                                </div>
                                <div class="container-contents">
                                    ${container.contents.length === 0 ? `
                                        <div class="empty-container">Empty container</div>
                                    ` : container.contents.map(itemId => {
                                        const item = objects.find(obj => obj.id === itemId);
                                        return `
                                            <div class="contained-item">
                                                <span class="item-name">📦 ${this.escapeHtml(item?.name || 'Unknown item')}</span>
                                                <button class="item-button" onclick="AdventureCreator.modules['objects'].takeOutItem(${itemId}, ${container.id})">
                                                    📤 Take Out
                                                </button>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}

                        <div class="container-visual" style="--container-color: #10b981;">
                            <div class="container-title">
                                🎒 Available Items (Not in containers)
                            </div>
                            <div class="container-contents">
                                ${portableItems.filter(item => !this.isItemInContainer(item.id)).map(item => `
                                    <div class="contained-item">
                                        <span class="item-name">📦 ${this.escapeHtml(item.name)}</span>
                                        <button class="item-button" onclick="AdventureCreator.modules['objects'].showPutInOptions(${item.id})">
                                            📥 Put In
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error rendering visualizer:', error);
                return '<div style="color: #ef4444;">Error loading visualizer</div>';
            }
        },

        renderContainersExamples: function() {
            const examples = [
                {
                    title: "🎒 Basic Container System",
                    description: "Simple put in/take out with leather bag",
                    color: "#3b82f6",
                    code: `// Put coins in bag for organization
PRESENT coins
PRESENT bag
PUTIN coins bag
MESSAGE "You put the coins in your bag."

// Take coins out to spend
INVEN coins bag
TAKEOUT coins bag
MESSAGE "You take out the coins."`,
                    explanation: "Basic container operations for inventory organization"
                }
            ];

            return `
                <div class="examples-grid">
                    ${examples.map(example => `
                        <div class="example-system" style="--example-color: ${example.color}">
                            <div class="system-title">
                                ${example.title}
                            </div>
                            <div class="system-description">
                                ${example.description}
                            </div>
                            <div class="system-code">${example.code}</div>
                            <div class="system-explanation">
                                ${example.explanation}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        // Helper methods
        getContainerColor: function(container) {
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#dc2626'];
            return colors[container.id % colors.length];
        },

        getContainerIcon: function(container) {
            const icons = { 'bag': '🎒', 'chest': '📦', 'bottle': '🍾', 'box': '📦' };
            for (const [key, icon] of Object.entries(icons)) {
                if (container.name.includes(key)) return icon;
            }
            return '📦';
        },

        isItemInContainer: function(itemId) {
            const objects = AdventureCreator.state.objectContainersSystem.simulatorObjects;
            return objects.some(obj => obj.isContainer && obj.contents.includes(itemId));
        },

        filterOperationsBySearch: function(operations, filter) {
            if (!filter) return operations;

            const filtered = {};
            const lowerFilter = filter.toLowerCase();

            Object.entries(operations).forEach(([key, op]) => {
                if (op.name.toLowerCase().includes(lowerFilter) ||
                    op.description.toLowerCase().includes(lowerFilter) ||
                    op.daadCode.toLowerCase().includes(lowerFilter) ||
                    op.examples.some(ex => ex.toLowerCase().includes(lowerFilter))) {
                    filtered[key] = op;
                }
            });

            return filtered;
        },

        // UI Actions
        switchTab: function(tabName) {
            try {
                AdventureCreator.state.objectContainersSystem.selectedTab = tabName;
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error switching tab:', error);
            }
        },

        toggleFavorite: function(operationId) {
            try {
                const state = AdventureCreator.state.objectContainersSystem;

                if (state.favoriteOperations.has(operationId)) {
                    state.favoriteOperations.delete(operationId);
                    this.showNotification('Removed from favorites', 'info');
                } else {
                    state.favoriteOperations.add(operationId);
                    this.showNotification('Added to favorites', 'success');
                }

                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error toggling favorite:', error);
            }
        },

        updateSearchFilter: function(value) {
            try {
                AdventureCreator.state.objectContainersSystem.searchFilter = value;
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error updating search filter:', error);
            }
        },

        resetSimulator: function() {
            try {
                const state = AdventureCreator.state.objectContainersSystem;
                state.simulatorObjects = this.generateDefaultObjects();
                state.simulatorHistory = [];
                this.showNotification('Simulator reset to initial state', 'success');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error resetting simulator:', error);
                this.showNotification('Failed to reset simulator', 'error');
            }
        },

        undoSimulatorAction: function() {
            try {
                const state = AdventureCreator.state.objectContainersSystem;
                if (state.simulatorHistory.length > 0) {
                    state.simulatorObjects = state.simulatorHistory.pop();
                    this.showNotification('Undo successful', 'success');
                    AdventureCreator.navigate('editor');
                } else {
                    this.showNotification('Nothing to undo', 'info');
                }
            } catch (error) {
                console.error('Error undoing action:', error);
                this.showNotification('Failed to undo', 'error');
            }
        },

        takeOutItem: function(itemId, containerId) {
            try {
                const state = AdventureCreator.state.objectContainersSystem;

                // Save current state for undo
                state.simulatorHistory.push(JSON.parse(JSON.stringify(state.simulatorObjects)));

                const container = state.simulatorObjects.find(obj => obj.id === containerId);
                if (container) {
                    container.contents = container.contents.filter(id => id !== itemId);
                    this.showNotification(`Took item out of ${container.name}`, 'success');
                    AdventureCreator.navigate('editor');
                }
            } catch (error) {
                console.error('Error taking out item:', error);
                this.showNotification('Failed to take out item', 'error');
            }
        },

        showPutInOptions: function(itemId) {
            try {
                const objects = AdventureCreator.state.objectContainersSystem.simulatorObjects;
                const item = objects.find(obj => obj.id === itemId);
                const containers = objects.filter(obj => obj.isContainer && obj.contents.length < obj.capacity);

                if (containers.length === 0) {
                    this.showNotification('No containers have available space!', 'warning');
                    return;
                }

                const content = `
                    <div style="margin-bottom: 1rem;">
                        <p style="color: #ccc;">Put <strong>${this.escapeHtml(item.name)}</strong> into which container?</p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${containers.map(c => `
                            <button onclick="AdventureCreator.modules['objects'].putItemInContainer(${itemId}, ${c.id})"
                                    style="padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; text-align: left; transition: background 0.2s;"
                                    onmouseover="this.style.background='#2563eb'"
                                    onmouseout="this.style.background='#3b82f6'">
                                📦 ${this.escapeHtml(c.name)} (${c.contents.length}/${c.capacity})
                            </button>
                        `).join('')}
                    </div>
                `;

                this.showModal(content, '📥 Put Item in Container', null, 'Cancel', false);
            } catch (error) {
                console.error('Error showing put in options:', error);
                this.showNotification('Failed to show options', 'error');
            }
        },

        putItemInContainer: function(itemId, containerId) {
            try {
                const state = AdventureCreator.state.objectContainersSystem;

                // Save current state for undo
                state.simulatorHistory.push(JSON.parse(JSON.stringify(state.simulatorObjects)));

                const container = state.simulatorObjects.find(obj => obj.id === containerId);
                const item = state.simulatorObjects.find(obj => obj.id === itemId);

                if (container && item) {
                    container.contents.push(itemId);
                    this.closeModal();
                    this.showNotification(`Put ${item.name} in ${container.name}`, 'success');
                    AdventureCreator.navigate('editor');
                }
            } catch (error) {
                console.error('Error putting item in container:', error);
                this.showNotification('Failed to put item in container', 'error');
            }
        },

        selectOperation: function(operationKey, categoryKey) {
            try {
                const definitions = this.getContainerDefinitions();
                const selectedOperation = definitions[categoryKey]?.operations[operationKey];

                if (selectedOperation) {
                    this.showOperationParameterBuilder({
                        key: operationKey,
                        categoryKey: categoryKey,
                        ...selectedOperation
                    });
                }
            } catch (error) {
                console.error('Error selecting operation:', error);
                this.showNotification('Failed to select operation', 'error');
            }
        },

        showOperationParameterBuilder: function(operation) {
            try {
                const modal = document.createElement('div');
                modal.className = 'operation-modal';
                modal.innerHTML = `
                    <div class="modal-overlay" onclick="this.parentElement.remove()">
                        <div class="modal-content" onclick="event.stopPropagation()">
                            <div class="modal-header">
                                <h4 style="color: #fff; margin: 0;">${operation.icon} Configure: ${this.escapeHtml(operation.name)}</h4>
                                <button onclick="this.closest('.operation-modal').remove()"
                                        style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                            </div>

                            <div class="modal-body">
                                <div style="background: ${operation.type === 'condition' ? '#10b981' : '#3b82f6'}; color: white; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                                    <strong>Type:</strong> ${operation.type === 'condition' ? 'Condition (IF)' : 'Action (THEN)'}<br>
                                    <small><strong>Effect:</strong> ${this.escapeHtml(operation.effect)}</small>
                                </div>

                                <p style="color: #ccc; margin-bottom: 1.5rem;">${this.escapeHtml(operation.description)}</p>

                                ${operation.parameters && operation.parameters.length > 0 ? `
                                    <div class="parameter-builder">
                                        ${operation.parameters.map((param, index) => `
                                            <div class="parameter-row">
                                                <div class="parameter-label">${this.escapeHtml(param.name)}:</div>
                                                <div style="flex: 1;">
                                                    ${this.renderParameterInput(param, index)}
                                                    <div class="parameter-help">${this.escapeHtml(param.description)}</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div style="background: #10b981; color: white; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                                        ✅ This operation requires no parameters - it's ready to use!
                                    </div>
                                `}

                                <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                                    <strong>Examples:</strong>
                                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #ccc;">
                                        ${operation.examples.map(example => `<li>${this.escapeHtml(example)}</li>`).join('')}
                                    </ul>
                                </div>

                                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                                    <button class="btn-small btn-edit" onclick="this.closest('.operation-modal').remove()">Cancel</button>
                                    <button class="btn-small btn-add" onclick="AdventureCreator.modules['objects'].addOperationToRule('${operation.key}', '${operation.categoryKey}')">
                                        Add ${operation.type === 'condition' ? 'Condition' : 'Action'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);

                // ESC key to close
                const escHandler = (e) => {
                    if (e.key === 'Escape') {
                        modal.remove();
                        document.removeEventListener('keydown', escHandler);
                    }
                };
                document.addEventListener('keydown', escHandler);
            } catch (error) {
                console.error('Error showing parameter builder:', error);
                this.showNotification('Failed to show parameter builder', 'error');
            }
        },

        renderParameterInput: function(param, index) {
            try {
                const game = AdventureCreator.getCurrentGame();

                switch(param.type) {
                    case 'object':
                        const objects = game?.daad?.objects || [];
                        return `
                            <select class="parameter-input" data-param-index="${index}">
                                <option value="">Choose object...</option>
                                ${objects.map((obj, idx) => `
                                    <option value="${idx}">${this.escapeHtml(obj.name || `Object ${idx}`)}</option>
                                `).join('')}
                            </select>
                        `;

                    case 'number':
                        return `
                            <input type="number" class="parameter-input" data-param-index="${index}" min="0" max="255" placeholder="Enter number (0-255)">
                        `;

                    default:
                        return `
                            <input type="text" class="parameter-input" data-param-index="${index}" placeholder="Enter ${this.escapeHtml(param.name)}">
                        `;
                }
            } catch (error) {
                console.error('Error rendering parameter input:', error);
                return `<input type="text" class="parameter-input" data-param-index="${index}" placeholder="Error loading input">`;
            }
        },

        addOperationToRule: function(operationKey, categoryKey) {
            try {
                const modal = document.querySelector('.operation-modal');
                const inputs = modal.querySelectorAll('.parameter-input');
                const values = Array.from(inputs).map(input => input.value);

                const operationDef = this.findOperationDefinition(operationKey, categoryKey);

                if (operationDef.parameters && operationDef.parameters.length > 0) {
                    if (values.some(v => !v)) {
                        this.showNotification('Please fill in all parameters!', 'warning');
                        return;
                    }
                }

                const isCondition = operationDef.type === 'condition';
                const targetArray = isCondition ? 'currentRuleConditions' : 'currentRuleActions';

                if (!AdventureCreator.state[targetArray]) {
                    AdventureCreator.state[targetArray] = [];
                }

                const newOperation = {
                    key: operationKey,
                    categoryKey: categoryKey,
                    name: operationDef.name,
                    description: this.buildOperationDescription(operationDef, values),
                    daadCode: this.buildOperationCode(operationDef, values),
                    parameters: values,
                    icon: operationDef.icon,
                    type: operationDef.type
                };

                AdventureCreator.state[targetArray].push(newOperation);

                // Track recent operations
                const operationId = `${categoryKey}_${operationKey}`;
                const state = AdventureCreator.state.objectContainersSystem;
                if (!state.recentOperations.includes(operationId)) {
                    state.recentOperations.unshift(operationId);
                    if (state.recentOperations.length > 10) {
                        state.recentOperations.pop();
                    }
                }

                this.saveToStorage();
                modal.remove();
                this.showNotification('Operation added successfully', 'success');
                this.refreshBuilder();
            } catch (error) {
                console.error('Error adding operation to rule:', error);
                this.showNotification('Failed to add operation', 'error');
            }
        },

        findOperationDefinition: function(operationKey, categoryKey) {
            try {
                const definitions = this.getContainerDefinitions();

                if (categoryKey && definitions[categoryKey]?.operations[operationKey]) {
                    return definitions[categoryKey].operations[operationKey];
                }

                // Fallback: search all categories
                for (const category of Object.values(definitions)) {
                    if (category.operations[operationKey]) {
                        return category.operations[operationKey];
                    }
                }
                return null;
            } catch (error) {
                console.error('Error finding operation definition:', error);
                return null;
            }
        },

        buildOperationDescription: function(operationDef, values) {
            let desc = operationDef.name;
            if (values.length > 0) {
                const validValues = values.filter(v => v);
                if (validValues.length > 0) {
                    desc += ` (${validValues.join(', ')})`;
                }
            }
            return desc;
        },

        buildOperationCode: function(operationDef, values) {
            let code = operationDef.daadCode;
            if (operationDef.parameters) {
                operationDef.parameters.forEach((param, index) => {
                    code = code.replace(`{${param.name}}`, values[index] || '?');
                });
            }
            return code;
        },

        refreshBuilder: function() {
            try {
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error refreshing builder:', error);
            }
        },

        showTemplatesModal: function() {
            try {
                const state = AdventureCreator.state.objectContainersSystem;
                const content = `
                    <div>
                        <p style="color: #ccc;">Container system templates coming soon!</p>
                        <p style="color: #666; font-size: 0.875rem;">Save and load common container setups for quick reuse.</p>
                    </div>
                `;

                this.showModal(content, '💾 Container Templates', null, 'Close', false);
            } catch (error) {
                console.error('Error showing templates modal:', error);
                this.showNotification('Failed to show templates', 'error');
            }
        },

        showHelpModal: function() {
            const content = `
                <div style="color: #e0e0e0;">
                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #3b82f6; margin-bottom: 1rem;">⌨️ Keyboard Shortcuts</h3>
                        <div style="display: grid; gap: 0.5rem; font-family: monospace;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">F1</span>
                                <span>Show this help</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">Ctrl+S</span>
                                <span>Save container system</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">Ctrl+F</span>
                                <span>Focus search box</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">Ctrl+Z</span>
                                <span>Undo simulator action</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">ESC</span>
                                <span>Close modal</span>
                            </div>
                        </div>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #3b82f6; margin-bottom: 1rem;">🚀 Getting Started</h3>
                        <ol style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li>Browse container operations by category</li>
                            <li>Click on an operation to configure parameters</li>
                            <li>Use the interactive simulator to test containers</li>
                            <li>Star your favorite operations for quick access</li>
                            <li>Add operations to your rules as conditions or actions</li>
                        </ol>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #3b82f6; margin-bottom: 1rem;">📦 Container Basics</h3>
                        <ul style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li><strong>PUTIN:</strong> Place object inside container</li>
                            <li><strong>TAKEOUT:</strong> Remove object from container</li>
                            <li><strong>INVEN:</strong> Check if object is in container</li>
                            <li>Containers can hold multiple objects up to capacity</li>
                            <li>Use simulator to visualize container relationships</li>
                        </ul>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                        <h3 style="color: #3b82f6; margin-bottom: 1rem;">💡 Tips</h3>
                        <ul style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li>Use containers for inventory organization</li>
                            <li>Create hidden compartments with nested containers</li>
                            <li>Check capacity before putting items in</li>
                            <li>Use the simulator to test container logic</li>
                            <li>Star operations you use frequently</li>
                        </ul>
                    </div>
                </div>
            `;

            this.showModal(content, '❓ Container System Help', null, 'Close', false);
        },

        showModal: function(content, title, onConfirm, confirmText = 'OK', showCancel = true) {
            const existingModal = document.querySelector('.operation-modal');
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement('div');
            modal.className = 'operation-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h4 style="color: #fff; margin: 0;">${title}</h4>
                            <button onclick="this.closest('.operation-modal').remove()" style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            ${content}
                        </div>

                        <div style="padding: 1rem 1.5rem; border-top: 1px solid #333; display: flex; gap: 0.75rem; justify-content: flex-end;">
                            ${showCancel ? `<button onclick="this.closest('.operation-modal').remove()" class="btn-small btn-edit">Cancel</button>` : ''}
                            <button id="modal-confirm-btn" class="btn-small btn-add">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Event listeners
            if (onConfirm) {
                document.getElementById('modal-confirm-btn').onclick = () => {
                    onConfirm();
                };
            } else {
                document.getElementById('modal-confirm-btn').onclick = () => {
                    modal.remove();
                };
            }

            // ESC key to close
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        },

        closeModal: function() {
            const modal = document.querySelector('.operation-modal');
            if (modal) {
                modal.remove();
            }
        },

        showNotification: function(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
                color: white;
                border-radius: 0.5rem;
                z-index: 10000;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideInRight 0.3s ease-out;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },

        escapeHtml: function(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }
    });

    console.log('Object Containers System module registered successfully');
})();

// Export the object containers system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdventureCreator.modules['objects'];
}
