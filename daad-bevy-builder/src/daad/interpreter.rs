use super::game::*;
use super::types::*;
use std::collections::HashMap;

/// Runtime state for the DAAD interpreter
#[derive(Debug, Clone)]
pub struct InterpreterState {
    /// Current game being played
    pub game: DaadGame,

    /// Current player location
    pub current_location: u8,

    /// Flag values (0-255)
    pub flags: HashMap<u8, i16>,

    /// Object locations (ID -> ObjectLocation)
    pub object_locations: HashMap<u8, ObjectLocation>,

    /// Game output buffer (what the player sees)
    pub output: Vec<String>,

    /// Turn counter
    pub turn_count: u32,

    /// Last parsed command
    pub last_verb: Option<u8>,
    pub last_noun: Option<u8>,
    pub last_adjective: Option<u8>,

    /// Game is running
    pub is_running: bool,

    /// Game is over
    pub game_over: bool,
}

impl InterpreterState {
    /// Create a new interpreter state from a game
    pub fn new(game: DaadGame) -> Self {
        // Initialize flags from game definition
        let mut flags = HashMap::new();
        for flag in &game.flags {
            flags.insert(flag.id, flag.initial_value as i16);
        }

        // System flags
        flags.insert(38, 0_i16); // fPlayer - current location (set below)
        flags.insert(30, 0_i16); // fScore
        flags.insert(31, 0_i16); // fTurns (low byte)
        flags.insert(32, 0_i16); // fTurnsHi (high byte)
        flags.insert(37, 4_i16); // fMaxCarr - max objects carried

        // Initialize object locations from game definition
        let mut object_locations = HashMap::new();
        for object in &game.objects {
            object_locations.insert(object.id, object.location.clone());
        }

        // Determine starting location (first location in list)
        let starting_location = game.locations.first()
            .map(|loc| loc.id)
            .unwrap_or(0);

        flags.insert(38, starting_location as i16);

        Self {
            current_location: starting_location,
            flags,
            object_locations,
            output: Vec::new(),
            turn_count: 0,
            last_verb: None,
            last_noun: None,
            last_adjective: None,
            is_running: true,
            game_over: false,
            game,
        }
    }

    /// Reset the game to initial state
    pub fn reset(&mut self) {
        *self = Self::new(self.game.clone());
    }

    /// Add a line to the output buffer
    pub fn output(&mut self, text: String) {
        self.output.push(text);
    }

    /// Clear the output buffer
    pub fn clear_output(&mut self) {
        self.output.clear();
    }

    /// Get the current location object
    pub fn get_current_location(&self) -> Option<&Location> {
        self.game.locations.iter().find(|loc| loc.id == self.current_location)
    }

    /// Get flag value
    pub fn get_flag(&self, flag_id: u8) -> i16 {
        self.flags.get(&flag_id).copied().unwrap_or(0)
    }

    /// Set flag value
    pub fn set_flag(&mut self, flag_id: u8, value: i16) {
        self.flags.insert(flag_id, value);
    }

    /// Get object location
    pub fn get_object_location(&self, object_id: u8) -> ObjectLocation {
        self.object_locations.get(&object_id)
            .cloned()
            .unwrap_or(ObjectLocation::Limbo)
    }

    /// Set object location
    pub fn set_object_location(&mut self, object_id: u8, location: ObjectLocation) {
        self.object_locations.insert(object_id, location);
    }

    /// Check if object is at current location
    pub fn is_object_here(&self, object_id: u8) -> bool {
        matches!(
            self.get_object_location(object_id),
            ObjectLocation::Location(loc) if loc == self.current_location
        )
    }

    /// Check if object is carried by player
    pub fn is_object_carried(&self, object_id: u8) -> bool {
        matches!(
            self.get_object_location(object_id),
            ObjectLocation::Carried
        )
    }

    /// Get list of carried objects
    pub fn get_carried_objects(&self) -> Vec<u8> {
        self.object_locations.iter()
            .filter(|(_, loc)| matches!(loc, ObjectLocation::Carried))
            .map(|(id, _)| *id)
            .collect()
    }

