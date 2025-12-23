/// Module 37: Response Table Editor
/// Customize DAAD's 62 system messages (SYSMESS 0-61)
use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// DAAD System Messages (0-61)
/// These are the standard responses that DAAD uses for common situations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseTable {
    pub messages: Vec<SystemMessage>,
}

impl Default for ResponseTable {
    fn default() -> Self {
        Self {
            messages: Self::default_messages(),
        }
    }
}

impl ResponseTable {
    /// Get default DAAD system messages
    pub fn default_messages() -> Vec<SystemMessage> {
        vec![
            SystemMessage::new(0, "OK.", "General affirmative response"),
            SystemMessage::new(1, "You can't see that here.", "Object not visible"),
            SystemMessage::new(2, "You already have it.", "Already carrying object"),
            SystemMessage::new(3, "You're not carrying it.", "Don't have that object"),
            SystemMessage::new(4, "You can't do that.", "Invalid action"),
            SystemMessage::new(5, "You don't have that.", "Missing required object"),
            SystemMessage::new(6, "You can't go that way.", "No exit in that direction"),
            SystemMessage::new(7, "It's too dark to see.", "Current location is dark"),
            SystemMessage::new(8, "You are carrying too much.", "Weight/capacity limit reached"),
            SystemMessage::new(9, "You drop the {object}.", "Drop object message"),
            SystemMessage::new(10, "You take the {object}.", "Get object message"),
            SystemMessage::new(11, "You can't take that.", "Object not takeable"),
            SystemMessage::new(12, "You can't drop that.", "Can't drop object"),
            SystemMessage::new(13, "You are wearing the {object}.", "Wearing message"),
            SystemMessage::new(14, "You aren't wearing that.", "Not wearing object"),
            SystemMessage::new(15, "You put on the {object}.", "Wear object message"),
            SystemMessage::new(16, "You take off the {object}.", "Remove object message"),
            SystemMessage::new(17, "You can't wear that.", "Object not wearable"),
            SystemMessage::new(18, "I don't understand that.", "Parser error"),
            SystemMessage::new(19, "What do you want to {verb}?", "Incomplete command"),
            SystemMessage::new(20, "The door is locked.", "Locked barrier"),
            SystemMessage::new(21, "The door is already open.", "Already open"),
            SystemMessage::new(22, "The door is already closed.", "Already closed"),
            SystemMessage::new(23, "You open the {object}.", "Open object message"),
            SystemMessage::new(24, "You close the {object}.", "Close object message"),
            SystemMessage::new(25, "It won't open.", "Can't open"),
            SystemMessage::new(26, "You don't have the key.", "Missing key"),
            SystemMessage::new(27, "Nothing happens.", "No effect"),
            SystemMessage::new(28, "You can't put that there.", "Invalid container operation"),
            SystemMessage::new(29, "There's nothing in there.", "Empty container"),
            SystemMessage::new(30, "You put the {object1} in the {object2}.", "Put in container"),
            SystemMessage::new(31, "You take the {object1} from the {object2}.", "Take from container"),
            SystemMessage::new(32, "It's empty.", "Container is empty"),
            SystemMessage::new(33, "It's full.", "Container is full"),
            SystemMessage::new(34, "Which one?", "Ambiguous object reference"),
            SystemMessage::new(35, "There is {object} here.", "Object present at location"),
            SystemMessage::new(36, "You are carrying:", "Inventory header"),
            SystemMessage::new(37, "Nothing.", "Empty inventory"),
            SystemMessage::new(38, "You are wearing:", "Worn items header"),
            SystemMessage::new(39, "Exits:", "Available exits header"),
            SystemMessage::new(40, "None.", "No exits available"),
            SystemMessage::new(41, "Press any key to continue...", "Pause message"),
            SystemMessage::new(42, "Save game", "Save prompt"),
            SystemMessage::new(43, "Load game", "Load prompt"),
            SystemMessage::new(44, "Game saved.", "Save success"),
            SystemMessage::new(45, "Game loaded.", "Load success"),
            SystemMessage::new(46, "Save failed.", "Save error"),
            SystemMessage::new(47, "Load failed.", "Load error"),
            SystemMessage::new(48, "Are you sure? (Y/N)", "Confirmation prompt"),
            SystemMessage::new(49, "Yes", "Affirmative"),
            SystemMessage::new(50, "No", "Negative"),
            SystemMessage::new(51, "Score: {score}", "Score display"),
            SystemMessage::new(52, "Turns: {turns}", "Turn counter display"),
            SystemMessage::new(53, "Time: {time}", "Time display"),
            SystemMessage::new(54, "You have won!", "Victory message"),
            SystemMessage::new(55, "You have died.", "Death message"),
            SystemMessage::new(56, "Game over.", "End game message"),
            SystemMessage::new(57, "Play again? (Y/N)", "Restart prompt"),
            SystemMessage::new(58, "Thanks for playing!", "Goodbye message"),
            SystemMessage::new(59, "Type HELP for assistance.", "Help hint"),
            SystemMessage::new(60, "Commands: LOOK, INVENTORY, GET, DROP, NORTH, SOUTH, EAST, WEST", "Help text"),
            SystemMessage::new(61, "Unknown command. Type HELP.", "Unknown command"),
        ]
    }

