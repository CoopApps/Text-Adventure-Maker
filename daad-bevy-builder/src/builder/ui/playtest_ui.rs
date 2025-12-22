use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::interpreter::InterpreterState;

/// Playtest state resource - holds the running game interpreter
#[derive(Resource)]
pub struct PlaytestState {
    pub interpreter: Option<InterpreterState>,
    pub current_input: String,
}

impl Default for PlaytestState {
    fn default() -> Self {
        Self {
            interpreter: None,
            current_input: String::new(),
        }
    }
}

#[derive(Component)]
pub struct PlaytestPanel;

#[derive(Component)]
pub struct StartPlaytestButton;

#[derive(Component)]
pub struct ResetPlaytestButton;

#[derive(Component)]
pub struct CommandInputField;

#[derive(Component)]
pub struct SubmitCommandButton;

#[derive(Component)]
pub struct OutputText;

/// Render the playtest panel (enhanced Preview panel)
pub fn render_playtest_panel(parent: &mut ChildBuilder, state: &BuilderState, playtest: &PlaytestState) {
    parent.spawn(NodeBundle {
        style: Style {
            width: Val::Percent(100.0),
            height: Val::Percent(100.0),
            flex_direction: FlexDirection::Column,
            padding: UiRect::all(Val::Px(20.0)),
            row_gap: Val::Px(12.0),
            overflow: Overflow::clip_y(),
            ..default()
        },
        background_color: Color::rgba(0.05, 0.05, 0.1, 0.95).into(),
        ..default()
    })
    .with_children(|panel| {
        // Header
        panel.spawn(TextBundle::from_section(
            "🧪 Live Playtest - Test Your Game",
            TextStyle {
                font_size: 28.0,
                color: Color::rgb(0.9, 0.95, 1.0),
                ..default()
            },
        ));

        // Game info
        panel.spawn(TextBundle::from_section(
            format!("Testing: {} by {}", state.current_game.title, state.current_game.author),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.8, 0.9),
                ..default()
            },
        ));

        // Control buttons row
        panel.spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Row,
                column_gap: Val::Px(10.0),
                padding: UiRect::all(Val::Px(8.0)),
                ..default()
            },
            ..default()
        })
        .with_children(|controls| {
            if playtest.interpreter.is_none() {
                // Start button
                controls.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.7, 0.4).into(),
                        ..default()
                    },
                    StartPlaytestButton,
                ))
                .with_children(|button| {
                    button.spawn(TextBundle::from_section(
                        "▶ Start Playtest",
                        TextStyle {
                            font_size: 16.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
            } else {
                // Reset button
                controls.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.7, 0.5, 0.3).into(),
                        ..default()
                    },
                    ResetPlaytestButton,
                ))
                .with_children(|button| {
                    button.spawn(TextBundle::from_section(
                        "🔄 Reset Game",
                        TextStyle {
                            font_size: 16.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
            }
        });

        if let Some(interpreter) = &playtest.interpreter {
            // Output area (scrollable game text)
            panel.spawn(NodeBundle {
                style: Style {
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(16.0)),
                    max_height: Val::Px(400.0),
                    overflow: Overflow::clip_y(),
                    ..default()
                },
                background_color: Color::rgba(0.1, 0.1, 0.15, 0.9).into(),
                ..default()
            })
            .with_children(|output_area| {
                // Display all output lines
                for line in &interpreter.output {
                    output_area.spawn((
                        TextBundle::from_section(
                            line,
                            TextStyle {
                                font_size: 14.0,
                                color: Color::rgb(0.9, 0.95, 1.0),
                                ..default()
                            },
                        ),
                        OutputText,
                    ));
                }
            });

            // Command input area
            panel.spawn(NodeBundle {
                style: Style {
                    flex_direction: FlexDirection::Column,
                    row_gap: Val::Px(8.0),
                    padding: UiRect::all(Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgba(0.15, 0.15, 0.2, 0.8).into(),
                ..default()
            })
            .with_children(|input_area| {
                input_area.spawn(TextBundle::from_section(
                    "> Enter command:",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.7, 0.9, 0.7),
                        ..default()
                    },
                ));

                // Input field (placeholder - real text input needs a plugin or custom implementation)
                input_area.spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Row,
                        column_gap: Val::Px(8.0),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|input_row| {
                    // Text display showing current input
                    input_row.spawn((
                        TextBundle::from_section(
                            if playtest.current_input.is_empty() {
                                "_".to_string()
                            } else {
                                playtest.current_input.clone()
                            },
                            TextStyle {
                                font_size: 16.0,
                                color: Color::rgb(1.0, 1.0, 1.0),
                                ..default()
                            },
                        ),
                        CommandInputField,
                    ));
                });

                // Quick command buttons
                input_area.spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Row,
                        column_gap: Val::Px(6.0),
                        flex_wrap: FlexWrap::Wrap,
                        row_gap: Val::Px(6.0),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|quick_commands| {
                    for cmd in &["look", "inventory", "north", "south", "east", "west"] {
                        quick_commands.spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(8.0)),
                                    ..default()
                                },
                                background_color: Color::rgb(0.3, 0.4, 0.5).into(),
                                ..default()
                            },
                            SubmitCommandButton,
                            QuickCommand { command: cmd.to_string() },
                        ))
                        .with_children(|btn| {
                            btn.spawn(TextBundle::from_section(
                                *cmd,
                                TextStyle {
                                    font_size: 12.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });
                    }
                });
            });

            // Debug info panel
            panel.spawn(NodeBundle {
                style: Style {
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(12.0)),
                    row_gap: Val::Px(4.0),
                    ..default()
                },
                background_color: Color::rgba(0.2, 0.2, 0.25, 0.7).into(),
                ..default()
            })
            .with_children(|debug| {
                debug.spawn(TextBundle::from_section(
                    "🔍 Debug Info",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.9, 0.8, 0.6),
                        ..default()
                    },
                ));

                // Current location
                if let Some(loc) = interpreter.get_current_location() {
                    debug.spawn(TextBundle::from_section(
                        format!("📍 Location {}: {}", loc.id, loc.name),
                        TextStyle {
                            font_size: 12.0,
                            color: Color::rgb(0.8, 0.8, 0.9),
                            ..default()
                        },
                    ));
                }

                // Turns
                debug.spawn(TextBundle::from_section(
                    format!("🕐 Turns: {}", interpreter.turn_count),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.8, 0.8, 0.9),
                        ..default()
                    },
                ));

                // Score
                let score = interpreter.get_flag(30);
                debug.spawn(TextBundle::from_section(
                    format!("⭐ Score: {}", score),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.8, 0.8, 0.9),
                        ..default()
                    },
                ));

                // Inventory count
                let inventory = interpreter.get_carried_objects();
                debug.spawn(TextBundle::from_section(
                    format!("🎒 Carrying: {} items", inventory.len()),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.8, 0.8, 0.9),
                        ..default()
                    },
                ));
            });

        } else {
            // Not started yet
            panel.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(40.0)),
                    justify_content: JustifyContent::Center,
                    align_items: AlignItems::Center,
                    ..default()
                },
                ..default()
            })
            .with_children(|placeholder| {
                placeholder.spawn(TextBundle::from_section(
                    "Click 'Start Playtest' to test your game with the full DAAD interpreter.\n\n\
                    This will execute your rules, process commands, and track game state in real-time.",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.6, 0.7, 0.8),
                        ..default()
                    },
                ));
            });
        }
    });
}

