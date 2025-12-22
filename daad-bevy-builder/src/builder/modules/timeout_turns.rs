/// Module 31: TIMEOUT/TURNS System
/// Manages turn counting and time-based events (TIMEOUT, TURNS condacts)
use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// Turn-based timing system for DAAD games
#[derive(Debug, Clone, Serialize, Deserialize, Resource, Default)]
pub struct TimeoutSystem {
    pub turn_count: u32,
    pub timeouts: Vec<TimeoutEvent>,
    pub turn_limit: Option<u32>,  // Optional maximum turns
    pub show_turn_counter: bool,
}

impl TimeoutSystem {
    pub fn new() -> Self {
        Self {
            turn_count: 0,
            timeouts: Vec::new(),
            turn_limit: None,
            show_turn_counter: true,
        }
    }

    /// Increment turn counter
    pub fn next_turn(&mut self) {
        self.turn_count += 1;
    }

    /// Reset turn counter
    pub fn reset(&mut self) {
        self.turn_count = 0;
    }

    /// Add a timeout event
    pub fn add_timeout(&mut self, event: TimeoutEvent) {
        self.timeouts.push(event);
    }

    /// Check if any timeouts have triggered
    pub fn check_timeouts(&self) -> Vec<usize> {
        self.timeouts
            .iter()
            .enumerate()
            .filter_map(|(idx, event)| {
                if event.should_trigger(self.turn_count) {
                    Some(idx)
                } else {
                    None
                }
            })
            .collect()
    }

    /// Get active timeouts (not yet triggered)
    pub fn active_timeouts(&self) -> Vec<&TimeoutEvent> {
        self.timeouts
            .iter()
            .filter(|e| !e.triggered && e.enabled)
            .collect()
    }

    /// Get remaining turns until turn limit
    pub fn turns_remaining(&self) -> Option<u32> {
        self.turn_limit.map(|limit| limit.saturating_sub(self.turn_count))
    }

    /// Check if turn limit reached
    pub fn is_time_up(&self) -> bool {
        if let Some(limit) = self.turn_limit {
            self.turn_count >= limit
        } else {
            false
        }
    }
}

/// A timeout event that triggers after N turns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeoutEvent {
    pub id: usize,
    pub name: String,
    pub description: String,
    pub trigger_turn: u32,      // Turn number to trigger on
    pub condition: Option<usize>, // Optional condition that must be true
    pub actions: Vec<usize>,    // Action IDs to execute
    pub repeat: bool,           // Repeat every N turns
    pub repeat_interval: Option<u32>,
    pub enabled: bool,
    pub triggered: bool,
}

impl TimeoutEvent {
    pub fn new(id: usize, name: String, trigger_turn: u32) -> Self {
        Self {
            id,
            name,
            description: String::new(),
            trigger_turn,
            condition: None,
            actions: Vec::new(),
            repeat: false,
            repeat_interval: None,
            enabled: true,
            triggered: false,
        }
    }

    /// Check if this event should trigger on the current turn
    pub fn should_trigger(&self, current_turn: u32) -> bool {
        if !self.enabled {
            return false;
        }

        if self.repeat {
            if let Some(interval) = self.repeat_interval {
                return current_turn >= self.trigger_turn
                    && (current_turn - self.trigger_turn) % interval == 0;
            }
        }

        !self.triggered && current_turn >= self.trigger_turn
    }

    /// Mark event as triggered
    pub fn trigger(&mut self) {
        if !self.repeat {
            self.triggered = true;
        }
    }
}

/// Timeout templates for common scenarios
pub enum TimeoutTemplate {
    LampRunsOut,        // Light source exhausts after N turns
    GuardArrives,       // NPC appears after delay
    TimeLimit,          // Game over after N turns
    RecurringEvent,     // Event happens every N turns
    DelayedMessage,     // Message displays after N turns
}

