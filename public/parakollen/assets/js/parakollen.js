// parakollen.js – Main application: hash routing, tab views, filters, rendering
import { t, getLang, toggleLang } from './i18n.js';
import { initTheme, getTheme, toggleTheme } from './theme.js';
import { formatTime, formatDateHuman, formatDateYMD, todayYMD, getTimeBlock, timeBlockLabel, groupBy, debounce, statusBadge, flagEmoji, escapeHtml } from './utils.js';
import { fetchAPI, startAutoRefresh, manualRefresh, setActiveTab } from './api.js';

// ── State ──
const state = {
  tab: 'idag',
  filters: { date: todayYMD(), sport: '', discipline: '', search: '', sweOnly: false },
  cache: {},
  loading: false,
};

const TABS = [
  { id: 'idag', key: 'tabIdag' },
  { id: 'tabla', key: 'tabTabla' },
  { id: 'nyheter', key: 'tabNyheter' },
  { id: 'medaljer', key: 'tabMedaljer' },
  { id: 'resultat', key: 'tabResultat' },
  { id: 'sverige', key: 'tabSverige' },
];

const PARALYMPIC_START = new Date('2026-03-06T10:00:00+01:00');
const PARALYMPIC_END = new Date('2026-03-15T22:00:00+01:00');

// ── Init ──
function init() {
  initTheme();
  renderHeader();
  renderTabs();
  bindRouting();
  bindThemeLang();

  // Listen for lang changes → re-render everything
  document.addEventListener('pk:langchange', () => {
    renderHeader();
    renderTabs();
    navigateToTab(state.tab);
  });

  document.addEventListener('pk:themechange', () => {
    updateThemeToggleUI();
  });

  // Auto-refresh
  startAutoRefresh(() => navigateToTab(state.tab));

  // Initial route
  const hash = window.location.hash.replace('#/', '') || 'idag';
  navigateToTab(hash);
}

// ── Header ──
function renderHeader() {
  const meta = document.getElementById('pk-header-meta');
  if (!meta) return;
  meta.innerHTML = `
    <span class="pk-last-updated">${t('lastUpdated')} <span id="pk-last-updated">--:--</span></span>
    <button class="pk-icon-btn" id="pk-refresh-btn" aria-label="${t('refresh')}" title="${t('refresh')}">
      <svg class="pk-icon" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.636-6.364"/><path d="M21 3v6h-6"/></svg>
    </button>
  `;
  document.getElementById('pk-refresh-btn')?.addEventListener('click', () => {
    manualRefresh(() => navigateToTab(state.tab));
  });
}

function updateThemeToggleUI() {
  const btn = document.getElementById('pk-theme-toggle');
  if (btn) {
    const isDark = getTheme() === 'dark';
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', isDark ? t('themeLight') : t('themeDark'));
  }
}

function bindThemeLang() {
  document.getElementById('pk-theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('pk-lang-toggle')?.addEventListener('click', toggleLang);
  updateThemeToggleUI();
  updateLangToggleUI();
  document.addEventListener('pk:langchange', updateLangToggleUI);
}

function updateLangToggleUI() {
  const btn = document.getElementById('pk-lang-toggle');
  if (btn) {
    btn.textContent = getLang() === 'sv' ? 'EN' : 'SV';
  }
}

// ── Tabs ──
function renderTabs() {
  const container = document.getElementById('pk-tabs');
  if (!container) return;
  container.innerHTML = TABS.map(tab => `
    <button class="pk-tab ${state.tab === tab.id ? 'active' : ''}"
            data-tab="${tab.id}" role="tab"
            aria-selected="${state.tab === tab.id}"
            aria-controls="pk-content">
      ${t(tab.key)}
    </button>
  `).join('');

  container.querySelectorAll('.pk-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      window.location.hash = '#/' + tabId;
    });
  });
}

// ── Routing ──
function bindRouting() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#/', '') || 'idag';
    navigateToTab(hash);
  });
}

function navigateToTab(tabId) {
  if (!TABS.find(t => t.id === tabId)) tabId = 'idag';
  state.tab = tabId;
  setActiveTab(tabId);

  // Update active tab UI
  document.querySelectorAll('.pk-tab').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });

  // Render filters + content
  renderFilters();
  renderView();
}

