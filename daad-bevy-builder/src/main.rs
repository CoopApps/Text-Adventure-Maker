use bevy::prelude::*;

mod builder;
mod daad;
mod viewer;
mod preview;
mod launcher;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "DAAD Bevy Builder - Visual Adventure Creator".to_string(),
                resolution: (1600.0, 900.0).into(),
                ..default()
            }),
            ..default()
        }))
        .init_resource::<builder::state::BuilderState>()
        .init_resource::<builder::ui::playtest_ui::PlaytestState>()
        .init_resource::<builder::ui::dialogue_ui::DialogueEditorState>()
        .init_resource::<builder::ui::condition_action_modals::ConditionEditorState>()
        .init_resource::<builder::ui::condition_action_modals::ActionEditorState>()
        .init_resource::<builder::ui::components::TextInputModalState>()
        .init_resource::<builder::ui::components::ConfirmationModalState>()
        .init_resource::<builder::ui::vocabulary_ui::VocabularySearchState>()
        .init_resource::<builder::debug::DebugState>()
        .add_systems(Startup, setup)
        .add_systems(Update, (
            builder::ui::main_menu::render_menu,
            builder::ui::toolbar::render_toolbar,
            builder::ui::panels::render_active_panel,
            builder::ui::toolbar::handle_toolbar_clicks,
            viewer::code_display::render_code_viewer,
            handle_keyboard_shortcuts,
            auto_save_system,
            button_hover_system,
            render_help_overlay,
            render_status_bar,
        ))
        .add_systems(Update, (
            // Location editor systems
            builder::editors::location_editor::render_location_editor,
            builder::editors::location_editor::handle_location_node_clicks,
            builder::editors::location_editor::handle_add_location_button,
            builder::editors::location_editor::handle_edit_location_button,
            builder::editors::location_editor::handle_edit_location_properties_button,
            builder::editors::location_editor::handle_delete_location_button,
            builder::editors::location_editor::handle_location_drag,
            builder::editors::location_editor::handle_connection_creation,
            builder::editors::location_editor::render_connection_preview,
            builder::editors::location_editor::process_location_name_edit,
        ))
        .add_systems(Update, (
            // Object editor systems (sidebar and basic actions)
            builder::editors::object_editor::render_object_sidebar,
            builder::editors::object_editor::render_object_property_panel,
            builder::editors::object_editor::handle_add_object_button,
            builder::editors::object_editor::handle_edit_object_button,
            builder::editors::object_editor::handle_delete_object_button,
        ))
        .add_systems(Update, (
            // Object property panel systems
            builder::editors::object_editor::handle_edit_description_button,
            builder::editors::object_editor::handle_decrease_weight_button,
            builder::editors::object_editor::handle_increase_weight_button,
            builder::editors::object_editor::handle_toggle_container_button,
            builder::editors::object_editor::handle_toggle_wearable_button,
            builder::editors::object_editor::handle_toggle_takeable_button,
        ))
        .add_systems(Update, (
            // Rule editor systems
            builder::editors::rule_editor::render_rule_sidebar,
            builder::editors::rule_editor::render_rule_detail_editor,
            builder::editors::rule_editor::handle_rule_card_clicks,
            builder::editors::rule_editor::handle_add_rule_button,
            builder::editors::rule_editor::handle_add_condition_button,
            builder::editors::rule_editor::handle_add_action_button,
            builder::editors::rule_editor::handle_edit_condition_button,
            builder::editors::rule_editor::handle_delete_condition_button,
            builder::editors::rule_editor::handle_edit_action_button,
            builder::editors::rule_editor::handle_delete_action_button,
            builder::editors::rule_editor::handle_edit_rule_name_button,
            builder::editors::rule_editor::handle_toggle_rule_enabled_button,
            builder::editors::rule_editor::handle_process_table_button,
        ))
        .add_systems(Update, (
            // Rule reorder systems
            builder::editors::rule_editor::handle_move_condition_up_button,
            builder::editors::rule_editor::handle_move_condition_down_button,
            builder::editors::rule_editor::handle_move_action_up_button,
            builder::editors::rule_editor::handle_move_action_down_button,
        ))
        .add_systems(Update, (
            // Modal systems (text input, confirmation, condition/action)
            builder::ui::components::handle_close_modal_button,
            builder::ui::components::render_text_input_modal,
            builder::ui::components::handle_text_input_modal_keyboard,
            builder::ui::components::handle_text_input_modal_save,
            builder::ui::components::render_confirmation_modal,
            builder::ui::components::handle_confirm_button,
            builder::ui::components::handle_cancel_confirmation_button,
            builder::ui::condition_action_modals::render_condition_editor_modal,
            builder::ui::condition_action_modals::render_action_editor_modal,
            builder::ui::condition_action_modals::handle_condition_type_button,
            builder::ui::condition_action_modals::handle_action_type_button,
            builder::ui::condition_action_modals::handle_condition_param_buttons,
            builder::ui::condition_action_modals::handle_action_param_buttons,
            builder::ui::condition_action_modals::handle_save_condition_button,
            builder::ui::condition_action_modals::handle_save_action_button,
        ))
        .add_systems(Update, (
            // Flags and messages editor systems
            builder::editors::property_forms::render_flags_editor,
            builder::editors::property_forms::render_messages_editor,
            builder::editors::property_forms::handle_flag_card_clicks,
            builder::editors::property_forms::handle_message_card_clicks,
            builder::editors::property_forms::handle_add_flag_button,
            builder::editors::property_forms::handle_add_message_button,
            builder::editors::property_forms::handle_edit_flag_button,
            builder::editors::property_forms::handle_delete_flag_button,
            builder::editors::property_forms::process_confirmed_flag_deletion,
            builder::editors::property_forms::handle_edit_message_button,
            builder::editors::property_forms::handle_delete_message_button,
        ))
        .add_systems(Update, (
            // Preview/playtest systems
            preview::preview_ui::render_preview_panel,
            preview::preview_ui::handle_start_game_button,
            preview::preview_ui::handle_preview_command_buttons,
            preview::preview_ui::handle_reset_game_button,
        ))
        .add_systems(Update, (
            // Export systems
            builder::ui::export_ui::render_export_panel,
            builder::ui::export_ui::handle_save_json_button,
            builder::ui::export_ui::handle_load_recent_file_button,
            builder::ui::export_ui::handle_toggle_auto_save_button,
            builder::ui::export_ui::handle_export_daad_button,
            builder::ui::export_ui::handle_export_mobile_button,
            builder::ui::export_ui::handle_preview_daad_button,
            builder::ui::export_ui::handle_platform_button,
            builder::ui::export_ui::handle_build_test_button,
            builder::ui::export_ui::handle_play_in_browser_button,
        ))
        .add_systems(Update, (
            // Vocabulary systems
            builder::ui::vocabulary_ui::handle_add_word_button,
            builder::ui::vocabulary_ui::handle_remove_word_button,
            builder::ui::vocabulary_ui::handle_import_standard_vocabulary_button,
            builder::ui::vocabulary_ui::handle_word_type_filter_button,
            builder::ui::vocabulary_ui::handle_clear_search_button,
            builder::ui::vocabulary_ui::handle_vocabulary_search_input,
            builder::ui::vocabulary_ui::process_vocabulary_search_modal,
        ))
        .add_systems(Update, (
            // Game Info systems
            builder::ui::game_info_ui::handle_edit_title_button,
            builder::ui::game_info_ui::handle_edit_author_button,
            builder::ui::game_info_ui::handle_edit_version_button,
            builder::ui::game_info_ui::handle_increment_starting_location,
            builder::ui::game_info_ui::handle_decrement_starting_location,
            builder::ui::game_info_ui::handle_increment_max_carry_objects,
            builder::ui::game_info_ui::handle_decrement_max_carry_objects,
            builder::ui::game_info_ui::handle_increment_max_carry_weight,
            builder::ui::game_info_ui::handle_decrement_max_carry_weight,
        ))
        .add_systems(Update, (
            // Sound systems
            builder::ui::sound_ui::handle_add_sound_button,
            builder::ui::sound_ui::handle_remove_sound_button,
            builder::ui::sound_ui::handle_edit_sound_button,
        ))
        .add_systems(Update, (
            // Graphics systems
            builder::ui::graphics_ui::handle_add_picture_button,
            builder::ui::graphics_ui::handle_remove_picture_button,
            builder::ui::graphics_ui::handle_edit_picture_button,
            builder::ui::graphics_ui::handle_set_location_binding_button,
        ))
        .add_systems(Update, (
            // Playtest systems (new interpreter-based testing)
            builder::ui::playtest_ui::handle_start_playtest_button,
            builder::ui::playtest_ui::handle_reset_playtest_button,
            builder::ui::playtest_ui::handle_quick_command_button,
            builder::ui::playtest_ui::handle_keyboard_input,
        ))
        .add_systems(Update, (
            // Template systems
            builder::ui::templates_ui::handle_insert_template_button,
        ))
        .add_systems(Update, (
            // Dialogue tree systems
            builder::ui::dialogue_ui::handle_new_dialogue_tree_button,
            builder::ui::dialogue_ui::handle_add_node_button,
            builder::ui::dialogue_ui::handle_generate_dialogue_rules_button,
            builder::ui::dialogue_ui::handle_back_to_tree_list_button,
        ))
        .add_systems(Update, (
            // Debug systems
            builder::ui::debug_ui::handle_toggle_debug_button,
            builder::ui::debug_ui::handle_continue_button,
            builder::ui::debug_ui::handle_step_over_button,
            builder::ui::debug_ui::handle_step_into_button,
            builder::ui::debug_ui::handle_clear_trace_button,
            builder::ui::debug_ui::handle_toggle_breakpoint_button,
            builder::ui::debug_ui::handle_toggle_watch_flag_button,
        ))
        .run();
}

