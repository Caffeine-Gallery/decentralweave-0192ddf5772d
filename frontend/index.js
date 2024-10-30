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
            element.innerHTML += '<button class="button button-primary" contenteditable="true">New Button</button>';
            break;
        case 'image':
            element.innerHTML += `<img src="https://via.placeholder.com/300x200" alt="placeholder">`;
            break;
        case 'video':
            element.innerHTML += '<video width="320" height="240" controls><source src="movie.mp4" type="video/mp4">Your browser does not support the video tag.</video>';
            break;
        case 'form':
            element.innerHTML += '<form><input type="text" placeholder="Input field"><button type="submit">Submit</button></form>';
            break;
        case 'list':
            element.innerHTML += '<ul><li>List Item 1</li><li>List Item 2</li><li>List Item 3</li></ul>';
            break;
        case 'table':
            element.innerHTML += '<table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Row 1, Cell 1</td><td>Row 1, Cell 2</td></tr></table>';
            break;
        case 'section':
            element.innerHTML += '<div class="section" style="width: 100%; height: 200px; border: 1px dashed #ccc;"></div>';
            break;
        case 'container':
            element.innerHTML += '<div class="container" style="width: 300px; height: 200px; border: 1px solid #ccc;"></div>';
            break;
        case 'grid':
            element.innerHTML += '<div class="grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 300px; height: 200px;"></div>';
            break;
        case 'navbar':
            element.innerHTML += '<nav><ul><li><a href="#">Home</a></li><li><a href="#">About</a></li><li><a href="#">Contact</a></li></ul></nav>';
            break;
        case 'footer':
            element.innerHTML += '<footer><p>&copy; 2023 Your Company. All rights reserved.</p></footer>';
            break;
        case 'card':
            element.innerHTML += '<div class="card" style="width: 200px; border: 1px solid #ccc; padding: 10px;"><h3>Card Title</h3><p>Card content goes here.</p></div>';
            break;
        case 'carousel':
            element.innerHTML += '<div class="carousel"><img src="https://via.placeholder.com/300x200" alt="Slide 1"><img src="https://via.placeholder.com/300x200" alt="Slide 2"><img src="https://via.placeholder.com/300x200" alt="Slide 3"></div>';
            break;
    }
    
    element.addEventListener('mousedown', startDragging);
    element.addEventListener('click', selectElement);
    
    return element;
}

// Element manipulation functions
function startDragging(e) {
    if (e.target.classList.contains('canvas-element')) {
        state.isDragging = true;
        state.selectedElement = e.target;
        state.initialX = e.clientX - state.selectedElement.offsetLeft;
        state.initialY = e.clientY - state.selectedElement.offsetTop;
        
        state.selectedElement.style.cursor = 'grabbing';
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);
    }
}

function drag(e) {
    if (state.isDragging) {
        e.preventDefault();
        state.currentX = e.clientX - state.initialX;
        state.currentY = e.clientY - state.initialY;

        state.selectedElement.style.left = state.currentX + 'px';
        state.selectedElement.style.top = state.currentY + 'px';
    }
}

function stopDragging(e) {
    if (state.isDragging) {
        state.isDragging = false;
        state.selectedElement.style.cursor = 'grab';
        
        addToHistory({
            type: 'move',
            elementId: state.selectedElement.id,
            position: { x: state.currentX, y: state.currentY }
        });
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDragging);
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
        case 'text':
            state.selectedElement.querySelector('h2, p, button').textContent = value;
            break;
        case 'font-size':
            state.selectedElement.style.fontSize = value.includes('px') ? value : value + 'px';
            break;
        case 'font-color':
            state.selectedElement.style.color = value;
            break;
    }
    
    addToHistory({
        type: 'modify',
        elementId: state.selectedElement.id,
        property: property,
        value: value
    });
}

// History management
function initHistory() {
    state.history = [];
    state.historyIndex = -1;
    updateHistoryPanel();
}

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

function revertAction(action) {
    switch(action.type) {
        case 'add':
            document.getElementById(action.elementId).remove();
            break;
        case 'delete':
            const canvas = document.getElementById('canvas');
            canvas.innerHTML += action.element;
            break;
        case 'move':
            const element = document.getElementById(action.elementId);
            element.style.left = action.previousPosition.x + 'px';
            element.style.top = action.previousPosition.y + 'px';
            break;
        case 'modify':
            const modifiedElement = document.getElementById(action.elementId);
            modifiedElement.style[action.property] = action.previousValue;
            break;
    }
}

function applyAction(action) {
    switch(action.type) {
        case 'add':
            const canvas = document.getElementById('canvas');
            canvas.innerHTML += action.element;
            break;
        case 'delete':
            document.getElementById(action.elementId).remove();
            break;
        case 'move':
            const element = document.getElementById(action.elementId);
            element.style.left = action.position.x + 'px';
            element.style.top = action.position.y + 'px';
            break;
        case 'modify':
            const modifiedElement = document.getElementById(action.elementId);
            modifiedElement.style[action.property] = action.value;
            break;
    }
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
            const canvas = document.getElementById('canvas');
            canvas.innerHTML = ''; // Clear existing elements
            
            if (savedDesign.elements && Array.isArray(savedDesign.elements)) {
                savedDesign.elements.forEach(el => {
                    const element = createCanvasElement(el.type);
                    element.style.cssText = el.styles;
                    element.style.left = el.position.x + 'px';
                    element.style.top = el.position.y + 'px';
                    canvas.appendChild(element);
                });
            }
            
            state.elements = savedDesign.elements || [];
            state.history = savedDesign.history || [];
            state.historyIndex = state.history.length - 1;
            setDeviceView(savedDesign.deviceView || 'desktop');
            updateHistoryPanel();
        }
    } catch (error) {
        console.error('Error loading saved design:', error);
        alert('Error loading saved design. Please try again.');
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

function deleteElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const deletedElementHTML = element.outerHTML;
        element.remove();
        addToHistory({
            type: 'delete',
            elementId: elementId,
            element: deletedElementHTML
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
    // Implement if you have a history panel in your UI
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
        document.getElementById('element-text').value = state.selectedElement.textContent;
        document.getElementById('element-font-size').value = styles.fontSize;
        document.getElementById('element-font-color').value = rgb2hex(styles.color);
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

// New function to generate HTML code
function generateHTMLCode() {
    const canvas = document.getElementById('canvas');
    let code = `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Generated Website</title>\n    <style>\n        /* Add your CSS styles here */\n    </style>\n</head>\n<body>\n`;
    
    code += canvas.innerHTML;
    
    code += `\n</body>\n</html>`;
    
    return code;
}

// New function to toggle code view
function toggleCodeView() {
    const codeViewOverlay = document.getElementById('code-view-overlay');
    const generatedCode = document.getElementById('generated-code');
    
    if (codeViewOverlay.style.display === 'none') {
        generatedCode.textContent = generateHTMLCode();
        codeViewOverlay.style.display = 'block';
    } else {
        codeViewOverlay.style.display = 'none';
    }
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
window.toggleCodeView = toggleCodeView;
