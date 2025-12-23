use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::types::{Condition, ConditionType, Action, ActionType, ObjectLocation};
use crate::builder::ui::components::*;

/// Modal state for condition editor
#[derive(Resource, Default)]
pub struct ConditionEditorState {
    pub is_open: bool,
    pub rule_index: Option<usize>,
    pub condition_index: Option<usize>, // None = new condition, Some = edit existing
    pub selected_type: usize, // Index into CONDITION_TYPES
    pub param_location: u8,
    pub param_object: u8,
    pub param_flag: u8,
    pub param_value: u8,
    pub param_flag2: u8,
    pub param_verb: String,
    pub param_noun: String,
}

/// Modal state for action editor
#[derive(Resource, Default)]
pub struct ActionEditorState {
    pub is_open: bool,
    pub rule_index: Option<usize>,
    pub action_index: Option<usize>, // None = new action, Some = edit existing
    pub selected_type: usize, // Index into ACTION_TYPES
    pub param_message: String,
    pub param_object: u8,
    pub param_location: u8,
    pub param_flag: u8,
    pub param_value: u8,
    pub param_object2: u8,
    pub param_flag2: u8,
}

// Condition type definitions with display names
pub const CONDITION_TYPES: &[(&str, &str)] = &[
    ("PlayerAt", "Player at Location"),
    ("PlayerNotAt", "Player NOT at Location"),
    ("ObjectPresent", "Object Present"),
    ("ObjectAbsent", "Object Absent"),
    ("ObjectCarried", "Object Carried"),
    ("ObjectNotCarried", "Object NOT Carried"),
    ("ObjectWorn", "Object Worn"),
    ("ObjectNotWorn", "Object NOT Worn"),
    ("ObjectAt", "Object at Location"),
    ("FlagEquals", "Flag Equals Value"),
    ("FlagNotEquals", "Flag NOT Equals Value"),
    ("FlagGreaterThan", "Flag Greater Than"),
    ("FlagLessThan", "Flag Less Than"),
    ("FlagZero", "Flag is Zero"),
    ("FlagNotZero", "Flag is NOT Zero"),
    ("VerbIs", "Verb Is"),
    ("NounIs", "Noun Is"),
];

// Action type definitions with display names
pub const ACTION_TYPES: &[(&str, &str)] = &[
    ("ShowMessage", "Show Message"),
    ("ShowLocationDescription", "Show Location Description"),
    ("ClearScreen", "Clear Screen"),
    ("NewLine", "New Line"),
    ("GetObject", "Get Object"),
    ("DropObject", "Drop Object"),
    ("WearObject", "Wear Object"),
    ("RemoveObject", "Remove Object"),
    ("PlaceObject", "Place Object at Location"),
    ("GoToLocation", "Go to Location"),
    ("SetFlag", "Set Flag to Value"),
    ("IncrementFlag", "Increment Flag"),
    ("DecrementFlag", "Decrement Flag"),
    ("ClearFlag", "Clear Flag (set to 0)"),
    ("SetBit", "Set Flag to 1"),
    ("EndTurn", "End Turn"),
];

impl ConditionEditorState {
    pub fn open_new(&mut self, rule_index: usize) {
        self.is_open = true;
        self.rule_index = Some(rule_index);
        self.condition_index = None;
        self.selected_type = 0;
        self.param_location = 0;
        self.param_object = 0;
        self.param_flag = 0;
        self.param_value = 0;
        self.param_flag2 = 0;
        self.param_verb = String::new();
        self.param_noun = String::new();
    }

