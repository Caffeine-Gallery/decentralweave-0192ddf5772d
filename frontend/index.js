import { backend } from 'declarations/backend';

let currentPage = 'home';
let pages = ['home'];
let siteData = {
    home: []
};

document.addEventListener('DOMContentLoaded', async () => {
    setupDragAndDrop();
    setupColorPicker();
    setupMediaUpload();
    setupPageManagement();
    setupPreviewAndPublish();
    await loadSiteData();
});

function setupDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const dropzone = document.getElementById('pageContent');

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
        dropzone.appendChild(element);
        updateSiteData();
    });
}

function createElement(type) {
    const element = document.createElement('div');
    element.classList.add('element');
    element.setAttribute('contenteditable', 'true');

    switch (type) {
        case 'header':
            element.innerHTML = '<h2>Header</h2>';
            break;
        case 'paragraph':
            element.innerHTML = '<p>Paragraph text</p>';
            break;
        case 'image':
            element.innerHTML = '<img src="https://via.placeholder.com/150" alt="Placeholder">';
            break;
        case 'button':
            element.innerHTML = '<button class="btn btn-primary">Button</button>';
            break;
    }

    return element;
}

function setupColorPicker() {
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--theme-color', e.target.value);
    });
}

function setupMediaUpload() {
    const mediaUpload = document.getElementById('mediaUpload');
    const mediaLibrary = document.getElementById('mediaLibrary');

    mediaUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageData = e.target.result;
                try {
                    await backend.uploadMedia(file.name, imageData);
                    updateMediaLibrary();
                } catch (error) {
                    console.error('Error uploading media:', error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    });

    async function updateMediaLibrary() {
        const media = await backend.getMediaLibrary();
        mediaLibrary.innerHTML = '';
        media.forEach(item => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(new Blob([item.data]));
            img.alt = item.name;
            img.classList.add('media-item');
            mediaLibrary.appendChild(img);
        });
    }

    updateMediaLibrary();
}

function setupPageManagement() {
    const pageList = document.getElementById('pageList');
    const addPageBtn = document.getElementById('addPageBtn');

    function updatePageList() {
        pageList.innerHTML = '';
        pages.forEach(page => {
            const li = document.createElement('li');
            li.textContent = page;
            li.addEventListener('click', () => switchPage(page));
            pageList.appendChild(li);
        });
    }

    addPageBtn.addEventListener('click', () => {
        const pageName = prompt('Enter page name:');
        if (pageName && !pages.includes(pageName)) {
            pages.push(pageName);
            siteData[pageName] = [];
            updatePageList();
            switchPage(pageName);
        }
    });

    updatePageList();
}

function switchPage(pageName) {
    currentPage = pageName;
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = '';
    siteData[currentPage].forEach(element => {
        pageContent.appendChild(createElementFromData(element));
    });
}

function createElementFromData(data) {
    const element = document.createElement('div');
    element.classList.add('element');
    element.setAttribute('contenteditable', 'true');
    element.innerHTML = data.content;
    return element;
}

function updateSiteData() {
    const pageContent = document.getElementById('pageContent');
    siteData[currentPage] = Array.from(pageContent.children).map(element => ({
        type_: element.dataset.type,
        content: element.innerHTML
    }));
}

async function loadSiteData() {
    try {
        const loadedData = await backend.getSiteData();
        if (loadedData) {
            siteData = Object.fromEntries(loadedData.siteData);
            pages = loadedData.pages;
            setupPageManagement();
            switchPage(currentPage);
        }
    } catch (error) {
        console.error('Error loading site data:', error);
    }
}

function setupPreviewAndPublish() {
    const previewBtn = document.getElementById('previewBtn');
    const publishBtn = document.getElementById('publishBtn');
    const previewModal = document.getElementById('previewModal');
    const previewFrame = document.getElementById('previewFrame');
    const closeBtn = document.querySelector('.close');

    previewBtn.addEventListener('click', () => {
        previewFrame.srcdoc = generatePreviewHTML();
        previewModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });

    publishBtn.addEventListener('click', async () => {
        try {
            const sharedSiteData = {
                siteData: Object.entries(siteData),
                pages: pages
            };
            await backend.publishSite(sharedSiteData);
            alert('Site published successfully!');
        } catch (error) {
            console.error('Error publishing site:', error);
            alert('Error publishing site. Please try again.');
        }
    });
}

function generatePreviewHTML() {
    let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Site Preview</title>
            <style>
                :root {
                    --theme-color: ${document.documentElement.style.getPropertyValue('--theme-color')};
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .element {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
    `;

    pages.forEach(page => {
        html += `<h1>${page}</h1>`;
        siteData[page].forEach(element => {
            html += `<div class="element">${element.content}</div>`;
        });
    });

    html += `
            </div>
        </body>
        </html>
    `;

    return html;
}