    /// Get message by ID
    pub fn get(&self, id: u8) -> Option<&SystemMessage> {
        self.messages.iter().find(|m| m.id == id)
    }

    /// Get mutable message by ID
    pub fn get_mut(&mut self, id: u8) -> Option<&mut SystemMessage> {
        self.messages.iter_mut().find(|m| m.id == id)
    }

    /// Update a message
    pub fn update(&mut self, id: u8, new_text: String) {
        if let Some(msg) = self.get_mut(id) {
            msg.text = new_text;
            msg.customized = true;
        }
    }

    /// Reset message to default
    pub fn reset(&mut self, id: u8) {
        let defaults = Self::default_messages();
        if let Some(default_msg) = defaults.iter().find(|m| m.id == id) {
            if let Some(msg) = self.get_mut(id) {
                msg.text = default_msg.text.clone();
                msg.customized = false;
            }
        }
    }

    /// Reset all messages to defaults
    pub fn reset_all(&mut self) {
        self.messages = Self::default_messages();
    }

    /// Count customized messages
    pub fn customized_count(&self) -> usize {
        self.messages.iter().filter(|m| m.customized).count()
    }

    /// Export to DAAD format
    pub fn to_daad_code(&self) -> String {
        let mut code = String::from("; System Messages (Response Table)\n");
        code.push_str("/MTX\n\n");

        for msg in &self.messages {
            if msg.customized {
                code.push_str(&format!("; Message {}: {} (CUSTOMIZED)\n", msg.id, msg.description));
            } else {
                code.push_str(&format!("; Message {}: {}\n", msg.id, msg.description));
            }
            code.push_str(&format!("\"{}\"\n\n", msg.text));
        }

        code
    }
}

/// Individual system message
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMessage {
    pub id: u8,
    pub text: String,
    pub description: String,    // What this message is for
    pub customized: bool,        // Has user changed it?
}

impl SystemMessage {
    pub fn new(id: u8, text: &str, description: &str) -> Self {
        Self {
            id,
            text: text.to_string(),
            description: description.to_string(),
            customized: false,
        }
    }
}

/// Message categories for organization
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MessageCategory {
    General,        // 0-8: General responses
    Objects,        // 9-17: Object manipulation
    Parser,         // 18-19: Parser messages
    Doors,          // 20-26: Doors and barriers
    Containers,     // 27-34: Container operations
    Display,        // 35-41: Display messages
    SaveLoad,       // 42-47: Save/load
    Prompts,        // 48-50: Confirmation prompts
    GameState,      // 51-53: Score/turns/time
    EndGame,        // 54-58: Victory/death/restart
    Help,           // 59-61: Help messages
}

