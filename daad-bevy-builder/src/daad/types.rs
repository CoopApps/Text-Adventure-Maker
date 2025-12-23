use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// Location with visual editor metadata
#[derive(Debug, Clone, Serialize, Deserialize, Component)]
pub struct Location {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub is_dark: bool,
    pub connections: Vec<Connection>,

    // Visual editor metadata
    pub editor_position: Vec2,
    pub editor_color: Color,
}

/// Connection between locations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub direction: Direction,
    pub target_location: u8,
    pub condition: Option<usize>,  // Optional: only open if condition met
}

/// Compass directions for movement
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Direction {
    North,
    South,
    East,
    West,
    Up,
    Down,
    Northeast,
    Northwest,
    Southeast,
    Southwest,
    In,
    Out,
}

impl Direction {
    pub fn as_str(&self) -> &'static str {
        match self {
            Direction::North => "NORTH",
            Direction::South => "SOUTH",
            Direction::East => "EAST",
            Direction::West => "WEST",
            Direction::Up => "UP",
            Direction::Down => "DOWN",
            Direction::Northeast => "NORTHEAST",
            Direction::Northwest => "NORTHWEST",
            Direction::Southeast => "SOUTHEAST",
            Direction::Southwest => "SOUTHWEST",
            Direction::In => "IN",
            Direction::Out => "OUT",
        }
    }

    /// Short form for DAAD /CON section (N, S, E, W, etc.)
    pub fn as_short_str(&self) -> &'static str {
        match self {
            Direction::North => "N",
            Direction::South => "S",
            Direction::East => "E",
            Direction::West => "W",
            Direction::Up => "U",
            Direction::Down => "D",
            Direction::Northeast => "NE",
            Direction::Northwest => "NW",
            Direction::Southeast => "SE",
            Direction::Southwest => "SW",
            Direction::In => "IN",
            Direction::Out => "OUT",
        }
    }
}

/// Object with visual properties
#[derive(Debug, Clone, Serialize, Deserialize, Component)]
pub struct Object {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub noun: String,           // "key"
    pub adjective: String,      // "rusty"
    pub location: ObjectLocation,
    pub weight: u8,
    pub is_container: bool,
    pub is_wearable: bool,
    pub is_takeable: bool,

    // Visual editor
    pub icon: String,           // Emoji or icon identifier
}

/// Where an object currently is
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ObjectLocation {
    Location(u8),       // At a specific location
    Carried,            // Player carrying it (252)
    Worn,              // Player wearing it (254)
    Inside(u8),        // Inside another object (container)
    Limbo,             // Not in game (253)
}

impl ObjectLocation {
    pub fn to_daad_location(&self) -> u8 {
        match self {
            ObjectLocation::Location(id) => *id,
            ObjectLocation::Carried => 252,
            ObjectLocation::Worn => 254,
            ObjectLocation::Limbo => 253,
            ObjectLocation::Inside(_) => 253, // Containers handled differently
        }
    }
}

/// Rule with visual flowchart data
#[derive(Debug, Clone, Serialize, Deserialize, Component)]
pub struct Rule {
    pub id: usize,
    pub name: String,           // User-friendly name
    pub process: ProcessTable,  // PRO 0-3
    pub conditions: Vec<Condition>,
    pub actions: Vec<Action>,

    // DAAD process table matching
    pub verb: Option<String>,   // Verb to match (None = wildcard "_")
    pub noun: Option<String>,   // Noun to match (None = wildcard "_")
    pub label: Option<String>,  // Label for SKIP/GOTO (e.g., "$noCarry")

    // Visual editor
    pub editor_position: Vec2,
    pub enabled: bool,          // Can disable rules visually
}

/// DAAD's 4 process tables
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ProcessTable {
    Parsing,      // PRO 0 - Intercept commands before parsing
    Response,     // PRO 1 - Respond to player commands
    AutoAction,   // PRO 2 - Automatic actions every turn
    Description,  // PRO 3 - Location descriptions
}

impl ProcessTable {
    pub fn as_num(&self) -> u8 {
        match self {
            ProcessTable::Parsing => 0,
            ProcessTable::Response => 1,
            ProcessTable::AutoAction => 2,
            ProcessTable::Description => 3,
        }
    }

