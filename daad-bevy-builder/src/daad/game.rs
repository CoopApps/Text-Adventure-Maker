use bevy::prelude::*;
use serde::{Deserialize, Serialize};
use super::types::*;

/// Supported languages for multi-language games
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Language {
    English,
    Spanish,
    French,
    German,
    Italian,
    Portuguese,
}

impl Language {
    pub fn code(&self) -> &'static str {
        match self {
            Language::English => "en",
            Language::Spanish => "es",
            Language::French => "fr",
            Language::German => "de",
            Language::Italian => "it",
            Language::Portuguese => "pt",
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Language::English => "English",
            Language::Spanish => "Español",
            Language::French => "Français",
            Language::German => "Deutsch",
            Language::Italian => "Italiano",
            Language::Portuguese => "Português",
        }
    }

    pub fn flag_emoji(&self) -> &'static str {
        match self {
            Language::English => "🇬🇧",
            Language::Spanish => "🇪🇸",
            Language::French => "🇫🇷",
            Language::German => "🇩🇪",
            Language::Italian => "🇮🇹",
            Language::Portuguese => "🇵🇹",
        }
    }

    pub fn all() -> Vec<Language> {
        vec![
            Language::English,
            Language::Spanish,
            Language::French,
            Language::German,
            Language::Italian,
            Language::Portuguese,
        ]
    }
}

impl Default for Language {
    fn default() -> Self {
        Language::English
    }
}

/// Complete DAAD game
#[derive(Debug, Clone, Serialize, Deserialize, Resource)]
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
    pub sounds: Vec<Sound>,
    pub pictures: Vec<Picture>,

    // Multi-language support
    pub supported_languages: Vec<Language>,
    pub default_language: Language,

    // Game configuration
    pub starting_location: u8,
    pub max_carry_objects: u8,
    pub max_carry_weight: u8,

    // MALUVA extension support
    pub maluva_enabled: bool,
    pub maluva_platform: MaluvaPlatform,
}

/// MALUVA target platforms
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum MaluvaPlatform {
    None,           // No MALUVA
    ZXSpectrum,     // ZX Spectrum (ESXDOS)
    ZXSpectrumPlus3, // ZX Spectrum +3
    ZXSpectrumNext, // ZX Spectrum Next
    ZXUno,          // ZX-Uno
    AmstradCPC,     // Amstrad CPC
    Commodore64,    // Commodore 64
    Plus4,          // Commodore Plus/4
    MSX,            // MSX
    Amiga,          // Commodore Amiga
    PCW,            // Amstrad PCW
    Dandanator,     // Dandanator cart
}

