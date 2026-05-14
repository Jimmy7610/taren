/**
 * Lost Signal Hotspot Editor - Logic
 * Built with Vanilla JS for Jimmy Eliasson
 */

// --- CONFIGURATION / INSTÄLLNING ---
const HANDLE_SIZE = 8; // INSTÄLLNING - Size of resize handles in pixels
const POLYGON_POINT_RADIUS = 6; // INSTÄLLNING - Size of polygon vertex handles
const POLYGON_FILL_ALPHA = 0.18; // INSTÄLLNING - Fill opacity for polygon hotspots
const SNAP_THRESHOLD = 5; // INSTÄLLNING - Snap to grid threshold (if implemented)
const MIN_SIZE = 10; // INSTÄLLNING - Minimum width/height for a hotspot
const DEFAULT_HOTSPOT_ID_PREFIX = 'hotspot_'; // INSTÄLLNING - Default prefix for new hotspots
const SAVE_KEY = 'lost-signal-hotspot-session'; // INSTÄLLNING - LocalStorage key
const UNSAVED_WARNING_ENABLED = true; // INSTÄLLNING - Enables warning before clearing unsaved work.
const AUTO_HIDE_STATUS_MS = 4000; // INSTÄLLNING - How long to show status messages.

// --- STATE ---
let state = {
    sceneId: '',
    imageName: '',
    imageWidth: 0,
    imageHeight: 0,
    hotspots: [],
    selectedId: null,
    activeShapeMode: 'rect', // 'rect' or 'polygon'
    isDrawing: false,
    isMoving: false,
    isResizing: false,
    isDraggingVertex: false,
    resizeHandle: null,
    vertexIndex: -1,
    currentPolygonPoints: [], // Points currently being drawn [{x, y}] (percents)
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    showHotspots: true,
    showLabels: true,
    hasUnsavedChanges: false
};

// --- DOM ELEMENTS ---
const el = {
    viewport: document.getElementById('stage-viewport'),
    container: document.getElementById('image-container'),
    img: document.getElementById('bg-image'),
    overlay: document.getElementById('hotspot-overlay'),
    svg: document.getElementById('hotspot-svg'),
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
    modalTitle: document.getElementById('modal-title'),
    modalText: document.getElementById('modal-text'),
    importArea: document.getElementById('import-area'),
    btnModalConfirm: document.getElementById('btn-modal-confirm'),
    btnModalCancel: document.getElementById('btn-modal-cancel'),
    polyControls: document.getElementById('poly-controls'),
    unsavedIndicator: document.getElementById('unsaved-indicator'),
    statusMessage: document.getElementById('status-message')
};

// --- INITIALIZATION ---
function init() {
    bindEvents();
    loadSession();
    updateUI();
}

