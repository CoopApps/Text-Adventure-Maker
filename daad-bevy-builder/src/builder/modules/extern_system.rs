/// Module 36: EXTERN System
/// Manages external routine calls (EXTERN condact) - Advanced feature
use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// External routine system for calling native/assembly code
#[derive(Debug, Clone, Serialize, Deserialize, Resource, Default)]
pub struct ExternSystem {
    pub routines: Vec<ExternRoutine>,
    pub enabled: bool,
}

impl ExternSystem {
    pub fn new() -> Self {
        Self {
            routines: Vec::new(),
            enabled: false,  // Disabled by default (advanced feature)
        }
    }

    /// Generate DAAD code
    pub fn to_daad_code(&self) -> String {
        if !self.enabled || self.routines.is_empty() {
            return String::from("; External routines system disabled\n");
        }

        let mut code = String::from("; External Routines System\n");
        code.push_str("; WARNING: Advanced feature - requires platform-specific implementation\n\n");

        for routine in &self.routines {
            code.push_str(&routine.to_daad_code());
        }

        code
    }
}

/// External routine definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternRoutine {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub platform: TargetPlatform,
    pub routine_type: ExternType,
    pub parameters: Vec<Parameter>,
    pub return_value: Option<ReturnType>,
    pub enabled: bool,
}

impl ExternRoutine {
    pub fn new(id: u8, name: String, platform: TargetPlatform) -> Self {
        Self {
            id,
            name,
            description: String::new(),
            platform,
            routine_type: ExternType::Custom,
            parameters: Vec::new(),
            return_value: None,
            enabled: true,
        }
    }

    pub fn to_daad_code(&self) -> String {
        let mut code = format!("; External Routine {}: {}\n", self.id, self.name);
        code.push_str(&format!("; Platform: {:?}\n", self.platform));
        code.push_str(&format!("; Type: {:?}\n", self.routine_type));
        code.push_str(&format!("; Description: {}\n", self.description));

        // Parameters
        if !self.parameters.is_empty() {
            code.push_str("; Parameters:\n");
            for param in &self.parameters {
                code.push_str(&format!(";   - {}: {:?}\n", param.name, param.param_type));
            }
        }

        // Return value
        if let Some(ret) = &self.return_value {
            code.push_str(&format!("; Returns: {:?}\n", ret));
        }

        code.push_str(&format!("EXTERN {}\n\n", self.id));

        code
    }
}

/// Target platform for external routine
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum TargetPlatform {
    ZXSpectrum,     // Z80 assembly
    AmstradCPC,     // Z80 assembly
    MSDOS,          // x86 assembly
    Modern,         // Modern interpreters (JavaScript, Rust, etc.)
    CrossPlatform,  // Works on all platforms
}

impl TargetPlatform {
    pub fn name(&self) -> &'static str {
        match self {
            TargetPlatform::ZXSpectrum => "ZX Spectrum",
            TargetPlatform::AmstradCPC => "Amstrad CPC",
            TargetPlatform::MSDOS => "MS-DOS",
            TargetPlatform::Modern => "Modern Interpreters",
            TargetPlatform::CrossPlatform => "Cross-Platform",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            TargetPlatform::ZXSpectrum => "Z80 assembly for ZX Spectrum",
            TargetPlatform::AmstradCPC => "Z80 assembly for Amstrad CPC",
            TargetPlatform::MSDOS => "x86 assembly for MS-DOS",
            TargetPlatform::Modern => "JavaScript/Rust for modern interpreters",
            TargetPlatform::CrossPlatform => "Simulated, works everywhere",
        }
    }
}

/// Type of external routine
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ExternType {
    Graphics,       // Graphics operations
    Sound,          // Sound/music
    FileIO,         // File input/output
    Network,        // Network operations
    Hardware,       // Direct hardware access
    Math,           // Mathematical operations
    String,         // String manipulation
    Custom,         // Custom operation
}

impl ExternType {
    pub fn name(&self) -> &'static str {
        match self {
            ExternType::Graphics => "Graphics",
            ExternType::Sound => "Sound/Music",
            ExternType::FileIO => "File I/O",
            ExternType::Network => "Network",
            ExternType::Hardware => "Hardware",
            ExternType::Math => "Mathematics",
            ExternType::String => "String Operations",
            ExternType::Custom => "Custom",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            ExternType::Graphics => "Graphics drawing and manipulation",
            ExternType::Sound => "Sound effects and music playback",
            ExternType::FileIO => "File read/write operations",
            ExternType::Network => "Network communication",
            ExternType::Hardware => "Direct hardware access",
            ExternType::Math => "Complex mathematical calculations",
            ExternType::String => "Advanced string processing",
            ExternType::Custom => "Custom user-defined operation",
        }
    }
}

/// Parameter for external routine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Parameter {
    pub name: String,
    pub param_type: ParameterType,
    pub description: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ParameterType {
    Flag,       // Flag ID (0-255)
    Object,     // Object ID
    Location,   // Location ID
    Number,     // Numeric value
    String,     // String parameter
}

