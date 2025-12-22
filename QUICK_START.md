# 🚀 Quick Start Guide - DAAD Bevy Builder

## Running the GUI Right Now

The main GUI application is already built and ready to run!

### Step 1: Build the Application

```bash
cd daad-bevy-builder
cargo build --release
```

**First build takes 5-10 minutes** (downloads dependencies, compiles Bevy)
**Subsequent builds are fast** (~30 seconds)

### Step 2: Run the Application

```bash
cargo run --release
```

Or directly run the executable:
```bash
./target/release/daad-bevy-builder
```

### Step 3: What You'll See

A window opens with:
```
╔═══════════════════════════════════════════════╗
║  DAAD Bevy Builder - Visual Adventure Creator ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  [📋 Game Info] [📍 Locations] [📦 Objects]  ║
║  [⚙️ Rules] [🚩 Flags] [💬 Messages]         ║
║  [▶️ Preview] [💾 Export]                     ║
║                                               ║
║  ┌─────────────────────────────────────────┐ ║
║  │                                         │ ║
║  │      Active Panel Content Here         │ ║
║  │                                         │ ║
║  └─────────────────────────────────────────┘ ║
║                                               ║
║  Stats: 1 Location, 0 Objects, 0 Rules       ║
╚═══════════════════════════════════════════════╝
```

---

## 🎮 Basic Usage

### Create Your First Adventure

1. **Game Info** (click "📋 Game Info")
   - Edit title, author, version
   - See game statistics

2. **Add Locations** (click "📍 Locations")
   - Click "➕ Add Location"
   - Drag to position on canvas
   - Right-click drag between locations to connect them

3. **Add Objects** (click "📦 Objects")
   - Click "➕ Add Object"
   - Set name, weight, location
   - Choose icon

4. **Create Rules** (click "⚙️ Rules")
   - Click "➕ Add Rule"
   - Add conditions (e.g., "Player at Location X")
   - Add actions (e.g., "Display message")
   - Select process table (PRO 0-3)

5. **Test Your Game** (click "▶️ Preview")
   - Click "START GAME"
   - Use commands: LOOK, N, S, E, W, INVENTORY
   - Test your rules

6. **Export** (click "💾 Export" OR press Ctrl+E)
   - Generates `.sce` DAAD source file
   - Saves to `./exports/` directory

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **F1** | Toggle code viewer (see generated DAAD code) |
| **F5** | Toggle preview mode |
| **Ctrl+S** | Save project to JSON |
| **Ctrl+E** | Export to DAAD source (.sce) |

---

## 📁 Project Structure

After running, you'll have:

```
daad-bevy-builder/
├── exports/               # 🆕 Generated files
│   ├── my_adventure.json  # Saved projects
│   └── my_adventure.sce   # DAAD source code
├── src/                   # Source code
├── target/                # Compiled binaries
│   └── release/
│       └── daad-bevy-builder  # The executable
└── Cargo.toml
```

---

## 🎯 What's Already Working

### ✅ Phase 1 & 2 Complete

- [x] **Visual Location Editor** - Drag-and-drop placement
- [x] **Connection Creator** - Right-click drag between locations
- [x] **Object Editor** - Create and manage game objects
- [x] **Rule Builder** - Visual condition/action builder
- [x] **Flag System** - 256 game variables
- [x] **Message System** - Text management
- [x] **Live Preview** - Built-in DAAD interpreter
- [x] **Code Generation** - Export to DAAD .sce format
- [x] **JSON Save/Load** - Project persistence

### 🔨 What We're Building Next

The **30+ Professional Modules** including:
- Enhanced condition builder (50+ condition types)
- Advanced action system (60+ actions)
- Visual process flow diagram
- Vocabulary/synonym builders
- Graphics & sound support (MALUVA)
- Debugging tools
- Multi-platform export
- And much more...

---

## 🐛 Troubleshooting

### Build Errors

**Error**: `failed to compile`
**Solution**: Ensure Rust 1.70+ installed:
```bash
rustup update
cargo --version  # Should show 1.70+
```

**Error**: `linker 'cc' not found` (Linux)
**Solution**: Install build tools:
```bash
# Ubuntu/Debian
sudo apt install build-essential

# Fedora
sudo dnf install gcc
```

**Error**: X11 errors (Linux)
**Solution**: Install X11 development libraries:
```bash
# Ubuntu/Debian
sudo apt install libx11-dev libxcursor-dev libxi-dev libxrandr-dev

# Fedora
sudo dnf install libX11-devel libXcursor-devel libXi-devel libXrandr-devel
```

### Runtime Issues

**Issue**: Window doesn't open
**Solution**: Check graphics drivers are up to date

**Issue**: Slow performance
**Solution**: Make sure you're using `--release` mode:
```bash
cargo run --release  # NOT cargo run
```

---

## 📚 Next Steps

### 1. Explore Existing Features
- Create a simple 2-3 room adventure
- Test it in Preview mode
- Export the DAAD code and examine it

### 2. Read the Documentation
- `README.md` - Detailed feature list
- `RUST_IMPLEMENTATION_PLAN.md` - Full roadmap
- `DAAD_MODULES_COMPLETE_ANALYSIS.md` - Module specifications

### 3. Start Building Modules
Once you're comfortable with the existing app, we can start implementing the 30+ professional modules outlined in the implementation plan.

---

## 🎓 DAAD Resources

### Learn DAAD Language
- **DAAD Manual**: Classic 1986 manual (included in docs/)
- **Condacts Reference**: Full list of 150+ DAAD commands
- **Example Games**: See `examples/` directory

### Understanding Process Tables
- **PRO 0**: Runs before command processing - use for custom parsing
- **PRO 1**: Runs after successful command - use for responses
- **PRO 2**: Runs every turn automatically - use for timers, NPCs
- **PRO 3**: Runs for descriptions - use for dynamic text

---

## 🚀 Ready to Build?

The GUI is running! Now let's add the professional modules:

1. **Start with Module 1**: Condition System Builder
2. **Then Module 2**: Action System Builder
3. **Continue through all 38 modules** (yes, 38! - see updated plan)

Check `RUST_IMPLEMENTATION_PLAN.md` for the complete roadmap.

---

**Happy Adventure Creating! 🎮**