function bindEvents() {
    // Image Loading
    // Image Loading
    el.btnLoadImage.onclick = () => {
        if (state.hotspots.length > 0) {
            showModal({
                title: { en: "Load New Image?", sv: "Ladda ny bild?" },
                text: { 
                    en: "You already have hotspots for the current image. Have you exported/saved them? Loading a new image can clear the current hotspots. Do you want to clear the hotspots and start fresh for the new image?",
                    sv: "Du har redan hotspots för den nuvarande bilden. Har du exporterat/sparat dem? Om du laddar en ny bild kan nuvarande hotspots rensas. Vill du rensa hotspots och börja om på den nya bilden?"
                },
                confirmLabel: { en: "Clear and Load / Yes", sv: "Rensa och ladda / Ja" },
                cancelLabel: { en: "Cancel / No", sv: "Avbryt / Nej" },
                onConfirm: () => {
                    el.fileInput.click();
                },
                onCancel: () => {
                    showStatus({
                        en: "Image load cancelled. Current hotspots kept.",
                        sv: "Bildladdning avbröts. Nuvarande hotspots behålls."
                    });
                }
            });
        } else {
            el.fileInput.click();
        }
    };
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

    // Shape Mode
    document.querySelectorAll('.shape-selector .btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.shape-selector .btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeShapeMode = btn.dataset.mode;
            cancelPolygon(); // Reset any drawing in progress
            el.polyControls.style.display = state.activeShapeMode === 'polygon' ? 'block' : 'none';
        };
    });

    document.getElementById('btn-finish-poly').onclick = finishPolygon;

    // Drawing / Interaction
    el.container.onmousedown = handleMouseDown;
    window.onmousemove = handleMouseMove;
    window.onmouseup = handleMouseUp;

    // Sidebar Inputs
    el.sceneIdInput.oninput = (e) => {
        state.sceneId = e.target.value;
        markUnsaved();
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
    document.getElementById('btn-new-scene').onclick = handleNewScene;
    document.getElementById('btn-duplicate').onclick = duplicateSelected;
    document.getElementById('btn-delete').onclick = deleteSelected;
    document.getElementById('btn-copy').onclick = () => { copyToClipboard(); clearUnsaved(); };
    document.getElementById('btn-download').onclick = () => { downloadJSON(); clearUnsaved(); };
    document.getElementById('btn-clear').onclick = handleNewScene;
    document.getElementById('btn-import').onclick = () => {
        if (state.hotspots.length > 0) {
            showModal({
                title: { en: "Import JSON", sv: "Importera JSON" },
                text: { 
                    en: "Importing JSON will replace the current hotspots. Have you exported/saved your current work?",
                    sv: "Import av JSON ersätter nuvarande hotspots. Har du exporterat/sparat ditt nuvarande arbete?"
                },
                confirmLabel: { en: "Replace / Ersätt", sv: "Ersätt / Ja" },
                onConfirm: () => {
                    showImportModal();
                }
            });
        } else {
            showImportModal();
        }
    };
    el.btnModalCancel.onclick = closeModal;
    el.btnModalConfirm.onclick = () => {
        if (el.btnModalConfirm.dataset.action === 'import') {
            handleImport();
        } else if (el.btnModalConfirm.dataset.action === 'confirm') {
            const callback = el.btnModalConfirm._callback;
            closeModal();
            if (callback) callback();
        }
    };

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
        if (e.key === 'Escape') {
            if (el.modalContainer.style.display === 'flex') {
                closeModal();
            } else if (state.isDrawing && state.activeShapeMode === 'polygon') {
                cancelPolygon();
            } else {
                selectHotspot(null);
            }
        }
        if (e.key === 'Enter') {
            if (el.modalContainer.style.display === 'flex') {
                el.btnModalConfirm.click();
            } else if (state.isDrawing && state.activeShapeMode === 'polygon') {
                finishPolygon();
            }
        }
        if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            duplicateSelected();
        }
    };

    // Unload Warning
    window.onbeforeunload = (e) => {
        if (UNSAVED_WARNING_ENABLED && state.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
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

    // If confirmation happened, we clear current work
    state.hotspots = [];
    state.selectedId = null;
    cancelPolygon();

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
            
            showStatus({
                en: "New image loaded. Hotspots cleared.",
                sv: "Ny bild laddad. Hotspots rensade."
            });
            
            markUnsaved(); // New image is a change
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

    // Polygon vertex dragging
    if (target.classList.contains('vertex-handle')) {
        state.isDraggingVertex = true;
        state.vertexIndex = parseInt(target.dataset.index);
        state.startX = coords.x;
        state.startY = coords.y;
        return;
    }

    // Check if clicking a handle (Rect only)
    if (target.classList.contains('resize-handle')) {
        state.isResizing = true;
        state.resizeHandle = target.dataset.handle;
        state.startX = coords.x;
        state.startY = coords.y;
        return;
    }

    // Polygon creation
    if (state.activeShapeMode === 'polygon') {
        if (!state.isDrawing) {
            state.isDrawing = true;
            state.currentPolygonPoints = [coords];
        } else {
            state.currentPolygonPoints.push(coords);
        }
        renderHotspots();
        return;
    }

    // Check if clicking existing hotspot (div-based rect or SVG path)
    if (target.classList.contains('hotspot-rect') || target.closest('.hotspot-rect') || target.classList.contains('hotspot-poly')) {
        const hsId = target.dataset.id || target.closest('.hotspot-rect')?.dataset.id;
        selectHotspot(hsId);
        state.isMoving = true;
        state.startX = coords.x;
        state.startY = coords.y;
        return;
    }

    // Hit testing for polygons (for the transparent interior)
    const hitId = hitTestPolygons(coords);
    if (hitId) {
        selectHotspot(hitId);
        state.isMoving = true;
        state.startX = coords.x;
        state.startY = coords.y;
        return;
    }

    // Start drawing new RECT hotspot
    if (state.activeShapeMode === 'rect') {
        selectHotspot(null);
        state.isDrawing = true;
        state.startX = coords.x;
        state.startY = coords.y;
        state.currentX = coords.x;
        state.currentY = coords.y;
    }
}

function handleMouseMove(e) {
    const coords = getStageCoords(e);
    el.coordDisplay.innerText = `X: ${Math.round((coords.x / 100) * state.imageWidth)}, Y: ${Math.round((coords.y / 100) * state.imageHeight)} (${coords.x.toFixed(1)}%, ${coords.y.toFixed(1)}%)`;

    if (state.isDrawing) {
        state.currentX = coords.x;
        state.currentY = coords.y;
        if (state.activeShapeMode === 'rect') {
            renderDrawPreview();
        } else {
            renderHotspots(); // Redraw poly preview
        }
    } else if (state.isDraggingVertex && state.selectedId) {
        const hs = state.hotspots.find(h => h.id === state.selectedId);
        if (hs && hs.shape === 'polygon') {
            hs.pointsPercent[state.vertexIndex] = coords;
            syncHotspotFromPercent(hs);
            markUnsaved();
            updateUI();
            renderHotspots();
        }
    } else if (state.isMoving && state.selectedId) {
        const hs = state.hotspots.find(h => h.id === state.selectedId);
        const dx = coords.x - state.startX;
        const dy = coords.y - state.startY;
        
        if (hs.shape === 'rect') {
            hs.xPercent += dx;
            hs.yPercent += dy;
        } else if (hs.shape === 'polygon') {
            hs.pointsPercent = hs.pointsPercent.map(p => ({ x: p.x + dx, y: p.y + dy }));
        }
        
        state.startX = coords.x;
        state.startY = coords.y;
        syncHotspotFromPercent(hs);
        markUnsaved();
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
        markUnsaved();
        updateUI();
        renderHotspots();
    }
}

function handleMouseUp() {
    if (state.isDrawing && state.activeShapeMode === 'rect') {
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
            markUnsaved();
            selectHotspot(newId);
        }
        state.isDrawing = false;
    }

    state.isMoving = false;
    state.isResizing = false;
    state.isDraggingVertex = false;
    state.resizeHandle = null;
    saveSession();
    updateOutput();
    renderHotspots();
}