impl MessageCategory {
    pub fn name(&self) -> &'static str {
        match self {
            MessageCategory::General => "General Responses",
            MessageCategory::Objects => "Object Manipulation",
            MessageCategory::Parser => "Parser Errors",
            MessageCategory::Doors => "Doors & Barriers",
            MessageCategory::Containers => "Containers",
            MessageCategory::Display => "Display Messages",
            MessageCategory::SaveLoad => "Save/Load",
            MessageCategory::Prompts => "Confirmation Prompts",
            MessageCategory::GameState => "Game State Display",
            MessageCategory::EndGame => "End Game Messages",
            MessageCategory::Help => "Help Messages",
        }
    }

    pub fn message_range(&self) -> (u8, u8) {
        match self {
            MessageCategory::General => (0, 8),
            MessageCategory::Objects => (9, 17),
            MessageCategory::Parser => (18, 19),
            MessageCategory::Doors => (20, 26),
            MessageCategory::Containers => (27, 34),
            MessageCategory::Display => (35, 41),
            MessageCategory::SaveLoad => (42, 47),
            MessageCategory::Prompts => (48, 50),
            MessageCategory::GameState => (51, 53),
            MessageCategory::EndGame => (54, 58),
            MessageCategory::Help => (59, 61),
        }
    }

    pub fn contains(&self, id: u8) -> bool {
        let (start, end) = self.message_range();
        id >= start && id <= end
    }

    pub fn all() -> Vec<Self> {
        vec![
            MessageCategory::General,
            MessageCategory::Objects,
            MessageCategory::Parser,
            MessageCategory::Doors,
            MessageCategory::Containers,
            MessageCategory::Display,
            MessageCategory::SaveLoad,
            MessageCategory::Prompts,
            MessageCategory::GameState,
            MessageCategory::EndGame,
            MessageCategory::Help,
        ]
    }
}

/// Bevy plugin for Response Table system
pub struct ResponseTablePlugin;

impl Plugin for ResponseTablePlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<ResponseTable>()
            .add_systems(Update, (
                render_response_table_ui,
                handle_category_selection,
                handle_message_editing,
                handle_reset_button,
            ));
    }
}

/// Render the response table editor UI
fn render_response_table_ui(
    /* Bevy systems */
) {
    // TODO: Implement UI with category tabs and message list
}

/// Handle category selection
fn handle_category_selection(
    /* Bevy systems */
) {
    // TODO: Filter messages by selected category
}

/// Handle message text editing
fn handle_message_editing(
    /* Bevy systems */
) {
    // TODO: Update message text when user edits
}

/// Handle reset to default button
fn handle_reset_button(
    /* Bevy systems */
) {
    // TODO: Reset selected message or all messages
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_messages() {
        let table = ResponseTable::default();
        assert_eq!(table.messages.len(), 62); // 0-61
        assert_eq!(table.get(0).unwrap().text, "OK.");
        assert_eq!(table.get(1).unwrap().text, "You can't see that here.");
    }

    #[test]
    fn test_update_message() {
        let mut table = ResponseTable::default();
        table.update(0, "Okay!".to_string());
        assert_eq!(table.get(0).unwrap().text, "Okay!");
        assert!(table.get(0).unwrap().customized);
        assert_eq!(table.customized_count(), 1);
    }

    #[test]
    fn test_reset_message() {
        let mut table = ResponseTable::default();
        table.update(0, "Okay!".to_string());
        table.reset(0);
        assert_eq!(table.get(0).unwrap().text, "OK.");
        assert!(!table.get(0).unwrap().customized);
    }

    #[test]
    fn test_categories() {
        assert!(MessageCategory::General.contains(5));
        assert!(MessageCategory::Objects.contains(10));
        assert!(!MessageCategory::General.contains(20));
    }
}
