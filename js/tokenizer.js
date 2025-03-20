/**
 * Tokenizer module
 * Handles token counting functionality
 */

import { userInput, inputTokenCount } from './domElements.js';
import { totalTokens, contextWindowSize } from './state.js';

// Initialize tokenizer
export async function initTokenizer() {
    try {
        // gpt-tokenizer is already loaded from CDN, available as GPTTokenizer_cl100k_base
        updateInputTokenCount();
    } catch (error) {
        console.error('Failed to initialize tokenizer:', error);
        alert('Failed to initialize tokenizer. Some features may not work correctly.');
    }
}

// Count tokens in a string
export function countTokens(text) {
    if (!text) return 0;
    
    try {
        // Try using gpt-tokenizer (cl100k)
        return GPTTokenizer_cl100k_base.encode(text).length;
    } catch (error) {
        // If gpt-tokenizer fails, fall back to length-based count with warning
        console.error('Failed to use gpt-tokenizer, falling back to length-based token count:', error);
        // Simple approximation: ~4 characters per token for English text
        return Math.ceil(text.length / 4);
    }
}

// Update token count for user input
export function updateInputTokenCount() {
    const text = userInput.value;
    const tokens = countTokens(text);
    inputTokenCount.textContent = `${tokens} tokens`;
}

// Extract token usage from API response if available
export function extractTokenUsage(data) {
    // Check if the data contains usage information
    if (data && data.usage) {
        return {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0
        };
    }
    
    // If no usage info, use gpt-tokenizer to count tokens
    if (data && data.choices && data.choices[0]) {
        const promptText = JSON.stringify(data.messages || []); // Assuming messages are stored in data
        const completionText = data.choices[0].message.content || '';
        
        const promptTokens = countTokens(promptText);
        const completionTokens = countTokens(completionText);
        
        return {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens
        };
    }
    
    return null;
}
