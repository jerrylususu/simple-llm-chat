/**
 * API module
 * Handles API communication
 */

import { apiEndpointInput, apiKeyInput, modelInput, userInput, sendButton, chatMessages } from './domElements.js';
import { messages, totalTokens, userInputSaveTimeout, setUserInputSaveTimeout, updateTotalTokens, addMessageToArray, setTotalTokens } from './state.js';
import { countTokens, updateInputTokenCount, extractTokenUsage } from './tokenizer.js';
import { addMessage, createLoadingIndicator, updateTokenProgressBar } from './ui.js';
import { saveChatHistoryToLocalStorage } from './storage.js';

// Send a message to the API
export async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;
    
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter an API key');
        return;
    }
    
    const apiEndpoint = apiEndpointInput.value.trim();
    const model = modelInput.value.trim();
    
    // Count tokens in user message
    const userTokenCount = countTokens(userMessage);
    
    // Add user message to chat
    addMessage('user', userMessage, userTokenCount);
    
    // Add user message to messages array (for API)
    addMessageToArray({
        role: 'user',
        content: userMessage
    });
    
    // Clear input and saved input in localStorage
    userInput.value = '';
    localStorage.removeItem('llm-chat-user-input');
    clearTimeout(userInputSaveTimeout);
    setUserInputSaveTimeout(null);
    updateInputTokenCount();
    
    // Update token count
    updateTotalTokens(userTokenCount);
    updateTokenProgressBar();
    
    // Disable send button
    sendButton.disabled = true;
    
    // Create loading indicator
    const loadingIndicator = createLoadingIndicator();
    
    try {
        // Prepare API request
        const apiMessages = messages.map(msg => {
            // Remove reasoning_content from messages to avoid API errors
            const { reasoning_content, ...rest } = msg;
            return rest;
        });
        
        const requestBody = {
            model: model,
            messages: apiMessages,
            stream: true
        };
        
        // Make API request
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }
        
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        
        // Remove loading indicator
        loadingIndicator.remove();
        
        // Create message elements for streaming
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant-message';
        
        // Create reasoning header and content div first
        let reasoningHeader = document.createElement('div');
        reasoningHeader.className = 'reasoning-header';
        reasoningHeader.textContent = 'Thinking Process:';
        reasoningHeader.style.display = 'none'; // Hide initially
        messageDiv.appendChild(reasoningHeader);
        
        let reasoningDiv = document.createElement('div');
        reasoningDiv.className = 'reasoning-content';
        reasoningDiv.style.display = 'none'; // Hide initially
        messageDiv.appendChild(reasoningDiv);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        messageDiv.appendChild(contentDiv);
        
        const tokenDiv = document.createElement('div');
        tokenDiv.className = 'message-tokens';
        tokenDiv.textContent = '0 tokens';
        messageDiv.appendChild(tokenDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // Variables to collect the complete response
        let assistantMessage = '';
        let reasoningContent = '';
        let assistantTokenCount = 0;
        let actualTokenUsage = null;
        
        // Process the stream
        let buffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
            
            for (const line of lines) {
                if (line.trim() === '') continue;
                
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices[0].delta;
                        
                        // Check for token usage data
                        const tokenUsage = extractTokenUsage(parsed);
                        if (tokenUsage) {
                            actualTokenUsage = tokenUsage;
                            // Update token count display with actual usage
                            assistantTokenCount = tokenUsage.completionTokens;
                            tokenDiv.textContent = `${assistantTokenCount} tokens`;
                        }
                        
                        // Handle content
                        if (delta.content) {
                            assistantMessage += delta.content;
                            // Use marked.js to render markdown
                            if (window.marked) {
                                contentDiv.innerHTML = marked.parse(assistantMessage);
                            } else {
                                contentDiv.textContent = assistantMessage;
                            }
                            
                            // Only estimate tokens if we don't have actual usage data
                            if (!actualTokenUsage) {
                                assistantTokenCount = countTokens(assistantMessage);
                                tokenDiv.textContent = `${assistantTokenCount} tokens`;
                            }
                        }
                        
                        // Handle reasoning content
                        if (delta.reasoning_content) {
                            // Show reasoning header and div if they were hidden
                            if (reasoningHeader.style.display === 'none') {
                                reasoningHeader.style.display = 'block';
                                reasoningDiv.style.display = 'block';
                            }
                            
                            reasoningContent += delta.reasoning_content;
                            reasoningDiv.textContent = reasoningContent;
                        }
                        
                        // Scroll to bottom
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    } catch (error) {
                        console.error('Error parsing stream chunk:', error, line);
                    }
                }
            }
        }
        
        // Process any remaining buffer
        if (buffer.trim() && buffer.startsWith('data: ')) {
            try {
                const data = buffer.slice(6);
                if (data !== '[DONE]') {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices[0].delta;
                    
                    // Check for token usage data in the final chunk
                    const tokenUsage = extractTokenUsage(parsed);
                    if (tokenUsage) {
                        actualTokenUsage = tokenUsage;
                        // Update token count display with actual usage
                        assistantTokenCount = tokenUsage.completionTokens;
                        tokenDiv.textContent = `${assistantTokenCount} tokens`;
                    }
                    
                    // Handle content
                    if (delta.content) {
                        assistantMessage += delta.content;
                        // Use marked.js to render markdown
                        if (window.marked) {
                            contentDiv.innerHTML = marked.parse(assistantMessage);
                        } else {
                            contentDiv.textContent = assistantMessage;
                        }
                        
                        // Only estimate tokens if we don't have actual usage data
                        if (!actualTokenUsage) {
                            assistantTokenCount = countTokens(assistantMessage);
                            tokenDiv.textContent = `${assistantTokenCount} tokens`;
                        }
                    }
                    
                    // Handle reasoning content
                    if (delta.reasoning_content) {
                        // Show reasoning header and div if they were hidden
                        if (reasoningHeader.style.display === 'none') {
                            reasoningHeader.style.display = 'block';
                            reasoningDiv.style.display = 'block';
                        }
                        
                        reasoningContent += delta.reasoning_content;
                        reasoningDiv.textContent = reasoningContent;
                    }
                }
            } catch (error) {
                console.error('Error parsing final chunk:', error);
            }
        }
        
        // If no content was received but we have reasoning, show a placeholder
        if (!assistantMessage && reasoningContent) {
            assistantMessage = "(The model provided only thinking process without a final answer)";
            if (window.marked) {
                contentDiv.innerHTML = marked.parse(assistantMessage);
            } else {
                contentDiv.textContent = assistantMessage;
            }
            assistantTokenCount = countTokens(assistantMessage);
            tokenDiv.textContent = `${assistantTokenCount} tokens`;
        }
        
        // Hide reasoning section if empty
        if (!reasoningContent) {
            reasoningHeader.style.display = 'none';
            reasoningDiv.style.display = 'none';
        }
        
        // Add the complete message to our messages array
        const assistantMessageObj = {
            role: 'assistant',
            content: assistantMessage
        };
        
        // Add reasoning_content if available
        if (reasoningContent) {
            assistantMessageObj.reasoning_content = reasoningContent;
        }
        
        // Add token usage if available
        if (actualTokenUsage) {
            assistantMessageObj.token_usage = {
                prompt_tokens: actualTokenUsage.promptTokens,
                completion_tokens: actualTokenUsage.completionTokens,
                total_tokens: actualTokenUsage.totalTokens
            };
        }
        
        addMessageToArray(assistantMessageObj);
        
        // Update total tokens - use actual total if available, otherwise use estimated
        if (actualTokenUsage) {
            // If we have actual usage, we need to reset the total and add the actual total
            // This is because the user tokens were already added with an estimate
            setTotalTokens(actualTokenUsage.totalTokens);
        } else {
            updateTotalTokens(assistantTokenCount);
        }
        updateTokenProgressBar();
        
        // Save chat history to localStorage
        saveChatHistoryToLocalStorage();
        
    } catch (error) {
        console.error('Error sending message:', error);
        loadingIndicator.remove();
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message system-message';
        errorDiv.textContent = `Error: ${error.message}`;
        chatMessages.appendChild(errorDiv);
    } finally {
        // Re-enable send button
        sendButton.disabled = false;
    }
}
