use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::game::Language;

/// Component tags for game info UI elements
#[derive(Component)]
pub struct EditTitleButton;

#[derive(Component)]
pub struct EditAuthorButton;

#[derive(Component)]
pub struct EditVersionButton;

#[derive(Component)]
pub struct IncrementStartingLocationButton;

#[derive(Component)]
pub struct DecrementStartingLocationButton;

#[derive(Component)]
pub struct IncrementMaxCarryObjectsButton;

#[derive(Component)]
pub struct DecrementMaxCarryObjectsButton;

#[derive(Component)]
pub struct IncrementMaxCarryWeightButton;

#[derive(Component)]
pub struct DecrementMaxCarryWeightButton;

/// Render the interactive game info panel
pub fn render_game_info_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "📋 Game Information",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nConfigure your game's metadata:\n",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Title field
    parent.spawn(TextBundle::from_section(
        "Game Title",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            column_gap: Val::Px(12.0),
            padding: UiRect::all(Val::Px(8.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Current value display
        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(12.0)),
                flex_grow: 1.0,
                ..default()
            },
            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                &state.current_game.title,
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));
        });

        // Edit button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                ..default()
            },
            EditTitleButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "✏️ Edit",
                TextStyle {
                    font_size: 14.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });
    });

    // Author field
    parent.spawn(TextBundle::from_section(
        "\nAuthor",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            column_gap: Val::Px(12.0),
            padding: UiRect::all(Val::Px(8.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Current value display
        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(12.0)),
                flex_grow: 1.0,
                ..default()
            },
            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                &state.current_game.author,
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));
        });

        // Edit button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                ..default()
            },
            EditAuthorButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "✏️ Edit",
                TextStyle {
                    font_size: 14.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });
    });

    // Version field
    parent.spawn(TextBundle::from_section(
        "\nVersion",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            column_gap: Val::Px(12.0),
            padding: UiRect::all(Val::Px(8.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Current value display
        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(12.0)),
                flex_grow: 1.0,
                ..default()
            },
            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                &state.current_game.version,
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));
        });

        // Edit button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                ..default()
            },
            EditVersionButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "✏️ Edit",
                TextStyle {
                    font_size: 14.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });
    });

    // Game Configuration section
    parent.spawn(TextBundle::from_section(
        "\n\n⚙️ Game Configuration",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "Core gameplay settings:\n",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Starting Location
    parent.spawn(TextBundle::from_section(
        "Starting Location",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            column_gap: Val::Px(12.0),
            padding: UiRect::all(Val::Px(8.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Decrement button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            DecrementStartingLocationButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "➖",
                TextStyle {
                    font_size: 18.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });

        // Current value display
        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(12.0)),
                min_width: Val::Px(60.0),
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                ..default()
            },
            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
            ..default()
        })
        .with_children(|value_box| {
            let location_name = state.current_game
                .get_location(state.current_game.starting_location)
                .map(|loc| loc.name.clone())
                .unwrap_or_else(|| "None".to_string());

            value_box.spawn(TextBundle::from_section(
                format!("{} ({})", state.current_game.starting_location, location_name),
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));
        });

        // Increment button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            IncrementStartingLocationButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "➕",
                TextStyle {
                    font_size: 18.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });
    });

    // Max Carry Objects
    parent.spawn(TextBundle::from_section(
        "\nMax Carry Objects",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            column_gap: Val::Px(12.0),
            padding: UiRect::all(Val::Px(8.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Decrement button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            DecrementMaxCarryObjectsButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "➖",
                TextStyle {
                    font_size: 18.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });

        // Current value display
        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(12.0)),
                min_width: Val::Px(60.0),
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                ..default()
            },
            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{} objects", state.current_game.max_carry_objects),
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));
        });

        // Increment button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            IncrementMaxCarryObjectsButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "➕",
                TextStyle {
                    font_size: 18.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });
    });

    // Max Carry Weight
    parent.spawn(TextBundle::from_section(
        "\nMax Carry Weight",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            column_gap: Val::Px(12.0),
            padding: UiRect::all(Val::Px(8.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Decrement button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            DecrementMaxCarryWeightButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "➖",
                TextStyle {
                    font_size: 18.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });

        // Current value display
        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(12.0)),
                min_width: Val::Px(60.0),
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                ..default()
            },
            background_color: Color::rgb(0.15, 0.15, 0.2).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{} units", state.current_game.max_carry_weight),
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));
        });

        // Increment button
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(16.0), Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            IncrementMaxCarryWeightButton,
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "➕",
                TextStyle {
                    font_size: 18.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });
    });

    parent.spawn(TextBundle::from_section(
        "\n💡 Configuration Help:",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.7, 0.7, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Starting Location: Where the player begins the game",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.6, 0.6, 0.7),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Max Carry Objects: Maximum number of items player can carry",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.6, 0.6, 0.7),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Max Carry Weight: Total weight limit for carried items",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.6, 0.6, 0.7),
            ..default()
        },
    ));

    // Multi-language section
    parent.spawn(TextBundle::from_section(
        "\n\n🌍 Languages",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("Default: {} {}",
            state.current_game.default_language.flag_emoji(),
            state.current_game.default_language.display_name()),
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.9, 0.7),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("Supported: {} languages", state.current_game.supported_languages.len()),
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.7),
            ..default()
        },
    ));

    // Language grid
    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_wrap: FlexWrap::Wrap,
            column_gap: Val::Px(8.0),
            row_gap: Val::Px(8.0),
            padding: UiRect::all(Val::Px(12.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|container| {
        for lang in Language::all() {
            let is_supported = state.current_game.supported_languages.contains(&lang);
            let is_default = state.current_game.default_language == lang;

            container.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(10.0)),
                    ..default()
                },
                background_color: if is_default {
                    Color::rgb(0.3, 0.6, 0.4).into()  // Green for default
                } else if is_supported {
                    Color::rgb(0.2, 0.3, 0.4).into()  // Blue for supported
                } else {
                    Color::rgb(0.15, 0.15, 0.2).into()  // Gray for unsupported
                },
                ..default()
            })
            .with_children(|card| {
                card.spawn(TextBundle::from_section(
                    format!("{} {}",
                        lang.flag_emoji(),
                        lang.display_name()),
                    TextStyle {
                        font_size: 13.0,
                        color: if is_supported {
                            Color::WHITE
                        } else {
                            Color::rgb(0.5, 0.5, 0.5)
                        },
                        ..default()
                    },
                ));
            });
        }
    });

    parent.spawn(TextBundle::from_section(
        "\n💡 Language Support:",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.7, 0.7, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Vocabulary can be translated per language",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.6, 0.6, 0.7),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Export generates separate .SCE files per language",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.6, 0.6, 0.7),
            ..default()
        },
    ));

    // Statistics section
    parent.spawn(TextBundle::from_section(
        "\n\n📊 Game Statistics",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "Current game content:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Statistics grid
    let stats = [
        ("📍 Locations", state.current_game.locations.len(), Color::rgb(0.7, 0.9, 1.0)),
        ("📦 Objects", state.current_game.objects.len(), Color::rgb(0.9, 0.9, 0.6)),
        ("⚙️ Rules", state.current_game.rules.len(), Color::rgb(0.8, 1.0, 0.8)),
        ("🚩 Flags", state.current_game.flags.len(), Color::rgb(1.0, 0.8, 0.6)),
        ("📖 Vocabulary", state.current_game.vocabulary.len(), Color::rgb(0.9, 0.7, 1.0)),
        ("💬 Messages", state.current_game.messages.len(), Color::rgb(1.0, 0.9, 0.7)),
    ];

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Grid,
            grid_template_columns: RepeatedGridTrack::flex(2, 1.0),
            column_gap: Val::Px(12.0),
            row_gap: Val::Px(8.0),
            padding: UiRect::all(Val::Px(12.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|grid| {
        for (label, count, color) in stats {
            grid.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgb(0.12, 0.12, 0.16).into(),
                ..default()
            })
            .with_children(|card| {
                card.spawn(TextBundle::from_section(
                    format!("{}\n{} items", label, count),
                    TextStyle {
                        font_size: 14.0,
                        color,
                        ..default()
                    },
                ));
            });
        }
    });

    // Instructions
    parent.spawn(TextBundle::from_section(
        "\n💡 Note:",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.9, 0.9, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Click ✏️ Edit buttons to modify metadata",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Text input dialog coming soon!",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.5, 0.7, 0.9),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • For now, edit values in the saved JSON file",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.5, 0.5, 0.5),
            ..default()
        },
    ));
}

