# 🔧 Code Generator Improvements Needed

**Based on**: DRC reference implementation analysis
**Target File**: `daad-bevy-builder/src/daad/codegen.rs`
**Goal**: Generate DRC-compatible .SCE files

---

## 🎯 Critical Changes Required

### 1. Section Ordering

**Current Problem**: Sections are in wrong order
**DRC Requirement**: Strict section order

**Required Order**:
```
1. /CTL    (Control - null character)
2. /VOC    (Vocabulary)
3. /STX    (System Messages 0-62)
4. /MTX    (Custom Messages)
5. /OTX    (Object Texts)
6. /LTX    (Location Texts)
7. /CON    (Connections)
8. /OBJ    (Object Definitions)
9. /PRO 0  (Process Table 0)
10. /PRO 1  (Process Table 1)
11. /PRO 2  (Process Table 2)
12. /PRO 3  (Process Table 3)
```

**Fix**:
```rust
pub fn generate(game: &DaadGame) -> String {
    let mut code = String::new();

    code.push_str(&Self::generate_header(game));
    code.push_str(&Self::generate_control_section());        // NEW!
    code.push_str(&Self::generate_vocabulary(&game.vocabulary));
    code.push_str(&Self::generate_system_messages(game));    // NEW!
    code.push_str(&Self::generate_messages(&game.messages));
    code.push_str(&Self::generate_object_texts(&game.objects));
    code.push_str(&Self::generate_location_texts(&game.locations));
    code.push_str(&Self::generate_connections(&game.locations));  // NEW!
    code.push_str(&Self::generate_object_definitions(&game.objects)); // NEW!
    code.push_str(&Self::generate_processes(game));

    code
}
```

---

### 2. /CTL Control Section

**Missing**: No /CTL section in current code

**Required Format**:
```
/CTL    ;Control Section (null char is an underline)
_
```

**Implementation**:
```rust
fn generate_control_section() -> String {
    String::from(
        ";------------------------------------------------------------------------------\n\
         /CTL    ;Control Section (null char is an underline)\n\
         _       \n\n"
    )
}
```

---

### 3. /VOC Vocabulary Format

**Current Problem**: Format is `WORD ; ID` (incorrect)
**DRC Requirement**: `WORD   ID   type`

**Current**:
```
; Verbs
TAKE ; 20
GET ; 20
```

**Required**:
```
;                       Verbs
TAKE    20      verb
GET     20      verb
```

**Fix**:
```rust
fn generate_vocabulary(vocab: &[VocabEntry]) -> String {
    let mut code = String::from(
        ";------------------------------------------------------------------------------\n\
         /VOC    ;Vocabulary\n\n"
    );

    // Movements (nouns < 14)
    code.push_str(";                       Movements ie verbs and nouns < 14\n");
    let movements: Vec<_> = vocab.iter()
        .filter(|v| matches!(v.word_type, VocabType::Noun) && v.id < 14)
        .collect();
    for v in movements {
        code.push_str(&format!("{:<8}{:<8}noun\n", v.word.to_uppercase(), v.id));
    }
    code.push('\n');

    // Nouns
    code.push_str(";                       Nouns   <20 means can be used as verbs\n\
                   ;                               <50 means a proper noun ie not an 'IT'\n");
    let nouns: Vec<_> = vocab.iter()
        .filter(|v| matches!(v.word_type, VocabType::Noun) && v.id >= 14)
        .collect();
    for v in nouns {
        code.push_str(&format!("{:<8}{:<8}noun\n", v.word.to_uppercase(), v.id));
    }
    code.push('\n');

    // Verbs
    code.push_str(";                       Verbs\n");
    let verbs: Vec<_> = vocab.iter()
        .filter(|v| matches!(v.word_type, VocabType::Verb))
        .collect();
    for v in verbs {
        code.push_str(&format!("{:<8}{:<8}verb\n", v.word.to_uppercase(), v.id));
    }
    code.push('\n');

    // Adjectives
    code.push_str(";                               Adjectives\n");
    let adjectives: Vec<_> = vocab.iter()
        .filter(|v| matches!(v.word_type, VocabType::Adjective))
        .collect();
    for v in adjectives {
        code.push_str(&format!("{:<8}{:<8}adjective\n", v.word.to_uppercase(), v.id));
    }
    code.push('\n');

    // Adverbs
    code.push_str(";                               Adverbs\n");
    let adverbs: Vec<_> = vocab.iter()
        .filter(|v| matches!(v.word_type, VocabType::Adverb))
        .collect();
    for v in adverbs {
        code.push_str(&format!("{:<8}{:<8}adverb\n", v.word.to_uppercase(), v.id));
    }
    code.push('\n');

    // Prepositions
    code.push_str(";                               Prepositions\n");
    let preps: Vec<_> = vocab.iter()
        .filter(|v| matches!(v.word_type, VocabType::Preposition))
        .collect();
    for v in preps {
        code.push_str(&format!("{:<8}{:<8}preposition\n", v.word.to_uppercase(), v.id));
    }
    code.push('\n');

    // Pronouns
    code.push_str(";                               Pronouns\n");
    let pronouns: Vec<_> = vocab.iter()
        .filter(|v| matches!(v.word_type, VocabType::Pronoun))
        .collect();
    for v in pronouns {
        code.push_str(&format!("{:<8}{:<8}pronoun\n", v.word.to_uppercase(), v.id));
    }
    code.push('\n');

    // Conjugations
    code.push_str(";                               Conjugations\n");
    let conjs: Vec<_> = vocab.iter()
        .filter(|v| matches!(v.word_type, VocabType::Conjugation))
        .collect();
    for v in conjs {
        code.push_str(&format!("{:<8}{:<8}conjugation\n", v.word.to_uppercase(), v.id));
    }
    code.push_str("\n\n");

    code
}
```

