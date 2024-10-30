import { backend } from 'declarations/backend';

let currentPage = 'home';
let pages = ['home'];
let siteData = {
    home: []
};
let history = [];
let historyIndex = -1;

document.addEventListener('DOMContentLoaded', async () => {
    setupDragAndDrop();
    setupResponsiveControls();
    setupGridToggle();
    setupUndoRedo();
    setupPreviewAndPublish();
    await loadSiteData();
});

function setupDragAndDrop() {
    const draggables = document.querySelectorAll('.element');
    const dropzone = document.getElementById('canvas');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.type);
        });
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text');
        const element = createElement(type);
        element.style.left = `${e.clientX - dropzone.offsetLeft}px`;
        element.style.top = `${e.clientY - dropzone.offsetTop}px`;
        dropzone.appendChild(element);
        updateSiteData();
        addToHistory();
    });
}

function createElement(type) {
    const element = document.createElement('div');
    element.classList.add('canvas-element');
    element.setAttribute('draggable', 'true');
    element.dataset.type = type;

    const content = document.createElement('div');
    content.classList.add('element-content');

    switch (type) {
        case 'heading':
            content.innerHTML = '<h2>Heading</h2>';
            break;
        case 'text':
            content.innerHTML = '<p>Text content</p>';
            break;
        case 'button':
            content.innerHTML = '<button>Button</button>';
            break;
        case 'image':
            content.innerHTML = '<img src="https://via.placeholder.com/150" alt="Placeholder">';
            break;
        // Add more cases for other element types
    }

    element.appendChild(content);

    const controls = document.createElement('div');
    controls.classList.add('element-controls');
    controls.innerHTML = `
        <button class="control-button" onclick="deleteElement(this.parentElement.parentElement)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    element.appendChild(controls);

    element.addEventListener('click', (e) => {
        document.querySelectorAll('.canvas-element').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        showProperties(element);
    });

    return element;
}

function showProperties(element) {
    const propertiesPanel = document.getElementById('properties-panel');
    propertiesPanel.classList.add('active');
    propertiesPanel.innerHTML = `
        <div class="property-group">
            <div class="property-group-title">Element Properties</div>
            <div class="property-row">
                <div class="property-label">Width</div>
                <input type="text" class="property-input" value="${element.style.width}" onchange="updateElementProperty(this, 'width')">
            </div>
            <div class="property-row">
                <div class="property-label">Height</div>
                <input type="text" class="property-input" value="${element.style.height}" onchange="updateElementProperty(this, 'height')">
            </div>
            <!-- Add more properties as needed -->
        </div>
    `;
}

function updateElementProperty(input, property) {
    const selectedElement = document.querySelector('.canvas-element.selected');
    if (selectedElement) {
        selectedElement.style[property] = input.value;
        updateSiteData();
        addToHistory();
    }
}

function deleteElement(element) {
    element.remove();
    updateSiteData();
    addToHistory();
}

function setupResponsiveControls() {
    const deviceButtons = document.querySelectorAll('.device-button');
    deviceButtons.forEach(button => {
        button.addEventListener('click', () => {
            deviceButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function setDeviceView(device) {
    const canvas = document.getElementById('canvas');
    canvas.className = device;
}

function setupGridToggle() {
    const gridOverlay = document.querySelector('.grid-overlay');
    let gridActive = false;

    window.toggleGrid = () => {
        gridActive = !gridActive;
        gridOverlay.classList.toggle('active', gridActive);
    };
}

function setupUndoRedo() {
    window.undo = () => {
        if (historyIndex > 0) {
            historyIndex--;
            loadHistoryState();
        }
    };

    window.redo = () => {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            loadHistoryState();
        }
    };
}

function addToHistory() {
    const currentState = JSON.parse(JSON.stringify(siteData));
    history = history.slice(0, historyIndex + 1);
    history.push(currentState);
    historyIndex = history.length - 1;
}

function loadHistoryState() {
    siteData = JSON.parse(JSON.stringify(history[historyIndex]));
    renderCanvas();
}

function renderCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';
    siteData[currentPage].forEach(elementData => {
        const element = createElement(elementData.type);
        element.style.left = elementData.left;
        element.style.top = elementData.top;
        element.style.width = elementData.width;
        element.style.height = elementData.height;
        element.querySelector('.element-content').innerHTML = elementData.content;
        canvas.appendChild(element);
    });
}

function updateSiteData() {
    const canvas = document.getElementById('canvas');
    siteData[currentPage] = Array.from(canvas.querySelectorAll('.canvas-element')).map(element => ({
        type: element.dataset.type,
        left: element.style.left,
        top: element.style.top,
        width: element.style.width,
        height: element.style.height,
        content: element.querySelector('.element-content').innerHTML
    }));
}

function setupPreviewAndPublish() {
    window.previewDesign = () => {
        // Implement preview functionality
        console.log('Preview functionality to be implemented');
    };

    window.publishDesign = async () => {
        try {
            await backend.publishSite({ siteData, pages });
            alert('Site published successfully!');
        } catch (error) {
            console.error('Error publishing site:', error);
            alert('Error publishing site. Please try again.');
        }
    };
}

async function loadSiteData() {
    try {
        const loadedData = await backend.getSiteData();
        if (loadedData) {
            siteData = loadedData.siteData;
            pages = loadedData.pages;
            renderCanvas();
            addToHistory();
        }
    } catch (error) {
        console.error('Error loading site data:', error);
    }
}
