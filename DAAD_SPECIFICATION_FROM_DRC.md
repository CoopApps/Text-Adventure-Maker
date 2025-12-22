# 🎯 DAAD Specification - Extracted from DRC Reference Implementation

**Source**: DRC (DAAD Reborn Compiler) - https://github.com/Utodev/DRC
**Analyzed**: December 22, 2025
**Purpose**: Definitive DAAD specification for our Rust/Bevy implementation

---

## 📋 Table of Contents

1. [File Format (.DSF/.SCE)](#file-format)
2. [Complete Condact List](#complete-condact-list)
3. [Parameter Types](#parameter-types)
4. [System Flags (0-63)](#system-flags)
5. [System Messages (0-62)](#system-messages)
6. [File Sections](#file-sections)
7. [Process Table Structure](#process-table-structure)
8. [MALUVA Extensions](#maluva-extensions)
9. [Implementation Requirements](#implementation-requirements)

---

## 📄 File Format

### DAAD Source File (.DSF/.SCE)

**Extension**: `.sce` (source) compiles to `.ddb` (binary database)

**Encoding**: ASCII text

**Structure**:
```
; Comments start with semicolon
#directive_name parameters    ; Compiler directives start with #
/SECTION                       ; Sections start with /
data
```

### Compiler Directives

| Directive | Purpose | Example |
|-----------|---------|---------|
| `#define` | Define constants | `#define TIMEOUT 87` |
| `#extern` | Link external MALUVA module | `#extern "MLV_ESX.BIN"` |
| `#classic` | Use classic DAAD V1 mode | `#classic` |
| `#debug` | Enable debug output | `#debug` |

---

## 🎮 Complete Condact List

### Base Condacts (0-127)

From `UCondacts.pas` in DRC source:

```pascal
// CONDITIONS (return true/false, can chain with actions)
0   AT locno                    // Player at location?
1   NOTAT locno                 // Player NOT at location?
2   ATGT locno                  // Player location > locno?
3   ATLT locno                  // Player location < locno?
4   PRESENT objno               // Object present (carried/worn/here)?
5   ABSENT objno                // Object absent?
6   WORN objno                  // Object being worn?
7   NOTWORN objno               // Object NOT worn?
8   CARRIED objno               // Object carried?
9   NOTCARR objno               // Object NOT carried?
10  CHANCE percent              // Random chance (1-99%)?
11  ZERO flagno                 // Flag == 0?
12  NOTZERO flagno              // Flag != 0?
13  EQ flagno value             // Flag == value?
14  GT flagno value             // Flag > value?
15  LT flagno value             // Flag < value?
16  ADJECT1 adjective           // First adjective matches?
17  ADVERB adverb               // Adverb matches?
18  SFX value value             // Sound effect
19  DESC locno                  // Describe location
20  QUIT                        // Quit game
21  END                         // End game
22  DONE                        // Stop processing this turn
23  OK                          // Print "OK"
24  ANYKEY                      // Wait for key press
25  SAVE value                  // Save game
26  LOAD value                  // Load game
27  DPRINT flagno               // Print flag value as decimal
28  DISPLAY value               // Display picture (value = flag)
29  CLS                         // Clear screen
30  DROPALL                     // Drop all objects
31  AUTOG                       // Auto-get objects
32  AUTOD                       // Auto-drop objects
33  AUTOW                       // Auto-wear objects
34  AUTOR                       // Auto-remove objects
35  PAUSE                       // Pause (deprecated)
36  SYNONYM verb noun           // Create verb/noun synonym
37  GOTO locno                  // Move player to location
38  MESSAGE mesno               // Print message
39  REMOVE objno                // Remove object to limbo (253)
40  GET objno                   // Get object
41  DROP objno                  // Drop object
42  WEAR objno                  // Wear object
43  DESTROY objno               // Destroy object to location 255
44  CREATE objno                // Create object at current location
45  SWAP objno objno            // Swap two object locations
46  PLACE objno locno_          // Place object at location
47  SET flagno                  // Set flag to 1
48  CLEAR flagno                // Clear flag to 0
49  PLUS flagno value           // Add value to flag
50  MINUS flagno value          // Subtract value from flag
51  LET flagno value            // Set flag to value
52  NEWLINE                     // Print newline
53  PRINT flagno                // Print flag as character
54  SYSMESS sysno               // Print system message (0-62)
55  ISAT objno locno_           // Object at location?
56  SETCO objno                 // Set current object
57  SPACE                       // Print space
58  HASAT value                 // Has object with attribute at current loc?
59  HASNAT value                // NOT has object with attribute?
60  LISTOBJ                     // List objects at current location
61  EXTERN value value          // Call external routine
62  RAMSAVE                     // Save to RAM
63  RAMLOAD flagno              // Load from RAM (stores success in flag)
64  BEEP value value            // Beep (frequency, duration)
65  PAPER value                 // Set paper color
66  INK value                   // Set ink color
67  BORDER value                // Set border color
68  PREP preposition            // Check preposition
69  NOUN2 noun                  // Check second noun
70  ADJECT2 adjective           // Check second adjective
71  ADD flagno flagno           // Add flag2 to flag1
72  SUB flagno flagno           // Subtract flag2 from flag1
73  PARSE value                 // Re-parse input
74  LISTAT locno_               // List objects at location
75  PROCESS procno              // Call process table
76  SAME flagno flagno          // Two flags equal?
77  MES mesno                   // Print message (short form)
78  WINDOW window               // Select window (0-7)
79  NOTEQ flagno value          // Flag != value?
80  NOTSAME flagno flagno       // Two flags not equal?
81  MODE value                  // Set graphics mode
82  WINAT value value           // Position window
83  TIME value value            // Set time
84  PICTURE value               // Display picture
85  DOALL locno_                // Do action for all objects at location
86  MOUSE value value           // Mouse input
87  GFX value value             // Graphics command
88  ISNOTAT objno locno_        // Object NOT at location?
89  WEIGH objno flagno          // Get object weight into flag
90  PUTIN objno locno           // Put object in container
91  TAKEOUT objno locno         // Take object out of container
92  NEWTEXT                     // Clear text buffer
93  ABILITY value value         // Check/set player ability
94  WEIGHT flagno               // Total carried weight into flag
95  RANDOM flagno               // Random number 0-255 into flag
96  INPUT value value           // Text input
97  SAVEAT                      // Save current location
98  BACKAT                      // Return to saved location
99  PRINTAT value value         // Print at position
100 WHATO                       // Print current object name
101 CALL value value            // Call machine code routine
102 PUTO locno_                 // Put current object at location
103 NOTDONE                     // Clear DONE flag
104 AUTOP locno                 // Auto-put objects at location
105 AUTOT locno                 // Auto-take objects from location
106 MOVE flagno                 // Move in direction (flag = direction)
107 WINSIZE value value         // Set window size
108 REDO                        // Restart process table from top
109 CENTRE                      // Center text
110 EXIT value                  // Exit with code
111 INKEY                       // Get key press (non-blocking)
112 BIGGER flagno flagno        // First flag > second flag?
113 SMALLER flagno flagno       // First flag < second flag?
114 ISDONE                      // Is DONE flag set?
115 ISNDONE                     // Is DONE flag NOT set?
116 SKIP value                  // Skip entries
117 RESTART                     // Restart game
118 TAB value                   // Tab to column
119 COPYOF objno flagno         // Copy object location to flag
120 dumb                        // (V3: PREFIX for prefixed condacts)
121 COPYOO objno objno          // Copy object1 location to object2
122 dumb                        // (V3: SETP2)
123 COPYFO flagno objno         // Copy flag to object location
124 dumb                        // (V3: SETP2)
125 COPYFF flagno flagno        // Copy flag1 to flag2
126 COPYBF flagno flagno        // Copy low byte of flag1 to flag2
127 RESET                       // Reset game state
```

### MALUVA Extended Condacts (128-142)

**Source**: MALUVA EXTERN module by Utodev

```
128 XMES string                 // Load message from disk
129 XMESSAGE string             // Load message from disk (long form)
130 XPICTURE value              // Load picture from disk
131 XSAVE value                 // Enhanced save to disk
132 XLOAD value                 // Enhanced load from disk
133 XPART value                 // Multi-part game support
134 XPLAY string                // Play music/sound file
135 XBEEP value value           // Platform beep with parameters
136 XSPLITSCR value             // Split screen mode
137 XUNDONE                     // Undo DONE status
138 XNEXTCLS                    // ZX Spectrum Next layer 2 clear
139 XNEXTRST                    // ZX Spectrum Next soft reset
140 XSPEED value                // Set game speed
141 PENDINGSKIP value           // Internal compiler use only
142 XDATA string                // Load data from disk
```

### Prefix Condacts (V3 extension, 0-9)

**Accessed via PREFIX condact in V3 mode**

```
0  BSET flagno bitno           // Set bit in flag
1  BCLEAR flagno bitno         // Clear bit in flag
2  BTOGGLE flagno bitno        // Toggle bit in flag
3  BZERO flagno bitno          // Test if bit is zero
4  BNOTZERO flagno bitno       // Test if bit is not zero
5  SELECT flagno               // Begin menu selection (stores choice in flag)
6  OPTION value string         // Add menu option
7  CHOICE                      // Display menu and get choice
8  TOGGLECON string            // Toggle connection
9  MES2 mesno2                 // Extended message system (internal)
```

---

## 🔤 Parameter Types

From `UCondacts.pas`:

```pascal
type TParamType = (
    none,                       // No parameter
    locno,                      // Location number (0-251)
    objno,                      // Object number (0-255)
    flagno,                     // Flag number (0-255)
    sysno,                      // System message number (0-62)
    mesno,                      // Message number (0-65535)
    procno,                     // Process table number (0-3)
    value,                      // Immediate value (0-255)
    locno_,                     // Location or special (0-255, 252-255 special)
    percent,                    // Percentage (1-99)
    vocabularyVerb,             // Verb from vocabulary
    vocabularyNoun,             // Noun from vocabulary
    vocabularyPrep,             // Preposition from vocabulary
    vocabularyAdverb,           // Adverb from vocabulary
    vocabularyAdjective,        // Adjective from vocabulary
    skip,                       // Skip count
    string_,                    // String literal
    mesno2,                     // Extended message number
    window,                     // Window number (0-7)
    bitno                       // Bit number (0-15)
);
```

### Special Location Values

| Value | Meaning | Usage |
|-------|---------|-------|
| 252 | CARRIED | Object is carried by player |
| 253 | LIMBO | Object in limbo (removed but not destroyed) |
| 254 | WORN | Object is being worn |
| 255 | DESTROYED | Object is destroyed |

---

## 🚩 System Flags (0-63)

**Predefined flags with special meanings:**

From `BLANK_EN.DSF`:

```c
#define fDark               0   // Is location dark?
#define fObjectsCarried     1   // Number of objects carried
#define fDarkF              28  // Dark flag
#define fGFlags             29  // Graphics mode flags (test with HASAT GMODE)
#define fScore              30  // Player score
#define fTurns              31  // Turn count (low byte)
#define fTurnsHi            32  // Turn count (high byte)
#define fVerb               33  // Current verb ID
#define fNoun               34  // Current noun ID
#define fAdject1            35  // Current first adjective ID
#define fAdverb             36  // Current adverb ID
#define fMaxCarr            37  // Maximum objects carried
#define fPlayer             38  // Current player location
#define fPrep               43  // Current preposition ID
#define fNoun2              44  // Current second noun ID
#define fAdject2            45  // Current second adjective ID
#define fCPronounNoun       46  // Pronoun noun reference
#define fCPronounAdject     47  // Pronoun adjective reference
#define fTimeout            48  // Timeout counter
#define fTimeoutFlags       49  // Timeout flags
#define fDoallObjNo         50  // DOALL current object number
#define fRefObject          51  // Reference object number
#define fStrength           52  // Player strength
#define fObjFlags           53  // Current object flags
#define fRefObjLoc          54  // Reference object location
#define fRefObjWeight       55  // Reference object weight
#define fRefObjIsContainer  56  // Reference object is container?
#define fRefObjisWearable   57  // Reference object is wearable?
#define fRefObjAttr1        58  // Reference object attribute 1
#define fRefObjAttr2        59  // Reference object attribute 2
#define fInkeyKey1          60  // INKEY result byte 1
#define fInkeyKey2          61  // INKEY result byte 2
#define fScreenMode         62  // Screen mode (2=Text, 4=CGA, 13=EGA, 141=VGA)
#define fCurrentWindow      63  // Currently active window number
```

**User Flags**: 64-255 are available for game logic

---

## 💬 System Messages (0-62)

**SYSMESS 0-62** - Customizable system responses

From `BLANK_EN.DSF /STX` section:

```
0   "It's too dark to see anything."
1   "I can also see: "
2   "#nWhat now?"
3   "#nWhat next?"
4   "#nWhat should I do now?"
5   "#nWhat should I do next?"
6   "#nI was not able to understand any of that.  Please try again."
7   "#nI can't go in that direction."
8   "I can't do that.#n"
9   "I have with me:#n"
10  "I am wearing:#n"
11  "" (Spare)
12  "Are you sure? "
13  "Would you like another go? "
14  "" (Spare)
15  "OK.#n"
16  "Press any key to continue.#n"
17  "" (You have taken)
18  "" (\sturn)
19  "" (s)
20  "" (.[CR])
21  "" (You have scored)
22  "" (%[CR])
23  "I'm not wearing one of those.#n"
24  "I can't.  I'm wearing the _."
25  "I already have the _."
26  "There isn't one of those here."
27  "I can't carry any more things."
28  "I don't have one of those."
29  "I'm already wearing the _."
30  "Y" (One upper case character only)
31  "N" (One upper case character only)
32  "More..."
33  "#n>"
34  "" (Spare)
35  "#nTime passes...#n"
36  "I now have the _.#n"
37  "I'm now wearing the _.#n"
38  "I've removed the _.#n"
39  "I've dropped the _.#n"
40  "I can't wear the _.#n"
41  "I can't remove the _.#n"
42  "I can't remove the _.  My hands are full.#n"
43  "The _ weighs too much for me.#n"
44  "#nThe _ is in the "
45  "The _ isn't in the "
46  ", "
47  " and "
48  ".#n"
49  "I don't have the _.#n"
50  "I'm not wearing the _.#n"
51  ".#n"
52  "There isn't one of those in the "
53  "Nothing.#n"
54  "T" (Letter for Tape)
55  "D" (Disc)
56  "Drive not ready - press any key to retry.#n"
57  "I/O Error.#n"
58  "Disc or Directory may be full."
59  "Invalid filename."
60  "Type in name of file:"
61  "Start tape.#n"
62  "Tape or Disc?"
```

**Special Codes**:
- `#n` = Newline
- `_` = Current object name placeholder
- `@flagno` = Indirect flag reference (value at flag)

---

## 📑 File Sections

### Required Section Order

```
/CTL    ; Control Section (null character definition)
/VOC    ; Vocabulary
/STX    ; System Message Texts (0-62)
/MTX    ; Message Texts (custom messages)
/OTX    ; Object Texts (descriptions)
/LTX    ; Location Texts (descriptions)
/CON    ; Connections (location exits)
/OBJ    ; Object Definitions
/PRO 0  ; Process Table 0 (main location loop)
/PRO 1  ; Process Table 1 (main command loop)
/PRO 2  ; Process Table 2 (timeout/special events)
/PRO 3  ; Process Table 3 (location descriptions)
```

### /CTL - Control Section

Defines the "null" character used for spacing:

```
/CTL
_       ; Underscore is the null character
```

### /VOC - Vocabulary

**Format**: `WORD   ID   TYPE`

```
NORTH   2       noun
TAKE    20      verb
BIG     3       adjective
QUICKLY 2       adverb
IN      4       preposition
IT      2       pronoun
AND     2       conjugation
```

**Word Type Rules**:
- **Verbs/Nouns < 14**: Movement verbs
- **Nouns < 20**: Can be used as verbs (convertible)
- **Nouns < 50**: Proper nouns (not "IT" pronouns)
- **Nouns >= 50**: Regular objects
- **Words truncated to 5 characters** (max length)

### /OBJ - Object Definitions

**Format**:
```
;obj  starts  weight    c w  5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0    noun   adjective
/0    CARRIED  1        _ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _    TORCH  _
/1    2        10       _ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _    SWORD  HEAVY
```

**Fields**:
- **obj num**: Object number (0-255)
- **starts at**: Initial location (0-251, CARRIED, WORN, LIMBO, DESTROYED)
- **weight**: Object weight (0-255)
- **c w**: Container/Wearable flags
- **Attribute bits**: 16 attribute flags
- **noun**: Vocabulary noun ID
- **adjective**: Vocabulary adjective ID (optional)

### /CON - Connections

**Format**: List exits for each location

```
/0              ; Location 0 has no exits
/1
N 2             ; North goes to location 2
E 5             ; East goes to location 5
/2
S 1             ; South goes to location 1
```

### /PRO - Process Tables

**Format**:
```
/PRO procno
> VERB NOUN CONDACT1 PARAMS CONDACT2 PARAMS
            CONDACT3 PARAMS
            CONDACT4 PARAMS

> VERB NOUN CONDACT1 PARAMS
            CONDACT2 PARAMS
```

**Special Markers**:
- `> _ _` = Match any verb, any noun
- `> GET _` = Match GET verb with any noun
- `> _ SWORD` = Match any verb with SWORD noun
- `$label` = Label for SKIP/GOTO
- Indentation for continuation lines

**Example**:
```
/PRO 1
> GET _     PRESENT @fNoun       ; If object is present
            GET @fNoun           ; Get it
            SYSMESS 36           ; Print "I now have the _."
            DONE                 ; Stop processing

> DROP _    CARRIED @fNoun       ; If carrying object
            DROP @fNoun          ; Drop it
            SYSMESS 39           ; Print "I've dropped the _."
            DONE
```

---

## 🔧 MALUVA Extensions

### What is MALUVA?

**MALUVA** = EXTERN module for DAAD adding 10 advanced functions

**Platforms**: ZX Spectrum, Amstrad CPC, C64, Amiga, MSX, MS-DOS, ZX Spectrum Next

**Usage**: Link with `#extern "MALUVA_PLATFORM.BIN"`

### MALUVA Functions

#### 1. XPICTURE value
Load raster graphics from disk.

**Platforms**: All
**Usage**: `XPICTURE 5` loads picture file 5

#### 2. XSAVE value / XLOAD value
Enhanced save/load directly to disk (faster than tape).

**Usage**:
```
XSAVE 1    ; Save to slot 1
XLOAD 1    ; Load from slot 1
```

#### 3. XMESSAGE string / XMES string
Load messages from disk (for huge games exceeding memory).

**Usage**: `XMESSAGE "PART2.MSG"`

#### 4. XPART value
Multi-part game support (switch between game parts).

**Usage**: `XPART 2` loads game part 2

#### 5. XBEEP value value
Platform-specific beep/sound (for machines without native BEEP).

**Usage**: `XBEEP 100 50` (frequency 100, duration 50)

#### 6. XSPLITSCR value
Split-screen video mode.

**Usage**: `XSPLITSCR 10` splits screen at row 10

#### 7. XUNDONE
Undo DONE status (continue processing after DONE).

**Usage**: `XUNDONE`

#### 8. XNEXTCLS
ZX Spectrum Next layer 2 clear.

**Platform**: ZX Spectrum Next only

#### 9. XNEXTRST
ZX Spectrum Next soft reset.

**Platform**: ZX Spectrum Next only

#### 10. XPLAY string
Play music/sound file from disk.

**Usage**: `XPLAY "THEME.MUS"`

---

## ✅ Implementation Requirements

### What Our Rust Builder Must Do

1. **Generate Valid .SCE Files**
   - Match DRC's expected format exactly
   - Proper section ordering (/CTL, /VOC, /STX, /MTX, /OTX, /LTX, /CON, /OBJ, /PRO)
   - Correct comment syntax (`;`)
   - Proper directive syntax (`#define`, `#extern`)

2. **Support All 128 Base Condacts**
   - Implement builders for each condact type
   - Validate parameter types
   - Generate correct syntax

3. **Support MALUVA Extensions**
   - Optional EXTERN module support
   - Generate XMES, XPICTURE, XSAVE, etc.
   - Platform selection (ZX Spectrum, CPC, etc.)

4. **Validate Semantic Rules**
   - Location numbers must exist (< LTXCount)
   - Object numbers must exist (< OTXCount)
   - Messages must exist (< MTXCount)
   - System messages must be 0-62
   - Vocabulary words must be defined
   - Percent values must be 1-99
   - Window values must be 0-7

5. **System Flags Management**
   - Reserve flags 0-63 for system use
   - Provide friendly names (fDark, fScore, fPlayer, etc.)
   - Warn when user tries to use system flags

6. **Generate Process Tables**
   - Proper indentation (conditions on first line, actions indented)
   - Label support (`$label`)
   - Verb/noun matching
   - `> _ _` wildcard support

7. **Object Attributes**
   - Container/Wearable flags
   - 16 attribute bits
   - Weight calculation
   - Initial location

8. **Vocabulary Management**
   - 5-character truncation
   - Type validation (verb, noun, adjective, adverb, preposition)
   - ID assignment
   - Convertible noun rules (< 20)

---

## 🎯 Validation Checklist

**Before generating .SCE file**:

- [ ] All locations have descriptions in /LTX
- [ ] All objects have descriptions in /OTX
- [ ] All vocabulary words are max 5 characters
- [ ] All SYSMESS references are 0-62
- [ ] All flag references are valid
- [ ] All process tables exist (0-3)
- [ ] All GOTO/AT references point to valid locations
- [ ] All GET/DROP references point to valid objects
- [ ] All MESSAGE references point to valid messages
- [ ] CHANCE values are 1-99
- [ ] WINDOW values are 0-7
- [ ] No duplicate vocabulary IDs

**After generating .SCE file**:

- [ ] Compile with DRC: `drc mygame.sce`
- [ ] Check for compilation errors
- [ ] Test with official DAAD interpreter
- [ ] Verify all condacts work as expected

---

## 📚 Reference Files

### In external/DRC:
- `src/UCondacts.pas` - Complete condact definitions
- `src/USintactic.pas` - Parser (syntax analysis)
- `src/lexer.pas` - Lexical analyzer
- `BLANK_EN.DSF` - Empty template (English)
- `BLANK_ES.DSF` - Empty template (Spanish)

### In external/MALUVA:
- `maluva_*.asm` - Platform-specific MALUVA implementations
- Wiki: https://github.com/Utodev/MALUVA/wiki

### In external/daad:
- `Docs/` - Official DAAD documentation
- Compiled interpreters for testing

---

## 🚀 Next Steps

1. **Update Our Codegen** (`daad-bevy-builder/src/daad/codegen.rs`)
   - Match DRC format exactly
   - Add proper section markers
   - Implement indentation rules
   - Add validation

2. **Implement MALUVA Module** (Module 19/36)
   - Add EXTERN support to codegen
   - UI for MALUVA function builders
   - Platform selection

3. **Enhance Module 37** (Response Table)
   - Populate with default messages from BLANK_EN.DSF
   - UI for editing all 62 messages
   - Special code support (`#n`, `_`, `@flag`)

4. **Create Validation System**
   - Pre-generation validation
   - DRC compilation test
   - Error reporting

5. **Testing Pipeline**
   ```
   Bevy Builder → .sce file → DRC compiler → .ddb file → DAAD interpreter
   ```

---

## 📖 Example: Complete Minimal Game

```daad
; My First DAAD Game
#define fScore 30
#define fPlayer 38

/CTL
_

/VOC
N       2       noun
NORTH   2       noun
TAKE    20      verb
GET     20      verb
TORCH   100     noun

/STX
/0 "It's too dark to see."
/1 "I can also see: "
; ... (rest of 62 messages)

/MTX
/0 "Welcome to my game!"

/OTX
/0 "A burning torch."

/LTX
/0 "Starting Room. A passage leads north."
/1 "Dark Room. You can go south."

/CON
/0
N 1
/1
S 0

/OBJ
/0  0  1  _ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _  TORCH  _

/PRO 0
> _     _       DESC @fPlayer
                DONE

/PRO 1
> GET   TORCH   PRESENT 0
                GET 0
                MESSAGE 0
                PLUS fScore 10
                DONE

> N     _       GOTO 1
                DONE

> _     _       SYSMESS 8
                DONE
```

---

**Document Status**: ✅ Complete
**Last Updated**: 2025-12-22
**Source**: DRC v2.x reference implementation
