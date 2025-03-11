/**
 * UI module
 * Handles UI-related functionality
 */

import { chatMessages, tokenProgressBar, tokenCountDisplay } from './domElements.js';
import { totalTokens, contextWindowSize } from './state.js';

// Update the token progress bar
export function updateTokenProgressBar() {
    const percentage = Math.min((totalTokens / contextWindowSize) * 100, 100);
    tokenProgressBar.style.width = `${percentage}%`;
    tokenCountDisplay.textContent = `${totalTokens}/${contextWindowSize} tokens (${Math.round(percentage)}%)`;
    
    // Change color based on usage
    if (percentage > 90) {
        tokenProgressBar.style.backgroundColor = '#dc3545'; // Red
    } else if (percentage > 75) {
        tokenProgressBar.style.backgroundColor = '#ffc107'; // Yellow
    } else {
        tokenProgressBar.style.backgroundColor = '#4CAF50'; // Green
    }
}

// Add a message to the chat
export function addMessage(role, content, tokenCount, reasoningContent = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    // Add reasoning content first if available
    if (reasoningContent) {
        const reasoningHeader = document.createElement('div');
        reasoningHeader.className = 'reasoning-header';
        reasoningHeader.textContent = 'Thinking Process:';
        messageDiv.appendChild(reasoningHeader);
        
        const reasoningDiv = document.createElement('div');
        reasoningDiv.className = 'reasoning-content';
        reasoningDiv.textContent = reasoningContent;
        messageDiv.appendChild(reasoningDiv);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    // Use marked.js to render markdown if it's available
    if (window.marked && role === 'assistant') {
        contentDiv.innerHTML = marked.parse(content);
    } else {
        contentDiv.textContent = content;
    }
    messageDiv.appendChild(contentDiv);
    
    // Add token count
    const tokenDiv = document.createElement('div');
    tokenDiv.className = 'message-tokens';
    tokenDiv.textContent = `${tokenCount} tokens`;
    messageDiv.appendChild(tokenDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Create a loading indicator
export function createLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading assistant-message';
    loadingDiv.innerHTML = `
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}
