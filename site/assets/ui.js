(function() {
    const translations = {
        sv: {
            title: "Taren",
            tagline: "Något nytt tar form.",
            games: "Spel",
            experiments: "Experiment",
            sketches: "Skisser",
            texts: "Texter",
            ongoing: "Pågår",
            music: "Musik",
            video: "Video",
            construction: "Under konstruktion.",
            back: "Tillbaka",
            theme: "Tema",
            lang: "SV"
        },
        en: {
            title: "Taren",
            tagline: "Something new takes shape.",
            games: "Games",
            experiments: "Experiments",
            sketches: "Sketches",
            texts: "Texts",
            ongoing: "Ongoing",
            music: "Music",
            video: "Video",
            construction: "Under construction.",
            back: "Back",
            theme: "Theme",
            lang: "EN"
        }
    };

    let currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    let currentLang = localStorage.getItem('lang') || 'sv';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function applyLang(lang) {
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('lang', lang);
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        
        // Update toggle text
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) langBtn.textContent = translations[lang].lang;
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    }

    function toggleLang() {
        currentLang = currentLang === 'sv' ? 'en' : 'sv';
        applyLang(currentLang);
    }

    function initUI() {
        if (!document.getElementById('ui-controls')) {
            const controls = document.createElement('div');
            controls.id = 'ui-controls';
            controls.innerHTML = `
                <button id="theme-toggle" class="ui-btn" aria-label="Toggle Theme">◐</button>
                <span class="ui-separator">/</span>
                <button id="lang-toggle" class="ui-btn" aria-label="Toggle Language"></button>
            `;
            document.body.appendChild(controls);

            document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
            document.getElementById('lang-toggle').addEventListener('click', toggleLang);
        }

        applyTheme(currentTheme);
        applyLang(currentLang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();
