/**
 * Tokenizer module
 * Handles token counting functionality
 */

import { userInput, inputTokenCount } from './domElements.js';
import { totalTokens, contextWindowSize } from './state.js';

// Initialize tokenizer
export async function initTokenizer() {
    try {
        // Use a simpler approach for token counting
        // This is an approximation - GPT models use about 4 characters per token on average
        updateInputTokenCount();
    } catch (error) {
        console.error('Failed to initialize tokenizer:', error);
        alert('Failed to initialize tokenizer. Some features may not work correctly.');
    }
}

// Count tokens in a string
export function countTokens(text) {
    if (!text) return 0;
    // Simple approximation: ~4 characters per token for English text
    // This is not perfect but works as a reasonable estimate
    return Math.ceil(text.length / 4);
}

// Update token count for user input
export function updateInputTokenCount() {
    const text = userInput.value;
    const tokens = countTokens(text);
    inputTokenCount.textContent = `${tokens} tokens`;
}
