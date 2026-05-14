/**
 * Lost Signal Hotspot Editor - Logic
 * Built with Vanilla JS for Jimmy Eliasson
 */

// --- CONFIGURATION / INSTÄLLNING ---
const HANDLE_SIZE = 8; // INSTÄLLNING - Size of resize handles in pixels
const SNAP_THRESHOLD = 5; // INSTÄLLNING - Snap to grid threshold (if implemented)
const MIN_SIZE = 10; // INSTÄLLNING - Minimum width/height for a hotspot
const DEFAULT_HOTSPOT_ID_PREFIX = 'hotspot_'; // INSTÄLLNING - Default prefix for new hotspots
const SAVE_KEY = 'lost-signal-hotspot-session'; // INSTÄLLNING - LocalStorage key

// --- STATE ---
let state = {
    sceneId: '',
    imageName: '',
    imageWidth: 0,
    imageHeight: 0,
    hotspots: [],
    selectedId: null,
    isDrawing: false,
    isMoving: false,
    isResizing: false,
    resizeHandle: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    showHotspots: true,
    showLabels: true
};

// --- DOM ELEMENTS ---
const el = {
    viewport: document.getElementById('stage-viewport'),
    container: document.getElementById('image-container'),
    img: document.getElementById('bg-image'),
    overlay: document.getElementById('hotspot-overlay'),
    emptyState: document.getElementById('empty-state'),
    fileInput: document.getElementById('file-input'),
    btnLoadImage: document.getElementById('btn-load-image'),
    coordDisplay: document.getElementById('coord-display'),
    sceneIdInput: document.getElementById('scene-id'),
    infoFilename: document.getElementById('info-filename'),
    infoRes: document.getElementById('info-res'),
    selectionProps: document.getElementById('selection-properties'),
    hotspotList: document.getElementById('hotspot-list'),
    jsonOutput: document.getElementById('json-output'),
    modalContainer: document.getElementById('modal-container'),
    importArea: document.getElementById('import-area')
};

// --- INITIALIZATION ---
function init() {
    bindEvents();
    loadSession();
    updateUI();
}

function bindEvents() {
    // Image Loading
    el.btnLoadImage.onclick = () => el.fileInput.click();
    el.fileInput.onchange = handleFileSelect;

    // Presets
    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.onclick = () => {
            el.sceneIdInput.value = btn.dataset.scene;
            state.sceneId = btn.dataset.scene;
            saveSession();
            updateOutput();
        };
    });

    // Drawing / Interaction
    el.container.onmousedown = handleMouseDown;
    window.onmousemove = handleMouseMove;
    window.onmouseup = handleMouseUp;

    // Sidebar Inputs
    el.sceneIdInput.oninput = (e) => {
        state.sceneId = e.target.value;
        saveSession();
        updateOutput();
    };

    document.getElementById('hotspot-id').oninput = updateSelectedHotspot;
    document.getElementById('hotspot-label-en').oninput = updateSelectedHotspot;
    document.getElementById('hotspot-label-sv').oninput = updateSelectedHotspot;
    document.getElementById('hs-x').oninput = updateSelectedHotspot;
    document.getElementById('hs-y').oninput = updateSelectedHotspot;
    document.getElementById('hs-w').oninput = updateSelectedHotspot;
    document.getElementById('hs-h').oninput = updateSelectedHotspot;

    // Buttons
    document.getElementById('btn-duplicate').onclick = duplicateSelected;
    document.getElementById('btn-delete').onclick = deleteSelected;
    document.getElementById('btn-copy').onclick = copyToClipboard;
    document.getElementById('btn-download').onclick = downloadJSON;
    document.getElementById('btn-clear').onclick = clearAll;
    document.getElementById('btn-import').onclick = () => el.modalContainer.style.display = 'flex';
    document.getElementById('btn-modal-cancel').onclick = () => el.modalContainer.style.display = 'none';
    document.getElementById('btn-modal-confirm').onclick = handleImport;

    // Toggles
    document.getElementById('toggle-hotspots').onchange = (e) => {
        state.showHotspots = e.target.checked;
        renderHotspots();
    };
    document.getElementById('toggle-labels').onchange = (e) => {
        state.showLabels = e.target.checked;
        renderHotspots();
    };

    // Keyboard
    window.onkeydown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
        if (e.key === 'Escape') selectHotspot(null);
        if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            duplicateSelected();
        }
    };

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateOutput();
        };
    });
}

