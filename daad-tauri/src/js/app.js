// DAAD Adventure Creator Studio - Main Application

// Tauri API
const { invoke } = window.__TAURI__.tauri;
const { open, save } = window.__TAURI__.dialog;

// Application State
let state = {
    game: null,
    selectedElement: null,
    selectedType: null,
    currentTool: 'select',
    zoom: 1,
    pan: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragElement: null
};

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadGame();
    setupEventListeners();
    renderCanvas();
    updateUI();
});

async function loadGame() {
    try {
        state.game = await invoke('get_game');
        console.log('Game loaded:', state.game);
    } catch (error) {
        console.error('Failed to load game:', error);
    }
}

function setupEventListeners() {
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentTool = btn.dataset.tool;
        });
    });

    // Canvas pan and zoom
    const canvas = document.getElementById('canvas');
    const container = document.querySelector('.canvas-container');

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        state.zoom = Math.max(0.25, Math.min(2, state.zoom * delta));
        updateCanvasTransform();
        document.getElementById('zoomLevel').textContent = Math.round(state.zoom * 100) + '%';
    });

    container.addEventListener('mousedown', (e) => {
        if (state.currentTool === 'pan' || e.button === 1) {
            state.isDragging = true;
            state.dragStart = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
            container.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (state.isDragging && !state.dragElement) {
            state.pan.x = e.clientX - state.dragStart.x;
            state.pan.y = e.clientY - state.dragStart.y;
            updateCanvasTransform();
        }
        if (state.dragElement) {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left - state.pan.x) / state.zoom - state.dragStart.x;
            const y = (e.clientY - rect.top - state.pan.y) / state.zoom - state.dragStart.y;
            state.dragElement.style.left = x + 'px';
            state.dragElement.style.top = y + 'px';
        }
    });

    document.addEventListener('mouseup', async () => {
        if (state.dragElement && state.selectedElement) {
            // Update location position in backend
            const x = parseFloat(state.dragElement.style.left);
            const y = parseFloat(state.dragElement.style.top);
            try {
                await invoke('update_location', {
                    id: state.selectedElement.id,
                    name: state.selectedElement.name,
                    description: state.selectedElement.description,
                    isDark: state.selectedElement.is_dark,
                    x: x,
                    y: y
                });
            } catch (error) {
                console.error('Failed to update location position:', error);
            }
        }
        state.isDragging = false;
        state.dragElement = null;
        document.querySelector('.canvas-container').style.cursor = 'default';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    saveGame();
                    break;
                case 'n':
                    e.preventDefault();
                    newGame();
                    break;
                case 'o':
                    e.preventDefault();
                    openGame();
                    break;
            }
        }
        if (e.key === 'Delete' && state.selectedElement) {
            deleteSelectedElement();
        }
    });
}

function updateCanvasTransform() {
    const canvas = document.getElementById('canvas');
    canvas.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`;
}

// ============================================================================
// Game Management
// ============================================================================

async function newGame() {
    showModal('New Game', `
        <div class="property-group">
            <label>Game Title</label>
            <input type="text" id="newGameTitle" value="My Adventure">
        </div>
        <div class="property-group">
            <label>Author</label>
            <input type="text" id="newGameAuthor" value="Anonymous">
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onClick: closeModal },
        { text: 'Create', class: 'btn-primary', onClick: async () => {
            const title = document.getElementById('newGameTitle').value;
            const author = document.getElementById('newGameAuthor').value;
            try {
                state.game = await invoke('new_game', { title, author });
                renderCanvas();
                updateUI();
                closeModal();
                setStatus('New game created');
            } catch (error) {
                console.error('Failed to create new game:', error);
            }
        }}
    ]);
}

async function openGame() {
    try {
        const path = await open({
            filters: [{ name: 'DAAD Game', extensions: ['json'] }]
        });
        if (path) {
            state.game = await invoke('load_game', { path });
            renderCanvas();
            updateUI();
            setStatus('Game loaded: ' + path);
        }
    } catch (error) {
        console.error('Failed to open game:', error);
    }
}

async function saveGame() {
    try {
        const path = await save({
            filters: [{ name: 'DAAD Game', extensions: ['json'] }],
            defaultPath: state.game.title.replace(/\s+/g, '_').toLowerCase() + '.json'
        });
        if (path) {
            await invoke('save_game', { path });
            setStatus('Game saved: ' + path);
        }
    } catch (error) {
        console.error('Failed to save game:', error);
    }
}

async function saveGameAs() {
    await saveGame();
}

