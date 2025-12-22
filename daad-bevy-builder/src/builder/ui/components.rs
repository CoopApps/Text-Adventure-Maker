use bevy::prelude::*;
use bevy::window::ReceivedCharacter;

/// Modal backdrop component - darkens the background
#[derive(Component)]
pub struct ModalBackdrop;

/// Modal container component
#[derive(Component)]
pub struct ModalContainer;

/// Close modal button
#[derive(Component)]
pub struct CloseModalButton;

/// Dropdown/Select component
#[derive(Component)]
pub struct Dropdown {
    pub is_open: bool,
    pub selected_index: usize,
}

/// Dropdown option button
#[derive(Component)]
pub struct DropdownOption {
    pub index: usize,
}

/// Dropdown toggle button (the main button that shows current selection)
#[derive(Component)]
pub struct DropdownToggle;

/// Render a modal backdrop (dark overlay)
pub fn spawn_modal_backdrop(commands: &mut Commands) -> Entity {
    commands.spawn((
        NodeBundle {
            style: Style {
                position_type: PositionType::Absolute,
                left: Val::Px(0.0),
                top: Val::Px(0.0),
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                ..default()
            },
            background_color: Color::rgba(0.0, 0.0, 0.0, 0.7).into(),
            z_index: ZIndex::Global(1000),
            ..default()
        },
        ModalBackdrop,
    )).id()
}

/// Spawn a modal container inside the backdrop
pub fn spawn_modal_container(parent: &mut ChildBuilder, width: f32, height: f32) {
    parent.spawn((
        NodeBundle {
            style: Style {
                width: Val::Px(width),
                height: Val::Px(height),
                flex_direction: FlexDirection::Column,
                padding: UiRect::all(Val::Px(20.0)),
                row_gap: Val::Px(15.0),
                border: UiRect::all(Val::Px(2.0)),
                overflow: Overflow::clip_y(),
                ..default()
            },
            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
            border_color: Color::rgb(0.4, 0.6, 0.8).into(),
            ..default()
        },
        ModalContainer,
    ))
    .with_children(|modal| {
        // Close button in top-right
        modal.spawn((
            ButtonBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    right: Val::Px(10.0),
                    top: Val::Px(10.0),
                    padding: UiRect::all(Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.6, 0.3, 0.3).into(),
                ..default()
            },
            CloseModalButton,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section(
                "✕",
                TextStyle {
                    font_size: 16.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });
    });
}

/// Render a labeled text input field (returns the container entity for adding more children)
pub fn render_text_input(
    parent: &mut ChildBuilder,
    label: &str,
    value: &str,
) -> Entity {
    parent.spawn(TextBundle::from_section(
        label,
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(NodeBundle {
        style: Style {
            padding: UiRect::all(Val::Px(10.0)),
            width: Val::Percent(100.0),
            ..default()
        },
        background_color: Color::rgb(0.1, 0.1, 0.15).into(),
        ..default()
    })
    .with_children(|input_box| {
        input_box.spawn(TextBundle::from_section(
            value,
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.9, 0.9, 0.9),
                ..default()
            },
        ));
    }).id()
}

/// Render a dropdown/select component
pub fn render_dropdown<T: std::fmt::Display>(
    parent: &mut ChildBuilder,
    label: &str,
    options: &[T],
    selected_index: usize,
    dropdown_id: Entity,
) {
    parent.spawn(TextBundle::from_section(
        label,
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    // Dropdown button showing current selection
    parent.spawn((
        ButtonBundle {
            style: Style {
                padding: UiRect::all(Val::Px(10.0)),
                width: Val::Percent(100.0),
                justify_content: JustifyContent::SpaceBetween,
                align_items: AlignItems::Center,
                ..default()
            },
            background_color: Color::rgb(0.2, 0.3, 0.4).into(),
            ..default()
        },
        DropdownToggle,
    ))
    .with_children(|btn| {
        let selected_text = if selected_index < options.len() {
            format!("{}", options[selected_index])
        } else {
            "Select...".to_string()
        };

        btn.spawn(TextBundle::from_section(
            selected_text,
            TextStyle {
                font_size: 14.0,
                color: Color::WHITE,
                ..default()
            },
        ));

        btn.spawn(TextBundle::from_section(
            "▼",
            TextStyle {
                font_size: 12.0,
                color: Color::rgb(0.7, 0.7, 0.7),
                ..default()
            },
        ));
    });
}

/// Render a number input with +/- buttons
pub fn render_number_input(
    parent: &mut ChildBuilder,
    label: &str,
    value: u8,
    min: u8,
    max: u8,
) -> (Entity, Entity) { // Returns (decrement_button, increment_button)
    parent.spawn(TextBundle::from_section(
        label,
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    let mut dec_btn = Entity::PLACEHOLDER;
    let mut inc_btn = Entity::PLACEHOLDER;

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            column_gap: Val::Px(10.0),
            align_items: AlignItems::Center,
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Decrement button
        dec_btn = row.spawn(ButtonBundle {
            style: Style {
                padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                ..default()
            },
            background_color: if value > min {
                Color::rgb(0.5, 0.3, 0.3).into()
            } else {
                Color::rgb(0.3, 0.3, 0.3).into()
            },
            ..default()
        })
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section(
                "➖",
                TextStyle {
                    font_size: 14.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        }).id();

        // Value display
        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(10.0)),
                min_width: Val::Px(60.0),
                justify_content: JustifyContent::Center,
                ..default()
            },
            background_color: Color::rgb(0.1, 0.1, 0.15).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{}", value),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));
        });

        // Increment button
        inc_btn = row.spawn(ButtonBundle {
            style: Style {
                padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                ..default()
            },
            background_color: if value < max {
                Color::rgb(0.3, 0.5, 0.3).into()
            } else {
                Color::rgb(0.3, 0.3, 0.3).into()
            },
            ..default()
        })
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section(
                "➕",
                TextStyle {
                    font_size: 14.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        }).id();
    });

    (dec_btn, inc_btn)
}

/// Render action buttons (Save/Cancel) at bottom of modal
pub fn render_modal_actions(
    parent: &mut ChildBuilder,
    save_text: &str,
) -> (Entity, Entity) { // Returns (save_button, cancel_button)
    let mut save_btn = Entity::PLACEHOLDER;
    let mut cancel_btn = Entity::PLACEHOLDER;

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            column_gap: Val::Px(10.0),
            justify_content: JustifyContent::FlexEnd,
            margin: UiRect::top(Val::Px(20.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Cancel button
        cancel_btn = row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(20.0), Val::Px(10.0)),
                    ..default()
                },
                background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                ..default()
            },
            CloseModalButton,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section(
                "Cancel",
                TextStyle {
                    font_size: 14.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        }).id();

        // Save button
        save_btn = row.spawn(ButtonBundle {
            style: Style {
                padding: UiRect::axes(Val::Px(20.0), Val::Px(10.0)),
                ..default()
            },
            background_color: Color::rgb(0.3, 0.6, 0.3).into(),
            ..default()
        })
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section(
                save_text,
                TextStyle {
                    font_size: 14.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        }).id();
    });

    (save_btn, cancel_btn)
}

/// System to handle close modal button
pub fn handle_close_modal_button(
    mut commands: Commands,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<CloseModalButton>),
    >,
    backdrop_query: Query<Entity, With<ModalBackdrop>>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Remove all modal backdrops
            for entity in backdrop_query.iter() {
                commands.entity(entity).despawn_recursive();
            }
        }
    }
}

// ============================================================================
// TEXT INPUT MODAL SYSTEM
// ============================================================================

/// Text input modal state resource
#[derive(Resource, Default)]
pub struct TextInputModalState {
    pub is_open: bool,
    pub title: String,
    pub current_value: String,
    pub placeholder: String,
    pub multiline: bool,
    pub callback_id: Option<String>, // ID to identify which editor opened this
}

impl TextInputModalState {
    pub fn open_single_line(&mut self, title: &str, current_value: &str, placeholder: &str, callback_id: &str) {
        self.is_open = true;
        self.title = title.to_string();
        self.current_value = current_value.to_string();
        self.placeholder = placeholder.to_string();
        self.multiline = false;
        self.callback_id = Some(callback_id.to_string());
    }

    pub fn open_multiline(&mut self, title: &str, current_value: &str, placeholder: &str, callback_id: &str) {
        self.is_open = true;
        self.title = title.to_string();
        self.current_value = current_value.to_string();
        self.placeholder = placeholder.to_string();
        self.multiline = true;
        self.callback_id = Some(callback_id.to_string());
    }

    pub fn close(&mut self) {
        self.is_open = false;
        self.current_value.clear();
        self.callback_id = None;
    }
}

/// Text input modal marker
#[derive(Component)]
pub struct TextInputModal;

/// Text input field component
#[derive(Component)]
pub struct TextInputField;

/// Save button for text input modal
#[derive(Component)]
pub struct SaveTextInputButton;

