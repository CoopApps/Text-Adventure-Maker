use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::game::Picture;

#[derive(Component)]
pub struct AddPictureButton;

#[derive(Component)]
pub struct RemovePictureButton {
    pub picture_id: u8,
}

#[derive(Component)]
pub struct EditPictureButton {
    pub picture_id: u8,
}

#[derive(Component)]
pub struct SetLocationBindingButton {
    pub picture_id: u8,
}

/// Renders the graphics library panel
pub fn render_graphics_panel(parent: &mut ChildBuilder, state: &BuilderState) {
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
            "🖼️ Graphics & Pictures Library",
            TextStyle {
                font_size: 28.0,
                color: Color::rgb(0.9, 0.95, 1.0),
                ..default()
            },
        ));

        // Info text
        panel.spawn(TextBundle::from_section(
            "Manage graphics and pictures for your game. Pictures can be displayed in locations or triggered by rules.",
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.8),
                ..default()
            },
        ));

        // Picture count and add button row
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
            // Picture count
            row.spawn(TextBundle::from_section(
                format!("Pictures: {}/255", state.current_game.pictures.len()),
                TextStyle {
                    font_size: 18.0,
                    color: if state.current_game.pictures.len() > 200 {
                        Color::rgb(1.0, 0.4, 0.4) // Red
                    } else if state.current_game.pictures.len() > 150 {
                        Color::rgb(1.0, 0.8, 0.3) // Yellow
                    } else {
                        Color::rgb(0.5, 1.0, 0.5) // Green
                    },
                    ..default()
                },
            ));

            // Add picture button
            row.spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(12.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.3, 0.6, 0.4).into(),
                    ..default()
                },
                AddPictureButton,
            ))
            .with_children(|button| {
                button.spawn(TextBundle::from_section(
                    "➕ Add Picture",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });
        });

        // Location-bound pictures section
        render_location_bound_pictures(panel, &state.current_game.pictures);

        // Unbound pictures section (manual display via Picture action)
        render_unbound_pictures(panel, &state.current_game.pictures);

        // Tips section
        panel.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(16.0)),
                ..default()
            },
            background_color: Color::rgba(0.2, 0.3, 0.4, 0.6).into(),
            ..default()
        })
        .with_children(|tips| {
            tips.spawn(TextBundle::from_section(
                "💡 Tips:\n\
                • Location-bound pictures display automatically when entering that location\n\
                • Unbound pictures are displayed manually via Picture action in rules\n\
                • Web export supports PNG, JPG, GIF (recommended: 320x200 or 640x400)\n\
                • Retro platforms require platform-specific formats (SCR, PIC, etc.)",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.8, 0.85, 0.9),
                    ..default()
                },
            ));
        });
    });
}

fn render_location_bound_pictures(parent: &mut ChildBuilder, pictures: &[Picture]) {
    let bound_pictures: Vec<&Picture> = pictures.iter()
        .filter(|p| p.location_binding.is_some())
        .collect();

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
            format!("📍 Location-Bound Pictures ({})", bound_pictures.len()),
            TextStyle {
                font_size: 20.0,
                color: Color::rgb(0.7, 0.9, 0.7),
                ..default()
            },
        ));

        if bound_pictures.is_empty() {
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
                    "No location-bound pictures yet. Click 'Add Picture' and set a location binding!",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.6, 0.6, 0.7),
                        ..default()
                    },
                ));
            });
        } else {
            // Picture grid
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
                for picture in bound_pictures {
                    render_picture_card(grid, picture);
                }
            });
        }
    });
}

fn render_unbound_pictures(parent: &mut ChildBuilder, pictures: &[Picture]) {
    let unbound_pictures: Vec<&Picture> = pictures.iter()
        .filter(|p| p.location_binding.is_none())
        .collect();

    if unbound_pictures.is_empty() {
        return; // Don't show section if empty
    }

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
            format!("🎨 Unbound Pictures ({})", unbound_pictures.len()),
            TextStyle {
                font_size: 20.0,
                color: Color::rgb(0.7, 0.7, 0.9),
                ..default()
            },
        ));

        // Picture grid
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
            for picture in unbound_pictures {
                render_picture_card(grid, picture);
            }
        });
    });
}