// --- FILE HANDLING ---
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    state.imageName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
        el.img.src = event.target.result;
        el.img.style.display = 'block';
        el.emptyState.style.display = 'none';
        
        el.img.onload = () => {
            state.imageWidth = el.img.naturalWidth;
            state.imageHeight = el.img.naturalHeight;
            el.infoFilename.innerText = state.imageName;
            el.infoRes.innerText = `${state.imageWidth} x ${state.imageHeight}`;
            saveSession();
            updateOutput();
            renderHotspots();
        };
    };
    reader.readAsDataURL(file);
}

// --- INTERACTION LOGIC ---
function getStageCoords(e) {
    const rect = el.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
}

function handleMouseDown(e) {
    if (!state.imageWidth) return;

    const coords = getStageCoords(e);
    const target = e.target;

    // Check if clicking a handle
    if (target.classList.contains('resize-handle')) {
        state.isResizing = true;
        state.resizeHandle = target.dataset.handle;
        state.startX = coords.x;
        state.startY = coords.y;
        return;
    }

    // Check if clicking existing hotspot
    if (target.classList.contains('hotspot-rect') || target.closest('.hotspot-rect')) {
        const hsEl = target.classList.contains('hotspot-rect') ? target : target.closest('.hotspot-rect');
        selectHotspot(hsEl.dataset.id);
        state.isMoving = true;
        state.startX = coords.x;
        state.startY = coords.y;
        return;
    }

    // Start drawing new hotspot
    selectHotspot(null);
    state.isDrawing = true;
    state.startX = coords.x;
    state.startY = coords.y;
    state.currentX = coords.x;
    state.currentY = coords.y;
}

function handleMouseMove(e) {
    const coords = getStageCoords(e);
    el.coordDisplay.innerText = `X: ${Math.round((coords.x / 100) * state.imageWidth)}, Y: ${Math.round((coords.y / 100) * state.imageHeight)} (${coords.x.toFixed(1)}%, ${coords.y.toFixed(1)}%)`;

    if (state.isDrawing) {
        state.currentX = coords.x;
        state.currentY = coords.y;
        renderDrawPreview();
    } else if (state.isMoving && state.selectedId) {
        const hs = state.hotspots.find(h => h.id === state.selectedId);
        const dx = coords.x - state.startX;
        const dy = coords.y - state.startY;
        hs.xPercent += dx;
        hs.yPercent += dy;
        state.startX = coords.x;
        state.startY = coords.y;
        syncHotspotFromPercent(hs);
        updateUI();
        renderHotspots();
    } else if (state.isResizing && state.selectedId) {
        const hs = state.hotspots.find(h => h.id === state.selectedId);
        const dx = coords.x - state.startX;
        const dy = coords.y - state.startY;
        
        if (state.resizeHandle === 'tl') {
            hs.xPercent += dx;
            hs.yPercent += dy;
            hs.widthPercent -= dx;
            hs.heightPercent -= dy;
        } else if (state.resizeHandle === 'tr') {
            hs.yPercent += dy;
            hs.widthPercent += dx;
            hs.heightPercent -= dy;
        } else if (state.resizeHandle === 'bl') {
            hs.xPercent += dx;
            hs.widthPercent -= dx;
            hs.heightPercent += dy;
        } else if (state.resizeHandle === 'br') {
            hs.widthPercent += dx;
            hs.heightPercent += dy;
        }

        state.startX = coords.x;
        state.startY = coords.y;
        syncHotspotFromPercent(hs);
        updateUI();
        renderHotspots();
    }
}

function handleMouseUp() {
    if (state.isDrawing) {
        const x = Math.min(state.startX, state.currentX);
        const y = Math.min(state.startY, state.currentY);
        const w = Math.abs(state.startX - state.currentX);
        const h = Math.abs(state.startY - state.currentY);

        if (w > 1 && h > 1) {
            const newId = generateId();
            const newHs = {
                id: newId,
                label: { en: 'New Hotspot', sv: 'Ny Hotspot' },
                shape: 'rect',
                xPercent: x,
                yPercent: y,
                widthPercent: w,
                heightPercent: h
            };
            syncHotspotFromPercent(newHs);
            state.hotspots.push(newHs);
            selectHotspot(newId);
        }
    }

    state.isDrawing = false;
    state.isMoving = false;
    state.isResizing = false;
    state.resizeHandle = null;
    saveSession();
    updateOutput();
    renderHotspots();
}