async function exportDaad() {
    try {
        const path = await save({
            filters: [{ name: 'DAAD Source', extensions: ['sce'] }],
            defaultPath: state.game.title.replace(/\s+/g, '_').toLowerCase() + '.sce'
        });
        if (path) {
            await invoke('export_daad_code', { path });
            setStatus('DAAD code exported: ' + path);
        }
    } catch (error) {
        console.error('Failed to export DAAD code:', error);
    }
}

// ============================================================================
// Canvas Rendering
// ============================================================================

function renderCanvas() {
    const container = document.getElementById('nodesContainer');
    const svg = document.getElementById('connectionsSvg');
    container.innerHTML = '';
    svg.innerHTML = '';

    if (!state.game) return;

    // Render connections first (behind nodes)
    state.game.locations.forEach(loc => {
        loc.connections.forEach(conn => {
            const target = state.game.locations.find(l => l.id === conn.target_location);
            if (target) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', loc.editor_position.x + 90);
                line.setAttribute('y1', loc.editor_position.y + 50);
                line.setAttribute('x2', target.editor_position.x + 90);
                line.setAttribute('y2', target.editor_position.y + 50);
                svg.appendChild(line);
            }
        });
    });

    // Render location nodes
    state.game.locations.forEach(loc => {
        const node = createLocationNode(loc);
        container.appendChild(node);
    });
}

function createLocationNode(location) {
    const node = document.createElement('div');
    node.className = 'location-node';
    node.dataset.id = location.id;
    node.style.left = location.editor_position.x + 'px';
    node.style.top = location.editor_position.y + 'px';

    node.innerHTML = `
        <div class="node-id">${location.id}</div>
        <div class="node-header">
            <span class="node-icon">🏠</span>
            <span class="node-title">${location.name}</span>
        </div>
        <div class="node-body">${location.description.substring(0, 80)}${location.description.length > 80 ? '...' : ''}</div>
    `;

    node.addEventListener('mousedown', (e) => {
        if (e.button === 0 && state.currentTool === 'select') {
            selectElement(location, 'location', node);
            state.dragElement = node;
            const rect = node.getBoundingClientRect();
            state.dragStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            e.stopPropagation();
        }
    });

    node.addEventListener('dblclick', () => {
        editLocation(location);
    });

    return node;
}

function selectElement(element, type, node) {
    // Deselect previous
    document.querySelectorAll('.location-node.selected').forEach(n => n.classList.remove('selected'));
    document.querySelectorAll('.element-item.selected').forEach(n => n.classList.remove('selected'));

    state.selectedElement = element;
    state.selectedType = type;

    if (node) {
        node.classList.add('selected');
    }

    renderProperties();
}

// ============================================================================
// Location Management
// ============================================================================

async function addLocation() {
    showModal('New Location', `
        <div class="property-group">
            <label>Name</label>
            <input type="text" id="newLocName" value="New Location">
        </div>
        <div class="property-group">
            <label>Description</label>
            <textarea id="newLocDesc">You are in a new location.</textarea>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onClick: closeModal },
        { text: 'Create', class: 'btn-primary', onClick: async () => {
            const name = document.getElementById('newLocName').value;
            const description = document.getElementById('newLocDesc').value;
            try {
                const location = await invoke('add_location', { name, description });
                state.game.locations.push(location);
                renderCanvas();
                updateUI();
                closeModal();
                setStatus('Location added: ' + name);
            } catch (error) {
                console.error('Failed to add location:', error);
            }
        }}
    ]);
}

function editLocation(location) {
    showModal('Edit Location', `
        <div class="property-group">
            <label>Name</label>
            <input type="text" id="editLocName" value="${location.name}">
        </div>
        <div class="property-group">
            <label>Description</label>
            <textarea id="editLocDesc">${location.description}</textarea>
        </div>
        <div class="property-checkbox">
            <input type="checkbox" id="editLocDark" ${location.is_dark ? 'checked' : ''}>
            <label>Dark Location</label>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onClick: closeModal },
        { text: 'Save', class: 'btn-primary', onClick: async () => {
            const name = document.getElementById('editLocName').value;
            const description = document.getElementById('editLocDesc').value;
            const isDark = document.getElementById('editLocDark').checked;
            try {
                await invoke('update_location', {
                    id: location.id,
                    name,
                    description,
                    isDark,
                    x: location.editor_position.x,
                    y: location.editor_position.y
                });
                location.name = name;
                location.description = description;
                location.is_dark = isDark;
                renderCanvas();
                updateUI();
                closeModal();
                setStatus('Location updated');
            } catch (error) {
                console.error('Failed to update location:', error);
            }
        }}
    ]);
}

// ============================================================================
// Object Management
// ============================================================================