    /// Get list of objects at current location
    pub fn get_objects_here(&self) -> Vec<u8> {
        let current = self.current_location;
        self.object_locations.iter()
            .filter(|(_, loc)| matches!(loc, ObjectLocation::Location(loc) if *loc == current))
            .map(|(id, _)| *id)
            .collect()
    }

    /// Move to a new location
    pub fn move_to_location(&mut self, location_id: u8) {
        self.current_location = location_id;
        self.set_flag(38, location_id as i16); // fPlayer

        // Display location description
        // Clone the data we need before mutating self
        let location_data = self.get_current_location()
            .map(|loc| (loc.name.clone(), loc.description.clone()));

        if let Some((name, description)) = location_data {
            self.output(format!("\n{}", name));
            self.output(description);

            // List visible objects
            let objects_here = self.get_objects_here();
            if !objects_here.is_empty() {
                self.output("\nYou can see:".to_string());
                for obj_id in objects_here {
                    if let Some(obj) = self.game.objects.iter().find(|o| o.id == obj_id) {
                        self.output(format!("  {}", obj.description));
                    }
                }
            }
        }
    }

    /// Process a player command
    pub fn process_command(&mut self, input: &str) -> Vec<String> {
        self.clear_output();
        self.turn_count += 1;

        // Update turn counter flags
        self.set_flag(31, (self.turn_count % 256) as i16);
        self.set_flag(32, (self.turn_count / 256) as i16);

        let words: Vec<&str> = input.split_whitespace().collect();
        if words.is_empty() {
            self.output("I don't understand.".to_string());
            return self.output.clone();
        }

        // Parse command against vocabulary
        self.last_verb = None;
        self.last_noun = None;
        self.last_adjective = None;

        // Look up first word as verb
        if let Some(verb_id) = self.find_verb(words[0]) {
            self.last_verb = Some(verb_id);
            self.set_flag(33, verb_id as i16); // fVerb

            // Look up second word as noun
            if words.len() > 1 {
                if let Some(noun_id) = self.find_noun(words[1]) {
                    self.last_noun = Some(noun_id);
                    self.set_flag(34, noun_id as i16); // fNoun
                }
            }
        } else {
            self.output("I don't understand that verb.".to_string());
            return self.output.clone();
        }

        // Execute built-in commands first
        if self.execute_builtin_command() {
            return self.output.clone();
        }

        // Execute Response process table rules
        self.execute_process_table(ProcessTable::Response);

        if self.output.is_empty() {
            self.output("You can't do that.".to_string());
        }

        self.output.clone()
    }

    /// Execute built-in commands (LOOK, INVENTORY, etc.)
    fn execute_builtin_command(&mut self) -> bool {
        // These are standard DAAD verbs that should always work
        if let Some(verb_id) = self.last_verb {
            match verb_id {
                // LOOK (verb 30)
                30 => {
                    self.move_to_location(self.current_location);
                    return true;
                }
                // INVENTORY (verb 28)
                28 => {
                    let carried = self.get_carried_objects();
                    if carried.is_empty() {
                        self.output("You are carrying nothing.".to_string());
                    } else {
                        self.output("You are carrying:".to_string());
                        for obj_id in carried {
                            if let Some(obj) = self.game.objects.iter().find(|o| o.id == obj_id) {
                                self.output(format!("  {}", obj.description));
                            }
                        }
                    }
                    return true;
                }
                _ => {}
            }
        }
        false
    }

    /// Execute rules from a process table
    fn execute_process_table(&mut self, process: ProcessTable) {
        let rules: Vec<_> = self.game.rules.iter()
            .filter(|r| r.process == process && r.enabled)
            .cloned()
            .collect();

        for rule in rules {
            if self.check_rule_conditions(&rule) {
                self.execute_rule_actions(&rule);
                // DAAD stops after first matching rule
                break;
            }
        }
    }

    /// Check if all conditions in a rule are met
    fn check_rule_conditions(&self, rule: &Rule) -> bool {
        for condition in &rule.conditions {
            if !self.check_condition(&condition.condition_type) {
                return false;
            }
        }
        true
    }

