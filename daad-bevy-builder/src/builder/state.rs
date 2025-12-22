use bevy::prelude::*;
use crate::daad::game::DaadGame;
use crate::launcher::{DrcTarget, DrcSubtarget};

/// Builder application state
#[derive(Resource)]
pub struct BuilderState {
    pub current_game: DaadGame,
    pub selected_panel: Panel,
    pub editing: Option<EditMode>,
    pub show_code_viewer: bool,
    pub show_preview: bool,
    pub unsaved_changes: bool,
    pub current_file_path: Option<String>,
    pub compilation_output: Option<String>,
    pub compilation_success: bool,
    pub target_platform: DrcTarget,
    pub target_subtarget: Option<DrcSubtarget>,
    pub recent_files: Vec<String>,
    pub auto_save_enabled: bool,
    pub last_save_time: f64,
}

impl Default for BuilderState {
    fn default() -> Self {
        Self {
            current_game: DaadGame::default(),
            selected_panel: Panel::default(),
            editing: None,
            show_code_viewer: true,  // Show code by default
            show_preview: false,
            unsaved_changes: false,
            current_file_path: None,
            compilation_output: None,
            compilation_success: false,
            target_platform: DrcTarget::ZXSpectrum,
            target_subtarget: Some(DrcSubtarget::ZXPlus3),
            recent_files: Vec::new(),
            auto_save_enabled: true,  // Auto-save enabled by default
            last_save_time: 0.0,
        }
    }
}

/// Which panel is currently active
#[derive(Default, PartialEq, Eq, Clone, Copy, Debug)]
pub enum Panel {
    #[default]
    GameInfo,      // Title, author, settings
    Locations,     // Location editor
    Objects,       // Object editor
    Rules,         // Rule/logic editor
    Flags,         // Flag manager
    Vocabulary,    // Vocabulary/words editor
    Graphics,      // Graphics/pictures manager
    Sounds,        // Sound & music manager
    Templates,     // Script templates library
    Dialogue,      // Conversation tree builder
    Analytics,     // Game statistics and analysis
    Messages,      // Message editor
    Debug,         // Debug tools
    Preview,       // Test the game
    Export,        // Export options
}

impl Panel {
    pub fn as_str(&self) -> &'static str {
        match self {
            Panel::GameInfo => "Game Info",
            Panel::Locations => "Locations",
            Panel::Objects => "Objects",
            Panel::Rules => "Rules",
            Panel::Flags => "Flags",
            Panel::Vocabulary => "Vocabulary",
            Panel::Graphics => "Graphics",
            Panel::Sounds => "Sounds",
            Panel::Templates => "Templates",
            Panel::Dialogue => "Dialogue",
            Panel::Analytics => "Analytics",
            Panel::Messages => "Messages",
            Panel::Debug => "Debug",
            Panel::Preview => "Preview",
            Panel::Export => "Export",
        }
    }

    pub fn icon(&self) -> &'static str {
        match self {
            Panel::GameInfo => "📋",
            Panel::Locations => "📍",
            Panel::Objects => "📦",
            Panel::Rules => "⚙️",
            Panel::Flags => "🚩",
            Panel::Vocabulary => "📖",
            Panel::Graphics => "🖼️",
            Panel::Sounds => "🔊",
            Panel::Templates => "📝",
            Panel::Dialogue => "🗣️",
            Panel::Analytics => "📊",
            Panel::Messages => "💬",
            Panel::Debug => "🔍",
            Panel::Preview => "▶️",
            Panel::Export => "💾",
        }
    }
}

/// What's currently being edited
#[derive(Debug, Clone)]
pub enum EditMode {
    Location(u8),   // Editing location ID
    Object(u8),     // Editing object ID
    Rule(usize),    // Editing rule ID
    Flag(u8),       // Editing flag ID
    Message(usize), // Editing message ID
    None,           // Nothing being edited
}

impl BuilderState {
    /// Mark that changes have been made
    pub fn mark_dirty(&mut self) {
        self.unsaved_changes = true;
    }

    /// Mark that changes have been saved
    pub fn mark_clean(&mut self) {
        self.unsaved_changes = false;
    }

    /// Switch to a different panel
    pub fn select_panel(&mut self, panel: Panel) {
        self.selected_panel = panel;
        self.editing = None;
    }

    /// Start editing an item
    pub fn start_editing(&mut self, mode: EditMode) {
        self.editing = Some(mode);
    }

    /// Stop editing
    pub fn stop_editing(&mut self) {
        self.editing = None;
    }

    /// Save current game to file
    pub fn save_game(&mut self, path: &str) -> Result<(), std::io::Error> {
        self.current_game.save_to_file(path)?;
        self.current_file_path = Some(path.to_string());
        self.add_to_recent_files(path);
        self.mark_clean();
        Ok(())
    }

    /// Load game from file
    pub fn load_game(&mut self, path: &str) -> Result<(), std::io::Error> {
        let game = DaadGame::load_from_file(path)?;
        self.current_game = game;
        self.current_file_path = Some(path.to_string());
        self.add_to_recent_files(path);
        self.mark_clean();
        Ok(())
    }

    /// Create a new game
    pub fn new_game(&mut self, title: &str, author: &str) {
        self.current_game = DaadGame::new(title, author);
        self.current_file_path = None;
        self.mark_clean();
    }

    /// Add file to recent files list (max 10 items)
    pub fn add_to_recent_files(&mut self, path: &str) {
        // Remove if already exists
        self.recent_files.retain(|p| p != path);
        // Add to front
        self.recent_files.insert(0, path.to_string());
        // Keep only last 10
        if self.recent_files.len() > 10 {
            self.recent_files.truncate(10);
        }
        // Save recent files to disk
        let _ = self.save_recent_files();
    }

    /// Load recent files from disk
    pub fn load_recent_files(&mut self) {
        if let Ok(contents) = std::fs::read_to_string("./recent_files.json") {
            if let Ok(files) = serde_json::from_str::<Vec<String>>(&contents) {
                self.recent_files = files;
            }
        }
    }

    /// Save recent files to disk
    fn save_recent_files(&self) -> Result<(), std::io::Error> {
        let json = serde_json::to_string_pretty(&self.recent_files)?;
        std::fs::write("./recent_files.json", json)
    }

    /// Perform auto-save if needed
    pub fn auto_save(&mut self, current_time: f64) -> Result<(), std::io::Error> {
        if !self.auto_save_enabled || !self.unsaved_changes {
            return Ok(());
        }

        // Auto-save every 60 seconds
        if current_time - self.last_save_time > 60.0 {
            if let Some(path) = &self.current_file_path.clone() {
                self.save_game(path)?;
                self.last_save_time = current_time;
                info!("Auto-saved to: {}", path);
            }
        }
        Ok(())
    }
}