---

### 4. /STX System Messages

**Missing**: No /STX section (critical!)

**Required**: All 62 system messages from BLANK_EN.DSF

**Implementation**:
```rust
fn generate_system_messages(game: &DaadGame) -> String {
    let mut code = String::from(
        ";------------------------------------------------------------------------------\n\
         /STX    ;System Message Texts\n"
    );

    // Use ResponseTable from Module 37 or default messages
    let default_messages = [
        "It's too dark to see anything.",
        "I can also see: ",
        "#nWhat now?",
        // ... all 62 messages
    ];

    for (i, msg) in default_messages.iter().enumerate() {
        code.push_str(&format!("/{} \"{}\"\n", i, msg));
    }

    code.push_str("\n\n");
    code
}
```

---

### 5. /LTX Location Texts Format

**Current Problem**: Includes connections as comments
**DRC Requirement**: Just descriptions, connections go in /CON

**Current**:
```
/LTX ; Location Texts

; Location 0: Start
; DARK LOCATION
You are in a dark room.
; Exits:
;   N -> Location 1
```

**Required**:
```
;------------------------------------------------------------------------------
/LTX    ;Location Texts
/0 "You are in a dark room."
/1 "You are in a bright hallway."
```

**Fix**:
```rust
fn generate_location_texts(locations: &[Location]) -> String {
    let mut code = String::from(
        ";------------------------------------------------------------------------------\n\
         /LTX    ;Location Texts\n"
    );

    for loc in locations {
        code.push_str(&format!("/{} \"{}\"\n", loc.id, loc.description));
    }

    code.push_str("\n\n");
    code
}
```

---

### 6. /CON Connections Section

**Missing**: No /CON section

**Required Format**:
```
;------------------------------------------------------------------------------
/CON    ;Connections
/0
N 2
E 5
/1
S 0
/2
S 0
```

**Implementation**:
```rust
fn generate_connections(locations: &[Location]) -> String {
    let mut code = String::from(
        ";------------------------------------------------------------------------------\n\
         /CON    ;Connections\n"
    );

    for loc in locations {
        code.push_str(&format!("/{}\n", loc.id));

        for conn in &loc.connections {
            let dir = match conn.direction {
                Direction::North => "N",
                Direction::South => "S",
                Direction::East => "E",
                Direction::West => "W",
                Direction::NorthEast => "NE",
                Direction::NorthWest => "NW",
                Direction::SouthEast => "SE",
                Direction::SouthWest => "SW",
                Direction::Up => "U",
                Direction::Down => "D",
            };
            code.push_str(&format!("{} {}\n", dir, conn.target_location));
        }
    }

    code.push_str("\n\n");
    code
}
```

---

### 7. /OBJ Object Definitions

**Missing**: No /OBJ section (critical!)

**Required Format**:
```
;------------------------------------------------------------------------------
/OBJ    ;Object Definitions
;obj  starts  weight    c w  5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0    noun   adjective
;num    at
/0      CARRIED 1       _ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _    TORCH  _
/1      2       10      _ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _    SWORD  HEAVY
```

