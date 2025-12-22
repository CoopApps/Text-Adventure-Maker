/// Module 33: RANDOM/CHANCE System
/// Manages randomization and probability (CHANCE, RANDOM condacts)
use bevy::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Random event and probability system
#[derive(Debug, Clone, Serialize, Deserialize, Resource, Default)]
pub struct RandomSystem {
    pub random_events: Vec<RandomEvent>,
    pub probability_tables: HashMap<String, ProbabilityTable>,
}

impl RandomSystem {
    pub fn new() -> Self {
        Self {
            random_events: Vec::new(),
            probability_tables: HashMap::new(),
        }
    }

    /// Add a random event
    pub fn add_event(&mut self, event: RandomEvent) {
        self.random_events.push(event);
    }

    /// Add a probability table
    pub fn add_table(&mut self, name: String, table: ProbabilityTable) {
        self.probability_tables.insert(name, table);
    }

    /// Get event by ID
    pub fn get_event(&self, id: usize) -> Option<&RandomEvent> {
        self.random_events.iter().find(|e| e.id == id)
    }
}

/// A random event with probability-based outcomes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RandomEvent {
    pub id: usize,
    pub name: String,
    pub description: String,
    pub event_type: RandomEventType,
    pub outcomes: Vec<Outcome>,
    pub enabled: bool,
}

impl RandomEvent {
    pub fn new(id: usize, name: String, event_type: RandomEventType) -> Self {
        Self {
            id,
            name,
            description: String::new(),
            event_type,
            outcomes: Vec::new(),
            enabled: true,
        }
    }

    /// Add an outcome with probability
    pub fn add_outcome(&mut self, outcome: Outcome) {
        self.outcomes.push(outcome);
    }

    /// Validate that probabilities sum to 100%
    pub fn validate_probabilities(&self) -> Result<(), String> {
        let total: u8 = self.outcomes.iter().map(|o| o.probability).sum();
        if total == 100 {
            Ok(())
        } else {
            Err(format!("Probabilities sum to {}%, must be 100%", total))
        }
    }

    /// Generate DAAD code for this random event
    pub fn to_daad_code(&self) -> String {
        let mut code = String::new();
        code.push_str(&format!("; Random Event: {}\n", self.name));
        code.push_str(&format!("; Description: {}\n", self.description));
        code.push_str(&format!("; Type: {:?}\n\n", self.event_type));

        for (idx, outcome) in self.outcomes.iter().enumerate() {
            code.push_str(&format!("; Outcome {}: {}% chance\n", idx + 1, outcome.probability));
            code.push_str(&format!("CHANCE {} THEN\n", outcome.probability));
            for action in &outcome.actions {
                code.push_str(&format!("  ACTION_{}\n", action));
            }
            code.push_str("  DONE\n\n");
        }

        code
    }
}

/// Type of random event
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum RandomEventType {
    SimpleChance,       // Single probability check (CHANCE condact)
    MultipleOutcomes,   // Multiple outcomes with different probabilities
    RandomNumber,       // Generate random number (RANDOM condact)
    DiceRoll,           // Simulate dice (1d6, 2d6, etc.)
    RandomPlacement,    // Randomly place objects
}

impl RandomEventType {
    pub fn name(&self) -> &'static str {
        match self {
            RandomEventType::SimpleChance => "Simple Chance",
            RandomEventType::MultipleOutcomes => "Multiple Outcomes",
            RandomEventType::RandomNumber => "Random Number",
            RandomEventType::DiceRoll => "Dice Roll",
            RandomEventType::RandomPlacement => "Random Placement",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            RandomEventType::SimpleChance => "X% chance of event happening",
            RandomEventType::MultipleOutcomes => "Multiple possible outcomes with probabilities",
            RandomEventType::RandomNumber => "Generate random number 0-255",
            RandomEventType::DiceRoll => "Simulate dice rolls (1d6, 2d10, etc.)",
            RandomEventType::RandomPlacement => "Randomly place objects in locations",
        }
    }
}

/// Single outcome in a random event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Outcome {
    pub name: String,
    pub probability: u8,     // 0-100
    pub actions: Vec<usize>, // Action IDs to execute
    pub description: String,
}