async function addObject() {
    showModal('New Object', `
        <div class="property-group">
            <label>Name</label>
            <input type="text" id="newObjName" value="New Object">
        </div>
        <div class="property-group">
            <label>Noun (for parser)</label>
            <input type="text" id="newObjNoun" value="object">
        </div>
        <div class="property-group">
            <label>Description</label>
            <textarea id="newObjDesc">A mysterious object.</textarea>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onClick: closeModal },
        { text: 'Create', class: 'btn-primary', onClick: async () => {
            const name = document.getElementById('newObjName').value;
            const noun = document.getElementById('newObjNoun').value;
            const description = document.getElementById('newObjDesc').value;
            try {
                const object = await invoke('add_object', { name, noun, description });
                state.game.objects.push(object);
                updateUI();
                closeModal();
                setStatus('Object added: ' + name);
            } catch (error) {
                console.error('Failed to add object:', error);
            }
        }}
    ]);
}

// ============================================================================
// Rule Management
// ============================================================================

async function addRule() {
    showModal('New Rule', `
        <div class="property-group">
            <label>Name</label>
            <input type="text" id="newRuleName" value="New Rule">
        </div>
        <div class="property-group">
            <label>Process Table</label>
            <select id="newRuleProcess">
                <option value="0">PRO 0 - Parsing</option>
                <option value="1" selected>PRO 1 - Response</option>
                <option value="2">PRO 2 - Auto-Action</option>
                <option value="3">PRO 3 - Description</option>
            </select>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onClick: closeModal },
        { text: 'Create', class: 'btn-primary', onClick: async () => {
            const name = document.getElementById('newRuleName').value;
            const process = parseInt(document.getElementById('newRuleProcess').value);
            try {
                const rule = await invoke('add_rule', { name, process });
                state.game.rules.push(rule);
                updateUI();
                closeModal();
                setStatus('Rule added: ' + name);
            } catch (error) {
                console.error('Failed to add rule:', error);
            }
        }}
    ]);
}

// ============================================================================
// Flag Management
// ============================================================================

async function addFlag() {
    showModal('New Flag', `
        <div class="property-group">
            <label>Name</label>
            <input type="text" id="newFlagName" value="new_flag">
        </div>
        <div class="property-group">
            <label>Description</label>
            <input type="text" id="newFlagDesc" value="">
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onClick: closeModal },
        { text: 'Create', class: 'btn-primary', onClick: async () => {
            const name = document.getElementById('newFlagName').value;
            const description = document.getElementById('newFlagDesc').value;
            try {
                const flag = await invoke('add_flag', { name, description });
                state.game.flags.push(flag);
                updateUI();
                closeModal();
                setStatus('Flag added: ' + name);
            } catch (error) {
                console.error('Failed to add flag:', error);
            }
        }}
    ]);
}

// ============================================================================
// Message Management
// ============================================================================

async function addMessage() {
    showModal('New Message', `
        <div class="property-group">
            <label>Message Text</label>
            <textarea id="newMsgText">New message</textarea>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', onClick: closeModal },
        { text: 'Create', class: 'btn-primary', onClick: async () => {
            const text = document.getElementById('newMsgText').value;
            try {
                await invoke('add_message', { text });
                state.game.messages.push(text);
                updateUI();
                closeModal();
                setStatus('Message added');
            } catch (error) {
                console.error('Failed to add message:', error);
            }
        }}
    ]);
}

// ============================================================================
// UI Updates
// ============================================================================

function updateUI() {
    if (!state.game) return;

    // Update counts
    document.getElementById('locationCount').textContent = state.game.locations.length;
    document.getElementById('objectCount').textContent = state.game.objects.length;
    document.getElementById('ruleCount').textContent = state.game.rules.length;
    document.getElementById('flagCount').textContent = state.game.flags.length;
    document.getElementById('messageCount').textContent = state.game.messages.length;

    // Update lists
    renderElementList('locationList', state.game.locations, 'location', '🏠');
    renderElementList('objectList', state.game.objects, 'object', '📦');
    renderElementList('ruleList', state.game.rules, 'rule', '⚙️');
    renderElementList('flagList', state.game.flags, 'flag', '🚩');
    renderMessageList();

    // Update status bar
    document.getElementById('gameTitle').textContent = state.game.title;
    document.getElementById('elementStats').textContent =
        `${state.game.locations.length} locations, ${state.game.objects.length} objects, ${state.game.rules.length} rules`;
}