fn render_picture_card(parent: &mut ChildBuilder, picture: &Picture) {
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
            // Picture name and ID
            header.spawn(TextBundle::from_section(
                format!("[{}] {}", picture.id, picture.name),
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
                    EditPictureButton { picture_id: picture.id },
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

                // Set location button
                buttons.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(8.0), Val::Px(6.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.5, 0.4, 0.6).into(),
                        ..default()
                    },
                    SetLocationBindingButton { picture_id: picture.id },
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section(
                        "📍",
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
                    RemovePictureButton { picture_id: picture.id },
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

        // Location binding info
        if let Some(location_id) = picture.location_binding {
            card.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgba(0.2, 0.4, 0.3, 0.6).into(),
                ..default()
            })
            .with_children(|binding| {
                binding.spawn(TextBundle::from_section(
                    format!("📍 Bound to Location {}", location_id),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.7, 0.9, 0.7),
                        ..default()
                    },
                ));
            });
        }

        // Description
        if !picture.description.is_empty() {
            card.spawn(TextBundle::from_section(
                &picture.description,
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.7, 0.7, 0.8),
                    ..default()
                },
            ));
        }

        // Dimensions
        if let Some((width, height)) = picture.dimensions {
            card.spawn(TextBundle::from_section(
                format!("📐 {}x{} pixels", width, height),
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.7, 0.8),
                    ..default()
                },
            ));
        }

        // File info
        if let Some(web_file) = &picture.web_file {
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
                    format!("🌐 {}", web_file),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.6, 0.8, 0.9),
                        ..default()
                    },
                ));
            });
        }

        // Platform files count
        if !picture.platform_files.is_empty() {
            card.spawn(TextBundle::from_section(
                format!("💾 {} platform-specific files", picture.platform_files.len()),
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.6, 0.7),
                    ..default()
                },
            ));
        }
    });
}

/// Handle add picture button click
pub fn handle_add_picture_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<&Interaction, (Changed<Interaction>, With<AddPictureButton>)>,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Add Picture button clicked - image upload dialog coming soon!");

            // For now, add a placeholder picture
            let next_id = state.current_game.pictures
                .iter()
                .map(|p| p.id)
                .max()
                .map_or(0, |max_id| max_id + 1);

            state.current_game.pictures.push(Picture {
                id: next_id,
                name: format!("picture_{}", next_id),
                description: "New picture".to_string(),
                web_file: None,
                platform_files: std::collections::HashMap::new(),
                location_binding: None,
                dimensions: Some((320, 200)),
            });

            state.mark_dirty();
            info!("Added placeholder picture with ID {}", next_id);
        }
    }
}

/// Handle remove picture button click
pub fn handle_remove_picture_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<(&Interaction, &RemovePictureButton), Changed<Interaction>>,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            state.current_game.pictures.retain(|p| p.id != button.picture_id);
            state.mark_dirty();
            info!("Removed picture with ID {}", button.picture_id);
        }
    }
}

/// Handle edit picture button click
pub fn handle_edit_picture_button(
    state: Res<BuilderState>,
    mut picture_editor: ResMut<crate::builder::ui::components::PictureEditorModalState>,
    mut interaction_query: Query<(&Interaction, &EditPictureButton), Changed<Interaction>>,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(picture) = state.current_game.pictures.iter().find(|p| p.id == button.picture_id) {
                picture_editor.open(picture);
                info!("Opened picture editor for ID {}", button.picture_id);
            }
        }
    }
}

/// Handle set location binding button click
pub fn handle_set_location_binding_button(
    mut interaction_query: Query<(&Interaction, &SetLocationBindingButton), Changed<Interaction>>,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Set Location Binding button clicked for ID {} - location picker coming soon!", button.picture_id);
            // TODO: Open location picker dialog
        }
    }
}
