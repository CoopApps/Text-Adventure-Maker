# Scripting Automation System - Complete Guide

## Overview

The **Scripting Automation System** is a comprehensive automation module for the DAAD Adventure Creator that provides powerful tools for creating, managing, and executing macros and scripts. This system dramatically improves development productivity through advanced automation features.

**Module File**: `js/modules/module-scripting-automation.js`
**Category**: Development Tools
**Complexity**: Advanced

---

## Key Features

### 🎬 Macro Builder
- **Record macros** - Capture your actions into reusable sequences
- **Edit macros** - Modify macro steps and parameters
- **Organize macros** - Categorize with labels and descriptions
- **Hotkey support** - Assign keyboard shortcuts for quick access
- **Duplicate macros** - Clone existing macros for variations
- **Export/Import** - Share macros between projects

### 📝 Script Editor
- **Advanced code editing** - Full-featured DAAD script editor
- **Syntax validation** - Check scripts for errors before running
- **Code formatting** - Auto-format DAAD code with proper indentation
- **Line numbers** - Optional line numbering for easy reference
- **Auto-save** - Automatically save changes as you work
- **Script library** - Organize and manage multiple scripts

### ⚙️ Parameter Configuration
- **Parameter templates** - Reusable parameter sets
- **Type validation** - String, Number, Flag, Location, Object, Boolean, Array
- **Default values** - Pre-configured parameter defaults
- **Required/Optional** - Mark parameters as mandatory or optional
- **Template library** - Built-in templates for common operations

### 📦 Batch Operations
- **Batch queue** - Queue multiple scripts and macros
- **Sequential execution** - Run operations in order
- **Progress tracking** - Monitor batch execution status
- **Error handling** - Track which operations succeed or fail
- **Batch results** - View detailed execution results
- **Quick add** - Add all macros or scripts with one click

### 💾 Export/Import System
- **Multiple formats** - JSON, DAAD source code, plain text
- **Selective export** - Export macros, scripts, or templates individually
- **Import modes** - Merge, replace, or append data
- **Backup/Restore** - Quick backup and restore functionality
- **Data summary** - View statistics before export/import

---

## Getting Started

### 1. Load the Module

The Scripting Automation System loads automatically when included in your DAAD Adventure Creator project. It registers itself as `AdventureCreator.modules['scripting-automation']`.

```html
<!-- Include in your HTML -->
<script src="js/modules/module-scripting-automation.js"></script>
```

### 2. Access the Module

Navigate to the Scripting Automation section in your Adventure Creator interface. You'll see five main tabs:

1. **🎬 Macro Builder** - Record and manage macros
2. **📝 Script Editor** - Create and edit scripts
3. **⚙️ Parameter Config** - Manage parameter templates
4. **📦 Batch Operations** - Execute multiple operations
5. **💾 Export/Import** - Data management

---

## Macro Builder Guide

### What Are Macros?

Macros are sequences of actions that can be recorded, saved, and replayed. They're perfect for:
- Repetitive development tasks
- Testing game scenarios
- Quick debugging operations
- Automated game state setup

### Recording a Macro

