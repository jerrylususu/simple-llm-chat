/**
 * Chat Editor module
 * Handles editing chat history in Monaco editor
 */

import { messages, setMessages } from './state.js';
import { chatMessages } from './domElements.js';
import { saveChatHistoryToLocalStorage } from './storage.js';
import { addMessage } from './ui.js';
import { countTokens } from './tokenizer.js';

let chatEditor = null;

// Initialize Monaco editor for chat editing
export function initChatEditor() {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        chatEditor = monaco.editor.create(document.getElementById('chat-editor'), {
            value: '',
            language: 'json',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible'
            }
        });
    });
}

// Show edit chat modal with current chat history
export function showEditChatModal() {
    const modal = document.getElementById('edit-chat-modal');
    modal.style.display = 'flex';  // Changed from 'block' to 'flex' to match modal styling
    
    // Format chat history as pretty JSON
    const chatJson = JSON.stringify(messages, null, 2);
    
    // Set editor content
    if (chatEditor) {
        chatEditor.setValue(chatJson);
    }
}

// Save edited chat history
export function saveEditedChat() {
    try {
        // Get edited content
        const editedContent = chatEditor.getValue();
        
        // Parse JSON to validate
        const editedMessages = JSON.parse(editedContent);
        
        // Validate message format
        if (!Array.isArray(editedMessages)) {
            throw new Error('Chat history must be an array');
        }
        
        for (const msg of editedMessages) {
            if (!msg.role || !msg.content) {
                throw new Error('Each message must have "role" and "content" properties');
            }
            if (!['user', 'assistant', 'system'].includes(msg.role)) {
                throw new Error('Message role must be "user", "assistant", or "system"');
            }
        }
        
        // Clear chat messages from UI
        while (chatMessages.firstChild) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
        
        // Update messages state
        setMessages(editedMessages);
        
        // Save to local storage
        saveChatHistoryToLocalStorage();
        
        // Close modal
        hideEditChatModal();
        
        // Refresh chat display by re-adding all messages
        editedMessages.forEach(msg => {
            const tokenCount = countTokens(msg.content);
            addMessage(msg.role, msg.content, tokenCount, msg.reasoning_content);
        });
        
    } catch (error) {
        alert('Error saving chat: ' + error.message);
    }
}

// Hide edit chat modal
export function hideEditChatModal() {
    const modal = document.getElementById('edit-chat-modal');
    modal.style.display = 'none';
}

// Event listeners
document.getElementById('edit-chat-btn').addEventListener('click', showEditChatModal);
document.getElementById('edit-chat-modal-save').addEventListener('click', saveEditedChat);
document.getElementById('edit-chat-modal-cancel').addEventListener('click', hideEditChatModal);

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', initChatEditor);