    pub fn from_num(num: u8) -> Self {
        match num {
            0 => ProcessTable::Parsing,
            1 => ProcessTable::Response,
            2 => ProcessTable::AutoAction,
            3 => ProcessTable::Description,
            _ => ProcessTable::Response,
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            ProcessTable::Parsing => "Parsing (intercept commands)",
            ProcessTable::Response => "Response (handle player input)",
            ProcessTable::AutoAction => "Auto-Action (runs every turn)",
            ProcessTable::Description => "Description (location text)",
        }
    }
}

/// Condition (high-level, user-friendly)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    pub id: usize,
    pub condition_type: ConditionType,
}

impl Condition {
    pub fn description(&self) -> String {
        match &self.condition_type {
            ConditionType::PlayerAt { location_id } => {
                format!("Player is at location {}", location_id)
            }
            ConditionType::PlayerNotAt { location_id } => {
                format!("Player is NOT at location {}", location_id)
            }
            ConditionType::ObjectPresent { object_id } => {
                format!("Object {} is present", object_id)
            }
            ConditionType::ObjectAbsent { object_id } => {
                format!("Object {} is NOT present", object_id)
            }
            ConditionType::ObjectCarried { object_id } => {
                format!("Player is carrying object {}", object_id)
            }
            ConditionType::ObjectNotCarried { object_id } => {
                format!("Player is NOT carrying object {}", object_id)
            }
            ConditionType::ObjectWorn { object_id } => {
                format!("Player is wearing object {}", object_id)
            }
            ConditionType::ObjectNotWorn { object_id } => {
                format!("Player is NOT wearing object {}", object_id)
            }
            ConditionType::ObjectAt { object_id, location_id } => {
                format!("Object {} is at location {}", object_id, location_id)
            }
            ConditionType::ObjectNotAt { object_id, location_id } => {
                format!("Object {} is NOT at location {}", object_id, location_id)
            }
            ConditionType::ObjectExists { object_id } => {
                format!("Object {} exists in game", object_id)
            }
            ConditionType::ObjectDestroyed { object_id } => {
                format!("Object {} has been destroyed", object_id)
            }
            ConditionType::ObjectWeightGreaterThan { object_id, weight } => {
                format!("Object {} weight > {}", object_id, weight)
            }
            ConditionType::ObjectIsContainer { object_id } => {
                format!("Object {} is a container", object_id)
            }
            ConditionType::ObjectIsWearable { object_id } => {
                format!("Object {} is wearable", object_id)
            }
            ConditionType::FlagEquals { flag_id, value } => {
                format!("Flag {} equals {}", flag_id, value)
            }
            ConditionType::FlagNotEquals { flag_id, value } => {
                format!("Flag {} NOT equals {}", flag_id, value)
            }
            ConditionType::FlagGreaterThan { flag_id, value } => {
                format!("Flag {} > {}", flag_id, value)
            }
            ConditionType::FlagLessThan { flag_id, value } => {
                format!("Flag {} < {}", flag_id, value)
            }
            ConditionType::FlagZero { flag_id } => {
                format!("Flag {} is zero", flag_id)
            }
            ConditionType::FlagNotZero { flag_id } => {
                format!("Flag {} is NOT zero", flag_id)
            }
            ConditionType::FlagsSame { flag1, flag2 } => {
                format!("Flag {} equals Flag {}", flag1, flag2)
            }
            ConditionType::FlagsNotSame { flag1, flag2 } => {
                format!("Flag {} NOT equals Flag {}", flag1, flag2)
            }
            ConditionType::VerbIs { verb } => {
                format!("Command verb is '{}'", verb)
            }
            ConditionType::NounIs { noun } => {
                format!("Command noun is '{}'", noun)
            }
            ConditionType::Adject1Is { adjective } => {
                format!("First adjective is '{}'", adjective)
            }
            ConditionType::AdverbIs { adverb } => {
                format!("Adverb is '{}'", adverb)
            }
            ConditionType::PrepIs { preposition } => {
                format!("Preposition is '{}'", preposition)
            }
            ConditionType::Noun2Is { noun } => {
                format!("Second noun is '{}'", noun)
            }
            ConditionType::Adject2Is { adjective } => {
                format!("Second adjective is '{}'", adjective)
            }
            ConditionType::IsFirstTurn => {
                "This is the first turn".to_string()
            }
            ConditionType::TurnCountGreaterThan { turns } => {
                format!("Turn count > {}", turns)
            }
            ConditionType::TurnCountEquals { turns } => {
                format!("Turn count == {}", turns)
            }
            ConditionType::ScoreGreaterThan { score } => {
                format!("Score > {}", score)
            }
            ConditionType::ScoreEquals { score } => {
                format!("Score == {}", score)
            }
            ConditionType::IsDark => {
                "Current location is dark".to_string()
            }
            ConditionType::IsLight => {
                "Current location is light".to_string()
            }
            ConditionType::Chance { percentage } => {
                format!("{}% random chance", percentage)
            }
            ConditionType::Timeout => {
                "Timeout period has elapsed".to_string()
            }
            ConditionType::CarryWeight { weight } => {
                format!("Carry weight > {}", weight)
            }
            ConditionType::MaxCarriedObjects { count } => {
                format!("Carrying >{} objects", count)
            }
        }
    }
}

