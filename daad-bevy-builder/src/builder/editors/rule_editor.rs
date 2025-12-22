use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode, Panel};
use crate::builder::ui::condition_action_modals::{ConditionEditorState, ActionEditorState};
use crate::daad::types::{ProcessTable, ConditionType, ActionType, Condition, Action};

/// Render rule editor sidebar when Rules panel is active
pub fn render_rule_sidebar(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<RuleSidebar>>,
) {
    // Only render when Rules panel is active
    if state.selected_panel != Panel::Rules {
        return;
    }

    // Clean up old sidebar
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create rule sidebar
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Px(300.0),
                    height: Val::Percent(70.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(15.0)),
                    row_gap: Val::Px(8.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.12, 0.12, 0.18, 0.95).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            RuleSidebar,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "⚙️ Rules",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            // Add new rule button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::bottom(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                        ..default()
                    },
                    AddRuleButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "+ Add Rule",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // List all rules
            for (idx, rule) in state.current_game.rules.iter().enumerate() {
                let is_selected = matches!(state.editing, Some(EditMode::Rule(id)) if id == idx);

                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(8.0)),
                                border: UiRect::all(Val::Px(2.0)),
                                flex_direction: FlexDirection::Column,
                                align_items: AlignItems::FlexStart,
                                ..default()
                            },
                            background_color: if is_selected {
                                Color::rgb(0.4, 0.6, 0.9)
                            } else {
                                Color::rgb(0.2, 0.2, 0.25)
                            }.into(),
                            border_color: if is_selected {
                                Color::rgb(1.0, 1.0, 0.5)
                            } else {
                                Color::rgb(0.3, 0.3, 0.35)
                            }.into(),
                            ..default()
                        },
                        RuleCard {
                            rule_index: idx,
                        },
                    ))
                    .with_children(|parent| {
                        // Rule name and process table
                        parent.spawn(TextBundle::from_section(
                            format!("#{} {}", idx, rule.name),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));

                        // Process table
                        let process_name = match rule.process {
                            ProcessTable::Parsing => "PRO 0: Parsing",
                            ProcessTable::Response => "PRO 1: Response",
                            ProcessTable::AutoAction => "PRO 2: Auto-Action",
                            ProcessTable::Description => "PRO 3: Description",
                        };

                        parent.spawn(TextBundle::from_section(
                            process_name,
                            TextStyle {
                                font_size: 11.0,
                                color: Color::rgb(0.8, 0.9, 1.0),
                                ..default()
                            },
                        ));

                        // Condition/Action counts
                        parent.spawn(TextBundle::from_section(
                            format!("📋 {} conditions, {} actions",
                                rule.conditions.len(),
                                rule.actions.len()
                            ),
                            TextStyle {
                                font_size: 10.0,
                                color: Color::rgb(0.6, 0.6, 0.6),
                                ..default()
                            },
                        ));

                        // Enabled status
                        if !rule.enabled {
                            parent.spawn(TextBundle::from_section(
                                "⏸️ Disabled",
                                TextStyle {
                                    font_size: 10.0,
                                    color: Color::rgb(0.8, 0.4, 0.4),
                                    ..default()
                                },
                            ));
                        }
                    });
            }

            // Instructions
            parent.spawn(TextBundle::from_section(
                "\nClick to edit rules\nAdd conditions & actions",
                TextStyle {
                    font_size: 10.0,
                    color: Color::rgb(0.5, 0.5, 0.5),
                    ..default()
                },
            ));
        });
}

