use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode, Panel};
use crate::daad::types::ObjectLocation;

/// Render object sidebar when Objects panel is active
pub fn render_object_sidebar(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<ObjectSidebar>>,
) {
    // Only render when Objects panel is active
    if state.selected_panel != Panel::Objects {
        return;
    }

    // Clean up old sidebar
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create object sidebar
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    right: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Px(250.0),
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
            ObjectSidebar,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "📦 Objects",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            // Add new object button
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
                    AddObjectButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "+ Add Object",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // List all objects
            for object in &state.current_game.objects {
                let is_selected = matches!(state.editing, Some(EditMode::Object(id)) if id == object.id);

                parent
                    .spawn((
                        NodeBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(8.0)),
                                border: UiRect::all(Val::Px(2.0)),
                                flex_direction: FlexDirection::Column,
                                row_gap: Val::Px(6.0),
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
                        ObjectCard {
                            object_id: object.id,
                        },
                    ))
                    .with_children(|card| {
                        // Object icon and name
                        card.spawn(TextBundle::from_section(
                            format!("{} {}", object.icon, object.name),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));

                        // Adjective and noun
                        card.spawn(TextBundle::from_section(
                            format!("{} {}", object.adjective, object.noun),
                            TextStyle {
                                font_size: 11.0,
                                color: Color::rgb(0.8, 0.9, 1.0),
                                ..default()
                            },
                        ));

                        // Location info
                        let location_text = match &object.location {
                            ObjectLocation::Location(loc_id) => {
                                if let Some(loc) = state.current_game.locations.iter().find(|l| l.id == *loc_id) {
                                    format!("📍 {}", loc.name)
                                } else {
                                    format!("📍 Location {}", loc_id)
                                }
                            }
                            ObjectLocation::Carried => "👤 Carried".to_string(),
                            ObjectLocation::Worn => "👕 Worn".to_string(),
                            ObjectLocation::Limbo => "🌫️ Limbo".to_string(),
                            ObjectLocation::Inside(container_id) => {
                                if let Some(container) = state.current_game.objects.iter().find(|o| o.id == *container_id) {
                                    format!("📦 Inside {}", container.name)
                                } else {
                                    format!("📦 Inside #{}", container_id)
                                }
                            }
                        };

                        card.spawn(TextBundle::from_section(
                            location_text,
                            TextStyle {
                                font_size: 10.0,
                                color: Color::rgb(0.6, 0.6, 0.6),
                                ..default()
                            },
                        ));

                        // Edit/Delete button row
                        card.spawn(NodeBundle {
                            style: Style {
                                display: Display::Flex,
                                flex_direction: FlexDirection::Row,
                                column_gap: Val::Px(6.0),
                                margin: UiRect::top(Val::Px(4.0)),
                                ..default()
                            },
                            ..default()
                        })
                        .with_children(|row| {
                            // Edit button
                            row.spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::axes(Val::Px(10.0), Val::Px(5.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.4, 0.5, 0.6).into(),
                                    ..default()
                                },
                                EditObjectButton {
                                    object_id: object.id,
                                },
                            ))
                            .with_children(|btn| {
                                btn.spawn(TextBundle::from_section(
                                    "✏️ Edit",
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
                                        padding: UiRect::axes(Val::Px(10.0), Val::Px(5.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.6, 0.3, 0.3).into(),
                                    ..default()
                                },
                                DeleteObjectButton {
                                    object_id: object.id,
                                },
                            ))
                            .with_children(|btn| {
                                btn.spawn(TextBundle::from_section(
                                    "🗑️ Delete",
                                    TextStyle {
                                        font_size: 11.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });
                        });
                    });
            }

            // Instructions
            parent.spawn(TextBundle::from_section(
                "\nDrag objects to locations\nClick to edit properties",
                TextStyle {
                    font_size: 10.0,
                    color: Color::rgb(0.5, 0.5, 0.5),
                    ..default()
                },
            ));
        });
}

// Note: Object card selection removed - cards are now display-only containers
// with Edit/Delete button actions instead

/// Handle add object button
pub fn handle_add_object_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<AddObjectButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Add new object
            let object_count = state.current_game.objects.len();
            let new_id = state.current_game.add_object(
                &format!("Object {}", object_count + 1),
                "thing",
                &format!("A newly created object."),
            );

            state.unsaved_changes = true;
            state.editing = Some(EditMode::Object(new_id));
            info!("Created new object {}", new_id);
        }
    }
}

/// Handle object dragging to location nodes (simplified for now)
/// TODO: Implement proper drag-and-drop with mouse position tracking
pub fn handle_object_to_location_drag(
    _state: ResMut<BuilderState>,
    _mouse_button: Res<Input<MouseButton>>,
) {
    // This will be implemented when we add proper drag-and-drop interaction
    // For now, objects can be moved by editing their properties directly
}