impl MaluvaPlatform {
    /// Get the MALUVA binary filename for this platform
    pub fn binary_name(&self) -> &'static str {
        match self {
            MaluvaPlatform::None => "",
            MaluvaPlatform::ZXSpectrum => "MLV_ESX.BIN",
            MaluvaPlatform::ZXSpectrumPlus3 => "MLV_P3.BIN",
            MaluvaPlatform::ZXSpectrumNext => "MLV_NXT.BIN",
            MaluvaPlatform::ZXUno => "MLV_UNO.BIN",
            MaluvaPlatform::AmstradCPC => "MLV_CPC.BIN",
            MaluvaPlatform::Commodore64 => "MLV_C64.BIN",
            MaluvaPlatform::Plus4 => "MLV_CP4.BIN",
            MaluvaPlatform::MSX => "MLV_MSX.BIN",
            MaluvaPlatform::Amiga => "MLV_AMI.BIN",
            MaluvaPlatform::PCW => "MLV_PCW.BIN",
            MaluvaPlatform::Dandanator => "MLV_DAN.BIN",
        }
    }

    /// Get platform display name
    pub fn display_name(&self) -> &'static str {
        match self {
            MaluvaPlatform::None => "None (DAAD only)",
            MaluvaPlatform::ZXSpectrum => "ZX Spectrum (ESXDOS)",
            MaluvaPlatform::ZXSpectrumPlus3 => "ZX Spectrum +3",
            MaluvaPlatform::ZXSpectrumNext => "ZX Spectrum Next",
            MaluvaPlatform::ZXUno => "ZX-Uno",
            MaluvaPlatform::AmstradCPC => "Amstrad CPC",
            MaluvaPlatform::Commodore64 => "Commodore 64",
            MaluvaPlatform::Plus4 => "Commodore Plus/4",
            MaluvaPlatform::MSX => "MSX",
            MaluvaPlatform::Amiga => "Commodore Amiga",
            MaluvaPlatform::PCW => "Amstrad PCW",
            MaluvaPlatform::Dandanator => "Dandanator",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VocabEntry {
    pub word: String,  // Word in default language
    pub word_type: VocabType,
    pub id: u8,
    /// Optional translations to other languages
    #[serde(default)]
    pub translations: std::collections::HashMap<Language, String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VocabType {
    Verb,
    Noun,
    Adjective,
    Adverb,
    Preposition,
    Pronoun,
    Conjugation,
}

impl VocabType {
    pub fn as_str(&self) -> &'static str {
        match self {
            VocabType::Verb => "verb",
            VocabType::Noun => "noun",
            VocabType::Adjective => "adjective",
            VocabType::Adverb => "adverb",
            VocabType::Preposition => "preposition",
            VocabType::Pronoun => "pronoun",
            VocabType::Conjugation => "conjugation",
        }
    }
}

/// Sound effect or music resource
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sound {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub sound_type: SoundType,
    /// File path for web/HTML export
    pub web_file: Option<String>,
    /// Platform-specific sound files (for retro platforms)
    pub platform_files: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum SoundType {
    Effect,  // Sound effect (short, played once)
    Music,   // Music (long, can loop)
    Beep,    // Simple beep/tone
}

impl SoundType {
    pub fn as_str(&self) -> &'static str {
        match self {
            SoundType::Effect => "effect",
            SoundType::Music => "music",
            SoundType::Beep => "beep",
        }
    }
}

/// Picture/graphic resource
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Picture {
    pub id: u8,
    pub name: String,
    pub description: String,
    /// File path for web/HTML export (PNG, JPG, GIF)
    pub web_file: Option<String>,
    /// Platform-specific picture files (SCR for ZX Spectrum, PIC for Amstrad, etc.)
    pub platform_files: std::collections::HashMap<String, String>,
    /// Location ID where this picture should be displayed (0 = show at location 0)
    /// None = not bound to any location (manual display via Picture action)
    pub location_binding: Option<u8>,
    /// Image dimensions (width, height) for web export
    pub dimensions: Option<(u32, u32)>,
}

impl Picture {
    pub fn new(id: u8, name: String) -> Self {
        Self {
            id,
            name,
            description: String::new(),
            web_file: None,
            platform_files: std::collections::HashMap::new(),
            location_binding: None,
            dimensions: None,
        }
    }
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
            objects: vec![
                Object {
                    id: 0,
                    name: "torch".to_string(),
                    description: "A burning torch".to_string(),
                    noun: "torch".to_string(),
                    adjective: "burning".to_string(),
                    location: ObjectLocation::Location(0),
                    weight: 10,
                    is_container: false,
                    is_wearable: false,
                    is_takeable: true,
                    icon: "🔦".to_string(),
                },
            ],
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
                VocabEntry {
                    word: "get".to_string(),
                    word_type: VocabType::Verb,
                    id: 10,
                    translations: std::collections::HashMap::new(),
                },
                VocabEntry {
                    word: "take".to_string(),
                    word_type: VocabType::Verb,
                    id: 10,
                    translations: std::collections::HashMap::new(),
                },
                VocabEntry {
                    word: "drop".to_string(),
                    word_type: VocabType::Verb,
                    id: 18,
                    translations: std::collections::HashMap::new(),
                },
                VocabEntry {
                    word: "torch".to_string(),
                    word_type: VocabType::Noun,
                    id: 0,
                    translations: std::collections::HashMap::new(),
                },
                VocabEntry {
                    word: "burning".to_string(),
                    word_type: VocabType::Adjective,
                    id: 0,
                    translations: std::collections::HashMap::new(),
                },
            ],
            sounds: vec![],
            pictures: vec![],
            supported_languages: vec![Language::English],
            default_language: Language::English,
            starting_location: 0,
            max_carry_objects: 4,
            max_carry_weight: 100,
            maluva_enabled: false,
            maluva_platform: MaluvaPlatform::None,
        }
    }
}

impl DaadGame {
    /// Create a new empty game
    pub fn new(title: &str, author: &str) -> Self {
        let mut game = Self::default();
        game.title = title.to_string();
        game.author = author.to_string();
        game
    }

    /// Add a new location
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

    /// Add a new object
    pub fn add_object(&mut self, name: &str, noun: &str, description: &str) -> u8 {
        let id = self.objects.len() as u8;
        self.objects.push(Object {
            id,
            name: name.to_string(),
            description: description.to_string(),
            noun: noun.to_string(),
            adjective: String::new(),
            location: ObjectLocation::Limbo,
            weight: 1,
            is_container: false,
            is_wearable: false,
            is_takeable: true,
            icon: "📦".to_string(),
        });
        id
    }

    /// Add a new rule
    pub fn add_rule(&mut self, name: &str, process: ProcessTable) -> usize {
        let id = self.rules.len();
        self.rules.push(Rule {
            id,
            name: name.to_string(),
            process,
            conditions: vec![],
            actions: vec![],
            verb: None,         // Default to wildcard
            noun: None,         // Default to wildcard
            label: None,        // No label by default
            editor_position: Vec2::new(100.0, 100.0 + (id as f32 * 80.0)),
            enabled: true,
        });
        id
    }

    /// Add a new flag
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

    /// Get location by ID
    pub fn get_location(&self, id: u8) -> Option<&Location> {
        self.locations.iter().find(|l| l.id == id)
    }

    /// Get object by ID
    pub fn get_object(&self, id: u8) -> Option<&Object> {
        self.objects.iter().find(|o| o.id == id)
    }

    /// Get rule by ID
    pub fn get_rule(&self, id: usize) -> Option<&Rule> {
        self.rules.iter().find(|r| r.id == id)
    }

    /// Get flag by ID
    pub fn get_flag(&self, id: u8) -> Option<&Flag> {
        self.flags.iter().find(|f| f.id == id)
    }

    /// Save game to JSON file
    pub fn save_to_file(&self, path: &str) -> Result<(), std::io::Error> {
        let json = serde_json::to_string_pretty(self)?;
        std::fs::write(path, json)?;
        Ok(())
    }

    /// Load game from JSON file
    pub fn load_from_file(path: &str) -> Result<Self, std::io::Error> {
        let json = std::fs::read_to_string(path)?;
        let game: DaadGame = serde_json::from_str(&json)?;
        Ok(game)
    }
}
