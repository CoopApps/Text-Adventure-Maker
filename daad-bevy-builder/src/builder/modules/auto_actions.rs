/// Module 35: Auto-Actions System
/// Manages automatic object handling (AUTOG, AUTOD, AUTOP, AUTOR, AUTOW)
use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// Automatic action system for smart inventory management
#[derive(Debug, Clone, Serialize, Deserialize, Resource, Default)]
pub struct AutoActionSystem {
    pub auto_get_rules: Vec<AutoGetRule>,
    pub auto_drop_rules: Vec<AutoDropRule>,
    pub auto_put_rules: Vec<AutoPutRule>,
    pub auto_remove_rules: Vec<AutoRemoveRule>,
    pub auto_wear_rules: Vec<AutoWearRule>,
}

impl AutoActionSystem {
    pub fn new() -> Self {
        Self::default()
    }

    /// Generate DAAD code for all auto-actions
    pub fn to_daad_code(&self) -> String {
        let mut code = String::from("; Auto-Actions System\n\n");

        // Auto-get rules
        if !self.auto_get_rules.is_empty() {
            code.push_str("; AUTOG - Automatically get objects\n");
            for rule in &self.auto_get_rules {
                code.push_str(&rule.to_daad_code());
            }
            code.push('\n');
        }

        // Auto-drop rules
        if !self.auto_drop_rules.is_empty() {
            code.push_str("; AUTOD - Automatically drop objects\n");
            for rule in &self.auto_drop_rules {
                code.push_str(&rule.to_daad_code());
            }
            code.push('\n');
        }

        // Auto-put rules
        if !self.auto_put_rules.is_empty() {
            code.push_str("; AUTOP - Automatically put in containers\n");
            for rule in &self.auto_put_rules {
                code.push_str(&rule.to_daad_code());
            }
            code.push('\n');
        }

        // Auto-remove rules
        if !self.auto_remove_rules.is_empty() {
            code.push_str("; AUTOR - Automatically remove worn items\n");
            for rule in &self.auto_remove_rules {
                code.push_str(&rule.to_daad_code());
            }
            code.push('\n');
        }

        // Auto-wear rules
        if !self.auto_wear_rules.is_empty() {
            code.push_str("; AUTOW - Automatically wear items\n");
            for rule in &self.auto_wear_rules {
                code.push_str(&rule.to_daad_code());
            }
            code.push('\n');
        }

        code
    }
}

/// Auto-get rule: automatically pick up objects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoGetRule {
    pub id: usize,
    pub name: String,
    pub object_id: u8,
    pub condition: Option<usize>,
    pub message: Option<String>,
    pub enabled: bool,
}

impl AutoGetRule {
    pub fn new(id: usize, name: String, object_id: u8) -> Self {
        Self {
            id,
            name,
            object_id,
            condition: None,
            message: None,
            enabled: true,
        }
    }

    pub fn to_daad_code(&self) -> String {
        let mut code = format!("; Auto-get: {}\n", self.name);
        if let Some(cond) = self.condition {
            code.push_str(&format!("CONDITION_{} ", cond));
        }
        code.push_str(&format!("AUTOG {}\n", self.object_id));
        if let Some(msg) = &self.message {
            code.push_str(&format!("MESSAGE \"{}\"\n", msg));
        }
        code
    }
}

/// Auto-drop rule: automatically drop objects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoDropRule {
    pub id: usize,
    pub name: String,
    pub object_id: u8,
    pub trigger: AutoDropTrigger,
    pub message: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AutoDropTrigger {
    OnWeightLimit,      // Drop when carrying too much
    OnCondition(usize), // Drop when condition met
    OnTimeout(u32),     // Drop after N turns
}

impl AutoDropRule {
    pub fn new(id: usize, name: String, object_id: u8, trigger: AutoDropTrigger) -> Self {
        Self {
            id,
            name,
            object_id,
            trigger,
            message: None,
            enabled: true,
        }
    }

    pub fn to_daad_code(&self) -> String {
        let mut code = format!("; Auto-drop: {}\n", self.name);
        match &self.trigger {
            AutoDropTrigger::OnWeightLimit => {
                code.push_str("WEIGHT 255 AND ");
            }
            AutoDropTrigger::OnCondition(cond) => {
                code.push_str(&format!("CONDITION_{} AND ", cond));
            }
            AutoDropTrigger::OnTimeout(turns) => {
                code.push_str(&format!("TURNS {} AND ", turns));
            }
        }
        code.push_str(&format!("AUTOD {}\n", self.object_id));
        if let Some(msg) = &self.message {
            code.push_str(&format!("MESSAGE \"{}\"\n", msg));
        }
        code
    }
}

/// Auto-put rule: automatically put objects in containers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoPutRule {
    pub id: usize,
    pub name: String,
    pub object_id: u8,
    pub container_id: u8,
    pub condition: Option<usize>,
    pub message: Option<String>,
    pub enabled: bool,
}

impl AutoPutRule {
    pub fn new(id: usize, name: String, object_id: u8, container_id: u8) -> Self {
        Self {
            id,
            name,
            object_id,
            container_id,
            condition: None,
            message: None,
            enabled: true,
        }
    }