// --- UTILS ---
function generateId() {
    let i = 1;
    while (state.hotspots.some(h => h.id === `${DEFAULT_HOTSPOT_ID_PREFIX}${String(i).padStart(2, '0')}`)) {
        i++;
    }
    return `${DEFAULT_HOTSPOT_ID_PREFIX}${String(i).padStart(2, '0')}`;
}

function syncHotspotFromPercent(hs) {
    hs.x = Math.round((hs.xPercent / 100) * state.imageWidth);
    hs.y = Math.round((hs.yPercent / 100) * state.imageHeight);
    hs.width = Math.round((hs.widthPercent / 100) * state.imageWidth);
    hs.height = Math.round((hs.heightPercent / 100) * state.imageHeight);
}

function syncHotspotFromPixels(hs) {
    hs.xPercent = (hs.x / state.imageWidth) * 100;
    hs.yPercent = (hs.y / state.imageHeight) * 100;
    hs.widthPercent = (hs.width / state.imageWidth) * 100;
    hs.heightPercent = (hs.height / state.imageHeight) * 100;
}

// --- UI RENDERING ---
function renderHotspots() {
    el.overlay.innerHTML = '';
    if (!state.showHotspots) return;

    state.hotspots.forEach(hs => {
        const div = document.createElement('div');
        div.className = `hotspot-rect ${hs.id === state.selectedId ? 'selected' : ''}`;
        div.dataset.id = hs.id;
        div.style.left = `${hs.xPercent}%`;
        div.style.top = `${hs.yPercent}%`;
        div.style.width = `${hs.widthPercent}%`;
        div.style.height = `${hs.heightPercent}%`;

        if (state.showLabels) {
            const label = document.createElement('div');
            label.className = 'hotspot-label';
            label.innerText = hs.id;
            div.appendChild(label);
        }

        if (hs.id === state.selectedId) {
            addResizeHandles(div);
        }

        el.overlay.appendChild(div);
    });

    renderList();
}

function addResizeHandles(parent) {
    const handles = ['tl', 'tr', 'bl', 'br'];
    handles.forEach(h => {
        const handle = document.createElement('div');
        handle.className = `resize-handle handle-${h}`;
        handle.dataset.handle = h;
        
        // Positioning handles relative to hotspot
        if (h.includes('t')) handle.style.top = '-4px'; else handle.style.bottom = '-4px';
        if (h.includes('l')) handle.style.left = '-4px'; else handle.style.right = '-4px';
        
        parent.appendChild(handle);
    });
}

function renderDrawPreview() {
    el.overlay.innerHTML = '';
    const x = Math.min(state.startX, state.currentX);
    const y = Math.min(state.startY, state.currentY);
    const w = Math.abs(state.startX - state.currentX);
    const h = Math.abs(state.startY - state.currentY);

    const div = document.createElement('div');
    div.className = 'hotspot-rect preview';
    div.style.left = `${x}%`;
    div.style.top = `${y}%`;
    div.style.width = `${w}%`;
    div.style.height = `${h}%`;
    el.overlay.appendChild(div);
}

function renderList() {
    el.hotspotList.innerHTML = '';
    state.hotspots.forEach(hs => {
        const li = document.createElement('li');
        li.className = `hs-list-item ${hs.id === state.selectedId ? 'active' : ''}`;
        li.innerHTML = `<span>${hs.id}</span> <small>${hs.width}x${hs.height}</small>`;
        li.onclick = () => selectHotspot(hs.id);
        el.hotspotList.appendChild(li);
    });
}

function selectHotspot(id) {
    state.selectedId = id;
    const hs = state.hotspots.find(h => h.id === id);
    
    if (hs) {
        el.selectionProps.classList.remove('disabled');
        document.getElementById('hotspot-id').value = hs.id;
        document.getElementById('hotspot-label-en').value = hs.label.en;
        document.getElementById('hotspot-label-sv').value = hs.label.sv;
        document.getElementById('hs-x').value = hs.x;
        document.getElementById('hs-y').value = hs.y;
        document.getElementById('hs-w').value = hs.width;
        document.getElementById('hs-h').value = hs.height;
    } else {
        el.selectionProps.classList.add('disabled');
    }

    renderHotspots();
    saveSession();
}

