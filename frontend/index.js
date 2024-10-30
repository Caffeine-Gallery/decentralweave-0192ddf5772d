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
    console.log('Initializing builder...');
    try {
        initDragAndDrop();
        initPropertyPanel();
        initHistory();
        loadSavedDesign();
        setDeviceView('desktop'); // Set initial device view
        console.log('Builder initialized successfully');
    } catch (error) {
        console.error('Error initializing builder:', error);
    }
}

// Drag and Drop functionality
function initDragAndDrop() {
    console.log('Initializing drag and drop...');
    const elements = document.querySelectorAll('.element');
    elements.forEach(element => {
        element.addEventListener('dragstart', handleDragStart);
    });

    const canvas = document.getElementById('canvas');
    if (canvas) {
        canvas.addEventListener('dragover', handleDragOver);
        canvas.addEventListener('drop', handleDrop);
        canvas.addEventListener('click', handleCanvasClick);
    } else {
        console.error('Canvas element not found');
    }
}

function handleDragStart(e) {
    console.log('Drag started');
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    console.log('Element dropped');
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const element = createCanvasElement(type);
    
    const canvasRect = e.target.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    
    e.target.appendChild(element);
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
    console.log('Creating canvas element:', type);
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
            element.innerHTML += `<img src="https://via.placeholder.com/300x200" alt="placeholder"><p contenteditable="true">Image Caption</p>`;
            break;
        // Add cases for other element types here
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
    console.log('Initializing property panel...');
    const propertiesContent = document.getElementById('properties-content');
    if (propertiesContent) {
        propertiesContent.innerHTML = `
            <div class="property-group">
                <label for="element-width">Width:</label>
                <input type="text" id="element-width" class="property-input">
            </div>
            <div class="property-group">
                <label for="element-height">Height:</label>
                <input type="text" id="element-height" class="property-input">
            </div>
            <div class="property-group">
                <label for="element-bgcolor">Background Color:</label>
                <div class="color-picker-wrapper">
                    <input type="color" id="element-bgcolor" class="property-input">
                    <div id="bg-color-preview" class="color-preview"></div>
                </div>
            </div>
            <div class="property-group">
                <label for="element-text">Text Content:</label>
                <textarea id="element-text" class="property-input"></textarea>
            </div>
            <div class="property-group">
                <label for="element-font-size">Font Size:</label>
                <input type="text" id="element-font-size" class="property-input">
            </div>
            <div class="property-group">
                <label for="element-font-color">Font Color:</label>
                <input type="color" id="element-font-color" class="property-input">
            </div>
        `;

        const inputs = document.querySelectorAll('.property-input');
        inputs.forEach(input => {
            input.addEventListener('change', updateElementProperty);
        });
    } else {
        console.error('Properties content element not found');
    }
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
            updateElementText(state.selectedElement, value);
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

function updateElementText(element, value) {
    const editableElements = element.querySelectorAll('[contenteditable="true"]');
    if (editableElements.length > 0) {
        editableElements.forEach(el => {
            el.textContent = value;
        });
    } else {
        element.textContent = value;
    }
}

// History management
function initHistory() {
    console.log('Initializing history...');
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
            const elementToRemove = document.getElementById(action.elementId);
            if (elementToRemove) {
                elementToRemove.remove();
            }
            break;
        case 'delete':
            const canvas = document.getElementById('canvas');
            canvas.innerHTML += action.element;
            break;
        case 'move':
            const elementToMove = document.getElementById(action.elementId);
            if (elementToMove) {
                elementToMove.style.left = action.previousPosition.x + 'px';
                elementToMove.style.top = action.previousPosition.y + 'px';
            }
            break;
        case 'modify':
            const modifiedElement = document.getElementById(action.elementId);
            if (modifiedElement) {
                modifiedElement.style[action.property] = action.previousValue;
            }
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
            const elementToDelete = document.getElementById(action.elementId);
            if (elementToDelete) {
                elementToDelete.remove();
            }
            break;
        case 'move':
            const elementToMove = document.getElementById(action.elementId);
            if (elementToMove) {
                elementToMove.style.left = action.position.x + 'px';
                elementToMove.style.top = action.position.y + 'px';
            }
            break;
        case 'modify':
            const modifiedElement = document.getElementById(action.elementId);
            if (modifiedElement) {
                modifiedElement.style[action.property] = action.value;
            }
            break;
    }
}

