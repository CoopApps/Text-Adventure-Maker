use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::{DialogueTree, DialogueNode, DialogueChoice};

/// Resource to track dialogue editing state
#[derive(Resource)]
pub struct DialogueEditorState {
    pub trees: Vec<DialogueTree>,
    pub selected_tree: Option<usize>,
    pub selected_node: Option<String>,
    pub editing_mode: DialogueEditMode,
}

#[derive(Default, PartialEq, Eq)]
pub enum DialogueEditMode {
    #[default]
    SelectTree,
    EditTree,
    AddNode,
    AddChoice,
}

impl Default for DialogueEditorState {
    fn default() -> Self {
        Self {
            trees: vec![],
            selected_tree: None,
            selected_node: None,
            editing_mode: DialogueEditMode::SelectTree,
        }
    }
}

/// Render the dialogue tree builder panel
pub fn render_dialogue_panel(parent: &mut ChildBuilder, state: &BuilderState, dialogue_state: &DialogueEditorState) {
    parent.spawn(TextBundle::from_section(
        "🗣️ Conversation Tree Builder",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nCreate branching NPC conversations with conditions and actions.",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Tree list or tree editor based on mode
    match dialogue_state.editing_mode {
        DialogueEditMode::SelectTree => render_tree_list(parent, dialogue_state),
        DialogueEditMode::EditTree => render_tree_editor(parent, dialogue_state),
        _ => {}
    }
}

fn render_tree_list(parent: &mut ChildBuilder, dialogue_state: &DialogueEditorState) {
    parent.spawn(TextBundle::from_section(
        "\n\n📋 Dialogue Trees:",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.9),
            ..default()
        },
    ));

    if dialogue_state.trees.is_empty() {
        parent.spawn(TextBundle::from_section(
            "\n  No dialogue trees yet.",
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    } else {
        for (idx, tree) in dialogue_state.trees.iter().enumerate() {
            parent.spawn(TextBundle::from_section(
                format!(
                    "\n  {}. {} - {} ({} nodes)",
                    idx + 1,
                    tree.name,
                    tree.npc_name,
                    tree.nodes.len()
                ),
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("     Trigger: {}", tree.trigger_verb),
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.7, 0.8),
                    ..default()
                },
            ));
        }
    }

    // New tree button
    parent.spawn((
        ButtonBundle {
            style: Style {
                margin: UiRect::top(Val::Px(20.0)),
                padding: UiRect::all(Val::Px(10.0)),
                ..default()
            },
            background_color: Color::rgb(0.2, 0.6, 0.3).into(),
            ..default()
        },
        NewDialogueTreeButton,
    ))
    .with_children(|btn| {
        btn.spawn(TextBundle::from_section(
            "[+] Create New Dialogue Tree",
            TextStyle {
                font_size: 16.0,
                color: Color::WHITE,
                ..default()
            },
        ));
    });
}

