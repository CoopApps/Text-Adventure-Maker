use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode, Panel};
use crate::daad::types::{Location, Connection, Direction};

/// Visual location editor - drag-and-drop placement
pub fn render_location_editor(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<LocationEditorCanvas>>,
) {
    // Only render when Locations panel is active
    if state.selected_panel != Panel::Locations {
        return;
    }

    // Clean up old canvas
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create visual editor canvas
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Percent(100.0),
                    position_type: PositionType::Absolute,
                    ..default()
                },
                background_color: Color::rgb(0.08, 0.08, 0.12).into(),
                ..default()
            },
            LocationEditorCanvas,
        ))
        .with_children(|parent| {
            // Render grid background
            render_grid(parent);

            // Render connections first (so they appear behind nodes)
            for location in &state.current_game.locations {
                for connection in &location.connections {
                    render_connection_line(parent, location, connection, &state);
                }
            }

            // Render location nodes
            for location in &state.current_game.locations {
                render_location_node(parent, location, &state);
            }

            // Render toolbar
            render_editor_toolbar(parent, &state);

            // Render property panel if editing
            if let Some(EditMode::Location(id)) = state.editing {
                if let Some(location) = state.current_game.locations.iter().find(|l| l.id == id) {
                    render_property_panel(parent, location, &state);
                }
            }
        });
}

fn render_grid(parent: &mut ChildBuilder) {
    // Grid helper lines
    for i in 0..20 {
        // Vertical lines
        parent.spawn(NodeBundle {
            style: Style {
                position_type: PositionType::Absolute,
                left: Val::Percent(i as f32 * 5.0),
                width: Val::Px(1.0),
                height: Val::Percent(100.0),
                ..default()
            },
            background_color: Color::rgba(0.2, 0.2, 0.25, 0.3).into(),
            ..default()
        });

        // Horizontal lines
        parent.spawn(NodeBundle {
            style: Style {
                position_type: PositionType::Absolute,
                top: Val::Percent(i as f32 * 5.0),
                height: Val::Px(1.0),
                width: Val::Percent(100.0),
                ..default()
            },
            background_color: Color::rgba(0.2, 0.2, 0.25, 0.3).into(),
            ..default()
        });
    }
}

fn render_connection_line(
    parent: &mut ChildBuilder,
    from_location: &Location,
    connection: &Connection,
    state: &BuilderState,
) {
    // Find the target location
    if let Some(to_location) = state.current_game.locations.iter().find(|l| l.id == connection.target_location) {
        let from_pos = from_location.editor_position;
        let to_pos = to_location.editor_position;

        // Calculate line angle and length
        let dx = to_pos.x - from_pos.x;
        let dy = to_pos.y - from_pos.y;
        let length = (dx * dx + dy * dy).sqrt();
        let angle = dy.atan2(dx);

        // Create connection line
        parent.spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(from_pos.x),
                    top: Val::Px(from_pos.y),
                    width: Val::Px(length),
                    height: Val::Px(2.0),
                    ..default()
                },
                background_color: Color::rgb(0.4, 0.6, 0.8).into(),
                transform: Transform::from_rotation(Quat::from_rotation_z(angle)),
                ..default()
            },
            ConnectionLine {
                from_location: from_location.id,
                to_location: connection.target_location,
                direction: connection.direction,
            },
        ));

        // Label with direction
        parent.spawn(TextBundle::from_section(
            format!("{:?}", connection.direction),
            TextStyle {
                font_size: 10.0,
                color: Color::rgb(0.6, 0.8, 1.0),
                ..default()
            },
        ).with_style(Style {
            position_type: PositionType::Absolute,
            left: Val::Px((from_pos.x + to_pos.x) / 2.0),
            top: Val::Px((from_pos.y + to_pos.y) / 2.0 - 10.0),
            ..default()
        }));
    }
}