/// Render rule detail editor when a rule is selected
pub fn render_rule_detail_editor(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<RuleDetailEditor>>,
) {
    // Only render when Rules panel is active and a rule is selected
    if state.selected_panel != Panel::Rules {
        return;
    }

    let selected_rule_idx = match state.editing {
        Some(EditMode::Rule(idx)) => idx,
        _ => return,
    };

    // Clean up old editor
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    if let Some(rule) = state.current_game.rules.get(selected_rule_idx) {
        // Create detail editor
        commands
            .spawn((
                NodeBundle {
                    style: Style {
                        position_type: PositionType::Absolute,
                        left: Val::Px(330.0),
                        top: Val::Px(100.0),
                        width: Val::Px(500.0),
                        height: Val::Percent(70.0),
                        flex_direction: FlexDirection::Column,
                        padding: UiRect::all(Val::Px(15.0)),
                        row_gap: Val::Px(10.0),
                        overflow: Overflow::clip_y(),
                        border: UiRect::all(Val::Px(2.0)),
                        ..default()
                    },
                    background_color: Color::rgba(0.15, 0.15, 0.2, 0.95).into(),
                    border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                    ..default()
                },
                RuleDetailEditor,
            ))
            .with_children(|parent| {
                // Header
                parent.spawn(TextBundle::from_section(
                    format!("Editing Rule #{}: {}", selected_rule_idx, rule.name),
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.8, 0.9, 1.0),
                        ..default()
                    },
                ));

                // Process table selector
                parent.spawn(TextBundle::from_section(
                    format!("Process Table: {:?}", rule.process),
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.9, 0.9, 0.9),
                        ..default()
                    },
                ));

                // Conditions section
                parent.spawn(TextBundle::from_section(
                    "\n🔍 Conditions:",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.7, 0.9, 1.0),
                        ..default()
                    },
                ));

                if rule.conditions.is_empty() {
                    parent.spawn(TextBundle::from_section(
                        "  (No conditions - rule always triggers)",
                        TextStyle {
                            font_size: 11.0,
                            color: Color::rgb(0.5, 0.5, 0.5),
                            ..default()
                        },
                    ));
                } else {
                    for (idx, condition) in rule.conditions.iter().enumerate() {
                        let condition_text = format_condition(condition, &state);

                        // Condition row with edit/delete buttons
                        parent.spawn(NodeBundle {
                            style: Style {
                                display: Display::Flex,
                                flex_direction: FlexDirection::Row,
                                align_items: AlignItems::Center,
                                column_gap: Val::Px(8.0),
                                padding: UiRect::all(Val::Px(4.0)),
                                ..default()
                            },
                            ..default()
                        })
                        .with_children(|row| {
                            // Condition text
                            row.spawn(NodeBundle {
                                style: Style {
                                    flex_grow: 1.0,
                                    ..default()
                                },
                                ..default()
                            })
                            .with_children(|text_container| {
                                text_container.spawn(TextBundle::from_section(
                                    format!("{}. {}", idx + 1, condition_text),
                                    TextStyle {
                                        font_size: 11.0,
                                        color: Color::rgb(0.8, 0.8, 0.8),
                                        ..default()
                                    },
                                ));
                            });

                            // Edit button
                            row.spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::axes(Val::Px(8.0), Val::Px(4.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.4, 0.5, 0.6).into(),
                                    ..default()
                                },
                                EditConditionButton {
                                    rule_index: selected_rule_idx,
                                    condition_index: idx,
                                },
                            ))
                            .with_children(|btn| {
                                btn.spawn(TextBundle::from_section(
                                    "✏️",
                                    TextStyle {
                                        font_size: 11.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });

                            // Delete button
                            row.spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::axes(Val::Px(8.0), Val::Px(4.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.6, 0.3, 0.3).into(),
                                    ..default()
                                },
                                DeleteConditionButton {
                                    rule_index: selected_rule_idx,
                                    condition_index: idx,
                                },
                            ))
                            .with_children(|btn| {
                                btn.spawn(TextBundle::from_section(
                                    "🗑️",
                                    TextStyle {
                                        font_size: 11.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });
                        });
                    }
                }

                // Add condition button
                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(6.0)),
                                margin: UiRect::top(Val::Px(5.0)),
                                border: UiRect::all(Val::Px(1.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                            border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                            ..default()
                        },
                        AddConditionButton { rule_index: selected_rule_idx },
                    ))
                    .with_children(|parent| {
                        parent.spawn(TextBundle::from_section(
                            "+ Add Condition",
                            TextStyle {
                                font_size: 11.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });

                // Actions section
                parent.spawn(TextBundle::from_section(
                    "\n⚡ Actions:",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(1.0, 0.9, 0.7),
                        ..default()
                    },
                ));

                if rule.actions.is_empty() {
                    parent.spawn(TextBundle::from_section(
                        "  (No actions - rule does nothing)",
                        TextStyle {
                            font_size: 11.0,
                            color: Color::rgb(0.5, 0.5, 0.5),
                            ..default()
                        },
                    ));
                } else {
                    for (idx, action) in rule.actions.iter().enumerate() {
                        let action_text = format_action(action, &state);

                        // Action row with edit/delete buttons
                        parent.spawn(NodeBundle {
                            style: Style {
                                display: Display::Flex,
                                flex_direction: FlexDirection::Row,
                                align_items: AlignItems::Center,
                                column_gap: Val::Px(8.0),
                                padding: UiRect::all(Val::Px(4.0)),
                                ..default()
                            },
                            ..default()
                        })
                        .with_children(|row| {
                            // Action text
                            row.spawn(NodeBundle {
                                style: Style {
                                    flex_grow: 1.0,
                                    ..default()
                                },
                                ..default()
                            })
                            .with_children(|text_container| {
                                text_container.spawn(TextBundle::from_section(
                                    format!("{}. {}", idx + 1, action_text),
                                    TextStyle {
                                        font_size: 11.0,
                                        color: Color::rgb(0.8, 0.8, 0.8),
                                        ..default()
                                    },
                                ));
                            });

                            // Edit button
                            row.spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::axes(Val::Px(8.0), Val::Px(4.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.5, 0.4, 0.3).into(),
                                    ..default()
                                },
                                EditActionButton {
                                    rule_index: selected_rule_idx,
                                    action_index: idx,
                                },
                            ))
                            .with_children(|btn| {
                                btn.spawn(TextBundle::from_section(
                                    "✏️",
                                    TextStyle {
                                        font_size: 11.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });

                            // Delete button
                            row.spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::axes(Val::Px(8.0), Val::Px(4.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.6, 0.3, 0.3).into(),
                                    ..default()
                                },
                                DeleteActionButton {
                                    rule_index: selected_rule_idx,
                                    action_index: idx,
                                },
                            ))
                            .with_children(|btn| {
                                btn.spawn(TextBundle::from_section(
                                    "🗑️",
                                    TextStyle {
                                        font_size: 11.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });
                        });
                    }
                }

                // Add action button
                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(6.0)),
                                margin: UiRect::top(Val::Px(5.0)),
                                border: UiRect::all(Val::Px(1.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.7, 0.5, 0.3).into(),
                            border_color: Color::rgb(0.8, 0.6, 0.4).into(),
                            ..default()
                        },
                        AddActionButton { rule_index: selected_rule_idx },
                    ))
                    .with_children(|parent| {
                        parent.spawn(TextBundle::from_section(
                            "+ Add Action",
                            TextStyle {
                                font_size: 11.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });
            });
    }
}

