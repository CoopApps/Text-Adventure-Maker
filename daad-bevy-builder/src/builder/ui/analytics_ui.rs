use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::builder::ui::components::{ValidationResults, ValidationSeverity};
use crate::daad::types::*;
use crate::daad::game::{DaadGame, VocabType};

/// Renders the Analytics panel showing game statistics and content analysis
pub fn render_analytics_panel(parent: &mut ChildBuilder, state: &BuilderState, validation: &ValidationResults) {
    let game = &state.current_game;

    // Calculate all statistics
    let stats = calculate_game_statistics(game);

    parent.spawn(NodeBundle {
        style: Style {
            width: Val::Percent(100.0),
            height: Val::Percent(100.0),
            flex_direction: FlexDirection::Column,
            padding: UiRect::all(Val::Px(20.0)),
            row_gap: Val::Px(20.0),
            overflow: Overflow::clip_y(),
            ..default()
        },
        background_color: Color::rgba(0.12, 0.12, 0.18, 0.95).into(),
        ..default()
    })
    .with_children(|panel| {
        // Header
        panel.spawn(TextBundle::from_section(
            "📊 Game Statistics & Analytics",
            TextStyle {
                font_size: 28.0,
                color: Color::rgb(0.9, 0.95, 1.0),
                ..default()
            },
        ));

        // Validation Results Section (if validation has been run)
        if !validation.issues.is_empty() || validation.last_validated.is_some() {
            render_validation_section(panel, validation);
        }

        // Overview Section
        render_overview_section(panel, &stats, game);

        // Content Analysis Section
        render_content_analysis_section(panel, &stats, game);

        // Complexity Analysis Section
        render_complexity_section(panel, &stats);

        // Memory & Size Estimates Section
        render_memory_section(panel, &stats);

        // Warnings & Recommendations Section
        render_recommendations_section(panel, &stats);
    });
}

/// Comprehensive game statistics
#[derive(Debug, Clone)]
pub struct GameStatistics {
    // Content counts
    pub location_count: usize,
    pub object_count: usize,
    pub rule_count: usize,
    pub flag_count: usize,
    pub vocabulary_count: usize,
    pub message_count: usize,

    // Vocabulary breakdown
    pub verb_count: usize,
    pub noun_count: usize,
    pub adjective_count: usize,
    pub adverb_count: usize,
    pub preposition_count: usize,
    pub pronoun_count: usize,
    pub conjugation_count: usize,

    // Rule complexity
    pub total_conditions: usize,
    pub total_actions: usize,
    pub avg_conditions_per_rule: f32,
    pub avg_actions_per_rule: f32,
    pub max_conditions_in_rule: usize,
    pub max_actions_in_rule: usize,
    pub most_complex_rule_id: Option<usize>,

    // Process table distribution
    pub parsing_rules: usize,
    pub response_rules: usize,
    pub auto_action_rules: usize,
    pub description_rules: usize,

    // Location analysis
    pub connected_locations: usize,
    pub isolated_locations: usize,
    pub dark_locations: usize,
    pub avg_connections_per_location: f32,
    pub max_connections: usize,

    // Object analysis
    pub carried_objects: usize,
    pub worn_objects: usize,
    pub container_objects: usize,
    pub takeable_objects: usize,
    pub wearable_objects: usize,
    pub objects_in_limbo: usize,
    pub heaviest_object_weight: u8,

    // Flag usage
    pub system_flags_used: usize,
    pub user_flags_used: usize,
    pub flags_with_initial_value: usize,

    // Memory estimates (bytes)
    pub estimated_vocabulary_size: usize,
    pub estimated_message_size: usize,
    pub estimated_location_size: usize,
    pub estimated_object_size: usize,
    pub estimated_rule_size: usize,
    pub estimated_total_size: usize,

    // Warnings
    pub vocab_percentage: f32,
    pub flag_percentage: f32,
    pub has_unreachable_locations: bool,
    pub has_empty_rules: bool,
    pub has_large_rules: bool,
}

