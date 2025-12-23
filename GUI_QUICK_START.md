# 🎮 DAAD Bevy Builder - GUI Quick Start

## ✅ Build Status: SUCCESS

The application compiled with **0 errors**! Ready to run.

---

## 🚀 How to Run on Your Local Machine

```bash
cd Text-Adventure-Maker/daad-bevy-builder
cargo run --release
```

**What happens:**
1. Window opens (1600x900)
2. Visual game builder loads
3. Default game appears (Start Room + torch object)

---

## 🎯 Testing "Build & Test" Button

### Navigate to Export Panel

**Click the toolbar button:** `💾 Export`

You'll see three sections:
1. **📁 Save Project (JSON)** - Save your work
2. **📤 Export to DAAD Source** - Generate .SCE file
3. **🚀 Build & Test with DRC** ← **NEW FEATURE!**

### Click "🚀 BUILD & TEST"

**What happens (in <1 second):**
```
1. Generates ./exports/my_adventure.sce
2. Calls DRC compiler
3. Creates ./exports/my_adventure.json
4. Shows results in GUI
```

---

## ✅ Success Output (Green Box)

```
┌───────────────────────────────────────────────────────┐
│ ✅ Compilation Successful                             │
├───────────────────────────────────────────────────────┤
│ DAAD Reborn Compiler Frontend 0.36 (C) Uto 2018-2025 │
│ Reading ./exports/my_adventure.sce                    │
│ Checking Syntax...                                    │
│ Updating forward references...                        │
│ Generating ./exports/my_adventure.json                │
│ [Classic mode OFF]                                    │
│ ./exports/my_adventure.json generated.                │
└───────────────────────────────────────────────────────┘
```

**Meaning**: Your game is compiled and ready to play on retro systems!

---

## ❌ Error Output (Red Box)

If there are problems, you'll see:

```
┌───────────────────────────────────────────────────────┐
│ ❌ Compilation Failed                                 │
├───────────────────────────────────────────────────────┤
│ 152:72: Noun not defined: "SWORD"                    │
└───────────────────────────────────────────────────────┘
```

**Fix**: Add missing vocabulary, fix object IDs, etc.

---

## ⌨️ Keyboard Shortcuts

- **F1** - Toggle code viewer
- **F5** - Toggle preview mode  
- **Ctrl+S** - Save project
- **Ctrl+E** - Export .SCE file

---

## 📁 Output Files

Check `./exports/` directory:
- `my_adventure.sce` - DAAD source code
- `my_adventure.json` - Compiled game database

---

## 🎮 Complete Workflow

1. Build game in visual editor
2. Click "💾 Export" tab
3. Click "🚀 BUILD & TEST"
4. See green success box
5. Game ready at `./exports/game.json`!

**That's it!** One-click game compilation! 🎉

---

## 🐛 If DRC Not Found

Error: `❌ DRC Compiler Not Found`

**Fix**:
```bash
cd ../external/DRC/src
fpc drf.pas -odrc
```

(Already done in this session!)

---

**Enjoy creating DAAD adventures!** 🎮✨