// Device view functions
function setDeviceView(device) {
    console.log('Setting device view:', device);
    state.deviceView = device;
    const canvas = document.getElementById('canvas');
    const canvasContainer = document.getElementById('canvas-container');
    if (canvas && canvasContainer) {
        canvas.className = device;
        
        switch(device) {
            case 'desktop':
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvasContainer.style.width = '100%';
                canvasContainer.style.height = '100%';
                break;
            case 'tablet':
                canvas.style.width = '768px';
                canvas.style.height = '1024px';
                canvasContainer.style.width = '768px';
                canvasContainer.style.height = '1024px';
                break;
            case 'mobile':
                canvas.style.width = '375px';
                canvas.style.height = '667px';
                canvasContainer.style.width = '375px';
                canvasContainer.style.height = '667px';
                break;
        }
        
        // Add device frame
        canvas.style.border = '10px solid #333';
        canvas.style.borderRadius = device === 'desktop' ? '5px' : '20px';
        
        // Adjust canvas container
        canvasContainer.style.display = 'flex';
        canvasContainer.style.justifyContent = 'center';
        canvasContainer.style.alignItems = 'center';
        canvasContainer.style.height = '100%';
        canvasContainer.style.overflow = 'auto';
        
        // Scale canvas content
        const scale = device === 'desktop' ? 1 : (device === 'tablet' ? 0.75 : 0.5);
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = 'top left';
    } else {
        console.error('Canvas or canvas container element not found');
    }
    
    const buttons = document.querySelectorAll('.device-button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.onclick.toString().includes(device)) {
            button.classList.add('active');
        }
    });
}

// Grid toggle
function toggleGrid() {
    state.showGrid = !state.showGrid;
    const gridOverlay = document.querySelector('.grid-overlay');
    if (gridOverlay) {
        gridOverlay.classList.toggle('active');
    } else {
        console.error('Grid overlay element not found');
    }
}

// Save and load functions
async function saveDesign() {
    console.log('Saving design...');
    const design = {
        elements: state.elements,
        history: state.history,
        deviceView: state.deviceView
    };
    
    try {
        await backend.saveDesign(design);
        showModal('Design Saved', 'Your design has been saved successfully!');
    } catch (error) {
        console.error('Error saving design:', error);
        showModal('Error', 'There was an error saving your design. Please try again.');
    }
}

async function loadSavedDesign() {
    console.log('Loading saved design...');
    try {
        const savedDesign = await backend.getDesign();
        if (savedDesign) {
            const canvas = document.getElementById('canvas');
            if (canvas) {
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
            } else {
                console.error('Canvas element not found');
            }
        }
    } catch (error) {
        console.error('Error loading saved design:', error);
        showModal('Error', 'There was an error loading your saved design. Please try again.');
    }
}