fn setup(mut commands: Commands, mut state: ResMut<builder::state::BuilderState>) {
    commands.spawn(Camera2dBundle::default());

    // Load recent files on startup
    state.load_recent_files();
}

/// Auto-save system - runs every frame and checks if auto-save is needed
fn auto_save_system(
    mut state: ResMut<builder::state::BuilderState>,
    time: Res<Time>,
) {
    let current_time = time.elapsed_seconds_f64();
    if let Err(e) = state.auto_save(current_time) {
        error!("Auto-save failed: {}", e);
    }
}

/// Global button hover system - provides visual feedback for all buttons
fn button_hover_system(
    mut interaction_query: Query<
        (&Interaction, &mut BackgroundColor, &mut BorderColor),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, mut bg_color, mut border_color) in interaction_query.iter_mut() {
        match *interaction {
            Interaction::Pressed => {
                // Darken on press
                let current = bg_color.0;
                *bg_color = Color::rgb(
                    current.r() * 0.7,
                    current.g() * 0.7,
                    current.b() * 0.7,
                ).into();
            }
            Interaction::Hovered => {
                // Brighten on hover
                let current = bg_color.0;
                *bg_color = Color::rgb(
                    (current.r() * 1.15).min(1.0),
                    (current.g() * 1.15).min(1.0),
                    (current.b() * 1.15).min(1.0),
                ).into();

                // Brighten border
                let current_border = border_color.0;
                *border_color = Color::rgb(
                    (current_border.r() * 1.2).min(1.0),
                    (current_border.g() * 1.2).min(1.0),
                    (current_border.b() * 1.2).min(1.0),
                ).into();
            }
            Interaction::None => {
                // Return to normal (this is handled by re-rendering)
            }
        }
    }
}

