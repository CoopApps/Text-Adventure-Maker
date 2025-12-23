// Builder UI and state management
use bevy::prelude::*;

pub mod state;
pub mod ui;
pub mod editors;

pub use state::BuilderState;

/// Marker component for the root UI container
#[derive(Component)]
pub struct RootUiContainer;
