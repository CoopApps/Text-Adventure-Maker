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
        .init_resource::<builder::ui::components::ConnectionEditorModalState>()
        .init_resource::<builder::ui::components::LocationEditorModalState>()
        .init_resource::<builder::ui::components::PictureEditorModalState>()
        .init_resource::<builder::ui::components::LocationPickerModalState>()
        .init_resource::<builder::ui::components::SoundEditorModalState>()
        .init_resource::<builder::ui::components::TooltipState>()
        .init_resource::<builder::ui::components::NotificationManager>()
        .init_resource::<builder::ui::components::UndoRedoManager>()
        .init_resource::<builder::ui::components::ClipboardManager>()
        .init_resource::<builder::ui::components::ValidationResults>()
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
            builder::ui::components::track_tooltip_hover,
            builder::ui::components::render_tooltip_display,
            builder::ui::components::update_notifications,
            builder::ui::components::render_notification_display,
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
            builder::editors::location_editor::handle_add_connection_button,
            builder::editors::location_editor::handle_edit_connection_button,
            builder::editors::location_editor::handle_delete_connection_button,
            builder::editors::location_editor::process_connection_deletion,
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
            builder::editors::object_editor::handle_edit_name_button,
            builder::editors::object_editor::handle_edit_adjective_button,
            builder::editors::object_editor::handle_edit_noun_button,
            builder::editors::object_editor::handle_edit_description_button,
            builder::editors::object_editor::handle_decrease_weight_button,
            builder::editors::object_editor::handle_increase_weight_button,
            builder::editors::object_editor::handle_toggle_container_button,
            builder::editors::object_editor::handle_toggle_wearable_button,
            builder::editors::object_editor::handle_toggle_takeable_button,
            builder::editors::object_editor::update_object_from_text_input,
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
            // Modal systems (text input, confirmation, connection editor)
            builder::ui::components::handle_close_modal_button,
            builder::ui::components::render_text_input_modal,
            builder::ui::components::handle_text_input_modal_keyboard,
            builder::ui::components::handle_text_input_modal_save,
            builder::ui::components::render_confirmation_modal,
            builder::ui::components::handle_confirm_button,
            builder::ui::components::handle_cancel_confirmation_button,
            builder::ui::components::render_connection_editor_modal,
            builder::ui::components::handle_direction_button,
            builder::ui::components::handle_target_location_button,
            builder::ui::components::handle_save_connection_button,
            builder::ui::components::handle_cancel_connection_button,
        ))
        .add_systems(Update, (
            // Location editor modal and condition/action modals
            builder::ui::components::render_location_editor_modal,
            builder::ui::components::handle_location_name_input_button,
            builder::ui::components::handle_location_description_input_button,
            builder::ui::components::handle_location_dark_toggle_button,
            builder::ui::components::handle_save_location_button,
            builder::ui::components::handle_cancel_location_edit_button,
            builder::ui::components::update_location_editor_with_text_input,
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
            // Picture editor modal and location picker modal
            builder::ui::components::render_picture_editor_modal,
            builder::ui::components::handle_picture_name_input,
            builder::ui::components::handle_picture_description_input,
            builder::ui::components::handle_picture_web_file_input,
            builder::ui::components::handle_picture_width_input,
            builder::ui::components::handle_picture_height_input,
            builder::ui::components::handle_picture_location_binding_button,
            builder::ui::components::handle_picture_remove_location_binding,
            builder::ui::components::handle_save_picture_button,
            builder::ui::components::handle_cancel_picture_edit_button,
            builder::ui::components::process_picture_text_input,
            builder::ui::components::render_location_picker_modal,
            builder::ui::components::handle_location_picker_button,
            builder::ui::components::handle_cancel_location_picker,
        ))
        .add_systems(Update, (
            // Sound editor modal
            builder::ui::components::render_sound_editor_modal,
            builder::ui::components::handle_sound_name_input,
            builder::ui::components::handle_sound_description_input,
            builder::ui::components::handle_sound_web_file_input,
            builder::ui::components::handle_sound_type_button,
            builder::ui::components::handle_sound_preview_button,
            builder::ui::components::handle_save_sound_button,
            builder::ui::components::handle_cancel_sound_edit_button,
            builder::ui::components::process_sound_text_input,
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
            builder::ui::export_ui::handle_import_daad_source_button,
            builder::ui::export_ui::process_daad_import_text_input,
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
            builder::ui::vocabulary_ui::handle_custom_word_input_button,
            builder::ui::vocabulary_ui::process_custom_word_input_modal,
            builder::ui::vocabulary_ui::handle_custom_word_type_button,
            builder::ui::vocabulary_ui::handle_add_custom_word_button,
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
                    width: Val::Px(700.0),
                    max_height: Val::Px(700.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(25.0)),
                    row_gap: Val::Px(8.0),
                    border: UiRect::all(Val::Px(3.0)),
                    overflow: Overflow::clip_y(),
                    ..default()
                },
                background_color: Color::rgba(0.08, 0.08, 0.12, 0.98).into(),
                border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                transform: Transform::from_xyz(0.0, 0.0, 999.0)
                    .with_translation(Vec3::new(-350.0, -350.0, 999.0)),
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
                ("F6", "Run game validation"),
                ("", ""),
                ("Ctrl+S", "Save project to JSON"),
                ("Ctrl+E", "Export to DAAD source code"),
                ("Ctrl+N", "New project"),
                ("", ""),
                ("1-8", "Quick switch to panel (1=Info, 2=Locations, etc.)"),
                ("Tab", "Next panel"),
                ("Shift+Tab", "Previous panel"),
                ("", ""),
                ("Ctrl+Z", "Undo last change"),
                ("Ctrl+Y", "Redo last undone change"),
                ("Ctrl+C", "Copy selected entity"),
                ("Ctrl+V", "Paste from clipboard"),
                ("Ctrl+D", "Duplicate selected entity"),
                ("", ""),
                ("Escape", "Close modals / Cancel"),
                ("Enter", "Save in text modals"),
            ];

            for (key, description) in shortcuts {
                // Skip empty entries (separators)
                if key.is_empty() {
                    parent.spawn(NodeBundle {
                        style: Style {
                            height: Val::Px(5.0),
                            ..default()
                        },
                        ..default()
                    });
                    continue;
                }

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
                                min_width: Val::Px(130.0),
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
    mut notification_manager: ResMut<builder::ui::components::NotificationManager>,
    mut undo_manager: ResMut<builder::ui::components::UndoRedoManager>,
    mut clipboard_manager: ResMut<builder::ui::components::ClipboardManager>,
    mut validation_results: ResMut<builder::ui::components::ValidationResults>,
    time: Res<Time>,
) {
    let current_time = time.elapsed_seconds_f64();

    // H or F1 = Toggle help overlay
    if keys.just_pressed(KeyCode::H) || keys.just_pressed(KeyCode::F1) {
        state.show_help_overlay = !state.show_help_overlay;
        notification_manager.add_info(
            if state.show_help_overlay { "Help overlay shown" } else { "Help overlay hidden" },
            current_time
        );
    }

    // F2 = Toggle code viewer
    if keys.just_pressed(KeyCode::F2) {
        state.show_code_viewer = !state.show_code_viewer;
        notification_manager.add_info(
            if state.show_code_viewer { "Code viewer shown" } else { "Code viewer hidden" },
            current_time
        );
    }

    // F5 = Toggle preview
    if keys.just_pressed(KeyCode::F5) {
        state.show_preview = !state.show_preview;
        notification_manager.add_info(
            if state.show_preview { "Preview mode enabled" } else { "Preview mode disabled" },
            current_time
        );
    }

    // F6 = Run game validation
    if keys.just_pressed(KeyCode::F6) {
        use builder::ui::components::GameValidator;

        // Run validation
        let results = GameValidator::validate(&state.current_game);

        // Show notification with summary
        if results.has_errors() {
            notification_manager.add_error(
                format!("❌ Validation: {}", results.summary()),
                current_time
            );
        } else if results.warning_count() > 0 {
            notification_manager.add_warning(
                format!("⚠️ Validation: {}", results.summary()),
                current_time
            );
        } else {
            notification_manager.add_success(
                "✅ Validation passed: No issues found",
                current_time
            );
        }

        // Store results in the resource
        *validation_results = results;
        validation_results.last_validated = Some(current_time);
        validation_results.show_results = true;
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
                        notification_manager.add_success(
                            format!("Project saved to {}", filepath),
                            current_time
                        );
                    }
                    Err(e) => {
                        notification_manager.add_error(
                            format!("Failed to write file: {}", e),
                            current_time
                        );
                    }
                }
            }
            Err(e) => {
                notification_manager.add_error(
                    format!("Failed to serialize game: {}", e),
                    current_time
                );
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
                notification_manager.add_success(
                    format!("DAAD source exported to {}", filepath),
                    current_time
                );
            }
            Err(e) => {
                notification_manager.add_error(
                    format!("Failed to export DAAD source: {}", e),
                    current_time
                );
            }
        }
    }

    // Ctrl+N = New project
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::N) {
        if state.unsaved_changes {
            notification_manager.add_warning(
                "Unsaved changes exist. Save before creating new project.",
                current_time
            );
            // TODO: Show confirmation modal
        } else {
            state.new_game("Untitled Adventure", "Unknown Author");
            notification_manager.add_success("Created new project", current_time);
        }
    }

    // Number keys 1-8 for quick panel switching (without Ctrl)
    if !keys.pressed(KeyCode::ControlLeft) && !keys.pressed(KeyCode::AltLeft) {
        if keys.just_pressed(KeyCode::Key1) {
            state.select_panel(builder::state::Panel::GameInfo);
        } else if keys.just_pressed(KeyCode::Key2) {
            state.select_panel(builder::state::Panel::Locations);
        } else if keys.just_pressed(KeyCode::Key3) {
            state.select_panel(builder::state::Panel::Objects);
        } else if keys.just_pressed(KeyCode::Key4) {
            state.select_panel(builder::state::Panel::Rules);
        } else if keys.just_pressed(KeyCode::Key5) {
            state.select_panel(builder::state::Panel::Flags);
        } else if keys.just_pressed(KeyCode::Key6) {
            state.select_panel(builder::state::Panel::Messages);
        } else if keys.just_pressed(KeyCode::Key7) {
            state.select_panel(builder::state::Panel::Preview);
        } else if keys.just_pressed(KeyCode::Key8) {
            state.select_panel(builder::state::Panel::Export);
        }
    }

    // Ctrl+Z = Undo
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::Z) && !keys.pressed(KeyCode::ShiftLeft) {
        if undo_manager.can_undo() {
            if let Some(description) = undo_manager.undo(&mut state.current_game) {
                state.mark_dirty();
                notification_manager.add_info(
                    format!("⏮ Undid: {}", description),
                    current_time
                );
            }
        } else {
            notification_manager.add_warning("Nothing to undo", current_time);
        }
    }

    // Ctrl+Y or Ctrl+Shift+Z = Redo
    if keys.pressed(KeyCode::ControlLeft) &&
       (keys.just_pressed(KeyCode::Y) ||
        (keys.pressed(KeyCode::ShiftLeft) && keys.just_pressed(KeyCode::Z))) {
        if undo_manager.can_redo() {
            if let Some(description) = undo_manager.redo(&mut state.current_game) {
                state.mark_dirty();
                notification_manager.add_info(
                    format!("⏭ Redid: {}", description),
                    current_time
                );
            }
        } else {
            notification_manager.add_warning("Nothing to redo", current_time);
        }
    }

    // Ctrl+C = Copy selected entity
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::C) {
        use builder::ui::components::ClipboardContent;
        use builder::state::EditMode;

        match &state.editing {
            Some(EditMode::Location(id)) => {
                if let Some(location) = state.current_game.locations.iter().find(|l| l.id == *id) {
                    clipboard_manager.copy(ClipboardContent::Location(location.clone()));
                    notification_manager.add_success(
                        format!("📋 Copied location '{}'", location.name),
                        current_time
                    );
                }
            }
            Some(EditMode::Object(id)) => {
                if let Some(object) = state.current_game.objects.iter().find(|o| o.id == *id) {
                    clipboard_manager.copy(ClipboardContent::Object(object.clone()));
                    notification_manager.add_success(
                        format!("📋 Copied object '{}'", object.name),
                        current_time
                    );
                }
            }
            Some(EditMode::Rule(idx)) => {
                if let Some(rule) = state.current_game.rules.get(*idx) {
                    clipboard_manager.copy(ClipboardContent::Rule(rule.clone()));
                    notification_manager.add_success(
                        format!("📋 Copied rule '{}'", rule.name),
                        current_time
                    );
                }
            }
            Some(EditMode::Flag(id)) => {
                if let Some(flag) = state.current_game.flags.iter().find(|f| f.id == *id) {
                    clipboard_manager.copy(ClipboardContent::Flag(flag.clone()));
                    notification_manager.add_success(
                        format!("📋 Copied flag '{}'", flag.name),
                        current_time
                    );
                }
            }
            Some(EditMode::Message(idx)) => {
                if let Some(message) = state.current_game.messages.get(*idx) {
                    clipboard_manager.copy(ClipboardContent::Message(message.clone()));
                    let preview = if message.len() > 30 {
                        format!("{}...", &message[..30])
                    } else {
                        message.clone()
                    };
                    notification_manager.add_success(
                        format!("📋 Copied message '{}'", preview),
                        current_time
                    );
                }
            }
            _ => {
                notification_manager.add_warning(
                    "No entity selected. Select an entity first to copy it.",
                    current_time
                );
            }
        }
    }

    // Ctrl+V = Paste from clipboard
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::V) {
        use builder::ui::components::{ClipboardContent, ChangeRecord};

        if let Some(content) = clipboard_manager.peek() {
            match content {
                ClipboardContent::Location(location) => {
                    // Find next available location ID
                    let next_id = state.current_game.locations
                        .iter()
                        .map(|l| l.id)
                        .max()
                        .map_or(0, |max_id| max_id + 1);

                    let mut new_location = location.clone();
                    new_location.id = next_id;
                    new_location.name = format!("{} (Copy)", new_location.name);

                    // Record for undo
                    undo_manager.push_change(ChangeRecord::LocationAdded {
                        location: new_location.clone(),
                    });

                    state.current_game.locations.push(new_location.clone());
                    state.mark_dirty();
                    notification_manager.add_success(
                        format!("📋 Pasted location '{}'", new_location.name),
                        current_time
                    );
                }
                ClipboardContent::Object(object) => {
                    // Find next available object ID
                    let next_id = state.current_game.objects
                        .iter()
                        .map(|o| o.id)
                        .max()
                        .map_or(0, |max_id| max_id + 1);

                    let mut new_object = object.clone();
                    new_object.id = next_id;
                    new_object.name = format!("{} (Copy)", new_object.name);

                    // Record for undo
                    undo_manager.push_change(ChangeRecord::ObjectAdded {
                        object: new_object.clone(),
                    });

                    state.current_game.objects.push(new_object.clone());
                    state.mark_dirty();
                    notification_manager.add_success(
                        format!("📋 Pasted object '{}'", new_object.name),
                        current_time
                    );
                }
                ClipboardContent::Rule(rule) => {
                    let mut new_rule = rule.clone();
                    new_rule.id = state.current_game.rules.len();
                    new_rule.name = format!("{} (Copy)", new_rule.name);

                    // Record for undo
                    undo_manager.push_change(ChangeRecord::RuleAdded {
                        rule: new_rule.clone(),
                    });

                    state.current_game.rules.push(new_rule.clone());
                    state.mark_dirty();
                    notification_manager.add_success(
                        format!("📋 Pasted rule '{}'", new_rule.name),
                        current_time
                    );
                }
                ClipboardContent::Flag(flag) => {
                    // Find next available flag ID
                    let next_id = state.current_game.flags
                        .iter()
                        .map(|f| f.id)
                        .max()
                        .map_or(0, |max_id| max_id + 1);

                    let mut new_flag = flag.clone();
                    new_flag.id = next_id;
                    new_flag.name = format!("{} (Copy)", new_flag.name);

                    // Record for undo
                    undo_manager.push_change(ChangeRecord::FlagAdded {
                        flag: new_flag.clone(),
                    });

                    state.current_game.flags.push(new_flag.clone());
                    state.mark_dirty();
                    notification_manager.add_success(
                        format!("📋 Pasted flag '{}'", new_flag.name),
                        current_time
                    );
                }
                ClipboardContent::Message(message) => {
                    let index = state.current_game.messages.len();

                    // Record for undo
                    undo_manager.push_change(ChangeRecord::MessageAdded {
                        message: message.clone(),
                    });

                    state.current_game.messages.push(message.clone());
                    state.mark_dirty();

                    let preview = if message.len() > 30 {
                        format!("{}...", &message[..30])
                    } else {
                        message.clone()
                    };
                    notification_manager.add_success(
                        format!("📋 Pasted message '{}'", preview),
                        current_time
                    );
                }
            }
        } else {
            notification_manager.add_warning(
                "Nothing to paste. Copy an entity first (Ctrl+C).",
                current_time
            );
        }
    }

    // Ctrl+D = Duplicate selected item (copy + paste in one action)
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::D) {
        use builder::ui::components::{ClipboardContent, ChangeRecord};
        use builder::state::EditMode;

        match &state.editing {
            Some(EditMode::Location(id)) => {
                if let Some(location) = state.current_game.locations.iter().find(|l| l.id == *id).cloned() {
                    let next_id = state.current_game.locations
                        .iter()
                        .map(|l| l.id)
                        .max()
                        .map_or(0, |max_id| max_id + 1);

                    let mut new_location = location;
                    new_location.id = next_id;
                    new_location.name = format!("{} (Copy)", new_location.name);

                    undo_manager.push_change(ChangeRecord::LocationAdded {
                        location: new_location.clone(),
                    });

                    state.current_game.locations.push(new_location.clone());
                    state.mark_dirty();
                    notification_manager.add_success(
                        format!("📋 Duplicated location '{}'", new_location.name),
                        current_time
                    );
                }
            }
            Some(EditMode::Object(id)) => {
                if let Some(object) = state.current_game.objects.iter().find(|o| o.id == *id).cloned() {
                    let next_id = state.current_game.objects
                        .iter()
                        .map(|o| o.id)
                        .max()
                        .map_or(0, |max_id| max_id + 1);

                    let mut new_object = object;
                    new_object.id = next_id;
                    new_object.name = format!("{} (Copy)", new_object.name);

                    undo_manager.push_change(ChangeRecord::ObjectAdded {
                        object: new_object.clone(),
                    });

                    state.current_game.objects.push(new_object.clone());
                    state.mark_dirty();
                    notification_manager.add_success(
                        format!("📋 Duplicated object '{}'", new_object.name),
                        current_time
                    );
                }
            }
            Some(EditMode::Rule(idx)) => {
                if let Some(rule) = state.current_game.rules.get(*idx).cloned() {
                    let mut new_rule = rule;
                    new_rule.id = state.current_game.rules.len();
                    new_rule.name = format!("{} (Copy)", new_rule.name);

                    undo_manager.push_change(ChangeRecord::RuleAdded {
                        rule: new_rule.clone(),
                    });

                    state.current_game.rules.push(new_rule.clone());
                    state.mark_dirty();
                    notification_manager.add_success(
                        format!("📋 Duplicated rule '{}'", new_rule.name),
                        current_time
                    );
                }
            }
            Some(EditMode::Flag(id)) => {
                if let Some(flag) = state.current_game.flags.iter().find(|f| f.id == *id).cloned() {
                    let next_id = state.current_game.flags
                        .iter()
                        .map(|f| f.id)
                        .max()
                        .map_or(0, |max_id| max_id + 1);

                    let mut new_flag = flag;
                    new_flag.id = next_id;
                    new_flag.name = format!("{} (Copy)", new_flag.name);

                    undo_manager.push_change(ChangeRecord::FlagAdded {
                        flag: new_flag.clone(),
                    });

                    state.current_game.flags.push(new_flag.clone());
                    state.mark_dirty();
                    notification_manager.add_success(
                        format!("📋 Duplicated flag '{}'", new_flag.name),
                        current_time
                    );
                }
            }
            Some(EditMode::Message(idx)) => {
                if let Some(message) = state.current_game.messages.get(*idx).cloned() {
                    undo_manager.push_change(ChangeRecord::MessageAdded {
                        message: message.clone(),
                    });

                    state.current_game.messages.push(message.clone());
                    state.mark_dirty();

                    let preview = if message.len() > 30 {
                        format!("{}...", &message[..30])
                    } else {
                        message.clone()
                    };
                    notification_manager.add_success(
                        format!("📋 Duplicated message '{}'", preview),
                        current_time
                    );
                }
            }
            _ => {
                notification_manager.add_warning(
                    "No entity selected. Select an entity first to duplicate it.",
                    current_time
                );
            }
        }
    }

    // Tab = Next panel, Shift+Tab = Previous panel
    if keys.just_pressed(KeyCode::Tab) {
        use builder::state::Panel;
        let panels = [
            Panel::GameInfo,
            Panel::Locations,
            Panel::Objects,
            Panel::Rules,
            Panel::Flags,
            Panel::Messages,
            Panel::Preview,
            Panel::Export,
        ];

        let current_idx = panels.iter().position(|&p| p == state.selected_panel).unwrap_or(0);
        let next_idx = if keys.pressed(KeyCode::ShiftLeft) {
            // Go backwards
            if current_idx == 0 { panels.len() - 1 } else { current_idx - 1 }
        } else {
            // Go forwards
            (current_idx + 1) % panels.len()
        };

        state.select_panel(panels[next_idx]);
    }
}
