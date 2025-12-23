/// Module 38: Score & Win Conditions
/// Manages scoring system and game completion conditions
use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// Scoring and win condition system
#[derive(Debug, Clone, Serialize, Deserialize, Resource)]
pub struct ScoreSystem {
    pub scoring_rules: Vec<ScoringRule>,
    pub win_conditions: Vec<WinCondition>,
    pub max_score: Option<u32>,
    pub show_score: bool,
    pub score_flag_id: u8,  // Flag used to store score (default: 0)
}

impl Default for ScoreSystem {
    fn default() -> Self {
        Self {
            scoring_rules: Vec::new(),
            win_conditions: Vec::new(),
            max_score: Some(100),
            show_score: true,
            score_flag_id: 0,
        }
    }
}

impl ScoreSystem {
    pub fn new() -> Self {
        Self::default()
    }

    /// Calculate maximum possible score
    pub fn calculate_max_score(&self) -> u32 {
        self.scoring_rules.iter().map(|r| r.points).sum()
    }

    /// Generate DAAD code for scoring system
    pub fn to_daad_code(&self) -> String {
        let mut code = String::from("; Scoring System\n\n");

        // Scoring rules
        if !self.scoring_rules.is_empty() {
            code.push_str("; Scoring Rules\n");
            for rule in &self.scoring_rules {
                code.push_str(&rule.to_daad_code(self.score_flag_id));
            }
            code.push('\n');
        }

        // Win conditions
        if !self.win_conditions.is_empty() {
            code.push_str("; Win Conditions\n");
            for condition in &self.win_conditions {
                code.push_str(&condition.to_daad_code(self.score_flag_id));
            }
            code.push('\n');
        }

        code
    }
}

/// Scoring rule: award points for actions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoringRule {
    pub id: usize,
    pub name: String,
    pub description: String,
    pub points: u32,
    pub trigger: ScoreTrigger,
    pub one_time_only: bool,
    pub flag_check: Option<u8>,  // Flag to prevent duplicate scoring
    pub enabled: bool,
}

impl ScoringRule {
    pub fn new(id: usize, name: String, points: u32, trigger: ScoreTrigger) -> Self {
        Self {
            id,
            name,
            description: String::new(),
            points,
            trigger,
            one_time_only: true,
            flag_check: Some(id as u8 + 100), // Use flag 100+ for scoring flags
            enabled: true,
        }
    }

    pub fn to_daad_code(&self, score_flag: u8) -> String {
        let mut code = format!("; Score: {} (+{} points)\n", self.name, self.points);
        code.push_str(&format!("; Description: {}\n", self.description));

        // Check if already scored (one-time only)
        if self.one_time_only {
            if let Some(flag) = self.flag_check {
                code.push_str(&format!("ZERO {} ", flag));
            }
        }

        // Trigger condition
        code.push_str(&self.trigger.to_daad_code());

        // Award points
        code.push_str(&format!("THEN\n  PLUS {} {}\n", score_flag, self.points));

        // Mark as scored
        if self.one_time_only {
            if let Some(flag) = self.flag_check {
                code.push_str(&format!("  SET {} 1\n", flag));
            }
        }

        code.push_str(&format!("  MESSAGE \"You earned {} points!\"\n", self.points));
        code.push_str("  DONE\n\n");

        code
    }
}

/// Trigger for awarding score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScoreTrigger {
    GetObject(u8),          // Get specific object
    ReachLocation(u8),      // Reach specific location
    CompleteAction(usize),  // Complete specific action
    SolveP uzzle(usize),     // Solve puzzle
    DefeatEnemy(u8),        // Defeat enemy
    CustomCondition(usize), // Custom condition ID
}