impl Outcome {
    pub fn new(name: String, probability: u8) -> Self {
        Self {
            name,
            probability,
            actions: Vec::new(),
            description: String::new(),
        }
    }
}

/// Probability table for weighted random selection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProbabilityTable {
    pub name: String,
    pub entries: Vec<ProbabilityEntry>,
}

impl ProbabilityTable {
    pub fn new(name: String) -> Self {
        Self {
            name,
            entries: Vec::new(),
        }
    }

    /// Add entry to table
    pub fn add_entry(&mut self, entry: ProbabilityEntry) {
        self.entries.push(entry);
    }

    /// Calculate total weight
    pub fn total_weight(&self) -> u32 {
        self.entries.iter().map(|e| e.weight).sum()
    }

    /// Select random entry based on weights
    pub fn select_random(&self) -> Option<&ProbabilityEntry> {
        let total = self.total_weight();
        if total == 0 {
            return None;
        }

        // In a real implementation, this would use a random number generator
        // For now, return the first entry
        self.entries.first()
    }
}

/// Entry in a probability table
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProbabilityEntry {
    pub name: String,
    pub weight: u32,
    pub value: i32,
}

impl ProbabilityEntry {
    pub fn new(name: String, weight: u32, value: i32) -> Self {
        Self { name, weight, value }
    }
}

/// Random event templates
pub enum RandomTemplate {
    CoinFlip,               // 50/50 chance
    GuardAsleep,            // 30% chance guard is asleep
    CriticalHit,            // 10% chance for extra damage
    RandomTreasure,         // Random treasure location
    WeatherChange,          // Random weather effects
    DiceRoll1d6,            // Standard 6-sided die
    DiceRoll2d6,            // Two 6-sided dice
}

impl RandomTemplate {
    pub fn create_event(&self, id: usize) -> RandomEvent {
        match self {
            RandomTemplate::CoinFlip => {
                let mut event = RandomEvent::new(
                    id,
                    "Coin Flip".to_string(),
                    RandomEventType::SimpleChance,
                );
                event.description = "50% chance heads, 50% chance tails".to_string();
                event.add_outcome(Outcome::new("Heads".to_string(), 50));
                event.add_outcome(Outcome::new("Tails".to_string(), 50));
                event
            }
            RandomTemplate::GuardAsleep => {
                let mut event = RandomEvent::new(
                    id,
                    "Guard Asleep Check".to_string(),
                    RandomEventType::SimpleChance,
                );
                event.description = "30% chance the guard is sleeping".to_string();
                event.add_outcome(Outcome::new("Asleep".to_string(), 30));
                event.add_outcome(Outcome::new("Awake".to_string(), 70));
                event
            }
            RandomTemplate::CriticalHit => {
                let mut event = RandomEvent::new(
                    id,
                    "Critical Hit".to_string(),
                    RandomEventType::SimpleChance,
                );
                event.description = "10% chance for critical hit".to_string();
                event.add_outcome(Outcome::new("Critical!".to_string(), 10));
                event.add_outcome(Outcome::new("Normal".to_string(), 90));
                event
            }
            RandomTemplate::RandomTreasure => {
                let mut event = RandomEvent::new(
                    id,
                    "Random Treasure Location".to_string(),
                    RandomEventType::RandomPlacement,
                );
                event.description = "Treasure appears in a random room".to_string();
                event
            }
            RandomTemplate::WeatherChange => {
                let mut event = RandomEvent::new(
                    id,
                    "Weather Change".to_string(),
                    RandomEventType::MultipleOutcomes,
                );
                event.description = "Random weather effects".to_string();
                event.add_outcome(Outcome::new("Sunny".to_string(), 40));
                event.add_outcome(Outcome::new("Rainy".to_string(), 30));
                event.add_outcome(Outcome::new("Stormy".to_string(), 20));
                event.add_outcome(Outcome::new("Foggy".to_string(), 10));
                event
            }
            RandomTemplate::DiceRoll1d6 => {
                let mut event = RandomEvent::new(
                    id,
                    "1d6 Dice Roll".to_string(),
                    RandomEventType::DiceRoll,
                );
                event.description = "Roll one 6-sided die".to_string();
                for i in 1..=6 {
                    event.add_outcome(Outcome::new(format!("Roll {}", i), 16)); // ~16.67% each
                }
                event
            }
            RandomTemplate::DiceRoll2d6 => {
                let mut event = RandomEvent::new(
                    id,
                    "2d6 Dice Roll".to_string(),
                    RandomEventType::DiceRoll,
                );
                event.description = "Roll two 6-sided dice".to_string();
                // In a full implementation, this would have weighted probabilities
                // (2 and 12 are rare, 7 is most common)
                event
            }
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            RandomTemplate::CoinFlip => "Coin Flip (50/50)",
            RandomTemplate::GuardAsleep => "Guard Asleep (30%)",
            RandomTemplate::CriticalHit => "Critical Hit (10%)",
            RandomTemplate::RandomTreasure => "Random Treasure Location",
            RandomTemplate::WeatherChange => "Random Weather",
            RandomTemplate::DiceRoll1d6 => "1d6 Dice Roll",
            RandomTemplate::DiceRoll2d6 => "2d6 Dice Roll",
        }
    }
}