// ── Filters ──
function renderFilters() {
  const container = document.getElementById('pk-filters');
  if (!container) return;

  const showDate = ['tabla', 'resultat'].includes(state.tab);
  const showSport = ['tabla', 'resultat', 'idag'].includes(state.tab);
  const showSearch = ['tabla', 'resultat', 'nyheter'].includes(state.tab);
  const showSweChip = ['idag', 'tabla', 'resultat'].includes(state.tab);
  const hideAll = state.tab === 'medaljer';

  if (hideAll) { container.innerHTML = ''; return; }

  let html = '';

  if (showDate) {
    html += `<input type="date" class="pk-filter-input" id="pk-filter-date" 
              value="${state.filters.date}" aria-label="${t('filterDate')}">`;
  }
  if (showSport) {
    html += `<select class="pk-filter-select" id="pk-filter-sport" aria-label="${t('filterSport')}">
              <option value="">${t('filterSportAll')}</option>
            </select>`;
    html += `<select class="pk-filter-select" id="pk-filter-discipline" aria-label="${t('filterDiscipline')}">
              <option value="">${t('filterDisciplineAll')}</option>
            </select>`;
  }
  if (showSearch) {
    html += `<input type="search" class="pk-filter-input" id="pk-filter-search"
              placeholder="${t('filterSearch')}" value="${state.filters.search}" 
              aria-label="${t('filterSearch')}">`;
  }
  if (showSweChip) {
    html += `<button class="pk-chip ${state.filters.sweOnly ? 'active' : ''}" id="pk-filter-swe"
              aria-pressed="${state.filters.sweOnly}">
              <span class="pk-chip-dot"></span>${t('filterSweOnly')}
            </button>`;
  }

  container.innerHTML = html;

  // Bind filter events
  const dateEl = document.getElementById('pk-filter-date');
  const sportEl = document.getElementById('pk-filter-sport');
  const disciplineEl = document.getElementById('pk-filter-discipline');
  const searchEl = document.getElementById('pk-filter-search');
  const sweEl = document.getElementById('pk-filter-swe');

  dateEl?.addEventListener('change', (e) => { state.filters.date = e.target.value; renderView(); });
  sportEl?.addEventListener('change', (e) => { state.filters.sport = e.target.value; state.filters.discipline = ''; renderView(); });
  disciplineEl?.addEventListener('change', (e) => { state.filters.discipline = e.target.value; renderView(); });
  searchEl?.addEventListener('input', debounce((e) => { state.filters.search = e.target.value; renderView(); }, 250));
  sweEl?.addEventListener('click', () => {
    state.filters.sweOnly = !state.filters.sweOnly;
    sweEl.classList.toggle('active', state.filters.sweOnly);
    sweEl.setAttribute('aria-pressed', state.filters.sweOnly);
    renderView();
  });

  // Populate sport/discipline dropdowns from cached data
  populateSportDropdowns();
}

function populateSportDropdowns() {
  const data = state.cache.sports;
  if (!data) return;
  const sportEl = document.getElementById('pk-filter-sport');
  const discEl = document.getElementById('pk-filter-discipline');
  if (sportEl && data.sports) {
    for (const s of data.sports) {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      if (s === state.filters.sport) opt.selected = true;
      sportEl.appendChild(opt);
    }
  }
  if (discEl && data.disciplines && state.filters.sport) {
    const discs = data.disciplines[state.filters.sport] || [];
    for (const d of discs) {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      if (d === state.filters.discipline) opt.selected = true;
      discEl.appendChild(opt);
    }
  }
}

// ── View Router ──
async function renderView() {
  const content = document.getElementById('pk-content');
  if (!content) return;

  // Show skeleton
  content.innerHTML = renderSkeleton();
  state.loading = true;

  try {
    switch (state.tab) {
      case 'idag': await renderIdag(content); break;
      case 'tabla': await renderTabla(content); break;
      case 'nyheter': await renderNyheter(content); break;
      case 'medaljer': await renderMedaljer(content); break;
      case 'resultat': await renderResultat(content); break;
      case 'sverige': await renderSverige(content); break;
      default: await renderIdag(content);
    }
  } catch (err) {
    console.error('[pk] render error', err);
    content.innerHTML = renderError();
  } finally {
    state.loading = false;
  }
}

// ── Skeletons ──
function renderSkeleton() {
  return `
    <div class="pk-section">
      <div class="pk-skeleton pk-skeleton-line medium"></div>
      <div class="pk-skeleton pk-skeleton-card"></div>
      <div class="pk-skeleton pk-skeleton-card"></div>
      <div class="pk-skeleton pk-skeleton-card"></div>
    </div>
  `;
}