fn calculate_game_statistics(game: &DaadGame) -> GameStatistics {
    // Content counts
    let location_count = game.locations.len();
    let object_count = game.objects.len();
    let rule_count = game.rules.len();
    let flag_count = game.flags.len();
    let vocabulary_count = game.vocabulary.len();
    let message_count = game.messages.len();

    // Vocabulary breakdown
    let mut verb_count = 0;
    let mut noun_count = 0;
    let mut adjective_count = 0;
    let mut adverb_count = 0;
    let mut preposition_count = 0;
    let mut pronoun_count = 0;
    let mut conjugation_count = 0;

    for vocab in &game.vocabulary {
        match vocab.word_type {
            VocabType::Verb => verb_count += 1,
            VocabType::Noun => noun_count += 1,
            VocabType::Adjective => adjective_count += 1,
            VocabType::Adverb => adverb_count += 1,
            VocabType::Preposition => preposition_count += 1,
            VocabType::Pronoun => pronoun_count += 1,
            VocabType::Conjugation => conjugation_count += 1,
        }
    }

    // Rule complexity analysis
    let mut total_conditions = 0;
    let mut total_actions = 0;
    let mut max_conditions_in_rule = 0;
    let mut max_actions_in_rule = 0;
    let mut most_complex_rule_id = None;
    let mut max_complexity = 0;

    let mut parsing_rules = 0;
    let mut response_rules = 0;
    let mut auto_action_rules = 0;
    let mut description_rules = 0;

    for rule in &game.rules {
        let cond_count = rule.conditions.len();
        let action_count = rule.actions.len();

        total_conditions += cond_count;
        total_actions += action_count;

        if cond_count > max_conditions_in_rule {
            max_conditions_in_rule = cond_count;
        }
        if action_count > max_actions_in_rule {
            max_actions_in_rule = action_count;
        }

        let complexity = cond_count + action_count;
        if complexity > max_complexity {
            max_complexity = complexity;
            most_complex_rule_id = Some(rule.id);
        }

        match rule.process {
            ProcessTable::Parsing => parsing_rules += 1,
            ProcessTable::Response => response_rules += 1,
            ProcessTable::AutoAction => auto_action_rules += 1,
            ProcessTable::Description => description_rules += 1,
        }
    }

    let avg_conditions_per_rule = if rule_count > 0 {
        total_conditions as f32 / rule_count as f32
    } else {
        0.0
    };

    let avg_actions_per_rule = if rule_count > 0 {
        total_actions as f32 / rule_count as f32
    } else {
        0.0
    };

    // Location analysis
    let mut connected_locations = 0;
    let mut isolated_locations = 0;
    let mut dark_locations = 0;
    let mut total_connections = 0;
    let mut max_connections = 0;

    for location in &game.locations {
        let conn_count = location.connections.len();
        total_connections += conn_count;

        if conn_count > 0 {
            connected_locations += 1;
        } else {
            isolated_locations += 1;
        }

        if conn_count > max_connections {
            max_connections = conn_count;
        }

        if location.is_dark {
            dark_locations += 1;
        }
    }

    let avg_connections_per_location = if location_count > 0 {
        total_connections as f32 / location_count as f32
    } else {
        0.0
    };

    // Object analysis
    let mut carried_objects = 0;
    let mut worn_objects = 0;
    let mut container_objects = 0;
    let mut takeable_objects = 0;
    let mut wearable_objects = 0;
    let mut objects_in_limbo = 0;
    let mut heaviest_object_weight = 0;

    for object in &game.objects {
        match object.location {
            ObjectLocation::Carried => carried_objects += 1,
            ObjectLocation::Worn => worn_objects += 1,
            ObjectLocation::Limbo => objects_in_limbo += 1,
            _ => {}
        }

        if object.is_container {
            container_objects += 1;
        }
        if object.is_takeable {
            takeable_objects += 1;
        }
        if object.is_wearable {
            wearable_objects += 1;
        }
        if object.weight > heaviest_object_weight {
            heaviest_object_weight = object.weight;
        }
    }

    // Flag usage
    let mut system_flags_used = 0;
    let mut user_flags_used = 0;
    let mut flags_with_initial_value = 0;

    for flag in &game.flags {
        if flag.id < 64 {
            system_flags_used += 1;
        } else {
            user_flags_used += 1;
        }

        if flag.initial_value > 0 {
            flags_with_initial_value += 1;
        }
    }

    // Memory estimates (rough approximations)
    let estimated_vocabulary_size = vocabulary_count * 6; // ~6 bytes per word (5 chars + type)
    let estimated_message_size = game.messages.iter()
        .map(|m| m.len() + 2)
        .sum::<usize>();
    let estimated_location_size = location_count * 100; // name + desc + connections
    let estimated_object_size = object_count * 80; // name + desc + properties
    let estimated_rule_size = (total_conditions + total_actions) * 3; // ~3 bytes per condact
    let estimated_total_size = estimated_vocabulary_size + estimated_message_size
        + estimated_location_size + estimated_object_size + estimated_rule_size;

    // Percentages
    let vocab_percentage = (vocabulary_count as f32 / 255.0) * 100.0;
    let flag_percentage = (flag_count as f32 / 256.0) * 100.0;

    // Warnings
    let has_unreachable_locations = isolated_locations > 0;
    let has_empty_rules = game.rules.iter().any(|r| r.conditions.is_empty() && r.actions.is_empty());
    let has_large_rules = max_conditions_in_rule + max_actions_in_rule > 20;

    GameStatistics {
        location_count,
        object_count,
        rule_count,
        flag_count,
        vocabulary_count,
        message_count,
        verb_count,
        noun_count,
        adjective_count,
        adverb_count,
        preposition_count,
        pronoun_count,
        conjugation_count,
        total_conditions,
        total_actions,
        avg_conditions_per_rule,
        avg_actions_per_rule,
        max_conditions_in_rule,
        max_actions_in_rule,
        most_complex_rule_id,
        parsing_rules,
        response_rules,
        auto_action_rules,
        description_rules,
        connected_locations,
        isolated_locations,
        dark_locations,
        avg_connections_per_location,
        max_connections,
        carried_objects,
        worn_objects,
        container_objects,
        takeable_objects,
        wearable_objects,
        objects_in_limbo,
        heaviest_object_weight,
        system_flags_used,
        user_flags_used,
        flags_with_initial_value,
        estimated_vocabulary_size,
        estimated_message_size,
        estimated_location_size,
        estimated_object_size,
        estimated_rule_size,
        estimated_total_size,
        vocab_percentage,
        flag_percentage,
        has_unreachable_locations,
        has_empty_rules,
        has_large_rules,
    }
}

