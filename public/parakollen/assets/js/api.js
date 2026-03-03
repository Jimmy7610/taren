// api.js – Parakollen API client with auto-refresh
// Fetches from /parakollen/api/* endpoints.

const API_BASE = '/parakollen/api';
const REFRESH_INTERVAL = 300_000; // 5 minutes
const FALLBACK_PATH = '/parakollen/assets/data/fallback.json';

let refreshTimer = null;
let lastUpdated = null;
let listeners = [];
let paused = false;
let activeTab = null;
let fallbackData = null;

function onDataUpdate(callback) {
    listeners.push(callback);
    return () => { listeners = listeners.filter(l => l !== callback); };
}

function notifyListeners(endpoint, data) {
    for (const fn of listeners) {
        try { fn(endpoint, data); } catch (e) { console.error('[pk:api] listener error', e); }
    }
}

async function fetchAPI(endpoint, params = {}) {
    const url = new URL(API_BASE + '/' + endpoint, window.location.origin);
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }

    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (json.meta && json.meta.lastUpdated) {
            lastUpdated = json.meta.lastUpdated;
            updateLastUpdatedUI();
        }

        return json;
    } catch (err) {
        console.warn(`[pk:api] ${endpoint} failed, using fallback`, err);
        return getFallback(endpoint);
    }
}

async function getFallback(endpoint) {
    if (!fallbackData) {
        try {
            const res = await fetch(FALLBACK_PATH);
            if (res.ok) fallbackData = await res.json();
        } catch { /* noop */ }
    }
    if (fallbackData && fallbackData[endpoint]) {
        return {
            meta: { lastUpdated: fallbackData.meta?.lastUpdated || new Date().toISOString(), error: true, sources: [] },
            data: fallbackData[endpoint],
        };
    }
    return {
        meta: { lastUpdated: new Date().toISOString(), error: true, sources: [] },
        data: null,
    };
}

function updateLastUpdatedUI() {
    const el = document.getElementById('pk-last-updated');
    if (!el || !lastUpdated) return;
    const d = new Date(lastUpdated);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    el.textContent = `${hh}:${mm}`;
}

function getLastUpdated() { return lastUpdated; }

function setActiveTab(tab) {
    activeTab = tab;
}

function startAutoRefresh(refreshFn) {
    stopAutoRefresh();
    refreshTimer = setInterval(() => {
        if (!paused) refreshFn();
    }, REFRESH_INTERVAL);

    document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
        if (!document.hidden) refreshFn(); // refresh on return
    });
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

async function manualRefresh(refreshFn) {
    const btn = document.getElementById('pk-refresh-btn');
    if (btn) btn.classList.add('spinning');
    try {
        await refreshFn();
    } finally {
        if (btn) setTimeout(() => btn.classList.remove('spinning'), 400);
    }
}

export {
    fetchAPI, onDataUpdate, notifyListeners,
    getLastUpdated, setActiveTab,
    startAutoRefresh, stopAutoRefresh, manualRefresh,
};