fn render_location_node(
    parent: &mut ChildBuilder,
    location: &Location,
    state: &BuilderState,
) {
    let is_selected = matches!(state.editing, Some(EditMode::Location(id)) if id == location.id);

    parent
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(location.editor_position.x),
                    top: Val::Px(location.editor_position.y),
                    width: Val::Px(140.0),
                    min_height: Val::Px(100.0),
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Center,
                    padding: UiRect::all(Val::Px(8.0)),
                    row_gap: Val::Px(4.0),
                    border: UiRect::all(Val::Px(3.0)),
                    ..default()
                },
                background_color: if is_selected {
                    Color::rgb(0.4, 0.6, 0.9)
                } else {
                    location.editor_color
                }.into(),
                border_color: if is_selected {
                    Color::rgb(1.0, 1.0, 0.5)
                } else {
                    Color::rgb(0.3, 0.5, 0.7)
                }.into(),
                ..default()
            },
            LocationNode {
                location_id: location.id,
            },
        ))
        .with_children(|node| {
            // Clickable area to select location
            node.spawn((
                ButtonBundle {
                    style: Style {
                        width: Val::Percent(100.0),
                        flex_direction: FlexDirection::Column,
                        align_items: AlignItems::Center,
                        justify_content: JustifyContent::Center,
                        row_gap: Val::Px(2.0),
                        padding: UiRect::all(Val::Px(4.0)),
                        ..default()
                    },
                    background_color: Color::NONE.into(),
                    ..default()
                },
                LocationNodeClickArea {
                    location_id: location.id,
                },
            ))
            .with_children(|area| {
                // Location ID
                area.spawn(TextBundle::from_section(
                    format!("#{}", location.id),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgba(1.0, 1.0, 1.0, 0.7),
                        ..default()
                    },
                ));

                // Location name
                area.spawn(TextBundle::from_section(
                    &location.name,
                    TextStyle {
                        font_size: 14.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));

                // Dark indicator
                if location.is_dark {
                    area.spawn(TextBundle::from_section(
                        "🌑 Dark",
                        TextStyle {
                            font_size: 11.0,
                            color: Color::rgb(0.8, 0.8, 1.0),
                            ..default()
                        },
                    ));
                }

                // Connection count
                if !location.connections.is_empty() {
                    area.spawn(TextBundle::from_section(
                        format!("🔗 {} exits", location.connections.len()),
                        TextStyle {
                            font_size: 10.0,
                            color: Color::rgba(1.0, 1.0, 1.0, 0.6),
                            ..default()
                        },
                    ));
                }
            });

            // Button row (Edit and Delete)
            node.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    flex_direction: FlexDirection::Row,
                    justify_content: JustifyContent::Center,
                    column_gap: Val::Px(4.0),
                    margin: UiRect::top(Val::Px(4.0)),
                    ..default()
                },
                ..default()
            })
            .with_children(|button_row| {
                // Edit button
                button_row
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(4.0)),
                                border: UiRect::all(Val::Px(1.0)),
                                flex_grow: 1.0,
                                justify_content: JustifyContent::Center,
                                ..default()
                            },
                            background_color: Color::rgb(0.35, 0.5, 0.65).into(),
                            border_color: Color::rgb(0.5, 0.7, 0.9).into(),
                            ..default()
                        },
                        EditLocationButton {
                            location_id: location.id,
                        },
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "✏️",
                            TextStyle {
                                font_size: 12.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });

                // Delete button
                button_row
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(4.0)),
                                border: UiRect::all(Val::Px(1.0)),
                                flex_grow: 1.0,
                                justify_content: JustifyContent::Center,
                                ..default()
                            },
                            background_color: Color::rgb(0.65, 0.35, 0.35).into(),
                            border_color: Color::rgb(0.9, 0.5, 0.5).into(),
                            ..default()
                        },
                        DeleteLocationButton {
                            location_id: location.id,
                        },
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "🗑️",
                            TextStyle {
                                font_size: 12.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });
            });
        });
}

