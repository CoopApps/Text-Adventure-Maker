/**
 * DAAD Adventure Creator - Multi-Process Tables System
 * Complete /PRO 0, 1, 2, 3 support with visual rule builder
 */

(function() {
    'use strict';

    const MultiProcessTablesModule = {
        name: 'Multi-Process Tables',
        description: 'Complete Process 0, 1, 2, 3 support with visual builder',
        version: '1.0.0',
        author: 'DAAD Adventure Creator',

        // Module state
        state: {
            currentTab: 'pro0',
            currentProcess: 0,
            showExplanations: true,
            editingRuleIndex: null
        },

        /**
         * Initialize the module
         */
        init: function() {
            console.log('Initializing Multi-Process Tables Module');
            this.injectStyles();
        },

        /**
         * Inject CSS styles
         */
        injectStyles: function() {
            if (document.getElementById('multi-process-styles')) return;

            const style = document.createElement('style');
            style.id = 'multi-process-styles';
            style.textContent = `
                .multi-process-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .process-header {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #8b5cf6;
                }

                .process-header h2 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                }

                .process-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .process-tab {
                    background: #34495e;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 20px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    min-width: 140px;
                }

                .process-tab:hover {
                    background: #3d566e;
                    transform: translateY(-2px);
                }

                .process-tab.active {
                    background: var(--tab-color, #8b5cf6);
                    font-weight: bold;
                }

                .tab-icon {
                    font-size: 24px;
                }

                .tab-label {
                    font-size: 13px;
                }

                .tab-number {
                    font-size: 11px;
                    opacity: 0.9;
                }

                .process-content {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }

                .process-title {
                    font-size: 24px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--process-color, #2c3e50);
                }

                .process-description {
                    color: #6c757d;
                    margin-bottom: 20px;
                    line-height: 1.6;
                }

                .process-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .detail-section {
                    background: #f8f9fa;
                    border-radius: 6px;
                    padding: 15px;
                }

                .detail-title {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .detail-content {
                    color: #495057;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .examples-section {
                    background: #e8f4fd;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 20px;
                }

                .examples-title {
                    font-weight: 600;
                    color: #3498db;
                    margin-bottom: 10px;
                }

                .example-item {
                    background: white;
                    border-left: 3px solid #3498db;
                    padding: 10px;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-style: italic;
                }

                .use-cases {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .use-case {
                    background: #f8f9fa;
                    border-radius: 6px;
                    padding: 15px;
                    border-left: 4px solid var(--case-color, #3498db);
                }

                .use-case-title {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .use-case-description {
                    color: #6c757d;
                    font-size: 13px;
                    margin-bottom: 12px;
                }

                .use-case-rules {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .use-case-rules li {
                    font-size: 13px;
                    color: #495057;
                    padding: 4px 0;
                    padding-left: 15px;
                    position: relative;
                }

                .use-case-rules li::before {
                    content: "▸";
                    position: absolute;
                    left: 0;
                    color: var(--case-color, #3498db);
                }

                .rules-section {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .rule-builder-integration {
                    background: white;
                    border: 2px dashed #3498db;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 20px;
                }

                .existing-rules {
                    margin-top: 20px;
                }

                .rule-item {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .rule-conditions {
                    color: #2ecc71;
                    font-size: 14px;
                    margin-bottom: 5px;
                    font-family: monospace;
                }

                .rule-actions {
                    color: #3498db;
                    font-size: 14px;
                    font-family: monospace;
                }

                .rule-actions-buttons {
                    display: flex;
                    gap: 8px;
                }

                .code-preview-section {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                }

                .code-preview {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 15px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 13px;
                    white-space: pre-wrap;
                    min-height: 100px;
                    overflow-x: auto;
                    line-height: 1.5;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #95a5a6;
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                }

                .info-callout {
                    background: #e8f4fd;
                    border-left: 4px solid #3498db;
                    padding: 12px;
                    margin: 15px 0;
                    border-radius: 4px;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 800px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 2px solid #dee2e6;
                }

                .modal-header h3 {
                    margin: 0;
                    color: #2c3e50;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 28px;
                    color: #95a5a6;
                    cursor: pointer;
                    line-height: 1;
                }

                .modal-close:hover {
                    color: #2c3e50;
                }

                .modal-body {
                    padding: 20px;
                }

                .rule-builder-section {
                    margin-bottom: 20px;
                }

                .rule-builder-section h4 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                }

                .rule-builder-section p {
                    color: #6c757d;
                    font-size: 14px;
                    margin-bottom: 15px;
                }

                .rule-list {
                    background: #f8f9fa;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 15px;
                    min-height: 60px;
                }

                .rule-list-item {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 10px;
                    margin-bottom: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .rule-list-empty {
                    color: #95a5a6;
                    font-style: italic;
                    text-align: center;
                    padding: 20px;
                    border: 2px dashed #dee2e6;
                    border-radius: 4px;
                }

                .picker-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 6px;
                }

                .picker-item {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .picker-item:hover {
                    border-color: #3498db;
                    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
                    transform: translateY(-2px);
                }

                .picker-item-name {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }

                .picker-item-desc {
                    font-size: 12px;
                    color: #6c757d;
                }

                @media (max-width: 768px) {
                    .process-details {
                        grid-template-columns: 1fr;
                    }

                    .use-cases {
                        grid-template-columns: 1fr;
                    }

                    .picker-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        /**
         * Get built-in DAAD conditions
         */
        getBuiltInConditions: function() {
            return [
                { name: 'AT', description: 'Player at location', params: ['location'] },
                { name: 'NOTAT', description: 'Player NOT at location', params: ['location'] },
                { name: 'CARRIED', description: 'Player carrying object', params: ['object'] },
                { name: 'NOTCARR', description: 'Player NOT carrying', params: ['object'] },
                { name: 'WORN', description: 'Player wearing object', params: ['object'] },
                { name: 'NOTWORN', description: 'NOT wearing object', params: ['object'] },
                { name: 'PRESENT', description: 'Object in current location', params: ['object'] },
                { name: 'ABSENT', description: 'Object NOT in location', params: ['object'] },
                { name: 'EQ', description: 'Flag equals value', params: ['flag', 'value'] },
                { name: 'GT', description: 'Flag greater than', params: ['flag', 'value'] },
                { name: 'LT', description: 'Flag less than', params: ['flag', 'value'] },
                { name: 'CHANCE', description: 'Random percentage', params: ['percent'] },
                { name: 'ISAT', description: 'Object is at location', params: ['object', 'location'] },
                { name: 'ISNOTAT', description: 'Object NOT at location', params: ['object', 'location'] }
            ];
        },

        /**
         * Get built-in DAAD actions
         */
        getBuiltInActions: function() {
            return [
                { name: 'MESSAGE', description: 'Display message', params: ['message_num'] },
                { name: 'DESC', description: 'Redescribe location', params: [] },
                { name: 'QUIT', description: 'End game', params: [] },
                { name: 'END', description: 'Successful game end', params: [] },
                { name: 'DONE', description: 'End rule successfully', params: [] },
                { name: 'NOTDONE', description: 'End rule as failure', params: [] },
                { name: 'OK', description: 'Generic success message', params: [] },
                { name: 'GET', description: 'Pick up object', params: ['object'] },
                { name: 'DROP', description: 'Drop object', params: ['object'] },
                { name: 'WEAR', description: 'Wear object', params: ['object'] },
                { name: 'REMOVE', description: 'Remove worn object', params: ['object'] },
                { name: 'GOTO', description: 'Go to location', params: ['location'] },
                { name: 'PLACE', description: 'Place object at location', params: ['object', 'location'] },
                { name: 'PUTO', description: 'Put object here', params: ['object'] },
                { name: 'SET', description: 'Set flag to value', params: ['flag', 'value'] },
                { name: 'CLEAR', description: 'Clear flag to 0', params: ['flag'] },
                { name: 'PLUS', description: 'Add to flag', params: ['value', 'flag'] },
                { name: 'MINUS', description: 'Subtract from flag', params: ['value', 'flag'] },
                { name: 'COPYOF', description: 'Copy object location', params: ['object', 'flag'] },
                { name: 'COPYOO', description: 'Copy object to object', params: ['source', 'target'] },
                { name: 'COPYFO', description: 'Copy flag to object', params: ['flag', 'object'] }
            ];
        },

        /**
         * Get process definitions
         */
        getProcessDefinitions: function() {
            return {
                pro0: {
                    number: 0,
                    title: "Process 0 - Main Response Table",
                    icon: "🎮",
                    color: "#3498db",
                    whenRuns: "Every time the player types a command",
                    purpose: "Process player commands, implement game actions, handle verb-noun combinations",
                    examples: [
                        "Player types 'GET SWORD' - check if sword is present, then pick it up",
                        "Player types 'OPEN DOOR' - check if player has key, then open the door",
                        "Player types 'EXAMINE PAINTING' - show detailed description"
                    ]
                },
                pro1: {
                    number: 1,
                    title: "Process 1 - After Each Turn",
                    icon: "⏰",
                    color: "#2ecc71",
                    whenRuns: "After each turn, following any Process 0 actions",
                    purpose: "Update timers, check ongoing conditions, trigger automatic events",
                    examples: [
                        "Decrease torch fuel each turn",
                        "Check for random encounters",
                        "Update hunger/thirst counters"
                    ]
                },
                pro2: {
                    number: 2,
                    title: "Process 2 - After Successful Actions",
                    icon: "✅",
                    color: "#8b5cf6",
                    whenRuns: "After any successful action in Process 0",
                    purpose: "Handle side effects, update achievements, trigger consequences",
                    examples: [
                        "Opening chest alerts nearby guards",
                        "Picking up sword increases confidence",
                        "Solving puzzle improves intelligence"
                    ]
                },
                pro3: {
                    number: 3,
                    title: "Process 3 - After Location Descriptions",
                    icon: "📍",
                    color: "#f39c12",
                    whenRuns: "After room descriptions, LOOK commands, or entering new locations",
                    purpose: "Add atmospheric details, trigger location-based events",
                    examples: [
                        "Entering forest: 'You hear wolves howling'",
                        "Looking in tavern: 'The bartender eyes you'",
                        "Entering dungeon: 'Strange symbols glow'"
                    ]
                }
            };
        },

        /**
         * Render the module
         */
        render: function() {
            const currentTab = this.state.currentTab;
            const definitions = this.getProcessDefinitions();
            const currentDef = definitions[currentTab];

            return `
                <div class="multi-process-container">
                    <div class="process-header">
                        <h2>🔄 Multi-Process Tables Builder</h2>
                        <p style="color: #6c757d; margin: 5px 0;">
                            DAAD's four process tables handle different types of game events.
                        </p>
                    </div>

                    <div class="process-tabs">
                        ${this.renderTabs(definitions, currentTab)}
                    </div>

                    <div class="process-content">
                        ${this.renderProcessContent(currentDef)}
                    </div>

                    ${this.renderRulesSection(currentDef.number)}
                    ${this.renderCodePreview(currentDef.number)}
                </div>
            `;
        },

        /**
         * Render tabs
         */
        renderTabs: function(definitions, currentTab) {
            return Object.entries(definitions).map(([key, def]) => `
                <button class="process-tab ${currentTab === key ? 'active' : ''}"
                        style="--tab-color: ${def.color}"
                        onclick="AdventureCreator.getModule('multi-process-tables').switchTab('${key}')">
                    <div class="tab-icon">${def.icon}</div>
                    <div class="tab-label">Process ${def.number}</div>
                    <div class="tab-number">/PRO ${def.number}</div>
                </button>
            `).join('');
        },

        /**
         * Render process content
         */
        renderProcessContent: function(def) {
            return `
                <div class="process-title" style="--process-color: ${def.color}">
                    ${def.icon} ${def.title}
                </div>

                <div class="process-description">
                    ${def.purpose}
                </div>

                <div class="process-details">
                    <div class="detail-section">
                        <div class="detail-title">⏰ When It Runs</div>
                        <div class="detail-content">${def.whenRuns}</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-title">🎯 Purpose</div>
                        <div class="detail-content">${def.purpose}</div>
                    </div>
                </div>

                <div class="examples-section">
                    <div class="examples-title">💡 Common Examples</div>
                    ${def.examples.map(ex => `
                        <div class="example-item">${ex}</div>
                    `).join('')}
                </div>

                <div class="info-callout">
                    💡 <strong>Process ${def.number} Timing:</strong> ${def.whenRuns}
                </div>
            `;
        },

        /**
         * Render rules section
         */
        renderRulesSection: function(processNumber) {
            const game = AdventureCreator.getCurrentGame();
            if (!game || !game.daad) return '';

            const rules = this.getProcessRules(processNumber, game);

            return `
                <div class="rules-section">
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Rules for Process ${processNumber}</h3>

                    <div class="rule-builder-integration">
                        <p style="color: #6c757d; margin-bottom: 15px;">
                            Use the visual rule builder to create conditions and actions.
                        </p>
                        <button class="btn btn-primary"
                                onclick="AdventureCreator.getModule('multi-process-tables').openRuleBuilder(${processNumber})">
                            ➕ Create New Rule
                        </button>
                    </div>

                    <div class="existing-rules">
                        ${rules.length === 0 ? `
                            <div class="empty-state">
                                <div style="font-size: 48px; margin-bottom: 10px;">📝</div>
                                <p>No rules in Process ${processNumber} yet</p>
                                <p style="font-size: 14px; margin-top: 5px;">
                                    Add rules to define what happens when this process runs.
                                </p>
                            </div>
                        ` : `
                            <h4 style="color: #6c757d; margin-bottom: 15px;">Current Rules (${rules.length}):</h4>
                            ${rules.map((rule, idx) => this.renderRuleItem(rule, idx, processNumber)).join('')}
                        `}
                    </div>
                </div>
            `;
        },

        /**
         * Render rule item
         */
        renderRuleItem: function(rule, index, processNumber) {
            const conditionsText = rule.conditions && rule.conditions.length > 0
                ? rule.conditions.map(c => c.code || c.name || 'condition').join(' ')
                : 'Always runs';

            const actionsText = rule.actions && rule.actions.length > 0
                ? rule.actions.map(a => a.code || a.name || 'action').join(' ')
                : 'No actions';

            return `
                <div class="rule-item">
                    <div>
                        <div class="rule-conditions">IF: ${conditionsText}</div>
                        <div class="rule-actions">THEN: ${actionsText}</div>
                    </div>
                    <div class="rule-actions-buttons">
                        <button class="btn btn-secondary btn-sm"
                                onclick="AdventureCreator.getModule('multi-process-tables').editRule(${processNumber}, ${index})">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger btn-sm"
                                onclick="AdventureCreator.getModule('multi-process-tables').deleteRule(${processNumber}, ${index})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * Render code preview
         */
        renderCodePreview: function(processNumber) {
            const game = AdventureCreator.getCurrentGame();
            if (!game || !game.daad) return '';

            const rules = this.getProcessRules(processNumber, game);
            const code = this.generateProcessCode(processNumber, rules);

            return `
                <div class="code-preview-section">
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Generated DAAD Code</h3>
                    <div class="code-preview">${this.escapeHtml(code)}</div>
                </div>
            `;
        },

        /**
         * Get process rules
         */
        getProcessRules: function(processNumber, game) {
            if (!game || !game.daad) return [];

            if (!game.daad.processes) {
                game.daad.processes = [[], [], [], []];
            }

            return game.daad.processes[processNumber] || [];
        },

        /**
         * Generate DAAD code
         */
        generateProcessCode: function(processNumber, rules) {
            let code = `/PRO ${processNumber}\n`;

            if (rules.length === 0) {
                code += '// No rules defined\n';
                return code;
            }

            rules.forEach((rule, index) => {
                code += `\n; Rule ${index + 1}\n`;

                if (rule.conditions && rule.conditions.length > 0) {
                    rule.conditions.forEach(cond => {
                        code += `${cond.code || cond.name}\n`;
                    });
                }

                code += 'THEN\n';

                if (rule.actions && rule.actions.length > 0) {
                    rule.actions.forEach(action => {
                        code += `  ${action.code || action.name}\n`;
                    });
                }

                code += 'DONE\n';
            });

            return code;
        },

        /**
         * Switch tab
         */
        switchTab: function(tabKey) {
            this.state.currentTab = tabKey;
            AdventureCreator.navigate('multi-process-tables');
        },

        /**
         * Open rule builder
         */
        openRuleBuilder: function(processNumber, editIndex = null) {
            this.state.currentProcess = processNumber;
            this.state.editingRuleIndex = editIndex;

            // Initialize or load existing rule
            if (editIndex !== null) {
                const game = AdventureCreator.getCurrentGame();
                const rules = this.getProcessRules(processNumber, game);
                const rule = rules[editIndex];
                AdventureCreator.state.currentRuleConditions = [...(rule.conditions || [])];
                AdventureCreator.state.currentRuleActions = [...(rule.actions || [])];
            } else {
                AdventureCreator.state.currentRuleConditions = [];
                AdventureCreator.state.currentRuleActions = [];
            }

            this.showRuleBuilderModal(processNumber);
        },

        /**
         * Show rule builder modal
         */
        showRuleBuilderModal: function(processNumber) {
            const definitions = this.getProcessDefinitions();
            const processDef = definitions[`pro${processNumber}`];
            const isEditing = this.state.editingRuleIndex !== null;

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };

            modal.innerHTML = `
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${processDef.icon} ${isEditing ? 'Edit' : 'Create'} Rule for Process ${processNumber}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>

                    <div class="modal-body">
                        <div style="background: ${processDef.color}; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                            <strong>${processDef.title}</strong><br>
                            <small>${processDef.whenRuns}</small>
                        </div>

                        <div class="rule-builder-section">
                            <h4>IF Conditions (Optional)</h4>
                            <p>Add conditions to control when this rule runs. Leave empty to always run.</p>
                            <div class="rule-list" id="conditions-list">
                                ${this.renderConditionsList()}
                            </div>
                            <button class="btn btn-success btn-sm"
                                    onclick="AdventureCreator.getModule('multi-process-tables').addCondition()">
                                ➕ Add Condition
                            </button>
                        </div>

                        <div class="rule-builder-section">
                            <h4>THEN Actions (Required)</h4>
                            <p>Define what happens when this rule runs.</p>
                            <div class="rule-list" id="actions-list">
                                ${this.renderActionsList()}
                            </div>
                            <button class="btn btn-primary btn-sm"
                                    onclick="AdventureCreator.getModule('multi-process-tables').addAction()">
                                ➕ Add Action
                            </button>
                        </div>

                        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                                Cancel
                            </button>
                            <button class="btn btn-success"
                                    onclick="AdventureCreator.getModule('multi-process-tables').saveRule(${processNumber})">
                                💾 Save Rule
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        /**
         * Render conditions list
         */
        renderConditionsList: function() {
            const conditions = AdventureCreator.state.currentRuleConditions || [];

            if (conditions.length === 0) {
                return '<div class="rule-list-empty">No conditions - rule will always run</div>';
            }

            return conditions.map((cond, idx) => `
                <div class="rule-list-item">
                    <span>${cond.code || cond.name}</span>
                    <button class="btn btn-danger btn-sm"
                            onclick="AdventureCreator.getModule('multi-process-tables').removeCondition(${idx})">
                        Remove
                    </button>
                </div>
            `).join('');
        },

        /**
         * Render actions list
         */
        renderActionsList: function() {
            const actions = AdventureCreator.state.currentRuleActions || [];

            if (actions.length === 0) {
                return '<div class="rule-list-empty">No actions - rule will do nothing</div>';
            }

            return actions.map((action, idx) => `
                <div class="rule-list-item">
                    <span>${action.code || action.name}</span>
                    <button class="btn btn-danger btn-sm"
                            onclick="AdventureCreator.getModule('multi-process-tables').removeAction(${idx})">
                        Remove
                    </button>
                </div>
            `).join('');
        },

        /**
         * Add condition
         */
        addCondition: function() {
            // Try external module first
            if (AdventureCreator.modules['condition-system']) {
                AdventureCreator.modules['condition-system'].selectCondition();
                return;
            }

            // Use built-in picker
            this.showConditionPicker();
        },

        /**
         * Show condition picker
         */
        showConditionPicker: function() {
            const conditions = this.getBuiltInConditions();

            const picker = document.createElement('div');
            picker.className = 'modal-overlay';
            picker.onclick = (e) => {
                if (e.target === picker) picker.remove();
            };

            picker.innerHTML = `
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Select Condition</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>

                    <div class="modal-body">
                        <div class="picker-grid">
                            ${conditions.map(cond => `
                                <div class="picker-item"
                                     onclick="AdventureCreator.getModule('multi-process-tables').selectCondition('${cond.name}')">
                                    <div class="picker-item-name">${cond.name}</div>
                                    <div class="picker-item-desc">${cond.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(picker);
        },

        /**
         * Select condition
         */
        selectCondition: function(conditionName) {
            if (!AdventureCreator.state.currentRuleConditions) {
                AdventureCreator.state.currentRuleConditions = [];
            }

            AdventureCreator.state.currentRuleConditions.push({
                name: conditionName,
                code: conditionName
            });

            // Close picker
            const pickers = document.querySelectorAll('.modal-overlay');
            if (pickers.length > 1) {
                pickers[pickers.length - 1].remove();
            }

            // Refresh the rule builder
            this.refreshRuleBuilder();
        },

        /**
         * Add action
         */
        addAction: function() {
            // Try external module first
            if (AdventureCreator.modules['action-system']) {
                AdventureCreator.modules['action-system'].selectAction();
                return;
            }

            // Use built-in picker
            this.showActionPicker();
        },

        /**
         * Show action picker
         */
        showActionPicker: function() {
            const actions = this.getBuiltInActions();

            const picker = document.createElement('div');
            picker.className = 'modal-overlay';
            picker.onclick = (e) => {
                if (e.target === picker) picker.remove();
            };

            picker.innerHTML = `
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Select Action</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>

                    <div class="modal-body">
                        <div class="picker-grid">
                            ${actions.map(action => `
                                <div class="picker-item"
                                     onclick="AdventureCreator.getModule('multi-process-tables').selectAction('${action.name}')">
                                    <div class="picker-item-name">${action.name}</div>
                                    <div class="picker-item-desc">${action.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(picker);
        },

        /**
         * Select action
         */
        selectAction: function(actionName) {
            if (!AdventureCreator.state.currentRuleActions) {
                AdventureCreator.state.currentRuleActions = [];
            }

            AdventureCreator.state.currentRuleActions.push({
                name: actionName,
                code: actionName
            });

            // Close picker
            const pickers = document.querySelectorAll('.modal-overlay');
            if (pickers.length > 1) {
                pickers[pickers.length - 1].remove();
            }

            // Refresh the rule builder
            this.refreshRuleBuilder();
        },

        /**
         * Refresh rule builder
         */
        refreshRuleBuilder: function() {
            const conditionsList = document.getElementById('conditions-list');
            const actionsList = document.getElementById('actions-list');

            if (conditionsList) {
                conditionsList.innerHTML = this.renderConditionsList();
            }

            if (actionsList) {
                actionsList.innerHTML = this.renderActionsList();
            }
        },

        /**
         * Remove condition
         */
        removeCondition: function(index) {
            if (AdventureCreator.state.currentRuleConditions) {
                AdventureCreator.state.currentRuleConditions.splice(index, 1);
                this.refreshRuleBuilder();
            }
        },

        /**
         * Remove action
         */
        removeAction: function(index) {
            if (AdventureCreator.state.currentRuleActions) {
                AdventureCreator.state.currentRuleActions.splice(index, 1);
                this.refreshRuleBuilder();
            }
        },

        /**
         * Save rule
         */
        saveRule: function(processNumber) {
            const game = AdventureCreator.getCurrentGame();
            if (!game || !game.daad) return;

            const conditions = AdventureCreator.state.currentRuleConditions || [];
            const actions = AdventureCreator.state.currentRuleActions || [];

            if (actions.length === 0) {
                alert('Rules must have at least one action!');
                return;
            }

            if (!game.daad.processes) {
                game.daad.processes = [[], [], [], []];
            }

            const newRule = {
                conditions: conditions,
                actions: actions,
                processNumber: processNumber
            };

            if (this.state.editingRuleIndex !== null) {
                // Update existing rule
                game.daad.processes[processNumber][this.state.editingRuleIndex] = newRule;
            } else {
                // Add new rule
                game.daad.processes[processNumber].push(newRule);
            }

            // Save and cleanup
            if (AdventureCreator.saveState) {
                AdventureCreator.saveState();
            }

            // Clear state
            AdventureCreator.state.currentRuleConditions = [];
            AdventureCreator.state.currentRuleActions = [];
            this.state.editingRuleIndex = null;

            // Close modal and refresh
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(m => m.remove());

            AdventureCreator.navigate('multi-process-tables');
        },

        /**
         * Edit rule
         */
        editRule: function(processNumber, ruleIndex) {
            this.openRuleBuilder(processNumber, ruleIndex);
        },

        /**
         * Delete rule
         */
        deleteRule: function(processNumber, ruleIndex) {
            if (confirm('Delete this rule?')) {
                const game = AdventureCreator.getCurrentGame();
                if (game && game.daad && game.daad.processes) {
                    game.daad.processes[processNumber].splice(ruleIndex, 1);

                    if (AdventureCreator.saveState) {
                        AdventureCreator.saveState();
                    }

                    AdventureCreator.navigate('multi-process-tables');
                }
            }
        },

        /**
         * Escape HTML
         */
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text || '';
            return div.innerHTML;
        }
    };

    // Register the module
    if (typeof AdventureCreator !== 'undefined') {
        AdventureCreator.registerModule('multi-process-tables', MultiProcessTablesModule);
    }

})();
