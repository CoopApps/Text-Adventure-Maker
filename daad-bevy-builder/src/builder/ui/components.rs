use bevy::prelude::*;

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