/// All possible condition types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionType {
    // Location conditions
    PlayerAt { location_id: u8 },
    PlayerNotAt { location_id: u8 },

    // Object conditions
    ObjectPresent { object_id: u8 },
    ObjectAbsent { object_id: u8 },           // ABSENT - object not present
    ObjectCarried { object_id: u8 },
    ObjectNotCarried { object_id: u8 },       // NOTCARR
    ObjectWorn { object_id: u8 },
    ObjectNotWorn { object_id: u8 },          // NOTWORN
    ObjectAt { object_id: u8, location_id: u8 },
    ObjectNotAt { object_id: u8, location_id: u8 }, // NOTAT
    ObjectExists { object_id: u8 },           // CREATE
    ObjectDestroyed { object_id: u8 },        // DESTROY
    ObjectWeightGreaterThan { object_id: u8, weight: u8 }, // WEIGHT
    ObjectIsContainer { object_id: u8 },      // Check if container
    ObjectIsWearable { object_id: u8 },       // Check if wearable

    // Flag conditions
    FlagEquals { flag_id: u8, value: u8 },
    FlagNotEquals { flag_id: u8, value: u8 },  // NOTEQ
    FlagGreaterThan { flag_id: u8, value: u8 },
    FlagLessThan { flag_id: u8, value: u8 },
    FlagZero { flag_id: u8 },
    FlagNotZero { flag_id: u8 },               // NOTZERO
    FlagsSame { flag1: u8, flag2: u8 },        // SAME
    FlagsNotSame { flag1: u8, flag2: u8 },     // NOTSAME

    // Parser conditions
    VerbIs { verb: String },
    NounIs { noun: String },
    Adject1Is { adjective: String },           // ADJECT1
    AdverbIs { adverb: String },               // ADVERB
    PrepIs { preposition: String },            // PREP
    Noun2Is { noun: String },                  // NOUN2
    Adject2Is { adjective: String },           // ADJECT2

    // State conditions
    IsFirstTurn,
    TurnCountGreaterThan { turns: u32 },
    TurnCountEquals { turns: u32 },
    ScoreGreaterThan { score: u16 },
    ScoreEquals { score: u16 },
    IsDark,                                     // ISDARK
    IsLight,                                    // ISLIGHT
    Chance { percentage: u8 },                  // CHANCE n (0-100)
    Timeout,                                    // TIMEOUT
    CarryWeight { weight: u8 },                // Check carry weight
    MaxCarriedObjects { count: u8 },           // Check max objects carried
}

/// Action (high-level, user-friendly)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub id: usize,
    pub action_type: ActionType,
}

