use bevy::prelude::*;
use crate::builder::state::{BuilderState, Panel};
use super::vocabulary_ui::render_vocabulary_panel;
use super::game_info_ui::render_game_info_panel;

/// Render the active panel content
pub fn render_active_panel(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<PanelContent>>,
) {
    // Clean up old panel content
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create panel content area
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    width: if state.show_code_viewer {
                        Val::Percent(60.0)
                    } else {
                        Val::Percent(100.0)
                    },
                    height: Val::Auto,
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    overflow: Overflow::clip_y(),
                    ..default()
                },
                background_color: Color::rgb(0.08, 0.08, 0.12).into(),
                ..default()
            },
            PanelContent,
        ))
        .with_children(|parent| {
            match state.selected_panel {
                Panel::GameInfo => render_game_info_panel(parent, &state),
                Panel::Locations => render_locations_panel(parent, &state),
                Panel::Objects => render_objects_panel(parent, &state),
                Panel::Rules => render_rules_panel(parent, &state),
                Panel::Flags => render_flags_panel(parent, &state),
                Panel::Vocabulary => render_vocabulary_panel(parent, &state),
                Panel::Graphics => render_graphics_panel(parent, &state),
                Panel::Messages => render_messages_panel(parent, &state),
                Panel::Preview => render_preview_panel(parent, &state),
                Panel::Export => render_export_panel(parent, &state),
            }
        });
}

fn render_locations_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "📍 Locations",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for location in &state.current_game.locations {
        parent.spawn(TextBundle::from_section(
            format!("\n{}: {}", location.id, location.name),
            TextStyle {
                font_size: 18.0,
                color: Color::rgb(0.8, 0.9, 1.0),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  {}", location.description),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.7),
                ..default()
            },
        ));

        if location.is_dark {
            parent.spawn(TextBundle::from_section(
                "  🌑 Dark Location",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.5, 0.5, 0.8),
                    ..default()
                },
            ));
        }
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Location (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_objects_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "📦 Objects",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for object in &state.current_game.objects {
        parent.spawn(TextBundle::from_section(
            format!(
                "\n{} {}: {} {}",
                object.icon, object.id, object.adjective, object.noun
            ),
            TextStyle {
                font_size: 18.0,
                color: Color::rgb(0.9, 0.9, 0.6),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  {}", object.description),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.7),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  Location: {:?}", object.location),
            TextStyle {
                font_size: 12.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Object (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_rules_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "⚙️ Rules",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for rule in &state.current_game.rules {
        parent.spawn(TextBundle::from_section(
            format!("\n{}: {} [{:?}]", rule.id, rule.name, rule.process),
            TextStyle {
                font_size: 18.0,
                color: if rule.enabled {
                    Color::rgb(0.8, 1.0, 0.8)
                } else {
                    Color::rgb(0.5, 0.5, 0.5)
                },
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  Conditions: {}", rule.conditions.len()),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.8, 1.0),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  Actions: {}", rule.actions.len()),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(1.0, 0.8, 0.7),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Rule (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_flags_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "🚩 Flags",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for flag in &state.current_game.flags {
        parent.spawn(TextBundle::from_section(
            format!("\nFlag {}: {}", flag.id, flag.name),
            TextStyle {
                font_size: 18.0,
                color: Color::rgb(1.0, 0.8, 0.6),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  {}", flag.description),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.7),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  Initial value: {}", flag.initial_value),
            TextStyle {
                font_size: 12.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Flag (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_graphics_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    use crate::daad::types::ActionType;
    use std::collections::HashSet;

    parent.spawn(TextBundle::from_section(
        "🖼️ Graphics & Pictures",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nGraphics in your adventure game:",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    // Find all pictures referenced in rules
    let mut picture_ids = HashSet::new();
    let mut xpicture_ids = HashSet::new();

    for rule in &state.current_game.rules {
        for action in &rule.actions {
            match &action.action_type {
                ActionType::Picture { picture_id } => {
                    picture_ids.insert(*picture_id);
                }
                ActionType::XPicture { picture_id } => {
                    xpicture_ids.insert(*picture_id);
                }
                _ => {}
            }
        }
    }

    // Regular DAAD Pictures
    if !picture_ids.is_empty() {
        parent.spawn(TextBundle::from_section(
            "\n📷 Regular Pictures (PICTURE)",
            TextStyle {
                font_size: 20.0,
                color: Color::rgb(0.7, 0.9, 1.0),
                ..default()
            },
        ));

        let mut sorted_pictures: Vec<_> = picture_ids.iter().collect();
        sorted_pictures.sort();

        for pic_id in sorted_pictures {
            parent.spawn(TextBundle::from_section(
                format!("  • Picture {} (standard graphics)", pic_id),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));
        }

        parent.spawn(TextBundle::from_section(
            format!("\n  Total: {} pictures", picture_ids.len()),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.6, 0.8, 1.0),
                ..default()
            },
        ));
    }

    // MALUVA Extended Pictures
    if !xpicture_ids.is_empty() {
        parent.spawn(TextBundle::from_section(
            "\n🎨 MALUVA Pictures (XPICTURE)",
            TextStyle {
                font_size: 20.0,
                color: Color::rgb(0.9, 0.7, 1.0),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            "  (Extended graphics with MALUVA module)",
            TextStyle {
                font_size: 12.0,
                color: Color::rgb(0.6, 0.6, 0.7),
                ..default()
            },
        ));

        let mut sorted_xpictures: Vec<_> = xpicture_ids.iter().collect();
        sorted_xpictures.sort();

        for pic_id in sorted_xpictures {
            parent.spawn(TextBundle::from_section(
                format!("  • Picture {} (MALUVA extended)", pic_id),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));
        }

        parent.spawn(TextBundle::from_section(
            format!("\n  Total: {} MALUVA pictures", xpicture_ids.len()),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.9, 0.7, 1.0),
                ..default()
            },
        ));
    }

    if picture_ids.is_empty() && xpicture_ids.is_empty() {
        parent.spawn(TextBundle::from_section(
            "\nNo pictures currently used in this game.",
            TextStyle {
                font_size: 16.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            "\nTo add pictures, use:",
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.7),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            "  • PICTURE action for standard graphics",
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            "  • XPICTURE action for MALUVA extended graphics",
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n\n💡 Graphics Info:",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.9, 0.9, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • DAAD supports 0-255 picture slots",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • MALUVA (Module 36) adds extended graphics support",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Picture files vary by platform (PCX, SCR, etc.)",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));
}

fn render_messages_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "💬 Messages",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for (i, message) in state.current_game.messages.iter().enumerate() {
        parent.spawn(TextBundle::from_section(
            format!("\nMessage {}: {}", i, message),
            TextStyle {
                font_size: 16.0,
                color: Color::rgb(0.9, 0.9, 0.9),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Message (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_preview_panel(parent: &mut ChildBuilder, _state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "▶️ Game Preview",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nLive game preview will appear here.",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nPress F5 to toggle preview mode.",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.5, 0.5, 0.5),
            ..default()
        },
    ));
}

fn render_export_panel(parent: &mut ChildBuilder, _state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "💾 Export Game",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nExport Options:",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\n• DAAD Source Code (.txt)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "• DDB Database File (.ddb)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "• JSON Project File (.json)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\n[Export] buttons coming soon...",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.5, 0.5, 0.5),
            ..default()
        },
    ));
}

#[derive(Component)]
pub(crate) struct PanelContent;