fn render_overview_section(parent: &mut ChildBuilder, stats: &GameStatistics, game: &DaadGame) {
    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            row_gap: Val::Px(12.0),
            ..default()
        },
        ..default()
    })
    .with_children(|section| {
        // Section header
        section.spawn(TextBundle::from_section(
            "📋 Overview",
            TextStyle {
                font_size: 22.0,
                color: Color::rgb(0.8, 0.9, 1.0),
                ..default()
            },
        ));

        // Game info grid
        section.spawn(NodeBundle {
            style: Style {
                display: Display::Grid,
                grid_template_columns: RepeatedGridTrack::flex(3, 1.0),
                column_gap: Val::Px(16.0),
                row_gap: Val::Px(12.0),
                ..default()
            },
            ..default()
        })
        .with_children(|grid| {
            let overview_stats: Vec<(&str, String, Color)> = vec![
                ("Title", game.title.clone(), Color::rgb(0.6, 0.8, 1.0)),
                ("Author", game.author.clone(), Color::rgb(0.6, 0.8, 1.0)),
                ("Version", game.version.clone(), Color::rgb(0.6, 0.8, 1.0)),
                ("Locations", stats.location_count.to_string(), Color::rgb(0.7, 0.9, 0.7)),
                ("Objects", stats.object_count.to_string(), Color::rgb(0.9, 0.9, 0.7)),
                ("Rules", stats.rule_count.to_string(), Color::rgb(0.9, 0.7, 0.9)),
                ("Flags", format!("{}/{}", stats.flag_count, 256), get_percentage_color(stats.flag_percentage)),
                ("Vocabulary", format!("{}/{}", stats.vocabulary_count, 255), get_percentage_color(stats.vocab_percentage)),
                ("Messages", stats.message_count.to_string(), Color::rgb(0.8, 0.8, 0.9)),
            ];

            for (label, value, color) in overview_stats {
                render_stat_card(grid, label, &value, color);
            }
        });
    });
}