function renderElementList(containerId, items, type, icon) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map(item => `
        <div class="element-item" data-id="${item.id}" data-type="${type}">
            <span><span class="icon">${icon}</span>${item.name}</span>
            <span>#${item.id}</span>
        </div>
    `).join('');

    container.querySelectorAll('.element-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.id);
            const item = items.find(i => i.id === id);
            selectElement(item, type, null);
            el.classList.add('selected');
        });
    });
}

function renderMessageList() {
    const container = document.getElementById('messageList');
    container.innerHTML = state.game.messages.map((msg, i) => `
        <div class="element-item" data-index="${i}" data-type="message">
            <span><span class="icon">💬</span>${msg.substring(0, 30)}${msg.length > 30 ? '...' : ''}</span>
            <span>#${i}</span>
        </div>
    `).join('');
}

function renderProperties() {
    const panel = document.getElementById('propertiesPanel');

    if (!state.selectedElement) {
        panel.innerHTML = '<div class="empty-state"><p>Select an element to edit its properties</p></div>';
        return;
    }

    if (state.selectedType === 'location') {
        const loc = state.selectedElement;
        panel.innerHTML = `
            <div class="property-group">
                <label>ID</label>
                <input type="text" value="${loc.id}" disabled>
            </div>
            <div class="property-group">
                <label>Name</label>
                <input type="text" id="propLocName" value="${loc.name}">
            </div>
            <div class="property-group">
                <label>Description</label>
                <textarea id="propLocDesc">${loc.description}</textarea>
            </div>
            <div class="property-checkbox">
                <input type="checkbox" id="propLocDark" ${loc.is_dark ? 'checked' : ''}>
                <label>Dark Location</label>
            </div>
            <button class="btn-primary" onclick="saveLocationProperties()">Save Changes</button>
        `;
    }
}

async function saveLocationProperties() {
    if (state.selectedType !== 'location') return;
    const loc = state.selectedElement;

    try {
        await invoke('update_location', {
            id: loc.id,
            name: document.getElementById('propLocName').value,
            description: document.getElementById('propLocDesc').value,
            isDark: document.getElementById('propLocDark').checked,
            x: loc.editor_position.x,
            y: loc.editor_position.y
        });

        loc.name = document.getElementById('propLocName').value;
        loc.description = document.getElementById('propLocDesc').value;
        loc.is_dark = document.getElementById('propLocDark').checked;

        renderCanvas();
        updateUI();
        setStatus('Properties saved');
    } catch (error) {
        console.error('Failed to save properties:', error);
    }
}

// ============================================================================
// Code View
// ============================================================================

async function toggleCodeView() {
    const panel = document.getElementById('codePanel');
    panel.classList.toggle('visible');

    if (panel.classList.contains('visible')) {
        try {
            const code = await invoke('generate_daad_code');
            document.getElementById('codeOutput').textContent = code;
        } catch (error) {
            console.error('Failed to generate code:', error);
        }
    }
}

// ============================================================================
// Preview
// ============================================================================

function togglePreview() {
    document.getElementById('previewPanel').classList.toggle('visible');
}

function executeCommand() {
    const input = document.getElementById('previewInput');
    const output = document.getElementById('previewOutput');
    const command = input.value.trim();

    if (command) {
        output.innerHTML += `<p>> ${command}</p>`;
        output.innerHTML += `<p>Command not yet implemented in preview.</p>`;
        input.value = '';
        output.scrollTop = output.scrollHeight;
    }
}

// ============================================================================
// Modal
// ============================================================================

function showModal(title, content, buttons) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;

    const footer = document.getElementById('modalFooter');
    footer.innerHTML = '';
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.className = btn.class;
        button.onclick = btn.onClick;
        footer.appendChild(button);
    });

    document.getElementById('modalOverlay').classList.add('visible');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('visible');
}

// ============================================================================
// Accordion
// ============================================================================

function toggleAccordion(header) {
    const item = header.parentElement;
    item.classList.toggle('active');
}

// ============================================================================
// Zoom Controls
// ============================================================================

function zoomIn() {
    state.zoom = Math.min(2, state.zoom * 1.2);
    updateCanvasTransform();
    document.getElementById('zoomLevel').textContent = Math.round(state.zoom * 100) + '%';
}

function zoomOut() {
    state.zoom = Math.max(0.25, state.zoom / 1.2);
    updateCanvasTransform();
    document.getElementById('zoomLevel').textContent = Math.round(state.zoom * 100) + '%';
}

// ============================================================================
// Utility
// ============================================================================

function setStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}

function undo() { setStatus('Undo not yet implemented'); }
function redo() { setStatus('Redo not yet implemented'); }
function toggleMinimap() { document.getElementById('minimap').classList.toggle('hidden'); }
async function deleteSelectedElement() { setStatus('Delete not yet implemented'); }
