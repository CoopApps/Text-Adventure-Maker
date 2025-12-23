use serde::{Deserialize, Serialize};

/// Simple 2D position for editor
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct Vec2 {
    pub x: f32,
    pub y: f32,
}

impl Vec2 {
    pub fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }
}

/// Simple color type (RGBA)
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

impl Default for Color {
    fn default() -> Self {
        Self { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
    }
}

impl Color {
    pub fn rgb(r: f32, g: f32, b: f32) -> Self {
        Self { r, g, b, a: 1.0 }
    }
}

/// Direction for movement between locations
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
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

    pub fn opposite(&self) -> Direction {
        match self {
            Direction::North => Direction::South,
            Direction::South => Direction::North,
            Direction::East => Direction::West,
            Direction::West => Direction::East,
            Direction::Up => Direction::Down,
            Direction::Down => Direction::Up,
            Direction::Northeast => Direction::Southwest,
            Direction::Northwest => Direction::Southeast,
            Direction::Southeast => Direction::Northwest,
            Direction::Southwest => Direction::Northeast,
            Direction::In => Direction::Out,
            Direction::Out => Direction::In,
        }
    }
}

/// Connection between locations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub direction: Direction,
    pub target_location: u8,
    pub is_locked: bool,
    pub required_key: Option<u8>,
}

/// A location/room in the game
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub is_dark: bool,
    pub connections: Vec<Connection>,
    pub editor_position: Vec2,
    pub editor_color: Color,
}

impl Default for Location {
    fn default() -> Self {
        Self {
            id: 0,
            name: String::new(),
            description: String::new(),
            is_dark: false,
            connections: Vec::new(),
            editor_position: Vec2::default(),
            editor_color: Color::rgb(0.3, 0.5, 0.7),
        }
    }
}

/// Where an object is located
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ObjectLocation {
    Location(u8),
    Carried,
    Worn,
    Inside(u8),
    Limbo,
}

impl ObjectLocation {
    pub fn to_daad_location(&self) -> u8 {
        match self {
            ObjectLocation::Location(loc) => *loc,
            ObjectLocation::Carried => 252,
            ObjectLocation::Worn => 254,
            ObjectLocation::Inside(container) => *container,
            ObjectLocation::Limbo => 253,
        }
    }
}

/// An object in the game
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Object {
    pub id: u8,
    pub name: String,
    pub noun: String,
    pub adjective: String,
    pub description: String,
    pub location: ObjectLocation,
    pub weight: u8,
    pub is_container: bool,
    pub is_wearable: bool,
    pub is_takeable: bool,
    pub icon: String,
}

impl Default for Object {
    fn default() -> Self {
        Self {
            id: 0,
            name: String::new(),
            noun: String::new(),
            adjective: String::new(),
            description: String::new(),
            location: ObjectLocation::Limbo,
            weight: 1,
            is_container: false,
            is_wearable: false,
            is_takeable: true,
            icon: "📦".to_string(),
        }
    }
}

/// Process table types in DAAD
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProcessTable {
    Parsing,
    Response,
    AutoAction,
    Description,
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

    pub fn description(&self) -> &'static str {
        match self {
            ProcessTable::Parsing => "Parsing (intercept commands)",
            ProcessTable::Response => "Response (handle player input)",
            ProcessTable::AutoAction => "Auto-Action (runs every turn)",
            ProcessTable::Description => "Description (location text)",
        }
    }
}

/// Condition types for rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionType {
    PlayerAt { location_id: u8 },
    PlayerNotAt { location_id: u8 },
    ObjectPresent { object_id: u8 },
    ObjectCarried { object_id: u8 },
    ObjectWorn { object_id: u8 },
    ObjectAt { object_id: u8, location_id: u8 },
    FlagEquals { flag_id: u8, value: u8 },
    FlagGreaterThan { flag_id: u8, value: u8 },
    FlagLessThan { flag_id: u8, value: u8 },
    FlagZero { flag_id: u8 },
    VerbIs { verb: String },
    NounIs { noun: String },
    IsFirstTurn,
    TurnCountGreaterThan { count: u16 },
    ScoreGreaterThan { score: u16 },
}

