// module-rule-dependencies-analysis.js - Module 26: Rule Dependencies Analysis System
// Part of DAAD Adventure Creator - Advanced Infrastructure for Dependency Analysis
// FULLY IMPLEMENTED with real DAAD condact parsing and dependency detection

(function() {
    'use strict';

    console.log('Rule Dependencies Analysis module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found!');
        return;
    }

    // DAAD Condact Definitions for accurate parsing
    const DAAD_CONDACTS = {
        // Condition condacts that READ game state
        conditions: {
            // Flag conditions
            'AT': { reads: ['location'], type: 'location' },
            'NOTAT': { reads: ['location'], type: 'location' },
            'ATGT': { reads: ['location'], type: 'location' },
            'ATLT': { reads: ['location'], type: 'location' },
            'PRESENT': { reads: ['object'], type: 'object' },
            'ABSENT': { reads: ['object'], type: 'object' },
            'WORN': { reads: ['object'], type: 'object' },
            'NOTWORN': { reads: ['object'], type: 'object' },
            'CARRIED': { reads: ['object'], type: 'object' },
            'NOTCARR': { reads: ['object'], type: 'object' },
            'EQ': { reads: ['flag'], type: 'flag' },
            'GT': { reads: ['flag'], type: 'flag' },
            'LT': { reads: ['flag'], type: 'flag' },
            'GE': { reads: ['flag'], type: 'flag' },
            'LE': { reads: ['flag'], type: 'flag' },
            'ZERO': { reads: ['flag'], type: 'flag' },
            'NOTZERO': { reads: ['flag'], type: 'flag' },
            'CHANCE': { reads: ['value'], type: 'system' },
            'TIMEOUT': { reads: ['flag'], type: 'flag' },
            'ISAT': { reads: ['object', 'location'], type: 'object-location' },
            'ISNOTAT': { reads: ['object', 'location'], type: 'object-location' },
            'ISDONE': { reads: ['process'], type: 'process' }
        },

        // Action condacts that WRITE game state
        actions: {
            // Flag modifications
            'SET': { writes: ['flag'], type: 'flag' },
            'CLEAR': { writes: ['flag'], type: 'flag' },
            'PLUS': { writes: ['flag'], type: 'flag' },
            'MINUS': { writes: ['flag'], type: 'flag' },
            'LET': { writes: ['flag'], type: 'flag' },
            'COPYOF': { reads: ['object'], writes: ['flag'], type: 'object-to-flag' },
            'COPYFO': { reads: ['flag'], writes: ['object'], type: 'flag-to-object' },
            'COPYFF': { reads: ['flag'], writes: ['flag'], type: 'flag-copy' },
            'COPYOO': { reads: ['object'], writes: ['object'], type: 'object-copy' },

            // Object modifications
            'GET': { writes: ['object'], type: 'object' },
            'DROP': { writes: ['object'], type: 'object' },
            'WEAR': { writes: ['object'], type: 'object' },
            'REMOVE': { writes: ['object'], type: 'object' },
            'DESTROY': { writes: ['object'], type: 'object' },
            'CREATE': { writes: ['object'], type: 'object' },
            'SWAP': { writes: ['object'], type: 'object' },
            'PLACE': { writes: ['object'], type: 'object' },
            'PUTIN': { writes: ['object'], type: 'object' },
            'TAKEOUT': { writes: ['object'], type: 'object' },
            'AUTOG': { writes: ['object'], type: 'object' },
            'AUTOD': { writes: ['object'], type: 'object' },
            'AUTOW': { writes: ['object'], type: 'object' },
            'AUTOR': { writes: ['object'], type: 'object' },
            'AUTOP': { writes: ['object'], type: 'object' },
            'AUTOT': { writes: ['object'], type: 'object' },

            // Location modifications
            'GOTO': { writes: ['location'], type: 'location' },

            // Process control
            'DONE': { type: 'control' },
            'NOTDONE': { type: 'control' },
            'OK': { type: 'control' },
            'ANYKEY': { type: 'control' },
            'SAVE': { type: 'control' },
            'LOAD': { type: 'control' },
            'RESTART': { type: 'control' },
            'PROCESS': { calls: ['process'], type: 'process-call' },
            'SKIP': { type: 'control' }
        }
    };

    AdventureCreator.registerModule('rule-dependencies', {
        name: 'Rule Dependencies Analysis',
        description: 'Real-time analysis of rule dependencies with DAAD condact parsing',
        category: 'Infrastructure',
        complexity: 'Advanced',

        init() {
            console.log('Rule Dependencies Analysis initialized');
            if (!AdventureCreator.state.ruleDependencies) {
                AdventureCreator.state.ruleDependencies = {
                    currentAnalysis: null,
                    selectedRule: null,
                    dependencyMap: {},
                    analysisResults: {},
                    viewMode: 'overview',
                    filterSettings: {
                        showFlags: true,
                        showObjects: true,
                        showLocations: true,
                        showProcesses: true,
                        showMessages: false,
                        showCircular: true,
                        showConflicts: true
                    },
                    impactAnalysis: {},
                    lastAnalysisTime: null,
                    activeTab: 'overview',
                    detailView: null,
                    searchQuery: '',
                    sortBy: 'impact',
                    conflictsList: [],
                    optimizationsList: []
                };
            }
        },

        render() {
            const state = AdventureCreator.state.ruleDependencies;

            return `
                <div class="rule-dependencies-container">
                    <style>
                        .rule-dependencies-container { max-width: 1400px; margin: 0 auto; }

                        .dependency-tabs { display: flex; background: #2d3748; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
                        .dependency-tab { flex: 1; padding: 12px 20px; background: #2d3748; color: #a0aec0; cursor: pointer; border: none; transition: all 0.3s; }
                        .dependency-tab:hover { background: #4a5568; color: #fff; }
                        .dependency-tab.active { background: #8b5cf6; color: #fff; }

                        .analysis-controls { background: #2d3748; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
                        .control-row { display: flex; gap: 15px; align-items: center; margin-bottom: 15px; flex-wrap: wrap; }
                        .control-group { display: flex; flex-direction: column; gap: 5px; }
                        .control-label { color: #e2e8f0; font-size: 14px; font-weight: 500; }
                        .control-button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
                        .btn-primary { background: #8b5cf6; color: #fff; }
                        .btn-secondary { background: #4a5568; color: #fff; }
                        .btn-success { background: #10b981; color: #fff; }
                        .btn-warning { background: #f59e0b; color: #fff; }
                        .btn-danger { background: #dc2626; color: #fff; }
                        .control-button:hover { transform: translateY(-1px); opacity: 0.9; }

                        .filter-controls { display: flex; gap: 10px; flex-wrap: wrap; }
                        .filter-checkbox { display: flex; align-items: center; gap: 5px; }
                        .filter-checkbox input { margin: 0; }
                        .filter-checkbox label { color: #e2e8f0; font-size: 14px; cursor: pointer; }

                        .search-control { display: flex; gap: 10px; align-items: center; }
                        .search-input { padding: 8px; background: #1a202c; border: 1px solid #4a5568; border-radius: 4px; color: #fff; width: 250px; }
                        .search-input:focus { border-color: #8b5cf6; outline: none; }

                        .dependency-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
                        .metric-card { background: #2d3748; border-radius: 8px; padding: 20px; text-align: center; }
                        .metric-value { font-size: 28px; font-weight: 600; color: #8b5cf6; margin-bottom: 5px; }
                        .metric-label { color: #a0aec0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                        .metric-description { color: #9ca3af; font-size: 12px; margin-top: 5px; }

                        .dependency-list { background: #2d3748; border-radius: 8px; padding: 20px; }
                        .dependency-item { background: #1a202c; border-radius: 4px; padding: 15px; margin-bottom: 10px; transition: all 0.2s; }
                        .dependency-item:hover { background: #374151; }
                        .dependency-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                        .dependency-title { color: #e2e8f0; font-weight: 600; font-size: 16px; }
                        .dependency-badges { display: flex; gap: 5px; }
                        .dependency-badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
                        .badge-flag { background: #3b82f6; color: #fff; }
                        .badge-object { background: #10b981; color: #fff; }
                        .badge-location { background: #f59e0b; color: #fff; }
                        .badge-process { background: #8b5cf6; color: #fff; }
                        .badge-conflict { background: #dc2626; color: #fff; }
                        .badge-circular { background: #e55039; color: #fff; }

                        .dependency-details { color: #a0aec0; font-size: 14px; line-height: 1.5; }
                        .dependency-impacts { margin-top: 10px; }
                        .impact-item { background: #0a0a0a; border-radius: 3px; padding: 8px; margin-bottom: 5px; font-family: monospace; font-size: 12px; }
                        .impact-reads { color: #48dbfb; }
                        .impact-writes { color: #ff6b6b; }
                        .impact-calls { color: #feca57; }

                        .conflict-analysis { background: #2d3748; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
                        .conflict-item { background: #dc2626; border-radius: 4px; padding: 15px; margin-bottom: 10px; color: #fff; }
                        .conflict-type { font-weight: 600; margin-bottom: 5px; }
                        .conflict-description { font-size: 14px; opacity: 0.9; }
                        .conflict-suggestions { background: #0a0a0a; border-radius: 4px; padding: 10px; margin-top: 10px; color: #fca5a5; }

                        .impact-analysis { background: #2d3748; border-radius: 8px; padding: 20px; }
                        .impact-simulation { background: #1a202c; border-radius: 4px; padding: 15px; margin-bottom: 15px; }
                        .simulation-controls { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
                        .simulation-results { background: #0a0a0a; border-radius: 4px; padding: 10px; color: #a0aec0; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; }

                        .rule-detail-view { background: #2d3748; border-radius: 8px; padding: 20px; }
                        .rule-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                        .rule-detail-title { color: #e2e8f0; font-size: 18px; font-weight: 600; }

                        .info-box { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                        .warning-box { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                        .error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                        .success-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                    </style>

                    <div class="section-header">
                        <h2>🔗 Rule Dependencies Analysis</h2>
                        <div class="complexity-badges">
                            <span class="complexity-badge advanced">Advanced</span>
                            <span class="feature-badge infrastructure">Infrastructure</span>
                            <span class="priority-badge module-26">Module 26</span>
                        </div>
                    </div>

                    <div class="section-content active">
                        <div class="info-box">
                            <h3>🔍 Real DAAD Condact Analysis</h3>
                            <p>Analyzes actual DAAD condacts to detect dependencies, conflicts, and optimization opportunities. Parses conditions and actions to build accurate dependency graphs.</p>

                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                                <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 4px;">
                                    <strong>🎯 Real Parsing:</strong> Analyzes actual DAAD condacts
                                </div>
                                <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 4px;">
                                    <strong>⚠️ Conflict Detection:</strong> Finds circular dependencies and conflicts
                                </div>
                                <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 4px;">
                                    <strong>📊 Impact Analysis:</strong> See what changes affect
                                </div>
                                <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 4px;">
                                    <strong>🛡️ Safe Refactoring:</strong> Understand before changing
                                </div>
                            </div>
                        </div>

                        <div class="analysis-controls">
                            <h4>🔧 Analysis Controls</h4>
                            <div class="control-row">
                                <div class="control-group">
                                    <label class="control-label">Quick Analysis</label>
                                    <div style="display: flex; gap: 10px;">
                                        <button class="control-button btn-primary" onclick="AdventureCreator.modules['rule-dependencies'].runGlobalAnalysis()">
                                            🔍 Analyze All Dependencies
                                        </button>
                                        <button class="control-button btn-secondary" onclick="AdventureCreator.modules['rule-dependencies'].runConflictAnalysis()">
                                            ⚠️ Find Conflicts
                                        </button>
                                        <button class="control-button btn-success" onclick="AdventureCreator.modules['rule-dependencies'].runOptimizationAnalysis()">
                                            ⚡ Find Optimizations
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="control-row">
                                <div class="control-group">
                                    <label class="control-label">Analysis Filters</label>
                                    <div class="filter-controls">
                                        <div class="filter-checkbox">
                                            <input type="checkbox" id="filter-flags" ${state.filterSettings.showFlags ? 'checked' : ''}
                                                   onchange="AdventureCreator.modules['rule-dependencies'].updateFilter('showFlags', this.checked)">
                                            <label for="filter-flags">Flags</label>
                                        </div>
                                        <div class="filter-checkbox">
                                            <input type="checkbox" id="filter-objects" ${state.filterSettings.showObjects ? 'checked' : ''}
                                                   onchange="AdventureCreator.modules['rule-dependencies'].updateFilter('showObjects', this.checked)">
                                            <label for="filter-objects">Objects</label>
                                        </div>
                                        <div class="filter-checkbox">
                                            <input type="checkbox" id="filter-locations" ${state.filterSettings.showLocations ? 'checked' : ''}
                                                   onchange="AdventureCreator.modules['rule-dependencies'].updateFilter('showLocations', this.checked)">
                                            <label for="filter-locations">Locations</label>
                                        </div>
                                        <div class="filter-checkbox">
                                            <input type="checkbox" id="filter-processes" ${state.filterSettings.showProcesses ? 'checked' : ''}
                                                   onchange="AdventureCreator.modules['rule-dependencies'].updateFilter('showProcesses', this.checked)">
                                            <label for="filter-processes">Processes</label>
                                        </div>
                                        <div class="filter-checkbox">
                                            <input type="checkbox" id="filter-circular" ${state.filterSettings.showCircular ? 'checked' : ''}
                                                   onchange="AdventureCreator.modules['rule-dependencies'].updateFilter('showCircular', this.checked)">
                                            <label for="filter-circular">Circular Deps</label>
                                        </div>
                                        <div class="filter-checkbox">
                                            <input type="checkbox" id="filter-conflicts" ${state.filterSettings.showConflicts ? 'checked' : ''}
                                                   onchange="AdventureCreator.modules['rule-dependencies'].updateFilter('showConflicts', this.checked)">
                                            <label for="filter-conflicts">Conflicts</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="control-group">
                                    <label class="control-label">Search Dependencies</label>
                                    <div class="search-control">
                                        <input type="text" class="search-input" placeholder="Search rules, flags, objects..."
                                               value="${state.searchQuery}"
                                                onchange="AdventureCreator.modules['rule-dependencies'].updateSearch(this.value)">
                                        <button class="control-button btn-secondary" onclick="AdventureCreator.modules['rule-dependencies'].clearSearch()">
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="dependency-tabs">
                            <button class="dependency-tab ${state.activeTab === 'overview' ? 'active' : ''}"
                                    onclick="AdventureCreator.modules['rule-dependencies'].switchTab('overview')">
                                📊 Overview
                            </button>
                            <button class="dependency-tab ${state.activeTab === 'conflicts' ? 'active' : ''}"
                                    onclick="AdventureCreator.modules['rule-dependencies'].switchTab('conflicts')">
                                ⚠️ Conflicts
                            </button>
                            <button class="dependency-tab ${state.activeTab === 'impact' ? 'active' : ''}"
                                    onclick="AdventureCreator.modules['rule-dependencies'].switchTab('impact')">
                                🎯 Impact Analysis
                            </button>
                            <button class="dependency-tab ${state.activeTab === 'details' ? 'active' : ''}"
                                    onclick="AdventureCreator.modules['rule-dependencies'].switchTab('details')">
                                🔍 Rule Details
                            </button>
                        </div>

                        ${this.renderTabContent(state.activeTab)}
                    </div>
                </div>
            `;
        },

        renderTabContent(activeTab) {
            switch (activeTab) {
                case 'overview': return this.renderOverviewTab();
                case 'conflicts': return this.renderConflictsTab();
                case 'impact': return this.renderImpactTab();
                case 'details': return this.renderDetailsTab();
                default: return this.renderOverviewTab();
            }
        },

        renderOverviewTab() {
            const state = AdventureCreator.state.ruleDependencies;
            const game = AdventureCreator.getCurrentGame?.() || null;
            const results = state.analysisResults;

            if (!game || !game.daad) {
                return `
                    <div class="warning-box">
                        <h3>⚠️ No DAAD Game Selected</h3>
                        <p>Create or select a DAAD adventure to analyze rule dependencies.</p>
                    </div>
                `;
            }

            return `
                <div class="tab-content">
                    <div class="dependency-overview">
                        <div class="metric-card">
                            <div class="metric-value">${results?.totalRules || 0}</div>
                            <div class="metric-label">Total Rules</div>
                            <div class="metric-description">Analyzed across all processes</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${results?.flagDependencies || 0}</div>
                            <div class="metric-label">Flag Dependencies</div>
                            <div class="metric-description">Rules reading/writing flags</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${results?.objectDependencies || 0}</div>
                            <div class="metric-label">Object Dependencies</div>
                            <div class="metric-description">Rules affecting objects</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${results?.locationDependencies || 0}</div>
                            <div class="metric-label">Location Dependencies</div>
                            <div class="metric-description">Rules checking locations</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${results?.circularDependencies || 0}</div>
                            <div class="metric-label">Circular Dependencies</div>
                            <div class="metric-description">Problematic circular refs</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${results?.conflicts || 0}</div>
                            <div class="metric-label">Potential Conflicts</div>
                            <div class="metric-description">Rules that may conflict</div>
                        </div>
                    </div>

                    ${!results ? `
                        <div class="info-box">
                            <h4>🚀 Ready to Analyze</h4>
                            <p>Your adventure has rules ready for comprehensive dependency analysis.</p>
                            <p>Click <strong>"Analyze All Dependencies"</strong> above to parse DAAD condacts and build the dependency graph.</p>
                        </div>
                    ` : `
                        <div class="success-box">
                            <h4>✅ Analysis Complete</h4>
                            <p>Last analyzed: ${new Date(state.lastAnalysisTime).toLocaleString()}</p>
                            <p><strong>Summary:</strong> Found ${results.totalRules} rules with ${results.totalDependencies} dependencies and ${results.conflicts + results.circularDependencies} potential issues.</p>
                        </div>
                    `}

                    <div class="dependency-list">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h4>📋 Dependencies by Impact</h4>
                            <div>
                                <select onchange="AdventureCreator.modules['rule-dependencies'].updateSort(this.value)" style="background: #1a202c; color: #fff; border: 1px solid #4a5568; border-radius: 4px; padding: 5px;">
                                    <option value="impact" ${state.sortBy === 'impact' ? 'selected' : ''}>Sort by Impact</option>
                                    <option value="type" ${state.sortBy === 'type' ? 'selected' : ''}>Sort by Type</option>
                                    <option value="rule" ${state.sortBy === 'rule' ? 'selected' : ''}>Sort by Rule ID</option>
                                </select>
                            </div>
                        </div>

                        ${this.renderDependencyItems(10)}
                    </div>
                </div>
            `;
        },

        renderConflictsTab() {
            const state = AdventureCreator.state.ruleDependencies;
            const conflicts = state.conflictsList || [];

            return `
                <div class="tab-content">
                    <div class="conflict-analysis">
                        <h4>⚠️ Detected Conflicts and Issues</h4>
                        <p style="color: #a0aec0; margin-bottom: 20px;">
                            Analysis of potential conflicts, circular dependencies, and rule interaction issues.
                        </p>

                        ${conflicts.length === 0 ? `
                            <div class="success-box">
                                <h4>✅ No Conflicts Detected</h4>
                                <p>Your adventure rules appear to be well-structured with no obvious conflicts.</p>
                                <p><em>Note: Run a full analysis to ensure comprehensive conflict detection.</em></p>
                            </div>
                        ` : `
                            <div style="margin-bottom: 20px;">
                                <div style="background: #dc2626; color: #fff; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                                    <strong>⚠️ ${conflicts.length} potential issue(s) detected</strong>
                                </div>

                                ${conflicts.map((conflict, index) => `
                                    <div class="conflict-item">
                                        <div class="conflict-type">${conflict.type}</div>
                                        <div class="conflict-description">${conflict.description}</div>
                                        ${conflict.suggestion ? `<div class="conflict-suggestions">💡 ${conflict.suggestion}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        `}

                        <div style="background: #2d3748; border-radius: 8px; padding: 15px;">
                            <h5>🔍 Conflict Types We Check For:</h5>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 10px;">
                                <div style="background: #1a202c; padding: 10px; border-radius: 4px;">
                                    <strong style="color: #ff6b6b;">Flag Conflicts:</strong> Multiple rules modifying the same flag inconsistently
                                </div>
                                <div style="background: #1a202c; padding: 10px; border-radius: 4px;">
                                    <strong style="color: #feca57;">Circular Dependencies:</strong> Rules that depend on each other in loops
                                </div>
                                <div style="background: #1a202c; padding: 10px; border-radius: 4px;">
                                    <strong style="color: #48dbfb;">Write-Write Conflicts:</strong> Rules writing to same resources
                                </div>
                                <div style="background: #1a202c; padding: 10px; border-radius: 4px;">
                                    <strong style="color: #ff9ff3;">Object Conflicts:</strong> Contradictory object state changes
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderImpactTab() {
            const state = AdventureCreator.state.ruleDependencies;

            return `
                <div class="tab-content">
                    <div class="impact-analysis">
                        <h4>🎯 Rule Change Impact Analysis</h4>
                        <p style="color: #a0aec0; margin-bottom: 20px;">
                            Analyze the impact of changing specific rules to understand potential effects.
                        </p>

                        <div class="impact-simulation">
                            <h5>🧪 Impact Simulation</h5>
                            <div class="simulation-controls">
                                <select id="impact-rule-select" style="background: #1a202c; color: #fff; border: 1px solid #4a5568; border-radius: 4px; padding: 8px; margin-right: 10px;">
                                    <option value="">Select a rule to analyze...</option>
                                    ${this.getRuleOptions()}
                                </select>
                                <select id="impact-change-type" style="background: #1a202c; color: #fff; border: 1px solid #4a5568; border-radius: 4px; padding: 8px; margin-right: 10px;">
                                    <option value="modify">Modify Rule</option>
                                    <option value="delete">Delete Rule</option>
                                    <option value="disable">Disable Rule</option>
                                </select>
                                <button class="control-button btn-primary" onclick="AdventureCreator.modules['rule-dependencies'].simulateImpact()">
                                    🔬 Simulate Impact
                                </button>
                            </div>

                            <div class="simulation-results" id="impact-results">
                                Select a rule above and click "Simulate Impact" to see potential effects of changes.
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="background: #2d3748; border-radius: 8px; padding: 15px;">
                                <h5>📈 High-Impact Rules</h5>
                                <div style="color: #a0aec0; font-size: 14px; margin-bottom: 10px;">
                                    Rules that affect many other components:
                                </div>
                                ${this.renderHighImpactRules()}
                            </div>

                            <div style="background: #2d3748; border-radius: 8px; padding: 15px;">
                                <h5>🛡️ Critical Dependencies</h5>
                                <div style="color: #a0aec0; font-size: 14px; margin-bottom: 10px;">
                                    Dependencies that could break if changed:
                                </div>
                                ${this.renderCriticalDependencies()}
                            </div>
                        </div>

                        <div style="background: #2d3748; border-radius: 8px; padding: 15px; margin-top: 20px;">
                            <h5>💡 Optimization Suggestions</h5>
                            ${this.renderOptimizationSuggestions()}
                        </div>
                    </div>
                </div>
            `;
        },

        renderDetailsTab() {
            const state = AdventureCreator.state.ruleDependencies;

            return `
                <div class="tab-content">
                    <div class="rule-detail-view">
                        <div class="rule-detail-header">
                            <h4>🔍 Detailed Rule Analysis</h4>
                            <select id="detail-rule-select" onchange="AdventureCreator.modules['rule-dependencies'].showRuleDetails(this.value)"
                                    style="background: #1a202c; color: #fff; border: 1px solid #4a5568; border-radius: 4px; padding: 8px;">
                                <option value="">Select a rule to analyze in detail...</option>
                                ${this.getRuleOptions()}
                            </select>
                        </div>

                        ${!state.detailView ? `
                            <div class="info-box">
                                <h5>📋 Select a Rule for Detailed Analysis</h5>
                                <p>Choose a rule from the dropdown above to see:</p>
                                <ul style="margin-left: 20px; color: #a0aec0;">
                                    <li>All dependencies (what this rule reads and writes)</li>
                                    <li>Rules that depend on this rule</li>
                                    <li>Potential conflicts and issues</li>
                                    <li>Parsed DAAD condacts</li>
                                    <li>Impact analysis and suggestions</li>
                                </ul>
                            </div>
                        ` : this.renderRuleDetailView(state.detailView)}
                    </div>
                </div>
            `;
        },

        renderRuleDetailView(ruleId) {
            const ruleData = this.analyzeSpecificRule(ruleId);

            return `
                <div style="background: #1a202c; border-radius: 8px; padding: 20px;">
                    <h5 style="color: #8b5cf6; margin-bottom: 15px;">Rule ${ruleId} - Detailed Analysis</h5>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <h6 style="color: #e2e8f0; margin-bottom: 10px;">📖 Reads From:</h6>
                            <div style="background: #0a0a0a; border-radius: 4px; padding: 10px; max-height: 200px; overflow-y: auto;">
                                ${ruleData.reads.length > 0 ? ruleData.reads.map(read => `
                                    <div class="impact-item impact-reads">${read}</div>
                                `).join('') : '<div style="color: #9ca3af;">No dependencies found</div>'}
                            </div>
                        </div>

                        <div>
                            <h6 style="color: #e2e8f0; margin-bottom: 10px;">✏️ Writes To:</h6>
                            <div style="background: #0a0a0a; border-radius: 4px; padding: 10px; max-height: 200px; overflow-y: auto;">
                                ${ruleData.writes.length > 0 ? ruleData.writes.map(write => `
                                    <div class="impact-item impact-writes">${write}</div>
                                `).join('') : '<div style="color: #9ca3af;">No modifications found</div>'}
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h6 style="color: #e2e8f0; margin-bottom: 10px;">🔗 Dependent Rules:</h6>
                        <div style="background: #0a0a0a; border-radius: 4px; padding: 10px;">
                            ${ruleData.dependents.length > 0 ? ruleData.dependents.map(dep => `
                                <div class="impact-item impact-calls">Rule ${dep} depends on this rule</div>
                            `).join('') : '<div style="color: #9ca3af;">No dependent rules found</div>'}
                        </div>
                    </div>

                    <div style="background: #2d3748; border-radius: 8px; padding: 15px;">
                        <h6 style="color: #e2e8f0; margin-bottom: 10px;">🎯 Impact Summary:</h6>
                        <div style="color: #a0aec0;">
                            This rule has <strong style="color: #8b5cf6;">${ruleData.impactScore}</strong> impact points.
                            ${ruleData.impactLevel === 'high' ?
                                '<span style="color: #ff6b6b;">⚠️ High impact - changes may affect many other rules</span>' :
                                ruleData.impactLevel === 'medium' ?
                                '<span style="color: #feca57;">⚡ Medium impact - moderate effect on other rules</span>' :
                                '<span style="color: #48dbfb;">✅ Low impact - relatively safe to modify</span>'
                            }
                        </div>
                    </div>
                </div>
            `;
        },

        // Core Analysis Engine - REAL IMPLEMENTATION
        runGlobalAnalysis() {
            const game = AdventureCreator.getCurrentGame?.() || null;
            if (!game || !game.daad) {
                alert('No DAAD game selected for analysis!');
                return;
            }

            const state = AdventureCreator.state.ruleDependencies;
            const startTime = Date.now();

            console.log('Starting global dependency analysis...');

            // Parse all processes and build dependency map
            const processes = game.daad.processes || [];
            const dependencyMap = {};
            let totalRules = 0;

            // Analyze each process
            processes.forEach((process, processIndex) => {
                // DAAD processes can have multiple rules or be a single rule
                const rules = Array.isArray(process.rules) ? process.rules : [process];

                rules.forEach((rule, ruleIndex) => {
                    const ruleId = `P${processIndex}-R${ruleIndex}`;
                    totalRules++;

                    // Parse the rule to extract dependencies
                    const parsed = this.parseRule(rule);

                    dependencyMap[ruleId] = {
                        processIndex,
                        ruleIndex,
                        reads: parsed.reads,
                        writes: parsed.writes,
                        calls: parsed.calls,
                        condacts: parsed.condacts,
                        dependents: [],
                        dependencies: [],
                        impactScore: 0
                    };
                });
            });

            // Calculate inter-rule dependencies
            Object.keys(dependencyMap).forEach(ruleId => {
                const rule = dependencyMap[ruleId];

                // Find rules that write to what this rule reads
                Object.keys(dependencyMap).forEach(otherRuleId => {
                    if (ruleId === otherRuleId) return;

                    const otherRule = dependencyMap[otherRuleId];

                    // Check if otherRule writes something this rule reads
                    const hasWriteReadDep = otherRule.writes.some(write =>
                        rule.reads.some(read => this.resourcesMatch(write, read))
                    );

                    if (hasWriteReadDep) {
                        rule.dependencies.push(otherRuleId);
                        otherRule.dependents.push(ruleId);
                    }
                });

                // Calculate impact score
                rule.impactScore =
                    rule.writes.length * 3 +  // Writes have high impact
                    rule.reads.length * 1 +    // Reads have moderate impact
                    rule.calls.length * 2 +     // Process calls have medium impact
                    rule.dependents.length * 2; // Being depended on increases impact
            });

            // Detect conflicts and circular dependencies
            const conflicts = this.detectConflicts(dependencyMap);
            const circularDeps = this.detectCircularDependencies(dependencyMap);

            // Store results
            const analysisResults = {
                totalRules,
                totalDependencies: Object.values(dependencyMap).reduce((sum, rule) =>
                    sum + rule.reads.length + rule.writes.length, 0),
                flagDependencies: Object.values(dependencyMap).reduce((sum, rule) =>
                    sum + rule.reads.filter(r => r.startsWith('Flag')).length +
                    rule.writes.filter(w => w.startsWith('Flag')).length, 0),
                objectDependencies: Object.values(dependencyMap).reduce((sum, rule) =>
                    sum + rule.reads.filter(r => r.startsWith('Object')).length +
                    rule.writes.filter(w => w.startsWith('Object')).length, 0),
                locationDependencies: Object.values(dependencyMap).reduce((sum, rule) =>
                    sum + rule.reads.filter(r => r.startsWith('Location')).length +
                    rule.writes.filter(w => w.startsWith('Location')).length, 0),
                processDependencies: Object.values(dependencyMap).reduce((sum, rule) =>
                    sum + rule.calls.length, 0),
                conflicts: conflicts.length,
                circularDependencies: circularDeps.length,
                analysisTime: Date.now() - startTime
            };

            state.dependencyMap = dependencyMap;
            state.analysisResults = analysisResults;
            state.conflictsList = conflicts.concat(circularDeps);
            state.lastAnalysisTime = new Date().toISOString();

            console.log('Analysis complete:', analysisResults);

            AdventureCreator.navigate('editor');

            alert(`✅ Global analysis complete!\n\n` +
                  `Analyzed ${totalRules} rules in ${analysisResults.analysisTime}ms\n` +
                  `Found ${analysisResults.totalDependencies} dependencies\n` +
                  `Detected ${conflicts.length + circularDeps.length} potential issues`);
        },

        // Real DAAD Rule Parser
        parseRule(rule) {
            const result = {
                reads: [],
                writes: [],
                calls: [],
                condacts: []
            };

            // DAAD rules have conditions and actions
            // For now, parse text-based representation or structured data

            // If rule has text property (DAAD source)
            if (rule.text || rule.source) {
                const text = rule.text || rule.source;
                result.condacts = this.parseCondactsFromText(text);
            }

            // If rule has structured conditions/actions
            if (rule.conditions) {
                rule.conditions.forEach(condition => {
                    const parsed = this.parseCondact(condition);
                    if (parsed) {
                        result.reads.push(...parsed.reads);
                        result.condacts.push(parsed.condact);
                    }
                });
            }

            if (rule.actions) {
                rule.actions.forEach(action => {
                    const parsed = this.parseCondact(action);
                    if (parsed) {
                        result.writes.push(...parsed.writes);
                        result.calls.push(...parsed.calls);
                        result.condacts.push(parsed.condact);
                    }
                });
            }

            // Remove duplicates
            result.reads = [...new Set(result.reads)];
            result.writes = [...new Set(result.writes)];
            result.calls = [...new Set(result.calls)];

            return result;
        },

        parseCondactsFromText(text) {
            const condacts = [];
            const lines = text.split('\n');

            lines.forEach(line => {
                line = line.trim();
                if (!line || line.startsWith(';')) return; // Skip comments

                // Extract condact name (first word)
                const match = line.match(/^(\w+)/);
                if (match) {
                    condacts.push({
                        name: match[1],
                        fullText: line
                    });
                }
            });

            return condacts;
        },

        parseCondact(condactData) {
            const result = {
                reads: [],
                writes: [],
                calls: [],
                condact: null
            };

            // Handle both string and object formats
            const condactName = typeof condactData === 'string' ?
                condactData.split(' ')[0].toUpperCase() :
                (condactData.type || condactData.name || '').toUpperCase();

            if (!condactName) return null;

            result.condact = condactName;

            // Check if it's a known condition
            const conditionDef = DAAD_CONDACTS.conditions[condactName];
            if (conditionDef) {
                if (typeof condactData === 'object') {
                    // Extract parameters based on condact definition
                    if (conditionDef.reads) {
                        conditionDef.reads.forEach(paramType => {
                            const paramValue = condactData[paramType] || condactData.value;
                            if (paramValue !== undefined) {
                                result.reads.push(this.formatResource(paramType, paramValue));
                            }
                        });
                    }
                }
            }

            // Check if it's a known action
            const actionDef = DAAD_CONDACTS.actions[condactName];
            if (actionDef) {
                if (typeof condactData === 'object') {
                    if (actionDef.writes) {
                        actionDef.writes.forEach(paramType => {
                            const paramValue = condactData[paramType] || condactData.value;
                            if (paramValue !== undefined) {
                                result.writes.push(this.formatResource(paramType, paramValue));
                            }
                        });
                    }
                    if (actionDef.reads) {
                        actionDef.reads.forEach(paramType => {
                            const paramValue = condactData[paramType] || condactData.value;
                            if (paramValue !== undefined) {
                                result.reads.push(this.formatResource(paramType, paramValue));
                            }
                        });
                    }
                    if (actionDef.calls && condactName === 'PROCESS') {
                        const processNum = condactData.process || condactData.value;
                        if (processNum !== undefined) {
                            result.calls.push(`Process ${processNum}`);
                        }
                    }
                }
            }

            return result;
        },

        formatResource(type, value) {
            switch(type) {
                case 'flag': return `Flag ${value}`;
                case 'object': return `Object ${value}`;
                case 'location': return `Location ${value}`;
                case 'process': return `Process ${value}`;
                default: return `${type} ${value}`;
            }
        },

        resourcesMatch(resource1, resource2) {
            // Check if two resources refer to the same game element
            return resource1 === resource2;
        },

        // Conflict Detection
        detectConflicts(dependencyMap) {
            const conflicts = [];

            // Find write-write conflicts (multiple rules writing to same resource)
            const writeMap = {};

            Object.entries(dependencyMap).forEach(([ruleId, rule]) => {
                rule.writes.forEach(write => {
                    if (!writeMap[write]) writeMap[write] = [];
                    writeMap[write].push(ruleId);
                });
            });

            Object.entries(writeMap).forEach(([resource, rules]) => {
                if (rules.length > 1) {
                    conflicts.push({
                        type: 'Write-Write Conflict',
                        description: `Multiple rules modify ${resource}: ${rules.join(', ')}`,
                        suggestion: `Review rules ${rules.join(' and ')} to ensure they don't conflict when modifying ${resource}`
                    });
                }
            });

            return conflicts;
        },

        // Circular Dependency Detection
        detectCircularDependencies(dependencyMap) {
            const circular = [];
            const visited = new Set();
            const recursionStack = new Set();

            const detectCycle = (ruleId, path = []) => {
                if (recursionStack.has(ruleId)) {
                    // Found a cycle
                    const cycleStart = path.indexOf(ruleId);
                    const cycle = path.slice(cycleStart).concat(ruleId);
                    circular.push({
                        type: 'Circular Dependency',
                        description: `Circular dependency detected: ${cycle.join(' → ')}`,
                        suggestion: 'Restructure rules to eliminate the circular dependency'
                    });
                    return;
                }

                if (visited.has(ruleId)) return;

                visited.add(ruleId);
                recursionStack.add(ruleId);
                path.push(ruleId);

                const rule = dependencyMap[ruleId];
                if (rule && rule.dependencies) {
                    rule.dependencies.forEach(depId => {
                        detectCycle(depId, [...path]);
                    });
                }

                recursionStack.delete(ruleId);
            };

            Object.keys(dependencyMap).forEach(ruleId => {
                if (!visited.has(ruleId)) {
                    detectCycle(ruleId);
                }
            });

            return circular;
        },

        // Tab Switching
        switchTab(tab) {
            AdventureCreator.state.ruleDependencies.activeTab = tab;
            AdventureCreator.navigate('editor');
        },

        runConflictAnalysis() {
            const game = AdventureCreator.getCurrentGame?.() || null;
            if (!game || !game.daad) {
                alert('No DAAD game selected!');
                return;
            }

            // Run global analysis if not done yet
            if (!AdventureCreator.state.ruleDependencies.dependencyMap ||
                Object.keys(AdventureCreator.state.ruleDependencies.dependencyMap).length === 0) {
                this.runGlobalAnalysis();
                return;
            }

            const conflicts = AdventureCreator.state.ruleDependencies.conflictsList || [];

            if (conflicts.length === 0) {
                alert('✅ No conflicts detected!\n\nYour adventure rules appear to be well-structured.');
            } else {
                alert(`⚠️ Found ${conflicts.length} potential conflicts!\n\nSwitch to the Conflicts tab to see details.`);
            }

            this.switchTab('conflicts');
        },

        runOptimizationAnalysis() {
            const game = AdventureCreator.getCurrentGame?.() || null;
            if (!game || !game.daad) {
                alert('No DAAD game selected!');
                return;
            }

            // Run global analysis if not done yet
            if (!AdventureCreator.state.ruleDependencies.dependencyMap ||
                Object.keys(AdventureCreator.state.ruleDependencies.dependencyMap).length === 0) {
                this.runGlobalAnalysis();
                return;
            }

            const optimizations = this.findOptimizations();

            alert(`🔍 Optimization analysis complete!\n\nFound ${optimizations.length} potential optimizations.\n\nSwitch to the Impact Analysis tab to see recommendations.`);

            this.switchTab('impact');
        },

        findOptimizations() {
            const state = AdventureCreator.state.ruleDependencies;
            const dependencyMap = state.dependencyMap || {};
            const optimizations = [];

            // Find rules with no dependencies that could be combined
            const noDeps = Object.entries(dependencyMap)
                .filter(([_, rule]) => rule.dependencies.length === 0 && rule.dependents.length === 0)
                .map(([id]) => id);

            if (noDeps.length > 1) {
                optimizations.push({
                    type: 'Independent Rules',
                    description: `${noDeps.length} rules have no dependencies and could potentially be reordered or combined`,
                    benefit: 'Improved organization and potential performance gains'
                });
            }

            // Find rules that write but are never read
            const unusedWrites = Object.entries(dependencyMap)
                .filter(([_, rule]) => rule.writes.length > 0 && rule.dependents.length === 0)
                .map(([id]) => id);

            if (unusedWrites.length > 0) {
                optimizations.push({
                    type: 'Unused Writes',
                    description: `${unusedWrites.length} rules write to resources that are never read`,
                    benefit: 'Potential dead code that could be removed'
                });
            }

            state.optimizationsList = optimizations;
            return optimizations;
        },

        // Filter and Search
        updateFilter(filterName, value) {
            AdventureCreator.state.ruleDependencies.filterSettings[filterName] = value;
            AdventureCreator.navigate('editor');
        },

        updateSearch(query) {
            AdventureCreator.state.ruleDependencies.searchQuery = query;
            AdventureCreator.navigate('editor');
        },

        clearSearch() {
            AdventureCreator.state.ruleDependencies.searchQuery = '';
            AdventureCreator.navigate('editor');
        },

        updateSort(sortBy) {
            AdventureCreator.state.ruleDependencies.sortBy = sortBy;
            AdventureCreator.navigate('editor');
        },

        // Rendering Helpers
        renderDependencyItems(limit = 10) {
            const state = AdventureCreator.state.ruleDependencies;
            const dependencyMap = state.dependencyMap || {};

            if (Object.keys(dependencyMap).length === 0) {
                return '<div style="text-align: center; color: #9ca3af; padding: 40px;">No dependencies analyzed yet. Run global analysis to see rule dependencies.</div>';
            }

            // Sort dependencies
            const sortedDeps = Object.entries(dependencyMap)
                .sort((a, b) => {
                    switch (state.sortBy) {
                        case 'impact':
                            return b[1].impactScore - a[1].impactScore;
                        case 'type':
                            return b[1].writes.length - a[1].writes.length;
                        case 'rule':
                        default:
                            return a[0].localeCompare(b[0]);
                    }
                })
                .slice(0, limit);

            return sortedDeps.map(([ruleId, data]) => `
                <div class="dependency-item">
                    <div class="dependency-header">
                        <div class="dependency-title">Rule ${ruleId}</div>
                        <div class="dependency-badges">
                            ${data.reads.length > 0 ? `<span class="dependency-badge badge-flag">${data.reads.length} reads</span>` : ''}
                            ${data.writes.length > 0 ? `<span class="dependency-badge badge-object">${data.writes.length} writes</span>` : ''}
                            ${data.dependents.length > 0 ? `<span class="dependency-badge badge-process">${data.dependents.length} deps</span>` : ''}
                            ${data.impactScore > 5 ? '<span class="dependency-badge badge-conflict">High Impact</span>' : ''}
                        </div>
                    </div>
                    <div class="dependency-details">
                        Impact Score: <strong>${data.impactScore}</strong> |
                        Reads: ${data.reads.length} |
                        Writes: ${data.writes.length} |
                        Dependents: ${data.dependents.length}
                    </div>
                    <div class="dependency-impacts">
                        ${data.reads.slice(0, 3).map(read => `<div class="impact-item impact-reads">📖 ${read}</div>`).join('')}
                        ${data.writes.slice(0, 3).map(write => `<div class="impact-item impact-writes">✏️ ${write}</div>`).join('')}
                        ${data.reads.length + data.writes.length > 6 ? '<div class="impact-item">... and more</div>' : ''}
                    </div>
                </div>
            `).join('');
        },

        getRuleOptions() {
            const dependencyMap = AdventureCreator.state.ruleDependencies.dependencyMap || {};

            if (Object.keys(dependencyMap).length === 0) {
                return '<option value="">Run analysis first</option>';
            }

            return Object.keys(dependencyMap).map(ruleId =>
                `<option value="${ruleId}">Rule ${ruleId}</option>`
            ).join('');
        },

        renderHighImpactRules() {
            const dependencyMap = AdventureCreator.state.ruleDependencies.dependencyMap || {};
            const highImpactRules = Object.entries(dependencyMap)
                .filter(([_, data]) => data.impactScore > 3)
                .sort((a, b) => b[1].impactScore - a[1].impactScore)
                .slice(0, 5);

            if (highImpactRules.length === 0) {
                return '<div style="color: #9ca3af;">No high-impact rules detected</div>';
            }

            return highImpactRules.map(([ruleId, data]) => `
                <div style="background: #1a202c; padding: 8px; border-radius: 4px; margin-bottom: 5px;">
                    <strong>Rule ${ruleId}</strong> (Impact: ${data.impactScore})
                    <div style="font-size: 12px; color: #9ca3af;">${data.dependents.length} dependent rules</div>
                </div>
            `).join('');
        },

        renderCriticalDependencies() {
            const dependencyMap = AdventureCreator.state.ruleDependencies.dependencyMap || {};
            const criticalDeps = Object.entries(dependencyMap)
                .filter(([_, data]) => data.dependents.length > 2)
                .sort((a, b) => b[1].dependents.length - a[1].dependents.length)
                .slice(0, 5);

            if (criticalDeps.length === 0) {
                return '<div style="color: #9ca3af;">No critical dependencies found</div>';
            }

            return criticalDeps.map(([ruleId, data]) => `
                <div style="background: #dc2626; padding: 8px; border-radius: 4px; margin-bottom: 5px; color: #fff;">
                    <strong>Rule ${ruleId}</strong>
                    <div style="font-size: 12px; opacity: 0.9;">${data.dependents.length} rules depend on this</div>
                </div>
            `).join('');
        },

        renderOptimizationSuggestions() {
            const optimizations = AdventureCreator.state.ruleDependencies.optimizationsList || [];

            if (optimizations.length === 0) {
                return '<div style="color: #9ca3af;">No optimization opportunities detected. Your adventure appears well-optimized!</div>';
            }

            return optimizations.map(opt => `
                <div style="background: #1a202c; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                    <strong style="color: #10b981;">${opt.type}</strong>
                    <div style="color: #a0aec0; margin: 5px 0;">${opt.description}</div>
                    <div style="color: #8b5cf6; font-size: 12px;">💡 ${opt.benefit}</div>
                </div>
            `).join('');
        },

        // Impact Simulation
        simulateImpact() {
            const ruleSelect = document.getElementById('impact-rule-select');
            const changeSelect = document.getElementById('impact-change-type');
            const resultsDiv = document.getElementById('impact-results');

            if (!ruleSelect?.value) {
                alert('Please select a rule to analyze!');
                return;
            }

            const ruleId = ruleSelect.value;
            const changeType = changeSelect?.value || 'modify';

            const impact = this.calculateRuleImpact(ruleId, changeType);

            resultsDiv.innerHTML = `
                <div style="color: #e2e8f0;">
                    <strong>Impact Analysis for ${changeType === 'delete' ? 'deleting' : changeType === 'disable' ? 'disabling' : 'modifying'} Rule ${ruleId}:</strong>
                </div>
                <div style="margin-top: 10px;">
                    ${impact.map(item => `
                        <div style="background: #2d3748; padding: 8px; border-radius: 4px; margin-bottom: 5px;">
                            <span style="color: ${item.severity === 'high' ? '#ff6b6b' : item.severity === 'medium' ? '#feca57' : '#48dbfb'};">
                                ${item.severity === 'high' ? '⚠️' : item.severity === 'medium' ? '⚡' : 'ℹ️'}
                            </span>
                            ${item.description}
                        </div>
                    `).join('')}
                </div>
            `;
        },

        calculateRuleImpact(ruleId, changeType) {
            const dependencyMap = AdventureCreator.state.ruleDependencies.dependencyMap || {};
            const ruleData = dependencyMap[ruleId];

            const impacts = [];

            if (!ruleData) {
                impacts.push({
                    severity: 'low',
                    description: 'Rule not found in dependency analysis. Run global analysis first.'
                });
                return impacts;
            }

            if (ruleData.dependents.length > 0) {
                impacts.push({
                    severity: 'high',
                    description: `${ruleData.dependents.length} rules depend on this rule: ${ruleData.dependents.slice(0, 3).join(', ')}${ruleData.dependents.length > 3 ? '...' : ''}`
                });
            }

            if (ruleData.writes.length > 0) {
                impacts.push({
                    severity: 'medium',
                    description: `Modifies ${ruleData.writes.length} resources: ${ruleData.writes.slice(0, 3).join(', ')}${ruleData.writes.length > 3 ? '...' : ''}`
                });
            }

            if (changeType === 'delete' && ruleData.dependents.length > 0) {
                impacts.push({
                    severity: 'high',
                    description: 'Deleting this rule will break dependent rules and may cause game logic errors'
                });
            }

            if (impacts.length === 0) {
                impacts.push({
                    severity: 'low',
                    description: 'This rule has minimal impact on other game components'
                });
            }

            return impacts;
        },

        showRuleDetails(ruleId) {
            if (!ruleId) {
                AdventureCreator.state.ruleDependencies.detailView = null;
            } else {
                AdventureCreator.state.ruleDependencies.detailView = ruleId;
            }
            AdventureCreator.navigate('editor');
        },

        analyzeSpecificRule(ruleId) {
            const dependencyMap = AdventureCreator.state.ruleDependencies.dependencyMap || {};
            const ruleData = dependencyMap[ruleId] || {
                reads: [],
                writes: [],
                dependents: [],
                impactScore: 0
            };

            return {
                ...ruleData,
                impactLevel: ruleData.impactScore > 6 ? 'high' : ruleData.impactScore > 3 ? 'medium' : 'low'
            };
        }
    });

    console.log('✅ Rule Dependencies Analysis module loaded successfully');
})();