    pub fn open_edit(&mut self, rule_index: usize, condition_index: usize, condition: &Condition) {
        self.is_open = true;
        self.rule_index = Some(rule_index);
        self.condition_index = Some(condition_index);

        // Set type and parameters based on condition
        match &condition.condition_type {
            ConditionType::PlayerAt { location_id } => {
                self.selected_type = 0;
                self.param_location = *location_id;
            }
            ConditionType::PlayerNotAt { location_id } => {
                self.selected_type = 1;
                self.param_location = *location_id;
            }
            ConditionType::ObjectPresent { object_id } => {
                self.selected_type = 2;
                self.param_object = *object_id;
            }
            ConditionType::ObjectAbsent { object_id } => {
                self.selected_type = 3;
                self.param_object = *object_id;
            }
            ConditionType::ObjectCarried { object_id } => {
                self.selected_type = 4;
                self.param_object = *object_id;
            }
            ConditionType::ObjectNotCarried { object_id } => {
                self.selected_type = 5;
                self.param_object = *object_id;
            }
            ConditionType::ObjectWorn { object_id } => {
                self.selected_type = 6;
                self.param_object = *object_id;
            }
            ConditionType::ObjectNotWorn { object_id } => {
                self.selected_type = 7;
                self.param_object = *object_id;
            }
            ConditionType::ObjectAt { object_id, location_id } => {
                self.selected_type = 8;
                self.param_object = *object_id;
                self.param_location = *location_id;
            }
            ConditionType::FlagEquals { flag_id, value } => {
                self.selected_type = 9;
                self.param_flag = *flag_id;
                self.param_value = *value;
            }
            ConditionType::FlagNotEquals { flag_id, value } => {
                self.selected_type = 10;
                self.param_flag = *flag_id;
                self.param_value = *value;
            }
            ConditionType::FlagGreaterThan { flag_id, value } => {
                self.selected_type = 11;
                self.param_flag = *flag_id;
                self.param_value = *value;
            }
            ConditionType::FlagLessThan { flag_id, value } => {
                self.selected_type = 12;
                self.param_flag = *flag_id;
                self.param_value = *value;
            }
            ConditionType::FlagZero { flag_id } => {
                self.selected_type = 13;
                self.param_flag = *flag_id;
            }
            ConditionType::FlagNotZero { flag_id } => {
                self.selected_type = 14;
                self.param_flag = *flag_id;
            }
            ConditionType::VerbIs { verb } => {
                self.selected_type = 15;
                self.param_verb = verb.clone();
            }
            ConditionType::NounIs { noun } => {
                self.selected_type = 16;
                self.param_noun = noun.clone();
            }
            _ => {
                self.selected_type = 0;
            }
        }
    }

    pub fn build_condition_type(&self) -> ConditionType {
        match CONDITION_TYPES[self.selected_type].0 {
            "PlayerAt" => ConditionType::PlayerAt { location_id: self.param_location },
            "PlayerNotAt" => ConditionType::PlayerNotAt { location_id: self.param_location },
            "ObjectPresent" => ConditionType::ObjectPresent { object_id: self.param_object },
            "ObjectAbsent" => ConditionType::ObjectAbsent { object_id: self.param_object },
            "ObjectCarried" => ConditionType::ObjectCarried { object_id: self.param_object },
            "ObjectNotCarried" => ConditionType::ObjectNotCarried { object_id: self.param_object },
            "ObjectWorn" => ConditionType::ObjectWorn { object_id: self.param_object },
            "ObjectNotWorn" => ConditionType::ObjectNotWorn { object_id: self.param_object },
            "ObjectAt" => ConditionType::ObjectAt {
                object_id: self.param_object,
                location_id: self.param_location,
            },
            "FlagEquals" => ConditionType::FlagEquals {
                flag_id: self.param_flag,
                value: self.param_value,
            },
            "FlagNotEquals" => ConditionType::FlagNotEquals {
                flag_id: self.param_flag,
                value: self.param_value,
            },
            "FlagGreaterThan" => ConditionType::FlagGreaterThan {
                flag_id: self.param_flag,
                value: self.param_value,
            },
            "FlagLessThan" => ConditionType::FlagLessThan {
                flag_id: self.param_flag,
                value: self.param_value,
            },
            "FlagZero" => ConditionType::FlagZero { flag_id: self.param_flag },
            "FlagNotZero" => ConditionType::FlagNotZero { flag_id: self.param_flag },
            "VerbIs" => ConditionType::VerbIs { verb: self.param_verb.clone() },
            "NounIs" => ConditionType::NounIs { noun: self.param_noun.clone() },
            _ => ConditionType::PlayerAt { location_id: 0 },
        }
    }

    pub fn close(&mut self) {
        self.is_open = false;
        self.rule_index = None;
        self.condition_index = None;
    }
}

impl ActionEditorState {
    pub fn open_new(&mut self, rule_index: usize) {
        self.is_open = true;
        self.rule_index = Some(rule_index);
        self.action_index = None;
        self.selected_type = 0;
        self.param_message = "Something happens.".to_string();
        self.param_object = 0;
        self.param_location = 0;
        self.param_flag = 0;
        self.param_value = 0;
        self.param_object2 = 0;
        self.param_flag2 = 0;
    }