impl ScoreTrigger {
    pub fn to_daad_code(&self) -> String {
        match self {
            ScoreTrigger::GetObject(id) => format!("CARRIED {} ", id),
            ScoreTrigger::ReachLocation(id) => format!("AT {} ", id),
            ScoreTrigger::CompleteAction(id) => format!("ACTION_{} ", id),
            ScoreTrigger::SolvePuzzle(id) => format!("PUZZLE_{}_SOLVED ", id),
            ScoreTrigger::DefeatEnemy(id) => format!("ENEMY_{}_DEFEATED ", id),
            ScoreTrigger::CustomCondition(id) => format!("CONDITION_{} ", id),
        }
    }
}

/// Win condition for game completion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WinCondition {
    pub id: usize,
    pub name: String,
    pub description: String,
    pub condition_type: WinConditionType,
    pub ending_message: String,
    pub enabled: bool,
}

impl WinCondition {
    pub fn new(id: usize, name: String, condition_type: WinConditionType) -> Self {
        Self {
            id,
            name,
            description: String::new(),
            condition_type,
            ending_message: "Congratulations! You won!".to_string(),
            enabled: true,
        }
    }

    pub fn to_daad_code(&self, score_flag: u8) -> String {
        let mut code = format!("; Win Condition: {}\n", self.name);
        code.push_str(&format!("; Description: {}\n", self.description));

        code.push_str(&self.condition_type.to_daad_code(score_flag));

        code.push_str("THEN\n");
        code.push_str(&format!("  MESSAGE \"{}\"\n", self.ending_message));
        code.push_str("  MESSAGE \"GAME COMPLETE!\"\n");
        code.push_str("  QUIT\n\n");

        code
    }
}

/// Type of win condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WinConditionType {
    ReachScore(u32),            // Reach target score
    CollectAll(Vec<u8>),        // Collect all specified objects
    ReachLocation(u8),          // Reach final location
    DefeatAllEnemies(Vec<u8>),  // Defeat all enemies
    SolveAllPuzzles(Vec<usize>),// Solve all puzzles
    CustomCondition(usize),     // Custom condition
    MultipleConditions(Vec<usize>), // All conditions must be true
}

impl WinConditionType {
    pub fn to_daad_code(&self, score_flag: u8) -> String {
        match self {
            WinConditionType::ReachScore(target) => {
                format!("GE {} {} ", score_flag, target)
            }
            WinConditionType::CollectAll(objects) => {
                let mut code = String::new();
                for (i, obj) in objects.iter().enumerate() {
                    code.push_str(&format!("CARRIED {}", obj));
                    if i < objects.len() - 1 {
                        code.push_str(" AND ");
                    }
                }
                code.push(' ');
                code
            }
            WinConditionType::ReachLocation(loc) => {
                format!("AT {} ", loc)
            }
            WinConditionType::DefeatAllEnemies(enemies) => {
                let mut code = String::new();
                for (i, enemy) in enemies.iter().enumerate() {
                    code.push_str(&format!("ENEMY_{}_DEFEATED", enemy));
                    if i < enemies.len() - 1 {
                        code.push_str(" AND ");
                    }
                }
                code.push(' ');
                code
            }
            WinConditionType::SolveAllPuzzles(puzzles) => {
                let mut code = String::new();
                for (i, puzzle) in puzzles.iter().enumerate() {
                    code.push_str(&format!("PUZZLE_{}_SOLVED", puzzle));
                    if i < puzzles.len() - 1 {
                        code.push_str(" AND ");
                    }
                }
                code.push(' ');
                code
            }
            WinConditionType::CustomCondition(cond) => {
                format!("CONDITION_{} ", cond)
            }
            WinConditionType::MultipleConditions(conditions) => {
                let mut code = String::new();
                for (i, cond) in conditions.iter().enumerate() {
                    code.push_str(&format!("CONDITION_{}", cond));
                    if i < conditions.len() - 1 {
                        code.push_str(" AND ");
                    }
                }
                code.push(' ');
                code
            }
        }
    }
}