/// System to handle edit title button (placeholder for future text input dialog)
pub fn handle_edit_title_button(
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<EditTitleButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Edit Title button clicked - text input dialog coming soon!");
            // TODO: Open text input dialog
        }
    }
}

/// System to handle edit author button (placeholder for future text input dialog)
pub fn handle_edit_author_button(
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<EditAuthorButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Edit Author button clicked - text input dialog coming soon!");
            // TODO: Open text input dialog
        }
    }
}

/// System to handle edit version button (placeholder for future text input dialog)
pub fn handle_edit_version_button(
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<EditVersionButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            info!("Edit Version button clicked - text input dialog coming soon!");
            // TODO: Open text input dialog
        }
    }
}

/// System to handle increment starting location button
pub fn handle_increment_starting_location(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<IncrementStartingLocationButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            let max_location = state.current_game.locations.len().saturating_sub(1) as u8;
            if state.current_game.starting_location < max_location {
                state.current_game.starting_location += 1;
                state.mark_dirty();
                info!("Starting location set to {}", state.current_game.starting_location);
            }
        }
    }
}

/// System to handle decrement starting location button
pub fn handle_decrement_starting_location(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<DecrementStartingLocationButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if state.current_game.starting_location > 0 {
                state.current_game.starting_location -= 1;
                state.mark_dirty();
                info!("Starting location set to {}", state.current_game.starting_location);
            }
        }
    }
}

/// System to handle increment max carry objects button
pub fn handle_increment_max_carry_objects(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<IncrementMaxCarryObjectsButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if state.current_game.max_carry_objects < 255 {
                state.current_game.max_carry_objects += 1;
                state.mark_dirty();
                info!("Max carry objects set to {}", state.current_game.max_carry_objects);
            }
        }
    }
}

/// System to handle decrement max carry objects button
pub fn handle_decrement_max_carry_objects(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<DecrementMaxCarryObjectsButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if state.current_game.max_carry_objects > 1 {
                state.current_game.max_carry_objects -= 1;
                state.mark_dirty();
                info!("Max carry objects set to {}", state.current_game.max_carry_objects);
            }
        }
    }
}

/// System to handle increment max carry weight button
pub fn handle_increment_max_carry_weight(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<IncrementMaxCarryWeightButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if state.current_game.max_carry_weight < 255 {
                state.current_game.max_carry_weight = (state.current_game.max_carry_weight + 10).min(255);
                state.mark_dirty();
                info!("Max carry weight set to {}", state.current_game.max_carry_weight);
            }
        }
    }
}

/// System to handle decrement max carry weight button
pub fn handle_decrement_max_carry_weight(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<DecrementMaxCarryWeightButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if state.current_game.max_carry_weight > 10 {
                state.current_game.max_carry_weight = (state.current_game.max_carry_weight - 10).max(10);
                state.mark_dirty();
                info!("Max carry weight set to {}", state.current_game.max_carry_weight);
            }
        }
    }
}
