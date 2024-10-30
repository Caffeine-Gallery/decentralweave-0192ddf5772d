import { backend } from 'declarations/backend';

// State management
let state = {
    selectedElement: null,
    history: [],
    historyIndex: -1,
    isDragging: false,
    currentX: 0,
    currentY: 0,
    initialX: 0,
    initialY: 0,
    xOffset: 0,
    yOffset: 0,
    deviceView: 'desktop',
    showGrid: false,
    elements: []
};

// Initialize the builder
function initBuilder() {
    initDragAndDrop();
    initPropertyPanel();
    initHistory();
    loadSavedDesign();
}

// Drag and Drop functionality
function initDragAndDrop() {
    document.querySelectorAll('.element').forEach(element => {
        element.addEventListener('dragstart', handleDragStart);
    });

    const canvas = document.getElementById('canvas');
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('click', handleCanvasClick);
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const element = createCanvasElement(type);
    
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    
    canvas.appendChild(element);
    element.classList.add('animate-entrance');
    
    addToHistory({
        type: 'add',
        element: element.outerHTML,
        position: { x, y }
    });
    
    state.elements.push({
        id: element.id,
        type: type,
        position: { x, y },
        styles: element.style.cssText
    });
}

function createCanvasElement(type) {
    const element = document.createElement('div');
    element.className = 'canvas-element';
    element.id = 'element-' + Date.now();
    element.dataset.type = type;
    
    // Add element controls
    const controls = document.createElement('div');
    controls.className = 'element-controls';
    controls.innerHTML = `
        <button class="control-button" onclick="duplicateElement('${element.id}')">
            <i class="fas fa-copy"></i>
        </button>
        <button class="control-button" onclick="deleteElement('${element.id}')">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    element.appendChild(controls);
    
    // Set default content based on type
    switch(type) {
        case 'heading':
            element.innerHTML += '<h2 contenteditable="true">New Heading</h2>';
            break;
        case 'text':
            element.innerHTML += '<p contenteditable="true">New Text Block</p>';
            break;
        case 'button':
            element.innerHTML += '<button class="button button-primary">New Button</button>';
            break;
        case 'image':
            element.innerHTML += `<img src="https://via.placeholder.com/300x200" alt="placeholder">`;
            break;
        // Add more cases for other element types
    }
    
    // Add event listeners
    element.addEventListener('mousedown', startDragging);
    element.addEventListener('click', selectElement);
    
    return element;
}

// Element manipulation functions
function startDragging(e) {
    if (e.target.classList.contains('canvas-element')) {
        state.isDragging = true;
        state.selectedElement = e.target;
        state.initialX = e.clientX - state.xOffset;
        state.initialY = e.clientY - state.yOffset;
    }
}

function selectElement(e) {
    e.stopPropagation();
    if (state.selectedElement) {
        state.selectedElement.classList.remove('selected');
    }
    
    state.selectedElement = e.target.closest('.canvas-element');
    state.selectedElement.classList.add('selected');
    showProperties();
}

// Property panel functions
function initPropertyPanel() {
    const inputs = document.querySelectorAll('.property-input');
    inputs.forEach(input => {
        input.addEventListener('change', updateElementProperty);
    });
}

function updateElementProperty(e) {
    if (!state.selectedElement) return;
    
    const property = e.target.id.replace('element-', '');
    const value = e.target.value;
    
    switch(property) {
        case 'width':
        case 'height':
            state.selectedElement.style[property] = value.includes('px') ? value : value + 'px';
            break;
        case 'bgcolor':
            state.selectedElement.style.backgroundColor = value;
            document.getElementById('bg-color-preview').style.backgroundColor = value;
            break;
        // Add more cases for other properties
    }
    
    addToHistory({
        type: 'modify',
        elementId: state.selectedElement.id,
        property: property,
        value: value
    });
}

// History management
function addToHistory(action) {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(action);
    state.historyIndex++;
    updateHistoryPanel();
}

function undo() {
    if (state.historyIndex < 0) return;
    
    const action = state.history[state.historyIndex];
    revertAction(action);
    state.historyIndex--;
    updateHistoryPanel();
}

function redo() {
    if (state.historyIndex >= state.history.length - 1) return;
    
    state.historyIndex++;
    const action = state.history[state.historyIndex];
    applyAction(action);
    updateHistoryPanel();
}

// Device view functions
function setDeviceView(device) {
    state.deviceView = device;
    const canvas = document.getElementById('canvas');
    canvas.className = device;
    
    document.querySelectorAll('.device-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Grid toggle
function toggleGrid() {
    state.showGrid = !state.showGrid;
    document.querySelector('.grid-overlay').classList.toggle('active');
}

// Save and load functions
async function saveDesign() {
    const design = {
        elements: state.elements,
        history: state.history,
        deviceView: state.deviceView
    };
    
    try {
        await backend.saveDesign(design);
        alert('Design saved successfully!');
    } catch (error) {
        console.error('Error saving design:', error);
        alert('Error saving design. Please try again.');
    }
}

async function loadSavedDesign() {
    try {
        const savedDesign = await backend.getDesign();
        if (savedDesign) {
            const design = savedDesign;
            design.elements.forEach(el => {
                const element = createCanvasElement(el.type);
                element.style.cssText = el.styles;
                canvas.appendChild(element);
            });
            
            state.elements = design.elements;
            state.history = design.history;
            setDeviceView(design.deviceView);
        }
    } catch (error) {
        console.error('Error loading saved design:', error);
    }
}

// Preview and publish functions
function previewDesign() {
    const previewWindow = window.open('', '_blank');
    const canvas = document.getElementById('canvas');
    
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preview</title>
            <style>
                ${document.querySelector('style').textContent}
                .canvas-element { position: relative !important; }
                .element-controls { display: none; }
            </style>
        </head>
        <body>
            <div id="canvas" class="${state.deviceView}">
                ${canvas.innerHTML}
            </div>
        </body>
        </html>
    `);
}

