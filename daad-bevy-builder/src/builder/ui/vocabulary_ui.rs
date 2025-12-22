use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::game::{VocabEntry, VocabType};
use crate::daad::vocabulary_library;

/// Component tags for vocabulary UI elements
#[derive(Component)]
pub struct AddWordButton {
    pub word: String,
    pub word_type: VocabType,
}

#[derive(Component)]
pub struct RemoveWordButton {
    pub word_id: u8,
}

#[derive(Component)]
pub struct WordTypeFilter {
    pub filter: Option<VocabType>,
}

/// Render the interactive vocabulary panel
pub fn render_vocabulary_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "📖 Vocabulary Manager",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    // Memory usage info
    let max_words = 255; // DAAD limit
    let used_words = state.current_game.vocabulary.len();
    let percentage = (used_words as f32 / max_words as f32) * 100.0;

    let memory_color = if percentage > 90.0 {
        Color::rgb(1.0, 0.3, 0.3) // Red when almost full
    } else if percentage > 70.0 {
        Color::rgb(1.0, 0.8, 0.3) // Yellow when getting full
    } else {
        Color::rgb(0.3, 1.0, 0.3) // Green when plenty of space
    };

    parent.spawn(TextBundle::from_section(
        format!("\n📊 Memory Usage: {}/{} words ({:.1}%)", used_words, max_words, percentage),
        TextStyle {
            font_size: 16.0,
            color: memory_color,
            ..default()
        },
    ));

    // Current vocabulary section
    parent.spawn(TextBundle::from_section(
        "\n\n✓ Your Game's Vocabulary",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "Words currently available in your game parser:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Display current vocabulary grouped by type
    let word_types = [
        (VocabType::Verb, "🔨 Verbs", Color::rgb(0.9, 0.6, 0.6)),
        (VocabType::Noun, "📦 Nouns", Color::rgb(0.6, 0.9, 0.6)),
        (VocabType::Adjective, "✨ Adjectives", Color::rgb(0.6, 0.6, 0.9)),
        (VocabType::Adverb, "⚡ Adverbs", Color::rgb(0.9, 0.9, 0.6)),
        (VocabType::Preposition, "🔗 Prepositions", Color::rgb(0.9, 0.6, 0.9)),
        (VocabType::Pronoun, "👤 Pronouns", Color::rgb(0.6, 0.9, 0.9)),
        (VocabType::Conjugation, "🔀 Conjugations", Color::rgb(0.8, 0.8, 0.8)),
    ];

    for (word_type, title, color) in word_types {
        let words_of_type: Vec<_> = state.current_game.vocabulary
            .iter()
            .filter(|v| v.word_type == word_type)
            .collect();

        if !words_of_type.is_empty() {
            parent.spawn(TextBundle::from_section(
                format!("\n  {} ({})", title, words_of_type.len()),
                TextStyle {
                    font_size: 16.0,
                    color,
                    ..default()
                },
            ));

            for vocab in words_of_type {
                parent.spawn(TextBundle::from_section(
                    format!("    • {} (ID: {})", vocab.word, vocab.id),
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.7, 0.7, 0.7),
                        ..default()
                    },
                ));
            }
        }
    }

    // Word library section
    parent.spawn(TextBundle::from_section(
        "\n\n📚 Word Library",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.9, 0.7, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "Common adventure game words you can add to your vocabulary:",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Display available words by type
    for (word_type, title, color) in word_types {
        let library_words = vocabulary_library::get_words_by_type(word_type);

        // Filter out words already in game
        let available_words: Vec<_> = library_words.iter()
            .filter(|lib_word| {
                !state.current_game.vocabulary.iter()
                    .any(|v| v.word == lib_word.word)
            })
            .collect();

        if !available_words.is_empty() {
            parent.spawn(TextBundle::from_section(
                format!("\n  {} ({} available)", title, available_words.len()),
                TextStyle {
                    font_size: 16.0,
                    color,
                    ..default()
                },
            ));

            // Show first 10 words of each type
            let display_count = available_words.len().min(10);
            for lib_word in available_words.iter().take(display_count) {
                parent.spawn(TextBundle::from_section(
                    format!("    • {} - {} [Click to add]", lib_word.word, lib_word.description),
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }

            if available_words.len() > display_count {
                parent.spawn(TextBundle::from_section(
                    format!("    ... and {} more", available_words.len() - display_count),
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.5, 0.5, 0.5),
                        ..default()
                    },
                ));
            }
        }
    }

    // Instructions
    parent.spawn(TextBundle::from_section(
        "\n\n💡 Instructions:",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.9, 0.9, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • DAAD limits words to 5 characters maximum",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Maximum 255 words total per game",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Words are case-insensitive in game",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\n📝 TODO: Interactive buttons coming soon!",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.5, 0.7, 0.9),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "For now, edit vocabulary in JSON or add via code.",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.5, 0.5, 0.5),
            ..default()
        },
    ));
}

/// System to handle adding words from library
pub fn handle_add_word_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &AddWordButton),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Find next available ID
            let next_id = state.current_game.vocabulary
                .iter()
                .map(|v| v.id)
                .max()
                .map_or(0, |max_id| max_id + 1);

            // Add word to vocabulary
            state.current_game.vocabulary.push(VocabEntry {
                word: button.word.clone(),
                word_type: button.word_type,
                id: next_id,
            });

            info!("Added word '{}' to vocabulary (ID: {})", button.word, next_id);
        }
    }
}

/// System to handle removing words
pub fn handle_remove_word_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &RemoveWordButton),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Remove word from vocabulary
            state.current_game.vocabulary.retain(|v| v.id != button.word_id);
            info!("Removed word with ID {} from vocabulary", button.word_id);
        }
    }
}
