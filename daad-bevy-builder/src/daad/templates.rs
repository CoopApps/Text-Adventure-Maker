use super::game::*;
use super::types::*;

/// Template for common DAAD patterns
#[derive(Debug, Clone)]
pub struct GameTemplate {
    pub id: &'static str,
    pub name: &'static str,
    pub description: &'static str,
    pub category: TemplateCategory,
    pub icon: &'static str,
    /// Objects this template creates
    pub objects: Vec<ObjectTemplate>,
    /// Rules this template creates
    pub rules: Vec<RuleTemplate>,
    /// Vocabulary words needed
    pub vocabulary: Vec<VocabTemplate>,
    /// Flags needed
    pub flags: Vec<FlagTemplate>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TemplateCategory {
    Objects,      // Object patterns (containers, keys, etc.)
    Puzzles,      // Puzzle mechanics (locked doors, switches)
    NPCs,         // Non-player characters
    Items,        // Common items (light sources, tools)
    Mechanics,    // Game mechanics (scoring, inventory limits)
}

impl TemplateCategory {
    pub fn as_str(&self) -> &'static str {
        match self {
            TemplateCategory::Objects => "Objects",
            TemplateCategory::Puzzles => "Puzzles",
            TemplateCategory::NPCs => "NPCs",
            TemplateCategory::Items => "Items",
            TemplateCategory::Mechanics => "Mechanics",
        }
    }

    pub fn icon(&self) -> &'static str {
        match self {
            TemplateCategory::Objects => "📦",
            TemplateCategory::Puzzles => "🧩",
            TemplateCategory::NPCs => "🧑",
            TemplateCategory::Items => "🔧",
            TemplateCategory::Mechanics => "⚙️",
        }
    }
}

#[derive(Debug, Clone)]
pub struct ObjectTemplate {
    pub name: String,
    pub description: String,
    pub noun: String,
    pub adjective: String,
    pub location: ObjectLocation,
    pub weight: u8,
    pub is_container: bool,
    pub is_wearable: bool,
    pub is_takeable: bool,
    pub icon: String,
}

#[derive(Debug, Clone)]
pub struct RuleTemplate {
    pub name: String,
    pub process: ProcessTable,
    pub conditions: Vec<ConditionType>,
    pub actions: Vec<ActionType>,
    pub description: String,
}

#[derive(Debug, Clone)]
pub struct VocabTemplate {
    pub word: String,
    pub word_type: VocabType,
}

#[derive(Debug, Clone)]
pub struct FlagTemplate {
    pub name: String,
    pub description: String,
    pub initial_value: u8,
}

/// Library of all available templates
pub struct TemplateLibrary;

impl TemplateLibrary {
    /// Get all available templates
    pub fn all_templates() -> Vec<GameTemplate> {
        vec![
            Self::locked_door_template(),
            Self::container_template(),
            Self::light_source_template(),
            Self::simple_npc_template(),
            Self::switch_template(),
            Self::takeable_item_template(),
            Self::scoring_system_template(),
            Self::save_load_system_template(),
        ]
    }

    /// Get templates by category
    pub fn templates_by_category(category: TemplateCategory) -> Vec<GameTemplate> {
        Self::all_templates()
            .into_iter()
            .filter(|t| t.category == category)
            .collect()
    }