fn render_editor_toolbar(parent: &mut ChildBuilder, _state: &BuilderState) {
    parent
        .spawn(NodeBundle {
            style: Style {
                position_type: PositionType::Absolute,
                top: Val::Px(10.0),
                right: Val::Px(10.0),
                flex_direction: FlexDirection::Column,
                padding: UiRect::all(Val::Px(10.0)),
                row_gap: Val::Px(5.0),
                border: UiRect::all(Val::Px(2.0)),
                ..default()
            },
            background_color: Color::rgba(0.12, 0.12, 0.18, 0.9).into(),
            border_color: Color::rgb(0.3, 0.3, 0.35).into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                "Location Editor",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            // Add location button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                        ..default()
                    },
                    AddLocationButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "+ Add Location",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Instructions
            parent.spawn(TextBundle::from_section(
                "Click nodes to edit\nDrag to reposition\nRight-click to connect",
                TextStyle {
                    font_size: 10.0,
                    color: Color::rgb(0.5, 0.5, 0.5),
                    ..default()
                },
            ));
        });
}

fn render_property_panel(parent: &mut ChildBuilder, location: &Location, _state: &BuilderState) {
    parent
        .spawn(NodeBundle {
            style: Style {
                position_type: PositionType::Absolute,
                left: Val::Px(10.0),
                top: Val::Px(10.0),
                width: Val::Px(300.0),
                flex_direction: FlexDirection::Column,
                padding: UiRect::all(Val::Px(15.0)),
                row_gap: Val::Px(10.0),
                border: UiRect::all(Val::Px(2.0)),
                ..default()
            },
            background_color: Color::rgba(0.15, 0.15, 0.2, 0.95).into(),
            border_color: Color::rgb(0.4, 0.6, 0.8).into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                format!("Edit Location #{}", location.id),
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("Name: {}", location.name),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("Description: {}", location.description),
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("Dark: {}", location.is_dark),
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("Connections ({}):", location.connections.len()),
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.7, 0.9, 1.0),
                    ..default()
                },
            ));

            // List connections with edit/delete buttons
            for (idx, conn) in location.connections.iter().enumerate() {
                parent.spawn(NodeBundle {
                    style: Style {
                        display: Display::Flex,
                        flex_direction: FlexDirection::Row,
                        align_items: AlignItems::Center,
                        padding: UiRect::all(Val::Px(6.0)),
                        margin: UiRect::vertical(Val::Px(3.0)),
                        column_gap: Val::Px(8.0),
                        border: UiRect::all(Val::Px(1.0)),
                        ..default()
                    },
                    background_color: Color::rgba(0.2, 0.25, 0.3, 0.4).into(),
                    border_color: Color::rgb(0.3, 0.4, 0.5).into(),
                    ..default()
                })
                .with_children(|row| {
                    // Connection info
                    row.spawn(TextBundle::from_section(
                        format!("{:?} → Loc #{}", conn.direction, conn.target_location),
                        TextStyle {
                            font_size: 11.0,
                            color: Color::rgb(0.8, 0.9, 1.0),
                            ..default()
                        },
                    ));

                    // Spacer
                    row.spawn(NodeBundle {
                        style: Style {
                            flex_grow: 1.0,
                            ..default()
                        },
                        ..default()
                    });

                    // Edit button
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(6.0), Val::Px(4.0)),
                                border: UiRect::all(Val::Px(1.0)),
                                margin: UiRect::right(Val::Px(4.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.4, 0.5, 0.6).into(),
                            border_color: Color::rgb(0.5, 0.6, 0.7).into(),
                            ..default()
                        },
                        EditConnectionButton {
                            location_id: location.id,
                            connection_index: idx,
                            direction: conn.direction,
                            target: conn.target_location,
                        },
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "✏️",
                            TextStyle {
                                font_size: 10.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });

                    // Delete button
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(6.0), Val::Px(4.0)),
                                border: UiRect::all(Val::Px(1.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.6, 0.3, 0.3).into(),
                            border_color: Color::rgb(0.7, 0.4, 0.4).into(),
                            ..default()
                        },
                        DeleteConnectionButton {
                            location_id: location.id,
                            connection_index: idx,
                        },
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "🗑️",
                            TextStyle {
                                font_size: 10.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });
                });
            }

            // Add connection button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::top(Val::Px(5.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.5).into(),
                        border_color: Color::rgb(0.4, 0.7, 0.6).into(),
                        ..default()
                    },
                    AddConnectionButton { location_id: location.id },
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "+ Add Connection",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Edit buttons (TODO: wire up actual editing)
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::top(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                        ..default()
                    },
                    EditLocationPropertiesButton { location_id: location.id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "Edit Properties...",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.7, 0.3, 0.3).into(),
                        border_color: Color::rgb(0.8, 0.4, 0.4).into(),
                        ..default()
                    },
                    DeleteLocationButton { location_id: location.id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "Delete Location",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
        });
}