/// Render text input modal
pub fn render_text_input_modal(
    mut commands: Commands,
    modal_state: Res<TextInputModalState>,
    query: Query<Entity, With<TextInputModal>>,
) {
    if !modal_state.is_open {
        // Close any existing modals
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Don't re-render if already exists
    if !query.is_empty() {
        return;
    }

    // Spawn modal
    let backdrop_id = spawn_modal_backdrop(&mut commands);

    commands.entity(backdrop_id)
        .insert(TextInputModal)
        .with_children(|backdrop| {
            // Modal container
            backdrop.spawn((
                NodeBundle {
                    style: Style {
                        width: Val::Px(if modal_state.multiline { 600.0 } else { 500.0 }),
                        height: Val::Px(if modal_state.multiline { 400.0 } else { 250.0 }),
                        flex_direction: FlexDirection::Column,
                        padding: UiRect::all(Val::Px(20.0)),
                        row_gap: Val::Px(15.0),
                        border: UiRect::all(Val::Px(2.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.15, 0.15, 0.2).into(),
                    border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                    ..default()
                },
                ModalContainer,
            ))
            .with_children(|modal| {
                // Close button
                modal.spawn((
                    ButtonBundle {
                        style: Style {
                            position_type: PositionType::Absolute,
                            right: Val::Px(10.0),
                            top: Val::Px(10.0),
                            padding: UiRect::all(Val::Px(8.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.6, 0.3, 0.3).into(),
                        ..default()
                    },
                    CloseModalButton,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "✕",
                        TextStyle {
                            font_size: 16.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

                // Title
                modal.spawn(TextBundle::from_section(
                    &modal_state.title,
                    TextStyle {
                        font_size: 20.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));

                // Text input display (showing current value)
                modal.spawn((
                    NodeBundle {
                        style: Style {
                            width: Val::Percent(100.0),
                            height: Val::Px(if modal_state.multiline { 200.0 } else { 50.0 }),
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            overflow: Overflow::clip(),
                            ..default()
                        },
                        background_color: Color::rgb(0.1, 0.1, 0.15).into(),
                        border_color: Color::rgb(0.4, 0.5, 0.6).into(),
                        ..default()
                    },
                    TextInputField,
                ))
                .with_children(|field| {
                    let display_text = if modal_state.current_value.is_empty() {
                        &modal_state.placeholder
                    } else {
                        &modal_state.current_value
                    };

                    field.spawn(TextBundle::from_section(
                        display_text,
                        TextStyle {
                            font_size: 14.0,
                            color: if modal_state.current_value.is_empty() {
                                Color::rgb(0.5, 0.5, 0.5)
                            } else {
                                Color::WHITE
                            },
                            ..default()
                        },
                    ));
                });

                // Hint text
                let hint = if modal_state.multiline {
                    "Type to edit. Use Enter for new lines. Press Esc to cancel, or click Save."
                } else {
                    "Type to edit. Press Enter to save, Esc to cancel."
                };
                modal.spawn(TextBundle::from_section(
                    hint,
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));

                // Action buttons
                modal.spawn(NodeBundle {
                    style: Style {
                        display: Display::Flex,
                        flex_direction: FlexDirection::Row,
                        column_gap: Val::Px(10.0),
                        margin: UiRect::top(Val::Px(10.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|row| {
                    // Cancel button
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(20.0), Val::Px(10.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                            ..default()
                        },
                        CloseModalButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "Cancel",
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });

                    // Save button
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(20.0), Val::Px(10.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                            ..default()
                        },
                        SaveTextInputButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "Save",
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });
                });
            });
        });
}

/// Handle keyboard input for text input modal
pub fn handle_text_input_modal_keyboard(
    keys: Res<Input<KeyCode>>,
    mut char_events: EventReader<ReceivedCharacter>,
    mut modal_state: ResMut<TextInputModalState>,
    mut commands: Commands,
    backdrop_query: Query<Entity, With<ModalBackdrop>>,
) {
    if !modal_state.is_open {
        return;
    }

    // Handle Escape - cancel
    if keys.just_pressed(KeyCode::Escape) {
        modal_state.close();
        for entity in backdrop_query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Handle Enter - save (only for single-line)
    if keys.just_pressed(KeyCode::Return) && !modal_state.multiline {
        modal_state.is_open = false;
        for entity in backdrop_query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Handle Backspace - delete last character
    if keys.just_pressed(KeyCode::Back) {
        modal_state.current_value.pop();
    }

    // Handle character input
    for event in char_events.read() {
        let c = event.char;

        // Filter out control characters except newline (for multiline)
        if c.is_control() {
            if c == '\n' && modal_state.multiline {
                modal_state.current_value.push(c);
            }
            continue;
        }

        // Add character to text
        modal_state.current_value.push(c);
    }
}

/// Handle save button click for text input modal
pub fn handle_text_input_modal_save(
    mut commands: Commands,
    mut modal_state: ResMut<TextInputModalState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SaveTextInputButton>),
    >,
    backdrop_query: Query<Entity, With<ModalBackdrop>>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Close modal but keep data for callback
            modal_state.is_open = false;

            for entity in backdrop_query.iter() {
                commands.entity(entity).despawn_recursive();
            }
        }
    }
}

// ============================================================================
// CONFIRMATION MODAL SYSTEM
// ============================================================================

/// Confirmation modal state resource
#[derive(Resource, Default)]
pub struct ConfirmationModalState {
    pub is_open: bool,
    pub title: String,
    pub message: String,
    pub callback_id: Option<String>, // ID to identify what action to confirm
}

impl ConfirmationModalState {
    pub fn open(&mut self, title: &str, message: &str, callback_id: &str) {
        self.is_open = true;
        self.title = title.to_string();
        self.message = message.to_string();
        self.callback_id = Some(callback_id.to_string());
    }

    pub fn close(&mut self) {
        self.is_open = false;
        self.callback_id = None;
    }

    pub fn confirm(&mut self) -> Option<String> {
        let callback = self.callback_id.clone();
        self.close();
        callback
    }
}

/// Confirmation modal marker
#[derive(Component)]
pub struct ConfirmationModal;

/// Confirm button for confirmation modal
#[derive(Component)]
pub struct ConfirmButton;

/// Cancel button for confirmation modal
#[derive(Component)]
pub struct CancelConfirmButton;

/// Render confirmation modal
pub fn render_confirmation_modal(
    mut commands: Commands,
    modal_state: Res<ConfirmationModalState>,
    query: Query<Entity, With<ConfirmationModal>>,
) {
    if !modal_state.is_open {
        // Close any existing modals
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Don't re-render if already exists
    if !query.is_empty() {
        return;
    }

    // Spawn modal
    let backdrop_id = spawn_modal_backdrop(&mut commands);

    commands.entity(backdrop_id)
        .insert(ConfirmationModal)
        .with_children(|backdrop| {
            // Modal container
            backdrop.spawn((
                NodeBundle {
                    style: Style {
                        width: Val::Px(450.0),
                        height: Val::Px(220.0),
                        flex_direction: FlexDirection::Column,
                        padding: UiRect::all(Val::Px(20.0)),
                        row_gap: Val::Px(15.0),
                        border: UiRect::all(Val::Px(2.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.15, 0.15, 0.2).into(),
                    border_color: Color::rgb(0.8, 0.4, 0.4).into(), // Red border for warning
                    ..default()
                },
                ModalContainer,
            ))
            .with_children(|modal| {
                // Title with warning icon
                modal.spawn(TextBundle::from_section(
                    format!("⚠️  {}", modal_state.title),
                    TextStyle {
                        font_size: 18.0,
                        color: Color::rgb(1.0, 0.8, 0.6),
                        ..default()
                    },
                ));

                // Message
                modal.spawn(TextBundle::from_section(
                    &modal_state.message,
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.9, 0.9, 0.9),
                        ..default()
                    },
                ));

                // Action buttons
                modal.spawn(NodeBundle {
                    style: Style {
                        display: Display::Flex,
                        flex_direction: FlexDirection::Row,
                        column_gap: Val::Px(10.0),
                        margin: UiRect::top(Val::Px(20.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|row| {
                    // Cancel button
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(20.0), Val::Px(10.0)),
                                flex_grow: 1.0,
                                justify_content: JustifyContent::Center,
                                ..default()
                            },
                            background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                            ..default()
                        },
                        CancelConfirmButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "Cancel",
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });

                    // Confirm button
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(20.0), Val::Px(10.0)),
                                flex_grow: 1.0,
                                justify_content: JustifyContent::Center,
                                ..default()
                            },
                            background_color: Color::rgb(0.8, 0.3, 0.3).into(), // Red for danger
                            ..default()
                        },
                        ConfirmButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "Delete",
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });
                });
            });
        });
}

/// Handle cancel button for confirmation modal
pub fn handle_cancel_confirmation_button(
    mut commands: Commands,
    mut modal_state: ResMut<ConfirmationModalState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<CancelConfirmButton>),
    >,
    backdrop_query: Query<Entity, With<ModalBackdrop>>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            modal_state.close();
            for entity in backdrop_query.iter() {
                commands.entity(entity).despawn_recursive();
            }
        }
    }
}

