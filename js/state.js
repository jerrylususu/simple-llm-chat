/**
 * State module
 * Manages the application state
 */

// Import DOM elements
import { contextWindowInput } from './domElements.js';

// Application state
export let tokenizer = null;
export let messages = [];
export let totalTokens = 0;
export let contextWindowSize = parseInt(contextWindowInput.value);
export let userInputSaveTimeout = null;

// Update context window size
export function updateContextWindowSize() {
    contextWindowSize = parseInt(contextWindowInput.value);
}

// Reset state
export function resetState() {
    messages = [];
    totalTokens = 0;
    updateContextWindowSize();
}

// Set timeout reference
export function setUserInputSaveTimeout(timeoutRef) {
    userInputSaveTimeout = timeoutRef;
}

// Update total tokens
export function updateTotalTokens(additionalTokens) {
    totalTokens += additionalTokens;
}

// Set total tokens directly
export function setTotalTokens(newTotalTokens) {
    totalTokens = newTotalTokens;
}

// Add a message to the messages array
export function addMessageToArray(message) {
    messages.push(message);
}

// Set messages array
export function setMessages(newMessages) {
    messages = [...newMessages];
}
