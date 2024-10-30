import { backend } from 'declarations/backend';

// ... (previous code remains unchanged) ...

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

// ... (generateCSS and generateJavaScript functions remain unchanged) ...

// Updated function to toggle code view
function toggleCodeView() {
    const codeViewOverlay = document.getElementById('code-view-overlay');
    const generatedCode = document.getElementById('generated-code');
    
    if (codeViewOverlay.style.display === 'none') {
        const htmlCode = generateHTMLCode();
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
}

// ... (rest of the code remains unchanged) ...

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