/// Probability calculator helper
pub struct ProbabilityCalculator;

impl ProbabilityCalculator {
    /// Calculate probability of multiple independent events
    pub fn and_probability(probs: &[f32]) -> f32 {
        probs.iter().product()
    }

    /// Calculate probability of at least one event occurring
    pub fn or_probability(probs: &[f32]) -> f32 {
        1.0 - probs.iter().map(|p| 1.0 - p).product::<f32>()
    }

    /// Convert percentage to fraction
    pub fn percent_to_fraction(percent: u8) -> f32 {
        percent as f32 / 100.0
    }

    /// Convert fraction to percentage
    pub fn fraction_to_percent(fraction: f32) -> u8 {
        (fraction * 100.0).round() as u8
    }
}

/// Bevy plugin for Random/Chance system
pub struct RandomChancePlugin;

impl Plugin for RandomChancePlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<RandomSystem>()
            .add_systems(Update, (
                render_random_event_ui,
                handle_add_event_button,
                handle_outcome_editing,
                handle_probability_calculation,
                handle_template_selection,
            ));
    }
}

/// Render random event UI
fn render_random_event_ui(/* Bevy systems */) {
    // TODO: List of random events with probabilities
}

/// Handle adding new random event
fn handle_add_event_button(/* Bevy systems */) {
    // TODO: Create new random event
}

/// Handle editing outcome probabilities
fn handle_outcome_editing(/* Bevy systems */) {
    // TODO: Adjust probabilities, validate sum = 100%
}

/// Handle probability calculator
fn handle_probability_calculation(/* Bevy systems */) {
    // TODO: Show AND/OR probability calculations
}

/// Handle template selection
fn handle_template_selection(/* Bevy systems */) {
    // TODO: Apply random event template
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_random_event() {
        let mut event = RandomEvent::new(0, "Test".to_string(), RandomEventType::SimpleChance);
        event.add_outcome(Outcome::new("Success".to_string(), 60));
        event.add_outcome(Outcome::new("Failure".to_string(), 40));
        assert!(event.validate_probabilities().is_ok());
    }

    #[test]
    fn test_invalid_probabilities() {
        let mut event = RandomEvent::new(0, "Test".to_string(), RandomEventType::SimpleChance);
        event.add_outcome(Outcome::new("Success".to_string(), 60));
        event.add_outcome(Outcome::new("Failure".to_string(), 30)); // Only 90%
        assert!(event.validate_probabilities().is_err());
    }

    #[test]
    fn test_probability_calculator() {
        assert_eq!(ProbabilityCalculator::and_probability(&[0.5, 0.5]), 0.25);
        assert_eq!(ProbabilityCalculator::or_probability(&[0.5, 0.5]), 0.75);
        assert_eq!(ProbabilityCalculator::percent_to_fraction(50), 0.5);
        assert_eq!(ProbabilityCalculator::fraction_to_percent(0.5), 50);
    }
}