/// Handle confirm button for confirmation modal
/// Note: This just closes the modal and sets confirmed flag.
/// The actual deletion is handled by checking the callback_id in delete handlers.
pub fn handle_confirm_button(
    mut commands: Commands,
    mut modal_state: ResMut<ConfirmationModalState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<ConfirmButton>),
    >,
    backdrop_query: Query<Entity, With<ModalBackdrop>>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Don't clear callback_id yet - let the delete handler read it
            modal_state.is_open = false;
            for entity in backdrop_query.iter() {
                commands.entity(entity).despawn_recursive();
            }
        }
    }
}

/// Connection editor modal state resource
#[derive(Resource)]
pub struct ConnectionEditorModalState {
    pub is_open: bool,
    pub location_id: u8,
    pub connection_index: Option<usize>, // None for new connection, Some for editing existing
    pub selected_direction: crate::daad::types::Direction,
    pub selected_target: u8,
}

impl Default for ConnectionEditorModalState {
    fn default() -> Self {
        Self {
            is_open: false,
            location_id: 0,
            connection_index: None,
            selected_direction: crate::daad::types::Direction::North,
            selected_target: 0,
        }
    }
}

impl ConnectionEditorModalState {
    pub fn open_new(&mut self, location_id: u8, default_target: u8) {
        self.is_open = true;
        self.location_id = location_id;
        self.connection_index = None;
        self.selected_direction = crate::daad::types::Direction::North;
        self.selected_target = default_target;
    }

    pub fn open_edit(&mut self, location_id: u8, connection_index: usize, direction: crate::daad::types::Direction, target: u8) {
        self.is_open = true;
        self.location_id = location_id;
        self.connection_index = Some(connection_index);
        self.selected_direction = direction;
        self.selected_target = target;
    }

    pub fn close(&mut self) {
        self.is_open = false;
    }
}

/// Connection editor modal marker
#[derive(Component)]
pub struct ConnectionEditorModal;

/// Direction selection button
#[derive(Component)]
pub struct DirectionButton {
    pub direction: crate::daad::types::Direction,
}

/// Target location selection button
#[derive(Component)]
pub struct TargetLocationButton {
    pub location_id: u8,
}

/// Save connection button
#[derive(Component)]
pub struct SaveConnectionButton;

/// Cancel connection edit button
#[derive(Component)]
pub struct CancelConnectionButton;

/// Render connection editor modal
pub fn render_connection_editor_modal(
    mut commands: Commands,
    modal_state: Res<ConnectionEditorModalState>,
    state: Res<crate::builder::state::BuilderState>,
    query: Query<Entity, With<ConnectionEditorModal>>,
) {
    if !modal_state.is_open {
        // Close any existing modals
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Don't re-render if already exists
    if !query.is_empty() {
        return;
    }

    use crate::daad::types::Direction;

    // Create modal backdrop
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    width: Val::Percent(100.0),
                    height: Val::Percent(100.0),
                    align_items: AlignItems::Center,
                    justify_content: JustifyContent::Center,
                    ..default()
                },
                background_color: Color::rgba(0.0, 0.0, 0.0, 0.7).into(),
                z_index: ZIndex::Global(100),
                ..default()
            },
            ModalBackdrop,
            ConnectionEditorModal,
        ))
        .with_children(|backdrop| {
            // Modal container
            backdrop
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Column,
                        padding: UiRect::all(Val::Px(25.0)),
                        row_gap: Val::Px(15.0),
                        width: Val::Px(500.0),
                        border: UiRect::all(Val::Px(3.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.15, 0.15, 0.2).into(),
                    border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                    ..default()
                })
                .with_children(|modal| {
                    // Title
                    modal.spawn(TextBundle::from_section(
                        if modal_state.connection_index.is_some() {
                            "Edit Connection"
                        } else {
                            "Add New Connection"
                        },
                        TextStyle {
                            font_size: 22.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));

                    // Direction selection section
                    modal.spawn(TextBundle::from_section(
                        "Direction:",
                        TextStyle {
                            font_size: 16.0,
                            color: Color::rgb(0.8, 0.8, 0.8),
                            ..default()
                        },
                    ));

                    // Direction buttons grid
                    modal
                        .spawn(NodeBundle {
                            style: Style {
                                display: Display::Grid,
                                grid_template_columns: vec![
                                    RepeatedGridTrack::auto(4),
                                ],
                                column_gap: Val::Px(8.0),
                                row_gap: Val::Px(8.0),
                                ..default()
                            },
                            ..default()
                        })
                        .with_children(|grid| {
                            for (direction, label, icon) in [
                                (Direction::North, "North", "⬆️"),
                                (Direction::South, "South", "⬇️"),
                                (Direction::East, "East", "➡️"),
                                (Direction::West, "West", "⬅️"),
                                (Direction::Northeast, "NE", "↗️"),
                                (Direction::Northwest, "NW", "↖️"),
                                (Direction::Southeast, "SE", "↘️"),
                                (Direction::Southwest, "SW", "↙️"),
                                (Direction::Up, "Up", "🔼"),
                                (Direction::Down, "Down", "🔽"),
                                (Direction::In, "In", "🚪"),
                                (Direction::Out, "Out", "🚪"),
                            ] {
                                let is_selected = modal_state.selected_direction == direction;
                                grid.spawn((
                                    ButtonBundle {
                                        style: Style {
                                            padding: UiRect::all(Val::Px(10.0)),
                                            border: UiRect::all(Val::Px(2.0)),
                                            justify_content: JustifyContent::Center,
                                            align_items: AlignItems::Center,
                                            ..default()
                                        },
                                        background_color: if is_selected {
                                            Color::rgb(0.4, 0.6, 0.8).into()
                                        } else {
                                            Color::rgb(0.2, 0.2, 0.25).into()
                                        },
                                        border_color: if is_selected {
                                            Color::rgb(0.6, 0.8, 1.0).into()
                                        } else {
                                            Color::rgb(0.3, 0.3, 0.35).into()
                                        },
                                        ..default()
                                    },
                                    DirectionButton { direction },
                                ))
                                .with_children(|btn| {
                                    btn.spawn(TextBundle::from_section(
                                        format!("{} {}", icon, label),
                                        TextStyle {
                                            font_size: 12.0,
                                            color: Color::WHITE,
                                            ..default()
                                        },
                                    ));
                                });
                            }
                        });

                    // Target location selection section
                    modal.spawn(TextBundle::from_section(
                        "Target Location:",
                        TextStyle {
                            font_size: 16.0,
                            color: Color::rgb(0.8, 0.8, 0.8),
                            ..default()
                        },
                    ));

                    // Target location buttons (scrollable if many locations)
                    modal
                        .spawn(NodeBundle {
                            style: Style {
                                flex_direction: FlexDirection::Column,
                                row_gap: Val::Px(6.0),
                                max_height: Val::Px(200.0),
                                overflow: Overflow::clip_y(),
                                padding: UiRect::all(Val::Px(8.0)),
                                border: UiRect::all(Val::Px(1.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.1, 0.1, 0.15).into(),
                            border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                            ..default()
                        })
                        .with_children(|list| {
                            for location in &state.current_game.locations {
                                // Skip the source location
                                if location.id == modal_state.location_id {
                                    continue;
                                }

                                let is_selected = modal_state.selected_target == location.id;
                                list.spawn((
                                    ButtonBundle {
                                        style: Style {
                                            padding: UiRect::all(Val::Px(10.0)),
                                            border: UiRect::all(Val::Px(2.0)),
                                            width: Val::Percent(100.0),
                                            ..default()
                                        },
                                        background_color: if is_selected {
                                            Color::rgb(0.3, 0.5, 0.4).into()
                                        } else {
                                            Color::rgb(0.2, 0.2, 0.25).into()
                                        },
                                        border_color: if is_selected {
                                            Color::rgb(0.5, 0.8, 0.6).into()
                                        } else {
                                            Color::rgb(0.3, 0.3, 0.35).into()
                                        },
                                        ..default()
                                    },
                                    TargetLocationButton { location_id: location.id },
                                ))
                                .with_children(|btn| {
                                    btn.spawn(TextBundle::from_section(
                                        format!("#{} - {}", location.id, location.name),
                                        TextStyle {
                                            font_size: 13.0,
                                            color: Color::WHITE,
                                            ..default()
                                        },
                                    ));
                                });
                            }
                        });

                    // Action buttons
                    modal
                        .spawn(NodeBundle {
                            style: Style {
                                flex_direction: FlexDirection::Row,
                                column_gap: Val::Px(10.0),
                                margin: UiRect::top(Val::Px(10.0)),
                                ..default()
                            },
                            ..default()
                        })
                        .with_children(|buttons| {
                            // Save button
                            buttons
                                .spawn((
                                    ButtonBundle {
                                        style: Style {
                                            padding: UiRect::all(Val::Px(12.0)),
                                            border: UiRect::all(Val::Px(2.0)),
                                            flex_grow: 1.0,
                                            justify_content: JustifyContent::Center,
                                            ..default()
                                        },
                                        background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                                        border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                                        ..default()
                                    },
                                    SaveConnectionButton,
                                ))
                                .with_children(|btn| {
                                    btn.spawn(TextBundle::from_section(
                                        "✓ Save",
                                        TextStyle {
                                            font_size: 15.0,
                                            color: Color::WHITE,
                                            ..default()
                                        },
                                    ));
                                });

                            // Cancel button
                            buttons
                                .spawn((
                                    ButtonBundle {
                                        style: Style {
                                            padding: UiRect::all(Val::Px(12.0)),
                                            border: UiRect::all(Val::Px(2.0)),
                                            flex_grow: 1.0,
                                            justify_content: JustifyContent::Center,
                                            ..default()
                                        },
                                        background_color: Color::rgb(0.4, 0.3, 0.3).into(),
                                        border_color: Color::rgb(0.6, 0.4, 0.4).into(),
                                        ..default()
                                    },
                                    CancelConnectionButton,
                                ))
                                .with_children(|btn| {
                                    btn.spawn(TextBundle::from_section(
                                        "✗ Cancel",
                                        TextStyle {
                                            font_size: 15.0,
                                            color: Color::WHITE,
                                            ..default()
                                        },
                                    ));
                                });
                        });
                });
        });
}

/// Handle direction button clicks
pub fn handle_direction_button(
    mut modal_state: ResMut<ConnectionEditorModalState>,
    mut interaction_query: Query<
        (&Interaction, &DirectionButton),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            modal_state.selected_direction = button.direction;
        }
    }
}