/// Handle location node clicks (select for editing)
pub fn handle_location_node_clicks(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &LocationNodeClickArea),
        Changed<Interaction>,
    >,
) {
    for (interaction, click_area) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            state.editing = Some(EditMode::Location(click_area.location_id));
            info!("Selected location {}", click_area.location_id);
        }
    }
}

/// Handle add location button
pub fn handle_add_location_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<AddLocationButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Add new location at center of canvas
            let location_count = state.current_game.locations.len();
            let new_id = state.current_game.add_location(
                &format!("Location {}", location_count + 1),
                "A new location waiting to be described.",
            );

            // Set initial position
            if let Some(location) = state.current_game.locations.iter_mut().find(|l| l.id == new_id) {
                location.editor_position = Vec2::new(400.0, 300.0);
            }

            state.unsaved_changes = true;
            state.editing = Some(EditMode::Location(new_id));
        }
    }
}

/// Handle location node dragging
pub fn handle_location_drag(
    mut state: ResMut<BuilderState>,
    mouse_button: Res<Input<MouseButton>>,
    windows: Query<&Window>,
    mut drag_state: Local<Option<LocationDragState>>,
    location_query: Query<(&LocationNode, &Node, &GlobalTransform)>,
) {
    let window = windows.single();

    if mouse_button.just_pressed(MouseButton::Left) {
        // Start drag if clicking on a location
        if let Some(cursor_pos) = window.cursor_position() {
            for (node, _ui_node, _transform) in location_query.iter() {
                // Check if cursor is over this location node
                // (simplified - proper bounds checking would be more complex)
                if let Some(location) = state.current_game.locations.iter().find(|l| l.id == node.location_id) {
                    let node_pos = location.editor_position;
                    let dx = cursor_pos.x - node_pos.x;
                    let dy = cursor_pos.y - node_pos.y;

                    if dx.abs() < 60.0 && dy.abs() < 40.0 {
                        *drag_state = Some(LocationDragState {
                            location_id: node.location_id,
                            offset: Vec2::new(dx, dy),
                        });
                        break;
                    }
                }
            }
        }
    }

    if mouse_button.pressed(MouseButton::Left) {
        if let Some(drag) = &*drag_state {
            if let Some(cursor_pos) = window.cursor_position() {
                if let Some(location) = state.current_game.locations.iter_mut().find(|l| l.id == drag.location_id) {
                    location.editor_position = Vec2::new(
                        cursor_pos.x - drag.offset.x,
                        cursor_pos.y - drag.offset.y,
                    );
                    state.unsaved_changes = true;
                }
            }
        }
    }

    if mouse_button.just_released(MouseButton::Left) {
        *drag_state = None;
    }
}

