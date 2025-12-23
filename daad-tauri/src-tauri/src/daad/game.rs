use serde::{Deserialize, Serialize};
use super::types::*;

/// Complete DAAD game
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DaadGame {
    pub title: String,
    pub author: String,
    pub version: String,
    pub locations: Vec<Location>,
    pub objects: Vec<Object>,
    pub rules: Vec<Rule>,
    pub flags: Vec<Flag>,
    pub messages: Vec<String>,
    pub vocabulary: Vec<VocabEntry>,
}

impl Default for DaadGame {
    fn default() -> Self {
        Self {
            title: "My Adventure".to_string(),
            author: "Anonymous".to_string(),
            version: "1.0".to_string(),
            locations: vec![
                Location {
                    id: 0,
                    name: "Start Room".to_string(),
                    description: "You are in a small room. There is a door to the north.".to_string(),
                    is_dark: false,
                    connections: vec![],
                    editor_position: Vec2::new(400.0, 300.0),
                    editor_color: Color::rgb(0.3, 0.5, 0.7),
                }
            ],
            objects: vec![],
            rules: vec![],
            flags: vec![
                Flag {
                    id: 0,
                    name: "score".to_string(),
                    description: "Player score".to_string(),
                    initial_value: 0,
                },
            ],
            messages: vec![
                "OK.".to_string(),
                "You can't see that here.".to_string(),
                "You can't do that.".to_string(),
            ],
            vocabulary: vec![
                VocabEntry { word: "get".to_string(), word_type: VocabType::Verb, id: 10 },
                VocabEntry { word: "take".to_string(), word_type: VocabType::Verb, id: 10 },
                VocabEntry { word: "drop".to_string(), word_type: VocabType::Verb, id: 18 },
            ],
        }
    }
}

impl DaadGame {
    pub fn new(title: &str, author: &str) -> Self {
        let mut game = Self::default();
        game.title = title.to_string();
        game.author = author.to_string();
        game
    }

    pub fn add_location(&mut self, name: &str, description: &str) -> u8 {
        let id = self.locations.len() as u8;
        self.locations.push(Location {
            id,
            name: name.to_string(),
            description: description.to_string(),
            is_dark: false,
            connections: vec![],
            editor_position: Vec2::new(400.0 + (id as f32 * 100.0), 300.0),
            editor_color: Color::rgb(0.3, 0.5, 0.7),
        });
        id
    }

    pub fn add_object(&mut self, name: &str, noun: &str, description: &str) -> u8 {
        let id = self.objects.len() as u8;
        self.objects.push(Object {
            id,
            name: name.to_string(),
            noun: noun.to_string(),
            adjective: String::new(),
            description: description.to_string(),
            location: ObjectLocation::Limbo,
            weight: 1,
            is_container: false,
            is_wearable: false,
            is_takeable: true,
            icon: "📦".to_string(),
        });
        id
    }

    pub fn add_rule(&mut self, name: &str, process: ProcessTable) -> usize {
        let id = self.rules.len();
        self.rules.push(Rule {
            id,
            name: name.to_string(),
            process,
            conditions: vec![],
            actions: vec![],
            enabled: true,
            editor_position: Vec2::default(),
        });
        id
    }

    pub fn add_flag(&mut self, name: &str, description: &str) -> u8 {
        let id = self.flags.len() as u8;
        self.flags.push(Flag {
            id,
            name: name.to_string(),
            description: description.to_string(),
            initial_value: 0,
        });
        id
    }

    pub fn get_location(&self, id: u8) -> Option<&Location> {
        self.locations.iter().find(|l| l.id == id)
    }

    pub fn get_object(&self, id: u8) -> Option<&Object> {
        self.objects.iter().find(|o| o.id == id)
    }

    pub fn get_rule(&self, id: usize) -> Option<&Rule> {
        self.rules.iter().find(|r| r.id == id)
    }

    pub fn get_flag(&self, id: u8) -> Option<&Flag> {
        self.flags.iter().find(|f| f.id == id)
    }

    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}
