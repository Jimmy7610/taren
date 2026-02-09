(function () {
    // Configuration
    const STORAGE_KEY_THEME = 'taren_theme';
    const STORAGE_KEY_LANG = 'taren_lang';

    // State
    const state = {
        theme: localStorage.getItem(STORAGE_KEY_THEME) ||
            (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
        lang: localStorage.getItem(STORAGE_KEY_LANG) || 'sv'
    };

    // DOM Elements
    const elements = {
        html: document.documentElement,
        themeBtn: document.getElementById('theme-toggle'),
        themeIcon: document.querySelector('.theme-icon'),
        langBtn: document.getElementById('lang-toggle'),
        langText: document.querySelector('.lang-text'),
        translatable: document.querySelectorAll('[data-sv]')
    };

    // Functions
    const updateTheme = () => {
        elements.html.dataset.theme = state.theme;
        elements.themeIcon.textContent = state.theme === 'dark' ? '☾' : '☼';
        localStorage.setItem(STORAGE_KEY_THEME, state.theme);
    };

    const updateLang = () => {
        elements.html.dataset.lang = state.lang;
        elements.langText.textContent = state.lang === 'sv' ? 'EN' : 'SV';

        elements.translatable.forEach(el => {
            const text = el.dataset[state.lang];
            if (text) el.textContent = text;
        });

        localStorage.setItem(STORAGE_KEY_LANG, state.lang);
    };

    const toggleTheme = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        updateTheme();
    };

    const toggleLang = () => {
        state.lang = state.lang === 'sv' ? 'en' : 'sv';
        updateLang();
    };

    // Initialize
    const init = () => {
        // Event Listeners
        elements.themeBtn.addEventListener('click', toggleTheme);
        elements.langBtn.addEventListener('click', toggleLang);

        // Apply initial state
        updateTheme();
        updateLang();
    };

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
