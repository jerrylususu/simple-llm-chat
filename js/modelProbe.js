/**
 * Model Probe module
 * Handles probing and fetching available models from the API
 */

import { apiEndpointInput, apiKeyInput, modelInput, modelDropdown, modelProbeModal, modelProbeMessage, modelProbeClose } from './domElements.js';
import { saveSettings } from './storage.js';

// Available models cache
let availableModels = [];

// Probe for available models
export async function probeModels() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter an API key');
        return;
    }
    
    const apiEndpoint = apiEndpointInput.value.trim();
    if (!apiEndpoint) {
        alert('Please enter an API endpoint');
        return;
    }
    
    // Extract base URL from the API endpoint
    const endpointUrl = new URL(apiEndpoint);
    const baseUrl = `${endpointUrl.protocol}//${endpointUrl.host}`;
    
    // Show the probing modal
    modelProbeModal.style.display = 'flex';
    modelProbeMessage.textContent = 'Fetching available models...';
    
    try {
        // Make request to the models endpoint
        const response = await fetch(`${baseUrl}/v1/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if the response has the expected structure
        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid response format from models endpoint');
        }
        
        // Store available models
        availableModels = data.data.map(model => model.id);
        
        // Sort models alphabetically
        availableModels.sort();
        
        // Update the modal message
        modelProbeMessage.textContent = `Found ${availableModels.length} models. Dropdown has been updated.`;
        
        // Update the model dropdown
        updateModelDropdown();
        
    } catch (error) {
        console.error('Error probing models:', error);
        modelProbeMessage.textContent = `Error: ${error.message}`;
    }
}

// Update the model dropdown with available models
function updateModelDropdown() {
    // Save the currently selected model
    const currentModel = modelInput.value;
    
    // Clear the dropdown
    modelDropdown.innerHTML = '';
    
    // Add each model to the dropdown
    availableModels.forEach(modelId => {
        const option = document.createElement('option');
        option.value = modelId;
        option.textContent = modelId;
        modelDropdown.appendChild(option);
    });
    
    // Try to select the previously selected model if it exists in the new list
    if (availableModels.includes(currentModel)) {
        modelDropdown.value = currentModel;
    } else if (availableModels.length > 0) {
        // Otherwise select the first model
        modelDropdown.value = availableModels[0];
        // Update the input field to match the dropdown
        modelInput.value = modelDropdown.value;
    }
    
    // Save the settings with the new model selection
    saveSettings();
}

// Initialize model probe functionality
export function initModelProbe() {
    // Sync dropdown selection to input field
    modelDropdown.addEventListener('change', () => {
        modelInput.value = modelDropdown.value;
        saveSettings();
    });
    
    // Add event listener to close the modal
    modelProbeClose.addEventListener('click', () => {
        modelProbeModal.style.display = 'none';
    });
    
    // Close the modal when clicking outside of it
    modelProbeModal.addEventListener('click', (event) => {
        if (event.target === modelProbeModal) {
            modelProbeModal.style.display = 'none';
        }
    });
}
