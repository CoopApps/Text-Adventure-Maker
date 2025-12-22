/// Module 34: Object Attributes System
/// Manages advanced object properties: scenery, openable, lockable, switchable, breakable
use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// Advanced attributes for DAAD objects
/// These control complex object behaviors beyond basic properties
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ObjectAttributes {
    // Scenery - can't be taken
    pub scenery: bool,          // Object is part of scenery (can't GET)

    // Openable/closeable (doors, boxes, containers)
    pub openable: bool,         // Can be opened/closed
    pub is_open: bool,          // Current open/closed state

    // Lockable (doors, chests)
    pub lockable: bool,         // Can be locked/unlocked
    pub is_locked: bool,        // Current locked state
    pub key_id: Option<u8>,     // Object ID of key needed

    // Switchable (lights, machines)
    pub switchable: bool,       // Can be turned on/off
    pub is_on: bool,            // Current on/off state

    // Breakable
    pub breakable: bool,        // Can be broken/destroyed
    pub is_broken: bool,        // Current broken state

    // Container properties
    pub container_capacity: Option<u8>,  // Max objects inside (None = unlimited)
    pub transparent: bool,               // Can see inside without opening
}

impl ObjectAttributes {
    /// Create default attributes for a standard takeable object
    pub fn takeable() -> Self {
        Self {
            scenery: false,
            ..Default::default()
        }
    }

    /// Create attributes for scenery (can't be taken)
    pub fn scenery() -> Self {
        Self {
            scenery: true,
            ..Default::default()
        }
    }

    /// Create attributes for a door
    pub fn door(lockable: bool, key_id: Option<u8>) -> Self {
        Self {
            scenery: true,
            openable: true,
            is_open: false,
            lockable,
            is_locked: lockable,
            key_id,
            ..Default::default()
        }
    }

    /// Create attributes for a container (box, chest, etc.)
    pub fn container(openable: bool, capacity: Option<u8>) -> Self {
        Self {
            openable,
            is_open: !openable,  // If not openable, it's always "open"
            container_capacity: capacity,
            transparent: false,
            ..Default::default()
        }
    }

    /// Create attributes for a light source
    pub fn light_source() -> Self {
        Self {
            switchable: true,
            is_on: false,
            ..Default::default()
        }
    }

    /// Get human-readable description of attributes
    pub fn describe(&self) -> String {
        let mut parts = Vec::new();

        if self.scenery {
            parts.push("Scenery (can't take)");
        }

        if self.openable {
            if self.is_open {
                parts.push("Open");
            } else {
                parts.push("Closed");
            }
        }

        if self.lockable {
            if self.is_locked {
                parts.push("Locked");
            } else {
                parts.push("Unlocked");
            }
        }

        if self.switchable {
            if self.is_on {
                parts.push("On");
            } else {
                parts.push("Off");
            }
        }

        if self.breakable {
            if self.is_broken {
                parts.push("Broken");
            } else {
                parts.push("Intact");
            }
        }

        if parts.is_empty() {
            "Standard object".to_string()
        } else {
            parts.join(", ")
        }
    }
}

/// Preset templates for common object types
pub enum ObjectTemplate {
    Standard,           // Takeable object
    Scenery,            // Can't be taken
    Door,               // Openable, possibly lockable
    Chest,              // Container, openable, possibly lockable
    Light,              // Switchable on/off
    Machine,            // Switchable, possibly breakable
    Furniture,          // Scenery, possibly container
    Clothing,           // Wearable
    Food,               // Consumable (destroyed after use)
    Key,                // Opens locks
}

