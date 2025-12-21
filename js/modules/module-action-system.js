// Complete DAAD Actions System
(function() {
    'use strict';

    console.log('DAAD Actions System module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Actions System module requires the Adventure Creator framework.');
        return;
    }

    AdventureCreator.registerModule('action-system', {
        name: 'Action System',
        version: '1.0.0',
        description: 'Complete DAAD Actions System with professional UI and persistence',
        category: 'Core Systems',
        author: 'DAAD Adventure Creator',

        init: function() {
            console.log('Actions System module initialized');
            this.initializeState();
            this.loadFromStorage();
            this.setupKeyboardShortcuts();
        },

        initializeState: function() {
            if (!AdventureCreator.state.actionSystem) {
                AdventureCreator.state.actionSystem = {
                    currentRuleActions: [],
                    favoriteActions: new Set(),
                    recentActions: [],
                    savedTemplates: [],
                    searchFilter: '',
                    expandedCategories: new Set()
                };
            }
            // Maintain backward compatibility
            if (!AdventureCreator.state.currentRuleActions) {
                AdventureCreator.state.currentRuleActions = [];
            }
        },

        setupKeyboardShortcuts: function() {
            document.addEventListener('keydown', (e) => {
                if (!document.querySelector('.actions-builder')) return;

                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveToStorage();
                    this.showNotification('Actions saved successfully', 'success');
                }
                if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault();
                    const searchInput = document.querySelector('.action-search-input');
                    if (searchInput) searchInput.focus();
                }
                if (e.key === 'Escape') {
                    const modal = document.querySelector('.action-modal');
                    if (modal) modal.remove();
                }
            });
        },

        saveToStorage: function() {
            try {
                const state = AdventureCreator.state.actionSystem;
                const toSave = {
                    ...state,
                    favoriteActions: Array.from(state.favoriteActions),
                    expandedCategories: Array.from(state.expandedCategories)
                };
                localStorage.setItem('actionSystem_state', JSON.stringify(toSave));

                // Also save current rule actions
                localStorage.setItem('currentRuleActions', JSON.stringify(AdventureCreator.state.currentRuleActions || []));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                this.showNotification('Failed to save actions', 'error');
            }
        },

        loadFromStorage: function() {
            try {
                const saved = localStorage.getItem('actionSystem_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const state = AdventureCreator.state.actionSystem;

                    Object.assign(state, parsed);
                    state.favoriteActions = new Set(parsed.favoriteActions || []);
                    state.expandedCategories = new Set(parsed.expandedCategories || []);
                }

                // Load current rule actions
                const savedActions = localStorage.getItem('currentRuleActions');
                if (savedActions) {
                    AdventureCreator.state.currentRuleActions = JSON.parse(savedActions);
                    AdventureCreator.state.actionSystem.currentRuleActions = AdventureCreator.state.currentRuleActions;
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        render: function() {
            const game = AdventureCreator.getCurrentGame();
            return this.renderCompleteActionsBuilder(game);
        },

        // Complete action definitions with explanations
        getActionDefinitions: function() {
            return {
                // Movement & Location Actions
                movement_actions: {
                    title: "🚶 Movement & Location Actions",
                    description: "Move the player and objects around your world",
                    actions: {
                        GOTO: {
                            name: "Move player to location",
                            description: "Instantly transports the player to the specified room or location. The most common way to change the player's position in response to actions.",
                            parameters: [{ name: "location", type: "location", description: "Which room to move the player to" }],
                            examples: ["Player enters the secret passage", "Teleport to the wizard's tower", "Fall down the trap door"],
                            daadCode: "GOTO {location}",
                            category: "basic",
                            icon: "🚪"
                        },
                        AUTOG: {
                            name: "Auto-move using flag 38",
                            description: "Moves the player to whatever location is stored in flag 38. Useful for dynamic destinations or calculated movement.",
                            parameters: [],
                            examples: ["Move to previously saved location", "Dynamic teleportation", "Calculated destination"],
                            daadCode: "AUTOG",
                            category: "advanced",
                            icon: "🔄"
                        }
                    }
                },

                // Object Manipulation Actions
                object_actions: {
                    title: "📦 Object & Item Actions",
                    description: "Create, destroy, move, and manipulate objects in your game",
                    actions: {
                        GET: {
                            name: "Give object to player",
                            description: "Puts the specified object into the player's inventory. The object becomes something the player is carrying around.",
                            parameters: [{ name: "object", type: "object", description: "Which object the player should pick up" }],
                            examples: ["Player picks up the golden key", "Take the magic sword", "Collect the treasure"],
                            daadCode: "GET {object}",
                            category: "basic",
                            icon: "👋"
                        },
                        DROP: {
                            name: "Player drops object",
                            description: "Removes the object from the player's inventory and places it in the current room. The opposite of GET.",
                            parameters: [{ name: "object", type: "object", description: "Which object to drop from inventory" }],
                            examples: ["Drop the heavy rock", "Leave the torch here", "Put down the fragile vase"],
                            daadCode: "DROP {object}",
                            category: "basic",
                            icon: "👇"
                        },
                        WEAR: {
                            name: "Player wears object",
                            description: "The player puts on the specified object (clothes, armor, jewelry). The object must be wearable and in inventory.",
                            parameters: [{ name: "object", type: "object", description: "Which wearable object to put on" }],
                            examples: ["Put on the magic cloak", "Wear the protective helmet", "Don the royal crown"],
                            daadCode: "WEAR {object}",
                            category: "intermediate",
                            icon: "👕"
                        },
                        REMOVE: {
                            name: "Player removes worn object",
                            description: "The player takes off the specified object that they're currently wearing. Object goes back to inventory.",
                            parameters: [{ name: "object", type: "object", description: "Which worn object to take off" }],
                            examples: ["Remove the heavy armor", "Take off the disguise", "Doff the wizard's hat"],
                            daadCode: "REMOVE {object}",
                            category: "intermediate",
                            icon: "👔"
                        },
                        CREATE: {
                            name: "Create object in game",
                            description: "Brings an object into existence. The object appears at location 253 (limbo) - use PLACE or PUTO to position it.",
                            parameters: [{ name: "object", type: "object", description: "Which object to create" }],
                            examples: ["Magic spell creates a bridge", "Craft a new tool", "Summon a helpful item"],
                            daadCode: "CREATE {object}",
                            category: "intermediate",
                            icon: "✨"
                        },
                        DESTROY: {
                            name: "Remove object from game",
                            description: "Completely removes an object from the game world. The object disappears forever (until CREATEd again).",
                            parameters: [{ name: "object", type: "object", description: "Which object to destroy" }],
                            examples: ["The potion dissolves", "Burn the evidence", "Magic item vanishes"],
                            daadCode: "DESTROY {object}",
                            category: "intermediate",
                            icon: "💥"
                        },
                        PLACE: {
                            name: "Put object at specific location",
                            description: "Moves an object to the specified location, regardless of where it currently is. Very useful for positioning objects.",
                            parameters: [
                                { name: "object", type: "object", description: "Which object to move" },
                                { name: "location", type: "location", description: "Where to put the object" }
                            ],
                            examples: ["Place the key in the drawer", "Move the statue to the garden", "Hide the treasure in the cave"],
                            daadCode: "PLACE {object} {location}",
                            category: "intermediate",
                            icon: "📍"
                        },
                        PUTO: {
                            name: "Put object in current room",
                            description: "Moves the specified object to whatever room the player is currently in. Quick way to bring objects to the player.",
                            parameters: [{ name: "object", type: "object", description: "Which object to bring here" }],
                            examples: ["The merchant brings out his wares", "Your companion drops their pack", "Items materialize nearby"],
                            daadCode: "PUTO {object}",
                            category: "basic",
                            icon: "📦"
                        },
                        SWAP: {
                            name: "Swap locations of two objects",
                            description: "Exchanges the positions of two objects. Whatever location object A was in, object B goes there, and vice versa.",
                            parameters: [
                                { name: "object1", type: "object", description: "First object to swap" },
                                { name: "object2", type: "object", description: "Second object to swap" }
                            ],
                            examples: ["Magic spell swaps items", "Secret mechanism exchanges objects", "Teleportation mishap"],
                            daadCode: "SWAP {object1} {object2}",
                            category: "advanced",
                            icon: "🔄"
                        }
                    }
                },

                // Flag & Memory Actions
                flag_actions: {
                    title: "🏁 Flag & Memory Actions",
                    description: "Change numbers and values stored in your game's memory",
                    actions: {
                        LET: {
                            name: "Set flag to value",
                            description: "Sets a flag to exactly the specified value. This is how you store numbers and remember game state.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to change" },
                                { name: "value", type: "number", description: "New value (0-255)" }
                            ],
                            examples: ["Remember door is unlocked (flag 50 = 1)", "Set player health to 100", "Mark quest as complete"],
                            daadCode: "LET {flag} {value}",
                            category: "basic",
                            icon: "📝"
                        },
                        SET: {
                            name: "Set flag to 1 (true)",
                            description: "Sets the specified flag to 1. Quick way to mark something as 'true' or 'on' or 'completed'.",
                            parameters: [{ name: "flag", type: "flag", description: "Which flag to set to 1" }],
                            examples: ["Mark door as unlocked", "Remember player visited here", "Enable special feature"],
                            daadCode: "SET {flag}",
                            category: "basic",
                            icon: "✅"
                        },
                        CLEAR: {
                            name: "Set flag to 0 (false)",
                            description: "Sets the specified flag to 0. Quick way to mark something as 'false' or 'off' or 'not done'.",
                            parameters: [{ name: "flag", type: "flag", description: "Which flag to set to 0" }],
                            examples: ["Lock the door again", "Disable magical effect", "Reset completion status"],
                            daadCode: "CLEAR {flag}",
                            category: "basic",
                            icon: "❌"
                        },
                        ADD: {
                            name: "Add to flag value",
                            description: "Increases the flag's current value by the specified amount. Great for counters, scores, and accumulating values.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to increase" },
                                { name: "amount", type: "number", description: "How much to add" }
                            ],
                            examples: ["Add 10 points to score", "Increase player health by 5", "Count another attempt"],
                            daadCode: "ADD {flag} {amount}",
                            category: "basic",
                            icon: "➕"
                        },
                        SUB: {
                            name: "Subtract from flag value",
                            description: "Decreases the flag's current value by the specified amount. Perfect for reducing counters, health, resources.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to decrease" },
                                { name: "amount", type: "number", description: "How much to subtract" }
                            ],
                            examples: ["Lose 5 health points", "Spend 20 coins", "Reduce attempts remaining"],
                            daadCode: "SUB {flag} {amount}",
                            category: "basic",
                            icon: "➖"
                        },
                        INCR: {
                            name: "Increase flag by 1",
                            description: "Adds 1 to the flag's current value. Quick way to count things or advance step-by-step processes.",
                            parameters: [{ name: "flag", type: "flag", description: "Which flag to increment" }],
                            examples: ["Count another visit", "Next step in sequence", "Add one to total"],
                            daadCode: "INCR {flag}",
                            category: "basic",
                            icon: "🔢"
                        },
                        DECR: {
                            name: "Decrease flag by 1",
                            description: "Subtracts 1 from the flag's current value. Useful for countdowns, lives remaining, attempts left.",
                            parameters: [{ name: "flag", type: "flag", description: "Which flag to decrement" }],
                            examples: ["One less life", "Countdown timer", "Fewer attempts remaining"],
                            daadCode: "DECR {flag}",
                            category: "basic",
                            icon: "🔽"
                        }
                    }
                },

                // Display & Communication Actions
                display_actions: {
                    title: "💬 Display & Communication Actions",
                    description: "Show text, messages, and information to the player",
                    actions: {
                        MESSAGE: {
                            name: "Show custom message",
                            description: "Displays any text message to the player. This is how you communicate with the player and tell the story.",
                            parameters: [{ name: "text", type: "text", description: "The message to show the player" }],
                            examples: ["'You hear a strange noise in the distance'", "'The door creaks open slowly'", "'Congratulations! You solved it!'"],
                            daadCode: 'MESSAGE "{text}"',
                            category: "basic",
                            icon: "💬"
                        },
                        DESC: {
                            name: "Show current location description",
                            description: "Displays the description of the room the player is currently in. Like 'LOOK' command output.",
                            parameters: [],
                            examples: ["Refresh the room view", "Show location after changes", "Update scene description"],
                            daadCode: "DESC",
                            category: "basic",
                            icon: "👁️"
                        },
                        OK: {
                            name: "Show 'OK' message",
                            description: "Displays the standard 'OK.' response. Quick way to acknowledge successful actions.",
                            parameters: [],
                            examples: ["Confirm action completed", "Simple acknowledgment", "Standard success response"],
                            daadCode: "OK",
                            category: "basic",
                            icon: "✅"
                        },
                        NEWLINE: {
                            name: "Print blank line",
                            description: "Adds a blank line to the display. Helps format text output and create visual spacing.",
                            parameters: [],
                            examples: ["Add space between paragraphs", "Format message display", "Create visual breaks"],
                            daadCode: "NEWLINE",
                            category: "intermediate",
                            icon: "📄"
                        }
                    }
                },

                // Game Control Actions
                control_actions: {
                    title: "🎮 Game Control Actions",
                    description: "Control the flow and state of your adventure game",
                    actions: {
                        DONE: {
                            name: "End rule successfully",
                            description: "Ends the current rule and indicates success. The parser stops looking for more rules to match this input.",
                            parameters: [],
                            examples: ["Action completed successfully", "Rule handled the command", "Stop processing more rules"],
                            daadCode: "DONE",
                            category: "basic",
                            icon: "✅"
                        },
                        END: {
                            name: "End game (victory)",
                            description: "Ends the entire game with a victory message. The ultimate goal achievement - player wins!",
                            parameters: [],
                            examples: ["Player completes the quest", "Final victory achieved", "Adventure successfully completed"],
                            daadCode: "END",
                            category: "basic",
                            icon: "🏆"
                        },
                        SAVE: {
                            name: "Save game to disk",
                            description: "Allows the player to save their current progress to a file. Essential for longer adventures.",
                            parameters: [],
                            examples: ["Player saves progress", "Checkpoint save", "Before dangerous action"],
                            daadCode: "SAVE",
                            category: "basic",
                            icon: "💾"
                        },
                        LOAD: {
                            name: "Load saved game",
                            description: "Allows the player to restore a previously saved game state. Returns to where they saved.",
                            parameters: [],
                            examples: ["Restore saved progress", "Continue from checkpoint", "Reload after mistake"],
                            daadCode: "LOAD",
                            category: "basic",
                            icon: "📂"
                        }
                    }
                },

                // Inventory & Listing Actions
                inventory_actions: {
                    title: "📋 Inventory & Listing Actions",
                    description: "Show lists of objects and inventory contents",
                    actions: {
                        INVEN: {
                            name: "Show player inventory",
                            description: "Lists all objects the player is currently carrying. Shows what's in their pockets/backpack.",
                            parameters: [],
                            examples: ["'You are carrying: sword, key, map'", "Check inventory contents", "Show possessed items"],
                            daadCode: "INVEN",
                            category: "basic",
                            icon: "🎒"
                        },
                        LISTOBJ: {
                            name: "List objects in current room",
                            description: "Shows all objects in the room where the player currently is. Quick way to see what's here.",
                            parameters: [],
                            examples: ["'You can see: table, book, candle'", "Show room contents", "List visible items"],
                            daadCode: "LISTOBJ",
                            category: "basic",
                            icon: "👁️"
                        }
                    }
                },

                // Advanced & System Actions
                advanced_actions: {
                    title: "🔧 Advanced & System Actions",
                    description: "Powerful features for complex adventures and system control",
                    actions: {
                        RANDOM: {
                            name: "Generate random number",
                            description: "Sets a flag to a random value between 0 and the specified maximum. Creates unpredictable events.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to store the random number in" },
                                { name: "max_value", type: "number", description: "Maximum possible value (0 to this number)" }
                            ],
                            examples: ["Random encounter type", "Dice roll simulation", "Variable event outcomes"],
                            daadCode: "RANDOM {flag} {max_value}",
                            category: "intermediate",
                            icon: "🎲"
                        }
                    }
                }
            };
        },

        // Render the complete actions builder
        renderCompleteActionsBuilder: function(game) {
            const actions = this.getActionDefinitions();
            const currentActions = this.getCurrentActions();
            const state = AdventureCreator.state.actionSystem;

            return `
                <div class="actions-builder">
                    <div class="builder-header">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <h4 style="margin: 0; color: #3b82f6;">THEN Actions Builder</h4>
                                <div style="color: #666; font-size: 0.875rem;">
                                    Actions happen in the order you add them
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="AdventureCreator.modules['action-system'].showTemplatesModal()" class="btn-small btn-add">
                                    💾 Templates
                                </button>
                                <button onclick="AdventureCreator.modules['action-system'].showHelpModal()" class="btn-small btn-edit">
                                    ❓ Help (F1)
                                </button>
                            </div>
                        </div>

                        <div style="position: relative; margin-bottom: 1rem;">
                            <input type="text"
                                   class="action-search-input"
                                   placeholder="Search actions... (Ctrl+F)"
                                   value="${this.escapeHtml(state.searchFilter)}"
                                   onkeyup="AdventureCreator.modules['action-system'].updateSearchFilter(this.value)"
                                   style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white; font-size: 0.875rem;">
                            <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #666;">🔍</span>
                        </div>
                    </div>

                    <div class="current-actions">
                        <h5 style="color: #ccc; margin-bottom: 1rem;">Current Actions:</h5>
                        ${this.renderCurrentActions(currentActions)}
                    </div>

                    <div class="add-action-section">
                        <h5 style="color: #ccc; margin-bottom: 1rem;">Add New Action:</h5>
                        ${this.renderActionCategories(actions, state)}
                    </div>

                    <div class="action-preview">
                        <h5 style="color: #ccc; margin-bottom: 1rem;">Generated Code Preview:</h5>
                        <div class="code-preview">
                            ${this.generateActionsCode(currentActions)}
                        </div>
                    </div>
                </div>

                ${this.renderStyles()}
            `;
        },

        renderStyles: function() {
            return `
                <style>
                    .actions-builder {
                        background: #1a1a1a;
                        border-radius: 12px;
                        padding: 2rem;
                        margin-bottom: 2rem;
                    }

                    .builder-header {
                        margin-bottom: 2rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid #333;
                    }

                    .current-actions {
                        margin-bottom: 2rem;
                    }

                    .action-item {
                        background: #0a0a0a;
                        border: 1px solid #333;
                        border-radius: 8px;
                        padding: 1rem;
                        margin-bottom: 0.75rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        position: relative;
                    }

                    .action-item::before {
                        content: attr(data-order);
                        position: absolute;
                        left: -10px;
                        top: -10px;
                        background: #3b82f6;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.75rem;
                        font-weight: 600;
                    }

                    .action-description {
                        flex: 1;
                    }

                    .action-name {
                        font-weight: 600;
                        color: #fff;
                        margin-bottom: 0.25rem;
                    }

                    .action-details {
                        font-size: 0.875rem;
                        color: #999;
                    }

                    .action-icon {
                        font-size: 1.5rem;
                        margin-right: 1rem;
                        opacity: 0.7;
                    }

                    .action-actions {
                        display: flex;
                        gap: 0.5rem;
                    }

                    .category-section {
                        background: #0a0a0a;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                        overflow: hidden;
                    }

                    .category-header {
                        background: #333;
                        padding: 1rem;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        transition: background 0.2s;
                    }

                    .category-header:hover {
                        background: #444;
                    }

                    .category-header.expanded {
                        background: #3b82f6;
                    }

                    .category-title {
                        font-weight: 600;
                        color: #fff;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    }

                    .category-description {
                        font-size: 0.875rem;
                        color: #ccc;
                        margin-top: 0.25rem;
                    }

                    .category-content {
                        padding: 0;
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.3s, padding 0.3s;
                    }

                    .category-content.expanded {
                        max-height: 2000px;
                        padding: 1rem;
                    }

                    .action-option {
                        background: #1a1a1a;
                        border: 1px solid #333;
                        border-radius: 6px;
                        padding: 1rem;
                        margin-bottom: 0.75rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: flex-start;
                        gap: 1rem;
                        position: relative;
                    }

                    .action-option:hover {
                        border-color: #3b82f6;
                        background: rgba(59, 130, 246, 0.1);
                    }

                    .action-option:last-child {
                        margin-bottom: 0;
                    }

                    .action-option.is-favorite {
                        border-color: #f59e0b;
                    }

                    .favorite-star {
                        position: absolute;
                        top: 0.75rem;
                        right: 0.75rem;
                        font-size: 1.25rem;
                        cursor: pointer;
                        z-index: 10;
                    }

                    .option-icon {
                        font-size: 1.5rem;
                        margin-top: 0.25rem;
                    }

                    .option-content {
                        flex: 1;
                        padding-right: 2rem;
                    }

                    .option-name {
                        font-weight: 600;
                        color: #fff;
                        margin-bottom: 0.5rem;
                    }

                    .option-description {
                        font-size: 0.875rem;
                        color: #ccc;
                        line-height: 1.4;
                        margin-bottom: 0.75rem;
                    }

                    .option-examples {
                        font-size: 0.75rem;
                        color: #3b82f6;
                        font-style: italic;
                    }

                    .option-complexity {
                        display: inline-block;
                        padding: 0.25rem 0.5rem;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
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

                    .parameter-builder {
                        background: #1a1a1a;
                        border-radius: 8px;
                        padding: 1.5rem;
                        margin-top: 1rem;
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

                    .btn-delete {
                        background: #dc2626;
                        color: white;
                    }

                    .btn-delete:hover {
                        background: #b91c1c;
                    }

                    .btn-add {
                        background: #3b82f6;
                        color: white;
                    }

                    .btn-add:hover {
                        background: #2563eb;
                    }

                    .btn-move {
                        background: #6b7280;
                        color: white;
                        padding: 0.25rem 0.5rem;
                        font-size: 0.75rem;
                    }

                    .btn-move:hover {
                        background: #4b5563;
                    }

                    .code-preview {
                        background: #0a0a0a;
                        border: 1px solid #333;
                        border-radius: 6px;
                        padding: 1rem;
                        font-family: 'Courier New', monospace;
                        font-size: 0.875rem;
                        color: #3b82f6;
                        white-space: pre-wrap;
                        min-height: 60px;
                    }

                    .empty-state {
                        text-align: center;
                        padding: 2rem;
                        color: #666;
                        border: 2px dashed #333;
                        border-radius: 8px;
                    }

                    .expand-icon {
                        transition: transform 0.3s;
                    }

                    .expand-icon.expanded {
                        transform: rotate(180deg);
                    }

                    .action-sequence-hint {
                        background: #1e3a8a;
                        border-left: 4px solid #3b82f6;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border-radius: 0 6px 6px 0;
                    }

                    .action-modal {
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
                </style>
            `;
        },

        renderActionCategories: function(actions, state) {
            const filteredActions = this.filterActionsBySearch(actions, state.searchFilter);

            return Object.entries(filteredActions).map(([key, category]) => {
                const isExpanded = state.expandedCategories.has(key);
                return `
                    <div class="category-section">
                        <div class="category-header ${isExpanded ? 'expanded' : ''}" onclick="AdventureCreator.modules['action-system'].toggleCategory('${key}')">
                            <div>
                                <div class="category-title">
                                    ${category.title}
                                </div>
                                <div class="category-description">
                                    ${category.description}
                                </div>
                            </div>
                            <span class="expand-icon ${isExpanded ? 'expanded' : ''}">▼</span>
                        </div>
                        <div class="category-content ${isExpanded ? 'expanded' : ''}" id="action-category-${key}">
                            ${this.renderCategoryActions(category.actions, key)}
                        </div>
                    </div>
                `;
            }).join('');
        },

        renderCategoryActions: function(actions, categoryKey) {
            const state = AdventureCreator.state.actionSystem;

            return Object.entries(actions).map(([key, action]) => {
                const actionId = `${categoryKey}_${key}`;
                const isFavorite = state.favoriteActions.has(actionId);

                return `
                    <div class="action-option ${isFavorite ? 'is-favorite' : ''}" onclick="AdventureCreator.modules['action-system'].selectAction('${key}', '${categoryKey}')">
                        <span class="favorite-star" onclick="event.stopPropagation(); AdventureCreator.modules['action-system'].toggleFavorite('${actionId}')">${isFavorite ? '⭐' : '☆'}</span>
                        <div class="option-icon">${action.icon}</div>
                        <div class="option-content">
                            <div class="option-complexity complexity-${action.category}">
                                ${action.category.toUpperCase()}
                            </div>
                            <div class="option-name">${this.escapeHtml(action.name)}</div>
                            <div class="option-description">${this.escapeHtml(action.description)}</div>
                            <div class="option-examples">
                                Examples: ${action.examples.map(ex => this.escapeHtml(ex)).join(' • ')}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        },

        renderCurrentActions: function(actions) {
            if (!actions || actions.length === 0) {
                return `
                    <div class="empty-state">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⚡</div>
                        <p>No actions set</p>
                        <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                            Nothing will happen when this rule triggers.<br>
                            Add actions to make things happen in your adventure!
                        </p>
                    </div>
                `;
            }

            return `
                <div class="action-sequence-hint">
                    💡 <strong>Action Order:</strong> Actions execute in the order shown below.
                    Use the ↑↓ buttons to reorder them if needed.
                </div>
                ${actions.map((action, index) => `
                    <div class="action-item" data-order="${index + 1}">
                        <div class="action-icon">${action.icon}</div>
                        <div class="action-description">
                            <div class="action-name">${this.escapeHtml(action.name)}</div>
                            <div class="action-details">${this.escapeHtml(action.description)}</div>
                        </div>
                        <div class="action-actions">
                            ${index > 0 ? `<button class="btn-small btn-move" onclick="AdventureCreator.modules['action-system'].moveAction(${index}, ${index - 1})">↑</button>` : ''}
                            ${index < actions.length - 1 ? `<button class="btn-small btn-move" onclick="AdventureCreator.modules['action-system'].moveAction(${index}, ${index + 1})">↓</button>` : ''}
                            <button class="btn-small btn-edit" onclick="AdventureCreator.modules['action-system'].editAction(${index})">
                                ✏️ Edit
                            </button>
                            <button class="btn-small btn-delete" onclick="AdventureCreator.modules['action-system'].removeAction(${index})">
                                🗑️ Remove
                            </button>
                        </div>
                    </div>
                `).join('')}
            `;
        },

        generateActionsCode: function(actions) {
            if (!actions || actions.length === 0) {
                return '// No actions - nothing will happen';
            }

            return actions.map(action => action.daadCode).join('\n') + '\nDONE';
        },

        // UI State Management
        getCurrentActions: function() {
            return AdventureCreator.state.currentRuleActions || [];
        },

        // UI Actions
        toggleCategory: function(categoryKey) {
            try {
                const state = AdventureCreator.state.actionSystem;

                if (state.expandedCategories.has(categoryKey)) {
                    state.expandedCategories.delete(categoryKey);
                } else {
                    state.expandedCategories.add(categoryKey);
                }

                this.saveToStorage();
                this.refreshActionsBuilder();
            } catch (error) {
                console.error('Error toggling category:', error);
                this.showNotification('Failed to toggle category', 'error');
            }
        },

        toggleFavorite: function(actionId) {
            try {
                const state = AdventureCreator.state.actionSystem;

                if (state.favoriteActions.has(actionId)) {
                    state.favoriteActions.delete(actionId);
                    this.showNotification('Removed from favorites', 'info');
                } else {
                    state.favoriteActions.add(actionId);
                    this.showNotification('Added to favorites', 'success');
                }

                this.saveToStorage();
                this.refreshActionsBuilder();
            } catch (error) {
                console.error('Error toggling favorite:', error);
                this.showNotification('Failed to toggle favorite', 'error');
            }
        },

        updateSearchFilter: function(value) {
            try {
                AdventureCreator.state.actionSystem.searchFilter = value;
                this.refreshActionsBuilder();
            } catch (error) {
                console.error('Error updating search filter:', error);
            }
        },

        filterActionsBySearch: function(actions, filter) {
            if (!filter) return actions;

            const filtered = {};
            const lowerFilter = filter.toLowerCase();

            Object.entries(actions).forEach(([catKey, category]) => {
                const filteredActs = {};
                let hasMatches = false;

                Object.entries(category.actions).forEach(([actKey, act]) => {
                    if (act.name.toLowerCase().includes(lowerFilter) ||
                        act.description.toLowerCase().includes(lowerFilter) ||
                        act.daadCode.toLowerCase().includes(lowerFilter) ||
                        act.examples.some(ex => ex.toLowerCase().includes(lowerFilter))) {
                        filteredActs[actKey] = act;
                        hasMatches = true;
                    }
                });

                if (hasMatches) {
                    filtered[catKey] = {
                        ...category,
                        actions: filteredActs
                    };
                }
            });

            return filtered;
        },

        selectAction: function(actionKey, categoryKey) {
            try {
                const actions = this.getActionDefinitions();
                const selectedAction = actions[categoryKey]?.actions[actionKey];

                if (selectedAction) {
                    this.showActionParameterBuilder({
                        key: actionKey,
                        categoryKey: categoryKey,
                        ...selectedAction
                    });
                }
            } catch (error) {
                console.error('Error selecting action:', error);
                this.showNotification('Failed to select action', 'error');
            }
        },

        showActionParameterBuilder: function(action) {
            try {
                const modal = document.createElement('div');
                modal.className = 'action-modal';
                modal.innerHTML = `
                    <div class="modal-overlay" onclick="this.parentElement.remove()">
                        <div class="modal-content" onclick="event.stopPropagation()">
                            <div class="modal-header">
                                <h4 style="color: #fff; margin: 0;">${action.icon} Configure Action: ${this.escapeHtml(action.name)}</h4>
                                <button onclick="this.closest('.action-modal').remove()" style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                            </div>

                            <div class="modal-body">
                                <p style="color: #ccc; margin-bottom: 1.5rem;">${this.escapeHtml(action.description)}</p>

                                ${action.parameters && action.parameters.length > 0 ? `
                                    <div class="parameter-builder">
                                        ${action.parameters.map((param, index) => `
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
                                        ✅ This action requires no parameters - it's ready to use!
                                    </div>
                                `}

                                <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                                    <strong>Examples:</strong>
                                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #ccc;">
                                        ${action.examples.map(example => `<li>${this.escapeHtml(example)}</li>`).join('')}
                                    </ul>
                                </div>

                                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                                    <button class="btn-small btn-edit" onclick="this.closest('.action-modal').remove()">Cancel</button>
                                    <button class="btn-small btn-add" onclick="AdventureCreator.modules['action-system'].addActionToRule('${action.key}', '${action.categoryKey || ''}')">Add Action</button>
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
                    case 'location':
                        const locations = game?.daad?.locations || [];
                        return `
                            <select class="parameter-input" data-param-index="${index}">
                                <option value="">Choose location...</option>
                                ${locations.map((loc, idx) => `
                                    <option value="${idx}">${this.escapeHtml(loc.name || `Location ${idx}`)}</option>
                                `).join('')}
                            </select>
                        `;

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

                    case 'flag':
                        return `
                            <input type="number" class="parameter-input" data-param-index="${index}" min="0" max="255" placeholder="Flag number (0-255)">
                        `;

                    case 'number':
                        return `
                            <input type="number" class="parameter-input" data-param-index="${index}" min="0" max="255" placeholder="Enter number (0-255)">
                        `;

                    case 'text':
                        return `
                            <textarea class="parameter-input" data-param-index="${index}" placeholder="Enter your message text here..." rows="3"></textarea>
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

        addActionToRule: function(actionKey, categoryKey) {
            try {
                const modal = document.querySelector('.action-modal');
                const inputs = modal.querySelectorAll('.parameter-input');
                const values = Array.from(inputs).map(input => input.value);

                if (!AdventureCreator.state.currentRuleActions) {
                    AdventureCreator.state.currentRuleActions = [];
                }

                const actionDef = this.findActionDefinition(actionKey, categoryKey);
                const newAction = {
                    key: actionKey,
                    categoryKey: categoryKey,
                    name: actionDef.name,
                    description: this.buildActionDescription(actionDef, values),
                    daadCode: this.buildActionCode(actionDef, values),
                    parameters: values,
                    icon: actionDef.icon
                };

                AdventureCreator.state.currentRuleActions.push(newAction);
                AdventureCreator.state.actionSystem.currentRuleActions = AdventureCreator.state.currentRuleActions;

                // Track recent actions
                const actionId = `${categoryKey}_${actionKey}`;
                const state = AdventureCreator.state.actionSystem;
                if (!state.recentActions.includes(actionId)) {
                    state.recentActions.unshift(actionId);
                    if (state.recentActions.length > 10) {
                        state.recentActions.pop();
                    }
                }

                this.saveToStorage();
                modal.remove();
                this.showNotification('Action added successfully', 'success');
                this.refreshActionsBuilder();
            } catch (error) {
                console.error('Error adding action to rule:', error);
                this.showNotification('Failed to add action', 'error');
            }
        },

        findActionDefinition: function(actionKey, categoryKey) {
            try {
                const actions = this.getActionDefinitions();

                if (categoryKey && actions[categoryKey]?.actions[actionKey]) {
                    return actions[categoryKey].actions[actionKey];
                }

                // Fallback: search all categories
                for (const category of Object.values(actions)) {
                    if (category.actions[actionKey]) {
                        return category.actions[actionKey];
                    }
                }
                return null;
            } catch (error) {
                console.error('Error finding action definition:', error);
                return null;
            }
        },

        buildActionDescription: function(actionDef, values) {
            let desc = actionDef.name;
            if (values.length > 0) {
                const validValues = values.filter(v => v);
                if (validValues.length > 0) {
                    desc += ` (${validValues.join(', ')})`;
                }
            }
            return desc;
        },

        buildActionCode: function(actionDef, values) {
            let code = actionDef.daadCode;
            if (actionDef.parameters) {
                actionDef.parameters.forEach((param, index) => {
                    if (values[index]) {
                        code = code.replace(`{${param.name}}`, values[index]);
                    } else {
                        code = code.replace(`{${param.name}}`, '?');
                    }
                });
            }
            return code;
        },

        refreshActionsBuilder: function() {
            try {
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error refreshing actions builder:', error);
            }
        },

        moveAction: function(fromIndex, toIndex) {
            try {
                const actions = AdventureCreator.state.currentRuleActions;
                if (!actions || fromIndex < 0 || toIndex < 0 || fromIndex >= actions.length || toIndex >= actions.length) {
                    return;
                }

                // Swap the actions
                const temp = actions[fromIndex];
                actions[fromIndex] = actions[toIndex];
                actions[toIndex] = temp;

                this.saveToStorage();
                this.refreshActionsBuilder();
            } catch (error) {
                console.error('Error moving action:', error);
                this.showNotification('Failed to move action', 'error');
            }
        },

        editAction: function(index) {
            try {
                const actions = this.getCurrentActions();
                const action = actions[index];

                if (!action) return;

                const actionDef = this.findActionDefinition(action.key, action.categoryKey);

                if (!actionDef) {
                    this.showNotification('Cannot find action definition', 'error');
                    return;
                }

                const modal = document.createElement('div');
                modal.className = 'action-modal';
                modal.innerHTML = `
                    <div class="modal-overlay" onclick="this.parentElement.remove()">
                        <div class="modal-content" onclick="event.stopPropagation()">
                            <div class="modal-header">
                                <h4 style="color: #fff; margin: 0;">${action.icon} Edit Action: ${this.escapeHtml(action.name)}</h4>
                                <button onclick="this.closest('.action-modal').remove()" style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                            </div>

                            <div class="modal-body">
                                <p style="color: #ccc; margin-bottom: 1.5rem;">${this.escapeHtml(actionDef.description)}</p>

                                ${actionDef.parameters && actionDef.parameters.length > 0 ? `
                                    <div class="parameter-builder">
                                        ${actionDef.parameters.map((param, paramIndex) => `
                                            <div class="parameter-row">
                                                <div class="parameter-label">${this.escapeHtml(param.name)}:</div>
                                                <div style="flex: 1;">
                                                    ${this.renderParameterInputWithValue(param, paramIndex, action.parameters[paramIndex])}
                                                    <div class="parameter-help">${this.escapeHtml(param.description)}</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}

                                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                                    <button class="btn-small btn-edit" onclick="this.closest('.action-modal').remove()">Cancel</button>
                                    <button class="btn-small btn-add" onclick="AdventureCreator.modules['action-system'].updateAction(${index})">Update Action</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);
            } catch (error) {
                console.error('Error editing action:', error);
                this.showNotification('Failed to edit action', 'error');
            }
        },

        renderParameterInputWithValue: function(param, index, currentValue) {
            try {
                const game = AdventureCreator.getCurrentGame();

                switch(param.type) {
                    case 'location':
                        const locations = game?.daad?.locations || [];
                        return `
                            <select class="parameter-input" data-param-index="${index}">
                                <option value="">Choose location...</option>
                                ${locations.map((loc, idx) => `
                                    <option value="${idx}" ${currentValue == idx ? 'selected' : ''}>${this.escapeHtml(loc.name || `Location ${idx}`)}</option>
                                `).join('')}
                            </select>
                        `;

                    case 'object':
                        const objects = game?.daad?.objects || [];
                        return `
                            <select class="parameter-input" data-param-index="${index}">
                                <option value="">Choose object...</option>
                                ${objects.map((obj, idx) => `
                                    <option value="${idx}" ${currentValue == idx ? 'selected' : ''}>${this.escapeHtml(obj.name || `Object ${idx}`)}</option>
                                `).join('')}
                            </select>
                        `;

                    case 'flag':
                        return `
                            <input type="number" class="parameter-input" data-param-index="${index}" min="0" max="255" value="${currentValue || ''}" placeholder="Flag number (0-255)">
                        `;

                    case 'number':
                        return `
                            <input type="number" class="parameter-input" data-param-index="${index}" min="0" max="255" value="${currentValue || ''}" placeholder="Enter number (0-255)">
                        `;

                    case 'text':
                        return `
                            <textarea class="parameter-input" data-param-index="${index}" rows="3" placeholder="Enter your message text here...">${this.escapeHtml(currentValue || '')}</textarea>
                        `;

                    default:
                        return `
                            <input type="text" class="parameter-input" data-param-index="${index}" value="${this.escapeHtml(currentValue || '')}" placeholder="Enter ${this.escapeHtml(param.name)}">
                        `;
                }
            } catch (error) {
                console.error('Error rendering parameter input with value:', error);
                return `<input type="text" class="parameter-input" data-param-index="${index}" value="${this.escapeHtml(currentValue || '')}" placeholder="Error loading input">`;
            }
        },

        updateAction: function(index) {
            try {
                const modal = document.querySelector('.action-modal');
                const inputs = modal.querySelectorAll('.parameter-input');
                const values = Array.from(inputs).map(input => input.value);

                const actions = this.getCurrentActions();
                const action = actions[index];
                const actionDef = this.findActionDefinition(action.key, action.categoryKey);

                // Update the action
                action.description = this.buildActionDescription(actionDef, values);
                action.daadCode = this.buildActionCode(actionDef, values);
                action.parameters = values;

                this.saveToStorage();
                modal.remove();
                this.showNotification('Action updated successfully', 'success');
                this.refreshActionsBuilder();
            } catch (error) {
                console.error('Error updating action:', error);
                this.showNotification('Failed to update action', 'error');
            }
        },

        removeAction: function(index) {
            try {
                const actions = this.getCurrentActions();
                const action = actions[index];

                const content = `
                    <div style="margin-bottom: 1.5rem;">
                        <p style="color: #ccc;">Are you sure you want to remove this action?</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                            <div style="color: #fff; font-weight: 600; margin-bottom: 0.5rem;">${this.escapeHtml(action.name)}</div>
                            <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(action.description)}</div>
                        </div>
                    </div>
                `;

                this.showModal(content, '🗑️ Remove Action', () => {
                    AdventureCreator.state.currentRuleActions.splice(index, 1);
                    this.saveToStorage();
                    this.closeModal();
                    this.showNotification('Action removed', 'success');
                    this.refreshActionsBuilder();
                }, 'Remove', true);
            } catch (error) {
                console.error('Error removing action:', error);
                this.showNotification('Failed to remove action', 'error');
            }
        },

        showTemplatesModal: function() {
            try {
                const state = AdventureCreator.state.actionSystem;
                const templatesList = state.savedTemplates.length > 0
                    ? state.savedTemplates.map((template, index) => `
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <div style="color: #3b82f6; font-weight: 600;">${this.escapeHtml(template.name)}</div>
                                    <div style="color: #666; font-size: 0.875rem; margin-top: 0.25rem;">${this.escapeHtml(template.description || 'No description')}</div>
                                    <div style="color: #999; font-size: 0.75rem; margin-top: 0.5rem;">${template.actions.length} actions</div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="AdventureCreator.modules['action-system'].loadTemplate(${index})" class="btn-small btn-add">
                                        Load
                                    </button>
                                    <button onclick="AdventureCreator.modules['action-system'].deleteTemplate(${index})" class="btn-small btn-delete">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')
                    : '<div style="color: #666; text-align: center; padding: 2rem;">No saved templates</div>';

                const content = `
                    <div>
                        <div style="margin-bottom: 1.5rem; max-height: 400px; overflow-y: auto;">${templatesList}</div>
                        <button onclick="AdventureCreator.modules['action-system'].showSaveTemplateModal()" class="btn-small btn-add" style="width: 100%; padding: 0.75rem; font-size: 1rem;">
                            💾 Save Current Actions as Template
                        </button>
                    </div>
                `;

                this.showModal(content, '💾 Action Templates', null, 'Close', false);
            } catch (error) {
                console.error('Error showing templates modal:', error);
                this.showNotification('Failed to show templates', 'error');
            }
        },

        showSaveTemplateModal: function() {
            this.closeModal();

            const currentActions = this.getCurrentActions();
            if (currentActions.length === 0) {
                this.showNotification('No actions to save. Add some actions first!', 'warning');
                return;
            }

            const content = `
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Template Name</label>
                    <input type="text" id="template-name" placeholder="e.g., Standard Movement"
                           style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Description</label>
                    <textarea id="template-description" placeholder="Describe this template..."
                              style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white; min-height: 80px;"></textarea>
                </div>
                <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                    <div style="color: #3b82f6; font-weight: 600; margin-bottom: 0.5rem;">Actions to save:</div>
                    <div style="color: #999; font-size: 0.875rem;">${currentActions.length} action(s)</div>
                </div>
            `;

            this.showModal(content, '💾 Save Template', () => {
                const name = document.getElementById('template-name').value;
                const description = document.getElementById('template-description').value;

                if (!name) {
                    this.showNotification('Please enter a template name', 'warning');
                    return;
                }

                const state = AdventureCreator.state.actionSystem;
                state.savedTemplates.push({
                    id: Date.now(),
                    name: name,
                    description: description,
                    actions: JSON.parse(JSON.stringify(currentActions)),
                    created: new Date().toISOString()
                });

                this.saveToStorage();
                this.closeModal();
                this.showNotification('Template saved successfully', 'success');
                this.showTemplatesModal();
            }, 'Save Template');
        },

        loadTemplate: function(index) {
            try {
                const state = AdventureCreator.state.actionSystem;
                const template = state.savedTemplates[index];

                if (!template) return;

                AdventureCreator.state.currentRuleActions = JSON.parse(JSON.stringify(template.actions));
                AdventureCreator.state.actionSystem.currentRuleActions = AdventureCreator.state.currentRuleActions;

                this.saveToStorage();
                this.closeModal();
                this.showNotification(`Loaded template: ${template.name}`, 'success');
                this.refreshActionsBuilder();
            } catch (error) {
                console.error('Error loading template:', error);
                this.showNotification('Failed to load template', 'error');
            }
        },

        deleteTemplate: function(index) {
            try {
                const state = AdventureCreator.state.actionSystem;
                const template = state.savedTemplates[index];

                const content = `
                    <div>
                        <p style="color: #ccc; margin-bottom: 1rem;">Are you sure you want to delete this template?</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                            <div style="color: #ef4444; font-weight: 600;">${this.escapeHtml(template.name)}</div>
                            <div style="color: #999; font-size: 0.875rem; margin-top: 0.25rem;">${this.escapeHtml(template.description || 'No description')}</div>
                        </div>
                    </div>
                `;

                this.showModal(content, '🗑️ Delete Template', () => {
                    state.savedTemplates.splice(index, 1);
                    this.saveToStorage();
                    this.closeModal();
                    this.showNotification('Template deleted', 'success');
                    this.showTemplatesModal();
                }, 'Delete', true);
            } catch (error) {
                console.error('Error deleting template:', error);
                this.showNotification('Failed to delete template', 'error');
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
                                <span>Save actions</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">Ctrl+F</span>
                                <span>Focus search box</span>
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
                            <li>Browse action categories and click to expand</li>
                            <li>Click on an action to configure its parameters</li>
                            <li>Fill in required parameters and click "Add Action"</li>
                            <li>Use ↑↓ buttons to reorder actions</li>
                            <li>Edit or remove actions from the current list</li>
                            <li>Save common action sets as templates for reuse</li>
                        </ol>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #3b82f6; margin-bottom: 1rem;">📖 Action Categories</h3>
                        <ul style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li><strong>Movement:</strong> Move player and objects</li>
                            <li><strong>Object Actions:</strong> Create, destroy, manipulate items</li>
                            <li><strong>Flag Actions:</strong> Manage game state and memory</li>
                            <li><strong>Display:</strong> Show messages and information</li>
                            <li><strong>Game Control:</strong> Save, load, end game</li>
                            <li><strong>Inventory:</strong> Show player items and contents</li>
                            <li><strong>Advanced:</strong> Complex and system features</li>
                        </ul>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                        <h3 style="color: #3b82f6; margin-bottom: 1rem;">💡 Tips</h3>
                        <ul style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li>Star your favorite actions for quick access</li>
                            <li>Use the search box to find specific actions</li>
                            <li>Save common action sequences as templates</li>
                            <li>Basic actions are easiest for beginners</li>
                            <li>Action order matters - use ↑↓ to reorder</li>
                            <li>Always end with DONE for clean rule completion</li>
                        </ul>
                    </div>
                </div>
            `;

            this.showModal(content, '❓ Actions System Help', null, 'Close', false);
        },

        showModal: function(content, title, onConfirm, confirmText = 'OK', showCancel = true) {
            const existingModal = document.querySelector('.action-modal');
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement('div');
            modal.className = 'action-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h4 style="color: #fff; margin: 0;">${title}</h4>
                            <button onclick="this.closest('.action-modal').remove()" style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            ${content}
                        </div>

                        <div style="padding: 1rem 1.5rem; border-top: 1px solid #333; display: flex; gap: 0.75rem; justify-content: flex-end;">
                            ${showCancel ? `<button onclick="this.closest('.action-modal').remove()" class="btn-small btn-edit">Cancel</button>` : ''}
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
            const modal = document.querySelector('.action-modal');
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

    console.log('DAAD Actions System module registered successfully');
})();

// Export the complete actions system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdventureCreator.modules['action-system'];
}