    /// Check a single condition
    fn check_condition(&self, condition: &ConditionType) -> bool {
        match condition {
            ConditionType::PlayerAt { location_id } => {
                self.current_location == *location_id
            }
            ConditionType::PlayerNotAt { location_id } => {
                self.current_location != *location_id
            }
            ConditionType::ObjectPresent { object_id } => {
                self.is_object_here(*object_id) || self.is_object_carried(*object_id)
            }
            ConditionType::ObjectAbsent { object_id } => {
                !self.is_object_here(*object_id) && !self.is_object_carried(*object_id)
            }
            ConditionType::ObjectCarried { object_id } => {
                self.is_object_carried(*object_id)
            }
            ConditionType::ObjectNotCarried { object_id } => {
                !self.is_object_carried(*object_id)
            }
            ConditionType::FlagZero { flag_id } => {
                self.get_flag(*flag_id) == 0
            }
            ConditionType::FlagNotZero { flag_id } => {
                self.get_flag(*flag_id) != 0
            }
            ConditionType::FlagGreaterThan { flag_id, value } => {
                self.get_flag(*flag_id) > (*value as i16)
            }
            ConditionType::FlagLessThan { flag_id, value } => {
                self.get_flag(*flag_id) < (*value as i16)
            }
            ConditionType::FlagEquals { flag_id, value } => {
                self.get_flag(*flag_id) == (*value as i16)
            }
            _ => true, // Unsupported conditions always pass for now
        }
    }

    /// Execute all actions in a rule
    fn execute_rule_actions(&mut self, rule: &Rule) {
        for action in &rule.actions {
            self.execute_action(&action.action_type);
            if self.game_over {
                break;
            }
        }
    }

    /// Execute a single action
    fn execute_action(&mut self, action: &ActionType) {
        match action {
            ActionType::ShowMessage { text } => {
                self.output(text.clone());
            }
            ActionType::GoToLocation { location_id } => {
                self.move_to_location(*location_id);
            }
            ActionType::GetObject { object_id } => {
                self.set_object_location(*object_id, ObjectLocation::Carried);
                if let Some(obj) = self.game.objects.iter().find(|o| o.id == *object_id) {
                    self.output(format!("You take the {}.", obj.name));
                }
            }
            ActionType::DropObject { object_id } => {
                self.set_object_location(*object_id, ObjectLocation::Location(self.current_location));
                if let Some(obj) = self.game.objects.iter().find(|o| o.id == *object_id) {
                    self.output(format!("You drop the {}.", obj.name));
                }
            }
            ActionType::DestroyObject { object_id } => {
                self.set_object_location(*object_id, ObjectLocation::Limbo);
            }
            ActionType::SetBit { flag_id } => {
                self.set_flag(*flag_id, 1);
            }
            ActionType::ClearFlag { flag_id } => {
                self.set_flag(*flag_id, 0);
            }
            ActionType::AddToFlag { flag_id, value } => {
                let current = self.get_flag(*flag_id);
                self.set_flag(*flag_id, current + (*value as i16));
            }
            ActionType::SubtractFromFlag { flag_id, value } => {
                let current = self.get_flag(*flag_id);
                self.set_flag(*flag_id, current - (*value as i16));
            }
            ActionType::SetFlag { flag_id, value } => {
                self.set_flag(*flag_id, *value as i16);
            }
            ActionType::EndTurn => {
                // End turn action - return from process
            }
            ActionType::OK => {
                self.output("OK.".to_string());
            }
            ActionType::EndGame => {
                self.game_over = true;
                self.is_running = false;
                self.output("\n=== Game Over ===".to_string());
            }
            _ => {
                // Unsupported actions - ignore silently
            }
        }
    }

    /// Find verb ID by word
    fn find_verb(&self, word: &str) -> Option<u8> {
        self.game.vocabulary.iter()
            .find(|v| v.word_type == VocabType::Verb && v.word.eq_ignore_ascii_case(word))
            .map(|v| v.id)
    }

    /// Find noun ID by word
    fn find_noun(&self, word: &str) -> Option<u8> {
        self.game.vocabulary.iter()
            .find(|v| v.word_type == VocabType::Noun && v.word.eq_ignore_ascii_case(word))
            .map(|v| v.id)
    }
}