// --- POLYGON SPECIFIC ---
function finishPolygon() {
    if (state.currentPolygonPoints.length < 3) {
        cancelPolygon();
        return;
    }

    const newId = generateId();
    const newHs = {
        id: newId,
        label: { en: 'New Polygon', sv: 'Ny Polygon' },
        shape: 'polygon',
        pointsPercent: state.currentPolygonPoints
    };
    syncHotspotFromPercent(newHs);
    state.hotspots.push(newHs);
    state.isDrawing = false;
    state.currentPolygonPoints = [];
    markUnsaved();
    selectHotspot(newId);
    saveSession();
    updateOutput();
}

function cancelPolygon() {
    state.isDrawing = false;
    state.currentPolygonPoints = [];
    renderHotspots();
}

/**
 * INSTÄLLNING - Point-in-Polygon hit testing algorithm (Ray-casting)
 */
function isPointInPolygon(point, polygon) {
    const x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function hitTestPolygons(coords) {
    // Reverse order to check top-most first
    for (let i = state.hotspots.length - 1; i >= 0; i--) {
        const hs = state.hotspots[i];
        if (hs.shape === 'polygon' && isPointInPolygon(coords, hs.pointsPercent)) {
            return hs.id;
        }
    }
    return null;
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
    if (hs.shape === 'rect') {
        hs.x = Math.round((hs.xPercent / 100) * state.imageWidth);
        hs.y = Math.round((hs.yPercent / 100) * state.imageHeight);
        hs.width = Math.round((hs.widthPercent / 100) * state.imageWidth);
        hs.height = Math.round((hs.heightPercent / 100) * state.imageHeight);
    } else if (hs.shape === 'polygon') {
        hs.points = hs.pointsPercent.map(p => ({
            x: Math.round((p.x / 100) * state.imageWidth),
            y: Math.round((p.y / 100) * state.imageHeight)
        }));
    }
}

function syncHotspotFromPixels(hs) {
    if (hs.shape === 'rect') {
        hs.xPercent = (hs.x / state.imageWidth) * 100;
        hs.yPercent = (hs.y / state.imageHeight) * 100;
        hs.widthPercent = (hs.width / state.imageWidth) * 100;
        hs.heightPercent = (hs.height / state.imageHeight) * 100;
    } else if (hs.shape === 'polygon') {
        hs.pointsPercent = hs.points.map(p => ({
            x: (p.x / state.imageWidth) * 100,
            y: (p.y / state.imageHeight) * 100
        }));
    }
}

// --- UI RENDERING ---
function renderHotspots() {
    el.overlay.innerHTML = '';
    el.svg.innerHTML = '';
    
    if (!state.showHotspots) return;

    state.hotspots.forEach(hs => {
        if (hs.shape === 'rect') {
            renderRectHotspot(hs);
        } else if (hs.shape === 'polygon') {
            renderPolyHotspot(hs);
        }
    });

    // Draw current polygon preview
    if (state.activeShapeMode === 'polygon' && state.isDrawing) {
        renderPolyPreview();
    }

    renderList();
}

function renderRectHotspot(hs) {
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
}

function renderPolyHotspot(hs) {
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.classList.add('hotspot-poly');
    if (hs.id === state.selectedId) poly.classList.add('selected');
    poly.dataset.id = hs.id;
    
    const pointsStr = hs.pointsPercent.map(p => `${p.x},${p.y}`).join(' ');
    poly.setAttribute('points', pointsStr);
    
    poly.onmousedown = (e) => {
        e.stopPropagation();
        handleMouseDown(e);
    };

    el.svg.appendChild(poly);

    if (state.showLabels) {
        const firstPoint = hs.pointsPercent[0];
        const label = document.createElement('div');
        label.className = 'hotspot-label';
        label.style.left = `${firstPoint.x}%`;
        label.style.top = `${firstPoint.y - 2}%`;
        label.innerText = hs.id;
        el.overlay.appendChild(label);
    }

    if (hs.id === state.selectedId) {
        addVertexHandles(hs);
    }
}

function renderPolyPreview() {
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.classList.add('poly-preview');
    
    const points = [...state.currentPolygonPoints];
    points.push({ x: state.currentX, y: state.currentY });
    
    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
    poly.setAttribute('points', pointsStr);
    el.svg.appendChild(poly);

    // Draw handles for current points
    state.currentPolygonPoints.forEach((p, i) => {
        const handle = document.createElement('div');
        handle.className = 'vertex-handle';
        handle.style.left = `${p.x}%`;
        handle.style.top = `${p.y}%`;
        el.overlay.appendChild(handle);
    });
}

function addResizeHandles(parent) {
    const handles = ['tl', 'tr', 'bl', 'br'];
    handles.forEach(h => {
        const handle = document.createElement('div');
        handle.className = `resize-handle handle-${h}`;
        handle.dataset.handle = h;
        
        if (h.includes('t')) handle.style.top = '-4px'; else handle.style.bottom = '-4px';
        if (h.includes('l')) handle.style.left = '-4px'; else handle.style.right = '-4px';
        
        parent.appendChild(handle);
    });
}

function addVertexHandles(hs) {
    hs.pointsPercent.forEach((p, i) => {
        const handle = document.createElement('div');
        handle.className = 'vertex-handle';
        handle.dataset.index = i;
        handle.style.left = `${p.x}%`;
        handle.style.top = `${p.y}%`;
        el.overlay.appendChild(handle);
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
        const typeIcon = hs.shape === 'rect' ? '▯' : '△';
        li.innerHTML = `<span>${typeIcon} ${hs.id}</span> <small>${hs.shape}</small>`;
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
        
        const isRect = hs.shape === 'rect';
        document.getElementById('hs-x').value = isRect ? hs.x : hs.points[0].x;
        document.getElementById('hs-y').value = isRect ? hs.y : hs.points[0].y;
        document.getElementById('hs-w').value = isRect ? hs.width : 0;
        document.getElementById('hs-h').value = isRect ? hs.height : 0;
        
        document.getElementById('hs-w').disabled = !isRect;
        document.getElementById('hs-h').disabled = !isRect;
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
    
    if (newId !== oldId && state.hotspots.some(h => h.id === newId)) {
        // Silently ignore or revert
    } else {
        hs.id = newId;
        state.selectedId = newId;
    }

    hs.label.en = document.getElementById('hotspot-label-en').value;
    hs.label.sv = document.getElementById('hotspot-label-sv').value;
    
    if (hs.shape === 'rect') {
        hs.x = parseInt(document.getElementById('hs-x').value) || 0;
        hs.y = parseInt(document.getElementById('hs-y').value) || 0;
        hs.width = parseInt(document.getElementById('hs-w').value) || 0;
        hs.height = parseInt(document.getElementById('hs-h').value) || 0;
    } else {
        const dx = (parseInt(document.getElementById('hs-x').value) || 0) - hs.points[0].x;
        const dy = (parseInt(document.getElementById('hs-y').value) || 0) - hs.points[0].y;
        hs.points = hs.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    }

    markUnsaved();
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
    if (newHs.shape === 'rect') {
        newHs.xPercent += 2;
        newHs.yPercent += 2;
    } else {
        newHs.pointsPercent = newHs.pointsPercent.map(p => ({ x: p.x + 2, y: p.y + 2 }));
    }
    syncHotspotFromPercent(newHs);
    state.hotspots.push(newHs);
    markUnsaved();
    selectHotspot(newHs.id);
}

function deleteSelected() {
    state.hotspots = state.hotspots.filter(h => h.id !== state.selectedId);
    markUnsaved();
    selectHotspot(null);
    updateOutput();
}

function handleNewScene() {
    if (state.hotspots.length > 0) {
        showModal({
            title: { en: "New Scene / Clear", sv: "Ny scen / Rensa" },
            text: { 
                en: "This will clear all current hotspots. Make sure you have exported your JSON first. Continue?",
                sv: "Detta rensar alla nuvarande hotspots. Kontrollera att du har exporterat din JSON först. Fortsätta?"
            },
            confirmLabel: { en: "Clear All / Ja", sv: "Rensa alla / Ja" },
            onConfirm: () => {
                state.hotspots = [];
                selectHotspot(null);
                cancelPolygon();
                markUnsaved();
                updateOutput();
            }
        });
    } else {
        // Already empty, just make sure state is reset
        state.hotspots = [];
        selectHotspot(null);
        cancelPolygon();
        updateOutput();
    }
}

// --- SESSION / IO ---
function updateOutput() {
    const isGameArray = document.querySelector('.tab-btn[data-tab="game-array"]').classList.contains('active');
    
    if (isGameArray) {
        const arr = state.hotspots.map(hs => {
            const base = {
                id: hs.id,
                shape: hs.shape,
                name: { en: hs.label.en, sv: hs.label.sv }
            };
            if (hs.shape === 'rect') {
                return { ...base, x: hs.xPercent, y: hs.yPercent, w: hs.widthPercent, h: hs.heightPercent };
            } else {
                return { ...base, pointsPercent: hs.pointsPercent.map(p => ({ x: parseFloat(p.x.toFixed(2)), y: parseFloat(p.y.toFixed(2)) })) };
            }
        });
        el.jsonOutput.value = JSON.stringify(arr, null, 2);
    } else {
        const out = {
            sceneId: state.sceneId,
            image: state.imageName,
            imageWidth: state.imageWidth,
            imageHeight: state.imageHeight,
            hotspots: state.hotspots.map(hs => {
                const base = {
                    id: hs.id,
                    label: hs.label,
                    shape: hs.shape
                };
                if (hs.shape === 'rect') {
                    return {
                        ...base,
                        x: hs.x, y: hs.y, width: hs.width, height: hs.height,
                        xPercent: parseFloat(hs.xPercent.toFixed(2)),
                        yPercent: parseFloat(hs.yPercent.toFixed(2)),
                        widthPercent: parseFloat(hs.widthPercent.toFixed(2)),
                        heightPercent: parseFloat(hs.heightPercent.toFixed(2))
                    };
                } else {
                    return {
                        ...base,
                        points: hs.points,
                        pointsPercent: hs.pointsPercent.map(p => ({ x: parseFloat(p.x.toFixed(2)), y: parseFloat(p.y.toFixed(2)) }))
                    };
                }
            })
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
        } else if (Array.isArray(data)) {
            state.hotspots = data.map(h => {
                const hs = {
                    id: h.id,
                    label: h.name || { en: '', sv: '' },
                    shape: h.shape || 'rect'
                };
                if (hs.shape === 'rect') {
                    hs.xPercent = h.x;
                    hs.yPercent = h.y;
                    hs.widthPercent = h.w;
                    hs.heightPercent = h.h;
                } else {
                    hs.pointsPercent = h.pointsPercent;
                }
                return hs;
            });
            state.hotspots.forEach(syncHotspotFromPercent);
        }
        
        closeModal();
        markUnsaved();
        selectHotspot(null);
        saveSession();
        updateOutput();
        renderHotspots();

        showStatus({
            en: "JSON imported successfully.",
            sv: "JSON importerad."
        });
    } catch (e) {
        alert("Invalid JSON format.");
    }
}

// --- UI HELPERS ---
function showModal({ title, text, onConfirm, onCancel, confirmLabel, cancelLabel }) {
    el.modalTitle.innerText = title.en;
    el.modalText.innerText = text.en;
    el.modalText.style.display = 'block';
    el.importArea.style.display = 'none';
    
    el.btnModalConfirm.innerText = confirmLabel ? confirmLabel.en : "Confirm";
    el.btnModalCancel.innerText = cancelLabel ? cancelLabel.en : "Cancel";
    
    el.btnModalConfirm.dataset.action = 'confirm';
    el.btnModalConfirm._callback = onConfirm;
    el.btnModalCancel.onclick = () => {
        closeModal();
        if (onCancel) onCancel();
    };
    
    el.modalContainer.style.display = 'flex';
}

function showImportModal() {
    el.modalTitle.innerText = "Import JSON";
    el.modalText.style.display = 'none';
    el.importArea.style.display = 'block';
    el.importArea.value = '';
    
    el.btnModalConfirm.innerText = "Import";
    el.btnModalCancel.innerText = "Cancel";
    el.btnModalConfirm.dataset.action = 'import';
    
    el.modalContainer.style.display = 'flex';
}

function closeModal() {
    el.modalContainer.style.display = 'none';
}

function markUnsaved() {
    state.hasUnsavedChanges = true;
    el.unsavedIndicator.style.display = 'block';
}

function clearUnsaved() {
    state.hasUnsavedChanges = false;
    el.unsavedIndicator.style.display = 'none';
}

function showStatus(msg) {
    el.statusMessage.innerText = msg.en;
    setTimeout(() => {
        if (el.statusMessage.innerText === msg.en) {
            el.statusMessage.innerText = '';
        }
    }, AUTO_HIDE_STATUS_MS);
}

function saveSession() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadSession() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
        if (!state.activeShapeMode) state.activeShapeMode = 'rect';
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

    document.querySelectorAll('.shape-selector .btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === state.activeShapeMode);
    });
    el.polyControls.style.display = state.activeShapeMode === 'polygon' ? 'block' : 'none';

    renderHotspots();
    updateOutput();
}

// Start
init();