/// Return type for external routine
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReturnType {
    None,       // No return value
    Flag,       // Returns value to flag
    Boolean,    // Returns true/false (as condition)
    Number,     // Returns numeric value
}

/// External routine templates
pub enum ExternTemplate {
    RandomNumber,       // Generate random number
    PlaySound,          // Play sound effect
    DrawSprite,         // Draw graphics sprite
    SaveHighScore,      // Save score to file
    NetworkMultiplayer, // Multiplayer networking
}

impl ExternTemplate {
    pub fn create_routine(&self, id: u8) -> ExternRoutine {
        match self {
            ExternTemplate::RandomNumber => ExternRoutine {
                id,
                name: "Random Number Generator".to_string(),
                description: "Generate random number in range".to_string(),
                platform: TargetPlatform::CrossPlatform,
                routine_type: ExternType::Math,
                parameters: vec![
                    Parameter {
                        name: "min".to_string(),
                        param_type: ParameterType::Number,
                        description: "Minimum value".to_string(),
                    },
                    Parameter {
                        name: "max".to_string(),
                        param_type: ParameterType::Number,
                        description: "Maximum value".to_string(),
                    },
                ],
                return_value: Some(ReturnType::Number),
                enabled: true,
            },
            ExternTemplate::PlaySound => ExternRoutine {
                id,
                name: "Play Sound Effect".to_string(),
                description: "Play platform-specific sound".to_string(),
                platform: TargetPlatform::Modern,
                routine_type: ExternType::Sound,
                parameters: vec![Parameter {
                    name: "sound_id".to_string(),
                    param_type: ParameterType::Number,
                    description: "Sound effect ID".to_string(),
                }],
                return_value: None,
                enabled: true,
            },
            ExternTemplate::DrawSprite => ExternRoutine {
                id,
                name: "Draw Sprite".to_string(),
                description: "Draw graphical sprite".to_string(),
                platform: TargetPlatform::ZXSpectrum,
                routine_type: ExternType::Graphics,
                parameters: vec![
                    Parameter {
                        name: "sprite_id".to_string(),
                        param_type: ParameterType::Number,
                        description: "Sprite ID".to_string(),
                    },
                    Parameter {
                        name: "x".to_string(),
                        param_type: ParameterType::Number,
                        description: "X position".to_string(),
                    },
                    Parameter {
                        name: "y".to_string(),
                        param_type: ParameterType::Number,
                        description: "Y position".to_string(),
                    },
                ],
                return_value: None,
                enabled: true,
            },
            ExternTemplate::SaveHighScore => ExternRoutine {
                id,
                name: "Save High Score".to_string(),
                description: "Save score to persistent storage".to_string(),
                platform: TargetPlatform::Modern,
                routine_type: ExternType::FileIO,
                parameters: vec![Parameter {
                    name: "score".to_string(),
                    param_type: ParameterType::Flag,
                    description: "Score flag ID".to_string(),
                }],
                return_value: Some(ReturnType::Boolean),
                enabled: true,
            },
            ExternTemplate::NetworkMultiplayer => ExternRoutine {
                id,
                name: "Network Sync".to_string(),
                description: "Synchronize multiplayer game state".to_string(),
                platform: TargetPlatform::Modern,
                routine_type: ExternType::Network,
                parameters: vec![],
                return_value: None,
                enabled: true,
            },
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            ExternTemplate::RandomNumber => "Random Number Generator",
            ExternTemplate::PlaySound => "Play Sound Effect",
            ExternTemplate::DrawSprite => "Draw Sprite",
            ExternTemplate::SaveHighScore => "Save High Score",
            ExternTemplate::NetworkMultiplayer => "Network Multiplayer",
        }
    }
}

/// Bevy plugin
pub struct ExternSystemPlugin;

impl Plugin for ExternSystemPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<ExternSystem>()
            .add_systems(Update, (
                render_extern_ui,
                handle_add_routine_button,
                handle_platform_selection,
                handle_template_selection,
                render_warning_message,
            ));
    }
}

fn render_extern_ui(/* Bevy systems */) {
    // TODO: List of external routines
}

fn handle_add_routine_button(/* Bevy systems */) {
    // TODO: Create new external routine
}

fn handle_platform_selection(/* Bevy systems */) {
    // TODO: Select target platform
}

fn handle_template_selection(/* Bevy systems */) {
    // TODO: Apply extern template
}

fn render_warning_message(/* Bevy systems */) {
    // TODO: Show warning about advanced feature
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extern_routine() {
        let routine = ExternRoutine::new(0, "Test".to_string(), TargetPlatform::Modern);
        assert_eq!(routine.name, "Test");
        assert_eq!(routine.platform, TargetPlatform::Modern);
    }

    #[test]
    fn test_templates() {
        let routine = ExternTemplate::RandomNumber.create_routine(0);
        assert_eq!(routine.routine_type, ExternType::Math);
        assert_eq!(routine.parameters.len(), 2);
    }
}
