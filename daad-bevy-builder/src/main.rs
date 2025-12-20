use bevy::prelude::*;

mod builder;
mod daad;
mod viewer;
mod preview;

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
        .add_systems(Startup, setup)
        .add_systems(Update, (
            builder::ui::main_menu::render_menu,
            builder::ui::toolbar::render_toolbar,
            builder::ui::panels::render_active_panel,
            builder::ui::toolbar::handle_toolbar_clicks,
            viewer::code_display::render_code_viewer,
            // Location editor systems
            builder::editors::location_editor::render_location_editor,
            builder::editors::location_editor::handle_location_node_clicks,
            builder::editors::location_editor::handle_add_location_button,
            builder::editors::location_editor::handle_location_drag,
            builder::editors::location_editor::handle_connection_creation,
            builder::editors::location_editor::render_connection_preview,
            handle_keyboard_shortcuts,
        ))
        .run();
}

fn setup(mut commands: Commands) {
    commands.spawn(Camera2dBundle::default());
}

fn handle_keyboard_shortcuts(
    keys: Res<Input<KeyCode>>,
    mut state: ResMut<builder::state::BuilderState>,
) {
    // F1 = Toggle code viewer
    if keys.just_pressed(KeyCode::F1) {
        state.show_code_viewer = !state.show_code_viewer;
        info!("Code viewer: {}", state.show_code_viewer);
    }

    // F5 = Toggle preview
    if keys.just_pressed(KeyCode::F5) {
        state.show_preview = !state.show_preview;
        info!("Preview mode: {}", state.show_preview);
    }

    // Ctrl+S = Save project
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::S) {
        info!("Save requested (TODO: implement)");
        // TODO: Save project to JSON
    }

    // Ctrl+E = Export to DAAD
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::E) {
        info!("Export requested (TODO: implement)");
        // TODO: Export to .DDB file
    }
}