fn render_tree_editor(parent: &mut ChildBuilder, dialogue_state: &DialogueEditorState) {
    if let Some(tree_idx) = dialogue_state.selected_tree {
        if let Some(tree) = dialogue_state.trees.get(tree_idx) {
            parent.spawn(TextBundle::from_section(
                format!("\n\nEditing: {} ({})", tree.name, tree.npc_name),
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(1.0, 0.9, 0.6),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("Trigger verb: {}", tree.trigger_verb),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Show nodes
            parent.spawn(TextBundle::from_section(
                "\n\n📝 Dialogue Nodes:",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));

            for node in &tree.nodes {
                render_node_card(parent, node, tree, &dialogue_state.selected_node);
            }

            // Action buttons
            parent.spawn(TextBundle::from_section(
                "\n\n⚙️ Actions:",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));

            // Add node button
            parent.spawn((
                ButtonBundle {
                    style: Style {
                        margin: UiRect::top(Val::Px(10.0)),
                        padding: UiRect::all(Val::Px(10.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.2, 0.5, 0.7).into(),
                    ..default()
                },
                AddNodeButton,
            ))
            .with_children(|btn| {
                btn.spawn(TextBundle::from_section(
                    "[+] Add Dialogue Node",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });

            // Generate rules button
            parent.spawn((
                ButtonBundle {
                    style: Style {
                        margin: UiRect::top(Val::Px(10.0)),
                        padding: UiRect::all(Val::Px(10.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.6, 0.3, 0.7).into(),
                    ..default()
                },
                GenerateDialogueRulesButton,
            ))
            .with_children(|btn| {
                btn.spawn(TextBundle::from_section(
                    "⚙️ Generate DAAD Rules from Tree",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });

            // Back button
            parent.spawn((
                ButtonBundle {
                    style: Style {
                        margin: UiRect::top(Val::Px(10.0)),
                        padding: UiRect::all(Val::Px(10.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                    ..default()
                },
                BackToTreeListButton,
            ))
            .with_children(|btn| {
                btn.spawn(TextBundle::from_section(
                    "← Back to Tree List",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });
        }
    }
}

fn render_node_card(
    parent: &mut ChildBuilder,
    node: &DialogueNode,
    tree: &DialogueTree,
    selected_node: &Option<String>,
) {
    let is_root = node.id == tree.root_node_id;
    let is_selected = selected_node.as_ref() == Some(&node.id);

    let bg_color = if is_selected {
        Color::rgb(0.3, 0.4, 0.5)
    } else if is_root {
        Color::rgb(0.25, 0.35, 0.25)
    } else {
        Color::rgb(0.2, 0.2, 0.3)
    };

    parent
        .spawn(NodeBundle {
            style: Style {
                margin: UiRect::top(Val::Px(10.0)),
                padding: UiRect::all(Val::Px(15.0)),
                flex_direction: FlexDirection::Column,
                ..default()
            },
            background_color: bg_color.into(),
            ..default()
        })
        .with_children(|card| {
            // Node ID and root badge
            let header = if is_root {
                format!("🏁 {} (ROOT)", node.id)
            } else {
                format!("📍 {}", node.id)
            };

            card.spawn(TextBundle::from_section(
                header,
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.9),
                    ..default()
                },
            ));

            // NPC text
            card.spawn(TextBundle::from_section(
                format!("\n{}: \"{}\"", tree.npc_name, node.npc_text),
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            // Choices
            if !node.choices.is_empty() {
                card.spawn(TextBundle::from_section(
                    "\n  Player Choices:",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.7, 0.8, 0.9),
                        ..default()
                    },
                ));

                for choice in &node.choices {
                    let next_info = if let Some(next_id) = &choice.next_node_id {
                        format!(" → {}", next_id)
                    } else {
                        " → [END]".to_string()
                    };

                    card.spawn(TextBundle::from_section(
                        format!("    • \"{}\" {}", choice.text, next_info),
                        TextStyle {
                            font_size: 13.0,
                            color: Color::rgb(0.6, 0.9, 0.7),
                            ..default()
                        },
                    ));
                }
            } else {
                card.spawn(TextBundle::from_section(
                    "\n  [No choices - conversation ends]",
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }

            // Conditions
            if !node.conditions.is_empty() {
                card.spawn(TextBundle::from_section(
                    format!("\n  Conditions: {}", node.conditions.len()),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.8, 0.7, 0.6),
                        ..default()
                    },
                ));
            }

            // Actions
            if !node.actions.is_empty() {
                card.spawn(TextBundle::from_section(
                    format!("  Actions: {}", node.actions.len()),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.9, 0.7, 0.7),
                        ..default()
                    },
                ));
            }
        });
}

// Button components
#[derive(Component)]
pub struct NewDialogueTreeButton;

#[derive(Component)]
pub struct AddNodeButton;

#[derive(Component)]
pub struct AddChoiceButton {
    pub node_id: String,
}

#[derive(Component)]
pub struct GenerateDialogueRulesButton;

#[derive(Component)]
pub struct BackToTreeListButton;

// Event handlers
pub fn handle_new_dialogue_tree_button(
    mut dialogue_state: ResMut<DialogueEditorState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<NewDialogueTreeButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Create a sample dialogue tree
            let mut tree = DialogueTree::new("Merchant", "Friendly Merchant", "talk");
            let node2_id = tree.add_node("I have many wares for sale!", Vec2::new(600.0, 300.0));
            tree.add_choice_to_node(&tree.root_node_id.clone(), "What do you sell?", Some(node2_id.clone()));
            tree.add_choice_to_node(&tree.root_node_id.clone(), "Goodbye", None);

            let node3_id = tree.add_node("Thank you for your business!", Vec2::new(800.0, 300.0));
            tree.add_choice_to_node(&node2_id, "I'll take a look", Some(node3_id));
            tree.add_choice_to_node(&node2_id, "Not interested", None);

            dialogue_state.trees.push(tree);
            dialogue_state.selected_tree = Some(dialogue_state.trees.len() - 1);
            dialogue_state.editing_mode = DialogueEditMode::EditTree;
        }
    }
}

pub fn handle_add_node_button(
    mut dialogue_state: ResMut<DialogueEditorState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<AddNodeButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(tree_idx) = dialogue_state.selected_tree {
                if let Some(tree) = dialogue_state.trees.get_mut(tree_idx) {
                    let new_node_id = tree.add_node(
                        "New dialogue text...",
                        Vec2::new(400.0, 300.0 + (tree.nodes.len() as f32 * 100.0)),
                    );
                    dialogue_state.selected_node = Some(new_node_id);
                }
            }
        }
    }
}

pub fn handle_generate_dialogue_rules_button(
    dialogue_state: Res<DialogueEditorState>,
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<GenerateDialogueRulesButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(tree_idx) = dialogue_state.selected_tree {
                if let Some(tree) = dialogue_state.trees.get(tree_idx) {
                    // Get next available rule ID
                    let next_rule_id = state
                        .current_game
                        .rules
                        .iter()
                        .map(|r| r.id)
                        .max()
                        .map_or(0, |max| max + 1);

                    // Generate rules from dialogue tree
                    let generated_rules = tree.generate_rules(next_rule_id);

                    // Add to game
                    state.current_game.rules.extend(generated_rules);
                    state.mark_dirty();

                    info!("Generated {} rules from dialogue tree '{}'",
                        tree.nodes.len() * 2, tree.name);
                }
            }
        }
    }
}

pub fn handle_back_to_tree_list_button(
    mut dialogue_state: ResMut<DialogueEditorState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<BackToTreeListButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            dialogue_state.editing_mode = DialogueEditMode::SelectTree;
            dialogue_state.selected_tree = None;
            dialogue_state.selected_node = None;
        }
    }
}