/// Handle target location button clicks
pub fn handle_target_location_button(
    mut modal_state: ResMut<ConnectionEditorModalState>,
    mut interaction_query: Query<
        (&Interaction, &TargetLocationButton),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            modal_state.selected_target = button.location_id;
        }
    }
}

/// Handle save connection button
pub fn handle_save_connection_button(
    mut commands: Commands,
    mut modal_state: ResMut<ConnectionEditorModalState>,
    mut state: ResMut<crate::builder::state::BuilderState>,
    mut undo_manager: ResMut<UndoRedoManager>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SaveConnectionButton>),
    >,
    backdrop_query: Query<Entity, With<ModalBackdrop>>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Find the location and add/edit connection
            if let Some(location) = state.current_game.locations.iter_mut().find(|l| l.id == modal_state.location_id) {
                let new_connection = crate::daad::types::Connection {
                    direction: modal_state.selected_direction,
                    target_location: modal_state.selected_target,
                    condition: None,
                };

                if let Some(index) = modal_state.connection_index {
                    // Edit existing connection
                    if index < location.connections.len() {
                        let old_connection = location.connections[index].clone();
                        undo_manager.push_change(ChangeRecord::ConnectionModified {
                            location_id: modal_state.location_id,
                            index,
                            old_connection,
                            new_connection: new_connection.clone(),
                        });
                        location.connections[index] = new_connection;
                        info!("Updated connection at index {}", index);
                    }
                } else {
                    // Add new connection
                    undo_manager.push_change(ChangeRecord::ConnectionAdded {
                        location_id: modal_state.location_id,
                        connection: new_connection.clone(),
                    });
                    location.connections.push(new_connection);
                    info!("Added new connection");
                }

                state.mark_dirty();
            }

            modal_state.close();
            for entity in backdrop_query.iter() {
                commands.entity(entity).despawn_recursive();
            }
        }
    }
}

/// Handle cancel connection button
pub fn handle_cancel_connection_button(
    mut commands: Commands,
    mut modal_state: ResMut<ConnectionEditorModalState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<CancelConnectionButton>),
    >,
    backdrop_query: Query<Entity, With<ModalBackdrop>>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            modal_state.close();
            for entity in backdrop_query.iter() {
                commands.entity(entity).despawn_recursive();
            }
        }
    }
}

/// Tooltip component - attach to buttons to show helpful text on hover
#[derive(Component, Clone)]
pub struct Tooltip {
    pub text: String,
}

impl Tooltip {
    pub fn new(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
        }
    }
}

/// Tooltip display state resource
#[derive(Resource, Default)]
pub struct TooltipState {
    pub current_tooltip: Option<String>,
    pub cursor_position: Vec2,
}

/// Tooltip display marker
#[derive(Component)]
pub struct TooltipDisplay;

/// Track tooltip hover state
pub fn track_tooltip_hover(
    mut tooltip_state: ResMut<TooltipState>,
    tooltip_query: Query<(&Interaction, &Tooltip), Changed<Interaction>>,
    windows: Query<&Window>,
) {
    // Get cursor position
    if let Ok(window) = windows.get_single() {
        if let Some(cursor_pos) = window.cursor_position() {
            tooltip_state.cursor_position = cursor_pos;
        }
    }

    // Check for hovered tooltips
    for (interaction, tooltip) in tooltip_query.iter() {
        match *interaction {
            Interaction::Hovered => {
                tooltip_state.current_tooltip = Some(tooltip.text.clone());
                return;
            }
            Interaction::None => {
                // Only clear if this was the active tooltip
                if tooltip_state.current_tooltip.as_ref() == Some(&tooltip.text) {
                    tooltip_state.current_tooltip = None;
                }
            }
            _ => {}
        }
    }
}

/// Render tooltip display
pub fn render_tooltip_display(
    mut commands: Commands,
    tooltip_state: Res<TooltipState>,
    query: Query<Entity, With<TooltipDisplay>>,
) {
    // Clean up old tooltips
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Render new tooltip if needed
    if let Some(tooltip_text) = &tooltip_state.current_tooltip {
        commands
            .spawn((
                NodeBundle {
                    style: Style {
                        position_type: PositionType::Absolute,
                        left: Val::Px(tooltip_state.cursor_position.x + 15.0),
                        top: Val::Px(tooltip_state.cursor_position.y + 15.0),
                        padding: UiRect::all(Val::Px(8.0)),
                        border: UiRect::all(Val::Px(1.0)),
                        max_width: Val::Px(250.0),
                        ..default()
                    },
                    background_color: Color::rgba(0.1, 0.1, 0.15, 0.95).into(),
                    border_color: Color::rgb(0.6, 0.6, 0.7).into(),
                    z_index: ZIndex::Global(200),
                    ..default()
                },
                TooltipDisplay,
            ))
            .with_children(|parent| {
                parent.spawn(TextBundle::from_section(
                    tooltip_text,
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.9, 0.9, 1.0),
                        ..default()
                    },
                ));
            });
    }
}

// ============================================================================
// NOTIFICATION/TOAST SYSTEM
// ============================================================================

/// Notification type
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum NotificationType {
    Success,
    Error,
    Warning,
    Info,
}

impl NotificationType {
    pub fn color(&self) -> Color {
        match self {
            NotificationType::Success => Color::rgb(0.2, 0.7, 0.3),
            NotificationType::Error => Color::rgb(0.8, 0.2, 0.2),
            NotificationType::Warning => Color::rgb(0.9, 0.7, 0.2),
            NotificationType::Info => Color::rgb(0.3, 0.5, 0.8),
        }
    }

    pub fn icon(&self) -> &'static str {
        match self {
            NotificationType::Success => "✓",
            NotificationType::Error => "✕",
            NotificationType::Warning => "⚠",
            NotificationType::Info => "ℹ",
        }
    }
}

/// Single notification
#[derive(Clone)]
pub struct Notification {
    pub message: String,
    pub notification_type: NotificationType,
    pub created_at: f64,
    pub duration: f64, // How long to show in seconds
}

impl Notification {
    pub fn success(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            notification_type: NotificationType::Success,
            created_at: 0.0, // Will be set when added
            duration: 3.0,
        }
    }

    pub fn error(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            notification_type: NotificationType::Error,
            created_at: 0.0,
            duration: 5.0, // Errors stay longer
        }
    }

    pub fn warning(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            notification_type: NotificationType::Warning,
            created_at: 0.0,
            duration: 4.0,
        }
    }

    pub fn info(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            notification_type: NotificationType::Info,
            created_at: 0.0,
            duration: 3.0,
        }
    }
}

/// Resource to manage notifications
#[derive(Resource, Default)]
pub struct NotificationManager {
    pub notifications: Vec<Notification>,
}

impl NotificationManager {
    pub fn add(&mut self, mut notification: Notification, current_time: f64) {
        notification.created_at = current_time;
        self.notifications.push(notification);
    }

    pub fn add_success(&mut self, message: impl Into<String>, current_time: f64) {
        self.add(Notification::success(message), current_time);
    }

    pub fn add_error(&mut self, message: impl Into<String>, current_time: f64) {
        self.add(Notification::error(message), current_time);
    }