impl Action {
    pub fn description(&self) -> String {
        match &self.action_type {
            // Display actions
            ActionType::ShowMessage { text } => {
                format!("Display: \"{}\"", text)
            }
            ActionType::ShowLocationDescription => {
                "Show location description".to_string()
            }
            ActionType::ClearScreen => {
                "Clear screen".to_string()
            }
            ActionType::NewLine => {
                "Print newline".to_string()
            }
            ActionType::Tab => {
                "Print tab".to_string()
            }
            ActionType::WriteNumber { value } => {
                format!("Write number: {}", value)
            }
            ActionType::DisplayObjectName { object_id } => {
                format!("Display name of object {}", object_id)
            }

            // Object actions
            ActionType::GetObject { object_id } => {
                format!("Pick up object {}", object_id)
            }
            ActionType::DropObject { object_id } => {
                format!("Drop object {}", object_id)
            }
            ActionType::WearObject { object_id } => {
                format!("Wear object {}", object_id)
            }
            ActionType::RemoveObject { object_id } => {
                format!("Remove object {}", object_id)
            }
            ActionType::MoveObject { object_id, to_location } => {
                format!("Move object {} to {:?}", object_id, to_location)
            }
            ActionType::CreateObject { object_id } => {
                format!("Create object {}", object_id)
            }
            ActionType::DestroyObject { object_id } => {
                format!("Destroy object {}", object_id)
            }
            ActionType::SwapObjects { object1, object2 } => {
                format!("Swap objects {} and {}", object1, object2)
            }
            ActionType::PlaceObject { object_id, location_id } => {
                format!("Place object {} at location {}", object_id, location_id)
            }
            ActionType::AutoGet => {
                "Auto-get object".to_string()
            }
            ActionType::AutoDrop => {
                "Auto-drop object".to_string()
            }
            ActionType::AutoWear => {
                "Auto-wear object".to_string()
            }
            ActionType::AutoRemove => {
                "Auto-remove object".to_string()
            }
            ActionType::ListObjects { location_id } => {
                format!("List objects at location {}", location_id)
            }

            // Flag actions
            ActionType::SetFlag { flag_id, value } => {
                format!("Set flag {} = {}", flag_id, value)
            }
            ActionType::IncrementFlag { flag_id } => {
                format!("Increment flag {}", flag_id)
            }
            ActionType::DecrementFlag { flag_id } => {
                format!("Decrement flag {}", flag_id)
            }
            ActionType::ClearFlag { flag_id } => {
                format!("Clear flag {} (set to 0)", flag_id)
            }
            ActionType::SetBit { flag_id } => {
                format!("Set flag {} to 1", flag_id)
            }
            ActionType::AddToFlag { flag_id, value } => {
                format!("Add {} to flag {}", value, flag_id)
            }
            ActionType::SubtractFromFlag { flag_id, value } => {
                format!("Subtract {} from flag {}", value, flag_id)
            }
            ActionType::CopyFlag { dest_flag, source_flag } => {
                format!("Copy flag {} to flag {}", source_flag, dest_flag)
            }

            // Movement
            ActionType::GoToLocation { location_id } => {
                format!("Go to location {}", location_id)
            }

            // Flow control
            ActionType::EndTurn => {
                "End turn (DONE)".to_string()
            }
            ActionType::ContinueProcessing => {
                "Continue processing (NOTDONE)".to_string()
            }
            ActionType::SkipRules { count } => {
                format!("Skip {} rules", count)
            }
            ActionType::OK => {
                "Success (OK)".to_string()
            }
            ActionType::EndGame => {
                "End game".to_string()
            }
            ActionType::Restart => {
                "Restart game".to_string()
            }
            ActionType::Pause { frames } => {
                format!("Pause for {} frames", frames)
            }

            // Score
            ActionType::AddScore { points } => {
                format!("Add {} points to score", points)
            }
            ActionType::SubtractScore { points } => {
                format!("Subtract {} points from score", points)
            }

            // Timeout
            ActionType::SetTimeout { turns } => {
                format!("Set timeout to {} turns", turns)
            }

            // Save/Load
            ActionType::SaveGame => {
                "Save game".to_string()
            }
            ActionType::LoadGame => {
                "Load game".to_string()
            }
            ActionType::RamSave => {
                "Save to RAM".to_string()
            }
            ActionType::RamLoad => {
                "Load from RAM".to_string()
            }

            // Sound/Graphics
            ActionType::Beep { duration, pitch } => {
                format!("Beep (duration: {}, pitch: {})", duration, pitch)
            }
            ActionType::PlaySound { sound_id } => {
                format!("Play sound {}", sound_id)
            }
            ActionType::StopSound { sound_id } => {
                format!("Stop sound {}", sound_id)
            }
            ActionType::Picture { picture_id } => {
                format!("Display picture {}", picture_id)
            }

            // Display attributes
            ActionType::Border { color } => {
                format!("Set border color to {}", color)
            }
            ActionType::Paper { color } => {
                format!("Set paper color to {}", color)
            }
            ActionType::Ink { color } => {
                format!("Set ink color to {}", color)
            }

            // MALUVA Extension Actions
            ActionType::XPicture { picture_id } => {
                format!("MALUVA: Display picture {}", picture_id)
            }
            ActionType::XSave => {
                "MALUVA: Save with graphics".to_string()
            }
            ActionType::XLoad => {
                "MALUVA: Load saved game".to_string()
            }
            ActionType::XPart { effect_id } => {
                format!("MALUVA: Particle effect {}", effect_id)
            }
            ActionType::XMessage { message_id } => {
                format!("MALUVA: Extended message {}", message_id)
            }
            ActionType::XTo { location_id } => {
                format!("MALUVA: Go to location {} with effects", location_id)
            }
            ActionType::XDone => {
                "MALUVA: End turn with effects".to_string()
            }
            ActionType::XEnd => {
                "MALUVA: End game with effects".to_string()
            }
        }
    }
}

