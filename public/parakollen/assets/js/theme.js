// theme.js – Parakollen theme management
// Default: dark. Persisted in localStorage.pk_theme.

const PK_THEME_KEY = 'pk_theme';
let currentTheme = localStorage.getItem(PK_THEME_KEY) || 'dark';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const metaColor = document.querySelector('meta[name="theme-color"]');
    if (metaColor) {
        metaColor.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#fafafa');
    }
}

function getTheme() { return currentTheme; }

function setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    currentTheme = theme;
    localStorage.setItem(PK_THEME_KEY, theme);
    applyTheme(theme);
    document.dispatchEvent(new CustomEvent('pk:themechange', { detail: { theme } }));
}

function toggleTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    applyTheme(currentTheme);
}

export { initTheme, getTheme, setTheme, toggleTheme };
