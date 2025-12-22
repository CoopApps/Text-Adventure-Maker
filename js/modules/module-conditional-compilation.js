// module-conditional-compilation.js - DAAD Conditional Compilation
(function() {
    'use strict';

    console.log('DAAD Conditional Compilation module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Conditional Compilation module requires the Adventure Creator framework.');
        return;
    }

    AdventureCreator.registerModule('conditional-compilation', {
        name: 'Conditional Compilation',
        version: '1.0.0',
        description: 'Advanced conditional compilation with #ifdef/#ifndef, build configurations, and expression evaluation',
        category: 'Development Tools',
        author: 'DAAD Adventure Creator',

        init: function() {
            console.log('Conditional Compilation module initialized');
            this.initializeState();
            this.loadFromStorage();
            this.setupKeyboardShortcuts();
        },

        initializeState: function() {
            if (!AdventureCreator.state.conditionalCompilation) {
                AdventureCreator.state.conditionalCompilation = {
                    selectedCategory: 'preprocessor_directives',
                    selectedOperation: null,
                    showExplanations: true,
                    previewMode: false,
                    searchFilter: '',
                    favoriteOperations: new Set(),
                    recentOperations: [],
                    buildConfiguration: {
                        currentBuild: 'debug',
                        symbols: [],
                        targets: ['debug', 'release', 'demo'],
                        activeSymbols: {},
                        templates: []
                    },
                    expressionTester: {
                        expression: '',
                        result: null,
                        variables: {},
                        history: []
                    },
                    currentRule: {
                        conditions: [],
                        actions: []
                    }
                };
            }
        },

        loadFromStorage: function() {
            try {
                const saved = localStorage.getItem('conditionalCompilation_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const state = AdventureCreator.state.conditionalCompilation;

                    // Restore state with Set conversion
                    state.selectedCategory = parsed.selectedCategory || 'preprocessor_directives';
                    state.showExplanations = parsed.showExplanations !== undefined ? parsed.showExplanations : true;
                    state.favoriteOperations = new Set(parsed.favoriteOperations || []);
                    state.recentOperations = parsed.recentOperations || [];
                    state.buildConfiguration = parsed.buildConfiguration || state.buildConfiguration;
                    state.expressionTester = parsed.expressionTester || state.expressionTester;

                    console.log('Conditional Compilation state loaded from localStorage');
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        saveToStorage: function() {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                const toSave = {
                    selectedCategory: state.selectedCategory,
                    showExplanations: state.showExplanations,
                    favoriteOperations: Array.from(state.favoriteOperations),
                    recentOperations: state.recentOperations,
                    buildConfiguration: state.buildConfiguration,
                    expressionTester: state.expressionTester
                };
                localStorage.setItem('conditionalCompilation_state', JSON.stringify(toSave));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                this.showNotification('Failed to save state', 'error');
            }
        },

        setupKeyboardShortcuts: function() {
            document.addEventListener('keydown', (e) => {
                if (!document.querySelector('.conditional-compilation-editor')) return;

                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }

                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveToStorage();
                    this.showNotification('Configuration saved', 'success');
                }

                if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault();
                    const searchInput = document.querySelector('.conditional-compilation-editor input[type="text"]');
                    if (searchInput) searchInput.focus();
                }

                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.closeModal();
                }
            });
        },

        render: function() {
            const state = AdventureCreator.state.conditionalCompilation;

            return `
                <div class="conditional-compilation-editor" style="background: #0a0a0a; min-height: 100vh; color: #e0e0e0;">
                    <div class="module-header" style="background: #1a1a1a; border-bottom: 1px solid #333; padding: 2rem;">
                        <div style="max-width: 1400px; margin: 0 auto;">
                            <h1 style="color: #fff; font-size: 2rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem;">
                                ⚡ Conditional Compilation
                                <span style="font-size: 0.6em; color: #8b5cf6; background: rgba(139, 92, 246, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">DAAD Module</span>
                                <span style="font-size: 0.6em; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">${state.buildConfiguration.currentBuild.toUpperCase()}</span>
                            </h1>
                            <p style="color: #999; font-size: 1.1rem; margin-bottom: 1.5rem;">
                                Advanced conditional compilation with #ifdef/#ifndef, build configurations, and expression evaluation
                            </p>

                            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="AdventureCreator.modules['conditional-compilation'].toggleExplanations()"
                                            style="padding: 0.5rem 1rem; background: ${state.showExplanations ? '#8b5cf6' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.showExplanations ? '📖 Hide Explanations' : '📖 Show Explanations'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['conditional-compilation'].togglePreview()"
                                            style="padding: 0.5rem 1rem; background: ${state.previewMode ? '#059669' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.previewMode ? '👁️ Exit Preview' : '👁️ Preview Mode'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['conditional-compilation'].openSymbolManager()"
                                            style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        🏷️ Manage Symbols
                                    </button>
                                    <button onclick="AdventureCreator.modules['conditional-compilation'].openExpressionTester()"
                                            style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        🧮 Test Expressions
                                    </button>
                                    <button onclick="AdventureCreator.modules['conditional-compilation'].showTemplatesModal()"
                                            style="padding: 0.5rem 1rem; background: #7c3aed; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        📋 Templates
                                    </button>
                                    <button onclick="AdventureCreator.modules['conditional-compilation'].showHelpModal()"
                                            style="padding: 0.5rem 1rem; background: #0891b2; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ❓ Help (F1)
                                    </button>
                                </div>

                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <span style="color: #999; font-size: 0.875rem;">Build:</span>
                                    <select onchange="AdventureCreator.modules['conditional-compilation'].changeBuildTarget(this.value)"
                                            style="padding: 0.5rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; font-size: 0.875rem;">
                                        ${state.buildConfiguration.targets.map(target =>
                                            `<option value="${target}" ${state.buildConfiguration.currentBuild === target ? 'selected' : ''}>${target.toUpperCase()}</option>`
                                        ).join('')}
                                    </select>
                                </div>

                                <div style="flex: 1; max-width: 300px; position: relative;">
                                    <input type="text"
                                           placeholder="Search compilation features..."
                                           value="${this.escapeHtml(state.searchFilter)}"
                                           onkeyup="AdventureCreator.modules['conditional-compilation'].updateSearchFilter(this.value)"
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
                    ⚡ Compilation Categories
                </div>
                <div class="category-list">
                    ${Object.entries(categories).map(([key, category]) => `
                        <div class="category-item ${state.selectedCategory === key ? 'active' : ''}"
                             onclick="AdventureCreator.modules['conditional-compilation'].selectCategory('${key}')"
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

                <!-- Recent Operations -->
                ${state.recentOperations.length > 0 ? `
                    <div style="padding: 1rem; border-top: 1px solid #333; background: #0a0a0a;">
                        <h4 style="color: #fff; margin-bottom: 0.75rem; font-size: 0.875rem;">📋 Recent Operations</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${state.recentOperations.slice(0, 5).map(op => `
                                <div style="padding: 0.5rem; background: #1a1a1a; border-radius: 0.375rem; font-size: 0.75rem; color: #ccc; cursor: pointer;"
                                     onclick="AdventureCreator.modules['conditional-compilation'].selectOperationByKey('${op}')">
                                    ${this.getOperationName(op)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Build Configuration Status -->
                <div style="padding: 1rem; border-top: 1px solid #333; background: #0a0a0a;">
                    <h4 style="color: #fff; margin-bottom: 0.75rem; font-size: 0.875rem;">Build Status</h4>
                    <div style="color: #999; font-size: 0.8rem; line-height: 1.6;">
                        <div><strong>Target:</strong> ${state.buildConfiguration.currentBuild}</div>
                        <div><strong>Symbols:</strong> ${state.buildConfiguration.symbols.length}</div>
                        <div><strong>Active:</strong> ${Object.keys(state.buildConfiguration.activeSymbols).length}</div>
                        <div><strong>Templates:</strong> ${state.buildConfiguration.templates.length}</div>
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

                    <div class="operations-grid" style="display: grid; gap: 1.5rem;">
                        ${Object.entries(filteredOps).map(([key, op]) => this.renderOperationCard(key, op, state)).join('')}
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
                     onclick="AdventureCreator.modules['conditional-compilation'].selectOperation('${key}')"
                     style="background: #1a1a1a; border: 2px solid ${isSelected ? '#8b5cf6' : '#333'}; border-radius: 0.75rem; padding: 1.5rem; cursor: pointer; transition: all 0.2s;">

                    <div class="operation-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.5rem;">${operation.icon}</span>
                                <h3 style="color: #fff; margin: 0; font-size: 1.1rem;">${operation.name}</h3>
                                <button onclick="event.stopPropagation(); AdventureCreator.modules['conditional-compilation'].toggleFavorite('${key}')"
                                        style="background: none; border: none; cursor: pointer; font-size: 1.25rem; padding: 0; margin-left: 0.5rem;"
                                        title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                                    ${isFavorite ? '⭐' : '☆'}
                                </button>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: ${complexityColor}; color: white; border-radius: 0.25rem; font-weight: 600;">
                                    ${operation.category.toUpperCase()}
                                </span>
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: #374151; color: #ccc; border-radius: 0.25rem;">
                                    ${operation.type || 'directive'}
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
                        <div style="color: #8b5cf6; font-weight: 500; white-space: pre-wrap;">${this.escapeHtml(operation.daadCode.replace(/\\n/g, '\n'))}</div>
                        ${operation.effect ? `<div style="color: #10b981; font-size: 0.75rem; margin-top: 0.25rem;">Effect: ${this.escapeHtml(operation.effect)}</div>` : ''}
                    </div>

                    ${isSelected ? `
                        <div class="operation-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button onclick="event.stopPropagation(); AdventureCreator.modules['conditional-compilation'].addToRule('${key}', 'directive')"
                                    style="flex: 1; padding: 0.5rem; background: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                ➕ Add Directive
                            </button>
                            <button onclick="event.stopPropagation(); AdventureCreator.modules['conditional-compilation'].showCodeExample('${key}')"
                                    style="padding: 0.5rem 0.75rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                📋 Code
                            </button>
                            ${operation.parameters ? `
                                <button onclick="event.stopPropagation(); AdventureCreator.modules['conditional-compilation'].showParameterEditor('${key}')"
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
                preprocessor_directives: {
                    title: "🏷️ Preprocessor Directives",
                    description: "Define and manage compilation symbols and definitions",
                    icon: "🏷️",
                    color: "#3b82f6",
                    operations: {
                        DEFINE_SYMBOL: {
                            name: "#define symbol",
                            description: "Define a compilation symbol that can be checked by conditional directives. Essential for creating build configurations, feature flags, and platform-specific builds.",
                            parameters: [
                                {
                                    name: "symbol_name",
                                    type: "text",
                                    description: "Name of the symbol to define",
                                    required: true,
                                    placeholder: "DEBUG"
                                },
                                {
                                    name: "symbol_value",
                                    type: "text",
                                    description: "Optional value for the symbol",
                                    placeholder: "1"
                                }
                            ],
                            examples: [
                                '#define DEBUG - Enable debug mode',
                                '#define VERSION 200 - Set version number',
                                '#define PLATFORM_ZX - Target platform flag'
                            ],
                            useCases: [
                                "Debug vs release build configurations",
                                "Version-specific feature flags",
                                "Platform-specific compilation options",
                                "Feature toggle management",
                                "Development vs production builds"
                            ],
                            daadCode: '#define {symbol_name} {symbol_value}',
                            category: "basic",
                            icon: "🏷️",
                            type: "directive",
                            effect: "Defines symbol for conditional compilation"
                        },
                        UNDEF_SYMBOL: {
                            name: "#undef symbol",
                            description: "Remove a previously defined symbol, making it undefined for subsequent conditional checks. Useful for temporary feature disabling and clean symbol management.",
                            parameters: [
                                {
                                    name: "symbol_name",
                                    type: "text",
                                    description: "Name of the symbol to undefine",
                                    required: true,
                                    placeholder: "TEMP_FEATURE"
                                }
                            ],
                            examples: [
                                '#undef DEBUG - Remove debug symbol',
                                '#undef EXPERIMENTAL - Disable experimental features',
                                '#undef BETA_FEATURES - Remove beta functionality'
                            ],
                            useCases: [
                                "Temporarily disabling features",
                                "Clean symbol management",
                                "Conditional feature removal",
                                "Build configuration cleanup",
                                "Symbol state management"
                            ],
                            daadCode: '#undef {symbol_name}',
                            category: "basic",
                            icon: "🚫",
                            type: "directive",
                            effect: "Removes symbol definition"
                        }
                    }
                },

                conditional_blocks: {
                    title: "🔀 Conditional Code Blocks",
                    description: "Create conditional code sections that compile only when conditions are met",
                    icon: "🔀",
                    color: "#f59e0b",
                    operations: {
                        IFDEF_BLOCK: {
                            name: "#ifdef block",
                            description: "Include code only if a symbol is defined. Perfect for optional features, debug code, and platform-specific functionality with clean conditional compilation.",
                            parameters: [
                                {
                                    name: "symbol_name",
                                    type: "text",
                                    description: "Symbol to check if defined",
                                    required: true,
                                    placeholder: "DEBUG"
                                },
                                {
                                    name: "code_block",
                                    type: "textarea",
                                    description: "Code to include if symbol is defined",
                                    required: true,
                                    placeholder: "MESSAGE \"Debug mode enabled\"\\nLET debug_flag 1"
                                },
                                {
                                    name: "include_comments",
                                    type: "checkbox",
                                    description: "Include explanatory comments",
                                    default: true
                                }
                            ],
                            examples: [
                                '#ifdef DEBUG\\n  MESSAGE "Debug active"\\n#endif',
                                '#ifdef GRAPHICS\\n  PICTURE 1\\n#endif',
                                '#ifdef SOUND\\n  BEEP 100, 50\\n#endif'
                            ],
                            useCases: [
                                "Debug-only code sections",
                                "Optional feature inclusion",
                                "Platform-specific code blocks",
                                "Development vs production builds",
                                "Feature flag implementations"
                            ],
                            daadCode: '#ifdef {symbol_name}\\n{code_block}\\n#endif',
                            category: "intermediate",
                            icon: "✅",
                            type: "directive",
                            effect: "Includes code block if symbol is defined"
                        },
                        IFNDEF_BLOCK: {
                            name: "#ifndef block",
                            description: "Include code only if a symbol is NOT defined. Useful for default behaviors, fallback implementations, and alternative code paths.",
                            parameters: [
                                {
                                    name: "symbol_name",
                                    type: "text",
                                    description: "Symbol to check if NOT defined",
                                    required: true,
                                    placeholder: "GRAPHICS"
                                },
                                {
                                    name: "code_block",
                                    type: "textarea",
                                    description: "Code to include if symbol is NOT defined",
                                    required: true,
                                    placeholder: "MESSAGE \"Text-only mode\"\\nLET graphics_flag 0"
                                },
                                {
                                    name: "include_comments",
                                    type: "checkbox",
                                    description: "Include explanatory comments",
                                    default: true
                                }
                            ],
                            examples: [
                                '#ifndef GRAPHICS\\n  MESSAGE "Text mode"\\n#endif',
                                '#ifndef SOUND\\n  ; Silent mode\\n#endif',
                                '#ifndef ADVANCED\\n  ; Basic features only\\n#endif'
                            ],
                            useCases: [
                                "Fallback implementations",
                                "Default behavior when features disabled",
                                "Text-only alternatives",
                                "Compatibility modes",
                                "Basic feature alternatives"
                            ],
                            daadCode: '#ifndef {symbol_name}\\n{code_block}\\n#endif',
                            category: "intermediate",
                            icon: "❌",
                            type: "directive",
                            effect: "Includes code block if symbol is NOT defined"
                        },
                        IF_ELSE_BLOCK: {
                            name: "#if-#else block",
                            description: "Advanced conditional compilation with expressions and else clauses for complex build logic. Supports mathematical operations and logical expressions.",
                            parameters: [
                                {
                                    name: "condition_expression",
                                    type: "text",
                                    description: "Expression to evaluate",
                                    required: true,
                                    placeholder: "VERSION >= 200"
                                },
                                {
                                    name: "true_code",
                                    type: "textarea",
                                    description: "Code when condition is true",
                                    required: true,
                                    placeholder: "MESSAGE \"New version features\""
                                },
                                {
                                    name: "false_code",
                                    type: "textarea",
                                    description: "Code when condition is false",
                                    placeholder: "MESSAGE \"Legacy compatibility\""
                                }
                            ],
                            examples: [
                                '#if VERSION >= 200\\n  MESSAGE "Modern features"\\n#else\\n  MESSAGE "Legacy mode"\\n#endif',
                                '#if defined(GRAPHICS) && MEMORY > 48\\n  PICTURE 1\\n#else\\n  MESSAGE "Low-res mode"\\n#endif'
                            ],
                            useCases: [
                                "Version-dependent features",
                                "Complex platform logic",
                                "Multi-condition compilation",
                                "Advanced build configurations",
                                "Sophisticated feature branching"
                            ],
                            daadCode: '#if {condition_expression}\\n{true_code}\\n#else\\n{false_code}\\n#endif',
                            category: "advanced",
                            icon: "🔀",
                            type: "directive",
                            effect: "Includes different code based on expression evaluation"
                        }
                    }
                },

                build_configurations: {
                    title: "⚙️ Build Configurations",
                    description: "Manage different build configurations and compilation targets",
                    icon: "⚙️",
                    color: "#10b981",
                    operations: {
                        DEBUG_BUILD: {
                            name: "Debug build configuration",
                            description: "Set up a complete debug build configuration with appropriate symbols and conditional code. Includes testing features, performance monitoring, and development aids.",
                            parameters: [
                                {
                                    name: "debug_level",
                                    type: "select",
                                    options: ["Basic", "Detailed", "Verbose", "Maximum"],
                                    description: "Level of debug information",
                                    required: true,
                                    default: "Basic"
                                },
                                {
                                    name: "include_test_data",
                                    type: "checkbox",
                                    description: "Include test data and fixtures",
                                    default: true
                                },
                                {
                                    name: "enable_cheats",
                                    type: "checkbox",
                                    description: "Enable development cheats",
                                    default: true
                                },
                                {
                                    name: "performance_monitoring",
                                    type: "checkbox",
                                    description: "Include performance monitoring",
                                    default: false
                                }
                            ],
                            examples: [
                                "Complete debug build with test data",
                                "Detailed debugging with performance monitoring",
                                "Basic debug mode for quick testing"
                            ],
                            useCases: [
                                "Development and testing environments",
                                "Bug investigation and analysis",
                                "Performance profiling and optimization",
                                "Feature development and validation",
                                "Quality assurance testing"
                            ],
                            daadCode: '#define DEBUG\\n#define DEBUG_LEVEL {debug_level}\\n#ifdef DEBUG\\n  MESSAGE "Debug build active"\\n#endif',
                            category: "intermediate",
                            icon: "🐛",
                            type: "directive",
                            effect: "Configures complete debug build environment"
                        },
                        RELEASE_BUILD: {
                            name: "Release build configuration",
                            description: "Create optimized release builds with debug code stripped, assets compressed, and performance optimizations enabled for distribution and production.",
                            parameters: [
                                {
                                    name: "optimization_level",
                                    type: "select",
                                    options: ["Size", "Speed", "Balanced", "Maximum"],
                                    description: "Optimization level",
                                    required: true,
                                    default: "Balanced"
                                },
                                {
                                    name: "remove_debug_code",
                                    type: "checkbox",
                                    description: "Strip all debug code",
                                    default: true
                                },
                                {
                                    name: "compress_assets",
                                    type: "checkbox",
                                    description: "Compress graphics and sounds",
                                    default: true
                                },
                                {
                                    name: "final_validation",
                                    type: "checkbox",
                                    description: "Include final validation checks",
                                    default: true
                                }
                            ],
                            examples: [
                                "Optimized release for distribution",
                                "Size-optimized build for limited storage",
                                "Performance-optimized build for older systems"
                            ],
                            useCases: [
                                "Distribution and publishing",
                                "Platform-specific releases",
                                "Optimized final versions",
                                "Commercial builds",
                                "Production deployments"
                            ],
                            daadCode: '#undef DEBUG\\n#define RELEASE\\n#define OPTIMIZE_{optimization_level}',
                            category: "intermediate",
                            icon: "📦",
                            type: "directive",
                            effect: "Configures optimized release build"
                        },
                        PLATFORM_BUILD: {
                            name: "Platform-specific build",
                            description: "Create builds optimized for specific platforms with appropriate feature sets, memory constraints, and hardware compatibility considerations.",
                            parameters: [
                                {
                                    name: "target_platform",
                                    type: "select",
                                    options: ["ZX Spectrum", "Amstrad CPC", "PC", "Commodore 64", "Atari ST"],
                                    description: "Target platform",
                                    required: true,
                                    default: "ZX Spectrum"
                                },
                                {
                                    name: "memory_constraints",
                                    type: "number",
                                    description: "Memory limit in KB",
                                    min: 32,
                                    max: 512,
                                    default: 48
                                },
                                {
                                    name: "graphics_support",
                                    type: "select",
                                    options: ["None", "Basic", "Enhanced", "Full"],
                                    description: "Graphics capability level",
                                    default: "Basic"
                                },
                                {
                                    name: "sound_support",
                                    type: "select",
                                    options: ["None", "Beeper", "AY Chip", "Full"],
                                    description: "Sound system support",
                                    default: "Beeper"
                                }
                            ],
                            examples: [
                                "ZX Spectrum 48K build with basic graphics",
                                "PC build with full multimedia support",
                                "Amstrad CPC build with enhanced sound"
                            ],
                            useCases: [
                                "Platform-specific optimizations",
                                "Hardware constraint management",
                                "Multi-platform development",
                                "Retro system compatibility",
                                "Cross-platform releases"
                            ],
                            daadCode: '#define PLATFORM_{target_platform}\\n#define MEMORY_LIMIT {memory_constraints}\\n#define GRAPHICS_{graphics_support}',
                            category: "advanced",
                            icon: "💻",
                            type: "directive",
                            effect: "Configures platform-specific build settings"
                        }
                    }
                },

                advanced_expressions: {
                    title: "🧮 Advanced Expression Support",
                    description: "Complex conditional expressions with mathematical and logical operations",
                    icon: "🧮",
                    color: "#8b5cf6",
                    operations: {
                        EXPRESSION_EVALUATOR: {
                            name: "Complex expression evaluation",
                            description: "Evaluate complex expressions involving multiple symbols, mathematical operations, and logical conditions for sophisticated compilation control.",
                            parameters: [
                                {
                                    name: "expression",
                                    type: "text",
                                    description: "Expression to evaluate",
                                    required: true,
                                    placeholder: "(VERSION >= 200) && (PLATFORM == \"PC\") || defined(BETA)"
                                },
                                {
                                    name: "expression_type",
                                    type: "select",
                                    options: ["Boolean Logic", "Mathematical", "String Comparison", "Mixed"],
                                    description: "Type of expression",
                                    required: true,
                                    default: "Boolean Logic"
                                },
                                {
                                    name: "validation_level",
                                    type: "select",
                                    options: ["Basic", "Strict", "Pedantic"],
                                    description: "Expression validation level",
                                    default: "Strict"
                                }
                            ],
                            examples: [
                                '(VERSION >= 200) && defined(GRAPHICS)',
                                'MEMORY_SIZE > 48 || PLATFORM != "ZX_SPECTRUM"',
                                'strlen(GAME_NAME) > 10 && VERSION < 300'
                            ],
                            useCases: [
                                "Complex build logic",
                                "Multi-condition feature flags",
                                "Advanced platform detection",
                                "Sophisticated version control",
                                "Mathematical build constraints"
                            ],
                            daadCode: '#if {expression}\\n{conditional_code}\\n#endif',
                            category: "expert",
                            icon: "🧮",
                            type: "directive",
                            effect: "Evaluates complex mathematical and logical expressions"
                        },
                        MACRO_FUNCTIONS: {
                            name: "Macro functions",
                            description: "Define macro functions with parameters for reusable conditional compilation patterns. Create sophisticated build automation and code generation systems.",
                            parameters: [
                                {
                                    name: "macro_name",
                                    type: "text",
                                    description: "Name of the macro function",
                                    required: true,
                                    placeholder: "DEBUG_MESSAGE"
                                },
                                {
                                    name: "macro_parameters",
                                    type: "text",
                                    description: "Comma-separated parameter list",
                                    required: true,
                                    placeholder: "msg, level"
                                },
                                {
                                    name: "macro_body",
                                    type: "textarea",
                                    description: "Macro expansion code",
                                    required: true,
                                    placeholder: "ifdef DEBUG\\n  MESSAGE msg\\n  LET debug_level level\\nendif"
                                }
                            ],
                            examples: [
                                "DEBUG_MESSAGE(msg, level) for conditional debug output",
                                "PLATFORM_CODE(platform, code) for platform-specific blocks",
                                "VERSION_CHECK(min_ver, code) for version compatibility"
                            ],
                            useCases: [
                                "Reusable compilation patterns",
                                "Build automation and scripting",
                                "Complex macro systems",
                                "Code generation and templates",
                                "Advanced preprocessing workflows"
                            ],
                            daadCode: '#define {macro_name}({macro_parameters}) {macro_body}',
                            category: "expert",
                            icon: "⚙️",
                            type: "directive",
                            effect: "Creates parameterized macro functions"
                        }
                    }
                }
            };
        },

        // UI Event Handlers
        selectCategory: function(categoryKey) {
            try {
                AdventureCreator.state.conditionalCompilation.selectedCategory = categoryKey;
                AdventureCreator.state.conditionalCompilation.selectedOperation = null;
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error selecting category:', error);
                this.showNotification('Failed to select category', 'error');
            }
        },

        selectOperation: function(operationKey) {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                state.selectedOperation = state.selectedOperation === operationKey ? null : operationKey;
                this.addToRecent(operationKey);
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error selecting operation:', error);
                this.showNotification('Failed to select operation', 'error');
            }
        },

        selectOperationByKey: function(operationKey) {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                state.selectedOperation = operationKey;
                this.addToRecent(operationKey);
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error selecting operation:', error);
                this.showNotification('Failed to select operation', 'error');
            }
        },

        toggleExplanations: function() {
            try {
                AdventureCreator.state.conditionalCompilation.showExplanations = !AdventureCreator.state.conditionalCompilation.showExplanations;
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error toggling explanations:', error);
                this.showNotification('Failed to toggle explanations', 'error');
            }
        },

        togglePreview: function() {
            try {
                AdventureCreator.state.conditionalCompilation.previewMode = !AdventureCreator.state.conditionalCompilation.previewMode;
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error toggling preview:', error);
                this.showNotification('Failed to toggle preview', 'error');
            }
        },

        updateSearchFilter: function(value) {
            try {
                AdventureCreator.state.conditionalCompilation.searchFilter = value;
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error updating search:', error);
            }
        },

        toggleFavorite: function(operationKey) {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                if (state.favoriteOperations.has(operationKey)) {
                    state.favoriteOperations.delete(operationKey);
                    this.showNotification('Removed from favorites', 'info');
                } else {
                    state.favoriteOperations.add(operationKey);
                    this.showNotification('Added to favorites', 'success');
                }
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error toggling favorite:', error);
                this.showNotification('Failed to update favorites', 'error');
            }
        },

        addToRecent: function(operationKey) {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                state.recentOperations = state.recentOperations.filter(op => op !== operationKey);
                state.recentOperations.unshift(operationKey);
                if (state.recentOperations.length > 10) {
                    state.recentOperations = state.recentOperations.slice(0, 10);
                }
            } catch (error) {
                console.error('Error adding to recent:', error);
            }
        },

        // Build Configuration Management
        changeBuildTarget: function(target) {
            try {
                AdventureCreator.state.conditionalCompilation.buildConfiguration.currentBuild = target;
                this.showNotification(`Switched to ${target.toUpperCase()} build configuration`, 'info');
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error changing build target:', error);
                this.showNotification('Failed to change build target', 'error');
            }
        },

        openSymbolManager: function() {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                const symbolsList = state.buildConfiguration.symbols.length > 0
                    ? state.buildConfiguration.symbols.map((symbol, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #0a0a0a; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                            <div>
                                <div style="color: #fff; font-weight: 600;">${this.escapeHtml(symbol.name)}</div>
                                <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(symbol.value || 'No value')}</div>
                            </div>
                            <button onclick="AdventureCreator.modules['conditional-compilation'].deleteSymbol(${index})"
                                    style="padding: 0.5rem 0.75rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                                Delete
                            </button>
                        </div>
                    `).join('')
                    : '<div style="color: #999; padding: 1rem; text-align: center;">No symbols defined</div>';

                const content = `
                    <div>
                        <div style="margin-bottom: 1.5rem;">
                            ${symbolsList}
                        </div>
                        <button onclick="AdventureCreator.modules['conditional-compilation'].showAddSymbolModal()"
                                style="width: 100%; padding: 0.75rem; background: #059669; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                            ➕ Add New Symbol
                        </button>
                    </div>
                `;

                this.showModal(content, '🏷️ Symbol Manager', null, 'Close', false);
            } catch (error) {
                console.error('Error opening symbol manager:', error);
                this.showNotification('Failed to open symbol manager', 'error');
            }
        },

        showAddSymbolModal: function() {
            try {
                const content = `
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Symbol Name:</label>
                            <input type="text" id="symbolName" placeholder="DEBUG"
                                   style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Symbol Value (optional):</label>
                            <input type="text" id="symbolValue" placeholder="1"
                                   style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                        </div>
                    </div>
                `;

                this.showModal(content, '➕ Add Symbol', () => {
                    const name = document.getElementById('symbolName').value.trim();
                    const value = document.getElementById('symbolValue').value.trim();

                    if (!name) {
                        this.showNotification('Symbol name is required', 'error');
                        return;
                    }

                    const state = AdventureCreator.state.conditionalCompilation;
                    state.buildConfiguration.symbols.push({ name, value });
                    this.closeModal();
                    this.showNotification('Symbol added successfully', 'success');
                    this.saveToStorage();
                    this.openSymbolManager();
                }, 'Add Symbol', true);
            } catch (error) {
                console.error('Error showing add symbol modal:', error);
                this.showNotification('Failed to show add symbol modal', 'error');
            }
        },

        deleteSymbol: function(index) {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                const symbol = state.buildConfiguration.symbols[index];

                const content = `
                    <div style="margin-bottom: 1.5rem;">
                        <p style="color: #ccc;">Are you sure you want to delete this symbol?</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                            <div style="color: #fff; font-weight: 600;">${this.escapeHtml(symbol.name)}</div>
                            <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(symbol.value || 'No value')}</div>
                        </div>
                    </div>
                `;

                this.showModal(content, '🗑️ Delete Symbol', () => {
                    state.buildConfiguration.symbols.splice(index, 1);
                    this.closeModal();
                    this.showNotification('Symbol deleted', 'success');
                    this.saveToStorage();
                    this.openSymbolManager();
                }, 'Delete', true);
            } catch (error) {
                console.error('Error deleting symbol:', error);
                this.showNotification('Failed to delete symbol', 'error');
            }
        },

        openExpressionTester: function() {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                const historyList = state.expressionTester.history.length > 0
                    ? state.expressionTester.history.slice(0, 5).map((item, index) => `
                        <div style="padding: 0.75rem; background: #0a0a0a; border-radius: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;"
                             onclick="AdventureCreator.modules['conditional-compilation'].loadExpression('${this.escapeHtml(item.expression)}')">
                            <div style="color: #fff; font-family: monospace; font-size: 0.875rem;">${this.escapeHtml(item.expression)}</div>
                            <div style="color: ${item.result ? '#10b981' : '#ef4444'}; font-size: 0.75rem; margin-top: 0.25rem;">
                                Result: ${item.result ? 'true' : 'false'}
                            </div>
                        </div>
                    `).join('')
                    : '<div style="color: #999; padding: 1rem; text-align: center;">No expression history</div>';

                const content = `
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Expression:</label>
                            <input type="text" id="expressionInput" placeholder="(VERSION >= 200) && defined(DEBUG)"
                                   value="${this.escapeHtml(state.expressionTester.expression)}"
                                   style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem; font-family: monospace;">
                        </div>
                        <button onclick="AdventureCreator.modules['conditional-compilation'].evaluateExpression()"
                                style="width: 100%; padding: 0.75rem; background: #f59e0b; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; margin-bottom: 1.5rem;">
                            🧮 Evaluate Expression
                        </button>
                        ${state.expressionTester.result !== null ? `
                            <div style="padding: 1rem; background: ${state.expressionTester.result ? '#10b98120' : '#ef444420'}; border: 1px solid ${state.expressionTester.result ? '#10b981' : '#ef4444'}; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                                <div style="color: #fff; font-weight: 600; margin-bottom: 0.5rem;">Result:</div>
                                <div style="color: ${state.expressionTester.result ? '#10b981' : '#ef4444'}; font-size: 1.25rem; font-weight: 600;">
                                    ${state.expressionTester.result ? 'TRUE' : 'FALSE'}
                                </div>
                            </div>
                        ` : ''}
                        <div>
                            <h4 style="color: #fff; margin-bottom: 0.75rem; font-size: 0.875rem;">Recent Expressions:</h4>
                            ${historyList}
                        </div>
                    </div>
                `;

                this.showModal(content, '🧮 Expression Tester', null, 'Close', false);
            } catch (error) {
                console.error('Error opening expression tester:', error);
                this.showNotification('Failed to open expression tester', 'error');
            }
        },

        evaluateExpression: function() {
            try {
                const expressionInput = document.getElementById('expressionInput');
                if (!expressionInput) return;

                const expression = expressionInput.value.trim();
                if (!expression) {
                    this.showNotification('Please enter an expression', 'warning');
                    return;
                }

                const state = AdventureCreator.state.conditionalCompilation;

                // Simple expression evaluation (mock for demonstration)
                // In a real implementation, this would parse and evaluate the expression
                const result = Math.random() > 0.5; // Mock result

                state.expressionTester.expression = expression;
                state.expressionTester.result = result;

                // Add to history
                state.expressionTester.history.unshift({ expression, result, timestamp: Date.now() });
                if (state.expressionTester.history.length > 10) {
                    state.expressionTester.history = state.expressionTester.history.slice(0, 10);
                }

                this.saveToStorage();
                this.showNotification(`Expression evaluated: ${result ? 'TRUE' : 'FALSE'}`, 'success');
                this.openExpressionTester();
            } catch (error) {
                console.error('Error evaluating expression:', error);
                this.showNotification('Failed to evaluate expression', 'error');
            }
        },

        loadExpression: function(expression) {
            try {
                const expressionInput = document.getElementById('expressionInput');
                if (expressionInput) {
                    expressionInput.value = expression;
                    AdventureCreator.state.conditionalCompilation.expressionTester.expression = expression;
                }
            } catch (error) {
                console.error('Error loading expression:', error);
            }
        },

        showTemplatesModal: function() {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                const templatesList = state.buildConfiguration.templates.length > 0
                    ? state.buildConfiguration.templates.map((template, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #0a0a0a; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                            <div style="flex: 1;">
                                <div style="color: #fff; font-weight: 600;">${this.escapeHtml(template.name)}</div>
                                <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(template.description || 'No description')}</div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="AdventureCreator.modules['conditional-compilation'].loadTemplate(${index})"
                                        style="padding: 0.5rem 0.75rem; background: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                                    Load
                                </button>
                                <button onclick="AdventureCreator.modules['conditional-compilation'].deleteTemplate(${index})"
                                        style="padding: 0.5rem 0.75rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `).join('')
                    : '<div style="color: #999; padding: 1rem; text-align: center;">No templates saved</div>';

                const content = `
                    <div>
                        <div style="margin-bottom: 1.5rem;">
                            ${templatesList}
                        </div>
                        <button onclick="AdventureCreator.modules['conditional-compilation'].showSaveTemplateModal()"
                                style="width: 100%; padding: 0.75rem; background: #7c3aed; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                            💾 Save Current Configuration as Template
                        </button>
                    </div>
                `;

                this.showModal(content, '📋 Build Configuration Templates', null, 'Close', false);
            } catch (error) {
                console.error('Error showing templates modal:', error);
                this.showNotification('Failed to show templates', 'error');
            }
        },

        showSaveTemplateModal: function() {
            try {
                const content = `
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Template Name:</label>
                            <input type="text" id="templateName" placeholder="My Build Configuration"
                                   style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Description (optional):</label>
                            <textarea id="templateDescription" placeholder="Description of this build configuration"
                                      style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem; min-height: 80px;"></textarea>
                        </div>
                    </div>
                `;

                this.showModal(content, '💾 Save Template', () => {
                    const name = document.getElementById('templateName').value.trim();
                    const description = document.getElementById('templateDescription').value.trim();

                    if (!name) {
                        this.showNotification('Template name is required', 'error');
                        return;
                    }

                    const state = AdventureCreator.state.conditionalCompilation;
                    const template = {
                        name,
                        description,
                        buildTarget: state.buildConfiguration.currentBuild,
                        symbols: [...state.buildConfiguration.symbols],
                        timestamp: Date.now()
                    };

                    state.buildConfiguration.templates.push(template);
                    this.closeModal();
                    this.showNotification('Template saved successfully', 'success');
                    this.saveToStorage();
                    this.showTemplatesModal();
                }, 'Save Template', true);
            } catch (error) {
                console.error('Error showing save template modal:', error);
                this.showNotification('Failed to show save template modal', 'error');
            }
        },

        loadTemplate: function(index) {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                const template = state.buildConfiguration.templates[index];

                state.buildConfiguration.currentBuild = template.buildTarget;
                state.buildConfiguration.symbols = [...template.symbols];

                this.closeModal();
                this.showNotification(`Loaded template: ${template.name}`, 'success');
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error loading template:', error);
                this.showNotification('Failed to load template', 'error');
            }
        },

        deleteTemplate: function(index) {
            try {
                const state = AdventureCreator.state.conditionalCompilation;
                const template = state.buildConfiguration.templates[index];

                const content = `
                    <div style="margin-bottom: 1.5rem;">
                        <p style="color: #ccc;">Are you sure you want to delete this template?</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                            <div style="color: #fff; font-weight: 600;">${this.escapeHtml(template.name)}</div>
                            <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(template.description || 'No description')}</div>
                        </div>
                    </div>
                `;

                this.showModal(content, '🗑️ Delete Template', () => {
                    state.buildConfiguration.templates.splice(index, 1);
                    this.closeModal();
                    this.showNotification('Template deleted', 'success');
                    this.saveToStorage();
                    this.showTemplatesModal();
                }, 'Delete', true);
            } catch (error) {
                console.error('Error deleting template:', error);
                this.showNotification('Failed to delete template', 'error');
            }
        },

        addToRule: function(operationKey, type) {
            try {
                const category = this.getDefinitions()[AdventureCreator.state.conditionalCompilation.selectedCategory];
                const operation = category.operations[operationKey];

                if (!operation) return;

                // Add to current rule being built
                const rule = {
                    type: type,
                    operation: operationKey,
                    name: operation.name,
                    code: operation.daadCode,
                    parameters: operation.parameters || []
                };

                if (type === 'directive') {
                    AdventureCreator.state.conditionalCompilation.currentRule.actions.push(rule);
                }

                this.addToRecent(operationKey);
                this.saveToStorage();
                this.showNotification(`Added "${operation.name}" to current rule`, 'success');
            } catch (error) {
                console.error('Error adding to rule:', error);
                this.showNotification('Failed to add to rule', 'error');
            }
        },

        showCodeExample: function(operationKey) {
            try {
                const category = this.getDefinitions()[AdventureCreator.state.conditionalCompilation.selectedCategory];
                const operation = category.operations[operationKey];

                if (!operation) return;

                const examples = operation.examples.map(ex => `; ${ex}`).join('\n');
                const code = `; ${operation.name}\n${examples}\n\n${operation.daadCode.replace(/\\n/g, '\n')}`;

                const content = `
                    <div>
                        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                            <div style="color: #64748b; font-size: 0.75rem; margin-bottom: 0.5rem;">DAAD Code Example:</div>
                            <pre style="margin: 0; color: #8b5cf6; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(code)}</pre>
                        </div>
                        <button onclick="AdventureCreator.modules['conditional-compilation'].copyToClipboard(\`${this.escapeHtml(code)}\`)"
                                style="width: 100%; padding: 0.75rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                            📋 Copy to Clipboard
                        </button>
                    </div>
                `;

                this.showModal(content, `📋 ${operation.name}`, null, 'Close', false);
            } catch (error) {
                console.error('Error showing code example:', error);
                this.showNotification('Failed to show code example', 'error');
            }
        },

        copyToClipboard: function(text) {
            try {
                navigator.clipboard.writeText(text).then(() => {
                    this.showNotification('Copied to clipboard', 'success');
                }).catch(() => {
                    this.showNotification('Failed to copy to clipboard', 'error');
                });
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                this.showNotification('Failed to copy to clipboard', 'error');
            }
        },

        showParameterEditor: function(operationKey) {
            try {
                const category = this.getDefinitions()[AdventureCreator.state.conditionalCompilation.selectedCategory];
                const operation = category.operations[operationKey];

                if (!operation || !operation.parameters) return;

                const parameterFields = operation.parameters.map(param => {
                    if (param.type === 'text') {
                        return `
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">
                                    ${this.escapeHtml(param.description)}${param.required ? ' *' : ''}
                                </label>
                                <input type="text" id="param_${this.escapeHtml(param.name)}"
                                       placeholder="${this.escapeHtml(param.placeholder || '')}"
                                       style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                            </div>
                        `;
                    } else if (param.type === 'textarea') {
                        return `
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">
                                    ${this.escapeHtml(param.description)}${param.required ? ' *' : ''}
                                </label>
                                <textarea id="param_${this.escapeHtml(param.name)}"
                                          placeholder="${this.escapeHtml(param.placeholder || '')}"
                                          style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem; min-height: 100px;"></textarea>
                            </div>
                        `;
                    } else if (param.type === 'select') {
                        return `
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">
                                    ${this.escapeHtml(param.description)}${param.required ? ' *' : ''}
                                </label>
                                <select id="param_${this.escapeHtml(param.name)}"
                                        style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                                    ${param.options.map(opt => `<option value="${this.escapeHtml(opt)}" ${opt === param.default ? 'selected' : ''}>${this.escapeHtml(opt)}</option>`).join('')}
                                </select>
                            </div>
                        `;
                    } else if (param.type === 'checkbox') {
                        return `
                            <div style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; color: #ccc; cursor: pointer;">
                                    <input type="checkbox" id="param_${this.escapeHtml(param.name)}"
                                           ${param.default ? 'checked' : ''}
                                           style="margin-right: 0.5rem; width: 1.25rem; height: 1.25rem; cursor: pointer;">
                                    <span style="font-weight: 600;">${this.escapeHtml(param.description)}</span>
                                </label>
                            </div>
                        `;
                    } else if (param.type === 'number') {
                        return `
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">
                                    ${this.escapeHtml(param.description)}${param.required ? ' *' : ''}
                                </label>
                                <input type="number" id="param_${this.escapeHtml(param.name)}"
                                       min="${param.min || 0}" max="${param.max || 999}"
                                       value="${param.default || ''}"
                                       style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                            </div>
                        `;
                    }
                    return '';
                }).join('');

                const content = `
                    <div>
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: #fff; margin-bottom: 0.5rem;">Configure ${operation.name}</h4>
                            <p style="color: #999; font-size: 0.875rem; margin: 0;">${operation.description}</p>
                        </div>
                        ${parameterFields}
                    </div>
                `;

                this.showModal(content, `⚙️ Configure Parameters`, () => {
                    const params = {};
                    operation.parameters.forEach(param => {
                        const element = document.getElementById(`param_${param.name}`);
                        if (element) {
                            if (param.type === 'checkbox') {
                                params[param.name] = element.checked;
                            } else {
                                params[param.name] = element.value;
                            }
                        }
                    });

                    this.closeModal();
                    this.showNotification('Parameters configured', 'success');
                    console.log('Configured parameters:', params);
                }, 'Apply Configuration', true);
            } catch (error) {
                console.error('Error showing parameter editor:', error);
                this.showNotification('Failed to show parameter editor', 'error');
            }
        },

        showHelpModal: function() {
            try {
                const content = `
                    <div style="color: #ccc;">
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">🎯 Getting Started</h3>
                            <p style="line-height: 1.6; margin: 0;">
                                The Conditional Compilation module allows you to create platform-specific builds,
                                debug configurations, and feature-flagged code using DAAD preprocessor directives.
                            </p>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">⌨️ Keyboard Shortcuts</h3>
                            <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.75rem; font-size: 0.875rem;">
                                    <div style="color: #8b5cf6; font-weight: 600;">F1</div>
                                    <div>Show this help modal</div>

                                    <div style="color: #8b5cf6; font-weight: 600;">Ctrl + S</div>
                                    <div>Save configuration to storage</div>

                                    <div style="color: #8b5cf6; font-weight: 600;">Ctrl + F</div>
                                    <div>Focus search input</div>

                                    <div style="color: #8b5cf6; font-weight: 600;">ESC</div>
                                    <div>Close current modal</div>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">🔧 Key Features</h3>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                                <li>Define compilation symbols with #define and #undef</li>
                                <li>Conditional code blocks with #ifdef, #ifndef, and #if-#else</li>
                                <li>Build configurations for debug, release, and platform-specific builds</li>
                                <li>Expression evaluator for complex conditional logic</li>
                                <li>Save and load build configuration templates</li>
                                <li>Track recently used operations and favorites</li>
                                <li>Comprehensive symbol management system</li>
                            </ul>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">💡 Tips</h3>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                                <li>Use ⭐ to mark frequently used operations as favorites</li>
                                <li>Save build configurations as templates for quick reuse</li>
                                <li>Test expressions before using them in your code</li>
                                <li>Recent operations are automatically tracked for quick access</li>
                                <li>All settings are saved automatically to localStorage</li>
                            </ul>
                        </div>

                        <div>
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">📚 Categories</h3>
                            <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                                <div style="font-size: 0.875rem; line-height: 1.8;">
                                    <div><strong>🏷️ Preprocessor Directives:</strong> Define and manage symbols</div>
                                    <div><strong>🔀 Conditional Blocks:</strong> Create conditional code sections</div>
                                    <div><strong>⚙️ Build Configurations:</strong> Manage build targets and settings</div>
                                    <div><strong>🧮 Advanced Expressions:</strong> Complex conditional logic</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                this.showModal(content, '❓ Conditional Compilation Help', null, 'Close', false);
            } catch (error) {
                console.error('Error showing help modal:', error);
                this.showNotification('Failed to show help', 'error');
            }
        },

        // Modal System
        showModal: function(content, title, onConfirm, confirmText = 'Confirm', showCancel = true) {
            try {
                this.closeModal();

                const modal = document.createElement('div');
                modal.id = 'conditional-compilation-modal';
                modal.style.cssText = `
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
                    animation: fadeIn 0.2s ease-in-out;
                `;

                const modalContent = document.createElement('div');
                modalContent.style.cssText = `
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 1rem;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    animation: slideIn 0.2s ease-out;
                `;

                modalContent.innerHTML = `
                    <div style="padding: 1.5rem; border-bottom: 1px solid #333;">
                        <h2 style="color: #fff; margin: 0; font-size: 1.25rem;">${title}</h2>
                    </div>
                    <div style="padding: 1.5rem;">
                        ${content}
                    </div>
                    <div style="padding: 1.5rem; border-top: 1px solid #333; display: flex; gap: 1rem; justify-content: flex-end;">
                        ${showCancel ? `
                            <button onclick="AdventureCreator.modules['conditional-compilation'].closeModal()"
                                    style="padding: 0.75rem 1.5rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                                Cancel
                            </button>
                        ` : ''}
                        <button onclick="${onConfirm ? `(${onConfirm.toString()})()` : `AdventureCreator.modules['conditional-compilation'].closeModal()`}"
                                style="padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                            ${confirmText}
                        </button>
                    </div>
                `;

                modal.appendChild(modalContent);
                document.body.appendChild(modal);

                // Click outside to close
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal();
                    }
                });

                // Add CSS animations
                if (!document.getElementById('modal-animations')) {
                    const style = document.createElement('style');
                    style.id = 'modal-animations';
                    style.textContent = `
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideIn {
                            from { transform: translateY(-20px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }
            } catch (error) {
                console.error('Error showing modal:', error);
            }
        },

        closeModal: function() {
            try {
                const modal = document.getElementById('conditional-compilation-modal');
                if (modal) {
                    modal.remove();
                }
            } catch (error) {
                console.error('Error closing modal:', error);
            }
        },

        showNotification: function(message, type = 'info', duration = 3000) {
            try {
                const notification = document.createElement('div');
                const colors = {
                    'success': '#10b981',
                    'error': '#ef4444',
                    'warning': '#f59e0b',
                    'info': '#3b82f6'
                };

                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    background: ${colors[type] || colors.info};
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
                }, duration);
            } catch (error) {
                console.error('Error showing notification:', error);
            }
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

        escapeHtml: function(unsafe) {
            if (typeof unsafe !== 'string') return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        getOperationName: function(operationKey) {
            const operation = this.getOperationByKey(operationKey);
            return operation ? operation.name : operationKey;
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

    console.log('DAAD Conditional Compilation module registered successfully');
})();