/// Handle connection creation (right-click drag between locations)
pub fn handle_connection_creation(
    mut state: ResMut<BuilderState>,
    mouse_button: Res<Input<MouseButton>>,
    windows: Query<&Window>,
    mut connection_state: Local<Option<ConnectionCreationState>>,
    location_query: Query<(&LocationNode, &Node, &GlobalTransform)>,
) {
    let window = windows.single();

    if mouse_button.just_pressed(MouseButton::Right) {
        // Start connection creation if right-clicking on a location
        if let Some(cursor_pos) = window.cursor_position() {
            for (node, _ui_node, _transform) in location_query.iter() {
                if let Some(location) = state.current_game.locations.iter().find(|l| l.id == node.location_id) {
                    let node_pos = location.editor_position;
                    let dx = cursor_pos.x - node_pos.x;
                    let dy = cursor_pos.y - node_pos.y;

                    if dx.abs() < 60.0 && dy.abs() < 40.0 {
                        *connection_state = Some(ConnectionCreationState {
                            from_location_id: node.location_id,
                            current_cursor: cursor_pos,
                        });
                        info!("Started connection from location {}", node.location_id);
                        break;
                    }
                }
            }
        }
    }

    if mouse_button.pressed(MouseButton::Right) {
        if let Some(conn_state) = connection_state.as_mut() {
            if let Some(cursor_pos) = window.cursor_position() {
                conn_state.current_cursor = cursor_pos;
            }
        }
    }

    if mouse_button.just_released(MouseButton::Right) {
        if let Some(conn_state) = &*connection_state {
            if let Some(cursor_pos) = window.cursor_position() {
                // Find if we released over a location
                for (node, _ui_node, _transform) in location_query.iter() {
                    if let Some(location) = state.current_game.locations.iter().find(|l| l.id == node.location_id) {
                        let node_pos = location.editor_position;
                        let dx = cursor_pos.x - node_pos.x;
                        let dy = cursor_pos.y - node_pos.y;

                        if dx.abs() < 60.0 && dy.abs() < 40.0 && node.location_id != conn_state.from_location_id {
                            // Create connection
                            let direction = calculate_direction(conn_state.from_location_id, node.location_id, &state);

                            if let Some(from_location) = state.current_game.locations.iter_mut().find(|l| l.id == conn_state.from_location_id) {
                                from_location.connections.push(Connection {
                                    direction,
                                    target_location: node.location_id,
                                    condition: None,
                                });
                                state.unsaved_changes = true;
                                info!("Created connection from {} to {} ({:?})", conn_state.from_location_id, node.location_id, direction);
                            }
                            break;
                        }
                    }
                }
            }
        }
        *connection_state = None;
    }
}

/// Calculate best direction based on relative position
fn calculate_direction(from_id: u8, to_id: u8, state: &BuilderState) -> Direction {
    let from_loc = state.current_game.locations.iter().find(|l| l.id == from_id);
    let to_loc = state.current_game.locations.iter().find(|l| l.id == to_id);

    if let (Some(from), Some(to)) = (from_loc, to_loc) {
        let dx = to.editor_position.x - from.editor_position.x;
        let dy = to.editor_position.y - from.editor_position.y;

        // Determine primary direction based on angle
        let angle = dy.atan2(dx);
        let degrees = angle.to_degrees();

        match degrees {
            d if d >= -22.5 && d < 22.5 => Direction::East,
            d if d >= 22.5 && d < 67.5 => Direction::Southeast,
            d if d >= 67.5 && d < 112.5 => Direction::South,
            d if d >= 112.5 && d < 157.5 => Direction::Southwest,
            d if d >= 157.5 || d < -157.5 => Direction::West,
            d if d >= -157.5 && d < -112.5 => Direction::Northwest,
            d if d >= -112.5 && d < -67.5 => Direction::North,
            d if d >= -67.5 && d < -22.5 => Direction::Northeast,
            _ => Direction::North,
        }
    } else {
        Direction::North
    }
}

