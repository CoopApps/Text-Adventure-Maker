use bevy::prelude::*;
use crate::builder::state::{BuilderState, Panel};
use crate::daad::codegen::DaadCodeGenerator;
use crate::launcher::{DaadLauncher, DrcTarget, DrcSubtarget};
use std::path::PathBuf;
use std::fs;

/// Render export panel
pub fn render_export_panel(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<ExportPanel>>,
) {
    // Only render when Export panel is active
    if state.selected_panel != Panel::Export {
        // Clean up when not active
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Clean up old panel
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create export panel
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Percent(95.0),
                    height: Val::Percent(70.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(15.0),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.12, 0.12, 0.18, 0.95).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            ExportPanel,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "💾 Export & Save",
                TextStyle {
                    font_size: 22.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Export your game to DAAD source code or save as JSON project",
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Separator
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(10.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            });

            // JSON Save Section
            parent.spawn(TextBundle::from_section(
                "📁 Save Project (JSON)",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Save your entire project as a JSON file to continue editing later",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));

            // Current file path display
            if let Some(path) = &state.current_file_path {
                parent.spawn(TextBundle::from_section(
                    format!("Current file: {}", path),
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.5, 0.7, 0.9),
                        ..default()
                    },
                ));
            } else {
                parent.spawn(TextBundle::from_section(
                    "No file currently loaded",
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }

            // Save JSON button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::vertical(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.8).into(),
                        border_color: Color::rgb(0.4, 0.7, 0.9).into(),
                        ..default()
                    },
                    SaveJsonButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "💾 SAVE PROJECT TO JSON",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Separator
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(15.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            });

            // DAAD Export Section
            parent.spawn(TextBundle::from_section(
                "📤 Export to DAAD Source Code",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Export your game as DAAD source code (.SCE) for compilation",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));

            // Game statistics
            parent.spawn(TextBundle::from_section(
                format!(
                    "Game stats: {} locations, {} objects, {} rules, {} flags, {} messages",
                    state.current_game.locations.len(),
                    state.current_game.objects.len(),
                    state.current_game.rules.len(),
                    state.current_game.flags.len(),
                    state.current_game.messages.len()
                ),
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.7, 0.8, 0.9),
                    ..default()
                },
            ));

            // Export DAAD button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::vertical(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.7, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.9, 0.4).into(),
                        ..default()
                    },
                    ExportDaadButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "📤 EXPORT TO DAAD SOURCE",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Preview DAAD code button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            margin: UiRect::bottom(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.4, 0.5).into(),
                        border_color: Color::rgb(0.5, 0.5, 0.6).into(),
                        ..default()
                    },
                    PreviewDaadButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "👁️ Preview DAAD Code (shows in code viewer)",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Separator
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(15.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            });

            // Build & Test Section
            parent.spawn(TextBundle::from_section(
                "🚀 Build & Test with DRC",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Compile your game with the DRC compiler and verify it works",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));

            // Platform selector
            parent.spawn(TextBundle::from_section(
                "Target Platform:",
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));

            // Platform selection grid
            parent
                .spawn(NodeBundle {
                    style: Style {
                        display: Display::Grid,
                        grid_template_columns: RepeatedGridTrack::flex(3, 1.0),
                        column_gap: Val::Px(8.0),
                        row_gap: Val::Px(8.0),
                        margin: UiRect::vertical(Val::Px(8.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|parent| {
                    // Helper function to create platform button
                    let create_platform_button = |parent: &mut ChildBuilder,
                                                   name: &str,
                                                   icon: &str,
                                                   target: DrcTarget,
                                                   is_selected: bool| {
                        let bg_color = if is_selected {
                            Color::rgb(0.4, 0.6, 0.4)
                        } else {
                            Color::rgb(0.3, 0.3, 0.35)
                        };
                        let border_color = if is_selected {
                            Color::rgb(0.6, 0.9, 0.6)
                        } else {
                            Color::rgb(0.4, 0.4, 0.45)
                        };

                        parent
                            .spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::all(Val::Px(8.0)),
                                        border: UiRect::all(Val::Px(2.0)),
                                        flex_direction: FlexDirection::Column,
                                        align_items: AlignItems::Center,
                                        justify_content: JustifyContent::Center,
                                        ..default()
                                    },
                                    background_color: bg_color.into(),
                                    border_color: border_color.into(),
                                    ..default()
                                },
                                PlatformButton { target },
                            ))
                            .with_children(|parent| {
                                parent.spawn(TextBundle::from_section(
                                    icon,
                                    TextStyle {
                                        font_size: 20.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                                parent.spawn(TextBundle::from_section(
                                    name,
                                    TextStyle {
                                        font_size: 10.0,
                                        color: Color::rgb(0.9, 0.9, 0.9),
                                        ..default()
                                    },
                                ));
                            });
                    };

                    let selected = state.target_platform;

                    // Row 1
                    create_platform_button(
                        parent,
                        "ZX Spectrum",
                        "💾",
                        DrcTarget::ZXSpectrum,
                        selected == DrcTarget::ZXSpectrum,
                    );
                    create_platform_button(
                        parent,
                        "Amstrad CPC",
                        "🖥️",
                        DrcTarget::AmstradCPC,
                        selected == DrcTarget::AmstradCPC,
                    );
                    create_platform_button(
                        parent,
                        "C64",
                        "🎮",
                        DrcTarget::Commodore64,
                        selected == DrcTarget::Commodore64,
                    );

                    // Row 2
                    create_platform_button(
                        parent,
                        "MSX",
                        "📼",
                        DrcTarget::MSX,
                        selected == DrcTarget::MSX,
                    );
                    create_platform_button(
                        parent,
                        "MSX2",
                        "📼",
                        DrcTarget::MSX2,
                        selected == DrcTarget::MSX2,
                    );
                    create_platform_button(
                        parent,
                        "PC",
                        "🖥️",
                        DrcTarget::PC,
                        selected == DrcTarget::PC,
                    );

                    // Row 3
                    create_platform_button(
                        parent,
                        "Amiga",
                        "💻",
                        DrcTarget::Amiga,
                        selected == DrcTarget::Amiga,
                    );
                    create_platform_button(
                        parent,
                        "Atari ST",
                        "🖥️",
                        DrcTarget::AtariST,
                        selected == DrcTarget::AtariST,
                    );
                    create_platform_button(
                        parent,
                        "HTML",
                        "🌐",
                        DrcTarget::HTML,
                        selected == DrcTarget::HTML,
                    );

                    // Row 4
                    create_platform_button(
                        parent,
                        "PCW",
                        "🖨️",
                        DrcTarget::PCW,
                        selected == DrcTarget::PCW,
                    );
                    create_platform_button(
                        parent,
                        "Plus/4",
                        "🎮",
                        DrcTarget::CommodorePlus4,
                        selected == DrcTarget::CommodorePlus4,
                    );
                });

            // Build & Test button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::vertical(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.7, 0.3, 0.7).into(),
                        border_color: Color::rgb(0.9, 0.4, 0.9).into(),
                        ..default()
                    },
                    BuildTestButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "🚀 BUILD & TEST",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Compilation output display
            if let Some(output) = &state.compilation_output {
                let bg_color = if state.compilation_success {
                    Color::rgba(0.2, 0.4, 0.2, 0.8)  // Green for success
                } else {
                    Color::rgba(0.4, 0.2, 0.2, 0.8)  // Red for errors
                };

                let title = if state.compilation_success {
                    "✅ Compilation Successful"
                } else {
                    "❌ Compilation Failed"
                };

                parent
                    .spawn(NodeBundle {
                        style: Style {
                            flex_direction: FlexDirection::Column,
                            padding: UiRect::all(Val::Px(10.0)),
                            margin: UiRect::vertical(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            max_height: Val::Px(200.0),
                            ..default()
                        },
                        background_color: bg_color.into(),
                        border_color: Color::rgb(0.5, 0.5, 0.5).into(),
                        ..default()
                    })
                    .with_children(|parent| {
                        // Title
                        parent.spawn(TextBundle::from_section(
                            title,
                            TextStyle {
                                font_size: 13.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));

                        // Output text
                        parent.spawn(TextBundle::from_section(
                            output,
                            TextStyle {
                                font_size: 11.0,
                                color: Color::rgb(0.9, 0.9, 0.9),
                                ..default()
                            },
                        ));
                    });
            }

            // Help text
            parent.spawn(TextBundle::from_section(
                "ℹ️ Files will be saved to: ./exports/",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.5, 0.6, 0.7),
                    ..default()
                },
            ));

            // Unsaved changes warning
            if state.unsaved_changes {
                parent.spawn(TextBundle::from_section(
                    "⚠️  You have unsaved changes! Remember to save your project.",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.9, 0.7, 0.3),
                        ..default()
                    },
                ));
            }
        });
}