#[derive(Component)]
struct HelpOverlay;

#[derive(Component)]
struct StatusBar;

/// Render status bar at bottom of screen
fn render_status_bar(
    mut commands: Commands,
    state: Res<builder::state::BuilderState>,
    time: Res<Time>,
    query: Query<Entity, With<StatusBar>>,
) {
    // Clean up old status bar
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    let current_time = time.elapsed_seconds_f64();
    let time_since_save = current_time - state.last_save_time;

    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    bottom: Val::Px(0.0),
                    left: Val::Px(0.0),
                    width: Val::Percent(100.0),
                    height: Val::Px(30.0),
                    flex_direction: FlexDirection::Row,
                    align_items: AlignItems::Center,
                    padding: UiRect::horizontal(Val::Px(15.0)),
                    column_gap: Val::Px(20.0),
                    border: UiRect::top(Val::Px(1.0)),
                    ..default()
                },
                background_color: Color::rgba(0.08, 0.08, 0.12, 0.95).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            StatusBar,
        ))
        .with_children(|parent| {
            // Unsaved changes indicator
            if state.unsaved_changes {
                parent.spawn(TextBundle::from_section(
                    "● Unsaved Changes",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(1.0, 0.6, 0.4),
                        ..default()
                    },
                ));
            } else {
                parent.spawn(TextBundle::from_section(
                    "✓ All Changes Saved",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.4, 0.8, 0.4),
                        ..default()
                    },
                ));
            }

            // Separator
            parent.spawn(TextBundle::from_section(
                "|",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.4, 0.4, 0.4),
                    ..default()
                },
            ));

            // Auto-save status
            if state.auto_save_enabled {
                let save_text = if state.unsaved_changes && time_since_save > 0.1 {
                    format!("Auto-save: ON (saves in {}s)", 60 - (time_since_save as i32).min(59))
                } else {
                    "Auto-save: ON".to_string()
                };

                parent.spawn(TextBundle::from_section(
                    save_text,
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.4, 0.7, 0.9),
                        ..default()
                    },
                ));
            } else {
                parent.spawn(TextBundle::from_section(
                    "Auto-save: OFF",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }

            // Current file
            if let Some(path) = &state.current_file_path {
                parent.spawn(TextBundle::from_section(
                    "|",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.4, 0.4, 0.4),
                        ..default()
                    },
                ));

                let filename = std::path::Path::new(path)
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or(path);

                parent.spawn(TextBundle::from_section(
                    format!("📁 {}", filename),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.7, 0.7, 0.8),
                        ..default()
                    },
                ));
            } else {
                parent.spawn(TextBundle::from_section(
                    "|",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.4, 0.4, 0.4),
                        ..default()
                    },
                ));

                parent.spawn(TextBundle::from_section(
                    "📁 Untitled Project",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.5, 0.5, 0.5),
                        ..default()
                    },
                ));
            }

            // Spacer to push help hint to the right
            parent.spawn(NodeBundle {
                style: Style {
                    flex_grow: 1.0,
                    ..default()
                },
                ..default()
            });

            // Help hint
            parent.spawn(TextBundle::from_section(
                "Press H or F1 for help",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.5, 0.5, 0.6),
                    ..default()
                },
            ));
        });
}

