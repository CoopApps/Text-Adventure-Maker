#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod daad;

use daad::{DaadGame, DaadCodeGenerator, Location, Object, Rule, Flag, Connection, Direction,
           ProcessTable, Condition, ConditionType, Action, ActionType, ObjectLocation,
           VocabEntry, VocabType, Vec2, Color};
use std::sync::Mutex;
use tauri::State;

/// Application state holding the current game
struct AppState {
    game: Mutex<DaadGame>,
    current_file: Mutex<Option<String>>,
}

// ============================================================================
// Game Management Commands
// ============================================================================

#[tauri::command]
fn get_game(state: State<AppState>) -> Result<DaadGame, String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    Ok(game.clone())
}

#[tauri::command]
fn new_game(title: String, author: String, state: State<AppState>) -> Result<DaadGame, String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    *game = DaadGame::new(&title, &author);
    let mut file = state.current_file.lock().map_err(|e| e.to_string())?;
    *file = None;
    Ok(game.clone())
}

#[tauri::command]
fn save_game(path: String, state: State<AppState>) -> Result<(), String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    game.save_to_file(&path).map_err(|e| e.to_string())?;
    let mut file = state.current_file.lock().map_err(|e| e.to_string())?;
    *file = Some(path);
    Ok(())
}

#[tauri::command]
fn load_game(path: String, state: State<AppState>) -> Result<DaadGame, String> {
    let loaded = DaadGame::load_from_file(&path).map_err(|e| e.to_string())?;
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    *game = loaded.clone();
    let mut file = state.current_file.lock().map_err(|e| e.to_string())?;
    *file = Some(path);
    Ok(loaded)
}

#[tauri::command]
fn update_game_info(title: String, author: String, version: String, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    game.title = title;
    game.author = author;
    game.version = version;
    Ok(())
}

// ============================================================================
// Location Commands
// ============================================================================

#[tauri::command]
fn get_locations(state: State<AppState>) -> Result<Vec<Location>, String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    Ok(game.locations.clone())
}

#[tauri::command]
fn add_location(name: String, description: String, state: State<AppState>) -> Result<Location, String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    let id = game.add_location(&name, &description);
    game.get_location(id).cloned().ok_or("Failed to create location".to_string())
}

#[tauri::command]
fn update_location(id: u8, name: String, description: String, is_dark: bool,
                   x: f32, y: f32, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    if let Some(loc) = game.locations.iter_mut().find(|l| l.id == id) {
        loc.name = name;
        loc.description = description;
        loc.is_dark = is_dark;
        loc.editor_position = Vec2::new(x, y);
        Ok(())
    } else {
        Err("Location not found".to_string())
    }
}

#[tauri::command]
fn delete_location(id: u8, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    game.locations.retain(|l| l.id != id);
    // Remove connections to this location
    for loc in &mut game.locations {
        loc.connections.retain(|c| c.target_location != id);
    }
    Ok(())
}

#[tauri::command]
fn add_connection(from_id: u8, to_id: u8, direction: String, state: State<AppState>) -> Result<(), String> {
    let dir = match direction.to_uppercase().as_str() {
        "N" | "NORTH" => Direction::North,
        "S" | "SOUTH" => Direction::South,
        "E" | "EAST" => Direction::East,
        "W" | "WEST" => Direction::West,
        "U" | "UP" => Direction::Up,
        "D" | "DOWN" => Direction::Down,
        "NE" | "NORTHEAST" => Direction::Northeast,
        "NW" | "NORTHWEST" => Direction::Northwest,
        "SE" | "SOUTHEAST" => Direction::Southeast,
        "SW" | "SOUTHWEST" => Direction::Southwest,
        "IN" => Direction::In,
        "OUT" => Direction::Out,
        _ => return Err("Invalid direction".to_string()),
    };

    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    if let Some(loc) = game.locations.iter_mut().find(|l| l.id == from_id) {
        loc.connections.push(Connection {
            direction: dir,
            target_location: to_id,
            is_locked: false,
            required_key: None,
        });
        Ok(())
    } else {
        Err("Source location not found".to_string())
    }
}

// ============================================================================
// Object Commands
// ============================================================================

#[tauri::command]
fn get_objects(state: State<AppState>) -> Result<Vec<Object>, String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    Ok(game.objects.clone())
}

#[tauri::command]
fn add_object(name: String, noun: String, description: String, state: State<AppState>) -> Result<Object, String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    let id = game.add_object(&name, &noun, &description);
    game.get_object(id).cloned().ok_or("Failed to create object".to_string())
}

#[tauri::command]
fn update_object(id: u8, name: String, noun: String, adjective: String, description: String,
                 location_type: String, location_value: Option<u8>, weight: u8,
                 is_container: bool, is_wearable: bool, is_takeable: bool, icon: String,
                 state: State<AppState>) -> Result<(), String> {
    let location = match location_type.as_str() {
        "location" => ObjectLocation::Location(location_value.unwrap_or(0)),
        "carried" => ObjectLocation::Carried,
        "worn" => ObjectLocation::Worn,
        "inside" => ObjectLocation::Inside(location_value.unwrap_or(0)),
        _ => ObjectLocation::Limbo,
    };

    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    if let Some(obj) = game.objects.iter_mut().find(|o| o.id == id) {
        obj.name = name;
        obj.noun = noun;
        obj.adjective = adjective;
        obj.description = description;
        obj.location = location;
        obj.weight = weight;
        obj.is_container = is_container;
        obj.is_wearable = is_wearable;
        obj.is_takeable = is_takeable;
        obj.icon = icon;
        Ok(())
    } else {
        Err("Object not found".to_string())
    }
}

