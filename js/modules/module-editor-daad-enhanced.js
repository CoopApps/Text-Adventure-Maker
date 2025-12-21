// module-editor-daad-enhanced.js - Enhanced DAAD Editor with Modern UI
// Professional main editor showcasing all 29 modules with modern design

(function() {
    'use strict';

    console.log('🎨 Enhanced DAAD Editor loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found!');
        return;
    }

    AdventureCreator.registerModule('editor-daad-enhanced', {
        name: 'Enhanced DAAD Editor',
        description: 'Modern professional editor showcasing all 29 modules',

        init: function() {
            console.log('✨ Enhanced DAAD Editor initialized');
            if (!AdventureCreator.state.enhancedEditor) {
                AdventureCreator.state.enhancedEditor = {
                    currentView: 'overview',
                    activeModule: null,
                    sidebarCollapsed: false,
                    searchQuery: '',
                    selectedCategory: 'all',
                    recentModules: [],
                    bookmarkedModules: new Set(),
                    showComplexityFilter: false,
                    selectedComplexity: 'all',
                    preferences: {
                        theme: 'dark',
                        sidebarWidth: 380,
                        autoLoadLastModule: false
                    }
                };
            }

            // Load from localStorage
            this.loadFromStorage();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Auto-load last module if preference is set
            if (AdventureCreator.state.enhancedEditor.preferences.autoLoadLastModule &&
                AdventureCreator.state.enhancedEditor.recentModules.length > 0) {
                const lastModule = AdventureCreator.state.enhancedEditor.recentModules[0];
                if (AdventureCreator.modules[lastModule]) {
                    AdventureCreator.state.enhancedEditor.activeModule = lastModule;
                }
            }
        },

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+K - Focus search
                if (e.ctrlKey && e.key === 'k') {
                    e.preventDefault();
                    const searchInput = document.querySelector('.search-input');
                    if (searchInput) searchInput.focus();
                }
                // Ctrl+B - Toggle sidebar
                if (e.ctrlKey && e.key === 'b') {
                    e.preventDefault();
                    this.toggleSidebar();
                }
                // Ctrl+H - Home/Overview
                if (e.ctrlKey && e.key === 'h') {
                    e.preventDefault();
                    this.showOverview();
                }
                // Ctrl+, - Settings
                if (e.ctrlKey && e.key === ',') {
                    e.preventDefault();
                    this.showPreferencesModal();
                }
                // F1 - Help
                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelpModal();
                }
                // Esc - Back to overview if in module view
                if (e.key === 'Escape' && AdventureCreator.state.enhancedEditor.activeModule) {
                    e.preventDefault();
                    this.showOverview();
                }
            });
        },

        saveToStorage() {
            try {
                const state = AdventureCreator.state.enhancedEditor;
                // Convert Set to Array for JSON serialization
                const toSave = {
                    ...state,
                    bookmarkedModules: Array.from(state.bookmarkedModules)
                };
                localStorage.setItem('enhancedEditor_state', JSON.stringify(toSave));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
            }
        },

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('enhancedEditor_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Convert Array back to Set
                    if (parsed.bookmarkedModules) {
                        parsed.bookmarkedModules = new Set(parsed.bookmarkedModules);
                    }
                    // Merge with current state
                    AdventureCreator.state.enhancedEditor = {
                        ...AdventureCreator.state.enhancedEditor,
                        ...parsed,
                        // Reset volatile state
                        activeModule: null,
                        searchQuery: ''
                    };
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        },

        render: function() {
            const game = AdventureCreator.getCurrentGame();
            if (!game) {
                return '<div class="loading">No game selected</div>';
            }

            // Initialize DAAD game structure if needed
            if (!game.daad) {
                game.daad = {
                    locations: [],
                    objects: [],
                    processes: [],
                    messages: [],
                    vocabulary: [],
                    flags: []
                };
            }

            const state = AdventureCreator.state.enhancedEditor;
            const isModuleView = state.activeModule && AdventureCreator.modules[state.activeModule];

            return `
                <div class="enhanced-daad-editor ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}">
                    <style>
                        .enhanced-daad-editor {
                            height: 100vh;
                            display: flex;
                            flex-direction: column;
                            background: var(--background-dark);
                            color: var(--text-primary);
                        }

                        /* Header */
                        .editor-header {
                            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                            border-bottom: 1px solid #334155;
                            padding: 1.5rem 2rem;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        }

                        .editor-title-section {
                            display: flex;
                            flex-direction: column;
                            gap: 0.5rem;
                        }

                        .editor-title {
                            font-size: 1.75rem;
                            font-weight: 800;
                            color: #f8fafc;
                            display: flex;
                            align-items: center;
                            gap: 0.75rem;
                        }

                        .editor-subtitle {
                            font-size: 0.875rem;
                            color: #94a3b8;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        }

                        .breadcrumb {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            font-size: 0.875rem;
                            color: #64748b;
                            margin-top: 0.25rem;
                        }

                        .breadcrumb-link {
                            color: #8b5cf6;
                            cursor: pointer;
                            transition: color 0.2s ease;
                        }

                        .breadcrumb-link:hover {
                            color: #7c3aed;
                        }

                        .editor-actions {
                            display: flex;
                            gap: 1rem;
                            align-items: center;
                        }

                        /* Main Layout */
                        .editor-main {
                            flex: 1;
                            display: flex;
                            overflow: hidden;
                        }

                        /* Sidebar */
                        .editor-sidebar {
                            width: ${state.preferences.sidebarWidth}px;
                            background: #1e293b;
                            border-right: 1px solid #334155;
                            display: flex;
                            flex-direction: column;
                            transition: width 0.3s ease;
                        }

                        .enhanced-daad-editor.sidebar-collapsed .editor-sidebar {
                            width: 60px;
                        }

                        .sidebar-header {
                            padding: 1.5rem;
                            border-bottom: 1px solid #334155;
                            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
                        }

                        .sidebar-title {
                            font-size: 1.125rem;
                            font-weight: 700;
                            color: #f8fafc;
                            margin-bottom: 1rem;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        }

                        .sidebar-collapse-btn {
                            background: none;
                            border: none;
                            color: #94a3b8;
                            cursor: pointer;
                            padding: 0.5rem;
                            border-radius: 0.5rem;
                            transition: all 0.2s ease;
                        }

                        .sidebar-collapse-btn:hover {
                            background: #334155;
                            color: #f8fafc;
                        }

                        .sidebar-stats {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 0.75rem;
                            font-size: 0.75rem;
                        }

                        .sidebar-stat {
                            text-align: center;
                            padding: 0.75rem;
                            background: #0f172a;
                            border-radius: 0.5rem;
                        }

                        .sidebar-stat-number {
                            font-size: 1.5rem;
                            font-weight: 800;
                            color: #8b5cf6;
                        }

                        .sidebar-stat-label {
                            color: #94a3b8;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            font-weight: 600;
                        }

                        /* Search */
                        .sidebar-search {
                            padding: 1rem;
                            border-bottom: 1px solid #334155;
                        }

                        .search-input {
                            width: 100%;
                            padding: 0.75rem;
                            background: #0f172a;
                            border: 1px solid #334155;
                            border-radius: 0.5rem;
                            color: #f8fafc;
                            font-size: 0.875rem;
                            transition: all 0.2s ease;
                        }

                        .search-input:focus {
                            outline: none;
                            border-color: #8b5cf6;
                            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                        }

                        .search-input::placeholder {
                            color: #64748b;
                        }

                        .search-filters {
                            display: flex;
                            gap: 0.5rem;
                            margin-top: 0.75rem;
                            flex-wrap: wrap;
                        }

                        .filter-btn {
                            padding: 0.375rem 0.75rem;
                            background: #0f172a;
                            border: 1px solid #334155;
                            border-radius: 0.375rem;
                            color: #94a3b8;
                            font-size: 0.75rem;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        }

                        .filter-btn.active {
                            background: #8b5cf6;
                            color: white;
                            border-color: #8b5cf6;
                        }

                        .filter-btn:hover:not(.active) {
                            background: #334155;
                            color: #f8fafc;
                        }

                        /* Content */
                        .sidebar-content {
                            flex: 1;
                            overflow-y: auto;
                            padding: 1rem 0;
                        }

                        .recent-modules-section {
                            padding: 0 1rem 1rem;
                            border-bottom: 1px solid #334155;
                        }

                        .section-title-small {
                            font-size: 0.75rem;
                            font-weight: 700;
                            color: #94a3b8;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-bottom: 0.75rem;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        }

                        .overview-section {
                            padding: 0 1rem 1rem;
                            border-bottom: 1px solid #334155;
                        }

                        .overview-btn {
                            display: block;
                            width: 100%;
                            padding: 1rem;
                            background: ${!state.activeModule ? '#8b5cf6' : 'none'};
                            border: none;
                            color: ${!state.activeModule ? 'white' : '#94a3b8'};
                            text-align: left;
                            cursor: pointer;
                            border-radius: 0.5rem;
                            font-weight: 600;
                            transition: all 0.3s ease;
                            font-size: 0.875rem;
                        }

                        .overview-btn:hover:not(.active) {
                            background: #334155;
                            color: #f8fafc;
                        }

                        .module-category {
                            margin-bottom: 1.5rem;
                        }

                        .category-header {
                            padding: 0.75rem 1rem;
                            font-size: 0.875rem;
                            font-weight: 700;
                            color: #8b5cf6;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            background: rgba(139, 92, 246, 0.1);
                            border-radius: 0.5rem;
                            margin: 0 1rem 0.75rem;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        }

                        .category-count {
                            background: #8b5cf6;
                            color: white;
                            padding: 0.25rem 0.5rem;
                            border-radius: 0.375rem;
                            font-size: 0.75rem;
                            font-weight: 600;
                        }

                        .module-list {
                            display: flex;
                            flex-direction: column;
                            gap: 0.25rem;
                            padding: 0 1rem;
                        }

                        .module-item {
                            display: flex;
                            align-items: center;
                            gap: 0.75rem;
                            padding: 1rem;
                            background: none;
                            color: #94a3b8;
                            text-decoration: none;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            border: 1px solid transparent;
                            position: relative;
                        }

                        .module-item:hover:not(.active) {
                            background: #334155;
                            color: #f8fafc;
                            transform: translateX(4px);
                            border-color: #475569;
                        }

                        .module-item.active {
                            background: #8b5cf6;
                            color: white;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                            border-color: #7c3aed;
                        }

                        .module-icon {
                            font-size: 1.25rem;
                            width: 24px;
                            text-align: center;
                            flex-shrink: 0;
                        }

                        .module-info {
                            flex: 1;
                            min-width: 0;
                        }

                        .module-name {
                            font-weight: 600;
                            font-size: 0.875rem;
                            line-height: 1.2;
                            margin-bottom: 0.25rem;
                        }

                        .module-description {
                            font-size: 0.75rem;
                            opacity: 0.8;
                            line-height: 1.3;
                        }

                        .module-status {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            flex-shrink: 0;
                        }

                        .status-indicator {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #10b981;
                        }

                        .status-indicator.fallback {
                            background: #f59e0b;
                        }

                        .status-indicator.unavailable {
                            background: #ef4444;
                        }

                        .bookmark-btn {
                            position: absolute;
                            top: 0.5rem;
                            right: 0.5rem;
                            background: none;
                            border: none;
                            color: #64748b;
                            cursor: pointer;
                            font-size: 1rem;
                            padding: 0.25rem;
                            opacity: 0;
                            transition: all 0.2s;
                        }

                        .module-item:hover .bookmark-btn {
                            opacity: 1;
                        }

                        .bookmark-btn.bookmarked {
                            opacity: 1;
                            color: #f59e0b;
                        }

                        .bookmark-btn:hover {
                            transform: scale(1.2);
                        }

                        .complexity-badge {
                            padding: 0.125rem 0.375rem;
                            border-radius: 0.375rem;
                            font-size: 0.625rem;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        }

                        .complexity-basic {
                            background: #10b981;
                            color: white;
                        }

                        .complexity-intermediate {
                            background: #f59e0b;
                            color: white;
                        }

                        .complexity-advanced {
                            background: #ef4444;
                            color: white;
                        }

                        .complexity-expert {
                            background: #8b5cf6;
                            color: white;
                        }

                        /* Main Content */
                        .editor-content {
                            flex: 1;
                            overflow-y: auto;
                            background: #0f172a;
                            position: relative;
                        }

                        /* Modals */
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
                            color: #ccc;
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
                        .form-select {
                            width: 100%;
                            padding: 0.75rem;
                            background: #0a0a0a;
                            border: 1px solid #333;
                            border-radius: 4px;
                            color: #fff;
                            font-size: 0.875rem;
                        }

                        .form-input:focus,
                        .form-select:focus {
                            outline: none;
                            border-color: #8b5cf6;
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

                        /* Collapsed Styles */
                        .enhanced-daad-editor.sidebar-collapsed .sidebar-header,
                        .enhanced-daad-editor.sidebar-collapsed .sidebar-search,
                        .enhanced-daad-editor.sidebar-collapsed .recent-modules-section {
                            display: none;
                        }

                        .enhanced-daad-editor.sidebar-collapsed .module-info,
                        .enhanced-daad-editor.sidebar-collapsed .module-description,
                        .enhanced-daad-editor.sidebar-collapsed .bookmark-btn {
                            display: none;
                        }

                        .enhanced-daad-editor.sidebar-collapsed .module-item {
                            justify-content: center;
                            padding: 0.75rem 0.5rem;
                        }

                        .enhanced-daad-editor.sidebar-collapsed .category-header {
                            justify-content: center;
                            margin: 0 0.5rem 0.5rem;
                            padding: 0.5rem;
                        }

                        .enhanced-daad-editor.sidebar-collapsed .category-header span:not(:first-child) {
                            display: none;
                        }

                        .enhanced-daad-editor.sidebar-collapsed .overview-section {
                            padding: 0 0.5rem 1rem;
                        }

                        .enhanced-daad-editor.sidebar-collapsed .overview-btn {
                            padding: 0.75rem 0.5rem;
                            text-align: center;
                        }

                        /* Buttons */
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

                        /* Responsive */
                        @media (max-width: 768px) {
                            .enhanced-daad-editor {
                                height: 100vh;
                            }

                            .editor-header {
                                padding: 1rem;
                                flex-direction: column;
                                gap: 1rem;
                            }

                            .editor-sidebar {
                                width: 100%;
                                position: absolute;
                                z-index: 10;
                                height: 100%;
                            }

                            .enhanced-daad-editor.sidebar-collapsed .editor-sidebar {
                                width: 60px;
                            }

                            .sidebar-stats {
                                grid-template-columns: repeat(4, 1fr);
                                gap: 0.5rem;
                            }

                            .search-filters {
                                gap: 0.25rem;
                            }
                        }

                        /* Tooltip for collapsed sidebar */
                        .module-item[title]:hover::after {
                            content: attr(title);
                            position: absolute;
                            left: 100%;
                            top: 50%;
                            transform: translateY(-50%);
                            margin-left: 0.5rem;
                            padding: 0.5rem 0.75rem;
                            background: #1a1a1a;
                            border: 1px solid #333;
                            border-radius: 4px;
                            white-space: nowrap;
                            z-index: 100;
                            font-size: 0.875rem;
                            color: #fff;
                        }

                        .enhanced-daad-editor:not(.sidebar-collapsed) .module-item[title]:hover::after {
                            display: none;
                        }
                    </style>

                    ${this.renderHeader(game)}

                    <div class="editor-main">
                        ${this.renderSidebar(game)}
                        <div class="editor-content">
                            ${isModuleView ? this.renderModuleView(state.activeModule) : this.renderOverview(game)}
                        </div>
                    </div>
                </div>
            `;
        },

        renderHeader: function(game) {
            const state = AdventureCreator.state.enhancedEditor;
            const activeModule = state.activeModule;
            const breadcrumb = activeModule ? ` > ${this.getModuleDisplayName(activeModule)}` : '';

            return `
                <div class="editor-header">
                    <div class="editor-title-section">
                        <div class="editor-title">
                            🎮 ${this.escapeHtml(game.title)}
                            ${activeModule ? `<span style="color: #64748b;">→</span> ${this.getModuleDisplayName(activeModule)}` : ''}
                        </div>
                        <div class="editor-subtitle">
                            DAAD Adventure Development Studio
                        </div>
                        <div class="breadcrumb">
                            <span class="breadcrumb-link" onclick="AdventureCreator.modules['editor-daad-enhanced'].showOverview()">Overview</span>
                            ${activeModule ? `<span>→</span><span>${this.getModuleDisplayName(activeModule)}</span>` : ''}
                        </div>
                    </div>
                    <div class="editor-actions">
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-enhanced'].showPreferencesModal()">
                            ⚙️ Settings
                        </button>
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-enhanced'].showModuleStatusModal()">
                            📊 Modules
                        </button>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['editor-daad-enhanced'].exportGame()">
                            💾 Export
                        </button>
                        <button class="btn btn-success" onclick="AdventureCreator.modules['editor-daad-enhanced'].testGame()">
                            ▶️ Test
                        </button>
                    </div>
                </div>
            `;
        },

        renderSidebar: function(game) {
            const state = AdventureCreator.state.enhancedEditor;
            const availableModules = this.getAvailableModules();
            const categories = this.categorizeModules(availableModules);
            const filteredCategories = this.filterModules(categories);

            return `
                <div class="editor-sidebar">
                    ${!state.sidebarCollapsed ? `
                        <div class="sidebar-header">
                            <div class="sidebar-title">
                                🛠️ Module Toolkit
                                <button class="sidebar-collapse-btn" onclick="AdventureCreator.modules['editor-daad-enhanced'].toggleSidebar()">
                                    ◀
                                </button>
                            </div>
                            <div class="sidebar-stats">
                                <div class="sidebar-stat">
                                    <div class="sidebar-stat-number">${game.daad?.locations?.length || 0}</div>
                                    <div class="sidebar-stat-label">Locations</div>
                                </div>
                                <div class="sidebar-stat">
                                    <div class="sidebar-stat-number">${game.daad?.objects?.length || 0}</div>
                                    <div class="sidebar-stat-label">Objects</div>
                                </div>
                                <div class="sidebar-stat">
                                    <div class="sidebar-stat-number">${game.daad?.processes?.length || 0}</div>
                                    <div class="sidebar-stat-label">Rules</div>
                                </div>
                                <div class="sidebar-stat">
                                    <div class="sidebar-stat-number">${availableModules.length}</div>
                                    <div class="sidebar-stat-label">Modules</div>
                                </div>
                            </div>
                        </div>

                        <div class="sidebar-search">
                            <input type="text" class="search-input" placeholder="Search modules... (Ctrl+K)"
                                   value="${state.searchQuery}"
                                   onchange="AdventureCreator.modules['editor-daad-enhanced'].updateSearch(this.value)"
                                   oninput="AdventureCreator.modules['editor-daad-enhanced'].updateSearch(this.value)">
                            <div class="search-filters">
                                <button class="filter-btn ${state.selectedCategory === 'all' ? 'active' : ''}"
                                        onclick="AdventureCreator.modules['editor-daad-enhanced'].filterByCategory('all')">All</button>
                                <button class="filter-btn ${state.selectedCategory === 'Core Systems' ? 'active' : ''}"
                                        onclick="AdventureCreator.modules['editor-daad-enhanced'].filterByCategory('Core Systems')">Core</button>
                                <button class="filter-btn ${state.selectedCategory === 'Interface' ? 'active' : ''}"
                                        onclick="AdventureCreator.modules['editor-daad-enhanced'].filterByCategory('Interface')">UI</button>
                                <button class="filter-btn ${state.selectedCategory === 'Advanced Professional' ? 'active' : ''}"
                                        onclick="AdventureCreator.modules['editor-daad-enhanced'].filterByCategory('Advanced Professional')">Pro</button>
                                <button class="filter-btn ${state.selectedCategory === 'Infrastructure' ? 'active' : ''}"
                                        onclick="AdventureCreator.modules['editor-daad-enhanced'].filterByCategory('Infrastructure')">Infra</button>
                            </div>
                        </div>

                        ${state.recentModules.length > 0 ? `
                            <div class="recent-modules-section">
                                <div class="section-title-small">
                                    <span>⏱️ Recent</span>
                                    <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.625rem;"
                                            onclick="AdventureCreator.modules['editor-daad-enhanced'].clearRecentModules()">Clear</button>
                                </div>
                                <div class="module-list">
                                    ${state.recentModules.slice(0, 3).map(moduleName => this.renderModuleItem(moduleName, state)).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${state.bookmarkedModules.size > 0 ? `
                            <div class="recent-modules-section">
                                <div class="section-title-small">
                                    <span>⭐ Bookmarked</span>
                                </div>
                                <div class="module-list">
                                    ${Array.from(state.bookmarkedModules).map(moduleName => this.renderModuleItem(moduleName, state)).join('')}
                                </div>
                            </div>
                        ` : ''}
                    ` : `
                        <div style="padding: 1rem; text-align: center;">
                            <button class="sidebar-collapse-btn" onclick="AdventureCreator.modules['editor-daad-enhanced'].toggleSidebar()" title="Expand sidebar">
                                ▶
                            </button>
                        </div>
                    `}

                    <div class="sidebar-content">
                        ${!state.sidebarCollapsed ? `
                            <div class="overview-section">
                                <button class="overview-btn ${!state.activeModule ? 'active' : ''}"
                                        onclick="AdventureCreator.modules['editor-daad-enhanced'].showOverview()">
                                    📊 Project Overview
                                </button>
                            </div>
                        ` : ''}

                        ${Object.entries(filteredCategories).map(([category, modules]) => `
                            <div class="module-category">
                                <div class="category-header">
                                    <span>${this.getCategoryIcon(category)} ${state.sidebarCollapsed ? '' : category}</span>
                                    ${!state.sidebarCollapsed ? `<span class="category-count">${modules.length}</span>` : ''}
                                </div>
                                <div class="module-list">
                                    ${modules.map(moduleName => this.renderModuleItem(moduleName, state)).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderModuleItem: function(moduleName, state) {
            const isActive = state.activeModule === moduleName;
            const module = AdventureCreator.modules[moduleName];
            const isAvailable = !!module;
            const complexity = module?.complexity || 'basic';
            const isBookmarked = state.bookmarkedModules.has(moduleName);
            const displayName = this.getModuleDisplayName(moduleName);
            const description = this.getModuleDescription(moduleName);

            return `
                <div class="module-item ${isActive ? 'active' : ''}"
                     onclick="AdventureCreator.modules['editor-daad-enhanced'].showModule('${moduleName}')"
                     title="${state.sidebarCollapsed ? displayName : ''}">
                    <div class="module-icon">${this.getModuleIcon(moduleName)}</div>
                    <div class="module-info">
                        <div class="module-name">${displayName}</div>
                        <div class="module-description">${description}</div>
                    </div>
                    <div class="module-status">
                        <div class="status-indicator ${isAvailable ? 'loaded' : 'unavailable'}"></div>
                        <div class="complexity-badge complexity-${complexity}">${complexity}</div>
                    </div>
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}"
                            onclick="event.stopPropagation(); AdventureCreator.modules['editor-daad-enhanced'].toggleBookmark('${moduleName}')"
                            title="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
                        ${isBookmarked ? '⭐' : '☆'}
                    </button>
                </div>
            `;
        },

        renderOverview: function(game) {
            const availableModules = this.getAvailableModules();
            const moduleStats = this.getModuleStatsByCategory();

            return `
                <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 3rem;">
                        <h2 style="color: #f8fafc; font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem;">
                            🎮 Adventure Development Hub
                        </h2>
                        <p style="color: #94a3b8; font-size: 1.125rem; max-width: 600px; margin: 0 auto;">
                            Access all 29 professional modules to create, test, and deploy your DAAD adventure
                        </p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
                        ${Object.entries(moduleStats).map(([category, stats]) => `
                            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 2rem; text-align: center; transition: all 0.3s ease; cursor: pointer;"
                                 onclick="AdventureCreator.modules['editor-daad-enhanced'].filterByCategory('${category}')"
                                 onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='#8b5cf6'"
                                 onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#334155'">
                                <div style="font-size: 2rem; margin-bottom: 1rem;">${this.getCategoryIcon(category)}</div>
                                <div style="font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.5rem;">${stats.total}</div>
                                <div style="color: #94a3b8; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 0.5rem;">${category}</div>
                                <div style="color: #64748b; font-size: 0.75rem;">${stats.loaded} loaded • ${stats.total - stats.loaded} pending</div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;">
                        <h3 style="color: #f8fafc; font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                            🚀 Quick Start Guide
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                            ${this.renderQuickStartCard('🔍 Build Conditions', 'Create logical conditions for your adventure', 'condition-system')}
                            ${this.renderQuickStartCard('⚡ Add Actions', 'Define what happens in your game', 'action-system')}
                            ${this.renderQuickStartCard('📋 Create Rules', 'Organize logic with process tables', 'processes')}
                            ${this.renderQuickStartCard('🎯 Visual Flow', 'See your game logic visually', 'visual-process-flow')}
                            ${this.renderQuickStartCard('🎮 Test Game', 'Built-in testing and debugging', 'game-testing-tools')}
                            ${this.renderQuickStartCard('💾 Export Game', 'Multiple platform support', 'code-generation-options')}
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;">
                        <h3 style="color: #8b5cf6; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">
                            💡 Pro Tips
                        </h3>
                        <div style="color: #e2e8f0; line-height: 1.6;">
                            <p style="margin-bottom: 1rem;">
                                <strong>Start Simple:</strong> Begin with the Conditions and Actions modules to understand the basics, then progress to advanced features.
                            </p>
                            <p style="margin-bottom: 1rem;">
                                <strong>Use Visual Tools:</strong> The Visual Process Flow module helps you understand complex rule interactions.
                            </p>
                            <p style="margin-bottom: 1rem;">
                                <strong>Test Early:</strong> Use the Game Testing Tools to validate your logic as you build.
                            </p>
                            <p style="margin-bottom: 1rem;">
                                <strong>Bookmark Favorites:</strong> Hover over modules and click the star icon to bookmark frequently used modules.
                            </p>
                            <p>
                                <strong>Keyboard Shortcuts:</strong> Press F1 for help or Ctrl+K to quickly search for modules.
                            </p>
                        </div>
                    </div>

                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 2rem;">
                        <h3 style="color: #f8fafc; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">
                            ⌨️ Keyboard Shortcuts
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; color: #94a3b8;">
                            <div><kbd style="background: #0f172a; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #334155;">Ctrl+K</kbd> Search modules</div>
                            <div><kbd style="background: #0f172a; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #334155;">Ctrl+B</kbd> Toggle sidebar</div>
                            <div><kbd style="background: #0f172a; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #334155;">Ctrl+H</kbd> Home/Overview</div>
                            <div><kbd style="background: #0f172a; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #334155;">Ctrl+,</kbd> Settings</div>
                            <div><kbd style="background: #0f172a; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #334155;">Esc</kbd> Back to overview</div>
                            <div><kbd style="background: #0f172a; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #334155;">F1</kbd> Help</div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderQuickStartCard: function(title, description, moduleName) {
            const isAvailable = !!AdventureCreator.modules[moduleName];
            return `
                <div style="background: #0f172a; border: 1px solid ${isAvailable ? '#10b981' : '#ef4444'}; border-radius: 0.75rem; padding: 1.5rem; cursor: ${isAvailable ? 'pointer' : 'default'}; transition: all 0.3s ease;"
                     ${isAvailable ? `onclick="AdventureCreator.modules['editor-daad-enhanced'].showModule('${moduleName}')"` : ''}
                     ${isAvailable ? `onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='#8b5cf6'"` : ''}
                     ${isAvailable ? `onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#10b981'"` : ''}>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <div style="font-weight: 600; color: #f8fafc; font-size: 0.95rem;">${title}</div>
                        <div style="font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 1rem; background: ${isAvailable ? '#10b981' : '#ef4444'}; color: #fff; font-weight: 600;">
                            ${isAvailable ? 'READY' : 'N/A'}
                        </div>
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem; line-height: 1.4;">${description}</div>
                </div>
            `;
        },

        renderModuleView: function(moduleName) {
            const module = AdventureCreator.modules[moduleName];
            if (!module || !module.render) {
                return `
                    <div style="padding: 2rem; text-align: center;">
                        <div style="background: #ef4444; color: #fff; padding: 1.5rem; border-radius: 1rem; max-width: 600px; margin: 0 auto;">
                            <h3 style="margin-bottom: 1rem;">⚠️ Module Not Available</h3>
                            <p style="margin-bottom: 1rem;">${moduleName} is not currently loaded or doesn't have a render method.</p>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-enhanced'].showOverview()">
                                ← Back to Overview
                            </button>
                        </div>
                    </div>
                `;
            }

            // Add the module to recent modules
            this.addToRecentModules(moduleName);

            try {
                return `
                    <div style="padding: 1.5rem;">
                        <div style="max-width: 1200px; margin: 0 auto;">
                            ${module.render()}
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Module render error:', error);
                this.showNotification(`Failed to render module: ${error.message}`, 'error');
                return `
                    <div style="padding: 2rem; text-align: center;">
                        <div style="background: #ef4444; color: #fff; padding: 1.5rem; border-radius: 1rem; max-width: 600px; margin: 0 auto;">
                            <h3 style="margin-bottom: 1rem;">⚠️ Render Error</h3>
                            <p style="margin-bottom: 1rem;">Failed to render ${this.getModuleDisplayName(moduleName)}: ${this.escapeHtml(error.message)}</p>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-enhanced'].showOverview()">
                                ← Back to Overview
                            </button>
                        </div>
                    </div>
                `;
            }
        },

        // Helper Methods
        getAvailableModules: function() {
            return Object.keys(AdventureCreator.modules).filter(name =>
                name !== 'editor-daad-enhanced' && name !== 'editor-daad-main'
            );
        },

        categorizeModules: function(modules) {
            const categories = {
                'Core Systems': [],
                'Interface': [],
                'Advanced Professional': [],
                'Infrastructure': []
            };

            modules.forEach(moduleName => {
                const module = AdventureCreator.modules[moduleName];
                let category = module?.category || 'Core Systems';

                // Map category names for consistency
                if (category === 'Professional') category = 'Advanced Professional';

                if (categories[category]) {
                    categories[category].push(moduleName);
                } else {
                    categories['Core Systems'].push(moduleName);
                }
            });

            // Remove empty categories
            Object.keys(categories).forEach(key => {
                if (categories[key].length === 0) {
                    delete categories[key];
                }
            });

            return categories;
        },

        filterModules: function(categories) {
            const state = AdventureCreator.state.enhancedEditor;
            const searchQuery = state.searchQuery.toLowerCase();
            const selectedCategory = state.selectedCategory;

            const filtered = {};

            Object.entries(categories).forEach(([category, modules]) => {
                if (selectedCategory !== 'all' && selectedCategory !== category) {
                    return;
                }

                const filteredModules = modules.filter(moduleName => {
                    if (!searchQuery) return true;

                    const displayName = this.getModuleDisplayName(moduleName).toLowerCase();
                    const description = this.getModuleDescription(moduleName).toLowerCase();

                    return displayName.includes(searchQuery) || description.includes(searchQuery);
                });

                if (filteredModules.length > 0) {
                    filtered[category] = filteredModules;
                }
            });

            return filtered;
        },

        getModuleStatsByCategory: function() {
            const categories = this.categorizeModules(this.getAvailableModules());
            const stats = {};

            Object.entries(categories).forEach(([category, modules]) => {
                const loaded = modules.filter(m => AdventureCreator.modules[m]).length;
                stats[category] = {
                    total: modules.length,
                    loaded: loaded
                };
            });

            return stats;
        },

        getCategoryIcon: function(category) {
            const icons = {
                'Core Systems': '🎮',
                'Interface': '🖥️',
                'Advanced Professional': '🏆',
                'Infrastructure': '🔧'
            };
            return icons[category] || '📦';
        },

        getModuleIcon: function(moduleName) {
            const icons = {
                'condition-system': '🔍',
                'action-system': '⚡',
                'processes': '📋',
                'flag-management': '🔢',
                'locations': '📦',
                'execution-flow': '🎮',
                'display-control': '🖥️',
                'inventory-system': '🎒',
                'objects': '📦',
                'weight-system': '⚖️',
                'visual-process-flow': '🎯',
                'rule-dependencies': '🔗',
                'game-testing-tools': '🧪',
                'code-generation-options': '⚙️',
                'import-export-tools': '🔄',
                'maluva-extensions-system': '🎵',
                'graphics-integration-system': '🎨',
                'location-connections': '🗺️',
                'character-interaction': '👥',
                'combat-systems': '⚔️',
                'puzzle-mechanics': '🧩',
                'synonym-system': '📝'
            };
            return icons[moduleName] || '🔧';
        },

        getModuleDisplayName: function(moduleName) {
            const names = {
                'condition-system': 'Conditions',
                'action-system': 'Actions',
                'processes': 'Process Tables',
                'flag-management': 'Flag System',
                'locations': 'Objects & Locations',
                'execution-flow': 'Control Flow',
                'display-control': 'Display Control',
                'inventory-system': 'Inventory',
                'objects': 'Containers',
                'weight-system': 'Weight System',
                'visual-process-flow': 'Visual Flow',
                'rule-dependencies': 'Dependencies',
                'game-testing-tools': 'Testing Tools',
                'code-generation-options': 'Code Generation',
                'import-export-tools': 'Import/Export',
                'maluva-extensions-system': 'Sound & Graphics',
                'graphics-integration-system': 'Graphics System',
                'location-connections': 'Location Connections',
                'character-interaction': 'Character Interaction',
                'combat-systems': 'Combat Systems',
                'puzzle-mechanics': 'Puzzle Mechanics',
                'synonym-system': 'Synonym System'
            };
            return names[moduleName] || moduleName.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        },

        getModuleDescription: function(moduleName) {
            const descriptions = {
                'condition-system': 'Build logical conditions for your adventure',
                'action-system': 'Create game actions and responses',
                'processes': 'Manage game logic and rules',
                'flag-management': 'Advanced flag operations',
                'locations': 'Object and location management',
                'execution-flow': 'Control game flow and jumps',
                'display-control': 'Screen formatting and display',
                'inventory-system': 'Player inventory management',
                'objects': 'Container and object systems',
                'weight-system': 'Weight and encumbrance',
                'visual-process-flow': 'Visual rule relationships',
                'rule-dependencies': 'Analyze rule dependencies',
                'game-testing-tools': 'Built-in testing and debugging',
                'code-generation-options': 'Multi-platform code generation',
                'import-export-tools': 'File import and export tools'
            };
            return descriptions[moduleName] || 'Professional DAAD development tool';
        },

        // Navigation Methods
        showOverview: function() {
            AdventureCreator.state.enhancedEditor.activeModule = null;
            AdventureCreator.navigate('editor');
        },

        showModule: function(moduleName) {
            if (AdventureCreator.modules[moduleName]) {
                AdventureCreator.state.enhancedEditor.activeModule = moduleName;
                AdventureCreator.navigate('editor');
            } else {
                this.showNotification(`Module "${moduleName}" is not available.`, 'warning');
            }
        },

        toggleSidebar: function() {
            AdventureCreator.state.enhancedEditor.sidebarCollapsed = !AdventureCreator.state.enhancedEditor.sidebarCollapsed;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        updateSearch: function(query) {
            AdventureCreator.state.enhancedEditor.searchQuery = query;
            AdventureCreator.navigate('editor');
        },

        filterByCategory: function(category) {
            AdventureCreator.state.enhancedEditor.selectedCategory = category;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        addToRecentModules: function(moduleName) {
            const state = AdventureCreator.state.enhancedEditor;
            const recentModules = state.recentModules.filter(m => m !== moduleName);
            recentModules.unshift(moduleName);
            state.recentModules = recentModules.slice(0, 5); // Keep only 5 most recent
            this.saveToStorage();
        },

        clearRecentModules: function() {
            AdventureCreator.state.enhancedEditor.recentModules = [];
            this.saveToStorage();
            this.showNotification('Recent modules cleared', 'info');
            AdventureCreator.navigate('editor');
        },

        toggleBookmark: function(moduleName) {
            const state = AdventureCreator.state.enhancedEditor;
            if (state.bookmarkedModules.has(moduleName)) {
                state.bookmarkedModules.delete(moduleName);
                this.showNotification(`Removed ${this.getModuleDisplayName(moduleName)} from bookmarks`, 'info');
            } else {
                state.bookmarkedModules.add(moduleName);
                this.showNotification(`Added ${this.getModuleDisplayName(moduleName)} to bookmarks`, 'success');
            }
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        // Modals
        showModal(content, title, onConfirm, confirmText = 'OK', showCancel = true) {
            const modalId = 'enhanced-modal-' + Date.now();
            const modalHtml = `
                <div class="modal-overlay" id="${modalId}" onclick="if(event.target.id==='${modalId}')AdventureCreator.modules['editor-daad-enhanced'].closeModal('${modalId}')">
                    <div class="modal">
                        <div class="modal-header">
                            <div class="modal-title">${title}</div>
                            <button class="modal-close" onclick="AdventureCreator.modules['editor-daad-enhanced'].closeModal('${modalId}')">&times;</button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            ${showCancel ? `<button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-enhanced'].closeModal('${modalId}')">Cancel</button>` : ''}
                            <button class="btn btn-primary" onclick="${onConfirm ? `AdventureCreator.modules['editor-daad-enhanced'].handleModalConfirm('${modalId}', ${onConfirm})` : `AdventureCreator.modules['editor-daad-enhanced'].closeModal('${modalId}')`}">${confirmText}</button>
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

        showModuleStatusModal: function() {
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

        showHelpModal: function() {
            const content = `
                <div style="line-height: 1.6;">
                    <h3 style="color: #8b5cf6; margin-bottom: 1rem;">Enhanced DAAD Editor Help</h3>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">What is this?</h4>
                    <p>The Enhanced DAAD Editor is a modern module launcher that provides quick access to all 29 professional DAAD development modules. Use it to navigate between different tools and features.</p>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Keyboard Shortcuts</h4>
                    <ul style="list-style: none; padding-left: 0;">
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+K</kbd> - Focus search</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+B</kbd> - Toggle sidebar</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+H</kbd> - Return to overview</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+,</kbd> - Open settings</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">Esc</kbd> - Back to overview</li>
                        <li style="margin-bottom: 0.5rem;"><kbd style="background: #333; padding: 0.25rem 0.5rem; border-radius: 4px;">F1</kbd> - Show this help</li>
                    </ul>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Features</h4>
                    <ul style="margin-left: 1.5rem;">
                        <li style="margin-bottom: 0.5rem;"><strong>Module Search:</strong> Type in the search box to filter modules</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Category Filters:</strong> Click category buttons to show only specific types of modules</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Bookmarks:</strong> Hover over modules and click the star to bookmark favorites</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Recent Modules:</strong> Your last 5 used modules are tracked automatically</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Sidebar Collapse:</strong> Click the arrow to minimize the sidebar for more space</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Auto-save:</strong> All preferences are saved automatically</li>
                    </ul>

                    <h4 style="color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">Tips</h4>
                    <ul style="margin-left: 1.5rem;">
                        <li style="margin-bottom: 0.5rem;">Click on category cards in the overview to filter by that category</li>
                        <li style="margin-bottom: 0.5rem;">Use the breadcrumb navigation to quickly return to the overview</li>
                        <li style="margin-bottom: 0.5rem;">Check module status to see which modules are fully loaded vs fallback</li>
                        <li style="margin-bottom: 0.5rem;">Bookmark frequently used modules for quick access</li>
                    </ul>
                </div>
            `;

            this.showModal(content, '❓ Help', null, 'Close', false);
        },

        showPreferencesModal: function() {
            const state = AdventureCreator.state.enhancedEditor;
            const content = `
                <div class="form-group">
                    <label class="form-label">Sidebar Width (pixels)</label>
                    <input type="number" class="form-input" id="pref-sidebar-width"
                           value="${state.preferences.sidebarWidth}" min="280" max="600" step="20">
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="pref-auto-load"
                               ${state.preferences.autoLoadLastModule ? 'checked' : ''}>
                        Auto-load last used module on startup
                    </label>
                </div>
                <div class="form-group">
                    <button class="btn btn-secondary" onclick="AdventureCreator.modules['editor-daad-enhanced'].resetPreferences()">
                        Reset to Defaults
                    </button>
                </div>
            `;

            this.showModal(content, '⚙️ Preferences', () => {
                const sidebarWidth = parseInt(document.getElementById('pref-sidebar-width').value);
                const autoLoad = document.getElementById('pref-auto-load').checked;

                state.preferences.sidebarWidth = sidebarWidth;
                state.preferences.autoLoadLastModule = autoLoad;

                this.saveToStorage();
                this.showNotification('Preferences saved', 'success');
                AdventureCreator.navigate('editor');
            }, 'Save');
        },

        resetPreferences: function() {
            const state = AdventureCreator.state.enhancedEditor;
            state.preferences = {
                theme: 'dark',
                sidebarWidth: 380,
                autoLoadLastModule: false
            };
            this.saveToStorage();
            this.showNotification('Preferences reset to defaults', 'success');
            AdventureCreator.navigate('editor');
        },

        exportGame: function() {
            if (AdventureCreator.modules['code-generation-options']) {
                this.showModule('code-generation-options');
            } else if (AdventureCreator.modules['import-export-tools']) {
                this.showModule('import-export-tools');
            } else {
                this.showNotification('Export functionality requires the Code Generation Options or Import/Export Tools module.', 'warning');
            }
        },

        testGame: function() {
            if (AdventureCreator.modules['game-testing-tools']) {
                this.showModule('game-testing-tools');
            } else {
                this.showNotification('Testing functionality requires the Game Testing Tools module.', 'info');
            }
        },

        escapeHtml: function(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    });

    console.log('✨ Enhanced DAAD Editor registered successfully');
})();