/// Render keyboard shortcuts help overlay
fn render_help_overlay(
    mut commands: Commands,
    state: Res<builder::state::BuilderState>,
    query: Query<Entity, With<HelpOverlay>>,
) {
    if !state.show_help_overlay {
        // Clean up if help is hidden
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Clean up old overlay
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create help overlay
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Percent(50.0),
                    top: Val::Percent(50.0),
                    width: Val::Px(600.0),
                    height: Val::Px(500.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(25.0)),
                    row_gap: Val::Px(12.0),
                    border: UiRect::all(Val::Px(3.0)),
                    ..default()
                },
                background_color: Color::rgba(0.08, 0.08, 0.12, 0.98).into(),
                border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                transform: Transform::from_xyz(0.0, 0.0, 999.0)
                    .with_translation(Vec3::new(-300.0, -250.0, 999.0)),
                ..default()
            },
            HelpOverlay,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "⌨️  Keyboard Shortcuts",
                TextStyle {
                    font_size: 24.0,
                    color: Color::rgb(0.9, 0.95, 1.0),
                    ..default()
                },
            ));

            // Separator
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.4, 0.6, 0.9).into(),
                ..default()
            });

            // Shortcuts list
            let shortcuts = vec![
                ("H / F1", "Toggle this help overlay"),
                ("F2", "Toggle code viewer"),
                ("F5", "Toggle preview mode"),
                ("Ctrl+S", "Save project to JSON"),
                ("Ctrl+E", "Export to DAAD source code"),
                ("Escape", "Close modals / Cancel"),
                ("Enter", "Save in text modals (single-line)"),
                ("Backspace", "Delete character in text modals"),
            ];

            for (key, description) in shortcuts {
                parent
                    .spawn(NodeBundle {
                        style: Style {
                            flex_direction: FlexDirection::Row,
                            column_gap: Val::Px(15.0),
                            align_items: AlignItems::Center,
                            ..default()
                        },
                        ..default()
                    })
                    .with_children(|row| {
                        // Key badge
                        row.spawn(NodeBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(6.0)),
                                min_width: Val::Px(100.0),
                                justify_content: JustifyContent::Center,
                                border: UiRect::all(Val::Px(1.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.25, 0.3, 0.4).into(),
                            border_color: Color::rgb(0.4, 0.5, 0.6).into(),
                            ..default()
                        })
                        .with_children(|badge| {
                            badge.spawn(TextBundle::from_section(
                                key,
                                TextStyle {
                                    font_size: 13.0,
                                    color: Color::rgb(1.0, 1.0, 0.8),
                                    ..default()
                                },
                            ));
                        });

                        // Description
                        row.spawn(TextBundle::from_section(
                            description,
                            TextStyle {
                                font_size: 13.0,
                                color: Color::rgb(0.85, 0.85, 0.85),
                                ..default()
                            },
                        ));
                    });
            }

            // Footer
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.4, 0.6, 0.9).into(),
                ..default()
            });

            parent.spawn(TextBundle::from_section(
                "Press H or F1 again to close this help",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.7, 0.8),
                    ..default()
                },
            ));
        });
}

