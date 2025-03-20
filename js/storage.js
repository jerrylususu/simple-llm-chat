/**
 * Storage module
 * Handles localStorage functionality
 */

import { apiEndpointInput, apiKeyInput, modelInput, contextWindowInput, chatMessages } from './domElements.js';
import { messages, totalTokens, contextWindowSize, resetState, updateTotalTokens, setTotalTokens, updateContextWindowSize, setMessages, addMessageToArray } from './state.js';
import { countTokens } from './tokenizer.js';
import { addMessage, updateTokenProgressBar } from './ui.js';

// Save settings to localStorage
export function saveSettings() {
    const settings = {
        apiEndpoint: apiEndpointInput.value,
        apiKey: apiKeyInput.value,
        model: modelInput.value,
        contextWindowSize: contextWindowInput.value
    };
    localStorage.setItem('llm-chat-settings', JSON.stringify(settings));
}

// Clear chat history
export function clearChatHistory() {
    // Clear messages array
    resetState();
    
    // Clear chat messages display
    chatMessages.innerHTML = '';
    
    // Reset token count
    updateTokenProgressBar();
    
    // Clear chat history from localStorage
    localStorage.removeItem('llm-chat-history');
}

// Download chat history as JSON
export function downloadChatHistory() {
    if (messages.length === 0) {
        alert('No chat history to download');
        return;
    }
    
    // Create chat history object with metadata
    const chatHistory = {
        timestamp: new Date().toISOString(),
        settings: {
            apiEndpoint: apiEndpointInput.value,
            model: modelInput.value,
            contextWindowSize: contextWindowSize
        },
        messages: messages
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(chatHistory, null, 2);
    
    // Create blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create filename with current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const defaultFilename = `chat-${year}${month}${day}-${hours}${minutes}${seconds}.json`;
    
    // Prompt user for filename with default value
    const userFilename = prompt('Enter filename for download:', defaultFilename);
    if (!userFilename) return; // User cancelled
    
    // Create download link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = userFilename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Load chat history from JSON file
export function loadChatHistory(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const chatHistory = JSON.parse(e.target.result);
            
            // Validate chat history format
            if (!chatHistory.messages || !Array.isArray(chatHistory.messages)) {
                throw new Error('Invalid chat history format');
            }
            
            // Clear current chat
            clearChatHistory();
            
            // Load settings if available
            if (chatHistory.settings) {
                if (chatHistory.settings.apiEndpoint) {
                    apiEndpointInput.value = chatHistory.settings.apiEndpoint;
                }
                if (chatHistory.settings.model) {
                    modelInput.value = chatHistory.settings.model;
                }
                if (chatHistory.settings.contextWindowSize) {
                    contextWindowInput.value = chatHistory.settings.contextWindowSize;
                    updateContextWindowSize();
                }
                saveSettings();
            }
            
            // Load messages
            setMessages(chatHistory.messages);
            
            // Display messages in chat
            let newTotalTokens = 0;
            
            for (const msg of messages) {
                // If the message has actual token usage data, use it
                let tokenCount;
                if (msg.token_usage && msg.token_usage.completion_tokens && msg.role === 'assistant') {
                    tokenCount = msg.token_usage.completion_tokens;
                } else if (msg.token_usage && msg.token_usage.prompt_tokens && msg.role === 'user') {
                    tokenCount = msg.token_usage.prompt_tokens;
                } else {
                    // Fall back to estimation
                    tokenCount = countTokens(msg.content);
                }
                
                newTotalTokens += tokenCount;
                addMessage(msg.role, msg.content, tokenCount, msg.reasoning_content || null);
            }
            
            // Update token count - prefer the stored totalTokens if available
            setTotalTokens(chatHistory.totalTokens || newTotalTokens);
            updateTokenProgressBar();
            
            // Reset file input
            event.target.value = '';
            
        } catch (error) {
            console.error('Error loading chat history:', error);
            alert(`Error loading chat history: ${error.message}`);
            // Reset file input
            event.target.value = '';
        }
    };
    
    reader.readAsText(file);
}

// Save chat history to localStorage
export function saveChatHistoryToLocalStorage() {
    if (messages.length === 0) return;
    
    // Create chat history object with metadata
    const chatHistory = {
        timestamp: new Date().toISOString(),
        settings: {
            apiEndpoint: apiEndpointInput.value,
            model: modelInput.value,
            contextWindowSize: contextWindowSize
        },
        messages: messages,
        totalTokens: totalTokens
    };
    
    // Save to localStorage
    try {
        localStorage.setItem('llm-chat-history', JSON.stringify(chatHistory));
    } catch (error) {
        console.error('Error saving chat history to localStorage:', error);
        // If localStorage is full, show a warning but don't interrupt the user
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('localStorage quota exceeded. Chat history will not be saved automatically.');
            // Create a small notification that disappears after a few seconds
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = 'Storage limit reached. Chat history will not be saved automatically.';
            document.body.appendChild(notification);
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 5000);
        }
    }
}

// Load chat history from localStorage
export function loadChatHistoryFromLocalStorage() {
    const savedHistory = localStorage.getItem('llm-chat-history');
    if (!savedHistory) return;
    
    try {
        const chatHistory = JSON.parse(savedHistory);
        
        // Validate chat history format
        if (!chatHistory.messages || !Array.isArray(chatHistory.messages)) {
            throw new Error('Invalid chat history format');
        }
        
        // Load settings if available
        if (chatHistory.settings) {
            if (chatHistory.settings.apiEndpoint) {
                apiEndpointInput.value = chatHistory.settings.apiEndpoint;
            }
            if (chatHistory.settings.model) {
                modelInput.value = chatHistory.settings.model;
            }
            if (chatHistory.settings.contextWindowSize) {
                contextWindowInput.value = chatHistory.settings.contextWindowSize;
                updateContextWindowSize();
            }
            saveSettings();
        }
        
        // Load messages
        setMessages(chatHistory.messages);
        
        // Display messages in chat
        let newTotalTokens = 0;
        
        for (const msg of messages) {
            // If the message has actual token usage data, use it
            let tokenCount;
            if (msg.token_usage && msg.token_usage.completion_tokens && msg.role === 'assistant') {
                tokenCount = msg.token_usage.completion_tokens;
            } else if (msg.token_usage && msg.token_usage.prompt_tokens && msg.role === 'user') {
                tokenCount = msg.token_usage.prompt_tokens;
            } else {
                // Fall back to estimation
                tokenCount = countTokens(msg.content);
            }
            
            newTotalTokens += tokenCount;
            addMessage(msg.role, msg.content, tokenCount, msg.reasoning_content || null);
        }
        
        // Update token count - prefer the stored totalTokens if available
        setTotalTokens(chatHistory.totalTokens || newTotalTokens);
        updateTokenProgressBar();
        
    } catch (error) {
        console.error('Error loading chat history from localStorage:', error);
        // If there's an error, clear the corrupted history
        localStorage.removeItem('llm-chat-history');
    }
}