// Preview function
function previewDesign() {
    console.log('Previewing design...');
    const previewWindow = window.open('', '_blank');
    const canvas = document.getElementById('canvas');
    
    if (previewWindow && canvas) {
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview</title>
                <style>
                    ${document.querySelector('style').textContent}
                    .canvas-element { position: relative !important; }
                    .element-controls { display: none; }
                    body { 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f0f0f0;
                    }
                    #preview-container {
                        width: ${state.deviceView === 'desktop' ? '100%' : state.deviceView === 'tablet' ? '768px' : '375px'};
                        height: ${state.deviceView === 'desktop' ? '100%' : state.deviceView === 'tablet' ? '1024px' : '667px'};
                        border: 10px solid #333;
                        border-radius: ${state.deviceView === 'desktop' ? '5px' : '20px'};
                        overflow: auto;
                        background-color: white;
                    }
                </style>
            </head>
            <body>
                <div id="preview-container">
                    ${canvas.innerHTML}
                </div>
            </body>
            </html>
        `);
    } else {
        console.error('Unable to open preview window or canvas not found');
    }
}

function duplicateElement(elementId) {
    console.log('Duplicating element:', elementId);
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
    } else {
        console.error('Element to duplicate not found:', elementId);
    }
}

function deleteElement(elementId) {
    console.log('Deleting element:', elementId);
    const element = document.getElementById(elementId);
    if (element) {
        const deletedElementHTML = element.outerHTML;
        element.remove();
        addToHistory({
            type: 'delete',
            elementId: elementId,
            element: deletedElementHTML
        });
    } else {
        console.error('Element to delete not found:', elementId);
    }
}

function handleCanvasClick(e) {
    if (e.target.id === 'canvas') {
        if (state.selectedElement) {
            state.selectedElement.classList.remove('selected');
        }
        state.selectedElement = null;
        const propertiesPanel = document.getElementById('properties-panel');
        if (propertiesPanel) {
            propertiesPanel.classList.remove('active');
        } else {
            console.error('Properties panel element not found');
        }
    }
}

function updateHistoryPanel() {
    // Implement if you have a history panel in your UI
    console.log('Updating history panel...');
}

function showProperties() {
    console.log('Showing properties...');
    const propertiesPanel = document.getElementById('properties-panel');
    if (propertiesPanel) {
        propertiesPanel.classList.add('active');
        if (state.selectedElement) {
            const type = state.selectedElement.dataset.type;
            const styles = window.getComputedStyle(state.selectedElement);
            
            document.getElementById('element-width').value = styles.width;
            document.getElementById('element-height').value = styles.height;
            document.getElementById('element-bgcolor').value = rgb2hex(styles.backgroundColor);
            document.getElementById('element-text').value = getElementText(state.selectedElement);
            document.getElementById('element-font-size').value = styles.fontSize;
            document.getElementById('element-font-color').value = rgb2hex(styles.color);
        }
    } else {
        console.error('Properties panel element not found');
    }
}

function getElementText(element) {
    const editableElements = element.querySelectorAll('[contenteditable="true"]');
    if (editableElements.length > 0) {
        return Array.from(editableElements).map(el => el.textContent).join('\n');
    } else {
        return element.textContent;
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
    console.log('Generating HTML code...');
    const canvas = document.getElementById('canvas');
    let htmlCode = `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Generated Website</title>\n    <style>\n`;
    
    // Add CSS
    htmlCode += generateCSS();
    
    htmlCode += `    </style>\n</head>\n<body>\n`;
    
    // Add canvas content
    htmlCode += canvas.innerHTML;
    
    // Add JavaScript
    htmlCode += `\n    <script>\n`;
    htmlCode += generateJavaScript();
    htmlCode += `    </script>\n`;
    
    htmlCode += `</body>\n</html>`;
    
    return htmlCode;
}

function generateCSS() {
    console.log('Generating CSS...');
    let css = `
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .canvas-element {
            position: absolute;
        }
        .element-controls {
            display: none;
        }
    `;
    
    // Add specific styles for each element
    state.elements.forEach(el => {
        css += `
        #${el.id} {
            ${el.styles}
        }
        `;
    });
    
    return css;
}

function generateJavaScript() {
    console.log('Generating JavaScript...');
    let js = `
        // Add any necessary JavaScript here
        console.log('Website loaded');
    `;
    
    // Add specific scripts for interactive elements
    state.elements.forEach(el => {
        if (el.type === 'countdown') {
            js += `
            // Countdown timer
            function startCountdown(duration, display) {
                var timer = duration, minutes, seconds;
                setInterval(function () {
                    minutes = parseInt(timer / 60, 10);
                    seconds = parseInt(timer % 60, 10);

                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;

                    display.textContent = minutes + ":" + seconds;

                    if (--timer < 0) {
                        timer = duration;
                    }
                }, 1000);
            }

            window.onload = function () {
                var tenMinutes = 60 * 10,
                    display = document.querySelector('#countdown-timer');
                startCountdown(tenMinutes, display);
            };
            `;
        }
        // Add more element-specific JavaScript here
    });
    
    return js;
}

// Updated function to toggle code view
function toggleCodeView() {
    console.log('Toggling code view...');
    const codeViewOverlay = document.getElementById('code-view-overlay');
    const generatedCode = document.getElementById('generated-code');
    
    if (codeViewOverlay && generatedCode) {
        if (codeViewOverlay.style.display === 'none') {const htmlCode = generateHTMLCode();
            const cssCode = generateCSS();
            const jsCode = generateJavaScript();

            generatedCode.textContent = htmlCode;
            generatedCode.className = 'language-html';
            Prism.highlightElement(generatedCode);

            codeViewOverlay.style.display = 'block';

            // Add event listeners to code tabs
            document.querySelectorAll('.code-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    switch (tab.dataset.lang) {
                        case 'html':
                            generatedCode.textContent = htmlCode;
                            generatedCode.className = 'language-html';
                            break;
                        case 'css':
                            generatedCode.textContent = cssCode;
                            generatedCode.className = 'language-css';
                            break;
                        case 'js':
                            generatedCode.textContent = jsCode;
                            generatedCode.className = 'language-javascript';
                            break;
                    }
                    Prism.highlightElement(generatedCode);
                });
            });
        } else {
            codeViewOverlay.style.display = 'none';
        }
    } else {
        console.error('Code view overlay or generated code element not found');
    }
}

// Modal functionality
function showModal(title, message) {
    console.log('Showing modal:', title);
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (modalOverlay && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.textContent = message;
        modalOverlay.style.display = 'flex';
    } else {
        console.error('Modal elements not found');
    }
}

function closeModal() {
    console.log('Closing modal');
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    } else {
        console.error('Modal overlay element not found');
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
window.saveDesign = saveDesign;
window.duplicateElement = duplicateElement;
window.deleteElement = deleteElement;
window.toggleCodeView = toggleCodeView;
window.showModal = showModal;
window.closeModal = closeModal;

// Error handling
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Unhandled error:', message, 'at', source, 'line', lineno, 'column', colno);
    showModal('Error', 'An unexpected error occurred. Please check the console for more details.');
    return true;
};

// Add elements to the sidebar
function populateSidebar() {
    console.log('Populating sidebar...');
    const elementGrid = document.querySelector('.element-grid');
    if (elementGrid) {
        const elements = [
            { type: 'heading', icon: 'fa-heading', label: 'Heading' },
            { type: 'text', icon: 'fa-paragraph', label: 'Text' },
            { type: 'button', icon: 'fa-square', label: 'Button' },
            { type: 'image', icon: 'fa-image', label: 'Image' },
            // Add more elements here
        ];

        elements.forEach(el => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'element';
            elementDiv.draggable = true;
            elementDiv.dataset.type = el.type;
            elementDiv.innerHTML = `
                <i class="fas ${el.icon}"></i>
                <span>${el.label}</span>
            `;
            elementDiv.addEventListener('dragstart', handleDragStart);
            elementGrid.appendChild(elementDiv);
        });
    } else {
        console.error('Element grid not found in sidebar');
    }
}

// Call populateSidebar after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    initBuilder();
    populateSidebar();
});