    pub fn add_warning(&mut self, message: impl Into<String>, current_time: f64) {
        self.add(Notification::warning(message), current_time);
    }

    pub fn add_info(&mut self, message: impl Into<String>, current_time: f64) {
        self.add(Notification::info(message), current_time);
    }

    pub fn clear_expired(&mut self, current_time: f64) {
        self.notifications.retain(|n| {
            current_time - n.created_at < n.duration
        });
    }
}

/// Notification display marker
#[derive(Component)]
pub struct NotificationDisplay;

/// Update and clean up expired notifications
pub fn update_notifications(
    mut notification_manager: ResMut<NotificationManager>,
    time: Res<Time>,
) {
    let current_time = time.elapsed_seconds_f64();
    notification_manager.clear_expired(current_time);
}

/// Render notification display
pub fn render_notification_display(
    mut commands: Commands,
    notification_manager: Res<NotificationManager>,
    query: Query<Entity, With<NotificationDisplay>>,
) {
    // Clean up old notification displays
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Don't render if no notifications
    if notification_manager.notifications.is_empty() {
        return;
    }

    // Create notification container in top-right corner
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    right: Val::Px(20.0),
                    top: Val::Px(80.0), // Below toolbar
                    flex_direction: FlexDirection::Column,
                    row_gap: Val::Px(10.0),
                    max_width: Val::Px(350.0),
                    ..default()
                },
                z_index: ZIndex::Global(300), // Above modals
                ..default()
            },
            NotificationDisplay,
        ))
        .with_children(|parent| {
            // Render each notification (newest first)
            for notification in notification_manager.notifications.iter().rev() {
                parent
                    .spawn(NodeBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            column_gap: Val::Px(10.0),
                            flex_direction: FlexDirection::Row,
                            align_items: AlignItems::Center,
                            ..default()
                        },
                        background_color: Color::rgba(0.1, 0.1, 0.15, 0.95).into(),
                        border_color: notification.notification_type.color().into(),
                        ..default()
                    })
                    .with_children(|notification_box| {
                        // Icon
                        notification_box.spawn(
                            TextBundle::from_section(
                                notification.notification_type.icon(),
                                TextStyle {
                                    font_size: 20.0,
                                    color: notification.notification_type.color(),
                                    ..default()
                                },
                            )
                            .with_style(Style {
                                min_width: Val::Px(24.0),
                                ..default()
                            }),
                        );

                        // Message
                        notification_box.spawn(TextBundle::from_section(
                            &notification.message,
                            TextStyle {
                                font_size: 14.0,
                                color: Color::rgb(0.95, 0.95, 0.95),
                                ..default()
                            },
                        ));
                    });
            }
        });
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/// Validation result
pub enum ValidationResult {
    Valid,
    Invalid(String), // Error message
}

impl ValidationResult {
    pub fn is_valid(&self) -> bool {
        matches!(self, ValidationResult::Valid)
    }

    pub fn error_message(&self) -> Option<&str> {
        match self {
            ValidationResult::Valid => None,
            ValidationResult::Invalid(msg) => Some(msg),
        }
    }
}

/// Validate a text field is not empty
pub fn validate_not_empty(value: &str, field_name: &str) -> ValidationResult {
    if value.trim().is_empty() {
        ValidationResult::Invalid(format!("{} cannot be empty", field_name))
    } else {
        ValidationResult::Valid
    }
}

/// Validate text length is within bounds
pub fn validate_length(value: &str, field_name: &str, min: usize, max: usize) -> ValidationResult {
    let len = value.len();
    if len < min {
        ValidationResult::Invalid(format!("{} must be at least {} characters", field_name, min))
    } else if len > max {
        ValidationResult::Invalid(format!("{} must be at most {} characters", field_name, max))
    } else {
        ValidationResult::Valid
    }
}

/// Validate a number is within range
pub fn validate_range(value: u8, field_name: &str, min: u8, max: u8) -> ValidationResult {
    if value < min || value > max {
        ValidationResult::Invalid(format!("{} must be between {} and {}", field_name, min, max))
    } else {
        ValidationResult::Valid
    }
}

/// Validate DAAD word (5 chars max, alphanumeric)
pub fn validate_daad_word(value: &str) -> ValidationResult {
    if value.is_empty() {
        return ValidationResult::Invalid("Word cannot be empty".to_string());
    }
    if value.len() > 5 {
        return ValidationResult::Invalid("DAAD words must be 5 characters or less".to_string());
    }
    if !value.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-') {
        return ValidationResult::Invalid("Word can only contain letters, numbers, _ and -".to_string());
    }
    ValidationResult::Valid
}

// ============================================================================
// LOCATION EDITOR MODAL
// ============================================================================

/// Location editor modal state
#[derive(Resource)]
pub struct LocationEditorModalState {
    pub is_open: bool,
    pub location_id: u8,
    pub name: String,
    pub description: String,
    pub is_dark: bool,
}

impl Default for LocationEditorModalState {
    fn default() -> Self {
        Self {
            is_open: false,
            location_id: 0,
            name: String::new(),
            description: String::new(),
            is_dark: false,
        }
    }
}

impl LocationEditorModalState {
    pub fn open(&mut self, location_id: u8, name: String, description: String, is_dark: bool) {
        self.is_open = true;
        self.location_id = location_id;
        self.name = name;
        self.description = description;
        self.is_dark = is_dark;
    }

    pub fn close(&mut self) {
        self.is_open = false;
    }
}

/// Location name input button
#[derive(Component)]
pub struct LocationNameInputButton;

/// Location description input button
#[derive(Component)]
pub struct LocationDescriptionInputButton;

/// Location dark toggle button
#[derive(Component)]
pub struct LocationDarkToggleButton;

/// Save location button
#[derive(Component)]
pub struct SaveLocationButton;

/// Cancel location edit button
#[derive(Component)]
pub struct CancelLocationEditButton;

/// Location editor modal marker
#[derive(Component)]
pub struct LocationEditorModal;

/// Render location editor modal
pub fn render_location_editor_modal(
    mut commands: Commands,
    modal_state: Res<LocationEditorModalState>,
    query: Query<Entity, With<LocationEditorModal>>,
) {
    if !modal_state.is_open {
        // Close any existing modals
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Don't re-render if already exists
    if !query.is_empty() {
        return;
    }

    // Create modal backdrop
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    width: Val::Percent(100.0),
                    height: Val::Percent(100.0),
                    align_items: AlignItems::Center,
                    justify_content: JustifyContent::Center,
                    ..default()
                },
                background_color: Color::rgba(0.0, 0.0, 0.0, 0.7).into(),
                z_index: ZIndex::Global(100),
                ..default()
            },
            ModalBackdrop,
            LocationEditorModal,
        ))
        .with_children(|backdrop| {
            // Modal container
            backdrop
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Column,
                        padding: UiRect::all(Val::Px(25.0)),
                        row_gap: Val::Px(15.0),
                        width: Val::Px(500.0),
                        border: UiRect::all(Val::Px(3.0)),
                        overflow: Overflow::clip_y(),
                        ..default()
                    },
                    background_color: Color::rgb(0.15, 0.15, 0.2).into(),
                    border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                    ..default()
                })
                .with_children(|modal| {
                // Title
                modal.spawn(TextBundle::from_section(
                    format!("Edit Location #{}", modal_state.location_id),
                    TextStyle {
                        font_size: 20.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));

                // Name input
                modal.spawn(TextBundle::from_section(
                    "Name:",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.8, 0.8, 0.8),
                        ..default()
                    },
                ));

                modal
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(10.0)),
                                width: Val::Percent(100.0),
                                justify_content: JustifyContent::FlexStart,
                                border: UiRect::all(Val::Px(2.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
                            border_color: Color::rgb(0.4, 0.5, 0.6).into(),
                            ..default()
                        },
                        LocationNameInputButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            if modal_state.name.is_empty() {
                                "Click to enter name..."
                            } else {
                                &modal_state.name
                            },
                            TextStyle {
                                font_size: 14.0,
                                color: if modal_state.name.is_empty() {
                                    Color::rgb(0.5, 0.5, 0.5)
                                } else {
                                    Color::rgb(0.9, 0.9, 0.9)
                                },
                                ..default()
                            },
                        ));
                    });

                // Description input
                modal.spawn(TextBundle::from_section(
                    "Description:",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.8, 0.8, 0.8),
                        ..default()
                    },
                ));

                modal
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(10.0)),
                                width: Val::Percent(100.0),
                                min_height: Val::Px(80.0),
                                justify_content: JustifyContent::FlexStart,
                                align_items: AlignItems::FlexStart,
                                border: UiRect::all(Val::Px(2.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
                            border_color: Color::rgb(0.4, 0.5, 0.6).into(),
                            ..default()
                        },
                        LocationDescriptionInputButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            if modal_state.description.is_empty() {
                                "Click to enter description..."
                            } else {
                                &modal_state.description
                            },
                            TextStyle {
                                font_size: 14.0,
                                color: if modal_state.description.is_empty() {
                                    Color::rgb(0.5, 0.5, 0.5)
                                } else {
                                    Color::rgb(0.9, 0.9, 0.9)
                                },
                                ..default()
                            },
                        ));
                    });

                // Dark location toggle
                modal.spawn(NodeBundle {
                    style: Style {
                        display: Display::Flex,
                        flex_direction: FlexDirection::Row,
                        align_items: AlignItems::Center,
                        column_gap: Val::Px(10.0),
                        padding: UiRect::all(Val::Px(8.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|row| {
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(10.0)),
                                border: UiRect::all(Val::Px(2.0)),
                                ..default()
                            },
                            background_color: if modal_state.is_dark {
                                Color::rgb(0.3, 0.5, 0.7)
                            } else {
                                Color::rgb(0.3, 0.3, 0.35)
                            }
                            .into(),
                            border_color: if modal_state.is_dark {
                                Color::rgb(0.5, 0.7, 0.9)
                            } else {
                                Color::rgb(0.4, 0.4, 0.45)
                            }
                            .into(),
                            ..default()
                        },
                        LocationDarkToggleButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            if modal_state.is_dark { "☑" } else { "☐" },
                            TextStyle {
                                font_size: 16.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });

                    row.spawn(TextBundle::from_section(
                        "Dark Location (requires light source)",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::rgb(0.8, 0.8, 0.8),
                            ..default()
                        },
                    ));
                });

                // Action buttons
                modal.spawn(NodeBundle {
                    style: Style {
                        display: Display::Flex,
                        flex_direction: FlexDirection::Row,
                        justify_content: JustifyContent::FlexEnd,
                        column_gap: Val::Px(10.0),
                        margin: UiRect::top(Val::Px(20.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|buttons| {
                    // Cancel button
                    buttons
                        .spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(12.0)),
                                    border: UiRect::all(Val::Px(1.0)),
                                    ..default()
                                },
                                background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                                border_color: Color::rgb(0.5, 0.5, 0.5).into(),
                                ..default()
                            },
                            CancelLocationEditButton,
                        ))
                        .with_children(|btn| {
                            btn.spawn(TextBundle::from_section(
                                "Cancel",
                                TextStyle {
                                    font_size: 14.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });

                    // Save button
                    buttons
                        .spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(12.0)),
                                    border: UiRect::all(Val::Px(1.0)),
                                    ..default()
                                },
                                background_color: Color::rgb(0.3, 0.7, 0.4).into(),
                                border_color: Color::rgb(0.4, 0.8, 0.5).into(),
                                ..default()
                            },
                            SaveLocationButton,
                        ))
                        .with_children(|btn| {
                            btn.spawn(TextBundle::from_section(
                                "Save",
                                TextStyle {
                                    font_size: 14.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });
                });
                });
        });
}