    pub fn open_edit(&mut self, rule_index: usize, action_index: usize, action: &Action) {
        self.is_open = true;
        self.rule_index = Some(rule_index);
        self.action_index = Some(action_index);

        // Set type and parameters based on action
        match &action.action_type {
            ActionType::ShowMessage { text } => {
                self.selected_type = 0;
                self.param_message = text.clone();
            }
            ActionType::ShowLocationDescription => {
                self.selected_type = 1;
            }
            ActionType::ClearScreen => {
                self.selected_type = 2;
            }
            ActionType::NewLine => {
                self.selected_type = 3;
            }
            ActionType::GetObject { object_id } => {
                self.selected_type = 4;
                self.param_object = *object_id;
            }
            ActionType::DropObject { object_id } => {
                self.selected_type = 5;
                self.param_object = *object_id;
            }
            ActionType::WearObject { object_id } => {
                self.selected_type = 6;
                self.param_object = *object_id;
            }
            ActionType::RemoveObject { object_id } => {
                self.selected_type = 7;
                self.param_object = *object_id;
            }
            ActionType::PlaceObject { object_id, location_id } => {
                self.selected_type = 8;
                self.param_object = *object_id;
                self.param_location = *location_id;
            }
            ActionType::GoToLocation { location_id } => {
                self.selected_type = 9;
                self.param_location = *location_id;
            }
            ActionType::SetFlag { flag_id, value } => {
                self.selected_type = 10;
                self.param_flag = *flag_id;
                self.param_value = *value;
            }
            ActionType::IncrementFlag { flag_id } => {
                self.selected_type = 11;
                self.param_flag = *flag_id;
            }
            ActionType::DecrementFlag { flag_id } => {
                self.selected_type = 12;
                self.param_flag = *flag_id;
            }
            ActionType::ClearFlag { flag_id } => {
                self.selected_type = 13;
                self.param_flag = *flag_id;
            }
            ActionType::SetBit { flag_id } => {
                self.selected_type = 14;
                self.param_flag = *flag_id;
            }
            ActionType::EndTurn => {
                self.selected_type = 15;
            }
            _ => {
                self.selected_type = 0;
            }
        }
    }

    pub fn build_action_type(&self) -> ActionType {
        match ACTION_TYPES[self.selected_type].0 {
            "ShowMessage" => ActionType::ShowMessage { text: self.param_message.clone() },
            "ShowLocationDescription" => ActionType::ShowLocationDescription,
            "ClearScreen" => ActionType::ClearScreen,
            "NewLine" => ActionType::NewLine,
            "GetObject" => ActionType::GetObject { object_id: self.param_object },
            "DropObject" => ActionType::DropObject { object_id: self.param_object },
            "WearObject" => ActionType::WearObject { object_id: self.param_object },
            "RemoveObject" => ActionType::RemoveObject { object_id: self.param_object },
            "PlaceObject" => ActionType::PlaceObject {
                object_id: self.param_object,
                location_id: self.param_location,
            },
            "GoToLocation" => ActionType::GoToLocation { location_id: self.param_location },
            "SetFlag" => ActionType::SetFlag {
                flag_id: self.param_flag,
                value: self.param_value,
            },
            "IncrementFlag" => ActionType::IncrementFlag { flag_id: self.param_flag },
            "DecrementFlag" => ActionType::DecrementFlag { flag_id: self.param_flag },
            "ClearFlag" => ActionType::ClearFlag { flag_id: self.param_flag },
            "SetBit" => ActionType::SetBit { flag_id: self.param_flag },
            "EndTurn" => ActionType::EndTurn,
            _ => ActionType::ShowMessage { text: "".to_string() },
        }
    }

    pub fn close(&mut self) {
        self.is_open = false;
        self.rule_index = None;
        self.action_index = None;
    }
}

// Component tags for condition editor modal
#[derive(Component)]
pub struct ConditionEditorModal;

#[derive(Component)]
pub struct ConditionTypeButton {
    pub type_index: usize,
}

#[derive(Component)]
pub struct ConditionParamLocationIncrement;

#[derive(Component)]
pub struct ConditionParamLocationDecrement;

#[derive(Component)]
pub struct ConditionParamObjectIncrement;

#[derive(Component)]
pub struct ConditionParamObjectDecrement;

#[derive(Component)]
pub struct ConditionParamFlagIncrement;

#[derive(Component)]
pub struct ConditionParamFlagDecrement;

#[derive(Component)]
pub struct ConditionParamValueIncrement;

#[derive(Component)]
pub struct ConditionParamValueDecrement;

#[derive(Component)]
pub struct SaveConditionButton;

// Component tags for action editor modal
#[derive(Component)]
pub struct ActionEditorModal;

#[derive(Component)]
pub struct ActionTypeButton {
    pub type_index: usize,
}

#[derive(Component)]
pub struct ActionParamObjectIncrement;

#[derive(Component)]
pub struct ActionParamObjectDecrement;

#[derive(Component)]
pub struct ActionParamLocationIncrement;

#[derive(Component)]
pub struct ActionParamLocationDecrement;

#[derive(Component)]
pub struct ActionParamFlagIncrement;

#[derive(Component)]
pub struct ActionParamFlagDecrement;

#[derive(Component)]
pub struct ActionParamValueIncrement;

#[derive(Component)]
pub struct ActionParamValueDecrement;

