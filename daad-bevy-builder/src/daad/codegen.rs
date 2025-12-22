use super::{game::*, types::*};

/// Validation error types for DAAD code generation
#[derive(Debug, Clone)]
pub enum ValidationError {
    InvalidLocationId { location_id: u8, context: String },
    InvalidObjectId { object_id: u8, context: String },
    InvalidMessageId { message_id: u8, context: String },
    InvalidFlagId { flag_id: u8, context: String },
    VocabularyWordTooLong { word: String, length: usize, max_length: usize },
    MissingLocation { location_id: u8 },
    MissingObject { object_id: u8 },
    DuplicateLocationId { location_id: u8 },
    DuplicateObjectId { object_id: u8 },
    EmptyGame { reason: String },
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ValidationError::InvalidLocationId { location_id, context } => {
                write!(f, "Invalid location ID {} in {}", location_id, context)
            }
            ValidationError::InvalidObjectId { object_id, context } => {
                write!(f, "Invalid object ID {} in {}", object_id, context)
            }
            ValidationError::InvalidMessageId { message_id, context } => {
                write!(f, "Invalid message ID {} in {}", message_id, context)
            }
            ValidationError::InvalidFlagId { flag_id, context } => {
                write!(f, "Invalid flag ID {} in {}", flag_id, context)
            }
            ValidationError::VocabularyWordTooLong { word, length, max_length } => {
                write!(f, "Vocabulary word '{}' is {} characters (max {})", word, length, max_length)
            }
            ValidationError::MissingLocation { location_id } => {
                write!(f, "Referenced location {} does not exist", location_id)
            }
            ValidationError::MissingObject { object_id } => {
                write!(f, "Referenced object {} does not exist", object_id)
            }
            ValidationError::DuplicateLocationId { location_id } => {
                write!(f, "Duplicate location ID: {}", location_id)
            }
            ValidationError::DuplicateObjectId { object_id } => {
                write!(f, "Duplicate object ID: {}", object_id)
            }
            ValidationError::EmptyGame { reason } => {
                write!(f, "Game validation failed: {}", reason)
            }
        }
    }
}

/// Validation result type
pub type ValidationResult = Result<(), Vec<ValidationError>>;

/// DAAD Code Generator
/// Converts visual game data into DRC-compatible DAAD source code (.SCE format)
pub struct DaadCodeGenerator;

impl DaadCodeGenerator {
    /// Map system flag IDs (0-63) to their #define names
    /// Returns the name if it's a system flag, otherwise returns the ID as a string
    fn flag_name(flag_id: u8) -> String {
        match flag_id {
            0 => "fDark".to_string(),
            1 => "fObjectsCarried".to_string(),
            28 => "fDarkF".to_string(),
            29 => "fGFlags".to_string(),
            30 => "fScore".to_string(),
            31 => "fTurns".to_string(),
            32 => "fTurnsHi".to_string(),
            33 => "fVerb".to_string(),
            34 => "fNoun".to_string(),
            35 => "fAdject1".to_string(),
            36 => "fAdverb".to_string(),
            37 => "fMaxCarr".to_string(),
            38 => "fPlayer".to_string(),
            43 => "fPrep".to_string(),
            44 => "fNoun2".to_string(),
            45 => "fAdject2".to_string(),
            46 => "fCPronounNoun".to_string(),
            47 => "fCPronounAdject".to_string(),
            48 => "fTimeout".to_string(),
            49 => "fTimeoutFlags".to_string(),
            50 => "fDoallObjNo".to_string(),
            51 => "fRefObject".to_string(),
            52 => "fStrength".to_string(),
            53 => "fObjFlags".to_string(),
            54 => "fRefObjLoc".to_string(),
            55 => "fRefObjWeight".to_string(),
            56 => "fRefObjIsContainer".to_string(),
            57 => "fRefObjisWearable".to_string(),
            58 => "fRefObjAttr1".to_string(),
            59 => "fRefObjAttr2".to_string(),
            60 => "fInkeyKey1".to_string(),
            61 => "fInkeyKey2".to_string(),
            62 => "fScreenMode".to_string(),
            63 => "fCurrentWindow".to_string(),
            _ => flag_id.to_string(), // User flags (64-255) use numeric ID
        }
    }

