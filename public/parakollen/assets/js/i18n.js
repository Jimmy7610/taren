// i18n.js – Parakollen internationalisation
// Default: Swedish (sv). Persisted in localStorage.pk_lang.

const STRINGS = {
    sv: {
        // Header
        siteName: 'PARAKOLLEN',
        subtitle: 'Milano Cortina 2026',
        lastUpdated: 'Senast uppdaterad',
        refresh: 'Uppdatera',

        // Tabs
        tabIdag: 'Idag',
        tabTabla: 'Tablå',
        tabNyheter: 'Nyheter',
        tabMedaljer: 'Medaljer',
        tabResultat: 'Resultat',
        tabSverige: 'Sverige',

        // Filters
        filterDate: 'Datum',
        filterSport: 'Sport',
        filterSportAll: 'Alla sporter',
        filterDiscipline: 'Gren',
        filterDisciplineAll: 'Alla grenar',
        filterSearch: 'Sök...',
        filterSweOnly: 'Endast Sverige',
        clearFilters: 'Rensa filter',

        // Sections
        sectionNext: 'Nästa',
        sectionLive: 'Live nu',
        sectionLater: 'Senare idag',
        sectionSwedish: 'Svenska starter',
        sectionLatestNews: 'Senaste nytt',
        sectionSwedishResults: 'Svenska resultat',

        // Status
        statusLive: 'Live',
        statusUpcoming: 'Kommande',
        statusFinished: 'Avgjort',
        statusCancelled: 'Inställt',
        statusDelayed: 'Försenad',

        // Medals
        medalRank: '#',
        medalNation: 'Land',
        medalGold: 'Guld',
        medalSilver: 'Silver',
        medalBronze: 'Brons',
        medalTotal: 'Totalt',

        // News
        newsSources: 'Källor',

        // Empty & error
        emptyTitle: 'Inga resultat',
        emptyText: 'Det finns inga händelser som matchar dina filter.',
        emptyToday: 'Inga tävlingar idag.',
        emptyNews: 'Inga nyheter just nu.',
        errorTitle: 'Kunde inte ladda data',
        errorText: 'Visar senast cachad data. Försöker igen automatiskt.',

        // Countdown
        countdownTitle: 'Paralympics Milano Cortina 2026',
        countdownSubtitle: 'Tävlingarna startar snart!',
        countdownDays: 'dagar',
        countdownHours: 'timmar',
        countdownMinutes: 'minuter',
        countdownSeconds: 'sekunder',
        countdownStarted: 'Tävlingarna pågår!',

        // Footer
        footerCredit: 'Skapad av',
        footerPowered: 'Data från',

        // Theme
        themeDark: 'Mörkt',
        themeLight: 'Ljust',

        // Months
        months: ['januari', 'februari', 'mars', 'april', 'maj', 'juni',
            'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
        monthsShort: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun',
            'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
        weekdays: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
        weekdaysShort: ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'],
    },

    en: {
        siteName: 'PARAKOLLEN',
        subtitle: 'Milano Cortina 2026',
        lastUpdated: 'Last updated',
        refresh: 'Refresh',

        tabIdag: 'Today',
        tabTabla: 'Schedule',
        tabNyheter: 'News',
        tabMedaljer: 'Medals',
        tabResultat: 'Results',
        tabSverige: 'Sweden',

        filterDate: 'Date',
        filterSport: 'Sport',
        filterSportAll: 'All sports',
        filterDiscipline: 'Discipline',
        filterDisciplineAll: 'All disciplines',
        filterSearch: 'Search...',
        filterSweOnly: 'Sweden only',
        clearFilters: 'Clear filters',

        sectionNext: 'Next up',
        sectionLive: 'Live now',
        sectionLater: 'Later today',
        sectionSwedish: 'Swedish starts',
        sectionLatestNews: 'Latest news',
        sectionSwedishResults: 'Swedish results',

        statusLive: 'Live',
        statusUpcoming: 'Upcoming',
        statusFinished: 'Finished',
        statusCancelled: 'Cancelled',
        statusDelayed: 'Delayed',

        medalRank: '#',
        medalNation: 'Nation',
        medalGold: 'Gold',
        medalSilver: 'Silver',
        medalBronze: 'Bronze',
        medalTotal: 'Total',

        newsSources: 'Sources',

        emptyTitle: 'No results',
        emptyText: 'No events match your filters.',
        emptyToday: 'No competitions today.',
        emptyNews: 'No news at the moment.',
        errorTitle: 'Could not load data',
        errorText: 'Showing last cached data. Retrying automatically.',

        countdownTitle: 'Paralympics Milano Cortina 2026',
        countdownSubtitle: 'The games start soon!',
        countdownDays: 'days',
        countdownHours: 'hours',
        countdownMinutes: 'minutes',
        countdownSeconds: 'seconds',
        countdownStarted: 'The games are underway!',

        footerCredit: 'Created by',
        footerPowered: 'Data from',

        themeDark: 'Dark',
        themeLight: 'Light',

        months: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
};

const PK_LANG_KEY = 'pk_lang';
let currentLang = localStorage.getItem(PK_LANG_KEY) || 'sv';

function t(key) {
    const dict = STRINGS[currentLang] || STRINGS.sv;
    return dict[key] !== undefined ? dict[key] : key;
}

function getLang() { return currentLang; }

function setLang(lang) {
    if (!STRINGS[lang]) return;
    currentLang = lang;
    localStorage.setItem(PK_LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent('pk:langchange', { detail: { lang } }));
}

function toggleLang() {
    setLang(currentLang === 'sv' ? 'en' : 'sv');
}

export { t, getLang, setLang, toggleLang, STRINGS };