// ── Error / Empty ──
function renderError() {
  return `
    <div class="pk-error-banner">
      <span class="pk-error-banner-icon">⚠️</span>
      <span>${t('errorTitle')}. ${t('errorText')}</span>
    </div>
  `;
}

function renderEmpty(msg) {
  return `
    <div class="pk-empty">
      <div class="pk-empty-icon">🏔️</div>
      <div class="pk-empty-title">${t('emptyTitle')}</div>
      <div class="pk-empty-text">${msg || t('emptyText')}</div>
      <button class="pk-empty-action" onclick="window.pkClearFilters()">
        ${t('clearFilters')}
      </button>
    </div>
  `;
}

// Global clear filters
window.pkClearFilters = function () {
  state.filters = { date: todayYMD(), sport: '', discipline: '', search: '', sweOnly: false };
  renderFilters();
  renderView();
};

// ── Countdown ──
function renderCountdown() {
  const now = new Date();
  if (now >= PARALYMPIC_START) return '';
  const diff = PARALYMPIC_START - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `
    <div class="pk-banner">
      <div class="pk-banner-title">${t('countdownTitle')}</div>
      <div class="pk-banner-subtitle">${t('countdownSubtitle')}</div>
      <div class="pk-countdown">
        <div class="pk-countdown-unit">
          <div class="pk-countdown-value">${days}</div>
          <div class="pk-countdown-label">${t('countdownDays')}</div>
        </div>
        <div class="pk-countdown-unit">
          <div class="pk-countdown-value">${hours}</div>
          <div class="pk-countdown-label">${t('countdownHours')}</div>
        </div>
        <div class="pk-countdown-unit">
          <div class="pk-countdown-value">${minutes}</div>
          <div class="pk-countdown-label">${t('countdownMinutes')}</div>
        </div>
      </div>
    </div>
  `;
}

// ── IDAG View ──
async function renderIdag(container) {
  const res = await fetchAPI('today');
  const d = res?.data;
  const errorBanner = res?.meta?.error ? renderError() : '';

  if (!d) {
    container.innerHTML = errorBanner + renderCountdown() + renderEmpty(t('emptyToday'));
    return;
  }

  // Extract sports for dropdown population
  extractSports(d.events || [], d.sports || []);
  populateSportDropdowns();

  let events = d.events || [];
  if (state.filters.sweOnly) events = events.filter(e => e.isSWE);
  if (state.filters.sport) events = events.filter(e => e.sport === state.filters.sport);
  if (state.filters.search) {
    const q = state.filters.search.toLowerCase();
    events = events.filter(e =>
      e.sport?.toLowerCase().includes(q) ||
      e.discipline?.toLowerCase().includes(q) ||
      e.participants?.some(p => p.name?.toLowerCase().includes(q))
    );
  }

  const live = events.filter(e => e.status === 'live');
  const upcoming = events.filter(e => e.status === 'upcoming');
  const nextEvent = upcoming[0];
  const laterToday = upcoming.slice(1);
  const sweEvents = events.filter(e => e.isSWE && e.status !== 'finished');
  const news = (d.news || []).slice(0, 5);

  let html = errorBanner + renderCountdown();

  // Next event
  if (nextEvent) {
    html += renderSection(t('sectionNext'), '🎯', [nextEvent]);
  }

  // Live
  if (live.length) {
    html += renderSection(t('sectionLive'), '🔴', live, live.length);
  }

  // Later today
  if (laterToday.length) {
    html += renderSection(t('sectionLater'), '🕐', laterToday);
  }

  // Swedish starts
  if (sweEvents.length) {
    html += renderSection(t('sectionSwedish'), '🇸🇪', sweEvents);
  }

  // Latest news
  if (news.length) {
    html += `<div class="pk-section">
      <div class="pk-section-header">
        <span class="pk-section-title">📰 ${t('sectionLatestNews')}</span>
      </div>
      ${news.map(renderNewsCard).join('')}
    </div>`;
  }

  if (!html.replace(errorBanner, '').replace(renderCountdown(), '').trim()) {
    html += renderEmpty(t('emptyToday'));
  }

  container.innerHTML = html;
}