/// Templates for common scoring scenarios
pub enum ScoreTemplate {
    TreasureHunter,     // Points for collecting treasures
    Explorer,           // Points for visiting locations
    PuzzleSolver,       // Points for solving puzzles
    QuestCompleter,     // Points for completing quests
}

impl ScoreTemplate {
    pub fn create_rules(&self, start_id: usize) -> Vec<ScoringRule> {
        match self {
            ScoreTemplate::TreasureHunter => vec![
                ScoringRule::new(
                    start_id,
                    "Find Gold Coin".to_string(),
                    10,
                    ScoreTrigger::GetObject(0),
                ),
                ScoringRule::new(
                    start_id + 1,
                    "Find Diamond".to_string(),
                    50,
                    ScoreTrigger::GetObject(1),
                ),
            ],
            ScoreTemplate::Explorer => vec![
                ScoringRule::new(
                    start_id,
                    "Discover Castle".to_string(),
                    20,
                    ScoreTrigger::ReachLocation(0),
                ),
                ScoringRule::new(
                    start_id + 1,
                    "Find Secret Room".to_string(),
                    30,
                    ScoreTrigger::ReachLocation(1),
                ),
            ],
            ScoreTemplate::PuzzleSolver => vec![
                ScoringRule::new(
                    start_id,
                    "Solve Door Puzzle".to_string(),
                    25,
                    ScoreTrigger::SolvePuzzle(0),
                ),
            ],
            ScoreTemplate::QuestCompleter => vec![
                ScoringRule::new(
                    start_id,
                    "Complete Main Quest".to_string(),
                    100,
                    ScoreTrigger::CustomCondition(0),
                ),
            ],
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            ScoreTemplate::TreasureHunter => "Treasure Hunter",
            ScoreTemplate::Explorer => "Explorer",
            ScoreTemplate::PuzzleSolver => "Puzzle Solver",
            ScoreTemplate::QuestCompleter => "Quest Completer",
        }
    }
}

/// Bevy plugin
pub struct ScoreWinPlugin;

impl Plugin for ScoreWinPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<ScoreSystem>()
            .add_systems(Update, (
                render_score_system_ui,
                render_win_conditions_ui,
                handle_add_scoring_rule,
                handle_add_win_condition,
                handle_template_selection,
                display_score_preview,
            ));
    }
}

fn render_score_system_ui(/* Bevy systems */) {
    // TODO: List of scoring rules with points
}

fn render_win_conditions_ui(/* Bevy systems */) {
    // TODO: List of win conditions
}

fn handle_add_scoring_rule(/* Bevy systems */) {
    // TODO: Create new scoring rule
}

fn handle_add_win_condition(/* Bevy systems */) {
    // TODO: Create new win condition
}

fn handle_template_selection(/* Bevy systems */) {
    // TODO: Apply scoring template
}

fn display_score_preview(/* Bevy systems */) {
    // TODO: Show current score in preview mode
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scoring_rule() {
        let rule = ScoringRule::new(0, "Test".to_string(), 10, ScoreTrigger::GetObject(5));
        let code = rule.to_daad_code(0);
        assert!(code.contains("CARRIED 5"));
        assert!(code.contains("PLUS 0 10"));
    }

    #[test]
    fn test_win_condition() {
        let condition = WinCondition::new(
            0,
            "Win".to_string(),
            WinConditionType::ReachScore(100),
        );
        let code = condition.to_daad_code(0);
        assert!(code.contains("GE 0 100"));
        assert!(code.contains("QUIT"));
    }

    #[test]
    fn test_max_score_calculation() {
        let mut system = ScoreSystem::new();
        system.scoring_rules.push(ScoringRule::new(
            0,
            "Test1".to_string(),
            10,
            ScoreTrigger::GetObject(0),
        ));
        system.scoring_rules.push(ScoringRule::new(
            1,
            "Test2".to_string(),
            20,
            ScoreTrigger::GetObject(1),
        ));
        assert_eq!(system.calculate_max_score(), 30);
    }
}