/// Render connection preview line while dragging
pub fn render_connection_preview(
    mut commands: Commands,
    connection_state: Local<Option<ConnectionCreationState>>,
    state: Res<BuilderState>,
    query: Query<Entity, With<ConnectionPreview>>,
) {
    // Clean up old preview
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    if let Some(conn_state) = connection_state.as_ref() {
        if let Some(from_location) = state.current_game.locations.iter().find(|l| l.id == conn_state.from_location_id) {
            let from_pos = from_location.editor_position;
            let to_pos = conn_state.current_cursor;

            let dx = to_pos.x - from_pos.x;
            let dy = to_pos.y - from_pos.y;
            let length = (dx * dx + dy * dy).sqrt();
            let angle = dy.atan2(dx);

            // Create preview line
            commands.spawn((
                NodeBundle {
                    style: Style {
                        position_type: PositionType::Absolute,
                        left: Val::Px(from_pos.x),
                        top: Val::Px(from_pos.y),
                        width: Val::Px(length),
                        height: Val::Px(3.0),
                        ..default()
                    },
                    background_color: Color::rgba(1.0, 1.0, 0.5, 0.6).into(),
                    transform: Transform::from_rotation(Quat::from_rotation_z(angle)),
                    ..default()
                },
                ConnectionPreview,
            ));
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct LocationEditorCanvas;

#[derive(Component)]
pub(crate) struct LocationNode {
    location_id: u8,
}

#[derive(Component)]
pub(crate) struct LocationNodeClickArea {
    location_id: u8,
}

#[derive(Component)]
pub(crate) struct EditLocationButton {
    location_id: u8,
}

#[derive(Component)]
pub(crate) struct ConnectionLine {
    from_location: u8,
    to_location: u8,
    direction: Direction,
}

#[derive(Component)]
pub(crate) struct AddLocationButton;

#[derive(Component)]
pub(crate) struct EditLocationPropertiesButton {
    location_id: u8,
}

#[derive(Component)]
pub(crate) struct DeleteLocationButton {
    location_id: u8,
}

#[derive(Component)]
pub(crate) struct AddConnectionButton {
    location_id: u8,
}

#[derive(Component)]
pub(crate) struct EditConnectionButton {
    location_id: u8,
    connection_index: usize,
    direction: Direction,
    target: u8,
}

#[derive(Component)]
pub(crate) struct DeleteConnectionButton {
    location_id: u8,
    connection_index: usize,
}

// Drag state
pub(crate) struct LocationDragState {
    location_id: u8,
    offset: Vec2,
}

// Connection creation state
pub(crate) struct ConnectionCreationState {
    from_location_id: u8,
    current_cursor: Vec2,
}

// Connection preview component
#[derive(Component)]
pub(crate) struct ConnectionPreview;

/// Handle edit location properties button clicks
pub fn handle_edit_location_properties_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &EditLocationPropertiesButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Set editing mode to this location
            state.start_editing(EditMode::Location(button.location_id));
            state.mark_dirty();
            info!("Editing location {}", button.location_id);
        }
    }
}

/// Handle delete location button clicks
pub fn handle_delete_location_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteLocationButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Find and remove the location
            if let Some(pos) = state
                .current_game
                .locations
                .iter()
                .position(|l| l.id == button.location_id)
            {
                state.current_game.locations.remove(pos);
                state.mark_dirty();
                info!("Deleted location {}", button.location_id);

                // Also remove any connections to/from this location
                for location in &mut state.current_game.locations {
                    location.connections.retain(|c| c.target_location != button.location_id);
                }
            }
        }
    }
}

