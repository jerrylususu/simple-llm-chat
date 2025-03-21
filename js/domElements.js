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

// Extra headers elements
export const extraHeadersBtn = document.getElementById('extra-headers-btn');
export const extraHeadersModal = document.getElementById('extra-headers-modal');
export const headersEditorContainer = document.getElementById('headers-editor');
export const headersModalCancel = document.getElementById('headers-modal-cancel');
export const headersModalSave = document.getElementById('headers-modal-save');

// Chat editor elements
export const editChatBtn = document.getElementById('edit-chat-btn');
export const editChatModal = document.getElementById('edit-chat-modal');
export const chatEditorContainer = document.getElementById('chat-editor');
export const editChatModalCancel = document.getElementById('edit-chat-modal-cancel');
export const editChatModalSave = document.getElementById('edit-chat-modal-save');

// Model probing elements
export const probeModelsBtn = document.getElementById('probe-models-btn');
export const modelProbeModal = document.getElementById('model-probe-modal');
export const modelProbeMessage = document.getElementById('model-probe-message');
export const modelProbeClose = document.getElementById('model-probe-close');
