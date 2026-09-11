import { players, trophies, matches, stats, winRate, goalsPerMatch, goalsAgainstPerMatch, biggestWin, } from './data.js';
const $ = (selector) => {
    const el = document.querySelector(selector);
    if (!el)
        throw new Error(`No se encontró el elemento ${selector}`);
    return el;
};
/* ---------- Plantel ---------- */
function renderPlayers(list) {
    const grid = $('#roster-grid');
    grid.innerHTML = list
        .map((p) => `
      <article class="player">
        <span class="player__number">${String(p.number).padStart(2, '0')}</span>
        <h3 class="player__name">${p.name}</h3>
      </article>`)
        .join('');
}
/* ---------- Vitrina ---------- */
function renderTrophies(list) {
    $('#trophy-list').innerHTML = list
        .map((t) => `
      <li class="trophy">
        <div class="trophy__frame">
          <img class="trophy__img" src="${t.image}" alt="Trofeo de la ${t.title}" loading="lazy" />
        </div>
        <h3 class="trophy__title">${t.title}</h3>
        <p class="trophy__org">${t.competition}</p>
      </li>`)
        .join('');
}
/* ---------- Historial ---------- */
function renderMatches(list) {
    $('#match-list').innerHTML = list
        .map((m) => `
      <li class="match match--${m.result}">
        <span class="match__badge">${m.result}</span>
        <span class="match__teams"><span class="match__home">CheTeam</span><span class="match__vs">vs</span>${m.rival}</span>
        <span class="match__score">${m.score}</span>
      </li>`)
        .join('');
    $('#form-streak').innerHTML = list
        .slice()
        .reverse()
        .map((m) => `<span class="dot dot--${m.result}" title="${m.rival} ${m.score}">${m.result}</span>`)
        .join('');
}
/* ---------- Contadores ---------- */
function animateNumber(el, to, decimals) {
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (to * eased).toFixed(decimals);
        if (progress < 1)
            requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}
function renderStats() {
    const cards = [
        { id: '#stat-played', value: stats.played, decimals: 0 },
        { id: '#stat-won', value: stats.won, decimals: 0 },
        { id: '#stat-lost', value: stats.lost, decimals: 0 },
        { id: '#stat-winrate', value: winRate(stats), decimals: 1 },
        { id: '#stat-gpm', value: goalsPerMatch(stats), decimals: 2 },
        { id: '#stat-gapm', value: goalsAgainstPerMatch(stats), decimals: 2 },
    ];
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting)
                continue;
            const el = entry.target;
            animateNumber(el, Number(el.dataset.value ?? '0'), Number(el.dataset.decimals ?? '0'));
            observer.unobserve(el);
        }
    }, { threshold: 0.4 });
    for (const c of cards) {
        const el = $(c.id);
        el.dataset.value = String(c.value);
        el.dataset.decimals = String(c.decimals);
        el.textContent = c.decimals > 0 ? (0).toFixed(c.decimals) : '0';
        observer.observe(el);
    }
    const best = biggestWin(matches);
    $('#stat-goals').textContent = `${stats.goalsFor}:${stats.goalsAgainst}`;
    $('#stat-best').textContent = `${best.score} vs ${best.rival}`;
    $('#record-line').textContent = `${stats.won} ganados · ${stats.drawn} empatados · ${stats.lost} perdidos`;
    const bar = $('#winrate-bar');
    const barObserver = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
            bar.style.width = `${winRate(stats)}%`;
            barObserver.disconnect();
        }
    });
    barObserver.observe(bar);
}
const STORAGE_KEY = 'cheteam:desafios';
function loadChallenges() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
}
function saveChallenges(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function formatDate(value) {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}
function renderChallenges(list) {
    const wrap = $('#challenge-list');
    $('#challenge-empty').hidden = list.length > 0;
    wrap.innerHTML = list
        .map((c) => `
      <li class="challenge">
        <div class="challenge__head">
          <span class="challenge__team">${escapeHtml(c.team)}</span>
          <span class="challenge__level">${escapeHtml(c.level)}</span>
        </div>
        <dl class="challenge__meta">
          <dt>Fecha</dt><dd>${escapeHtml(formatDate(c.date))}</dd>
          <dt>Contacto</dt><dd>${escapeHtml(c.contact)}</dd>
        </dl>
        ${c.message ? `<p class="challenge__msg">${escapeHtml(c.message)}</p>` : ''}
      </li>`)
        .join('');
    $('#challenge-count').textContent = String(list.length).padStart(2, '0');
}
function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}
function showError(field, message) {
    const el = document.querySelector(`[data-error-for="${field}"]`);
    if (el)
        el.textContent = message;
}
function validate(data) {
    let ok = true;
    for (const field of ['team', 'contact', 'date'])
        showError(field, '');
    if (data.team.trim().length < 3) {
        showError('team', 'Ingresá el nombre del equipo.');
        ok = false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact);
    const phoneOk = /^[+\d][\d\s-]{6,}$/.test(data.contact);
    if (!emailOk && !phoneOk) {
        showError('contact', 'Ingresá un mail o un teléfono válido.');
        ok = false;
    }
    if (!data.date) {
        showError('date', 'Elegí una fecha.');
        ok = false;
    }
    return ok;
}
function notice(message) {
    const el = $('#notice');
    el.textContent = message;
    el.classList.add('notice--visible');
    window.setTimeout(() => el.classList.remove('notice--visible'), 4000);
}
function setupForm() {
    const form = $('#challenge-form');
    let challenges = loadChallenges();
    renderChallenges(challenges);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const fd = new FormData(form);
        const challenge = {
            team: String(fd.get('team') ?? ''),
            contact: String(fd.get('contact') ?? ''),
            level: String(fd.get('level') ?? ''),
            date: String(fd.get('date') ?? ''),
            message: String(fd.get('message') ?? ''),
            createdAt: new Date().toISOString(),
        };
        if (!validate(challenge)) {
            notice('Revisá los campos marcados.');
            return;
        }
        challenges = [challenge, ...challenges].slice(0, 12);
        saveChallenges(challenges);
        renderChallenges(challenges);
        form.reset();
        notice(`Desafío registrado. Nos contactamos con ${challenge.team}.`);
    });
    $('#challenge-clear').addEventListener('click', () => {
        challenges = [];
        saveChallenges(challenges);
        renderChallenges(challenges);
        notice('Listado vaciado.');
    });
}
/* ---------- Navegación ---------- */
function setupNav() {
    const links = document.querySelectorAll('.nav__link');
    const sections = Array.from(links)
        .map((l) => document.querySelector(l.hash))
        .filter((s) => s !== null);
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting)
                continue;
            links.forEach((l) => l.classList.toggle('nav__link--active', l.hash === `#${entry.target.id}`));
        }
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => observer.observe(s));
    const reveal = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                reveal.unobserve(entry.target);
            }
        }
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));
}
function init() {
    renderPlayers(players);
    renderTrophies(trophies);
    renderMatches(matches);
    renderStats();
    setupForm();
    setupNav();
    $('#year').textContent = String(new Date().getFullYear());
    $('#fact-trophies').textContent = String(trophies.length).padStart(2, '0');
    $('#fact-players').textContent = String(players.length).padStart(2, '0');
    $('#fact-played').textContent = String(stats.played).padStart(2, '0');
}
document.addEventListener('DOMContentLoaded', init);
//# sourceMappingURL=main.js.map