#[derive(Component)]
pub struct SaveActionButton;

/// Render the condition editor modal
pub fn render_condition_editor_modal(
    mut commands: Commands,
    editor_state: Res<ConditionEditorState>,
    game_state: Res<BuilderState>,
    query: Query<Entity, With<ConditionEditorModal>>,
) {
    if !editor_state.is_open {
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
        .insert(ConditionEditorModal)
        .with_children(|backdrop| {
            // Modal container
            backdrop.spawn((
                NodeBundle {
                    style: Style {
                        width: Val::Px(600.0),
                        height: Val::Px(500.0),
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
                    if editor_state.condition_index.is_some() {
                        "Edit Condition"
                    } else {
                        "Add New Condition"
                    },
                    TextStyle {
                        font_size: 20.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));

                // Condition type selector
                modal.spawn(TextBundle::from_section(
                    "Condition Type:",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.8, 0.8, 0.8),
                        ..default()
                    },
                ));

                // Type buttons in a scrollable grid
                modal.spawn(NodeBundle {
                    style: Style {
                        display: Display::Grid,
                        grid_template_columns: RepeatedGridTrack::flex(2, 1.0),
                        column_gap: Val::Px(8.0),
                        row_gap: Val::Px(6.0),
                        max_height: Val::Px(150.0),
                        overflow: Overflow::clip_y(),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|grid| {
                    for (idx, (_code, name)) in CONDITION_TYPES.iter().enumerate() {
                        let is_selected = idx == editor_state.selected_type;

                        grid.spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(8.0)),
                                    border: UiRect::all(Val::Px(2.0)),
                                    ..default()
                                },
                                background_color: if is_selected {
                                    Color::rgb(0.3, 0.5, 0.7).into()
                                } else {
                                    Color::rgb(0.2, 0.2, 0.25).into()
                                },
                                border_color: if is_selected {
                                    Color::rgb(0.5, 0.7, 0.9).into()
                                } else {
                                    Color::rgb(0.3, 0.3, 0.35).into()
                                },
                                ..default()
                            },
                            ConditionTypeButton { type_index: idx },
                        ))
                        .with_children(|btn| {
                            btn.spawn(TextBundle::from_section(
                                *name,
                                TextStyle {
                                    font_size: 12.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });
                    }
                });

                // Parameters section based on selected type
                modal.spawn(TextBundle::from_section(
                    "\nParameters:",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.8, 0.8, 0.8),
                        ..default()
                    },
                ));

                render_condition_parameters(modal, &editor_state, &game_state);

                // Save/Cancel buttons
                modal.spawn(NodeBundle {
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
                    // Cancel
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

                    // Save
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(20.0), Val::Px(10.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                            ..default()
                        },
                        SaveConditionButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "Save Condition",
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

fn render_condition_parameters(
    parent: &mut ChildBuilder,
    editor_state: &ConditionEditorState,
    game_state: &BuilderState,
) {
    let type_code = CONDITION_TYPES[editor_state.selected_type].0;

    match type_code {
        "PlayerAt" | "PlayerNotAt" => {
            // Location parameter
            parent.spawn(TextBundle::from_section(
                "Location:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));

            let location_name = game_state.current_game
                .get_location(editor_state.param_location)
                .map(|loc| loc.name.clone())
                .unwrap_or_else(|| "None".to_string());

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
                row.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                        ..default()
                    },
                    ConditionParamLocationDecrement,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
                });

                row.spawn(NodeBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(10.0)),
                        min_width: Val::Px(200.0),
                        ..default()
                    },
                    background_color: Color::rgb(0.1, 0.1, 0.15).into(),
                    ..default()
                })
                .with_children(|value_box| {
                    value_box.spawn(TextBundle::from_section(
                        format!("{} ({})", editor_state.param_location, location_name),
                        TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
                    ));
                });

                row.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                        ..default()
                    },
                    ConditionParamLocationIncrement,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
                });
            });
        }
        "ObjectPresent" | "ObjectAbsent" | "ObjectCarried" | "ObjectNotCarried" | "ObjectWorn" | "ObjectNotWorn" => {
            // Object parameter
            parent.spawn(TextBundle::from_section(
                "Object:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));

            let object_name = game_state.current_game
                .get_object(editor_state.param_object)
                .map(|obj| obj.name.clone())
                .unwrap_or_else(|| "None".to_string());

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
                row.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                        ..default()
                    },
                    ConditionParamObjectDecrement,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
                });

                row.spawn(NodeBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(10.0)),
                        min_width: Val::Px(200.0),
                        ..default()
                    },
                    background_color: Color::rgb(0.1, 0.1, 0.15).into(),
                    ..default()
                })
                .with_children(|value_box| {
                    value_box.spawn(TextBundle::from_section(
                        format!("{} ({})", editor_state.param_object, object_name),
                        TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
                    ));
                });

                row.spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                        ..default()
                    },
                    ConditionParamObjectIncrement,
                ))
                .with_children(|btn| {
                    btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
                });
            });
        }
        "ObjectAt" => {
            // Object and Location parameters
            render_object_param(parent, editor_state, game_state);
            render_location_param(parent, editor_state, game_state);
        }
        "FlagEquals" | "FlagNotEquals" | "FlagGreaterThan" | "FlagLessThan" => {
            // Flag and Value parameters
            render_flag_param(parent, editor_state, game_state);
            render_value_param(parent, editor_state);
        }
        "FlagZero" | "FlagNotZero" => {
            // Flag parameter only
            render_flag_param(parent, editor_state, game_state);
        }
        "VerbIs" => {
            parent.spawn(TextBundle::from_section(
                "Verb (placeholder - text input coming soon):",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));
            parent.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(10.0)),
                    ..default()
                },
                background_color: Color::rgb(0.1, 0.1, 0.15).into(),
                ..default()
            })
            .with_children(|value_box| {
                value_box.spawn(TextBundle::from_section(
                    &editor_state.param_verb,
                    TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
                ));
            });
        }
        "NounIs" => {
            parent.spawn(TextBundle::from_section(
                "Noun (placeholder - text input coming soon):",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));
            parent.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(10.0)),
                    ..default()
                },
                background_color: Color::rgb(0.1, 0.1, 0.15).into(),
                ..default()
            })
            .with_children(|value_box| {
                value_box.spawn(TextBundle::from_section(
                    &editor_state.param_noun,
                    TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
                ));
            });
        }
        _ => {
            parent.spawn(TextBundle::from_section(
                "No parameters required",
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));
        }
    }
}