1. Click **⏺️ Start Recording**
2. Perform your actions (they're captured automatically)
3. Click **⏹️ Stop Recording**
4. Name and save your macro

### Sample Macros Included

The system includes three sample macros to get you started:

#### Quick Save
- **Purpose**: Quickly save game state
- **Hotkey**: Ctrl+S
- **Steps**: 1
- **Category**: Utility

#### Debug Mode Toggle
- **Purpose**: Toggle debug flags
- **Hotkey**: Ctrl+D
- **Steps**: 2
- **Category**: Debug

#### Teleport to Location
- **Purpose**: Move player to specific location
- **Hotkey**: Ctrl+T
- **Steps**: 2
- **Category**: Navigation

### Macro Actions

Each macro card displays:
- **Name** and **Category**
- **Number of steps**
- **Assigned hotkey** (if any)
- **Step preview** (first 3 steps shown)
- **Action buttons**: Run, Edit, Duplicate, Delete

---

## Script Editor Guide

### Creating a Script

1. Click **➕ New Script**
2. Enter script name and description
3. Write your DAAD code in the editor
4. Click **💾 Save Script**

### Editor Features

#### Line Numbers
Toggle on/off for easy reference to specific lines of code.

#### Auto-Save
Automatically saves changes as you type (can be toggled).

#### Syntax Validation
Click **✅ Validate Syntax** to check your code for errors before running.

#### Code Formatting
Click **🎨 Format Code** to auto-indent your DAAD code properly.

### Script Example

```daad
; Sample DAAD code
AT 0
THEN
  MESSAGE "Welcome to the adventure!"
  DESC
DONE

CARRIED torch
AT dark_cave
THEN
  MESSAGE "The torch lights the way."
  SET has_light 1
DONE
```

### Script Metadata

Each script tracks:
- **Name** and **Description**
- **Creation date**
- **Last modified date**
- **Last run date**
- **Line count**

---

## Parameter Configuration Guide

### What Are Parameter Templates?

Parameter templates are reusable configurations that standardize how parameters are used across your scripts and macros. They ensure consistency and reduce errors.

### Built-In Templates

#### 1. Basic Movement
- **Parameters**: direction (String), location (Location)
- **Use**: Movement actions

#### 2. Object Manipulation
- **Parameters**: objectId (Object), action (String), newLocation (Location)
- **Use**: Object handling (GET, DROP, etc.)

#### 3. Flag Operation
- **Parameters**: flagNum (Flag), operation (String), value (Number)
- **Use**: Flag manipulation (SET, LET, etc.)

#### 4. Conditional Check
- **Parameters**: condition (String), target (Number), expected (Number)
- **Use**: Condition evaluation (AT, CARRIED, etc.)

### Parameter Types

- **String** - Text values
- **Number** - Numeric values (0-255)
- **Flag** - Flag numbers (0-255)
- **Location** - Location IDs
- **Object** - Object IDs
- **Boolean** - True/False values
- **Array** - Lists of values

### Creating Custom Templates

1. Click **➕ New Template**
2. Enter template name and description
3. Add parameters with types and defaults
4. Mark parameters as required or optional
5. Save the template

---

## Batch Operations Guide

### What Are Batch Operations?

Batch operations allow you to queue multiple scripts and macros for sequential execution. Perfect for:
- Running test suites
- Executing setup sequences
- Processing multiple operations
- Automated workflows

### Adding to the Queue

**Manual Add**:
1. Click **➕ Add to Queue**
2. Select Macro (1) or Script (2)
3. Choose the item to add

**Quick Add**:
- **🎬 Add All Macros** - Add every macro to the queue
- **📝 Add All Scripts** - Add every script to the queue

### Running Batch Operations

1. Build your queue with scripts and macros
2. Click **▶️ Run Batch**
3. Monitor progress in real-time
4. Review results when complete

### Queue Item States

- **⏳ Pending** - Waiting to execute
- **⚙️ Running** - Currently executing
- **✅ Done** - Completed successfully
- **❌ Error** - Failed to execute

### Batch Results

After execution, view detailed results:
- **Success/Failure status**
- **Execution message**
- **Duration** (in milliseconds)

---

## Export/Import Guide

### Export Formats

#### JSON (Recommended)
- Complete data preservation
- Easy to edit and version control
- Supports all features

#### DAAD Source Code
- Exports as DAAD .sce format
- Ready to compile
- Good for sharing code snippets

#### Plain Text
- Human-readable format
- Simple documentation
- No metadata preserved

### Export Options

#### Export Everything
Exports all macros, scripts, templates, and statistics in one file.

#### Export Macros Only
Creates a file containing only your macros.

#### Export Scripts Only
Creates a file containing only your scripts.

#### Export Templates Only
Creates a file containing only your parameter templates.

### Import Modes

#### Merge with Existing
- Combines imported data with current data
- Skips duplicates (by ID)
- Safest option

#### Replace All
- **⚠️ Warning**: Deletes all current data
- Replaces with imported data
- Use with caution

#### Append Only
- Adds all imported items
- Doesn't check for duplicates
- May create duplicate entries

### Import Sources

#### From File
1. Click **📥 Import from File**
2. Select a .json file
3. Choose import mode
4. Confirm import

#### From Clipboard
1. Copy JSON data to clipboard
2. Click **📋 Import from Clipboard**
3. Data is automatically processed

#### Sample Data
Click **📚 Load Sample Data** to import example macros and scripts.

### Backup and Restore

#### Create Backup
Click **💾 Create Backup** to export everything with a timestamp.

#### Restore Backup
Click **📥 Restore Backup** to import from a backup file.

#### Reset All Data
**⚠️ DANGER**: Click **🗑️ Reset All Data** to delete everything. This action requires double confirmation.

---

## Data Summary Dashboard

The Export/Import tab includes a statistics dashboard:

- **Macros** - Total number of macros
- **Scripts** - Total number of scripts
- **Templates** - Total number of parameter templates
- **Executions** - Total number of times scripts/macros have run

---

## Integration with DAAD

### Using Macros in Game Development

Macros can automate common development patterns:

```javascript
// Example: Teleport macro for testing
{
  name: "Test Location 5",
  steps: [
    { action: "GOTO", parameters: { location: 5 } },
    { action: "DESC", parameters: {} }
  ]
}
```

### Script Integration

Scripts can generate DAAD code that integrates directly:

```daad
; Generated from Script: "Lighting System"
CARRIED torch
LT light_level 1
THEN
  SET light_level 100
  MESSAGE "You light the torch."
DONE
```

---

## Best Practices

### Macro Organization

1. **Use descriptive names** - "Toggle Debug Mode" not "Macro 1"
2. **Assign categories** - Group related macros (Debug, Testing, Setup)
3. **Add descriptions** - Explain what the macro does
4. **Set hotkeys carefully** - Avoid conflicts with system shortcuts

### Script Management

1. **Keep scripts focused** - One script, one purpose
2. **Add comments** - Explain complex logic
3. **Test before saving** - Use validate and test features
4. **Version your scripts** - Export regularly for backups

### Parameter Templates

1. **Create templates for patterns** - If you use it twice, template it
2. **Use descriptive parameter names** - "targetLocation" not "loc"
3. **Set sensible defaults** - Common values save time
4. **Mark required parameters** - Prevent errors

### Batch Operations

1. **Test individually first** - Ensure each operation works alone
2. **Order matters** - Dependencies should run before dependents
3. **Monitor execution** - Watch for errors during batch runs
4. **Keep queue manageable** - Large queues are hard to debug

---

## Keyboard Shortcuts

Default hotkeys for sample macros:

- **Ctrl+S** - Quick Save macro
- **Ctrl+D** - Debug Mode Toggle
- **Ctrl+T** - Teleport to Location

*Note: Hotkeys are customizable when editing macros*

---

## Statistics and Monitoring

The system tracks:

- **Total Macros** - Number of saved macros
- **Total Scripts** - Number of saved scripts
- **Total Executions** - Lifetime execution count
- **Last Execution** - Timestamp of most recent run

Statistics appear in the header of the Scripting Automation module.

---

## Troubleshooting

### Macros Not Recording
- Ensure recording is active (red indicator visible)
- Check that actions are supported for recording
- Verify AdventureCreator is loaded

### Scripts Won't Validate
- Check DAAD syntax (THEN must follow conditions)
- Ensure proper DONE statements
- Look for typos in condact names

### Import Failing
- Verify JSON format is valid
- Check file encoding (should be UTF-8)
- Ensure version compatibility

### Batch Operations Stuck
- Check for infinite loops in scripts
- Verify all required parameters are set
- Look for errors in batch results

---

## Advanced Features

### Custom Macro Recording

To integrate custom actions into macro recording:

```javascript
// Add step to active recording
AdventureCreator.modules['scripting-automation'].addRecordingStep(
  'CUSTOM_ACTION',
  { param1: 'value1' },
  'Description of action'
);
```

### Programmatic Script Execution

Execute scripts programmatically:

```javascript
// Execute by script ID
AdventureCreator.modules['scripting-automation'].executeScript('script_id');

// Execute by macro ID
AdventureCreator.modules['scripting-automation'].executeMacro('macro_id');
```

### Access State Data

```javascript
// Get scripting state
const state = AdventureCreator.state.scripting;

// Access macros
const macros = state.macros;

// Access scripts
const scripts = state.scripts;

// Access templates
const templates = state.parameterTemplates;
```

---

## API Reference

### Core Functions

#### Macro Functions
- `startRecording()` - Begin macro recording
- `stopRecording()` - End recording and save
- `executeMacro(macroId)` - Run a macro
- `editMacro(macroId)` - Open macro editor
- `duplicateMacro(macroId)` - Clone a macro
- `deleteMacro(macroId)` - Remove a macro

#### Script Functions
- `showNewScriptDialog()` - Create new script
- `openScriptInEditor(scriptId)` - Edit script
- `executeScript(scriptId)` - Run script
- `validateScript()` - Check syntax
- `formatScript()` - Auto-format code
- `duplicateScript(scriptId)` - Clone script
- `deleteScript(scriptId)` - Remove script

#### Template Functions
- `showNewParameterTemplateDialog()` - Create template
- `editTemplate(templateId)` - Edit template
- `deleteTemplate(templateId)` - Remove template
- `useTemplate(templateId)` - Apply template

#### Batch Functions
- `addToBatchQueue()` - Add item to queue
- `startBatch()` - Begin batch execution
- `stopBatch()` - Halt batch execution
- `clearBatchQueue()` - Empty queue
- `addAllMacrosToQueue()` - Queue all macros
- `addAllScriptsToQueue()` - Queue all scripts

#### Export/Import Functions
- `exportAll()` - Export everything
- `exportMacros()` - Export macros only
- `exportScripts()` - Export scripts only
- `exportTemplates()` - Export templates only
- `importFromFile()` - Import from file
- `importFromClipboard()` - Import from clipboard
- `backupAll()` - Create backup
- `resetAll()` - Delete all data

---

## File Format

### Export JSON Structure

```json
{
  "version": "1.0",
  "exported": "2025-12-21T00:00:00.000Z",
  "macros": [
    {
      "id": "id_xxx",
      "name": "Macro Name",
      "description": "Description",
      "steps": [
        {
          "action": "ACTION_NAME",
          "parameters": {},
          "description": "Step description"
        }
      ],
      "category": "Category",
      "hotkey": "Ctrl+Key",
      "created": "2025-12-21T00:00:00.000Z"
    }
  ],
  "scripts": [
    {
      "id": "id_xxx",
      "name": "Script Name",
      "description": "Description",
      "code": "; DAAD code here",
      "created": "2025-12-21T00:00:00.000Z",
      "lastModified": "2025-12-21T00:00:00.000Z"
    }
  ],
  "parameterTemplates": [
    {
      "id": "id_xxx",
      "name": "Template Name",
      "description": "Description",
      "parameters": [
        {
          "name": "paramName",
          "type": "String",
          "required": true,
          "default": "value"
        }
      ]
    }
  ],
  "stats": {
    "totalMacros": 0,
    "totalScripts": 0,
    "totalExecutions": 0,
    "lastExecutionTime": null
  }
}
```

---

## Future Enhancements

Potential features for future versions:

- **Macro Variables** - Dynamic values in macros
- **Conditional Macros** - If/then logic in macros
- **Script Debugging** - Step-through debugging
- **Syntax Highlighting** - Color-coded DAAD code
- **Code Completion** - Auto-complete condacts
- **Macro Marketplace** - Share macros with community
- **Version Control** - Git integration
- **Collaborative Editing** - Multi-user support

---

## Support and Feedback

For issues, questions, or feature requests:

1. Check this documentation first
2. Review the troubleshooting section
3. Examine sample macros and scripts
4. Check the DAAD documentation for syntax

---

## Credits

**Module**: Scripting Automation System
**Version**: 1.0
**Category**: Development Tools
**Complexity**: Advanced
**Created**: December 2025

Part of the DAAD Adventure Creator comprehensive module system.

---

## Summary

The Scripting Automation System provides professional-grade automation tools for DAAD game development:

✅ **Macro Builder** - Record and replay action sequences
✅ **Script Editor** - Advanced code editing with validation
✅ **Parameter Config** - Reusable parameter templates
✅ **Batch Operations** - Queue and execute multiple operations
✅ **Export/Import** - Complete data management

With over 2000 lines of code, this module represents a complete automation solution for modern DAAD development workflows.

**Start automating your adventure game development today!** 🎮⚡