/// Format a condition for display
fn format_condition(condition: &Condition, state: &BuilderState) -> String {
    match &condition.condition_type {
        ConditionType::PlayerAt { location_id } => {
            if let Some(loc) = state.current_game.locations.iter().find(|l| l.id == *location_id) {
                format!("Player is at \"{}\"", loc.name)
            } else {
                format!("Player is at location #{}", location_id)
            }
        }
        ConditionType::ObjectCarried { object_id } => {
            if let Some(obj) = state.current_game.objects.iter().find(|o| o.id == *object_id) {
                format!("Carrying \"{}\"", obj.name)
            } else {
                format!("Carrying object #{}", object_id)
            }
        }
        ConditionType::FlagEquals { flag_id, value } => {
            format!("Flag #{} equals {}", flag_id, value)
        }
        ConditionType::VerbIs { verb } => {
            format!("Verb is \"{}\"", verb)
        }
        ConditionType::NounIs { noun } => {
            format!("Noun is \"{}\"", noun)
        }
        _ => format!("{:?}", condition.condition_type),
    }
}

/// Format an action for display
fn format_action(action: &Action, state: &BuilderState) -> String {
    match &action.action_type {
        ActionType::ShowMessage { text } => {
            format!("Display: \"{}\"", text)
        }
        ActionType::GetObject { object_id } => {
            if let Some(obj) = state.current_game.objects.iter().find(|o| o.id == *object_id) {
                format!("Pick up \"{}\"", obj.name)
            } else {
                format!("Get object #{}", object_id)
            }
        }
        ActionType::DropObject { object_id } => {
            if let Some(obj) = state.current_game.objects.iter().find(|o| o.id == *object_id) {
                format!("Drop \"{}\"", obj.name)
            } else {
                format!("Drop object #{}", object_id)
            }
        }
        ActionType::GoToLocation { location_id } => {
            if let Some(loc) = state.current_game.locations.iter().find(|l| l.id == *location_id) {
                format!("Move player to \"{}\"", loc.name)
            } else {
                format!("Go to location #{}", location_id)
            }
        }
        ActionType::SetFlag { flag_id, value } => {
            format!("Set flag #{} to {}", flag_id, value)
        }
        ActionType::EndTurn => {
            "End turn".to_string()
        }
        _ => format!("{:?}", action.action_type),
    }
}

/// Handle rule card clicks (select for editing)
pub fn handle_rule_card_clicks(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &RuleCard),
        Changed<Interaction>,
    >,
) {
    for (interaction, card) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            state.editing = Some(EditMode::Rule(card.rule_index));
            info!("Selected rule {} for editing", card.rule_index);
        }
    }
}

