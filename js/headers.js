/**
 * Headers module
 * Handles extra headers functionality
 */

import { extraHeadersBtn, extraHeadersModal, headersEditorContainer, headersModalCancel, headersModalSave } from './domElements.js';
import { saveSettings } from './storage.js';

let editor = null;
let extraHeaders = {};

// Initialize Monaco Editor
function initMonacoEditor() {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(headersEditorContainer, {
            value: JSON.stringify(extraHeaders, null, 2),
            language: 'json',
            theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            tabSize: 2,
            automaticLayout: true
        });
    });
}

// Initialize headers functionality
export function initHeaders() {
    // Load saved headers from localStorage
    const savedHeaders = localStorage.getItem('llm-chat-extra-headers');
    if (savedHeaders) {
        try {
            extraHeaders = JSON.parse(savedHeaders);
        } catch (error) {
            console.error('Error parsing saved headers:', error);
            extraHeaders = {};
        }
    }

    // Initialize Monaco Editor when headers modal is first opened
    let editorInitialized = false;
    
    extraHeadersBtn.addEventListener('click', () => {
        extraHeadersModal.style.display = 'flex';
        if (!editorInitialized) {
            initMonacoEditor();
            editorInitialized = true;
        } else {
            // Update editor content with current headers
            editor.setValue(JSON.stringify(extraHeaders, null, 2));
        }
    });

    headersModalCancel.addEventListener('click', () => {
        extraHeadersModal.style.display = 'none';
        // Reset editor content to current headers
        if (editor) {
            editor.setValue(JSON.stringify(extraHeaders, null, 2));
        }
    });

    headersModalSave.addEventListener('click', () => {
        if (!editor) return;

        try {
            const headersText = editor.getValue();
            const parsedHeaders = JSON.parse(headersText);

            // Validate that all keys and values are strings
            const isValid = Object.entries(parsedHeaders).every(
                ([key, value]) => typeof key === 'string' && typeof value === 'string'
            );

            if (!isValid) {
                throw new Error('All keys and values must be strings');
            }

            // Save headers
            extraHeaders = parsedHeaders;
            localStorage.setItem('llm-chat-extra-headers', JSON.stringify(extraHeaders));
            extraHeadersModal.style.display = 'none';

        } catch (error) {
            alert(`Invalid headers: ${error.message}`);
        }
    });

    // Update editor theme when system theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme' && editor) {
                const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs';
                monaco.editor.setTheme(theme);
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

// Get current extra headers
export function getExtraHeaders() {
    return extraHeaders;
}