fn render_content_analysis_section(parent: &mut ChildBuilder, stats: &GameStatistics, game: &DaadGame) {
    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            row_gap: Val::Px(12.0),
            ..default()
        },
        ..default()
    })
    .with_children(|section| {
        section.spawn(TextBundle::from_section(
            "🔍 Content Analysis",
            TextStyle {
                font_size: 22.0,
                color: Color::rgb(0.8, 0.9, 1.0),
                ..default()
            },
        ));

        // Vocabulary breakdown
        section.spawn(NodeBundle {
            style: Style {
                display: Display::Grid,
                grid_template_columns: RepeatedGridTrack::flex(4, 1.0),
                column_gap: Val::Px(12.0),
                row_gap: Val::Px(10.0),
                ..default()
            },
            ..default()
        })
        .with_children(|grid| {
            let vocab_stats: Vec<(&str, String, Color)> = vec![
                ("Verbs", stats.verb_count.to_string(), Color::rgb(0.9, 0.7, 0.7)),
                ("Nouns", stats.noun_count.to_string(), Color::rgb(0.7, 0.9, 0.7)),
                ("Adjectives", stats.adjective_count.to_string(), Color::rgb(0.7, 0.7, 0.9)),
                ("Adverbs", stats.adverb_count.to_string(), Color::rgb(0.9, 0.9, 0.7)),
                ("Prepositions", stats.preposition_count.to_string(), Color::rgb(0.9, 0.7, 0.9)),
                ("Pronouns", stats.pronoun_count.to_string(), Color::rgb(0.7, 0.9, 0.9)),
                ("Conjugations", stats.conjugation_count.to_string(), Color::rgb(0.8, 0.8, 0.8)),
            ];
            for (label, value, color) in vocab_stats {
                render_stat_card(grid, label, &value, color);
            }
        });

        // Object breakdown
        section.spawn(NodeBundle {
            style: Style {
                display: Display::Grid,
                grid_template_columns: RepeatedGridTrack::flex(4, 1.0),
                column_gap: Val::Px(12.0),
                row_gap: Val::Px(10.0),
                margin: UiRect::top(Val::Px(12.0)),
                ..default()
            },
            ..default()
        })
        .with_children(|grid| {
            let object_stats: Vec<(&str, String, Color)> = vec![
                ("Takeable", stats.takeable_objects.to_string(), Color::rgb(0.7, 0.9, 0.7)),
                ("Containers", stats.container_objects.to_string(), Color::rgb(0.9, 0.8, 0.7)),
                ("Wearable", stats.wearable_objects.to_string(), Color::rgb(0.8, 0.7, 0.9)),
                ("In Limbo", stats.objects_in_limbo.to_string(), Color::rgb(0.6, 0.6, 0.7)),
            ];
            for (label, value, color) in object_stats {
                render_stat_card(grid, label, &value, color);
            }
        });
    });
}

