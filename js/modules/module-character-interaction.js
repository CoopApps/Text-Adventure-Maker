// module-character-interaction.js - Module 16: Character Interaction System
// Part of DAAD Adventure Creator - Interface Feature for NPC Behavior and Dialogue Systems

(function() {
    'use strict';

    console.log('Character Interaction System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found!');
        return;
    }

    AdventureCreator.registerModule('character-interaction', {
        name: 'Character Interaction',
        description: 'NPC behavior and dialogue systems for creating living, interactive characters',
        category: 'Interface',
        complexity: 'Intermediate',

        init() {
            console.log('Character Interaction System initialized');
            this.initializeState();
            this.loadFromStorage();
            this.setupKeyboardShortcuts();
        },

        initializeState() {
            if (!AdventureCreator.state.characterInteraction) {
                AdventureCreator.state.characterInteraction = {
                    selectedTab: 'character_builder',
                    showExplanations: true,
                    selectedCharacter: null,
                    dialogueMode: 'simple',
                    behaviorComplexity: 'basic',
                    conversationState: {},
                    favoriteCharacters: new Set(),
                    favoriteTemplates: new Set(),
                    recentCharacters: [],
                    recentTemplates: [],
                    customTemplates: [],
                    characterTemplates: [
                        { id: 'merchant', name: 'Merchant/Trader', category: 'functional' },
                        { id: 'guard', name: 'Guard/Sentinel', category: 'functional' },
                        { id: 'wise_elder', name: 'Wise Elder/Sage', category: 'story' },
                        { id: 'quest_giver', name: 'Quest Giver', category: 'story' },
                        { id: 'companion', name: 'Companion/Ally', category: 'story' },
                        { id: 'mysterious_stranger', name: 'Mysterious Stranger', category: 'story' }
                    ]
                };
            }
        },

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('characterInteraction_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const state = AdventureCreator.state.characterInteraction;

                    state.selectedTab = parsed.selectedTab || 'character_builder';
                    state.showExplanations = parsed.showExplanations !== undefined ? parsed.showExplanations : true;
                    state.behaviorComplexity = parsed.behaviorComplexity || 'basic';
                    state.favoriteCharacters = new Set(parsed.favoriteCharacters || []);
                    state.favoriteTemplates = new Set(parsed.favoriteTemplates || []);
                    state.recentCharacters = parsed.recentCharacters || [];
                    state.recentTemplates = parsed.recentTemplates || [];
                    state.customTemplates = parsed.customTemplates || [];

                    console.log('Character Interaction state loaded from localStorage');
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        saveToStorage() {
            try {
                const state = AdventureCreator.state.characterInteraction;
                const toSave = {
                    selectedTab: state.selectedTab,
                    showExplanations: state.showExplanations,
                    behaviorComplexity: state.behaviorComplexity,
                    favoriteCharacters: Array.from(state.favoriteCharacters),
                    favoriteTemplates: Array.from(state.favoriteTemplates),
                    recentCharacters: state.recentCharacters,
                    recentTemplates: state.recentTemplates,
                    customTemplates: state.customTemplates
                };
                localStorage.setItem('characterInteraction_state', JSON.stringify(toSave));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                this.showNotification('Failed to save character data', 'error');
            }
        },

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (!document.querySelector('.character-interaction-container')) return;

                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }

                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveToStorage();
                    this.showNotification('Character data saved', 'success');
                }

                if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault();
                    // Focus search if available
                }

                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.closeModal();
                }
            });
        },

        render() {
            const state = AdventureCreator.state.characterInteraction;

            return `
                <div class="character-interaction-container">
                    <div class="section-header">
                        <h2>👥 Character Interaction System</h2>
                        <div class="complexity-badges">
                            <span class="complexity-badge intermediate">Intermediate</span>
                            <span class="feature-badge interface">Interface</span>
                            <span class="priority-badge module-16">Module 16</span>
                        </div>
                    </div>

                    <div class="section-content active">
                        <div class="feature-description">
                            <h3>🎭 Bring Characters to Life</h3>
                            <p>Create interactive NPCs with personalities, dialogue systems, behaviors, and complex conversation trees. From simple merchants to deep story characters with evolving relationships.</p>
                            <div style="margin-top: 10px;">
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['character-interaction'].showHelpModal()">
                                    ❓ Help (F1)
                                </button>
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['character-interaction'].saveToStorage()">
                                    💾 Save (Ctrl+S)
                                </button>
                            </div>
                        </div>

                        ${this.renderTabNavigation()}
                        ${this.renderTabContent()}
                    </div>
                </div>
            `;
        },

        renderTabNavigation() {
            const tabs = [
                { id: 'character_builder', name: '👤 Character Builder', description: 'Create and design NPCs' },
                { id: 'dialogue_system', name: '💬 Dialogue System', description: 'Conversation trees and scripts' },
                { id: 'behavior_ai', name: '🧠 Behavior AI', description: 'NPC personalities and reactions' },
                { id: 'interaction_patterns', name: '🔄 Interaction Patterns', description: 'Common NPC patterns and templates' },
                { id: 'character_gallery', name: '🎨 Character Gallery', description: 'Pre-built character types' }
            ];

            return `
                <div class="tab-navigation">
                    ${tabs.map(tab => `
                        <button class="tab-button ${AdventureCreator.state.characterInteraction.selectedTab === tab.id ? 'active' : ''}"
                                onclick="AdventureCreator.modules['character-interaction'].switchTab('${tab.id}')">
                            <div class="tab-name">${tab.name}</div>
                            <div class="tab-description">${this.escapeHtml(tab.description)}</div>
                        </button>
                    `).join('')}
                </div>
            `;
        },

        renderTabContent() {
            const selectedTab = AdventureCreator.state.characterInteraction.selectedTab;

            switch(selectedTab) {
                case 'character_builder':
                    return this.renderCharacterBuilder();
                case 'dialogue_system':
                    return this.renderDialogueSystem();
                case 'behavior_ai':
                    return this.renderBehaviorAI();
                case 'interaction_patterns':
                    return this.renderInteractionPatterns();
                case 'character_gallery':
                    return this.renderCharacterGallery();
                default:
                    return this.renderCharacterBuilder();
            }
        },

        renderCharacterBuilder() {
            const game = AdventureCreator.getCurrentGame();
            if (!game || !game.daad) {
                return '<div class="feature-placeholder">Create a game first to build characters.</div>';
            }

            if (!game.daad.characters) game.daad.characters = [];
            const characters = game.daad.characters;

            return `
                <div class="character-builder-container">
                    <div class="builder-toolbar">
                        <div class="toolbar-section">
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['character-interaction'].createCharacter()">
                                ➕ New Character
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['character-interaction'].showTemplateModal()">
                                📋 From Template
                            </button>
                        </div>

                        <div class="toolbar-section">
                            <label class="toolbar-label">Complexity Level:</label>
                            <select class="toolbar-select" onchange="AdventureCreator.modules['character-interaction'].setBehaviorComplexity(this.value)">
                                <option value="basic" ${AdventureCreator.state.characterInteraction.behaviorComplexity === 'basic' ? 'selected' : ''}>Basic NPCs</option>
                                <option value="intermediate" ${AdventureCreator.state.characterInteraction.behaviorComplexity === 'intermediate' ? 'selected' : ''}>Interactive Characters</option>
                                <option value="advanced" ${AdventureCreator.state.characterInteraction.behaviorComplexity === 'advanced' ? 'selected' : ''}>Complex Personalities</option>
                            </select>
                        </div>
                    </div>

                    <div class="character-workspace">
                        ${this.renderCharacterList(characters)}
                        ${this.renderCharacterEditor(characters)}
                    </div>
                </div>
            `;
        },

        renderCharacterList(characters) {
            if (characters.length === 0) {
                return `
                    <div class="character-list empty">
                        <div class="empty-state">
                            <div class="empty-icon">👤</div>
                            <div class="empty-title">No Characters Yet</div>
                            <div class="empty-description">Create your first NPC to bring your world to life</div>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['character-interaction'].createCharacter()">
                                Create First Character
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="character-list">
                    <div class="list-header">
                        <h3>Characters (${characters.length})</h3>
                    </div>

                    <div class="characters-grid">
                        ${characters.map((character, index) => this.renderCharacterCard(character, index)).join('')}
                    </div>
                </div>
            `;
        },

        renderCharacterCard(character, index) {
            const isSelected = AdventureCreator.state.characterInteraction.selectedCharacter === index;
            const isFavorite = AdventureCreator.state.characterInteraction.favoriteCharacters.has(index);
            const complexity = this.getCharacterComplexity(character);

            return `
                <div class="character-card ${isSelected ? 'selected' : ''}"
                     onclick="AdventureCreator.modules['character-interaction'].selectCharacter(${index})">
                    <button class="favorite-btn"
                            onclick="event.stopPropagation(); AdventureCreator.modules['character-interaction'].toggleFavoriteCharacter(${index})"
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                            style="position: absolute; top: 5px; right: 5px; background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 0;">
                        ${isFavorite ? '⭐' : '☆'}
                    </button>

                    <div class="character-avatar">
                        ${this.escapeHtml(character.avatar || '👤')}
                    </div>

                    <div class="character-info">
                        <div class="character-name">${this.escapeHtml(character.name || `Character ${index + 1}`)}</div>
                        <div class="character-role">${this.escapeHtml(character.role || 'Generic NPC')}</div>

                        <div class="character-stats">
                            <span class="stat-item">
                                💬 ${character.dialogues ? character.dialogues.length : 0} dialogue${character.dialogues && character.dialogues.length !== 1 ? 's' : ''}
                            </span>
                            <span class="stat-item">
                                🎭 ${character.behaviors ? character.behaviors.length : 0} behavior${character.behaviors && character.behaviors.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div class="character-complexity">
                            <span class="complexity-badge ${complexity.level}">${complexity.label}</span>
                        </div>
                    </div>

                    <div class="character-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); AdventureCreator.modules['character-interaction'].editCharacter(${index})" title="Edit">✏️</button>
                        <button class="action-btn" onclick="event.stopPropagation(); AdventureCreator.modules['character-interaction'].duplicateCharacter(${index})" title="Duplicate">📋</button>
                        <button class="action-btn danger" onclick="event.stopPropagation(); AdventureCreator.modules['character-interaction'].deleteCharacter(${index})" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        },

        renderCharacterEditor(characters) {
            const selectedIndex = AdventureCreator.state.characterInteraction.selectedCharacter;

            if (selectedIndex === null || !characters[selectedIndex]) {
                return `
                    <div class="character-editor empty">
                        <div class="editor-empty">
                            <div class="empty-icon">✏️</div>
                            <div class="empty-title">No Character Selected</div>
                            <div class="empty-description">Select a character to edit its properties and behavior</div>
                        </div>
                    </div>
                `;
            }

            const character = characters[selectedIndex];

            return `
                <div class="character-editor">
                    <div class="editor-header">
                        <h3>✏️ Editing: ${this.escapeHtml(character.name || `Character ${selectedIndex + 1}`)}</h3>
                        <div class="editor-actions">
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['character-interaction'].previewCharacter()">👁️ Preview</button>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['character-interaction'].testDialogue()">🎭 Test Dialogue</button>
                        </div>
                    </div>

                    <div class="editor-content">
                        ${this.renderBasicProperties(character)}
                        ${this.renderPersonalitySection(character)}
                        ${this.renderDialoguePreview(character)}
                        ${this.renderBehaviorPreview(character)}
                    </div>
                </div>
            `;
        },

        renderBasicProperties(character) {
            return `
                <div class="property-section">
                    <h4>📝 Basic Properties</h4>

                    <div class="property-grid">
                        <div class="property-group">
                            <label class="property-label">Character Name</label>
                            <input type="text" class="property-input"
                                   value="${this.escapeHtml(character.name || '')}"
                                   placeholder="Enter character name"
                                   onchange="AdventureCreator.modules['character-interaction'].updateCharacterProperty('name', this.value)">
                        </div>

                        <div class="property-group">
                            <label class="property-label">Role/Occupation</label>
                            <input type="text" class="property-input"
                                   value="${this.escapeHtml(character.role || '')}"
                                   placeholder="e.g., Merchant, Guard, Wizard"
                                   onchange="AdventureCreator.modules['character-interaction'].updateCharacterProperty('role', this.value)">
                        </div>

                        <div class="property-group">
                            <label class="property-label">Avatar/Emoji</label>
                            <div class="avatar-selector">
                                <input type="text" class="property-input avatar-input"
                                       value="${this.escapeHtml(character.avatar || '')}"
                                       placeholder="👤"
                                       maxlength="2"
                                       onchange="AdventureCreator.modules['character-interaction'].updateCharacterProperty('avatar', this.value)">
                                <div class="avatar-presets">
                                    ${['👤', '👨', '👩', '🧙', '👮', '🛡️', '💂', '🧝', '🧚', '👸', '🤴', '🧛'].map(emoji => `
                                        <button class="avatar-preset ${character.avatar === emoji ? 'active' : ''}"
                                                onclick="AdventureCreator.modules['character-interaction'].updateCharacterProperty('avatar', '${emoji}')">${emoji}</button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="property-group">
                            <label class="property-label">Location</label>
                            <select class="property-select" onchange="AdventureCreator.modules['character-interaction'].updateCharacterProperty('location', parseInt(this.value))">
                                <option value="-1" ${character.location === -1 ? 'selected' : ''}>Roaming/Multiple locations</option>
                                ${this.getGameLocations().map((loc, index) => `
                                    <option value="${index}" ${character.location === index ? 'selected' : ''}>
                                        ${this.escapeHtml(loc.name || `Location ${index}`)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="property-group full-width">
                            <label class="property-label">Description</label>
                            <textarea class="property-textarea"
                                      placeholder="Describe this character's appearance and demeanor..."
                                      onchange="AdventureCreator.modules['character-interaction'].updateCharacterProperty('description', this.value)">${this.escapeHtml(character.description || '')}</textarea>
                        </div>
                    </div>
                </div>
            `;
        },

        renderPersonalitySection(character) {
            if (!character.personality) character.personality = {};

            return `
                <div class="property-section">
                    <h4>🎭 Personality & Traits</h4>

                    <div class="personality-grid">
                        <div class="trait-group">
                            <label class="trait-label">Friendliness</label>
                            <div class="trait-slider">
                                <span class="trait-min">Hostile</span>
                                <input type="range" class="trait-range" min="0" max="100"
                                       value="${character.personality.friendliness || 50}"
                                       onchange="AdventureCreator.modules['character-interaction'].updatePersonalityTrait('friendliness', this.value)">
                                <span class="trait-max">Friendly</span>
                            </div>
                            <div class="trait-value">${character.personality.friendliness || 50}/100</div>
                        </div>

                        <div class="trait-group">
                            <label class="trait-label">Talkativeness</label>
                            <div class="trait-slider">
                                <span class="trait-min">Silent</span>
                                <input type="range" class="trait-range" min="0" max="100"
                                       value="${character.personality.talkativeness || 50}"
                                       onchange="AdventureCreator.modules['character-interaction'].updatePersonalityTrait('talkativeness', this.value)">
                                <span class="trait-max">Chatty</span>
                            </div>
                            <div class="trait-value">${character.personality.talkativeness || 50}/100</div>
                        </div>

                        <div class="trait-group">
                            <label class="trait-label">Helpfulness</label>
                            <div class="trait-slider">
                                <span class="trait-min">Unhelpful</span>
                                <input type="range" class="trait-range" min="0" max="100"
                                       value="${character.personality.helpfulness || 50}"
                                       onchange="AdventureCreator.modules['character-interaction'].updatePersonalityTrait('helpfulness', this.value)">
                                <span class="trait-max">Helpful</span>
                            </div>
                            <div class="trait-value">${character.personality.helpfulness || 50}/100</div>
                        </div>

                        <div class="trait-group">
                            <label class="trait-label">Trust Level</label>
                            <div class="trait-slider">
                                <span class="trait-min">Suspicious</span>
                                <input type="range" class="trait-range" min="0" max="100"
                                       value="${character.personality.trust || 50}"
                                       onchange="AdventureCreator.modules['character-interaction'].updatePersonalityTrait('trust', this.value)">
                                <span class="trait-max">Trusting</span>
                            </div>
                            <div class="trait-value">${character.personality.trust || 50}/100</div>
                        </div>
                    </div>

                    <div class="personality-summary">
                        <strong>Personality Summary:</strong> ${this.generatePersonalitySummary(character.personality)}
                    </div>
                </div>
            `;
        },

        renderDialoguePreview(character) {
            const dialogues = character.dialogues || [];

            return `
                <div class="property-section">
                    <h4>💬 Dialogue System</h4>

                    <div class="dialogue-controls">
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['character-interaction'].addDialogue()">
                            ➕ Add Dialogue
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['character-interaction'].openDialogueEditor()">
                            🎭 Advanced Editor
                        </button>
                    </div>

                    ${dialogues.length > 0 ? `
                        <div class="dialogue-list">
                            ${dialogues.slice(0, 3).map((dialogue, index) => `
                                <div class="dialogue-item">
                                    <div class="dialogue-trigger">${this.escapeHtml(dialogue.trigger || 'Default greeting')}</div>
                                    <div class="dialogue-response">"${this.escapeHtml(dialogue.response || 'Hello there!')}"</div>
                                    <div class="dialogue-actions">
                                        <button class="btn-icon" onclick="AdventureCreator.modules['character-interaction'].editDialogue(${index})">✏️</button>
                                        <button class="btn-icon" onclick="AdventureCreator.modules['character-interaction'].removeDialogue(${index})">🗑️</button>
                                    </div>
                                </div>
                            `).join('')}
                            ${dialogues.length > 3 ? `
                                <div class="dialogue-more">
                                    + ${dialogues.length - 3} more dialogue${dialogues.length > 4 ? 's' : ''}...
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="dialogue-empty">
                            <div class="empty-icon">💬</div>
                            <div class="empty-text">No dialogues yet. Add some conversation options!</div>
                        </div>
                    `}
                </div>
            `;
        },

        renderBehaviorPreview(character) {
            const behaviors = character.behaviors || [];

            return `
                <div class="property-section">
                    <h4>🧠 Behavior System</h4>

                    <div class="behavior-controls">
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['character-interaction'].addBehavior()">
                            ➕ Add Behavior
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['character-interaction'].openBehaviorEditor()">
                            🧠 Advanced Editor
                        </button>
                    </div>

                    ${behaviors.length > 0 ? `
                        <div class="behavior-list">
                            ${behaviors.slice(0, 3).map((behavior, index) => `
                                <div class="behavior-item">
                                    <div class="behavior-type">${this.getBehaviorTypeIcon(behavior.type)} ${this.escapeHtml(behavior.type || 'Custom')}</div>
                                    <div class="behavior-description">${this.escapeHtml(behavior.description || 'No description')}</div>
                                    <div class="behavior-frequency">Triggers: ${this.escapeHtml(behavior.frequency || 'Sometimes')}</div>
                                </div>
                            `).join('')}
                            ${behaviors.length > 3 ? `
                                <div class="behavior-more">
                                    + ${behaviors.length - 3} more behavior${behaviors.length > 4 ? 's' : ''}...
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="behavior-empty">
                            <div class="empty-icon">🧠</div>
                            <div class="empty-text">No behaviors yet. Define how this character acts!</div>
                        </div>
                    `}
                </div>
            `;
        },

        renderDialogueSystem() {
            return `
                <div class="dialogue-system-container">
                    <div class="system-header">
                        <h3>💬 Advanced Dialogue System</h3>
                        <p>Create sophisticated conversation trees, branching dialogues, and dynamic character interactions.</p>
                    </div>

                    <div class="dialogue-types-grid">
                        ${this.getDialogueTypes().map(type => `
                            <div class="dialogue-type-card" onclick="AdventureCreator.modules['character-interaction'].selectDialogueType('${type.id}')">
                                <div class="type-header">
                                    <div class="type-icon">${type.icon}</div>
                                    <div class="type-name">${this.escapeHtml(type.name)}</div>
                                </div>
                                <div class="type-description">${this.escapeHtml(type.description)}</div>
                                <div class="type-examples">
                                    ${type.examples.map(example => `
                                        <div class="example-item">💡 ${this.escapeHtml(example)}</div>
                                    `).join('')}
                                </div>
                                <div class="type-complexity">
                                    <span class="complexity-badge ${type.complexity}">${type.complexity}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderBehaviorAI() {
            return `
                <div class="behavior-ai-container">
                    <div class="ai-header">
                        <h3>🧠 Character Behavior AI</h3>
                        <p>Define how characters think, react, and behave in different situations.</p>
                    </div>

                    <div class="behavior-categories">
                        ${this.getBehaviorCategories().map(category => `
                            <div class="behavior-category">
                                <div class="category-header">
                                    <h4>${category.icon} ${this.escapeHtml(category.name)}</h4>
                                    <span class="category-complexity ${category.complexity}">${category.complexity}</span>
                                </div>
                                <div class="category-description">${this.escapeHtml(category.description)}</div>
                                <div class="behavior-patterns">
                                    ${category.patterns.map(pattern => `
                                        <div class="pattern-item" onclick="AdventureCreator.modules['character-interaction'].selectBehaviorPattern('${pattern.id}')">
                                            <div class="pattern-name">${this.escapeHtml(pattern.name)}</div>
                                            <div class="pattern-description">${this.escapeHtml(pattern.description)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderInteractionPatterns() {
            return `
                <div class="interaction-patterns-container">
                    <div class="patterns-header">
                        <h3>🔄 Common Interaction Patterns</h3>
                        <p>Pre-built interaction patterns and DAAD code examples for common NPC behaviors.</p>
                    </div>

                    <div class="patterns-grid">
                        ${this.getInteractionPatterns().map(pattern => `
                            <div class="pattern-card">
                                <div class="pattern-header">
                                    <div class="pattern-title">${pattern.icon} ${this.escapeHtml(pattern.name)}</div>
                                    <div class="pattern-category">${this.escapeHtml(pattern.category)}</div>
                                </div>
                                <div class="pattern-description">${this.escapeHtml(pattern.description)}</div>
                                <div class="pattern-code">
                                    <div class="code-header">DAAD Implementation:</div>
                                    <pre class="code-block"><code>${this.escapeHtml(pattern.daadCode)}</code></pre>
                                </div>
                                <div class="pattern-explanation">${this.escapeHtml(pattern.explanation)}</div>
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['character-interaction'].applyPattern('${pattern.id}')">
                                    Apply Pattern
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderCharacterGallery() {
            return `
                <div class="character-gallery-container">
                    <div class="gallery-header">
                        <h3>🎨 Character Gallery & Templates</h3>
                        <p>Ready-to-use character templates for common adventure roles.</p>
                    </div>

                    <div class="template-categories">
                        ${Object.entries(this.groupTemplatesByCategory()).map(([category, templates]) => `
                            <div class="template-category">
                                <h4>${this.getCategoryIcon(category)} ${this.getCategoryName(category)}</h4>
                                <div class="templates-grid">
                                    ${templates.map(template => {
                                        const isFavorite = AdventureCreator.state.characterInteraction.favoriteTemplates.has(template.id);
                                        return `
                                            <div class="template-card" style="position: relative;">
                                                <button class="favorite-btn"
                                                        onclick="event.stopPropagation(); AdventureCreator.modules['character-interaction'].toggleFavoriteTemplate('${template.id}')"
                                                        title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                                                        style="position: absolute; top: 5px; right: 5px; background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 0;">
                                                    ${isFavorite ? '⭐' : '☆'}
                                                </button>
                                                <div class="template-avatar">${template.avatar}</div>
                                                <div class="template-info">
                                                    <div class="template-name">${this.escapeHtml(template.name)}</div>
                                                    <div class="template-role">${this.escapeHtml(template.role)}</div>
                                                    <div class="template-description">${this.escapeHtml(template.description)}</div>
                                                </div>
                                                <div class="template-features">
                                                    ${template.features.map(feature => `
                                                        <span class="feature-tag">${this.escapeHtml(feature)}</span>
                                                    `).join('')}
                                                </div>
                                                <button class="btn btn-primary" onclick="AdventureCreator.modules['character-interaction'].useTemplate('${template.id}')">
                                                    Use Template
                                                </button>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        // Helper methods
        getCharacterComplexity(character) {
            const dialogueCount = character.dialogues ? character.dialogues.length : 0;
            const behaviorCount = character.behaviors ? character.behaviors.length : 0;
            const totalComplexity = dialogueCount + behaviorCount;

            if (totalComplexity === 0) return { level: 'basic', label: 'Basic' };
            if (totalComplexity < 5) return { level: 'intermediate', label: 'Interactive' };
            return { level: 'advanced', label: 'Complex' };
        },

        getGameLocations() {
            const game = AdventureCreator.getCurrentGame();
            return (game && game.daad && game.daad.locations) ? game.daad.locations : [];
        },

        generatePersonalitySummary(personality) {
            if (!personality) return 'No personality defined yet.';

            const traits = [];

            if (personality.friendliness > 70) traits.push('friendly');
            else if (personality.friendliness < 30) traits.push('hostile');

            if (personality.talkativeness > 70) traits.push('talkative');
            else if (personality.talkativeness < 30) traits.push('quiet');

            if (personality.helpfulness > 70) traits.push('helpful');
            else if (personality.helpfulness < 30) traits.push('unhelpful');

            if (personality.trust > 70) traits.push('trusting');
            else if (personality.trust < 30) traits.push('suspicious');

            return traits.length > 0 ? `A ${traits.join(', ')} character.` : 'Balanced personality.';
        },

        getBehaviorTypeIcon(type) {
            const icons = {
                'reactive': '⚡',
                'proactive': '🎯',
                'emotional': '❤️',
                'territorial': '🛡️',
                'curious': '🔍',
                'merchant': '💰',
                'guard': '👮',
                'custom': '🎭'
            };
            return icons[type] || '🎭';
        },

        getDialogueTypes() {
            return [
                {
                    id: 'simple_greetings',
                    name: 'Simple Greetings',
                    icon: '👋',
                    description: 'Basic hello/goodbye conversations',
                    complexity: 'basic',
                    examples: ['Hello there!', 'Good day to you!', 'Farewell, traveler.']
                },
                {
                    id: 'merchant_trade',
                    name: 'Merchant Trading',
                    icon: '💰',
                    description: 'Buy/sell item conversations',
                    complexity: 'intermediate',
                    examples: ['What would you like to buy?', 'I have fine goods for sale.', 'That will cost you 50 gold.']
                },
                {
                    id: 'quest_dialogue',
                    name: 'Quest Dialogues',
                    icon: '📜',
                    description: 'Mission and quest conversations',
                    complexity: 'advanced',
                    examples: ['I need your help with something...', 'Have you completed the task?', 'Here is your reward.']
                },
                {
                    id: 'branching_conversation',
                    name: 'Branching Trees',
                    icon: '🌳',
                    description: 'Complex multi-choice conversations',
                    complexity: 'advanced',
                    examples: ['Choose your response wisely...', 'Multiple conversation paths', 'Consequences affect relationships']
                }
            ];
        },

        getBehaviorCategories() {
            return [
                {
                    name: 'Reactive Behaviors',
                    icon: '⚡',
                    complexity: 'basic',
                    description: 'How characters respond to player actions',
                    patterns: [
                        { id: 'defensive', name: 'Defensive Response', description: 'Character protects themselves when threatened' },
                        { id: 'helpful', name: 'Helpful Response', description: 'Character offers assistance' },
                        { id: 'fearful', name: 'Fearful Response', description: 'Character shows fear or retreats' }
                    ]
                },
                {
                    name: 'Proactive Behaviors',
                    icon: '🎯',
                    complexity: 'intermediate',
                    description: 'Actions characters take on their own',
                    patterns: [
                        { id: 'wandering', name: 'Wandering Movement', description: 'Character moves between locations' },
                        { id: 'initiate_conversation', name: 'Start Conversations', description: 'Character talks to player first' },
                        { id: 'perform_tasks', name: 'Perform Tasks', description: 'Character does activities automatically' }
                    ]
                },
                {
                    name: 'Emotional Behaviors',
                    icon: '❤️',
                    complexity: 'advanced',
                    description: 'Mood and relationship systems',
                    patterns: [
                        { id: 'mood_changes', name: 'Mood Changes', description: 'Character emotions shift over time' },
                        { id: 'relationship_tracking', name: 'Relationship Memory', description: 'Character remembers past interactions' },
                        { id: 'emotional_responses', name: 'Emotional Reactions', description: 'Responses based on current mood' }
                    ]
                }
            ];
        },

        getInteractionPatterns() {
            return [
                {
                    id: 'basic_greeting',
                    name: 'Basic Greeting',
                    icon: '👋',
                    category: 'Simple',
                    description: 'Character responds when player talks to them',
                    daadCode: `// Basic greeting pattern
VERB talk
NOUN character_name
MESSAGE "Hello there, traveler!"
DONE`,
                    explanation: 'Simple pattern where NPC responds to TALK TO commands with a greeting message.'
                },
                {
                    id: 'merchant_interaction',
                    name: 'Merchant Trading',
                    icon: '💰',
                    category: 'Functional',
                    description: 'Buy and sell items with an NPC merchant',
                    daadCode: `// Merchant trading pattern
VERB buy
PRESENT merchant
CARRIED gold 50    // Player has enough gold
CREATE sword       // Give item to player
SUB 50 gold_flag   // Deduct gold
MESSAGE "Here's your sword! That'll be 50 gold."
DONE`,
                    explanation: 'Trading pattern that checks for currency, gives items, and deducts payment.'
                },
                {
                    id: 'guard_behavior',
                    name: 'Guard Blocking',
                    icon: '🛡️',
                    category: 'Functional',
                    description: 'Guard prevents access without proper authorization',
                    daadCode: `// Guard blocking pattern
AT guard_post
VERB enter
NOTCARR pass_token
MESSAGE "Halt! You need a pass to enter here."
DONE

// Allow entry with pass
AT guard_post
VERB enter
CARRIED pass_token
MESSAGE "Your papers are in order. You may pass."
GOTO restricted_area
DONE`,
                    explanation: 'Guard pattern that blocks movement unless player has required item.'
                },
                {
                    id: 'quest_giver',
                    name: 'Quest Giver',
                    icon: '📜',
                    category: 'Story',
                    description: 'NPC gives quests and tracks completion',
                    daadCode: `// Quest giver pattern
VERB talk
NOUN quest_giver
ZERO quest_flag    // Quest not started
MESSAGE "I need someone brave to retrieve the ancient artifact..."
SET quest_flag 1   // Mark quest as started
DONE

// Check quest completion
VERB talk
NOUN quest_giver
EQ quest_flag 1    // Quest in progress
CARRIED artifact
MESSAGE "You found it! Here's your reward."
CREATE gold_pouch
SET quest_flag 2   // Mark quest complete
DONE`,
                    explanation: 'Quest system using flags to track progress and provide appropriate responses.'
                }
            ];
        },

        groupTemplatesByCategory() {
            const templates = this.getCharacterTemplates();
            const grouped = {};

            templates.forEach(template => {
                if (!grouped[template.category]) {
                    grouped[template.category] = [];
                }
                grouped[template.category].push(template);
            });

            return grouped;
        },

        getCharacterTemplates() {
            return [
                {
                    id: 'basic_merchant',
                    name: 'Village Merchant',
                    role: 'Shopkeeper',
                    category: 'functional',
                    avatar: '🛒',
                    description: 'A friendly shopkeeper who buys and sells basic items.',
                    features: ['Trading System', 'Item Inventory', 'Price Negotiation']
                },
                {
                    id: 'town_guard',
                    name: 'Town Guard',
                    role: 'Security',
                    category: 'functional',
                    avatar: '🛡️',
                    description: 'A vigilant guard who protects the town and enforces rules.',
                    features: ['Access Control', 'Law Enforcement', 'Combat Ready']
                },
                {
                    id: 'wise_sage',
                    name: 'Wise Sage',
                    role: 'Advisor',
                    category: 'story',
                    avatar: '🧙',
                    description: 'An elderly sage with knowledge of ancient mysteries.',
                    features: ['Lore Knowledge', 'Riddles & Clues', 'Magical Insights']
                },
                {
                    id: 'tavern_keeper',
                    name: 'Tavern Keeper',
                    role: 'Host',
                    category: 'social',
                    avatar: '🍺',
                    description: 'A jolly tavern keeper who knows all the local gossip.',
                    features: ['Information Hub', 'Room & Board', 'Local Rumors']
                }
            ];
        },

        getCategoryIcon(category) {
            const icons = {
                'functional': '⚙️',
                'story': '📚',
                'social': '👥',
                'combat': '⚔️'
            };
            return icons[category] || '👤';
        },

        getCategoryName(category) {
            const names = {
                'functional': 'Functional NPCs',
                'story': 'Story Characters',
                'social': 'Social Characters',
                'combat': 'Combat Characters'
            };
            return names[category] || category;
        },

        // Action methods
        switchTab(tabId) {
            try {
                AdventureCreator.state.characterInteraction.selectedTab = tabId;
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error switching tab:', error);
                this.showNotification('Failed to switch tab', 'error');
            }
        },

        createCharacter() {
            try {
                const game = AdventureCreator.getCurrentGame();
                if (!game.daad.characters) game.daad.characters = [];

                const newCharacter = {
                    name: `Character ${game.daad.characters.length + 1}`,
                    role: 'NPC',
                    avatar: '👤',
                    location: 0,
                    description: '',
                    personality: {
                        friendliness: 50,
                        talkativeness: 50,
                        helpfulness: 50,
                        trust: 50
                    },
                    dialogues: [],
                    behaviors: []
                };

                game.daad.characters.push(newCharacter);
                AdventureCreator.state.characterInteraction.selectedCharacter = game.daad.characters.length - 1;
                this.addToRecent(game.daad.characters.length - 1);
                this.saveToStorage();
                this.showNotification('Character created successfully', 'success');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error creating character:', error);
                this.showNotification('Failed to create character', 'error');
            }
        },

        selectCharacter(index) {
            try {
                AdventureCreator.state.characterInteraction.selectedCharacter = index;
                this.addToRecent(index);
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error selecting character:', error);
                this.showNotification('Failed to select character', 'error');
            }
        },

        toggleFavoriteCharacter(index) {
            try {
                const state = AdventureCreator.state.characterInteraction;
                if (state.favoriteCharacters.has(index)) {
                    state.favoriteCharacters.delete(index);
                    this.showNotification('Removed from favorites', 'info');
                } else {
                    state.favoriteCharacters.add(index);
                    this.showNotification('Added to favorites', 'success');
                }
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error toggling favorite:', error);
                this.showNotification('Failed to update favorites', 'error');
            }
        },

        toggleFavoriteTemplate(templateId) {
            try {
                const state = AdventureCreator.state.characterInteraction;
                if (state.favoriteTemplates.has(templateId)) {
                    state.favoriteTemplates.delete(templateId);
                    this.showNotification('Removed template from favorites', 'info');
                } else {
                    state.favoriteTemplates.add(templateId);
                    this.showNotification('Added template to favorites', 'success');
                }
                this.saveToStorage();
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error toggling favorite template:', error);
                this.showNotification('Failed to update template favorites', 'error');
            }
        },

        addToRecent(index) {
            try {
                const state = AdventureCreator.state.characterInteraction;
                state.recentCharacters = state.recentCharacters.filter(i => i !== index);
                state.recentCharacters.unshift(index);
                if (state.recentCharacters.length > 10) {
                    state.recentCharacters = state.recentCharacters.slice(0, 10);
                }
            } catch (error) {
                console.error('Error adding to recent:', error);
            }
        },

        updateCharacterProperty(property, value) {
            try {
                const game = AdventureCreator.getCurrentGame();
                const index = AdventureCreator.state.characterInteraction.selectedCharacter;

                if (index !== null && game.daad.characters[index]) {
                    game.daad.characters[index][property] = value;
                    this.saveToStorage();
                    AdventureCreator.navigate('editor');
                }
            } catch (error) {
                console.error('Error updating character property:', error);
                this.showNotification('Failed to update character property', 'error');
            }
        },

        updatePersonalityTrait(trait, value) {
            try {
                const game = AdventureCreator.getCurrentGame();
                const index = AdventureCreator.state.characterInteraction.selectedCharacter;

                if (index !== null && game.daad.characters[index]) {
                    if (!game.daad.characters[index].personality) {
                        game.daad.characters[index].personality = {};
                    }
                    game.daad.characters[index].personality[trait] = parseInt(value);
                    this.saveToStorage();
                    AdventureCreator.navigate('editor');
                }
            } catch (error) {
                console.error('Error updating personality trait:', error);
                this.showNotification('Failed to update personality trait', 'error');
            }
        },

        setBehaviorComplexity(level) {
            try {
                AdventureCreator.state.characterInteraction.behaviorComplexity = level;
                this.saveToStorage();
            } catch (error) {
                console.error('Error setting behavior complexity:', error);
                this.showNotification('Failed to set behavior complexity', 'error');
            }
        },

        showTemplateModal() {
            try {
                const templates = this.getCharacterTemplates();
                const content = `
                    <div>
                        <h4 style="color: #fff; margin-bottom: 1rem;">Choose a Character Template</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            ${templates.map(template => `
                                <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;"
                                     onclick="AdventureCreator.modules['character-interaction'].useTemplate('${template.id}')"
                                     onmouseover="this.style.background='#1a1a1a'"
                                     onmouseout="this.style.background='#0a0a0a'">
                                    <div style="font-size: 2rem; text-align: center; margin-bottom: 0.5rem;">${template.avatar}</div>
                                    <div style="color: #fff; font-weight: 600; text-align: center; margin-bottom: 0.25rem;">${this.escapeHtml(template.name)}</div>
                                    <div style="color: #999; font-size: 0.875rem; text-align: center;">${this.escapeHtml(template.role)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                this.showModal(content, '📋 Character Templates', null, 'Cancel', false);
            } catch (error) {
                console.error('Error showing template modal:', error);
                this.showNotification('Failed to show templates', 'error');
            }
        },

        editCharacter(index) {
            this.selectCharacter(index);
        },

        duplicateCharacter(index) {
            try {
                const game = AdventureCreator.getCurrentGame();
                if (game.daad.characters[index]) {
                    const original = game.daad.characters[index];
                    const duplicate = JSON.parse(JSON.stringify(original)); // Deep copy
                    duplicate.name = `${original.name} (Copy)`;

                    game.daad.characters.push(duplicate);
                    AdventureCreator.state.characterInteraction.selectedCharacter = game.daad.characters.length - 1;
                    this.saveToStorage();
                    this.showNotification('Character duplicated successfully', 'success');
                    AdventureCreator.navigate('editor');
                }
            } catch (error) {
                console.error('Error duplicating character:', error);
                this.showNotification('Failed to duplicate character', 'error');
            }
        },

        deleteCharacter(index) {
            try {
                const game = AdventureCreator.getCurrentGame();
                const character = game.daad.characters[index];

                const content = `
                    <div style="margin-bottom: 1.5rem;">
                        <p style="color: #ccc;">Are you sure you want to delete this character? This action cannot be undone.</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                            <div style="color: #fff; font-weight: 600;">${this.escapeHtml(character.name || `Character ${index + 1}`)}</div>
                            <div style="color: #999; font-size: 0.875rem;">${this.escapeHtml(character.role || 'NPC')}</div>
                        </div>
                    </div>
                `;

                this.showModal(content, '🗑️ Delete Character', () => {
                    game.daad.characters.splice(index, 1);

                    // Update selected character index
                    if (AdventureCreator.state.characterInteraction.selectedCharacter === index) {
                        AdventureCreator.state.characterInteraction.selectedCharacter = null;
                    } else if (AdventureCreator.state.characterInteraction.selectedCharacter > index) {
                        AdventureCreator.state.characterInteraction.selectedCharacter--;
                    }

                    this.closeModal();
                    this.saveToStorage();
                    this.showNotification('Character deleted', 'success');
                    AdventureCreator.navigate('editor');
                }, 'Delete', true);
            } catch (error) {
                console.error('Error deleting character:', error);
                this.showNotification('Failed to delete character', 'error');
            }
        },

        previewCharacter() {
            try {
                const game = AdventureCreator.getCurrentGame();
                const index = AdventureCreator.state.characterInteraction.selectedCharacter;

                if (index !== null && game.daad.characters[index]) {
                    const character = game.daad.characters[index];
                    const content = `
                        <div style="text-align: center;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">${this.escapeHtml(character.avatar || '👤')}</div>
                            <h3 style="color: #fff; margin-bottom: 0.5rem;">${this.escapeHtml(character.name || 'Unnamed Character')}</h3>
                            <div style="color: #8b5cf6; margin-bottom: 1rem;">${this.escapeHtml(character.role || 'NPC')}</div>
                            <div style="color: #ccc; margin-bottom: 1.5rem;">${this.escapeHtml(character.description || 'No description')}</div>
                            <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; text-align: left;">
                                <h4 style="color: #fff; margin-bottom: 0.75rem;">Personality:</h4>
                                <div style="color: #999; font-size: 0.875rem;">
                                    ${this.generatePersonalitySummary(character.personality)}
                                </div>
                            </div>
                        </div>
                    `;

                    this.showModal(content, '👁️ Character Preview', null, 'Close', false);
                }
            } catch (error) {
                console.error('Error previewing character:', error);
                this.showNotification('Failed to preview character', 'error');
            }
        },

        testDialogue() {
            try {
                const content = `
                    <div style="color: #ccc;">
                        <h4 style="color: #fff; margin-bottom: 1rem;">🎭 Dialogue Testing</h4>
                        <p>This feature allows you to test conversation flows and dialogue trees in real-time.</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                            <div style="color: #8b5cf6; font-weight: 600; margin-bottom: 0.5rem;">Coming Soon:</div>
                            <ul style="margin: 0; padding-left: 1.5rem; color: #999;">
                                <li>Interactive dialogue simulator</li>
                                <li>Conversation tree visualization</li>
                                <li>Response branching preview</li>
                                <li>Character personality integration</li>
                            </ul>
                        </div>
                    </div>
                `;

                this.showModal(content, '🎭 Dialogue Testing', null, 'Close', false);
            } catch (error) {
                console.error('Error testing dialogue:', error);
                this.showNotification('Failed to open dialogue tester', 'error');
            }
        },

        addDialogue() {
            try {
                const content = `
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Trigger:</label>
                            <input type="text" id="dialogueTrigger" placeholder="e.g., talk, greet, ask about quest"
                                   style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Response:</label>
                            <textarea id="dialogueResponse" placeholder="What the character says..."
                                      style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem; min-height: 100px;"></textarea>
                        </div>
                    </div>
                `;

                this.showModal(content, '➕ Add Dialogue', () => {
                    const trigger = document.getElementById('dialogueTrigger').value.trim();
                    const response = document.getElementById('dialogueResponse').value.trim();

                    if (!trigger || !response) {
                        this.showNotification('Please fill in both trigger and response', 'error');
                        return;
                    }

                    const game = AdventureCreator.getCurrentGame();
                    const index = AdventureCreator.state.characterInteraction.selectedCharacter;

                    if (index !== null && game.daad.characters[index]) {
                        if (!game.daad.characters[index].dialogues) {
                            game.daad.characters[index].dialogues = [];
                        }
                        game.daad.characters[index].dialogues.push({ trigger, response });
                        this.closeModal();
                        this.saveToStorage();
                        this.showNotification('Dialogue added successfully', 'success');
                        AdventureCreator.navigate('editor');
                    }
                }, 'Add Dialogue', true);
            } catch (error) {
                console.error('Error adding dialogue:', error);
                this.showNotification('Failed to add dialogue', 'error');
            }
        },

        openDialogueEditor() {
            try {
                const content = `
                    <div style="color: #ccc;">
                        <h4 style="color: #fff; margin-bottom: 1rem;">🎭 Advanced Dialogue Editor</h4>
                        <p>The advanced dialogue editor provides comprehensive tools for creating complex conversation systems.</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                            <div style="color: #8b5cf6; font-weight: 600; margin-bottom: 0.5rem;">Features:</div>
                            <ul style="margin: 0; padding-left: 1.5rem; color: #999;">
                                <li>Visual conversation tree builder</li>
                                <li>Branching dialogue paths</li>
                                <li>Condition-based responses</li>
                                <li>Dialogue state management</li>
                                <li>Character emotion tracking</li>
                            </ul>
                        </div>
                    </div>
                `;

                this.showModal(content, '🎭 Advanced Dialogue Editor', null, 'Close', false);
            } catch (error) {
                console.error('Error opening dialogue editor:', error);
                this.showNotification('Failed to open dialogue editor', 'error');
            }
        },

        addBehavior() {
            try {
                const content = `
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Behavior Type:</label>
                            <select id="behaviorType"
                                    style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                                <option value="reactive">⚡ Reactive</option>
                                <option value="proactive">🎯 Proactive</option>
                                <option value="emotional">❤️ Emotional</option>
                                <option value="territorial">🛡️ Territorial</option>
                                <option value="custom">🎭 Custom</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Description:</label>
                            <textarea id="behaviorDescription" placeholder="Describe how this behavior works..."
                                      style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem; min-height: 100px;"></textarea>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Frequency:</label>
                            <select id="behaviorFrequency"
                                    style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                                <option value="always">Always</option>
                                <option value="often">Often</option>
                                <option value="sometimes">Sometimes</option>
                                <option value="rarely">Rarely</option>
                            </select>
                        </div>
                    </div>
                `;

                this.showModal(content, '➕ Add Behavior', () => {
                    const type = document.getElementById('behaviorType').value;
                    const description = document.getElementById('behaviorDescription').value.trim();
                    const frequency = document.getElementById('behaviorFrequency').value;

                    if (!description) {
                        this.showNotification('Please provide a behavior description', 'error');
                        return;
                    }

                    const game = AdventureCreator.getCurrentGame();
                    const index = AdventureCreator.state.characterInteraction.selectedCharacter;

                    if (index !== null && game.daad.characters[index]) {
                        if (!game.daad.characters[index].behaviors) {
                            game.daad.characters[index].behaviors = [];
                        }
                        game.daad.characters[index].behaviors.push({ type, description, frequency });
                        this.closeModal();
                        this.saveToStorage();
                        this.showNotification('Behavior added successfully', 'success');
                        AdventureCreator.navigate('editor');
                    }
                }, 'Add Behavior', true);
            } catch (error) {
                console.error('Error adding behavior:', error);
                this.showNotification('Failed to add behavior', 'error');
            }
        },

        openBehaviorEditor() {
            try {
                const content = `
                    <div style="color: #ccc;">
                        <h4 style="color: #fff; margin-bottom: 1rem;">🧠 Advanced Behavior Editor</h4>
                        <p>The advanced behavior editor provides AI-driven character behavior configuration.</p>
                        <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                            <div style="color: #8b5cf6; font-weight: 600; margin-bottom: 0.5rem;">Features:</div>
                            <ul style="margin: 0; padding-left: 1.5rem; color: #999;">
                                <li>Behavior state machines</li>
                                <li>Condition-based triggers</li>
                                <li>Priority-based execution</li>
                                <li>Character memory systems</li>
                                <li>Mood and emotion tracking</li>
                            </ul>
                        </div>
                    </div>
                `;

                this.showModal(content, '🧠 Advanced Behavior Editor', null, 'Close', false);
            } catch (error) {
                console.error('Error opening behavior editor:', error);
                this.showNotification('Failed to open behavior editor', 'error');
            }
        },

        editDialogue(index) {
            try {
                const game = AdventureCreator.getCurrentGame();
                const charIndex = AdventureCreator.state.characterInteraction.selectedCharacter;

                if (charIndex !== null && game.daad.characters[charIndex] && game.daad.characters[charIndex].dialogues) {
                    const dialogue = game.daad.characters[charIndex].dialogues[index];

                    const content = `
                        <div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Trigger:</label>
                                <input type="text" id="dialogueTrigger" value="${this.escapeHtml(dialogue.trigger || '')}" placeholder="e.g., talk, greet, ask about quest"
                                       style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem;">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; color: #ccc; margin-bottom: 0.5rem; font-weight: 600;">Response:</label>
                                <textarea id="dialogueResponse" placeholder="What the character says..."
                                          style="width: 100%; padding: 0.75rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white; font-size: 1rem; min-height: 100px;">${this.escapeHtml(dialogue.response || '')}</textarea>
                            </div>
                        </div>
                    `;

                    this.showModal(content, '✏️ Edit Dialogue', () => {
                        const trigger = document.getElementById('dialogueTrigger').value.trim();
                        const response = document.getElementById('dialogueResponse').value.trim();

                        if (!trigger || !response) {
                            this.showNotification('Please fill in both trigger and response', 'error');
                            return;
                        }

                        game.daad.characters[charIndex].dialogues[index] = { trigger, response };
                        this.closeModal();
                        this.saveToStorage();
                        this.showNotification('Dialogue updated successfully', 'success');
                        AdventureCreator.navigate('editor');
                    }, 'Update', true);
                }
            } catch (error) {
                console.error('Error editing dialogue:', error);
                this.showNotification('Failed to edit dialogue', 'error');
            }
        },

        removeDialogue(index) {
            try {
                const game = AdventureCreator.getCurrentGame();
                const charIndex = AdventureCreator.state.characterInteraction.selectedCharacter;

                if (charIndex !== null && game.daad.characters[charIndex] && game.daad.characters[charIndex].dialogues) {
                    const dialogue = game.daad.characters[charIndex].dialogues[index];

                    const content = `
                        <div style="margin-bottom: 1.5rem;">
                            <p style="color: #ccc;">Are you sure you want to remove this dialogue?</p>
                            <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
                                <div style="color: #fff; font-weight: 600;">${this.escapeHtml(dialogue.trigger || 'Untitled')}</div>
                                <div style="color: #999; font-size: 0.875rem;">"${this.escapeHtml(dialogue.response || '')}"</div>
                            </div>
                        </div>
                    `;

                    this.showModal(content, '🗑️ Remove Dialogue', () => {
                        game.daad.characters[charIndex].dialogues.splice(index, 1);
                        this.closeModal();
                        this.saveToStorage();
                        this.showNotification('Dialogue removed', 'success');
                        AdventureCreator.navigate('editor');
                    }, 'Remove', true);
                }
            } catch (error) {
                console.error('Error removing dialogue:', error);
                this.showNotification('Failed to remove dialogue', 'error');
            }
        },

        selectDialogueType(typeId) {
            try {
                this.showNotification(`Selected dialogue type: ${typeId}`, 'info');
            } catch (error) {
                console.error('Error selecting dialogue type:', error);
                this.showNotification('Failed to select dialogue type', 'error');
            }
        },

        selectBehaviorPattern(patternId) {
            try {
                this.showNotification(`Selected behavior pattern: ${patternId}`, 'info');
            } catch (error) {
                console.error('Error selecting behavior pattern:', error);
                this.showNotification('Failed to select behavior pattern', 'error');
            }
        },

        applyPattern(patternId) {
            try {
                this.showNotification(`Applied interaction pattern: ${patternId}`, 'success');
            } catch (error) {
                console.error('Error applying pattern:', error);
                this.showNotification('Failed to apply pattern', 'error');
            }
        },

        useTemplate(templateId) {
            try {
                const templates = this.getCharacterTemplates();
                const template = templates.find(t => t.id === templateId);

                if (!template) {
                    this.showNotification('Template not found', 'error');
                    return;
                }

                const game = AdventureCreator.getCurrentGame();
                if (!game.daad.characters) game.daad.characters = [];

                const newCharacter = {
                    name: template.name,
                    role: template.role,
                    avatar: template.avatar,
                    location: 0,
                    description: template.description,
                    personality: {
                        friendliness: 50,
                        talkativeness: 50,
                        helpfulness: 50,
                        trust: 50
                    },
                    dialogues: [],
                    behaviors: []
                };

                game.daad.characters.push(newCharacter);
                AdventureCreator.state.characterInteraction.selectedCharacter = game.daad.characters.length - 1;

                // Add to recent templates
                const state = AdventureCreator.state.characterInteraction;
                state.recentTemplates = state.recentTemplates.filter(id => id !== templateId);
                state.recentTemplates.unshift(templateId);
                if (state.recentTemplates.length > 10) {
                    state.recentTemplates = state.recentTemplates.slice(0, 10);
                }

                this.closeModal();
                this.saveToStorage();
                this.showNotification(`Created character from ${template.name} template`, 'success');
                AdventureCreator.navigate('editor');
            } catch (error) {
                console.error('Error using template:', error);
                this.showNotification('Failed to use template', 'error');
            }
        },

        // Help modal
        showHelpModal() {
            try {
                const content = `
                    <div style="color: #ccc;">
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">🎯 Getting Started</h3>
                            <p style="line-height: 1.6; margin: 0;">
                                The Character Interaction System allows you to create living, breathing NPCs with
                                personalities, dialogue trees, and intelligent behaviors.
                            </p>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">⌨️ Keyboard Shortcuts</h3>
                            <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.75rem; font-size: 0.875rem;">
                                    <div style="color: #8b5cf6; font-weight: 600;">F1</div>
                                    <div>Show this help modal</div>

                                    <div style="color: #8b5cf6; font-weight: 600;">Ctrl + S</div>
                                    <div>Save character data</div>

                                    <div style="color: #8b5cf6; font-weight: 600;">ESC</div>
                                    <div>Close current modal</div>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">🔧 Key Features</h3>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                                <li>Create and customize NPCs with unique personalities</li>
                                <li>Build dialogue systems with triggers and responses</li>
                                <li>Define character behaviors and AI patterns</li>
                                <li>Use pre-built templates for common character types</li>
                                <li>Track favorites and recent characters</li>
                                <li>Configure personality traits with sliders</li>
                            </ul>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">💡 Tips</h3>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                                <li>Use ⭐ to mark favorite characters and templates</li>
                                <li>Start with a template for common NPC types</li>
                                <li>Adjust personality sliders to create unique characters</li>
                                <li>Add multiple dialogues for varied conversations</li>
                                <li>All character data is saved automatically</li>
                            </ul>
                        </div>

                        <div>
                            <h3 style="color: #fff; margin-bottom: 0.75rem;">📚 Tabs Overview</h3>
                            <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem;">
                                <div style="font-size: 0.875rem; line-height: 1.8;">
                                    <div><strong>👤 Character Builder:</strong> Create and edit NPCs</div>
                                    <div><strong>💬 Dialogue System:</strong> Design conversation trees</div>
                                    <div><strong>🧠 Behavior AI:</strong> Configure character behaviors</div>
                                    <div><strong>🔄 Interaction Patterns:</strong> DAAD code examples</div>
                                    <div><strong>🎨 Character Gallery:</strong> Pre-built templates</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                this.showModal(content, '❓ Character Interaction Help', null, 'Close', false);
            } catch (error) {
                console.error('Error showing help modal:', error);
                this.showNotification('Failed to show help', 'error');
            }
        },

        // Modal System
        showModal(content, title, onConfirm, confirmText = 'Confirm', showCancel = true) {
            try {
                this.closeModal();

                const modal = document.createElement('div');
                modal.id = 'character-interaction-modal';
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.2s ease-in-out;
                `;

                const modalContent = document.createElement('div');
                modalContent.style.cssText = `
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 1rem;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    animation: slideIn 0.2s ease-out;
                `;

                modalContent.innerHTML = `
                    <div style="padding: 1.5rem; border-bottom: 1px solid #333;">
                        <h2 style="color: #fff; margin: 0; font-size: 1.25rem;">${title}</h2>
                    </div>
                    <div style="padding: 1.5rem;">
                        ${content}
                    </div>
                    <div style="padding: 1.5rem; border-top: 1px solid #333; display: flex; gap: 1rem; justify-content: flex-end;">
                        ${showCancel ? `
                            <button onclick="AdventureCreator.modules['character-interaction'].closeModal()"
                                    style="padding: 0.75rem 1.5rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                                Cancel
                            </button>
                        ` : ''}
                        <button onclick="${onConfirm ? `(${onConfirm.toString()})()` : `AdventureCreator.modules['character-interaction'].closeModal()`}"
                                style="padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                            ${confirmText}
                        </button>
                    </div>
                `;

                modal.appendChild(modalContent);
                document.body.appendChild(modal);

                // Click outside to close
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal();
                    }
                });

                // Add CSS animations
                if (!document.getElementById('modal-animations')) {
                    const style = document.createElement('style');
                    style.id = 'modal-animations';
                    style.textContent = `
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideIn {
                            from { transform: translateY(-20px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }
            } catch (error) {
                console.error('Error showing modal:', error);
            }
        },

        closeModal() {
            try {
                const modal = document.getElementById('character-interaction-modal');
                if (modal) {
                    modal.remove();
                }
            } catch (error) {
                console.error('Error closing modal:', error);
            }
        },

        showNotification(message, type = 'info', duration = 3000) {
            try {
                const notification = document.createElement('div');
                const colors = {
                    'success': '#10b981',
                    'error': '#ef4444',
                    'warning': '#f59e0b',
                    'info': '#3b82f6'
                };

                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    background: ${colors[type] || colors.info};
                    color: white;
                    border-radius: 0.5rem;
                    z-index: 10000;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    animation: slideInRight 0.3s ease-out;
                `;
                notification.textContent = message;
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transition = 'opacity 0.3s';
                    setTimeout(() => notification.remove(), 300);
                }, duration);
            } catch (error) {
                console.error('Error showing notification:', error);
            }
        },

        escapeHtml(unsafe) {
            if (typeof unsafe !== 'string') return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    });

    console.log('Character Interaction System registered successfully');
})();
