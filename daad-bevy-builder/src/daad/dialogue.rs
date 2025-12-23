use serde::{Deserialize, Serialize};
use bevy::prelude::*;
use super::types::{Rule, Condition, ConditionType, Action, ActionType, ProcessTable, ObjectLocation};

/// A dialogue tree for NPC conversations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DialogueTree {
    pub id: String,
    pub name: String,
    pub npc_name: String,
    pub npc_object_id: Option<u8>,
    pub root_node_id: String,
    pub nodes: Vec<DialogueNode>,
    pub trigger_verb: String,  // e.g., "talk", "ask", "greet"
}

/// A single node in a dialogue tree
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DialogueNode {
    pub id: String,
    pub npc_text: String,
    pub choices: Vec<DialogueChoice>,
    pub conditions: Vec<DialogueCondition>,
    pub actions: Vec<DialogueAction>,
    pub editor_position: Vec2,
}

/// A player choice/response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DialogueChoice {
    pub id: String,
    pub text: String,
    pub next_node_id: Option<String>,  // None = end conversation
    pub conditions: Vec<DialogueCondition>,
    pub actions: Vec<DialogueAction>,
}

/// Condition for dialogue availability
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DialogueCondition {
    FlagSet { flag_id: u8 },
    FlagClear { flag_id: u8 },
    FlagEquals { flag_id: u8, value: i16 },
    FlagGreaterThan { flag_id: u8, value: i16 },
    FlagLessThan { flag_id: u8, value: i16 },
    ObjectCarried { object_id: u8 },
    ObjectAt { object_id: u8, location_id: u8 },
    PlayerAt { location_id: u8 },
    FirstTime,  // Only show once
}

/// Action during dialogue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DialogueAction {
    SetFlag { flag_id: u8 },
    ClearFlag { flag_id: u8 },
    IncFlag { flag_id: u8 },
    DecFlag { flag_id: u8 },
    SetFlagValue { flag_id: u8, value: i16 },
    GiveObject { object_id: u8 },
    TakeObject { object_id: u8 },
    MoveObject { object_id: u8, location_id: u8 },
    IncScore { amount: i16 },
    DecScore { amount: i16 },
}

impl DialogueTree {
    /// Create a new empty dialogue tree
    pub fn new(name: &str, npc_name: &str, trigger_verb: &str) -> Self {
        let root_id = "node_0".to_string();
        Self {
            id: format!("dialogue_{}", name.to_lowercase().replace(' ', "_")),
            name: name.to_string(),
            npc_name: npc_name.to_string(),
            npc_object_id: None,
            root_node_id: root_id.clone(),
            nodes: vec![DialogueNode {
                id: root_id,
                npc_text: format!("Hello! I am {}.", npc_name),
                choices: vec![],
                conditions: vec![],
                actions: vec![],
                editor_position: Vec2::new(400.0, 300.0),
            }],
            trigger_verb: trigger_verb.to_string(),
        }
    }

    /// Get a node by ID
    pub fn get_node(&self, node_id: &str) -> Option<&DialogueNode> {
        self.nodes.iter().find(|n| n.id == node_id)
    }

    /// Get a mutable node by ID
    pub fn get_node_mut(&mut self, node_id: &str) -> Option<&mut DialogueNode> {
        self.nodes.iter_mut().find(|n| n.id == node_id)
    }

    /// Add a new node to the tree
    pub fn add_node(&mut self, npc_text: &str, position: Vec2) -> String {
        let node_id = format!("node_{}", self.nodes.len());
        self.nodes.push(DialogueNode {
            id: node_id.clone(),
            npc_text: npc_text.to_string(),
            choices: vec![],
            conditions: vec![],
            actions: vec![],
            editor_position: position,
        });
        node_id
    }

    /// Add a choice to a node
    pub fn add_choice_to_node(
        &mut self,
        node_id: &str,
        choice_text: &str,
        next_node_id: Option<String>,
    ) {
        if let Some(node) = self.get_node_mut(node_id) {
            let choice_id = format!("{}_{}", node_id, node.choices.len());
            node.choices.push(DialogueChoice {
                id: choice_id,
                text: choice_text.to_string(),
                next_node_id,
                conditions: vec![],
                actions: vec![],
            });
        }
    }

