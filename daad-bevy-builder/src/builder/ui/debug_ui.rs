use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::builder::debug::DebugState;

/// Render the debug panel
pub fn render_debug_panel(parent: &mut ChildBuilder, state: &BuilderState, debug: &DebugState) {
    parent.spawn(TextBundle::from_section(
        "🔍 Debug Tools",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nStep through rule execution, set breakpoints, and watch flag values in real-time.",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Debug controls
    parent.spawn(TextBundle::from_section(
        "\n\n⚙️ Debug Controls:",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.9),
            ..default()
        },
    ));

    // Enable/Disable debug mode
    let debug_status = if debug.enabled {
        format!("✅ Debug Mode: ENABLED (Paused: {})", if debug.paused { "YES" } else { "NO" })
    } else {
        "❌ Debug Mode: DISABLED".to_string()
    };

    parent.spawn(TextBundle::from_section(
        format!("\n{}", debug_status),
        TextStyle {
            font_size: 14.0,
            color: if debug.enabled {
                Color::rgb(0.4, 1.0, 0.4)
            } else {
                Color::rgb(0.6, 0.6, 0.6)
            },
            ..default()
        },
    ));

    // Control buttons
    parent
        .spawn(NodeBundle {
            style: Style {
                display: Display::Grid,
                grid_template_columns: RepeatedGridTrack::flex(3, 1.0),
                column_gap: Val::Px(8.0),
                row_gap: Val::Px(8.0),
                margin: UiRect::top(Val::Px(12.0)),
                ..default()
            },
            ..default()
        })
        .with_children(|grid| {
            // Toggle debug button
            grid.spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(10.0)),
                        border: UiRect::all(Val::Px(2.0)),
                        ..default()
                    },
                    background_color: if debug.enabled {
                        Color::rgb(0.3, 0.7, 0.3)
                    } else {
                        Color::rgb(0.4, 0.4, 0.5)
                    }
                    .into(),
                    border_color: Color::rgb(0.5, 0.5, 0.6).into(),
                    ..default()
                },
                ToggleDebugButton,
            ))
            .with_children(|btn| {
                btn.spawn(TextBundle::from_section(
                    if debug.enabled {
                        "🔍 Disable Debug"
                    } else {
                        "🔍 Enable Debug"
                    },
                    TextStyle {
                        font_size: 13.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });

            if debug.enabled {
                // Continue button
                grid.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.8).into(),
                        border_color: Color::rgb(0.4, 0.7, 0.9).into(),
                        ..default()
                    },
                    ContinueButton,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "▶️ Continue",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

                // Step over button
                grid.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.6, 0.5, 0.3).into(),
                        border_color: Color::rgb(0.7, 0.6, 0.4).into(),
                        ..default()
                    },
                    StepOverButton,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "⏭️ Step Over",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

                // Step into button
                grid.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.6, 0.4, 0.5).into(),
                        border_color: Color::rgb(0.7, 0.5, 0.6).into(),
                        ..default()
                    },
                    StepIntoButton,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "⤵️ Step Into",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

                // Clear trace button
                grid.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                        border_color: Color::rgb(0.6, 0.4, 0.4).into(),
                        ..default()
                    },
                    ClearTraceButton,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "🗑️ Clear Trace",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
            }
        });

    if debug.enabled {
        // Breakpoints section
        render_breakpoints_section(parent, state, debug);

        // Watched flags section
        render_watched_flags_section(parent, state, debug);

        // Execution trace
        render_execution_trace(parent, debug);
    }
}

