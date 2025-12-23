use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::game::{Sound, SoundType};

#[derive(Component)]
pub struct AddSoundButton;

#[derive(Component)]
pub struct RemoveSoundButton {
    pub sound_id: u8,
}

#[derive(Component)]
pub struct EditSoundButton {
    pub sound_id: u8,
}

/// Renders the sound library panel
pub fn render_sound_panel(parent: &mut ChildBuilder, state: &BuilderState) {
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
            "🔊 Sound & Music Library",
            TextStyle {
                font_size: 28.0,
                color: Color::rgb(0.9, 0.95, 1.0),
                ..default()
            },
        ));

        // Info text
        panel.spawn(TextBundle::from_section(
            "Manage sound effects and music for your game. Sounds can be triggered by rules using PlaySound actions.",
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.8),
                ..default()
            },
        ));

        // Sound count and add button row
        panel.spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Row,
                justify_content: JustifyContent::SpaceBetween,
                align_items: AlignItems::Center,
                padding: UiRect::all(Val::Px(12.0)),
                ..default()
            },
            background_color: Color::rgba(0.15, 0.15, 0.2, 0.8).into(),
            ..default()
        })
        .with_children(|row| {
            // Sound count
            row.spawn(TextBundle::from_section(
                format!("Sounds: {}/255", state.current_game.sounds.len()),
                TextStyle {
                    font_size: 18.0,
                    color: if state.current_game.sounds.len() > 200 {
                        Color::rgb(1.0, 0.4, 0.4) // Red
                    } else if state.current_game.sounds.len() > 150 {
                        Color::rgb(1.0, 0.8, 0.3) // Yellow
                    } else {
                        Color::rgb(0.5, 1.0, 0.5) // Green
                    },
                    ..default()
                },
            ));

            // Add sound button
            row.spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(12.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.3, 0.6, 0.4).into(),
                    ..default()
                },
                AddSoundButton,
            ))
            .with_children(|button| {
                button.spawn(TextBundle::from_section(
                    "➕ Add Sound",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });
        });

        // Sound effects section
        render_sound_type_section(panel, &state.current_game.sounds, SoundType::Effect);

        // Music section
        render_sound_type_section(panel, &state.current_game.sounds, SoundType::Music);

        // Beeps section
        render_sound_type_section(panel, &state.current_game.sounds, SoundType::Beep);
    });
}

fn render_sound_type_section(parent: &mut ChildBuilder, sounds: &[Sound], sound_type: SoundType) {
    let type_sounds: Vec<&Sound> = sounds.iter()
        .filter(|s| s.sound_type == sound_type)
        .collect();

    if type_sounds.is_empty() && sound_type != SoundType::Effect {
        return; // Don't show empty sections except for effects
    }

    let (title, icon, color) = match sound_type {
        SoundType::Effect => ("Sound Effects", "🔔", Color::rgb(0.7, 0.9, 0.7)),
        SoundType::Music => ("Music", "🎵", Color::rgb(0.7, 0.7, 0.9)),
        SoundType::Beep => ("Beeps & Tones", "📢", Color::rgb(0.9, 0.9, 0.7)),
    };

    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            row_gap: Val::Px(8.0),
            ..default()
        },
        ..default()
    })
    .with_children(|section| {
        // Section header
        section.spawn(TextBundle::from_section(
            format!("{} {} ({})", icon, title, type_sounds.len()),
            TextStyle {
                font_size: 20.0,
                color,
                ..default()
            },
        ));

        if type_sounds.is_empty() {
            // Empty state
            section.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(16.0)),
                    ..default()
                },
                background_color: Color::rgba(0.15, 0.15, 0.2, 0.5).into(),
                ..default()
            })
            .with_children(|empty| {
                empty.spawn(TextBundle::from_section(
                    "No sounds added yet. Click 'Add Sound' to get started!",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.6, 0.6, 0.7),
                        ..default()
                    },
                ));
            });
        } else {
            // Sound grid
            section.spawn(NodeBundle {
                style: Style {
                    display: Display::Grid,
                    grid_template_columns: RepeatedGridTrack::flex(2, 1.0),
                    column_gap: Val::Px(12.0),
                    row_gap: Val::Px(10.0),
                    ..default()
                },
                ..default()
            })
            .with_children(|grid| {
                for sound in type_sounds {
                    render_sound_card(grid, sound);
                }
            });
        }
    });
}