// ── TABLÅ View ──
async function renderTabla(container) {
  const params = { date: state.filters.date };
  if (state.filters.sport) params.sport = state.filters.sport;
  if (state.filters.discipline) params.discipline = state.filters.discipline;

  const res = await fetchAPI('schedule', params);
  const events = applyFilters(res?.data?.events || []);
  const errorBanner = res?.meta?.error ? renderError() : '';

  extractSports(res?.data?.events || [], res?.data?.sports || []);
  populateSportDropdowns();

  if (!events.length) {
    container.innerHTML = errorBanner + renderEmpty();
    return;
  }

  // Group by time block
  const groups = groupBy(events, e => getTimeBlock(e.startTime));
  let html = errorBanner;
  for (const [block, items] of groups) {
    html += `<div class="pk-time-block">
      <div class="pk-time-block-label">${timeBlockLabel(block)}</div>
      ${items.map(renderEventCard).join('')}
    </div>`;
  }

  container.innerHTML = html;
}

// ── RESULTAT View ──
async function renderResultat(container) {
  const params = { date: state.filters.date };
  if (state.filters.sport) params.sport = state.filters.sport;

  const res = await fetchAPI('results', params);
  const events = applyFilters(res?.data?.events || []);
  const errorBanner = res?.meta?.error ? renderError() : '';

  extractSports(res?.data?.events || [], res?.data?.sports || []);
  populateSportDropdowns();

  if (!events.length) {
    container.innerHTML = errorBanner + renderEmpty();
    return;
  }

  container.innerHTML = errorBanner + events.map(renderEventCard).join('');
}

// ── MEDALJER View ──
async function renderMedaljer(container) {
  const res = await fetchAPI('medals');
  const rows = res?.data?.table || [];
  const errorBanner = res?.meta?.error ? renderError() : '';

  if (!rows.length) {
    container.innerHTML = errorBanner + renderEmpty(t('emptyTitle'));
    return;
  }

  const thead = `<tr>
    <th class="num">${t('medalRank')}</th>
    <th>${t('medalNation')}</th>
    <th class="num">🥇 ${t('medalGold')}</th>
    <th class="num">🥈 ${t('medalSilver')}</th>
    <th class="num">🥉 ${t('medalBronze')}</th>
    <th class="num">${t('medalTotal')}</th>
  </tr>`;

  const tbody = rows.map(row => {
    const isSWE = row.nation === 'SWE';
    return `<tr class="${isSWE ? 'swe-row' : ''}">
      <td class="num">${row.rank}</td>
      <td>
        <div class="pk-nation">
          <span class="pk-nation-flag">${flagEmoji(row.nation)}</span>
          <span class="pk-nation-code">${escapeHtml(row.nation)}</span>
        </div>
      </td>
      <td class="num pk-medal-gold">${row.gold}</td>
      <td class="num pk-medal-silver">${row.silver}</td>
      <td class="num pk-medal-bronze">${row.bronze}</td>
      <td class="num">${row.total}</td>
    </tr>`;
  }).join('');

  container.innerHTML = errorBanner + `
    <div style="overflow-x:auto">
      <table class="pk-medal-table">
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
  `;
}

// ── NYHETER View ──
async function renderNyheter(container) {
  const res = await fetchAPI('news');
  let items = res?.data?.items || [];
  const errorBanner = res?.meta?.error ? renderError() : '';

  if (state.filters.search) {
    const q = state.filters.search.toLowerCase();
    items = items.filter(n =>
      n.title?.toLowerCase().includes(q) || n.summary?.toLowerCase().includes(q)
    );
  }

  if (!items.length) {
    container.innerHTML = errorBanner + renderEmpty(t('emptyNews'));
    return;
  }

  const sources = [...new Set(items.map(n => n.sourceName).filter(Boolean))];

  container.innerHTML = errorBanner +
    items.map(renderNewsCard).join('') +
    `<div class="pk-sources pk-mt-lg">${t('newsSources')}: ${sources.join(' · ')}</div>`;
}

// ── SVERIGE View ──
async function renderSverige(container) {
  const res = await fetchAPI('today');
  const d = res?.data;
  const errorBanner = res?.meta?.error ? renderError() : '';

  if (!d) {
    container.innerHTML = errorBanner + renderEmpty(t('emptyToday'));
    return;
  }

  // Populate sports dropdown
  extractSports(d.events || [], d.sports || []);
  populateSportDropdowns();

  const allEvents = d.events || [];
  const sweEvents = allEvents.filter(e => e.isSWE);
  const sweUpcoming = sweEvents.filter(e => e.status === 'upcoming' || e.status === 'live');
  const sweFinished = sweEvents.filter(e => e.status === 'finished');

  let html = errorBanner;

  if (sweUpcoming.length) {
    html += renderSection(t('sectionSwedish'), '🇸🇪', sweUpcoming);
  }

  if (sweFinished.length) {
    html += renderSection(t('sectionSwedishResults'), '🏅', sweFinished);
  }

  if (!sweUpcoming.length && !sweFinished.length) {
    html += renderEmpty(t('emptyToday'));
  }

  container.innerHTML = html;
}

