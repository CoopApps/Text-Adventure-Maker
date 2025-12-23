use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::templates::{TemplateLibrary, GameTemplate, TemplateCategory};

#[derive(Component)]
pub struct InsertTemplateButton {
    pub template_id: String,
}

/// Render the templates panel
pub fn render_templates_panel(parent: &mut ChildBuilder, _state: &BuilderState) {
    parent.spawn(NodeBundle {
        style: Style {
            width: Val::Percent(100.0),
            height: Val::Percent(100.0),
            flex_direction: FlexDirection::Column,
            padding: UiRect::all(Val::Px(20.0)),
            row_gap: Val::Px(16.0),
            overflow: Overflow::clip_y(),
            ..default()
        },
        background_color: Color::rgba(0.12, 0.12, 0.18, 0.95).into(),
        ..default()
    })
    .with_children(|panel| {
        // Header
        panel.spawn(TextBundle::from_section(
            "📝 Script Templates Library",
            TextStyle {
                font_size: 28.0,
                color: Color::rgb(0.9, 0.95, 1.0),
                ..default()
            },
        ));

        // Description
        panel.spawn(TextBundle::from_section(
            "Pre-built patterns for common DAAD mechanics. Click 'Insert' to add to your game.",
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.8),
                ..default()
            },
        ));

        // Render templates by category
        for category in &[
            TemplateCategory::Puzzles,
            TemplateCategory::Objects,
            TemplateCategory::Items,
            TemplateCategory::NPCs,
            TemplateCategory::Mechanics,
        ] {
            render_category_section(panel, *category);
        }

        // Tips section
        panel.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(16.0)),
                margin: UiRect::top(Val::Px(20.0)),
                ..default()
            },
            background_color: Color::rgba(0.2, 0.3, 0.4, 0.6).into(),
            ..default()
        })
        .with_children(|tips| {
            tips.spawn(TextBundle::from_section(
                "💡 Tips:\n\
                • Templates add objects, rules, flags, and vocabulary automatically\n\
                • You can customize inserted templates after adding them\n\
                • IDs are automatically assigned to avoid conflicts\n\
                • Check the Objects, Rules, and Flags panels to see what was added",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.8, 0.85, 0.9),
                    ..default()
                },
            ));
        });
    });
}

fn render_category_section(parent: &mut ChildBuilder, category: TemplateCategory) {
    let templates = TemplateLibrary::templates_by_category(category);

    if templates.is_empty() {
        return;
    }

    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            row_gap: Val::Px(10.0),
            margin: UiRect::top(Val::Px(12.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|section| {
        // Category header
        section.spawn(TextBundle::from_section(
            format!("{} {}", category.icon(), category.as_str()),
            TextStyle {
                font_size: 22.0,
                color: Color::rgb(0.8, 0.9, 1.0),
                ..default()
            },
        ));

        // Template grid
        section.spawn(NodeBundle {
            style: Style {
                display: Display::Grid,
                grid_template_columns: RepeatedGridTrack::flex(1, 1.0),
                column_gap: Val::Px(12.0),
                row_gap: Val::Px(10.0),
                ..default()
            },
            ..default()
        })
        .with_children(|grid| {
            for template in templates {
                render_template_card(grid, &template);
            }
        });
    });
}

fn render_template_card(parent: &mut ChildBuilder, template: &GameTemplate) {
    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            padding: UiRect::all(Val::Px(14.0)),
            row_gap: Val::Px(8.0),
            border: UiRect::all(Val::Px(2.0)),
            ..default()
        },
        background_color: Color::rgba(0.18, 0.18, 0.25, 0.9).into(),
        border_color: Color::rgba(0.3, 0.4, 0.5, 0.8).into(),
        ..default()
    })
    .with_children(|card| {
        // Header row with icon, name, and insert button
        card.spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Row,
                justify_content: JustifyContent::SpaceBetween,
                align_items: AlignItems::Center,
                ..default()
            },
            ..default()
        })
        .with_children(|header| {
            // Icon and name
            header.spawn(NodeBundle {
                style: Style {
                    flex_direction: FlexDirection::Row,
                    column_gap: Val::Px(8.0),
                    align_items: AlignItems::Center,
                    ..default()
                },
                ..default()
            })
            .with_children(|title_row| {
                title_row.spawn(TextBundle::from_section(
                    template.icon,
                    TextStyle {
                        font_size: 24.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));

                title_row.spawn(TextBundle::from_section(
                    template.name,
                    TextStyle {
                        font_size: 18.0,
                        color: Color::rgb(0.9, 0.95, 1.0),
                        ..default()
                    },
                ));
            });

            // Insert button
            header.spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(10.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.3, 0.7, 0.5).into(),
                    ..default()
                },
                InsertTemplateButton {
                    template_id: template.id.to_string(),
                },
            ))
            .with_children(|button| {
                button.spawn(TextBundle::from_section(
                    "➕ Insert",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });
        });

        // Description
        card.spawn(TextBundle::from_section(
            template.description,
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.7, 0.75, 0.8),
                ..default()
            },
        ));

        // What it adds
        card.spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Column,
                row_gap: Val::Px(4.0),
                padding: UiRect::all(Val::Px(8.0)),
                ..default()
            },
            background_color: Color::rgba(0.1, 0.1, 0.15, 0.7).into(),
            ..default()
        })
        .with_children(|details| {
            details.spawn(TextBundle::from_section(
                "Adds:",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.7, 0.8),
                    ..default()
                },
            ));

            if !template.objects.is_empty() {
                details.spawn(TextBundle::from_section(
                    format!("  📦 {} object(s)", template.objects.len()),
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.7, 0.8, 0.9),
                        ..default()
                    },
                ));
            }

            if !template.rules.is_empty() {
                details.spawn(TextBundle::from_section(
                    format!("  ⚙️ {} rule(s)", template.rules.len()),
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.7, 0.8, 0.9),
                        ..default()
                    },
                ));
            }

            if !template.vocabulary.is_empty() {
                details.spawn(TextBundle::from_section(
                    format!("  📖 {} vocabulary word(s)", template.vocabulary.len()),
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.7, 0.8, 0.9),
                        ..default()
                    },
                ));
            }

            if !template.flags.is_empty() {
                details.spawn(TextBundle::from_section(
                    format!("  🚩 {} flag(s)", template.flags.len()),
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.7, 0.8, 0.9),
                        ..default()
                    },
                ));
            }
        });
    });
}

