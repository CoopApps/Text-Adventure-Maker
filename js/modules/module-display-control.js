// Display & Formatting System - DAAD Adventure Creator
// Priority Item #7: Complete screen control and formatting (CLS, NEWLINE, SPACE, TAB, ANYKEY)
// Follows established patterns from the 6 completed systems

AdventureCreator.registerModule('display-control', {
    init() {
        // Initialize module state
        if (!AdventureCreator.state.displayFormattingSystem) {
            AdventureCreator.state.displayFormattingSystem = {
                selectedTab: 'screen_control',
                showExplanations: true,
                previewMode: 'text',
                savedTemplates: [],
                favoriteOperations: new Set(),
                recentOperations: [],
                searchQuery: '',
                currentRule: {
                    conditions: [],
                    actions: []
                }
            };
        }

        // Load from localStorage
        this.loadFromStorage();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S - Save template
            if (e.ctrlKey && e.key === 's' && e.target.closest('.display-formatting-container')) {
                e.preventDefault();
                this.showSaveTemplateModal();
            }
            // F1 - Help
            if (e.key === 'F1' && e.target.closest('.display-formatting-container')) {
                e.preventDefault();
                this.showHelpModal();
            }
        });
    },

    saveToStorage() {
        try {
            const state = AdventureCreator.state.displayFormattingSystem;
            const toSave = {
                ...state,
                favoriteOperations: Array.from(state.favoriteOperations)
            };
            localStorage.setItem('displayFormattingSystem_state', JSON.stringify(toSave));
        } catch (error) {
            console.error('Failed to save display formatting state:', error);
        }
    },

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('displayFormattingSystem_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.favoriteOperations) {
                    parsed.favoriteOperations = new Set(parsed.favoriteOperations);
                }
                AdventureCreator.state.displayFormattingSystem = {
                    ...AdventureCreator.state.displayFormattingSystem,
                    ...parsed,
                    searchQuery: '' // Reset search on load
                };
            }
        } catch (error) {
            console.error('Failed to load display formatting state:', error);
        }
    },

    // Complete display and formatting operations with explanations
    getDisplayFormattingDefinitions() {
        return {
            screen_control: {
                title: "🖥️ Screen Control",
                description: "Control the display screen, clear content, and manage visual presentation",
                icon: "🖥️",
                color: "#3b82f6",
                operations: {
                    CLS: {
                        name: "Clear screen",
                        description: "Clears the entire text screen, removing all previous text and starting fresh. Essential for dramatic moments, chapter transitions, or cleaning up cluttered displays.",
                        parameters: [],
                        examples: [
                            "Clear screen before showing important story revelation",
                            "Clean display when entering a new chapter or area",
                            "Reset screen after complex menu interactions"
                        ],
                        useCases: [
                            "Dramatic story moments and scene transitions",
                            "Chapter breaks and major story beats",
                            "Menu system cleanup and organization",
                            "Starting fresh after complex interactions",
                            "Creating focus for important information"
                        ],
                        daadCode: "CLS",
                        category: "basic",
                        icon: "🧹",
                        type: "action",
                        effect: "Clears entire screen display"
                    },
                    DESC: {
                        name: "Show current location description",
                        description: "Displays the full description of the player's current location, including any objects present. Like a 'LOOK' command that refreshes the entire scene view.",
                        parameters: [],
                        examples: [
                            "Refresh room view after objects change position",
                            "Update scene after dramatic events occur",
                            "Show location again after menu interactions"
                        ],
                        useCases: [
                            "Refreshing location view after changes",
                            "Updating scene after object manipulation",
                            "Providing orientation after teleportation",
                            "Showing changes after magical effects",
                            "Redisplaying scene for clarity"
                        ],
                        daadCode: "DESC",
                        category: "basic",
                        icon: "👁️",
                        type: "action",
                        effect: "Shows current location with objects"
                    }
                }
            },

            text_formatting: {
                title: "📝 Text Formatting",
                description: "Control text layout, spacing, and positioning for professional presentation",
                icon: "📝",
                color: "#10b981",
                operations: {
                    NEWLINE: {
                        name: "Insert blank line",
                        description: "Adds a blank line to the display output. Essential for formatting text, creating visual breaks, and organizing information into readable sections.",
                        parameters: [],
                        examples: [
                            "Add space between paragraphs for readability",
                            "Create visual separation between different topics",
                            "Format dialogue with proper spacing"
                        ],
                        useCases: [
                            "Text formatting and visual organization",
                            "Creating readable dialogue and descriptions",
                            "Separating different sections of information",
                            "Professional text layout and presentation",
                            "Making long text more digestible"
                        ],
                        daadCode: "NEWLINE",
                        category: "basic",
                        icon: "📄",
                        type: "action",
                        effect: "Adds one blank line to output"
                    },
                    SPACE: {
                        name: "Insert single space",
                        description: "Adds a single space character to the output. Provides fine control over text formatting and spacing for professional presentation.",
                        parameters: [],
                        examples: [
                            "Fine-tune spacing in custom text output",
                            "Create precise alignment in formatted displays",
                            "Add breathing room between text elements"
                        ],
                        useCases: [
                            "Precise text formatting and alignment",
                            "Custom spacing in generated content",
                            "Professional layout control",
                            "Fine-tuning text presentation",
                            "Creating consistent spacing patterns"
                        ],
                        daadCode: "SPACE",
                        category: "intermediate",
                        icon: "␣",
                        type: "action",
                        effect: "Adds single space character"
                    },
                    TAB: {
                        name: "Tab to column position",
                        description: "Moves the text cursor to a specific column position on the current line. Professional tool for creating aligned text, tables, and formatted displays.",
                        parameters: [
                            { name: "column", type: "number", description: "Column position to tab to (0-79)" }
                        ],
                        examples: [
                            "Create aligned columns for inventory displays",
                            "Format tables with consistent spacing",
                            "Align text elements for professional presentation"
                        ],
                        useCases: [
                            "Creating tables and aligned displays",
                            "Professional text layout and formatting",
                            "Inventory and status screen formatting",
                            "Menu and interface alignment",
                            "Consistent text positioning"
                        ],
                        daadCode: "TAB {column}",
                        category: "advanced",
                        icon: "📏",
                        type: "action",
                        effect: "Moves cursor to specific column"
                    }
                }
            },

            user_interaction: {
                title: "⌨️ User Interaction Control",
                description: "Control user input, pacing, and interaction timing",
                icon: "⌨️",
                color: "#8b5cf6",
                operations: {
                    ANYKEY: {
                        name: "Wait for any keypress",
                        description: "Pauses the game and waits for the player to press any key before continuing. Perfect for controlling pacing, creating dramatic pauses, and ensuring important text is read.",
                        parameters: [],
                        examples: [
                            "Pause after revealing important story information",
                            "Create dramatic tension before major events",
                            "Ensure player reads critical instructions"
                        ],
                        useCases: [
                            "Dramatic pacing and story control",
                            "Ensuring important information is read",
                            "Creating suspense and tension",
                            "Controlling information flow and timing",
                            "Interactive storytelling pacing"
                        ],
                        daadCode: "ANYKEY",
                        category: "basic",
                        icon: "⌨️",
                        type: "action",
                        effect: "Pauses until player presses key"
                    },
                    TIMEOUT: {
                        name: "Check for player inactivity",
                        description: "Tests if the player hasn't entered any commands for the specified number of turns. Useful for providing hints, triggering automatic events, or creating time pressure.",
                        parameters: [
                            { name: "turns", type: "number", description: "Number of turns of inactivity (1-255)" }
                        ],
                        examples: [
                            "Show hint if player idle for 5 turns",
                            "Trigger automatic event after 10 turns of silence",
                            "Provide guidance when player seems stuck"
                        ],
                        useCases: [
                            "Hint systems and player guidance",
                            "Automatic events and time pressure",
                            "Detecting when players need help",
                            "Creating urgency and tension",
                            "Smart tutorial and assistance systems"
                        ],
                        daadCode: "TIMEOUT {turns}",
                        category: "intermediate",
                        icon: "⏱️",
                        type: "condition",
                        effect: "True if player inactive for N turns"
                    }
                }
            },

            message_display: {
                title: "💬 Message Display",
                description: "Display text, messages, and information to the player",
                icon: "💬",
                color: "#f59e0b",
                operations: {
                    MESSAGE: {
                        name: "Display custom message",
                        description: "Shows any custom text message to the player. The fundamental way to communicate with players and tell your story through dynamic, contextual text.",
                        parameters: [
                            { name: "text", type: "text", description: "The message text to display" }
                        ],
                        examples: [
                            "Show dynamic story text based on game state",
                            "Display contextual descriptions and responses",
                            "Provide feedback and story progression"
                        ],
                        useCases: [
                            "Dynamic storytelling and narrative",
                            "Contextual feedback and responses",
                            "Character dialogue and descriptions",
                            "Game state communication",
                            "Interactive story progression"
                        ],
                        daadCode: 'MESSAGE "{text}"',
                        category: "basic",
                        icon: "💬",
                        type: "action",
                        effect: "Displays custom text to player"
                    },
                    MES: {
                        name: "Display numbered message",
                        description: "Shows a pre-written message by its number from the message table. More efficient for frequently used text and maintains consistency across the game.",
                        parameters: [
                            { name: "message_number", type: "number", description: "Message number from /MTX section (0-255)" }
                        ],
                        examples: [
                            "Display standard game responses efficiently",
                            "Show reusable descriptions and text",
                            "Use consistent wording across the game"
                        ],
                        useCases: [
                            "Efficient message management and reuse",
                            "Consistent game text and responses",
                            "Memory optimization for repeated text",
                            "Standardized player feedback",
                            "Centralized text management"
                        ],
                        daadCode: "MES {message_number}",
                        category: "intermediate",
                        icon: "📄",
                        type: "action",
                        effect: "Shows pre-written message by number"
                    },
                    SYSMESS: {
                        name: "Display system message",
                        description: "Shows a built-in DAAD system message (like 'OK', 'You can't see that', etc.). These are standard responses that provide consistent game behavior.",
                        parameters: [
                            { name: "system_message", type: "number", description: "System message number (0-62)" }
                        ],
                        examples: [
                            "Show standard 'OK' response (message 0)",
                            "Display 'You can't see that here' (message 3)",
                            "Use built-in error and response messages"
                        ],
                        useCases: [
                            "Standard game responses and feedback",
                            "Consistent error and success messages",
                            "Professional game polish and feel",
                            "Reducing custom message requirements",
                            "Maintaining DAAD conventions"
                        ],
                        daadCode: "SYSMESS {system_message}",
                        category: "intermediate",
                        icon: "⚙️",
                        type: "action",
                        effect: "Shows built-in system message"
                    },
                    OK: {
                        name: "Display 'OK' message",
                        description: "Shows the standard 'OK.' response message. Quick and consistent way to acknowledge successful player actions.",
                        parameters: [],
                        examples: [
                            "Acknowledge successful action completion",
                            "Provide simple positive feedback",
                            "Confirm command was processed"
                        ],
                        useCases: [
                            "Simple action acknowledgment",
                            "Consistent positive feedback",
                            "Professional game response standards",
                            "Quick success confirmation",
                            "Standard DAAD behavior"
                        ],
                        daadCode: "OK",
                        category: "basic",
                        icon: "✅",
                        type: "action",
                        effect: "Shows standard 'OK.' message"
                    }
                }
            },

            advanced_formatting: {
                title: "🎨 Advanced Formatting",
                description: "Sophisticated display control and presentation techniques",
                icon: "🎨",
                color: "#dc2626",
                operations: {
                    PICTURE: {
                        name: "Display picture/graphic",
                        description: "Shows a graphic image by its number from the graphics database. Adds visual elements to enhance storytelling and create immersive experiences.",
                        parameters: [
                            { name: "picture_number", type: "number", description: "Picture number from graphics database (0-255)" }
                        ],
                        examples: [
                            "Show map illustrations for navigation",
                            "Display character portraits during dialogue",
                            "Reveal puzzle diagrams and clues"
                        ],
                        useCases: [
                            "Visual storytelling and immersion",
                            "Maps, diagrams, and reference images",
                            "Character and location illustrations",
                            "Puzzle and clue visualization",
                            "Enhanced narrative presentation"
                        ],
                        daadCode: "PICTURE {picture_number}",
                        category: "advanced",
                        icon: "🖼️",
                        type: "action",
                        effect: "Displays graphics image by number"
                    },
                    TURNS: {
                        name: "Display turn counter",
                        description: "Shows the current number of turns (commands) the player has taken. Useful for scoring, time tracking, and creating urgency.",
                        parameters: [],
                        examples: [
                            "Show elapsed game time for scoring",
                            "Display progress tracking information",
                            "Create time pressure and urgency"
                        ],
                        useCases: [
                            "Game statistics and scoring systems",
                            "Progress tracking and measurement",
                            "Time pressure and challenge systems",
                            "Player performance feedback",
                            "Achievement and completion tracking"
                        ],
                        daadCode: "TURNS",
                        category: "intermediate",
                        icon: "⏰",
                        type: "action",
                        effect: "Shows current turn count"
                    },
                    SCORE: {
                        name: "Display current score",
                        description: "Shows the player's current score points. Essential for scoring systems and providing feedback on player progress and achievement.",
                        parameters: [],
                        examples: [
                            "Show current points earned",
                            "Display achievement progress",
                            "Provide scoring feedback"
                        ],
                        useCases: [
                            "Scoring and achievement systems",
                            "Player progress feedback",
                            "Competitive and challenge elements",
                            "Motivation and reward systems",
                            "Progress tracking and goals"
                        ],
                        daadCode: "SCORE",
                        category: "basic",
                        icon: "🏆",
                        type: "action",
                        effect: "Shows current score value"
                    }
                }
            }
        };
    },

    // Render the complete display & formatting system interface
    render() {
        const game = AdventureCreator.getCurrentGame();
        if (!game || game.format !== 'daad') {
            return '<div>Display & Formatting System is only available for DAAD format games.</div>';
        }

        const currentTab = AdventureCreator.state.displayFormattingSystem.selectedTab;
        const definitions = this.getDisplayFormattingDefinitions();

        return `
            <div class="display-formatting-container">
                <div class="display-formatting-header">
                    <h3>🖥️ Display & Formatting System</h3>
                    <p style="color: #666; margin: 0.5rem 0;">
                        Professional screen control and text formatting for polished adventure presentation.
                        Create dramatic effects, organized layouts, and interactive pacing.
                    </p>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button class="btn-header" onclick="AdventureCreator.modules['display-control'].showHelpModal()">
                            ❓ Help
                        </button>
                        <button class="btn-header" onclick="AdventureCreator.modules['display-control'].showSaveTemplateModal()">
                            💾 Save Template
                        </button>
                        <button class="btn-header" onclick="AdventureCreator.modules['display-control'].showTemplatesModal()">
                            📋 My Templates
                        </button>
                        <button class="btn-header" onclick="AdventureCreator.modules['display-control'].showFavoritesModal()">
                            ⭐ Favorites
                        </button>
                    </div>
                </div>

                <div class="search-section">
                    <input type="text" class="search-input" placeholder="Search operations... (type to filter)"
                           value="${AdventureCreator.state.displayFormattingSystem.searchQuery}"
                           oninput="AdventureCreator.modules['display-control'].updateSearch(this.value)">
                </div>

                <div class="display-formatting-tabs">
                    ${this.renderDisplayFormattingTabs(definitions, currentTab)}
                </div>

                <div class="display-formatting-content">
                    ${this.renderDisplayFormattingContent(definitions, currentTab, game)}
                </div>

                <div class="formatting-preview">
                    <h4>📺 Live Preview Simulator</h4>
                    ${this.renderFormattingPreview()}
                </div>

                <div class="formatting-examples">
                    <h4>💡 Complete Formatting Systems</h4>
                    ${this.renderFormattingExamples()}
                </div>
            </div>

            <style>
                .display-formatting-container {
                    background: #1a1a1a;
                    border-radius: 12px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .display-formatting-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #333;
                }

                .btn-header {
                    background: #333;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }

                .btn-header:hover {
                    background: #444;
                    transform: translateY(-1px);
                }

                .search-section {
                    margin-bottom: 1.5rem;
                }

                .search-input {
                    width: 100%;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 0.75rem 1rem;
                    color: #fff;
                    font-size: 0.875rem;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .display-formatting-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    overflow-x: auto;
                    flex-wrap: wrap;
                }

                .display-formatting-tab {
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

                .display-formatting-tab:hover {
                    background: #444;
                    color: #fff;
                }

                .display-formatting-tab.active {
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

                .display-formatting-content {
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

                .operation-type-badge {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: var(--operation-color);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .favorite-btn {
                    position: absolute;
                    top: 3rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: #666;
                    font-size: 1.25rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .favorite-btn.favorited {
                    color: #f59e0b;
                }

                .favorite-btn:hover {
                    transform: scale(1.2);
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

                .formatting-preview {
                    background: #0a0a0a;
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .preview-simulator {
                    background: #000;
                    border: 2px solid #333;
                    border-radius: 8px;
                    padding: 1rem;
                    font-family: 'Courier New', monospace;
                    color: #0f0;
                    font-size: 0.875rem;
                    line-height: 1.4;
                    min-height: 200px;
                    margin-top: 1rem;
                    overflow-y: auto;
                    white-space: pre-wrap;
                }

                .preview-controls {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .preview-button {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }

                .preview-button:hover {
                    background: #2563eb;
                }

                .formatting-examples {
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

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp 0.3s;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #fff;
                }

                .modal-close {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: #333;
                    color: #fff;
                }

                .modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                    flex: 1;
                }

                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #333;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #fff;
                    font-weight: 500;
                    font-size: 0.875rem;
                }

                .form-input,
                .form-textarea {
                    width: 100%;
                    padding: 0.75rem;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 0.875rem;
                }

                .form-input:focus,
                .form-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 100px;
                    font-family: 'Courier New', monospace;
                }

                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 2000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .notification {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 1rem 1.5rem;
                    min-width: 300px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    animation: slideInRight 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .notification.success { border-left: 4px solid #10b981; }
                .notification.error { border-left: 4px solid #dc2626; }
                .notification.warning { border-left: 4px solid #f59e0b; }
                .notification.info { border-left: 4px solid #3b82f6; }

                .notification-icon {
                    font-size: 1.25rem;
                }

                .notification-message {
                    flex: 1;
                    color: #fff;
                    font-size: 0.875rem;
                }

                .btn {
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    border: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: #fff;
                }

                .btn-primary:hover {
                    background: #2563eb;
                }

                .btn-secondary {
                    background: #333;
                    color: #fff;
                }

                .btn-secondary:hover {
                    background: #444;
                }

                .btn-danger {
                    background: #dc2626;
                    color: #fff;
                }

                .btn-danger:hover {
                    background: #b91c1c;
                }

                .template-item {
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 6px;
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .template-info {
                    flex: 1;
                }

                .template-name {
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 0.25rem;
                }

                .template-description {
                    font-size: 0.75rem;
                    color: #666;
                }

                .template-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                @media (max-width: 768px) {
                    .operations-grid {
                        grid-template-columns: 1fr;
                    }

                    .examples-grid {
                        grid-template-columns: 1fr;
                    }

                    .display-formatting-tabs {
                        flex-direction: column;
                    }

                    .display-formatting-tab {
                        min-width: auto;
                    }

                    .preview-controls {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            </style>
        `;
    },

    renderDisplayFormattingTabs(definitions, currentTab) {
        const tabs = [
            { key: 'screen_control', def: definitions.screen_control },
            { key: 'text_formatting', def: definitions.text_formatting },
            { key: 'user_interaction', def: definitions.user_interaction },
            { key: 'message_display', def: definitions.message_display },
            { key: 'advanced_formatting', def: definitions.advanced_formatting }
        ];

        return tabs.map(({ key, def }) => `
            <button class="display-formatting-tab ${currentTab === key ? 'active' : ''}"
                    style="--tab-color: ${def.color}"
                    onclick="AdventureCreator.modules['display-control'].switchTab('${key}')">
                <div class="tab-icon">${def.icon}</div>
                <div class="tab-label">${def.title.split(' ')[1]} ${def.title.split(' ')[2] || ''}</div>
            </button>
        `).join('');
    },

    renderDisplayFormattingContent(definitions, currentTab, game) {
        const def = definitions[currentTab];
        if (!def) return '<div>Category not found</div>';

        const searchQuery = AdventureCreator.state.displayFormattingSystem.searchQuery.toLowerCase();
        const filteredOperations = Object.entries(def.operations).filter(([key, op]) => {
            if (!searchQuery) return true;
            return op.name.toLowerCase().includes(searchQuery) ||
                   op.description.toLowerCase().includes(searchQuery) ||
                   key.toLowerCase().includes(searchQuery);
        });

        if (filteredOperations.length === 0) {
            return `
                <div class="category-title" style="color: ${def.color}">
                    ${def.icon} ${def.title}
                </div>
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🔍</div>
                    <div>No operations match your search "${searchQuery}"</div>
                </div>
            `;
        }

        return `
            <div class="category-title" style="color: ${def.color}">
                ${def.icon} ${def.title}
            </div>

            <div class="category-description">
                ${def.description}
            </div>

            <div class="operations-grid">
                ${filteredOperations.map(([key, operation]) => this.renderOperationCard(key, operation, def.color)).join('')}
            </div>
        `;
    },

    renderOperationCard(key, operation, color) {
        const state = AdventureCreator.state.displayFormattingSystem;
        const isFavorited = state.favoriteOperations.has(key);

        return `
            <div class="operation-card" style="--operation-color: ${color}">
                <div class="operation-type-badge">${operation.type}</div>

                <button class="favorite-btn ${isFavorited ? 'favorited' : ''}"
                        onclick="event.stopPropagation(); AdventureCreator.modules['display-control'].toggleFavorite('${key}')"
                        title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorited ? '⭐' : '☆'}
                </button>

                <div class="operation-header">
                    <div class="operation-icon">${operation.icon}</div>
                    <div class="operation-name">${operation.name}</div>
                    <div class="operation-complexity complexity-${operation.category}">
                        ${operation.category.toUpperCase()}
                    </div>
                </div>

                <div class="operation-description">
                    ${operation.description}
                </div>

                <div class="operation-effect">
                    ✨ <strong>Effect:</strong> ${operation.effect}
                </div>

                <div class="operation-examples">
                    <div class="examples-title">💡 Examples</div>
                    ${operation.examples.map(example => `
                        <div class="example-item">${example}</div>
                    `).join('')}
                </div>

                <div class="operation-use-cases">
                    <div class="use-cases-title">🎯 Use Cases</div>
                    ${operation.useCases.map(useCase => `
                        <div class="use-case-item">${useCase}</div>
                    `).join('')}
                </div>

                <button class="btn-operation" onclick="AdventureCreator.modules['display-control'].selectOperation('${key}')">
                    ➕ Add ${operation.name}
                </button>
            </div>
        `;
    },

    renderFormattingPreview() {
        return `
            <div class="preview-controls">
                <span style="color: #ccc; font-weight: 600;">Try Commands:</span>
                <button class="preview-button" onclick="AdventureCreator.modules['display-control'].simulateCommand('CLS')">
                    🧹 CLS
                </button>
                <button class="preview-button" onclick="AdventureCreator.modules['display-control'].simulateCommand('MESSAGE')">
                    💬 MESSAGE
                </button>
                <button class="preview-button" onclick="AdventureCreator.modules['display-control'].simulateCommand('NEWLINE')">
                    📄 NEWLINE
                </button>
                <button class="preview-button" onclick="AdventureCreator.modules['display-control'].simulateCommand('TAB')">
                    📏 TAB
                </button>
                <button class="preview-button" onclick="AdventureCreator.modules['display-control'].simulateCommand('ANYKEY')">
                    ⌨️ ANYKEY
                </button>
                <button class="preview-button" onclick="AdventureCreator.modules['display-control'].simulateCommand('RESET')">
                    🔄 Reset
                </button>
            </div>

            <div class="preview-simulator" id="preview-screen">> Welcome to the Adventure Creator Display Simulator
> Try the commands above to see how they affect the display
>
> Current location: Demo Room
> You can see: a small key, an ancient book
>
> What do you want to do?</div>
        `;
    },

    renderFormattingExamples() {
        const examples = [
            {
                title: "📺 Professional Game Interface",
                description: "Clean, organized display with proper formatting",
                color: "#3b82f6",
                code: `CLS
MESSAGE "🏰 THE CASTLE GATES"
NEWLINE
DESC
NEWLINE
MESSAGE "Score: "
SCORE
TAB 40
MESSAGE "Turns: "
TURNS`,
                explanation: "Creates a professional game interface with clear sections"
            },
            {
                title: "📋 Formatted Inventory Display",
                description: "Aligned inventory with consistent spacing",
                color: "#10b981",
                code: `MESSAGE "INVENTORY:"
NEWLINE
MESSAGE "Sword"
TAB 20
MESSAGE "Weight: 5"
NEWLINE
MESSAGE "Key"
TAB 20
MESSAGE "Weight: 1"
NEWLINE`,
                explanation: "Uses TAB for consistent column alignment"
            },
            {
                title: "🎭 Dramatic Story Presentation",
                description: "Paced revelation with pauses for effect",
                color: "#8b5cf6",
                code: `CLS
MESSAGE "The ancient door slowly creaks open..."
ANYKEY
NEWLINE
MESSAGE "Inside, you see a chamber filled with gold!"
ANYKEY
DESC`,
                explanation: "Controls pacing for dramatic storytelling"
            },
            {
                title: "📊 Status Screen Layout",
                description: "Professional status display with alignment",
                color: "#f59e0b",
                code: `CLS
MESSAGE "=== GAME STATUS ==="
NEWLINE
NEWLINE
MESSAGE "Health:"
TAB 15
MESSAGE "85/100"
NEWLINE
MESSAGE "Magic:"
TAB 15
MESSAGE "42/50"
NEWLINE
MESSAGE "Score:"
TAB 15
SCORE`,
                explanation: "Creates organized status screens with consistent formatting"
            },
            {
                title: "💬 Dialogue System",
                description: "Properly formatted character conversations",
                color: "#dc2626",
                code: `NEWLINE
MESSAGE "The wizard speaks:"
NEWLINE
MESSAGE '"Brave adventurer, I have a quest for you."'
NEWLINE
ANYKEY
MESSAGE '"Will you help me retrieve the Crystal of Power?"'`,
                explanation: "Formats dialogue with proper spacing and pacing"
            },
            {
                title: "🏆 Victory Screen",
                description: "Celebratory ending with dramatic presentation",
                color: "#06b6d4",
                code: `CLS
MESSAGE "🎉 CONGRATULATIONS! 🎉"
NEWLINE
NEWLINE
MESSAGE "You have completed the adventure!"
NEWLINE
MESSAGE "Final Score: "
SCORE
NEWLINE
MESSAGE "Total Turns: "
TURNS
ANYKEY`,
                explanation: "Creates impressive victory screens with complete information"
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

    // UI Actions
    switchTab(tabName) {
        AdventureCreator.state.displayFormattingSystem.selectedTab = tabName;
        AdventureCreator.navigate('editor');
    },

    updateSearch(query) {
        AdventureCreator.state.displayFormattingSystem.searchQuery = query;
        AdventureCreator.navigate('editor');
    },

    toggleFavorite(operationKey) {
        const state = AdventureCreator.state.displayFormattingSystem;
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

    simulateCommand(command) {
        const screen = document.getElementById('preview-screen');
        if (!screen) return;

        const currentText = screen.textContent;

        switch(command) {
            case 'CLS':
                screen.textContent = '> Screen cleared\n> ';
                break;
            case 'MESSAGE':
                screen.textContent = currentText + '\n> You see a mysterious glowing orb.';
                break;
            case 'NEWLINE':
                screen.textContent = currentText + '\n';
                break;
            case 'TAB':
                screen.textContent = currentText + '\n> Name:         Value';
                break;
            case 'ANYKEY':
                screen.textContent = currentText + '\n> [Press any key to continue...]';
                break;
            case 'RESET':
                screen.textContent = `> Welcome to the Adventure Creator Display Simulator
> Try the commands above to see how they affect the display
>
> Current location: Demo Room
> You can see: a small key, an ancient book
>
> What do you want to do?`;
                break;
        }
    },

    selectOperation(operationKey) {
        try {
            // Find the operation definition
            const definitions = this.getDisplayFormattingDefinitions();
            let selectedOperation = null;

            // Search across all categories
            Object.values(definitions).forEach(category => {
                if (category.operations[operationKey]) {
                    selectedOperation = { key: operationKey, ...category.operations[operationKey] };
                }
            });

            if (!selectedOperation) {
                this.showNotification('Operation not found', 'error');
                return;
            }

            // Add to recent operations
            this.addToRecentOperations(operationKey);

            this.showOperationParameterBuilder(selectedOperation);
        } catch (error) {
            console.error('Error selecting operation:', error);
            this.showNotification('Failed to select operation: ' + error.message, 'error');
        }
    },

    addToRecentOperations(operationKey) {
        const state = AdventureCreator.state.displayFormattingSystem;
        state.recentOperations = state.recentOperations.filter(k => k !== operationKey);
        state.recentOperations.unshift(operationKey);
        state.recentOperations = state.recentOperations.slice(0, 10); // Keep last 10
        this.saveToStorage();
    },

    showOperationParameterBuilder(operation) {
        this.showModal(`
            <div style="background: ${operation.type === 'condition' ? '#10b981' : '#3b82f6'}; color: white; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                <strong>Type:</strong> ${operation.type === 'condition' ? 'Condition (IF)' : 'Action (THEN)'}<br>
                <small><strong>Effect:</strong> ${operation.effect}</small>
            </div>

            <p style="color: #ccc; margin-bottom: 1.5rem;">${operation.description}</p>

            ${operation.parameters && operation.parameters.length > 0 ? `
                <div style="background: #0a0a0a; border-radius: 8px; padding: 1.5rem; margin: 1rem 0;">
                    ${operation.parameters.map((param, index) => `
                        <div style="margin-bottom: 1rem;">
                            <div style="font-size: 0.875rem; font-weight: 600; color: #3b82f6; margin-bottom: 0.5rem;">
                                ${param.name}:
                            </div>
                            ${this.renderParameterInput(param, `param-${index}`)}
                            <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">
                                ${param.description}
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
                    ${operation.examples.map(example => `<li>${example}</li>`).join('')}
                </ul>
            </div>

            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                <strong>Common Use Cases:</strong>
                <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #ccc;">
                    ${operation.useCases.slice(0, 3).map(useCase => `<li>${useCase}</li>`).join('')}
                </ul>
            </div>
        `, `${operation.icon} Configure: ${operation.name}`, () => {
            this.addOperationToRule(operation);
        }, 'Add ' + (operation.type === 'condition' ? 'Condition' : 'Action'));
    },

    renderParameterInput(param, id) {
        switch(param.type) {
            case 'number':
                if (param.name === 'column') {
                    return `<input type="number" class="form-input" id="${id}" min="0" max="79" placeholder="Column position (0-79)">`;
                } else if (param.name === 'turns') {
                    return `<input type="number" class="form-input" id="${id}" min="1" max="255" placeholder="Number of turns (1-255)">`;
                } else {
                    return `<input type="number" class="form-input" id="${id}" min="0" max="255" placeholder="Enter number (0-255)">`;
                }

            case 'text':
                return `<textarea class="form-textarea" id="${id}" placeholder="Enter your message text here..." rows="3"></textarea>`;

            default:
                return `<input type="text" class="form-input" id="${id}" placeholder="Enter ${param.name}">`;
        }
    },

    addOperationToRule(operation) {
        try {
            const modal = document.querySelector('.modal');
            const inputs = modal.querySelectorAll('.form-input, .form-textarea');
            const values = Array.from(inputs).map(input => input.value);

            // Validate inputs for operations that need parameters
            if (operation.parameters && operation.parameters.length > 0) {
                if (values.some(v => !v)) {
                    this.showNotification('Please fill in all parameters', 'warning');
                    return;
                }
            }

            const isCondition = operation.type === 'condition';
            const state = AdventureCreator.state.displayFormattingSystem;

            // Add to current rule
            const newOperation = {
                key: operation.key,
                name: operation.name,
                description: this.buildOperationDescription(operation, values),
                daadCode: this.buildOperationCode(operation, values),
                parameters: values,
                icon: operation.icon,
                type: operation.type
            };

            if (isCondition) {
                state.currentRule.conditions.push(newOperation);
            } else {
                state.currentRule.actions.push(newOperation);
            }

            this.closeModal();
            this.showNotification(`${operation.name} added successfully`, 'success');
            this.saveToStorage();
        } catch (error) {
            console.error('Error adding operation:', error);
            this.showNotification('Failed to add operation: ' + error.message, 'error');
        }
    },

    findOperationDefinition(operationKey) {
        const definitions = this.getDisplayFormattingDefinitions();
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

    // Modal Management
    showModal(content, title, onConfirm, confirmText = 'OK', showCancel = true) {
        const modalId = 'display-modal-' + Date.now();
        const modalHtml = `
            <div class="modal-overlay" id="${modalId}" onclick="if(event.target.id==='${modalId}')AdventureCreator.modules['display-control'].closeModal()">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                        <button class="modal-close" onclick="AdventureCreator.modules['display-control'].closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${showCancel ? `<button class="btn btn-secondary" onclick="AdventureCreator.modules['display-control'].closeModal()">Cancel</button>` : ''}
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['display-control'].handleModalConfirm()">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;

        // Store callback
        this._currentModalCallback = onConfirm;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Setup ESC key listener
        this._escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        };
        document.addEventListener('keydown', this._escapeHandler);
    },

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        this._currentModalCallback = null;
        if (this._escapeHandler) {
            document.removeEventListener('keydown', this._escapeHandler);
            this._escapeHandler = null;
        }
    },

    handleModalConfirm() {
        if (this._currentModalCallback) {
            this._currentModalCallback();
        } else {
            this.closeModal();
        }
    },

    showNotification(message, type = 'info', duration = 3000) {
        const container = document.querySelector('.notification-container') || (() => {
            const div = document.createElement('div');
            div.className = 'notification-container';
            document.body.appendChild(div);
            return div;
        })();

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const notificationId = 'notification-' + Date.now();
        const notificationHtml = `
            <div class="notification ${type}" id="${notificationId}">
                <div class="notification-icon">${icons[type] || 'ℹ️'}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', notificationHtml);

        if (duration > 0) {
            setTimeout(() => {
                const notification = document.getElementById(notificationId);
                if (notification) {
                    notification.style.animation = 'slideInRight 0.3s reverse';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    },

    showHelpModal() {
        const content = `
            <div style="line-height: 1.6; color: #ccc;">
                <h3 style="color: #3b82f6; margin-bottom: 1rem;">Display & Formatting System Help</h3>

                <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">What is this?</h4>
                <p>The Display & Formatting System provides professional screen control and text formatting operations for your DAAD adventure. Create dramatic effects, organized layouts, and control the pacing of your story.</p>

                <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Categories</h4>
                <ul style="margin-left: 1.5rem;">
                    <li><strong>Screen Control:</strong> Clear screens, refresh descriptions</li>
                    <li><strong>Text Formatting:</strong> Spacing, alignment, layout</li>
                    <li><strong>User Interaction:</strong> Pauses, timeouts, pacing</li>
                    <li><strong>Message Display:</strong> Show text and information</li>
                    <li><strong>Advanced Formatting:</strong> Graphics, scores, stats</li>
                </ul>

                <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Features</h4>
                <ul style="margin-left: 1.5rem;">
                    <li><strong>Search:</strong> Type in the search box to filter operations</li>
                    <li><strong>Favorites:</strong> Click the star icon to bookmark frequently used operations</li>
                    <li><strong>Templates:</strong> Save formatting sequences for reuse</li>
                    <li><strong>Preview:</strong> Test operations in the live simulator</li>
                    <li><strong>Examples:</strong> Learn from complete formatting systems</li>
                </ul>

                <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Keyboard Shortcuts</h4>
                <ul style="list-style: none; padding-left: 0;">
                    <li><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+S</kbd> - Save template</li>
                    <li><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">F1</kbd> - Show this help</li>
                </ul>

                <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Tips</h4>
                <ul style="margin-left: 1.5rem;">
                    <li>Start with basic operations like CLS and MESSAGE</li>
                    <li>Use NEWLINE and TAB for professional formatting</li>
                    <li>Control pacing with ANYKEY for dramatic moments</li>
                    <li>Save common formatting patterns as templates</li>
                    <li>Test your formatting in the live preview simulator</li>
                </ul>
            </div>
        `;

        this.showModal(content, '❓ Help', null, 'Close', false);
    },

    showSaveTemplateModal() {
        const state = AdventureCreator.state.displayFormattingSystem;
        if (state.currentRule.conditions.length === 0 && state.currentRule.actions.length === 0) {
            this.showNotification('No operations to save. Add some operations first!', 'warning');
            return;
        }

        const content = `
            <div class="form-group">
                <label class="form-label">Template Name</label>
                <input type="text" class="form-input" id="template-name" placeholder="Enter template name">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="template-description" placeholder="Describe what this template does" rows="3"></textarea>
            </div>
            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px;">
                <strong>Operations to save:</strong>
                <div style="margin-top: 0.5rem; color: #ccc;">
                    ${state.currentRule.conditions.length > 0 ? `<div><strong>Conditions:</strong> ${state.currentRule.conditions.length}</div>` : ''}
                    ${state.currentRule.actions.length > 0 ? `<div><strong>Actions:</strong> ${state.currentRule.actions.length}</div>` : ''}
                </div>
            </div>
        `;

        this.showModal(content, '💾 Save Template', () => {
            const name = document.getElementById('template-name').value;
            const description = document.getElementById('template-description').value;

            if (!name) {
                this.showNotification('Please enter a template name', 'warning');
                return;
            }

            state.savedTemplates.push({
                id: Date.now(),
                name: name,
                description: description,
                conditions: [...state.currentRule.conditions],
                actions: [...state.currentRule.actions],
                created: new Date().toISOString()
            });

            this.saveToStorage();
            this.closeModal();
            this.showNotification('Template saved successfully', 'success');
        }, 'Save Template');
    },

    showTemplatesModal() {
        const state = AdventureCreator.state.displayFormattingSystem;

        if (state.savedTemplates.length === 0) {
            const content = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">📋</div>
                    <div>No saved templates yet</div>
                    <div style="margin-top: 1rem;">Add operations and save them as templates for reuse!</div>
                </div>
            `;
            this.showModal(content, '📋 My Templates', null, 'Close', false);
            return;
        }

        const content = `
            <div>
                ${state.savedTemplates.map(template => `
                    <div class="template-item">
                        <div class="template-info">
                            <div class="template-name">${this.escapeHtml(template.name)}</div>
                            <div class="template-description">${this.escapeHtml(template.description || 'No description')}</div>
                            <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">
                                ${template.conditions.length} conditions, ${template.actions.length} actions
                            </div>
                        </div>
                        <div class="template-actions">
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['display-control'].loadTemplate(${template.id})">
                                Load
                            </button>
                            <button class="btn btn-danger" onclick="AdventureCreator.modules['display-control'].deleteTemplate(${template.id})">
                                Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.showModal(content, '📋 My Templates', null, 'Close', false);
    },

    showFavoritesModal() {
        const state = AdventureCreator.state.displayFormattingSystem;
        const favoriteKeys = Array.from(state.favoriteOperations);

        if (favoriteKeys.length === 0) {
            const content = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⭐</div>
                    <div>No favorite operations yet</div>
                    <div style="margin-top: 1rem;">Click the star icon on operations to add them to favorites!</div>
                </div>
            `;
            this.showModal(content, '⭐ Favorites', null, 'Close', false);
            return;
        }

        const definitions = this.getDisplayFormattingDefinitions();
        const favoriteOps = [];

        favoriteKeys.forEach(key => {
            Object.values(definitions).forEach(category => {
                if (category.operations[key]) {
                    favoriteOps.push({ key, ...category.operations[key] });
                }
            });
        });

        const content = `
            <div style="display: grid; gap: 1rem;">
                ${favoriteOps.map(op => `
                    <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <div style="font-weight: 600; color: #fff;">${op.icon} ${op.name}</div>
                            <div style="font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; background: #333; color: #ccc;">
                                ${op.type}
                            </div>
                        </div>
                        <div style="font-size: 0.875rem; color: #999; margin-bottom: 0.75rem;">
                            ${op.description}
                        </div>
                        <button class="btn btn-primary" style="width: 100%;" onclick="AdventureCreator.modules['display-control'].selectOperation('${op.key}'); AdventureCreator.modules['display-control'].closeModal();">
                            Add ${op.name}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        this.showModal(content, '⭐ Favorite Operations', null, 'Close', false);
    },

    loadTemplate(templateId) {
        const state = AdventureCreator.state.displayFormattingSystem;
        const template = state.savedTemplates.find(t => t.id === templateId);

        if (!template) {
            this.showNotification('Template not found', 'error');
            return;
        }

        state.currentRule.conditions = [...template.conditions];
        state.currentRule.actions = [...template.actions];

        this.closeModal();
        this.showNotification(`Template "${template.name}" loaded`, 'success');
    },

    deleteTemplate(templateId) {
        const state = AdventureCreator.state.displayFormattingSystem;
        state.savedTemplates = state.savedTemplates.filter(t => t.id !== templateId);
        this.saveToStorage();
        this.showNotification('Template deleted', 'success');
        this.showTemplatesModal(); // Refresh modal
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

// Export the display formatting system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdventureCreator.modules['display-control'];
}