/// Handle save JSON button
pub fn handle_save_json_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SaveJsonButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Create exports directory if it doesn't exist
            let _ = fs::create_dir_all("./exports");

            // Generate filename from game title
            let filename = state.current_game.title.replace(' ', "_").to_lowercase();
            let filepath = format!("./exports/{}.json", filename);

            // Serialize and save
            match serde_json::to_string_pretty(&state.current_game) {
                Ok(json) => {
                    match fs::write(&filepath, json) {
                        Ok(_) => {
                            state.current_file_path = Some(filepath.clone());
                            state.unsaved_changes = false;
                            info!("Project saved to: {}", filepath);
                        }
                        Err(e) => {
                            error!("Failed to write JSON file: {}", e);
                        }
                    }
                }
                Err(e) => {
                    error!("Failed to serialize game to JSON: {}", e);
                }
            }
        }
    }
}

/// Handle export DAAD button
pub fn handle_export_daad_button(
    state: Res<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<ExportDaadButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Create exports directory if it doesn't exist
            let _ = fs::create_dir_all("./exports");

            // Generate filename from game title
            let filename = state.current_game.title.replace(' ', "_").to_lowercase();
            let filepath = format!("./exports/{}.sce", filename);

            // Generate DAAD source code
            let daad_code = DaadCodeGenerator::generate(&state.current_game);

            // Write to file
            match fs::write(&filepath, daad_code) {
                Ok(_) => {
                    info!("DAAD source exported to: {}", filepath);
                }
                Err(e) => {
                    error!("Failed to write DAAD source file: {}", e);
                }
            }
        }
    }
}