/// Handle edit location button clicks (inline edit button on node)
pub fn handle_edit_location_button(
    state: Res<BuilderState>,
    mut text_modal: ResMut<crate::builder::ui::components::TextInputModalState>,
    mut interaction_query: Query<
        (&Interaction, &EditLocationButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(location) = state.current_game.locations.iter().find(|l| l.id == button.location_id) {
                text_modal.open_single_line(
                    "Edit Location Name",
                    &location.name,
                    "Enter location name...",
                    &format!("edit_location_name_{}", button.location_id),
                );
            }
        }
    }
}

/// Process location name edit from text modal callback
pub fn process_location_name_edit(
    mut state: ResMut<BuilderState>,
    mut text_modal: ResMut<crate::builder::ui::components::TextInputModalState>,
) {
    if let Some(callback_id) = &text_modal.callback_id {
        if callback_id.starts_with("edit_location_name_") {
            if let Some(location_id_str) = callback_id.strip_prefix("edit_location_name_") {
                if let Ok(location_id) = location_id_str.parse::<u8>() {
                    let new_name = text_modal.current_value.clone();
                    if let Some(location) = state.current_game.locations.iter_mut().find(|l| l.id == location_id) {
                        location.name = new_name.clone();
                        info!("Updated location {} name to: {}", location_id, new_name);
                    }
                    state.unsaved_changes = true;
                }
            }
            text_modal.close();
        }
    }
}

/// Handle add connection button - adds a North connection to first location as placeholder
/// Handle add connection button - opens connection editor modal
pub fn handle_add_connection_button(
    state: Res<BuilderState>,
    mut modal_state: ResMut<crate::builder::ui::components::ConnectionEditorModalState>,
    mut interaction_query: Query<
        (&Interaction, &AddConnectionButton),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Find first valid target location (not self) as default
            let default_target = state.current_game.locations.iter()
                .find(|l| l.id != button.location_id)
                .map(|l| l.id)
                .unwrap_or(0);

            // Open connection editor modal for new connection
            modal_state.open_new(button.location_id, default_target);
            info!("Opening connection editor for location {}", button.location_id);
        }
    }
}

/// Handle edit connection button - opens connection editor modal with existing data
pub fn handle_edit_connection_button(
    mut modal_state: ResMut<crate::builder::ui::components::ConnectionEditorModalState>,
    mut interaction_query: Query<
        (&Interaction, &EditConnectionButton),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Open connection editor modal for editing existing connection
            modal_state.open_edit(
                button.location_id,
                button.connection_index,
                button.direction,
                button.target
            );
            info!("Opening connection editor for editing connection at index {}", button.connection_index);
        }
    }
}

/// Handle delete connection button
pub fn handle_delete_connection_button(
    mut state: ResMut<BuilderState>,
    mut confirmation_state: ResMut<crate::builder::ui::components::ConfirmationModalState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteConnectionButton),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            confirmation_state.open(
                "Delete Connection",
                "Are you sure you want to delete this connection?",
                &format!("delete_connection_{}_{}", button.location_id, button.connection_index),
            );
        }
    }
}

/// Process connection deletion after confirmation
pub fn process_connection_deletion(
    mut state: ResMut<BuilderState>,
    confirmation_state: Res<crate::builder::ui::components::ConfirmationModalState>,
) {
    if let Some(callback_id) = &confirmation_state.callback_id {
        if callback_id.starts_with("delete_connection_") {
            if let Some(parts) = callback_id.strip_prefix("delete_connection_") {
                let parts: Vec<&str> = parts.split('_').collect();
                if parts.len() == 2 {
                    if let (Ok(location_id), Ok(conn_idx)) = (parts[0].parse::<u8>(), parts[1].parse::<usize>()) {
                        if let Some(location) = state.current_game.locations.iter_mut().find(|l| l.id == location_id) {
                            if conn_idx < location.connections.len() {
                                location.connections.remove(conn_idx);
                                state.mark_dirty();
                                info!("Deleted connection from location {} at index {}", location_id, conn_idx);
                            }
                        }
                    }
                }
            }
        }
    }
}
