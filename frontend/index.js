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
    elements: [],
    currentView: 'canvas' // New state to track current view
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
    canvas.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
}

// ... (previous code remains the same)

// New function to generate HTML code
function generateHTMLCode() {
    const canvas = document.getElementById('canvas');
    let code = `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Generated Website</title>\n    <style>\n        /* Add your CSS styles here */\n    </style>\n</head>\n<body>\n`;
    
    code += canvas.innerHTML;
    
    code += `\n</body>\n</html>`;
    
    return code;
}

// New function to update code view
function updateCodeView() {
    const codeElement = document.getElementById('generated-code');
    codeElement.textContent = generateHTMLCode();
}

// New function to toggle between canvas and code view
function toggleView() {
    const canvasContainer = document.getElementById('canvas-container');
    const codeContainer = document.getElementById('code-container');
    
    if (state.currentView === 'canvas') {
        canvasContainer.style.display = 'none';
        codeContainer.style.display = 'block';
        updateCodeView();
        state.currentView = 'code';
    } else {
        canvasContainer.style.display = 'block';
        codeContainer.style.display = 'none';
        state.currentView = 'canvas';
    }
}

// Modify existing functions to update code view when changes are made
function addToHistory(action) {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(action);
    state.historyIndex++;
    updateHistoryPanel();
    updateCodeView(); // Add this line
}

// ... (rest of the code remains the same)

// Expose functions to window object for HTML onclick attributes
window.setDeviceView = setDeviceView;
window.toggleGrid = toggleGrid;
window.undo = undo;
window.redo = redo;
window.previewDesign = previewDesign;
window.publishDesign = publishDesign;
window.duplicateElement = duplicateElement;
window.deleteElement = deleteElement;
window.toggleView = toggleView; // Add this line

// Initialize the builder
document.addEventListener('DOMContentLoaded', initBuilder);
