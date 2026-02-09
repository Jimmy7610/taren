(function () {
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
            lang: "SV",
            about: "Om",
            about_p1: "Taren är en digital samlingsplats för projekt, utforskningar och tankar.",
            about_p2: "Här navigerar vi genom spel, experiment och skisser som tar form över tid.",
            home: "Hem",
            micro_games: "Prova något litet.",
            micro_experiments: "Peta på kanterna.",
            micro_sketches: "Fragment & former.",
            micro_texts: "Noter ur dimman.",
            micro_ongoing: "Tar fortfarande form."
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
            lang: "EN",
            about: "About",
            about_p1: "Taren is a digital gathering place for projects, explorations, and thoughts.",
            about_p2: "Here we navigate through games, experiments, and sketches that take shape over time.",
            home: "Home",
            micro_games: "Try something small.",
            micro_experiments: "Touch the edges.",
            micro_sketches: "Fragments & shapes.",
            micro_texts: "Notes from the fog.",
            micro_ongoing: "Still forming."
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

    // Parallax logic
    function handleParallax(e) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const nodes = document.querySelectorAll('.parallax');
        const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;

        nodes.forEach(node => {
            const depth = node.getAttribute('data-depth') || 10;
            const moveX = x * depth;
            const moveY = y * depth;
            node.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
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

        if (document.querySelector('.parallax')) {
            window.addEventListener('mousemove', handleParallax);
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