fn render_object_param(parent: &mut ChildBuilder, editor_state: &ConditionEditorState, game_state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "Object:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    let object_name = game_state.current_game
        .get_object(editor_state.param_object)
        .map(|obj| obj.name.clone())
        .unwrap_or_else(|| "None".to_string());

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
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            ConditionParamObjectDecrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });

        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(10.0)),
                min_width: Val::Px(200.0),
                ..default()
            },
            background_color: Color::rgb(0.1, 0.1, 0.15).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{} ({})", editor_state.param_object, object_name),
                TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
            ));
        });

        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            ConditionParamObjectIncrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });
    });
}

fn render_location_param(parent: &mut ChildBuilder, editor_state: &ConditionEditorState, game_state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "Location:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    let location_name = game_state.current_game
        .get_location(editor_state.param_location)
        .map(|loc| loc.name.clone())
        .unwrap_or_else(|| "None".to_string());

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
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            ConditionParamLocationDecrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });

        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(10.0)),
                min_width: Val::Px(200.0),
                ..default()
            },
            background_color: Color::rgb(0.1, 0.1, 0.15).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{} ({})", editor_state.param_location, location_name),
                TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
            ));
        });

        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            ConditionParamLocationIncrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });
    });
}

fn render_flag_param(parent: &mut ChildBuilder, editor_state: &ConditionEditorState, game_state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "Flag:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    let flag_name = game_state.current_game
        .get_flag(editor_state.param_flag)
        .map(|flag| flag.name.clone())
        .unwrap_or_else(|| "None".to_string());

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
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            ConditionParamFlagDecrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });

        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(10.0)),
                min_width: Val::Px(200.0),
                ..default()
            },
            background_color: Color::rgb(0.1, 0.1, 0.15).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{} ({})", editor_state.param_flag, flag_name),
                TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
            ));
        });

        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            ConditionParamFlagIncrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });
    });
}

