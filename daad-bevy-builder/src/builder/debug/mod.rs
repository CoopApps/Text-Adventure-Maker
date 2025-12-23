/// Debug system for DAAD games
/// Provides breakpoints, step-through execution, flag watching, and rule inspection

use bevy::prelude::*;
use crate::daad::types::{Rule, Condition, Action};
use std::collections::{HashMap, HashSet};

/// Debug state for tracking game execution
#[derive(Resource)]
pub struct DebugState {
    pub enabled: bool,
    pub paused: bool,
    pub breakpoints: HashSet<usize>,  // Rule IDs with breakpoints
    pub watched_flags: HashSet<u8>,   // Flags being watched
    pub execution_trace: Vec<ExecutionStep>,
    pub step_mode: StepMode,
    pub current_rule_id: Option<usize>,
    pub flag_history: HashMap<u8, Vec<FlagChange>>,
    pub show_debug_panel: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StepMode {
    Continuous,  // Run normally
    StepOver,    // Execute next rule
    StepInto,    // Step into next condition/action
}

/// Record of a single execution step
#[derive(Debug, Clone)]
pub struct ExecutionStep {
    pub turn: u32,
    pub rule_id: usize,
    pub rule_name: String,
    pub matched: bool,
    pub conditions_evaluated: Vec<ConditionEvaluation>,
    pub actions_executed: Vec<ActionExecution>,
    pub timestamp: f64,
}

#[derive(Debug, Clone)]
pub struct ConditionEvaluation {
    pub condition_id: usize,
    pub description: String,
    pub result: bool,
}

#[derive(Debug, Clone)]
pub struct ActionExecution {
    pub action_id: usize,
    pub description: String,
    pub executed: bool,
}

/// Track flag value changes
#[derive(Debug, Clone)]
pub struct FlagChange {
    pub turn: u32,
    pub rule_id: usize,
    pub old_value: i16,
    pub new_value: i16,
    pub timestamp: f64,
}

impl Default for DebugState {
    fn default() -> Self {
        Self {
            enabled: false,
            paused: false,
            breakpoints: HashSet::new(),
            watched_flags: HashSet::new(),
            execution_trace: Vec::new(),
            step_mode: StepMode::Continuous,
            current_rule_id: None,
            flag_history: HashMap::new(),
            show_debug_panel: false,
        }
    }
}

impl DebugState {
    /// Toggle a breakpoint on a rule
    pub fn toggle_breakpoint(&mut self, rule_id: usize) {
        if self.breakpoints.contains(&rule_id) {
            self.breakpoints.remove(&rule_id);
            info!("Breakpoint removed from rule {}", rule_id);
        } else {
            self.breakpoints.insert(rule_id);
            info!("Breakpoint added to rule {}", rule_id);
        }
    }

    /// Check if we should pause at this rule
    pub fn should_pause_at_rule(&self, rule_id: usize) -> bool {
        if !self.enabled {
            return false;
        }

        // Always pause in step mode
        if self.step_mode != StepMode::Continuous {
            return true;
        }

        // Pause at breakpoints
        self.breakpoints.contains(&rule_id)
    }

    /// Add a flag to watch
    pub fn watch_flag(&mut self, flag_id: u8) {
        self.watched_flags.insert(flag_id);
        info!("Watching flag {}", flag_id);
    }

    /// Remove a flag from watch list
    pub fn unwatch_flag(&mut self, flag_id: u8) {
        self.watched_flags.remove(&flag_id);
        info!("Stopped watching flag {}", flag_id);
    }

    /// Record a flag change
    pub fn record_flag_change(&mut self, flag_id: u8, old_value: i16, new_value: i16, turn: u32, rule_id: usize, time: f64) {
        if !self.enabled {
            return;
        }

        let change = FlagChange {
            turn,
            rule_id,
            old_value,
            new_value,
            timestamp: time,
        };

        self.flag_history
            .entry(flag_id)
            .or_insert_with(Vec::new)
            .push(change);

        // Auto-pause if watching this flag
        if self.watched_flags.contains(&flag_id) {
            self.paused = true;
            info!("Paused: Flag {} changed from {} to {}", flag_id, old_value, new_value);
        }
    }

    /// Add an execution step to the trace
    pub fn record_execution_step(&mut self, step: ExecutionStep) {
        if !self.enabled {
            return;
        }

        // Keep last 100 steps
        if self.execution_trace.len() >= 100 {
            self.execution_trace.remove(0);
        }

        self.execution_trace.push(step);
    }

    /// Clear execution trace
    pub fn clear_trace(&mut self) {
        self.execution_trace.clear();
        self.flag_history.clear();
    }

    /// Continue execution (unpause)
    pub fn continue_execution(&mut self) {
        self.paused = false;
        self.step_mode = StepMode::Continuous;
    }

    /// Step over (execute next rule)
    pub fn step_over(&mut self) {
        self.paused = false;
        self.step_mode = StepMode::StepOver;
    }

    /// Step into (execute next condition/action)
    pub fn step_into(&mut self) {
        self.paused = false;
        self.step_mode = StepMode::StepInto;
    }

    /// Get the last N execution steps
    pub fn get_recent_trace(&self, count: usize) -> &[ExecutionStep] {
        let len = self.execution_trace.len();
        if len <= count {
            &self.execution_trace
        } else {
            &self.execution_trace[len - count..]
        }
    }

    /// Get flag change history for a specific flag
    pub fn get_flag_history(&self, flag_id: u8) -> Option<&[FlagChange]> {
        self.flag_history.get(&flag_id).map(|v| v.as_slice())
    }
}

/// Debug helper for formatting rule information
pub fn format_rule_debug_info(rule: &Rule) -> String {
    format!(
        "Rule #{}: {}\nProcess: {:?}\nConditions: {}\nActions: {}\nEnabled: {}",
        rule.id,
        rule.name,
        rule.process,
        rule.conditions.len(),
        rule.actions.len(),
        rule.enabled
    )
}

/// Debug helper for formatting condition evaluation
pub fn format_condition_debug(condition: &Condition, result: bool) -> String {
    format!(
        "[{}] Condition #{}: {}",
        if result { "✓" } else { "✗" },
        condition.id,
        condition.description()
    )
}

/// Debug helper for formatting action execution
pub fn format_action_debug(action: &Action, executed: bool) -> String {
    format!(
        "[{}] Action #{}: {}",
        if executed { "▶" } else { "⏸" },
        action.id,
        action.description()
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_breakpoint_toggle() {
        let mut debug = DebugState::default();
        debug.enabled = true;

        debug.toggle_breakpoint(1);
        assert!(debug.breakpoints.contains(&1));

        debug.toggle_breakpoint(1);
        assert!(!debug.breakpoints.contains(&1));
    }

    #[test]
    fn test_flag_watching() {
        let mut debug = DebugState::default();
        debug.enabled = true;

        debug.watch_flag(5);
        assert!(debug.watched_flags.contains(&5));

        debug.record_flag_change(5, 0, 1, 1, 0, 0.0);
        assert!(debug.paused);
        assert_eq!(debug.flag_history.get(&5).unwrap().len(), 1);
    }

    #[test]
    fn test_execution_trace() {
        let mut debug = DebugState::default();
        debug.enabled = true;

        let step = ExecutionStep {
            turn: 1,
            rule_id: 0,
            rule_name: "Test Rule".to_string(),
            matched: true,
            conditions_evaluated: vec![],
            actions_executed: vec![],
            timestamp: 0.0,
        };

        debug.record_execution_step(step);
        assert_eq!(debug.execution_trace.len(), 1);
    }
}
