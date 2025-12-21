/**
 * DAAD Adventure Creator - Message Systems Module
 * Complete dynamic messaging and communication system
 */

(function() {
    'use strict';

    const MessageSystemsModule = {
        name: 'Message Systems',
        description: 'Dynamic messaging and communication',
        version: '1.0.0',
        author: 'DAAD Adventure Creator',

        // Module state
        state: {
            currentView: 'messages',
            searchQuery: '',
            filterCategory: 'ALL',
            editingMessageId: null
        },

        /**
         * Initialize the module
         */
        init: function() {
            console.log('Initializing Message Systems Module');
            this.loadData();
            this.injectStyles();
        },

        /**
         * Inject CSS styles
         */
        injectStyles: function() {
            if (document.getElementById('message-systems-styles')) return;

            const style = document.createElement('style');
            style.id = 'message-systems-styles';
            style.textContent = `
                .message-systems-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .message-header {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #8b5cf6;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .stat-card {
                    background: linear-gradient(135deg, var(--stat-color) 0%, var(--stat-color-dark) 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .stat-label {
                    font-size: 12px;
                    opacity: 0.9;
                    text-transform: uppercase;
                }

                .message-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .message-tab {
                    background: #34495e;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .message-tab:hover {
                    background: #3d566e;
                    transform: translateY(-2px);
                }

                .message-tab.active {
                    background: #8b5cf6;
                    font-weight: bold;
                }

                .message-content {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .message-controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .search-box {
                    flex: 1;
                    min-width: 200px;
                    padding: 10px;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .filter-select {
                    padding: 10px;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .messages-list {
                    max-height: 500px;
                    overflow-y: auto;
                }

                .message-item {
                    background: #f8f9fa;
                    border-left: 4px solid var(--message-color, #8b5cf6);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    transition: all 0.2s ease;
                }

                .message-item:hover {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transform: translateX(2px);
                }

                .message-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .message-item-id {
                    font-family: monospace;
                    font-weight: bold;
                    color: #2c3e50;
                }

                .message-item-category {
                    display: inline-block;
                    padding: 3px 10px;
                    background: var(--category-color, #6c757d);
                    color: white;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .message-item-text {
                    color: #495057;
                    line-height: 1.5;
                    margin-bottom: 10px;
                    word-wrap: break-word;
                }

                .message-item-variables {
                    display: flex;
                    gap: 5px;
                    flex-wrap: wrap;
                    margin-bottom: 10px;
                }

                .variable-chip {
                    background: #e8f4fd;
                    color: #3498db;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-family: monospace;
                }

                .message-item-actions {
                    display: flex;
                    gap: 5px;
                }

                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 15px;
                }

                .template-card {
                    background: #f8f9fa;
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .template-card:hover {
                    border-color: #8b5cf6;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
                    transform: translateY(-2px);
                }

                .template-card-name {
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .template-card-pattern {
                    color: #6c757d;
                    font-family: monospace;
                    font-size: 13px;
                    margin-bottom: 10px;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #95a5a6;
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
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
                    max-width: 600px;
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

                .form-group {
                    margin-bottom: 20px;
                }

                .form-label {
                    display: block;
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .form-input,
                .form-select,
                .form-textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                }

                .form-input:focus,
                .form-select:focus,
                .form-textarea:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }

                .form-textarea {
                    min-height: 100px;
                    resize: vertical;
                }

                .form-help {
                    font-size: 12px;
                    color: #6c757d;
                    margin-top: 5px;
                }

                .modal-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .category-system { --category-color: #2ecc71; --message-color: #2ecc71; }
                .category-narrative { --category-color: #8b5cf6; --message-color: #8b5cf6; }
                .category-interactive { --category-color: #f39c12; --message-color: #f39c12; }
                .category-debug { --category-color: #3498db; --message-color: #3498db; }
                .category-error { --category-color: #e74c3c; --message-color: #e74c3c; }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .template-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        /**
         * Load saved data
         */
        loadData: function() {
            const saved = localStorage.getItem('daad_message_systems_data');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    AdventureCreator.state.messages = {
                        ...this.getDefaultState(),
                        ...data
                    };
                } catch (e) {
                    console.error('Error loading message data:', e);
                    AdventureCreator.state.messages = this.getDefaultState();
                }
            } else {
                AdventureCreator.state.messages = this.getDefaultState();
            }
        },

        /**
         * Save data
         */
        saveData: function() {
            const data = {
                customMessages: AdventureCreator.state.messages.customMessages,
                templates: AdventureCreator.state.messages.templates,
                nextId: AdventureCreator.state.messages.nextId
            };
            localStorage.setItem('daad_message_systems_data', JSON.stringify(data));
        },

        /**
         * Get default state
         */
        getDefaultState: function() {
            return {
                systemMessages: this.getDefaultSystemMessages(),
                customMessages: [],
                templates: this.getDefaultTemplates(),
                nextId: 100,
                categories: ['SYSTEM', 'NARRATIVE', 'INTERACTIVE', 'DEBUG', 'ERROR']
            };
        },

        /**
         * Get default system messages
         */
        getDefaultSystemMessages: function() {
            return [
                { id: 1, text: "I can't do that.", category: 'SYSTEM', editable: true },
                { id: 2, text: "I don't understand.", category: 'SYSTEM', editable: true },
                { id: 3, text: "You can't go that way.", category: 'SYSTEM', editable: true },
                { id: 4, text: "You don't have that.", category: 'SYSTEM', editable: true },
                { id: 5, text: "You can't see that here.", category: 'SYSTEM', editable: true },
                { id: 6, text: "OK", category: 'SYSTEM', editable: true },
                { id: 7, text: "You are carrying nothing.", category: 'SYSTEM', editable: true },
                { id: 8, text: "Game saved.", category: 'SYSTEM', editable: true },
                { id: 9, text: "Game loaded.", category: 'SYSTEM', editable: true },
                { id: 10, text: "Are you sure? (Y/N)", category: 'SYSTEM', editable: true }
            ];
        },

        /**
         * Get default templates
         */
        getDefaultTemplates: function() {
            return [
                { name: 'player_action', pattern: 'You {action} the {object}.' },
                { name: 'item_description', pattern: 'The {item} is {description}.' },
                { name: 'location_entrance', pattern: 'You enter the {location}. {description}' },
                { name: 'success_message', pattern: 'Success! You have {achievement}.' },
                { name: 'error_message', pattern: 'Error: {error_description}' }
            ];
        },

        /**
         * Render the module
         */
        render: function() {
            const stats = this.getMessageStatistics();
            const currentView = this.state.currentView;

            return `
                <div class="message-systems-container">
                    <div class="message-header">
                        <h2>💬 Message Systems</h2>
                        <p style="color: #6c757d; margin: 5px 0;">
                            Dynamic messaging and communication for your DAAD adventure.
                        </p>
                    </div>

                    <div class="stats-grid">
                        ${this.renderStatCard('Total', stats.totalMessages, '#8b5cf6', '#6d28d9')}
                        ${this.renderStatCard('System', stats.systemMessages, '#2ecc71', '#27ae60')}
                        ${this.renderStatCard('Custom', stats.customMessages, '#3498db', '#2980b9')}
                        ${this.renderStatCard('Templates', stats.templates, '#f39c12', '#e67e22')}
                    </div>

                    <div class="message-tabs">
                        <button class="message-tab ${currentView === 'messages' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('message-systems').switchView('messages')">
                            📝 Messages
                        </button>
                        <button class="message-tab ${currentView === 'templates' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('message-systems').switchView('templates')">
                            🎨 Templates
                        </button>
                        <button class="message-tab ${currentView === 'system' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('message-systems').switchView('system')">
                            ⚙️ System Messages
                        </button>
                    </div>

                    <div class="message-content">
                        ${this.renderCurrentView()}
                    </div>
                </div>
            `;
        },

        /**
         * Render stat card
         */
        renderStatCard: function(label, value, color, colorDark) {
            return `
                <div class="stat-card" style="--stat-color: ${color}; --stat-color-dark: ${colorDark};">
                    <div class="stat-value">${value}</div>
                    <div class="stat-label">${label}</div>
                </div>
            `;
        },

        /**
         * Render current view
         */
        renderCurrentView: function() {
            switch (this.state.currentView) {
                case 'messages':
                    return this.renderMessagesView();
                case 'templates':
                    return this.renderTemplatesView();
                case 'system':
                    return this.renderSystemView();
                default:
                    return this.renderMessagesView();
            }
        },

        /**
         * Render messages view
         */
        renderMessagesView: function() {
            const messages = this.getFilteredMessages();

            return `
                <div class="message-controls">
                    <input type="text" class="search-box" placeholder="Search messages..."
                           value="${this.state.searchQuery}"
                           onkeyup="AdventureCreator.getModule('message-systems').setSearchQuery(this.value)">
                    <select class="filter-select"
                            onchange="AdventureCreator.getModule('message-systems').setFilterCategory(this.value)">
                        <option value="ALL" ${this.state.filterCategory === 'ALL' ? 'selected' : ''}>All Categories</option>
                        <option value="NARRATIVE" ${this.state.filterCategory === 'NARRATIVE' ? 'selected' : ''}>Narrative</option>
                        <option value="INTERACTIVE" ${this.state.filterCategory === 'INTERACTIVE' ? 'selected' : ''}>Interactive</option>
                        <option value="DEBUG" ${this.state.filterCategory === 'DEBUG' ? 'selected' : ''}>Debug</option>
                        <option value="ERROR" ${this.state.filterCategory === 'ERROR' ? 'selected' : ''}>Error</option>
                    </select>
                    <button class="btn btn-primary"
                            onclick="AdventureCreator.getModule('message-systems').createMessage()">
                        ➕ New Message
                    </button>
                    <button class="btn btn-success"
                            onclick="AdventureCreator.getModule('message-systems').exportMessages()">
                        💾 Export DAAD
                    </button>
                </div>

                <div class="messages-list">
                    ${messages.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">💬</div>
                            <h3>No Messages</h3>
                            <p>Create your first message to get started!</p>
                        </div>
                    ` : messages.map(msg => this.renderMessageItem(msg)).join('')}
                </div>
            `;
        },

        /**
         * Render message item
         */
        renderMessageItem: function(message) {
            const variables = this.extractVariables(message.text);
            const categoryClass = `category-${message.category.toLowerCase()}`;

            return `
                <div class="message-item ${categoryClass}">
                    <div class="message-item-header">
                        <span class="message-item-id">MSG ${message.id}</span>
                        <span class="message-item-category">${message.category}</span>
                    </div>
                    <div class="message-item-text">${this.escapeHtml(message.text)}</div>
                    ${variables.length > 0 ? `
                        <div class="message-item-variables">
                            ${variables.map(v => `<span class="variable-chip">{${v}}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="message-item-actions">
                        <button class="btn btn-secondary btn-sm"
                                onclick="AdventureCreator.getModule('message-systems').editMessage(${message.id})">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger btn-sm"
                                onclick="AdventureCreator.getModule('message-systems').deleteMessage(${message.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * Render templates view
         */
        renderTemplatesView: function() {
            const templates = AdventureCreator.state.messages.templates;

            return `
                <div style="margin-bottom: 20px;">
                    <button class="btn btn-primary"
                            onclick="AdventureCreator.getModule('message-systems').createTemplate()">
                        ➕ New Template
                    </button>
                </div>

                <div class="template-grid">
                    ${templates.map(template => `
                        <div class="template-card"
                             onclick="AdventureCreator.getModule('message-systems').useTemplate('${template.name}')">
                            <div class="template-card-name">${template.name}</div>
                            <div class="template-card-pattern">${this.escapeHtml(template.pattern)}</div>
                            <div style="display: flex; gap: 5px; margin-top: 10px;">
                                <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); AdventureCreator.getModule('message-systems').useTemplate('${template.name}')">
                                    Use
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); AdventureCreator.getModule('message-systems').deleteTemplate('${template.name}')">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        /**
         * Render system view
         */
        renderSystemView: function() {
            const systemMessages = AdventureCreator.state.messages.systemMessages;

            return `
                <p style="color: #6c757d; margin-bottom: 20px;">
                    Customize DAAD's built-in system messages.
                </p>

                <div class="messages-list">
                    ${systemMessages.map(msg => `
                        <div class="message-item category-system">
                            <div class="message-item-header">
                                <span class="message-item-id">SYS MSG ${msg.id}</span>
                                <span class="message-item-category">SYSTEM</span>
                            </div>
                            <div class="message-item-text">${this.escapeHtml(msg.text)}</div>
                            <div class="message-item-actions">
                                <button class="btn btn-secondary btn-sm"
                                        onclick="AdventureCreator.getModule('message-systems').editSystemMessage(${msg.id})">
                                    ✏️ Edit
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        /**
         * Get filtered messages
         */
        getFilteredMessages: function() {
            let messages = AdventureCreator.state.messages.customMessages;

            // Apply category filter
            if (this.state.filterCategory !== 'ALL') {
                messages = messages.filter(m => m.category === this.state.filterCategory);
            }

            // Apply search filter
            if (this.state.searchQuery) {
                const query = this.state.searchQuery.toLowerCase();
                messages = messages.filter(m =>
                    m.text.toLowerCase().includes(query) ||
                    m.id.toString().includes(query)
                );
            }

            return messages;
        },

        /**
         * Get message statistics
         */
        getMessageStatistics: function() {
            const system = AdventureCreator.state.messages.systemMessages;
            const custom = AdventureCreator.state.messages.customMessages;

            return {
                totalMessages: system.length + custom.length,
                systemMessages: system.length,
                customMessages: custom.length,
                templates: AdventureCreator.state.messages.templates.length
            };
        },

        /**
         * Extract variables from text
         */
        extractVariables: function(text) {
            const matches = text.match(/\{([^}]+)\}/g);
            return matches ? matches.map(match => match.slice(1, -1)) : [];
        },

        /**
         * Switch view
         */
        switchView: function(view) {
            this.state.currentView = view;
            AdventureCreator.navigate('message-systems');
        },

        /**
         * Set search query
         */
        setSearchQuery: function(query) {
            this.state.searchQuery = query;
            AdventureCreator.navigate('message-systems');
        },

        /**
         * Set filter category
         */
        setFilterCategory: function(category) {
            this.state.filterCategory = category;
            AdventureCreator.navigate('message-systems');
        },

        /**
         * Create message with modal
         */
        createMessage: function() {
            this.showMessageModal();
        },

        /**
         * Edit message
         */
        editMessage: function(id) {
            const message = AdventureCreator.state.messages.customMessages.find(m => m.id === id);
            if (message) {
                this.showMessageModal(message);
            }
        },

        /**
         * Edit system message
         */
        editSystemMessage: function(id) {
            const message = AdventureCreator.state.messages.systemMessages.find(m => m.id === id);
            if (message && message.editable) {
                this.showMessageModal(message, true);
            }
        },

        /**
         * Show message modal
         */
        showMessageModal: function(message = null, isSystem = false) {
            const isEditing = message !== null;
            const modalTitle = isEditing ? 'Edit Message' : 'Create New Message';

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };

            modal.innerHTML = `
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${modalTitle}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>

                    <div class="modal-body">
                        ${!isSystem ? `
                            <div class="form-group">
                                <label class="form-label">Message ID</label>
                                <input type="number" class="form-input" id="message-id"
                                       value="${message ? message.id : AdventureCreator.state.messages.nextId}"
                                       ${isEditing ? 'readonly' : ''}>
                                <div class="form-help">Unique identifier for this message</div>
                            </div>
                        ` : ''}

                        ${!isSystem ? `
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select class="form-select" id="message-category">
                                    <option value="NARRATIVE" ${message?.category === 'NARRATIVE' ? 'selected' : ''}>Narrative</option>
                                    <option value="INTERACTIVE" ${message?.category === 'INTERACTIVE' ? 'selected' : ''}>Interactive</option>
                                    <option value="DEBUG" ${message?.category === 'DEBUG' ? 'selected' : ''}>Debug</option>
                                    <option value="ERROR" ${message?.category === 'ERROR' ? 'selected' : ''}>Error</option>
                                </select>
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <label class="form-label">Message Text</label>
                            <textarea class="form-textarea" id="message-text"
                                      placeholder="Enter your message text... Use {variable} for substitution">${message ? message.text : ''}</textarea>
                            <div class="form-help">Use {variable} syntax for dynamic content</div>
                        </div>

                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                                Cancel
                            </button>
                            <button class="btn btn-success"
                                    onclick="AdventureCreator.getModule('message-systems').saveMessage(${isEditing}, ${isSystem})">
                                💾 Save Message
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        /**
         * Save message
         */
        saveMessage: function(isEditing, isSystem) {
            const text = document.getElementById('message-text').value.trim();

            if (!text) {
                alert('Please enter message text');
                return;
            }

            if (isSystem) {
                // Update system message
                const systemMessages = AdventureCreator.state.messages.systemMessages;
                const message = systemMessages.find(m => m.text !== text && m.editable);
                if (message) {
                    message.text = text;
                }
            } else {
                const id = parseInt(document.getElementById('message-id').value);
                const category = document.getElementById('message-category').value;

                if (isEditing) {
                    // Update existing message
                    const message = AdventureCreator.state.messages.customMessages.find(m => m.id === id);
                    if (message) {
                        message.text = text;
                        message.category = category;
                        message.lastModified = new Date().toISOString();
                    }
                } else {
                    // Create new message
                    const newMessage = {
                        id: id,
                        text: text,
                        category: category,
                        created: new Date().toISOString(),
                        lastModified: new Date().toISOString()
                    };

                    AdventureCreator.state.messages.customMessages.push(newMessage);
                    AdventureCreator.state.messages.nextId = Math.max(id + 1, AdventureCreator.state.messages.nextId);
                }
            }

            this.saveData();

            // Close modal and refresh
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(m => m.remove());

            AdventureCreator.navigate('message-systems');
        },

        /**
         * Delete message
         */
        deleteMessage: function(id) {
            if (confirm('Delete this message?')) {
                AdventureCreator.state.messages.customMessages =
                    AdventureCreator.state.messages.customMessages.filter(m => m.id !== id);

                this.saveData();
                AdventureCreator.navigate('message-systems');
            }
        },

        /**
         * Create template
         */
        createTemplate: function() {
            const name = prompt('Template name:');
            if (!name) return;

            const pattern = prompt('Template pattern (use {variables}):');
            if (!pattern) return;

            AdventureCreator.state.messages.templates.push({
                name: name,
                pattern: pattern
            });

            this.saveData();
            AdventureCreator.navigate('message-systems');
        },

        /**
         * Use template
         */
        useTemplate: function(templateName) {
            const template = AdventureCreator.state.messages.templates.find(t => t.name === templateName);
            if (template) {
                this.showMessageModal({
                    text: template.pattern,
                    category: 'NARRATIVE'
                });
            }
        },

        /**
         * Delete template
         */
        deleteTemplate: function(templateName) {
            if (confirm(`Delete template "${templateName}"?`)) {
                AdventureCreator.state.messages.templates =
                    AdventureCreator.state.messages.templates.filter(t => t.name !== templateName);

                this.saveData();
                AdventureCreator.navigate('message-systems');
            }
        },

        /**
         * Export messages to DAAD format
         */
        exportMessages: function() {
            const messages = AdventureCreator.state.messages.customMessages;

            if (messages.length === 0) {
                alert('No custom messages to export. Create some messages first!');
                return;
            }

            let mtxSection = '/MTX\n';

            // Sort by ID
            const sortedMessages = [...messages].sort((a, b) => a.id - b.id);

            sortedMessages.forEach(message => {
                mtxSection += `_${message.id}\n${message.text}\n`;
            });

            // Download file
            const blob = new Blob([mtxSection], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'messages.daad';
            a.click();
            URL.revokeObjectURL(url);

            alert(`Exported ${messages.length} messages to messages.daad`);
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
        AdventureCreator.registerModule('message-systems', MessageSystemsModule);
    }

})();