/// Handle insert template button clicks
pub fn handle_insert_template_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<(&Interaction, &InsertTemplateButton), Changed<Interaction>>,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Inserting template: {}", button.template_id);

            // Find the template
            let template = TemplateLibrary::all_templates()
                .into_iter()
                .find(|t| t.id == button.template_id);

            if let Some(template) = template {
                insert_template(&mut state, &template);
            }
        }
    }
}

/// Insert a template into the game
fn insert_template(state: &mut BuilderState, template: &GameTemplate) {
    info!("Inserting template: {}", template.name);

    // Get next IDs
    let next_object_id = state.current_game.objects.iter()
        .map(|o| o.id)
        .max()
        .map_or(0, |max| max + 1);

    let next_flag_id = state.current_game.flags.iter()
        .map(|f| f.id)
        .max()
        .map_or(1, |max| max + 1); // Start from 1 to avoid system flags

    let next_vocab_id = state.current_game.vocabulary.iter()
        .map(|v| v.id)
        .max()
        .map_or(1, |max| max + 1);

    // Insert objects
    for (idx, obj_template) in template.objects.iter().enumerate() {
        let obj_id = next_object_id + idx as u8;
        state.current_game.objects.push(crate::daad::types::Object {
            id: obj_id,
            name: obj_template.name.clone(),
            description: obj_template.description.clone(),
            noun: obj_template.noun.clone(),
            adjective: obj_template.adjective.clone(),
            location: obj_template.location.clone(),
            weight: obj_template.weight,
            is_container: obj_template.is_container,
            is_wearable: obj_template.is_wearable,
            is_takeable: obj_template.is_takeable,
            icon: obj_template.icon.clone(),
        });
    }

    // Insert flags
    for (idx, flag_template) in template.flags.iter().enumerate() {
        let flag_id = next_flag_id + idx as u8;
        state.current_game.flags.push(crate::daad::types::Flag {
            id: flag_id,
            name: flag_template.name.clone(),
            description: flag_template.description.clone(),
            initial_value: flag_template.initial_value,
        });
    }

    // Insert vocabulary (with ID assignment and deduplication)
    for vocab_template in &template.vocabulary {
        // Check if word already exists
        let exists = state.current_game.vocabulary.iter()
            .any(|v| v.word.eq_ignore_ascii_case(&vocab_template.word) && v.word_type == vocab_template.word_type);

        if !exists {
            let vocab_id = state.current_game.vocabulary.iter()
                .filter(|v| v.word_type == vocab_template.word_type)
                .map(|v| v.id)
                .max()
                .map_or(next_vocab_id, |max| max + 1);

            state.current_game.vocabulary.push(crate::daad::game::VocabEntry {
                word: vocab_template.word.clone(),
                word_type: vocab_template.word_type,
                id: vocab_id,
                translations: std::collections::HashMap::new(),
            });
        }
    }

    // Insert rules (with ID remapping)
    for rule_template in &template.rules {
        let rule_id = state.current_game.rules.len();

        // Remap object/flag IDs in conditions and actions
        let conditions: Vec<crate::daad::types::Condition> = rule_template.conditions.iter()
            .enumerate()
            .map(|(idx, cond)| {
                let remapped_cond = remap_condition_ids(cond, next_object_id, next_flag_id);
                crate::daad::types::Condition {
                    id: idx,
                    condition_type: remapped_cond,
                }
            })
            .collect();

        let actions: Vec<crate::daad::types::Action> = rule_template.actions.iter()
            .enumerate()
            .map(|(idx, action)| {
                let remapped_action = remap_action_ids(action, next_object_id, next_flag_id);
                crate::daad::types::Action {
                    id: idx,
                    action_type: remapped_action,
                }
            })
            .collect();

        state.current_game.rules.push(crate::daad::types::Rule {
            id: rule_id,
            name: rule_template.name.clone(),
            process: rule_template.process,
            conditions,
            actions,
            enabled: true,
            verb: None,
            noun: None,
            label: None,
            editor_position: bevy::math::Vec2::new(100.0, 100.0 + (rule_id as f32 * 50.0)),
        });
    }

    state.mark_dirty();
    info!("Template '{}' inserted successfully!", template.name);
}