/// Handle location name input button
pub fn handle_location_name_input_button(
    modal_state: Res<LocationEditorModalState>,
    mut text_input_state: ResMut<TextInputModalState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<LocationNameInputButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            text_input_state.open_single_line(
                "Location Name",
                &modal_state.name,
                "Enter location name",
                "location_name",
            );
        }
    }
}

/// Handle location description input button
pub fn handle_location_description_input_button(
    modal_state: Res<LocationEditorModalState>,
    mut text_input_state: ResMut<TextInputModalState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<LocationDescriptionInputButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            text_input_state.open_multiline(
                "Location Description",
                &modal_state.description,
                "Enter location description",
                "location_description",
            );
        }
    }
}

/// Handle location dark toggle button
pub fn handle_location_dark_toggle_button(
    mut modal_state: ResMut<LocationEditorModalState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<LocationDarkToggleButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            modal_state.is_dark = !modal_state.is_dark;
        }
    }
}

/// Handle save location button
pub fn handle_save_location_button(
    mut state: ResMut<crate::builder::state::BuilderState>,
    mut modal_state: ResMut<LocationEditorModalState>,
    mut notification_manager: ResMut<NotificationManager>,
    mut undo_manager: ResMut<UndoRedoManager>,
    time: Res<Time>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SaveLocationButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            let current_time = time.elapsed_seconds_f64();

            // Validate name
            if modal_state.name.trim().is_empty() {
                notification_manager.add_error("Location name cannot be empty", current_time);
                continue;
            }

            // Find and update the location
            let location_id = modal_state.location_id;
            let new_name = modal_state.name.clone();
            let new_description = modal_state.description.clone();
            let new_is_dark = modal_state.is_dark;

            if let Some(location) = state.current_game.locations.iter_mut()
                .find(|l| l.id == location_id) {
                // Record changes for undo/redo
                if location.name != new_name {
                    undo_manager.push_change(ChangeRecord::LocationNameChanged {
                        location_id,
                        old_value: location.name.clone(),
                        new_value: new_name.clone(),
                    });
                }
                if location.description != new_description {
                    undo_manager.push_change(ChangeRecord::LocationDescriptionChanged {
                        location_id,
                        old_value: location.description.clone(),
                        new_value: new_description.clone(),
                    });
                }
                if location.is_dark != new_is_dark {
                    undo_manager.push_change(ChangeRecord::LocationDarkChanged {
                        location_id,
                        old_value: location.is_dark,
                        new_value: new_is_dark,
                    });
                }

                // Apply changes
                location.name = new_name.clone();
                location.description = new_description;
                location.is_dark = new_is_dark;

                state.mark_dirty();
                notification_manager.add_success(
                    format!("Updated location '{}'", new_name),
                    current_time
                );
                modal_state.close();
            } else {
                notification_manager.add_error(
                    format!("Location #{} not found", location_id),
                    current_time
                );
            }
        }
    }
}

/// Handle cancel location edit button
pub fn handle_cancel_location_edit_button(
    mut modal_state: ResMut<LocationEditorModalState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<CancelLocationEditButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            modal_state.close();
        }
    }
}

/// Update location editor modal with text input results
pub fn update_location_editor_with_text_input(
    mut modal_state: ResMut<LocationEditorModalState>,
    text_input_state: Res<TextInputModalState>,
) {
    if text_input_state.is_changed() && !text_input_state.is_open {
        if let Some(callback_id) = &text_input_state.callback_id {
            if callback_id == "location_name" {
                modal_state.name = text_input_state.current_value.clone();
            } else if callback_id == "location_description" {
                modal_state.description = text_input_state.current_value.clone();
            }
        }
    }
}

// ============================================================================
// UNDO/REDO SYSTEM
// ============================================================================

/// Represents a single change that can be undone/redone
#[derive(Clone, Debug)]
pub enum ChangeRecord {
    // Location changes
    LocationNameChanged {
        location_id: u8,
        old_value: String,
        new_value: String,
    },
    LocationDescriptionChanged {
        location_id: u8,
        old_value: String,
        new_value: String,
    },
    LocationDarkChanged {
        location_id: u8,
        old_value: bool,
        new_value: bool,
    },
    LocationAdded {
        location: crate::daad::types::Location,
    },
    LocationDeleted {
        location: crate::daad::types::Location,
        index: usize,
    },

    // Connection changes
    ConnectionAdded {
        location_id: u8,
        connection: crate::daad::types::Connection,
    },
    ConnectionRemoved {
        location_id: u8,
        index: usize,
        connection: crate::daad::types::Connection,
    },
    ConnectionModified {
        location_id: u8,
        index: usize,
        old_connection: crate::daad::types::Connection,
        new_connection: crate::daad::types::Connection,
    },

    // Object changes
    ObjectNameChanged {
        object_id: u8,
        old_value: String,
        new_value: String,
    },
    ObjectAdjectiveChanged {
        object_id: u8,
        old_value: String,
        new_value: String,
    },
    ObjectNounChanged {
        object_id: u8,
        old_value: String,
        new_value: String,
    },
    ObjectDescriptionChanged {
        object_id: u8,
        old_value: String,
        new_value: String,
    },
    ObjectWeightChanged {
        object_id: u8,
        old_value: u8,
        new_value: u8,
    },
    ObjectFlagsChanged {
        object_id: u8,
        old_container: bool,
        new_container: bool,
        old_wearable: bool,
        new_wearable: bool,
        old_takeable: bool,
        new_takeable: bool,
    },
    ObjectAdded {
        object: crate::daad::types::Object,
    },
    ObjectDeleted {
        object: crate::daad::types::Object,
        index: usize,
    },

    // Rule changes
    RuleAdded {
        rule: crate::daad::types::Rule,
    },
    RuleDeleted {
        rule: crate::daad::types::Rule,
        index: usize,
    },
    RuleNameChanged {
        rule_id: usize,
        old_value: String,
        new_value: String,
    },
    RuleEnabledChanged {
        rule_id: usize,
        old_value: bool,
        new_value: bool,
    },

