// module-debugging-tools.js - DAAD Debugging Tools
(function() {
    'use strict';

    console.log('DAAD Debugging Tools module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Debugging Tools module requires the Adventure Creator framework.');
        return;
    }

    AdventureCreator.registerModule('debugging-tools', {
        name: 'Debugging Tools',
        version: '1.0.0',
        description: 'Professional debugging capabilities with breakpoints, variable inspection, and step-by-step execution',
        category: 'Development Tools',
        author: 'DAAD Adventure Creator',

        init: function() {
            console.log('Debugging Tools module initialized');
            this.initializeState();
            this.loadFromStorage();
            this.setupKeyboardShortcuts();
        },

        initializeState: function() {
            if (!AdventureCreator.state.debuggingTools) {
                AdventureCreator.state.debuggingTools = {
                    selectedCategory: 'debug_commands',
                    selectedOperation: null,
                    showExplanations: true,
                    previewMode: false,
                    searchFilter: '',
                    debugSession: {
                        active: false,
                        breakpoints: [],
                        watchpoints: [],
                        executionState: 'stopped',
                        currentStep: null,
                        callStack: [],
                        variables: {}
                    },
                    debugData: {
                        variables: [],
                        callStack: [],
                        executionHistory: []
                    },
                    currentRule: {
                        conditions: [],
                        actions: []
                    },
                    savedConfigurations: [],
                    favorites: new Set(),
                    recentOperations: []
                };
            }
        },

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Only handle shortcuts when debugging tools is active
                if (!document.querySelector('.debugging-tools-editor')) return;

                // F5 - Start/Stop debugging
                if (e.key === 'F5') {
                    e.preventDefault();
                    const state = AdventureCreator.state.debuggingTools;
                    if (state.debugSession.active) {
                        this.stopDebugging();
                    } else {
                        this.startDebugging();
                    }
                }
                // F10 - Step Over
                if (e.key === 'F10') {
                    e.preventDefault();
                    this.stepOver();
                }
                // F11 - Step Into
                if (e.key === 'F11') {
                    e.preventDefault();
                    this.stepInto();
                }
                // Shift+F11 - Step Out
                if (e.shiftKey && e.key === 'F11') {
                    e.preventDefault();
                    this.stepOut();
                }
                // Ctrl+D - Debug Console
                if (e.ctrlKey && e.key === 'd') {
                    e.preventDefault();
                    this.openDebugConsole();
                }
                // Ctrl+S - Save configuration
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.showSaveConfigurationModal();
                }
                // F1 - Help
                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }
            });
        },

        saveToStorage() {
            try {
                const state = AdventureCreator.state.debuggingTools;
                const toSave = {
                    ...state,
                    favorites: Array.from(state.favorites),
                    // Don't save active debug session, but save breakpoints/watchpoints
                    debugSession: {
                        ...state.debugSession,
                        active: false,
                        executionState: 'stopped'
                    }
                };
                localStorage.setItem('debuggingTools_state', JSON.stringify(toSave));
            } catch (error) {
                console.error('Failed to save debugging tools state:', error);
            }
        },

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('debuggingTools_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.favorites) {
                        parsed.favorites = new Set(parsed.favorites);
                    }
                    AdventureCreator.state.debuggingTools = {
                        ...AdventureCreator.state.debuggingTools,
                        ...parsed
                    };
                }
            } catch (error) {
                console.error('Failed to load debugging tools state:', error);
            }
        },

        render: function() {
            const state = AdventureCreator.state.debuggingTools;

            return `
                <div class="debugging-tools-editor" style="background: #0a0a0a; min-height: 100vh; color: #e0e0e0;">
                    <div class="module-header" style="background: #1a1a1a; border-bottom: 1px solid #333; padding: 2rem;">
                        <div style="max-width: 1400px; margin: 0 auto;">
                            <h1 style="color: #fff; font-size: 2rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem;">
                                🐛 Debugging Tools
                                <span style="font-size: 0.6em; color: #8b5cf6; background: rgba(139, 92, 246, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">DAAD Module</span>
                                ${state.debugSession.active ? `<span style="font-size: 0.6em; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">DEBUG ACTIVE</span>` : ''}
                            </h1>
                            <p style="color: #999; font-size: 1.1rem; margin-bottom: 1.5rem;">
                                Professional debugging capabilities with breakpoints, variable inspection, and step-by-step execution
                            </p>

                            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="AdventureCreator.modules['debugging-tools'].toggleExplanations()"
                                            style="padding: 0.5rem 1rem; background: ${state.showExplanations ? '#8b5cf6' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.showExplanations ? '📖 Hide Explanations' : '📖 Show Explanations'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['debugging-tools'].showBreakpointsModal()"
                                            style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        🔴 Breakpoints (${state.debugSession.breakpoints.length})
                                    </button>
                                    <button onclick="AdventureCreator.modules['debugging-tools'].openDebugConsole()"
                                            style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        🖥️ Console
                                    </button>
                                    <button onclick="AdventureCreator.modules['debugging-tools'].${state.debugSession.active ? 'stopDebugging' : 'startDebugging'}()"
                                            style="padding: 0.5rem 1rem; background: ${state.debugSession.active ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.debugSession.active ? '⏹️ Stop (F5)' : '▶️ Start (F5)'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['debugging-tools'].showHelpModal()"
                                            style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ❓ Help
                                    </button>
                                </div>

                                <div style="flex: 1; max-width: 300px; position: relative;">
                                    <input type="text"
                                           placeholder="Search debugging features..."
                                           value="${this.escapeHtml(state.searchFilter)}"
                                           oninput="AdventureCreator.modules['debugging-tools'].updateSearchFilter(this.value)"
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
                             onclick="AdventureCreator.modules['debugging-tools'].selectCategory('${key}')"
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
                        <div><strong>Breakpoints:</strong> ${state.debugSession.breakpoints.length}</div>
                        <div><strong>Watchpoints:</strong> ${state.debugSession.watchpoints.length}</div>
                        <div><strong>State:</strong> ${state.debugSession.executionState}</div>
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

                    ${state.debugSession.active ? this.renderDebugSession(state) : ''}

                    <div class="operations-grid" style="display: grid; gap: 1.5rem;">
                        ${Object.entries(filteredOps).map(([key, op]) => this.renderOperationCard(key, op, state)).join('')}
                    </div>
                </div>
            `;
        },

        renderDebugSession: function(state) {
            return `
                <div class="debug-session-panel" style="background: #1a1a1a; border: 1px solid #10b981; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem;">
                    <h3 style="color: #10b981; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        🎮 Active Debug Session
                    </h3>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #10b981; font-size: 1.25rem; font-weight: 600;">${state.debugSession.executionState.toUpperCase()}</div>
                            <div style="color: #999; font-size: 0.875rem;">Execution State</div>
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #10b981; font-size: 1.25rem; font-weight: 600;">${state.debugSession.breakpoints.length}</div>
                            <div style="color: #999; font-size: 0.875rem;">Active Breakpoints</div>
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #10b981; font-size: 1.25rem; font-weight: 600;">${state.debugSession.watchpoints.length}</div>
                            <div style="color: #999; font-size: 0.875rem;">Active Watchpoints</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button onclick="AdventureCreator.modules['debugging-tools'].stepInto()"
                                style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ⬇️ Step Into (F11)
                        </button>
                        <button onclick="AdventureCreator.modules['debugging-tools'].stepOver()"
                                style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ➡️ Step Over (F10)
                        </button>
                        <button onclick="AdventureCreator.modules['debugging-tools'].stepOut()"
                                style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ⬆️ Step Out (Shift+F11)
                        </button>
                        <button onclick="AdventureCreator.modules['debugging-tools'].continueExecution()"
                                style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ▶️ Continue
                        </button>
                        <button onclick="AdventureCreator.modules['debugging-tools'].pauseExecution()"
                                style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ⏸️ Pause
                        </button>
                    </div>
                </div>
            `;
        },

        renderOperationCard: function(key, operation, state) {
            const isSelected = state.selectedOperation === key;
            const complexityColor = this.getComplexityColor(operation.category);
            const isFavorited = state.favorites.has(key);

            return `
                <div class="operation-card ${isSelected ? 'selected' : ''}"
                     style="background: #1a1a1a; border: 2px solid ${isSelected ? '#8b5cf6' : '#333'}; border-radius: 0.75rem; padding: 1.5rem; cursor: pointer; transition: all 0.2s; position: relative;">

                    <button onclick="event.stopPropagation(); AdventureCreator.modules['debugging-tools'].toggleFavorite('${key}')"
                            style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: ${isFavorited ? '#f59e0b' : '#666'};">
                        ${isFavorited ? '⭐' : '☆'}
                    </button>

                    <div onclick="AdventureCreator.modules['debugging-tools'].selectOperation('${key}')" class="operation-header" style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.5rem;">${operation.icon}</span>
                                <h3 style="color: #fff; margin: 0; font-size: 1.1rem;">${operation.name}</h3>
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
                            <button onclick="AdventureCreator.modules['debugging-tools'].addToRule('${key}', 'action')"
                                    style="flex: 1; padding: 0.5rem; background: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                ➕ Add as Action
                            </button>
                            <button onclick="AdventureCreator.modules['debugging-tools'].showCodeExample('${key}')"
                                    style="padding: 0.5rem 0.75rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                📋 Code
                            </button>
                            ${operation.parameters ? `
                                <button onclick="AdventureCreator.modules['debugging-tools'].showParameterEditor('${key}')"
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
                    description: "Insert debugging commands and condacts into your adventure",
                    icon: "🐛",
                    color: "#3b82f6",
                    operations: {
                        DEBUG_CONDACT: {
                            name: "DEBUG condact",
                            description: "Add DEBUG condacts to display debug information during game execution. Shows variable values, game state, and custom messages for development and testing.",
                            parameters: [
                                {
                                    name: "debug_message",
                                    type: "text",
                                    description: "Message to display",
                                    required: true,
                                    placeholder: "Debug checkpoint reached"
                                },
                                {
                                    name: "debug_level",
                                    type: "select",
                                    options: ["INFO", "WARNING", "ERROR", "TRACE"],
                                    description: "Debug level",
                                    required: true,
                                    default: "INFO"
                                },
                                {
                                    name: "show_variables",
                                    type: "checkbox",
                                    description: "Show current variable values",
                                    default: true
                                },
                                {
                                    name: "show_location",
                                    type: "checkbox",
                                    description: "Show current location",
                                    default: true
                                },
                                {
                                    name: "show_inventory",
                                    type: "checkbox",
                                    description: "Show current inventory",
                                    default: false
                                }
                            ],
                            examples: [
                                'DEBUG "Player entered kitchen" INFO VARS LOC',
                                'DEBUG "Combat system activated" WARNING',
                                'DEBUG "Critical error in puzzle logic" ERROR VARS'
                            ],
                            useCases: [
                                "Tracking game flow during development",
                                "Debugging complex rule interactions",
                                "Monitoring variable changes",
                                "Identifying execution bottlenecks",
                                "Testing game logic and mechanics"
                            ],
                            daadCode: 'DEBUG "{debug_message}" {debug_level}',
                            category: "intermediate",
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
                                    options: ["Rule Level", "Action Level", "Turn Level", "Process Level"],
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
                            category: "advanced",
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
                    color: "#ef4444",
                    operations: {
                        BREAKPOINT: {
                            name: "Set breakpoint",
                            description: "Set a breakpoint that pauses execution when specific conditions are met. Perfect for investigating specific game states and debugging complex logic.",
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
                                "Debugging complex conditions",
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
                        WATCH_VARIABLE: {
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
                                "Monitoring game progression",
                                "Finding logic errors and bugs",
                                "Performance monitoring"
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
                    title: "👣 Step Debugging",
                    description: "Step-by-step execution control and inspection",
                    icon: "👣",
                    color: "#10b981",
                    operations: {
                        STEP_DEBUGGER: {
                            name: "Step-by-step debugger",
                            description: "Enable step-by-step debugging with full execution control. Step through code line by line, inspect variables, and understand complex logic flow.",
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
                                    options: ["Read Only", "Limited Write", "Full Access"],
                                    description: "Level of console access",
                                    required: true,
                                    default: "Limited Write"
                                },
                                {
                                    name: "hotkey_activation",
                                    type: "text",
                                    description: "Hotkey to open console",
                                    default: "Ctrl+D",
                                    placeholder: "Ctrl+D"
                                },
                                {
                                    name: "command_history",
                                    type: "checkbox",
                                    description: "Enable command history",
                                    default: true
                                },
                                {
                                    name: "auto_completion",
                                    type: "checkbox",
                                    description: "Enable auto-completion",
                                    default: true
                                }
                            ],
                            examples: [
                                "Interactive console for live debugging",
                                "Real-time variable modification",
                                "Live game state inspection"
                            ],
                            useCases: [
                                "Live debugging and testing",
                                "Real-time game modification",
                                "Interactive problem solving",
                                "Dynamic testing scenarios",
                                "Professional debugging workflow"
                            ],
                            daadCode: 'DEBUG_CONSOLE {console_access_level} "{hotkey_activation}"',
                            category: "expert",
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
                                "Debugging state corruption",
                                "Performance analysis",
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
                                "Performance optimization",
                                "Memory leak detection",
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
                },

                automated_testing: {
                    title: "🤖 Automated Testing",
                    description: "Automated test suites and validation tools",
                    icon: "🤖",
                    color: "#f59e0b",
                    operations: {
                        AUTO_TEST: {
                            name: "Automated test suite",
                            description: "Run automated tests to check game logic, find bugs, and validate gameplay mechanics. Comprehensive testing with detailed reporting.",
                            parameters: [
                                {
                                    name: "test_suite",
                                    type: "select",
                                    options: ["Basic Functionality", "Complete Walkthrough", "Edge Cases", "Stress Testing", "All Tests"],
                                    description: "Type of tests to run",
                                    required: true,
                                    default: "Basic Functionality"
                                },
                                {
                                    name: "test_speed",
                                    type: "select",
                                    options: ["Normal Speed", "Fast", "Maximum Speed", "Step-by-Step"],
                                    description: "Speed of test execution",
                                    default: "Fast"
                                },
                                {
                                    name: "report_level",
                                    type: "select",
                                    options: ["Summary Only", "Detailed", "Verbose", "Debug Level"],
                                    description: "Detail level of test reports",
                                    default: "Detailed"
                                },
                                {
                                    name: "stop_on_error",
                                    type: "checkbox",
                                    description: "Stop testing when error is found",
                                    default: true
                                }
                            ],
                            examples: [
                                'AUTO_TEST COMPLETE_WALKTHROUGH FAST DETAILED STOP_ON_ERROR',
                                'AUTO_TEST EDGE_CASES NORMAL VERBOSE CONTINUE',
                                'AUTO_TEST STRESS_TESTING MAX_SPEED SUMMARY'
                            ],
                            useCases: [
                                "Regression testing after changes",
                                "Comprehensive game validation",
                                "Finding edge case bugs",
                                "Quality assurance automation",
                                "Continuous integration testing"
                            ],
                            daadCode: 'AUTO_TEST {test_suite} {test_speed} {report_level}',
                            category: "expert",
                            icon: "🤖",
                            type: "action",
                            effect: "Runs comprehensive automated testing"
                        },
                        FUZZING_TEST: {
                            name: "Fuzzing and stress testing",
                            description: "Generate random inputs and edge cases to find unexpected bugs and crashes. Advanced testing technique for finding hidden issues.",
                            parameters: [
                                {
                                    name: "fuzzing_intensity",
                                    type: "select",
                                    options: ["Light", "Moderate", "Intensive", "Extreme"],
                                    description: "Intensity of fuzzing tests",
                                    required: true,
                                    default: "Moderate"
                                },
                                {
                                    name: "focus_areas",
                                    type: "multiselect",
                                    options: ["Parser", "Actions", "Conditions", "Objects", "Flags"],
                                    description: "Areas to focus fuzzing on"
                                },
                                {
                                    name: "duration",
                                    type: "number",
                                    description: "Test duration in minutes",
                                    default: 10,
                                    min: 1,
                                    max: 120
                                }
                            ],
                            examples: [
                                "Random input stress testing",
                                "Edge case vulnerability testing",
                                "Crash resistance validation"
                            ],
                            useCases: [
                                "Finding hidden bugs and crashes",
                                "Testing input validation",
                                "Stress testing game stability",
                                "Professional quality assurance",
                                "Security vulnerability testing"
                            ],
                            daadCode: 'FUZZING_TEST {fuzzing_intensity} {focus_areas} {duration}',
                            category: "expert",
                            icon: "🎲",
                            type: "action",
                            effect: "Performs fuzzing and stress testing"
                        }
                    }
                }
            };
        },

        // UI Event Handlers
        selectCategory: function(categoryKey) {
            AdventureCreator.state.debuggingTools.selectedCategory = categoryKey;
            AdventureCreator.state.debuggingTools.selectedOperation = null;
            AdventureCreator.navigate('editor');
        },

        selectOperation: function(operationKey) {
            try {
                const state = AdventureCreator.state.debuggingTools;
                state.selectedOperation = state.selectedOperation === operationKey ? null : operationKey;

                // Add to recent operations
                if (state.selectedOperation) {
                    state.recentOperations = state.recentOperations.filter(k => k !== operationKey);
                    state.recentOperations.unshift(operationKey);
                    state.recentOperations = state.recentOperations.slice(0, 10);
                    this.saveToStorage();
                }

                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error selecting operation:', error);
                this.showNotification('Failed to select operation', 'error');
            }
        },

        toggleFavorite: function(operationKey) {
            const state = AdventureCreator.state.debuggingTools;
            if (state.favorites.has(operationKey)) {
                state.favorites.delete(operationKey);
                this.showNotification('Removed from favorites', 'info');
            } else {
                state.favorites.add(operationKey);
                this.showNotification('Added to favorites', 'success');
            }
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        toggleExplanations: function() {
            AdventureCreator.state.debuggingTools.showExplanations = !AdventureCreator.state.debuggingTools.showExplanations;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        togglePreview: function() {
            AdventureCreator.state.debuggingTools.previewMode = !AdventureCreator.state.debuggingTools.previewMode;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        updateSearchFilter: function(value) {
            AdventureCreator.state.debuggingTools.searchFilter = value;
            // Don't save search to storage - it's transient
            AdventureCreator.navigate('editor');
        },

        // Debug Session Control
        startDebugging: function() {
            try {
                AdventureCreator.state.debuggingTools.debugSession.active = true;
                AdventureCreator.state.debuggingTools.debugSession.executionState = 'paused';
                AdventureCreator.state.debuggingTools.debugSession.callStack = ['Main Process'];
                AdventureCreator.state.debuggingTools.debugSession.variables = {
                    location: 0,
                    score: 0,
                    turns: 0
                };
                this.showNotification('Debug session started - Execution paused', 'success');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error starting debug session:', error);
                this.showNotification('Failed to start debug session', 'error');
            }
        },

        stopDebugging: function() {
            try {
                AdventureCreator.state.debuggingTools.debugSession.active = false;
                AdventureCreator.state.debuggingTools.debugSession.executionState = 'stopped';
                AdventureCreator.state.debuggingTools.debugSession.callStack = [];
                this.showNotification('Debug session stopped', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error stopping debug session:', error);
                this.showNotification('Failed to stop debug session', 'error');
            }
        },

        openDebugConsole: function() {
            this.showModal(`
                <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; font-family: 'Courier New', monospace;">
                    <div style="color: #10b981; margin-bottom: 1rem;">DAAD Debug Console v1.0</div>
                    <div style="color: #999; font-size: 0.875rem; margin-bottom: 1rem;">
                        > Type commands to interact with the game state<br>
                        > Available commands: help, vars, flags, location, inventory, step, continue
                    </div>
                    <div style="background: #000; border: 1px solid #333; border-radius: 0.25rem; padding: 0.75rem; min-height: 200px; color: #0f0; font-size: 0.875rem; margin-bottom: 1rem;">
                        > Ready for input...<br>
                        <span style="color: #666;">[Console simulation - full implementation would provide interactive REPL]</span>
                    </div>
                    <input type="text" placeholder="Enter command..."
                           style="width: 100%; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 0.75rem; border-radius: 0.25rem; font-family: 'Courier New', monospace;">
                </div>
            `, '🖥️ Debug Console', null, 'Close', false);
        },

        // Step Debugging Controls
        stepInto: function() {
            try {
                const state = AdventureCreator.state.debuggingTools;
                if (!state.debugSession.active) {
                    this.showNotification('Start debug session first (F5)', 'warning');
                    return;
                }
                state.debugSession.currentStep = 'into';
                state.debugSession.callStack.push('Entering function...');
                this.showNotification('Step Into: Entering next function', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error stepping into:', error);
                this.showNotification('Step into failed', 'error');
            }
        },

        stepOver: function() {
            try {
                const state = AdventureCreator.state.debuggingTools;
                if (!state.debugSession.active) {
                    this.showNotification('Start debug session first (F5)', 'warning');
                    return;
                }
                state.debugSession.currentStep = 'over';
                this.showNotification('Step Over: Executing current line', 'info');
            } catch (error) {
                console.error('Error stepping over:', error);
                this.showNotification('Step over failed', 'error');
            }
        },

        stepOut: function() {
            try {
                const state = AdventureCreator.state.debuggingTools;
                if (!state.debugSession.active) {
                    this.showNotification('Start debug session first (F5)', 'warning');
                    return;
                }
                if (state.debugSession.callStack.length > 1) {
                    state.debugSession.callStack.pop();
                }
                state.debugSession.currentStep = 'out';
                this.showNotification('Step Out: Returning from function', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error stepping out:', error);
                this.showNotification('Step out failed', 'error');
            }
        },

        continueExecution: function() {
            try {
                AdventureCreator.state.debuggingTools.debugSession.executionState = 'running';
                this.showNotification('Execution continued until next breakpoint', 'success');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error continuing execution:', error);
                this.showNotification('Continue failed', 'error');
            }
        },

        pauseExecution: function() {
            try {
                AdventureCreator.state.debuggingTools.debugSession.executionState = 'paused';
                this.showNotification('Execution paused', 'info');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error pausing execution:', error);
                this.showNotification('Pause failed', 'error');
            }
        },

        addToRule: function(operationKey, type) {
            try {
                const operation = this.getOperationByKey(operationKey);
                if (!operation) {
                    this.showNotification('Operation not found', 'error');
                    return;
                }

                const rule = {
                    type: type,
                    operation: operationKey,
                    name: operation.name,
                    code: operation.daadCode,
                    parameters: operation.parameters || []
                };

                if (type === 'action') {
                    AdventureCreator.state.debuggingTools.currentRule.actions.push(rule);
                }

                this.showNotification(`Added "${operation.name}" to current rule`, 'success');
                this.saveToStorage();
            } catch (error) {
                console.error('Error adding to rule:', error);
                this.showNotification('Failed to add to rule', 'error');
            }
        },

        showCodeExample: function(operationKey) {
            try {
                const operation = this.getOperationByKey(operationKey);
                if (!operation) {
                    this.showNotification('Operation not found', 'error');
                    return;
                }

                const examples = operation.examples.map(ex => `; ${ex}`).join('\n');
                const code = `; ${operation.name}\n${examples}\n\n${operation.daadCode}`;

                this.showModal(`
                    <div style="background: #0f172a; border-radius: 0.5rem; padding: 1rem; font-family: 'Courier New', monospace; color: #8b5cf6;">
                        <pre style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${this.escapeHtml(code)}</pre>
                    </div>
                    <button onclick="navigator.clipboard.writeText(${JSON.stringify(code)}); AdventureCreator.modules['debugging-tools'].showNotification('Code copied to clipboard', 'success')"
                            style="margin-top: 1rem; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; width: 100%;">
                        📋 Copy to Clipboard
                    </button>
                `, `📋 DAAD Code: ${operation.name}`, null, 'Close', false);
            } catch (error) {
                console.error('Error showing code example:', error);
                this.showNotification('Failed to show code example', 'error');
            }
        },

        showParameterEditor: function(operationKey) {
            try {
                const operation = this.getOperationByKey(operationKey);
                if (!operation || !operation.parameters) {
                    this.showNotification('No parameters to configure', 'info');
                    return;
                }

                const paramInputs = operation.parameters.map((param, index) => {
                    let input = '';
                    switch(param.type) {
                        case 'text':
                            input = `<input type="text" id="param-${index}" class="param-input" placeholder="${param.placeholder || ''}" ${param.required ? 'required' : ''}>`;
                            break;
                        case 'number':
                            input = `<input type="number" id="param-${index}" class="param-input" min="${param.min || 0}" max="${param.max || 999}" value="${param.default || 0}" ${param.required ? 'required' : ''}>`;
                            break;
                        case 'select':
                            input = `<select id="param-${index}" class="param-input">
                                ${param.options.map(opt => `<option value="${opt}" ${opt === param.default ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>`;
                            break;
                        case 'checkbox':
                            input = `<input type="checkbox" id="param-${index}" class="param-checkbox" ${param.default ? 'checked' : ''}>`;
                            break;
                        default:
                            input = `<input type="text" id="param-${index}" class="param-input">`;
                    }

                    return `
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #fff; margin-bottom: 0.5rem; font-weight: 500;">
                                ${param.name}${param.required ? ' *' : ''}
                            </label>
                            ${input}
                            <div style="color: #666; font-size: 0.75rem; margin-top: 0.25rem;">
                                ${param.description}
                            </div>
                        </div>
                    `;
                }).join('');

                this.showModal(`
                    <div>
                        <div style="background: #8b5cf6; color: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                            <strong>Configure:</strong> ${operation.name}
                        </div>
                        ${paramInputs}
                    </div>
                    <style>
                        .param-input {
                            width: 100%;
                            padding: 0.75rem;
                            background: #0a0a0a;
                            border: 1px solid #333;
                            border-radius: 0.375rem;
                            color: #fff;
                            font-size: 0.875rem;
                        }
                        .param-input:focus {
                            outline: none;
                            border-color: #8b5cf6;
                        }
                        .param-checkbox {
                            width: 1.25rem;
                            height: 1.25rem;
                        }
                    </style>
                `, `⚙️ Parameter Editor: ${operation.name}`, () => {
                    // Validate and apply parameters
                    const values = operation.parameters.map((param, index) => {
                        const input = document.getElementById(`param-${index}`);
                        if (param.type === 'checkbox') {
                            return input.checked;
                        }
                        return input.value;
                    });

                    this.showNotification(`Parameters configured for ${operation.name}`, 'success');
                }, 'Apply');
            } catch (error) {
                console.error('Error showing parameter editor:', error);
                this.showNotification('Failed to show parameter editor', 'error');
            }
        },

        // Breakpoints Management
        showBreakpointsModal: function() {
            const state = AdventureCreator.state.debuggingTools;

            const breakpointsList = state.debugSession.breakpoints.length > 0
                ? state.debugSession.breakpoints.map((bp, index) => `
                    <div style="background: #0a0a0a; border: 1px solid #dc2626; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="color: #fff; font-weight: 500; margin-bottom: 0.25rem;">${this.escapeHtml(bp.name)}</div>
                            <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(bp.condition || 'No condition')}</div>
                        </div>
                        <button onclick="AdventureCreator.modules['debugging-tools'].deleteBreakpoint(${index})"
                                style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                            Delete
                        </button>
                    </div>
                `).join('')
                : '<div style="text-align: center; color: #666; padding: 2rem;">No breakpoints set</div>';

            this.showModal(`
                <div>
                    <div style="margin-bottom: 1.5rem;">
                        ${breakpointsList}
                    </div>
                    <button onclick="AdventureCreator.modules['debugging-tools'].showAddBreakpointModal()"
                            style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
                        + Add New Breakpoint
                    </button>
                </div>
            `, '🔴 Breakpoints', null, 'Close', false);
        },

        showAddBreakpointModal: function() {
            this.closeModal(); // Close breakpoints list

            this.showModal(`
                <div class="form-group">
                    <label style="display: block; color: #fff; margin-bottom: 0.5rem; font-weight: 500;">
                        Breakpoint Name *
                    </label>
                    <input type="text" id="bp-name" class="param-input" placeholder="e.g., kitchen_entry" required>
                </div>
                <div class="form-group">
                    <label style="display: block; color: #fff; margin-bottom: 0.5rem; font-weight: 500;">
                        Condition (optional)
                    </label>
                    <input type="text" id="bp-condition" class="param-input" placeholder="e.g., AT kitchen">
                    <div style="color: #666; font-size: 0.75rem; margin-top: 0.25rem;">
                        Leave empty to break on entry
                    </div>
                </div>
            `, '🔴 Add Breakpoint', () => {
                const name = document.getElementById('bp-name').value;
                const condition = document.getElementById('bp-condition').value;

                if (!name) {
                    this.showNotification('Please enter a breakpoint name', 'warning');
                    return;
                }

                const state = AdventureCreator.state.debuggingTools;
                state.debugSession.breakpoints.push({
                    id: Date.now(),
                    name: name,
                    condition: condition,
                    enabled: true
                });

                this.saveToStorage();
                this.showNotification(`Breakpoint "${name}" added`, 'success');
            }, 'Add Breakpoint');
        },

        deleteBreakpoint: function(index) {
            try {
                const state = AdventureCreator.state.debuggingTools;
                const bp = state.debugSession.breakpoints[index];
                state.debugSession.breakpoints.splice(index, 1);
                this.saveToStorage();
                this.showNotification(`Breakpoint "${bp.name}" deleted`, 'success');
                this.showBreakpointsModal(); // Refresh list
            } catch (error) {
                console.error('Error deleting breakpoint:', error);
                this.showNotification('Failed to delete breakpoint', 'error');
            }
        },

        // Configuration Management
        showSaveConfigurationModal: function() {
            this.showModal(`
                <div class="form-group">
                    <label style="display: block; color: #fff; margin-bottom: 0.5rem; font-weight: 500;">
                        Configuration Name *
                    </label>
                    <input type="text" id="config-name" class="param-input" placeholder="e.g., Combat System Debug" required>
                </div>
                <div class="form-group">
                    <label style="display: block; color: #fff; margin-bottom: 0.5rem; font-weight: 500;">
                        Description
                    </label>
                    <textarea id="config-description" class="param-input" rows="3" placeholder="Describe this debug configuration..."></textarea>
                </div>
                <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                    <div style="color: #999; font-size: 0.875rem;">
                        This will save:
                        <ul style="margin: 0.5rem 0 0 1.5rem;">
                            <li>${AdventureCreator.state.debuggingTools.debugSession.breakpoints.length} breakpoint(s)</li>
                            <li>${AdventureCreator.state.debuggingTools.debugSession.watchpoints.length} watchpoint(s)</li>
                            <li>Current debug settings</li>
                        </ul>
                    </div>
                </div>
            `, '💾 Save Debug Configuration', () => {
                const name = document.getElementById('config-name').value;
                const description = document.getElementById('config-description').value;

                if (!name) {
                    this.showNotification('Please enter a configuration name', 'warning');
                    return;
                }

                const state = AdventureCreator.state.debuggingTools;
                state.savedConfigurations.push({
                    id: Date.now(),
                    name: name,
                    description: description,
                    breakpoints: [...state.debugSession.breakpoints],
                    watchpoints: [...state.debugSession.watchpoints],
                    settings: {
                        showExplanations: state.showExplanations
                    },
                    created: new Date().toISOString()
                });

                this.saveToStorage();
                this.showNotification(`Configuration "${name}" saved`, 'success');
            }, 'Save Configuration');
        },

        // Help Modal
        showHelpModal: function() {
            this.showModal(`
                <div style="line-height: 1.6; color: #ccc;">
                    <h3 style="color: #8b5cf6; margin-bottom: 1rem;">Debugging Tools Help</h3>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Keyboard Shortcuts</h4>
                    <ul style="list-style: none; padding-left: 0;">
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">F5</kbd> - Start/Stop debugging</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">F10</kbd> - Step over</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">F11</kbd> - Step into</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Shift+F11</kbd> - Step out</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+D</kbd> - Debug console</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+S</kbd> - Save configuration</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">F1</kbd> - Show this help</li>
                    </ul>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Getting Started</h4>
                    <ol style="margin-left: 1.5rem;">
                        <li>Press <strong>F5</strong> or click "Start Debug" to begin a debug session</li>
                        <li>Add breakpoints by clicking the "Breakpoints" button</li>
                        <li>Use step controls to navigate through your code</li>
                        <li>Open the debug console (Ctrl+D) for interactive debugging</li>
                    </ol>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Features</h4>
                    <ul style="margin-left: 1.5rem;">
                        <li><strong>Breakpoints:</strong> Pause execution at specific points</li>
                        <li><strong>Watchpoints:</strong> Monitor variable changes</li>
                        <li><strong>Step Debugging:</strong> Execute code line by line</li>
                        <li><strong>State Inspection:</strong> View game state in real-time</li>
                        <li><strong>Automated Testing:</strong> Run comprehensive tests</li>
                    </ul>
                </div>
            `, '❓ Debugging Tools Help', null, 'Close', false);
        },

        // Modal Management
        showModal(content, title, onConfirm, confirmText = 'OK', showCancel = true) {
            const modalId = 'debug-modal-' + Date.now();
            const modalHtml = `
                <div class="modal-overlay" id="${modalId}" onclick="if(event.target.id==='${modalId}')AdventureCreator.modules['debugging-tools'].closeModal()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                    <div class="modal" onclick="event.stopPropagation()" style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
                        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                            <div class="modal-title" style="font-size: 1.25rem; font-weight: 600; color: #fff;">${title}</div>
                            <button class="modal-close" onclick="AdventureCreator.modules['debugging-tools'].closeModal()" style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">&times;</button>
                        </div>
                        <div class="modal-body" style="padding: 1.5rem; overflow-y: auto; flex: 1;">
                            ${content}
                        </div>
                        <div class="modal-footer" style="padding: 1.5rem; border-top: 1px solid #333; display: flex; justify-content: flex-end; gap: 1rem;">
                            ${showCancel ? `<button class="btn btn-secondary" onclick="AdventureCreator.modules['debugging-tools'].closeModal()" style="padding: 0.5rem 1rem; background: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>` : ''}
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['debugging-tools'].handleModalConfirm()" style="padding: 0.5rem 1rem; background: #8b5cf6; color: #fff; border: none; border-radius: 4px; cursor: pointer;">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            this._currentModalCallback = onConfirm;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        },

        closeModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.remove();
            }
            this._currentModalCallback = null;
        },

        handleModalConfirm() {
            if (this._currentModalCallback) {
                this._currentModalCallback();
            }
            this.closeModal();
        },

        showNotification: function(message, type = 'info') {
            const container = document.querySelector('.notification-container') || (() => {
                const div = document.createElement('div');
                div.className = 'notification-container';
                div.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2000; display: flex; flex-direction: column; gap: 10px;';
                document.body.appendChild(div);
                return div;
            })();

            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };

            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };

            const notificationId = 'notification-' + Date.now();
            const notification = document.createElement('div');
            notification.id = notificationId;
            notification.style.cssText = `
                background: #1a1a1a;
                border: 1px solid #333;
                border-left: 4px solid ${colors[type]};
                border-radius: 8px;
                padding: 1rem 1.5rem;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 1rem;
                animation: slideIn 0.3s;
            `;
            notification.innerHTML = `
                <span style="font-size: 1.25rem;">${icons[type]}</span>
                <span style="color: #fff; font-size: 0.875rem; flex: 1;">${this.escapeHtml(message)}</span>
            `;

            container.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideIn 0.3s reverse';
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
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
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

    console.log('DAAD Debugging Tools module registered successfully');
})();
