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
        case 'social-icons':
            element.innerHTML += '<div class="social-icons"><i class="fab fa-facebook"></i><i class="fab fa-twitter"></i><i class="fab fa-instagram"></i></div>';
            break;
        case 'map':
            element.innerHTML += '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes+Square!5e0!3m2!1sen!2sus!4v1510579767785" width="400" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
            break;
        case 'countdown':
            element.innerHTML += '<div class="countdown">Countdown: <span id="countdown-timer">10:00</span></div>';
            break;
        case 'pricing-table':
            element.innerHTML += `
                <div class="pricing-table">
                    <div class="pricing-plan">
                        <h3>Basic</h3>
                        <p class="price">$9.99/mo</p>
                        <ul>
                            <li>Feature 1</li>
                            <li>Feature 2</li>
                            <li>Feature 3</li>
                        </ul>
                        <button>Choose Plan</button>
                    </div>
                </div>
            `;
            break;
        case 'carousel':
            element.innerHTML += `
                <div class="carousel">
                    <div class="carousel-item active">Slide 1</div>
                    <div class="carousel-item">Slide 2</div>
                    <div class="carousel-item">Slide 3</div>
                    <button class="carousel-prev">Previous</button>
                    <button class="carousel-next">Next</button>
                </div>
            `;
            break;
        case 'accordion':
            element.innerHTML += `
                <div class="accordion">
                    <div class="accordion-item">
                        <h3 class="accordion-header">Section 1</h3>
                        <div class="accordion-content">Content for Section 1</div>
                    </div>
                    <div class="accordion-item">
                        <h3 class="accordion-header">Section 2</h3>
                        <div class="accordion-content">Content for Section 2</div>
                    </div>
                </div>
            `;
            break;
        case 'tabs':
            element.innerHTML += `
                <div class="tabs">
                    <div class="tab-headers">
                        <button class="tab-header active">Tab 1</button>
                        <button class="tab-header">Tab 2</button>
                    </div>
                    <div class="tab-content active">Content for Tab 1</div>
                    <div class="tab-content">Content for Tab 2</div>
                </div>
            `;
            break;
        case 'testimonial':
            element.innerHTML += `
                <div class="testimonial">
                    <p class="testimonial-text">"This is an amazing product!"</p>
                    <p class="testimonial-author">- John Doe</p>
                </div>
            `;
            break;
        case 'progress-bar':
            element.innerHTML += `
                <div class="progress-bar">
                    <div class="progress" style="width: 70%;">70%</div>
                </div>
            `;
            break;
        case 'modal':
            element.innerHTML += `
                <button onclick="openModal('${element.id}')">Open Modal</button>
                <div class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Modal Title</h2>
                        <p>This is the modal content.</p>
                    </div>
                </div>
            `;
            break;
        case 'tooltip':
            element.innerHTML += `
                <span class="tooltip">
                    Hover over me
                    <span class="tooltiptext">This is a tooltip</span>
                </span>
            `;
            break;
        case 'card':
            element.innerHTML += `
                <div class="card">
                    <img src="https://via.placeholder.com/300x200" alt="Card image">
                    <div class="card-content">
                        <h3>Card Title</h3>
                        <p>This is some example content for the card.</p>
                        <button>Learn More</button>
                    </div>
                </div>
            `;
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
        case 'flexbox':
            element.innerHTML += '<div class="flexbox" style="display: flex; justify-content: space-between; width: 300px; height: 100px;"><div>Item 1</div><div>Item 2</div><div>Item 3</div></div>';
            break;
        case 'columns':
            element.innerHTML += '<div class="columns" style="column-count: 3; column-gap: 20px; width: 100%;"><p>Column 1 content</p><p>Column 2 content</p><p>Column 3 content</p></div>';
            break;
        case 'masonry':
            element.innerHTML += `
                <div class="masonry">
                    <div class="masonry-item">Item 1</div>
                    <div class="masonry-item">Item 2</div>
                    <div class="masonry-item">Item 3</div>
                    <div class="masonry-item">Item 4</div>
                </div>
            `;
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
    const propertiesContent = document.getElementById('properties-content');
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
    state.deviceView = device;
    const canvas = document.getElementById('canvas');
    const canvasContainer = document.getElementById('canvas-container');
    if (canvas) {
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
        showModal('Design Saved', 'Your design has been saved successfully!');
    } catch (error) {
        console.error('Error saving design:', error);
        showModal('Error', 'There was an error saving your design. Please try again.');
    }
}

async function loadSavedDesign() {
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
        } else if (el.type === 'carousel') {
            js += `
            // Carousel functionality
            function initCarousel() {
                const carousels = document.querySelectorAll('.carousel');
                carousels.forEach(carousel => {
                    const items = carousel.querySelectorAll('.carousel-item');
                    const prevBtn = carousel.querySelector('.carousel-prev');
                    const nextBtn = carousel.querySelector('.carousel-next');
                    let currentIndex = 0;

                    function showItem(index) {
                        items.forEach(item => item.classList.remove('active'));
                        items[index].classList.add('active');
                    }

                    prevBtn.addEventListener('click', () => {
                        currentIndex = (currentIndex - 1 + items.length) % items.length;
                        showItem(currentIndex);
                    });

                    nextBtn.addEventListener('click', () => {
                        currentIndex = (currentIndex + 1) % items.length;
                        showItem(currentIndex);
                    });
                });
            }

            window.addEventListener('load', initCarousel);
            `;
        } else if (el.type === 'accordion') {
            js += `
            // Accordion functionality
            function initAccordion() {
                const accordions = document.querySelectorAll('.accordion');
                accordions.forEach(accordion => {
                    const headers = accordion.querySelectorAll('.accordion-header');
                    headers.forEach(header => {
                        header.addEventListener('click', () => {
                            const content = header.nextElementSibling;
                            content.style.display = content.style.display === 'none' ? 'block' : 'none';
                        });
                    });
                });
            }

            window.addEventListener('load', initAccordion);
            `;
        } else if (el.type === 'tabs') {
            js += `
            // Tabs functionality
            function initTabs() {
                const tabsContainers = document.querySelectorAll('.tabs');
                tabsContainers.forEach(container => {
                    const headers = container.querySelectorAll('.tab-header');
                    const contents = container.querySelectorAll('.tab-content');

                    headers.forEach((header, index) => {
                        header.addEventListener('click', () => {
                            headers.forEach(h => h.classList.remove('active'));
                            contents.forEach(c => c.classList.remove('active'));
                            header.classList.add('active');
                            contents[index].classList.add('active');
                        });
                    });
                });
            }

            window.addEventListener('load', initTabs);
            `;
        }
    });
    
    return js;
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

// Modal functionality
function showModal(title, message) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    modalBody.textContent = message;
    modalOverlay.style.display = 'flex';
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.style.display = 'none';
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