#[derive(Component, Clone)]
pub struct QuickCommand {
    pub command: String,
}

/// Handle start playtest button
pub fn handle_start_playtest_button(
    mut playtest: ResMut<PlaytestState>,
    state: Res<BuilderState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<StartPlaytestButton>)>,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            info!("Starting playtest...");
            let interpreter = InterpreterState::new(state.current_game.clone());
            playtest.interpreter = Some(interpreter);
        }
    }
}

/// Handle reset playtest button
pub fn handle_reset_playtest_button(
    mut playtest: ResMut<PlaytestState>,
    state: Res<BuilderState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<ResetPlaytestButton>)>,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            info!("Resetting playtest...");
            let interpreter = InterpreterState::new(state.current_game.clone());
            playtest.interpreter = Some(interpreter);
            playtest.current_input.clear();
        }
    }
}

/// Handle quick command buttons
pub fn handle_quick_command_button(
    mut playtest: ResMut<PlaytestState>,
    mut interaction_query: Query<(&Interaction, &QuickCommand), Changed<Interaction>>,
) {
    for (interaction, quick_cmd) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Quick command: {}", quick_cmd.command);
            if let Some(interpreter) = &mut playtest.interpreter {
                interpreter.process_command(&quick_cmd.command);
            }
        }
    }
}

/// Handle keyboard input for command entry (simplified - use quick command buttons for now)
pub fn handle_keyboard_input(
    _playtest: ResMut<PlaytestState>,
) {
    // NOTE: Keyboard text input in Bevy is complex and requires additional plugins
    // For now, players can use the quick command buttons to test the game
    // Future enhancement: Add proper text input field support
}