#[tauri::command]
fn delete_object(id: u8, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    game.objects.retain(|o| o.id != id);
    Ok(())
}

// ============================================================================
// Rule Commands
// ============================================================================

#[tauri::command]
fn get_rules(state: State<AppState>) -> Result<Vec<Rule>, String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    Ok(game.rules.clone())
}

#[tauri::command]
fn add_rule(name: String, process: u8, state: State<AppState>) -> Result<Rule, String> {
    let process_table = match process {
        0 => ProcessTable::Parsing,
        1 => ProcessTable::Response,
        2 => ProcessTable::AutoAction,
        _ => ProcessTable::Description,
    };

    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    let id = game.add_rule(&name, process_table);
    game.get_rule(id).cloned().ok_or("Failed to create rule".to_string())
}

#[tauri::command]
fn update_rule(id: usize, name: String, process: u8, enabled: bool, state: State<AppState>) -> Result<(), String> {
    let process_table = match process {
        0 => ProcessTable::Parsing,
        1 => ProcessTable::Response,
        2 => ProcessTable::AutoAction,
        _ => ProcessTable::Description,
    };

    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == id) {
        rule.name = name;
        rule.process = process_table;
        rule.enabled = enabled;
        Ok(())
    } else {
        Err("Rule not found".to_string())
    }
}

#[tauri::command]
fn delete_rule(id: usize, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    game.rules.retain(|r| r.id != id);
    Ok(())
}

// ============================================================================
// Flag Commands
// ============================================================================

#[tauri::command]
fn get_flags(state: State<AppState>) -> Result<Vec<Flag>, String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    Ok(game.flags.clone())
}

#[tauri::command]
fn add_flag(name: String, description: String, state: State<AppState>) -> Result<Flag, String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    let id = game.add_flag(&name, &description);
    game.get_flag(id).cloned().ok_or("Failed to create flag".to_string())
}

#[tauri::command]
fn update_flag(id: u8, name: String, description: String, initial_value: u8, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    if let Some(flag) = game.flags.iter_mut().find(|f| f.id == id) {
        flag.name = name;
        flag.description = description;
        flag.initial_value = initial_value;
        Ok(())
    } else {
        Err("Flag not found".to_string())
    }
}

#[tauri::command]
fn delete_flag(id: u8, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    game.flags.retain(|f| f.id != id);
    Ok(())
}

// ============================================================================
// Message Commands
// ============================================================================

#[tauri::command]
fn get_messages(state: State<AppState>) -> Result<Vec<String>, String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    Ok(game.messages.clone())
}

#[tauri::command]
fn add_message(text: String, state: State<AppState>) -> Result<usize, String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    let id = game.messages.len();
    game.messages.push(text);
    Ok(id)
}

#[tauri::command]
fn update_message(index: usize, text: String, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    if index < game.messages.len() {
        game.messages[index] = text;
        Ok(())
    } else {
        Err("Message index out of bounds".to_string())
    }
}

#[tauri::command]
fn delete_message(index: usize, state: State<AppState>) -> Result<(), String> {
    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    if index < game.messages.len() {
        game.messages.remove(index);
        Ok(())
    } else {
        Err("Message index out of bounds".to_string())
    }
}

// ============================================================================
// Vocabulary Commands
// ============================================================================

#[tauri::command]
fn get_vocabulary(state: State<AppState>) -> Result<Vec<VocabEntry>, String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    Ok(game.vocabulary.clone())
}

#[tauri::command]
fn add_vocab_entry(word: String, word_type: String, id: u8, state: State<AppState>) -> Result<(), String> {
    let vocab_type = match word_type.to_lowercase().as_str() {
        "verb" => VocabType::Verb,
        "noun" => VocabType::Noun,
        "adjective" => VocabType::Adjective,
        _ => return Err("Invalid word type".to_string()),
    };

    let mut game = state.game.lock().map_err(|e| e.to_string())?;
    game.vocabulary.push(VocabEntry { word, word_type: vocab_type, id });
    Ok(())
}

// ============================================================================
// Code Generation Commands
// ============================================================================

#[tauri::command]
fn generate_daad_code(state: State<AppState>) -> Result<String, String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    Ok(DaadCodeGenerator::generate(&game))
}

#[tauri::command]
fn export_daad_code(path: String, state: State<AppState>) -> Result<(), String> {
    let game = state.game.lock().map_err(|e| e.to_string())?;
    let code = DaadCodeGenerator::generate(&game);
    std::fs::write(&path, code).map_err(|e| e.to_string())
}

// ============================================================================
// Main Entry Point
// ============================================================================

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            game: Mutex::new(DaadGame::default()),
            current_file: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            // Game management
            get_game, new_game, save_game, load_game, update_game_info,
            // Locations
            get_locations, add_location, update_location, delete_location, add_connection,
            // Objects
            get_objects, add_object, update_object, delete_object,
            // Rules
            get_rules, add_rule, update_rule, delete_rule,
            // Flags
            get_flags, add_flag, update_flag, delete_flag,
            // Messages
            get_messages, add_message, update_message, delete_message,
            // Vocabulary
            get_vocabulary, add_vocab_entry,
            // Code generation
            generate_daad_code, export_daad_code,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