function updateSelectedHotspot() {
    const hs = state.hotspots.find(h => h.id === state.selectedId);
    if (!hs) return;

    const oldId = hs.id;
    const newId = document.getElementById('hotspot-id').value;
    
    // ID Uniqueness
    if (newId !== oldId && state.hotspots.some(h => h.id === newId)) {
        // Just revert or handle silently for now
    } else {
        hs.id = newId;
        state.selectedId = newId;
    }

    hs.label.en = document.getElementById('hotspot-label-en').value;
    hs.label.sv = document.getElementById('hotspot-label-sv').value;
    hs.x = parseInt(document.getElementById('hs-x').value) || 0;
    hs.y = parseInt(document.getElementById('hs-y').value) || 0;
    hs.width = parseInt(document.getElementById('hs-w').value) || 0;
    hs.height = parseInt(document.getElementById('hs-h').value) || 0;

    syncHotspotFromPixels(hs);
    renderHotspots();
    saveSession();
    updateOutput();
}

function duplicateSelected() {
    const hs = state.hotspots.find(h => h.id === state.selectedId);
    if (!hs) return;

    const newHs = JSON.parse(JSON.stringify(hs));
    newHs.id = generateId();
    newHs.xPercent += 2;
    newHs.yPercent += 2;
    syncHotspotFromPercent(newHs);
    state.hotspots.push(newHs);
    selectHotspot(newHs.id);
}

function deleteSelected() {
    state.hotspots = state.hotspots.filter(h => h.id !== state.selectedId);
    selectHotspot(null);
}

function clearAll() {
    if (confirm('Clear all hotspots?')) {
        state.hotspots = [];
        selectHotspot(null);
    }
}

// --- SESSION / IO ---
function updateOutput() {
    const isGameArray = document.querySelector('.tab-btn[data-tab="game-array"]').classList.contains('active');
    
    if (isGameArray) {
        const arr = state.hotspots.map(hs => ({
            id: hs.id,
            x: parseFloat(hs.xPercent.toFixed(2)),
            y: parseFloat(hs.yPercent.toFixed(2)),
            w: parseFloat(hs.widthPercent.toFixed(2)),
            h: parseFloat(hs.heightPercent.toFixed(2)),
            name: { en: hs.label.en, sv: hs.label.sv }
        }));
        el.jsonOutput.value = JSON.stringify(arr, null, 2);
    } else {
        const out = {
            sceneId: state.sceneId,
            image: state.imageName,
            imageWidth: state.imageWidth,
            imageHeight: state.imageHeight,
            hotspots: state.hotspots.map(hs => ({
                id: hs.id,
                label: hs.label,
                shape: hs.shape,
                x: hs.x,
                y: hs.y,
                width: hs.width,
                height: hs.height,
                xPercent: parseFloat(hs.xPercent.toFixed(2)),
                yPercent: parseFloat(hs.yPercent.toFixed(2)),
                widthPercent: parseFloat(hs.widthPercent.toFixed(2)),
                heightPercent: parseFloat(hs.heightPercent.toFixed(2))
            }))
        };
        el.jsonOutput.value = JSON.stringify(out, null, 2);
    }
}

function copyToClipboard() {
    el.jsonOutput.select();
    document.execCommand('copy');
    const originalText = document.getElementById('btn-copy').innerText;
    document.getElementById('btn-copy').innerText = 'Copied!';
    setTimeout(() => document.getElementById('btn-copy').innerText = originalText, 2000);
}

function downloadJSON() {
    const data = el.jsonOutput.value;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.sceneId || 'hotspots'}.json`;
    a.click();
}

function handleImport() {
    try {
        const data = JSON.parse(el.importArea.value);
        if (data.hotspots) {
            state.hotspots = data.hotspots;
            state.sceneId = data.sceneId || '';
            state.imageName = data.image || '';
            state.imageWidth = data.imageWidth || 0;
            state.imageHeight = data.imageHeight || 0;
            updateUI();
        } else if (Array.isArray(data)) {
            // Assume game array format
            state.hotspots = data.map(h => ({
                id: h.id,
                label: h.name || { en: '', sv: '' },
                shape: 'rect',
                xPercent: h.x,
                yPercent: h.y,
                widthPercent: h.w,
                heightPercent: h.h
            }));
            state.hotspots.forEach(syncHotspotFromPercent);
        }
        el.modalContainer.style.display = 'none';
        renderHotspots();
        updateOutput();
        saveSession();
    } catch (e) {
        alert('Invalid JSON format');
    }
}

function saveSession() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadSession() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
        updateUI();
    }
}

function updateUI() {
    el.sceneIdInput.value = state.sceneId;
    el.infoFilename.innerText = state.imageName || 'None';
    el.infoRes.innerText = `${state.imageWidth} x ${state.imageHeight}`;
    
    if (state.img.src) {
        el.img.style.display = 'block';
        el.emptyState.style.display = 'none';
    }

    renderHotspots();
    updateOutput();
}

// Start
init();
