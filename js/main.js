/**
 * Main module
 * Entry point for the application
 */

import * as domElements from './domElements.js';
import { updateContextWindowSize, userInputSaveTimeout, setUserInputSaveTimeout } from './state.js';
import { initTokenizer, updateInputTokenCount } from './tokenizer.js';
import { updateTokenProgressBar } from './ui.js';
import { sendMessage } from './api.js';
import { saveSettings, clearChatHistory, downloadChatHistory, loadChatHistory, loadChatHistoryFromLocalStorage } from './storage.js';
import { initTheme, toggleTheme } from './theme.js';
import { probeModels, initModelProbe } from './modelProbe.js';
import { initHeaders } from './headers.js';

// Initialize the app
async function init() {
    await initTokenizer();
    
    // Initialize theme
    initTheme();
    
    // Initialize model probe functionality
    initModelProbe();

    // Initialize headers functionality
    initHeaders();
    
    // Load settings from localStorage if available
    if (localStorage.getItem('llm-chat-settings')) {
        const settings = JSON.parse(localStorage.getItem('llm-chat-settings'));
        domElements.apiEndpointInput.value = settings.apiEndpoint || domElements.apiEndpointInput.value;
        domElements.apiKeyInput.value = settings.apiKey || '';
        domElements.modelInput.value = settings.model || domElements.modelInput.value;
        
        // Update model dropdown to match the input if possible
        const modelValue = domElements.modelInput.value;
        const matchingOption = Array.from(domElements.modelDropdown.options).find(option => option.value === modelValue);
        if (matchingOption) {
            domElements.modelDropdown.value = modelValue;
        }
        
        domElements.contextWindowInput.value = settings.contextWindowSize || domElements.contextWindowInput.value;
        updateContextWindowSize();
    }
    
    // Update token progress bar after initialization
    updateTokenProgressBar();
    
    // Load chat history from localStorage if available
    loadChatHistoryFromLocalStorage();
    
    // Event listeners
    domElements.userInput.addEventListener('input', (e) => {
        updateInputTokenCount();
        // Save user input to localStorage with debounce
        clearTimeout(userInputSaveTimeout);
        setUserInputSaveTimeout(setTimeout(() => {
            localStorage.setItem('llm-chat-user-input', domElements.userInput.value);
        }, 5000)); // Save every 5 seconds after typing stops
    });
    
    domElements.sendButton.addEventListener('click', sendMessage);
    domElements.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    domElements.contextWindowInput.addEventListener('change', () => {
        updateContextWindowSize();
        updateTokenProgressBar();
        saveSettings();
    });
    
    domElements.apiEndpointInput.addEventListener('change', saveSettings);
    domElements.apiKeyInput.addEventListener('change', saveSettings);
    domElements.modelInput.addEventListener('change', saveSettings);
    
    // Add event listener for probe models button
    if (domElements.probeModelsBtn) {
        domElements.probeModelsBtn.addEventListener('click', probeModels);
    }
    
    // Theme toggle event listener
    if (domElements.themeToggleBtn) {
        domElements.themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // History management event listeners
    if (domElements.clearHistoryBtn) {
        domElements.clearHistoryBtn.addEventListener('click', () => {
            // Show confirmation modal
            domElements.confirmationModal.style.display = 'flex';
        });
    }
    
    if (domElements.modalCancel) {
        domElements.modalCancel.addEventListener('click', () => {
            // Hide confirmation modal
            domElements.confirmationModal.style.display = 'none';
        });
    }
    
    if (domElements.modalConfirm) {
        domElements.modalConfirm.addEventListener('click', () => {
            // Clear chat history
            clearChatHistory();
            // Hide confirmation modal
            domElements.confirmationModal.style.display = 'none';
        });
    }
    
    if (domElements.downloadHistoryBtn) {
        domElements.downloadHistoryBtn.addEventListener('click', downloadChatHistory);
    }
    
    if (domElements.loadHistoryInput) {
        domElements.loadHistoryInput.addEventListener('change', loadChatHistory);
    }
    
    // Restore saved user input if available
    const savedUserInput = localStorage.getItem('llm-chat-user-input');
    if (savedUserInput) {
        domElements.userInput.value = savedUserInput;
        updateInputTokenCount();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