/// All possible action types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    // Display actions
    ShowMessage { text: String },
    ShowLocationDescription,
    ClearScreen,
    NewLine,                             // NEWLINE - print newline
    Tab,                                 // TAB - print tab
    WriteNumber { value: u8 },          // WRITELN - write number
    DisplayObjectName { object_id: u8 }, // Display object name

    // Object actions
    GetObject { object_id: u8 },
    DropObject { object_id: u8 },
    WearObject { object_id: u8 },
    RemoveObject { object_id: u8 },
    MoveObject { object_id: u8, to_location: ObjectLocation },
    CreateObject { object_id: u8 },      // CREATE - create object
    DestroyObject { object_id: u8 },     // DESTROY - destroy object
    SwapObjects { object1: u8, object2: u8 }, // SWAP - swap two objects
    PlaceObject { object_id: u8, location_id: u8 }, // PLACE - place at location
    AutoGet,                             // AUTOG - auto get object
    AutoDrop,                            // AUTOD - auto drop object
    AutoWear,                            // AUTOW - auto wear object
    AutoRemove,                          // AUTOR - auto remove object
    ListObjects { location_id: u8 },     // LISTAT - list objects at location

    // Flag actions
    SetFlag { flag_id: u8, value: u8 },
    IncrementFlag { flag_id: u8 },
    DecrementFlag { flag_id: u8 },
    ClearFlag { flag_id: u8 },           // CLEAR - set to 0
    SetBit { flag_id: u8 },              // SET - set to 1
    AddToFlag { flag_id: u8, value: u8 }, // PLUS - add value
    SubtractFromFlag { flag_id: u8, value: u8 }, // MINUS - subtract value
    CopyFlag { dest_flag: u8, source_flag: u8 }, // LET - copy flag

    // Movement actions
    GoToLocation { location_id: u8 },

    // Flow control
    EndTurn,
    ContinueProcessing,
    SkipRules { count: u8 },
    OK,                                  // OK - success, end processing
    EndGame,                             // END - end game
    Restart,                             // RESTART - restart game
    Pause { frames: u8 },               // PAUSE - pause frames

    // Score
    AddScore { points: u16 },
    SubtractScore { points: u16 },       // Subtract from score

    // Timeout
    SetTimeout { turns: u8 },            // TIMEOUT - set timeout counter

    // Save/Load
    SaveGame,                            // SAVE - save game
    LoadGame,                            // LOAD - load game
    RamSave,                             // RAMSAVE - save to RAM
    RamLoad,                             // RAMLOAD - load from RAM

    // Sound/Graphics (non-MAAD)
    Beep { duration: u8, pitch: u8 },   // BEEP - make sound
    PlaySound { sound_id: u8 },         // Play sound effect or music
    StopSound { sound_id: u8 },         // Stop playing sound
    Picture { picture_id: u8 },          // PICTURE - display picture

    // Display attributes
    Border { color: u8 },                // BORDER - set border color
    Paper { color: u8 },                 // PAPER - set paper color
    Ink { color: u8 },                   // INK - set ink color

    // MALUVA Extension Actions (Module 36)
    // These require #extern "MALUVA.BIN" directive in header
    XPicture { picture_id: u8 },        // Display extended graphics
    XSave,                               // Extended save with graphics
    XLoad,                               // Extended load
    XPart { effect_id: u8 },            // Particle effects
    XMessage { message_id: u8 },        // Extended messages with graphics
    XTo { location_id: u8 },            // Extended location change with effects
    XDone,                               // Extended done with effects
    XEnd,                                // Extended end with effects
}

/// Flag (game variable)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Flag {
    pub id: u8,
    pub name: String,           // User-friendly name
    pub description: String,    // What it represents
    pub initial_value: u8,
}

impl Default for Flag {
    fn default() -> Self {
        Self {
            id: 0,
            name: "flag_0".to_string(),
            description: "Unnamed flag".to_string(),
            initial_value: 0,
        }
    }
}