/// Handle preview DAAD code button
pub fn handle_preview_daad_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<PreviewDaadButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Enable code viewer to show the generated code
            state.show_code_viewer = true;
            info!("DAAD code preview enabled - check code viewer (F1)");
        }
    }
}

/// Handle platform button clicks - switch target platform
pub fn handle_platform_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &PlatformButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Selected platform: {:?}", button.target);
            state.target_platform = button.target;

            // Set default subtarget based on platform
            state.target_subtarget = match button.target {
                DrcTarget::ZXSpectrum => Some(DrcSubtarget::ZXPlus3),
                DrcTarget::PC => Some(DrcSubtarget::PCVGA),
                DrcTarget::MSX2 => Some(DrcSubtarget::MSX2Mode("5_8".to_string())),
                _ => None,
            };
        }
    }
}

/// Handle Build & Test button - compile with DRC
pub fn handle_build_test_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<BuildTestButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            info!("🚀 Build & Test button pressed - starting DRC compilation");

            // Create exports directory
            let _ = fs::create_dir_all("./exports");

            // Generate filename from game title
            let filename = state.current_game.title.replace(' ', "_").to_lowercase();
            let sce_path = format!("./exports/{}.sce", filename);

            // Generate DAAD source code
            let daad_code = DaadCodeGenerator::generate(&state.current_game);

            // Write .sce file
            match fs::write(&sce_path, &daad_code) {
                Ok(_) => {
                    info!("✅ Generated .sce file: {}", sce_path);

                    // Try to compile with DRC
                    match DaadLauncher::auto_detect() {
                        Ok(launcher) => {
                            info!("✅ Found DRC compiler");

                            // Compile the .sce file
                            match launcher.compile_sce_with_output(
                                &PathBuf::from(&sce_path),
                                state.target_platform,
                                state.target_subtarget.clone(),
                                None,
                            ) {
                                Ok((json_path, output)) => {
                                    info!("✅ Compilation successful: {}", json_path.display());
                                    state.compilation_output = Some(output.combined_output());
                                    state.compilation_success = true;
                                }
                                Err(e) => {
                                    error!("❌ Compilation failed: {}", e);
                                    state.compilation_output = Some(format!("❌ Compilation Error:\n\n{}", e));
                                    state.compilation_success = false;
                                }
                            }
                        }
                        Err(e) => {
                            error!("❌ DRC not found: {}", e);
                            state.compilation_output = Some(format!(
                                "❌ DRC Compiler Not Found\n\n{}\n\nPlease ensure DRC is compiled at:\n../external/DRC/src/drc",
                                e
                            ));
                            state.compilation_success = false;
                        }
                    }
                }
                Err(e) => {
                    error!("❌ Failed to write .sce file: {}", e);
                    state.compilation_output = Some(format!("❌ File Write Error:\n\n{}", e));
                    state.compilation_success = false;
                }
            }
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct ExportPanel;

#[derive(Component)]
pub(crate) struct SaveJsonButton;

#[derive(Component)]
pub(crate) struct ExportDaadButton;

#[derive(Component)]
pub(crate) struct PreviewDaadButton;

#[derive(Component)]
pub(crate) struct BuildTestButton;

#[derive(Component)]
pub(crate) struct PlatformButton {
    pub target: DrcTarget,
}
