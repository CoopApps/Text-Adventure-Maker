// Complete DAAD Conditions System
(function() {
    'use strict';

    console.log('DAAD Conditions System module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Conditions System module requires the Adventure Creator framework.');
        return;
    }

    AdventureCreator.registerModule('condition-system', {
        name: 'Condition System',
        version: '1.0.0',
        description: 'Complete DAAD Conditions System with professional UI and persistence',
        category: 'Core Systems',
        author: 'DAAD Adventure Creator',

        init: function() {
            console.log('Conditions System module initialized');
            this.initializeState();
            this.loadFromStorage();
            this.setupKeyboardShortcuts();
        },

        initializeState: function() {
            if (!AdventureCreator.state.conditionSystem) {
                AdventureCreator.state.conditionSystem = {
                    currentRuleConditions: [],
                    favoriteConditions: new Set(),
                    recentConditions: [],
                    savedTemplates: [],
                    searchFilter: '',
                    expandedCategories: new Set()
                };
            }
            // Maintain backward compatibility
            if (!AdventureCreator.state.currentRuleConditions) {
                AdventureCreator.state.currentRuleConditions = [];
            }
        },

        setupKeyboardShortcuts: function() {
            document.addEventListener('keydown', (e) => {
                if (!document.querySelector('.conditions-builder')) return;

                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveToStorage();
                    this.showNotification('Conditions saved successfully', 'success');
                }
                if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault();
                    const searchInput = document.querySelector('.condition-search-input');
                    if (searchInput) searchInput.focus();
                }
                if (e.key === 'Escape') {
                    const modal = document.querySelector('.condition-modal');
                    if (modal) modal.remove();
                }
            });
        },

        saveToStorage: function() {
            try {
                const state = AdventureCreator.state.conditionSystem;
                const toSave = {
                    ...state,
                    favoriteConditions: Array.from(state.favoriteConditions),
                    expandedCategories: Array.from(state.expandedCategories)
                };
                localStorage.setItem('conditionSystem_state', JSON.stringify(toSave));

                // Also save current rule conditions
                localStorage.setItem('currentRuleConditions', JSON.stringify(AdventureCreator.state.currentRuleConditions || []));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                this.showNotification('Failed to save conditions', 'error');
            }
        },

        loadFromStorage: function() {
            try {
                const saved = localStorage.getItem('conditionSystem_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const state = AdventureCreator.state.conditionSystem;

                    Object.assign(state, parsed);
                    state.favoriteConditions = new Set(parsed.favoriteConditions || []);
                    state.expandedCategories = new Set(parsed.expandedCategories || []);
                }

                // Load current rule conditions
                const savedConditions = localStorage.getItem('currentRuleConditions');
                if (savedConditions) {
                    AdventureCreator.state.currentRuleConditions = JSON.parse(savedConditions);
                    AdventureCreator.state.conditionSystem.currentRuleConditions = AdventureCreator.state.currentRuleConditions;
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        render: function() {
            const game = AdventureCreator.getCurrentGame();
            return this.renderCompleteConditionsBuilder(game);
        },

        // Complete condition definitions with explanations
        getConditionDefinitions: function() {
            return {
                // Location Tests
                location_tests: {
                    title: "🌍 Location & Position Tests",
                    description: "Check where the player or objects are located",
                    conditions: {
                        AT: {
                            name: "Player is in specific location",
                            description: "Tests if the player is currently in the specified room/location. This is one of the most common conditions.",
                            parameters: [{ name: "location", type: "location", description: "Which room to check for" }],
                            examples: ["Player is in the Kitchen", "Player is at the Castle Gate"],
                            daadCode: "AT {location}",
                            category: "basic"
                        },
                        NOTAT: {
                            name: "Player is NOT in specific location",
                            description: "Tests if the player is anywhere except the specified location. Useful for rules that work everywhere except certain places.",
                            parameters: [{ name: "location", type: "location", description: "Which room to exclude" }],
                            examples: ["Player is not in the Dangerous Cave", "Player is anywhere except the Throne Room"],
                            daadCode: "NOTAT {location}",
                            category: "basic"
                        },
                        ATGT: {
                            name: "Player location number is greater than",
                            description: "Tests if the player's current location number is higher than the specified number. Useful for checking if player has progressed past certain areas.",
                            parameters: [{ name: "location", type: "number", description: "Location number to compare against" }],
                            examples: ["Player has reached advanced areas (location > 10)", "Player is in the upper floors (location > 5)"],
                            daadCode: "ATGT {location}",
                            category: "advanced"
                        },
                        ATLT: {
                            name: "Player location number is less than",
                            description: "Tests if the player's current location number is lower than the specified number. Good for checking if player is still in early game areas.",
                            parameters: [{ name: "location", type: "number", description: "Location number to compare against" }],
                            examples: ["Player is still in starting areas (location < 5)", "Player hasn't left the tutorial zone"],
                            daadCode: "ATLT {location}",
                            category: "advanced"
                        }
                    }
                },

                // Object Tests
                object_tests: {
                    title: "📦 Object & Item Tests",
                    description: "Check the status and location of objects in your game",
                    conditions: {
                        PRESENT: {
                            name: "Object is in current room",
                            description: "Tests if the specified object is in the same location as the player. The object must be visible and accessible.",
                            parameters: [{ name: "object", type: "object", description: "Which object to look for" }],
                            examples: ["The golden key is in this room", "There's a sword here"],
                            daadCode: "PRESENT {object}",
                            category: "basic"
                        },
                        ABSENT: {
                            name: "Object is NOT in current room",
                            description: "Tests if the specified object is not in the player's current location. Useful for checking if items have been moved or taken.",
                            parameters: [{ name: "object", type: "object", description: "Which object should be missing" }],
                            examples: ["The treasure chest is gone", "Someone moved the table"],
                            daadCode: "ABSENT {object}",
                            category: "basic"
                        },
                        CARRIED: {
                            name: "Player is carrying object",
                            description: "Tests if the player has the object in their inventory. This is for items the player has picked up and is carrying around.",
                            parameters: [{ name: "object", type: "object", description: "Which object to check for in inventory" }],
                            examples: ["Player has the brass key", "Player is holding the magic wand"],
                            daadCode: "CARRIED {object}",
                            category: "basic"
                        },
                        NOTCARR: {
                            name: "Player is NOT carrying object",
                            description: "Tests if the player does not have the object in their inventory. Often used to prevent actions when missing required items.",
                            parameters: [{ name: "object", type: "object", description: "Which object should not be in inventory" }],
                            examples: ["Player doesn't have the key", "Player needs to find the map first"],
                            daadCode: "NOTCARR {object}",
                            category: "basic"
                        },
                        WORN: {
                            name: "Player is wearing object",
                            description: "Tests if the player is currently wearing the specified object. Only works with objects that can be worn (clothes, armor, jewelry).",
                            parameters: [{ name: "object", type: "object", description: "Which wearable object to check for" }],
                            examples: ["Player is wearing the magic cloak", "Player has the crown on"],
                            daadCode: "WORN {object}",
                            category: "intermediate"
                        },
                        NOTWORN: {
                            name: "Player is NOT wearing object",
                            description: "Tests if the player is not currently wearing the specified object. Useful for checking if protective gear is missing.",
                            parameters: [{ name: "object", type: "object", description: "Which object should not be worn" }],
                            examples: ["Player isn't wearing protective gear", "Player has removed the disguise"],
                            daadCode: "NOTWORN {object}",
                            category: "intermediate"
                        },
                        ISAT: {
                            name: "Object is at specific location",
                            description: "Tests if an object is at a particular location, regardless of where the player is. Useful for checking object positions from anywhere.",
                            parameters: [
                                { name: "object", type: "object", description: "Which object to locate" },
                                { name: "location", type: "location", description: "Which location to check" }
                            ],
                            examples: ["The statue is in the Temple", "The book was left in the Library"],
                            daadCode: "ISAT {object} {location}",
                            category: "intermediate"
                        },
                        ISNOTAT: {
                            name: "Object is NOT at specific location",
                            description: "Tests if an object is not at a particular location. Good for verifying objects have been moved or are missing.",
                            parameters: [
                                { name: "object", type: "object", description: "Which object to check" },
                                { name: "location", type: "location", description: "Which location it shouldn't be at" }
                            ],
                            examples: ["The artifact was stolen from the museum", "The guard has left his post"],
                            daadCode: "ISNOTAT {object} {location}",
                            category: "intermediate"
                        }
                    }
                },

                // Flag Tests
                flag_tests: {
                    title: "🏁 Flag & Memory Tests",
                    description: "Check values stored in your game's memory flags",
                    conditions: {
                        ZERO: {
                            name: "Flag equals zero",
                            description: "Tests if a flag contains the value 0. Often used for 'false' states, empty counters, or uninitialized values.",
                            parameters: [{ name: "flag", type: "flag", description: "Which flag to check" }],
                            examples: ["Door is locked (flag 50 = 0)", "Player hasn't talked to NPC yet (flag 25 = 0)"],
                            daadCode: "ZERO {flag}",
                            category: "basic"
                        },
                        NOTZERO: {
                            name: "Flag does not equal zero",
                            description: "Tests if a flag contains any value except 0. Used for 'true' states, non-empty counters, or initialized values.",
                            parameters: [{ name: "flag", type: "flag", description: "Which flag to check" }],
                            examples: ["Door is unlocked (flag 50 ≠ 0)", "Player has some money (flag 100 ≠ 0)"],
                            daadCode: "NOTZERO {flag}",
                            category: "basic"
                        },
                        EQ: {
                            name: "Flag equals specific value",
                            description: "Tests if a flag contains exactly the specified value. Perfect for checking specific states, exact amounts, or precise conditions.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to check" },
                                { name: "value", type: "number", description: "Exact value to match (0-255)" }
                            ],
                            examples: ["Player has exactly 50 coins", "Puzzle counter is at 3", "Character mood is 'angry' (value 2)"],
                            daadCode: "EQ {flag} {value}",
                            category: "basic"
                        },
                        NOTEQ: {
                            name: "Flag does NOT equal specific value",
                            description: "Tests if a flag contains any value except the specified one. Useful for 'anything but this' conditions.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to check" },
                                { name: "value", type: "number", description: "Value it should NOT equal" }
                            ],
                            examples: ["Player doesn't have exactly 0 health", "Game state is not 'game over' (≠ 99)"],
                            daadCode: "NOTEQ {flag} {value}",
                            category: "intermediate"
                        },
                        GT: {
                            name: "Flag is greater than value",
                            description: "Tests if a flag's value is higher than the specified number. Great for minimum requirements, thresholds, and progress checks.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to check" },
                                { name: "value", type: "number", description: "Minimum value (flag must be higher)" }
                            ],
                            examples: ["Player has more than 100 points", "Strength is above 10", "More than 5 attempts made"],
                            daadCode: "GT {flag} {value}",
                            category: "basic"
                        },
                        GE: {
                            name: "Flag is greater than or equal to value",
                            description: "Tests if a flag's value is the specified number or higher. Like GT but includes the exact value as a pass condition.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to check" },
                                { name: "value", type: "number", description: "Minimum value (flag can equal or exceed)" }
                            ],
                            examples: ["Player has at least 50 coins", "Level 10 or higher", "Minimum 3 items collected"],
                            daadCode: "GE {flag} {value}",
                            category: "intermediate"
                        },
                        LT: {
                            name: "Flag is less than value",
                            description: "Tests if a flag's value is lower than the specified number. Good for maximum limits, early game checks, and resource constraints.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to check" },
                                { name: "value", type: "number", description: "Maximum value (flag must be lower)" }
                            ],
                            examples: ["Player has fewer than 3 lives", "Inventory not full (< 10 items)", "Low on health (< 20)"],
                            daadCode: "LT {flag} {value}",
                            category: "basic"
                        },
                        LE: {
                            name: "Flag is less than or equal to value",
                            description: "Tests if a flag's value is the specified number or lower. Like LT but includes the exact value as a pass condition.",
                            parameters: [
                                { name: "flag", type: "flag", description: "Which flag to check" },
                                { name: "value", type: "number", description: "Maximum value (flag can equal or be less)" }
                            ],
                            examples: ["Health is 25 or below", "Maximum 5 errors allowed", "Beginner level (≤ 2)"],
                            daadCode: "LE {flag} {value}",
                            category: "intermediate"
                        },
                        SAME: {
                            name: "Two flags have the same value",
                            description: "Tests if two different flags contain identical values. Useful for comparing player stats, synchronizing counters, or matching conditions.",
                            parameters: [
                                { name: "flag1", type: "flag", description: "First flag to compare" },
                                { name: "flag2", type: "flag", description: "Second flag to compare" }
                            ],
                            examples: ["Player level matches companion level", "Two puzzle dials show same number", "Score equals high score"],
                            daadCode: "SAME {flag1} {flag2}",
                            category: "advanced"
                        },
                        NOTSAME: {
                            name: "Two flags have different values",
                            description: "Tests if two different flags contain different values. Good for ensuring values don't match or checking for variations.",
                            parameters: [
                                { name: "flag1", type: "flag", description: "First flag to compare" },
                                { name: "flag2", type: "flag", description: "Second flag to compare" }
                            ],
                            examples: ["Player and enemy have different strengths", "Password doesn't match answer", "Settings conflict detected"],
                            daadCode: "NOTSAME {flag1} {flag2}",
                            category: "advanced"
                        }
                    }
                },

                // Weight Tests
                weight_tests: {
                    title: "⚖️ Weight & Capacity Tests",
                    description: "Check carrying capacity and object weights",
                    conditions: {
                        WEIGHT: {
                            name: "Total carried weight is acceptable",
                            description: "Tests if the total weight of all objects the player is carrying is less than or equal to the specified limit. Essential for realistic inventory management.",
                            parameters: [{ name: "max_weight", type: "number", description: "Maximum weight allowed (0-255)" }],
                            examples: ["Player can carry more items (total weight ≤ 50)", "Not overloaded", "Can pick up one more thing"],
                            daadCode: "WEIGHT {max_weight}",
                            category: "intermediate"
                        },
                        WEIGH: {
                            name: "Object weighs exactly amount",
                            description: "Tests if a specific object has exactly the specified weight. Useful for weight-based puzzles or identifying objects by their mass.",
                            parameters: [
                                { name: "object", type: "object", description: "Which object to weigh" },
                                { name: "weight", type: "number", description: "Expected exact weight" }
                            ],
                            examples: ["Golden statue weighs exactly 25 units", "This must be the real diamond (weight = 5)", "Balance scale puzzle"],
                            daadCode: "WEIGH {object} {weight}",
                            category: "advanced"
                        }
                    }
                },

                // Random & Probability Tests
                probability_tests: {
                    title: "🎲 Random & Probability Tests",
                    description: "Add unpredictability and chance to your adventure",
                    conditions: {
                        CHANCE: {
                            name: "Random percentage chance",
                            description: "Randomly succeeds the specified percentage of the time. Creates unpredictable events, random encounters, or chance-based outcomes.",
                            parameters: [{ name: "percentage", type: "number", description: "Success chance (0-100%)" }],
                            examples: ["50% chance monster appears", "25% chance trap triggers", "75% chance magic works"],
                            daadCode: "CHANCE {percentage}",
                            category: "intermediate"
                        }
                    }
                },

                // Parser Tests
                parser_tests: {
                    title: "⌨️ Parser & Input Tests",
                    description: "Control how the game responds to player input",
                    conditions: {
                        TIMEOUT: {
                            name: "Player has been inactive",
                            description: "Tests if the player hasn't entered any commands for the specified number of turns. Good for hints, automatic events, or time pressure.",
                            parameters: [{ name: "turns", type: "number", description: "Number of turns of inactivity" }],
                            examples: ["Player idle for 5 turns (show hint)", "10 turns of silence (something happens)", "Timeout warning"],
                            daadCode: "TIMEOUT {turns}",
                            category: "advanced"
                        }
                    }
                }
            };
        },

        // Render the complete conditions builder
        renderCompleteConditionsBuilder: function(game) {
            const conditions = this.getConditionDefinitions();
            const currentConditions = this.getCurrentConditions();
            const state = AdventureCreator.state.conditionSystem;

            return `
                <div class="conditions-builder">
                    <div class="builder-header">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <h4 style="margin: 0; color: #10b981;">IF Conditions Builder</h4>
                                <div style="color: #666; font-size: 0.875rem;">
                                    All conditions must be true for the rule to work
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="AdventureCreator.modules['condition-system'].showTemplatesModal()" class="btn-small btn-add">
                                    💾 Templates
                                </button>
                                <button onclick="AdventureCreator.modules['condition-system'].showHelpModal()" class="btn-small btn-edit">
                                    ❓ Help (F1)
                                </button>
                            </div>
                        </div>

                        <div style="position: relative; margin-bottom: 1rem;">
                            <input type="text"
                                   class="condition-search-input"
                                   placeholder="Search conditions... (Ctrl+F)"
                                   value="${this.escapeHtml(state.searchFilter)}"
                                   onkeyup="AdventureCreator.modules['condition-system'].updateSearchFilter(this.value)"
                                   style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white; font-size: 0.875rem;">
                            <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #666;">🔍</span>
                        </div>
                    </div>

                    <div class="current-conditions">
                        <h5 style="color: #ccc; margin-bottom: 1rem;">Current Conditions:</h5>
                        ${this.renderCurrentConditions(currentConditions)}
                    </div>

                    <div class="add-condition-section">
                        <h5 style="color: #ccc; margin-bottom: 1rem;">Add New Condition:</h5>
                        ${this.renderConditionCategories(conditions, state)}
                    </div>

                    <div class="condition-preview">
                        <h5 style="color: #ccc; margin-bottom: 1rem;">Generated Code Preview:</h5>
                        <div class="code-preview">
                            ${this.generateConditionsCode(currentConditions)}
                        </div>
                    </div>
                </div>

                ${this.renderStyles()}
            `;
        },

        renderStyles: function() {
            return `
                <style>
                    .conditions-builder {
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

                    .current-conditions {
                        margin-bottom: 2rem;
                    }

                    .condition-item {
                        background: #0a0a0a;
                        border: 1px solid #333;
                        border-radius: 8px;
                        padding: 1rem;
                        margin-bottom: 0.75rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .condition-description {
                        flex: 1;
                    }

                    .condition-name {
                        font-weight: 600;
                        color: #fff;
                        margin-bottom: 0.25rem;
                    }

                    .condition-details {
                        font-size: 0.875rem;
                        color: #999;
                    }

                    .condition-actions {
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
                        background: #8b5cf6;
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

                    .condition-option {
                        background: #1a1a1a;
                        border: 1px solid #333;
                        border-radius: 6px;
                        padding: 1rem;
                        margin-bottom: 0.75rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        position: relative;
                    }

                    .condition-option:hover {
                        border-color: #8b5cf6;
                        background: #1e1b3a;
                    }

                    .condition-option:last-child {
                        margin-bottom: 0;
                    }

                    .condition-option.is-favorite {
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

                    .option-name {
                        font-weight: 600;
                        color: #fff;
                        margin-bottom: 0.5rem;
                        padding-right: 2rem;
                    }

                    .option-description {
                        font-size: 0.875rem;
                        color: #ccc;
                        line-height: 1.4;
                        margin-bottom: 0.75rem;
                    }

                    .option-examples {
                        font-size: 0.75rem;
                        color: #8b5cf6;
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
                        color: #8b5cf6;
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
                        background: #10b981;
                        color: white;
                    }

                    .btn-add:hover {
                        background: #059669;
                    }

                    .code-preview {
                        background: #0a0a0a;
                        border: 1px solid #333;
                        border-radius: 6px;
                        padding: 1rem;
                        font-family: 'Courier New', monospace;
                        font-size: 0.875rem;
                        color: #10b981;
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

                    .condition-modal {
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

        renderConditionCategories: function(conditions, state) {
            const filteredConditions = this.filterConditionsBySearch(conditions, state.searchFilter);

            return Object.entries(filteredConditions).map(([key, category]) => {
                const isExpanded = state.expandedCategories.has(key);
                return `
                    <div class="category-section">
                        <div class="category-header ${isExpanded ? 'expanded' : ''}" onclick="AdventureCreator.modules['condition-system'].toggleCategory('${key}')">
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
                        <div class="category-content ${isExpanded ? 'expanded' : ''}" id="category-${key}">
                            ${this.renderCategoryConditions(category.conditions, key)}
                        </div>
                    </div>
                `;
            }).join('');
        },

        renderCategoryConditions: function(conditions, categoryKey) {
            const state = AdventureCreator.state.conditionSystem;

            return Object.entries(conditions).map(([key, condition]) => {
                const conditionId = `${categoryKey}_${key}`;
                const isFavorite = state.favoriteConditions.has(conditionId);

                return `
                    <div class="condition-option ${isFavorite ? 'is-favorite' : ''}" onclick="AdventureCreator.modules['condition-system'].selectCondition('${key}', '${categoryKey}')">
                        <span class="favorite-star" onclick="event.stopPropagation(); AdventureCreator.modules['condition-system'].toggleFavorite('${conditionId}')">${isFavorite ? '⭐' : '☆'}</span>
                        <div class="option-complexity complexity-${condition.category}">
                            ${condition.category.toUpperCase()}
                        </div>
                        <div class="option-name">${this.escapeHtml(condition.name)}</div>
                        <div class="option-description">${this.escapeHtml(condition.description)}</div>
                        <div class="option-examples">
                            Examples: ${condition.examples.map(ex => this.escapeHtml(ex)).join(' • ')}
                        </div>
                    </div>
                `;
            }).join('');
        },

        renderCurrentConditions: function(conditions) {
            if (!conditions || conditions.length === 0) {
                return `
                    <div class="empty-state">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">🎯</div>
                        <p>No conditions set</p>
                        <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                            This rule will always try to run when triggered.<br>
                            Add conditions to control when it should work.
                        </p>
                    </div>
                `;
            }

            return conditions.map((condition, index) => `
                <div class="condition-item">
                    <div class="condition-description">
                        <div class="condition-name">${this.escapeHtml(condition.name)}</div>
                        <div class="condition-details">${this.escapeHtml(condition.description)}</div>
                    </div>
                    <div class="condition-actions">
                        <button class="btn-small btn-edit" onclick="AdventureCreator.modules['condition-system'].editCondition(${index})">
                            ✏️ Edit
                        </button>
                        <button class="btn-small btn-delete" onclick="AdventureCreator.modules['condition-system'].removeCondition(${index})">
                            🗑️ Remove
                        </button>
                    </div>
                </div>
            `).join('');
        },

        generateConditionsCode: function(conditions) {
            if (!conditions || conditions.length === 0) {
                return '// No conditions - rule always attempts to run';
            }

            return conditions.map(condition => condition.daadCode).join('\n');
        },

        // UI State Management
        getCurrentConditions: function() {
            return AdventureCreator.state.currentRuleConditions || [];
        },

        // UI Actions
        toggleCategory: function(categoryKey) {
            try {
                const state = AdventureCreator.state.conditionSystem;

                if (state.expandedCategories.has(categoryKey)) {
                    state.expandedCategories.delete(categoryKey);
                } else {
                    state.expandedCategories.add(categoryKey);
                }

                this.saveToStorage();
                this.refreshConditionsBuilder();
            } catch (error) {
                console.error('Error toggling category:', error);
                this.showNotification('Failed to toggle category', 'error');
            }
        },

        toggleFavorite: function(conditionId) {
            try {
                const state = AdventureCreator.state.conditionSystem;

                if (state.favoriteConditions.has(conditionId)) {
                    state.favoriteConditions.delete(conditionId);
                    this.showNotification('Removed from favorites', 'info');
                } else {
                    state.favoriteConditions.add(conditionId);
                    this.showNotification('Added to favorites', 'success');
                }

                this.saveToStorage();
                this.refreshConditionsBuilder();
            } catch (error) {
                console.error('Error toggling favorite:', error);
                this.showNotification('Failed to toggle favorite', 'error');
            }
        },

        updateSearchFilter: function(value) {
            try {
                AdventureCreator.state.conditionSystem.searchFilter = value;
                this.refreshConditionsBuilder();
            } catch (error) {
                console.error('Error updating search filter:', error);
            }
        },

        filterConditionsBySearch: function(conditions, filter) {
            if (!filter) return conditions;

            const filtered = {};
            const lowerFilter = filter.toLowerCase();

            Object.entries(conditions).forEach(([catKey, category]) => {
                const filteredConds = {};
                let hasMatches = false;

                Object.entries(category.conditions).forEach(([condKey, cond]) => {
                    if (cond.name.toLowerCase().includes(lowerFilter) ||
                        cond.description.toLowerCase().includes(lowerFilter) ||
                        cond.daadCode.toLowerCase().includes(lowerFilter) ||
                        cond.examples.some(ex => ex.toLowerCase().includes(lowerFilter))) {
                        filteredConds[condKey] = cond;
                        hasMatches = true;
                    }
                });

                if (hasMatches) {
                    filtered[catKey] = {
                        ...category,
                        conditions: filteredConds
                    };
                }
            });

            return filtered;
        },

        selectCondition: function(conditionKey, categoryKey) {
            try {
                // Get condition definition
                const conditions = this.getConditionDefinitions();
                const selectedCondition = conditions[categoryKey]?.conditions[conditionKey];

                if (selectedCondition) {
                    this.showConditionParameterBuilder({
                        key: conditionKey,
                        categoryKey: categoryKey,
                        ...selectedCondition
                    });
                }
            } catch (error) {
                console.error('Error selecting condition:', error);
                this.showNotification('Failed to select condition', 'error');
            }
        },

        showConditionParameterBuilder: function(condition) {
            try {
                const modal = document.createElement('div');
                modal.className = 'condition-modal';
                modal.innerHTML = `
                    <div class="modal-overlay" onclick="this.parentElement.remove()">
                        <div class="modal-content" onclick="event.stopPropagation()">
                            <div class="modal-header">
                                <h4 style="color: #fff; margin: 0;">Configure Condition: ${this.escapeHtml(condition.name)}</h4>
                                <button onclick="this.closest('.condition-modal').remove()" style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                            </div>

                            <div class="modal-body">
                                <p style="color: #ccc; margin-bottom: 1.5rem;">${this.escapeHtml(condition.description)}</p>

                                <div class="parameter-builder">
                                    ${condition.parameters.map((param, index) => `
                                        <div class="parameter-row">
                                            <div class="parameter-label">${this.escapeHtml(param.name)}:</div>
                                            <div style="flex: 1;">
                                                ${this.renderParameterInput(param, index)}
                                                <div class="parameter-help">${this.escapeHtml(param.description)}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>

                                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                                    <button class="btn-small btn-edit" onclick="this.closest('.condition-modal').remove()">Cancel</button>
                                    <button class="btn-small btn-add" onclick="AdventureCreator.modules['condition-system'].addConditionToRule('${condition.key}', '${condition.categoryKey || ''}')">Add Condition</button>
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

        addConditionToRule: function(conditionKey, categoryKey) {
            try {
                // Get parameter values from the modal
                const modal = document.querySelector('.condition-modal');
                const inputs = modal.querySelectorAll('.parameter-input');
                const values = Array.from(inputs).map(input => input.value);

                // Validate required parameters
                const conditionDef = this.findConditionDefinition(conditionKey, categoryKey);
                const missingRequired = conditionDef.parameters.some((param, index) => {
                    return param.required && !values[index];
                });

                if (missingRequired) {
                    this.showNotification('Please fill in all required parameters', 'warning');
                    return;
                }

                // Add to current rule conditions
                if (!AdventureCreator.state.currentRuleConditions) {
                    AdventureCreator.state.currentRuleConditions = [];
                }

                // Create condition object
                const newCondition = {
                    key: conditionKey,
                    categoryKey: categoryKey,
                    name: conditionDef.name,
                    description: this.buildConditionDescription(conditionDef, values),
                    daadCode: this.buildConditionCode(conditionDef, values),
                    parameters: values
                };

                AdventureCreator.state.currentRuleConditions.push(newCondition);
                AdventureCreator.state.conditionSystem.currentRuleConditions = AdventureCreator.state.currentRuleConditions;

                // Track recent conditions
                const conditionId = `${categoryKey}_${conditionKey}`;
                const state = AdventureCreator.state.conditionSystem;
                if (!state.recentConditions.includes(conditionId)) {
                    state.recentConditions.unshift(conditionId);
                    if (state.recentConditions.length > 10) {
                        state.recentConditions.pop();
                    }
                }

                this.saveToStorage();

                // Close modal and refresh
                modal.remove();
                this.showNotification('Condition added successfully', 'success');
                this.refreshConditionsBuilder();
            } catch (error) {
                console.error('Error adding condition to rule:', error);
                this.showNotification('Failed to add condition', 'error');
            }
        },

        findConditionDefinition: function(conditionKey, categoryKey) {
            try {
                const conditions = this.getConditionDefinitions();

                if (categoryKey && conditions[categoryKey]?.conditions[conditionKey]) {
                    return conditions[categoryKey].conditions[conditionKey];
                }

                // Fallback: search all categories
                for (const category of Object.values(conditions)) {
                    if (category.conditions[conditionKey]) {
                        return category.conditions[conditionKey];
                    }
                }
                return null;
            } catch (error) {
                console.error('Error finding condition definition:', error);
                return null;
            }
        },

        buildConditionDescription: function(conditionDef, values) {
            let desc = conditionDef.name;
            if (values.length > 0) {
                const validValues = values.filter(v => v);
                if (validValues.length > 0) {
                    desc += ` (${validValues.join(', ')})`;
                }
            }
            return desc;
        },

        buildConditionCode: function(conditionDef, values) {
            let code = conditionDef.daadCode;
            values.forEach((value, index) => {
                if (conditionDef.parameters[index]) {
                    code = code.replace(`{${conditionDef.parameters[index].name}}`, value || '?');
                }
            });
            return code;
        },

        refreshConditionsBuilder: function() {
            try {
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error refreshing conditions builder:', error);
            }
        },

        editCondition: function(index) {
            try {
                const conditions = this.getCurrentConditions();
                const condition = conditions[index];

                if (!condition) return;

                // Store the index for later
                const conditionDef = this.findConditionDefinition(condition.key, condition.categoryKey);

                if (!conditionDef) {
                    this.showNotification('Cannot find condition definition', 'error');
                    return;
                }

                const modal = document.createElement('div');
                modal.className = 'condition-modal';
                modal.innerHTML = `
                    <div class="modal-overlay" onclick="this.parentElement.remove()">
                        <div class="modal-content" onclick="event.stopPropagation()">
                            <div class="modal-header">
                                <h4 style="color: #fff; margin: 0;">Edit Condition: ${this.escapeHtml(condition.name)}</h4>
                                <button onclick="this.closest('.condition-modal').remove()" style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                            </div>

                            <div class="modal-body">
                                <p style="color: #ccc; margin-bottom: 1.5rem;">${this.escapeHtml(conditionDef.description)}</p>

                                <div class="parameter-builder">
                                    ${conditionDef.parameters.map((param, paramIndex) => `
                                        <div class="parameter-row">
                                            <div class="parameter-label">${this.escapeHtml(param.name)}:</div>
                                            <div style="flex: 1;">
                                                ${this.renderParameterInputWithValue(param, paramIndex, condition.parameters[paramIndex])}
                                                <div class="parameter-help">${this.escapeHtml(param.description)}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>

                                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                                    <button class="btn-small btn-edit" onclick="this.closest('.condition-modal').remove()">Cancel</button>
                                    <button class="btn-small btn-add" onclick="AdventureCreator.modules['condition-system'].updateCondition(${index})">Update Condition</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);
            } catch (error) {
                console.error('Error editing condition:', error);
                this.showNotification('Failed to edit condition', 'error');
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

        updateCondition: function(index) {
            try {
                const modal = document.querySelector('.condition-modal');
                const inputs = modal.querySelectorAll('.parameter-input');
                const values = Array.from(inputs).map(input => input.value);

                const conditions = this.getCurrentConditions();
                const condition = conditions[index];
                const conditionDef = this.findConditionDefinition(condition.key, condition.categoryKey);

                // Update the condition
                condition.description = this.buildConditionDescription(conditionDef, values);
                condition.daadCode = this.buildConditionCode(conditionDef, values);
                condition.parameters = values;

                this.saveToStorage();
                modal.remove();
                this.showNotification('Condition updated successfully', 'success');
                this.refreshConditionsBuilder();
            } catch (error) {
                console.error('Error updating condition:', error);
                this.showNotification('Failed to update condition', 'error');
            }
        },

        removeCondition: function(index) {
            try {
                const conditions = this.getCurrentConditions();
                const condition = conditions[index];

                const content = `
                    <div style="margin-bottom: 1.5rem;">
                        <p style="color: #ccc;">Are you sure you want to remove this condition?</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                            <div style="color: #fff; font-weight: 600; margin-bottom: 0.5rem;">${this.escapeHtml(condition.name)}</div>
                            <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(condition.description)}</div>
                        </div>
                    </div>
                `;

                this.showModal(content, '🗑️ Remove Condition', () => {
                    AdventureCreator.state.currentRuleConditions.splice(index, 1);
                    this.saveToStorage();
                    this.closeModal();
                    this.showNotification('Condition removed', 'success');
                    this.refreshConditionsBuilder();
                }, 'Remove', true);
            } catch (error) {
                console.error('Error removing condition:', error);
                this.showNotification('Failed to remove condition', 'error');
            }
        },

        showTemplatesModal: function() {
            try {
                const state = AdventureCreator.state.conditionSystem;
                const templatesList = state.savedTemplates.length > 0
                    ? state.savedTemplates.map((template, index) => `
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <div style="color: #8b5cf6; font-weight: 600;">${this.escapeHtml(template.name)}</div>
                                    <div style="color: #666; font-size: 0.875rem; margin-top: 0.25rem;">${this.escapeHtml(template.description || 'No description')}</div>
                                    <div style="color: #999; font-size: 0.75rem; margin-top: 0.5rem;">${template.conditions.length} conditions</div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="AdventureCreator.modules['condition-system'].loadTemplate(${index})" class="btn-small btn-add">
                                        Load
                                    </button>
                                    <button onclick="AdventureCreator.modules['condition-system'].deleteTemplate(${index})" class="btn-small btn-delete">
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
                        <button onclick="AdventureCreator.modules['condition-system'].showSaveTemplateModal()" class="btn-small btn-add" style="width: 100%; padding: 0.75rem; font-size: 1rem;">
                            💾 Save Current Conditions as Template
                        </button>
                    </div>
                `;

                this.showModal(content, '💾 Condition Templates', null, 'Close', false);
            } catch (error) {
                console.error('Error showing templates modal:', error);
                this.showNotification('Failed to show templates', 'error');
            }
        },

        showSaveTemplateModal: function() {
            this.closeModal();

            const currentConditions = this.getCurrentConditions();
            if (currentConditions.length === 0) {
                this.showNotification('No conditions to save. Add some conditions first!', 'warning');
                return;
            }

            const content = `
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Template Name</label>
                    <input type="text" id="template-name" placeholder="e.g., Combat Prerequisites"
                           style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 500;">Description</label>
                    <textarea id="template-description" placeholder="Describe this template..."
                              style="width: 100%; padding: 0.75rem; background: #0a0a0a; border: 1px solid #333; border-radius: 0.5rem; color: white; min-height: 80px;"></textarea>
                </div>
                <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                    <div style="color: #8b5cf6; font-weight: 600; margin-bottom: 0.5rem;">Conditions to save:</div>
                    <div style="color: #999; font-size: 0.875rem;">${currentConditions.length} condition(s)</div>
                </div>
            `;

            this.showModal(content, '💾 Save Template', () => {
                const name = document.getElementById('template-name').value;
                const description = document.getElementById('template-description').value;

                if (!name) {
                    this.showNotification('Please enter a template name', 'warning');
                    return;
                }

                const state = AdventureCreator.state.conditionSystem;
                state.savedTemplates.push({
                    id: Date.now(),
                    name: name,
                    description: description,
                    conditions: JSON.parse(JSON.stringify(currentConditions)),
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
                const state = AdventureCreator.state.conditionSystem;
                const template = state.savedTemplates[index];

                if (!template) return;

                AdventureCreator.state.currentRuleConditions = JSON.parse(JSON.stringify(template.conditions));
                AdventureCreator.state.conditionSystem.currentRuleConditions = AdventureCreator.state.currentRuleConditions;

                this.saveToStorage();
                this.closeModal();
                this.showNotification(`Loaded template: ${template.name}`, 'success');
                this.refreshConditionsBuilder();
            } catch (error) {
                console.error('Error loading template:', error);
                this.showNotification('Failed to load template', 'error');
            }
        },

        deleteTemplate: function(index) {
            try {
                const state = AdventureCreator.state.conditionSystem;
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
                        <h3 style="color: #8b5cf6; margin-bottom: 1rem;">⌨️ Keyboard Shortcuts</h3>
                        <div style="display: grid; gap: 0.5rem; font-family: monospace;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">F1</span>
                                <span>Show this help</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #999;">Ctrl+S</span>
                                <span>Save conditions</span>
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
                        <h3 style="color: #8b5cf6; margin-bottom: 1rem;">🚀 Getting Started</h3>
                        <ol style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li>Browse condition categories and click to expand</li>
                            <li>Click on a condition to configure its parameters</li>
                            <li>Fill in the required parameters and click "Add Condition"</li>
                            <li>Edit or remove conditions from the current list</li>
                            <li>Use the code preview to see generated DAAD code</li>
                            <li>Save common condition sets as templates for reuse</li>
                        </ol>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="color: #8b5cf6; margin-bottom: 1rem;">📖 Condition Categories</h3>
                        <ul style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li><strong>Location Tests:</strong> Check player position and movement</li>
                            <li><strong>Object Tests:</strong> Verify item locations and inventory</li>
                            <li><strong>Flag Tests:</strong> Compare game state variables</li>
                            <li><strong>Weight Tests:</strong> Manage carrying capacity</li>
                            <li><strong>Probability Tests:</strong> Add random chance</li>
                            <li><strong>Parser Tests:</strong> Control input handling</li>
                        </ul>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                        <h3 style="color: #8b5cf6; margin-bottom: 1rem;">💡 Tips</h3>
                        <ul style="color: #ccc; line-height: 1.8; padding-left: 1.5rem;">
                            <li>Star your favorite conditions for quick access</li>
                            <li>Use the search box to find specific conditions</li>
                            <li>Save complex condition sets as templates</li>
                            <li>Basic conditions are easiest for beginners</li>
                            <li>Combine multiple conditions for complex logic</li>
                        </ul>
                    </div>
                </div>
            `;

            this.showModal(content, '❓ Conditions System Help', null, 'Close', false);
        },

        showModal: function(content, title, onConfirm, confirmText = 'OK', showCancel = true) {
            const existingModal = document.querySelector('.condition-modal');
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement('div');
            modal.className = 'condition-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h4 style="color: #fff; margin: 0;">${title}</h4>
                            <button onclick="this.closest('.condition-modal').remove()" style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            ${content}
                        </div>

                        <div style="padding: 1rem 1.5rem; border-top: 1px solid #333; display: flex; gap: 0.75rem; justify-content: flex-end;">
                            ${showCancel ? `<button onclick="this.closest('.condition-modal').remove()" class="btn-small btn-edit">Cancel</button>` : ''}
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
            const modal = document.querySelector('.condition-modal');
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

    console.log('DAAD Conditions System module registered successfully');
})();

// Export the complete conditions system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdventureCreator.modules['condition-system'];
}