    /// Generate complete DAAD source code from visual game
    /// Follows DRC specification EXACTLY - section order matters!
    pub fn generate(game: &DaadGame) -> String {
        let mut code = String::new();

        // Header with comments and #define statements
        code.push_str(&Self::generate_header(game));

        // CRITICAL: DRC requires strict section ordering!
        // 1. /CTL - Control section (null character)
        code.push_str(&Self::generate_control_section());

        // 2. /VOC - Vocabulary
        code.push_str(&Self::generate_vocabulary(&game.vocabulary));

        // 3. /STX - System Messages (0-62)
        code.push_str(&Self::generate_system_messages());

        // 4. /MTX - Custom Messages
        code.push_str(&Self::generate_messages(&game.messages));

        // 5. /OTX - Object Texts
        code.push_str(&Self::generate_object_texts(&game.objects));

        // 6. /LTX - Location Texts
        code.push_str(&Self::generate_location_texts(&game.locations));

        // 7. /CON - Connections
        code.push_str(&Self::generate_connections(&game.locations));

        // 8. /OBJ - Object Definitions
        code.push_str(&Self::generate_object_definitions(&game.objects));

        // 9-12. /PRO 0-3 - Process Tables
        code.push_str(&Self::generate_processes(game));

        // CRITICAL: /END is required by DRC
        code.push_str("\n;------------------------------------------------------------------------------\n");
        code.push_str("/END\n");

        code
    }

    fn generate_header(game: &DaadGame) -> String {
        let mut header = format!(
            "; ========================================\n\
             ; {}\n\
             ; by {}\n\
             ; Version: {}\n\
             ; Generated by DAAD Bevy Builder\n\
             ; ========================================\n\
             \n\
             ; System flags 0-63\n\
             #define fDark               0\n\
             #define fObjectsCarried     1\n\
             #define fDarkF              28\n\
             #define fGFlags             29\n\
             #define fScore              30\n\
             #define fTurns              31\n\
             #define fTurnsHi            32\n\
             #define fVerb               33\n\
             #define fNoun               34\n\
             #define fAdject1            35\n\
             #define fAdverb             36\n\
             #define fMaxCarr            37\n\
             #define fPlayer             38\n\
             #define fPrep               43\n\
             #define fNoun2              44\n\
             #define fAdject2            45\n\
             #define fCPronounNoun       46\n\
             #define fCPronounAdject     47\n\
             #define fTimeout            48\n\
             #define fTimeoutFlags       49\n\
             #define fDoallObjNo         50\n\
             #define fRefObject          51\n\
             #define fStrength           52\n\
             #define fObjFlags           53\n\
             #define fRefObjLoc          54\n\
             #define fRefObjWeight       55\n\
             #define fRefObjIsContainer  56\n\
             #define fRefObjisWearable   57\n\
             #define fRefObjAttr1        58\n\
             #define fRefObjAttr2        59\n\
             #define fInkeyKey1          60\n\
             #define fInkeyKey2          61\n\
             #define fScreenMode         62\n\
             #define fCurrentWindow      63\n\
             \n",
            game.title, game.author, game.version
        );

        // Add MALUVA #extern directive if enabled
        if game.maluva_enabled {
            let binary_name = game.maluva_platform.binary_name();
            if !binary_name.is_empty() {
                header.push_str(&format!(
                    "; MALUVA Extension - {}\n\
                     #extern \"{}\"\n\
                     \n",
                    game.maluva_platform.display_name(),
                    binary_name
                ));
            }
        }

        header.push_str("\n");
        header
    }

    fn generate_control_section() -> String {
        String::from(
            ";------------------------------------------------------------------------------\n\
             /CTL    ;Control Section (null char is an underline)\n\
             _       \n\
             \n\n"
        )
    }