    /// Generate DAAD rules from this dialogue tree
    pub fn generate_rules(&self, starting_rule_id: usize) -> Vec<Rule> {
        let mut rules = Vec::new();
        let mut rule_id = starting_rule_id;

        // Generate rules for each node
        for (node_idx, node) in self.nodes.iter().enumerate() {
            // Main rule: trigger verb + show NPC text
            let mut conditions = vec![
                Condition {
                    id: 0,
                    condition_type: ConditionType::VerbIs {
                        verb: self.trigger_verb.clone(),
                    },
                },
            ];

            // Add node conditions
            for (idx, cond) in node.conditions.iter().enumerate() {
                conditions.push(Condition {
                    id: idx + 1,
                    condition_type: self.dialogue_condition_to_daad(cond),
                });
            }

            // Add NPC object condition if specified
            if let Some(obj_id) = self.npc_object_id {
                conditions.push(Condition {
                    id: conditions.len(),
                    condition_type: ConditionType::ObjectPresent { object_id: obj_id },
                });
            }

            let mut actions = vec![
                Action {
                    id: 0,
                    action_type: ActionType::ShowMessage {
                        text: format!("{}: {}", self.npc_name, node.npc_text),
                    },
                },
            ];

            // Add node actions
            for (idx, action) in node.actions.iter().enumerate() {
                actions.push(Action {
                    id: idx + 1,
                    action_type: self.dialogue_action_to_daad(action),
                });
            }

            // If no choices, end conversation
            if node.choices.is_empty() {
                actions.push(Action {
                    id: actions.len(),
                    action_type: ActionType::OK,
                });
            }

            rules.push(Rule {
                id: rule_id,
                name: format!("{} - {}", self.name, node.id),
                process: ProcessTable::Response,
                conditions,
                actions,
                enabled: true,
                verb: None,
                noun: None,
                label: Some(format!("dialogue_{}_{}", self.id, node.id)),
                editor_position: node.editor_position,
            });

            rule_id += 1;

            // Generate rules for each choice
            for (choice_idx, choice) in node.choices.iter().enumerate() {
                let mut choice_conditions = vec![
                    Condition {
                        id: 0,
                        condition_type: ConditionType::VerbIs {
                            verb: format!("choice{}", choice_idx + 1)
                        },
                    },
                ];

                // Add choice conditions
                for (idx, cond) in choice.conditions.iter().enumerate() {
                    choice_conditions.push(Condition {
                        id: idx + 1,
                        condition_type: self.dialogue_condition_to_daad(cond),
                    });
                }

                let mut choice_actions = vec![];

                // Add choice actions
                for (idx, action) in choice.actions.iter().enumerate() {
                    choice_actions.push(Action {
                        id: idx,
                        action_type: self.dialogue_action_to_daad(action),
                    });
                }

                // If there's a next node, continue conversation
                if let Some(next_node_id) = &choice.next_node_id {
                    choice_actions.push(Action {
                        id: choice_actions.len(),
                        action_type: ActionType::ShowMessage {
                            text: format!("You: {}", choice.text),
                        },
                    });
                    // Mark that we should show the next node
                    choice_actions.push(Action {
                        id: choice_actions.len(),
                        action_type: ActionType::OK,
                    });
                } else {
                    // End conversation
                    choice_actions.push(Action {
                        id: choice_actions.len(),
                        action_type: ActionType::ShowMessage {
                            text: format!("You: {}", choice.text),
                        },
                    });
                    choice_actions.push(Action {
                        id: choice_actions.len(),
                        action_type: ActionType::OK,
                    });
                }

                rules.push(Rule {
                    id: rule_id,
                    name: format!("{} - {} Choice {}", self.name, node.id, choice_idx),
                    process: ProcessTable::Response,
                    conditions: choice_conditions,
                    actions: choice_actions,
                    enabled: true,
                    verb: None,
                    noun: None,
                    label: Some(format!("dialogue_{}_{}_{}", self.id, node.id, choice_idx)),
                    editor_position: Vec2::new(
                        node.editor_position.x + 200.0,
                        node.editor_position.y + (choice_idx as f32 * 60.0),
                    ),
                });

                rule_id += 1;
            }
        }

        rules
    }

