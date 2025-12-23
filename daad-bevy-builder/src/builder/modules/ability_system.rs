/// Module 32: ABILITY System
/// Manages special player abilities and powers (ABILITY condact)
use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// Player ability system
#[derive(Debug, Clone, Serialize, Deserialize, Resource, Default)]
pub struct AbilitySystem {
    pub abilities: Vec<Ability>,
    pub ability_flag_start: u8,  // Starting flag ID for abilities (default: 200)
}

impl AbilitySystem {
    pub fn new() -> Self {
        Self {
            abilities: Vec::new(),
            ability_flag_start: 200,
        }
    }

    /// Generate DAAD code
    pub fn to_daad_code(&self) -> String {
        let mut code = String::from("; Player Abilities System\n\n");

        for ability in &self.abilities {
            code.push_str(&ability.to_daad_code(self.ability_flag_start));
        }

        code
    }
}

/// Player ability/power
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ability {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub ability_type: AbilityType,
    pub initially_active: bool,
    pub grants_access: Vec<AccessGrant>,
    pub required_item: Option<u8>,  // Object required to use ability
    pub enabled: bool,
}

impl Ability {
    pub fn new(id: u8, name: String, ability_type: AbilityType) -> Self {
        Self {
            id,
            name,
            description: String::new(),
            ability_type,
            initially_active: false,
            grants_access: Vec::new(),
            required_item: None,
            enabled: true,
        }
    }

    /// Get flag ID for this ability
    pub fn flag_id(&self, flag_start: u8) -> u8 {
        flag_start + self.id
    }

    pub fn to_daad_code(&self, flag_start: u8) -> String {
        let mut code = format!("; Ability: {}\n", self.name);
        code.push_str(&format!("; Type: {:?}\n", self.ability_type));
        code.push_str(&format!("; Description: {}\n", self.description));
        code.push_str(&format!("; Flag: {}\n\n", self.flag_id(flag_start)));

        // Initial state
        if self.initially_active {
            code.push_str(&format!("SET {} 1  ; Initially active\n", self.flag_id(flag_start)));
        }

        // Grant access examples
        for grant in &self.grants_access {
            code.push_str(&grant.to_daad_code(self.flag_id(flag_start)));
        }

        code.push('\n');
        code
    }
}

/// Type of ability
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum AbilityType {
    Swimming,       // Can swim in water
    Flying,         // Can fly/levitate
    Climbing,       // Can climb
    Strength,       // Extra strength
    Magic,          // Can use magic
    Stealth,        // Can move silently
    Vision,         // Can see in dark
    Language,       // Can understand language
    Technology,     // Can use tech
    Custom,         // Custom ability
}

impl AbilityType {
    pub fn name(&self) -> &'static str {
        match self {
            AbilityType::Swimming => "Swimming",
            AbilityType::Flying => "Flying",
            AbilityType::Climbing => "Climbing",
            AbilityType::Strength => "Strength",
            AbilityType::Magic => "Magic",
            AbilityType::Stealth => "Stealth",
            AbilityType::Vision => "Night Vision",
            AbilityType::Language => "Language",
            AbilityType::Technology => "Technology Use",
            AbilityType::Custom => "Custom Ability",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            AbilityType::Swimming => "Ability to swim in water",
            AbilityType::Flying => "Ability to fly or levitate",
            AbilityType::Climbing => "Ability to climb walls/ropes",
            AbilityType::Strength => "Enhanced physical strength",
            AbilityType::Magic => "Ability to cast spells",
            AbilityType::Stealth => "Move silently without detection",
            AbilityType::Vision => "See in darkness",
            AbilityType::Language => "Understand foreign languages",
            AbilityType::Technology => "Operate complex technology",
            AbilityType::Custom => "Custom defined ability",
        }
    }

    pub fn icon(&self) -> &'static str {
        match self {
            AbilityType::Swimming => "🏊",
            AbilityType::Flying => "🦅",
            AbilityType::Climbing => "🧗",
            AbilityType::Strength => "💪",
            AbilityType::Magic => "🔮",
            AbilityType::Stealth => "🥷",
            AbilityType::Vision => "👁️",
            AbilityType::Language => "💬",
            AbilityType::Technology => "🔧",
            AbilityType::Custom => "⭐",
        }
    }
}

