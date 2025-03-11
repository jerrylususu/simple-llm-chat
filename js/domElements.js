/**
 * DOM Elements module
 * Contains references to all DOM elements used in the application
 */

export const apiEndpointInput = document.getElementById('api-endpoint');
export const apiKeyInput = document.getElementById('api-key');
export const modelInput = document.getElementById('model');
export const modelDropdown = document.getElementById('model-dropdown');
export const contextWindowInput = document.getElementById('context-window');
export const tokenProgressBar = document.getElementById('token-progress-bar');
export const tokenCountDisplay = document.getElementById('token-count');
export const chatMessages = document.getElementById('chat-messages');
export const userInput = document.getElementById('user-input');
export const inputTokenCount = document.getElementById('input-token-count');
export const sendButton = document.getElementById('send-button');
export const clearHistoryBtn = document.getElementById('clear-history-btn');
export const downloadHistoryBtn = document.getElementById('download-history-btn');
export const loadHistoryInput = document.getElementById('load-history-input');
export const confirmationModal = document.getElementById('confirmation-modal');
export const modalCancel = document.getElementById('modal-cancel');
export const modalConfirm = document.getElementById('modal-confirm');
export const themeToggleBtn = document.getElementById('theme-toggle');
export const themeLabel = document.querySelector('.theme-label');

// Model probing elements
export const probeModelsBtn = document.getElementById('probe-models-btn');
export const modelProbeModal = document.getElementById('model-probe-modal');
export const modelProbeMessage = document.getElementById('model-probe-message');
export const modelProbeClose = document.getElementById('model-probe-close');
