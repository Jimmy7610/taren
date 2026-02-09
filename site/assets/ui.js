(function () {
    const translations = {
        sv: {
            title: "Taren",
            tagline: "Något nytt tar form.",
            home: {
                subtitle: "Något nytt tar form.",
                games: { label: "Spel", micro: "Prova något litet." },
                experiments: { label: "Experiment", micro: "Peta på kanterna." },
                sketches: { label: "Skisser", micro: "Fragment & former." },
                texts: { label: "Texter", micro: "Noter ur dimman." },
                ongoing: { label: "Pågår", micro: "Tar fortfarande form." }
            },
            construction: "Under konstruktion.",
            back: "Tillbaka",
            theme: "Tema",
            lang: "SV",
            about: "Om",
            about_p1: "Taren är en digital samlingsplats för projekt, utforskningar och tankar.",
            about_p2: "Här navigerar vi genom spel, experiment och skisser som tar form över tid."
        },
        en: {
            title: "Taren",
            tagline: "Something new takes shape.",
            home: {
                subtitle: "Something new takes shape.",
                games: { label: "Games", micro: "Try something small." },
                experiments: { label: "Experiments", micro: "Touch the edges." },
                sketches: { label: "Sketches", micro: "Fragments & shapes." },
                texts: { label: "Texts", micro: "Notes from the fog." },
                ongoing: { label: "Ongoing", micro: "Still forming." }
            },
            construction: "Under construction.",
            back: "Back",
            theme: "Theme",
            lang: "EN",
            about: "About",
            about_p1: "Taren is a digital gathering place for projects, explorations, and thoughts.",
            about_p2: "Here we navigate through games, experiments, and sketches that take shape over time."
        }
    };

    let currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    let currentLang = localStorage.getItem('lang') || 'sv';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme-val') === theme);
        });
    }

    function getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    function applyLang(lang) {
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = getNestedValue(translations[lang], key);
            if (value) {
                el.textContent = value;
            }
        });

        document.querySelectorAll('.lang-pill').forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-lang-val') === lang);
        });
    }

    function toggleTheme(theme) {
        currentTheme = theme;
        applyTheme(currentTheme);
    }

    function toggleLang(lang) {
        currentLang = lang;
        applyLang(currentLang);
    }

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
        if (!document.getElementById('ui-controls-left')) {
            const leftControls = document.createElement('div');
            leftControls.id = 'ui-controls-left';
            leftControls.className = 'pill-container ui-corner-controls';
            leftControls.innerHTML = `
                <div class="lang-pill-group">
                    <button class="lang-pill" data-lang-val="sv" aria-label="Svenska">SV</button>
                    <button class="lang-pill" data-lang-val="en" aria-label="English">EN</button>
                </div>
            `;
            document.body.appendChild(leftControls);

            const rightControls = document.createElement('div');
            rightControls.id = 'ui-controls-right';
            rightControls.className = 'icon-container ui-corner-controls';
            rightControls.innerHTML = `
                <div class="theme-icon-group">
                    <button class="theme-btn" data-theme-val="dark" aria-label="Dark Mode">☾</button>
                    <button class="theme-btn" data-theme-val="light" aria-label="Light Mode">☼</button>
                </div>
            `;
            document.body.appendChild(rightControls);

            document.querySelectorAll('.lang-pill').forEach(btn => {
                btn.addEventListener('click', () => toggleLang(btn.getAttribute('data-lang-val')));
            });
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.addEventListener('click', () => toggleTheme(btn.getAttribute('data-theme-val')));
            });
        }

        // Apply initial states
        applyTheme(currentTheme);
        applyLang(currentLang);
    }

    // Initialize parallax if elements exist
    if (document.querySelector('.parallax')) {
        window.addEventListener('mousemove', handleParallax);
    }

    if (document.readyState === 'loading') {
    } else {
        initUI();
    }
})();