fn render_complexity_section(parent: &mut ChildBuilder, stats: &GameStatistics) {
    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            row_gap: Val::Px(12.0),
            ..default()
        },
        ..default()
    })
    .with_children(|section| {
        section.spawn(TextBundle::from_section(
            "⚙️ Complexity Analysis",
            TextStyle {
                font_size: 22.0,
                color: Color::rgb(0.8, 0.9, 1.0),
                ..default()
            },
        ));

        section.spawn(NodeBundle {
            style: Style {
                display: Display::Grid,
                grid_template_columns: RepeatedGridTrack::flex(4, 1.0),
                column_gap: Val::Px(12.0),
                row_gap: Val::Px(10.0),
                ..default()
            },
            ..default()
        })
        .with_children(|grid| {
            let complexity_stats: Vec<(&str, String, Color)> = vec![
                // Rule complexity
                ("Total Conditions", stats.total_conditions.to_string(), Color::rgb(0.8, 0.9, 0.8)),
                ("Total Actions", stats.total_actions.to_string(), Color::rgb(0.9, 0.8, 0.8)),
                ("Avg Conditions/Rule", format!("{:.1}", stats.avg_conditions_per_rule), Color::rgb(0.8, 0.8, 0.9)),
                ("Avg Actions/Rule", format!("{:.1}", stats.avg_actions_per_rule), Color::rgb(0.9, 0.9, 0.8)),
                // Process table distribution
                ("Parsing Rules", stats.parsing_rules.to_string(), Color::rgb(0.9, 0.7, 0.7)),
                ("Response Rules", stats.response_rules.to_string(), Color::rgb(0.7, 0.9, 0.7)),
                ("Auto-Action Rules", stats.auto_action_rules.to_string(), Color::rgb(0.7, 0.7, 0.9)),
                ("Description Rules", stats.description_rules.to_string(), Color::rgb(0.9, 0.9, 0.7)),
                // Location complexity
                ("Connected Locations", stats.connected_locations.to_string(), Color::rgb(0.7, 0.9, 0.8)),
                ("Isolated Locations", stats.isolated_locations.to_string(),
                    if stats.isolated_locations > 0 { Color::rgb(0.9, 0.6, 0.6) } else { Color::rgb(0.7, 0.9, 0.7) }),
                ("Dark Locations", stats.dark_locations.to_string(), Color::rgb(0.6, 0.6, 0.8)),
                ("Avg Connections", format!("{:.1}", stats.avg_connections_per_location), Color::rgb(0.8, 0.8, 0.9)),
            ];
            for (label, value, color) in complexity_stats {
                render_stat_card(grid, label, &value, color);
            }
        });
    });
}

fn render_memory_section(parent: &mut ChildBuilder, stats: &GameStatistics) {
    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            row_gap: Val::Px(12.0),
            ..default()
        },
        ..default()
    })
    .with_children(|section| {
        section.spawn(TextBundle::from_section(
            "💾 Memory & Size Estimates",
            TextStyle {
                font_size: 22.0,
                color: Color::rgb(0.8, 0.9, 1.0),
                ..default()
            },
        ));

        section.spawn(NodeBundle {
            style: Style {
                display: Display::Grid,
                grid_template_columns: RepeatedGridTrack::flex(3, 1.0),
                column_gap: Val::Px(12.0),
                row_gap: Val::Px(10.0),
                ..default()
            },
            ..default()
        })
        .with_children(|grid| {
            let memory_stats: Vec<(&str, String, Color)> = vec![
                ("Vocabulary", format!("{} bytes", stats.estimated_vocabulary_size), Color::rgb(0.8, 0.9, 0.8)),
                ("Messages", format!("{} bytes", stats.estimated_message_size), Color::rgb(0.9, 0.8, 0.8)),
                ("Locations", format!("{} bytes", stats.estimated_location_size), Color::rgb(0.8, 0.8, 0.9)),
                ("Objects", format!("{} bytes", stats.estimated_object_size), Color::rgb(0.9, 0.9, 0.8)),
                ("Rules", format!("{} bytes", stats.estimated_rule_size), Color::rgb(0.9, 0.8, 0.9)),
                ("Total (Est.)", format!("{:.1} KB", stats.estimated_total_size as f32 / 1024.0), Color::rgb(0.7, 0.9, 1.0)),
            ];
            for (label, value, color) in memory_stats {
                render_stat_card(grid, label, &value, color);
            }
        });
    });
}

