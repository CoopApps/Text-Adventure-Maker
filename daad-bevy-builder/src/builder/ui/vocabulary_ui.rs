use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::game::{VocabEntry, VocabType};
use crate::daad::vocabulary_library;

/// Resource to track vocabulary search and filter state
#[derive(Resource, Default)]
pub struct VocabularySearchState {
    pub search_query: String,
    pub active_filter: Option<VocabType>,
}

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
pub struct ImportStandardVocabularyButton;

#[derive(Component)]
pub struct WordTypeFilter {
    pub filter: Option<VocabType>,
}

#[derive(Component)]
pub struct SearchInput;

#[derive(Component)]
pub struct ClearSearchButton;

/// Render the interactive vocabulary panel
pub fn render_vocabulary_panel(parent: &mut ChildBuilder, state: &BuilderState, search_state: &VocabularySearchState) {
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
        format!("\n📊 Memory Usage: {}/{} words ({:.1}%)\n", used_words, max_words, percentage),
        TextStyle {
            font_size: 16.0,
            color: memory_color,
            ..default()
        },
    ));

    // Search and Filter section
    parent.spawn(TextBundle::from_section(
        "🔍 Search & Filter",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.6),
            ..default()
        },
    ));

    // Search input display
    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            align_items: AlignItems::Center,
            column_gap: Val::Px(10.0),
            margin: UiRect::vertical(Val::Px(8.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|row| {
        // Search box (visual display only, click to edit)
        row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(8.0)),
                    min_width: Val::Px(300.0),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgb(0.15, 0.15, 0.2).into(),
                border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                ..default()
            },
            SearchInput,
        ))
        .with_children(|button| {
            let display_text = if search_state.search_query.is_empty() {
                "Click to search words...".to_string()
            } else {
                format!("🔍 {}", search_state.search_query)
            };

            button.spawn(TextBundle::from_section(
                display_text,
                TextStyle {
                    font_size: 14.0,
                    color: if search_state.search_query.is_empty() {
                        Color::rgb(0.5, 0.5, 0.5)
                    } else {
                        Color::rgb(0.9, 0.9, 1.0)
                    },
                    ..default()
                },
            ));
        });

        // Clear search button (only show if search is active)
        if !search_state.search_query.is_empty() {
            row.spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::axes(Val::Px(10.0), Val::Px(8.0)),
                        border: UiRect::all(Val::Px(1.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.5, 0.3, 0.3).into(),
                    border_color: Color::rgb(0.7, 0.4, 0.4).into(),
                    ..default()
                },
                ClearSearchButton,
            ))
            .with_children(|button| {
                button.spawn(TextBundle::from_section(
                    "❌ Clear",
                    TextStyle {
                        font_size: 13.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });
        }
    });

    // Word type filter buttons
    parent.spawn(TextBundle::from_section(
        "Filter by type:",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    parent.spawn(NodeBundle {
        style: Style {
            display: Display::Flex,
            flex_direction: FlexDirection::Row,
            flex_wrap: FlexWrap::Wrap,
            column_gap: Val::Px(8.0),
            row_gap: Val::Px(6.0),
            margin: UiRect::vertical(Val::Px(8.0)),
            ..default()
        },
        ..default()
    })
    .with_children(|filter_row| {
        // "All" filter button
        let is_active = search_state.active_filter.is_none();
        filter_row.spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::axes(Val::Px(12.0), Val::Px(6.0)),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: if is_active {
                    Color::rgb(0.3, 0.5, 0.7).into()
                } else {
                    Color::rgb(0.2, 0.2, 0.25).into()
                },
                border_color: if is_active {
                    Color::rgb(0.5, 0.7, 0.9).into()
                } else {
                    Color::rgb(0.3, 0.3, 0.35).into()
                },
                ..default()
            },
            WordTypeFilter { filter: None },
        ))
        .with_children(|button| {
            button.spawn(TextBundle::from_section(
                "All Types",
                TextStyle {
                    font_size: 12.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });

        // Individual type filter buttons
        let word_types = [
            (VocabType::Verb, "🔨 Verbs", Color::rgb(0.9, 0.6, 0.6)),
            (VocabType::Noun, "📦 Nouns", Color::rgb(0.6, 0.9, 0.6)),
            (VocabType::Adjective, "✨ Adjectives", Color::rgb(0.6, 0.6, 0.9)),
            (VocabType::Adverb, "⚡ Adverbs", Color::rgb(0.9, 0.9, 0.6)),
            (VocabType::Preposition, "🔗 Prepositions", Color::rgb(0.9, 0.6, 0.9)),
            (VocabType::Pronoun, "👤 Pronouns", Color::rgb(0.6, 0.9, 0.9)),
            (VocabType::Conjugation, "🔀 Conjugations", Color::rgb(0.8, 0.8, 0.8)),
        ];

        for (word_type, label, _color) in word_types {
            let is_active = search_state.active_filter == Some(word_type);
            filter_row.spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::axes(Val::Px(12.0), Val::Px(6.0)),
                        border: UiRect::all(Val::Px(2.0)),
                        ..default()
                    },
                    background_color: if is_active {
                        Color::rgb(0.3, 0.5, 0.7).into()
                    } else {
                        Color::rgb(0.2, 0.2, 0.25).into()
                    },
                    border_color: if is_active {
                        Color::rgb(0.5, 0.7, 0.9).into()
                    } else {
                        Color::rgb(0.3, 0.3, 0.35).into()
                    },
                    ..default()
                },
                WordTypeFilter { filter: Some(word_type) },
            ))
            .with_children(|button| {
                button.spawn(TextBundle::from_section(
                    label,
                    TextStyle {
                        font_size: 12.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });
        }
    });

    parent.spawn(TextBundle::from_section(
        " ",
        TextStyle {
            font_size: 8.0,
            ..default()
        },
    ));

    // Current vocabulary section
    parent.spawn(TextBundle::from_section(
        "✓ Your Game's Vocabulary",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "Words currently available in your game parser (click ❌ to remove):\n",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Display current vocabulary grouped by type with remove buttons
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
                format!("{} ({})", title, words_of_type.len()),
                TextStyle {
                    font_size: 16.0,
                    color,
                    ..default()
                },
            ));

            // Word grid with remove buttons
            parent.spawn(NodeBundle {
                style: Style {
                    display: Display::Flex,
                    flex_direction: FlexDirection::Row,
                    flex_wrap: FlexWrap::Wrap,
                    column_gap: Val::Px(8.0),
                    row_gap: Val::Px(6.0),
                    padding: UiRect::all(Val::Px(8.0)),
                    ..default()
                },
                ..default()
            })
            .with_children(|word_grid| {
                for vocab in words_of_type {
                    // Each word with remove button
                    word_grid.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(10.0), Val::Px(6.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.4, 0.3, 0.3).into(),
                            ..default()
                        },
                        RemoveWordButton { word_id: vocab.id },
                    ))
                    .with_children(|button| {
                        button.spawn(TextBundle::from_section(
                            format!("❌ {}", vocab.word),
                            TextStyle {
                                font_size: 13.0,
                                color: Color::rgb(1.0, 0.9, 0.9),
                                ..default()
                            },
                        ));
                    });
                }
            });
        }
    }

    // Bulk import section
    parent.spawn(TextBundle::from_section(
        "\n⚡ Quick Actions",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(1.0, 0.9, 0.6),
            ..default()
        },
    ));

    // Import standard vocabulary button
    parent
        .spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(15.0)),
                    margin: UiRect::vertical(Val::Px(10.0)),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                ..default()
            },
            ImportStandardVocabularyButton,
        ))
        .with_children(|btn| {
            btn.spawn(TextBundle::from_section(
                "📥 Import All Standard English Verbs",
                TextStyle {
                    font_size: 15.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));
        });

    parent.spawn(TextBundle::from_section(
        "Imports common verbs (TAKE, DROP, LOOK, EXAMINE, etc.) in one click",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));

    // Word library section
    parent.spawn(TextBundle::from_section(
        "\n📚 Word Library",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.9, 0.7, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "Common adventure game words you can add (click ➕ to add):\n",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    // Display available words by type with add buttons
    for (word_type, title, color) in word_types {
        // Skip this type if filter is active and doesn't match
        if let Some(active_filter) = search_state.active_filter {
            if active_filter != word_type {
                continue;
            }
        }

        let library_words = vocabulary_library::get_words_by_type(word_type);

        // Filter out words already in game and apply search filter
        let search_lower = search_state.search_query.to_lowercase();
        let available_words: Vec<_> = library_words.iter()
            .filter(|lib_word| {
                // Not already in game
                let not_in_game = !state.current_game.vocabulary.iter()
                    .any(|v| v.word == lib_word.word);

                // Matches search (if search is active)
                let matches_search = if search_lower.is_empty() {
                    true
                } else {
                    lib_word.word.to_lowercase().contains(&search_lower)
                };

                not_in_game && matches_search
            })
            .collect();

        if !available_words.is_empty() {
            parent.spawn(TextBundle::from_section(
                format!("{} ({} available)", title, available_words.len()),
                TextStyle {
                    font_size: 16.0,
                    color,
                    ..default()
                },
            ));

            // Show more words when search/filter is active, otherwise show first 15
            let display_count = if !search_state.search_query.is_empty() || search_state.active_filter.is_some() {
                available_words.len().min(50)
            } else {
                available_words.len().min(15)
            };

            parent.spawn(NodeBundle {
                style: Style {
                    display: Display::Flex,
                    flex_direction: FlexDirection::Row,
                    flex_wrap: FlexWrap::Wrap,
                    column_gap: Val::Px(8.0),
                    row_gap: Val::Px(6.0),
                    padding: UiRect::all(Val::Px(8.0)),
                    ..default()
                },
                ..default()
            })
            .with_children(|word_grid| {
                for lib_word in available_words.iter().take(display_count) {
                    // Add button for each available word
                    word_grid.spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::axes(Val::Px(10.0), Val::Px(6.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.2, 0.4, 0.3).into(),
                            ..default()
                        },
                        AddWordButton {
                            word: lib_word.word.to_string(),
                            word_type,
                        },
                    ))
                    .with_children(|button| {
                        button.spawn(TextBundle::from_section(
                            format!("➕ {}", lib_word.word),
                            TextStyle {
                                font_size: 13.0,
                                color: Color::rgb(0.9, 1.0, 0.9),
                                ..default()
                            },
                        ));
                    });
                }
            });

            if available_words.len() > display_count {
                parent.spawn(TextBundle::from_section(
                    format!("... and {} more (use search/filter to narrow results)", available_words.len() - display_count),
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
        "\n💡 How to Use:",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.9, 0.9, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Click ➕ on library words to add them to your game",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.8, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Click ❌ on your words to remove them",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.8, 0.6, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • DAAD limits: 5 characters max per word, 255 words total",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Words are case-insensitive during gameplay",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Use the search box to find specific words quickly",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.8, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Filter by word type to see only verbs, nouns, etc.",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.6, 0.8, 0.6),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "  • Custom word input coming soon!",
        TextStyle {
            font_size: 12.0,
            color: Color::rgb(0.5, 0.7, 0.9),
            ..default()
        },
    ));
}

/// System to handle importing all standard vocabulary
pub fn handle_import_standard_vocabulary_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<ImportStandardVocabularyButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Get all verbs from the library
            let all_verbs = vocabulary_library::get_words_by_type(VocabType::Verb);

            let mut imported_count = 0;
            let mut next_id = state.current_game.vocabulary
                .iter()
                .map(|v| v.id)
                .max()
                .map_or(0, |max_id| max_id + 1);

            for lib_word in all_verbs {
                // Only add if not already in vocabulary
                if !state.current_game.vocabulary.iter().any(|v| v.word == lib_word.word) {
                    state.current_game.vocabulary.push(VocabEntry {
                        word: lib_word.word.to_string(),
                        word_type: lib_word.word_type,
                        id: next_id,
                        translations: std::collections::HashMap::new(),
                    });
                    next_id += 1;
                    imported_count += 1;
                }
            }

            state.mark_dirty();
            info!("✅ Imported {} standard verbs to vocabulary", imported_count);
        }
    }
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
                translations: std::collections::HashMap::new(),
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
            state.mark_dirty();
            info!("Removed word with ID {} from vocabulary", button.word_id);
        }
    }
}