**Implementation**:
```rust
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
            ObjectLocation::Destroyed => "DESTROYED".to_string(),
        };

        let container_flag = if obj.is_container { "*" } else { "_" };
        let wearable_flag = if obj.is_wearable { "*" } else { "_" };

        // Attribute bits (16 bits total)
        let attr_bits = "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _";  // TODO: implement real attributes

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
```

---

### 8. Process Table Format

**Current Problem**: Missing verb/noun matching
**DRC Requirement**: `> VERB NOUN CONDACT PARAMS ...`

**Current**:
```
; Rule: Get torch
AT 0 ; Start
MESSAGE "Hello!"
```

**Required**:
```
/PRO 1
> GET   TORCH   PRESENT 0
                GET 0
                MESSAGE 0
                PLUS 30 10
                DONE

> _     _       SYSMESS 8
                DONE
```

**Fix**:
```rust
fn generate_rule(rule: &Rule, game: &DaadGame) -> String {
    let mut code = String::new();

    // Extract verb and noun from rule (may need to add to Rule struct)
    let verb = rule.verb.as_deref().unwrap_or("_");
    let noun = rule.noun.as_deref().unwrap_or("_");

    // First line: > VERB NOUN conditions...
    code.push_str(&format!("> {:<7} {:<7}", verb.to_uppercase(), noun.to_uppercase()));

    // Conditions on same line as > VERB NOUN
    for (i, condition) in rule.conditions.iter().enumerate() {
        if i == 0 {
            code.push_str(&Self::generate_condition(condition, game));
        } else {
            code.push_str("\n                ");
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
```

---

### 9. Add EXTERN/MALUVA Support

**Missing**: No EXTERN condact support

**Required**: Module 36 MALUVA functions

**Implementation**:
```rust
fn generate_header(game: &DaadGame) -> String {
    let mut code = format!(
        "; ========================================\n\
         ; {}\n\
         ; by {}\n\
         ; Version: {}\n\
         ; Generated by DAAD Bevy Builder\n\
         ; ========================================\n\n",
        game.title, game.author, game.version
    );

    // Add MALUVA EXTERN if enabled
    if game.maluva_enabled {
        code.push_str(&format!(
            ";#extern \"{}\"\n\n",
            game.maluva_platform.binary_name()
        ));
    }

    // Add system flag definitions
    code.push_str(
        "#define fDark               0\n\
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
         ; ... (rest of system flags)\n\n"
    );

    code
}
```

---

## 📋 Summary of Changes

| Section | Status | Priority | Complexity |
|---------|--------|----------|------------|
| Section ordering | ❌ Wrong order | 🔴 CRITICAL | Easy |
| /CTL | ❌ Missing | 🔴 CRITICAL | Easy |
| /VOC format | ❌ Wrong format | 🔴 CRITICAL | Medium |
| /STX | ❌ Missing | 🔴 CRITICAL | Easy |
| /CON | ❌ Missing | 🔴 CRITICAL | Easy |
| /OBJ | ❌ Missing | 🔴 CRITICAL | Medium |
| /LTX format | 🟡 Needs fix | 🟠 HIGH | Easy |
| /MTX format | 🟢 OK | 🟢 LOW | - |
| /OTX format | 🟡 Needs fix | 🟠 HIGH | Easy |
| /PRO format | ❌ Missing verb/noun | 🔴 CRITICAL | Hard |
| EXTERN support | ❌ Missing | 🟡 MEDIUM | Medium |
| System flags | ❌ Missing | 🟠 HIGH | Easy |

---

## 🧪 Testing Strategy

1. **Generate minimal game**
2. **Compile with DRC**: `drc output.sce`
3. **Check for errors** in DRC output
4. **Test with DAAD interpreter** if compilation succeeds
5. **Compare** our output with BLANK_EN.DSF

---

## 🎯 Implementation Priority

**Phase 1** (CRITICAL - needed for ANY valid output):
1. Fix section ordering
2. Add /CTL section
3. Fix /VOC format
4. Add /STX section
5. Add /CON section
6. Add /OBJ section

**Phase 2** (HIGH - needed for playable games):
7. Fix /PRO verb/noun format
8. Add system flag #define statements
9. Fix /LTX and /OTX formats

**Phase 3** (MEDIUM - needed for advanced features):
10. Add EXTERN/MALUVA support
11. Add validation (flag ranges, message IDs, etc.)
12. Add DRC compilation test

---

**Status**: 📝 Planning complete, ready for implementation
**Estimated Effort**: 8-12 hours
**Files to Modify**: `daad-bevy-builder/src/daad/codegen.rs`
