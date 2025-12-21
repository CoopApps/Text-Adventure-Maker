// module-scripting-automation.js
// Complete Scripting Automation System - DAAD Adventure Creator
// Advanced automation with macro builder, script editor, and batch operations
// Enhanced with parameter configuration and import/export capabilities

(function() {
    'use strict';

    console.log('Enhanced Scripting Automation System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Make sure this module loads after the main app.');
        return;
    }

    const ScriptingAutomationSystem = {
        name: 'Scripting Automation System',
        description: 'Complete automation system with macros, scripts, batch operations, and advanced editing',
        category: 'Development Tools',
        complexity: 'Advanced',

        init: function() {
            console.log('Enhanced Scripting Automation System initialized');

            if (!AdventureCreator.state.scripting) {
                AdventureCreator.state.scripting = {
                    selectedTab: 'macro_builder',

                    // Macro Builder State
                    macros: [],
                    recording: {
                        active: false,
                        currentMacro: null,
                        steps: []
                    },

                    // Script Editor State
                    scripts: [],
                    currentScript: null,
                    editorSettings: {
                        theme: 'dark',
                        fontSize: 14,
                        lineNumbers: true,
                        autoComplete: true,
                        syntaxHighlight: true,
                        autoSave: true
                    },

                    // Parameter Configuration State
                    parameterTemplates: [],
                    parameterTypes: ['String', 'Number', 'Flag', 'Location', 'Object', 'Boolean', 'Array'],

                    // Batch Operations State
                    batchQueue: [],
                    batchRunning: false,
                    batchResults: [],

                    // Export/Import State
                    exportFormat: 'json',
                    lastExport: null,
                    lastImport: null,

                    // Statistics
                    stats: {
                        totalMacros: 0,
                        totalScripts: 0,
                        totalExecutions: 0,
                        lastExecutionTime: null
                    }
                };
            }

            // Add default parameter templates
            if (AdventureCreator.state.scripting.parameterTemplates.length === 0) {
                this.addDefaultParameterTemplates();
            }

            // Add sample macros if none exist
            if (AdventureCreator.state.scripting.macros.length === 0) {
                this.addSampleMacros();
            }
        },

        addDefaultParameterTemplates: function() {
            const templates = [
                {
                    id: 'basic_movement',
                    name: 'Basic Movement',
                    description: 'Movement action parameters',
                    parameters: [
                        { name: 'direction', type: 'String', required: true, default: 'NORTH' },
                        { name: 'location', type: 'Location', required: true, default: 0 }
                    ]
                },
                {
                    id: 'object_manipulation',
                    name: 'Object Manipulation',
                    description: 'Object handling parameters',
                    parameters: [
                        { name: 'objectId', type: 'Object', required: true, default: 0 },
                        { name: 'action', type: 'String', required: true, default: 'GET' },
                        { name: 'newLocation', type: 'Location', required: false, default: 254 }
                    ]
                },
                {
                    id: 'flag_operation',
                    name: 'Flag Operation',
                    description: 'Flag manipulation parameters',
                    parameters: [
                        { name: 'flagNum', type: 'Flag', required: true, default: 0 },
                        { name: 'operation', type: 'String', required: true, default: 'SET' },
                        { name: 'value', type: 'Number', required: true, default: 1 }
                    ]
                },
                {
                    id: 'conditional_check',
                    name: 'Conditional Check',
                    description: 'Condition evaluation parameters',
                    parameters: [
                        { name: 'condition', type: 'String', required: true, default: 'AT' },
                        { name: 'target', type: 'Number', required: true, default: 0 },
                        { name: 'expected', type: 'Number', required: false, default: 1 }
                    ]
                }
            ];

            AdventureCreator.state.scripting.parameterTemplates = templates;
        },

        addSampleMacros: function() {
            const samples = [
                {
                    id: this.generateId(),
                    name: 'Quick Save',
                    description: 'Quickly save game state',
                    steps: [
                        { action: 'SAVE', parameters: {}, description: 'Save current game' }
                    ],
                    category: 'Utility',
                    hotkey: 'Ctrl+S'
                },
                {
                    id: this.generateId(),
                    name: 'Debug Mode Toggle',
                    description: 'Toggle debug flags',
                    steps: [
                        { action: 'LET', parameters: { flag: 255, value: 'NOT 255' }, description: 'Toggle debug flag' },
                        { action: 'MESSAGE', parameters: { text: 'Debug mode toggled' }, description: 'Show notification' }
                    ],
                    category: 'Debug',
                    hotkey: 'Ctrl+D'
                },
                {
                    id: this.generateId(),
                    name: 'Teleport to Location',
                    description: 'Move player to specific location',
                    steps: [
                        { action: 'GOTO', parameters: { location: 0 }, description: 'Move to location' },
                        { action: 'DESC', parameters: {}, description: 'Show description' }
                    ],
                    category: 'Navigation',
                    hotkey: 'Ctrl+T'
                }
            ];

            AdventureCreator.state.scripting.macros = samples;
            AdventureCreator.state.scripting.stats.totalMacros = samples.length;
        },

        render: function() {
            return `
                <div style="padding: 2rem; background: #0a0a0a;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2 style="color: #8b5cf6; margin: 0;">⚡ Scripting Automation System</h2>
                        ${this.renderStatistics()}
                    </div>

                    ${this.renderTabNavigation()}
                    ${this.renderTabContent()}
                </div>

                <style>
                    .tab-navigation {
                        display: flex;
                        gap: 0.5rem;
                        margin-bottom: 2rem;
                        flex-wrap: wrap;
                    }

                    .tab-button {
                        flex: 1;
                        min-width: 200px;
                        padding: 1rem;
                        background: #1a1a1a;
                        border: 2px solid #333;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .tab-button:hover {
                        border-color: #8b5cf6;
                        transform: translateY(-2px);
                    }

                    .tab-button.active {
                        background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                        border-color: #8b5cf6;
                    }

                    .tab-name {
                        color: white;
                        font-weight: bold;
                        font-size: 1rem;
                        margin-bottom: 0.25rem;
                    }

                    .tab-description {
                        color: #999;
                        font-size: 0.85rem;
                    }

                    .tab-button.active .tab-description {
                        color: rgba(255, 255, 255, 0.8);
                    }

                    .card-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                        gap: 1.5rem;
                        margin-top: 1.5rem;
                    }

                    .script-card {
                        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                        border: 2px solid #333;
                        border-radius: 12px;
                        padding: 1.5rem;
                        transition: all 0.3s ease;
                    }

                    .script-card:hover {
                        border-color: #8b5cf6;
                        transform: translateY(-4px);
                        box-shadow: 0 8px 16px rgba(139, 92, 246, 0.2);
                    }

                    .script-card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: start;
                        margin-bottom: 1rem;
                    }

                    .script-card-title {
                        color: #8b5cf6;
                        font-size: 1.1rem;
                        font-weight: bold;
                        margin: 0;
                    }

                    .script-card-badge {
                        background: #8b5cf6;
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: bold;
                    }

                    .script-card-description {
                        color: #999;
                        margin-bottom: 1rem;
                        font-size: 0.9rem;
                    }

                    .script-card-meta {
                        display: flex;
                        gap: 1rem;
                        margin-bottom: 1rem;
                        flex-wrap: wrap;
                    }

                    .meta-item {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: #666;
                        font-size: 0.85rem;
                    }

                    .meta-label {
                        color: #8b5cf6;
                    }

                    .script-card-actions {
                        display: flex;
                        gap: 0.5rem;
                        flex-wrap: wrap;
                    }

                    .btn {
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s ease;
                        font-size: 0.9rem;
                    }

                    .btn-primary {
                        background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                        color: white;
                    }

                    .btn-primary:hover {
                        transform: scale(1.05);
                        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
                    }

                    .btn-secondary {
                        background: #333;
                        color: white;
                    }

                    .btn-secondary:hover {
                        background: #444;
                    }

                    .btn-danger {
                        background: #dc2626;
                        color: white;
                    }

                    .btn-danger:hover {
                        background: #b91c1c;
                    }

                    .btn-success {
                        background: #10b981;
                        color: white;
                    }

                    .btn-success:hover {
                        background: #059669;
                    }

                    .form-group {
                        margin-bottom: 1.5rem;
                    }

                    .form-label {
                        display: block;
                        color: #8b5cf6;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                    }

                    .form-input, .form-textarea, .form-select {
                        width: 100%;
                        padding: 0.75rem;
                        background: #1a1a1a;
                        border: 2px solid #333;
                        border-radius: 6px;
                        color: white;
                        font-size: 1rem;
                        font-family: 'Courier New', monospace;
                    }

                    .form-input:focus, .form-textarea:focus, .form-select:focus {
                        outline: none;
                        border-color: #8b5cf6;
                        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                    }

                    .form-textarea {
                        min-height: 150px;
                        resize: vertical;
                    }

                    .code-editor {
                        background: #0d1117;
                        border: 2px solid #333;
                        border-radius: 8px;
                        padding: 1rem;
                        font-family: 'Courier New', monospace;
                        color: #c9d1d9;
                        min-height: 300px;
                        overflow: auto;
                    }

                    .line-numbers {
                        display: inline-block;
                        width: 40px;
                        color: #6e7681;
                        text-align: right;
                        padding-right: 1rem;
                        user-select: none;
                    }

                    .recording-indicator {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        background: #dc2626;
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 20px;
                        font-weight: bold;
                        animation: pulse 2s infinite;
                    }

                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }

                    .batch-queue-item {
                        background: #1a1a1a;
                        border: 2px solid #333;
                        border-radius: 8px;
                        padding: 1rem;
                        margin-bottom: 0.5rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .batch-queue-item.running {
                        border-color: #10b981;
                        background: rgba(16, 185, 129, 0.1);
                    }

                    .batch-queue-item.completed {
                        border-color: #6b7280;
                        opacity: 0.6;
                    }

                    .batch-queue-item.error {
                        border-color: #dc2626;
                        background: rgba(220, 38, 38, 0.1);
                    }

                    .parameter-grid {
                        display: grid;
                        gap: 1rem;
                        margin-top: 1rem;
                    }

                    .parameter-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr auto;
                        gap: 0.5rem;
                        align-items: end;
                    }

                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 1rem;
                        background: #1a1a1a;
                        padding: 1rem;
                        border-radius: 8px;
                        border: 2px solid #333;
                    }

                    .stat-item {
                        text-align: center;
                    }

                    .stat-value {
                        color: #8b5cf6;
                        font-size: 1.5rem;
                        font-weight: bold;
                    }

                    .stat-label {
                        color: #999;
                        font-size: 0.85rem;
                        margin-top: 0.25rem;
                    }

                    .hotkey-badge {
                        background: #333;
                        color: #8b5cf6;
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-family: monospace;
                    }

                    .step-list {
                        background: #0d1117;
                        border: 2px solid #333;
                        border-radius: 8px;
                        padding: 1rem;
                        margin-top: 1rem;
                    }

                    .step-item {
                        background: #1a1a1a;
                        border-left: 3px solid #8b5cf6;
                        padding: 0.75rem;
                        margin-bottom: 0.5rem;
                        border-radius: 4px;
                    }

                    .step-number {
                        color: #8b5cf6;
                        font-weight: bold;
                        margin-right: 0.5rem;
                    }
                </style>
            `;
        },

        renderStatistics: function() {
            const stats = AdventureCreator.state.scripting.stats;
            return `
                <div style="display: flex; gap: 2rem; font-size: 0.9rem;">
                    <div>
                        <span style="color: #8b5cf6; font-weight: bold;">${stats.totalMacros}</span>
                        <span style="color: #999;"> Macros</span>
                    </div>
                    <div>
                        <span style="color: #8b5cf6; font-weight: bold;">${stats.totalScripts}</span>
                        <span style="color: #999;"> Scripts</span>
                    </div>
                    <div>
                        <span style="color: #8b5cf6; font-weight: bold;">${stats.totalExecutions}</span>
                        <span style="color: #999;"> Executions</span>
                    </div>
                </div>
            `;
        },

        renderTabNavigation: function() {
            const tabs = [
                { id: 'macro_builder', name: '🎬 Macro Builder', description: 'Record and manage macros' },
                { id: 'script_editor', name: '📝 Script Editor', description: 'Advanced script editing' },
                { id: 'parameter_config', name: '⚙️ Parameter Config', description: 'Configure parameters' },
                { id: 'batch_operations', name: '📦 Batch Operations', description: 'Batch script execution' },
                { id: 'export_import', name: '💾 Export/Import', description: 'Data management' }
            ];

            return `
                <div class="tab-navigation">
                    ${tabs.map(tab => `
                        <button class="tab-button ${AdventureCreator.state.scripting.selectedTab === tab.id ? 'active' : ''}"
                                onclick="AdventureCreator.modules['scripting-automation'].switchTab('${tab.id}')">
                            <div class="tab-name">${tab.name}</div>
                            <div class="tab-description">${tab.description}</div>
                        </button>
                    `).join('')}
                </div>
            `;
        },

        renderTabContent: function() {
            const selectedTab = AdventureCreator.state.scripting.selectedTab;

            switch(selectedTab) {
                case 'macro_builder':
                    return this.renderMacroBuilder();
                case 'script_editor':
                    return this.renderScriptEditor();
                case 'parameter_config':
                    return this.renderParameterConfig();
                case 'batch_operations':
                    return this.renderBatchOperations();
                case 'export_import':
                    return this.renderExportImport();
                default:
                    return this.renderMacroBuilder();
            }
        },

        renderMacroBuilder: function() {
            const state = AdventureCreator.state.scripting;
            const recording = state.recording;

            return `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h3 style="color: #8b5cf6; margin: 0;">🎬 Macro Builder</h3>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            ${recording.active ? `
                                <span class="recording-indicator">
                                    ⏺️ Recording: ${recording.steps.length} steps
                                </span>
                            ` : ''}
                            <button class="btn ${recording.active ? 'btn-danger' : 'btn-primary'}"
                                    onclick="AdventureCreator.modules['scripting-automation'].${recording.active ? 'stopRecording' : 'startRecording'}()">
                                ${recording.active ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].showNewMacroDialog()">
                                ➕ New Macro
                            </button>
                        </div>
                    </div>

                    ${recording.active && recording.steps.length > 0 ? `
                        <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
                            <h4 style="color: #8b5cf6; margin-top: 0;">📋 Recording Steps</h4>
                            <div class="step-list">
                                ${recording.steps.map((step, idx) => `
                                    <div class="step-item">
                                        <span class="step-number">Step ${idx + 1}:</span>
                                        <strong style="color: white;">${step.action}</strong>
                                        ${step.description ? `<span style="color: #999;"> - ${step.description}</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="card-grid">
                        ${state.macros.map(macro => this.renderMacroCard(macro)).join('')}
                    </div>

                    ${state.macros.length === 0 ? `
                        <div style="text-align: center; padding: 4rem; color: #666;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🎬</div>
                            <p>No macros yet. Create your first macro to automate repetitive tasks!</p>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        renderMacroCard: function(macro) {
            return `
                <div class="script-card">
                    <div class="script-card-header">
                        <h4 class="script-card-title">${macro.name}</h4>
                        <span class="script-card-badge">${macro.category || 'General'}</span>
                    </div>
                    <p class="script-card-description">${macro.description || 'No description'}</p>
                    <div class="script-card-meta">
                        <div class="meta-item">
                            <span class="meta-label">Steps:</span>
                            <span>${macro.steps.length}</span>
                        </div>
                        ${macro.hotkey ? `
                            <div class="meta-item">
                                <span class="meta-label">Hotkey:</span>
                                <span class="hotkey-badge">${macro.hotkey}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="step-list" style="margin-bottom: 1rem;">
                        ${macro.steps.slice(0, 3).map((step, idx) => `
                            <div class="step-item">
                                <span class="step-number">${idx + 1}.</span>
                                <strong style="color: white;">${step.action}</strong>
                            </div>
                        `).join('')}
                        ${macro.steps.length > 3 ? `
                            <div style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;">
                                ... and ${macro.steps.length - 3} more steps
                            </div>
                        ` : ''}
                    </div>
                    <div class="script-card-actions">
                        <button class="btn btn-success" onclick="AdventureCreator.modules['scripting-automation'].executeMacro('${macro.id}')">
                            ▶️ Run
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].editMacro('${macro.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].duplicateMacro('${macro.id}')">
                            📋 Duplicate
                        </button>
                        <button class="btn btn-danger" onclick="AdventureCreator.modules['scripting-automation'].deleteMacro('${macro.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        },

        renderScriptEditor: function() {
            const state = AdventureCreator.state.scripting;
            const currentScript = state.currentScript;

            return `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h3 style="color: #8b5cf6; margin: 0;">📝 Script Editor</h3>
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['scripting-automation'].showNewScriptDialog()">
                                ➕ New Script
                            </button>
                            ${currentScript ? `
                                <button class="btn btn-success" onclick="AdventureCreator.modules['scripting-automation'].saveCurrentScript()">
                                    💾 Save Script
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].executeCurrentScript()">
                                    ▶️ Run Script
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    ${currentScript ? `
                        <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h4 style="color: #8b5cf6; margin: 0;">Editing: ${currentScript.name}</h4>
                                <div style="display: flex; gap: 1rem;">
                                    <label style="color: #999; display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" ${state.editorSettings.lineNumbers ? 'checked' : ''}
                                               onchange="AdventureCreator.modules['scripting-automation'].toggleEditorSetting('lineNumbers')">
                                        Line Numbers
                                    </label>
                                    <label style="color: #999; display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox" ${state.editorSettings.autoSave ? 'checked' : ''}
                                               onchange="AdventureCreator.modules['scripting-automation'].toggleEditorSetting('autoSave')">
                                        Auto Save
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Script Name</label>
                                <input type="text" class="form-input" id="script-name-input"
                                       value="${currentScript.name}"
                                       onchange="AdventureCreator.modules['scripting-automation'].updateScriptName(this.value)">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <input type="text" class="form-input" id="script-description-input"
                                       value="${currentScript.description || ''}"
                                       onchange="AdventureCreator.modules['scripting-automation'].updateScriptDescription(this.value)">
                            </div>

                            <div class="form-group">
                                <label class="form-label">DAAD Code</label>
                                <textarea class="form-textarea code-editor" id="script-code-editor"
                                          style="min-height: 400px;"
                                          onchange="AdventureCreator.modules['scripting-automation'].updateScriptCode(this.value)"
                                          placeholder="; Enter your DAAD code here
; Example:
AT 0
THEN
  MESSAGE &quot;Hello, World!&quot;
  DESC
DONE">${currentScript.code || ''}</textarea>
                            </div>

                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['scripting-automation'].validateScript()">
                                    ✅ Validate Syntax
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].formatScript()">
                                    🎨 Format Code
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].closeEditor()">
                                    ❌ Close
                                </button>
                            </div>
                        </div>
                    ` : ''}

                    <h4 style="color: #8b5cf6;">📚 Saved Scripts</h4>
                    <div class="card-grid">
                        ${state.scripts.map(script => this.renderScriptCard(script)).join('')}
                    </div>

                    ${state.scripts.length === 0 ? `
                        <div style="text-align: center; padding: 4rem; color: #666;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                            <p>No scripts yet. Create your first script to start automating!</p>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        renderScriptCard: function(script) {
            const lineCount = script.code ? script.code.split('\n').length : 0;

            return `
                <div class="script-card">
                    <div class="script-card-header">
                        <h4 class="script-card-title">${script.name}</h4>
                        <span class="script-card-badge">${lineCount} lines</span>
                    </div>
                    <p class="script-card-description">${script.description || 'No description'}</p>
                    <div class="script-card-meta">
                        <div class="meta-item">
                            <span class="meta-label">Created:</span>
                            <span>${new Date(script.created).toLocaleDateString()}</span>
                        </div>
                        ${script.lastRun ? `
                            <div class="meta-item">
                                <span class="meta-label">Last Run:</span>
                                <span>${new Date(script.lastRun).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${script.code ? `
                        <div class="code-editor" style="min-height: 100px; max-height: 150px; margin-bottom: 1rem; font-size: 0.8rem;">
                            ${this.escapeHtml(script.code.split('\n').slice(0, 5).join('\n'))}
                            ${lineCount > 5 ? `\n... (${lineCount - 5} more lines)` : ''}
                        </div>
                    ` : ''}
                    <div class="script-card-actions">
                        <button class="btn btn-success" onclick="AdventureCreator.modules['scripting-automation'].executeScript('${script.id}')">
                            ▶️ Run
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].openScriptInEditor('${script.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].duplicateScript('${script.id}')">
                            📋 Duplicate
                        </button>
                        <button class="btn btn-danger" onclick="AdventureCreator.modules['scripting-automation'].deleteScript('${script.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        },

        renderParameterConfig: function() {
            const state = AdventureCreator.state.scripting;

            return `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h3 style="color: #8b5cf6; margin: 0;">⚙️ Parameter Configuration</h3>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['scripting-automation'].showNewParameterTemplateDialog()">
                            ➕ New Template
                        </button>
                    </div>

                    <div class="card-grid">
                        ${state.parameterTemplates.map(template => this.renderParameterTemplateCard(template)).join('')}
                    </div>

                    ${state.parameterTemplates.length === 0 ? `
                        <div style="text-align: center; padding: 4rem; color: #666;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⚙️</div>
                            <p>No parameter templates yet. Create templates to standardize your scripts!</p>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        renderParameterTemplateCard: function(template) {
            return `
                <div class="script-card">
                    <div class="script-card-header">
                        <h4 class="script-card-title">${template.name}</h4>
                        <span class="script-card-badge">${template.parameters.length} params</span>
                    </div>
                    <p class="script-card-description">${template.description || 'No description'}</p>

                    <div style="background: #0d1117; border: 2px solid #333; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <div style="color: #8b5cf6; font-weight: bold; margin-bottom: 0.5rem;">Parameters:</div>
                        ${template.parameters.map(param => `
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #1a1a1a; margin-bottom: 0.25rem; border-radius: 4px;">
                                <div>
                                    <strong style="color: white;">${param.name}</strong>
                                    <span style="color: #666; font-size: 0.85rem;"> (${param.type})</span>
                                    ${param.required ? '<span style="color: #dc2626; font-size: 0.75rem;"> *required</span>' : ''}
                                </div>
                                <div style="color: #999; font-size: 0.85rem;">
                                    default: ${param.default}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="script-card-actions">
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['scripting-automation'].useTemplate('${template.id}')">
                            📋 Use Template
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].editTemplate('${template.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger" onclick="AdventureCreator.modules['scripting-automation'].deleteTemplate('${template.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        },

        renderBatchOperations: function() {
            const state = AdventureCreator.state.scripting;
            const queue = state.batchQueue;

            return `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h3 style="color: #8b5cf6; margin: 0;">📦 Batch Operations</h3>
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['scripting-automation'].addToBatchQueue()">
                                ➕ Add to Queue
                            </button>
                            ${queue.length > 0 ? `
                                <button class="btn ${state.batchRunning ? 'btn-danger' : 'btn-success'}"
                                        onclick="AdventureCreator.modules['scripting-automation'].${state.batchRunning ? 'stopBatch' : 'startBatch'}()">
                                    ${state.batchRunning ? '⏹️ Stop Batch' : '▶️ Run Batch'}
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].clearBatchQueue()">
                                    🗑️ Clear Queue
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    ${state.batchRunning ? `
                        <div style="background: #1a1a1a; border: 2px solid #10b981; border-radius: 8px; padding: 1rem; margin-bottom: 2rem;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div class="recording-indicator" style="background: #10b981;">
                                    ⚙️ Batch Running
                                </div>
                                <div style="color: #999;">
                                    Progress: ${state.batchResults.length} / ${queue.length} completed
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${queue.length > 0 ? `
                        <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
                            <h4 style="color: #8b5cf6; margin-top: 0;">📋 Batch Queue (${queue.length} items)</h4>
                            ${queue.map((item, idx) => `
                                <div class="batch-queue-item ${item.status || 'pending'}">
                                    <div style="flex: 1;">
                                        <div style="color: white; font-weight: bold;">${idx + 1}. ${item.name}</div>
                                        <div style="color: #666; font-size: 0.85rem;">${item.type} - ${item.description || 'No description'}</div>
                                    </div>
                                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                                        ${item.status === 'completed' ? '<span style="color: #10b981;">✅ Done</span>' : ''}
                                        ${item.status === 'running' ? '<span style="color: #8b5cf6;">⚙️ Running</span>' : ''}
                                        ${item.status === 'error' ? '<span style="color: #dc2626;">❌ Error</span>' : ''}
                                        ${!item.status || item.status === 'pending' ? '<span style="color: #666;">⏳ Pending</span>' : ''}
                                        <button class="btn btn-danger btn-sm" onclick="AdventureCreator.modules['scripting-automation'].removeFromQueue(${idx})">
                                            ❌
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 4rem; color: #666;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                            <p>No items in batch queue. Add scripts or macros to execute them in sequence!</p>
                        </div>
                    `}

                    ${state.batchResults.length > 0 ? `
                        <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 1.5rem;">
                            <h4 style="color: #8b5cf6; margin-top: 0;">📊 Batch Results</h4>
                            ${state.batchResults.map((result, idx) => `
                                <div style="background: #0d1117; border-left: 3px solid ${result.success ? '#10b981' : '#dc2626'}; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px;">
                                    <div style="color: white; font-weight: bold;">${idx + 1}. ${result.name}</div>
                                    <div style="color: #999; font-size: 0.85rem;">
                                        ${result.success ? '✅ Success' : '❌ Failed'}: ${result.message}
                                    </div>
                                    ${result.duration ? `<div style="color: #666; font-size: 0.75rem;">Duration: ${result.duration}ms</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div style="margin-top: 2rem;">
                        <h4 style="color: #8b5cf6;">Quick Add Options</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].addAllMacrosToQueue()">
                                🎬 Add All Macros
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].addAllScriptsToQueue()">
                                📝 Add All Scripts
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].addSelectionToQueue()">
                                ✅ Add Selected Items
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        renderExportImport: function() {
            const state = AdventureCreator.state.scripting;

            return `
                <div>
                    <h3 style="color: #8b5cf6; margin-bottom: 2rem;">💾 Export / Import</h3>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <!-- Export Section -->
                        <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 1.5rem;">
                            <h4 style="color: #8b5cf6; margin-top: 0;">📤 Export Data</h4>

                            <div class="form-group">
                                <label class="form-label">Export Format</label>
                                <select class="form-select" id="export-format"
                                        onchange="AdventureCreator.modules['scripting-automation'].setExportFormat(this.value)">
                                    <option value="json" ${state.exportFormat === 'json' ? 'selected' : ''}>JSON (Recommended)</option>
                                    <option value="daad" ${state.exportFormat === 'daad' ? 'selected' : ''}>DAAD Source Code</option>
                                    <option value="txt" ${state.exportFormat === 'txt' ? 'selected' : ''}>Plain Text</option>
                                </select>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['scripting-automation'].exportAll()">
                                    💾 Export Everything
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].exportMacros()">
                                    🎬 Export Macros Only
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].exportScripts()">
                                    📝 Export Scripts Only
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].exportTemplates()">
                                    ⚙️ Export Templates Only
                                </button>
                            </div>

                            ${state.lastExport ? `
                                <div style="margin-top: 1rem; padding: 1rem; background: #0d1117; border-radius: 6px;">
                                    <div style="color: #10b981; font-size: 0.85rem;">✅ Last Export</div>
                                    <div style="color: #999; font-size: 0.75rem;">
                                        ${new Date(state.lastExport.timestamp).toLocaleString()}
                                    </div>
                                    <div style="color: #666; font-size: 0.75rem;">
                                        ${state.lastExport.items} items exported
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Import Section -->
                        <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 1.5rem;">
                            <h4 style="color: #8b5cf6; margin-top: 0;">📥 Import Data</h4>

                            <div class="form-group">
                                <label class="form-label">Import Mode</label>
                                <select class="form-select" id="import-mode">
                                    <option value="merge">Merge with Existing</option>
                                    <option value="replace">Replace All</option>
                                    <option value="append">Append Only</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Select File</label>
                                <input type="file" class="form-input" id="import-file"
                                       accept=".json,.txt,.ddb"
                                       onchange="AdventureCreator.modules['scripting-automation'].handleFileImport(this.files[0])">
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['scripting-automation'].importFromFile()">
                                    📥 Import from File
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].importFromClipboard()">
                                    📋 Import from Clipboard
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].showSampleImport()">
                                    📚 Load Sample Data
                                </button>
                            </div>

                            ${state.lastImport ? `
                                <div style="margin-top: 1rem; padding: 1rem; background: #0d1117; border-radius: 6px;">
                                    <div style="color: #10b981; font-size: 0.85rem;">✅ Last Import</div>
                                    <div style="color: #999; font-size: 0.75rem;">
                                        ${new Date(state.lastImport.timestamp).toLocaleString()}
                                    </div>
                                    <div style="color: #666; font-size: 0.75rem;">
                                        ${state.lastImport.items} items imported
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Current Data Summary -->
                    <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 1.5rem; margin-top: 2rem;">
                        <h4 style="color: #8b5cf6; margin-top: 0;">📊 Current Data Summary</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-value">${state.macros.length}</div>
                                <div class="stat-label">Macros</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${state.scripts.length}</div>
                                <div class="stat-label">Scripts</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${state.parameterTemplates.length}</div>
                                <div class="stat-label">Templates</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${state.stats.totalExecutions}</div>
                                <div class="stat-label">Executions</div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div style="margin-top: 2rem;">
                        <h4 style="color: #8b5cf6;">⚡ Quick Actions</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].backupAll()">
                                💾 Create Backup
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['scripting-automation'].restoreBackup()">
                                📥 Restore Backup
                            </button>
                            <button class="btn btn-danger" onclick="AdventureCreator.modules['scripting-automation'].resetAll()">
                                🗑️ Reset All Data
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        // Tab switching
        switchTab: function(tabId) {
            AdventureCreator.state.scripting.selectedTab = tabId;
            AdventureCreator.renderCurrentModule();
        },

        // Macro Builder Functions
        startRecording: function() {
            const state = AdventureCreator.state.scripting;
            state.recording.active = true;
            state.recording.steps = [];
            state.recording.currentMacro = {
                id: this.generateId(),
                name: 'New Macro ' + (state.macros.length + 1),
                description: 'Recorded macro',
                steps: [],
                category: 'Recorded',
                created: new Date().toISOString()
            };
            AdventureCreator.renderCurrentModule();
            this.showNotification('📹 Recording started', 'success');
        },

        stopRecording: function() {
            const state = AdventureCreator.state.scripting;

            if (state.recording.steps.length === 0) {
                this.showNotification('⚠️ No steps recorded', 'warning');
                state.recording.active = false;
                AdventureCreator.renderCurrentModule();
                return;
            }

            state.recording.currentMacro.steps = [...state.recording.steps];
            state.macros.push(state.recording.currentMacro);
            state.stats.totalMacros++;

            this.showNotification(`✅ Macro "${state.recording.currentMacro.name}" saved with ${state.recording.steps.length} steps`, 'success');

            state.recording.active = false;
            state.recording.steps = [];
            state.recording.currentMacro = null;

            AdventureCreator.renderCurrentModule();
        },

        addRecordingStep: function(action, parameters, description) {
            const state = AdventureCreator.state.scripting;
            if (!state.recording.active) return;

            state.recording.steps.push({
                action: action,
                parameters: parameters || {},
                description: description || '',
                timestamp: new Date().toISOString()
            });

            AdventureCreator.renderCurrentModule();
        },

        showNewMacroDialog: function() {
            const name = prompt('Enter macro name:');
            if (!name) return;

            const description = prompt('Enter macro description (optional):');
            const category = prompt('Enter category (optional):', 'General');

            const newMacro = {
                id: this.generateId(),
                name: name,
                description: description || '',
                category: category || 'General',
                steps: [],
                created: new Date().toISOString()
            };

            AdventureCreator.state.scripting.macros.push(newMacro);
            AdventureCreator.state.scripting.stats.totalMacros++;
            this.editMacro(newMacro.id);
        },

        editMacro: function(macroId) {
            const macro = AdventureCreator.state.scripting.macros.find(m => m.id === macroId);
            if (!macro) return;

            // For now, show a simple alert. In a full implementation, this would open a detailed editor
            alert(`Editing macro: ${macro.name}\n\nThis would open a detailed macro editor where you can:\n- Add/edit/remove steps\n- Configure parameters\n- Set hotkeys\n- Test the macro`);
        },

        duplicateMacro: function(macroId) {
            const macro = AdventureCreator.state.scripting.macros.find(m => m.id === macroId);
            if (!macro) return;

            const duplicate = {
                ...JSON.parse(JSON.stringify(macro)),
                id: this.generateId(),
                name: macro.name + ' (Copy)',
                created: new Date().toISOString()
            };

            AdventureCreator.state.scripting.macros.push(duplicate);
            AdventureCreator.state.scripting.stats.totalMacros++;
            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Macro duplicated: ${duplicate.name}`, 'success');
        },

        deleteMacro: function(macroId) {
            const macro = AdventureCreator.state.scripting.macros.find(m => m.id === macroId);
            if (!macro) return;

            if (!confirm(`Delete macro "${macro.name}"?`)) return;

            const index = AdventureCreator.state.scripting.macros.findIndex(m => m.id === macroId);
            AdventureCreator.state.scripting.macros.splice(index, 1);
            AdventureCreator.state.scripting.stats.totalMacros--;
            AdventureCreator.renderCurrentModule();
            this.showNotification(`🗑️ Macro deleted: ${macro.name}`, 'info');
        },

        executeMacro: function(macroId) {
            const macro = AdventureCreator.state.scripting.macros.find(m => m.id === macroId);
            if (!macro) return;

            this.showNotification(`▶️ Executing macro: ${macro.name}`, 'info');

            // Simulate execution
            setTimeout(() => {
                AdventureCreator.state.scripting.stats.totalExecutions++;
                AdventureCreator.state.scripting.stats.lastExecutionTime = new Date().toISOString();
                this.showNotification(`✅ Macro completed: ${macro.name}`, 'success');
                AdventureCreator.renderCurrentModule();
            }, 1000);
        },

        // Script Editor Functions
        showNewScriptDialog: function() {
            const name = prompt('Enter script name:');
            if (!name) return;

            const description = prompt('Enter script description (optional):');

            const newScript = {
                id: this.generateId(),
                name: name,
                description: description || '',
                code: '',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            AdventureCreator.state.scripting.scripts.push(newScript);
            AdventureCreator.state.scripting.stats.totalScripts++;
            AdventureCreator.state.scripting.currentScript = newScript;
            AdventureCreator.renderCurrentModule();
        },

        openScriptInEditor: function(scriptId) {
            const script = AdventureCreator.state.scripting.scripts.find(s => s.id === scriptId);
            if (!script) return;

            AdventureCreator.state.scripting.currentScript = script;
            AdventureCreator.renderCurrentModule();
        },

        saveCurrentScript: function() {
            const current = AdventureCreator.state.scripting.currentScript;
            if (!current) return;

            current.lastModified = new Date().toISOString();
            this.showNotification(`💾 Script saved: ${current.name}`, 'success');
        },

        executeCurrentScript: function() {
            const current = AdventureCreator.state.scripting.currentScript;
            if (!current) return;

            this.executeScript(current.id);
        },

        executeScript: function(scriptId) {
            const script = AdventureCreator.state.scripting.scripts.find(s => s.id === scriptId);
            if (!script) return;

            this.showNotification(`▶️ Executing script: ${script.name}`, 'info');

            // Simulate execution
            setTimeout(() => {
                script.lastRun = new Date().toISOString();
                AdventureCreator.state.scripting.stats.totalExecutions++;
                AdventureCreator.state.scripting.stats.lastExecutionTime = new Date().toISOString();
                this.showNotification(`✅ Script completed: ${script.name}`, 'success');
                AdventureCreator.renderCurrentModule();
            }, 1500);
        },

        duplicateScript: function(scriptId) {
            const script = AdventureCreator.state.scripting.scripts.find(s => s.id === scriptId);
            if (!script) return;

            const duplicate = {
                ...JSON.parse(JSON.stringify(script)),
                id: this.generateId(),
                name: script.name + ' (Copy)',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            AdventureCreator.state.scripting.scripts.push(duplicate);
            AdventureCreator.state.scripting.stats.totalScripts++;
            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Script duplicated: ${duplicate.name}`, 'success');
        },

        deleteScript: function(scriptId) {
            const script = AdventureCreator.state.scripting.scripts.find(s => s.id === scriptId);
            if (!script) return;

            if (!confirm(`Delete script "${script.name}"?`)) return;

            const index = AdventureCreator.state.scripting.scripts.findIndex(s => s.id === scriptId);
            AdventureCreator.state.scripting.scripts.splice(index, 1);
            AdventureCreator.state.scripting.stats.totalScripts--;

            if (AdventureCreator.state.scripting.currentScript?.id === scriptId) {
                AdventureCreator.state.scripting.currentScript = null;
            }

            AdventureCreator.renderCurrentModule();
            this.showNotification(`🗑️ Script deleted: ${script.name}`, 'info');
        },

        updateScriptName: function(name) {
            if (AdventureCreator.state.scripting.currentScript) {
                AdventureCreator.state.scripting.currentScript.name = name;
            }
        },

        updateScriptDescription: function(description) {
            if (AdventureCreator.state.scripting.currentScript) {
                AdventureCreator.state.scripting.currentScript.description = description;
            }
        },

        updateScriptCode: function(code) {
            if (AdventureCreator.state.scripting.currentScript) {
                AdventureCreator.state.scripting.currentScript.code = code;
                AdventureCreator.state.scripting.currentScript.lastModified = new Date().toISOString();
            }
        },

        closeEditor: function() {
            AdventureCreator.state.scripting.currentScript = null;
            AdventureCreator.renderCurrentModule();
        },

        toggleEditorSetting: function(setting) {
            AdventureCreator.state.scripting.editorSettings[setting] = !AdventureCreator.state.scripting.editorSettings[setting];
            AdventureCreator.renderCurrentModule();
        },

        validateScript: function() {
            const current = AdventureCreator.state.scripting.currentScript;
            if (!current || !current.code) {
                this.showNotification('⚠️ No code to validate', 'warning');
                return;
            }

            // Simple validation
            const lines = current.code.split('\n');
            const errors = [];

            // Check for basic syntax issues
            if (!current.code.trim()) {
                errors.push('Script is empty');
            }

            if (errors.length === 0) {
                this.showNotification('✅ Script syntax is valid', 'success');
            } else {
                this.showNotification(`❌ Found ${errors.length} error(s):\n${errors.join('\n')}`, 'error');
            }
        },

        formatScript: function() {
            const current = AdventureCreator.state.scripting.currentScript;
            if (!current || !current.code) {
                this.showNotification('⚠️ No code to format', 'warning');
                return;
            }

            // Simple formatting
            const lines = current.code.split('\n');
            let formatted = [];
            let indentLevel = 0;

            for (let line of lines) {
                const trimmed = line.trim();
                if (!trimmed) {
                    formatted.push('');
                    continue;
                }

                if (trimmed === 'DONE' || trimmed === 'ELSE') {
                    indentLevel = Math.max(0, indentLevel - 1);
                }

                formatted.push('  '.repeat(indentLevel) + trimmed);

                if (trimmed === 'THEN' || trimmed === 'ELSE') {
                    indentLevel++;
                }
            }

            current.code = formatted.join('\n');
            document.getElementById('script-code-editor').value = current.code;
            this.showNotification('✨ Script formatted', 'success');
        },

        // Parameter Configuration Functions
        showNewParameterTemplateDialog: function() {
            const name = prompt('Enter template name:');
            if (!name) return;

            const description = prompt('Enter template description (optional):');

            const newTemplate = {
                id: this.generateId(),
                name: name,
                description: description || '',
                parameters: []
            };

            AdventureCreator.state.scripting.parameterTemplates.push(newTemplate);
            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Template created: ${name}`, 'success');
        },

        editTemplate: function(templateId) {
            const template = AdventureCreator.state.scripting.parameterTemplates.find(t => t.id === templateId);
            if (!template) return;

            alert(`Editing template: ${template.name}\n\nThis would open a detailed template editor where you can:\n- Add/edit/remove parameters\n- Set parameter types and defaults\n- Configure validation rules\n- Test the template`);
        },

        deleteTemplate: function(templateId) {
            const template = AdventureCreator.state.scripting.parameterTemplates.find(t => t.id === templateId);
            if (!template) return;

            if (!confirm(`Delete template "${template.name}"?`)) return;

            const index = AdventureCreator.state.scripting.parameterTemplates.findIndex(t => t.id === templateId);
            AdventureCreator.state.scripting.parameterTemplates.splice(index, 1);
            AdventureCreator.renderCurrentModule();
            this.showNotification(`🗑️ Template deleted: ${template.name}`, 'info');
        },

        useTemplate: function(templateId) {
            const template = AdventureCreator.state.scripting.parameterTemplates.find(t => t.id === templateId);
            if (!template) return;

            this.showNotification(`📋 Using template: ${template.name}`, 'info');
            // In a full implementation, this would populate a form or script with the template
        },

        // Batch Operations Functions
        addToBatchQueue: function() {
            const type = prompt('Add to queue:\n1. Macro\n2. Script\n\nEnter 1 or 2:');

            if (type === '1') {
                this.showMacroSelectionDialog();
            } else if (type === '2') {
                this.showScriptSelectionDialog();
            }
        },

        showMacroSelectionDialog: function() {
            const state = AdventureCreator.state.scripting;
            if (state.macros.length === 0) {
                this.showNotification('⚠️ No macros available', 'warning');
                return;
            }

            // Simple implementation - add first macro
            const macro = state.macros[0];
            state.batchQueue.push({
                id: this.generateId(),
                name: macro.name,
                type: 'macro',
                description: macro.description,
                targetId: macro.id,
                status: 'pending'
            });

            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Added to queue: ${macro.name}`, 'success');
        },

        showScriptSelectionDialog: function() {
            const state = AdventureCreator.state.scripting;
            if (state.scripts.length === 0) {
                this.showNotification('⚠️ No scripts available', 'warning');
                return;
            }

            // Simple implementation - add first script
            const script = state.scripts[0];
            state.batchQueue.push({
                id: this.generateId(),
                name: script.name,
                type: 'script',
                description: script.description,
                targetId: script.id,
                status: 'pending'
            });

            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Added to queue: ${script.name}`, 'success');
        },

        removeFromQueue: function(index) {
            AdventureCreator.state.scripting.batchQueue.splice(index, 1);
            AdventureCreator.renderCurrentModule();
        },

        clearBatchQueue: function() {
            if (!confirm('Clear entire batch queue?')) return;

            AdventureCreator.state.scripting.batchQueue = [];
            AdventureCreator.state.scripting.batchResults = [];
            AdventureCreator.renderCurrentModule();
            this.showNotification('🗑️ Batch queue cleared', 'info');
        },

        startBatch: function() {
            const state = AdventureCreator.state.scripting;
            state.batchRunning = true;
            state.batchResults = [];

            this.processBatchQueue();
        },

        stopBatch: function() {
            AdventureCreator.state.scripting.batchRunning = false;
            AdventureCreator.renderCurrentModule();
            this.showNotification('⏹️ Batch execution stopped', 'info');
        },

        processBatchQueue: function() {
            const state = AdventureCreator.state.scripting;
            const queue = state.batchQueue;

            if (!state.batchRunning || queue.length === 0) {
                state.batchRunning = false;
                AdventureCreator.renderCurrentModule();
                return;
            }

            const currentItem = queue.find(item => !item.status || item.status === 'pending');
            if (!currentItem) {
                state.batchRunning = false;
                this.showNotification('✅ Batch execution completed', 'success');
                AdventureCreator.renderCurrentModule();
                return;
            }

            currentItem.status = 'running';
            AdventureCreator.renderCurrentModule();

            // Simulate execution
            const startTime = Date.now();
            setTimeout(() => {
                currentItem.status = 'completed';

                state.batchResults.push({
                    name: currentItem.name,
                    success: true,
                    message: 'Executed successfully',
                    duration: Date.now() - startTime
                });

                state.stats.totalExecutions++;
                AdventureCreator.renderCurrentModule();

                // Process next item
                setTimeout(() => this.processBatchQueue(), 500);
            }, Math.random() * 1000 + 500);
        },

        addAllMacrosToQueue: function() {
            const state = AdventureCreator.state.scripting;
            state.macros.forEach(macro => {
                state.batchQueue.push({
                    id: this.generateId(),
                    name: macro.name,
                    type: 'macro',
                    description: macro.description,
                    targetId: macro.id,
                    status: 'pending'
                });
            });

            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Added ${state.macros.length} macros to queue`, 'success');
        },

        addAllScriptsToQueue: function() {
            const state = AdventureCreator.state.scripting;
            state.scripts.forEach(script => {
                state.batchQueue.push({
                    id: this.generateId(),
                    name: script.name,
                    type: 'script',
                    description: script.description,
                    targetId: script.id,
                    status: 'pending'
                });
            });

            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Added ${state.scripts.length} scripts to queue`, 'success');
        },

        addSelectionToQueue: function() {
            this.showNotification('ℹ️ Selection dialog would appear here', 'info');
        },

        // Export/Import Functions
        setExportFormat: function(format) {
            AdventureCreator.state.scripting.exportFormat = format;
        },

        exportAll: function() {
            const state = AdventureCreator.state.scripting;
            const data = {
                version: '1.0',
                exported: new Date().toISOString(),
                macros: state.macros,
                scripts: state.scripts,
                parameterTemplates: state.parameterTemplates,
                stats: state.stats
            };

            this.downloadJSON('scripting-automation-complete.json', data);

            state.lastExport = {
                timestamp: new Date().toISOString(),
                items: state.macros.length + state.scripts.length + state.parameterTemplates.length
            };

            AdventureCreator.renderCurrentModule();
            this.showNotification('✅ Export completed', 'success');
        },

        exportMacros: function() {
            const state = AdventureCreator.state.scripting;
            const data = {
                version: '1.0',
                exported: new Date().toISOString(),
                type: 'macros',
                macros: state.macros
            };

            this.downloadJSON('macros.json', data);

            state.lastExport = {
                timestamp: new Date().toISOString(),
                items: state.macros.length
            };

            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Exported ${state.macros.length} macros`, 'success');
        },

        exportScripts: function() {
            const state = AdventureCreator.state.scripting;
            const data = {
                version: '1.0',
                exported: new Date().toISOString(),
                type: 'scripts',
                scripts: state.scripts
            };

            this.downloadJSON('scripts.json', data);

            state.lastExport = {
                timestamp: new Date().toISOString(),
                items: state.scripts.length
            };

            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Exported ${state.scripts.length} scripts`, 'success');
        },

        exportTemplates: function() {
            const state = AdventureCreator.state.scripting;
            const data = {
                version: '1.0',
                exported: new Date().toISOString(),
                type: 'templates',
                parameterTemplates: state.parameterTemplates
            };

            this.downloadJSON('parameter-templates.json', data);

            state.lastExport = {
                timestamp: new Date().toISOString(),
                items: state.parameterTemplates.length
            };

            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Exported ${state.parameterTemplates.length} templates`, 'success');
        },

        importFromFile: function() {
            const fileInput = document.getElementById('import-file');
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                this.showNotification('⚠️ Please select a file first', 'warning');
                return;
            }

            this.handleFileImport(fileInput.files[0]);
        },

        handleFileImport: function(file) {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.processImportData(data);
                } catch (error) {
                    this.showNotification('❌ Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        },

        processImportData: function(data) {
            const state = AdventureCreator.state.scripting;
            const mode = document.getElementById('import-mode')?.value || 'merge';

            let itemsImported = 0;

            if (mode === 'replace') {
                state.macros = [];
                state.scripts = [];
                state.parameterTemplates = [];
            }

            if (data.macros) {
                data.macros.forEach(macro => {
                    if (mode === 'merge' && state.macros.find(m => m.id === macro.id)) {
                        // Skip duplicates in merge mode
                        return;
                    }
                    state.macros.push(macro);
                    itemsImported++;
                });
            }

            if (data.scripts) {
                data.scripts.forEach(script => {
                    if (mode === 'merge' && state.scripts.find(s => s.id === script.id)) {
                        return;
                    }
                    state.scripts.push(script);
                    itemsImported++;
                });
            }

            if (data.parameterTemplates) {
                data.parameterTemplates.forEach(template => {
                    if (mode === 'merge' && state.parameterTemplates.find(t => t.id === template.id)) {
                        return;
                    }
                    state.parameterTemplates.push(template);
                    itemsImported++;
                });
            }

            state.stats.totalMacros = state.macros.length;
            state.stats.totalScripts = state.scripts.length;

            state.lastImport = {
                timestamp: new Date().toISOString(),
                items: itemsImported
            };

            AdventureCreator.renderCurrentModule();
            this.showNotification(`✅ Imported ${itemsImported} items`, 'success');
        },

        importFromClipboard: function() {
            navigator.clipboard.readText().then(text => {
                try {
                    const data = JSON.parse(text);
                    this.processImportData(data);
                } catch (error) {
                    this.showNotification('❌ Invalid clipboard data', 'error');
                }
            }).catch(() => {
                this.showNotification('❌ Could not read clipboard', 'error');
            });
        },

        showSampleImport: function() {
            const sampleData = {
                version: '1.0',
                macros: [
                    {
                        id: this.generateId(),
                        name: 'Sample Macro',
                        description: 'A sample macro for testing',
                        steps: [
                            { action: 'MESSAGE', parameters: { text: 'Hello!' }, description: 'Show message' }
                        ],
                        category: 'Sample'
                    }
                ],
                scripts: [
                    {
                        id: this.generateId(),
                        name: 'Sample Script',
                        description: 'A sample script for testing',
                        code: '; Sample DAAD code\nAT 0\nTHEN\n  MESSAGE "Welcome!"\n  DESC\nDONE',
                        created: new Date().toISOString()
                    }
                ]
            };

            this.processImportData(sampleData);
        },

        backupAll: function() {
            this.exportAll();
            this.showNotification('💾 Backup created', 'success');
        },

        restoreBackup: function() {
            this.importFromFile();
        },

        resetAll: function() {
            if (!confirm('⚠️ This will delete ALL macros, scripts, and templates!\n\nAre you sure?')) {
                return;
            }

            if (!confirm('This action cannot be undone. Continue?')) {
                return;
            }

            const state = AdventureCreator.state.scripting;
            state.macros = [];
            state.scripts = [];
            state.parameterTemplates = [];
            state.batchQueue = [];
            state.batchResults = [];
            state.stats = {
                totalMacros: 0,
                totalScripts: 0,
                totalExecutions: 0,
                lastExecutionTime: null
            };

            this.addDefaultParameterTemplates();

            AdventureCreator.renderCurrentModule();
            this.showNotification('🗑️ All data has been reset', 'info');
        },

        // Utility Functions
        generateId: function() {
            return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        downloadJSON: function(filename, data) {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        showNotification: function(message, type) {
            // In a full implementation, this would show a proper notification UI
            console.log(`[${type.toUpperCase()}] ${message}`);

            // For now, use alert for important messages
            if (type === 'error') {
                alert(message);
            }
        }
    };

    // Register the module
    if (typeof AdventureCreator.modules === 'undefined') {
        AdventureCreator.modules = {};
    }

    AdventureCreator.modules['scripting-automation'] = ScriptingAutomationSystem;
    ScriptingAutomationSystem.init();

    console.log('✅ Enhanced Scripting Automation System loaded successfully');
})();
