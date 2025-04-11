// Dark mode functionality
function createThemeToggle() {
    // Check if toggle already exists
    if (document.querySelector('.theme-toggle')) return;

    const header = document.querySelector('header .header-container');
    if (!header) return;

    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.innerHTML = `
        <span id="theme-icon">🌞</span>
        <span id="theme-text">Dark Mode</span>
    `;
    toggle.onclick = toggleDarkMode;

    // Insert after the h1 if it exists, otherwise at the start of header
    const h1 = header.querySelector('h1');
    if (h1) {
        h1.after(toggle);
    } else {
        header.prepend(toggle);
    }
}

function updateThemeUI(isDark) {
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (themeIcon && themeText) {
        if (isDark) {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.textContent = '🌞';
            themeText.textContent = 'Dark Mode';
        }
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    updateThemeUI(true);
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    updateThemeUI(false);
}

function toggleDarkMode() {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Initialize dark mode
function initDarkMode() {
    createThemeToggle();
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

// Apply dark mode when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    initDarkMode();
}