/// Handle edit object button (opens text input modal)
pub fn handle_edit_object_button(
    state: Res<BuilderState>,
    mut text_modal: ResMut<crate::builder::ui::components::TextInputModalState>,
    mut interaction_query: Query<
        (&Interaction, &EditObjectButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(object) = state.current_game.objects.iter().find(|o| o.id == button.object_id) {
                text_modal.open_single_line(
                    "Edit Object Name",
                    &object.name,
                    "Enter object name...",
                    &format!("object_{}", button.object_id),
                );
                info!("Opening edit modal for object {}", button.object_id);
            }
        }
    }
}

/// Handle delete object button
pub fn handle_delete_object_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteObjectButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(idx) = state.current_game.objects.iter().position(|o| o.id == button.object_id) {
                state.current_game.objects.remove(idx);
                state.unsaved_changes = true;
                info!("Deleted object {}", button.object_id);
            }
        }
    }
}

/// Render object property panel when an object is selected
pub fn render_object_property_panel(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<ObjectPropertyPanel>>,
) {
    // Get selected object ID
    let selected_object_id = match state.editing {
        Some(EditMode::Object(id)) => id,
        _ => {
            // Clean up panel if nothing selected
            for entity in query.iter() {
                commands.entity(entity).despawn_recursive();
            }
            return;
        }
    };

    // Find the selected object
    let object = match state.current_game.objects.iter().find(|o| o.id == selected_object_id) {
        Some(obj) => obj,
        None => {
            for entity in query.iter() {
                commands.entity(entity).despawn_recursive();
            }
            return;
        }
    };

    // Clean up old panel
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create property panel (left side of screen)
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Px(350.0),
                    height: Val::Percent(70.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(15.0)),
                    row_gap: Val::Px(12.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.15, 0.15, 0.2, 0.95).into(),
                border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                ..default()
            },
            ObjectPropertyPanel,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                format!("{} Object Properties", object.icon),
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            // Name
            add_property_row(parent, "Name:", &object.name, "object_name");

            // Adjective
            add_property_row(parent, "Adjective:", &object.adjective, "object_adj");

            // Noun
            add_property_row(parent, "Noun:", &object.noun, "object_noun");

            // Description
            parent.spawn(TextBundle::from_section(
                "Description:",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.25, 0.25, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.4, 0.5).into(),
                        ..default()
                    },
                    EditObjectDescriptionButton { object_id: object.id },
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        &object.description,
                        TextStyle {
                            font_size: 12.0,
                            color: Color::rgb(0.9, 0.9, 0.9),
                            ..default()
                        },
                    ));
                });

            // Weight
            parent.spawn(NodeBundle {
                style: Style {
                    flex_direction: FlexDirection::Row,
                    align_items: AlignItems::Center,
                    column_gap: Val::Px(10.0),
                    ..default()
                },
                ..default()
            })
            .with_children(|row| {
                row.spawn(TextBundle::from_section(
                    format!("⚖️ Weight: {}", object.weight),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));

                // Decrease button
                row.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(8.0), Val::Px(4.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                        ..default()
                    },
                    DecreaseWeightButton { object_id: object.id },
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "-",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

                // Increase button
                row.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(8.0), Val::Px(4.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                        ..default()
                    },
                    IncreaseWeightButton { object_id: object.id },
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "+",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
            });

            // Boolean properties
            add_toggle_row(parent, "📦 Container", object.is_container, ToggleContainerButton { object_id: object.id });
            add_toggle_row(parent, "👕 Wearable", object.is_wearable, ToggleWearableButton { object_id: object.id });
            add_toggle_row(parent, "✋ Takeable", object.is_takeable, ToggleTakeableButton { object_id: object.id });

            // Location (with button to change)
            parent.spawn(TextBundle::from_section(
                "Location:",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            let location_text = match &object.location {
                ObjectLocation::Location(loc_id) => {
                    if let Some(loc) = state.current_game.locations.iter().find(|l| l.id == *loc_id) {
                        format!("📍 {}", loc.name)
                    } else {
                        format!("📍 Location {}", loc_id)
                    }
                }
                ObjectLocation::Carried => "👤 Carried".to_string(),
                ObjectLocation::Worn => "👕 Worn".to_string(),
                ObjectLocation::Limbo => "🌫️ Limbo".to_string(),
                ObjectLocation::Inside(container_id) => {
                    if let Some(container) = state.current_game.objects.iter().find(|o| o.id == *container_id) {
                        format!("📦 Inside {}", container.name)
                    } else {
                        format!("📦 Inside #{}", container_id)
                    }
                }
            };

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.25, 0.25, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.4, 0.5).into(),
                        ..default()
                    },
                    ChangeLocationButton { object_id: object.id },
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        location_text,
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Hint text
            parent.spawn(TextBundle::from_section(
                "\nClick any property to edit",
                TextStyle {
                    font_size: 10.0,
                    color: Color::rgb(0.5, 0.5, 0.5),
                    ..default()
                },
            ));
        });
}