/// System to handle word type filter button clicks
pub fn handle_word_type_filter_button(
    mut search_state: ResMut<VocabularySearchState>,
    mut interaction_query: Query<
        (&Interaction, &WordTypeFilter),
        (Changed<Interaction>, With<Button>),
    >,
) {
    for (interaction, filter) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            search_state.active_filter = filter.filter;
            info!("Applied word type filter: {:?}", filter.filter);
        }
    }
}

/// System to handle clear search button click
pub fn handle_clear_search_button(
    mut search_state: ResMut<VocabularySearchState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<ClearSearchButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            search_state.search_query.clear();
            info!("Cleared vocabulary search");
        }
    }
}

/// System to handle clicking the search input box (opens text input modal)
pub fn handle_vocabulary_search_input(
    mut modal_state: ResMut<super::components::TextInputModalState>,
    search_state: Res<VocabularySearchState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SearchInput>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Open text input modal for search
            modal_state.open_single_line(
                "Search Vocabulary",
                &search_state.search_query,
                "Type to search words...",
                "vocab_search"
            );
        }
    }
}

/// System to process search text input from modal
pub fn process_vocabulary_search_modal(
    mut search_state: ResMut<VocabularySearchState>,
    modal_state: Res<super::components::TextInputModalState>,
) {
    // Check if modal was just closed with vocab_search callback
    if !modal_state.is_open && modal_state.callback_id.as_deref() == Some("vocab_search") {
        // Modal was open but now closed, update search if value changed
        if !modal_state.current_value.is_empty() || !search_state.search_query.is_empty() {
            search_state.search_query = modal_state.current_value.clone();
            info!("Updated vocabulary search: {}", search_state.search_query);
        }
    }
}