    // Flag changes
    FlagAdded {
        flag: crate::daad::types::Flag,
    },
    FlagDeleted {
        flag: crate::daad::types::Flag,
        index: usize,
    },
    FlagNameChanged {
        flag_id: u8,
        old_value: String,
        new_value: String,
    },
    FlagDescriptionChanged {
        flag_id: u8,
        old_value: String,
        new_value: String,
    },

    // Message changes
    MessageAdded {
        message: String,
    },
    MessageDeleted {
        message: String,
        index: usize,
    },
    MessageChanged {
        index: usize,
        old_value: String,
        new_value: String,
    },

    // Vocabulary changes
    VocabularyAdded {
        word: String,
        word_type: crate::daad::game::VocabType,
    },
    VocabularyRemoved {
        word: String,
        word_type: crate::daad::game::VocabType,
        index: usize,
    },
}

impl ChangeRecord {
    /// Apply this change to the game state
    pub fn apply(&self, game: &mut crate::daad::game::DaadGame) {
        match self {
            // Location changes
            ChangeRecord::LocationNameChanged { location_id, new_value, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    location.name = new_value.clone();
                }
            }
            ChangeRecord::LocationDescriptionChanged { location_id, new_value, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    location.description = new_value.clone();
                }
            }
            ChangeRecord::LocationDarkChanged { location_id, new_value, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    location.is_dark = *new_value;
                }
            }
            ChangeRecord::LocationAdded { location } => {
                game.locations.push(location.clone());
            }
            ChangeRecord::LocationDeleted { index, .. } => {
                if *index < game.locations.len() {
                    game.locations.remove(*index);
                }
            }

            // Connection changes
            ChangeRecord::ConnectionAdded { location_id, connection } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    location.connections.push(connection.clone());
                }
            }
            ChangeRecord::ConnectionRemoved { location_id, index, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    if *index < location.connections.len() {
                        location.connections.remove(*index);
                    }
                }
            }
            ChangeRecord::ConnectionModified { location_id, index, new_connection, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    if *index < location.connections.len() {
                        location.connections[*index] = new_connection.clone();
                    }
                }
            }

            // Object changes
            ChangeRecord::ObjectNameChanged { object_id, new_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.name = new_value.clone();
                }
            }
            ChangeRecord::ObjectAdjectiveChanged { object_id, new_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.adjective = new_value.clone();
                }
            }
            ChangeRecord::ObjectNounChanged { object_id, new_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.noun = new_value.clone();
                }
            }
            ChangeRecord::ObjectDescriptionChanged { object_id, new_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.description = new_value.clone();
                }
            }
            ChangeRecord::ObjectWeightChanged { object_id, new_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.weight = *new_value;
                }
            }
            ChangeRecord::ObjectFlagsChanged { object_id, new_container, new_wearable, new_takeable, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.is_container = *new_container;
                    object.is_wearable = *new_wearable;
                    object.is_takeable = *new_takeable;
                }
            }
            ChangeRecord::ObjectAdded { object } => {
                game.objects.push(object.clone());
            }
            ChangeRecord::ObjectDeleted { index, .. } => {
                if *index < game.objects.len() {
                    game.objects.remove(*index);
                }
            }

            // Rule changes
            ChangeRecord::RuleAdded { rule } => {
                game.rules.push(rule.clone());
            }
            ChangeRecord::RuleDeleted { index, .. } => {
                if *index < game.rules.len() {
                    game.rules.remove(*index);
                }
            }
            ChangeRecord::RuleNameChanged { rule_id, new_value, .. } => {
                if *rule_id < game.rules.len() {
                    game.rules[*rule_id].name = new_value.clone();
                }
            }
            ChangeRecord::RuleEnabledChanged { rule_id, new_value, .. } => {
                if *rule_id < game.rules.len() {
                    game.rules[*rule_id].enabled = *new_value;
                }
            }

            // Flag changes
            ChangeRecord::FlagAdded { flag } => {
                game.flags.push(flag.clone());
            }
            ChangeRecord::FlagDeleted { index, .. } => {
                if *index < game.flags.len() {
                    game.flags.remove(*index);
                }
            }
            ChangeRecord::FlagNameChanged { flag_id, new_value, .. } => {
                if let Some(flag) = game.flags.iter_mut().find(|f| f.id == *flag_id) {
                    flag.name = new_value.clone();
                }
            }
            ChangeRecord::FlagDescriptionChanged { flag_id, new_value, .. } => {
                if let Some(flag) = game.flags.iter_mut().find(|f| f.id == *flag_id) {
                    flag.description = new_value.clone();
                }
            }

            // Message changes
            ChangeRecord::MessageAdded { message } => {
                game.messages.push(message.clone());
            }
            ChangeRecord::MessageDeleted { index, .. } => {
                if *index < game.messages.len() {
                    game.messages.remove(*index);
                }
            }
            ChangeRecord::MessageChanged { index, new_value, .. } => {
                if *index < game.messages.len() {
                    game.messages[*index] = new_value.clone();
                }
            }

            // Vocabulary changes
            ChangeRecord::VocabularyAdded { word, word_type } => {
                // Find next available ID
                let next_id = game.vocabulary
                    .iter()
                    .map(|v| v.id)
                    .max()
                    .map_or(0, |max_id| max_id + 1);

                game.vocabulary.push(crate::daad::game::VocabEntry {
                    word: word.clone(),
                    word_type: *word_type,
                    id: next_id,
                    translations: std::collections::HashMap::new(),
                });
            }
            ChangeRecord::VocabularyRemoved { word, word_type, .. } => {
                // Remove from vocabulary vector
                if let Some(pos) = game.vocabulary.iter().position(|v| v.word == *word && v.word_type == *word_type) {
                    game.vocabulary.remove(pos);
                }
            }
        }
    }

    /// Reverse/undo this change
    pub fn reverse(&self, game: &mut crate::daad::game::DaadGame) {
        match self {
            // Location changes
            ChangeRecord::LocationNameChanged { location_id, old_value, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    location.name = old_value.clone();
                }
            }
            ChangeRecord::LocationDescriptionChanged { location_id, old_value, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    location.description = old_value.clone();
                }
            }
            ChangeRecord::LocationDarkChanged { location_id, old_value, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    location.is_dark = *old_value;
                }
            }
            ChangeRecord::LocationAdded { location } => {
                // Remove the added location
                if let Some(pos) = game.locations.iter().position(|l| l.id == location.id) {
                    game.locations.remove(pos);
                }
            }
            ChangeRecord::LocationDeleted { location, index } => {
                // Re-insert at original position
                if *index <= game.locations.len() {
                    game.locations.insert(*index, location.clone());
                }
            }

            // Connection changes
            ChangeRecord::ConnectionAdded { location_id, connection } => {
                // Remove the added connection
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    if let Some(pos) = location.connections.iter().position(|c|
                        c.direction == connection.direction && c.target_location == connection.target_location
                    ) {
                        location.connections.remove(pos);
                    }
                }
            }
            ChangeRecord::ConnectionRemoved { location_id, index, connection } => {
                // Re-insert at original position
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    if *index <= location.connections.len() {
                        location.connections.insert(*index, connection.clone());
                    }
                }
            }
            ChangeRecord::ConnectionModified { location_id, index, old_connection, .. } => {
                if let Some(location) = game.locations.iter_mut().find(|l| l.id == *location_id) {
                    if *index < location.connections.len() {
                        location.connections[*index] = old_connection.clone();
                    }
                }
            }

            // Object changes
            ChangeRecord::ObjectNameChanged { object_id, old_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.name = old_value.clone();
                }
            }
            ChangeRecord::ObjectAdjectiveChanged { object_id, old_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.adjective = old_value.clone();
                }
            }
            ChangeRecord::ObjectNounChanged { object_id, old_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.noun = old_value.clone();
                }
            }
            ChangeRecord::ObjectDescriptionChanged { object_id, old_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.description = old_value.clone();
                }
            }
            ChangeRecord::ObjectWeightChanged { object_id, old_value, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.weight = *old_value;
                }
            }
            ChangeRecord::ObjectFlagsChanged { object_id, old_container, old_wearable, old_takeable, .. } => {
                if let Some(object) = game.objects.iter_mut().find(|o| o.id == *object_id) {
                    object.is_container = *old_container;
                    object.is_wearable = *old_wearable;
                    object.is_takeable = *old_takeable;
                }
            }
            ChangeRecord::ObjectAdded { object } => {
                if let Some(pos) = game.objects.iter().position(|o| o.id == object.id) {
                    game.objects.remove(pos);
                }
            }
            ChangeRecord::ObjectDeleted { object, index } => {
                if *index <= game.objects.len() {
                    game.objects.insert(*index, object.clone());
                }
            }

            // Rule changes
            ChangeRecord::RuleAdded { rule } => {
                if let Some(pos) = game.rules.iter().position(|r| r.id == rule.id) {
                    game.rules.remove(pos);
                }
            }
            ChangeRecord::RuleDeleted { rule, index } => {
                if *index <= game.rules.len() {
                    game.rules.insert(*index, rule.clone());
                }
            }
            ChangeRecord::RuleNameChanged { rule_id, old_value, .. } => {
                if *rule_id < game.rules.len() {
                    game.rules[*rule_id].name = old_value.clone();
                }
            }
            ChangeRecord::RuleEnabledChanged { rule_id, old_value, .. } => {
                if *rule_id < game.rules.len() {
                    game.rules[*rule_id].enabled = *old_value;
                }
            }

            // Flag changes
            ChangeRecord::FlagAdded { flag } => {
                if let Some(pos) = game.flags.iter().position(|f| f.id == flag.id) {
                    game.flags.remove(pos);
                }
            }
            ChangeRecord::FlagDeleted { flag, index } => {
                if *index <= game.flags.len() {
                    game.flags.insert(*index, flag.clone());
                }
            }
            ChangeRecord::FlagNameChanged { flag_id, old_value, .. } => {
                if let Some(flag) = game.flags.iter_mut().find(|f| f.id == *flag_id) {
                    flag.name = old_value.clone();
                }
            }
            ChangeRecord::FlagDescriptionChanged { flag_id, old_value, .. } => {
                if let Some(flag) = game.flags.iter_mut().find(|f| f.id == *flag_id) {
                    flag.description = old_value.clone();
                }
            }

            // Message changes
            ChangeRecord::MessageAdded { message } => {
                if let Some(pos) = game.messages.iter().position(|m| m == message) {
                    game.messages.remove(pos);
                }
            }
            ChangeRecord::MessageDeleted { message, index } => {
                if *index <= game.messages.len() {
                    game.messages.insert(*index, message.clone());
                }
            }
            ChangeRecord::MessageChanged { index, old_value, .. } => {
                if *index < game.messages.len() {
                    game.messages[*index] = old_value.clone();
                }
            }

            // Vocabulary changes
            ChangeRecord::VocabularyAdded { word, word_type } => {
                // Remove the added vocabulary entry
                if let Some(pos) = game.vocabulary.iter().position(|v| v.word == *word && v.word_type == *word_type) {
                    game.vocabulary.remove(pos);
                }
            }
            ChangeRecord::VocabularyRemoved { word, word_type, index } => {
                // Re-insert at original position
                if *index <= game.vocabulary.len() {
                    // Find what ID it should have (or use the index as the ID)
                    let entry_id = game.vocabulary
                        .iter()
                        .map(|v| v.id)
                        .max()
                        .map_or(0, |max_id| max_id + 1);

                    game.vocabulary.insert(*index, crate::daad::game::VocabEntry {
                        word: word.clone(),
                        word_type: *word_type,
                        id: entry_id,
                        translations: std::collections::HashMap::new(),
                    });
                }
            }
        }
    }

    /// Get a human-readable description of this change
    pub fn description(&self) -> String {
        match self {
            ChangeRecord::LocationNameChanged { location_id, new_value, .. } => {
                format!("Changed location #{} name to '{}'", location_id, new_value)
            }
            ChangeRecord::LocationDescriptionChanged { location_id, .. } => {
                format!("Changed location #{} description", location_id)
            }
            ChangeRecord::LocationDarkChanged { location_id, new_value, .. } => {
                format!("Set location #{} dark: {}", location_id, new_value)
            }
            ChangeRecord::LocationAdded { location } => {
                format!("Added location '{}'", location.name)
            }
            ChangeRecord::LocationDeleted { location, .. } => {
                format!("Deleted location '{}'", location.name)
            }
            ChangeRecord::ConnectionAdded { location_id, connection } => {
                format!("Added {:?} connection from location #{}", connection.direction, location_id)
            }
            ChangeRecord::ConnectionRemoved { location_id, connection, .. } => {
                format!("Removed {:?} connection from location #{}", connection.direction, location_id)
            }
            ChangeRecord::ConnectionModified { location_id, new_connection, .. } => {
                format!("Modified {:?} connection from location #{}", new_connection.direction, location_id)
            }
            ChangeRecord::ObjectNameChanged { object_id, new_value, .. } => {
                format!("Changed object #{} name to '{}'", object_id, new_value)
            }
            ChangeRecord::ObjectAdjectiveChanged { object_id, new_value, .. } => {
                format!("Changed object #{} adjective to '{}'", object_id, new_value)
            }
            ChangeRecord::ObjectNounChanged { object_id, new_value, .. } => {
                format!("Changed object #{} noun to '{}'", object_id, new_value)
            }
            ChangeRecord::ObjectDescriptionChanged { object_id, .. } => {
                format!("Changed object #{} description", object_id)
            }
            ChangeRecord::ObjectWeightChanged { object_id, new_value, .. } => {
                format!("Changed object #{} weight to {}", object_id, new_value)
            }
            ChangeRecord::ObjectFlagsChanged { object_id, .. } => {
                format!("Changed object #{} flags", object_id)
            }
            ChangeRecord::ObjectAdded { object } => {
                format!("Added object '{}'", object.name)
            }
            ChangeRecord::ObjectDeleted { object, .. } => {
                format!("Deleted object '{}'", object.name)
            }
            ChangeRecord::RuleAdded { rule } => {
                format!("Added rule '{}'", rule.name)
            }
            ChangeRecord::RuleDeleted { rule, .. } => {
                format!("Deleted rule '{}'", rule.name)
            }
            ChangeRecord::RuleNameChanged { rule_id, new_value, .. } => {
                format!("Changed rule #{} name to '{}'", rule_id, new_value)
            }
            ChangeRecord::RuleEnabledChanged { rule_id, new_value, .. } => {
                format!("Set rule #{} enabled: {}", rule_id, new_value)
            }
            ChangeRecord::FlagAdded { flag } => {
                format!("Added flag '{}'", flag.name)
            }
            ChangeRecord::FlagDeleted { flag, .. } => {
                format!("Deleted flag '{}'", flag.name)
            }
            ChangeRecord::FlagNameChanged { flag_id, new_value, .. } => {
                format!("Changed flag #{} name to '{}'", flag_id, new_value)
            }
            ChangeRecord::FlagDescriptionChanged { flag_id, .. } => {
                format!("Changed flag #{} description", flag_id)
            }
            ChangeRecord::MessageAdded { message } => {
                let preview = if message.len() > 30 {
                    format!("{}...", &message[..30])
                } else {
                    message.clone()
                };
                format!("Added message '{}'", preview)
            }
            ChangeRecord::MessageDeleted { message, .. } => {
                let preview = if message.len() > 30 {
                    format!("{}...", &message[..30])
                } else {
                    message.clone()
                };
                format!("Deleted message '{}'", preview)
            }
            ChangeRecord::MessageChanged { index, .. } => {
                format!("Changed message #{}", index)
            }
            ChangeRecord::VocabularyAdded { word, word_type } => {
                format!("Added {:?} '{}'", word_type, word)
            }
            ChangeRecord::VocabularyRemoved { word, word_type, .. } => {
                format!("Removed {:?} '{}'", word_type, word)
            }
        }
    }
}