impl ConditionType {
    pub fn description(&self) -> String {
        match self {
            ConditionType::PlayerAt { location_id } => format!("Player at location {}", location_id),
            ConditionType::PlayerNotAt { location_id } => format!("Player not at location {}", location_id),
            ConditionType::ObjectPresent { object_id } => format!("Object {} present", object_id),
            ConditionType::ObjectCarried { object_id } => format!("Carrying object {}", object_id),
            ConditionType::ObjectWorn { object_id } => format!("Wearing object {}", object_id),
            ConditionType::ObjectAt { object_id, location_id } => format!("Object {} at location {}", object_id, location_id),
            ConditionType::FlagEquals { flag_id, value } => format!("Flag {} equals {}", flag_id, value),
            ConditionType::FlagGreaterThan { flag_id, value } => format!("Flag {} > {}", flag_id, value),
            ConditionType::FlagLessThan { flag_id, value } => format!("Flag {} < {}", flag_id, value),
            ConditionType::FlagZero { flag_id } => format!("Flag {} is zero", flag_id),
            ConditionType::VerbIs { verb } => format!("Verb is \"{}\"", verb),
            ConditionType::NounIs { noun } => format!("Noun is \"{}\"", noun),
            ConditionType::IsFirstTurn => "Is first turn".to_string(),
            ConditionType::TurnCountGreaterThan { count } => format!("Turns > {}", count),
            ConditionType::ScoreGreaterThan { score } => format!("Score > {}", score),
        }
    }
}

/// A condition in a rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    pub condition_type: ConditionType,
    pub negated: bool,
}

/// Action types for rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    ShowMessage { text: String },
    ShowLocationDescription,
    ClearScreen,
    GetObject { object_id: u8 },
    DropObject { object_id: u8 },
    WearObject { object_id: u8 },
    RemoveObject { object_id: u8 },
    MoveObject { object_id: u8, location_id: u8 },
    SetFlag { flag_id: u8, value: u8 },
    IncrementFlag { flag_id: u8 },
    DecrementFlag { flag_id: u8 },
    GoToLocation { location_id: u8 },
    EndTurn,
    ContinueProcessing,
    SkipRules { count: u8 },
    AddScore { points: u16 },
}

impl ActionType {
    pub fn description(&self) -> String {
        match self {
            ActionType::ShowMessage { text } => format!("Show: \"{}\"", text),
            ActionType::ShowLocationDescription => "Show location description".to_string(),
            ActionType::ClearScreen => "Clear screen".to_string(),
            ActionType::GetObject { object_id } => format!("Get object {}", object_id),
            ActionType::DropObject { object_id } => format!("Drop object {}", object_id),
            ActionType::WearObject { object_id } => format!("Wear object {}", object_id),
            ActionType::RemoveObject { object_id } => format!("Remove object {}", object_id),
            ActionType::MoveObject { object_id, location_id } => format!("Move object {} to location {}", object_id, location_id),
            ActionType::SetFlag { flag_id, value } => format!("Set flag {} = {}", flag_id, value),
            ActionType::IncrementFlag { flag_id } => format!("Increment flag {}", flag_id),
            ActionType::DecrementFlag { flag_id } => format!("Decrement flag {}", flag_id),
            ActionType::GoToLocation { location_id } => format!("Go to location {}", location_id),
            ActionType::EndTurn => "End turn (DONE)".to_string(),
            ActionType::ContinueProcessing => "Continue (NOTDONE)".to_string(),
            ActionType::SkipRules { count } => format!("Skip {} rules", count),
            ActionType::AddScore { points } => format!("Add {} points", points),
        }
    }
}

/// An action in a rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub action_type: ActionType,
}

/// A rule/process entry in the game
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub id: usize,
    pub name: String,
    pub process: ProcessTable,
    pub conditions: Vec<Condition>,
    pub actions: Vec<Action>,
    pub enabled: bool,
    pub editor_position: Vec2,
}

impl Default for Rule {
    fn default() -> Self {
        Self {
            id: 0,
            name: String::new(),
            process: ProcessTable::Response,
            conditions: Vec::new(),
            actions: Vec::new(),
            enabled: true,
            editor_position: Vec2::default(),
        }
    }
}

/// A flag/variable in the game
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Flag {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub initial_value: u8,
}

impl Default for Flag {
    fn default() -> Self {
        Self {
            id: 0,
            name: String::new(),
            description: String::new(),
            initial_value: 0,
        }
    }
}

/// Vocabulary word type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum VocabType {
    Verb,
    Noun,
    Adjective,
}

/// A vocabulary entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VocabEntry {
    pub word: String,
    pub word_type: VocabType,
    pub id: u8,
}
