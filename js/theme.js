/**
 * Theme module
 * Handles theme switching functionality
 */

// Theme options
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

// Current theme state
let currentTheme = THEMES.AUTO;

// Check for system preference
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

/**
 * Initialize theme based on saved preference or system default
 */
export function initTheme() {
    // Load saved theme preference from localStorage
    const savedTheme = localStorage.getItem('llm-chat-theme');
    
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        currentTheme = savedTheme;
    } else {
        currentTheme = THEMES.AUTO;
    }
    
    // Apply the theme
    applyTheme(currentTheme);
    
    // Update the theme toggle button label
    updateThemeToggleLabel();
    
    // Add event listener for system preference changes
    prefersDarkScheme.addEventListener('change', handleSystemThemeChange);
}

/**
 * Toggle between themes (light -> dark -> auto -> light)
 */
export function toggleTheme() {
    switch (currentTheme) {
        case THEMES.LIGHT:
            setTheme(THEMES.DARK);
            break;
        case THEMES.DARK:
            setTheme(THEMES.AUTO);
            break;
        case THEMES.AUTO:
        default:
            setTheme(THEMES.LIGHT);
            break;
    }
}

/**
 * Set a specific theme
 * @param {string} theme - The theme to set (light, dark, or auto)
 */
export function setTheme(theme) {
    if (!Object.values(THEMES).includes(theme)) {
        console.error(`Invalid theme: ${theme}`);
        return;
    }
    
    currentTheme = theme;
    
    // Save theme preference to localStorage
    localStorage.setItem('llm-chat-theme', theme);
    
    // Apply the theme
    applyTheme(theme);
    
    // Update the theme toggle button label
    updateThemeToggleLabel();
}

/**
 * Apply the selected theme to the document
 * @param {string} theme - The theme to apply
 */
function applyTheme(theme) {
    // Remove any existing theme attributes
    document.documentElement.removeAttribute('data-theme');
    
    if (theme === THEMES.AUTO) {
        // Apply theme based on system preference
        if (prefersDarkScheme.matches) {
            document.documentElement.setAttribute('data-theme', THEMES.DARK);
        } else {
            document.documentElement.setAttribute('data-theme', THEMES.LIGHT);
        }
        document.documentElement.setAttribute('data-theme-mode', THEMES.AUTO);
    } else {
        // Apply the selected theme
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-theme-mode', theme);
    }
}

/**
 * Handle system theme preference changes
 */
function handleSystemThemeChange(e) {
    if (currentTheme === THEMES.AUTO) {
        // Only update if we're in auto mode
        if (e.matches) {
            document.documentElement.setAttribute('data-theme', THEMES.DARK);
        } else {
            document.documentElement.setAttribute('data-theme', THEMES.LIGHT);
        }
    }
}

/**
 * Update the theme toggle button label
 */
function updateThemeToggleLabel() {
    const themeLabel = document.querySelector('.theme-label');
    if (themeLabel) {
        themeLabel.textContent = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
    }
}

// Export theme constants
export { THEMES };