fn render_breakpoints_section(parent: &mut ChildBuilder, state: &BuilderState, debug: &DebugState) {
    parent.spawn(TextBundle::from_section(
        "\n\n🔴 Breakpoints:",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.9),
            ..default()
        },
    ));

    if debug.breakpoints.is_empty() {
        parent.spawn(TextBundle::from_section(
            "\n  No breakpoints set. Click on a rule to add one.",
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    } else {
        for &rule_id in &debug.breakpoints {
            if let Some(rule) = state.current_game.rules.iter().find(|r| r.id == rule_id) {
                parent.spawn(TextBundle::from_section(
                    format!("\n  • Rule #{}: {}", rule.id, rule.name),
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(1.0, 0.5, 0.5),
                        ..default()
                    },
                ));
            }
        }
    }

    // Show all rules for adding breakpoints
    parent.spawn(TextBundle::from_section(
        "\n\n📜 All Rules (click to toggle breakpoint):",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.9),
            ..default()
        },
    ));

    for rule in state.current_game.rules.iter().take(10) {
        let has_breakpoint = debug.breakpoints.contains(&rule.id);
        let prefix = if has_breakpoint { "🔴" } else { "⚪" };

        parent
            .spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(6.0)),
                        margin: UiRect::top(Val::Px(4.0)),
                        border: UiRect::all(Val::Px(1.0)),
                        ..default()
                    },
                    background_color: if has_breakpoint {
                        Color::rgb(0.4, 0.2, 0.2)
                    } else {
                        Color::rgb(0.2, 0.2, 0.25)
                    }
                    .into(),
                    border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                    ..default()
                },
                ToggleBreakpointButton { rule_id: rule.id },
            ))
            .with_children(|btn| {
                btn.spawn(TextBundle::from_section(
                    format!("{} Rule #{}: {}", prefix, rule.id, rule.name),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.9, 0.9, 0.9),
                        ..default()
                    },
                ));
            });
    }

    if state.current_game.rules.len() > 10 {
        parent.spawn(TextBundle::from_section(
            format!("\n  ... and {} more rules", state.current_game.rules.len() - 10),
            TextStyle {
                font_size: 11.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    }
}

fn render_watched_flags_section(parent: &mut ChildBuilder, state: &BuilderState, debug: &DebugState) {
    parent.spawn(TextBundle::from_section(
        "\n\n👁️ Watched Flags:",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.9),
            ..default()
        },
    ));

    if debug.watched_flags.is_empty() {
        parent.spawn(TextBundle::from_section(
            "\n  No flags being watched. Click on a flag to watch it.",
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    } else {
        for &flag_id in &debug.watched_flags {
            if let Some(flag) = state.current_game.flags.iter().find(|f| f.id == flag_id) {
                let history = debug.get_flag_history(flag_id);
                let changes = history.map(|h| h.len()).unwrap_or(0);

                parent.spawn(TextBundle::from_section(
                    format!(
                        "\n  • Flag {}: {} (initial: {}, {} changes)",
                        flag.id, flag.name, flag.initial_value, changes
                    ),
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.5, 0.8, 1.0),
                        ..default()
                    },
                ));
            }
        }
    }

    // Show all flags for adding to watch list
    parent.spawn(TextBundle::from_section(
        "\n\n🚩 All Flags (click to toggle watch):",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.9),
            ..default()
        },
    ));

    for flag in state.current_game.flags.iter().take(10) {
        let is_watched = debug.watched_flags.contains(&flag.id);
        let prefix = if is_watched { "👁️" } else { "⚪" };

        parent
            .spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(6.0)),
                        margin: UiRect::top(Val::Px(4.0)),
                        border: UiRect::all(Val::Px(1.0)),
                        ..default()
                    },
                    background_color: if is_watched {
                        Color::rgb(0.2, 0.3, 0.4)
                    } else {
                        Color::rgb(0.2, 0.2, 0.25)
                    }
                    .into(),
                    border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                    ..default()
                },
                ToggleWatchFlagButton { flag_id: flag.id },
            ))
            .with_children(|btn| {
                btn.spawn(TextBundle::from_section(
                    format!(
                        "{} Flag {}: {} (init: {})",
                        prefix, flag.id, flag.name, flag.initial_value
                    ),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.9, 0.9, 0.9),
                        ..default()
                    },
                ));
            });
    }

    if state.current_game.flags.len() > 10 {
        parent.spawn(TextBundle::from_section(
            format!("\n  ... and {} more flags", state.current_game.flags.len() - 10),
            TextStyle {
                font_size: 11.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    }
}

fn render_execution_trace(parent: &mut ChildBuilder, debug: &DebugState) {
    parent.spawn(TextBundle::from_section(
        "\n\n📊 Execution Trace (last 10 steps):",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.9),
            ..default()
        },
    ));

    if debug.execution_trace.is_empty() {
        parent.spawn(TextBundle::from_section(
            "\n  No execution trace yet. Start playtesting to see execution history.",
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    } else {
        let recent = debug.get_recent_trace(10);
        for step in recent.iter().rev() {
            let status = if step.matched { "✅" } else { "⏭️" };

            parent.spawn(TextBundle::from_section(
                format!(
                    "\n{} Turn {} - Rule #{}: {}",
                    status, step.turn, step.rule_id, step.rule_name
                ),
                TextStyle {
                    font_size: 13.0,
                    color: if step.matched {
                        Color::rgb(0.5, 1.0, 0.5)
                    } else {
                        Color::rgb(0.7, 0.7, 0.7)
                    },
                    ..default()
                },
            ));

            if step.matched {
                parent.spawn(TextBundle::from_section(
                    format!(
                        "    {} conditions, {} actions",
                        step.conditions_evaluated.len(),
                        step.actions_executed.len()
                    ),
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }
        }
    }
}

// Button components
#[derive(Component)]
pub struct ToggleDebugButton;

#[derive(Component)]
pub struct ContinueButton;

#[derive(Component)]
pub struct StepOverButton;

#[derive(Component)]
pub struct StepIntoButton;

#[derive(Component)]
pub struct ClearTraceButton;

#[derive(Component)]
pub struct ToggleBreakpointButton {
    pub rule_id: usize,
}

#[derive(Component)]
pub struct ToggleWatchFlagButton {
    pub flag_id: u8,
}

// Event handlers
pub fn handle_toggle_debug_button(
    mut debug: ResMut<DebugState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<ToggleDebugButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            debug.enabled = !debug.enabled;
            if debug.enabled {
                info!("🔍 Debug mode ENABLED");
            } else {
                info!("Debug mode disabled");
                debug.paused = false;
            }
        }
    }
}

pub fn handle_continue_button(
    mut debug: ResMut<DebugState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<ContinueButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            debug.continue_execution();
            info!("▶️ Continuing execution");
        }
    }
}

pub fn handle_step_over_button(
    mut debug: ResMut<DebugState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<StepOverButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            debug.step_over();
            info!("⏭️ Step over");
        }
    }
}

pub fn handle_step_into_button(
    mut debug: ResMut<DebugState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<StepIntoButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            debug.step_into();
            info!("⤵️ Step into");
        }
    }
}

pub fn handle_clear_trace_button(
    mut debug: ResMut<DebugState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<ClearTraceButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            debug.clear_trace();
            info!("🗑️ Execution trace cleared");
        }
    }
}

pub fn handle_toggle_breakpoint_button(
    mut debug: ResMut<DebugState>,
    mut interaction_query: Query<
        (&Interaction, &ToggleBreakpointButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            debug.toggle_breakpoint(button.rule_id);
        }
    }
}

pub fn handle_toggle_watch_flag_button(
    mut debug: ResMut<DebugState>,
    mut interaction_query: Query<
        (&Interaction, &ToggleWatchFlagButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if debug.watched_flags.contains(&button.flag_id) {
                debug.unwatch_flag(button.flag_id);
            } else {
                debug.watch_flag(button.flag_id);
            }
        }
    }
}
