// module-editor-daad-main.js
// Main DAAD Editor Interface - Integrates all DAAD modules
(function() {
    'use strict';

    console.log('DAAD Main Editor loading...');

    // Check if AdventureCreator exists
    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Make sure this module loads after the main app.');
        return;
    }

    AdventureCreator.registerModule('editor-daad-main', {
        name: 'DAAD Main Editor',
        description: 'Complete DAAD game development environment',

        init() {
            console.log('DAAD Main Editor initialized');

            // Initialize DAAD-specific state
            if (!AdventureCreator.state.daadEditor) {
                AdventureCreator.state.daadEditor = {
                    selectedTab: 'overview',
                    selectedLocation: null,
                    selectedObject: null,
                    selectedProcess: null,
                    selectedMessage: null,
                    selectedVocab: null,
                    currentRule: {
                        conditions: [],
                        actions: []
                    },
                    showModuleStatus: false,
                    editHistory: [],
                    historyIndex: -1,
                    autoSaveEnabled: true,
                    lastSaved: null,
                    searchQuery: ''
                };
            }

            // Load from localStorage
            this.loadFromStorage();

            // Setup auto-save
            if (AdventureCreator.state.daadEditor.autoSaveEnabled) {
                this.setupAutoSave();
            }

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
        },

        setupAutoSave() {
            // Auto-save every 30 seconds
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
            }
            this.autoSaveInterval = setInterval(() => {
                this.saveToStorage();
                this.showNotification('Auto-saved', 'success', 1000);
            }, 30000);
        },

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+S - Save
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveToStorage();
                    this.showNotification('Saved successfully', 'success');
                }
                // Ctrl+Z - Undo
                if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                }
                // Ctrl+Shift+Z or Ctrl+Y - Redo
                if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
                    e.preventDefault();
                    this.redo();
                }
                // F1 - Help
                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }
                // Ctrl+E - Export
                if (e.ctrlKey && e.key === 'e') {
                    e.preventDefault();
                    this.exportGame();
                }
                // Ctrl+T - Test
                if (e.ctrlKey && e.key === 't') {
                    e.preventDefault();
                    this.testGame();
                }
            });
        },

        saveToStorage() {
            try {
                const game = AdventureCreator.getCurrentGame();
                if (game) {
                    localStorage.setItem('daadEditor_state', JSON.stringify(AdventureCreator.state.daadEditor));
                    AdventureCreator.state.daadEditor.lastSaved = new Date().toISOString();
                }
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
            }
        },

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('daadEditor_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Merge with current state, preserving defaults
                    AdventureCreator.state.daadEditor = {
                        ...AdventureCreator.state.daadEditor,
                        ...parsed,
                        // Reset volatile state
                        showModuleStatus: false
                    };
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        addToHistory(action) {
            const state = AdventureCreator.state.daadEditor;
            // Remove any history after current index
            state.editHistory = state.editHistory.slice(0, state.historyIndex + 1);
            // Add new action
            state.editHistory.push({
                action: action,
                timestamp: Date.now(),
                gameState: JSON.stringify(AdventureCreator.getCurrentGame().daad)
            });
            state.historyIndex++;
            // Limit history to 50 items
            if (state.editHistory.length > 50) {
                state.editHistory.shift();
                state.historyIndex--;
            }
            this.saveToStorage();
        },

        undo() {
            const state = AdventureCreator.state.daadEditor;
            if (state.historyIndex > 0) {
                state.historyIndex--;
                const snapshot = state.editHistory[state.historyIndex];
                const game = AdventureCreator.getCurrentGame();
                game.daad = JSON.parse(snapshot.gameState);
                AdventureCreator.navigate('editor');
                this.showNotification('Undo successful', 'info');
            } else {
                this.showNotification('Nothing to undo', 'warning');
            }
        },

        redo() {
            const state = AdventureCreator.state.daadEditor;
            if (state.historyIndex < state.editHistory.length - 1) {
                state.historyIndex++;
                const snapshot = state.editHistory[state.historyIndex];
                const game = AdventureCreator.getCurrentGame();
                game.daad = JSON.parse(snapshot.gameState);
                AdventureCreator.navigate('editor');
                this.showNotification('Redo successful', 'info');
            } else {
                this.showNotification('Nothing to redo', 'warning');
            }
        },

        render() {
            const game = AdventureCreator.getCurrentGame();
            if (!game) {
                return '<div class="loading">No game selected</div>';
            }

            // Initialize DAAD game structure if needed
            if (!game.daad) {
                game.daad = this.createEmptyDAADStructure();
                AdventureCreator.saveState();
            }

            return `
                <div class="daad-main-editor">
                    ${this.renderHeader(game)}
                    ${this.renderModuleStatus()}
                    ${this.renderMainInterface(game)}
                </div>

                <style>
                .daad-main-editor {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: #0a0a0a;
                }

                .editor-header {
                    background: #1a1a1a;
                    border-bottom: 1px solid #333;
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .editor-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #fff;
                }

                .editor-subtitle {
                    font-size: 0.875rem;
                    color: #999;
                    margin-top: 0.25rem;
                }

                .editor-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .module-status-banner {
                    background: linear-gradient(90deg, #1a1a1a, #2a2a2a);
                    border-bottom: 1px solid #333;
                    padding: 0.75rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.875rem;
                }

                .status-info {
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                }

                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .status-loaded { background: #10b981; }
                .status-fallback { background: #f59e0b; }
                .status-missing { background: #dc2626; }

                .editor-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                .editor-sidebar {
                    width: 280px;
                    background: #1a1a1a;
                    border-right: 1px solid #333;
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-tabs {
                    border-bottom: 1px solid #333;
                }

                .sidebar-tab {
                    display: block;
                    width: 100%;
                    padding: 1rem 1.5rem;
                    background: none;
                    border: none;
                    color: #999;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-bottom: 1px solid #2a2a2a;
                }

                .sidebar-tab:hover {
                    background: #222;
                    color: #fff;
                }

                .sidebar-tab.active {
                    background: #8b5cf6;
                    color: #fff;
                }

                .sidebar-tab-icon {
                    margin-right: 0.75rem;
                    font-size: 1.1rem;
                }

                .sidebar-content {
                    flex: 1;
                    padding: 1rem;
                    overflow-y: auto;
                }

                .main-content {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                }

                .content-section {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .section-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #fff;
                }

                .module-feature {
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .module-feature.available {
                    border-color: #10b981;
                }

                .module-feature.fallback {
                    border-color: #f59e0b;
                }

                .feature-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .feature-name {
                    font-weight: 500;
                    color: #fff;
                }

                .feature-status {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .feature-status.available {
                    background: #10b981;
                    color: #fff;
                }

                .feature-status.fallback {
                    background: #f59e0b;
                    color: #fff;
                }

                .feature-description {
                    color: #999;
                    font-size: 0.875rem;
                    line-height: 1.4;
                }

                .btn {
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    border: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-primary {
                    background: #8b5cf6;
                    color: #fff;
                }

                .btn-primary:hover {
                    background: #7c3aed;
                }

                .btn-secondary {
                    background: #333;
                    color: #fff;
                }

                .btn-secondary:hover {
                    background: #444;
                }

                .btn-success {
                    background: #10b981;
                    color: #fff;
                }

                .btn-success:hover {
                    background: #059669;
                }

                .btn-danger {
                    background: #dc2626;
                    color: #fff;
                }

                .btn-danger:hover {
                    background: #b91c1c;
                }

                .btn-sm {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.75rem;
                }

                .quick-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .stat-card {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    padding: 1rem;
                    text-align: center;
                }

                .stat-number {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #8b5cf6;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: #999;
                    text-transform: uppercase;
                    margin-top: 0.25rem;
                }

                .item-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .item-card {
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.2s;
                }

                .item-card:hover {
                    border-color: #8b5cf6;
                    background: #1a1a1a;
                }

                .item-card.selected {
                    border-color: #8b5cf6;
                    background: #1a1a1a;
                }

                .item-info {
                    flex: 1;
                }

                .item-name {
                    font-weight: 500;
                    color: #fff;
                    margin-bottom: 0.25rem;
                }

                .item-meta {
                    font-size: 0.75rem;
                    color: #666;
                }

                .item-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp 0.3s;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #fff;
                }

                .modal-close {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: #333;
                    color: #fff;
                }

                .modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                    flex: 1;
                }

                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #333;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #fff;
                    font-weight: 500;
                    font-size: 0.875rem;
                }

                .form-input,
                .form-textarea,
                .form-select {
                    width: 100%;
                    padding: 0.75rem;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 0.875rem;
                    font-family: inherit;
                }

                .form-input:focus,
                .form-textarea:focus,
                .form-select:focus {
                    outline: none;
                    border-color: #8b5cf6;
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 100px;
                    font-family: 'Courier New', monospace;
                }

                .form-help {
                    font-size: 0.75rem;
                    color: #666;
                    margin-top: 0.25rem;
                }

                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 2000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .notification {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 1rem 1.5rem;
                    min-width: 300px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    animation: slideInRight 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .notification.success { border-left: 4px solid #10b981; }
                .notification.error { border-left: 4px solid #dc2626; }
                .notification.warning { border-left: 4px solid #f59e0b; }
                .notification.info { border-left: 4px solid #3b82f6; }

                .notification-icon {
                    font-size: 1.25rem;
                }

                .notification-message {
                    flex: 1;
                    color: #fff;
                    font-size: 0.875rem;
                }

                .search-box {
                    margin-bottom: 1rem;
                }

                .search-input {
                    width: 100%;
                    padding: 0.75rem;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 0.875rem;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #8b5cf6;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #666;
                }

                .empty-state-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .empty-state-text {
                    font-size: 1rem;
                    margin-bottom: 1.5rem;
                }
                </style>
            `;
        },

        renderHeader(game) {
            const state = AdventureCreator.state.daadEditor;
            const lastSaved = state.lastSaved ? new Date(state.lastSaved).toLocaleTimeString() : 'Never';

            return `
                <div class="editor-header">
                    <div>
                        <div class="editor-title">🎮 ${this.escapeHtml(game.title)}</div>
                        <div class="editor-subtitle">DAAD Adventure Development | Last saved: ${lastSaved}</div>
                    </div>
                    <div class="editor-actions">
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-main'].showHelpModal()">
                            ❓ Help
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-main'].showModuleStatusModal()">
                            📊 Modules
                        </button>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['editor-daad-main'].exportGame()">
                            💾 Export
                        </button>
                        <button class="btn btn-success" onclick="AdventureCreator.modules['editor-daad-main'].testGame()">
                            ▶️ Test
                        </button>
                    </div>
                </div>
            `;
        },

        renderModuleStatus() {
            const loadedModules = AdventureCreator.daadModules.filter(m =>
                AdventureCreator.moduleStatus[m] === 'loaded-external'
            ).length;
            const fallbackModules = AdventureCreator.daadModules.filter(m =>
                AdventureCreator.moduleStatus[m] === 'loaded-fallback'
            ).length;
            const missingModules = AdventureCreator.daadModules.length - loadedModules - fallbackModules;

            return `
                <div class="module-status-banner">
                    <div class="status-info">
                        <div class="status-item">
                            <div class="status-indicator status-loaded"></div>
                            <span>${loadedModules} Loaded</span>
                        </div>
                        <div class="status-item">
                            <div class="status-indicator status-fallback"></div>
                            <span>${fallbackModules} Fallback</span>
                        </div>
                        <div class="status-item">
                            <div class="status-indicator status-missing"></div>
                            <span>${missingModules} Missing</span>
                        </div>
                    </div>
                    <div style="color: #999;">
                        DAAD Development Environment Ready
                    </div>
                </div>
            `;
        },

        renderMainInterface(game) {
            const selectedTab = AdventureCreator.state.daadEditor.selectedTab;

            return `
                <div class="editor-content">
                    <div class="editor-sidebar">
                        <div class="sidebar-tabs">
                            ${this.renderSidebarTab('overview', '📊', 'Overview')}
                            ${this.renderSidebarTab('locations', '🏠', 'Locations')}
                            ${this.renderSidebarTab('objects', '📦', 'Objects')}
                            ${this.renderSidebarTab('vocabulary', '📝', 'Vocabulary')}
                            ${this.renderSidebarTab('rules', '⚙️', 'Rules & Logic')}
                            ${this.renderSidebarTab('messages', '💬', 'Messages')}
                            ${this.renderSidebarTab('settings', '🔧', 'Settings')}
                        </div>
                        <div class="sidebar-content">
                            ${this.renderSidebarContent(selectedTab, game)}
                        </div>
                    </div>
                    <div class="main-content">
                        ${this.renderMainContent(selectedTab, game)}
                    </div>
                </div>
            `;
        },

        renderSidebarTab(tabId, icon, label) {
            const isActive = AdventureCreator.state.daadEditor.selectedTab === tabId;
            return `
                <button class="sidebar-tab ${isActive ? 'active' : ''}"
                        onclick="AdventureCreator.modules['editor-daad-main'].switchTab('${tabId}')">
                    <span class="sidebar-tab-icon">${icon}</span>
                    ${label}
                </button>
            `;
        },

        renderSidebarContent(tab, game) {
            switch(tab) {
                case 'overview':
                    return this.renderOverviewSidebar(game);
                case 'locations':
                    return this.renderLocationsSidebar(game);
                case 'objects':
                    return this.renderObjectsSidebar(game);
                case 'vocabulary':
                    return this.renderVocabularySidebar(game);
                case 'rules':
                    return this.renderRulesSidebar(game);
                case 'messages':
                    return this.renderMessagesSidebar(game);
                case 'settings':
                    return this.renderSettingsSidebar(game);
                default:
                    return '<div>Select a tab</div>';
            }
        },

        renderMainContent(tab, game) {
            switch(tab) {
                case 'overview':
                    return this.renderOverviewContent(game);
                case 'locations':
                    return this.renderLocationsContent(game);
                case 'objects':
                    return this.renderObjectsContent(game);
                case 'vocabulary':
                    return this.renderVocabularyContent(game);
                case 'rules':
                    return this.renderRulesContent(game);
                case 'messages':
                    return this.renderMessagesContent(game);
                case 'settings':
                    return this.renderSettingsContent(game);
                default:
                    return '<div>Select a tab to begin</div>';
            }
        },

        // Overview Tab
        renderOverviewSidebar(game) {
            return `
                <h3 style="color: #fff; margin-bottom: 1rem;">Game Status</h3>
                <div style="margin-bottom: 1rem;">
                    <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.5rem;">
                        <strong>Locations:</strong> ${game.daad.locations.length}
                    </div>
                    <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.5rem;">
                        <strong>Objects:</strong> ${game.daad.objects.length}
                    </div>
                    <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.5rem;">
                        <strong>Processes:</strong> ${game.daad.processes.length}
                    </div>
                    <div style="color: #999; font-size: 0.875rem;">
                        <strong>Messages:</strong> ${game.daad.messages.length}
                    </div>
                </div>

                <h3 style="color: #fff; margin: 1.5rem 0 1rem;">Quick Actions</h3>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.5rem;"
                        onclick="AdventureCreator.modules['editor-daad-main'].showAddLocationModal()">
                    + Add Location
                </button>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.5rem;"
                        onclick="AdventureCreator.modules['editor-daad-main'].showAddObjectModal()">
                    + Add Object
                </button>
                <button class="btn btn-primary" style="width: 100%;"
                        onclick="AdventureCreator.modules['editor-daad-main'].showAddRuleModal()">
                    + Add Rule
                </button>
            `;
        },

        renderOverviewContent(game) {
            const moduleStats = this.getModuleStats();

            return `
                <h2 style="color: #fff; margin-bottom: 1.5rem;">Adventure Overview</h2>

                <div class="quick-stats">
                    <div class="stat-card">
                        <div class="stat-number">${game.daad.locations.length}</div>
                        <div class="stat-label">Locations</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${game.daad.objects.length}</div>
                        <div class="stat-label">Objects</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${game.daad.processes.length}</div>
                        <div class="stat-label">Rules</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${moduleStats.loaded}</div>
                        <div class="stat-label">Modules</div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">🛠️ Available Features</h3>
                    </div>
                    ${this.renderAvailableFeatures()}
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">🚀 Getting Started</h3>
                    </div>
                    <div style="color: #ccc; line-height: 1.6;">
                        <p style="margin-bottom: 1rem;">
                            Welcome to the DAAD Adventure Creator! Your individual modules are loaded and ready for game development.
                        </p>
                        <h4 style="color: #8b5cf6; margin-bottom: 0.5rem;">Next Steps:</h4>
                        <ol style="margin-left: 1.5rem; color: #999;">
                            <li style="margin-bottom: 0.5rem;">Create your first location using the "Locations" tab</li>
                            <li style="margin-bottom: 0.5rem;">Add objects and items in the "Objects" tab</li>
                            <li style="margin-bottom: 0.5rem;">Build game rules and logic in the "Rules & Logic" tab</li>
                            <li style="margin-bottom: 0.5rem;">Test your adventure with the "Test" button</li>
                            <li>Export your completed game with "Export"</li>
                        </ol>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">⌨️ Keyboard Shortcuts</h3>
                    </div>
                    <div style="color: #ccc; line-height: 1.8;">
                        <div><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+S</kbd> - Save</div>
                        <div><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+Z</kbd> - Undo</div>
                        <div><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+Y</kbd> - Redo</div>
                        <div><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+E</kbd> - Export</div>
                        <div><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+T</kbd> - Test Game</div>
                        <div><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">F1</kbd> - Help</div>
                    </div>
                </div>
            `;
        },

        renderAvailableFeatures() {
            const features = [
                { name: 'Conditions Builder', module: 'daad-conditions', description: 'Visual interface for creating DAAD conditions (AT, CARRIED, EQ, etc.)' },
                { name: 'Actions Builder', module: 'daad-actions', description: 'Complete action system (GOTO, GET, MESSAGE, LET, etc.)' },
                { name: 'Process Tables', module: 'multi-process-tables', description: 'Multi-process table management for complex game logic' },
                { name: 'Flag System', module: 'advanced-flag-system', description: 'Advanced flag arithmetic and mathematical operations' },
                { name: 'Object Control', module: 'object-location-system', description: 'Sophisticated object positioning and manipulation' },
                { name: 'Control Flow', module: 'control-flow-management', description: 'Process jumping and execution control' },
                { name: 'Display Tools', module: 'display-formatting', description: 'Professional screen control and formatting' },
                { name: 'Inventory', module: 'inventory-management', description: 'Complete carrying and wearing systems' },
                { name: 'Containers', module: 'container-systems', description: 'Advanced nested storage and organization' },
                { name: 'Weight System', module: 'weight-encumbrance', description: 'Realistic weight limits and encumbrance' }
            ];

            return features.map(feature => {
                const status = AdventureCreator.moduleStatus[feature.module] || 'not-loaded';
                const isAvailable = status === 'loaded-external';
                const isFallback = status === 'loaded-fallback';

                return `
                    <div class="module-feature ${isAvailable ? 'available' : isFallback ? 'fallback' : ''}">
                        <div class="feature-header">
                            <div class="feature-name">${feature.name}</div>
                            <div class="feature-status ${isAvailable ? 'available' : 'fallback'}">
                                ${isAvailable ? 'Ready' : 'Fallback'}
                            </div>
                        </div>
                        <div class="feature-description">${feature.description}</div>
                    </div>
                `;
            }).join('');
        },

        // Locations Tab
        renderLocationsSidebar(game) {
            const state = AdventureCreator.state.daadEditor;
            const filteredLocations = state.searchQuery
                ? game.daad.locations.filter((loc, index) =>
                    (loc.name || `Location ${index + 1}`).toLowerCase().includes(state.searchQuery.toLowerCase())
                )
                : game.daad.locations;

            return `
                <h3 style="color: #fff; margin-bottom: 1rem;">Locations</h3>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;"
                        onclick="AdventureCreator.modules['editor-daad-main'].showAddLocationModal()">
                    + New Location
                </button>
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Search locations..."
                           value="${state.searchQuery}"
                           onchange="AdventureCreator.modules['editor-daad-main'].updateSearch(this.value)">
                </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${filteredLocations.map((loc, index) => `
                        <div class="item-card ${state.selectedLocation === index ? 'selected' : ''}"
                             onclick="AdventureCreator.modules['editor-daad-main'].selectLocation(${index})">
                            <div class="item-info">
                                <div class="item-name">${this.escapeHtml(loc.name || `Location ${index + 1}`)}</div>
                                <div class="item-meta">ID: ${index}</div>
                            </div>
                        </div>
                    `).join('') || '<div style="color: #666; font-style: italic; padding: 1rem;">No locations yet</div>'}
                </div>
            `;
        },

        renderLocationsContent(game) {
            const state = AdventureCreator.state.daadEditor;
            const selectedIndex = state.selectedLocation;

            if (selectedIndex === null || !game.daad.locations[selectedIndex]) {
                return `
                    <h2 style="color: #fff; margin-bottom: 1.5rem;">Locations</h2>
                    <div class="empty-state">
                        <div class="empty-state-icon">🏠</div>
                        <div class="empty-state-text">
                            ${game.daad.locations.length === 0
                                ? 'No locations created yet. Click "New Location" to get started!'
                                : 'Select a location from the sidebar to edit it'}
                        </div>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['editor-daad-main'].showAddLocationModal()">
                            + Create Location
                        </button>
                    </div>
                `;
            }

            const location = game.daad.locations[selectedIndex];

            return `
                <h2 style="color: #fff; margin-bottom: 1.5rem;">
                    Edit Location: ${this.escapeHtml(location.name || `Location ${selectedIndex + 1}`)}
                </h2>

                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">Basic Information</h3>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm"
                                    onclick="AdventureCreator.modules['editor-daad-main'].showEditLocationModal(${selectedIndex})">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-danger btn-sm"
                                    onclick="AdventureCreator.modules['editor-daad-main'].showDeleteLocationModal(${selectedIndex})">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.25rem;">Name:</div>
                            <div style="color: #fff;">${this.escapeHtml(location.name || 'Unnamed')}</div>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.25rem;">Description:</div>
                            <div style="color: #fff; white-space: pre-wrap;">${this.escapeHtml(location.description || 'No description')}</div>
                        </div>
                        <div>
                            <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.25rem;">Location ID:</div>
                            <div style="color: #fff;">${selectedIndex}</div>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">Connections</h3>
                        <button class="btn btn-primary btn-sm"
                                onclick="AdventureCreator.modules['editor-daad-main'].showAddConnectionModal(${selectedIndex})">
                            + Add Connection
                        </button>
                    </div>
                    <div>
                        ${Object.keys(location.connections || {}).length > 0
                            ? Object.entries(location.connections).map(([direction, targetId]) => `
                                <div class="item-card" style="margin-bottom: 0.5rem;">
                                    <div class="item-info">
                                        <div class="item-name">${direction.toUpperCase()}</div>
                                        <div class="item-meta">→ ${this.escapeHtml(game.daad.locations[targetId]?.name || `Location ${targetId}`)}</div>
                                    </div>
                                    <button class="btn btn-danger btn-sm"
                                            onclick="AdventureCreator.modules['editor-daad-main'].deleteConnection(${selectedIndex}, '${direction}')">
                                        🗑️
                                    </button>
                                </div>
                            `).join('')
                            : '<div style="color: #666; font-style: italic;">No connections defined</div>'
                        }
                    </div>
                </div>
            `;
        },

        // Objects Tab
        renderObjectsSidebar(game) {
            const state = AdventureCreator.state.daadEditor;
            const filteredObjects = state.searchQuery
                ? game.daad.objects.filter((obj, index) =>
                    (obj.name || `Object ${index + 1}`).toLowerCase().includes(state.searchQuery.toLowerCase())
                )
                : game.daad.objects;

            return `
                <h3 style="color: #fff; margin-bottom: 1rem;">Objects</h3>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;"
                        onclick="AdventureCreator.modules['editor-daad-main'].showAddObjectModal()">
                    + New Object
                </button>
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Search objects..."
                           value="${state.searchQuery}"
                           onchange="AdventureCreator.modules['editor-daad-main'].updateSearch(this.value)">
                </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${filteredObjects.map((obj, index) => `
                        <div class="item-card ${state.selectedObject === index ? 'selected' : ''}"
                             onclick="AdventureCreator.modules['editor-daad-main'].selectObject(${index})">
                            <div class="item-info">
                                <div class="item-name">${this.escapeHtml(obj.name || `Object ${index + 1}`)}</div>
                                <div class="item-meta">ID: ${index}</div>
                            </div>
                        </div>
                    `).join('') || '<div style="color: #666; font-style: italic; padding: 1rem;">No objects yet</div>'}
                </div>
            `;
        },

        renderObjectsContent(game) {
            const state = AdventureCreator.state.daadEditor;
            const selectedIndex = state.selectedObject;

            if (selectedIndex === null || !game.daad.objects[selectedIndex]) {
                return `
                    <h2 style="color: #fff; margin-bottom: 1.5rem;">Objects & Items</h2>
                    <div class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <div class="empty-state-text">
                            ${game.daad.objects.length === 0
                                ? 'No objects created yet. Click "New Object" to get started!'
                                : 'Select an object from the sidebar to edit it'}
                        </div>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['editor-daad-main'].showAddObjectModal()">
                            + Create Object
                        </button>
                    </div>
                `;
            }

            const object = game.daad.objects[selectedIndex];

            return `
                <h2 style="color: #fff; margin-bottom: 1.5rem;">
                    Edit Object: ${this.escapeHtml(object.name || `Object ${selectedIndex + 1}`)}
                </h2>

                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">Basic Information</h3>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm"
                                    onclick="AdventureCreator.modules['editor-daad-main'].showEditObjectModal(${selectedIndex})">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-danger btn-sm"
                                    onclick="AdventureCreator.modules['editor-daad-main'].showDeleteObjectModal(${selectedIndex})">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.25rem;">Name:</div>
                            <div style="color: #fff;">${this.escapeHtml(object.name || 'Unnamed')}</div>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.25rem;">Description:</div>
                            <div style="color: #fff; white-space: pre-wrap;">${this.escapeHtml(object.description || 'No description')}</div>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.25rem;">Initial Location:</div>
                            <div style="color: #fff;">
                                ${object.initialLocation !== undefined
                                    ? this.escapeHtml(game.daad.locations[object.initialLocation]?.name || `Location ${object.initialLocation}`)
                                    : 'Not placed'
                                }
                            </div>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.25rem;">Weight:</div>
                            <div style="color: #fff;">${object.weight || 0}</div>
                        </div>
                        <div>
                            <div style="color: #999; font-size: 0.875rem; margin-bottom: 0.25rem;">Object ID:</div>
                            <div style="color: #fff;">${selectedIndex}</div>
                        </div>
                    </div>
                </div>
            `;
        },

        // Vocabulary Tab
        renderVocabularySidebar(game) {
            return `
                <h3 style="color: #fff; margin-bottom: 1rem;">Vocabulary</h3>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;"
                        onclick="AdventureCreator.modules['editor-daad-main'].showAddVocabModal()">
                    + New Word
                </button>
                <div style="color: #999; font-size: 0.875rem;">
                    <div style="margin-bottom: 0.5rem;">
                        <strong>Total Words:</strong> ${game.daad.vocabulary.length}
                    </div>
                </div>
            `;
        },

        renderVocabularyContent(game) {
            return `
                <h2 style="color: #fff; margin-bottom: 1.5rem;">Vocabulary</h2>
                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">Word List</h3>
                        <button class="btn btn-primary"
                                onclick="AdventureCreator.modules['editor-daad-main'].showAddVocabModal()">
                            + Add Word
                        </button>
                    </div>
                    <div>
                        ${game.daad.vocabulary.length > 0
                            ? `<div class="item-list">
                                ${game.daad.vocabulary.map((word, index) => `
                                    <div class="item-card">
                                        <div class="item-info">
                                            <div class="item-name">${this.escapeHtml(word.word || 'Unknown')}</div>
                                            <div class="item-meta">Type: ${word.type || 'unknown'} | ID: ${word.id || index}</div>
                                        </div>
                                        <div class="item-actions">
                                            <button class="btn btn-secondary btn-sm"
                                                    onclick="AdventureCreator.modules['editor-daad-main'].showEditVocabModal(${index})">
                                                ✏️
                                            </button>
                                            <button class="btn btn-danger btn-sm"
                                                    onclick="AdventureCreator.modules['editor-daad-main'].deleteVocab(${index})">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`
                            : '<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">No vocabulary words defined yet</div></div>'
                        }
                    </div>
                </div>
            `;
        },

        // Rules Tab
        renderRulesSidebar(game) {
            return `
                <h3 style="color: #fff; margin-bottom: 1rem;">Rules</h3>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;"
                        onclick="AdventureCreator.modules['editor-daad-main'].showAddRuleModal()">
                    + New Rule
                </button>
                <div style="color: #999; font-size: 0.875rem; margin-bottom: 1rem;">
                    Your loaded modules provide:
                </div>
                <div style="font-size: 0.75rem; color: #666;">
                    ${AdventureCreator.moduleStatus['daad-conditions'] === 'loaded-external' ? '✅' : '⚠️'} Conditions<br>
                    ${AdventureCreator.moduleStatus['daad-actions'] === 'loaded-external' ? '✅' : '⚠️'} Actions<br>
                    ${AdventureCreator.moduleStatus['multi-process-tables'] === 'loaded-external' ? '✅' : '⚠️'} Process Tables<br>
                    ${AdventureCreator.moduleStatus['control-flow-management'] === 'loaded-external' ? '✅' : '⚠️'} Control Flow
                </div>
            `;
        },

        renderRulesContent(game) {
            return `
                <h2 style="color: #fff; margin-bottom: 1.5rem;">Rules & Logic</h2>
                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">🔧 Rule Builder</h3>
                        <button class="btn btn-primary"
                                onclick="AdventureCreator.modules['editor-daad-main'].showAddRuleModal()">
                            + Add Rule
                        </button>
                    </div>
                    <p style="color: #999; margin-bottom: 1rem;">
                        Build game rules using your loaded modules. Rules define how players can interact with your adventure.
                    </p>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 4px; border: 1px solid #333;">
                            <h4 style="color: #8b5cf6; margin-bottom: 0.5rem;">📋 Conditions</h4>
                            <p style="color: #999; font-size: 0.875rem;">
                                Use conditions to check game state (player location, inventory, flags, etc.)
                            </p>
                            <button class="btn btn-primary" style="margin-top: 0.5rem;"
                                    onclick="AdventureCreator.modules['editor-daad-main'].showConditionsBuilder()">
                                Build Conditions
                            </button>
                        </div>

                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 4px; border: 1px solid #333;">
                            <h4 style="color: #ec4899; margin-bottom: 0.5rem;">⚡ Actions</h4>
                            <p style="color: #999; font-size: 0.875rem;">
                                Define what happens when conditions are met (move player, give items, display messages, etc.)
                            </p>
                            <button class="btn btn-primary" style="margin-top: 0.5rem;"
                                    onclick="AdventureCreator.modules['editor-daad-main'].showActionsBuilder()">
                                Build Actions
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 style="color: #fff; margin-bottom: 1rem;">Process Tables</h4>
                        ${game.daad.processes.length > 0
                            ? `<div class="item-list">
                                ${game.daad.processes.map((process, index) => `
                                    <div class="item-card">
                                        <div class="item-info">
                                            <div class="item-name">${this.escapeHtml(process.name || `Process ${index}`)}</div>
                                            <div class="item-meta">${process.rules?.length || 0} rules</div>
                                        </div>
                                        <div class="item-actions">
                                            <button class="btn btn-secondary btn-sm"
                                                    onclick="AdventureCreator.modules['editor-daad-main'].editProcess(${index})">
                                                ✏️
                                            </button>
                                            <button class="btn btn-danger btn-sm"
                                                    onclick="AdventureCreator.modules['editor-daad-main'].deleteProcess(${index})">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`
                            : '<div style="color: #666; font-style: italic;">No process tables created yet</div>'
                        }
                    </div>
                </div>
            `;
        },

        // Messages Tab
        renderMessagesSidebar(game) {
            return `
                <h3 style="color: #fff; margin-bottom: 1rem;">Messages</h3>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;"
                        onclick="AdventureCreator.modules['editor-daad-main'].showAddMessageModal()">
                    + New Message
                </button>
                <div style="color: #999; font-size: 0.875rem;">
                    <div style="margin-bottom: 0.5rem;">
                        <strong>Total Messages:</strong> ${game.daad.messages.length}
                    </div>
                </div>
            `;
        },

        renderMessagesContent(game) {
            return `
                <h2 style="color: #fff; margin-bottom: 1.5rem;">Messages</h2>
                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">Message List</h3>
                        <button class="btn btn-primary"
                                onclick="AdventureCreator.modules['editor-daad-main'].showAddMessageModal()">
                            + Add Message
                        </button>
                    </div>
                    <div>
                        ${game.daad.messages.length > 0
                            ? `<div class="item-list">
                                ${game.daad.messages.map((message, index) => `
                                    <div class="item-card">
                                        <div class="item-info">
                                            <div class="item-name">Message ${index}</div>
                                            <div class="item-meta">${this.escapeHtml(message.text?.substring(0, 50) || 'Empty')}${message.text?.length > 50 ? '...' : ''}</div>
                                        </div>
                                        <div class="item-actions">
                                            <button class="btn btn-secondary btn-sm"
                                                    onclick="AdventureCreator.modules['editor-daad-main'].showEditMessageModal(${index})">
                                                ✏️
                                            </button>
                                            <button class="btn btn-danger btn-sm"
                                                    onclick="AdventureCreator.modules['editor-daad-main'].deleteMessage(${index})">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`
                            : '<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-text">No messages defined yet</div></div>'
                        }
                    </div>
                </div>
            `;
        },

        // Settings Tab
        renderSettingsSidebar(game) {
            return `
                <h3 style="color: #fff; margin-bottom: 1rem;">Settings</h3>
                <div style="color: #999; font-size: 0.875rem;">
                    Configure editor preferences and game settings
                </div>
            `;
        },

        renderSettingsContent(game) {
            const state = AdventureCreator.state.daadEditor;

            return `
                <h2 style="color: #fff; margin-bottom: 1.5rem;">Game Settings</h2>

                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">Editor Preferences</h3>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" ${state.autoSaveEnabled ? 'checked' : ''}
                                   onchange="AdventureCreator.modules['editor-daad-main'].toggleAutoSave(this.checked)">
                            Enable Auto-Save (every 30 seconds)
                        </label>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-secondary"
                                onclick="AdventureCreator.modules['editor-daad-main'].clearHistory()">
                            Clear Edit History
                        </button>
                        <div class="form-help">Current history: ${state.editHistory.length} items</div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <h3 class="section-title">Game Metadata</h3>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Game Title</label>
                        <input type="text" class="form-input" value="${this.escapeHtml(game.title)}"
                               onchange="AdventureCreator.modules['editor-daad-main'].updateGameTitle(this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Author</label>
                        <input type="text" class="form-input" value="${this.escapeHtml(game.author || '')}"
                               onchange="AdventureCreator.modules['editor-daad-main'].updateGameAuthor(this.value)">
                    </div>
                </div>
            `;
        },

        // Utility methods
        createEmptyDAADStructure() {
            return {
                vocabulary: [],
                messages: [],
                locations: [],
                objects: [],
                processes: [],
                customFlags: []
            };
        },

        getModuleStats() {
            const loaded = AdventureCreator.daadModules.filter(m =>
                AdventureCreator.moduleStatus[m] === 'loaded-external'
            ).length;
            const fallback = AdventureCreator.daadModules.filter(m =>
                AdventureCreator.moduleStatus[m] === 'loaded-fallback'
            ).length;
            const missing = AdventureCreator.daadModules.length - loaded - fallback;

            return { loaded, fallback, missing, total: AdventureCreator.daadModules.length };
        },

        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Event handlers
        switchTab(tabId) {
            AdventureCreator.state.daadEditor.selectedTab = tabId;
            AdventureCreator.state.daadEditor.searchQuery = ''; // Reset search when switching tabs
            AdventureCreator.navigate('editor');
        },

        updateSearch(query) {
            AdventureCreator.state.daadEditor.searchQuery = query;
            AdventureCreator.navigate('editor');
        },

        // Modal Management
        showModal(content, title, onConfirm, confirmText = 'OK', showCancel = true) {
            const modalId = 'daad-modal-' + Date.now();
            const modalHtml = `
                <div class="modal-overlay" id="${modalId}" onclick="if(event.target.id==='${modalId}')AdventureCreator.modules['editor-daad-main'].closeModal('${modalId}')">
                    <div class="modal">
                        <div class="modal-header">
                            <div class="modal-title">${title}</div>
                            <button class="modal-close" onclick="AdventureCreator.modules['editor-daad-main'].closeModal('${modalId}')">&times;</button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            ${showCancel ? `<button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-main'].closeModal('${modalId}')">Cancel</button>` : ''}
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['editor-daad-main'].handleModalConfirm('${modalId}', ${onConfirm})">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        },

        closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.remove();
            }
        },

        handleModalConfirm(modalId, onConfirm) {
            if (typeof onConfirm === 'function') {
                onConfirm();
            } else if (typeof onConfirm === 'string') {
                // Execute function from string
                eval(onConfirm);
            }
            this.closeModal(modalId);
        },

        showNotification(message, type = 'info', duration = 3000) {
            const container = document.querySelector('.notification-container') || (() => {
                const div = document.createElement('div');
                div.className = 'notification-container';
                document.body.appendChild(div);
                return div;
            })();

            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };

            const notificationId = 'notification-' + Date.now();
            const notificationHtml = `
                <div class="notification ${type}" id="${notificationId}">
                    <div class="notification-icon">${icons[type] || 'ℹ️'}</div>
                    <div class="notification-message">${message}</div>
                </div>
            `;

            container.insertAdjacentHTML('beforeend', notificationHtml);

            if (duration > 0) {
                setTimeout(() => {
                    const notification = document.getElementById(notificationId);
                    if (notification) {
                        notification.style.animation = 'slideInRight 0.3s reverse';
                        setTimeout(() => notification.remove(), 300);
                    }
                }, duration);
            }
        },

        // Location CRUD
        showAddLocationModal() {
            const content = `
                <div class="form-group">
                    <label class="form-label">Location Name</label>
                    <input type="text" class="form-input" id="location-name" placeholder="Enter location name">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="location-description" placeholder="Enter location description"></textarea>
                    <div class="form-help">Describe what the player sees when they enter this location</div>
                </div>
            `;

            this.showModal(content, '📍 Add New Location', () => {
                const name = document.getElementById('location-name').value;
                const description = document.getElementById('location-description').value;

                if (!name) {
                    this.showNotification('Please enter a location name', 'warning');
                    return;
                }

                const game = AdventureCreator.getCurrentGame();
                game.daad.locations.push({
                    name: name,
                    description: description,
                    connections: {}
                });

                this.addToHistory('add-location');
                AdventureCreator.saveState();
                this.showNotification(`Location "${name}" added successfully`, 'success');
                AdventureCreator.navigate('editor');
            });
        },

        showEditLocationModal(index) {
            const game = AdventureCreator.getCurrentGame();
            const location = game.daad.locations[index];

            const content = `
                <div class="form-group">
                    <label class="form-label">Location Name</label>
                    <input type="text" class="form-input" id="location-name" value="${this.escapeHtml(location.name || '')}">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="location-description">${this.escapeHtml(location.description || '')}</textarea>
                </div>
            `;

            this.showModal(content, '✏️ Edit Location', () => {
                const name = document.getElementById('location-name').value;
                const description = document.getElementById('location-description').value;

                game.daad.locations[index].name = name;
                game.daad.locations[index].description = description;

                this.addToHistory('edit-location');
                AdventureCreator.saveState();
                this.showNotification('Location updated successfully', 'success');
                AdventureCreator.navigate('editor');
            });
        },

        showDeleteLocationModal(index) {
            const game = AdventureCreator.getCurrentGame();
            const location = game.daad.locations[index];

            const content = `
                <div style="color: #ccc;">
                    <p>Are you sure you want to delete <strong>${this.escapeHtml(location.name || `Location ${index}`)}</strong>?</p>
                    <p style="color: #f59e0b; margin-top: 1rem;">⚠️ This action cannot be undone.</p>
                </div>
            `;

            this.showModal(content, '🗑️ Delete Location', () => {
                game.daad.locations.splice(index, 1);
                AdventureCreator.state.daadEditor.selectedLocation = null;

                this.addToHistory('delete-location');
                AdventureCreator.saveState();
                this.showNotification('Location deleted successfully', 'success');
                AdventureCreator.navigate('editor');
            }, 'Delete');
        },

        showAddConnectionModal(locationIndex) {
            const game = AdventureCreator.getCurrentGame();
            const locationOptions = game.daad.locations.map((loc, idx) =>
                `<option value="${idx}">${this.escapeHtml(loc.name || `Location ${idx}`)}</option>`
            ).join('');

            const content = `
                <div class="form-group">
                    <label class="form-label">Direction</label>
                    <select class="form-select" id="connection-direction">
                        <option value="north">North</option>
                        <option value="south">South</option>
                        <option value="east">East</option>
                        <option value="west">West</option>
                        <option value="up">Up</option>
                        <option value="down">Down</option>
                        <option value="northeast">Northeast</option>
                        <option value="northwest">Northwest</option>
                        <option value="southeast">Southeast</option>
                        <option value="southwest">Southwest</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Target Location</label>
                    <select class="form-select" id="connection-target">
                        ${locationOptions}
                    </select>
                </div>
            `;

            this.showModal(content, '🗺️ Add Connection', () => {
                const direction = document.getElementById('connection-direction').value;
                const targetId = parseInt(document.getElementById('connection-target').value);

                game.daad.locations[locationIndex].connections[direction] = targetId;

                this.addToHistory('add-connection');
                AdventureCreator.saveState();
                this.showNotification('Connection added successfully', 'success');
                AdventureCreator.navigate('editor');
            });
        },

        deleteConnection(locationIndex, direction) {
            const game = AdventureCreator.getCurrentGame();
            delete game.daad.locations[locationIndex].connections[direction];

            this.addToHistory('delete-connection');
            AdventureCreator.saveState();
            this.showNotification('Connection deleted successfully', 'success');
            AdventureCreator.navigate('editor');
        },

        selectLocation(index) {
            AdventureCreator.state.daadEditor.selectedLocation = index;
            AdventureCreator.navigate('editor');
        },

        // Object CRUD
        showAddObjectModal() {
            const game = AdventureCreator.getCurrentGame();
            const locationOptions = game.daad.locations.map((loc, idx) =>
                `<option value="${idx}">${this.escapeHtml(loc.name || `Location ${idx}`)}</option>`
            ).join('');

            const content = `
                <div class="form-group">
                    <label class="form-label">Object Name</label>
                    <input type="text" class="form-input" id="object-name" placeholder="Enter object name">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="object-description" placeholder="Enter object description"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Initial Location</label>
                    <select class="form-select" id="object-location">
                        <option value="">Not placed</option>
                        ${locationOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Weight</label>
                    <input type="number" class="form-input" id="object-weight" value="0" min="0">
                    <div class="form-help">Weight affects carrying capacity</div>
                </div>
            `;

            this.showModal(content, '📦 Add New Object', () => {
                const name = document.getElementById('object-name').value;
                const description = document.getElementById('object-description').value;
                const location = document.getElementById('object-location').value;
                const weight = parseInt(document.getElementById('object-weight').value) || 0;

                if (!name) {
                    this.showNotification('Please enter an object name', 'warning');
                    return;
                }

                game.daad.objects.push({
                    name: name,
                    description: description,
                    initialLocation: location ? parseInt(location) : undefined,
                    weight: weight
                });

                this.addToHistory('add-object');
                AdventureCreator.saveState();
                this.showNotification(`Object "${name}" added successfully`, 'success');
                AdventureCreator.navigate('editor');
            });
        },

        showEditObjectModal(index) {
            const game = AdventureCreator.getCurrentGame();
            const object = game.daad.objects[index];
            const locationOptions = game.daad.locations.map((loc, idx) =>
                `<option value="${idx}" ${object.initialLocation === idx ? 'selected' : ''}>${this.escapeHtml(loc.name || `Location ${idx}`)}</option>`
            ).join('');

            const content = `
                <div class="form-group">
                    <label class="form-label">Object Name</label>
                    <input type="text" class="form-input" id="object-name" value="${this.escapeHtml(object.name || '')}">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="object-description">${this.escapeHtml(object.description || '')}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Initial Location</label>
                    <select class="form-select" id="object-location">
                        <option value="" ${object.initialLocation === undefined ? 'selected' : ''}>Not placed</option>
                        ${locationOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Weight</label>
                    <input type="number" class="form-input" id="object-weight" value="${object.weight || 0}" min="0">
                </div>
            `;

            this.showModal(content, '✏️ Edit Object', () => {
                const name = document.getElementById('object-name').value;
                const description = document.getElementById('object-description').value;
                const location = document.getElementById('object-location').value;
                const weight = parseInt(document.getElementById('object-weight').value) || 0;

                game.daad.objects[index].name = name;
                game.daad.objects[index].description = description;
                game.daad.objects[index].initialLocation = location ? parseInt(location) : undefined;
                game.daad.objects[index].weight = weight;

                this.addToHistory('edit-object');
                AdventureCreator.saveState();
                this.showNotification('Object updated successfully', 'success');
                AdventureCreator.navigate('editor');
            });
        },

        showDeleteObjectModal(index) {
            const game = AdventureCreator.getCurrentGame();
            const object = game.daad.objects[index];

            const content = `
                <div style="color: #ccc;">
                    <p>Are you sure you want to delete <strong>${this.escapeHtml(object.name || `Object ${index}`)}</strong>?</p>
                    <p style="color: #f59e0b; margin-top: 1rem;">⚠️ This action cannot be undone.</p>
                </div>
            `;

            this.showModal(content, '🗑️ Delete Object', () => {
                game.daad.objects.splice(index, 1);
                AdventureCreator.state.daadEditor.selectedObject = null;

                this.addToHistory('delete-object');
                AdventureCreator.saveState();
                this.showNotification('Object deleted successfully', 'success');
                AdventureCreator.navigate('editor');
            }, 'Delete');
        },

        selectObject(index) {
            AdventureCreator.state.daadEditor.selectedObject = index;
            AdventureCreator.navigate('editor');
        },

        // Vocabulary CRUD
        showAddVocabModal() {
            const content = `
                <div class="form-group">
                    <label class="form-label">Word</label>
                    <input type="text" class="form-input" id="vocab-word" placeholder="Enter word">
                </div>
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select class="form-select" id="vocab-type">
                        <option value="verb">Verb</option>
                        <option value="noun">Noun</option>
                        <option value="adjective">Adjective</option>
                        <option value="adverb">Adverb</option>
                        <option value="conjunction">Conjunction</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Word ID</label>
                    <input type="number" class="form-input" id="vocab-id" placeholder="Word ID" min="0">
                    <div class="form-help">Unique identifier for this word</div>
                </div>
            `;

            this.showModal(content, '📝 Add Vocabulary Word', () => {
                const word = document.getElementById('vocab-word').value;
                const type = document.getElementById('vocab-type').value;
                const id = parseInt(document.getElementById('vocab-id').value);

                if (!word) {
                    this.showNotification('Please enter a word', 'warning');
                    return;
                }

                const game = AdventureCreator.getCurrentGame();
                game.daad.vocabulary.push({
                    word: word,
                    type: type,
                    id: id || game.daad.vocabulary.length
                });

                this.addToHistory('add-vocab');
                AdventureCreator.saveState();
                this.showNotification(`Word "${word}" added successfully`, 'success');
                AdventureCreator.navigate('editor');
            });
        },

        showEditVocabModal(index) {
            const game = AdventureCreator.getCurrentGame();
            const vocab = game.daad.vocabulary[index];

            const content = `
                <div class="form-group">
                    <label class="form-label">Word</label>
                    <input type="text" class="form-input" id="vocab-word" value="${this.escapeHtml(vocab.word || '')}">
                </div>
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select class="form-select" id="vocab-type">
                        <option value="verb" ${vocab.type === 'verb' ? 'selected' : ''}>Verb</option>
                        <option value="noun" ${vocab.type === 'noun' ? 'selected' : ''}>Noun</option>
                        <option value="adjective" ${vocab.type === 'adjective' ? 'selected' : ''}>Adjective</option>
                        <option value="adverb" ${vocab.type === 'adverb' ? 'selected' : ''}>Adverb</option>
                        <option value="conjunction" ${vocab.type === 'conjunction' ? 'selected' : ''}>Conjunction</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Word ID</label>
                    <input type="number" class="form-input" id="vocab-id" value="${vocab.id || ''}" min="0">
                </div>
            `;

            this.showModal(content, '✏️ Edit Vocabulary Word', () => {
                const word = document.getElementById('vocab-word').value;
                const type = document.getElementById('vocab-type').value;
                const id = parseInt(document.getElementById('vocab-id').value);

                game.daad.vocabulary[index].word = word;
                game.daad.vocabulary[index].type = type;
                game.daad.vocabulary[index].id = id;

                this.addToHistory('edit-vocab');
                AdventureCreator.saveState();
                this.showNotification('Vocabulary updated successfully', 'success');
                AdventureCreator.navigate('editor');
            });
        },

        deleteVocab(index) {
            const game = AdventureCreator.getCurrentGame();
            game.daad.vocabulary.splice(index, 1);

            this.addToHistory('delete-vocab');
            AdventureCreator.saveState();
            this.showNotification('Vocabulary deleted successfully', 'success');
            AdventureCreator.navigate('editor');
        },

        // Message CRUD
        showAddMessageModal() {
            const content = `
                <div class="form-group">
                    <label class="form-label">Message Text</label>
                    <textarea class="form-textarea" id="message-text" placeholder="Enter message text"></textarea>
                    <div class="form-help">This message can be displayed in your game using the MESSAGE action</div>
                </div>
            `;

            this.showModal(content, '💬 Add New Message', () => {
                const text = document.getElementById('message-text').value;

                if (!text) {
                    this.showNotification('Please enter message text', 'warning');
                    return;
                }

                const game = AdventureCreator.getCurrentGame();
                game.daad.messages.push({ text: text });

                this.addToHistory('add-message');
                AdventureCreator.saveState();
                this.showNotification('Message added successfully', 'success');
                AdventureCreator.navigate('editor');
            });
        },

        showEditMessageModal(index) {
            const game = AdventureCreator.getCurrentGame();
            const message = game.daad.messages[index];

            const content = `
                <div class="form-group">
                    <label class="form-label">Message Text</label>
                    <textarea class="form-textarea" id="message-text">${this.escapeHtml(message.text || '')}</textarea>
                </div>
            `;

            this.showModal(content, '✏️ Edit Message', () => {
                const text = document.getElementById('message-text').value;

                game.daad.messages[index].text = text;

                this.addToHistory('edit-message');
                AdventureCreator.saveState();
                this.showNotification('Message updated successfully', 'success');
                AdventureCreator.navigate('editor');
            });
        },

        deleteMessage(index) {
            const game = AdventureCreator.getCurrentGame();
            game.daad.messages.splice(index, 1);

            this.addToHistory('delete-message');
            AdventureCreator.saveState();
            this.showNotification('Message deleted successfully', 'success');
            AdventureCreator.navigate('editor');
        },

        // Rule management
        showAddRuleModal() {
            const content = `
                <div style="color: #ccc;">
                    <p>Rules are created through Process Tables. Would you like to:</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.5rem;"
                                onclick="AdventureCreator.modules['editor-daad-main'].showConditionsBuilder()">
                            Build Conditions
                        </button>
                        <button class="btn btn-primary" style="width: 100%;"
                                onclick="AdventureCreator.modules['editor-daad-main'].showActionsBuilder()">
                            Build Actions
                        </button>
                    </div>
                </div>
            `;

            this.showModal(content, '⚙️ Create Rule', null, 'Close', false);
        },

        showConditionsBuilder() {
            if (AdventureCreator.modules['daad-conditions']) {
                this.showNotification('Opening Conditions Builder...', 'info');
                // Integration with conditions module would go here
            } else {
                this.showNotification('Conditions module not available. Using fallback.', 'warning');
            }
        },

        showActionsBuilder() {
            if (AdventureCreator.modules['daad-actions']) {
                this.showNotification('Opening Actions Builder...', 'info');
                // Integration with actions module would go here
            } else {
                this.showNotification('Actions module not available. Using fallback.', 'warning');
            }
        },

        editProcess(index) {
            this.showNotification('Process editor coming soon!', 'info');
        },

        deleteProcess(index) {
            const game = AdventureCreator.getCurrentGame();
            game.daad.processes.splice(index, 1);

            this.addToHistory('delete-process');
            AdventureCreator.saveState();
            this.showNotification('Process deleted successfully', 'success');
            AdventureCreator.navigate('editor');
        },

        // Settings
        toggleAutoSave(enabled) {
            AdventureCreator.state.daadEditor.autoSaveEnabled = enabled;
            if (enabled) {
                this.setupAutoSave();
                this.showNotification('Auto-save enabled', 'success');
            } else {
                if (this.autoSaveInterval) {
                    clearInterval(this.autoSaveInterval);
                }
                this.showNotification('Auto-save disabled', 'info');
            }
            this.saveToStorage();
        },

        clearHistory() {
            AdventureCreator.state.daadEditor.editHistory = [];
            AdventureCreator.state.daadEditor.historyIndex = -1;
            this.saveToStorage();
            this.showNotification('Edit history cleared', 'success');
            AdventureCreator.navigate('editor');
        },

        updateGameTitle(title) {
            const game = AdventureCreator.getCurrentGame();
            game.title = title;
            AdventureCreator.saveState();
            this.showNotification('Game title updated', 'success');
        },

        updateGameAuthor(author) {
            const game = AdventureCreator.getCurrentGame();
            game.author = author;
            AdventureCreator.saveState();
            this.showNotification('Author updated', 'success');
        },

        // Module status modal
        showModuleStatusModal() {
            const stats = this.getModuleStats();
            const moduleList = AdventureCreator.daadModules.map(moduleName => {
                const status = AdventureCreator.moduleStatus[moduleName] || 'not-loaded';
                const isLoaded = status === 'loaded-external';
                const isFallback = status === 'loaded-fallback';

                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #0a0a0a; border-radius: 4px; margin-bottom: 0.5rem;">
                        <div>
                            <div style="color: #fff; font-weight: 500;">${moduleName}</div>
                            <div style="color: #666; font-size: 0.75rem;">${isLoaded ? 'Fully loaded' : isFallback ? 'Fallback mode' : 'Not loaded'}</div>
                        </div>
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${isLoaded ? '#10b981' : isFallback ? '#f59e0b' : '#dc2626'};"></div>
                    </div>
                `;
            }).join('');

            const content = `
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="text-align: center; padding: 1rem; background: #0a0a0a; border-radius: 4px;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: #10b981;">${stats.loaded}</div>
                            <div style="color: #999; font-size: 0.75rem;">Loaded</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: #0a0a0a; border-radius: 4px;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: #f59e0b;">${stats.fallback}</div>
                            <div style="color: #999; font-size: 0.75rem;">Fallback</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: #0a0a0a; border-radius: 4px;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: #dc2626;">${stats.missing}</div>
                            <div style="color: #999; font-size: 0.75rem;">Missing</div>
                        </div>
                    </div>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${moduleList}
                    </div>
                </div>
            `;

            this.showModal(content, '📊 Module Status', null, 'Close', false);
        },

        // Help modal
        showHelpModal() {
            const content = `
                <div style="color: #ccc; line-height: 1.6;">
                    <h3 style="color: #8b5cf6; margin-bottom: 1rem;">DAAD Editor Help</h3>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Getting Started</h4>
                    <p>The DAAD Editor is a complete development environment for creating text adventure games. Use the tabs on the left to navigate between different sections of your game.</p>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Keyboard Shortcuts</h4>
                    <ul style="list-style: none; padding-left: 0;">
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+S</kbd> - Save your work</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+Z</kbd> - Undo last change</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+Y</kbd> - Redo change</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+E</kbd> - Export game</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+T</kbd> - Test game</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">F1</kbd> - Show this help</li>
                    </ul>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Features</h4>
                    <ul style="margin-left: 1.5rem;">
                        <li style="margin-bottom: 0.5rem;"><strong>Locations:</strong> Create rooms and areas in your adventure</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Objects:</strong> Add items that players can interact with</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Vocabulary:</strong> Define words the parser understands</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Rules:</strong> Build game logic with conditions and actions</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Messages:</strong> Create text displayed to players</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Auto-Save:</strong> Your work is automatically saved every 30 seconds</li>
                    </ul>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Need More Help?</h4>
                    <p>Check the module status to see which professional modules are loaded and available for use.</p>
                </div>
            `;

            this.showModal(content, '❓ Help', null, 'Close', false);
        },

        // Export and test
        exportGame() {
            const game = AdventureCreator.getCurrentGame();

            try {
                // Generate DAAD format export
                const daadCode = this.generateDAADCode(game);
                const blob = new Blob([daadCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${game.title.replace(/[^a-z0-9]/gi, '_')}.ddb`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showNotification('Game exported successfully!', 'success');
            } catch (error) {
                console.error('Export error:', error);
                this.showNotification('Export failed: ' + error.message, 'error');
            }
        },

        generateDAADCode(game) {
            // Simple DAAD code generation
            let code = `; ${game.title}\n`;
            code += `; Generated by DAAD Editor\n\n`;

            // Vocabulary
            code += `/VOC\n`;
            game.daad.vocabulary.forEach(vocab => {
                code += `${vocab.id}\t${vocab.word}\t${vocab.type}\n`;
            });
            code += `\n`;

            // Messages
            code += `/MTX\n`;
            game.daad.messages.forEach((msg, idx) => {
                code += `${idx}\t${msg.text}\n`;
            });
            code += `\n`;

            // Locations
            code += `/LTX\n`;
            game.daad.locations.forEach((loc, idx) => {
                code += `${idx}\t${loc.name}\n`;
                code += `\t${loc.description}\n`;
            });
            code += `\n`;

            // Objects
            code += `/OTX\n`;
            game.daad.objects.forEach((obj, idx) => {
                code += `${idx}\t${obj.name}\t${obj.initialLocation !== undefined ? obj.initialLocation : 252}\t${obj.weight || 0}\n`;
            });
            code += `\n`;

            return code;
        },

        testGame() {
            this.showNotification('Game testing coming soon! Will launch built-in DAAD interpreter.', 'info');
        }
    });

    console.log('DAAD Main Editor registered successfully');
})();