    /// Convert dialogue condition to DAAD condition
    fn dialogue_condition_to_daad(&self, cond: &DialogueCondition) -> ConditionType {
        match cond {
            DialogueCondition::FlagSet { flag_id } => ConditionType::FlagNotZero {
                flag_id: *flag_id,
            },
            DialogueCondition::FlagClear { flag_id } => ConditionType::FlagZero {
                flag_id: *flag_id,
            },
            DialogueCondition::FlagEquals { flag_id, value } => ConditionType::FlagEquals {
                flag_id: *flag_id,
                value: (*value & 0xFF) as u8,  // Convert i16 to u8
            },
            DialogueCondition::FlagGreaterThan { flag_id, value } => {
                ConditionType::FlagGreaterThan {
                    flag_id: *flag_id,
                    value: (*value & 0xFF) as u8,
                }
            }
            DialogueCondition::FlagLessThan { flag_id, value } => ConditionType::FlagLessThan {
                flag_id: *flag_id,
                value: (*value & 0xFF) as u8,
            },
            DialogueCondition::ObjectCarried { object_id } => ConditionType::ObjectCarried {
                object_id: *object_id,
            },
            DialogueCondition::ObjectAt {
                object_id,
                location_id,
            } => ConditionType::ObjectAt {
                object_id: *object_id,
                location_id: *location_id,
            },
            DialogueCondition::PlayerAt { location_id } => ConditionType::PlayerAt {
                location_id: *location_id,
            },
            DialogueCondition::FirstTime => {
                // Use IsFirstTurn or a custom flag
                ConditionType::IsFirstTurn
            }
        }
    }

    /// Convert dialogue action to DAAD action
    fn dialogue_action_to_daad(&self, action: &DialogueAction) -> ActionType {
        match action {
            DialogueAction::SetFlag { flag_id } => ActionType::SetBit { flag_id: *flag_id },
            DialogueAction::ClearFlag { flag_id } => ActionType::ClearFlag { flag_id: *flag_id },
            DialogueAction::IncFlag { flag_id } => ActionType::IncrementFlag { flag_id: *flag_id },
            DialogueAction::DecFlag { flag_id } => ActionType::DecrementFlag { flag_id: *flag_id },
            DialogueAction::SetFlagValue { flag_id, value } => ActionType::SetFlag {
                flag_id: *flag_id,
                value: (*value & 0xFF) as u8,
            },
            DialogueAction::GiveObject { object_id } => ActionType::GetObject {
                object_id: *object_id,
            },
            DialogueAction::TakeObject { object_id } => ActionType::DropObject {
                object_id: *object_id,
            },
            DialogueAction::MoveObject {
                object_id,
                location_id,
            } => ActionType::MoveObject {
                object_id: *object_id,
                to_location: ObjectLocation::Location(*location_id),
            },
            DialogueAction::IncScore { amount } => ActionType::AddScore { points: *amount as u16 },
            DialogueAction::DecScore { amount } => ActionType::SubtractScore { points: *amount as u16 },
        }
    }
}

impl Default for DialogueTree {
    fn default() -> Self {
        Self::new("New Conversation", "NPC", "talk")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_dialogue_tree() {
        let mut tree = DialogueTree::new("Guard", "Guard", "talk");
        assert_eq!(tree.nodes.len(), 1);
        assert_eq!(tree.npc_name, "Guard");

        // Add a second node
        let node2_id = tree.add_node("What do you want?", Vec2::new(600.0, 300.0));

        // Add choice to root that leads to node2
        tree.add_choice_to_node(&tree.root_node_id.clone(), "Can I pass?", Some(node2_id));

        assert_eq!(tree.nodes.len(), 2);
        assert_eq!(tree.nodes[0].choices.len(), 1);
    }

    #[test]
    fn test_generate_rules() {
        let mut tree = DialogueTree::new("Guard", "Guard", "talk");
        let node2_id = tree.add_node("You need a key!", Vec2::new(600.0, 300.0));
        tree.add_choice_to_node(&tree.root_node_id.clone(), "Can I pass?", Some(node2_id));

        let rules = tree.generate_rules(100);
        assert!(rules.len() >= 2); // At least one rule per node
    }
}