// ── Shared Renderers ──
function renderSection(title, emoji, events, count) {
  const badge = count ? `<span class="pk-section-badge">${count}</span>` : '';
  return `
    <div class="pk-section">
      <div class="pk-section-header">
        <span class="pk-section-title">${emoji} ${title}</span>
        ${badge}
      </div>
      ${events.map(renderEventCard).join('')}
    </div>
  `;
}

function renderEventCard(event) {
  const sweFlag = event.isSWE ? `<span class="pk-card-swe-flag">🇸🇪 SWE</span>` : '';
  const participants = (event.participants || []).slice(0, 6).map(p => {
    const cls = p.nation === 'SWE' ? 'pk-participant swe' : 'pk-participant';
    return `<span class="${cls}">${flagEmoji(p.nation)} ${escapeHtml(p.name)}</span>`;
  }).join('');

  const result = event.resultSummary
    ? `<div class="pk-card-result">${escapeHtml(event.resultSummary)}</div>` : '';
  const venue = event.venue
    ? `<div class="pk-card-venue">📍 ${escapeHtml(event.venue)}</div>` : '';

  return `
    <div class="pk-card" data-event-id="${event.id}">
      <div class="pk-card-header">
        <div>
          <div class="pk-card-sport">${escapeHtml(event.sport || '')}</div>
          <div class="pk-card-discipline">${escapeHtml(event.discipline || '')}</div>
        </div>
        <div class="pk-flex pk-items-center pk-gap-sm">
          ${sweFlag}
          ${statusBadge(event.status)}
          <span class="pk-card-time">${formatTime(event.startTime)}</span>
        </div>
      </div>
      ${venue}
      ${participants ? `<div class="pk-card-participants">${participants}</div>` : ''}
      ${result}
    </div>
  `;
}

function renderNewsCard(item) {
  const time = item.publishedAt ? formatTime(item.publishedAt) : '';
  const dateStr = item.publishedAt ? formatDateHuman(item.publishedAt) : '';
  return `
    <a class="pk-news-item" href="${escapeHtml(item.url || '#')}" target="_blank" rel="noopener">
      <div class="pk-news-body">
        <div class="pk-news-title">${escapeHtml(item.title || '')}</div>
        ${item.summary ? `<div class="pk-news-summary">${escapeHtml(item.summary)}</div>` : ''}
        <div class="pk-news-meta">
          ${item.sourceName ? `<span class="pk-news-source">${escapeHtml(item.sourceName)}</span>` : ''}
          <span>${dateStr} ${time}</span>
        </div>
      </div>
    </a>
  `;
}

// ── Filter helpers ──
function applyFilters(events) {
  let filtered = events;
  if (state.filters.sweOnly) filtered = filtered.filter(e => e.isSWE);
  if (state.filters.sport) filtered = filtered.filter(e => e.sport === state.filters.sport);
  if (state.filters.discipline) filtered = filtered.filter(e => e.discipline === state.filters.discipline);
  if (state.filters.search) {
    const q = state.filters.search.toLowerCase();
    filtered = filtered.filter(e =>
      e.sport?.toLowerCase().includes(q) ||
      e.discipline?.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q) ||
      e.participants?.some(p => p.name?.toLowerCase().includes(q))
    );
  }
  return filtered;
}

function extractSports(events, canonicalSports) {
  const eventSports = [...new Set(events.map(e => e.sport).filter(Boolean))];
  // Merge canonical list (from API) with event-derived list
  const allSports = canonicalSports && canonicalSports.length
    ? [...new Set([...canonicalSports, ...eventSports])]
    : eventSports;
  const sports = allSports.filter(s => s !== 'Ceremoni').sort();
  const disciplines = {};
  for (const e of events) {
    if (e.sport && e.discipline) {
      if (!disciplines[e.sport]) disciplines[e.sport] = new Set();
      disciplines[e.sport].add(e.discipline);
    }
  }
  const disciplineObj = {};
  for (const [k, v] of Object.entries(disciplines)) {
    disciplineObj[k] = [...v].sort();
  }
  state.cache.sports = { sports, disciplines: disciplineObj };
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', init);
