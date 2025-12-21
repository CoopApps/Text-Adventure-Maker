// module-debug-features.js - DAAD Debug Features
(function() {
    'use strict';

    console.log('DAAD Debug Features module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Debug Features module requires the Adventure Creator framework.');
        return;
    }

    AdventureCreator.registerModule('debug-features', {
        name: 'Debug Features',
        version: '1.0.0',
        description: 'DEBUG condact and step-by-step debugging support for professional development',
        category: 'Development Tools',
        author: 'DAAD Adventure Creator',

        init: function() {
            console.log('Debug Features module initialized');
            this.initializeState();
            this.loadFromStorage();
            this.setupKeyboardShortcuts();
        },

        initializeState: function() {
            if (!AdventureCreator.state.debugFeatures) {
                AdventureCreator.state.debugFeatures = {
                    selectedCategory: 'debug_commands',
                    selectedOperation: null,
                    showExplanations: true,
                    previewMode: false,
                    searchFilter: '',
                    debugSession: {
                        active: false,
                        debugPoints: [],
                        watchedVariables: [],
                        sessionStartTime: null,
                        currentStepMode: null,
                        callStack: []
                    },
                    debugConfiguration: {
                        level: 'INFO',
                        autoLog: true,
                        showStackTrace: false,
                        highlightChanges: true
                    },
                    currentRule: {
                        conditions: [],
                        actions: []
                    },
                    savedConfigurations: [],
                    favoriteOperations: new Set(),
                    recentOperations: []
                };
            }
        },

        setupKeyboardShortcuts: function() {
            document.addEventListener('keydown', (e) => {
                if (!document.querySelector('.debug-features-editor')) return;

                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }
                if (e.key === 'F5') {
                    e.preventDefault();
                    const state = AdventureCreator.state.debugFeatures;
                    if (state.debugSession.active) {
                        this.stopDebugSession();
                    } else {
                        this.startDebugSession();
                    }
                }
                if (e.key === 'F10') {
                    e.preventDefault();
                    this.stepOver();
                }
                if (e.key === 'F11') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.stepOut();
                    } else {
                        this.stepInto();
                    }
                }
                if (e.ctrlKey && e.key === 'd') {
                    e.preventDefault();
                    this.openDebugConsole();
                }
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.showSaveConfigurationModal();
                }
            });
        },

        saveToStorage: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                const toSave = {
                    ...state,
                    favoriteOperations: Array.from(state.favoriteOperations)
                };
                localStorage.setItem('debugFeatures_state', JSON.stringify(toSave));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                this.showNotification('Failed to save state', 'error');
            }
        },

        loadFromStorage: function() {
            try {
                const saved = localStorage.getItem('debugFeatures_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const state = AdventureCreator.state.debugFeatures;

                    Object.assign(state, parsed);
                    state.favoriteOperations = new Set(parsed.favoriteOperations || []);

                    // Don't restore active debug session
                    state.debugSession.active = false;
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        render: function() {
            const state = AdventureCreator.state.debugFeatures;

            return `
                <div class="debug-features-editor" style="background: #0a0a0a; min-height: 100vh; color: #e0e0e0;">
                    <div class="module-header" style="background: #1a1a1a; border-bottom: 1px solid #333; padding: 2rem;">
                        <div style="max-width: 1400px; margin: 0 auto;">
                            <h1 style="color: #fff; font-size: 2rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem;">
                                🐛 Debug Features
                                <span style="font-size: 0.6em; color: #8b5cf6; background: rgba(139, 92, 246, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">DAAD Module</span>
                                ${state.debugSession.active ? `<span style="font-size: 0.6em; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">DEBUG ACTIVE</span>` : ''}
                            </h1>
                            <p style="color: #999; font-size: 1.1rem; margin-bottom: 1.5rem;">
                                DEBUG condact and step-by-step debugging support for professional development
                            </p>

                            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="AdventureCreator.modules['debug-features'].toggleExplanations()"
                                            style="padding: 0.5rem 1rem; background: ${state.showExplanations ? '#8b5cf6' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.showExplanations ? '📖 Hide Explanations' : '📖 Show Explanations'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['debug-features'].togglePreview()"
                                            style="padding: 0.5rem 1rem; background: ${state.previewMode ? '#059669' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.previewMode ? '👁️ Exit Preview' : '👁️ Preview Mode'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['debug-features'].openDebugConsole()"
                                            style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        🖥️ Debug Console
                                    </button>
                                    <button onclick="AdventureCreator.modules['debug-features'].${state.debugSession.active ? 'stopDebugSession' : 'startDebugSession'}()"
                                            style="padding: 0.5rem 1rem; background: ${state.debugSession.active ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.debugSession.active ? '⏹️ Stop Debug' : '▶️ Start Debug'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['debug-features'].showBreakpointsModal()"
                                            style="padding: 0.5rem 1rem; background: #7c3aed; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        🔴 Breakpoints
                                    </button>
                                    <button onclick="AdventureCreator.modules['debug-features'].showConfigurationsModal()"
                                            style="padding: 0.5rem 1rem; background: #059669; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        💾 Configurations
                                    </button>
                                    <button onclick="AdventureCreator.modules['debug-features'].showHelpModal()"
                                            style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ❓ Help (F1)
                                    </button>
                                </div>

                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <span style="color: #999; font-size: 0.875rem;">Level:</span>
                                    <select onchange="AdventureCreator.modules['debug-features'].changeDebugLevel(this.value)"
                                            style="padding: 0.5rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; font-size: 0.875rem;">
                                        <option value="TRACE" ${state.debugConfiguration.level === 'TRACE' ? 'selected' : ''}>TRACE</option>
                                        <option value="INFO" ${state.debugConfiguration.level === 'INFO' ? 'selected' : ''}>INFO</option>
                                        <option value="WARNING" ${state.debugConfiguration.level === 'WARNING' ? 'selected' : ''}>WARNING</option>
                                        <option value="ERROR" ${state.debugConfiguration.level === 'ERROR' ? 'selected' : ''}>ERROR</option>
                                    </select>
                                </div>

                                <div style="flex: 1; max-width: 300px; position: relative;">
                                    <input type="text"
                                           placeholder="Search debug features..."
                                           value="${this.escapeHtml(state.searchFilter)}"
                                           onkeyup="AdventureCreator.modules['debug-features'].updateSearchFilter(this.value)"
                                           style="width: 100%; padding: 0.5rem 1rem 0.5rem 2.5rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white;">
                                    <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af;">🔍</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="module-content" style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
                        <div style="display: grid; grid-template-columns: 350px 1fr; gap: 2rem; align-items: start;">
                            <!-- Category Navigation -->
                            <div class="category-nav" style="background: #1a1a1a; border-radius: 1rem; border: 1px solid #333; overflow: hidden; position: sticky; top: 2rem;">
                                ${this.renderCategoryNavigation(state)}
                            </div>

                            <!-- Main Content Area -->
                            <div class="main-content">
                                ${this.renderMainContent(state)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderCategoryNavigation: function(state) {
            const categories = this.getDefinitions();

            return `
                <div class="category-header" style="background: #8b5cf6; color: white; padding: 1rem; font-weight: 600;">
                    🐛 Debug Categories
                </div>
                <div class="category-list">
                    ${Object.entries(categories).map(([key, category]) => `
                        <div class="category-item ${state.selectedCategory === key ? 'active' : ''}"
                             onclick="AdventureCreator.modules['debug-features'].selectCategory('${key}')"
                             style="padding: 1rem; cursor: pointer; border-bottom: 1px solid #333; transition: all 0.2s; ${state.selectedCategory === key ? 'background: rgba(139, 92, 246, 0.1); border-left: 3px solid #8b5cf6;' : ''}">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.25rem;">${category.icon}</span>
                                <span style="font-weight: 500; color: ${state.selectedCategory === key ? '#8b5cf6' : '#fff'};">${category.title}</span>
                            </div>
                            <div style="font-size: 0.875rem; color: #999;">${category.description}</div>
                            <div style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">
                                ${Object.keys(category.operations).length} operations
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Debug Session Status -->
                <div style="padding: 1rem; border-top: 1px solid #333; background: #0a0a0a;">
                    <h4 style="color: #fff; margin-bottom: 0.75rem; font-size: 0.875rem;">Debug Session</h4>
                    <div style="color: #999; font-size: 0.8rem; line-height: 1.6;">
                        <div><strong>Status:</strong> ${state.debugSession.active ? 'Active' : 'Inactive'}</div>
                        <div><strong>Level:</strong> ${state.debugConfiguration.level}</div>
                        <div><strong>Breakpoints:</strong> ${state.debugSession.debugPoints.length}</div>
                        <div><strong>Watches:</strong> ${state.debugSession.watchedVariables.length}</div>
                    </div>
                </div>
            `;
        },

        renderMainContent: function(state) {
            const category = this.getDefinitions()[state.selectedCategory];
            if (!category) return '<div>Category not found</div>';

            const filteredOps = this.filterOperations(category.operations, state.searchFilter);

            return `
                <div class="category-detail">
                    <div class="category-overview" style="background: linear-gradient(135deg, ${category.color}20, ${category.color}10); border: 1px solid ${category.color}40; border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">${category.icon}</span>
                            <div>
                                <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 0.25rem;">${category.title}</h2>
                                <p style="color: #ccc; margin: 0;">${category.description}</p>
                            </div>
                        </div>
                    </div>

                    ${state.debugSession.active ? this.renderActiveDebugSession(state) : ''}

                    <div class="operations-grid" style="display: grid; gap: 1.5rem;">
                        ${Object.entries(filteredOps).map(([key, op]) => this.renderOperationCard(key, op, state)).join('')}
                    </div>
                </div>
            `;
        },

        renderActiveDebugSession: function(state) {
            return `
                <div class="debug-session-panel" style="background: #1a1a1a; border: 1px solid #ef4444; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem;">
                    <h3 style="color: #ef4444; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        🐛 Active Debug Session
                    </h3>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #ef4444; font-size: 1.25rem; font-weight: 600;">${state.debugConfiguration.level}</div>
                            <div style="color: #999; font-size: 0.875rem;">Debug Level</div>
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #ef4444; font-size: 1.25rem; font-weight: 600;">${state.debugSession.debugPoints.length}</div>
                            <div style="color: #999; font-size: 0.875rem;">Breakpoints</div>
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #ef4444; font-size: 1.25rem; font-weight: 600;">${state.debugSession.watchedVariables.length}</div>
                            <div style="color: #999; font-size: 0.875rem;">Watched Variables</div>
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #ef4444; font-size: 1.25rem; font-weight: 600;">${state.debugSession.currentStepMode || 'RUN'}</div>
                            <div style="color: #999; font-size: 0.875rem;">Step Mode</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button onclick="AdventureCreator.modules['debug-features'].stepInto()"
                                style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ⬇️ Step Into
                        </button>
                        <button onclick="AdventureCreator.modules['debug-features'].stepOver()"
                                style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ➡️ Step Over
                        </button>
                        <button onclick="AdventureCreator.modules['debug-features'].stepOut()"
                                style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ⬆️ Step Out
                        </button>
                        <button onclick="AdventureCreator.modules['debug-features'].continueExecution()"
                                style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ▶️ Continue
                        </button>
                        <button onclick="AdventureCreator.modules['debug-features'].pauseExecution()"
                                style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ⏸️ Pause
                        </button>
                        <button onclick="AdventureCreator.modules['debug-features'].viewCallStack()"
                                style="padding: 0.5rem 1rem; background: #7c3aed; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            📋 Call Stack
                        </button>
                    </div>
                </div>
            `;
        },

        renderOperationCard: function(key, operation, state) {
            const isSelected = state.selectedOperation === key;
            const isFavorite = state.favoriteOperations.has(key);
            const complexityColor = this.getComplexityColor(operation.category);

            return `
                <div class="operation-card ${isSelected ? 'selected' : ''}"
                     onclick="AdventureCreator.modules['debug-features'].selectOperation('${key}')"
                     style="background: #1a1a1a; border: 2px solid ${isSelected ? '#8b5cf6' : '#333'}; border-radius: 0.75rem; padding: 1.5rem; cursor: pointer; transition: all 0.2s;">

                    <div class="operation-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.5rem;">${operation.icon}</span>
                                <h3 style="color: #fff; margin: 0; font-size: 1.1rem;">${operation.name}</h3>
                                <button onclick="event.stopPropagation(); AdventureCreator.modules['debug-features'].toggleFavorite('${key}')"
                                        style="background: none; border: none; cursor: pointer; font-size: 1.25rem; padding: 0; margin-left: auto;">
                                    ${isFavorite ? '⭐' : '☆'}
                                </button>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: ${complexityColor}; color: white; border-radius: 0.25rem; font-weight: 600;">
                                    ${operation.category.toUpperCase()}
                                </span>
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: #374151; color: #ccc; border-radius: 0.25rem;">
                                    ${operation.type || 'action'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="operation-description" style="color: #ccc; margin-bottom: 1rem; line-height: 1.5;">
                        ${operation.description}
                    </div>

                    ${state.showExplanations ? `
                        <div class="operation-details" style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                            <div style="margin-bottom: 1rem;">
                                <h4 style="color: #8b5cf6; margin-bottom: 0.5rem; font-size: 0.9rem;">Examples:</h4>
                                <ul style="margin: 0; padding-left: 1.5rem; color: #999;">
                                    ${operation.examples.map(example => `<li style="margin-bottom: 0.25rem;">${this.escapeHtml(example)}</li>`).join('')}
                                </ul>
                            </div>
                            <div>
                                <h4 style="color: #8b5cf6; margin-bottom: 0.5rem; font-size: 0.9rem;">Use Cases:</h4>
                                <ul style="margin: 0; padding-left: 1.5rem; color: #999;">
                                    ${operation.useCases.slice(0, 3).map(useCase => `<li style="margin-bottom: 0.25rem;">${this.escapeHtml(useCase)}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}

                    <div class="operation-code" style="background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem; font-family: 'Courier New', monospace;">
                        <div style="color: #64748b; font-size: 0.75rem; margin-bottom: 0.25rem;">DAAD Code:</div>
                        <div style="color: #8b5cf6; font-weight: 500;">${this.escapeHtml(operation.daadCode)}</div>
                        ${operation.effect ? `<div style="color: #10b981; font-size: 0.75rem; margin-top: 0.25rem;">Effect: ${this.escapeHtml(operation.effect)}</div>` : ''}
                    </div>

                    ${isSelected ? `
                        <div class="operation-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button onclick="event.stopPropagation(); AdventureCreator.modules['debug-features'].addToRule('${key}', 'action')"
                                    style="flex: 1; padding: 0.5rem; background: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                ➕ Add to Rule
                            </button>
                            <button onclick="event.stopPropagation(); AdventureCreator.modules['debug-features'].showCodeExample('${key}')"
                                    style="padding: 0.5rem 0.75rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                📋 Code
                            </button>
                            ${operation.parameters ? `
                                <button onclick="event.stopPropagation(); AdventureCreator.modules['debug-features'].showParameterEditor('${key}')"
                                        style="padding: 0.5rem 0.75rem; background: #7c3aed; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                    ⚙️ Configure
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        },

        getDefinitions: function() {
            return {
                debug_commands: {
                    title: "🐛 Debug Commands",
                    description: "Add debugging commands and condacts to track game state",
                    icon: "🐛",
                    color: "#ef4444",
                    operations: {
                        DEBUG_CONDACT: {
                            name: "DEBUG condact",
                            description: "Add DEBUG condacts to display debug information during game execution. Shows variable values, game state, and custom messages for development and testing.",
                            parameters: [
                                {
                                    name: "debug_message",
                                    type: "text",
                                    description: "Message to display in debug output",
                                    required: true,
                                    placeholder: "Player entered kitchen"
                                },
                                {
                                    name: "debug_level",
                                    type: "select",
                                    options: ["INFO", "WARNING", "ERROR", "TRACE"],
                                    description: "Debug level/priority",
                                    default: "INFO"
                                },
                                {
                                    name: "show_variables",
                                    type: "checkbox",
                                    description: "Include current variable values",
                                    default: false
                                },
                                {
                                    name: "show_location",
                                    type: "checkbox",
                                    description: "Include current location info",
                                    default: false
                                },
                                {
                                    name: "show_inventory",
                                    type: "checkbox",
                                    description: "Include inventory contents",
                                    default: false
                                }
                            ],
                            examples: [
                                'DEBUG "Player health checked" INFO',
                                'DEBUG "Critical error in combat" ERROR VARS',
                                'DEBUG "Location transition" TRACE LOC INV'
                            ],
                            useCases: [
                                "Tracking game state changes during development",
                                "Monitoring variable updates and flag modifications",
                                "Debugging complex logic and rule interactions",
                                "Performance analysis and optimization",
                                "Development workflow acceleration"
                            ],
                            daadCode: 'DEBUG "{debug_message}" {debug_level}',
                            category: "basic",
                            icon: "🐛",
                            type: "action",
                            effect: "Displays debug information during execution"
                        },
                        TRACE_EXECUTION: {
                            name: "Execution tracer",
                            description: "Trace the execution flow of your adventure, showing which rules fire, in what order, and with what results. Essential for understanding complex game logic.",
                            parameters: [
                                {
                                    name: "trace_level",
                                    type: "select",
                                    options: ["Turn Level", "Process Level", "Rule Level", "Action Level"],
                                    description: "Detail level of tracing",
                                    required: true,
                                    default: "Rule Level"
                                },
                                {
                                    name: "trace_filter",
                                    type: "text",
                                    description: "Filter to specific rules/actions",
                                    placeholder: "process_0"
                                },
                                {
                                    name: "show_timing",
                                    type: "checkbox",
                                    description: "Show execution timing",
                                    default: false
                                },
                                {
                                    name: "show_call_stack",
                                    type: "checkbox",
                                    description: "Display call stack information",
                                    default: true
                                }
                            ],
                            examples: [
                                "Trace rule execution in combat system",
                                "Monitor process table switching",
                                "Track action sequence timing"
                            ],
                            useCases: [
                                "Understanding complex execution flow",
                                "Performance analysis and optimization",
                                "Debugging unexpected behavior",
                                "Learning DAAD execution model",
                                "Optimizing rule efficiency"
                            ],
                            daadCode: 'TRACE {trace_level} "{trace_filter}"',
                            category: "intermediate",
                            icon: "📋",
                            type: "action",
                            effect: "Traces execution flow and performance"
                        }
                    }
                },

                breakpoint_system: {
                    title: "🔴 Breakpoint System",
                    description: "Set breakpoints and watchpoints for interactive debugging",
                    icon: "🔴",
                    color: "#dc2626",
                    operations: {
                        DEBUG_BREAKPOINT: {
                            name: "Debug breakpoint",
                            description: "Set breakpoints that pause execution when specific conditions are met. Perfect for investigating specific game states and debugging complex logic.",
                            parameters: [
                                {
                                    name: "breakpoint_name",
                                    type: "text",
                                    description: "Name for this breakpoint",
                                    required: true,
                                    placeholder: "kitchen_entry"
                                },
                                {
                                    name: "break_condition",
                                    type: "text",
                                    description: "Condition to trigger breakpoint",
                                    placeholder: "AT kitchen"
                                },
                                {
                                    name: "break_action",
                                    type: "select",
                                    options: ["Pause", "Log Only", "Show State", "Interactive"],
                                    description: "Action when breakpoint hits",
                                    default: "Pause"
                                },
                                {
                                    name: "auto_continue",
                                    type: "checkbox",
                                    description: "Automatically continue after logging",
                                    default: false
                                }
                            ],
                            examples: [
                                'BREAKPOINT "combat_start" "CARRIED sword" PAUSE',
                                'BREAKPOINT "flag_change" "GT health_flag 90" LOG_ONLY',
                                'BREAKPOINT "location_debug" "AT secret_room" SHOW_STATE'
                            ],
                            useCases: [
                                "Investigating specific game states",
                                "Debugging complex conditions and logic",
                                "Testing critical game moments",
                                "Performance bottleneck analysis",
                                "Step-by-step execution control"
                            ],
                            daadCode: 'BREAKPOINT "{breakpoint_name}" "{break_condition}" {break_action}',
                            category: "intermediate",
                            icon: "🔴",
                            type: "action",
                            effect: "Sets conditional execution breakpoint"
                        },
                        VARIABLE_WATCH: {
                            name: "Variable watcher",
                            description: "Watch specific variables and flags for changes. Automatically log when watched values change, helping track down unexpected modifications.",
                            parameters: [
                                {
                                    name: "variable_name",
                                    type: "text",
                                    description: "Variable or flag to watch",
                                    required: true,
                                    placeholder: "health_flag"
                                },
                                {
                                    name: "watch_type",
                                    type: "select",
                                    options: ["Any Change", "Increase", "Decrease", "Specific Value", "Range"],
                                    description: "Type of change to watch for",
                                    required: true,
                                    default: "Any Change"
                                },
                                {
                                    name: "trigger_value",
                                    type: "number",
                                    description: "Specific value to watch for (if applicable)",
                                    placeholder: "100"
                                },
                                {
                                    name: "log_stack_trace",
                                    type: "checkbox",
                                    description: "Log call stack when triggered",
                                    default: true
                                }
                            ],
                            examples: [
                                'WATCH health_flag ANY_CHANGE STACK_TRACE',
                                'WATCH score_flag INCREASE',
                                'WATCH location_flag SPECIFIC_VALUE 5'
                            ],
                            useCases: [
                                "Tracking critical variable changes",
                                "Debugging unexpected value modifications",
                                "Monitoring game progression variables",
                                "Finding logic errors and bugs",
                                "Performance and state monitoring"
                            ],
                            daadCode: 'WATCH {variable_name} {watch_type} {trigger_value}',
                            category: "intermediate",
                            icon: "👁️",
                            type: "action",
                            effect: "Monitors variable for specified changes"
                        }
                    }
                },

                step_debugging: {
                    title: "👣 Step-by-Step Debugging",
                    description: "Professional step debugging with execution control",
                    icon: "👣",
                    color: "#f59e0b",
                    operations: {
                        STEP_DEBUGGER: {
                            name: "Step-by-step debugger",
                            description: "Full step-by-step debugging with step over, step into, and step out capabilities. Professional debugging interface for detailed code analysis.",
                            parameters: [
                                {
                                    name: "step_granularity",
                                    type: "select",
                                    options: ["Turn Level", "Process Level", "Rule Level", "Action Level"],
                                    description: "Level of stepping detail",
                                    required: true,
                                    default: "Rule Level"
                                },
                                {
                                    name: "show_call_stack",
                                    type: "checkbox",
                                    description: "Display call stack during stepping",
                                    default: true
                                },
                                {
                                    name: "highlight_current",
                                    type: "checkbox",
                                    description: "Highlight currently executing code",
                                    default: true
                                },
                                {
                                    name: "variable_inspection",
                                    type: "checkbox",
                                    description: "Enable variable inspection during debugging",
                                    default: true
                                }
                            ],
                            examples: [
                                'STEP_DEBUGGER RULE_LEVEL CALL_STACK HIGHLIGHT INSPECT',
                                'STEP_DEBUGGER ACTION_LEVEL FULL_FEATURES',
                                'STEP_DEBUGGER PROCESS_LEVEL BASIC'
                            ],
                            useCases: [
                                "Detailed code execution analysis",
                                "Understanding complex logic flow",
                                "Finding subtle bugs and errors",
                                "Learning DAAD execution model",
                                "Interactive debugging sessions"
                            ],
                            daadCode: 'STEP_DEBUGGER {step_granularity} OPTIONS',
                            category: "advanced",
                            icon: "👣",
                            type: "action",
                            effect: "Enables step-by-step execution control"
                        },
                        DEBUG_CONSOLE: {
                            name: "Interactive debug console",
                            description: "Open an interactive console for live debugging, allowing real-time command execution, variable inspection, and game state modification during play.",
                            parameters: [
                                {
                                    name: "console_access_level",
                                    type: "select",
                                    options: ["Read Only", "Limited Write", "Full Access", "God Mode"],
                                    description: "Level of access allowed",
                                    required: true,
                                    default: "Limited Write"
                                },
                                {
                                    name: "hotkey_activation",
                                    type: "text",
                                    description: "Key combination to open console",
                                    placeholder: "Ctrl+D"
                                },
                                {
                                    name: "command_history",
                                    type: "checkbox",
                                    description: "Maintain command history",
                                    default: true
                                },
                                {
                                    name: "auto_completion",
                                    type: "checkbox",
                                    description: "Enable command auto-completion",
                                    default: true
                                }
                            ],
                            examples: [
                                'DEBUG_CONSOLE FULL_ACCESS "Ctrl+D" HISTORY AUTOCOMPLETE',
                                'DEBUG_CONSOLE READ_ONLY "F12" HISTORY',
                                'DEBUG_CONSOLE GOD_MODE "" FULL_FEATURES'
                            ],
                            useCases: [
                                "Live game state examination",
                                "Quick testing of changes during development",
                                "Debugging complex scenarios interactively",
                                "Development acceleration and testing",
                                "Interactive problem solving"
                            ],
                            daadCode: 'DEBUG_CONSOLE {console_access_level} "{hotkey_activation}"',
                            category: "advanced",
                            icon: "🖥️",
                            type: "action",
                            effect: "Opens interactive debugging console"
                        }
                    }
                },

                state_inspection: {
                    title: "📊 State Inspection",
                    description: "Visual tools for understanding game state and execution",
                    icon: "📊",
                    color: "#8b5cf6",
                    operations: {
                        STATE_INSPECTOR: {
                            name: "Game state inspector",
                            description: "Real-time visualization of game state including flags, locations, inventory, and process status. Provides comprehensive overview of all game systems.",
                            parameters: [
                                {
                                    name: "inspector_mode",
                                    type: "select",
                                    options: ["All State", "Flags Only", "Objects Only", "Locations Only", "Custom"],
                                    description: "What to inspect",
                                    required: true,
                                    default: "All State"
                                },
                                {
                                    name: "update_frequency",
                                    type: "select",
                                    options: ["Real Time", "Every Turn", "On Change", "Manual"],
                                    description: "How often to update",
                                    required: true,
                                    default: "Every Turn"
                                },
                                {
                                    name: "highlight_changes",
                                    type: "checkbox",
                                    description: "Highlight recent changes",
                                    default: true
                                },
                                {
                                    name: "filter_unchanged",
                                    type: "checkbox",
                                    description: "Hide unchanged values",
                                    default: false
                                }
                            ],
                            examples: [
                                "Monitor all game state in real-time",
                                "Track flag changes during gameplay",
                                "Visualize object movement and status"
                            ],
                            useCases: [
                                "Understanding complex game states",
                                "Monitoring system interactions",
                                "Debugging state corruption issues",
                                "Performance and flow analysis",
                                "Educational game development"
                            ],
                            daadCode: 'STATE_INSPECTOR {inspector_mode} {update_frequency}',
                            category: "advanced",
                            icon: "📊",
                            type: "action",
                            effect: "Provides real-time state visualization"
                        },
                        MEMORY_PROFILER: {
                            name: "Memory usage profiler",
                            description: "Monitor memory usage, performance metrics, and resource consumption. Identify memory leaks and optimization opportunities in your adventure.",
                            parameters: [
                                {
                                    name: "profile_mode",
                                    type: "select",
                                    options: ["Usage Tracking", "Leak Detection", "Performance Analysis", "All Metrics"],
                                    description: "Type of profiling",
                                    required: true,
                                    default: "Usage Tracking"
                                },
                                {
                                    name: "sample_rate",
                                    type: "select",
                                    options: ["Every Turn", "Every 5 Turns", "Every 10 Turns", "Custom"],
                                    description: "Sampling frequency",
                                    default: "Every Turn"
                                },
                                {
                                    name: "alert_threshold",
                                    type: "number",
                                    description: "Alert when usage exceeds % threshold",
                                    default: 80,
                                    min: 50,
                                    max: 95
                                }
                            ],
                            examples: [
                                "Monitor memory usage during gameplay",
                                "Detect memory leaks in complex adventures",
                                "Profile performance bottlenecks"
                            ],
                            useCases: [
                                "Performance optimization and tuning",
                                "Memory leak detection and prevention",
                                "Resource usage monitoring",
                                "System stability analysis",
                                "Professional quality assurance"
                            ],
                            daadCode: 'MEMORY_PROFILE {profile_mode} {sample_rate} ALERT_{alert_threshold}',
                            category: "expert",
                            icon: "📈",
                            type: "action",
                            effect: "Monitors memory and performance metrics"
                        }
                    }
                }
            };
        },

        // Modal System
        showModal: function(content, title, onConfirm, confirmText = 'OK', showCancel = true) {
            const existingModal = document.querySelector('.debug-features-modal-overlay');
            if (existingModal) {
                existingModal.remove();
            }

            const overlay = document.createElement('div');
            overlay.className = 'debug-features-modal-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.2s;
            `;

            const modal = document.createElement('div');
            modal.className = 'debug-features-modal';
            modal.style.cssText = `
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 1rem;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: slideIn 0.3s;
            `;

            modal.innerHTML = `
                <div style="padding: 1.5rem; border-bottom: 1px solid #333;">
                    <h2 style="color: #fff; margin: 0; font-size: 1.5rem;">${title}</h2>
                </div>
                <div style="padding: 1.5rem; color: #e0e0e0;">
                    ${content}
                </div>
                <div style="padding: 1rem 1.5rem; border-top: 1px solid #333; display: flex; gap: 0.75rem; justify-content: flex-end;">
                    ${showCancel ? `
                        <button onclick="document.querySelector('.debug-features-modal-overlay').remove()"
                                style="padding: 0.5rem 1.5rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
                            Cancel
                        </button>
                    ` : ''}
                    <button id="modal-confirm-btn"
                            style="padding: 0.5rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
                        ${confirmText}
                    </button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Event listeners
            if (onConfirm) {
                document.getElementById('modal-confirm-btn').onclick = () => {
                    onConfirm();
                };
            } else {
                document.getElementById('modal-confirm-btn').onclick = () => {
                    overlay.remove();
                };
            }

            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            };

            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escapeHandler);
                }
            });
        },

        closeModal: function() {
            const overlay = document.querySelector('.debug-features-modal-overlay');
            if (overlay) {
                overlay.remove();
            }
        },

        // UI Event Handlers
        selectCategory: function(categoryKey) {
            AdventureCreator.state.debugFeatures.selectedCategory = categoryKey;
            AdventureCreator.state.debugFeatures.selectedOperation = null;
            AdventureCreator.navigate('editor');
        },

        selectOperation: function(operationKey) {
            const state = AdventureCreator.state.debugFeatures;
            state.selectedOperation = state.selectedOperation === operationKey ? null : operationKey;

            // Track recent operations
            if (state.selectedOperation && !state.recentOperations.includes(operationKey)) {
                state.recentOperations.unshift(operationKey);
                if (state.recentOperations.length > 10) {
                    state.recentOperations.pop();
                }
                this.saveToStorage();
            }

            AdventureCreator.navigate('editor');
        },

        toggleFavorite: function(operationKey) {
            const state = AdventureCreator.state.debugFeatures;
            if (state.favoriteOperations.has(operationKey)) {
                state.favoriteOperations.delete(operationKey);
                this.showNotification('Removed from favorites', 'info');
            } else {
                state.favoriteOperations.add(operationKey);
                this.showNotification('Added to favorites', 'success');
            }
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        toggleExplanations: function() {
            AdventureCreator.state.debugFeatures.showExplanations = !AdventureCreator.state.debugFeatures.showExplanations;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        togglePreview: function() {
            AdventureCreator.state.debugFeatures.previewMode = !AdventureCreator.state.debugFeatures.previewMode;
            this.showNotification(AdventureCreator.state.debugFeatures.previewMode ? 'Preview mode enabled' : 'Preview mode disabled', 'info');
            AdventureCreator.navigate('editor');
        },

        updateSearchFilter: function(value) {
            AdventureCreator.state.debugFeatures.searchFilter = value;
            AdventureCreator.navigate('editor');
        },

        // Debug Session Management
        startDebugSession: function() {
            try {
                AdventureCreator.state.debugFeatures.debugSession.active = true;
                AdventureCreator.state.debugFeatures.debugSession.sessionStartTime = new Date().toISOString();
                AdventureCreator.state.debugFeatures.debugSession.currentStepMode = 'RUN';
                this.saveToStorage();
                this.showNotification('Debug session started', 'success');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error starting debug session:', error);
                this.showNotification('Failed to start debug session', 'error');
            }
        },

        stopDebugSession: function() {
            try {
                AdventureCreator.state.debugFeatures.debugSession.active = false;
                AdventureCreator.state.debugFeatures.debugSession.sessionStartTime = null;
                AdventureCreator.state.debugFeatures.debugSession.currentStepMode = null;
                this.saveToStorage();
                this.showNotification('Debug session stopped', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error stopping debug session:', error);
                this.showNotification('Failed to stop debug session', 'error');
            }
        },

        changeDebugLevel: function(level) {
            try {
                AdventureCreator.state.debugFeatures.debugConfiguration.level = level;
                this.saveToStorage();
                this.showNotification(`Debug level changed to ${level}`, 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error changing debug level:', error);
                this.showNotification('Failed to change debug level', 'error');
            }
        },

        openDebugConsole: function() {
            try {
                const content = `
                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; font-family: 'Courier New', monospace; min-height: 300px; max-height: 400px; overflow-y: auto;">
                        <div id="console-output" style="color: #10b981; margin-bottom: 1rem;">
                            <div>Debug Console v1.0.0</div>
                            <div>Type 'help' for available commands</div>
                            <div style="color: #666; margin-top: 0.5rem;">Ready.</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <span style="color: #8b5cf6;">&gt;</span>
                        <input type="text" id="console-input"
                               placeholder="Enter command..."
                               style="flex: 1; background: #0a0a0a; border: 1px solid #333; border-radius: 0.375rem; padding: 0.5rem; color: #10b981; font-family: 'Courier New', monospace;">
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.875rem; color: #666;">
                        <strong>Available commands:</strong> help, state, breakpoints, watch, clear, flags, objects
                    </div>
                `;

                this.showModal(content, '🖥️ Debug Console', () => {
                    const input = document.getElementById('console-input');
                    const output = document.getElementById('console-output');
                    if (input && output) {
                        const cmd = input.value.trim();
                        if (cmd) {
                            output.innerHTML += `<div style="color: #8b5cf6; margin-top: 0.5rem;">&gt; ${this.escapeHtml(cmd)}</div>`;
                            output.innerHTML += `<div style="color: #10b981;">Command executed: ${this.escapeHtml(cmd)}</div>`;
                            input.value = '';
                            output.scrollTop = output.scrollHeight;
                        }
                    }
                }, 'Execute', true);

                setTimeout(() => {
                    const input = document.getElementById('console-input');
                    if (input) input.focus();
                }, 100);
            } catch (error) {
                console.error('Error opening debug console:', error);
                this.showNotification('Failed to open debug console', 'error');
            }
        },

        // Step Debugging Controls
        stepInto: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                state.debugSession.currentStepMode = 'STEP_INTO';
                state.debugSession.callStack.push({
                    level: state.debugSession.callStack.length,
                    action: 'Step Into',
                    timestamp: new Date().toISOString()
                });
                this.saveToStorage();
                this.showNotification('Step Into executed', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error in stepInto:', error);
                this.showNotification('Failed to execute Step Into', 'error');
            }
        },

        stepOver: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                state.debugSession.currentStepMode = 'STEP_OVER';
                state.debugSession.callStack.push({
                    level: state.debugSession.callStack.length,
                    action: 'Step Over',
                    timestamp: new Date().toISOString()
                });
                this.saveToStorage();
                this.showNotification('Step Over executed', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error in stepOver:', error);
                this.showNotification('Failed to execute Step Over', 'error');
            }
        },

        stepOut: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                state.debugSession.currentStepMode = 'STEP_OUT';
                if (state.debugSession.callStack.length > 0) {
                    state.debugSession.callStack.pop();
                }
                this.saveToStorage();
                this.showNotification('Step Out executed', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error in stepOut:', error);
                this.showNotification('Failed to execute Step Out', 'error');
            }
        },

        continueExecution: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                state.debugSession.currentStepMode = 'CONTINUE';
                this.saveToStorage();
                this.showNotification('Execution continued', 'success');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error in continueExecution:', error);
                this.showNotification('Failed to continue execution', 'error');
            }
        },

        pauseExecution: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                state.debugSession.currentStepMode = 'PAUSED';
                this.saveToStorage();
                this.showNotification('Execution paused', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error in pauseExecution:', error);
                this.showNotification('Failed to pause execution', 'error');
            }
        },

        viewCallStack: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                const stack = state.debugSession.callStack;

                const stackList = stack.length > 0
                    ? stack.map((frame, index) => `
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: #8b5cf6; font-weight: 600;">Level ${frame.level}: ${this.escapeHtml(frame.action)}</div>
                                    <div style="color: #666; font-size: 0.875rem; margin-top: 0.25rem;">${new Date(frame.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')
                    : '<div style="color: #666; text-align: center; padding: 2rem;">Call stack is empty</div>';

                this.showModal(`
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${stackList}
                    </div>
                `, '📋 Call Stack', null, 'Close', false);
            } catch (error) {
                console.error('Error viewing call stack:', error);
                this.showNotification('Failed to view call stack', 'error');
            }
        },

        showBreakpointsModal: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                const breakpointsList = state.debugSession.debugPoints.length > 0
                    ? state.debugSession.debugPoints.map((bp, index) => `
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="color: #ef4444; font-weight: 600;">${this.escapeHtml(bp.name)}</div>
                                <div style="color: #666; font-size: 0.875rem;">${this.escapeHtml(bp.condition || 'No condition')}</div>
                            </div>
                            <button onclick="AdventureCreator.modules['debug-features'].deleteBreakpoint(${index})"
                                    style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                                Delete
                            </button>
                        </div>
                    `).join('')
                    : '<div style="color: #666; text-align: center; padding: 2rem;">No breakpoints set</div>';

                this.showModal(`
                    <div>
                        <div style="margin-bottom: 1.5rem; max-height: 300px; overflow-y: auto;">${breakpointsList}</div>
                        <button onclick="AdventureCreator.modules['debug-features'].showAddBreakpointModal()"
                                style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
                            + Add New Breakpoint
                        </button>
                    </div>
                `, '🔴 Breakpoints', null, 'Close', false);
            } catch (error) {
                console.error('Error showing breakpoints modal:', error);
                this.showNotification('Failed to show breakpoints', 'error');
            }
        },

        showAddBreakpointModal: function() {
            this.closeModal();

            const content = `
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Breakpoint Name</label>
                    <input type="text" id="bp-name" placeholder="e.g., kitchen_entry"
                           style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Condition</label>
                    <input type="text" id="bp-condition" placeholder="e.g., AT kitchen"
                           style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Action</label>
                    <select id="bp-action"
                            style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white;">
                        <option value="Pause">Pause</option>
                        <option value="Log Only">Log Only</option>
                        <option value="Show State">Show State</option>
                        <option value="Interactive">Interactive</option>
                    </select>
                </div>
            `;

            this.showModal(content, '➕ Add Breakpoint', () => {
                const name = document.getElementById('bp-name').value;
                const condition = document.getElementById('bp-condition').value;
                const action = document.getElementById('bp-action').value;

                if (!name) {
                    this.showNotification('Please enter a breakpoint name', 'warning');
                    return;
                }

                const state = AdventureCreator.state.debugFeatures;
                state.debugSession.debugPoints.push({
                    name: name,
                    condition: condition,
                    action: action,
                    created: new Date().toISOString()
                });

                this.saveToStorage();
                this.closeModal();
                this.showNotification('Breakpoint added successfully', 'success');
                this.showBreakpointsModal();
            }, 'Add Breakpoint');
        },

        deleteBreakpoint: function(index) {
            try {
                const state = AdventureCreator.state.debugFeatures;
                state.debugSession.debugPoints.splice(index, 1);
                this.saveToStorage();
                this.closeModal();
                this.showNotification('Breakpoint deleted', 'success');
                this.showBreakpointsModal();
            } catch (error) {
                console.error('Error deleting breakpoint:', error);
                this.showNotification('Failed to delete breakpoint', 'error');
            }
        },

        showConfigurationsModal: function() {
            try {
                const state = AdventureCreator.state.debugFeatures;
                const configsList = state.savedConfigurations.length > 0
                    ? state.savedConfigurations.map((config, index) => `
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: #8b5cf6; font-weight: 600;">${this.escapeHtml(config.name)}</div>
                                    <div style="color: #666; font-size: 0.875rem;">${this.escapeHtml(config.description || 'No description')}</div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="AdventureCreator.modules['debug-features'].loadConfiguration(${index})"
                                            style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                                        Load
                                    </button>
                                    <button onclick="AdventureCreator.modules['debug-features'].deleteConfiguration(${index})"
                                            style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')
                    : '<div style="color: #666; text-align: center; padding: 2rem;">No saved configurations</div>';

                this.showModal(`
                    <div>
                        <div style="margin-bottom: 1.5rem; max-height: 300px; overflow-y: auto;">${configsList}</div>
                        <button onclick="AdventureCreator.modules['debug-features'].showSaveConfigurationModal()"
                                style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
                            💾 Save Current Configuration
                        </button>
                    </div>
                `, '💾 Debug Configurations', null, 'Close', false);
            } catch (error) {
                console.error('Error showing configurations modal:', error);
                this.showNotification('Failed to show configurations', 'error');
            }
        },

        showSaveConfigurationModal: function() {
            this.closeModal();

            const content = `
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Configuration Name</label>
                    <input type="text" id="config-name" placeholder="e.g., Combat Debug Setup"
                           style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Description</label>
                    <textarea id="config-description" placeholder="Describe this configuration..."
                              style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white; min-height: 80px;"></textarea>
                </div>
            `;

            this.showModal(content, '💾 Save Configuration', () => {
                const name = document.getElementById('config-name').value;
                const description = document.getElementById('config-description').value;

                if (!name) {
                    this.showNotification('Please enter a configuration name', 'warning');
                    return;
                }

                const state = AdventureCreator.state.debugFeatures;
                state.savedConfigurations.push({
                    id: Date.now(),
                    name: name,
                    description: description,
                    debugLevel: state.debugConfiguration.level,
                    breakpoints: [...state.debugSession.debugPoints],
                    watchedVariables: [...state.debugSession.watchedVariables],
                    created: new Date().toISOString()
                });

                this.saveToStorage();
                this.closeModal();
                this.showNotification('Configuration saved successfully', 'success');
                this.showConfigurationsModal();
            }, 'Save Configuration');
        },

        loadConfiguration: function(index) {
            try {
                const state = AdventureCreator.state.debugFeatures;
                const config = state.savedConfigurations[index];

                if (!config) return;

                state.debugConfiguration.level = config.debugLevel;
                state.debugSession.debugPoints = [...config.breakpoints];
                state.debugSession.watchedVariables = [...config.watchedVariables];

                this.saveToStorage();
                this.closeModal();
                this.showNotification(`Loaded configuration: ${config.name}`, 'success');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error loading configuration:', error);
                this.showNotification('Failed to load configuration', 'error');
            }
        },

        deleteConfiguration: function(index) {
            try {
                const state = AdventureCreator.state.debugFeatures;
                state.savedConfigurations.splice(index, 1);
                this.saveToStorage();
                this.closeModal();
                this.showNotification('Configuration deleted', 'success');
                this.showConfigurationsModal();
            } catch (error) {
                console.error('Error deleting configuration:', error);
                this.showNotification('Failed to delete configuration', 'error');
            }
        },

        addToRule: function(operationKey, type) {
            try {
                const category = this.getDefinitions()[AdventureCreator.state.debugFeatures.selectedCategory];
                const operation = category.operations[operationKey];

                if (!operation) return;

                const rule = {
                    type: type,
                    operation: operationKey,
                    name: operation.name,
                    code: operation.daadCode,
                    parameters: operation.parameters || []
                };

                if (type === 'action') {
                    AdventureCreator.state.debugFeatures.currentRule.actions.push(rule);
                }

                this.saveToStorage();
                this.showNotification(`Added "${operation.name}" to current rule`, 'success');
            } catch (error) {
                console.error('Error adding to rule:', error);
                this.showNotification('Failed to add to rule', 'error');
            }
        },

        showCodeExample: function(operationKey) {
            try {
                const category = this.getDefinitions()[AdventureCreator.state.debugFeatures.selectedCategory];
                const operation = category.operations[operationKey];

                if (!operation) return;

                const examples = operation.examples.map(ex => `<div style="color: #666; margin-bottom: 0.5rem;">; ${this.escapeHtml(ex)}</div>`).join('');
                const code = `
                    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 1rem; font-family: 'Courier New', monospace; margin-bottom: 1rem;">
                        <div style="color: #8b5cf6; font-weight: 600; margin-bottom: 1rem;">; ${this.escapeHtml(operation.name)}</div>
                        ${examples}
                        <div style="color: #10b981; margin-top: 1rem;">${this.escapeHtml(operation.daadCode)}</div>
                    </div>
                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                        <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.5rem;">Effect:</div>
                        <div style="color: #ccc;">${this.escapeHtml(operation.effect || 'N/A')}</div>
                    </div>
                `;

                this.showModal(code, `📋 Code Example: ${operation.name}`, () => {
                    this.closeModal();
                    this.showNotification('Code example closed', 'info');
                }, 'Close', false);
            } catch (error) {
                console.error('Error showing code example:', error);
                this.showNotification('Failed to show code example', 'error');
            }
        },

        showParameterEditor: function(operationKey) {
            try {
                const category = this.getDefinitions()[AdventureCreator.state.debugFeatures.selectedCategory];
                const operation = category.operations[operationKey];

                if (!operation || !operation.parameters) {
                    this.showNotification('No parameters to configure', 'info');
                    return;
                }

                const paramInputs = operation.parameters.map((param, index) => {
                    let input = '';
                    switch(param.type) {
                        case 'text':
                            input = `<input type="text" id="param-${index}" placeholder="${param.placeholder || ''}"
                                           style="width: 100%; padding: 0.5rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.375rem; color: white;">`;
                            break;
                        case 'number':
                            input = `<input type="number" id="param-${index}" min="${param.min || 0}" max="${param.max || 999}" value="${param.default || 0}"
                                           style="width: 100%; padding: 0.5rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.375rem; color: white;">`;
                            break;
                        case 'select':
                            const options = param.options.map(opt => `<option value="${opt}"${opt === param.default ? ' selected' : ''}>${opt}</option>`).join('');
                            input = `<select id="param-${index}" style="width: 100%; padding: 0.5rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.375rem; color: white;">
                                ${options}
                            </select>`;
                            break;
                        case 'checkbox':
                            input = `<input type="checkbox" id="param-${index}" ${param.default ? 'checked' : ''}
                                           style="width: 1.25rem; height: 1.25rem;">`;
                            break;
                    }

                    return `
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">
                                ${this.escapeHtml(param.name)}${param.required ? ' *' : ''}
                            </label>
                            ${input}
                            <div style="color: #666; font-size: 0.875rem; margin-top: 0.25rem;">${this.escapeHtml(param.description)}</div>
                        </div>
                    `;
                }).join('');

                this.showModal(`
                    <div>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                            <div style="color: #8b5cf6; font-weight: 600; margin-bottom: 0.5rem;">${this.escapeHtml(operation.name)}</div>
                            <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(operation.description)}</div>
                        </div>
                        ${paramInputs}
                    </div>
                `, `⚙️ Parameter Editor: ${operation.name}`, () => {
                    const values = operation.parameters.map((param, index) => {
                        const input = document.getElementById(`param-${index}`);
                        return param.type === 'checkbox' ? input.checked : input.value;
                    });
                    this.closeModal();
                    this.showNotification(`Parameters configured for ${operation.name}`, 'success');
                }, 'Apply');
            } catch (error) {
                console.error('Error showing parameter editor:', error);
                this.showNotification('Failed to show parameter editor', 'error');
            }
        },

        showHelpModal: function() {
            const content = `
                <div style="color: #e0e0e0;">
                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #8b5cf6; margin-bottom: 1rem;">⌨️ Keyboard Shortcuts</h3>
                        <div style="display: grid; gap: 0.5rem; font-family: monospace;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">F1</span>
                                <span>Show this help</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">F5</span>
                                <span>Start/Stop debug session</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">F10</span>
                                <span>Step Over</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">F11</span>
                                <span>Step Into</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">Shift+F11</span>
                                <span>Step Out</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">Ctrl+D</span>
                                <span>Open debug console</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">Ctrl+S</span>
                                <span>Save configuration</span>
                            </div>
                        </div>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #8b5cf6; margin-bottom: 1rem;">🚀 Getting Started</h3>
                        <ol style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li>Browse debug categories in the left sidebar</li>
                            <li>Click on a debug operation to see details</li>
                            <li>Use "Add to Rule" to add operations to your current rule</li>
                            <li>Set breakpoints and watchpoints for debugging</li>
                            <li>Start a debug session with F5 or the "Start Debug" button</li>
                            <li>Use step debugging controls to analyze execution</li>
                            <li>Save configurations for reuse</li>
                        </ol>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                        <h3 style="color: #8b5cf6; margin-bottom: 1rem;">💡 Tips</h3>
                        <ul style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li>Star your favorite operations for quick access</li>
                            <li>Use the search filter to find specific features</li>
                            <li>Toggle explanations to see detailed use cases</li>
                            <li>Save debug configurations for different scenarios</li>
                            <li>Use the debug console for interactive debugging</li>
                        </ul>
                    </div>
                </div>
            `;

            this.showModal(content, '❓ Debug Features Help', null, 'Close', false);
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

        // Utility Functions
        filterOperations: function(operations, filter) {
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

        getComplexityColor: function(category) {
            const colors = {
                'basic': '#10b981',
                'intermediate': '#f59e0b',
                'advanced': '#ef4444',
                'expert': '#8b5cf6'
            };
            return colors[category] || '#6b7280';
        },

        escapeHtml: function(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        },

        // Export functionality for integration with other modules
        getOperationByKey: function(operationKey) {
            const definitions = this.getDefinitions();
            for (const category of Object.values(definitions)) {
                if (category.operations[operationKey]) {
                    return category.operations[operationKey];
                }
            }
            return null;
        },

        getAllOperations: function() {
            const definitions = this.getDefinitions();
            const allOps = {};

            Object.values(definitions).forEach(category => {
                Object.assign(allOps, category.operations);
            });

            return allOps;
        }
    });

    console.log('DAAD Debug Features module registered successfully');
})();