    pub fn to_daad_code(&self) -> String {
        let mut code = format!("; Auto-put: {}\n", self.name);
        if let Some(cond) = self.condition {
            code.push_str(&format!("CONDITION_{} ", cond));
        }
        code.push_str(&format!("AUTOP {} {}\n", self.object_id, self.container_id));
        if let Some(msg) = &self.message {
            code.push_str(&format!("MESSAGE \"{}\"\n", msg));
        }
        code
    }
}

/// Auto-remove rule: automatically take off worn items
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoRemoveRule {
    pub id: usize,
    pub name: String,
    pub object_id: u8,
    pub condition: Option<usize>,
    pub message: Option<String>,
    pub enabled: bool,
}

impl AutoRemoveRule {
    pub fn new(id: usize, name: String, object_id: u8) -> Self {
        Self {
            id,
            name,
            object_id,
            condition: None,
            message: None,
            enabled: true,
        }
    }

    pub fn to_daad_code(&self) -> String {
        let mut code = format!("; Auto-remove: {}\n", self.name);
        if let Some(cond) = self.condition {
            code.push_str(&format!("CONDITION_{} ", cond));
        }
        code.push_str(&format!("AUTOR {}\n", self.object_id));
        if let Some(msg) = &self.message {
            code.push_str(&format!("MESSAGE \"{}\"\n", msg));
        }
        code
    }
}

/// Auto-wear rule: automatically wear items
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoWearRule {
    pub id: usize,
    pub name: String,
    pub object_id: u8,
    pub condition: Option<usize>,
    pub message: Option<String>,
    pub enabled: bool,
}

impl AutoWearRule {
    pub fn new(id: usize, name: String, object_id: u8) -> Self {
        Self {
            id,
            name,
            object_id,
            condition: None,
            message: None,
            enabled: true,
        }
    }

    pub fn to_daad_code(&self) -> String {
        let mut code = format!("; Auto-wear: {}\n", self.name);
        if let Some(cond) = self.condition {
            code.push_str(&format!("CONDITION_{} ", cond));
        }
        code.push_str(&format!("AUTOW {}\n", self.object_id));
        if let Some(msg) = &self.message {
            code.push_str(&format!("MESSAGE \"{}\"\n", msg));
        }
        code
    }
}

/// Auto-action templates for common scenarios
pub enum AutoActionTemplate {
    AlwaysGetCoins,         // Automatically pick up all coins
    DropWhenHeavy,          // Drop items when weight limit reached
    StoreInBackpack,        // Auto-put items in backpack
    RemoveWetClothes,       // Auto-remove wet clothing
    WearArmor,              // Auto-wear protective gear
}

impl AutoActionTemplate {
    pub fn name(&self) -> &'static str {
        match self {
            AutoActionTemplate::AlwaysGetCoins => "Always Get Coins",
            AutoActionTemplate::DropWhenHeavy => "Drop When Heavy",
            AutoActionTemplate::StoreInBackpack => "Store in Backpack",
            AutoActionTemplate::RemoveWetClothes => "Remove Wet Clothes",
            AutoActionTemplate::WearArmor => "Wear Armor Automatically",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            AutoActionTemplate::AlwaysGetCoins => "Automatically pick up coins when seen",
            AutoActionTemplate::DropWhenHeavy => "Drop heavy items when over weight limit",
            AutoActionTemplate::StoreInBackpack => "Automatically store items in backpack",
            AutoActionTemplate::RemoveWetClothes => "Remove wet clothing automatically",
            AutoActionTemplate::WearArmor => "Put on armor when picked up",
        }
    }
}

/// Bevy plugin
pub struct AutoActionsPlugin;

impl Plugin for AutoActionsPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<AutoActionSystem>()
            .add_systems(Update, (
                render_auto_actions_ui,
                handle_add_autog_button,
                handle_add_autod_button,
                handle_add_autop_button,
                handle_template_selection,
            ));
    }
}

fn render_auto_actions_ui(/* Bevy systems */) {
    // TODO: UI with tabs for each auto-action type
}

fn handle_add_autog_button(/* Bevy systems */) {
    // TODO: Create new auto-get rule
}

fn handle_add_autod_button(/* Bevy systems */) {
    // TODO: Create new auto-drop rule
}

fn handle_add_autop_button(/* Bevy systems */) {
    // TODO: Create new auto-put rule
}

fn handle_template_selection(/* Bevy systems */) {
    // TODO: Apply auto-action template
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_autog_rule() {
        let rule = AutoGetRule::new(0, "Get Coin".to_string(), 5);
        let code = rule.to_daad_code();
        assert!(code.contains("AUTOG 5"));
    }

    #[test]
    fn test_autod_rule() {
        let rule = AutoDropRule::new(
            0,
            "Drop Heavy".to_string(),
            10,
            AutoDropTrigger::OnWeightLimit,
        );
        let code = rule.to_daad_code();
        assert!(code.contains("WEIGHT"));
        assert!(code.contains("AUTOD 10"));
    }
}