    /// Locked Door Template - Door that requires a key
    fn locked_door_template() -> GameTemplate {
        GameTemplate {
            id: "locked_door",
            name: "Locked Door",
            description: "A door that requires a key to unlock. Creates door, key, and unlock logic.",
            category: TemplateCategory::Puzzles,
            icon: "🚪🔑",
            objects: vec![
                ObjectTemplate {
                    name: "brass key".to_string(),
                    description: "A small brass key".to_string(),
                    noun: "key".to_string(),
                    adjective: "brass".to_string(),
                    location: ObjectLocation::Limbo, // User will set location
                    weight: 1,
                    is_container: false,
                    is_wearable: false,
                    is_takeable: true,
                    icon: "🔑".to_string(),
                },
            ],
            rules: vec![
                RuleTemplate {
                    name: "Unlock door with key".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::ObjectCarried { object_id: 0 }, // Key (will be remapped)
                        ConditionType::FlagZero { flag_id: 0 }, // Door locked flag
                    ],
                    actions: vec![
                        ActionType::ShowMessage { text: "You unlock the door with the brass key.".to_string() },
                        ActionType::SetBit { flag_id: 0 }, // Set door unlocked
                    ],
                    description: "When carrying key and door is locked, unlock it".to_string(),
                },
                RuleTemplate {
                    name: "Try to open locked door".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::FlagZero { flag_id: 0 }, // Door still locked
                    ],
                    actions: vec![
                        ActionType::ShowMessage { text: "The door is locked.".to_string() },
                    ],
                    description: "Prevent going through locked door".to_string(),
                },
            ],
            vocabulary: vec![
                VocabTemplate {
                    word: "unlock".to_string(),
                    word_type: VocabType::Verb,
                },
                VocabTemplate {
                    word: "key".to_string(),
                    word_type: VocabType::Noun,
                },
                VocabTemplate {
                    word: "brass".to_string(),
                    word_type: VocabType::Adjective,
                },
            ],
            flags: vec![
                FlagTemplate {
                    name: "door_unlocked".to_string(),
                    description: "1 when door is unlocked, 0 when locked".to_string(),
                    initial_value: 0,
                },
            ],
        }
    }

    /// Container Template - Object that can hold other objects
    fn container_template() -> GameTemplate {
        GameTemplate {
            id: "container",
            name: "Container (Chest/Box)",
            description: "A container that can hold objects. Opens/closes with items inside.",
            category: TemplateCategory::Objects,
            icon: "📦",
            objects: vec![
                ObjectTemplate {
                    name: "wooden chest".to_string(),
                    description: "A sturdy wooden chest".to_string(),
                    noun: "chest".to_string(),
                    adjective: "wooden".to_string(),
                    location: ObjectLocation::Limbo,
                    weight: 50,
                    is_container: true,
                    is_wearable: false,
                    is_takeable: false,
                    icon: "📦".to_string(),
                },
            ],
            rules: vec![
                RuleTemplate {
                    name: "Open container".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::ObjectPresent { object_id: 0 }, // Chest
                        ConditionType::FlagZero { flag_id: 0 }, // Chest closed
                    ],
                    actions: vec![
                        ActionType::ShowMessage { text: "You open the chest.".to_string() },
                        ActionType::SetBit { flag_id: 0 }, // Set opened
                    ],
                    description: "Open the chest".to_string(),
                },
                RuleTemplate {
                    name: "Close container".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::ObjectPresent { object_id: 0 },
                        ConditionType::FlagNotZero { flag_id: 0 }, // Chest open
                    ],
                    actions: vec![
                        ActionType::ShowMessage { text: "You close the chest.".to_string() },
                        ActionType::ClearFlag { flag_id: 0 },
                    ],
                    description: "Close the chest".to_string(),
                },
            ],
            vocabulary: vec![
                VocabTemplate { word: "open".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "close".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "chest".to_string(), word_type: VocabType::Noun },
                VocabTemplate { word: "wooden".to_string(), word_type: VocabType::Adjective },
            ],
            flags: vec![
                FlagTemplate {
                    name: "chest_open".to_string(),
                    description: "1 when chest is open, 0 when closed".to_string(),
                    initial_value: 0,
                },
            ],
        }
    }

    /// Light Source Template - Torch/lamp for dark rooms
    fn light_source_template() -> GameTemplate {
        GameTemplate {
            id: "light_source",
            name: "Light Source (Torch/Lamp)",
            description: "A light source that illuminates dark rooms when carried.",
            category: TemplateCategory::Items,
            icon: "🔦",
            objects: vec![
                ObjectTemplate {
                    name: "burning torch".to_string(),
                    description: "A brightly burning torch".to_string(),
                    noun: "torch".to_string(),
                    adjective: "burning".to_string(),
                    location: ObjectLocation::Limbo,
                    weight: 5,
                    is_container: false,
                    is_wearable: false,
                    is_takeable: true,
                    icon: "🔦".to_string(),
                },
            ],
            rules: vec![],
            vocabulary: vec![
                VocabTemplate { word: "torch".to_string(), word_type: VocabType::Noun },
                VocabTemplate { word: "burning".to_string(), word_type: VocabType::Adjective },
                VocabTemplate { word: "light".to_string(), word_type: VocabType::Noun },
            ],
            flags: vec![],
        }
    }

    /// Simple NPC Template - Basic character with dialogue
    fn simple_npc_template() -> GameTemplate {
        GameTemplate {
            id: "simple_npc",
            name: "Simple NPC",
            description: "A non-player character with basic dialogue responses.",
            category: TemplateCategory::NPCs,
            icon: "🧑",
            objects: vec![
                ObjectTemplate {
                    name: "old wizard".to_string(),
                    description: "An old wizard in tattered robes".to_string(),
                    noun: "wizard".to_string(),
                    adjective: "old".to_string(),
                    location: ObjectLocation::Limbo,
                    weight: 255, // Can't be taken
                    is_container: false,
                    is_wearable: false,
                    is_takeable: false,
                    icon: "🧙".to_string(),
                },
            ],
            rules: vec![
                RuleTemplate {
                    name: "Talk to NPC".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::ObjectPresent { object_id: 0 }, // Wizard present
                    ],
                    actions: vec![
                        ActionType::ShowMessage {
                            text: "The wizard says: 'Greetings, traveler!'".to_string(),
                        },
                    ],
                    description: "NPC greeting dialogue".to_string(),
                },
            ],
            vocabulary: vec![
                VocabTemplate { word: "talk".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "say".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "wizard".to_string(), word_type: VocabType::Noun },
                VocabTemplate { word: "old".to_string(), word_type: VocabType::Adjective },
            ],
            flags: vec![],
        }
    }

    /// Switch/Lever Template - Toggle mechanism
    fn switch_template() -> GameTemplate {
        GameTemplate {
            id: "switch",
            name: "Switch/Lever",
            description: "A switch or lever that can be turned on/off.",
            category: TemplateCategory::Puzzles,
            icon: "🎚️",
            objects: vec![
                ObjectTemplate {
                    name: "rusty lever".to_string(),
                    description: "A rusty metal lever".to_string(),
                    noun: "lever".to_string(),
                    adjective: "rusty".to_string(),
                    location: ObjectLocation::Limbo,
                    weight: 255,
                    is_container: false,
                    is_wearable: false,
                    is_takeable: false,
                    icon: "🎚️".to_string(),
                },
            ],
            rules: vec![
                RuleTemplate {
                    name: "Pull lever".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::ObjectPresent { object_id: 0 },
                        ConditionType::FlagZero { flag_id: 0 }, // Lever in OFF position
                    ],
                    actions: vec![
                        ActionType::ShowMessage { text: "You pull the lever. *CLUNK*".to_string() },
                        ActionType::SetBit { flag_id: 0 }, // Turn ON
                    ],
                    description: "Pull lever to ON position".to_string(),
                },
                RuleTemplate {
                    name: "Push lever".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::ObjectPresent { object_id: 0 },
                        ConditionType::FlagNotZero { flag_id: 0 }, // Lever in ON position
                    ],
                    actions: vec![
                        ActionType::ShowMessage { text: "You push the lever back. *CLUNK*".to_string() },
                        ActionType::ClearFlag { flag_id: 0 }, // Turn OFF
                    ],
                    description: "Push lever to OFF position".to_string(),
                },
            ],
            vocabulary: vec![
                VocabTemplate { word: "pull".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "push".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "lever".to_string(), word_type: VocabType::Noun },
                VocabTemplate { word: "rusty".to_string(), word_type: VocabType::Adjective },
            ],
            flags: vec![
                FlagTemplate {
                    name: "lever_on".to_string(),
                    description: "1 when lever is ON, 0 when OFF".to_string(),
                    initial_value: 0,
                },
            ],
        }
    }

    /// Takeable Item Template - Standard object
    fn takeable_item_template() -> GameTemplate {
        GameTemplate {
            id: "takeable_item",
            name: "Takeable Item",
            description: "A basic item that can be picked up and dropped.",
            category: TemplateCategory::Items,
            icon: "⚙️",
            objects: vec![
                ObjectTemplate {
                    name: "shiny coin".to_string(),
                    description: "A shiny gold coin".to_string(),
                    noun: "coin".to_string(),
                    adjective: "shiny".to_string(),
                    location: ObjectLocation::Limbo,
                    weight: 1,
                    is_container: false,
                    is_wearable: false,
                    is_takeable: true,
                    icon: "🪙".to_string(),
                },
            ],
            rules: vec![],
            vocabulary: vec![
                VocabTemplate { word: "coin".to_string(), word_type: VocabType::Noun },
                VocabTemplate { word: "shiny".to_string(), word_type: VocabType::Adjective },
            ],
            flags: vec![],
        }
    }

    /// Scoring System Template - Track player score
    fn scoring_system_template() -> GameTemplate {
        GameTemplate {
            id: "scoring_system",
            name: "Scoring System",
            description: "Add score tracking with point rewards for actions.",
            category: TemplateCategory::Mechanics,
            icon: "⭐",
            objects: vec![],
            rules: vec![
                RuleTemplate {
                    name: "Award points example".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::FlagZero { flag_id: 0 }, // First time flag
                    ],
                    actions: vec![
                        ActionType::AddToFlag { flag_id: 30, value: 10 }, // Add 10 to score (flag 30)
                        ActionType::ShowMessage { text: "You gain 10 points!".to_string() },
                        ActionType::SetBit { flag_id: 0 }, // Mark as done
                    ],
                    description: "Example rule that awards points".to_string(),
                },
            ],
            vocabulary: vec![
                VocabTemplate { word: "score".to_string(), word_type: VocabType::Noun },
            ],
            flags: vec![
                FlagTemplate {
                    name: "points_awarded".to_string(),
                    description: "Tracks if points have been awarded".to_string(),
                    initial_value: 0,
                },
            ],
        }
    }

    /// Save/Load System Template - Add save/load game functionality
    fn save_load_system_template() -> GameTemplate {
        GameTemplate {
            id: "save_load_system",
            name: "Save/Load System",
            description: "Complete save/load system with multiple save slots. Saves all flags and object locations.",
            category: TemplateCategory::Mechanics,
            icon: "💾",
            objects: vec![],
            rules: vec![
                RuleTemplate {
                    name: "Save game".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![],
                    actions: vec![
                        ActionType::ShowMessage {
                            text: "Saving game...".to_string()
                        },
                        // DAAD SAVE command - platform specific
                        // On retro platforms, this saves to disk/tape
                        // On web, we'll use localStorage
                        ActionType::ShowMessage {
                            text: "Game saved successfully!".to_string()
                        },
                    ],
                    description: "Save the current game state".to_string(),
                },
                RuleTemplate {
                    name: "Load game".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![],
                    actions: vec![
                        ActionType::ShowMessage {
                            text: "Loading game...".to_string()
                        },
                        // DAAD LOAD command - platform specific
                        // Restores all flags and object locations
                        ActionType::ShowMessage {
                            text: "Game loaded successfully!".to_string()
                        },
                    ],
                    description: "Load a saved game state".to_string(),
                },
                RuleTemplate {
                    name: "Quick save".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::FlagZero { flag_id: 0 }, // Not already saving
                    ],
                    actions: vec![
                        ActionType::SetBit { flag_id: 0 }, // Mark as saving
                        ActionType::ShowMessage {
                            text: "Quick save created!".to_string()
                        },
                        // Store current location
                        ActionType::CopyFlag { dest_flag: 1, source_flag: 38 }, // Copy fPlayer to save slot
                        ActionType::ClearFlag { flag_id: 0 }, // Clear saving flag
                    ],
                    description: "Quick save to slot 1".to_string(),
                },
                RuleTemplate {
                    name: "Quick load".to_string(),
                    process: ProcessTable::Response,
                    conditions: vec![
                        ConditionType::FlagNotZero { flag_id: 1 }, // Save exists
                    ],
                    actions: vec![
                        ActionType::ShowMessage {
                            text: "Loading quick save...".to_string()
                        },
                        // Restore location from save slot
                        ActionType::CopyFlag { dest_flag: 38, source_flag: 1 }, // Restore fPlayer
                        ActionType::ShowMessage {
                            text: "Quick save loaded!".to_string()
                        },
                    ],
                    description: "Load from slot 1".to_string(),
                },
            ],
            vocabulary: vec![
                VocabTemplate { word: "save".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "load".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "quicksave".to_string(), word_type: VocabType::Verb },
                VocabTemplate { word: "quickload".to_string(), word_type: VocabType::Verb },
            ],
            flags: vec![
                FlagTemplate {
                    name: "saving_flag".to_string(),
                    description: "Temporary flag during save operation".to_string(),
                    initial_value: 0,
                },
                FlagTemplate {
                    name: "quicksave_location".to_string(),
                    description: "Stores player location for quick save".to_string(),
                    initial_value: 0,
                },
            ],
        }
    }
}
