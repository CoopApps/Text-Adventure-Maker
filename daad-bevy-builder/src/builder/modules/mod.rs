/// DAAD Professional Modules System
/// 8 Additional modules for 100% DAAD specification coverage
///
/// These modules complement the original 30-module plan to provide
/// complete DAAD v1 and v2 feature support.

pub mod object_attributes;      // Module 34: Object states (scenery, openable, lockable, etc.)
pub mod response_table;         // Module 37: System message customization (SYSMESS 0-61)
pub mod timeout_turns;          // Module 31: Turn counting and timed events (TIMEOUT, TURNS)
pub mod random_chance;          // Module 33: Randomization and probability (CHANCE, RANDOM)
pub mod auto_actions;           // Module 35: Automatic inventory (AUTOG, AUTOD, AUTOP, etc.)
pub mod score_win;              // Module 38: Scoring and win conditions
pub mod ability_system;         // Module 32: Player abilities/powers (ABILITY)
pub mod extern_system;          // Module 36: External routines (EXTERN)

// Re-export module plugins for easy registration
pub use object_attributes::ObjectAttributesPlugin;
pub use response_table::ResponseTablePlugin;
pub use timeout_turns::TimeoutTurnsPlugin;
pub use random_chance::RandomChancePlugin;
pub use auto_actions::AutoActionsPlugin;
pub use score_win::ScoreWinPlugin;
pub use ability_system::AbilitySystemPlugin;
pub use extern_system::ExternSystemPlugin;

/// Module registry - registers all 8 modules with Bevy
pub struct ModuleRegistryPlugin;

impl bevy::prelude::Plugin for ModuleRegistryPlugin {
    fn build(&self, app: &mut bevy::prelude::App) {
        // Register all module plugins
        app
            // HIGH priority modules
            .add_plugins(ObjectAttributesPlugin)
            .add_plugins(ResponseTablePlugin)

            // MEDIUM priority modules
            .add_plugins(TimeoutTurnsPlugin)
            .add_plugins(RandomChancePlugin)
            .add_plugins(AutoActionsPlugin)
            .add_plugins(ScoreWinPlugin)

            // LOW priority modules
            .add_plugins(AbilitySystemPlugin)
            .add_plugins(ExternSystemPlugin);
    }
}

/// Module metadata for UI display
pub struct ModuleInfo {
    pub id: u8,
    pub name: &'static str,
    pub description: &'static str,
    pub priority: ModulePriority,
    pub icon: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModulePriority {
    High,
    Medium,
    Low,
}

/// Get all module information
pub fn get_all_modules() -> Vec<ModuleInfo> {
    vec![
        ModuleInfo {
            id: 34,
            name: "Object Attributes",
            description: "Advanced object properties: scenery, openable, lockable, switchable, breakable",
            priority: ModulePriority::High,
            icon: "🔧",
        },
        ModuleInfo {
            id: 37,
            name: "Response Table Editor",
            description: "Customize DAAD's 62 system messages (SYSMESS 0-61)",
            priority: ModulePriority::High,
            icon: "💬",
        },
        ModuleInfo {
            id: 31,
            name: "Timeout/Turns System",
            description: "Turn counting and time-based events (TIMEOUT, TURNS condacts)",
            priority: ModulePriority::Medium,
            icon: "⏱️",
        },
        ModuleInfo {
            id: 33,
            name: "Random/Chance System",
            description: "Randomization and probability (CHANCE, RANDOM condacts)",
            priority: ModulePriority::Medium,
            icon: "🎲",
        },
        ModuleInfo {
            id: 35,
            name: "Auto-Actions System",
            description: "Automatic inventory management (AUTOG, AUTOD, AUTOP, AUTOR, AUTOW)",
            priority: ModulePriority::Medium,
            icon: "🤖",
        },
        ModuleInfo {
            id: 38,
            name: "Score & Win Conditions",
            description: "Scoring system and game completion conditions",
            priority: ModulePriority::Medium,
            icon: "🏆",
        },
        ModuleInfo {
            id: 32,
            name: "Ability System",
            description: "Player abilities and powers (ABILITY condact)",
            priority: ModulePriority::Low,
            icon: "⭐",
        },
        ModuleInfo {
            id: 36,
            name: "EXTERN System",
            description: "External routine calls (EXTERN condact) - Advanced feature",
            priority: ModulePriority::Low,
            icon: "🔌",
        },
    ]
}

/// Get module count by priority
pub fn get_module_counts() -> (usize, usize, usize) {
    let modules = get_all_modules();
    let high = modules.iter().filter(|m| m.priority == ModulePriority::High).count();
    let medium = modules.iter().filter(|m| m.priority == ModulePriority::Medium).count();
    let low = modules.iter().filter(|m| m.priority == ModulePriority::Low).count();
    (high, medium, low)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_module_count() {
        let modules = get_all_modules();
        assert_eq!(modules.len(), 8);

        let (high, medium, low) = get_module_counts();
        assert_eq!(high, 2);
        assert_eq!(medium, 4);
        assert_eq!(low, 2);
    }

    #[test]
    fn test_module_ids() {
        let modules = get_all_modules();
        let ids: Vec<u8> = modules.iter().map(|m| m.id).collect();
        assert!(ids.contains(&34));
        assert!(ids.contains(&37));
        assert!(ids.contains(&31));
        assert!(ids.contains(&33));
        assert!(ids.contains(&35));
        assert!(ids.contains(&38));
        assert!(ids.contains(&32));
        assert!(ids.contains(&36));
    }
}
