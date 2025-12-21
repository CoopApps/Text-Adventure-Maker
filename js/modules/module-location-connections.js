/**
 * DAAD Adventure Creator - Location Connections System
 * Complete location and navigation management with visual tools
 */

(function() {
    'use strict';

    const LocationConnectionsModule = {
        name: 'Location Connections',
        description: 'Sophisticated location relationships and navigation',
        version: '1.0.0',
        author: 'DAAD Adventure Creator',

        // Module state
        state: {
            currentView: 'locations',
            showAnalysis: false,
            editingLocationId: null,
            editingConnectionId: null
        },

        /**
         * Initialize the module
         */
        init: function() {
            console.log('Initializing Location Connections Module');
            this.loadData();
            this.injectStyles();
        },

        /**
         * Inject CSS styles
         */
        injectStyles: function() {
            if (document.getElementById('location-connections-styles')) return;

            const style = document.createElement('style');
            style.id = 'location-connections-styles';
            style.textContent = `
                .location-connections-container {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .location-header {
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

                .location-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .location-tab {
                    background: #34495e;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .location-tab:hover {
                    background: #3d566e;
                    transform: translateY(-2px);
                }

                .location-tab.active {
                    background: #8b5cf6;
                    font-weight: bold;
                }

                .location-content {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .location-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 15px;
                    margin-top: 20px;
                }

                .location-card {
                    background: #f8f9fa;
                    border: 2px solid #dee2e6;
                    border-left: 4px solid #8b5cf6;
                    border-radius: 8px;
                    padding: 15px;
                    transition: all 0.3s ease;
                }

                .location-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }

                .location-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 10px;
                }

                .location-card-name {
                    font-weight: bold;
                    color: #2c3e50;
                    font-size: 16px;
                }

                .location-card-id {
                    font-family: monospace;
                    color: #6c757d;
                    font-size: 12px;
                }

                .location-card-description {
                    color: #495057;
                    font-size: 14px;
                    margin-bottom: 10px;
                    line-height: 1.4;
                }

                .location-card-connections {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    margin-bottom: 10px;
                }

                .connection-chip {
                    background: #e8f4fd;
                    color: #3498db;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-family: monospace;
                }

                .location-card-actions {
                    display: flex;
                    gap: 5px;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #dee2e6;
                }

                .connection-list {
                    margin-top: 20px;
                }

                .connection-item {
                    background: #f8f9fa;
                    border-left: 4px solid var(--connection-color, #2ecc71);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .connection-info {
                    flex: 1;
                }

                .connection-route {
                    font-size: 14px;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }

                .connection-type-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    background: var(--connection-color, #2ecc71);
                    color: white;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .connection-actions {
                    display: flex;
                    gap: 5px;
                }

                .analysis-panel {
                    background: #e8f4fd;
                    border: 2px solid #3498db;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                }

                .analysis-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 15px;
                }

                .analysis-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .analysis-stat {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                }

                .analysis-stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #3498db;
                }

                .analysis-stat-label {
                    font-size: 13px;
                    color: #6c757d;
                    margin-top: 5px;
                }

                .analysis-issues {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                }

                .analysis-issue-item {
                    padding: 8px;
                    margin: 5px 0;
                    background: #fff3cd;
                    border-left: 3px solid #f39c12;
                    border-radius: 4px;
                    font-size: 14px;
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
                    min-height: 80px;
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

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #95a5a6;
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                }

                .connection-normal { --connection-color: #2ecc71; }
                .connection-conditional { --connection-color: #f39c12; }
                .connection-one_way { --connection-color: #e74c3c; }
                .connection-hidden { --connection-color: #8b5cf6; }
                .connection-locked { --connection-color: #c0392b; }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .location-grid {
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
            const saved = localStorage.getItem('daad_location_connections_data');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    AdventureCreator.state.locationConnections = {
                        ...this.getDefaultState(),
                        ...data
                    };
                } catch (e) {
                    console.error('Error loading location data:', e);
                    AdventureCreator.state.locationConnections = this.getDefaultState();
                }
            } else {
                AdventureCreator.state.locationConnections = this.getDefaultState();
            }
        },

        /**
         * Save data
         */
        saveData: function() {
            const data = {
                locations: AdventureCreator.state.locationConnections.locations,
                connections: AdventureCreator.state.locationConnections.connections,
                nextLocationId: AdventureCreator.state.locationConnections.nextLocationId
            };
            localStorage.setItem('daad_location_connections_data', JSON.stringify(data));
        },

        /**
         * Get default state
         */
        getDefaultState: function() {
            return {
                locations: [],
                connections: [],
                directions: this.getStandardDirections(),
                connectionTypes: ['NORMAL', 'CONDITIONAL', 'ONE_WAY', 'HIDDEN', 'LOCKED'],
                nextLocationId: 1
            };
        },

        /**
         * Get standard directions
         */
        getStandardDirections: function() {
            return [
                { id: 1, name: 'NORTH', short: 'N' },
                { id: 2, name: 'SOUTH', short: 'S' },
                { id: 3, name: 'EAST', short: 'E' },
                { id: 4, name: 'WEST', short: 'W' },
                { id: 5, name: 'NORTHEAST', short: 'NE' },
                { id: 6, name: 'NORTHWEST', short: 'NW' },
                { id: 7, name: 'SOUTHEAST', short: 'SE' },
                { id: 8, name: 'SOUTHWEST', short: 'SW' },
                { id: 9, name: 'UP', short: 'U' },
                { id: 10, name: 'DOWN', short: 'D' },
                { id: 11, name: 'IN', short: 'IN' },
                { id: 12, name: 'OUT', short: 'OUT' }
            ];
        },

        /**
         * Render the module
         */
        render: function() {
            const stats = this.getConnectionStatistics();
            const currentView = this.state.currentView;

            return `
                <div class="location-connections-container">
                    <div class="location-header">
                        <h2>🗺️ Location Connections System</h2>
                        <p style="color: #6c757d; margin: 5px 0;">
                            Build and manage your adventure world's geography and navigation.
                        </p>
                    </div>

                    <div class="stats-grid">
                        ${this.renderStatCard('Locations', stats.totalLocations, '#8b5cf6', '#6d28d9')}
                        ${this.renderStatCard('Connections', stats.totalConnections, '#2ecc71', '#27ae60')}
                        ${this.renderStatCard('Directions', stats.directionsUsed, '#3498db', '#2980b9')}
                        ${this.renderStatCard('Avg/Location', stats.avgConnections, '#f39c12', '#e67e22')}
                    </div>

                    <div class="location-tabs">
                        <button class="location-tab ${currentView === 'locations' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('location-connections').switchView('locations')">
                            🏠 Locations
                        </button>
                        <button class="location-tab ${currentView === 'connections' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('location-connections').switchView('connections')">
                            🔗 Connections
                        </button>
                        <button class="location-tab ${currentView === 'analysis' ? 'active' : ''}"
                                onclick="AdventureCreator.getModule('location-connections').switchView('analysis')">
                            📊 Analysis
                        </button>
                    </div>

                    <div class="location-content">
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
                case 'locations':
                    return this.renderLocationsView();
                case 'connections':
                    return this.renderConnectionsView();
                case 'analysis':
                    return this.renderAnalysisView();
                default:
                    return this.renderLocationsView();
            }
        },

        /**
         * Render locations view
         */
        renderLocationsView: function() {
            const locations = AdventureCreator.state.locationConnections.locations;

            return `
                <div style="margin-bottom: 20px;">
                    <button class="btn btn-primary" onclick="AdventureCreator.getModule('location-connections').createLocation()">
                        🏠 New Location
                    </button>
                    <button class="btn btn-success" onclick="AdventureCreator.getModule('location-connections').exportConnections()">
                        💾 Export DAAD
                    </button>
                </div>

                ${locations.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">🗺️</div>
                        <h3>No Locations Yet</h3>
                        <p>Create your first location to start building your world!</p>
                    </div>
                ` : `
                    <div class="location-grid">
                        ${locations.map(loc => this.renderLocationCard(loc)).join('')}
                    </div>
                `}
            `;
        },

        /**
         * Render location card
         */
        renderLocationCard: function(location) {
            const connections = this.getLocationConnections(location.id);

            return `
                <div class="location-card">
                    <div class="location-card-header">
                        <div class="location-card-name">${this.escapeHtml(location.name)}</div>
                        <div class="location-card-id">ID: ${location.id}</div>
                    </div>
                    <div class="location-card-description">
                        ${this.escapeHtml(location.description || 'No description')}
                    </div>
                    ${connections.length > 0 ? `
                        <div class="location-card-connections">
                            ${connections.map(conn => `
                                <span class="connection-chip">
                                    ${conn.direction} → ${this.getLocationName(conn.toLocation)}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="location-card-actions">
                        <button class="btn btn-secondary btn-sm"
                                onclick="AdventureCreator.getModule('location-connections').editLocation(${location.id})">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger btn-sm"
                                onclick="AdventureCreator.getModule('location-connections').deleteLocation(${location.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * Render connections view
         */
        renderConnectionsView: function() {
            const connections = AdventureCreator.state.locationConnections.connections;

            return `
                <div style="margin-bottom: 20px;">
                    <button class="btn btn-primary" onclick="AdventureCreator.getModule('location-connections').createConnection()">
                        🔗 New Connection
                    </button>
                </div>

                ${connections.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">🔗</div>
                        <h3>No Connections Yet</h3>
                        <p>Connect your locations to create navigable pathways!</p>
                    </div>
                ` : `
                    <div class="connection-list">
                        ${connections.map(conn => this.renderConnectionItem(conn)).join('')}
                    </div>
                `}
            `;
        },

        /**
         * Render connection item
         */
        renderConnectionItem: function(connection) {
            const typeClass = `connection-${connection.type.toLowerCase()}`;

            return `
                <div class="connection-item ${typeClass}">
                    <div class="connection-info">
                        <div class="connection-route">
                            <strong>${this.getLocationName(connection.fromLocation)}</strong>
                            <span style="color: #6c757d; margin: 0 8px;">→ ${connection.direction} →</span>
                            <strong>${this.getLocationName(connection.toLocation)}</strong>
                        </div>
                        <span class="connection-type-badge">${connection.type}</span>
                    </div>
                    <div class="connection-actions">
                        <button class="btn btn-danger btn-sm"
                                onclick="AdventureCreator.getModule('location-connections').deleteConnection(${connection.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * Render analysis view
         */
        renderAnalysisView: function() {
            const analysis = this.performNavigationAnalysis();

            return `
                <div class="analysis-panel">
                    <div class="analysis-title">📊 Navigation Analysis Report</div>

                    <div class="analysis-stats">
                        <div class="analysis-stat">
                            <div class="analysis-stat-value">${analysis.totalLocations}</div>
                            <div class="analysis-stat-label">Total Locations</div>
                        </div>
                        <div class="analysis-stat">
                            <div class="analysis-stat-value">${analysis.totalConnections}</div>
                            <div class="analysis-stat-label">Total Connections</div>
                        </div>
                        <div class="analysis-stat">
                            <div class="analysis-stat-value">${analysis.isolatedLocations}</div>
                            <div class="analysis-stat-label">Isolated Locations</div>
                        </div>
                        <div class="analysis-stat">
                            <div class="analysis-stat-value">${analysis.deadEnds}</div>
                            <div class="analysis-stat-label">Dead Ends</div>
                        </div>
                        <div class="analysis-stat">
                            <div class="analysis-stat-value">${analysis.avgConnections.toFixed(1)}</div>
                            <div class="analysis-stat-label">Avg Connections/Location</div>
                        </div>
                    </div>

                    ${analysis.issues.length > 0 ? `
                        <div class="analysis-issues">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">⚠️ Issues Found:</h4>
                            ${analysis.issues.map(issue => `
                                <div class="analysis-issue-item">${issue}</div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="analysis-issues">
                            <h4 style="color: #2ecc71; margin-bottom: 10px;">✅ No Issues Detected</h4>
                            <p style="color: #6c757d;">Your navigation network looks good!</p>
                        </div>
                    `}
                </div>
            `;
        },

        /**
         * Get location connections
         */
        getLocationConnections: function(locationId) {
            return AdventureCreator.state.locationConnections.connections
                .filter(c => c.fromLocation === locationId);
        },

        /**
         * Get location name
         */
        getLocationName: function(locationId) {
            const location = AdventureCreator.state.locationConnections.locations
                .find(l => l.id === locationId);
            return location ? location.name : `Location ${locationId}`;
        },

        /**
         * Get connection statistics
         */
        getConnectionStatistics: function() {
            const locations = AdventureCreator.state.locationConnections.locations;
            const connections = AdventureCreator.state.locationConnections.connections;

            const directionsUsed = [...new Set(connections.map(c => c.direction))].length;
            const avgConnections = locations.length > 0
                ? (connections.length / locations.length).toFixed(1)
                : '0';

            return {
                totalLocations: locations.length,
                totalConnections: connections.length,
                directionsUsed: directionsUsed,
                avgConnections: avgConnections
            };
        },

        /**
         * Perform navigation analysis
         */
        performNavigationAnalysis: function() {
            const locations = AdventureCreator.state.locationConnections.locations;
            const connections = AdventureCreator.state.locationConnections.connections;

            const isolatedLocations = locations.filter(loc =>
                !connections.some(conn => conn.fromLocation === loc.id || conn.toLocation === loc.id)
            ).length;

            const deadEnds = locations.filter(loc => {
                const outgoing = connections.filter(conn => conn.fromLocation === loc.id).length;
                const incoming = connections.filter(conn => conn.toLocation === loc.id).length;
                return (outgoing + incoming) === 1;
            }).length;

            const issues = [];
            if (isolatedLocations > 0) {
                issues.push(`${isolatedLocations} location(s) have no connections`);
            }
            if (deadEnds > 0) {
                issues.push(`${deadEnds} location(s) are dead ends (only one connection)`);
            }

            return {
                totalLocations: locations.length,
                totalConnections: connections.length,
                isolatedLocations: isolatedLocations,
                deadEnds: deadEnds,
                avgConnections: locations.length > 0 ? connections.length / locations.length : 0,
                issues: issues
            };
        },

        /**
         * Switch view
         */
        switchView: function(view) {
            this.state.currentView = view;
            AdventureCreator.navigate('location-connections');
        },

        /**
         * Create location with modal
         */
        createLocation: function() {
            this.showLocationModal();
        },

        /**
         * Edit location
         */
        editLocation: function(id) {
            const location = AdventureCreator.state.locationConnections.locations.find(l => l.id === id);
            if (location) {
                this.showLocationModal(location);
            }
        },

        /**
         * Show location modal
         */
        showLocationModal: function(location = null) {
            const isEditing = location !== null;
            const modalTitle = isEditing ? 'Edit Location' : 'Create New Location';

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
                        <div class="form-group">
                            <label class="form-label">Location Name</label>
                            <input type="text" class="form-input" id="location-name"
                                   value="${location ? this.escapeHtml(location.name) : ''}"
                                   placeholder="e.g., Dark Forest, Castle Gate">
                            <div class="form-help">A descriptive name for this location</div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea class="form-textarea" id="location-description"
                                      placeholder="Describe what the player sees here...">${location ? this.escapeHtml(location.description) : ''}</textarea>
                            <div class="form-help">Optional description text</div>
                        </div>

                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                                Cancel
                            </button>
                            <button class="btn btn-success"
                                    onclick="AdventureCreator.getModule('location-connections').saveLocation(${isEditing}, ${location ? location.id : null})">
                                💾 Save Location
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        /**
         * Save location
         */
        saveLocation: function(isEditing, locationId) {
            const name = document.getElementById('location-name').value.trim();
            const description = document.getElementById('location-description').value.trim();

            if (!name) {
                alert('Please enter a location name');
                return;
            }

            if (isEditing) {
                const location = AdventureCreator.state.locationConnections.locations.find(l => l.id === locationId);
                if (location) {
                    location.name = name;
                    location.description = description;
                }
            } else {
                const newLocation = {
                    id: AdventureCreator.state.locationConnections.nextLocationId++,
                    name: name,
                    description: description,
                    created: new Date().toISOString()
                };
                AdventureCreator.state.locationConnections.locations.push(newLocation);
            }

            this.saveData();

            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(m => m.remove());

            AdventureCreator.navigate('location-connections');
        },

        /**
         * Delete location
         */
        deleteLocation: function(id) {
            const hasConnections = AdventureCreator.state.locationConnections.connections
                .some(c => c.fromLocation === id || c.toLocation === id);

            if (hasConnections) {
                if (!confirm('This location has connections. Delete it anyway? (Connections will also be removed)')) {
                    return;
                }
                // Remove all connections involving this location
                AdventureCreator.state.locationConnections.connections =
                    AdventureCreator.state.locationConnections.connections
                    .filter(c => c.fromLocation !== id && c.toLocation !== id);
            } else {
                if (!confirm('Delete this location?')) {
                    return;
                }
            }

            AdventureCreator.state.locationConnections.locations =
                AdventureCreator.state.locationConnections.locations.filter(l => l.id !== id);

            this.saveData();
            AdventureCreator.navigate('location-connections');
        },

        /**
         * Create connection with modal
         */
        createConnection: function() {
            if (AdventureCreator.state.locationConnections.locations.length < 2) {
                alert('You need at least 2 locations to create connections. Create more locations first.');
                return;
            }

            this.showConnectionModal();
        },

        /**
         * Show connection modal
         */
        showConnectionModal: function() {
            const locations = AdventureCreator.state.locationConnections.locations;
            const directions = this.getStandardDirections();
            const types = AdventureCreator.state.locationConnections.connectionTypes;

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };

            modal.innerHTML = `
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Create New Connection</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>

                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">From Location</label>
                            <select class="form-select" id="connection-from">
                                ${locations.map(loc => `
                                    <option value="${loc.id}">${this.escapeHtml(loc.name)}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Direction</label>
                            <select class="form-select" id="connection-direction">
                                ${directions.map(dir => `
                                    <option value="${dir.name}">${dir.name} (${dir.short})</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">To Location</label>
                            <select class="form-select" id="connection-to">
                                ${locations.map(loc => `
                                    <option value="${loc.id}">${this.escapeHtml(loc.name)}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Connection Type</label>
                            <select class="form-select" id="connection-type">
                                ${types.map(type => `
                                    <option value="${type}">${type}</option>
                                `).join('')}
                            </select>
                            <div class="form-help">NORMAL type creates automatic reverse connection</div>
                        </div>

                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                                Cancel
                            </button>
                            <button class="btn btn-success"
                                    onclick="AdventureCreator.getModule('location-connections').saveConnection()">
                                💾 Create Connection
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        /**
         * Save connection
         */
        saveConnection: function() {
            const fromId = parseInt(document.getElementById('connection-from').value);
            const toId = parseInt(document.getElementById('connection-to').value);
            const direction = document.getElementById('connection-direction').value;
            const type = document.getElementById('connection-type').value;

            if (fromId === toId) {
                alert('Cannot connect a location to itself');
                return;
            }

            // Check for duplicate
            const duplicate = AdventureCreator.state.locationConnections.connections.find(c =>
                c.fromLocation === fromId && c.toLocation === toId && c.direction === direction
            );

            if (duplicate) {
                alert('This connection already exists');
                return;
            }

            const newConnection = {
                id: Date.now(),
                fromLocation: fromId,
                toLocation: toId,
                direction: direction,
                type: type,
                created: new Date().toISOString()
            };

            AdventureCreator.state.locationConnections.connections.push(newConnection);

            // Create reverse for NORMAL type
            if (type === 'NORMAL') {
                const reverseDirection = this.getReverseDirection(direction);
                if (reverseDirection) {
                    const reverseConnection = {
                        id: Date.now() + 1,
                        fromLocation: toId,
                        toLocation: fromId,
                        direction: reverseDirection,
                        type: 'NORMAL',
                        created: new Date().toISOString()
                    };
                    AdventureCreator.state.locationConnections.connections.push(reverseConnection);
                }
            }

            this.saveData();

            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(m => m.remove());

            AdventureCreator.navigate('location-connections');
        },

        /**
         * Delete connection
         */
        deleteConnection: function(id) {
            if (confirm('Delete this connection?')) {
                AdventureCreator.state.locationConnections.connections =
                    AdventureCreator.state.locationConnections.connections.filter(c => c.id !== id);

                this.saveData();
                AdventureCreator.navigate('location-connections');
            }
        },

        /**
         * Get reverse direction
         */
        getReverseDirection: function(direction) {
            const reverseMap = {
                'NORTH': 'SOUTH', 'SOUTH': 'NORTH',
                'EAST': 'WEST', 'WEST': 'EAST',
                'NORTHEAST': 'SOUTHWEST', 'SOUTHWEST': 'NORTHEAST',
                'NORTHWEST': 'SOUTHEAST', 'SOUTHEAST': 'NORTHWEST',
                'UP': 'DOWN', 'DOWN': 'UP',
                'IN': 'OUT', 'OUT': 'IN'
            };
            return reverseMap[direction];
        },

        /**
         * Export connections to DAAD format
         */
        exportConnections: function() {
            const locations = AdventureCreator.state.locationConnections.locations;
            const connections = AdventureCreator.state.locationConnections.connections;

            if (locations.length === 0) {
                alert('No locations to export. Create some locations first!');
                return;
            }

            let conSection = '/CON\n';

            locations.forEach(location => {
                const locationConnections = connections.filter(c => c.fromLocation === location.id);
                if (locationConnections.length > 0) {
                    conSection += `_${location.id}\n`;
                    locationConnections.forEach(conn => {
                        const directionId = this.getDirectionId(conn.direction);
                        conSection += `${directionId} ${conn.toLocation}\n`;
                    });
                }
            });

            const blob = new Blob([conSection], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'connections.daad';
            a.click();
            URL.revokeObjectURL(url);

            alert(`Exported ${locations.length} locations and ${connections.length} connections to connections.daad`);
        },

        /**
         * Get direction ID for DAAD
         */
        getDirectionId: function(direction) {
            const dir = this.getStandardDirections().find(d => d.name === direction);
            return dir ? dir.id : 1;
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
        AdventureCreator.registerModule('location-connections', LocationConnectionsModule);
    }

})();