fn render_sound_card(parent: &mut ChildBuilder, sound: &Sound) {
    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            padding: UiRect::all(Val::Px(12.0)),
            row_gap: Val::Px(8.0),
            ..default()
        },
        background_color: Color::rgba(0.2, 0.2, 0.3, 0.8).into(),
        ..default()
    })
    .with_children(|card| {
        // Header row with name and buttons
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
            // Sound name and ID
            header.spawn(TextBundle::from_section(
                format!("[{}] {}", sound.id, sound.name),
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            // Button row
            header.spawn(NodeBundle {
                style: Style {
                    flex_direction: FlexDirection::Row,
                    column_gap: Val::Px(6.0),
                    ..default()
                },
                ..default()
            })
            .with_children(|buttons| {
                // Edit button
                buttons.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(8.0), Val::Px(6.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                        ..default()
                    },
                    EditSoundButton { sound_id: sound.id },
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "✏️",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

                // Remove button
                buttons.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(8.0), Val::Px(6.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.7, 0.3, 0.3).into(),
                        ..default()
                    },
                    RemoveSoundButton { sound_id: sound.id },
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "❌",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
            });
        });

        // Description
        if !sound.description.is_empty() {
            card.spawn(TextBundle::from_section(
                &sound.description,
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.7, 0.7, 0.8),
                    ..default()
                },
            ));
        }

        // File info
        if let Some(web_file) = &sound.web_file {
            card.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgba(0.1, 0.1, 0.15, 0.8).into(),
                ..default()
            })
            .with_children(|file_info| {
                file_info.spawn(TextBundle::from_section(
                    format!("📁 {}", web_file),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.6, 0.8, 0.9),
                        ..default()
                    },
                ));
            });
        }

        // Platform files count
        if !sound.platform_files.is_empty() {
            card.spawn(TextBundle::from_section(
                format!("💾 {} platform-specific files", sound.platform_files.len()),
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.6, 0.7),
                    ..default()
                },
            ));
        }
    });
}

/// Handle add sound button click
pub fn handle_add_sound_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<AddSoundButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Add Sound button clicked - sound upload dialog coming soon!");

            // For now, add a placeholder sound
            let next_id = state.current_game.sounds
                .iter()
                .map(|s| s.id)
                .max()
                .map_or(0, |max_id| max_id + 1);

            state.current_game.sounds.push(Sound {
                id: next_id,
                name: format!("sound_{}", next_id),
                description: "New sound effect".to_string(),
                sound_type: SoundType::Effect,
                web_file: None,
                platform_files: std::collections::HashMap::new(),
            });

            state.mark_dirty();
            info!("Added placeholder sound with ID {}", next_id);
        }
    }
}

/// Handle remove sound button click
pub fn handle_remove_sound_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<(&Interaction, &RemoveSoundButton), Changed<Interaction>>,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            state.current_game.sounds.retain(|s| s.id != button.sound_id);
            state.mark_dirty();
            info!("Removed sound with ID {}", button.sound_id);
        }
    }
}

/// Handle edit sound button click
pub fn handle_edit_sound_button(
    state: Res<BuilderState>,
    mut sound_editor: ResMut<crate::builder::ui::components::SoundEditorModalState>,
    mut interaction_query: Query<(&Interaction, &EditSoundButton), Changed<Interaction>>,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(sound) = state.current_game.sounds.iter().find(|s| s.id == button.sound_id) {
                sound_editor.open(sound);
                info!("Opened sound editor for ID {}", button.sound_id);
            }
        }
    }
}