    fn generate_vocabulary(vocab: &[VocabEntry]) -> String {
        let mut code = String::from(
            ";------------------------------------------------------------------------------\n\
             /VOC    ;Vocabulary\n\n"
        );

        // Separate vocabulary by type
        let mut movements: Vec<_> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Noun) && v.id < 14)
            .collect();
        let mut nouns: Vec<_> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Noun) && v.id >= 14)
            .collect();
        let mut verbs: Vec<_> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Verb))
            .collect();
        let mut adjectives: Vec<_> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Adjective))
            .collect();
        let mut adverbs: Vec<_> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Adverb))
            .collect();
        let mut prepositions: Vec<_> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Preposition))
            .collect();
        let mut pronouns: Vec<_> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Pronoun))
            .collect();
        let mut conjugations: Vec<_> = vocab.iter()
            .filter(|v| matches!(v.word_type, VocabType::Conjugation))
            .collect();

        // Sort each group by ID
        movements.sort_by_key(|v| v.id);
        nouns.sort_by_key(|v| v.id);
        verbs.sort_by_key(|v| v.id);
        adjectives.sort_by_key(|v| v.id);
        adverbs.sort_by_key(|v| v.id);
        prepositions.sort_by_key(|v| v.id);
        pronouns.sort_by_key(|v| v.id);
        conjugations.sort_by_key(|v| v.id);

        // Movements (nouns < 14)
        if !movements.is_empty() {
            code.push_str(";                       Movements ie verbs and nouns < 14\n");
            for v in movements {
                code.push_str(&format!("{:<8}{:<8}{}\n",
                    v.word.to_uppercase(),
                    v.id,
                    v.word_type.as_str()
                ));
            }
            code.push('\n');
        }

        // Nouns (<20 can be verbs, <50 are proper nouns)
        if !nouns.is_empty() {
            code.push_str(";                       Nouns   <20 means can be used as verbs\n");
            code.push_str(";                               <50 means a proper noun ie not an 'IT'\n");
            for v in nouns {
                code.push_str(&format!("{:<8}{:<8}{}\n",
                    v.word.to_uppercase(),
                    v.id,
                    v.word_type.as_str()
                ));
            }
            code.push('\n');
        }

        // Verbs
        if !verbs.is_empty() {
            code.push_str(";                       Verbs\n");
            for v in verbs {
                code.push_str(&format!("{:<8}{:<8}{}\n",
                    v.word.to_uppercase(),
                    v.id,
                    v.word_type.as_str()
                ));
            }
            code.push('\n');
        }

        // Adjectives
        if !adjectives.is_empty() {
            code.push_str(";                               Adjectives\n");
            for v in adjectives {
                code.push_str(&format!("{:<8}{:<8}{}\n",
                    v.word.to_uppercase(),
                    v.id,
                    v.word_type.as_str()
                ));
            }
            code.push('\n');
        }

        // Adverbs
        if !adverbs.is_empty() {
            code.push_str(";                               Adverbs\n");
            for v in adverbs {
                code.push_str(&format!("{:<8}{:<8}{}\n",
                    v.word.to_uppercase(),
                    v.id,
                    v.word_type.as_str()
                ));
            }
            code.push('\n');
        }

        // Prepositions
        if !prepositions.is_empty() {
            code.push_str(";                               Prepositions\n");
            for v in prepositions {
                code.push_str(&format!("{:<8}{:<8}{}\n",
                    v.word.to_uppercase(),
                    v.id,
                    v.word_type.as_str()
                ));
            }
            code.push('\n');
        }

        // Pronouns
        if !pronouns.is_empty() {
            code.push_str(";                               Pronouns\n");
            for v in pronouns {
                code.push_str(&format!("{:<8}{:<8}{}\n",
                    v.word.to_uppercase(),
                    v.id,
                    v.word_type.as_str()
                ));
            }
            code.push('\n');
        }

        // Conjugations
        if !conjugations.is_empty() {
            code.push_str(";                               Conjugations\n");
            for v in conjugations {
                code.push_str(&format!("{:<8}{:<8}{}\n",
                    v.word.to_uppercase(),
                    v.id,
                    v.word_type.as_str()
                ));
            }
            code.push('\n');
        }

        code.push('\n');
        code
    }

    fn generate_system_messages() -> String {
        let mut code = String::from(
            ";------------------------------------------------------------------------------\n\
             /STX    ;System Message Texts\n"
        );

        // Default DAAD system messages (0-62) from BLANK_EN.DSF
        let default_messages = [
            "It's too dark to see anything.",
            "I can also see: ",
            "#nWhat now?",
            "#nWhat next?",
            "#nWhat should I do now?",
            "#nWhat should I do next?",
            "#nI was not able to understand any of that.  Please try again.",
            "#nI can't go in that direction.",
            "I can't do that.#n",
            "I have with me:#n",
            "I am wearing:#n",
            "", // Spare
            "Are you sure? ",
            "Would you like another go? ",
            "", // Spare
            "OK.#n",
            "Press any key to continue.#n",
            "", // You have taken
            "", // \sturn
            "", // s
            "", // .[CR]
            "", // You have scored
            "", // %[CR]
            "I'm not wearing one of those.#n",
            "I can't.  I'm wearing the _.",
            "I already have the _.",
            "There isn't one of those here.",
            "I can't carry any more things.",
            "I don't have one of those.",
            "I'm already wearing the _.",
            "Y", // One upper case character only
            "N", // One upper case character only
            "More...",
            "#n>",
            "", // Spare
            "#nTime passes...#n",
            "I now have the _.#n",
            "I'm now wearing the _.#n",
            "I've removed the _.#n",
            "I've dropped the _.#n",
            "I can't wear the _.#n",
            "I can't remove the _.#n",
            "I can't remove the _.  My hands are full.#n",
            "The _ weighs too much for me.#n",
            "#nThe _ is in the ",
            "The _ isn't in the ",
            ", ",
            " and ",
            ".#n",
            "I don't have the _.#n",
            "I'm not wearing the _.#n",
            ".#n",
            "There isn't one of those in the ",
            "Nothing.#n",
            "T", // Letter for Tape
            "D", // Disc
            "Drive not ready - press any key to retry.#n",
            "I/O Error.#n",
            "Disc or Directory may be full.",
            "Invalid filename.",
            "Type in name of file:",
            "Start tape.#n",
            "Tape or Disc?",
        ];

        for (i, msg) in default_messages.iter().enumerate() {
            code.push_str(&format!("/{} \"{}\"\n", i, msg));
        }

        code.push_str("\n\n");
        code
    }

    fn generate_messages(messages: &[String]) -> String {
        let mut code = String::from(
            ";------------------------------------------------------------------------------\n\
             /MTX    ;Message Texts\n"
        );

        if messages.is_empty() {
            code.push_str("/0 \"\"\n");
        } else {
            for (i, msg) in messages.iter().enumerate() {
                code.push_str(&format!("/{} \"{}\"\n", i, msg));
            }
        }

        code.push_str("\n\n");
        code
    }

    fn generate_object_texts(objects: &[Object]) -> String {
        let mut code = String::from(
            ";------------------------------------------------------------------------------\n\
             /OTX    ;Object Texts\n"
        );

        if objects.is_empty() {
            code.push_str("/0 \"\"\n");
        } else {
            for obj in objects {
                code.push_str(&format!("/{} \"{}\"\n", obj.id, obj.description));
            }
        }

        code.push_str("\n\n");
        code
    }

    fn generate_location_texts(locations: &[Location]) -> String {
        let mut code = String::from(
            ";------------------------------------------------------------------------------\n\
             /LTX    ;Location Texts\n"
        );

        if locations.is_empty() {
            code.push_str("/0 \"Empty location\"\n");
        } else {
            for loc in locations {
                code.push_str(&format!("/{} \"{}\"\n", loc.id, loc.description));
            }
        }

        code.push_str("\n\n");
        code
    }

    fn generate_connections(locations: &[Location]) -> String {
        let mut code = String::from(
            ";------------------------------------------------------------------------------\n\
             /CON    ;Connections\n"
        );

        if locations.is_empty() {
            code.push_str("/0\n");
        } else {
            for loc in locations {
                code.push_str(&format!("/{}\n", loc.id));
                for conn in &loc.connections {
                    code.push_str(&format!("{} {}\n",
                        conn.direction.as_short_str(),
                        conn.target_location
                    ));
                }
            }
        }

        code.push_str("\n\n");
        code
    }

    fn generate_object_definitions(objects: &[Object]) -> String {
        let mut code = String::from(
            ";------------------------------------------------------------------------------\n\
             /OBJ    ;Object Definitions\n\
             ;obj  starts  weight    c w  5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0    noun   adjective\n\
             ;num    at\n"
        );

        for obj in objects {
            let location = match obj.location {
                ObjectLocation::Location(id) => id.to_string(),
                ObjectLocation::Carried => "CARRIED".to_string(),
                ObjectLocation::Worn => "WORN".to_string(),
                ObjectLocation::Limbo => "LIMBO".to_string(),
                ObjectLocation::Inside(_) => "LIMBO".to_string(), // Containers handled differently
            };

            let container_flag = if obj.is_container { "*" } else { "_" };
            let wearable_flag = if obj.is_wearable { "*" } else { "_" };

            // Attribute bits (16 bits, all unset for now)
            let attr_bits = "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _";

            let adjective = if obj.adjective.is_empty() { "_" } else { &obj.adjective };

            code.push_str(&format!(
                "/{:<8}{:<8}{:<10}{} {}  {}    {:<7}{}\n",
                obj.id,
                location,
                obj.weight,
                container_flag,
                wearable_flag,
                attr_bits,
                obj.noun.to_uppercase(),
                adjective.to_uppercase()
            ));
        }

        code.push_str("\n\n");
        code
    }

    fn generate_processes(game: &DaadGame) -> String {
        let mut code = String::new();

        // Generate each process table (0-3)
        for process_num in 0..4 {
            let process_type = ProcessTable::from_num(process_num);
            code.push_str(&format!(
                ";------------------------------------------------------------------------------\n\
                 /PRO {}       ;{}\n",
                process_num,
                process_type.description()
            ));

            // Get rules for this process
            let process_rules: Vec<_> = game
                .rules
                .iter()
                .filter(|r| r.process == process_type && r.enabled)
                .collect();

            if process_rules.is_empty() {
                // Add minimal default entry
                code.push_str("\n> _       _\n\n");
            } else {
                for rule in process_rules {
                    code.push_str(&Self::generate_rule(rule, game));
                    code.push('\n');
                }
            }
        }

        code
    }

    fn generate_rule(rule: &Rule, game: &DaadGame) -> String {
        let mut code = String::new();

        // Add label if present (for SKIP/GOTO)
        if let Some(label) = &rule.label {
            code.push_str(&format!("{}\n", label));
        }

        // Comment with rule name
        code.push_str(&format!("; {}\n", rule.name));

        // First line: > VERB NOUN CONDITION(s)
        let verb = rule.verb.as_deref().unwrap_or("_");
        let noun = rule.noun.as_deref().unwrap_or("_");

        code.push_str(&format!("> {:<7} {:<7}", verb.to_uppercase(), noun.to_uppercase()));

        // Add first condition on same line
        if !rule.conditions.is_empty() {
            code.push(' ');
            code.push_str(&Self::generate_condition(&rule.conditions[0], game));

            // Add remaining conditions on indented lines
            for condition in rule.conditions.iter().skip(1) {
                code.push('\n');
                code.push_str("                ");
                code.push_str(&Self::generate_condition(condition, game));
            }
        }

        code.push('\n');

        // Actions on indented lines
        for action in &rule.actions {
            code.push_str("                ");
            code.push_str(&Self::generate_action(action, game));
            code.push('\n');
        }

        code
    }

    fn generate_condition(condition: &Condition, game: &DaadGame) -> String {
        match &condition.condition_type {
            ConditionType::PlayerAt { location_id } => {
                format!("AT {}", location_id)
            }
            ConditionType::PlayerNotAt { location_id } => {
                format!("NOTAT {}", location_id)
            }
            ConditionType::ObjectPresent { object_id } => {
                format!("PRESENT {}", object_id)
            }
            ConditionType::ObjectAbsent { object_id } => {
                format!("ABSENT {}", object_id)
            }
            ConditionType::ObjectCarried { object_id } => {
                format!("CARRIED {}", object_id)
            }
            ConditionType::ObjectNotCarried { object_id } => {
                format!("NOTCARR {}", object_id)
            }
            ConditionType::ObjectWorn { object_id } => {
                format!("WORN {}", object_id)
            }
            ConditionType::ObjectNotWorn { object_id } => {
                format!("NOTWORN {}", object_id)
            }
            ConditionType::ObjectAt {
                object_id,
                location_id,
            } => {
                format!("ISAT {} {}", object_id, location_id)
            }
            ConditionType::ObjectNotAt {
                object_id,
                location_id,
            } => {
                format!("NOTAT {} {}", object_id, location_id)
            }
            ConditionType::ObjectExists { object_id } => {
                format!("CREATE {}", object_id)
            }
            ConditionType::ObjectDestroyed { object_id } => {
                format!("DESTROY {}", object_id)
            }
            ConditionType::ObjectWeightGreaterThan { object_id, weight } => {
                format!("WEIGHT {} {}", object_id, weight)
            }
            ConditionType::ObjectIsContainer { object_id } => {
                // Check object attribute bit for container
                format!("ATGT {} 128", object_id)  // Container bit
            }
            ConditionType::ObjectIsWearable { object_id } => {
                // Check object attribute bit for wearable
                format!("ATGT {} 64", object_id)  // Wearable bit
            }
            ConditionType::FlagEquals { flag_id, value } => {
                format!("EQ {} {}", Self::flag_name(*flag_id), value)
            }
            ConditionType::FlagGreaterThan { flag_id, value } => {
                format!("GT {} {}", Self::flag_name(*flag_id), value)
            }
            ConditionType::FlagLessThan { flag_id, value } => {
                format!("LT {} {}", Self::flag_name(*flag_id), value)
            }
            ConditionType::FlagZero { flag_id } => {
                format!("ZERO {}", Self::flag_name(*flag_id))
            }
            ConditionType::FlagNotEquals { flag_id, value } => {
                format!("NOTEQ {} {}", Self::flag_name(*flag_id), value)
            }
            ConditionType::FlagNotZero { flag_id } => {
                format!("NOTZERO {}", Self::flag_name(*flag_id))
            }
            ConditionType::FlagsSame { flag1, flag2 } => {
                format!("SAME {} {}", Self::flag_name(*flag1), Self::flag_name(*flag2))
            }
            ConditionType::FlagsNotSame { flag1, flag2 } => {
                format!("NOTSAME {} {}", Self::flag_name(*flag1), Self::flag_name(*flag2))
            }
            ConditionType::VerbIs { verb } => {
                format!("VERB {}", verb)
            }
            ConditionType::NounIs { noun } => {
                format!("NOUN {}", noun)
            }
            ConditionType::Adject1Is { adjective } => {
                format!("ADJECT1 {}", adjective)
            }
            ConditionType::AdverbIs { adverb } => {
                format!("ADVERB {}", adverb)
            }
            ConditionType::PrepIs { preposition } => {
                format!("PREP {}", preposition)
            }
            ConditionType::Noun2Is { noun } => {
                format!("NOUN2 {}", noun)
            }
            ConditionType::Adject2Is { adjective } => {
                format!("ADJECT2 {}", adjective)
            }
            ConditionType::IsFirstTurn => {
                format!("EQ fTurns 0")
            }
            ConditionType::TurnCountGreaterThan { turns } => {
                format!("GT fTurns {}", turns)
            }
            ConditionType::ScoreGreaterThan { score } => {
                format!("GT fScore {}", score)
            }
            ConditionType::TurnCountEquals { turns } => {
                format!("EQ fTurns {}", turns)
            }
            ConditionType::ScoreEquals { score } => {
                format!("EQ fScore {}", score)
            }
            ConditionType::IsDark => {
                format!("ISDARK")
            }
            ConditionType::IsLight => {
                format!("ISLIGHT")
            }
            ConditionType::Chance { percentage } => {
                format!("CHANCE {}", percentage)
            }
            ConditionType::Timeout => {
                format!("TIMEOUT")
            }
            ConditionType::CarryWeight { weight } => {
                format!("WEIGHT {}", weight)
            }
            ConditionType::MaxCarriedObjects { count } => {
                format!("LT fObjectsCarried {}", count)
            }
        }
    }

    fn generate_action(action: &Action, game: &DaadGame) -> String {
        match &action.action_type {
            // Display actions
            ActionType::ShowMessage { text } => {
                // Use MES for message index, or inline for direct text
                format!("MESSAGE \"{}\"", text)
            }
            ActionType::ShowLocationDescription => {
                "DESC @fPlayer".to_string()
            }
            ActionType::ClearScreen => {
                "CLS".to_string()
            }
            ActionType::NewLine => {
                "NEWLINE".to_string()
            }
            ActionType::Tab => {
                "TAB".to_string()
            }
            ActionType::WriteNumber { value } => {
                format!("WRITELN {}", value)
            }
            ActionType::DisplayObjectName { object_id } => {
                format!("PRINTAT {} @", object_id)
            }

            // Object actions
            ActionType::GetObject { object_id } => {
                format!("GET {}", object_id)
            }
            ActionType::DropObject { object_id } => {
                format!("DROP {}", object_id)
            }
            ActionType::WearObject { object_id } => {
                format!("WEAR {}", object_id)
            }
            ActionType::RemoveObject { object_id } => {
                format!("REMOVE {}", object_id)
            }
            ActionType::MoveObject {
                object_id,
                to_location,
            } => {
                let loc_num = to_location.to_daad_location();
                format!("PLACE {} {}", object_id, loc_num)
            }
            ActionType::CreateObject { object_id } => {
                format!("CREATE {}", object_id)
            }
            ActionType::DestroyObject { object_id } => {
                format!("DESTROY {}", object_id)
            }
            ActionType::SwapObjects { object1, object2 } => {
                format!("SWAP {} {}", object1, object2)
            }
            ActionType::PlaceObject { object_id, location_id } => {
                format!("PLACE {} {}", object_id, location_id)
            }
            ActionType::AutoGet => {
                "AUTOG".to_string()
            }
            ActionType::AutoDrop => {
                "AUTOD".to_string()
            }
            ActionType::AutoWear => {
                "AUTOW".to_string()
            }
            ActionType::AutoRemove => {
                "AUTOR".to_string()
            }
            ActionType::ListObjects { location_id } => {
                format!("LISTAT {}", location_id)
            }

            // Flag actions
            ActionType::SetFlag { flag_id, value } => {
                format!("LET {} {}", Self::flag_name(*flag_id), value)
            }
            ActionType::IncrementFlag { flag_id } => {
                format!("PLUS {} 1", Self::flag_name(*flag_id))
            }
            ActionType::DecrementFlag { flag_id } => {
                format!("MINUS {} 1", Self::flag_name(*flag_id))
            }
            ActionType::ClearFlag { flag_id } => {
                format!("CLEAR {}", Self::flag_name(*flag_id))
            }
            ActionType::SetBit { flag_id } => {
                format!("SET {}", Self::flag_name(*flag_id))
            }
            ActionType::AddToFlag { flag_id, value } => {
                format!("PLUS {} {}", Self::flag_name(*flag_id), value)
            }
            ActionType::SubtractFromFlag { flag_id, value } => {
                format!("MINUS {} {}", Self::flag_name(*flag_id), value)
            }
            ActionType::CopyFlag { dest_flag, source_flag } => {
                format!("LET {} {}", Self::flag_name(*dest_flag), Self::flag_name(*source_flag))
            }

            // Movement
            ActionType::GoToLocation { location_id } => {
                format!("GOTO {}", location_id)
            }
            // Flow control
            ActionType::EndTurn => {
                "DONE".to_string()
            }
            ActionType::ContinueProcessing => {
                "NOTDONE".to_string()
            }
            ActionType::SkipRules { count } => {
                format!("SKIP {}", count)
            }
            ActionType::OK => {
                "OK".to_string()
            }
            ActionType::EndGame => {
                "END".to_string()
            }
            ActionType::Restart => {
                "RESTART".to_string()
            }
            ActionType::Pause { frames } => {
                format!("PAUSE {}", frames)
            }

            // Score
            ActionType::AddScore { points } => {
                format!("PLUS fScore {}", points)
            }
            ActionType::SubtractScore { points } => {
                format!("MINUS fScore {}", points)
            }

            // Timeout
            ActionType::SetTimeout { turns } => {
                format!("TIMEOUT {}", turns)
            }

            // Save/Load
            ActionType::SaveGame => {
                "SAVE".to_string()
            }
            ActionType::LoadGame => {
                "LOAD".to_string()
            }
            ActionType::RamSave => {
                "RAMSAVE".to_string()
            }
            ActionType::RamLoad => {
                "RAMLOAD".to_string()
            }

            // Sound/Graphics
            ActionType::Beep { duration, pitch } => {
                format!("BEEP {} {}", duration, pitch)
            }
            ActionType::Picture { picture_id } => {
                format!("PICTURE {}", picture_id)
            }

            // Display attributes
            ActionType::Border { color } => {
                format!("BORDER {}", color)
            }
            ActionType::Paper { color } => {
                format!("PAPER {}", color)
            }
            ActionType::Ink { color } => {
                format!("INK {}", color)
            }

            // MALUVA Extension Actions (Module 36)
            ActionType::XPicture { picture_id } => {
                format!("EXTERN 36 0 {}", picture_id)  // XPICTURE
            }
            ActionType::XSave => {
                "EXTERN 36 1 0".to_string()  // XSAVE
            }
            ActionType::XLoad => {
                "EXTERN 36 2 0".to_string()  // XLOAD
            }
            ActionType::XPart { effect_id } => {
                format!("EXTERN 36 3 {}", effect_id)  // XPART
            }
            ActionType::XMessage { message_id } => {
                format!("EXTERN 36 4 {}", message_id)  // XMESSAGE
            }
            ActionType::XTo { location_id } => {
                format!("EXTERN 36 5 {}", location_id)  // XTO
            }
            ActionType::XDone => {
                "EXTERN 36 6 0".to_string()  // XDONE
            }
            ActionType::XEnd => {
                "EXTERN 36 7 0".to_string()  // XEND
            }
        }
    }

    /// Validate game data before code generation
    /// Returns Ok(()) if validation passes, or Err with a list of all validation errors
    pub fn validate(game: &DaadGame) -> ValidationResult {
        let mut errors = Vec::new();

        // Check for empty game
        if game.locations.is_empty() {
            errors.push(ValidationError::EmptyGame {
                reason: "Game must have at least one location".to_string(),
            });
        }

        // Validate vocabulary word lengths (DAAD limit: 5 characters)
        for vocab in &game.vocabulary {
            if vocab.word.len() > 5 {
                errors.push(ValidationError::VocabularyWordTooLong {
                    word: vocab.word.clone(),
                    length: vocab.word.len(),
                    max_length: 5,
                });
            }
        }

        // Check for duplicate location IDs
        let mut seen_locations = std::collections::HashSet::new();
        for location in &game.locations {
            if !seen_locations.insert(location.id) {
                errors.push(ValidationError::DuplicateLocationId {
                    location_id: location.id,
                });
            }
        }

        // Check for duplicate object IDs
        let mut seen_objects = std::collections::HashSet::new();
        for object in &game.objects {
            if !seen_objects.insert(object.id) {
                errors.push(ValidationError::DuplicateObjectId {
                    object_id: object.id,
                });
            }
        }

        // Validate connections reference existing locations
        for location in &game.locations {
            for connection in &location.connections {
                if !game.locations.iter().any(|l| l.id == connection.target_location) {
                    errors.push(ValidationError::MissingLocation {
                        location_id: connection.target_location,
                    });
                }
            }
        }

        // Validate object locations
        for object in &game.objects {
            match &object.location {
                ObjectLocation::Location(loc_id) => {
                    if !game.locations.iter().any(|l| l.id == *loc_id) {
                        errors.push(ValidationError::InvalidLocationId {
                            location_id: *loc_id,
                            context: format!("object {} location", object.id),
                        });
                    }
                }
                _ => {} // CARRIED, WORN, LIMBO are always valid
            }
        }

        // Validate rules
        for rule in &game.rules {
            // Check conditions
            for condition in &rule.conditions {
                match &condition.condition_type {
                    ConditionType::PlayerAt { location_id } |
                    ConditionType::PlayerNotAt { location_id } => {
                        if !game.locations.iter().any(|l| l.id == *location_id) {
                            errors.push(ValidationError::InvalidLocationId {
                                location_id: *location_id,
                                context: format!("rule {} condition", rule.id),
                            });
                        }
                    }
                    ConditionType::ObjectAt { object_id, location_id } => {
                        if !game.objects.iter().any(|o| o.id == *object_id) {
                            errors.push(ValidationError::InvalidObjectId {
                                object_id: *object_id,
                                context: format!("rule {} condition", rule.id),
                            });
                        }
                        if !game.locations.iter().any(|l| l.id == *location_id) {
                            errors.push(ValidationError::InvalidLocationId {
                                location_id: *location_id,
                                context: format!("rule {} condition (ObjectAt)", rule.id),
                            });
                        }
                    }
                    ConditionType::ObjectPresent { object_id } |
                    ConditionType::ObjectCarried { object_id } |
                    ConditionType::ObjectWorn { object_id } => {
                        if !game.objects.iter().any(|o| o.id == *object_id) {
                            errors.push(ValidationError::InvalidObjectId {
                                object_id: *object_id,
                                context: format!("rule {} condition", rule.id),
                            });
                        }
                    }
                    ConditionType::FlagEquals { flag_id, .. } |
                    ConditionType::FlagGreaterThan { flag_id, .. } |
                    ConditionType::FlagLessThan { flag_id, .. } |
                    ConditionType::FlagZero { flag_id } => {
                        if *flag_id > 255 {
                            errors.push(ValidationError::InvalidFlagId {
                                flag_id: *flag_id,
                                context: format!("rule {} condition", rule.id),
                            });
                        }
                    }
                    _ => {} // Other conditions don't reference game entities
                }
            }

            // Check actions
            for action in &rule.actions {
                match &action.action_type {
                    ActionType::GoToLocation { location_id } |
                    ActionType::XTo { location_id } => {
                        if !game.locations.iter().any(|l| l.id == *location_id) {
                            errors.push(ValidationError::InvalidLocationId {
                                location_id: *location_id,
                                context: format!("rule {} action", rule.id),
                            });
                        }
                    }
                    ActionType::GetObject { object_id } |
                    ActionType::DropObject { object_id } |
                    ActionType::WearObject { object_id } |
                    ActionType::RemoveObject { object_id } => {
                        if !game.objects.iter().any(|o| o.id == *object_id) {
                            errors.push(ValidationError::InvalidObjectId {
                                object_id: *object_id,
                                context: format!("rule {} action", rule.id),
                            });
                        }
                    }
                    ActionType::MoveObject { object_id, to_location } => {
                        if !game.objects.iter().any(|o| o.id == *object_id) {
                            errors.push(ValidationError::InvalidObjectId {
                                object_id: *object_id,
                                context: format!("rule {} action", rule.id),
                            });
                        }
                        if let ObjectLocation::Location(loc_id) = to_location {
                            if !game.locations.iter().any(|l| l.id == *loc_id) {
                                errors.push(ValidationError::InvalidLocationId {
                                    location_id: *loc_id,
                                    context: format!("rule {} action", rule.id),
                                });
                            }
                        }
                    }
                    ActionType::SetFlag { flag_id, .. } |
                    ActionType::IncrementFlag { flag_id } |
                    ActionType::DecrementFlag { flag_id } => {
                        if *flag_id > 255 {
                            errors.push(ValidationError::InvalidFlagId {
                                flag_id: *flag_id,
                                context: format!("rule {} action", rule.id),
                            });
                        }
                    }
                    _ => {} // Other actions don't reference game entities
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_empty_game() {
        let game = DaadGame::default();
        let code = DaadCodeGenerator::generate(&game);

        // Check all required sections exist in correct order
        let ctl_pos = code.find("/CTL").expect("Missing /CTL section");
        let voc_pos = code.find("/VOC").expect("Missing /VOC section");
        let stx_pos = code.find("/STX").expect("Missing /STX section");
        let mtx_pos = code.find("/MTX").expect("Missing /MTX section");
        let otx_pos = code.find("/OTX").expect("Missing /OTX section");
        let ltx_pos = code.find("/LTX").expect("Missing /LTX section");
        let con_pos = code.find("/CON").expect("Missing /CON section");
        let obj_pos = code.find("/OBJ").expect("Missing /OBJ section");
        let pro0_pos = code.find("/PRO 0").expect("Missing /PRO 0 section");

        // Verify correct ordering
        assert!(ctl_pos < voc_pos, "CTL must come before VOC");
        assert!(voc_pos < stx_pos, "VOC must come before STX");
        assert!(stx_pos < mtx_pos, "STX must come before MTX");
        assert!(mtx_pos < otx_pos, "MTX must come before OTX");
        assert!(otx_pos < ltx_pos, "OTX must come before LTX");
        assert!(ltx_pos < con_pos, "LTX must come before CON");
        assert!(con_pos < obj_pos, "CON must come before OBJ");
        assert!(obj_pos < pro0_pos, "OBJ must come before PRO 0");
    }

    #[test]
    fn test_system_messages_count() {
        let game = DaadGame::default();
        let code = DaadCodeGenerator::generate(&game);

        // Should have 63 system messages (0-62)
        let stx_section = code.split("/STX").nth(1).unwrap().split("/MTX").nth(0).unwrap();
        let message_count = stx_section.matches("/").filter(|s| !s.is_empty()).count();
        assert_eq!(message_count, 63, "Should have 63 system messages (0-62)");
    }

    #[test]
    fn test_vocabulary_format() {
        let mut game = DaadGame::default();
        game.vocabulary.push(VocabEntry {
            word: "test".to_string(),
            word_type: VocabType::Verb,
            id: 20,
        });

        let code = DaadCodeGenerator::generate(&game);

        // Check format: "WORD    ID      type"
        assert!(code.contains("TEST    20      verb"),
            "Vocabulary should be formatted as 'WORD    ID      type'");
    }
}