/// Remap object and flag IDs in conditions
fn remap_condition_ids(
    cond: &crate::daad::types::ConditionType,
    object_id_offset: u8,
    flag_id_offset: u8,
) -> crate::daad::types::ConditionType {
    use crate::daad::types::ConditionType;

    match cond {
        ConditionType::ObjectPresent { object_id } => {
            ConditionType::ObjectPresent { object_id: object_id + object_id_offset }
        }
        ConditionType::ObjectAbsent { object_id } => {
            ConditionType::ObjectAbsent { object_id: object_id + object_id_offset }
        }
        ConditionType::ObjectCarried { object_id } => {
            ConditionType::ObjectCarried { object_id: object_id + object_id_offset }
        }
        ConditionType::ObjectNotCarried { object_id } => {
            ConditionType::ObjectNotCarried { object_id: object_id + object_id_offset }
        }
        ConditionType::FlagZero { flag_id } => {
            ConditionType::FlagZero { flag_id: flag_id + flag_id_offset }
        }
        ConditionType::FlagNotZero { flag_id } => {
            ConditionType::FlagNotZero { flag_id: flag_id + flag_id_offset }
        }
        ConditionType::FlagEquals { flag_id, value } => {
            ConditionType::FlagEquals { flag_id: flag_id + flag_id_offset, value: *value }
        }
        ConditionType::FlagGreaterThan { flag_id, value } => {
            ConditionType::FlagGreaterThan { flag_id: flag_id + flag_id_offset, value: *value }
        }
        ConditionType::FlagLessThan { flag_id, value } => {
            ConditionType::FlagLessThan { flag_id: flag_id + flag_id_offset, value: *value }
        }
        _ => cond.clone(), // No remapping needed
    }
}

/// Remap object and flag IDs in actions
fn remap_action_ids(
    action: &crate::daad::types::ActionType,
    object_id_offset: u8,
    flag_id_offset: u8,
) -> crate::daad::types::ActionType {
    use crate::daad::types::ActionType;

    match action {
        ActionType::GetObject { object_id } => {
            ActionType::GetObject { object_id: object_id + object_id_offset }
        }
        ActionType::DropObject { object_id } => {
            ActionType::DropObject { object_id: object_id + object_id_offset }
        }
        ActionType::DestroyObject { object_id } => {
            ActionType::DestroyObject { object_id: object_id + object_id_offset }
        }
        ActionType::SetBit { flag_id } => {
            ActionType::SetBit { flag_id: flag_id + flag_id_offset }
        }
        ActionType::ClearFlag { flag_id } => {
            ActionType::ClearFlag { flag_id: flag_id + flag_id_offset }
        }
        ActionType::AddToFlag { flag_id, value } => {
            ActionType::AddToFlag { flag_id: flag_id + flag_id_offset, value: *value }
        }
        ActionType::SubtractFromFlag { flag_id, value } => {
            ActionType::SubtractFromFlag { flag_id: flag_id + flag_id_offset, value: *value }
        }
        ActionType::SetFlag { flag_id, value } => {
            ActionType::SetFlag { flag_id: flag_id + flag_id_offset, value: *value }
        }
        ActionType::CopyFlag { dest_flag, source_flag } => {
            ActionType::CopyFlag {
                dest_flag: dest_flag + flag_id_offset,
                source_flag: source_flag + flag_id_offset
            }
        }
        _ => action.clone(), // No remapping needed
    }
}