/// Helper to add a text property row with edit button
fn add_property_row(parent: &mut ChildBuilder, label: &str, value: &str, _callback_id: &str) {
    parent.spawn(TextBundle::from_section(
        label,
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        value,
        TextStyle {
            font_size: 13.0,
            color: Color::WHITE,
            ..default()
        },
    ));
}

/// Helper to add a toggle property row
fn add_toggle_row<T: Component>(parent: &mut ChildBuilder, label: &str, is_enabled: bool, component: T) {
    parent
        .spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(8.0)),
                    border: UiRect::all(Val::Px(1.0)),
                    ..default()
                },
                background_color: if is_enabled {
                    Color::rgb(0.3, 0.6, 0.3)
                } else {
                    Color::rgb(0.5, 0.3, 0.3)
                }.into(),
                border_color: if is_enabled {
                    Color::rgb(0.4, 0.8, 0.4)
                } else {
                    Color::rgb(0.6, 0.4, 0.4)
                }.into(),
                ..default()
            },
            component,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section(
                format!("{} {}", label, if is_enabled { "✓" } else { "✗" }),
                TextStyle {
                    font_size: 12.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });
}

// Components
#[derive(Component)]
pub(crate) struct ObjectSidebar;

#[derive(Component)]
pub(crate) struct ObjectPropertyPanel;

#[derive(Component)]
pub(crate) struct ObjectCard {
    object_id: u8,
}

#[derive(Component)]
pub(crate) struct AddObjectButton;

#[derive(Component)]
pub(crate) struct EditObjectButton {
    object_id: u8,
}

#[derive(Component)]
pub(crate) struct DeleteObjectButton {
    object_id: u8,
}

// Property panel button components
#[derive(Component)]
pub struct EditObjectDescriptionButton {
    object_id: u8,
}

#[derive(Component)]
pub struct DecreaseWeightButton {
    object_id: u8,
}

#[derive(Component)]
pub struct IncreaseWeightButton {
    object_id: u8,
}

#[derive(Component)]
pub struct ToggleContainerButton {
    object_id: u8,
}

#[derive(Component)]
pub struct ToggleWearableButton {
    object_id: u8,
}

#[derive(Component)]
pub struct ToggleTakeableButton {
    object_id: u8,
}

#[derive(Component)]
pub struct ChangeLocationButton {
    object_id: u8,
}

/// Handle edit description button
pub fn handle_edit_description_button(
    state: Res<BuilderState>,
    mut text_modal: ResMut<crate::builder::ui::components::TextInputModalState>,
    mut interaction_query: Query<
        (&Interaction, &EditObjectDescriptionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(object) = state.current_game.objects.iter().find(|o| o.id == button.object_id) {
                text_modal.open_multiline(
                    "Edit Object Description",
                    &object.description,
                    "Enter object description...",
                    &format!("object_desc_{}", button.object_id),
                );
            }
        }
    }
}

/// Handle decrease weight button
pub fn handle_decrease_weight_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DecreaseWeightButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(object) = state.current_game.objects.iter_mut().find(|o| o.id == button.object_id) {
                if object.weight > 0 {
                    object.weight -= 1;
                    state.unsaved_changes = true;
                }
            }
        }
    }
}

/// Handle increase weight button
pub fn handle_increase_weight_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &IncreaseWeightButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(object) = state.current_game.objects.iter_mut().find(|o| o.id == button.object_id) {
                if object.weight < 255 {
                    object.weight += 1;
                    state.unsaved_changes = true;
                }
            }
        }
    }
}

/// Handle toggle container button
pub fn handle_toggle_container_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ToggleContainerButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(object) = state.current_game.objects.iter_mut().find(|o| o.id == button.object_id) {
                object.is_container = !object.is_container;
                state.unsaved_changes = true;
            }
        }
    }
}

/// Handle toggle wearable button
pub fn handle_toggle_wearable_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ToggleWearableButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(object) = state.current_game.objects.iter_mut().find(|o| o.id == button.object_id) {
                object.is_wearable = !object.is_wearable;
                state.unsaved_changes = true;
            }
        }
    }
}

/// Handle toggle takeable button
pub fn handle_toggle_takeable_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ToggleTakeableButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(object) = state.current_game.objects.iter_mut().find(|o| o.id == button.object_id) {
                object.is_takeable = !object.is_takeable;
                state.unsaved_changes = true;
            }
        }
    }
}
