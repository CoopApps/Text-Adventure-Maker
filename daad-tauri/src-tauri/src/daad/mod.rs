// DAAD data structures and code generation for Tauri

pub mod types;
pub mod game;
pub mod codegen;

// Re-exports
pub use types::*;
pub use game::DaadGame;
pub use codegen::DaadCodeGenerator;