impl ObjectTemplate {
    pub fn create_attributes(&self) -> ObjectAttributes {
        match self {
            ObjectTemplate::Standard => ObjectAttributes::takeable(),
            ObjectTemplate::Scenery => ObjectAttributes::scenery(),
            ObjectTemplate::Door => ObjectAttributes::door(false, None),
            ObjectTemplate::Chest => ObjectAttributes::container(true, Some(10)),
            ObjectTemplate::Light => ObjectAttributes::light_source(),
            ObjectTemplate::Machine => ObjectAttributes {
                switchable: true,
                breakable: true,
                ..Default::default()
            },
            ObjectTemplate::Furniture => ObjectAttributes {
                scenery: true,
                ..Default::default()
            },
            ObjectTemplate::Clothing => ObjectAttributes::takeable(),
            ObjectTemplate::Food => ObjectAttributes::takeable(),
            ObjectTemplate::Key => ObjectAttributes::takeable(),
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            ObjectTemplate::Standard => "Standard Object",
            ObjectTemplate::Scenery => "Scenery",
            ObjectTemplate::Door => "Door",
            ObjectTemplate::Chest => "Chest/Container",
            ObjectTemplate::Light => "Light Source",
            ObjectTemplate::Machine => "Machine",
            ObjectTemplate::Furniture => "Furniture",
            ObjectTemplate::Clothing => "Clothing",
            ObjectTemplate::Food => "Food/Consumable",
            ObjectTemplate::Key => "Key",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            ObjectTemplate::Standard => "Normal takeable object",
            ObjectTemplate::Scenery => "Part of the scenery, can't be taken",
            ObjectTemplate::Door => "Openable passage, optionally lockable",
            ObjectTemplate::Chest => "Container that can hold other objects",
            ObjectTemplate::Light => "Can be turned on/off to provide light",
            ObjectTemplate::Machine => "Switchable device that can break",
            ObjectTemplate::Furniture => "Static scenery object",
            ObjectTemplate::Clothing => "Wearable item",
            ObjectTemplate::Food => "Consumable item",
            ObjectTemplate::Key => "Opens locked doors/containers",
        }
    }

    pub fn icon(&self) -> &'static str {
        match self {
            ObjectTemplate::Standard => "📦",
            ObjectTemplate::Scenery => "🌳",
            ObjectTemplate::Door => "🚪",
            ObjectTemplate::Chest => "📦",
            ObjectTemplate::Light => "💡",
            ObjectTemplate::Machine => "⚙️",
            ObjectTemplate::Furniture => "🪑",
            ObjectTemplate::Clothing => "👕",
            ObjectTemplate::Food => "🍎",
            ObjectTemplate::Key => "🗝️",
        }
    }
}

/// Bevy plugin for Object Attributes system
pub struct ObjectAttributesPlugin;

impl Plugin for ObjectAttributesPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Update, (
            render_attributes_ui,
            handle_template_selection,
            handle_attribute_toggles,
        ));
    }
}

/// Render the attributes editor UI
fn render_attributes_ui(
    /* Bevy systems will be added here */
) {
    // TODO: Implement UI rendering with Bevy UI components
    // This will show checkboxes for each attribute
    // Template dropdown
    // Key selector for lockable objects
}

/// Handle template selection dropdown
fn handle_template_selection(
    /* Bevy systems */
) {
    // TODO: Apply template attributes when user selects from dropdown
}

/// Handle attribute toggle checkboxes
fn handle_attribute_toggles(
    /* Bevy systems */
) {
    // TODO: Toggle individual attributes when checkboxes clicked
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_door_attributes() {
        let door = ObjectAttributes::door(true, Some(5));
        assert!(door.scenery);
        assert!(door.openable);
        assert!(!door.is_open);
        assert!(door.lockable);
        assert!(door.is_locked);
        assert_eq!(door.key_id, Some(5));
    }

    #[test]
    fn test_container_attributes() {
        let chest = ObjectAttributes::container(true, Some(10));
        assert!(chest.openable);
        assert!(!chest.is_open);
        assert_eq!(chest.container_capacity, Some(10));
    }

    #[test]
    fn test_light_attributes() {
        let lamp = ObjectAttributes::light_source();
        assert!(lamp.switchable);
        assert!(!lamp.is_on);
    }

    #[test]
    fn test_describe() {
        let door = ObjectAttributes::door(true, None);
        let desc = door.describe();
        assert!(desc.contains("Scenery"));
        assert!(desc.contains("Closed"));
        assert!(desc.contains("Locked"));
    }
}