/// What an ability grants access to
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AccessGrant {
    Location(u8),       // Can access location
    Direction(String),  // Can go in direction
    Action(usize),      // Can perform action
    Object(u8),         // Can interact with object
}

impl AccessGrant {
    pub fn to_daad_code(&self, ability_flag: u8) -> String {
        match self {
            AccessGrant::Location(loc) => {
                format!("; Can access location {} with this ability\nNOTZERO {} AT {} MESSAGE \"You can now access this area!\"\n", loc, ability_flag, loc)
            }
            AccessGrant::Direction(dir) => {
                format!("; Can go {} with this ability\nNOTZERO {} MESSAGE \"You can now go {}!\"\n", dir, ability_flag, dir)
            }
            AccessGrant::Action(action) => {
                format!("; Can perform action {} with this ability\nNOTZERO {} ACTION_{}\n", action, ability_flag, action)
            }
            AccessGrant::Object(obj) => {
                format!("; Can interact with object {} with this ability\nNOTZERO {} PRESENT {} MESSAGE \"You can now use this!\"\n", obj, ability_flag, obj)
            }
        }
    }
}

/// Ability templates
pub enum AbilityTemplate {
    Swimmer,
    Flyer,
    Climber,
    MageWizard,
    StealthThief,
}

impl AbilityTemplate {
    pub fn create_ability(&self, id: u8) -> Ability {
        match self {
            AbilityTemplate::Swimmer => Ability {
                id,
                name: "Swimming".to_string(),
                description: "Can swim across rivers and lakes".to_string(),
                ability_type: AbilityType::Swimming,
                initially_active: false,
                grants_access: vec![],
                required_item: None,
                enabled: true,
            },
            AbilityTemplate::Flyer => Ability {
                id,
                name: "Flying".to_string(),
                description: "Can fly over obstacles".to_string(),
                ability_type: AbilityType::Flying,
                initially_active: false,
                grants_access: vec![],
                required_item: None,
                enabled: true,
            },
            AbilityTemplate::Climber => Ability {
                id,
                name: "Climbing".to_string(),
                description: "Can climb walls and cliffs".to_string(),
                ability_type: AbilityType::Climbing,
                initially_active: false,
                grants_access: vec![],
                required_item: Some(10), // Rope
                enabled: true,
            },
            AbilityTemplate::MageWizard => Ability {
                id,
                name: "Magic".to_string(),
                description: "Can cast magical spells".to_string(),
                ability_type: AbilityType::Magic,
                initially_active: false,
                grants_access: vec![],
                required_item: Some(20), // Wand
                enabled: true,
            },
            AbilityTemplate::StealthThief => Ability {
                id,
                name: "Stealth".to_string(),
                description: "Can move silently and pick locks".to_string(),
                ability_type: AbilityType::Stealth,
                initially_active: true,
                grants_access: vec![],
                required_item: None,
                enabled: true,
            },
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            AbilityTemplate::Swimmer => "Swimmer",
            AbilityTemplate::Flyer => "Flyer",
            AbilityTemplate::Climber => "Climber",
            AbilityTemplate::MageWizard => "Mage/Wizard",
            AbilityTemplate::StealthThief => "Stealth/Thief",
        }
    }
}

/// Bevy plugin
pub struct AbilitySystemPlugin;

impl Plugin for AbilitySystemPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<AbilitySystem>()
            .add_systems(Update, (
                render_ability_ui,
                handle_add_ability_button,
                handle_ability_toggle,
                handle_template_selection,
            ));
    }
}

fn render_ability_ui(/* Bevy systems */) {
    // TODO: List of abilities with on/off toggles
}

fn handle_add_ability_button(/* Bevy systems */) {
    // TODO: Create new ability
}

fn handle_ability_toggle(/* Bevy systems */) {
    // TODO: Enable/disable ability
}

fn handle_template_selection(/* Bevy systems */) {
    // TODO: Apply ability template
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ability_creation() {
        let ability = Ability::new(0, "Test".to_string(), AbilityType::Swimming);
        assert_eq!(ability.name, "Test");
        assert_eq!(ability.ability_type, AbilityType::Swimming);
    }

    #[test]
    fn test_flag_id() {
        let ability = Ability::new(5, "Test".to_string(), AbilityType::Flying);
        assert_eq!(ability.flag_id(200), 205);
    }
}