fn render_recommendations_section(parent: &mut ChildBuilder, stats: &GameStatistics) {
    let mut warnings = Vec::new();

    if stats.vocab_percentage > 90.0 {
        warnings.push("⚠️ Vocabulary usage above 90% - approaching 255 word limit");
    } else if stats.vocab_percentage > 70.0 {
        warnings.push("⚡ Vocabulary usage above 70% - monitor word count");
    }

    if stats.flag_percentage > 90.0 {
        warnings.push("⚠️ Flag usage above 90% - approaching 256 flag limit");
    }

    if stats.has_unreachable_locations {
        warnings.push("⚠️ Some locations are isolated (no connections) - may be unreachable");
    }

    if stats.has_empty_rules {
        warnings.push("⚡ Some rules have no conditions or actions - consider removing");
    }

    if stats.has_large_rules {
        warnings.push("⚡ Some rules are very complex (20+ condacts) - consider splitting");
    }

    if stats.rule_count == 0 {
        warnings.push("⚠️ No rules defined - game will have no logic");
    }

    if stats.vocabulary_count == 0 {
        warnings.push("⚠️ No vocabulary defined - parser won't understand commands");
    }

    if warnings.is_empty() {
        warnings.push("✅ No issues detected - game structure looks good!");
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
        section.spawn(TextBundle::from_section(
            "💡 Recommendations & Warnings",
            TextStyle {
                font_size: 22.0,
                color: Color::rgb(0.8, 0.9, 1.0),
                ..default()
            },
        ));

        for warning in warnings {
            let color = if warning.starts_with("⚠️") {
                Color::rgb(1.0, 0.7, 0.5)
            } else if warning.starts_with("⚡") {
                Color::rgb(1.0, 0.9, 0.5)
            } else {
                Color::rgb(0.7, 1.0, 0.7)
            };

            section.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(12.0)),
                    ..default()
                },
                background_color: Color::rgba(0.15, 0.15, 0.2, 0.5).into(),
                ..default()
            })
            .with_children(|card| {
                card.spawn(TextBundle::from_section(
                    warning,
                    TextStyle {
                        font_size: 16.0,
                        color,
                        ..default()
                    },
                ));
            });
        }
    });
}

fn render_stat_card(parent: &mut ChildBuilder, label: &str, value: &str, accent_color: Color) {
    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            padding: UiRect::all(Val::Px(12.0)),
            row_gap: Val::Px(4.0),
            ..default()
        },
        background_color: Color::rgba(0.15, 0.15, 0.2, 0.8).into(),
        ..default()
    })
    .with_children(|card| {
        // Label
        card.spawn(TextBundle::from_section(
            label,
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.7),
                ..default()
            },
        ));

        // Value
        card.spawn(TextBundle::from_section(
            value,
            TextStyle {
                font_size: 20.0,
                color: accent_color,
                ..default()
            },
        ));
    });
}