async function publishDesign() {
    try {
        await backend.publishDesign(state.elements);
        alert('Design published successfully!');
    } catch (error) {
        console.error('Error publishing design:', error);
        alert('Error publishing design. Please try again.');
    }
}

// New functions to fix the errors
function duplicateElement(elementId) {
    const originalElement = document.getElementById(elementId);
    if (originalElement) {
        const clone = originalElement.cloneNode(true);
        clone.id = 'element-' + Date.now();
        clone.style.left = (parseInt(originalElement.style.left) + 10) + 'px';
        clone.style.top = (parseInt(originalElement.style.top) + 10) + 'px';
        originalElement.parentNode.appendChild(clone);
        addToHistory({
            type: 'duplicate',
            originalId: elementId,
            newElement: clone.outerHTML
        });
    }
}

function handleCanvasClick(e) {
    if (e.target === canvas) {
        if (state.selectedElement) {
            state.selectedElement.classList.remove('selected');
        }
        state.selectedElement = null;
        document.getElementById('properties-panel').classList.remove('active');
    }
}

function updateHistoryPanel() {
    const historyList = document.querySelector('.history-list');
    historyList.innerHTML = '';
    state.history.forEach((action, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = `Action ${index + 1}: ${action.type}`;
        item.addEventListener('click', () => goToHistoryState(index));
        historyList.appendChild(item);
    });
}

function showProperties() {
    const propertiesPanel = document.getElementById('properties-panel');
    propertiesPanel.classList.add('active');
    if (state.selectedElement) {
        const type = state.selectedElement.dataset.type;
        const styles = window.getComputedStyle(state.selectedElement);
        
        document.getElementById('element-width').value = styles.width;
        document.getElementById('element-height').value = styles.height;
        document.getElementById('element-bgcolor').value = rgb2hex(styles.backgroundColor);
        // Add more property updates here
    }
}

// Helper function to convert RGB to HEX
function rgb2hex(rgb) {
    if (rgb.startsWith('rgb')) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    } else {
        return rgb;
    }
}

function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
}

// Initialize the builder
document.addEventListener('DOMContentLoaded', initBuilder);

// Expose functions to window object for HTML onclick attributes
window.setDeviceView = setDeviceView;
window.toggleGrid = toggleGrid;
window.undo = undo;
window.redo = redo;
window.previewDesign = previewDesign;
window.publishDesign = publishDesign;
window.duplicateElement = duplicateElement;
window.deleteElement = deleteElement;