fn handle_keyboard_shortcuts(
    keys: Res<Input<KeyCode>>,
    mut state: ResMut<builder::state::BuilderState>,
) {
    // H or F1 = Toggle help overlay
    if keys.just_pressed(KeyCode::H) || keys.just_pressed(KeyCode::F1) {
        state.show_help_overlay = !state.show_help_overlay;
        info!("Help overlay: {}", state.show_help_overlay);
    }

    // F2 = Toggle code viewer
    if keys.just_pressed(KeyCode::F2) {
        state.show_code_viewer = !state.show_code_viewer;
        info!("Code viewer: {}", state.show_code_viewer);
    }

    // F5 = Toggle preview
    if keys.just_pressed(KeyCode::F5) {
        state.show_preview = !state.show_preview;
        info!("Preview mode: {}", state.show_preview);
    }

    // Ctrl+S = Save project to JSON
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::S) {
        // Create exports directory if it doesn't exist
        let _ = std::fs::create_dir_all("./exports");

        // Generate filename from game title
        let filename = state.current_game.title.replace(' ', "_").to_lowercase();
        let filepath = format!("./exports/{}.json", filename);

        // Serialize and save
        match serde_json::to_string_pretty(&state.current_game) {
            Ok(json) => {
                match std::fs::write(&filepath, json) {
                    Ok(_) => {
                        state.current_file_path = Some(filepath.clone());
                        state.unsaved_changes = false;
                        info!("✅ Project saved to: {}", filepath);
                    }
                    Err(e) => {
                        error!("❌ Failed to write JSON file: {}", e);
                    }
                }
            }
            Err(e) => {
                error!("❌ Failed to serialize game to JSON: {}", e);
            }
        }
    }

    // Ctrl+E = Export to DAAD source code
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::E) {
        // Create exports directory if it doesn't exist
        let _ = std::fs::create_dir_all("./exports");

        // Generate filename from game title
        let filename = state.current_game.title.replace(' ', "_").to_lowercase();
        let filepath = format!("./exports/{}.sce", filename);

        // Generate DAAD source code
        let daad_code = daad::codegen::DaadCodeGenerator::generate(&state.current_game);

        // Write to file
        match std::fs::write(&filepath, daad_code) {
            Ok(_) => {
                info!("✅ DAAD source exported to: {}", filepath);
            }
            Err(e) => {
                error!("❌ Failed to write DAAD source file: {}", e);
            }
        }
    }
}
