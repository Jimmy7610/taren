const i18n = {
    sv: {
        title: "SPEL",
        "snake-desc": "Ett kontrollerat experiment i rörelse, rytm och återhållsamhet.",
        "snake-cta": "Gå in i experimentet",
        "dormant-label": "Kommer senare",
        "dormant-desc": "Ett vilande experiment som ännu inte har vaknat…"
    },
    en: {
        title: "GAMES",
        "snake-desc": "A controlled experiment in movement, rhythm, and restraint.",
        "snake-cta": "Enter Experiment",
        "dormant-label": "Coming later",
        "dormant-desc": "A dormant experiment yet to be unveiled…"
    }
};

// --- Theme Logic ---
function initTheme() {
    const saved = localStorage.getItem('tarenTheme');
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(theme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tarenTheme', theme);

    // Toggle icons
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// --- language Logic ---
function initLang() {
    const saved = localStorage.getItem('tarenLang') || 'sv';
    setLang(saved);
}

function setLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('tarenLang', lang);

    // Update UI text
    Object.keys(i18n[lang]).forEach(key => {
        const elements = document.querySelectorAll(`[data-i18n="${key}"]`);
        elements.forEach(el => {
            el.textContent = i18n[lang][key];
        });
    });

    // Update toggle button
    const langBtn = document.getElementById('lang-toggle');
    langBtn.textContent = lang === 'sv' ? 'EN' : 'SV';
}

// --- Callbacks ---
document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

document.getElementById('lang-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('lang');
    setLang(current === 'sv' ? 'en' : 'sv');
});

// --- Boot ---
initTheme();
initLang();
