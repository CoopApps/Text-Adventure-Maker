// module-save-load-systems.js - DAAD Save/Load Systems
// Complete save/load system with real DAAD condacts and implementation patterns
(function() {
    'use strict';

    console.log('DAAD Save/Load Systems module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Save/Load Systems module requires the Adventure Creator framework.');
        return;
    }

    AdventureCreator.registerModule('save-load-systems', {
        name: 'Save/Load Systems',
        version: '1.0.0',
        description: 'Complete save/load, restart, and game state management for DAAD adventures',
        category: 'Core Systems',
        author: 'DAAD Adventure Creator',

        init: function() {
            console.log('Save/Load Systems module initialized');
            this.initializeState();
        },

        initializeState: function() {
            if (!AdventureCreator.state.saveLoadSystems) {
                AdventureCreator.state.saveLoadSystems = {
                    selectedCategory: 'disk_operations',
                    selectedOperation: null,
                    showExplanations: true,
                    previewMode: false,
                    searchFilter: '',
                    viewMode: 'condacts', // 'condacts' or 'patterns'
                    currentRule: {
                        conditions: [],
                        actions: []
                    }
                };
            }
        },

        render: function() {
            const state = AdventureCreator.state.saveLoadSystems;

            return `
                <div class="save-load-systems-editor" style="background: #0a0a0a; min-height: 100vh; color: #e0e0e0;">
                    <div class="module-header" style="background: #1a1a1a; border-bottom: 1px solid #333; padding: 2rem;">
                        <div style="max-width: 1400px; margin: 0 auto;">
                            <h1 style="color: #fff; font-size: 2rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem;">
                                💾 Save/Load Systems
                                <span style="font-size: 0.6em; color: #8b5cf6; background: rgba(139, 92, 246, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">DAAD Core</span>
                            </h1>
                            <p style="color: #999; font-size: 1.1rem; margin-bottom: 1.5rem;">
                                Native DAAD save/load condacts and advanced implementation patterns
                            </p>

                            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="AdventureCreator.modules['save-load-systems'].setViewMode('condacts')"
                                            style="padding: 0.5rem 1rem; background: ${state.viewMode === 'condacts' ? '#8b5cf6' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ✅ DAAD Condacts
                                    </button>
                                    <button onclick="AdventureCreator.modules['save-load-systems'].setViewMode('patterns')"
                                            style="padding: 0.5rem 1rem; background: ${state.viewMode === 'patterns' ? '#8b5cf6' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        💡 Implementation Patterns
                                    </button>
                                    <button onclick="AdventureCreator.modules['save-load-systems'].toggleExplanations()"
                                            style="padding: 0.5rem 1rem; background: ${state.showExplanations ? '#059669' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.showExplanations ? '📖 Hide Details' : '📖 Show Details'}
                                    </button>
                                </div>

                                <div style="flex: 1; max-width: 300px; position: relative;">
                                    <input type="text"
                                           placeholder="Search operations..."
                                           value="${state.searchFilter}"
                                           onkeyup="AdventureCreator.modules['save-load-systems'].updateSearchFilter(this.value)"
                                           style="width: 100%; padding: 0.5rem 1rem 0.5rem 2.5rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white;">
                                    <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af;">🔍</span>
                                </div>
                            </div>

                            ${state.viewMode === 'patterns' ? `
                                <div style="margin-top: 1rem; padding: 1rem; background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; border-radius: 0.5rem;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; color: #8b5cf6;">
                                        <span>💡</span>
                                        <strong>Implementation Patterns Mode</strong>
                                    </div>
                                    <p style="margin: 0.5rem 0 0 0; color: #ccc; font-size: 0.9rem;">
                                        Showing advanced patterns that use DAAD condacts to implement complex save/load features.
                                        These are not built-in condacts, but proven implementation techniques.
                                    </p>
                                </div>
                            ` : ''}
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
            const categories = state.viewMode === 'condacts' ? this.getCondactDefinitions() : this.getPatternDefinitions();

            return `
                <div class="category-header" style="background: #8b5cf6; color: white; padding: 1rem; font-weight: 600;">
                    ${state.viewMode === 'condacts' ? '✅ Native DAAD Condacts' : '💡 Implementation Patterns'}
                </div>
                <div class="category-list">
                    ${Object.entries(categories).map(([key, category]) => `
                        <div class="category-item ${state.selectedCategory === key ? 'active' : ''}"
                             onclick="AdventureCreator.modules['save-load-systems'].selectCategory('${key}')"
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
            `;
        },

        renderMainContent: function(state) {
            const categories = state.viewMode === 'condacts' ? this.getCondactDefinitions() : this.getPatternDefinitions();
            const category = categories[state.selectedCategory];

            if (!category) {
                // Default to first category
                const firstKey = Object.keys(categories)[0];
                state.selectedCategory = firstKey;
                return this.renderMainContent(state);
            }

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

                    ${Object.keys(filteredOps).length === 0 ? `
                        <div style="text-align: center; padding: 3rem; color: #666;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                            <p>No operations match your search.</p>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        renderOperationCard: function(key, operation, state) {
            const isSelected = state.selectedOperation === key;
            const complexityColor = this.getComplexityColor(operation.category);
            const isPattern = state.viewMode === 'patterns';

            return `
                <div class="operation-card ${isSelected ? 'selected' : ''}"
                     onclick="AdventureCreator.modules['save-load-systems'].selectOperation('${key}')"
                     style="background: #1a1a1a; border: 2px solid ${isSelected ? '#8b5cf6' : '#333'}; border-radius: 0.75rem; padding: 1.5rem; cursor: pointer; transition: all 0.2s;">

                    <div class="operation-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.5rem;">${operation.icon}</span>
                                <h3 style="color: #fff; margin: 0; font-size: 1.1rem;">${operation.name}</h3>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: ${complexityColor}; color: white; border-radius: 0.25rem; font-weight: 600;">
                                    ${operation.category.toUpperCase()}
                                </span>
                                ${isPattern ? `
                                    <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: #8b5cf6; color: white; border-radius: 0.25rem; font-weight: 600;">
                                        PATTERN
                                    </span>
                                ` : `
                                    <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: #059669; color: white; border-radius: 0.25rem; font-weight: 600;">
                                        NATIVE DAAD
                                    </span>
                                `}
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
                                    ${operation.examples.map(example => `<li style="margin-bottom: 0.25rem;">${example}</li>`).join('')}
                                </ul>
                            </div>
                            <div>
                                <h4 style="color: #8b5cf6; margin-bottom: 0.5rem; font-size: 0.9rem;">Use Cases:</h4>
                                <ul style="margin: 0; padding-left: 1.5rem; color: #999;">
                                    ${operation.useCases.slice(0, 3).map(useCase => `<li style="margin-bottom: 0.25rem;">${useCase}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}

                    <div class="operation-code" style="background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem; font-family: 'Courier New', monospace;">
                        <div style="color: #64748b; font-size: 0.75rem; margin-bottom: 0.25rem;">DAAD Code:</div>
                        <pre style="color: #8b5cf6; font-weight: 500; margin: 0; white-space: pre-wrap; font-family: inherit;">${operation.daadCode}</pre>
                        ${operation.effect ? `<div style="color: #10b981; font-size: 0.75rem; margin-top: 0.25rem;">Effect: ${operation.effect}</div>` : ''}
                    </div>

                    ${isSelected ? `
                        <div class="operation-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button onclick="AdventureCreator.modules['save-load-systems'].addToRule('${key}', 'action'); event.stopPropagation();"
                                    style="flex: 1; padding: 0.5rem; background: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                ➕ Add to Rule
                            </button>
                            <button onclick="AdventureCreator.modules['save-load-systems'].copyCode('${key}'); event.stopPropagation();"
                                    style="padding: 0.5rem 0.75rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                📋 Copy
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        getCondactDefinitions: function() {
            return {
                disk_operations: {
                    title: "💾 Disk Save/Load",
                    description: "Persistent save and load operations to disk",
                    icon: "💾",
                    color: "#3b82f6",
                    operations: {
                        SAVE: {
                            name: "SAVE - Save game to disk",
                            description: "Saves the current game state to a disk file. Creates a permanent save that persists between gaming sessions. The player is prompted for a filename. All flags, object locations, and game state are preserved.",
                            parameters: [],
                            examples: [
                                "Player manually saves progress",
                                "Save before major decision point",
                                "Checkpoint after completing chapter"
                            ],
                            useCases: [
                                "Manual save functionality in games",
                                "Progress preservation for long adventures",
                                "Player-initiated checkpoints",
                                "Session management for extended gameplay",
                                "Safety saves before risky actions"
                            ],
                            daadCode: "SAVE",
                            category: "basic",
                            icon: "💾",
                            effect: "Prompts player to save current game state to disk"
                        },
                        LOAD: {
                            name: "LOAD - Load saved game",
                            description: "Restores a previously saved game state from disk. The player is prompted for the save filename. All flags, object locations, and game state are restored to their saved values.",
                            parameters: [],
                            examples: [
                                "Continue from previous session",
                                "Restore saved progress",
                                "Load game after a break"
                            ],
                            useCases: [
                                "Continue interrupted gameplay sessions",
                                "Resume long adventures across sessions",
                                "Restore progress after game quits",
                                "Load specific save points",
                                "Return to earlier game states"
                            ],
                            daadCode: "LOAD",
                            category: "basic",
                            icon: "📂",
                            effect: "Prompts player to load game state from disk"
                        },
                        RESTART: {
                            name: "RESTART - Restart game",
                            description: "Completely resets the game to its initial state. All flags are cleared to zero, all objects return to their starting locations, and the player is placed at the starting location. Equivalent to restarting the interpreter.",
                            parameters: [],
                            examples: [
                                "Player wants to start over",
                                "Game over - try again",
                                "Reset after completing game"
                            ],
                            useCases: [
                                "Game over scenarios with retry option",
                                "Player-requested fresh start",
                                "Complete game reset functionality",
                                "New game option in menu systems",
                                "Testing and development resets"
                            ],
                            daadCode: "RESTART",
                            category: "basic",
                            icon: "🔄",
                            effect: "Resets entire game to initial state"
                        }
                    }
                },

                memory_operations: {
                    title: "⚡ RAM Save/Load",
                    description: "Fast temporary save/load operations in memory",
                    icon: "⚡",
                    color: "#f59e0b",
                    operations: {
                        RAMSAVE: {
                            name: "RAMSAVE - Quick save to memory",
                            description: "Saves the current game state to RAM (memory). Much faster than disk save and doesn't prompt for a filename. Perfect for quick checkpoints, but the save is lost when the game closes. Only one RAM save can exist at a time.",
                            parameters: [],
                            examples: [
                                "Quick checkpoint before risky action",
                                "Temporary save for puzzle attempts",
                                "Instant backup before dangerous choice"
                            ],
                            useCases: [
                                "Quick checkpoint systems",
                                "Undo mechanics implementation",
                                "Temporary experimentation saves",
                                "Fast backup before critical actions",
                                "Puzzle retry functionality"
                            ],
                            daadCode: "RAMSAVE",
                            category: "intermediate",
                            icon: "⚡",
                            effect: "Instantly saves game state to memory (temporary)"
                        },
                        RAMLOAD: {
                            name: "RAMLOAD - Quick load from memory",
                            description: "Restores the game state from RAM (saved with RAMSAVE). Instant restoration with no disk access or filename prompt. Returns the game to exactly where RAMSAVE was called. Perfect for implementing undo or quick retry mechanics.",
                            parameters: [],
                            examples: [
                                "Undo last dangerous action",
                                "Quick restore to checkpoint",
                                "Retry puzzle from saved state"
                            ],
                            useCases: [
                                "Undo mechanics and mistake recovery",
                                "Quick puzzle retry systems",
                                "Instant return to safe states",
                                "Fast experimental gameplay",
                                "Checkpoint-based game design"
                            ],
                            daadCode: "RAMLOAD",
                            category: "intermediate",
                            icon: "⚡",
                            effect: "Instantly restores game state from memory"
                        }
                    }
                },

                control_flow: {
                    title: "⏸️ Game Control",
                    description: "Flow control and player interaction",
                    icon: "⏸️",
                    color: "#10b981",
                    operations: {
                        ANYKEY: {
                            name: "ANYKEY - Wait for keypress",
                            description: "Pauses game execution and waits for the player to press any key. Creates dramatic pauses, gives players time to read important text, and controls game pacing. Useful in cutscenes and story sequences.",
                            parameters: [],
                            examples: [
                                "Pause after dramatic revelation",
                                "Wait before showing credits",
                                "Give time to read important message"
                            ],
                            useCases: [
                                "Dramatic pacing in story beats",
                                "Reading time for long messages",
                                "Controlled progression through cutscenes",
                                "User-paced story reveals",
                                "Interactive pause points"
                            ],
                            daadCode: "ANYKEY",
                            category: "basic",
                            icon: "⏸️",
                            effect: "Pauses until player presses any key"
                        }
                    }
                }
            };
        },

        getPatternDefinitions: function() {
            return {
                autosave_patterns: {
                    title: "🤖 Auto-Save Patterns",
                    description: "Implementing automatic save functionality",
                    icon: "🤖",
                    color: "#8b5cf6",
                    operations: {
                        AUTOSAVE_TURN_BASED: {
                            name: "Turn-Based Auto-Save",
                            description: "Automatically saves the game every N turns using a flag counter. This pattern uses PRO 2 (automatic actions) to increment a counter and save when it reaches a threshold.",
                            examples: [
                                "Auto-save every 10 turns",
                                "Regular progress preservation",
                                "Background save system"
                            ],
                            useCases: [
                                "Modern game convenience features",
                                "Progress protection in long games",
                                "Transparent save systems",
                                "Safety net for players",
                                "Automatic checkpoint creation"
                            ],
                            daadCode: `; Auto-save every 10 turns
; Add to PRO 2 (automatic actions)
AT _         ; Every turn
THEN
  PLUS 255 1   ; Increment turn counter (flag 255)
  EQ 255 10    ; Check if 10 turns
  THEN
    RAMSAVE      ; Quick save to memory
    CLEAR 255    ; Reset counter
    MESSAGE "Game auto-saved."
  DONE
DONE`,
                            category: "advanced",
                            icon: "🤖",
                            effect: "Creates automatic save every N turns"
                        },
                        AUTOSAVE_LOCATION: {
                            name: "Location-Based Auto-Save",
                            description: "Automatically saves when entering specific important locations. Uses a flag to track whether that location has been saved already to avoid repeated saves.",
                            examples: [
                                "Save when entering new areas",
                                "Checkpoint at safe locations",
                                "Auto-save at story milestones"
                            ],
                            useCases: [
                                "Automatic progress checkpoints",
                                "Location-based save points",
                                "Safe haven auto-saves",
                                "Story milestone preservation",
                                "Exploration progress tracking"
                            ],
                            daadCode: `; Auto-save when entering location 10
; Add to PRO 2
AT 10            ; At specific location
NOTZERO 100      ; Haven't saved here yet (flag 100)
THEN
  RAMSAVE          ; Quick save
  CLEAR 100        ; Mark as saved
  MESSAGE "Checkpoint reached."
DONE`,
                            category: "intermediate",
                            icon: "📍",
                            effect: "Auto-saves when entering specific locations"
                        }
                    }
                },

                checkpoint_patterns: {
                    title: "🚩 Checkpoint Patterns",
                    description: "Named checkpoint save systems",
                    icon: "🚩",
                    color: "#f59e0b",
                    operations: {
                        CHECKPOINT_SYSTEM: {
                            name: "Multi-Checkpoint System",
                            description: "Implements named checkpoints using RAMSAVE and flags. Each checkpoint sets a flag indicating which checkpoint is active. RAMLOAD combined with flag checks can restore to the correct checkpoint.",
                            examples: [
                                "Chapter-based checkpoints",
                                "Boss fight checkpoints",
                                "Puzzle section saves"
                            ],
                            useCases: [
                                "Structured save point systems",
                                "Chapter-based saves",
                                "Difficulty checkpoint placement",
                                "Professional game structure",
                                "Multiple restore points"
                            ],
                            daadCode: `; Checkpoint system using flags
; Set checkpoint 1 (before boss)
AT 20          ; At boss entrance
THEN
  SET 200 1      ; Set checkpoint flag to 1
  RAMSAVE        ; Save state
  MESSAGE "Checkpoint: Boss Entrance"
DONE

; Set checkpoint 2 (puzzle start)
AT 25          ; At puzzle room
THEN
  SET 200 2      ; Set checkpoint flag to 2
  RAMSAVE        ; Save state
  MESSAGE "Checkpoint: Puzzle Room"
DONE

; Restore to last checkpoint
; (Add this to death/failure handler)
; VERB "restore"
THEN
  RAMLOAD        ; Load last checkpoint
  EQ 200 1       ; Was it checkpoint 1?
  THEN
    MESSAGE "Restored to Boss Entrance"
  DONE
  EQ 200 2       ; Was it checkpoint 2?
  THEN
    MESSAGE "Restored to Puzzle Room"
  DONE
DONE`,
                            category: "advanced",
                            icon: "🚩",
                            effect: "Creates named checkpoint save system"
                        }
                    }
                },

                selective_save_patterns: {
                    title: "📊 Selective Save Patterns",
                    description: "Saving specific game state components",
                    icon: "📊",
                    color: "#10b981",
                    operations: {
                        INVENTORY_SNAPSHOT: {
                            name: "Inventory Snapshot",
                            description: "Saves just the inventory state by copying carried/worn object locations to backup flags. Can restore inventory without affecting other game state.",
                            examples: [
                                "Save inventory before trade",
                                "Backup items before risky action",
                                "Restore items after event"
                            ],
                            useCases: [
                                "Trading system safeguards",
                                "Inventory puzzle undo",
                                "Item management safety",
                                "Selective state restoration",
                                "Partial save systems"
                            ],
                            daadCode: `; Save inventory to backup flags
; Objects 0-9, flags 210-219 for backup
VERB "saveinv"
THEN
  ; Save object 0 location
  COPYOF 0       ; Get location of object 0
  COPYFO 210     ; Copy to backup flag 210
  ; Repeat for objects 1-9
  COPYOF 1
  COPYFO 211
  ; ... etc for all inventory objects
  MESSAGE "Inventory saved."
DONE

; Restore inventory from backup
VERB "loadinv"
THEN
  COPYFF 210     ; Get backup location
  PLACE 0        ; Restore object 0 location
  COPYFF 211
  PLACE 1
  ; ... etc for all objects
  MESSAGE "Inventory restored."
DONE`,
                            category: "advanced",
                            icon: "🎒",
                            effect: "Saves and restores inventory state only"
                        },
                        FLAG_SNAPSHOT: {
                            name: "Flag State Snapshot",
                            description: "Backs up important flags to other flag slots. Useful for saving puzzle state, character stats, or quest progress separately from full game state.",
                            examples: [
                                "Save quest flags before branching choice",
                                "Backup character stats before combat",
                                "Preserve puzzle state for retry"
                            ],
                            useCases: [
                                "Quest state management",
                                "Character stat preservation",
                                "Puzzle state backup",
                                "Granular state control",
                                "Partial game resets"
                            ],
                            daadCode: `; Save important flags (0-9) to backup (240-249)
VERB "saveflags"
THEN
  COPYFF 0       ; Copy flag 0 value
  COPYFO 240     ; To backup flag 240
  COPYFF 1
  COPYFO 241
  ; ... repeat for all important flags
  MESSAGE "Flags saved."
DONE

; Restore important flags
VERB "loadflags"
THEN
  COPYFF 240     ; Get backup
  COPYFO 0       ; Restore to original
  COPYFF 241
  COPYFO 1
  ; ... repeat for all flags
  MESSAGE "Flags restored."
DONE`,
                            category: "advanced",
                            icon: "🏁",
                            effect: "Saves and restores specific flag values"
                        }
                    }
                },

                undo_patterns: {
                    title: "↩️ Undo System Patterns",
                    description: "Implementing undo and retry mechanics",
                    icon: "↩️",
                    color: "#ef4444",
                    operations: {
                        SINGLE_UNDO: {
                            name: "Single-Step Undo",
                            description: "Simple undo system that saves state before dangerous actions and allows one-time restoration. Uses RAMSAVE before risky actions and RAMLOAD to undo.",
                            examples: [
                                "Undo last action",
                                "Retry puzzle move",
                                "Reverse bad decision"
                            ],
                            useCases: [
                                "Player-friendly puzzle design",
                                "Mistake recovery systems",
                                "Experimental gameplay support",
                                "Reduced frustration in hard puzzles",
                                "Modern adventure game UX"
                            ],
                            daadCode: `; Auto-save before any object manipulation
VERB "get"
NOUN _
THEN
  RAMSAVE        ; Save state before action
  ; ... normal GET logic here
DONE

VERB "drop"
NOUN _
THEN
  RAMSAVE        ; Save state before action
  ; ... normal DROP logic here
DONE

; Undo command
VERB "undo"
THEN
  RAMLOAD        ; Restore previous state
  MESSAGE "Action undone."
DONE`,
                            category: "intermediate",
                            icon: "↩️",
                            effect: "Allows undoing last action"
                        },
                        PUZZLE_RETRY: {
                            name: "Puzzle Retry System",
                            description: "Saves state at puzzle start and allows unlimited retries. Players can reset the puzzle without affecting overall game progress.",
                            examples: [
                                "Reset sliding tile puzzle",
                                "Retry combination lock",
                                "Restart maze from entrance"
                            ],
                            useCases: [
                                "Difficult puzzle accessibility",
                                "Non-punishing puzzle design",
                                "Learning-based puzzles",
                                "Trial and error gameplay",
                                "Puzzle experimentation"
                            ],
                            daadCode: `; Save at puzzle entrance
AT 30            ; Puzzle room entrance
THEN
  SET 220 1        ; Mark puzzle active
  RAMSAVE          ; Save clean state
  MESSAGE "Puzzle started. Type RETRY to reset."
DONE

; Retry command
VERB "retry"
EQ 220 1         ; In active puzzle
THEN
  RAMLOAD          ; Restore to puzzle start
  MESSAGE "Puzzle reset."
DONE

; Clear puzzle flag when complete
; (add to puzzle success condition)
THEN
  CLEAR 220        ; Puzzle no longer active
  ; ... reward logic
DONE`,
                            category: "intermediate",
                            icon: "🔄",
                            effect: "Allows resetting puzzle to start state"
                        }
                    }
                }
            };
        },

        // UI Event Handlers
        setViewMode: function(mode) {
            const state = AdventureCreator.state.saveLoadSystems;
            state.viewMode = mode;
            // Reset to first category of new mode
            const categories = mode === 'condacts' ? this.getCondactDefinitions() : this.getPatternDefinitions();
            state.selectedCategory = Object.keys(categories)[0];
            state.selectedOperation = null;
            AdventureCreator.navigate('editor');
        },

        selectCategory: function(categoryKey) {
            AdventureCreator.state.saveLoadSystems.selectedCategory = categoryKey;
            AdventureCreator.state.saveLoadSystems.selectedOperation = null;
            AdventureCreator.navigate('editor');
        },

        selectOperation: function(operationKey) {
            const state = AdventureCreator.state.saveLoadSystems;
            state.selectedOperation = state.selectedOperation === operationKey ? null : operationKey;
            AdventureCreator.navigate('editor');
        },

        toggleExplanations: function() {
            AdventureCreator.state.saveLoadSystems.showExplanations = !AdventureCreator.state.saveLoadSystems.showExplanations;
            AdventureCreator.navigate('editor');
        },

        updateSearchFilter: function(value) {
            AdventureCreator.state.saveLoadSystems.searchFilter = value;
            AdventureCreator.navigate('editor');
        },

        addToRule: function(operationKey, type) {
            const state = AdventureCreator.state.saveLoadSystems;
            const categories = state.viewMode === 'condacts' ? this.getCondactDefinitions() : this.getPatternDefinitions();

            let operation = null;
            for (const category of Object.values(categories)) {
                if (category.operations[operationKey]) {
                    operation = category.operations[operationKey];
                    break;
                }
            }

            if (!operation) return;

            // Add to current rule being built
            const rule = {
                type: type,
                operation: operationKey,
                name: operation.name,
                code: operation.daadCode,
                parameters: operation.parameters || []
            };

            if (type === 'action') {
                state.currentRule.actions.push(rule);
            }

            // Show success message
            this.showNotification(`Added "${operation.name}" to current rule`, 'success');
        },

        copyCode: function(operationKey) {
            const state = AdventureCreator.state.saveLoadSystems;
            const categories = state.viewMode === 'condacts' ? this.getCondactDefinitions() : this.getPatternDefinitions();

            let operation = null;
            for (const category of Object.values(categories)) {
                if (category.operations[operationKey]) {
                    operation = category.operations[operationKey];
                    break;
                }
            }

            if (!operation) return;

            // Copy to clipboard
            const code = operation.daadCode;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(() => {
                    this.showNotification('Code copied to clipboard!', 'success');
                }).catch(() => {
                    this.fallbackCopy(code);
                });
            } else {
                this.fallbackCopy(code);
            }
        },

        fallbackCopy: function(text) {
            // Fallback copy method
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showNotification('Code copied!', 'success');
            } catch (err) {
                this.showNotification('Failed to copy code', 'error');
            }
            document.body.removeChild(textArea);
        },

        showNotification: function(message, type = 'info') {
            // Simple notification system
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                border-radius: 0.5rem;
                z-index: 10000;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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

        // Export functionality for integration with other modules
        getOperationByKey: function(operationKey) {
            const condacts = this.getCondactDefinitions();
            const patterns = this.getPatternDefinitions();

            for (const category of Object.values(condacts)) {
                if (category.operations[operationKey]) {
                    return category.operations[operationKey];
                }
            }

            for (const category of Object.values(patterns)) {
                if (category.operations[operationKey]) {
                    return category.operations[operationKey];
                }
            }

            return null;
        },

        getAllOperations: function() {
            const condacts = this.getCondactDefinitions();
            const patterns = this.getPatternDefinitions();
            const allOps = {};

            Object.values(condacts).forEach(category => {
                Object.assign(allOps, category.operations);
            });

            Object.values(patterns).forEach(category => {
                Object.assign(allOps, category.operations);
            });

            return allOps;
        }
    });

    console.log('✅ DAAD Save/Load Systems module loaded successfully');
})();