fn render_validation_section(parent: &mut ChildBuilder, validation: &ValidationResults) {
    parent.spawn(NodeBundle {
        style: Style {
            flex_direction: FlexDirection::Column,
            row_gap: Val::Px(12.0),
            ..default()
        },
        ..default()
    })
    .with_children(|section| {
        // Section header with summary
        section.spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Row,
                justify_content: JustifyContent::SpaceBetween,
                align_items: AlignItems::Center,
                ..default()
            },
            ..default()
        })
        .with_children(|header| {
            header.spawn(TextBundle::from_section(
                "🔍 Validation Results",
                TextStyle {
                    font_size: 22.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            // Summary badge
            let summary_color = if validation.has_errors() {
                Color::rgb(1.0, 0.4, 0.4)
            } else if validation.warning_count() > 0 {
                Color::rgb(1.0, 0.8, 0.3)
            } else {
                Color::rgb(0.5, 1.0, 0.5)
            };

            header.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(8.0)),
                    ..default()
                },
                background_color: Color::rgba(0.2, 0.2, 0.25, 0.9).into(),
                ..default()
            })
            .with_children(|badge| {
                badge.spawn(TextBundle::from_section(
                    &validation.summary(),
                    TextStyle {
                        font_size: 14.0,
                        color: summary_color,
                        ..default()
                    },
                ));
            });
        });

        // If no issues found
        if validation.issues.is_empty() {
            section.spawn(NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(16.0)),
                    ..default()
                },
                background_color: Color::rgba(0.2, 0.4, 0.2, 0.5).into(),
                ..default()
            })
            .with_children(|card| {
                card.spawn(TextBundle::from_section(
                    "✅ Validation passed: No issues found",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.7, 1.0, 0.7),
                        ..default()
                    },
                ));
            });
        } else {
            // Group issues by severity
            let errors: Vec<_> = validation.issues.iter()
                .filter(|i| i.severity == ValidationSeverity::Error)
                .collect();
            let warnings: Vec<_> = validation.issues.iter()
                .filter(|i| i.severity == ValidationSeverity::Warning)
                .collect();
            let infos: Vec<_> = validation.issues.iter()
                .filter(|i| i.severity == ValidationSeverity::Info)
                .collect();

            // Display errors
            if !errors.is_empty() {
                section.spawn(TextBundle::from_section(
                    format!("❌ Errors ({})", errors.len()),
                    TextStyle {
                        font_size: 18.0,
                        color: Color::rgb(1.0, 0.5, 0.5),
                        ..default()
                    },
                ));

                for issue in errors.iter().take(10) {
                    section.spawn(NodeBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::left(Val::Px(16.0)),
                            ..default()
                        },
                        background_color: Color::rgba(0.3, 0.15, 0.15, 0.6).into(),
                        ..default()
                    })
                    .with_children(|card| {
                        card.spawn(TextBundle::from_section(
                            format!("{}: {}", issue.entity_description(), issue.message),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::rgb(1.0, 0.7, 0.7),
                                ..default()
                            },
                        ));
                    });
                }

                if errors.len() > 10 {
                    section.spawn(TextBundle::from_section(
                        format!("... and {} more errors", errors.len() - 10),
                        TextStyle {
                            font_size: 13.0,
                            color: Color::rgb(0.7, 0.5, 0.5),
                            ..default()
                        },
                    ));
                }
            }

            // Display warnings
            if !warnings.is_empty() {
                section.spawn(TextBundle::from_section(
                    format!("⚠️ Warnings ({})", warnings.len()),
                    TextStyle {
                        font_size: 18.0,
                        color: Color::rgb(1.0, 0.8, 0.4),
                        ..default()
                    },
                ));

                for issue in warnings.iter().take(10) {
                    section.spawn(NodeBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::left(Val::Px(16.0)),
                            ..default()
                        },
                        background_color: Color::rgba(0.3, 0.25, 0.15, 0.6).into(),
                        ..default()
                    })
                    .with_children(|card| {
                        card.spawn(TextBundle::from_section(
                            format!("{}: {}", issue.entity_description(), issue.message),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::rgb(1.0, 0.9, 0.6),
                                ..default()
                            },
                        ));
                    });
                }

                if warnings.len() > 10 {
                    section.spawn(TextBundle::from_section(
                        format!("... and {} more warnings", warnings.len() - 10),
                        TextStyle {
                            font_size: 13.0,
                            color: Color::rgb(0.7, 0.7, 0.5),
                            ..default()
                        },
                    ));
                }
            }

            // Display infos
            if !infos.is_empty() {
                section.spawn(TextBundle::from_section(
                    format!("ℹ️ Info ({})", infos.len()),
                    TextStyle {
                        font_size: 18.0,
                        color: Color::rgb(0.5, 0.7, 1.0),
                        ..default()
                    },
                ));

                for issue in infos.iter().take(5) {
                    section.spawn(NodeBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::left(Val::Px(16.0)),
                            ..default()
                        },
                        background_color: Color::rgba(0.15, 0.2, 0.3, 0.6).into(),
                        ..default()
                    })
                    .with_children(|card| {
                        card.spawn(TextBundle::from_section(
                            format!("{}: {}", issue.entity_description(), issue.message),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::rgb(0.7, 0.85, 1.0),
                                ..default()
                            },
                        ));
                    });
                }

                if infos.len() > 5 {
                    section.spawn(TextBundle::from_section(
                        format!("... and {} more info messages", infos.len() - 5),
                        TextStyle {
                            font_size: 13.0,
                            color: Color::rgb(0.5, 0.6, 0.7),
                            ..default()
                        },
                    ));
                }
            }
        }

        // Hint about pressing F6 to run validation
        if validation.issues.is_empty() && validation.last_validated.is_none() {
            section.spawn(TextBundle::from_section(
                "Press F6 to run game validation",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.5, 0.6, 0.7),
                    ..default()
                },
            ));
        }
    });
}

fn get_percentage_color(percentage: f32) -> Color {
    if percentage > 90.0 {
        Color::rgb(1.0, 0.4, 0.4) // Red
    } else if percentage > 70.0 {
        Color::rgb(1.0, 0.8, 0.3) // Yellow
    } else {
        Color::rgb(0.5, 1.0, 0.5) // Green
    }
}
