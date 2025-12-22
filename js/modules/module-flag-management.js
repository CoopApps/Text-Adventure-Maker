// Advanced Flag Math System - DAAD Adventure Creator
// Priority Item #4: Complete flag arithmetic operations with visual builder
// Follows established patterns from conditions, actions, and process tables

(function() {
    'use strict';

    console.log('Advanced Flag Math System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found!');
        return;
    }

    AdventureCreator.registerModule('flag-management', {
        name: 'Flag Management',
        description: 'Advanced flag arithmetic operations with visual builder',
        category: 'Core',
        complexity: 'Advanced',

        init() {
            console.log('Advanced Flag Math System initialized');
            this.initializeState();
            this.loadFromStorage();
            this.setupKeyboardShortcuts();
        },

        initializeState() {
            if (!AdventureCreator.state.advancedFlagMath) {
                AdventureCreator.state.advancedFlagMath = {
                    selectedTab: 'arithmetic',
                    showExplanations: true,
                    currentOperation: null,
                    favoriteOperations: new Set(),
                    recentOperations: [],
                    templates: [],
                    calculatorHistory: []
                };
            }
        },

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('advancedFlagMath_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const state = AdventureCreator.state.advancedFlagMath;

                    state.selectedTab = parsed.selectedTab || 'arithmetic';
                    state.showExplanations = parsed.showExplanations !== undefined ? parsed.showExplanations : true;
                    state.favoriteOperations = new Set(parsed.favoriteOperations || []);
                    state.recentOperations = parsed.recentOperations || [];
                    state.templates = parsed.templates || [];
                    state.calculatorHistory = parsed.calculatorHistory || [];

                    console.log('Flag Math state loaded from localStorage');
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        saveToStorage() {
            try {
                const state = AdventureCreator.state.advancedFlagMath;
                const toSave = {
                    selectedTab: state.selectedTab,
                    showExplanations: state.showExplanations,
                    favoriteOperations: Array.from(state.favoriteOperations),
                    recentOperations: state.recentOperations,
                    templates: state.templates,
                    calculatorHistory: state.calculatorHistory
                };
                localStorage.setItem('advancedFlagMath_state', JSON.stringify(toSave));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                this.showNotification('Failed to save flag math data', 'error');
            }
        },

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (!document.querySelector('.flag-math-container')) return;

                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }

                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveToStorage();
                    this.showNotification('Flag math configuration saved', 'success');
                }

                if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault();
                    // Focus search if available
                }

                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.closeModal();
                }
            });
        },

        // Complete flag math operations with explanations
        getFlagMathDefinitions() {
            return {
                arithmetic_operations: {
                    title: "🧮 Arithmetic Operations",
                    description: "Basic mathematical operations: add, subtract, multiply, divide",
                    icon: "🧮",
                    color: "#3b82f6",
                    operations: {
                        ADD: {
                            name: "Add number to flag",
                            description: "Increases a flag's value by adding a specific number. Perfect for scoring systems, counters, and accumulating values over time.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to increase" },
                                { name: "amount", type: "number", description: "How much to add (0-255)" }
                            ],
                            examples: [
                                "Add 10 points to player's score (flag 35)",
                                "Increase health by 25 points after healing potion",
                                "Add 5 coins to purse when finding treasure"
                            ],
                            useCases: [
                                "Scoring systems and point accumulation",
                                "Resource gathering (coins, items, materials)",
                                "Experience points and character progression",
                                "Timer extensions and bonus time",
                                "Stat increases from equipment or magic"
                            ],
                            daadCode: "ADD {flag} {amount}",
                            category: "basic",
                            icon: "➕"
                        },
                        SUB: {
                            name: "Subtract number from flag",
                            description: "Decreases a flag's value by subtracting a specific number. Essential for resource management, damage systems, and countdown timers.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to decrease" },
                                { name: "amount", type: "number", description: "How much to subtract (0-255)" }
                            ],
                            examples: [
                                "Lose 20 health points from monster attack",
                                "Spend 50 coins to buy magic sword",
                                "Reduce torch fuel by 1 each turn"
                            ],
                            useCases: [
                                "Health and damage systems",
                                "Resource spending (money, fuel, ammunition)",
                                "Countdown timers and deadlines",
                                "Penalty systems for mistakes",
                                "Wear and degradation mechanics"
                            ],
                            daadCode: "SUB {flag} {amount}",
                            category: "basic",
                            icon: "➖"
                        },
                        MULTIPLY: {
                            name: "Multiply flag by number",
                            description: "Multiplies a flag's current value by a number. Powerful for scaling effects, compound bonuses, and exponential growth systems.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to multiply" },
                                { name: "multiplier", type: "number", description: "What to multiply by (0-255)" }
                            ],
                            examples: [
                                "Double score with 2x bonus multiplier",
                                "Triple damage with berserker rage (×3)",
                                "Halve remaining time due to urgency (×0.5)"
                            ],
                            useCases: [
                                "Bonus and penalty multipliers",
                                "Difficulty scaling systems",
                                "Compound interest and growth",
                                "Magic amplification effects",
                                "Critical hit damage calculations"
                            ],
                            daadCode: "MULTIPLY {flag} {multiplier}",
                            category: "intermediate",
                            icon: "✖️"
                        },
                        DIVIDE: {
                            name: "Divide flag by number",
                            description: "Divides a flag's current value by a number (rounded down). Useful for averaging, proportional reductions, and fractional calculations.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to divide" },
                                { name: "divisor", type: "number", description: "What to divide by (1-255, cannot be 0)" }
                            ],
                            examples: [
                                "Halve damage when wearing armor (÷2)",
                                "Calculate average of multiple values",
                                "Reduce spell power by magic resistance (÷3)"
                            ],
                            useCases: [
                                "Damage reduction and resistance",
                                "Average calculations",
                                "Proportional scaling",
                                "Skill degradation over time",
                                "Resource efficiency calculations"
                            ],
                            daadCode: "DIVIDE {flag} {divisor}",
                            category: "intermediate",
                            icon: "➗"
                        }
                    }
                },

                counter_operations: {
                    title: "🔢 Counter Operations",
                    description: "Simple increment/decrement operations for counters and step-by-step processes",
                    icon: "🔢",
                    color: "#10b981",
                    operations: {
                        INCR: {
                            name: "Increment flag by 1",
                            description: "Adds exactly 1 to a flag's value. The simplest way to count things, track progress, or advance through sequences step by step.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to increment" }
                            ],
                            examples: [
                                "Count another room visited (+1 to exploration)",
                                "Advance to next puzzle step",
                                "Track number of times player has died"
                            ],
                            useCases: [
                                "Visit counters and exploration tracking",
                                "Step-by-step puzzle sequences",
                                "Death and attempt counters",
                                "Turn-based action counting",
                                "Achievement progress tracking"
                            ],
                            daadCode: "INCR {flag}",
                            category: "basic",
                            icon: "⬆️"
                        },
                        DECR: {
                            name: "Decrement flag by 1",
                            description: "Subtracts exactly 1 from a flag's value. Perfect for countdown timers, lives remaining, and step-by-step reductions.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to decrement" }
                            ],
                            examples: [
                                "Lose one life after falling in pit",
                                "Countdown timer: 3, 2, 1, blast off!",
                                "Reduce spell charges remaining"
                            ],
                            useCases: [
                                "Lives and chances remaining",
                                "Countdown timers and deadlines",
                                "Ammo and charge tracking",
                                "Reverse progress indicators",
                                "Step-by-step countdown sequences"
                            ],
                            daadCode: "DECR {flag}",
                            category: "basic",
                            icon: "⬇️"
                        }
                    }
                },

                flag_to_flag_operations: {
                    title: "🔗 Flag-to-Flag Operations",
                    description: "Operations between two flags: transfer values, compare, and manipulate",
                    icon: "🔗",
                    color: "#8b5cf6",
                    operations: {
                        PLUS: {
                            name: "Add one flag to another",
                            description: "Adds the value of the second flag to the first flag. Combines or transfers values between different game statistics or systems.",
                            parameters: [
                                { name: "target_flag", type: "flag", description: "Flag that will receive the added value" },
                                { name: "source_flag", type: "flag", description: "Flag whose value will be added" }
                            ],
                            examples: [
                                "Combine player's strength with weapon bonus",
                                "Add temporary magic bonus to base intelligence",
                                "Pool party members' resources together"
                            ],
                            useCases: [
                                "Stat bonuses from equipment",
                                "Temporary effect stacking",
                                "Resource pooling systems",
                                "Skill synergy calculations",
                                "Team/party stat combinations"
                            ],
                            daadCode: "PLUS {target_flag} {source_flag}",
                            category: "intermediate",
                            icon: "🔗"
                        },
                        MINUS: {
                            name: "Subtract one flag from another",
                            description: "Subtracts the value of the second flag from the first flag. Useful for relative calculations, damage reduction, and comparative systems.",
                            parameters: [
                                { name: "target_flag", type: "flag", description: "Flag that will be reduced" },
                                { name: "source_flag", type: "flag", description: "Flag whose value will be subtracted" }
                            ],
                            examples: [
                                "Reduce damage by armor rating (damage - armor)",
                                "Calculate net score after penalties",
                                "Subtract monster's defense from player's attack"
                            ],
                            useCases: [
                                "Damage calculation with defense",
                                "Net result calculations",
                                "Comparative advantage systems",
                                "Penalty application from variables",
                                "Resistance and mitigation mechanics"
                            ],
                            daadCode: "MINUS {target_flag} {source_flag}",
                            category: "intermediate",
                            icon: "🔗"
                        }
                    }
                },

                copy_operations: {
                    title: "📋 Copy & Transfer Operations",
                    description: "Copy values between flags, byte manipulation, and specialized transfers",
                    icon: "📋",
                    color: "#f59e0b",
                    operations: {
                        COPYBF: {
                            name: "Copy byte from flag to flag",
                            description: "Copies the lower byte (0-255) of one flag to another flag. Essential for transferring values while preserving data integrity.",
                            parameters: [
                                { name: "source_flag", type: "flag", description: "Flag to copy from" },
                                { name: "target_flag", type: "flag", description: "Flag to copy to" }
                            ],
                            examples: [
                                "Copy player's current health to backup variable",
                                "Transfer score to high score if greater",
                                "Save current location before teleportation"
                            ],
                            useCases: [
                                "Backup and restore systems",
                                "Value preservation before modification",
                                "State saving for undo functionality",
                                "Variable initialization and setup",
                                "Data transfer between game systems"
                            ],
                            daadCode: "COPYBF {source_flag} {target_flag}",
                            category: "advanced",
                            icon: "📋"
                        },
                        COPYFF: {
                            name: "Copy full flag to flag",
                            description: "Copies the complete value (including high byte if using 16-bit flags) from one flag to another. Advanced memory management.",
                            parameters: [
                                { name: "source_flag", type: "flag", description: "Flag to copy from" },
                                { name: "target_flag", type: "flag", description: "Flag to copy to" }
                            ],
                            examples: [
                                "Backup complete player statistics",
                                "Initialize new character with template values",
                                "Synchronize related game variables"
                            ],
                            useCases: [
                                "Complete state backup and restore",
                                "Template and initialization systems",
                                "Data synchronization",
                                "Advanced memory management",
                                "Complex variable relationships"
                            ],
                            daadCode: "COPYFF {source_flag} {target_flag}",
                            category: "advanced",
                            icon: "📋"
                        },
                        COPYTF: {
                            name: "Copy turns to flag",
                            description: "Copies the current turn counter value into a flag. Useful for time-based calculations and turn tracking systems.",
                            parameters: [
                                { name: "target_flag", type: "flag", description: "Flag to store the turn count in" }
                            ],
                            examples: [
                                "Record when player entered dangerous area",
                                "Calculate elapsed time for timed puzzles",
                                "Track total game duration"
                            ],
                            useCases: [
                                "Time-based puzzle mechanics",
                                "Performance and speed tracking",
                                "Turn limit implementations",
                                "Timing achievement systems",
                                "Historical event recording"
                            ],
                            daadCode: "COPYTF {target_flag}",
                            category: "advanced",
                            icon: "⏰"
                        }
                    }
                },

                assignment_operations: {
                    title: "📝 Assignment & Control Operations",
                    description: "Set exact values and control flag states directly",
                    icon: "📝",
                    color: "#dc2626",
                    operations: {
                        LET: {
                            name: "Set flag to exact value",
                            description: "Sets a flag to exactly the specified value, overwriting whatever was there before. The fundamental operation for initializing and controlling game state.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to set" },
                                { name: "value", type: "number", description: "Exact value to set (0-255)" }
                            ],
                            examples: [
                                "Set player health to maximum (100)",
                                "Initialize game difficulty to normal (2)",
                                "Reset puzzle state to beginning (0)"
                            ],
                            useCases: [
                                "Game initialization and setup",
                                "State resets and clean starts",
                                "Direct value assignment",
                                "Configuration and settings",
                                "Checkpoint restoration"
                            ],
                            daadCode: "LET {flag} {value}",
                            category: "basic",
                            icon: "📝"
                        },
                        SET: {
                            name: "Set flag to 1 (true)",
                            description: "Sets a flag to 1, the standard 'true' or 'on' value. Quick way to mark boolean conditions, unlock features, or enable systems.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to set to 1" }
                            ],
                            examples: [
                                "Mark door as unlocked (flag = 1)",
                                "Enable magic system after learning spell",
                                "Remember that player visited important location"
                            ],
                            useCases: [
                                "Boolean flags and switches",
                                "Feature enabling and unlocking",
                                "State transitions and triggers",
                                "Permission and access control",
                                "Achievement and milestone marking"
                            ],
                            daadCode: "SET {flag}",
                            category: "basic",
                            icon: "✅"
                        },
                        CLEAR: {
                            name: "Set flag to 0 (false)",
                            description: "Sets a flag to 0, the standard 'false' or 'off' value. Essential for resetting conditions, disabling features, or clearing states.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to set to 0" }
                            ],
                            examples: [
                                "Lock door again after some event",
                                "Disable temporary magic effect",
                                "Clear completed quest from active list"
                            ],
                            useCases: [
                                "State clearing and resetting",
                                "Feature disabling and locking",
                                "Temporary effect expiration",
                                "Cleanup and maintenance",
                                "Security and access revocation"
                            ],
                            daadCode: "CLEAR {flag}",
                            category: "basic",
                            icon: "❌"
                        }
                    }
                }
            };
        },

        // Render the complete flag math interface
        render() {
            const game = AdventureCreator.getCurrentGame();
            if (!game || game.format !== 'daad') {
                return '<div>Advanced Flag Math is only available for DAAD format games.</div>';
            }

            const currentTab = AdventureCreator.state.advancedFlagMath.selectedTab;
            const definitions = this.getFlagMathDefinitions();

            return `
                <div class="flag-math-container">
                    <div class="flag-math-header">
                        <h3>🧮 Advanced Flag Math Builder</h3>
                        <p style="color: #666; margin: 0.5rem 0;">
                            Sophisticated mathematical operations on flags for complex game mechanics.
                            Build scoring systems, combat calculations, and dynamic stat management.
                        </p>
                        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['flag-management'].showHelpModal()">
                                ❓ Help (F1)
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['flag-management'].showTemplatesModal()">
                                📋 Templates
                            </button>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['flag-management'].saveToStorage()">
                                💾 Save (Ctrl+S)
                            </button>
                        </div>
                    </div>

                    <div class="flag-math-tabs">
                        ${this.renderFlagMathTabs(definitions, currentTab)}
                    </div>

                    <div class="flag-math-content">
                        ${this.renderFlagMathContent(definitions, currentTab, game)}
                    </div>

                    <div class="flag-calculator">
                        <h4>🧮 Flag Calculator & Simulator</h4>
                        ${this.renderFlagCalculator()}
                    </div>

                    <div class="flag-usage-examples">
                        <h4>💡 Common Flag Usage Patterns</h4>
                        ${this.renderUsageExamples()}
                    </div>
                </div>

                ${this.renderStyles()}
            `;
        },

        renderStyles() {
            return `
                <style>
                    .flag-math-container {
                        background: #1a1a1a;
                        border-radius: 12px;
                        padding: 2rem;
                        margin-bottom: 2rem;
                    }

                    .flag-math-header {
                        margin-bottom: 2rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid #333;
                    }

                    .flag-math-tabs {
                        display: flex;
                        gap: 0.5rem;
                        margin-bottom: 2rem;
                        overflow-x: auto;
                        flex-wrap: wrap;
                    }

                    .flag-math-tab {
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

                    .flag-math-tab:hover {
                        background: #444;
                        color: #fff;
                    }

                    .flag-math-tab.active {
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

                    .flag-math-content {
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
                        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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
                    }

                    .operation-complexity {
                        display: inline-block;
                        padding: 0.25rem 0.5rem;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        margin-left: auto;
                    }

                    .complexity-basic {
                        background: #10b981;
                        color: white;
                    }

                    .complexity-intermediate {
                        background: #f59e0b;
                        color: white;
                    }

                    .complexity-advanced {
                        background: #dc2626;
                        color: white;
                    }

                    .operation-description {
                        font-size: 0.875rem;
                        color: #ccc;
                        line-height: 1.4;
                        margin-bottom: 1rem;
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

                    .flag-calculator {
                        background: #0a0a0a;
                        border-radius: 8px;
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                    }

                    .calculator-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 1rem;
                        margin-top: 1rem;
                    }

                    .calculator-section {
                        background: #1a1a1a;
                        border-radius: 6px;
                        padding: 1rem;
                    }

                    .calculator-title {
                        font-weight: 600;
                        color: #3b82f6;
                        margin-bottom: 0.75rem;
                    }

                    .calculator-inputs {
                        display: flex;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                        align-items: center;
                        flex-wrap: wrap;
                    }

                    .calculator-input {
                        background: #0a0a0a;
                        border: 1px solid #333;
                        color: #fff;
                        padding: 0.5rem;
                        border-radius: 4px;
                        font-size: 0.875rem;
                        width: 80px;
                    }

                    .calculator-operation {
                        color: #ccc;
                        font-weight: 600;
                    }

                    .calculator-result {
                        background: #0a0a0a;
                        border: 1px solid #10b981;
                        color: #10b981;
                        padding: 0.5rem;
                        border-radius: 4px;
                        font-weight: 600;
                        text-align: center;
                    }

                    .flag-usage-examples {
                        background: #0a0a0a;
                        border-radius: 8px;
                        padding: 1.5rem;
                    }

                    .usage-examples-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 1rem;
                        margin-top: 1rem;
                    }

                    .usage-example {
                        background: #1a1a1a;
                        border-radius: 6px;
                        padding: 1rem;
                        border-left: 4px solid var(--example-color);
                    }

                    .usage-title {
                        font-weight: 600;
                        color: #fff;
                        margin-bottom: 0.5rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .usage-description {
                        font-size: 0.875rem;
                        color: #ccc;
                        margin-bottom: 1rem;
                    }

                    .usage-code {
                        background: #0a0a0a;
                        border-radius: 4px;
                        padding: 0.75rem;
                        font-family: 'Courier New', monospace;
                        font-size: 0.75rem;
                        color: #3b82f6;
                        margin-bottom: 0.75rem;
                    }

                    .usage-explanation {
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

                    .favorite-btn {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: none;
                        border: none;
                        font-size: 1.25rem;
                        cursor: pointer;
                        padding: 0;
                    }

                    @media (max-width: 768px) {
                        .operations-grid {
                            grid-template-columns: 1fr;
                        }

                        .calculator-grid {
                            grid-template-columns: 1fr;
                        }

                        .usage-examples-grid {
                            grid-template-columns: 1fr;
                        }

                        .flag-math-tabs {
                            flex-direction: column;
                        }

                        .flag-math-tab {
                            min-width: auto;
                        }
                    }
                </style>
            `;
        },

        renderFlagMathTabs(definitions, currentTab) {
            const tabs = [
                { key: 'arithmetic', def: definitions.arithmetic_operations },
                { key: 'counter', def: definitions.counter_operations },
                { key: 'flag_to_flag', def: definitions.flag_to_flag_operations },
                { key: 'copy', def: definitions.copy_operations },
                { key: 'assignment', def: definitions.assignment_operations }
            ];

            return tabs.map(({ key, def }) => `
                <button class="flag-math-tab ${currentTab === key ? 'active' : ''}"
                        style="--tab-color: ${def.color}"
                        onclick="AdventureCreator.modules['flag-management'].switchTab('${key}')">
                    <div class="tab-icon">${def.icon}</div>
                    <div class="tab-label">${def.title.split(' ')[1]} ${def.title.split(' ')[2] || ''}</div>
                </button>
            `).join('');
        },

        renderFlagMathContent(definitions, currentTab, game) {
            const tabMap = {
                'arithmetic': definitions.arithmetic_operations,
                'counter': definitions.counter_operations,
                'flag_to_flag': definitions.flag_to_flag_operations,
                'copy': definitions.copy_operations,
                'assignment': definitions.assignment_operations
            };

            const def = tabMap[currentTab];
            if (!def) return '<div>Category not found</div>';

            return `
                <div class="category-title" style="color: ${def.color}">
                    ${def.icon} ${this.escapeHtml(def.title)}
                </div>

                <div class="category-description">
                    ${this.escapeHtml(def.description)}
                </div>

                <div class="operations-grid">
                    ${Object.entries(def.operations).map(([key, operation]) => {
                        const isFavorite = AdventureCreator.state.advancedFlagMath.favoriteOperations.has(key);
                        return `
                            <div class="operation-card" style="--operation-color: ${def.color}"
                                 onclick="AdventureCreator.modules['flag-management'].selectOperation('${key}')">
                                <button class="favorite-btn"
                                        onclick="event.stopPropagation(); AdventureCreator.modules['flag-management'].toggleFavorite('${key}')"
                                        title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                                    ${isFavorite ? '⭐' : '☆'}
                                </button>
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

        renderFlagCalculator() {
            return `
                <div class="calculator-grid">
                    <div class="calculator-section">
                        <div class="calculator-title">➕ Addition Calculator</div>
                        <div class="calculator-inputs">
                            <input type="number" class="calculator-input" id="add-flag-value" placeholder="Flag value" min="0" max="255">
                            <span class="calculator-operation">+</span>
                            <input type="number" class="calculator-input" id="add-amount" placeholder="Amount" min="0" max="255">
                            <span class="calculator-operation">=</span>
                            <div class="calculator-result" id="add-result">0</div>
                        </div>
                        <div style="font-size: 0.75rem; color: #666;">
                            Preview ADD operation results (max 255)
                        </div>
                    </div>

                    <div class="calculator-section">
                        <div class="calculator-title">➖ Subtraction Calculator</div>
                        <div class="calculator-inputs">
                            <input type="number" class="calculator-input" id="sub-flag-value" placeholder="Flag value" min="0" max="255">
                            <span class="calculator-operation">-</span>
                            <input type="number" class="calculator-input" id="sub-amount" placeholder="Amount" min="0" max="255">
                            <span class="calculator-operation">=</span>
                            <div class="calculator-result" id="sub-result">0</div>
                        </div>
                        <div style="font-size: 0.75rem; color: #666;">
                            Preview SUB operation results (min 0)
                        </div>
                    </div>

                    <div class="calculator-section">
                        <div class="calculator-title">✖️ Multiplication Calculator</div>
                        <div class="calculator-inputs">
                            <input type="number" class="calculator-input" id="mul-flag-value" placeholder="Flag value" min="0" max="255">
                            <span class="calculator-operation">×</span>
                            <input type="number" class="calculator-input" id="mul-amount" placeholder="Multiplier" min="0" max="255">
                            <span class="calculator-operation">=</span>
                            <div class="calculator-result" id="mul-result">0</div>
                        </div>
                        <div style="font-size: 0.75rem; color: #666;">
                            Preview MULTIPLY operation (max 255)
                        </div>
                    </div>

                    <div class="calculator-section">
                        <div class="calculator-title">➗ Division Calculator</div>
                        <div class="calculator-inputs">
                            <input type="number" class="calculator-input" id="div-flag-value" placeholder="Flag value" min="0" max="255">
                            <span class="calculator-operation">÷</span>
                            <input type="number" class="calculator-input" id="div-amount" placeholder="Divisor" min="1" max="255">
                            <span class="calculator-operation">=</span>
                            <div class="calculator-result" id="div-result">0</div>
                        </div>
                        <div style="font-size: 0.75rem; color: #666;">
                            Preview DIVIDE operation (rounded down)
                        </div>
                    </div>
                </div>

                <script>
                    // Add event listeners for real-time calculation
                    ['add', 'sub', 'mul', 'div'].forEach(op => {
                        const flagInput = document.getElementById(op + '-flag-value');
                        const amountInput = document.getElementById(op + '-amount');
                        const result = document.getElementById(op + '-result');

                        if (flagInput && amountInput && result) {
                            [flagInput, amountInput].forEach(input => {
                                input.addEventListener('input', () => {
                                    const flagValue = parseInt(flagInput.value) || 0;
                                    const amount = parseInt(amountInput.value) || 0;
                                    let resultValue = 0;

                                    switch(op) {
                                        case 'add':
                                            resultValue = Math.min(255, flagValue + amount);
                                            break;
                                        case 'sub':
                                            resultValue = Math.max(0, flagValue - amount);
                                            break;
                                        case 'mul':
                                            resultValue = Math.min(255, flagValue * amount);
                                            break;
                                        case 'div':
                                            resultValue = amount > 0 ? Math.floor(flagValue / amount) : 0;
                                            break;
                                    }

                                    result.textContent = resultValue;
                                });
                            });
                        }
                    });
                </script>
            `;
        },

        renderUsageExamples() {
            const examples = [
                {
                    title: "🏆 Scoring System",
                    description: "Complete scoring with bonuses and penalties",
                    color: "#3b82f6",
                    code: `// Base scoring
ADD 35 10        // Add 10 points
// Bonus multiplier
MULTIPLY 35 2    // Double score
// Penalty
SUB 35 5         // Lose 5 points`,
                    explanation: "Flexible scoring with arithmetic operations"
                },
                {
                    title: "⚔️ Combat Calculation",
                    description: "Damage with armor reduction",
                    color: "#dc2626",
                    code: `// Calculate damage
LET 100 50       // Base damage = 50
SUB 100 25       // Reduce by armor (25)
SUB 40 100       // Apply to health`,
                    explanation: "Complex combat with multiple factors"
                },
                {
                    title: "⏰ Timer System",
                    description: "Countdown timer with warnings",
                    color: "#f59e0b",
                    code: `// Each turn countdown
DECR 60          // Reduce timer
// Check for warning
LT 60 10         // If less than 10
MESSAGE "Hurry!" // Show warning`,
                    explanation: "Turn-based timing with feedback"
                },
                {
                    title: "📊 Resource Management",
                    description: "Money and inventory tracking",
                    color: "#10b981",
                    code: `// Buy item
SUB 70 25        // Spend 25 coins
INCR 71          // Add to inventory
// Check if broke
ZERO 70          // No money left?`,
                    explanation: "Economy system with state tracking"
                },
                {
                    title: "🎲 Random Events",
                    description: "Variable outcomes based on stats",
                    color: "#8b5cf6",
                    code: `// Random + skill modifier
RANDOM 80 100    // Random 0-100
PLUS 80 50       // Add skill (flag 50)
GT 80 150        // Success if >150`,
                    explanation: "Skill-modified probability system"
                },
                {
                    title: "📈 Character Progression",
                    description: "Experience and level calculations",
                    color: "#06b6d4",
                    code: `// Gain experience
ADD 90 50        // +50 XP
// Check for level up
GT 90 100        // XP > 100?
SUB 90 100       // Use 100 XP
INCR 91          // Level up!`,
                    explanation: "Level system with XP threshold"
                }
            ];

            return `
                <div class="usage-examples-grid">
                    ${examples.map(example => `
                        <div class="usage-example" style="--example-color: ${example.color}">
                            <div class="usage-title">
                                ${example.title}
                            </div>
                            <div class="usage-description">
                                ${this.escapeHtml(example.description)}
                            </div>
                            <div class="usage-code">${this.escapeHtml(example.code)}</div>
                            <div class="usage-explanation">
                                ${this.escapeHtml(example.explanation)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        // UI Actions
        switchTab(tabName) {
            try {
                AdventureCreator.state.advancedFlagMath.selectedTab = tabName;
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error switching tab:', error);
                this.showNotification('Failed to switch tab', 'error');
            }
        },

        toggleFavorite(operationKey) {
            try {
                const state = AdventureCreator.state.advancedFlagMath;
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

        addToRecent(operationKey) {
            try {
                const state = AdventureCreator.state.advancedFlagMath;
                state.recentOperations = state.recentOperations.filter(op => op !== operationKey);
                state.recentOperations.unshift(operationKey);
                if (state.recentOperations.length > 10) {
                    state.recentOperations = state.recentOperations.slice(0, 10);
                }
            } catch (error) {
                console.error('Error adding to recent:', error);
            }
        },

        selectOperation(operationKey) {
            try {
                // Find the operation definition
                const definitions = this.getFlagMathDefinitions();
                let selectedOperation = null;

                // Search across all categories
                Object.values(definitions).forEach(category => {
                    if (category.operations[operationKey]) {
                        selectedOperation = { key: operationKey, ...category.operations[operationKey] };
                    }
                });

                if (selectedOperation) {
                    this.addToRecent(operationKey);
                    this.saveToStorage();
                    this.showOperationParameterBuilder(selectedOperation);
                }
            } catch (error) {
                console.error('Error selecting operation:', error);
                this.showNotification('Failed to select operation', 'error');
            }
        },

        showOperationParameterBuilder(operation) {
            try {
                const content = `
                    <div>
                        <p style="color: #ccc; margin-bottom: 1.5rem;">${this.escapeHtml(operation.description)}</p>

                        ${operation.parameters && operation.parameters.length > 0 ? `
                            <div class="parameter-builder" style="background: #1a1a1a; border-radius: 8px; padding: 1.5rem; margin: 1rem 0;">
                                ${operation.parameters.map((param, index) => `
                                    <div class="parameter-row" style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                                        <div class="parameter-label" style="font-size: 0.875rem; font-weight: 600; color: #3b82f6; min-width: 100px;">
                                            ${this.escapeHtml(param.name)}:
                                        </div>
                                        <div style="flex: 1;">
                                            ${this.renderParameterInput(param, index)}
                                            <div class="parameter-help" style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">
                                                ${this.escapeHtml(param.description)}
                                            </div>
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

                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                            <strong>Common Use Cases:</strong>
                            <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #ccc;">
                                ${operation.useCases.slice(0, 3).map(useCase => `<li>${this.escapeHtml(useCase)}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;

                this.showModal(content, `${operation.icon} Configure: ${operation.name}`, () => {
                    this.addOperationToRule(operation.key);
                }, 'Add Operation', true);
            } catch (error) {
                console.error('Error showing operation parameter builder:', error);
                this.showNotification('Failed to show parameter builder', 'error');
            }
        },

        renderParameterInput(param, index) {
            const game = AdventureCreator.getCurrentGame();

            switch(param.type) {
                case 'flag':
                    // Show custom flags if available
                    const customFlags = game?.daad?.customFlags || [];
                    return `
                        <select class="parameter-input" id="param_${index}" style="flex: 1; background: #0a0a0a; border: 1px solid #333; color: #fff; padding: 0.5rem; border-radius: 4px; font-size: 0.875rem;">
                            <option value="">Choose flag...</option>
                            <optgroup label="System Flags">
                                <option value="0">Flag 0 - Current Noun</option>
                                <option value="1">Flag 1 - Current Verb</option>
                                <option value="2">Flag 2 - Player Location</option>
                                <option value="35">Flag 35 - Score (Low Byte)</option>
                                <option value="36">Flag 36 - Score (High Byte)</option>
                                <option value="37">Flag 37 - Carry Limit</option>
                            </optgroup>
                            ${customFlags.length > 0 ? `
                                <optgroup label="Custom Flags">
                                    ${customFlags.map(flag => `
                                        <option value="${flag.number}">Flag ${flag.number} - ${this.escapeHtml(flag.name)}</option>
                                    `).join('')}
                                </optgroup>
                            ` : ''}
                        </select>
                    `;

                case 'number':
                    return `
                        <input type="number" class="parameter-input" id="param_${index}" min="0" max="255" placeholder="Enter number (0-255)" style="flex: 1; background: #0a0a0a; border: 1px solid #333; color: #fff; padding: 0.5rem; border-radius: 4px; font-size: 0.875rem;">
                    `;

                default:
                    return `
                        <input type="text" class="parameter-input" id="param_${index}" placeholder="Enter ${this.escapeHtml(param.name)}" style="flex: 1; background: #0a0a0a; border: 1px solid #333; color: #fff; padding: 0.5rem; border-radius: 4px; font-size: 0.875rem;">
                    `;
            }
        },

        addOperationToRule(operationKey) {
            try {
                const operationDef = this.findOperationDefinition(operationKey);
                if (!operationDef) {
                    this.showNotification('Operation definition not found', 'error');
                    return;
                }

                const values = [];
                if (operationDef.parameters) {
                    for (let i = 0; i < operationDef.parameters.length; i++) {
                        const input = document.getElementById(`param_${i}`);
                        if (input) {
                            values.push(input.value);
                        }
                    }

                    // Validate inputs
                    if (values.some(v => !v || v === '')) {
                        this.showNotification('Please fill in all parameters', 'warning');
                        return;
                    }
                }

                if (!AdventureCreator.state.currentRuleActions) {
                    AdventureCreator.state.currentRuleActions = [];
                }

                const newOperation = {
                    key: operationKey,
                    name: operationDef.name,
                    description: this.buildOperationDescription(operationDef, values),
                    daadCode: this.buildOperationCode(operationDef, values),
                    parameters: values,
                    icon: operationDef.icon
                };

                AdventureCreator.state.currentRuleActions.push(newOperation);

                this.closeModal();
                this.showNotification('Operation added successfully', 'success');
                this.refreshBuilder();
            } catch (error) {
                console.error('Error adding operation to rule:', error);
                this.showNotification('Failed to add operation', 'error');
            }
        },

        findOperationDefinition(operationKey) {
            const definitions = this.getFlagMathDefinitions();
            for (const category of Object.values(definitions)) {
                if (category.operations[operationKey]) {
                    return category.operations[operationKey];
                }
            }
            return null;
        },

        buildOperationDescription(operationDef, values) {
            let desc = operationDef.name;
            if (values.length > 0) {
                const nonEmptyValues = values.filter(v => v);
                if (nonEmptyValues.length > 0) {
                    desc += ` (${nonEmptyValues.join(', ')})`;
                }
            }
            return desc;
        },

        buildOperationCode(operationDef, values) {
            let code = operationDef.daadCode;
            if (operationDef.parameters) {
                operationDef.parameters.forEach((param, index) => {
                    const value = values[index] || '?';
                    code = code.replace(`{${param.name}}`, value);
                });
            }
            return code;
        },

        refreshBuilder() {
            try {
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error refreshing builder:', error);
            }
        },

        // Templates modal
        showTemplatesModal() {
            try {
                const state = AdventureCreator.state.advancedFlagMath;
                const templatesList = state.templates.length > 0
                    ? state.templates.map((template, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #0a0a0a; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                            <div style="flex: 1;">
                                <div style="color: #fff; font-weight: 600;">${this.escapeHtml(template.name)}</div>
                                <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(template.description || 'No description')}</div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="AdventureCreator.modules['flag-management'].loadTemplate(${index})"
                                        style="padding: 0.5rem 0.75rem; background: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                                    Load
                                </button>
                                <button onclick="AdventureCreator.modules['flag-management'].deleteTemplate(${index})"
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
                        <button onclick="AdventureCreator.modules['flag-management'].showSaveTemplateModal()"
                                style="width: 100%; padding: 0.75rem; background: #7c3aed; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                            💾 Save Current Configuration as Template
                        </button>
                    </div>
                `;

                this.showModal(content, '📋 Operation Templates', null, 'Close', false);
            } catch (error) {
                console.error('Error showing templates modal:', error);
                this.showNotification('Failed to show templates', 'error');
            }
        },

        showSaveTemplateModal() {
            try {
                const content = `
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Template Name:</label>
                            <input type="text" id="templateName" placeholder="My Flag Operation Template"
                                   style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Description (optional):</label>
                            <textarea id="templateDescription" placeholder="Description of this template"
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

                    const state = AdventureCreator.state.advancedFlagMath;
                    const template = {
                        name,
                        description,
                        selectedTab: state.selectedTab,
                        timestamp: Date.now()
                    };

                    state.templates.push(template);
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

        loadTemplate(index) {
            try {
                const state = AdventureCreator.state.advancedFlagMath;
                const template = state.templates[index];

                state.selectedTab = template.selectedTab;

                this.closeModal();
                this.showNotification(`Loaded template: ${template.name}`, 'success');
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error loading template:', error);
                this.showNotification('Failed to load template', 'error');
            }
        },

        deleteTemplate(index) {
            try {
                const state = AdventureCreator.state.advancedFlagMath;
                const template = state.templates[index];

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
                    state.templates.splice(index, 1);
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

        // Help modal
        showHelpModal() {
            try {
                const content = `
                    <div style="color: #ccc;">
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">🎯 Getting Started</h3>
                            <p style="line-height: 1.6; margin: 0;">
                                The Advanced Flag Math Builder allows you to create sophisticated mathematical
                                operations on flags for complex game mechanics like scoring, combat, and resource management.
                            </p>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">⌨️ Keyboard Shortcuts</h3>
                            <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.75rem; font-size: 0.875rem;">
                                    <div style="color: #8b5cf6; font-weight: 600;">F1</div>
                                    <div>Show this help modal</div>

                                    <div style="color: #8b5cf6; font-weight: 600;">Ctrl + S</div>
                                    <div>Save configuration</div>

                                    <div style="color: #8b5cf6; font-weight: 600;">ESC</div>
                                    <div>Close current modal</div>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">🔧 Key Features</h3>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                                <li>Arithmetic operations (ADD, SUB, MULTIPLY, DIVIDE)</li>
                                <li>Counter operations (INCR, DECR)</li>
                                <li>Flag-to-flag operations (PLUS, MINUS)</li>
                                <li>Copy and transfer operations</li>
                                <li>Assignment operations (LET, SET, CLEAR)</li>
                                <li>Live calculator for previewing results</li>
                                <li>Save favorite operations and templates</li>
                            </ul>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">💡 Tips</h3>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                                <li>Use ⭐ to mark favorite operations for quick access</li>
                                <li>Save common patterns as templates</li>
                                <li>Use the calculator to preview operation results</li>
                                <li>Recent operations are automatically tracked</li>
                                <li>All settings are saved automatically to localStorage</li>
                            </ul>
                        </div>

                        <div>
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">📚 Categories</h3>
                            <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                                <div style="font-size: 0.875rem; line-height: 1.8;">
                                    <div><strong>🧮 Arithmetic:</strong> ADD, SUB, MULTIPLY, DIVIDE</div>
                                    <div><strong>🔢 Counter:</strong> INCR, DECR</div>
                                    <div><strong>🔗 Flag-to-Flag:</strong> PLUS, MINUS</div>
                                    <div><strong>📋 Copy:</strong> COPYBF, COPYFF, COPYTF</div>
                                    <div><strong>📝 Assignment:</strong> LET, SET, CLEAR</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                this.showModal(content, '❓ Flag Math Help', null, 'Close', false);
            } catch (error) {
                console.error('Error showing help modal:', error);
                this.showNotification('Failed to show help', 'error');
            }
        },

        // Modal System
        showModal(content, title, onConfirm, confirmText = 'Confirm', showCancel = true) {
            try {
                this.closeModal();

                const modal = document.createElement('div');
                modal.id = 'flag-math-modal';
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
                            <button onclick="AdventureCreator.modules['flag-management'].closeModal()"
                                    style="padding: 0.75rem 1.5rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                                Cancel
                            </button>
                        ` : ''}
                        <button onclick="${onConfirm ? `(${onConfirm.toString()})()` : `AdventureCreator.modules['flag-management'].closeModal()`}"
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

        closeModal() {
            try {
                const modal = document.getElementById('flag-math-modal');
                if (modal) {
                    modal.remove();
                }
            } catch (error) {
                console.error('Error closing modal:', error);
            }
        },

        showNotification(message, type = 'info', duration = 3000) {
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

        escapeHtml(unsafe) {
            if (typeof unsafe !== 'string') return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    });

    console.log('Advanced Flag Math System registered successfully');
})();
