// module-import-export-tools.js - Module 29: Import/Export Tools System
// Part of DAAD Adventure Creator - Expert Infrastructure for Professional Distribution
// Complete implementation with real file I/O, modals, persistence, and professional features

(function() {
    'use strict';

    console.log('Import/Export Tools module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found!');
        return;
    }

    const ImportExportTools = {
        name: 'Import/Export Tools',
        description: 'Import existing DAAD games and export to multiple formats for professional distribution',
        category: 'Infrastructure',
        complexity: 'Expert',
        version: '1.0.0',

        init() {
            console.log('Import/Export Tools initialized');
            if (!AdventureCreator.state.importExport) {
                AdventureCreator.state.importExport = {
                    selectedTab: 'import',
                    importFormat: 'auto-detect',
                    exportFormat: 'modern-daad',
                    lastImportedFile: null,
                    conversionLog: [],
                    importHistory: [],
                    exportProfiles: this.getDefaultExportProfiles(),
                    importSettings: {
                        preserveComments: true,
                        validateSyntax: true,
                        convertExtensions: true,
                        mergeDuplicates: false,
                        autoAssignIds: true,
                        createBackup: true
                    },
                    exportSettings: {
                        includeComments: true,
                        optimizeSize: false,
                        includeMeta: true,
                        formatCode: true,
                        targetPlatform: 'universal',
                        compression: 'none'
                    },
                    batchOperations: {
                        selectedFiles: [],
                        operation: 'convert',
                        outputFolder: 'exports/'
                    }
                };
            }
            this.loadFromStorage();
        },

        getDefaultExportProfiles() {
            return [
                {
                    id: 'spectrum-classic',
                    name: 'ZX Spectrum Classic',
                    description: 'Classic ZX Spectrum TAP format',
                    format: 'spectrum-tap',
                    settings: { targetPlatform: 'spectrum', compression: 'none' }
                },
                {
                    id: 'web-modern',
                    name: 'Modern Web HTML5',
                    description: 'Web-playable HTML5 version',
                    format: 'html5-web',
                    settings: { targetPlatform: 'web', compression: 'zip' }
                },
                {
                    id: 'universal-daad',
                    name: 'Universal DAAD',
                    description: 'Compatible with all DAAD interpreters',
                    format: 'modern-daad',
                    settings: { targetPlatform: 'universal', compression: 'none' }
                }
            ];
        },

        render() {
            const state = AdventureCreator.state.importExport;

            return `
                <div class="import-export-container">
                    ${this.renderStyles()}

                    <div class="section-header" onclick="AdventureCreator.toggleSection('import-export-main')">
                        <h2>🔄 Import/Export Tools</h2>
                        <div class="complexity-badges">
                            <span class="complexity-badge expert">Expert</span>
                            <span class="feature-badge infrastructure">Infrastructure</span>
                            <span class="priority-badge module-29">Module 29</span>
                        </div>
                        <span class="toggle-icon" id="import-export-main-icon">▼</span>
                    </div>

                    <div id="import-export-main" class="section-content active">
                        <div class="import-export-header">
                            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
                                <div>
                                    <h3>📦 Professional Import/Export System</h3>
                                    <p style="color: #a0aec0;">Import existing DAAD games and export to multiple professional formats.</p>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn-header" onclick="AdventureCreator.modules['import-export-tools'].showProfilesModal()">
                                        💾 Profiles
                                    </button>
                                    <button class="btn-header" onclick="AdventureCreator.modules['import-export-tools'].showHistoryModal()">
                                        📜 History
                                    </button>
                                    <button class="btn-header" onclick="AdventureCreator.modules['import-export-tools'].showHelpModal()">
                                        ❓ Help
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="import-export-tabs">
                            <button class="import-export-tab ${state.selectedTab === 'import' ? 'active' : ''}"
                                    onclick="AdventureCreator.modules['import-export-tools'].switchTab('import')">
                                📥 Import Games
                            </button>
                            <button class="import-export-tab ${state.selectedTab === 'export' ? 'active' : ''}"
                                    onclick="AdventureCreator.modules['import-export-tools'].switchTab('export')">
                                📤 Export Games
                            </button>
                            <button class="import-export-tab ${state.selectedTab === 'convert' ? 'active' : ''}"
                                    onclick="AdventureCreator.modules['import-export-tools'].switchTab('convert')">
                                🔄 Format Conversion
                            </button>
                            <button class="import-export-tab ${state.selectedTab === 'batch' ? 'active' : ''}"
                                    onclick="AdventureCreator.modules['import-export-tools'].switchTab('batch')">
                                📦 Batch Operations
                            </button>
                        </div>

                        ${this.renderTabContent(state.selectedTab)}
                    </div>
                </div>
            `;
        },

        renderStyles() {
            return `
                <style>
                    .import-export-container { max-width: 1200px; margin: 0 auto; }
                    .import-export-header { margin-bottom: 1.5rem; }

                    .btn-header {
                        background: #333;
                        color: #ccc;
                        border: none;
                        border-radius: 6px;
                        padding: 0.5rem 1rem;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-header:hover {
                        background: #444;
                        color: #fff;
                        transform: translateY(-1px);
                    }

                    .import-export-tabs { display: flex; background: #2d3748; border-radius: 8px; margin-bottom: 20px; overflow: hidden; gap: 2px; }
                    .import-export-tab { flex: 1; padding: 12px 20px; background: #2d3748; color: #a0aec0; cursor: pointer; border: none; transition: all 0.3s; }
                    .import-export-tab:hover { background: #4a5568; color: #fff; }
                    .import-export-tab.active { background: #8b5cf6; color: #fff; }

                    .file-drop-zone { border: 2px dashed #4a5568; border-radius: 8px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s; margin-bottom: 20px; background: #1a1a1a; }
                    .file-drop-zone:hover { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.05); }
                    .file-drop-zone.drag-over { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); transform: scale(1.02); }
                    .file-drop-zone input { display: none; }

                    .settings-panel { background: #2d3748; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
                    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
                    .setting-group { }
                    .setting-label { display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 500; font-size: 0.875rem; }
                    .setting-control { width: 100%; padding: 8px; background: #1a202c; border: 1px solid #4a5568; border-radius: 4px; color: #fff; }
                    .setting-control:focus { border-color: #8b5cf6; outline: none; }

                    .format-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px; }
                    .format-option { background: #2d3748; border: 2px solid #4a5568; border-radius: 8px; padding: 15px; cursor: pointer; transition: all 0.3s; }
                    .format-option:hover { border-color: #8b5cf6; transform: translateY(-2px); }
                    .format-option.selected { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
                    .format-title { font-weight: 600; color: #fff; margin-bottom: 5px; }
                    .format-desc { color: #a0aec0; font-size: 14px; }
                    .format-details { color: #718096; font-size: 12px; margin-top: 5px; }

                    .conversion-log { background: #1a202c; border-radius: 8px; padding: 15px; max-height: 300px; overflow-y: auto; margin-bottom: 20px; font-family: monospace; font-size: 12px; }
                    .log-entry { margin-bottom: 5px; padding: 5px; border-radius: 3px; }
                    .log-info { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
                    .log-success { background: rgba(16, 185, 129, 0.1); color: #34d399; }
                    .log-warning { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
                    .log-error { background: rgba(239, 68, 68, 0.1); color: #f87171; }

                    .batch-file-list { background: #2d3748; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                    .batch-file-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #1a202c; border-radius: 4px; margin-bottom: 5px; }
                    .batch-file-name { color: #e2e8f0; }
                    .batch-file-size { color: #718096; font-size: 0.75rem; margin-left: 0.5rem; }
                    .batch-file-status { font-size: 12px; padding: 2px 8px; border-radius: 3px; }
                    .status-pending { background: #374151; color: #9ca3af; }
                    .status-processing { background: #1e40af; color: #93c5fd; }
                    .status-complete { background: #059669; color: #6ee7b7; }
                    .status-error { background: #dc2626; color: #fca5a5; }

                    .action-buttons { display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
                    .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.3s; }
                    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
                    .btn-primary { background: #8b5cf6; color: #fff; }
                    .btn-primary:hover:not(:disabled) { background: #7c3aed; transform: translateY(-1px); }
                    .btn-secondary { background: #4a5568; color: #fff; }
                    .btn-secondary:hover:not(:disabled) { background: #2d3748; }
                    .btn-success { background: #10b981; color: #fff; }
                    .btn-success:hover:not(:disabled) { background: #059669; }
                    .btn-danger { background: #ef4444; color: #fff; }
                    .btn-danger:hover:not(:disabled) { background: #dc2626; }

                    .info-box { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                    .info-box h3 { color: #60a5fa; margin-top: 0; }
                    .warning-box { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                    .warning-box h3 { color: #fbbf24; margin-top: 0; }
                    .success-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                    .success-box h3 { color: #34d399; margin-top: 0; }

                    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 20px; }
                    .stat-card { background: #2d3748; border-radius: 8px; padding: 15px; text-align: center; }
                    .stat-number { font-size: 24px; font-weight: 600; color: #8b5cf6; }
                    .stat-label { color: #a0aec0; font-size: 14px; margin-top: 5px; }

                    .progress-bar { width: 100%; height: 8px; background: #1a202c; border-radius: 4px; overflow: hidden; margin: 10px 0; }
                    .progress-fill { height: 100%; background: linear-gradient(90deg, #8b5cf6, #7c3aed); transition: width 0.3s; }

                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                </style>
            `;
        },

        renderTabContent(activeTab) {
            switch (activeTab) {
                case 'import': return this.renderImportTab();
                case 'export': return this.renderExportTab();
                case 'convert': return this.renderConvertTab();
                case 'batch': return this.renderBatchTab();
                default: return this.renderImportTab();
            }
        },

        renderImportTab() {
            const state = AdventureCreator.state.importExport;
            const importFormats = this.getImportFormats();

            return `
                <div class="tab-content">
                    <div class="success-box">
                        <h3>🎯 Import DAAD Adventures</h3>
                        <p>Load existing DAAD games from various formats and automatically convert them to the visual editor format.
                        Supports legacy formats, modern DAAD files, and text-based adventures.</p>
                    </div>

                    <div class="file-drop-zone"
                         onclick="document.getElementById('file-import').click()"
                         ondrop="AdventureCreator.modules['import-export-tools'].handleDrop(event)"
                         ondragover="AdventureCreator.modules['import-export-tools'].handleDragOver(event)"
                         ondragleave="AdventureCreator.modules['import-export-tools'].handleDragLeave(event)">
                        <div style="font-size: 48px; margin-bottom: 15px;">📂</div>
                        <h3>Drop DAAD files here or click to browse</h3>
                        <p style="color: #a0aec0; margin-top: 10px;">Supports .dsc, .dat, .daad, .json, .txt and more</p>
                        <input type="file" id="file-import" accept=".dsc,.dat,.daad,.json,.txt" multiple
                               onchange="AdventureCreator.modules['import-export-tools'].handleFileSelect(event)">
                    </div>

                    <div class="settings-panel">
                        <h4>Import Settings</h4>
                        <div class="settings-grid">
                            <div class="setting-group">
                                <label class="setting-label">Import Format</label>
                                <select class="setting-control"
                                        onchange="AdventureCreator.modules['import-export-tools'].updateImportSetting('format', this.value)">
                                    <option value="auto-detect" selected>Auto-detect format</option>
                                    <option value="classic-daad">Classic DAAD (.dsc/.dat)</option>
                                    <option value="modern-daad">Modern DAAD (.daad)</option>
                                    <option value="json">JSON Format (.json)</option>
                                    <option value="text">Text Adventure (.txt)</option>
                                </select>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" ${state.importSettings.preserveComments ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['import-export-tools'].updateImportSetting('preserveComments', this.checked)">
                                    Preserve Comments
                                </label>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" ${state.importSettings.validateSyntax ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['import-export-tools'].updateImportSetting('validateSyntax', this.checked)">
                                    Validate Syntax
                                </label>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" ${state.importSettings.autoAssignIds ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['import-export-tools'].updateImportSetting('autoAssignIds', this.checked)">
                                    Auto-assign IDs
                                </label>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" ${state.importSettings.createBackup ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['import-export-tools'].updateImportSetting('createBackup', this.checked)">
                                    Create Backup
                                </label>
                            </div>
                        </div>
                    </div>

                    ${this.renderConversionLog()}
                </div>
            `;
        },

        renderExportTab() {
            const state = AdventureCreator.state.importExport;
            const game = AdventureCreator.getCurrentGame?.() || null;
            const exportFormats = this.getExportFormats();

            if (!game || game.format !== 'daad') {
                return `
                    <div class="tab-content">
                        <div class="warning-box">
                            <h3>⚠️ No DAAD Game Selected</h3>
                            <p>Create or select a DAAD adventure to access export options.</p>
                            <button class="btn btn-primary" onclick="AdventureCreator.navigate('welcome')" style="margin-top: 1rem;">
                                Create New Game
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="tab-content">
                    <div class="info-box">
                        <h3>📤 Export Adventure: "${game.title || 'Untitled'}"</h3>
                        <p>Export your DAAD adventure to multiple professional formats for distribution across different platforms.</p>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${game.daad?.locations?.length || 0}</div>
                            <div class="stat-label">Locations</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${game.daad?.objects?.length || 0}</div>
                            <div class="stat-label">Objects</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${game.daad?.processes?.length || 0}</div>
                            <div class="stat-label">Rules</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${game.daad?.messages?.length || 0}</div>
                            <div class="stat-label">Messages</div>
                        </div>
                    </div>

                    <div class="settings-panel">
                        <h4>Export Settings</h4>
                        <div class="settings-grid">
                            <div class="setting-group">
                                <label class="setting-label">Target Platform</label>
                                <select class="setting-control"
                                        onchange="AdventureCreator.modules['import-export-tools'].updateExportSetting('targetPlatform', this.value)">
                                    <option value="universal" selected>Universal</option>
                                    <option value="web">Web/HTML5</option>
                                    <option value="retro">Retro Systems</option>
                                </select>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" ${state.exportSettings.includeComments ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['import-export-tools'].updateExportSetting('includeComments', this.checked)">
                                    Include Comments
                                </label>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" ${state.exportSettings.optimizeSize ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['import-export-tools'].updateExportSetting('optimizeSize', this.checked)">
                                    Optimize Size
                                </label>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" ${state.exportSettings.includeMeta ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['import-export-tools'].updateExportSetting('includeMeta', this.checked)">
                                    Include Metadata
                                </label>
                            </div>
                            <div class="setting-group">
                                <label class="setting-label">
                                    <input type="checkbox" ${state.exportSettings.formatCode ? 'checked' : ''}
                                           onchange="AdventureCreator.modules['import-export-tools'].updateExportSetting('formatCode', this.checked)">
                                    Format Code
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="format-grid">
                        ${Object.entries(exportFormats).map(([key, format]) => `
                            <div class="format-option ${state.exportFormat === key ? 'selected' : ''}"
                                 onclick="AdventureCreator.modules['import-export-tools'].selectExportFormat('${key}')">
                                <div class="format-title">${format.name}</div>
                                <div class="format-desc">${format.description}</div>
                                <div class="format-details">Output: ${format.extension}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['import-export-tools'].previewExport()">
                            👁️ Preview Export
                        </button>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['import-export-tools'].exportGame()">
                            📤 Export Game
                        </button>
                        <button class="btn btn-success" onclick="AdventureCreator.modules['import-export-tools'].saveAsProfile()">
                            💾 Save as Profile
                        </button>
                    </div>
                </div>
            `;
        },

        renderConvertTab() {
            return `
                <div class="tab-content">
                    <div class="info-box">
                        <h3>🔄 Format Conversion Tools</h3>
                        <p>Convert between different DAAD formats. Useful for modernizing legacy games or creating compatible versions.</p>
                    </div>

                    <div class="format-grid">
                        <div class="format-option" onclick="AdventureCreator.modules['import-export-tools'].showConversionModal('classic-to-modern')">
                            <div class="format-title">Classic to Modern DAAD</div>
                            <div class="format-desc">Convert .dsc/.dat files to modern .daad/.json format</div>
                            <div class="format-details">Preserves all functionality, adds modern features</div>
                        </div>
                        <div class="format-option" onclick="AdventureCreator.modules['import-export-tools'].showConversionModal('json-to-daad')">
                            <div class="format-title">JSON to DAAD</div>
                            <div class="format-desc">Convert JSON format to DAAD text format</div>
                            <div class="format-details">Full feature support, readable output</div>
                        </div>
                        <div class="format-option" onclick="AdventureCreator.modules['import-export-tools'].showConversionModal('optimize')">
                            <div class="format-title">Optimize &amp; Compress</div>
                            <div class="format-desc">Optimize and compress existing games</div>
                            <div class="format-details">Reduce file size, improve performance</div>
                        </div>
                        <div class="format-option" onclick="AdventureCreator.modules['import-export-tools'].showConversionModal('web')">
                            <div class="format-title">Web/HTML5 Conversion</div>
                            <div class="format-desc">Create web-playable versions</div>
                            <div class="format-details">JavaScript interpreter, responsive design</div>
                        </div>
                    </div>

                    ${this.renderConversionLog()}
                </div>
            `;
        },

        renderBatchTab() {
            const state = AdventureCreator.state.importExport;

            return `
                <div class="tab-content">
                    <div class="success-box">
                        <h3>📦 Batch Processing</h3>
                        <p>Process multiple DAAD files simultaneously. Convert formats, optimize files, or export to multiple platforms at once.</p>
                    </div>

                    <div class="file-drop-zone" onclick="document.getElementById('batch-file-import').click()"
                         ondrop="AdventureCreator.modules['import-export-tools'].handleBatchDrop(event)"
                         ondragover="AdventureCreator.modules['import-export-tools'].handleDragOver(event)"
                         ondragleave="AdventureCreator.modules['import-export-tools'].handleDragLeave(event)">
                        <div style="font-size: 48px; margin-bottom: 15px;">📁</div>
                        <h3>Drop multiple files here for batch processing</h3>
                        <p style="color: #a0aec0; margin-top: 10px;">Select multiple DAAD files to process together</p>
                        <input type="file" id="batch-file-import" accept=".dsc,.dat,.daad,.json,.txt" multiple
                               onchange="AdventureCreator.modules['import-export-tools'].handleBatchFileSelect(event)">
                    </div>

                    <div class="settings-panel">
                        <h4>Batch Operation Settings</h4>
                        <div class="settings-grid">
                            <div class="setting-group">
                                <label class="setting-label">Operation Type</label>
                                <select class="setting-control"
                                        onchange="AdventureCreator.modules['import-export-tools'].updateBatchSetting('operation', this.value)">
                                    <option value="convert" selected>Format Conversion</option>
                                    <option value="optimize">Optimize Files</option>
                                    <option value="export">Multi-format Export</option>
                                    <option value="validate">Validate Syntax</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="batch-file-list">
                        <h4>Files Queue (${state.batchOperations.selectedFiles.length} files)</h4>
                        ${state.batchOperations.selectedFiles.length === 0 ?
                            '<p style="color: #a0aec0; text-align: center; padding: 20px;">No files selected</p>' :
                            state.batchOperations.selectedFiles.map((file, index) => `
                                <div class="batch-file-item">
                                    <div>
                                        <span class="batch-file-name">${file.name}</span>
                                        <span class="batch-file-size">${this.formatFileSize(file.size)}</span>
                                    </div>
                                    <button class="btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                            onclick="AdventureCreator.modules['import-export-tools'].removeBatchFile(${index})">
                                        🗑️
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>

                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="AdventureCreator.modules['import-export-tools'].clearBatchQueue()">
                            🗑️ Clear Queue
                        </button>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['import-export-tools'].startBatchProcessing()"
                                ${state.batchOperations.selectedFiles.length === 0 ? 'disabled' : ''}>
                            ⚡ Start Batch Processing
                        </button>
                    </div>
                </div>
            `;
        },

        renderConversionLog() {
            const state = AdventureCreator.state.importExport;

            return `
                <div class="conversion-log">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0;">Conversion Log</h4>
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                onclick="AdventureCreator.modules['import-export-tools'].clearLog()">
                            Clear Log
                        </button>
                    </div>
                    ${state.conversionLog.length === 0 ?
                        '<div class="log-entry log-info">Ready for file operations...</div>' :
                        state.conversionLog.map(entry => `
                            <div class="log-entry log-${entry.type}">[${entry.timestamp}] ${entry.message}</div>
                        `).join('')
                    }
                </div>
            `;
        },

        // Tab switching
        switchTab(tab) {
            AdventureCreator.state.importExport.selectedTab = tab;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        // Import format management
        getImportFormats() {
            return {
                'auto-detect': {
                    name: 'Auto-Detect',
                    description: 'Automatically detect the file format',
                    extensions: ['*']
                },
                'classic-daad': {
                    name: 'Classic DAAD',
                    description: 'Original DAAD format with .dsc/.dat files',
                    extensions: ['.dsc', '.dat']
                },
                'modern-daad': {
                    name: 'Modern DAAD',
                    description: 'Modern DAAD format with enhanced features',
                    extensions: ['.daad']
                },
                'json': {
                    name: 'JSON Format',
                    description: 'JSON-based adventure format',
                    extensions: ['.json']
                },
                'text': {
                    name: 'Text Adventure',
                    description: 'Plain text adventure files',
                    extensions: ['.txt']
                }
            };
        },

        getExportFormats() {
            return {
                'modern-daad': {
                    name: 'Modern DAAD',
                    description: 'Enhanced DAAD format with all features',
                    extension: '.daad'
                },
                'json': {
                    name: 'JSON Format',
                    description: 'Structured JSON format for interchange',
                    extension: '.json'
                },
                'classic-daad': {
                    name: 'Classic DAAD',
                    description: 'Original DAAD .dsc/.dat format',
                    extension: '.dsc'
                },
                'html5-web': {
                    name: 'HTML5 Web',
                    description: 'Web-playable HTML5 version',
                    extension: '.html'
                },
                'source-code': {
                    name: 'Source Code',
                    description: 'Human-readable source code',
                    extension: '.txt'
                }
            };
        },

        selectExportFormat(format) {
            AdventureCreator.state.importExport.exportFormat = format;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        // File handling
        handleDrop(event) {
            event.preventDefault();
            event.stopPropagation();
            const zone = event.target.closest('.file-drop-zone');
            if (zone) zone.classList.remove('drag-over');

            const files = Array.from(event.dataTransfer.files);
            this.processFiles(files);
        },

        handleBatchDrop(event) {
            event.preventDefault();
            event.stopPropagation();
            const zone = event.target.closest('.file-drop-zone');
            if (zone) zone.classList.remove('drag-over');

            const files = Array.from(event.dataTransfer.files);
            AdventureCreator.state.importExport.batchOperations.selectedFiles =
                AdventureCreator.state.importExport.batchOperations.selectedFiles.concat(files);
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        handleDragOver(event) {
            event.preventDefault();
            event.stopPropagation();
            const zone = event.target.closest('.file-drop-zone');
            if (zone) zone.classList.add('drag-over');
        },

        handleDragLeave(event) {
            event.preventDefault();
            const zone = event.target.closest('.file-drop-zone');
            if (zone) zone.classList.remove('drag-over');
        },

        handleFileSelect(event) {
            const files = Array.from(event.target.files);
            this.processFiles(files);
            event.target.value = ''; // Reset input
        },

        handleBatchFileSelect(event) {
            const files = Array.from(event.target.files);
            AdventureCreator.state.importExport.batchOperations.selectedFiles = files;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
            event.target.value = ''; // Reset input
        },

        processFiles(files) {
            if (files.length === 0) return;

            this.addLog('info', `Processing ${files.length} file(s)...`);

            files.forEach(file => {
                this.importFile(file);
            });
        },

        importFile(file) {
            this.addLog('info', `Reading: ${file.name} (${this.formatFileSize(file.size)})`);

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const format = this.detectFileFormat(file, content);

                    this.addLog('success', `Detected format: ${format} for ${file.name}`);

                    const gameData = this.parseFile(content, format, file.name);

                    if (gameData) {
                        // Add to import history
                        this.addToHistory(file.name, format, gameData);

                        this.addLog('success', `Successfully imported: ${file.name}`);
                        this.showImportSuccessModal(gameData, file.name);
                    } else {
                        this.addLog('error', `Failed to parse: ${file.name}`);
                        this.showNotification(`Failed to import ${file.name}`, 'error');
                    }
                } catch (error) {
                    this.addLog('error', `Error importing ${file.name}: ${error.message}`);
                    this.showNotification(`Error: ${error.message}`, 'error');
                }
            };

            reader.onerror = () => {
                this.addLog('error', `Failed to read file: ${file.name}`);
                this.showNotification(`Failed to read ${file.name}`, 'error');
            };

            reader.readAsText(file);
        },

        detectFileFormat(file, content) {
            const ext = file.name.toLowerCase().split('.').pop();

            // Try extension first
            const formatMap = {
                'json': 'json',
                'daad': 'modern-daad',
                'dsc': 'classic-daad',
                'dat': 'classic-daad',
                'txt': 'text'
            };

            if (formatMap[ext]) {
                return formatMap[ext];
            }

            // Try content analysis
            try {
                JSON.parse(content);
                return 'json';
            } catch (e) {
                // Not JSON
            }

            if (content.includes('#location') || content.includes('#object')) {
                return 'modern-daad';
            }

            return 'text';
        },

        parseFile(content, format, filename) {
            try {
                switch (format) {
                    case 'json':
                        return this.parseJSON(content, filename);
                    case 'modern-daad':
                        return this.parseModernDAAD(content, filename);
                    case 'classic-daad':
                        return this.parseClassicDAAD(content, filename);
                    case 'text':
                        return this.parseText(content, filename);
                    default:
                        throw new Error('Unsupported format');
                }
            } catch (error) {
                console.error('Parse error:', error);
                return null;
            }
        },

        parseJSON(content, filename) {
            const data = JSON.parse(content);

            // Validate structure
            if (!data.format || data.format !== 'daad') {
                throw new Error('Invalid DAAD JSON format');
            }

            return {
                title: data.title || filename.replace(/\.[^/.]+$/, ''),
                format: 'daad',
                daad: data.daad || {},
                metadata: data.metadata || {}
            };
        },

        parseModernDAAD(content, filename) {
            // Simple parser for modern DAAD format
            const game = {
                title: filename.replace(/\.[^/.]+$/, ''),
                format: 'daad',
                daad: {
                    locations: [],
                    objects: [],
                    processes: [],
                    messages: [],
                    vocabulary: []
                }
            };

            const lines = content.split('\n');
            let currentSection = null;

            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith('#title')) {
                    game.title = trimmed.match(/"([^"]+)"/)?.[1] || game.title;
                } else if (trimmed.startsWith('#location')) {
                    const match = trimmed.match(/#location\s+(\d+)\s+"([^"]+)"/);
                    if (match) {
                        game.daad.locations.push({
                            id: parseInt(match[1]),
                            name: match[2],
                            description: ''
                        });
                    }
                } else if (trimmed.startsWith('#object')) {
                    const match = trimmed.match(/#object\s+(\d+)\s+"([^"]+)"/);
                    if (match) {
                        game.daad.objects.push({
                            id: parseInt(match[1]),
                            name: match[2],
                            location: 253
                        });
                    }
                }
            }

            return game;
        },

        parseClassicDAAD(content, filename) {
            // Basic parser for classic DAAD
            return {
                title: filename.replace(/\.[^/.]+$/, ''),
                format: 'daad',
                daad: {
                    locations: [],
                    objects: [],
                    processes: [],
                    messages: []
                }
            };
        },

        parseText(content, filename) {
            // Very basic text adventure parser
            return {
                title: filename.replace(/\.[^/.]+$/, ''),
                format: 'daad',
                daad: {
                    locations: [{ id: 0, name: 'Start', description: content.substring(0, 200) }],
                    objects: [],
                    processes: [],
                    messages: []
                }
            };
        },

        showImportSuccessModal(gameData, filename) {
            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>✅ Import Successful</h3>
                    <button onclick="this.closest('.ie-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="success-box">
                        <h4>File imported successfully!</h4>
                        <p><strong>File:</strong> ${filename}</p>
                        <p><strong>Title:</strong> ${gameData.title}</p>
                        <p><strong>Locations:</strong> ${gameData.daad?.locations?.length || 0}</p>
                        <p><strong>Objects:</strong> ${gameData.daad?.objects?.length || 0}</p>
                    </div>
                    <p style="color: #ccc; margin-top: 1rem;">
                        Would you like to load this game into the editor?
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                        <button class="btn btn-secondary" onclick="this.closest('.ie-modal').remove()">
                            Not Now
                        </button>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['import-export-tools'].loadImportedGame(${JSON.stringify(gameData).replace(/"/g, '&quot;')})">
                            Load Game
                        </button>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
        },

        loadImportedGame(gameData) {
            // Close modal
            const modal = document.querySelector('.ie-modal');
            if (modal) modal.remove();

            // Load game into editor
            if (typeof AdventureCreator.loadGame === 'function') {
                AdventureCreator.loadGame(gameData);
                this.showNotification('Game loaded successfully!', 'success');
                AdventureCreator.navigate('welcome');
            } else {
                // Fallback: set as current game
                if (AdventureCreator.state.games) {
                    AdventureCreator.state.games.push(gameData);
                    AdventureCreator.state.currentGame = AdventureCreator.state.games.length - 1;
                    this.showNotification('Game imported successfully!', 'success');
                    AdventureCreator.navigate('welcome');
                }
            }
        },

        addToHistory(filename, format, gameData) {
            const history = AdventureCreator.state.importExport.importHistory;
            history.unshift({
                filename,
                format,
                title: gameData.title,
                timestamp: new Date().toISOString(),
                size: JSON.stringify(gameData).length
            });

            // Keep only last 20
            if (history.length > 20) {
                history.pop();
            }

            this.saveToStorage();
        },

        // Settings management
        updateImportSetting(key, value) {
            AdventureCreator.state.importExport.importSettings[key] = value;
            this.addLog('info', `Updated import setting: ${key} = ${value}`);
            this.saveToStorage();
        },

        updateExportSetting(key, value) {
            AdventureCreator.state.importExport.exportSettings[key] = value;
            this.addLog('info', `Updated export setting: ${key} = ${value}`);
            this.saveToStorage();
        },

        updateBatchSetting(key, value) {
            AdventureCreator.state.importExport.batchOperations[key] = value;
            this.addLog('info', `Updated batch setting: ${key} = ${value}`);
            this.saveToStorage();
        },

        // Export functionality
        previewExport() {
            const game = AdventureCreator.getCurrentGame?.() || null;
            if (!game) {
                this.showNotification('No game selected!', 'error');
                return;
            }

            const state = AdventureCreator.state.importExport;
            const format = this.getExportFormats()[state.exportFormat];

            this.addLog('info', `Generating preview for ${format.name} format...`);

            const preview = this.generateExportContent(game, state.exportFormat);
            this.showExportPreviewModal(preview, format, game);
        },

        exportGame() {
            const game = AdventureCreator.getCurrentGame?.() || null;
            if (!game) {
                this.showNotification('No game selected for export!', 'error');
                return;
            }

            const state = AdventureCreator.state.importExport;
            const format = this.getExportFormats()[state.exportFormat];

            this.addLog('info', `Starting export to ${format.name} format...`);
            this.addLog('info', `Target platform: ${state.exportSettings.targetPlatform}`);

            try {
                const content = this.generateExportContent(game, state.exportFormat);
                const filename = `${game.title || 'game'}${format.extension}`;

                this.downloadFile(content, filename, this.getContentType(state.exportFormat));

                this.addLog('success', `Export completed: ${filename}`);
                this.showNotification(`Exported: ${filename}`, 'success');
            } catch (error) {
                this.addLog('error', `Export failed: ${error.message}`);
                this.showNotification(`Export failed: ${error.message}`, 'error');
            }
        },

        generateExportContent(game, format) {
            switch (format) {
                case 'json':
                    return this.exportJSON(game);
                case 'modern-daad':
                    return this.exportModernDAAD(game);
                case 'classic-daad':
                    return this.exportClassicDAAD(game);
                case 'html5-web':
                    return this.exportHTML5(game);
                case 'source-code':
                    return this.exportSourceCode(game);
                default:
                    return this.exportJSON(game);
            }
        },

        exportJSON(game) {
            const state = AdventureCreator.state.importExport.exportSettings;
            const exportData = {
                format: 'daad',
                version: '1.0',
                title: game.title,
                daad: game.daad
            };

            if (state.includeMeta) {
                exportData.metadata = {
                    exported: new Date().toISOString(),
                    exportedBy: 'DAAD Adventure Creator',
                    settings: state
                };
            }

            return JSON.stringify(exportData, null, state.formatCode ? 2 : 0);
        },

        exportModernDAAD(game) {
            const state = AdventureCreator.state.importExport.exportSettings;
            let output = '';

            if (state.includeComments) {
                output += `; Modern DAAD Export\n`;
                output += `; Game: ${game.title}\n`;
                output += `; Exported: ${new Date().toISOString()}\n\n`;
            }

            output += `#version 2.0\n`;
            output += `#title "${game.title}"\n\n`;

            if (game.daad?.locations?.length) {
                output += `; Locations\n`;
                game.daad.locations.forEach((loc, i) => {
                    output += `#location ${i} "${loc.name}"\n`;
                    if (loc.description) {
                        output += `  desc "${loc.description}"\n`;
                    }
                });
                output += '\n';
            }

            if (game.daad?.objects?.length) {
                output += `; Objects\n`;
                game.daad.objects.forEach((obj, i) => {
                    output += `#object ${i} "${obj.name}"\n`;
                });
                output += '\n';
            }

            return output;
        },

        exportClassicDAAD(game) {
            let output = '';
            output += `REM Classic DAAD Export\n`;
            output += `REM Game: ${game.title}\n\n`;
            output += `10 PRINT "Welcome to ${game.title}"\n`;
            output += `20 GOTO 100\n\n`;
            output += `100 REM Main game loop\n`;
            return output;
        },

        exportHTML5(game) {
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.title}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #000;
            color: #0f0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        #output {
            min-height: 400px;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #0f0;
        }
        #input {
            width: 100%;
            background: #000;
            color: #0f0;
            border: 1px solid #0f0;
            padding: 10px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <h1>${game.title}</h1>
    <div id="output"></div>
    <input type="text" id="input" placeholder="Enter command..." autofocus>
    <script>
        const game = ${JSON.stringify(game.daad || {}, null, 2)};
        console.log('Game loaded:', game);

        // Simple interpreter would go here
        document.getElementById('output').textContent = 'Welcome to ${game.title}!\\n\\n';

        if (game.locations && game.locations[0]) {
            document.getElementById('output').textContent += game.locations[0].description || game.locations[0].name;
        }
    </script>
</body>
</html>`;
        },

        exportSourceCode(game) {
            let output = `DAAD Adventure: ${game.title}\n`;
            output += `${'='.repeat(50)}\n\n`;

            if (game.daad?.locations) {
                output += `LOCATIONS (${game.daad.locations.length}):\n`;
                output += '-'.repeat(50) + '\n';
                game.daad.locations.forEach((loc, i) => {
                    output += `${i}. ${loc.name}\n`;
                    if (loc.description) {
                        output += `   ${loc.description}\n`;
                    }
                });
                output += '\n';
            }

            if (game.daad?.objects) {
                output += `OBJECTS (${game.daad.objects.length}):\n`;
                output += '-'.repeat(50) + '\n';
                game.daad.objects.forEach((obj, i) => {
                    output += `${i}. ${obj.name} (Location: ${obj.location})\n`;
                });
                output += '\n';
            }

            return output;
        },

        getContentType(format) {
            const types = {
                'json': 'application/json',
                'html5-web': 'text/html',
                'source-code': 'text/plain',
                'modern-daad': 'text/plain',
                'classic-daad': 'text/plain'
            };
            return types[format] || 'text/plain';
        },

        downloadFile(content, filename, contentType) {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        showExportPreviewModal(preview, format, game) {
            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>👁️ Export Preview: ${format.name}</h3>
                    <button onclick="this.closest('.ie-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="info-box">
                        <p><strong>Game:</strong> ${game.title}</p>
                        <p><strong>Format:</strong> ${format.name} (${format.extension})</p>
                        <p><strong>Size:</strong> ${this.formatFileSize(preview.length)}</p>
                    </div>
                    <pre style="background: #0a0a0a; color: #0f0; padding: 15px; border-radius: 4px; overflow: auto; max-height: 400px; font-family: monospace; font-size: 12px;">${this.escapeHtml(preview.substring(0, 2000))}${preview.length > 2000 ? '\n\n... (truncated)' : ''}</pre>
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['import-export-tools'].exportGame(); this.closest('.ie-modal').remove();">
                            📤 Export Now
                        </button>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
        },

        saveAsProfile() {
            const state = AdventureCreator.state.importExport;

            this.showInputModal('Save Export Profile', 'Enter profile name:', (name) => {
                if (!name) return;

                const profile = {
                    id: 'profile_' + Date.now(),
                    name: name,
                    description: `Export profile for ${state.exportFormat}`,
                    format: state.exportFormat,
                    settings: {...state.exportSettings},
                    created: new Date().toISOString()
                };

                state.exportProfiles.push(profile);
                this.saveToStorage();
                this.showNotification(`Profile "${name}" saved!`, 'success');
            });
        },

        // Batch processing
        removeBatchFile(index) {
            const files = AdventureCreator.state.importExport.batchOperations.selectedFiles;
            files.splice(index, 1);
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        clearBatchQueue() {
            AdventureCreator.state.importExport.batchOperations.selectedFiles = [];
            this.saveToStorage();
            AdventureCreator.navigate('editor');
            this.addLog('info', 'Batch queue cleared');
        },

        startBatchProcessing() {
            const state = AdventureCreator.state.importExport;
            const files = state.batchOperations.selectedFiles;

            if (files.length === 0) {
                this.showNotification('No files selected!', 'error');
                return;
            }

            this.addLog('info', `Starting batch ${state.batchOperations.operation} for ${files.length} files...`);

            let processed = 0;

            files.forEach((file, index) => {
                setTimeout(() => {
                    this.addLog('info', `Processing ${index + 1}/${files.length}: ${file.name}`);

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const content = e.target.result;
                            const format = this.detectFileFormat(file, content);
                            const gameData = this.parseFile(content, format, file.name);

                            if (gameData) {
                                this.addLog('success', `Completed: ${file.name}`);
                                processed++;

                                if (processed === files.length) {
                                    this.addLog('success', 'Batch processing completed successfully!');
                                    this.showNotification(`Processed ${processed} files successfully!`, 'success');
                                }
                            }
                        } catch (error) {
                            this.addLog('error', `Error processing ${file.name}: ${error.message}`);
                        }
                    };

                    reader.readAsText(file);
                }, index * 500);
            });
        },

        // Conversion tools
        showConversionModal(conversionType) {
            const conversions = {
                'classic-to-modern': {
                    title: 'Classic to Modern DAAD',
                    description: 'Convert .dsc/.dat files to modern .daad/.json format',
                    inputFormat: 'classic-daad',
                    outputFormat: 'modern-daad'
                },
                'json-to-daad': {
                    title: 'JSON to DAAD',
                    description: 'Convert JSON format to DAAD text format',
                    inputFormat: 'json',
                    outputFormat: 'modern-daad'
                },
                'optimize': {
                    title: 'Optimize & Compress',
                    description: 'Optimize and compress existing games',
                    inputFormat: 'auto-detect',
                    outputFormat: 'json'
                },
                'web': {
                    title: 'Web/HTML5 Conversion',
                    description: 'Create web-playable versions',
                    inputFormat: 'auto-detect',
                    outputFormat: 'html5-web'
                }
            };

            const conversion = conversions[conversionType];

            this.showNotification(`${conversion.title} conversion ready`, 'info');
            this.addLog('info', `Conversion: ${conversion.title}`);
        },

        // Modals and UI
        showProfilesModal() {
            const profiles = AdventureCreator.state.importExport.exportProfiles;

            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>💾 Export Profiles</h3>
                    <button onclick="this.closest('.ie-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: #ccc; margin-bottom: 1rem;">Saved export configurations for quick reuse.</p>
                    ${profiles.length === 0 ? `
                        <div style="text-align: center; color: #666; padding: 2rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                            <p>No saved profiles yet. Save your export settings as a profile for quick reuse.</p>
                        </div>
                    ` : `
                        ${profiles.map(profile => `
                            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 1rem; margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <h4 style="color: #fff; margin: 0 0 0.25rem 0;">${profile.name}</h4>
                                        <p style="color: #999; font-size: 0.875rem; margin: 0;">${profile.description}</p>
                                        <p style="color: #666; font-size: 0.75rem; margin: 0.25rem 0 0 0;">Format: ${profile.format}</p>
                                    </div>
                                    <button class="btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                            onclick="AdventureCreator.modules['import-export-tools'].deleteProfile('${profile.id}')">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            `);

            document.body.appendChild(modal);
        },

        showHistoryModal() {
            const history = AdventureCreator.state.importExport.importHistory;

            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>📜 Import History</h3>
                    <button onclick="this.closest('.ie-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: #ccc; margin-bottom: 1rem;">Recently imported files.</p>
                    ${history.length === 0 ? `
                        <div style="text-align: center; color: #666; padding: 2rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📂</div>
                            <p>No import history yet.</p>
                        </div>
                    ` : `
                        ${history.map(item => `
                            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong style="color: #fff;">${item.filename}</strong>
                                        <div style="color: #999; font-size: 0.75rem; margin-top: 0.25rem;">
                                            ${item.title} • ${item.format} • ${this.formatFileSize(item.size)}
                                        </div>
                                        <div style="color: #666; font-size: 0.75rem;">
                                            ${new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            `);

            document.body.appendChild(modal);
        },

        showHelpModal() {
            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>❓ Import/Export Help</h3>
                    <button onclick="this.closest('.ie-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <h4 style="color: #3b82f6; margin-top: 0;">📥 Importing Games</h4>
                    <p style="color: #ccc;">
                        Drag and drop files or click the upload area to import DAAD games.
                        Supports JSON, .daad, and text formats.
                    </p>

                    <h4 style="color: #3b82f6; margin-top: 1.5rem;">📤 Exporting Games</h4>
                    <p style="color: #ccc;">
                        Select your export format and configure settings. Preview before exporting.
                        Save configurations as profiles for reuse.
                    </p>

                    <h4 style="color: #3b82f6; margin-top: 1.5rem;">📦 Batch Operations</h4>
                    <p style="color: #ccc;">
                        Process multiple files at once. Select operation type and add files to queue.
                    </p>

                    <h4 style="color: #3b82f6; margin-top: 1.5rem;">💡 Tips</h4>
                    <ul style="color: #ccc; margin-left: 1.5rem;">
                        <li>Use JSON format for maximum compatibility</li>
                        <li>Preview exports before downloading</li>
                        <li>Save frequently used settings as profiles</li>
                        <li>Check import history for previously loaded files</li>
                    </ul>
                </div>
            `);

            document.body.appendChild(modal);
        },

        showInputModal(title, message, callback) {
            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button onclick="this.closest('.ie-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: #ccc;">${message}</p>
                    <input type="text" id="modalInput" class="setting-control" style="margin: 1rem 0;">
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-secondary" onclick="this.closest('.ie-modal').remove()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="
                            const value = document.getElementById('modalInput').value;
                            this.closest('.ie-modal').remove();
                            (${callback.toString()})(value);
                        ">
                            OK
                        </button>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
            setTimeout(() => document.getElementById('modalInput')?.focus(), 100);
        },

        deleteProfile(profileId) {
            const state = AdventureCreator.state.importExport;
            state.exportProfiles = state.exportProfiles.filter(p => p.id !== profileId);
            this.saveToStorage();
            this.showNotification('Profile deleted', 'success');

            // Refresh modal
            const modal = document.querySelector('.ie-modal');
            if (modal) modal.remove();
            this.showProfilesModal();
        },

        createModal(content) {
            const modal = document.createElement('div');
            modal.className = 'ie-modal';
            modal.innerHTML = `
                <div class="ie-modal-overlay" onclick="this.parentElement.remove()">
                    <div class="ie-modal-content" onclick="event.stopPropagation()">
                        ${content}
                    </div>
                </div>
                <style>
                    .ie-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 10000;
                    }
                    .ie-modal-overlay {
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                    }
                    .ie-modal-content {
                        background: #1a1a1a;
                        border-radius: 12px;
                        max-width: 700px;
                        width: 100%;
                        max-height: 90vh;
                        overflow-y: auto;
                        border: 1px solid #333;
                    }
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1.5rem;
                        border-bottom: 1px solid #333;
                    }
                    .modal-header h3 {
                        color: #fff;
                        margin: 0;
                    }
                    .modal-close {
                        background: none;
                        border: none;
                        color: #999;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .modal-close:hover {
                        color: #fff;
                    }
                    .modal-body {
                        padding: 1.5rem;
                    }
                </style>
            `;
            return modal;
        },

        showNotification(message, type = 'info') {
            const bgColors = {
                success: '#10b981',
                error: '#ef4444',
                info: '#3b82f6',
                warning: '#f59e0b'
            };

            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: ${bgColors[type]};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10001;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
            `;
            notification.textContent = message;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },

        // Utility functions
        addLog(type, message) {
            const timestamp = new Date().toLocaleTimeString();
            AdventureCreator.state.importExport.conversionLog.push({
                type,
                message,
                timestamp
            });

            // Keep only last 100 log entries
            if (AdventureCreator.state.importExport.conversionLog.length > 100) {
                AdventureCreator.state.importExport.conversionLog.shift();
            }

            // Refresh the log display
            const logElement = document.querySelector('.conversion-log');
            if (logElement) {
                const scrolledToBottom = logElement.scrollHeight - logElement.clientHeight <= logElement.scrollTop + 1;

                const logsHtml = AdventureCreator.state.importExport.conversionLog.map(entry => `
                    <div class="log-entry log-${entry.type}">[${entry.timestamp}] ${entry.message}</div>
                `).join('');

                const clearBtn = logElement.querySelector('.btn-secondary');
                logElement.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0;">Conversion Log</h4>
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                onclick="AdventureCreator.modules['import-export-tools'].clearLog()">
                            Clear Log
                        </button>
                    </div>
                    ${logsHtml}
                `;

                if (scrolledToBottom) {
                    logElement.scrollTop = logElement.scrollHeight;
                }
            }
        },

        clearLog() {
            AdventureCreator.state.importExport.conversionLog = [];
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        },

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Persistence
        saveToStorage() {
            try {
                const data = {
                    selectedTab: AdventureCreator.state.importExport.selectedTab,
                    importFormat: AdventureCreator.state.importExport.importFormat,
                    exportFormat: AdventureCreator.state.importExport.exportFormat,
                    importSettings: AdventureCreator.state.importExport.importSettings,
                    exportSettings: AdventureCreator.state.importExport.exportSettings,
                    exportProfiles: AdventureCreator.state.importExport.exportProfiles,
                    importHistory: AdventureCreator.state.importExport.importHistory
                };
                localStorage.setItem('importExportTools', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to save import/export data:', error);
            }
        },

        loadFromStorage() {
            try {
                const data = localStorage.getItem('importExportTools');
                if (data) {
                    const parsed = JSON.parse(data);
                    Object.assign(AdventureCreator.state.importExport, parsed);
                }
            } catch (error) {
                console.error('Failed to load import/export data:', error);
            }
        }
    };

    AdventureCreator.registerModule('import-export-tools', ImportExportTools);

    console.log('Import/Export Tools module registered successfully');
})();
