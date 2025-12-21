// Inventory Management System - DAAD Adventure Creator
// Priority Item #8: Complete inventory systems (LISTAT, LISTOBJ, INVEN, advanced item management)
// Professional implementation with modals, persistence, and complete CRUD operations
(function() {
    'use strict';

    console.log('Inventory Management System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Module requires main application.');
        return;
    }

    const InventoryManagementSystem = {
        name: 'Inventory Management System',
        description: 'Complete inventory and item management for realistic adventures',
        category: 'Advanced Systems',
        version: '1.0.0',

        init() {
            console.log('Inventory Management System initialized');

            // Initialize module state
            if (!AdventureCreator.state.inventoryManagementSystem) {
                AdventureCreator.state.inventoryManagementSystem = {
                    selectedTab: 'inventory_display',
                    showExplanations: true,
                    viewMode: 'detailed',
                    savedRules: [],
                    ruleTemplates: this.getDefaultTemplates(),
                    recentOperations: []
                };
            }

            // Load persisted data
            this.loadFromStorage();
        },

        // Complete inventory management operations with explanations
        getInventoryManagementDefinitions() {
            return {
                inventory_display: {
                    title: "🎒 Inventory Display",
                    description: "Show what the player is carrying, wearing, and managing in their inventory",
                    icon: "🎒",
                    color: "#3b82f6",
                    operations: {
                        INVEN: {
                            name: "Show player inventory",
                            description: "Displays all objects the player is currently carrying in their inventory. This is the classic 'inventory' command that shows what's in the player's pockets, backpack, or hands.",
                            parameters: [],
                            examples: [
                                "Player types 'INVENTORY' to see what they're carrying",
                                "Check contents before dropping something",
                                "Display carried items for trading or puzzles"
                            ],
                            useCases: [
                                "Standard inventory checking and management",
                                "Player reference for available items",
                                "Puzzle solving with carried objects",
                                "Trading and commerce systems",
                                "Equipment and resource management"
                            ],
                            daadCode: "INVEN",
                            category: "basic",
                            icon: "🎒",
                            type: "action",
                            effect: "Lists all objects player is carrying"
                        },
                        LISTOBJ: {
                            name: "List objects in current room",
                            description: "Shows all objects that are present in the player's current location. Essential for seeing what items are available to interact with in the current room.",
                            parameters: [],
                            examples: [
                                "See what items are lying around the room",
                                "Check for objects after entering a new area",
                                "Refresh view of available items"
                            ],
                            useCases: [
                                "Room exploration and item discovery",
                                "Refreshing object view after changes",
                                "Puzzle solving with room objects",
                                "Scavenging and resource gathering",
                                "Environmental interaction systems"
                            ],
                            daadCode: "LISTOBJ",
                            category: "basic",
                            icon: "👁️",
                            type: "action",
                            effect: "Lists objects in current location"
                        }
                    }
                },

                location_inventory: {
                    title: "📍 Location-Based Inventory",
                    description: "Advanced inventory management for specific locations and remote viewing",
                    icon: "📍",
                    color: "#10b981",
                    operations: {
                        LISTAT: {
                            name: "List objects at specific location",
                            description: "Shows all objects present at any specified location, regardless of where the player currently is. Powerful tool for remote inventory management and tracking.",
                            parameters: [
                                { name: "location", type: "number", description: "Which location to list objects for (0-251, or 252=inventory, 254=worn)" }
                            ],
                            examples: [
                                "Check contents of the treasure vault from anywhere",
                                "See what's in the shop without being there",
                                "Monitor security of important locations"
                            ],
                            useCases: [
                                "Remote location monitoring and security",
                                "Inventory management across multiple locations",
                                "Shop and storage systems",
                                "Puzzle state checking from distance",
                                "Strategic planning and resource tracking"
                            ],
                            daadCode: "LISTAT {location}",
                            category: "intermediate",
                            icon: "📍",
                            type: "action",
                            effect: "Lists objects at specified location"
                        }
                    }
                },

                inventory_conditions: {
                    title: "🔍 Inventory Conditions",
                    description: "Check inventory states and object presence for advanced logic",
                    icon: "🔍",
                    color: "#8b5cf6",
                    operations: {
                        PRESENT: {
                            name: "Object is in current room",
                            description: "Tests if a specific object is present in the player's current location. Essential for checking if items are available for interaction before attempting actions.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to check for (0-255)" }
                            ],
                            examples: [
                                "Check if key is in room before trying to pick it up",
                                "Verify puzzle piece is available before using it",
                                "Confirm item presence for trading"
                            ],
                            useCases: [
                                "Preventing invalid object interactions",
                                "Conditional puzzle and quest logic",
                                "Smart action validation",
                                "Trading and commerce verification",
                                "Environmental interaction checking"
                            ],
                            daadCode: "PRESENT {object}",
                            category: "basic",
                            icon: "✅",
                            type: "condition",
                            effect: "True if object is in current room"
                        },
                        ABSENT: {
                            name: "Object is NOT in current room",
                            description: "Tests if a specific object is not present in the player's current location. Useful for detecting when items have been moved, taken, or are missing.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number that should be missing (0-255)" }
                            ],
                            examples: [
                                "Detect that treasure was stolen from the vault",
                                "Notice when guard has left their post",
                                "Check if puzzle piece was moved"
                            ],
                            useCases: [
                                "Theft and security detection",
                                "Missing item alerts and responses",
                                "Dynamic story events based on object absence",
                                "Puzzle failure and reset detection",
                                "Environmental change monitoring"
                            ],
                            daadCode: "ABSENT {object}",
                            category: "basic",
                            icon: "❌",
                            type: "condition",
                            effect: "True if object is NOT in current room"
                        },
                        CARRIED: {
                            name: "Player is carrying object",
                            description: "Tests if the player has a specific object in their inventory. The fundamental condition for checking if players have required items for actions, puzzles, or progress.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to check in inventory (0-255)" }
                            ],
                            examples: [
                                "Check if player has key before unlocking door",
                                "Verify player has weapon before combat",
                                "Confirm player has money before purchase"
                            ],
                            useCases: [
                                "Requirements checking for actions and puzzles",
                                "Conditional access and progression",
                                "Trading and commerce validation",
                                "Equipment and tool verification",
                                "Quest item and progress tracking"
                            ],
                            daadCode: "CARRIED {object}",
                            category: "basic",
                            icon: "🤲",
                            type: "condition",
                            effect: "True if player is carrying object"
                        },
                        NOTCARR: {
                            name: "Player is NOT carrying object",
                            description: "Tests if the player does not have a specific object in their inventory. Essential for preventing actions when required items are missing or for checking empty inventory slots.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number that should not be in inventory (0-255)" }
                            ],
                            examples: [
                                "Prevent door unlocking without key",
                                "Block combat without weapon",
                                "Require finding item before proceeding"
                            ],
                            useCases: [
                                "Blocking actions without required items",
                                "Creating item finding quests",
                                "Inventory space management",
                                "Tutorial and guidance systems",
                                "Difficulty and progression control"
                            ],
                            daadCode: "NOTCARR {object}",
                            category: "basic",
                            icon: "🚫",
                            type: "condition",
                            effect: "True if player is NOT carrying object"
                        },
                        WORN: {
                            name: "Player is wearing object",
                            description: "Tests if the player is currently wearing a specific object (clothes, armor, accessories). Important for equipment systems and protection mechanics.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to check if worn (0-255)" }
                            ],
                            examples: [
                                "Check if player is wearing protective armor",
                                "Verify player has disguise on",
                                "Confirm magical cloak is equipped"
                            ],
                            useCases: [
                                "Equipment and protection systems",
                                "Disguise and stealth mechanics",
                                "Environmental protection requirements",
                                "Fashion and appearance systems",
                                "Magical item effects and bonuses"
                            ],
                            daadCode: "WORN {object}",
                            category: "intermediate",
                            icon: "👕",
                            type: "condition",
                            effect: "True if player is wearing object"
                        },
                        NOTWORN: {
                            name: "Player is NOT wearing object",
                            description: "Tests if the player is not currently wearing a specific object. Useful for checking if protective gear is missing or if equipment slots are free.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number that should not be worn (0-255)" }
                            ],
                            examples: [
                                "Warning that player isn't wearing armor",
                                "Check if disguise was removed",
                                "Verify equipment slot is available"
                            ],
                            useCases: [
                                "Safety warnings and protection alerts",
                                "Equipment management and optimization",
                                "Disguise and stealth failure detection",
                                "Environmental hazard warnings",
                                "Equipment slot availability checking"
                            ],
                            daadCode: "NOTWORN {object}",
                            category: "intermediate",
                            icon: "👔",
                            type: "condition",
                            effect: "True if player is NOT wearing object"
                        }
                    }
                },

                inventory_actions: {
                    title: "🤲 Inventory Actions",
                    description: "Manipulate player inventory - pick up, drop, wear, and manage items",
                    icon: "🤲",
                    color: "#f59e0b",
                    operations: {
                        GET: {
                            name: "Pick up object",
                            description: "Adds an object to the player's inventory from the current location. The fundamental action for collecting items, tools, and resources throughout the adventure.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to pick up (0-255)" }
                            ],
                            examples: [
                                "Player picks up the golden key",
                                "Collect the magic sword for combat",
                                "Gather coins for purchasing items"
                            ],
                            useCases: [
                                "Item collection and resource gathering",
                                "Tool and weapon acquisition",
                                "Treasure and reward collection",
                                "Puzzle piece and clue gathering",
                                "Equipment and supply management"
                            ],
                            daadCode: "GET {object}",
                            category: "basic",
                            icon: "👋",
                            type: "action",
                            effect: "Moves object to player inventory"
                        },
                        DROP: {
                            name: "Drop object from inventory",
                            description: "Removes an object from the player's inventory and places it in the current room. Essential for inventory management, trading, and strategic item placement.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to drop (0-255)" }
                            ],
                            examples: [
                                "Drop heavy rock to make room in inventory",
                                "Leave torch in safe location",
                                "Place offering on altar"
                            ],
                            useCases: [
                                "Inventory space management",
                                "Strategic item placement",
                                "Trading and gift giving",
                                "Puzzle solving with item placement",
                                "Weight and burden management"
                            ],
                            daadCode: "DROP {object}",
                            category: "basic",
                            icon: "👇",
                            type: "action",
                            effect: "Moves object from inventory to current room"
                        },
                        WEAR: {
                            name: "Wear/equip object",
                            description: "Equips an object from inventory as wearable gear (armor, clothes, accessories). Critical for equipment systems and providing protection or bonuses.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to wear/equip (0-255)" }
                            ],
                            examples: [
                                "Put on the protective armor",
                                "Wear the magical cloak for stealth",
                                "Equip the royal crown"
                            ],
                            useCases: [
                                "Equipment and gear systems",
                                "Protection and defense mechanics",
                                "Disguise and appearance changes",
                                "Magical item activation",
                                "Status and rank display"
                            ],
                            daadCode: "WEAR {object}",
                            category: "intermediate",
                            icon: "👕",
                            type: "action",
                            effect: "Equips object as worn gear"
                        },
                        REMOVE: {
                            name: "Remove/unequip worn object",
                            description: "Takes off a worn object and returns it to inventory. Important for equipment management, disguise changes, and gear optimization.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to remove (0-255)" }
                            ],
                            examples: [
                                "Remove heavy armor for stealth",
                                "Take off disguise when safe",
                                "Unequip damaged equipment"
                            ],
                            useCases: [
                                "Equipment optimization and swapping",
                                "Disguise and stealth management",
                                "Gear maintenance and repair",
                                "Situational equipment changes",
                                "Inventory organization"
                            ],
                            daadCode: "REMOVE {object}",
                            category: "intermediate",
                            icon: "👔",
                            type: "action",
                            effect: "Unequips worn object to inventory"
                        }
                    }
                },

                advanced_inventory: {
                    title: "⚙️ Advanced Inventory Systems",
                    description: "Sophisticated inventory mechanics for complex adventures",
                    icon: "⚙️",
                    color: "#dc2626",
                    operations: {
                        CREATE: {
                            name: "Create new object",
                            description: "Brings a new object into existence in the game world. Objects appear at location 253 (limbo) and must be positioned with PLACE or PUTO commands.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to create (0-255)" }
                            ],
                            examples: [
                                "Magic spell creates a bridge",
                                "Craft a new tool from materials",
                                "Generate reward item for quest completion"
                            ],
                            useCases: [
                                "Crafting and creation systems",
                                "Magic and spell effects",
                                "Dynamic reward generation",
                                "Puzzle solution creation",
                                "Story-driven item appearance"
                            ],
                            daadCode: "CREATE {object}",
                            category: "intermediate",
                            icon: "✨",
                            type: "action",
                            effect: "Creates object at location 253 (limbo)"
                        },
                        DESTROY: {
                            name: "Remove object from game",
                            description: "Completely removes an object from the game world. The object disappears permanently (until created again with CREATE). Useful for consumption and cleanup.",
                            parameters: [
                                { name: "object", type: "number", description: "Object number to destroy (0-255)" }
                            ],
                            examples: [
                                "Consume food item to restore health",
                                "Burn evidence to hide crime",
                                "Magic item vanishes after use"
                            ],
                            useCases: [
                                "Consumable items and resources",
                                "Cleanup and world management",
                                "Story-driven item removal",
                                "Magical effects and transformations",
                                "Evidence and clue destruction"
                            ],
                            daadCode: "DESTROY {object}",
                            category: "intermediate",
                            icon: "💥",
                            type: "action",
                            effect: "Permanently removes object from game"
                        },
                        AUTOP: {
                            name: "Auto-place object using flag 38",
                            description: "Automatically moves the current noun object to whatever location is stored in flag 38. Advanced dynamic positioning for calculated placements.",
                            parameters: [],
                            examples: [
                                "Teleport object to calculated destination",
                                "Dynamic object distribution system",
                                "Context-sensitive item placement"
                            ],
                            useCases: [
                                "Calculated and algorithmic placement",
                                "Dynamic world generation",
                                "Smart object distribution",
                                "Advanced teleportation systems",
                                "Context-aware positioning"
                            ],
                            daadCode: "AUTOP",
                            category: "advanced",
                            icon: "🎯",
                            type: "action",
                            effect: "Places current noun at location in flag 38"
                        },
                        AUTOR: {
                            name: "Auto-remove from current room",
                            description: "Automatically removes the current noun object from the player's current location. Advanced cleanup and removal technique for dynamic systems.",
                            parameters: [],
                            examples: [
                                "Clean up after magical spell effect",
                                "Remove evidence automatically",
                                "Clear area of temporary objects"
                            ],
                            useCases: [
                                "Automatic cleanup and maintenance",
                                "Dynamic world state management",
                                "Spell and effect cleanup",
                                "Evidence and clue removal",
                                "Temporary object management"
                            ],
                            daadCode: "AUTOR",
                            category: "advanced",
                            icon: "🧹",
                            type: "action",
                            effect: "Removes current noun from current location"
                        }
                    }
                }
            };
        },

        getDefaultTemplates() {
            return [
                {
                    id: 'basic-pickup',
                    name: 'Basic Item Pickup',
                    description: 'Simple GET action with presence check',
                    category: 'Basic',
                    icon: '👋',
                    conditions: ['PRESENT'],
                    actions: ['GET'],
                    daadCode: 'PRESENT {object}\nGET {object}\nOK'
                },
                {
                    id: 'key-door',
                    name: 'Key and Lock System',
                    description: 'Check for key, unlock door, consume key',
                    category: 'Puzzles',
                    icon: '🔐',
                    conditions: ['CARRIED'],
                    actions: ['DESTROY', 'GOTO'],
                    daadCode: 'CARRIED key\nMESSAGE "You unlock the door."\nDESTROY key\nGOTO next_room'
                },
                {
                    id: 'equipment-system',
                    name: 'Equipment Management',
                    description: 'Pick up and wear armor',
                    category: 'Equipment',
                    icon: '⚔️',
                    conditions: ['PRESENT', 'NOTCARR'],
                    actions: ['GET', 'WEAR'],
                    daadCode: 'PRESENT armor\nNOTCARR armor\nGET armor\nWEAR armor\nMESSAGE "You feel protected."'
                },
                {
                    id: 'trading-system',
                    name: 'Trading System',
                    description: 'Exchange money for items',
                    category: 'Commerce',
                    icon: '🏪',
                    conditions: ['CARRIED'],
                    actions: ['DROP', 'GET'],
                    daadCode: 'CARRIED coins\nDROP coins\nGET sword\nMESSAGE "Trade complete!"'
                },
                {
                    id: 'crafting-system',
                    name: 'Crafting System',
                    description: 'Combine materials to create item',
                    category: 'Advanced',
                    icon: '🔨',
                    conditions: ['CARRIED', 'CARRIED'],
                    actions: ['DESTROY', 'DESTROY', 'CREATE', 'GET'],
                    daadCode: 'CARRIED wood\nCARRIED iron\nDESTROY wood\nDESTROY iron\nCREATE sword\nGET sword\nMESSAGE "You craft a sword!"'
                }
            ];
        },

        // Render the complete inventory management system interface
        render() {
            const game = AdventureCreator.getCurrentGame();
            if (!game || game.format !== 'daad') {
                return `
                    <div style="padding: 2rem; background: #1a1a1a; border-radius: 8px; margin: 1rem 0;">
                        <h3 style="color: #f59e0b; margin-bottom: 1rem;">⚠️ DAAD Format Required</h3>
                        <p style="color: #ccc; line-height: 1.6;">
                            The Inventory Management System is only available for DAAD format games.
                            Please create or switch to a DAAD game to use this module.
                        </p>
                    </div>
                `;
            }

            const currentTab = AdventureCreator.state.inventoryManagementSystem.selectedTab;
            const definitions = this.getInventoryManagementDefinitions();

            return `
                <div class="inventory-management-container">
                    <div class="inventory-management-header">
                        <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
                            <div style="flex: 1; min-width: 300px;">
                                <h3 style="color: #3b82f6; margin-bottom: 0.5rem;">🎒 Inventory Management System</h3>
                                <p style="color: #666; margin: 0;">
                                    Complete inventory and item management for realistic adventures.
                                    Handle carrying, wearing, finding, and organizing items with professional systems.
                                </p>
                            </div>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <button class="btn-header" onclick="AdventureCreator.modules['inventory-system'].showTemplatesModal()" title="Browse templates">
                                    📚 Templates
                                </button>
                                <button class="btn-header" onclick="AdventureCreator.modules['inventory-system'].showSavedRulesModal()" title="View saved rules">
                                    💾 Saved Rules
                                </button>
                                <button class="btn-header" onclick="AdventureCreator.modules['inventory-system'].showHelpModal()" title="Show help">
                                    ❓ Help
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="inventory-management-tabs">
                        ${this.renderInventoryManagementTabs(definitions, currentTab)}
                    </div>

                    <div class="inventory-management-content">
                        ${this.renderInventoryManagementContent(definitions, currentTab, game)}
                    </div>

                    <div class="inventory-visualizer">
                        <h4 style="color: #fff; margin-bottom: 1rem;">📦 Inventory Visualizer & Simulator</h4>
                        ${this.renderInventoryVisualizer(game)}
                    </div>

                    <div class="inventory-examples">
                        <h4 style="color: #fff; margin-bottom: 1rem;">💡 Complete Inventory Systems</h4>
                        ${this.renderInventoryExamples()}
                    </div>
                </div>

                ${this.renderStyles()}
            `;
        },

        renderInventoryManagementTabs(definitions, currentTab) {
            const tabs = [
                { key: 'inventory_display', def: definitions.inventory_display },
                { key: 'location_inventory', def: definitions.location_inventory },
                { key: 'inventory_conditions', def: definitions.inventory_conditions },
                { key: 'inventory_actions', def: definitions.inventory_actions },
                { key: 'advanced_inventory', def: definitions.advanced_inventory }
            ];

            return tabs.map(({ key, def }) => `
                <button class="inventory-management-tab ${currentTab === key ? 'active' : ''}"
                        style="--tab-color: ${def.color}"
                        onclick="AdventureCreator.modules['inventory-system'].switchTab('${key}')">
                    <div class="tab-icon">${def.icon}</div>
                    <div class="tab-label">${def.title.replace(/[🎒📍🔍🤲⚙️]/g, '').trim()}</div>
                </button>
            `).join('');
        },

        renderInventoryManagementContent(definitions, currentTab, game) {
            const def = definitions[currentTab];
            if (!def) return '<div>Category not found</div>';

            return `
                <div class="category-title" style="color: ${def.color}">
                    ${def.icon} ${def.title}
                </div>

                <div class="category-description">
                    ${def.description}
                </div>

                <div class="operations-grid">
                    ${Object.entries(def.operations).map(([key, operation]) => `
                        <div class="operation-card" style="--operation-color: ${def.color}"
                             onclick="AdventureCreator.modules['inventory-system'].selectOperation('${key}')">
                            <div class="operation-type-badge">${operation.type}</div>

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
                                🎒 <strong>Effect:</strong> ${operation.effect}
                            </div>

                            <div class="operation-examples">
                                <div class="examples-title">💡 Examples</div>
                                ${operation.examples.slice(0, 2).map(example => `
                                    <div class="example-item">${example}</div>
                                `).join('')}
                            </div>

                            <div class="operation-use-cases">
                                <div class="use-cases-title">🎯 Use Cases</div>
                                ${operation.useCases.slice(0, 3).map(useCase => `
                                    <div class="use-case-item">${useCase}</div>
                                `).join('')}
                            </div>

                            <button class="btn-operation" onclick="event.stopPropagation(); AdventureCreator.modules['inventory-system'].selectOperation('${key}')">
                                ➕ Add ${operation.name}
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        renderInventoryVisualizer(game) {
            const objects = game?.daad?.objects || [];

            // Categorize objects by location
            const carriedObjects = objects.filter(obj => obj.location === 252);
            const wornObjects = objects.filter(obj => obj.location === 254);
            const roomObjects = objects.filter(obj => {
                const currentLoc = game?.daad?.currentLocation || 0;
                return obj.location === currentLoc;
            });

            return `
                <div class="simulator-controls">
                    <span style="color: #ccc; font-weight: 600;">Simulate Commands:</span>
                    <button class="simulator-button" onclick="AdventureCreator.modules['inventory-system'].simulateInventoryCommand('INVEN')">
                        🎒 INVEN
                    </button>
                    <button class="simulator-button" onclick="AdventureCreator.modules['inventory-system'].simulateInventoryCommand('LISTOBJ')">
                        👁️ LISTOBJ
                    </button>
                    <button class="simulator-button" onclick="AdventureCreator.modules['inventory-system'].simulateInventoryCommand('GET')">
                        👋 GET
                    </button>
                    <button class="simulator-button" onclick="AdventureCreator.modules['inventory-system'].simulateInventoryCommand('DROP')">
                        👇 DROP
                    </button>
                    <button class="simulator-button" onclick="AdventureCreator.modules['inventory-system'].simulateInventoryCommand('WEAR')">
                        👕 WEAR
                    </button>
                </div>

                <div class="visualizer-sections">
                    <div class="inventory-section" style="--section-color: #3b82f6;">
                        <div class="section-title">
                            🎒 Player Inventory (Location 252)
                        </div>
                        <div class="inventory-items">
                            ${carriedObjects.length === 0 ? `
                                <div class="empty-inventory">Your inventory is empty</div>
                            ` : carriedObjects.map((obj, index) => `
                                <div class="inventory-item" style="--item-color: #3b82f6;">
                                    <span class="item-name">📦 ${obj.name || `Object ${obj.id || index}`}</span>
                                    <span class="item-details">${obj.weight ? `${obj.weight} units` : 'No weight'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="inventory-section" style="--section-color: #10b981;">
                        <div class="section-title">
                            👕 Worn Equipment (Location 254)
                        </div>
                        <div class="inventory-items">
                            ${wornObjects.length === 0 ? `
                                <div class="empty-inventory">No equipment worn</div>
                            ` : wornObjects.map((obj, index) => `
                                <div class="inventory-item" style="--item-color: #10b981;">
                                    <span class="item-name">👕 ${obj.name || `Object ${obj.id || index}`}</span>
                                    <span class="item-details">${obj.weight ? `${obj.weight} units` : 'Equipped'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="inventory-section" style="--section-color: #f59e0b;">
                        <div class="section-title">
                            👁️ Current Room Objects
                        </div>
                        <div class="inventory-items">
                            ${roomObjects.length === 0 ? `
                                <div class="empty-inventory">No objects in this room</div>
                            ` : roomObjects.map((obj, index) => `
                                <div class="inventory-item" style="--item-color: #f59e0b;">
                                    <span class="item-name">🏠 ${obj.name || `Object ${obj.id || index}`}</span>
                                    <span class="item-details">${obj.weight ? `${obj.weight} units` : 'Available'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="inventory-section" style="--section-color: #8b5cf6;">
                        <div class="section-title">
                            📊 Inventory Statistics
                        </div>
                        <div class="inventory-items">
                            <div class="inventory-item" style="--item-color: #8b5cf6;">
                                <span class="item-name">Total Carried</span>
                                <span class="item-details">${carriedObjects.length} items</span>
                            </div>
                            <div class="inventory-item" style="--item-color: #8b5cf6;">
                                <span class="item-name">Total Weight</span>
                                <span class="item-details">${carriedObjects.reduce((sum, obj) => sum + (obj.weight || 0), 0)} units</span>
                            </div>
                            <div class="inventory-item" style="--item-color: #8b5cf6;">
                                <span class="item-name">Equipment Worn</span>
                                <span class="item-details">${wornObjects.length} items</span>
                            </div>
                            <div class="inventory-item" style="--item-color: #8b5cf6;">
                                <span class="item-name">Room Objects</span>
                                <span class="item-details">${roomObjects.length} available</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderInventoryExamples() {
            const examples = [
                {
                    title: "🎒 Complete Inventory System",
                    description: "Full inventory management with checking and actions",
                    color: "#3b82f6",
                    code: `// Check what player has\nINVEN\nNEWLINE\n// Look for items in room\nLISTOBJ\n// Pick up if key present\nPRESENT key\nGET key\nOK`,
                    explanation: "Comprehensive inventory display and item collection"
                },
                {
                    title: "⚔️ Equipment Management",
                    description: "Weapon and armor system with equipping",
                    color: "#dc2626",
                    code: `// Check if armor available\nPRESENT armor\nNOTCARR armor\nGET armor\nWEAR armor\nMESSAGE "You feel more protected."`,
                    explanation: "Realistic equipment acquisition and wearing system"
                },
                {
                    title: "🔐 Key and Lock System",
                    description: "Conditional access with required items",
                    color: "#f59e0b",
                    code: `// Check for key before unlocking\nCARRIED key\nMESSAGE "You unlock the door."\nDESTROY key\nGOTO next_room\n// If no key\nNOTCARR key\nMESSAGE "You need a key."`,
                    explanation: "Item-based access control with consumption"
                },
                {
                    title: "🏪 Trading System",
                    description: "Commerce with inventory verification",
                    color: "#10b981",
                    code: `// Check player has money\nCARRIED coins\nDROP coins\nGET sword\nMESSAGE "Trade complete!"\n// Not enough money\nNOTCARR coins\nMESSAGE "You need coins to trade."`,
                    explanation: "Trading mechanics with currency verification"
                },
                {
                    title: "🧙 Crafting System",
                    description: "Item creation from components",
                    color: "#8b5cf6",
                    code: `// Check for components\nCARRIED wood\nCARRIED iron\nDESTROY wood\nDESTROY iron\nCREATE sword\nGET sword\nMESSAGE "You craft a sword!"`,
                    explanation: "Crafting system consuming materials to create items"
                },
                {
                    title: "📦 Storage Management",
                    description: "Remote inventory checking and organization",
                    color: "#06b6d4",
                    code: `// Check vault contents\nLISTAT vault\n// Move valuable items\nCARRIED treasure\nDROP treasure\nPLACE treasure vault\nMESSAGE "Treasure safely stored."`,
                    explanation: "Advanced storage and remote inventory management"
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
                            <button class="btn-use-example" onclick="AdventureCreator.modules['inventory-system'].useExample(\`${example.title}\`, \`${example.code.replace(/`/g, '\\`')}\`)">
                                📋 Use This Example
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        renderStyles() {
            return `
                <style>
                    .inventory-management-container {
                        background: #1a1a1a;
                        border-radius: 12px;
                        padding: 2rem;
                        margin-bottom: 2rem;
                    }

                    .inventory-management-header {
                        margin-bottom: 2rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid #333;
                    }

                    .btn-header {
                        background: #333;
                        color: #ccc;
                        border: none;
                        border-radius: 6px;
                        padding: 0.5rem 1rem;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .btn-header:hover {
                        background: #444;
                        color: #fff;
                        transform: translateY(-1px);
                    }

                    .inventory-management-tabs {
                        display: flex;
                        gap: 0.5rem;
                        margin-bottom: 2rem;
                        overflow-x: auto;
                        flex-wrap: wrap;
                    }

                    .inventory-management-tab {
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

                    .inventory-management-tab:hover {
                        background: #444;
                        color: #fff;
                    }

                    .inventory-management-tab.active {
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

                    .inventory-management-content {
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

                    .inventory-visualizer {
                        background: #0a0a0a;
                        border-radius: 8px;
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                    }

                    .visualizer-sections {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 1rem;
                        margin-top: 1rem;
                    }

                    .inventory-section {
                        background: #1a1a1a;
                        border-radius: 6px;
                        padding: 1rem;
                        border-left: 4px solid var(--section-color);
                    }

                    .section-title {
                        font-weight: 600;
                        color: #fff;
                        margin-bottom: 0.75rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .inventory-items {
                        font-size: 0.875rem;
                    }

                    .inventory-item {
                        background: #0a0a0a;
                        border-radius: 4px;
                        padding: 0.5rem;
                        margin: 0.25rem 0;
                        border-left: 2px solid var(--item-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .item-name {
                        color: #ccc;
                    }

                    .item-details {
                        color: #666;
                        font-size: 0.75rem;
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
                        transform: translateY(-1px);
                    }

                    .inventory-examples {
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
                        margin-bottom: 0.75rem;
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

                    .btn-use-example {
                        background: #10b981;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 0.5rem 1rem;
                        font-size: 0.75rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        width: 100%;
                    }

                    .btn-use-example:hover {
                        background: #059669;
                    }

                    .empty-inventory {
                        color: #666;
                        font-style: italic;
                        text-align: center;
                        padding: 1rem;
                    }

                    @media (max-width: 768px) {
                        .operations-grid {
                            grid-template-columns: 1fr;
                        }

                        .visualizer-sections {
                            grid-template-columns: 1fr;
                        }

                        .examples-grid {
                            grid-template-columns: 1fr;
                        }

                        .inventory-management-tabs {
                            flex-direction: column;
                        }

                        .inventory-management-tab {
                            min-width: auto;
                        }

                        .simulator-controls {
                            flex-direction: column;
                            align-items: stretch;
                        }
                    }

                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }

                    @keyframes slideOut {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }
                </style>
            `;
        },

        // UI Actions
        switchTab(tabName) {
            AdventureCreator.state.inventoryManagementSystem.selectedTab = tabName;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        selectOperation(operationKey) {
            const definitions = this.getInventoryManagementDefinitions();
            let selectedOperation = null;

            // Search across all categories
            Object.values(definitions).forEach(category => {
                if (category.operations[operationKey]) {
                    selectedOperation = { key: operationKey, ...category.operations[operationKey] };
                }
            });

            if (selectedOperation) {
                this.showOperationParameterBuilder(selectedOperation);
            }
        },

        showOperationParameterBuilder(operation) {
            const game = AdventureCreator.getCurrentGame();

            const modal = document.createElement('div');
            modal.className = 'inventory-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h4>${operation.icon} Configure: ${operation.name}</h4>
                            <button onclick="this.closest('.inventory-modal').remove()"
                                    style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            <div style="background: ${operation.type === 'condition' ? '#10b981' : '#3b82f6'}; color: white; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                                <strong>Type:</strong> ${operation.type === 'condition' ? 'Condition (IF)' : 'Action (THEN)'}<br>
                                <small><strong>Effect:</strong> ${operation.effect}</small>
                            </div>

                            <p style="color: #ccc; margin-bottom: 1.5rem;">${operation.description}</p>

                            ${operation.parameters && operation.parameters.length > 0 ? `
                                <div class="parameter-builder">
                                    ${operation.parameters.map((param, index) => `
                                        <div class="parameter-row">
                                            <div class="parameter-label">${param.name}:</div>
                                            <div style="flex: 1;">
                                                ${this.renderParameterInput(param, game)}
                                                <div class="parameter-help">${param.description}</div>
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

                            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; flex-wrap: wrap;">
                                <button class="btn-modal-cancel" onclick="this.closest('.inventory-modal').remove()">Cancel</button>
                                <button class="btn-modal-add" onclick="AdventureCreator.modules['inventory-system'].addOperationToProcess('${operation.key}')">
                                    ✅ Add to Process
                                </button>
                                <button class="btn-modal-save" onclick="AdventureCreator.modules['inventory-system'].saveOperationAsRule('${operation.key}')">
                                    💾 Save as Rule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                ${this.renderModalStyles()}
            `;

            document.body.appendChild(modal);
        },

        renderParameterInput(param, game) {
            switch(param.type) {
                case 'number':
                    if (param.name === 'object') {
                        const objects = game?.daad?.objects || [];
                        return `
                            <select class="parameter-input" data-param="${param.name}">
                                <option value="">Choose object...</option>
                                ${objects.map((obj, index) => `
                                    <option value="${index}">${index}: ${obj.name || `Object ${index}`}</option>
                                `).join('')}
                            </select>
                        `;
                    } else if (param.name === 'location') {
                        const locations = game?.daad?.locations || [];
                        return `
                            <select class="parameter-input" data-param="${param.name}">
                                <option value="">Choose location...</option>
                                ${locations.map((loc, index) => `
                                    <option value="${index}">${index}: ${loc.name || `Location ${index}`}</option>
                                `).join('')}
                                <optgroup label="Special Locations">
                                    <option value="252">252 - Player Inventory</option>
                                    <option value="253">253 - Limbo (created objects)</option>
                                    <option value="254">254 - Worn by Player</option>
                                </optgroup>
                            </select>
                        `;
                    }
                    return `<input type="number" class="parameter-input" data-param="${param.name}" placeholder="Enter ${param.name}" min="0" max="255">`;

                default:
                    return `<input type="text" class="parameter-input" data-param="${param.name}" placeholder="Enter ${param.name}">`;
            }
        },

        renderModalStyles() {
            return `
                <style>
                    .inventory-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 10000;
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

                    .modal-header h4 {
                        color: #fff;
                        margin: 0;
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
                        align-items: start;
                        margin-bottom: 1rem;
                        flex-direction: column;
                    }

                    .parameter-label {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #3b82f6;
                    }

                    .parameter-input {
                        width: 100%;
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

                    .btn-modal-cancel {
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 4px;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        background: #333;
                        color: #ccc;
                    }

                    .btn-modal-cancel:hover {
                        background: #444;
                        color: #fff;
                    }

                    .btn-modal-add {
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 4px;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        background: #3b82f6;
                        color: white;
                    }

                    .btn-modal-add:hover {
                        background: #2563eb;
                    }

                    .btn-modal-save {
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 4px;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        background: #10b981;
                        color: white;
                    }

                    .btn-modal-save:hover {
                        background: #059669;
                    }
                </style>
            `;
        },

        addOperationToProcess(operationKey) {
            const modal = document.querySelector('.inventory-modal');
            const inputs = modal.querySelectorAll('.parameter-input');
            const values = {};

            inputs.forEach(input => {
                const paramName = input.getAttribute('data-param');
                values[paramName] = input.value;
            });

            // Validate inputs for operations that need parameters
            const operationDef = this.findOperationDefinition(operationKey);
            if (operationDef.parameters && operationDef.parameters.length > 0) {
                const missingParams = operationDef.parameters.filter(p => !values[p.name]);
                if (missingParams.length > 0) {
                    this.showNotification('Please fill in all parameters!', 'error');
                    return;
                }
            }

            // Build DAAD code
            const daadCode = this.buildOperationCode(operationDef, values);

            // Add to recent operations
            const recentOp = {
                key: operationKey,
                name: operationDef.name,
                description: this.buildOperationDescription(operationDef, values),
                daadCode: daadCode,
                parameters: values,
                icon: operationDef.icon,
                type: operationDef.type,
                timestamp: Date.now()
            };

            if (!AdventureCreator.state.inventoryManagementSystem.recentOperations) {
                AdventureCreator.state.inventoryManagementSystem.recentOperations = [];
            }

            AdventureCreator.state.inventoryManagementSystem.recentOperations.unshift(recentOp);
            AdventureCreator.state.inventoryManagementSystem.recentOperations =
                AdventureCreator.state.inventoryManagementSystem.recentOperations.slice(0, 10);

            this.saveToStorage();
            modal.remove();

            this.showNotification(`Added: ${operationDef.name}`, 'success');
            this.showCodePreview(daadCode, operationDef.name);
        },

        saveOperationAsRule(operationKey) {
            const modal = document.querySelector('.inventory-modal');
            const inputs = modal.querySelectorAll('.parameter-input');
            const values = {};

            inputs.forEach(input => {
                const paramName = input.getAttribute('data-param');
                values[paramName] = input.value;
            });

            const operationDef = this.findOperationDefinition(operationKey);
            if (operationDef.parameters && operationDef.parameters.length > 0) {
                const missingParams = operationDef.parameters.filter(p => !values[p.name]);
                if (missingParams.length > 0) {
                    this.showNotification('Please fill in all parameters!', 'error');
                    return;
                }
            }

            const daadCode = this.buildOperationCode(operationDef, values);

            // Prompt for rule name
            this.showSaveRuleModal(operationDef, values, daadCode);
        },

        showSaveRuleModal(operationDef, values, daadCode) {
            const modal = document.createElement('div');
            modal.className = 'inventory-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h4>💾 Save Rule</h4>
                            <button onclick="this.closest('.inventory-modal').remove()"
                                    style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Rule Name:</label>
                                <input type="text" id="ruleName" class="parameter-input"
                                       placeholder="Enter a name for this rule..."
                                       value="${operationDef.name}">
                            </div>

                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Description:</label>
                                <textarea id="ruleDescription" class="parameter-input"
                                          placeholder="Describe what this rule does..."
                                          rows="3">${operationDef.description}</textarea>
                            </div>

                            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                                <strong style="color: #ccc;">DAAD Code:</strong>
                                <pre style="margin: 0.5rem 0 0 0; color: #3b82f6; font-family: monospace; font-size: 0.875rem; overflow-x: auto;">${daadCode}</pre>
                            </div>

                            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                                <button class="btn-modal-cancel" onclick="this.closest('.inventory-modal').remove()">Cancel</button>
                                <button class="btn-modal-save" onclick="AdventureCreator.modules['inventory-system'].confirmSaveRule('${operationDef.key}', \`${daadCode.replace(/`/g, '\\`')}\`)">
                                    💾 Save Rule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ${this.renderModalStyles()}
            `;

            document.body.appendChild(modal);
        },

        confirmSaveRule(operationKey, daadCode) {
            const modal = document.querySelector('.inventory-modal:last-child');
            const nameInput = modal.querySelector('#ruleName');
            const descInput = modal.querySelector('#ruleDescription');

            const name = nameInput.value.trim();
            const description = descInput.value.trim();

            if (!name) {
                this.showNotification('Please enter a rule name!', 'error');
                return;
            }

            const rule = {
                id: 'rule_' + Date.now(),
                name: name,
                description: description,
                operationKey: operationKey,
                daadCode: daadCode,
                created: new Date().toISOString()
            };

            if (!AdventureCreator.state.inventoryManagementSystem.savedRules) {
                AdventureCreator.state.inventoryManagementSystem.savedRules = [];
            }

            AdventureCreator.state.inventoryManagementSystem.savedRules.push(rule);
            this.saveToStorage();

            modal.remove();
            // Close the parameter modal too
            const paramModal = document.querySelector('.inventory-modal');
            if (paramModal) paramModal.remove();

            this.showNotification(`Rule "${name}" saved successfully!`, 'success');
        },

        findOperationDefinition(operationKey) {
            const definitions = this.getInventoryManagementDefinitions();
            for (const category of Object.values(definitions)) {
                if (category.operations[operationKey]) {
                    return category.operations[operationKey];
                }
            }
            return null;
        },

        buildOperationDescription(operationDef, values) {
            let desc = operationDef.name;
            if (values && Object.keys(values).length > 0) {
                const paramValues = Object.values(values).filter(v => v);
                if (paramValues.length > 0) {
                    desc += ` (${paramValues.join(', ')})`;
                }
            }
            return desc;
        },

        buildOperationCode(operationDef, values) {
            let code = operationDef.daadCode;
            if (operationDef.parameters && values) {
                operationDef.parameters.forEach(param => {
                    const value = values[param.name] || '?';
                    code = code.replace(`{${param.name}}`, value);
                });
            }
            return code;
        },

        // Interactive simulator
        simulateInventoryCommand(command) {
            const game = AdventureCreator.getCurrentGame();
            const objects = game?.daad?.objects || [];

            let title, content;

            switch(command) {
                case 'INVEN':
                    const carried = objects.filter(obj => obj.location === 252);
                    title = '🎒 Inventory (INVEN)';
                    content = carried.length > 0
                        ? `<div style="color: #ccc;">You are carrying:</div>
                           ${carried.map(obj => `<div style="padding: 0.5rem; background: #0a0a0a; margin: 0.25rem 0; border-left: 3px solid #3b82f6;">📦 ${obj.name || 'Object'}</div>`).join('')}`
                        : '<div style="color: #666; font-style: italic;">Your inventory is empty.</div>';
                    break;

                case 'LISTOBJ':
                    const currentLoc = game?.daad?.currentLocation || 0;
                    const inRoom = objects.filter(obj => obj.location === currentLoc);
                    title = '👁️ List Objects (LISTOBJ)';
                    content = inRoom.length > 0
                        ? `<div style="color: #ccc;">You can see:</div>
                           ${inRoom.map(obj => `<div style="padding: 0.5rem; background: #0a0a0a; margin: 0.25rem 0; border-left: 3px solid #f59e0b;">🏠 ${obj.name || 'Object'}</div>`).join('')}`
                        : '<div style="color: #666; font-style: italic;">There are no objects here.</div>';
                    break;

                case 'GET':
                    title = '👋 Get Object (GET)';
                    content = `
                        <div style="color: #ccc; margin-bottom: 1rem;">
                            The GET command picks up an object from the current location and adds it to your inventory (location 252).
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; border-left: 3px solid #10b981;">
                            <strong style="color: #10b981;">Example Usage:</strong>
                            <pre style="margin: 0.5rem 0 0 0; color: #3b82f6; font-family: monospace;">PRESENT key\nGET key\nMESSAGE "You pick up the key."\nOK</pre>
                        </div>
                    `;
                    break;

                case 'DROP':
                    title = '👇 Drop Object (DROP)';
                    content = `
                        <div style="color: #ccc; margin-bottom: 1rem;">
                            The DROP command removes an object from your inventory and places it in the current location.
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; border-left: 3px solid #f59e0b;">
                            <strong style="color: #f59e0b;">Example Usage:</strong>
                            <pre style="margin: 0.5rem 0 0 0; color: #3b82f6; font-family: monospace;">CARRIED torch\nDROP torch\nMESSAGE "You drop the torch."\nOK</pre>
                        </div>
                    `;
                    break;

                case 'WEAR':
                    title = '👕 Wear Object (WEAR)';
                    content = `
                        <div style="color: #ccc; margin-bottom: 1rem;">
                            The WEAR command equips an object from your inventory. The object moves to location 254 (worn items).
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; border-left: 3px solid #8b5cf6;">
                            <strong style="color: #8b5cf6;">Example Usage:</strong>
                            <pre style="margin: 0.5rem 0 0 0; color: #3b82f6; font-family: monospace;">CARRIED armor\nWEAR armor\nMESSAGE "You put on the armor."\nOK</pre>
                        </div>
                    `;
                    break;
            }

            this.showSimulatorModal(title, content);
        },

        showSimulatorModal(title, content) {
            const modal = document.createElement('div');
            modal.className = 'inventory-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h4>${title}</h4>
                            <button onclick="this.closest('.inventory-modal').remove()"
                                    style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            ${content}

                            <div style="margin-top: 1.5rem; text-align: right;">
                                <button class="btn-modal-cancel" onclick="this.closest('.inventory-modal').remove()">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                ${this.renderModalStyles()}
            `;

            document.body.appendChild(modal);
        },

        showCodePreview(code, title) {
            const modal = document.createElement('div');
            modal.className = 'inventory-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h4>📝 Generated DAAD Code: ${title}</h4>
                            <button onclick="this.closest('.inventory-modal').remove()"
                                    style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                                <pre style="margin: 0; color: #3b82f6; font-family: monospace; font-size: 0.875rem; overflow-x: auto;">${code}</pre>
                            </div>

                            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                                <button class="btn-modal-cancel" onclick="this.closest('.inventory-modal').remove()">Close</button>
                                <button class="btn-modal-add" onclick="AdventureCreator.modules['inventory-system'].copyToClipboard(\`${code.replace(/`/g, '\\`')}\`)">
                                    📋 Copy Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ${this.renderModalStyles()}
            `;

            document.body.appendChild(modal);
        },

        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Code copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy code', 'error');
            });
        },

        showTemplatesModal() {
            const templates = AdventureCreator.state.inventoryManagementSystem.ruleTemplates;

            const modal = document.createElement('div');
            modal.className = 'inventory-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 800px;">
                        <div class="modal-header">
                            <h4>📚 Inventory Rule Templates</h4>
                            <button onclick="this.closest('.inventory-modal').remove()"
                                    style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            <p style="color: #ccc; margin-bottom: 1.5rem;">
                                Pre-built templates for common inventory scenarios. Click to use or customize.
                            </p>

                            <div style="display: grid; gap: 1rem;">
                                ${templates.map(template => `
                                    <div style="background: #0a0a0a; border: 1px solid #333; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 1rem;">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                            <div>
                                                <h5 style="color: #fff; margin: 0 0 0.25rem 0;">${template.icon} ${template.name}</h5>
                                                <div style="color: #999; font-size: 0.875rem;">${template.description}</div>
                                                <div style="color: #666; font-size: 0.75rem; margin-top: 0.25rem;">Category: ${template.category}</div>
                                            </div>
                                        </div>
                                        <div style="background: #1a1a1a; padding: 0.75rem; border-radius: 4px; margin: 1rem 0;">
                                            <pre style="margin: 0; color: #3b82f6; font-family: monospace; font-size: 0.75rem; overflow-x: auto;">${template.daadCode}</pre>
                                        </div>
                                        <button class="btn-modal-add" onclick="AdventureCreator.modules['inventory-system'].useTemplate('${template.id}')">
                                            📋 Use Template
                                        </button>
                                    </div>
                                `).join('')}
                            </div>

                            <div style="margin-top: 1.5rem; text-align: right;">
                                <button class="btn-modal-cancel" onclick="this.closest('.inventory-modal').remove()">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                ${this.renderModalStyles()}
            `;

            document.body.appendChild(modal);
        },

        useTemplate(templateId) {
            const template = AdventureCreator.state.inventoryManagementSystem.ruleTemplates
                .find(t => t.id === templateId);

            if (template) {
                this.showCodePreview(template.daadCode, template.name);
                this.showNotification(`Loaded template: ${template.name}`, 'success');
            }
        },

        useExample(title, code) {
            this.showCodePreview(code, title);
        },

        showSavedRulesModal() {
            const rules = AdventureCreator.state.inventoryManagementSystem.savedRules || [];

            const modal = document.createElement('div');
            modal.className = 'inventory-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 800px;">
                        <div class="modal-header">
                            <h4>💾 Saved Inventory Rules</h4>
                            <button onclick="this.closest('.inventory-modal').remove()"
                                    style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            ${rules.length === 0 ? `
                                <div style="text-align: center; color: #666; padding: 2rem;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                                    <div>No saved rules yet. Create rules from operations to save them here.</div>
                                </div>
                            ` : `
                                <div style="display: grid; gap: 1rem;">
                                    ${rules.map(rule => `
                                        <div style="background: #0a0a0a; border: 1px solid #333; border-left: 4px solid #10b981; border-radius: 6px; padding: 1rem;">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                                <div style="flex: 1;">
                                                    <h5 style="color: #fff; margin: 0 0 0.25rem 0;">${rule.name}</h5>
                                                    <div style="color: #999; font-size: 0.875rem;">${rule.description}</div>
                                                    <div style="color: #666; font-size: 0.75rem; margin-top: 0.25rem;">
                                                        Created: ${new Date(rule.created).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <button class="btn-modal-cancel" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                                        onclick="AdventureCreator.modules['inventory-system'].deleteSavedRule('${rule.id}')">
                                                    🗑️
                                                </button>
                                            </div>
                                            <div style="background: #1a1a1a; padding: 0.75rem; border-radius: 4px; margin: 1rem 0;">
                                                <pre style="margin: 0; color: #3b82f6; font-family: monospace; font-size: 0.75rem; overflow-x: auto;">${rule.daadCode}</pre>
                                            </div>
                                            <button class="btn-modal-add" onclick="AdventureCreator.modules['inventory-system'].useSavedRule('${rule.id}')">
                                                📋 Use Rule
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            `}

                            <div style="margin-top: 1.5rem; text-align: right;">
                                <button class="btn-modal-cancel" onclick="this.closest('.inventory-modal').remove()">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                ${this.renderModalStyles()}
            `;

            document.body.appendChild(modal);
        },

        useSavedRule(ruleId) {
            const rule = (AdventureCreator.state.inventoryManagementSystem.savedRules || [])
                .find(r => r.id === ruleId);

            if (rule) {
                this.showCodePreview(rule.daadCode, rule.name);
                this.showNotification(`Loaded rule: ${rule.name}`, 'success');
            }
        },

        deleteSavedRule(ruleId) {
            const rules = AdventureCreator.state.inventoryManagementSystem.savedRules || [];
            const rule = rules.find(r => r.id === ruleId);

            if (rule) {
                AdventureCreator.state.inventoryManagementSystem.savedRules =
                    rules.filter(r => r.id !== ruleId);
                this.saveToStorage();
                this.showNotification(`Deleted rule: ${rule.name}`, 'success');

                // Close and reopen modal to refresh
                const modal = document.querySelector('.inventory-modal');
                if (modal) modal.remove();
                this.showSavedRulesModal();
            }
        },

        showHelpModal() {
            const modal = document.createElement('div');
            modal.className = 'inventory-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 700px;">
                        <div class="modal-header">
                            <h4>❓ Inventory System Help</h4>
                            <button onclick="this.closest('.inventory-modal').remove()"
                                    style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>

                        <div class="modal-body">
                            <h5 style="color: #3b82f6; margin-bottom: 1rem;">🎯 Quick Start Guide</h5>

                            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                                <strong style="color: #10b981;">Step 1: Browse Operations</strong>
                                <p style="color: #ccc; margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                                    Click the tabs to explore different inventory categories: Display, Location, Conditions, Actions, and Advanced.
                                </p>
                            </div>

                            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                                <strong style="color: #10b981;">Step 2: Select an Operation</strong>
                                <p style="color: #ccc; margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                                    Click on any operation card to configure it. Fill in parameters like object numbers or locations.
                                </p>
                            </div>

                            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                                <strong style="color: #10b981;">Step 3: Use the Code</strong>
                                <p style="color: #ccc; margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                                    Copy the generated DAAD code and paste it into your process tables. Or save it as a reusable rule.
                                </p>
                            </div>

                            <h5 style="color: #3b82f6; margin: 1.5rem 0 1rem 0;">📍 Special Locations</h5>

                            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                                <ul style="margin: 0; padding-left: 1.5rem; color: #ccc; font-size: 0.875rem;">
                                    <li><strong>252</strong> - Player Inventory (carried objects)</li>
                                    <li><strong>253</strong> - Limbo (objects created with CREATE)</li>
                                    <li><strong>254</strong> - Worn by Player (equipped items)</li>
                                    <li><strong>0-251</strong> - Game locations</li>
                                </ul>
                            </div>

                            <h5 style="color: #3b82f6; margin: 1.5rem 0 1rem 0;">💡 Tips</h5>

                            <div style="background: #0a0a0a; padding: 1rem; border-radius: 6px;">
                                <ul style="margin: 0; padding-left: 1.5rem; color: #ccc; font-size: 0.875rem;">
                                    <li>Use <strong>PRESENT</strong> before <strong>GET</strong> to check if object is available</li>
                                    <li>Use <strong>CARRIED</strong> before actions that require items</li>
                                    <li>Combine <strong>CREATE</strong> with <strong>GET</strong> for crafting systems</li>
                                    <li>Use <strong>LISTAT</strong> for remote inventory checking</li>
                                    <li>Save frequently used patterns as templates</li>
                                </ul>
                            </div>

                            <div style="margin-top: 1.5rem; text-align: right;">
                                <button class="btn-modal-add" onclick="this.closest('.inventory-modal').remove()">Got it!</button>
                            </div>
                        </div>
                    </div>
                </div>
                ${this.renderModalStyles()}
            `;

            document.body.appendChild(modal);
        },

        showNotification(message, type = 'info') {
            const bgColors = {
                success: '#10b981',
                error: '#ef4444',
                info: '#3b82f6',
                warning: '#f59e0b'
            };

            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: ${bgColors[type]};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10001;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
            `;
            notification.textContent = message;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },

        // Persistence
        saveToStorage() {
            try {
                const data = {
                    selectedTab: AdventureCreator.state.inventoryManagementSystem.selectedTab,
                    savedRules: AdventureCreator.state.inventoryManagementSystem.savedRules || [],
                    ruleTemplates: AdventureCreator.state.inventoryManagementSystem.ruleTemplates || [],
                    recentOperations: AdventureCreator.state.inventoryManagementSystem.recentOperations || []
                };
                localStorage.setItem('inventoryManagementSystem', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to save inventory system data:', error);
            }
        },

        loadFromStorage() {
            try {
                const data = localStorage.getItem('inventoryManagementSystem');
                if (data) {
                    const parsed = JSON.parse(data);
                    AdventureCreator.state.inventoryManagementSystem = {
                        ...AdventureCreator.state.inventoryManagementSystem,
                        ...parsed,
                        ruleTemplates: parsed.ruleTemplates || this.getDefaultTemplates()
                    };
                }
            } catch (error) {
                console.error('Failed to load inventory system data:', error);
            }
        }
    };

    // Register the module
    AdventureCreator.registerModule('inventory-system', InventoryManagementSystem);

    console.log('Inventory Management System registered successfully');

})();