fn render_value_param(parent: &mut ChildBuilder, editor_state: &ConditionEditorState) {
    parent.spawn(TextBundle::from_section(
        "Value:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

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
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            ConditionParamValueDecrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });

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
                format!("{}", editor_state.param_value),
                TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
            ));
        });

        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            ConditionParamValueIncrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });
    });
}
/// Render the action editor modal
pub fn render_action_editor_modal(
    mut commands: Commands,
    editor_state: Res<ActionEditorState>,
    game_state: Res<BuilderState>,
    query: Query<Entity, With<ActionEditorModal>>,
) {
    if !editor_state.is_open {
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
        .insert(ActionEditorModal)
        .with_children(|backdrop| {
            // Modal container
            backdrop.spawn((
                NodeBundle {
                    style: Style {
                        width: Val::Px(600.0),
                        height: Val::Px(500.0),
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
                    if editor_state.action_index.is_some() {
                        "Edit Action"
                    } else {
                        "Add New Action"
                    },
                    TextStyle {
                        font_size: 20.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));

                // Action type selector
                modal.spawn(TextBundle::from_section(
                    "Action Type:",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.8, 0.8, 0.8),
                        ..default()
                    },
                ));

                // Type buttons in a scrollable grid
                modal.spawn(NodeBundle {
                    style: Style {
                        display: Display::Grid,
                        grid_template_columns: RepeatedGridTrack::flex(2, 1.0),
                        column_gap: Val::Px(8.0),
                        row_gap: Val::Px(6.0),
                        max_height: Val::Px(150.0),
                        overflow: Overflow::clip_y(),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|grid| {
                    for (idx, (_code, name)) in ACTION_TYPES.iter().enumerate() {
                        let is_selected = idx == editor_state.selected_type;

                        grid.spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(8.0)),
                                    border: UiRect::all(Val::Px(2.0)),
                                    ..default()
                                },
                                background_color: if is_selected {
                                    Color::rgb(0.3, 0.5, 0.7).into()
                                } else {
                                    Color::rgb(0.2, 0.2, 0.25).into()
                                },
                                border_color: if is_selected {
                                    Color::rgb(0.5, 0.7, 0.9).into()
                                } else {
                                    Color::rgb(0.3, 0.3, 0.35).into()
                                },
                                ..default()
                            },
                            ActionTypeButton { type_index: idx },
                        ))
                        .with_children(|btn| {
                            btn.spawn(TextBundle::from_section(
                                *name,
                                TextStyle {
                                    font_size: 12.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });
                    }
                });

                // Parameters section
                modal.spawn(TextBundle::from_section(
                    "\nParameters:",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.8, 0.8, 0.8),
                        ..default()
                    },
                ));

                render_action_parameters(modal, &editor_state, &game_state);

                // Save/Cancel buttons
                modal.spawn(NodeBundle {
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
                    // Cancel
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

                    // Save
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(20.0), Val::Px(10.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                            ..default()
                        },
                        SaveActionButton,
                    ))
                    .with_children(|btn| {
                        btn.spawn(TextBundle::from_section(
                            "Save Action",
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

fn render_action_parameters(
    parent: &mut ChildBuilder,
    editor_state: &ActionEditorState,
    game_state: &BuilderState,
) {
    let type_code = ACTION_TYPES[editor_state.selected_type].0;

    match type_code {
        "ShowMessage" => {
            parent.spawn(TextBundle::from_section(
                "Message (placeholder - text input coming soon):",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));
            parent.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(10.0)),
                    ..default()
                },
                background_color: Color::rgb(0.1, 0.1, 0.15).into(),
                ..default()
            })
            .with_children(|value_box| {
                value_box.spawn(TextBundle::from_section(
                    &editor_state.param_message,
                    TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
                ));
            });
        }
        "GetObject" | "DropObject" | "WearObject" | "RemoveObject" => {
            render_action_object_param(parent, editor_state, game_state);
        }
        "PlaceObject" => {
            render_action_object_param(parent, editor_state, game_state);
            render_action_location_param(parent, editor_state, game_state);
        }
        "GoToLocation" => {
            render_action_location_param(parent, editor_state, game_state);
        }
        "SetFlag" => {
            render_action_flag_param(parent, editor_state, game_state);
            render_action_value_param(parent, editor_state);
        }
        "IncrementFlag" | "DecrementFlag" | "ClearFlag" | "SetBit" => {
            render_action_flag_param(parent, editor_state, game_state);
        }
        _ => {
            parent.spawn(TextBundle::from_section(
                "No parameters required",
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));
        }
    }
}

fn render_action_object_param(parent: &mut ChildBuilder, editor_state: &ActionEditorState, game_state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "Object:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    let object_name = game_state.current_game
        .get_object(editor_state.param_object)
        .map(|obj| obj.name.clone())
        .unwrap_or_else(|| "None".to_string());

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
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            ActionParamObjectDecrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });

        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(10.0)),
                min_width: Val::Px(200.0),
                ..default()
            },
            background_color: Color::rgb(0.1, 0.1, 0.15).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{} ({})", editor_state.param_object, object_name),
                TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
            ));
        });

        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            ActionParamObjectIncrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });
    });
}

fn render_action_location_param(parent: &mut ChildBuilder, editor_state: &ActionEditorState, game_state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "Location:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    let location_name = game_state.current_game
        .get_location(editor_state.param_location)
        .map(|loc| loc.name.clone())
        .unwrap_or_else(|| "None".to_string());

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
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            ActionParamLocationDecrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });

        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(10.0)),
                min_width: Val::Px(200.0),
                ..default()
            },
            background_color: Color::rgb(0.1, 0.1, 0.15).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{} ({})", editor_state.param_location, location_name),
                TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
            ));
        });

        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            ActionParamLocationIncrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });
    });
}

