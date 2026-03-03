// utils.js – Parakollen shared utilities

import { t, getLang } from './i18n.js';

const TZ = 'Europe/Stockholm';

function formatTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: TZ, hour12: false });
}

function formatDateHuman(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    // Use Stockholm timezone for day and month extraction
    const parts = stockholmParts(d);
    const months = t('months');
    const month = months[parts.month - 1];
    return `${parts.day} ${month}`;
}

function formatDateYMD(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    // Use Stockholm timezone for YYYY-MM-DD derivation
    const parts = stockholmParts(d);
    return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function todayYMD() {
    return formatDateYMD(new Date());
}

function getTimeBlock(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'morning';
    // Use Stockholm timezone for time block grouping
    const h = stockholmParts(d).hour;
    if (h < 10) return 'morning';
    if (h < 14) return 'midday';
    if (h < 18) return 'afternoon';
    return 'evening';
}

function timeBlockLabel(block) {
    const labels = {
        sv: { morning: 'Förmiddag', midday: 'Mitt på dagen', afternoon: 'Eftermiddag', evening: 'Kväll' },
        en: { morning: 'Morning', midday: 'Midday', afternoon: 'Afternoon', evening: 'Evening' },
    };
    return (labels[getLang()] || labels.sv)[block] || block;
}

function groupBy(arr, keyFn) {
    const map = new Map();
    for (const item of arr) {
        const key = keyFn(item);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
    }
    return map;
}

function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

function statusBadge(status) {
    const map = {
        live: { cls: 'pk-status-live', label: t('statusLive'), pulse: true },
        upcoming: { cls: 'pk-status-upcoming', label: t('statusUpcoming') },
        finished: { cls: 'pk-status-finished', label: t('statusFinished') },
        cancelled: { cls: 'pk-status-cancelled', label: t('statusCancelled') },
        delayed: { cls: 'pk-status-upcoming', label: t('statusDelayed') },
    };
    const s = map[status] || map.upcoming;
    const pulse = s.pulse ? '<span class="pk-pulse"></span>' : '';
    return `<span class="pk-status ${s.cls}">${pulse}${s.label}</span>`;
}

function flagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 3) return '';
    const cc2 = IOC_TO_ISO2[countryCode.toUpperCase()];
    if (!cc2) return countryCode;
    return String.fromCodePoint(...[...cc2].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

// Common IOC → ISO 3166-1 alpha-2 mapping (Paralympic nations)
const IOC_TO_ISO2 = {
    SWE: 'SE', NOR: 'NO', FIN: 'FI', DEN: 'DK', GER: 'DE', FRA: 'FR',
    GBR: 'GB', USA: 'US', CAN: 'CA', AUS: 'AU', JPN: 'JP', CHN: 'CN',
    KOR: 'KR', ITA: 'IT', AUT: 'AT', SUI: 'CH', NED: 'NL', RUS: 'RU',
    UKR: 'UA', NZL: 'NZ', BLR: 'BY', CZE: 'CZ', SVK: 'SK', POL: 'PL',
    ESP: 'ES', BRA: 'BR', MEX: 'MX', ARG: 'AR', RSA: 'ZA', IND: 'IN',
    KAZ: 'KZ', SLO: 'SI', CRO: 'HR', BEL: 'BE', ROU: 'RO', BUL: 'BG',
    EST: 'EE', LAT: 'LV', LTU: 'LT', HUN: 'HU', POR: 'PT', IRL: 'IE',
    ISR: 'IL', TUR: 'TR', GRE: 'GR', IRI: 'IR', THA: 'TH', MAS: 'MY',
    SGP: 'SG', PHI: 'PH', INA: 'ID', MON: 'MC', LUX: 'LU', ISL: 'IS',
};

function el(tag, attrs = {}, ...children) {
    const elem = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'className') elem.className = v;
        else if (k === 'innerHTML') elem.innerHTML = v;
        else if (k.startsWith('on')) elem.addEventListener(k.slice(2).toLowerCase(), v);
        else elem.setAttribute(k, v);
    }
    for (const child of children) {
        if (typeof child === 'string') elem.appendChild(document.createTextNode(child));
        else if (child) elem.appendChild(child);
    }
    return elem;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Stockholm timezone part extraction (avoids browser-local timezone)
const _stockholmFmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
    hour12: false,
});

function stockholmParts(d) {
    const parts = _stockholmFmt.formatToParts(d);
    const get = (type) => {
        const p = parts.find(p => p.type === type);
        return p ? parseInt(p.value, 10) : 0;
    };
    return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
}

export {
    formatTime, formatDateHuman, formatDateYMD, todayYMD,
    getTimeBlock, timeBlockLabel, groupBy, debounce,
    statusBadge, flagEmoji, el, escapeHtml
};