/// Handle add rule button
pub fn handle_add_rule_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<AddRuleButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Add new rule
            let rule_count = state.current_game.rules.len();
            let new_idx = state.current_game.add_rule(
                &format!("Rule {}", rule_count + 1),
                ProcessTable::Response,
            );

            state.unsaved_changes = true;
            state.editing = Some(EditMode::Rule(new_idx));
            info!("Created new rule {}", new_idx);
        }
    }
}

/// Handle add condition button (opens modal for new condition)
pub fn handle_add_condition_button(
    mut condition_editor_state: ResMut<ConditionEditorState>,
    mut interaction_query: Query<
        (&Interaction, &AddConditionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            condition_editor_state.open_new(button.rule_index);
            info!("Opening condition editor for rule {}", button.rule_index);
        }
    }
}

/// Handle add action button (opens modal for new action)
pub fn handle_add_action_button(
    mut action_editor_state: ResMut<ActionEditorState>,
    mut interaction_query: Query<
        (&Interaction, &AddActionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            action_editor_state.open_new(button.rule_index);
            info!("Opening action editor for rule {}", button.rule_index);
        }
    }
}

/// Handle edit condition button (opens modal in edit mode)
pub fn handle_edit_condition_button(
    state: Res<BuilderState>,
    mut condition_editor_state: ResMut<ConditionEditorState>,
    mut interaction_query: Query<
        (&Interaction, &EditConditionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(rule) = state.current_game.rules.get(button.rule_index) {
                if let Some(condition) = rule.conditions.get(button.condition_index) {
                    condition_editor_state.open_edit(
                        button.rule_index,
                        button.condition_index,
                        condition,
                    );
                    info!("Editing condition {} in rule {}", button.condition_index, button.rule_index);
                }
            }
        }
    }
}

/// Handle delete condition button (removes condition from rule)
pub fn handle_delete_condition_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteConditionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(rule) = state.current_game.rules.get_mut(button.rule_index) {
                if button.condition_index < rule.conditions.len() {
                    rule.conditions.remove(button.condition_index);

                    // Re-index remaining conditions
                    for (idx, condition) in rule.conditions.iter_mut().enumerate() {
                        condition.id = idx;
                    }

                    state.unsaved_changes = true;
                    info!("Deleted condition {} from rule {}", button.condition_index, button.rule_index);
                }
            }
        }
    }
}

/// Handle edit action button (opens modal in edit mode)
pub fn handle_edit_action_button(
    state: Res<BuilderState>,
    mut action_editor_state: ResMut<ActionEditorState>,
    mut interaction_query: Query<
        (&Interaction, &EditActionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(rule) = state.current_game.rules.get(button.rule_index) {
                if let Some(action) = rule.actions.get(button.action_index) {
                    action_editor_state.open_edit(
                        button.rule_index,
                        button.action_index,
                        action,
                    );
                    info!("Editing action {} in rule {}", button.action_index, button.rule_index);
                }
            }
        }
    }
}

/// Handle delete action button (removes action from rule)
pub fn handle_delete_action_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteActionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(rule) = state.current_game.rules.get_mut(button.rule_index) {
                if button.action_index < rule.actions.len() {
                    rule.actions.remove(button.action_index);

                    // Re-index remaining actions
                    for (idx, action) in rule.actions.iter_mut().enumerate() {
                        action.id = idx;
                    }

                    state.unsaved_changes = true;
                    info!("Deleted action {} from rule {}", button.action_index, button.rule_index);
                }
            }
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct RuleSidebar;

#[derive(Component)]
pub(crate) struct RuleCard {
    rule_index: usize,
}

#[derive(Component)]
pub(crate) struct AddRuleButton;

#[derive(Component)]
pub(crate) struct RuleDetailEditor;

#[derive(Component)]
pub(crate) struct AddConditionButton {
    rule_index: usize,
}

#[derive(Component)]
pub(crate) struct AddActionButton {
    rule_index: usize,
}

#[derive(Component)]
pub(crate) struct EditConditionButton {
    rule_index: usize,
    condition_index: usize,
}

#[derive(Component)]
pub(crate) struct DeleteConditionButton {
    rule_index: usize,
    condition_index: usize,
}

#[derive(Component)]
pub(crate) struct EditActionButton {
    rule_index: usize,
    action_index: usize,
}

#[derive(Component)]
pub(crate) struct DeleteActionButton {
    rule_index: usize,
    action_index: usize,
}
