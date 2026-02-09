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
        langBtns: document.querySelectorAll('.lang-btn'),
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

        // Update Buttons active state
        elements.langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.langVal === state.lang);
        });

        // Update Text
        elements.translatable.forEach(el => {
            const text = el.dataset[state.lang];
            if (text) el.textContent = text;
        });

        localStorage.setItem(STORAGE_KEY_LANG, state.lang);

        // Update page title optionally if needed
        document.title = state.lang === 'sv' ? 'Taren' : 'Taren';
    };

    const toggleTheme = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        updateTheme();
    };

    const handleLangClick = (e) => {
        const newLang = e.currentTarget.dataset.langVal;
        if (newLang !== state.lang) {
            state.lang = newLang;
            updateLang();
        }
    };

    // Initialize
    const init = () => {
        // Event Listeners
        elements.themeBtn.addEventListener('click', toggleTheme);
        elements.langBtns.forEach(btn => btn.addEventListener('click', handleLangClick));

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