/// Undo/Redo manager resource
#[derive(Resource)]
pub struct UndoRedoManager {
    undo_stack: Vec<ChangeRecord>,
    redo_stack: Vec<ChangeRecord>,
    max_history: usize,
}

impl Default for UndoRedoManager {
    fn default() -> Self {
        Self {
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
            max_history: 100, // Keep last 100 changes
        }
    }
}

impl UndoRedoManager {
    /// Record a new change
    pub fn push_change(&mut self, change: ChangeRecord) {
        // Clear redo stack when new change is made
        self.redo_stack.clear();

        // Add to undo stack
        self.undo_stack.push(change);

        // Limit history size
        if self.undo_stack.len() > self.max_history {
            self.undo_stack.remove(0);
        }
    }

    /// Check if undo is available
    pub fn can_undo(&self) -> bool {
        !self.undo_stack.is_empty()
    }

    /// Check if redo is available
    pub fn can_redo(&self) -> bool {
        !self.redo_stack.is_empty()
    }

    /// Undo the last change
    pub fn undo(&mut self, game: &mut crate::daad::game::DaadGame) -> Option<String> {
        if let Some(change) = self.undo_stack.pop() {
            let description = change.description();
            change.reverse(game);
            self.redo_stack.push(change);
            Some(description)
        } else {
            None
        }
    }

    /// Redo the last undone change
    pub fn redo(&mut self, game: &mut crate::daad::game::DaadGame) -> Option<String> {
        if let Some(change) = self.redo_stack.pop() {
            let description = change.description();
            change.apply(game);
            self.undo_stack.push(change);
            Some(description)
        } else {
            None
        }
    }

    /// Get the description of the next undo operation
    pub fn undo_description(&self) -> Option<String> {
        self.undo_stack.last().map(|c| c.description())
    }

    /// Get the description of the next redo operation
    pub fn redo_description(&self) -> Option<String> {
        self.redo_stack.last().map(|c| c.description())
    }

    /// Clear all history
    pub fn clear(&mut self) {
        self.undo_stack.clear();
        self.redo_stack.clear();
    }
}