impl TimeoutTemplate {
    pub fn create_event(&self, turn_count: u32) -> TimeoutEvent {
        match self {
            TimeoutTemplate::LampRunsOut => TimeoutEvent {
                id: 0,
                name: "Lamp Runs Out".to_string(),
                description: "The lamp's battery dies".to_string(),
                trigger_turn: turn_count,
                condition: None,
                actions: Vec::new(),
                repeat: false,
                repeat_interval: None,
                enabled: true,
                triggered: false,
            },
            TimeoutTemplate::GuardArrives => TimeoutEvent {
                id: 0,
                name: "Guard Arrives".to_string(),
                description: "A guard enters the area".to_string(),
                trigger_turn: turn_count,
                condition: None,
                actions: Vec::new(),
                repeat: false,
                repeat_interval: None,
                enabled: true,
                triggered: false,
            },
            TimeoutTemplate::TimeLimit => TimeoutEvent {
                id: 0,
                name: "Time Limit".to_string(),
                description: "Game over - time ran out".to_string(),
                trigger_turn: turn_count,
                condition: None,
                actions: Vec::new(),
                repeat: false,
                repeat_interval: None,
                enabled: true,
                triggered: false,
            },
            TimeoutTemplate::RecurringEvent => TimeoutEvent {
                id: 0,
                name: "Recurring Event".to_string(),
                description: "Repeats every N turns".to_string(),
                trigger_turn: turn_count,
                condition: None,
                actions: Vec::new(),
                repeat: true,
                repeat_interval: Some(10),
                enabled: true,
                triggered: false,
            },
            TimeoutTemplate::DelayedMessage => TimeoutEvent {
                id: 0,
                name: "Delayed Message".to_string(),
                description: "Message appears after delay".to_string(),
                trigger_turn: turn_count,
                condition: None,
                actions: Vec::new(),
                repeat: false,
                repeat_interval: None,
                enabled: true,
                triggered: false,
            },
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            TimeoutTemplate::LampRunsOut => "Lamp Runs Out",
            TimeoutTemplate::GuardArrives => "NPC Arrives",
            TimeoutTemplate::TimeLimit => "Time Limit",
            TimeoutTemplate::RecurringEvent => "Recurring Event",
            TimeoutTemplate::DelayedMessage => "Delayed Message",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            TimeoutTemplate::LampRunsOut => "Light source exhausts after N turns",
            TimeoutTemplate::GuardArrives => "Character appears after delay",
            TimeoutTemplate::TimeLimit => "Game over after time runs out",
            TimeoutTemplate::RecurringEvent => "Event repeats every N turns",
            TimeoutTemplate::DelayedMessage => "Message displays after N turns",
        }
    }
}

/// Generate DAAD code for timeout events
pub fn generate_timeout_daad_code(system: &TimeoutSystem) -> String {
    let mut code = String::from("; Timeout Events\n");
    code.push_str("; PRO 2 - Auto-actions (runs every turn)\n\n");

    for event in &system.timeouts {
        if !event.enabled {
            continue;
        }

        code.push_str(&format!("; Event {}: {}\n", event.id, event.name));
        code.push_str(&format!("; Description: {}\n", event.description));

        if event.repeat {
            code.push_str(&format!("; Repeats every {} turns\n", event.repeat_interval.unwrap_or(1)));
        } else {
            code.push_str(&format!("; Triggers on turn {}\n", event.trigger_turn));
        }

        // Generate DAAD condact
        code.push_str(&format!("TURNS {} ", event.trigger_turn));

        if let Some(cond) = event.condition {
            code.push_str(&format!("AND CONDITION_{} ", cond));
        }

        code.push_str("THEN\n");

        for action in &event.actions {
            code.push_str(&format!("  ACTION_{}\n", action));
        }

        if !event.repeat {
            code.push_str("  SET FLAG_EVENT_TRIGGERED 1\n");
        }

        code.push_str("  DONE\n\n");
    }

    code
}

/// Bevy plugin for Timeout/Turns system
pub struct TimeoutTurnsPlugin;

impl Plugin for TimeoutTurnsPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<TimeoutSystem>()
            .add_systems(Update, (
                render_timeout_ui,
                handle_add_timeout_button,
                handle_timeout_edit,
                handle_template_selection,
                render_turn_counter_display,
            ));
    }
}

/// Render the timeout manager UI
fn render_timeout_ui(
    /* Bevy systems */
) {
    // TODO: List of timeout events with edit/delete buttons
}

/// Handle adding new timeout
fn handle_add_timeout_button(
    /* Bevy systems */
) {
    // TODO: Create new timeout event
}

/// Handle editing timeout properties
fn handle_timeout_edit(
    /* Bevy systems */
) {
    // TODO: Update timeout turn count, actions, conditions
}

/// Handle template selection
fn handle_template_selection(
    /* Bevy systems */
) {
    // TODO: Apply timeout template
}

/// Render turn counter in preview
fn render_turn_counter_display(
    /* Bevy systems */
) {
    // TODO: Show "Turn: 5" in preview mode
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_turn_counting() {
        let mut system = TimeoutSystem::new();
        assert_eq!(system.turn_count, 0);
        system.next_turn();
        assert_eq!(system.turn_count, 1);
        system.reset();
        assert_eq!(system.turn_count, 0);
    }

    #[test]
    fn test_timeout_trigger() {
        let mut event = TimeoutEvent::new(0, "Test".to_string(), 5);
        assert!(!event.should_trigger(4));
        assert!(event.should_trigger(5));
        assert!(event.should_trigger(6));
        event.trigger();
        assert!(event.triggered);
    }

    #[test]
    fn test_repeating_timeout() {
        let mut event = TimeoutEvent::new(0, "Test".to_string(), 5);
        event.repeat = true;
        event.repeat_interval = Some(5);

        assert!(event.should_trigger(5));
        assert!(event.should_trigger(10));
        assert!(event.should_trigger(15));
        assert!(!event.should_trigger(12));
    }

    #[test]
    fn test_turn_limit() {
        let mut system = TimeoutSystem::new();
        system.turn_limit = Some(10);
        system.turn_count = 9;
        assert!(!system.is_time_up());
        system.next_turn();
        assert!(system.is_time_up());
        assert_eq!(system.turns_remaining(), Some(0));
    }
}