fn render_action_flag_param(parent: &mut ChildBuilder, editor_state: &ActionEditorState, game_state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "Flag:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    let flag_name = game_state.current_game
        .get_flag(editor_state.param_flag)
        .map(|flag| flag.name.clone())
        .unwrap_or_else(|| "None".to_string());

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
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            ActionParamFlagDecrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });

        row.spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(10.0)),
                min_width: Val::Px(200.0),
                ..default()
            },
            background_color: Color::rgb(0.1, 0.1, 0.15).into(),
            ..default()
        })
        .with_children(|value_box| {
            value_box.spawn(TextBundle::from_section(
                format!("{} ({})", editor_state.param_flag, flag_name),
                TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
            ));
        });

        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            ActionParamFlagIncrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });
    });
}

fn render_action_value_param(parent: &mut ChildBuilder, editor_state: &ActionEditorState) {
    parent.spawn(TextBundle::from_section(
        "Value:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

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
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                ..default()
            },
            ActionParamValueDecrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➖", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });

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
                format!("{}", editor_state.param_value),
                TextStyle { font_size: 14.0, color: Color::rgb(0.9, 0.9, 0.9), ..default() },
            ));
        });

        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.5, 0.3).into(),
                ..default()
            },
            ActionParamValueIncrement,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section("➕", TextStyle { font_size: 14.0, color: Color::WHITE, ..default() }));
        });
    });
}

// HANDLER SYSTEMS

/// Handle condition type selection button
pub fn handle_condition_type_button(
    mut editor_state: ResMut<ConditionEditorState>,
    mut interaction_query: Query<
        (&Interaction, &ConditionTypeButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            editor_state.selected_type = button.type_index;
        }
    }
}

/// Handle action type selection button
pub fn handle_action_type_button(
    mut editor_state: ResMut<ActionEditorState>,
    mut interaction_query: Query<
        (&Interaction, &ActionTypeButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            editor_state.selected_type = button.type_index;
        }
    }
}

/// Handle condition parameter adjustments
pub fn handle_condition_param_buttons(
    mut editor_state: ResMut<ConditionEditorState>,
    game_state: Res<BuilderState>,
    location_inc_query: Query<&Interaction, (Changed<Interaction>, With<ConditionParamLocationIncrement>)>,
    location_dec_query: Query<&Interaction, (Changed<Interaction>, With<ConditionParamLocationDecrement>)>,
    object_inc_query: Query<&Interaction, (Changed<Interaction>, With<ConditionParamObjectIncrement>)>,
    object_dec_query: Query<&Interaction, (Changed<Interaction>, With<ConditionParamObjectDecrement>)>,
    flag_inc_query: Query<&Interaction, (Changed<Interaction>, With<ConditionParamFlagIncrement>)>,
    flag_dec_query: Query<&Interaction, (Changed<Interaction>, With<ConditionParamFlagDecrement>)>,
    value_inc_query: Query<&Interaction, (Changed<Interaction>, With<ConditionParamValueIncrement>)>,
    value_dec_query: Query<&Interaction, (Changed<Interaction>, With<ConditionParamValueDecrement>)>,
) {
    // Location increment
    for interaction in location_inc_query.iter() {
        if *interaction == Interaction::Pressed {
            let max = game_state.current_game.locations.len().saturating_sub(1) as u8;
            if editor_state.param_location < max {
                editor_state.param_location += 1;
            }
        }
    }

    // Location decrement
    for interaction in location_dec_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_location > 0 {
                editor_state.param_location -= 1;
            }
        }
    }

    // Object increment
    for interaction in object_inc_query.iter() {
        if *interaction == Interaction::Pressed {
            let max = game_state.current_game.objects.len().saturating_sub(1) as u8;
            if editor_state.param_object < max {
                editor_state.param_object += 1;
            }
        }
    }

    // Object decrement
    for interaction in object_dec_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_object > 0 {
                editor_state.param_object -= 1;
            }
        }
    }

    // Flag increment
    for interaction in flag_inc_query.iter() {
        if *interaction == Interaction::Pressed {
            let max = game_state.current_game.flags.len().saturating_sub(1) as u8;
            if editor_state.param_flag < max {
                editor_state.param_flag += 1;
            }
        }
    }

    // Flag decrement
    for interaction in flag_dec_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_flag > 0 {
                editor_state.param_flag -= 1;
            }
        }
    }

    // Value increment
    for interaction in value_inc_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_value < 255 {
                editor_state.param_value += 1;
            }
        }
    }

    // Value decrement
    for interaction in value_dec_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_value > 0 {
                editor_state.param_value -= 1;
            }
        }
    }
}

