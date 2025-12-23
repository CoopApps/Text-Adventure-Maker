/// Comprehensive vocabulary library for text adventure games
/// All words are limited to 5 characters per DAAD specification

use super::game::VocabType;

#[derive(Debug, Clone)]
pub struct LibraryWord {
    pub word: &'static str,
    pub word_type: VocabType,
    pub description: &'static str,
}

/// Get all words in the library for a specific type
pub fn get_words_by_type(word_type: VocabType) -> Vec<LibraryWord> {
    ALL_WORDS.iter()
        .filter(|w| w.word_type == word_type)
        .cloned()
        .collect()
}

/// Get all words in the library
pub fn get_all_words() -> &'static [LibraryWord] {
    &ALL_WORDS
}

/// Search words by prefix
pub fn search_words(prefix: &str, word_type: Option<VocabType>) -> Vec<LibraryWord> {
    let prefix_lower = prefix.to_lowercase();
    ALL_WORDS.iter()
        .filter(|w| {
            let matches_prefix = w.word.to_lowercase().starts_with(&prefix_lower);
            let matches_type = word_type.map_or(true, |t| w.word_type == t);
            matches_prefix && matches_type
        })
        .cloned()
        .collect()
}

// Comprehensive word library (all words max 5 chars)
const ALL_WORDS: &[LibraryWord] = &[
    // === VERBS (Actions) ===
    // Movement
    LibraryWord { word: "go", word_type: VocabType::Verb, description: "Move in direction" },
    LibraryWord { word: "walk", word_type: VocabType::Verb, description: "Walk somewhere" },
    LibraryWord { word: "run", word_type: VocabType::Verb, description: "Run quickly" },
    LibraryWord { word: "climb", word_type: VocabType::Verb, description: "Climb up/down" },
    LibraryWord { word: "jump", word_type: VocabType::Verb, description: "Jump over/across" },
    LibraryWord { word: "swim", word_type: VocabType::Verb, description: "Swim in water" },
    LibraryWord { word: "crawl", word_type: VocabType::Verb, description: "Crawl through" },
    LibraryWord { word: "enter", word_type: VocabType::Verb, description: "Enter location" },
    LibraryWord { word: "exit", word_type: VocabType::Verb, description: "Exit location" },
    LibraryWord { word: "leave", word_type: VocabType::Verb, description: "Leave place" },

    // Object manipulation
    LibraryWord { word: "get", word_type: VocabType::Verb, description: "Pick up object" },
    LibraryWord { word: "take", word_type: VocabType::Verb, description: "Take object" },
    LibraryWord { word: "pick", word_type: VocabType::Verb, description: "Pick up" },
    LibraryWord { word: "grab", word_type: VocabType::Verb, description: "Grab object" },
    LibraryWord { word: "drop", word_type: VocabType::Verb, description: "Drop object" },
    LibraryWord { word: "put", word_type: VocabType::Verb, description: "Put object" },
    LibraryWord { word: "place", word_type: VocabType::Verb, description: "Place object" },
    LibraryWord { word: "throw", word_type: VocabType::Verb, description: "Throw object" },
    LibraryWord { word: "give", word_type: VocabType::Verb, description: "Give to someone" },
    LibraryWord { word: "offer", word_type: VocabType::Verb, description: "Offer item" },

    // Examination
    LibraryWord { word: "look", word_type: VocabType::Verb, description: "Look at/around" },
    LibraryWord { word: "exam", word_type: VocabType::Verb, description: "Examine closely" },
    LibraryWord { word: "read", word_type: VocabType::Verb, description: "Read text" },
    LibraryWord { word: "searc", word_type: VocabType::Verb, description: "Search area" },
    LibraryWord { word: "find", word_type: VocabType::Verb, description: "Find something" },
    LibraryWord { word: "check", word_type: VocabType::Verb, description: "Check status" },

    // Interaction
    LibraryWord { word: "open", word_type: VocabType::Verb, description: "Open object" },
    LibraryWord { word: "close", word_type: VocabType::Verb, description: "Close object" },
    LibraryWord { word: "lock", word_type: VocabType::Verb, description: "Lock with key" },
    LibraryWord { word: "unloc", word_type: VocabType::Verb, description: "Unlock object" },
    LibraryWord { word: "push", word_type: VocabType::Verb, description: "Push object" },
    LibraryWord { word: "pull", word_type: VocabType::Verb, description: "Pull object" },
    LibraryWord { word: "turn", word_type: VocabType::Verb, description: "Turn object" },
    LibraryWord { word: "twist", word_type: VocabType::Verb, description: "Twist object" },
    LibraryWord { word: "press", word_type: VocabType::Verb, description: "Press button" },
    LibraryWord { word: "touch", word_type: VocabType::Verb, description: "Touch object" },
    LibraryWord { word: "feel", word_type: VocabType::Verb, description: "Feel texture" },

    // Equipment
    LibraryWord { word: "wear", word_type: VocabType::Verb, description: "Wear clothing" },
    LibraryWord { word: "remov", word_type: VocabType::Verb, description: "Remove clothing" },
    LibraryWord { word: "wield", word_type: VocabType::Verb, description: "Wield weapon" },

    // Combat
    LibraryWord { word: "kill", word_type: VocabType::Verb, description: "Kill enemy" },
    LibraryWord { word: "hit", word_type: VocabType::Verb, description: "Hit target" },
    LibraryWord { word: "fight", word_type: VocabType::Verb, description: "Fight enemy" },
    LibraryWord { word: "attac", word_type: VocabType::Verb, description: "Attack enemy" },

    // Communication
    LibraryWord { word: "say", word_type: VocabType::Verb, description: "Say words" },
    LibraryWord { word: "talk", word_type: VocabType::Verb, description: "Talk to NPC" },
    LibraryWord { word: "ask", word_type: VocabType::Verb, description: "Ask question" },
    LibraryWord { word: "tell", word_type: VocabType::Verb, description: "Tell information" },
    LibraryWord { word: "shout", word_type: VocabType::Verb, description: "Shout loudly" },

    // Consumption
    LibraryWord { word: "eat", word_type: VocabType::Verb, description: "Eat food" },
    LibraryWord { word: "drink", word_type: VocabType::Verb, description: "Drink liquid" },

    // Light
    LibraryWord { word: "light", word_type: VocabType::Verb, description: "Light object" },

    // Utility
    LibraryWord { word: "use", word_type: VocabType::Verb, description: "Use object" },
    LibraryWord { word: "break", word_type: VocabType::Verb, description: "Break object" },
    LibraryWord { word: "cut", word_type: VocabType::Verb, description: "Cut with blade" },
    LibraryWord { word: "dig", word_type: VocabType::Verb, description: "Dig in ground" },
    LibraryWord { word: "fill", word_type: VocabType::Verb, description: "Fill container" },
    LibraryWord { word: "empty", word_type: VocabType::Verb, description: "Empty container" },
    LibraryWord { word: "pour", word_type: VocabType::Verb, description: "Pour liquid" },

    // Meta commands
    LibraryWord { word: "save", word_type: VocabType::Verb, description: "Save game" },
    LibraryWord { word: "load", word_type: VocabType::Verb, description: "Load game" },
    LibraryWord { word: "quit", word_type: VocabType::Verb, description: "Quit game" },
    LibraryWord { word: "help", word_type: VocabType::Verb, description: "Get help" },
    LibraryWord { word: "inven", word_type: VocabType::Verb, description: "Check inventory" },
    LibraryWord { word: "score", word_type: VocabType::Verb, description: "Show score" },
    LibraryWord { word: "wait", word_type: VocabType::Verb, description: "Wait/rest" },

    // === NOUNS (Objects & Things) ===
    // Common objects
    LibraryWord { word: "key", word_type: VocabType::Noun, description: "Door key" },
    LibraryWord { word: "door", word_type: VocabType::Noun, description: "Door/entrance" },
    LibraryWord { word: "box", word_type: VocabType::Noun, description: "Container box" },
    LibraryWord { word: "chest", word_type: VocabType::Noun, description: "Treasure chest" },
    LibraryWord { word: "bag", word_type: VocabType::Noun, description: "Bag/sack" },
    LibraryWord { word: "rope", word_type: VocabType::Noun, description: "Length of rope" },
    LibraryWord { word: "torch", word_type: VocabType::Noun, description: "Light source" },
    LibraryWord { word: "lamp", word_type: VocabType::Noun, description: "Oil lamp" },
    LibraryWord { word: "candl", word_type: VocabType::Noun, description: "Candle" },
    LibraryWord { word: "book", word_type: VocabType::Noun, description: "Book to read" },
    LibraryWord { word: "paper", word_type: VocabType::Noun, description: "Paper/note" },
    LibraryWord { word: "note", word_type: VocabType::Noun, description: "Written note" },
    LibraryWord { word: "map", word_type: VocabType::Noun, description: "Map" },
    LibraryWord { word: "coin", word_type: VocabType::Noun, description: "Gold coin" },
    LibraryWord { word: "gold", word_type: VocabType::Noun, description: "Gold/treasure" },
    LibraryWord { word: "jewel", word_type: VocabType::Noun, description: "Precious jewel" },

    // Weapons
    LibraryWord { word: "sword", word_type: VocabType::Noun, description: "Sword weapon" },
    LibraryWord { word: "knife", word_type: VocabType::Noun, description: "Knife/dagger" },
    LibraryWord { word: "axe", word_type: VocabType::Noun, description: "Axe weapon" },
    LibraryWord { word: "spear", word_type: VocabType::Noun, description: "Spear weapon" },
    LibraryWord { word: "bow", word_type: VocabType::Noun, description: "Bow weapon" },
    LibraryWord { word: "arrow", word_type: VocabType::Noun, description: "Arrow" },

    // Clothing
    LibraryWord { word: "coat", word_type: VocabType::Noun, description: "Coat/jacket" },
    LibraryWord { word: "hat", word_type: VocabType::Noun, description: "Hat/helmet" },
    LibraryWord { word: "boots", word_type: VocabType::Noun, description: "Boots" },
    LibraryWord { word: "glove", word_type: VocabType::Noun, description: "Gloves" },
    LibraryWord { word: "cloak", word_type: VocabType::Noun, description: "Cloak" },
    LibraryWord { word: "ring", word_type: VocabType::Noun, description: "Ring" },

    // Tools
    LibraryWord { word: "shovel", word_type: VocabType::Noun, description: "Digging tool" },
    LibraryWord { word: "pick", word_type: VocabType::Noun, description: "Pickaxe" },
    LibraryWord { word: "saw", word_type: VocabType::Noun, description: "Saw tool" },

    // Containers
    LibraryWord { word: "bottl", word_type: VocabType::Noun, description: "Bottle" },
    LibraryWord { word: "flask", word_type: VocabType::Noun, description: "Flask" },
    LibraryWord { word: "jar", word_type: VocabType::Noun, description: "Jar" },
    LibraryWord { word: "pot", word_type: VocabType::Noun, description: "Pot" },
    LibraryWord { word: "cup", word_type: VocabType::Noun, description: "Cup/mug" },

    // Food & Drink
    LibraryWord { word: "bread", word_type: VocabType::Noun, description: "Bread" },
    LibraryWord { word: "meat", word_type: VocabType::Noun, description: "Meat" },
    LibraryWord { word: "water", word_type: VocabType::Noun, description: "Water" },
    LibraryWord { word: "wine", word_type: VocabType::Noun, description: "Wine" },
    LibraryWord { word: "beer", word_type: VocabType::Noun, description: "Beer" },
    LibraryWord { word: "food", word_type: VocabType::Noun, description: "Food" },

    // Creatures
    LibraryWord { word: "troll", word_type: VocabType::Noun, description: "Troll enemy" },
    LibraryWord { word: "orc", word_type: VocabType::Noun, description: "Orc enemy" },
    LibraryWord { word: "guard", word_type: VocabType::Noun, description: "Guard NPC" },
    LibraryWord { word: "man", word_type: VocabType::Noun, description: "Man" },
    LibraryWord { word: "woman", word_type: VocabType::Noun, description: "Woman" },
    LibraryWord { word: "dwarf", word_type: VocabType::Noun, description: "Dwarf" },

    // Natural features
    LibraryWord { word: "tree", word_type: VocabType::Noun, description: "Tree" },
    LibraryWord { word: "rock", word_type: VocabType::Noun, description: "Rock/stone" },
    LibraryWord { word: "stone", word_type: VocabType::Noun, description: "Stone" },
    LibraryWord { word: "river", word_type: VocabType::Noun, description: "River" },
    LibraryWord { word: "path", word_type: VocabType::Noun, description: "Path/trail" },
    LibraryWord { word: "wall", word_type: VocabType::Noun, description: "Wall" },
    LibraryWord { word: "floor", word_type: VocabType::Noun, description: "Floor" },
    LibraryWord { word: "ceili", word_type: VocabType::Noun, description: "Ceiling" },

    // Furniture
    LibraryWord { word: "table", word_type: VocabType::Noun, description: "Table" },
    LibraryWord { word: "chair", word_type: VocabType::Noun, description: "Chair" },
    LibraryWord { word: "bed", word_type: VocabType::Noun, description: "Bed" },
    LibraryWord { word: "desk", word_type: VocabType::Noun, description: "Desk" },

    // === ADJECTIVES (Descriptors) ===
    // Colors
    LibraryWord { word: "red", word_type: VocabType::Adjective, description: "Red color" },
    LibraryWord { word: "blue", word_type: VocabType::Adjective, description: "Blue color" },
    LibraryWord { word: "green", word_type: VocabType::Adjective, description: "Green color" },
    LibraryWord { word: "black", word_type: VocabType::Adjective, description: "Black color" },
    LibraryWord { word: "white", word_type: VocabType::Adjective, description: "White color" },
    LibraryWord { word: "gold", word_type: VocabType::Adjective, description: "Golden" },

    // Size
    LibraryWord { word: "big", word_type: VocabType::Adjective, description: "Large size" },
    LibraryWord { word: "small", word_type: VocabType::Adjective, description: "Small size" },
    LibraryWord { word: "tiny", word_type: VocabType::Adjective, description: "Tiny size" },
    LibraryWord { word: "huge", word_type: VocabType::Adjective, description: "Huge size" },
    LibraryWord { word: "long", word_type: VocabType::Adjective, description: "Long" },
    LibraryWord { word: "short", word_type: VocabType::Adjective, description: "Short" },

    // Condition
    LibraryWord { word: "old", word_type: VocabType::Adjective, description: "Old/ancient" },
    LibraryWord { word: "new", word_type: VocabType::Adjective, description: "New" },
    LibraryWord { word: "rusty", word_type: VocabType::Adjective, description: "Rusty" },
    LibraryWord { word: "sharp", word_type: VocabType::Adjective, description: "Sharp" },
    LibraryWord { word: "dull", word_type: VocabType::Adjective, description: "Dull/blunt" },
    LibraryWord { word: "broke", word_type: VocabType::Adjective, description: "Broken" },

    // Appearance
    LibraryWord { word: "dark", word_type: VocabType::Adjective, description: "Dark" },
    LibraryWord { word: "light", word_type: VocabType::Adjective, description: "Light/bright" },
    LibraryWord { word: "dirty", word_type: VocabType::Adjective, description: "Dirty" },
    LibraryWord { word: "clean", word_type: VocabType::Adjective, description: "Clean" },
    LibraryWord { word: "shiny", word_type: VocabType::Adjective, description: "Shiny" },

    // Quality
    LibraryWord { word: "good", word_type: VocabType::Adjective, description: "Good quality" },
    LibraryWord { word: "bad", word_type: VocabType::Adjective, description: "Bad quality" },
    LibraryWord { word: "fine", word_type: VocabType::Adjective, description: "Fine quality" },
    LibraryWord { word: "magic", word_type: VocabType::Adjective, description: "Magical" },

    // Material
    LibraryWord { word: "wood", word_type: VocabType::Adjective, description: "Wooden" },
    LibraryWord { word: "stone", word_type: VocabType::Adjective, description: "Stone" },
    LibraryWord { word: "metal", word_type: VocabType::Adjective, description: "Metal" },
    LibraryWord { word: "iron", word_type: VocabType::Adjective, description: "Iron" },
    LibraryWord { word: "steel", word_type: VocabType::Adjective, description: "Steel" },

    // Special
    LibraryWord { word: "north", word_type: VocabType::Adjective, description: "Northern" },
    LibraryWord { word: "south", word_type: VocabType::Adjective, description: "Southern" },
    LibraryWord { word: "east", word_type: VocabType::Adjective, description: "Eastern" },
    LibraryWord { word: "west", word_type: VocabType::Adjective, description: "Western" },

    // === ADVERBS ===
    LibraryWord { word: "quick", word_type: VocabType::Adverb, description: "Quickly" },
    LibraryWord { word: "slow", word_type: VocabType::Adverb, description: "Slowly" },
    LibraryWord { word: "care", word_type: VocabType::Adverb, description: "Carefully" },
    LibraryWord { word: "quiet", word_type: VocabType::Adverb, description: "Quietly" },
    LibraryWord { word: "loud", word_type: VocabType::Adverb, description: "Loudly" },

    // === PREPOSITIONS ===
    LibraryWord { word: "in", word_type: VocabType::Preposition, description: "Inside" },
    LibraryWord { word: "on", word_type: VocabType::Preposition, description: "On top of" },
    LibraryWord { word: "under", word_type: VocabType::Preposition, description: "Underneath" },
    LibraryWord { word: "behin", word_type: VocabType::Preposition, description: "Behind" },
    LibraryWord { word: "with", word_type: VocabType::Preposition, description: "Together with" },
    LibraryWord { word: "to", word_type: VocabType::Preposition, description: "Toward" },
    LibraryWord { word: "from", word_type: VocabType::Preposition, description: "Away from" },
    LibraryWord { word: "into", word_type: VocabType::Preposition, description: "Into" },
    LibraryWord { word: "out", word_type: VocabType::Preposition, description: "Out of" },
    LibraryWord { word: "off", word_type: VocabType::Preposition, description: "Off of" },
    LibraryWord { word: "at", word_type: VocabType::Preposition, description: "At location" },
    LibraryWord { word: "about", word_type: VocabType::Preposition, description: "About topic" },

    // === PRONOUNS ===
    LibraryWord { word: "it", word_type: VocabType::Pronoun, description: "It/thing" },
    LibraryWord { word: "them", word_type: VocabType::Pronoun, description: "Them/plural" },
    LibraryWord { word: "me", word_type: VocabType::Pronoun, description: "Myself" },
    LibraryWord { word: "all", word_type: VocabType::Pronoun, description: "Everything" },

    // === CONJUGATIONS (Connecting words) ===
    LibraryWord { word: "and", word_type: VocabType::Conjugation, description: "And" },
    LibraryWord { word: "then", word_type: VocabType::Conjugation, description: "Then" },
    LibraryWord { word: "but", word_type: VocabType::Conjugation, description: "But" },
];
