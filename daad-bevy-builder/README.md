# DAAD Bevy Builder

**Visual No-Code Adventure Game Creator with Live DAAD Code Generation**

A modern, no-code visual builder for creating DAAD (Diseñador de Aventuras AD) text adventure games. Built with Rust and Bevy, it provides a professional drag-and-drop interface while generating clean DAAD source code in real-time.

---

## Features

### 🎨 Visual Game Building
- **No coding required** - Build your adventure with forms and visual editors
- **Live code preview** - See DAAD code generate as you build
- **Drag-and-drop** location and object placement
- **Visual rule builder** - Create game logic without writing condacts

### 📝 Complete DAAD Support
- All DAAD condacts (150+ operations)
- 4 Process tables (PRO 0-3)
- Locations, objects, flags, messages
- Vocabulary and synonyms
- Complete rule system

### 💾 Import/Export
- **Save projects** - JSON format for easy editing
- **Export to DAAD** - Generate .txt source files
- **Export to DDB** - Binary database format (coming soon)
- **Load existing games** - Import DAAD projects

### 🔍 Development Tools
- **Live preview** - Test your game instantly (Phase 2)
- **Code viewer** - See generated DAAD code in real-time
- **Debugging** - Visual rule debugging (Phase 2)

---

## Quick Start

### Prerequisites
- Rust 1.70+ (install from https://rustup.rs)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/daad-bevy-builder.git
cd daad-bevy-builder

# Build and run
cargo run --release
```

### First Steps

1. **Launch the app** - The builder opens with a default game
2. **Edit game info** - Click "📋 Game Info" to set title and author
3. **Add locations** - Click "📍 Locations" and add your first room
4. **Add objects** - Click "📦 Objects" to create items
5. **Create rules** - Click "⚙️ Rules" to add game logic
6. **View code** - Press F1 to see generated DAAD code
7. **Export** - Click "💾 Export" to save your game

---

## Project Structure

```
daad-bevy-builder/
├── src/
│   ├── main.rs              # Application entry point
│   ├── lib.rs               # Library exports
│   │
│   ├── daad/                # DAAD data structures
│   │   ├── types.rs         # Location, Object, Rule, etc.
│   │   ├── game.rs          # Complete game structure
│   │   └── codegen.rs       # DAAD code generator
│   │
│   ├── builder/             # Visual builder
│   │   ├── state.rs         # Builder state management
│   │   └── ui/              # UI components
│   │       ├── main_menu.rs # Top menu bar
│   │       ├── toolbar.rs   # Panel selection
│   │       └── panels.rs    # Panel content
│   │
│   ├── viewer/              # Code viewer
│   │   └── code_display.rs # Live DAAD code display
│   │
│   └── preview/             # Game preview (Phase 2)
│       └── interpreter.rs   # DAAD interpreter
│
├── assets/                  # Fonts, icons, etc.
├── Cargo.toml              # Dependencies
└── README.md               # This file
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **F1** | Toggle code viewer |
| **F5** | Toggle preview mode |
| **Ctrl+S** | Save project |
| **Ctrl+E** | Export to DAAD |
| **Ctrl+N** | New game |
| **Ctrl+O** | Open game |

---

## Panels

### 📋 Game Info
- Edit title, author, version
- View game statistics
- Configure global settings

### 📍 Locations
- Create and edit locations
- Set descriptions
- Mark as dark/lit
- Define connections (coming soon)

### 📦 Objects
- Create game objects
- Set properties (weight, container, wearable)
- Assign icons
- Define initial locations

### ⚙️ Rules
- Build game logic visually
- Add conditions (IF)
- Add actions (THEN)
- Organize by process table

### 🚩 Flags
- Create game variables (0-255)
- Name flags meaningfully
- Set initial values
- Track game state

### 💬 Messages
- Create reusable text
- System messages
- Organize dialog

### ▶️ Preview
- Test your game (Phase 2)
- Live playthrough
- Debug mode

### 💾 Export
- Export DAAD source (.txt)
- Export DDB binary (.ddb)
- Save project (.json)

---

## Development Phases

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Project structure
- [x] DAAD data types
- [x] Code generator
- [x] Basic UI panels
- [x] Live code viewer

### 🔄 Phase 2: Visual Editors (In Progress)
- [ ] Interactive location editor
- [ ] Visual object placement
- [ ] Rule builder with drag-and-drop
- [ ] Connection editor
- [ ] Live game preview

### 📋 Phase 3: Advanced Features
- [ ] Visual process flow
- [ ] Rule debugging
- [ ] DDB file export
- [ ] Import existing games
- [ ] Templates and examples

### 🚀 Phase 4: Polish
- [ ] Better UI/UX
- [ ] Tutorials
- [ ] Example games
- [ ] Documentation
- [ ] Packaging

---

## DAAD Code Generation

The builder generates clean, readable DAAD code:

### Example: Simple Rule

**Visual Builder Input:**
- Condition: "Player at location 0"
- Condition: "Object 5 is carried"
- Action: "Display message 'You found the key!'"
- Action: "Add 10 points to score"
- Action: "End turn"

**Generated DAAD Code:**
```daad
; Rule: Find the key
AT 0 ; Start Room
CARRIED 5 ; key
MESSAGE "You found the key!"
SCORE 10
DONE
```

---

## Technical Details

### Built With
- **Rust** - Systems programming language
- **Bevy 0.12** - Game engine and UI framework
- **serde** - Serialization (save/load)
- **bincode** - Binary encoding

### Performance
- Native desktop app (no browser required)
- Instant code generation
- Real-time UI updates
- Minimal memory footprint

### Compatibility
- **Windows** - Full support
- **macOS** - Full support
- **Linux** - Full support

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## License

[Add your license here]

---

## Credits

- **DAAD System** - Original by Andrés Samudio (1986)
- **Bevy Engine** - https://bevyengine.org
- **Rust Language** - https://rust-lang.org

---

## Roadmap

- [ ] Complete visual editors
- [ ] Live game preview
- [ ] DDB export
- [ ] Import existing DAAD games
- [ ] Templates library
- [ ] Tutorial mode
- [ ] Mobile/web version
- [ ] Collaboration features

---

## Support

- **Issues**: https://github.com/your-repo/daad-bevy-builder/issues
- **Discussions**: https://github.com/your-repo/daad-bevy-builder/discussions
- **Documentation**: [Coming soon]

---

**Happy Adventure Creating! 🎮**