/// Handle action parameter adjustments
pub fn handle_action_param_buttons(
    mut editor_state: ResMut<ActionEditorState>,
    game_state: Res<BuilderState>,
    object_inc_query: Query<&Interaction, (Changed<Interaction>, With<ActionParamObjectIncrement>)>,
    object_dec_query: Query<&Interaction, (Changed<Interaction>, With<ActionParamObjectDecrement>)>,
    location_inc_query: Query<&Interaction, (Changed<Interaction>, With<ActionParamLocationIncrement>)>,
    location_dec_query: Query<&Interaction, (Changed<Interaction>, With<ActionParamLocationDecrement>)>,
    flag_inc_query: Query<&Interaction, (Changed<Interaction>, With<ActionParamFlagIncrement>)>,
    flag_dec_query: Query<&Interaction, (Changed<Interaction>, With<ActionParamFlagDecrement>)>,
    value_inc_query: Query<&Interaction, (Changed<Interaction>, With<ActionParamValueIncrement>)>,
    value_dec_query: Query<&Interaction, (Changed<Interaction>, With<ActionParamValueDecrement>)>,
) {
    // Object increment
    for interaction in object_inc_query.iter() {
        if *interaction == Interaction::Pressed {
            let max = game_state.current_game.objects.len().saturating_sub(1) as u8;
            if editor_state.param_object < max {
                editor_state.param_object += 1;
            }
        }
    }

    // Object decrement
    for interaction in object_dec_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_object > 0 {
                editor_state.param_object -= 1;
            }
        }
    }

    // Location increment
    for interaction in location_inc_query.iter() {
        if *interaction == Interaction::Pressed {
            let max = game_state.current_game.locations.len().saturating_sub(1) as u8;
            if editor_state.param_location < max {
                editor_state.param_location += 1;
            }
        }
    }

    // Location decrement
    for interaction in location_dec_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_location > 0 {
                editor_state.param_location -= 1;
            }
        }
    }

    // Flag increment
    for interaction in flag_inc_query.iter() {
        if *interaction == Interaction::Pressed {
            let max = game_state.current_game.flags.len().saturating_sub(1) as u8;
            if editor_state.param_flag < max {
                editor_state.param_flag += 1;
            }
        }
    }

    // Flag decrement
    for interaction in flag_dec_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_flag > 0 {
                editor_state.param_flag -= 1;
            }
        }
    }

    // Value increment
    for interaction in value_inc_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_value < 255 {
                editor_state.param_value += 1;
            }
        }
    }

    // Value decrement
    for interaction in value_dec_query.iter() {
        if *interaction == Interaction::Pressed {
            if editor_state.param_value > 0 {
                editor_state.param_value -= 1;
            }
        }
    }
}

/// Handle save condition button
pub fn handle_save_condition_button(
    mut game_state: ResMut<BuilderState>,
    mut editor_state: ResMut<ConditionEditorState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SaveConditionButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(rule_index) = editor_state.rule_index {
                if let Some(rule) = game_state.current_game.rules.get_mut(rule_index) {
                    let condition_type = editor_state.build_condition_type();

                    if let Some(condition_index) = editor_state.condition_index {
                        // Edit existing condition
                        if let Some(condition) = rule.conditions.get_mut(condition_index) {
                            condition.condition_type = condition_type;
                            info!("Updated condition {} in rule {}", condition_index, rule_index);
                        }
                    } else {
                        // Add new condition
                        let new_id = rule.conditions.len();
                        rule.conditions.push(Condition {
                            id: new_id,
                            condition_type,
                        });
                        info!("Added new condition to rule {}", rule_index);
                    }

                    game_state.mark_dirty();
                }
            }

            editor_state.close();
        }
    }
}

/// Handle save action button
pub fn handle_save_action_button(
    mut game_state: ResMut<BuilderState>,
    mut editor_state: ResMut<ActionEditorState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SaveActionButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(rule_index) = editor_state.rule_index {
                if let Some(rule) = game_state.current_game.rules.get_mut(rule_index) {
                    let action_type = editor_state.build_action_type();

                    if let Some(action_index) = editor_state.action_index {
                        // Edit existing action
                        if let Some(action) = rule.actions.get_mut(action_index) {
                            action.action_type = action_type;
                            info!("Updated action {} in rule {}", action_index, rule_index);
                        }
                    } else {
                        // Add new action
                        let new_id = rule.actions.len();
                        rule.actions.push(Action {
                            id: new_id,
                            action_type,
                        });
                        info!("Added new action to rule {}", rule_index);
                    }

                    game_state.mark_dirty();
                }
            }

            editor_state.close();
        }
    }
}
