// ========================= HIGHWAY TO SHELL — motor =========================
// Datos: ROLES (scenarios.js). Textos de interfaz: UI (i18n.js).

const $ = (id) => document.getElementById(id);
const STAT_COLORS = ['#e94560', '#00d4ff', '#ffd700', '#9b59b6'];
const RISK_COLORS = { high: 'var(--danger)', med: 'var(--warning)', low: 'var(--success)' };
const LOG_CLASS = { high: 'crit', med: 'warn', low: 'good' };

let lang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'es';
let state = null;

// ---------- utilidades ----------
const t = (key) => UI[lang][key];
const tr = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[lang] ?? v.es) : v;
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const bi = (s) => String(s).replace(/⟪([\s\S]*?)\|([\s\S]*?)⟫/g, (_, es, en) => lang === 'en' ? en : es);

function save(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const bestIndex = (sc) => sc.choices.reduce((b, c, i, all) => c.xp > all[b].xp ? i : b, 0);
const mainStat = (role) => role.stats.find(s => s.main) || role.stats[0];
const maxXp = (role) => role.scenarios.reduce((sum, sc) => sum + sc.choices[bestIndex(sc)].xp, 0);

// Mini-lenguaje de terminal:
//   "# texto"            comentario
//   "$ PROMPT :: CMD"    prompt + comando
//   "! texto"            error / alerta
//   resto                salida
//   ⟪es|en⟫              segmento bilingüe en cualquier línea
function renderTerminal(src) {
  return bi(src).replace(/^\n+|\n+$/g, '').split('\n').map(line => {
    if (line.startsWith('# ')) return `<span class="t-line t-comment">${esc(line)}</span>`;
    if (line.startsWith('! ')) return `<span class="t-line t-err">${esc(line.slice(2))}</span>`;
    if (line.startsWith('$ ')) {
      const [prompt, ...cmd] = line.slice(2).split(' :: ');
      return `<span class="t-line"><span class="t-prompt">${esc(prompt)}</span> <span class="t-cmd">${esc(cmd.join(' :: '))}</span></span>`;
    }
    return `<span class="t-line t-out">${esc(line) || ' '}</span>`;
  }).join('');
}

// ---------- i18n / tema ----------
function applyStaticTexts() {
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n').replace(/^ui\./, '');
    if (typeof UI[lang][key] === 'string') el.textContent = UI[lang][key];
  });
  $('langBtn').textContent = t('langBtn');
  $('langBtn').setAttribute('aria-label', lang === 'es' ? 'Switch to English' : 'Cambiar a español');
  updateThemeBtn();
}

function updateThemeBtn() {
  const dark = document.documentElement.getAttribute('data-theme') !== 'light';
  $('themeBtn').textContent = dark ? t('themeLight') : t('themeDark');
}

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  save('hts_theme', next);
  updateThemeBtn();
}

function toggleLang() {
  lang = lang === 'es' ? 'en' : 'es';
  save('hts_lang', lang);
  applyStaticTexts();
  renderCurrent();
}

// ---------- pantallas ----------
function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
  $('statusbar').hidden = name !== 'game';
  $('restartTopBtn').hidden = name !== 'game';
  if (state) state.screen = name; else state = { screen: name };
  window.scrollTo({ top: 0 });
}

function renderCurrent() {
  if (!state) return;
  if (state.screen === 'roles') renderRoles();
  if (state.screen === 'game') { renderScenario(); updateSidebar(); updateStatusBar(); renderLog(); }
  if (state.screen === 'end') renderEnd();
}

function showRoles() {
  state = { screen: 'roles' };
  setScreen('roles');
  renderRoles();
}

function renderRoles() {
  $('roles-grid').innerHTML = ROLES.map(r => `
    <button type="button" class="role-card" style="--role-color:${r.color}" data-role="${r.id}">
      <div class="role-difficulty">${UI[lang].difficulty[r.difficulty]}</div>
      <div class="role-icon" aria-hidden="true">${r.icon}</div>
      <div class="role-name">${esc(tr(r.name))}</div>
      <div class="role-desc">${esc(tr(r.desc))}</div>
      <div class="role-stats">
        <div class="role-stat">${r.scenarios.length} ${t('phasesCount')}</div>
        ${r.stats.map(s => `<div class="role-stat">${esc(tr(s.label))}: ${s.start}</div>`).join('')}
      </div>
    </button>`).join('');
  $('roles-grid').querySelectorAll('.role-card').forEach(b => b.addEventListener('click', () => selectRole(b.dataset.role)));
}

function selectRole(id) {
  const role = ROLES.find(r => r.id === id);
  state = {
    screen: 'game',
    role,
    idx: 0,
    stats: Object.fromEntries(role.stats.map(s => [s.key, s.start])),
    xp: 0,
    decisions: [],
    log: [],
    order: role.scenarios.map(sc => shuffle(sc.choices.map((_, i) => i))),
    answered: false,
    failed: false
  };
  setScreen('game');
  renderCurrent();
}

// ---------- juego ----------
function renderScenario() {
  const { role, idx } = state;
  const sc = role.scenarios[idx];
  $('scenario-content').innerHTML = `
    <div class="scenario-header">
      <div class="scenario-phase-badge">${esc(tr(sc.phase))}</div>
      <h2 class="scenario-title">${esc(tr(sc.title))}</h2>
      <div class="scenario-progress">${t('phaseOf')(idx + 1, role.scenarios.length)}</div>
    </div>
    <div class="scenario-body">${tr(sc.body)}</div>
    ${sc.term ? `<div class="terminal-block" role="region" aria-label="terminal">${renderTerminal(sc.term)}</div>` : ''}`;

  const decision = state.answered ? state.decisions[state.decisions.length - 1] : null;
  const best = bestIndex(sc);
  const order = state.order[idx];

  $('choices-area').innerHTML = `<div class="choices-grid">${order.map((ci, pos) => {
    const c = sc.choices[ci];
    let cls = '', tag = '';
    if (decision) {
      if (ci === decision.choice) { cls = ' picked'; tag = `<span class="choice-tag risk-${c.risk}">${t('yourTag')}</span>`; }
      if (ci === best) { cls += ' best'; if (ci !== decision.choice) tag = `<span class="choice-tag risk-low">${t('bestTag')}</span>`; }
    }
    return `<button type="button" class="choice-btn${cls}" data-choice="${ci}" ${decision ? 'disabled' : ''}>
      <span class="choice-key">[${pos + 1}]</span><span>${esc(tr(c.t))}</span>${tag}
    </button>`;
  }).join('')}</div>
  ${decision ? nextButton() : `<div class="kbd-hint">${t('kbdHint')}</div>`}`;

  $('choices-area').querySelectorAll('.choice-btn[data-choice]').forEach(b =>
    b.addEventListener('click', () => makeChoice(+b.dataset.choice)));
  const nb = $('next-btn');
  if (nb) nb.addEventListener('click', nextScenario);

  $('feedback-area').innerHTML = decision ? feedbackHtml(sc, decision.choice) : '';
}

function nextButton() {
  const last = state.idx >= state.role.scenarios.length - 1;
  const label = state.failed ? t('failNext') : last ? t('finish') : t('next');
  return `<button type="button" id="next-btn" class="choice-btn" style="margin-top:10px;width:100%;">
    <span class="choice-key">[↵]</span><span>${label}</span></button>`;
}

function feedbackHtml(sc, ci) {
  const c = sc.choices[ci];
  const fx = Object.entries(c.fx || {}).map(([k, d]) => {
    const st = state.role.stats.find(s => s.key === k);
    return `${tr(st.label)} ${d > 0 ? '+' : ''}${d}`;
  }).join(' · ');
  return `<div class="feedback-panel" style="--fb-color:${RISK_COLORS[c.risk]}">
    <div class="fb-title">${t('result')} <span class="fb-risk risk-${c.risk}">${UI[lang].risk[c.risk]}</span></div>
    ${esc(tr(c.f))}
    <div class="fb-xp">+${c.xp} XP${fx ? ' | ' + esc(fx) : ''}</div>
  </div>`;
}

function makeChoice(ci) {
  if (state.answered) return;
  const sc = state.role.scenarios[state.idx];
  const c = sc.choices[ci];
  state.xp += c.xp;
  for (const [k, d] of Object.entries(c.fx || {})) {
    if (k in state.stats) state.stats[k] = Math.max(0, Math.min(100, state.stats[k] + d));
  }
  state.decisions.push({ idx: state.idx, choice: ci });
  state.log.unshift({ ts: new Date(), idx: state.idx, choice: ci });
  state.answered = true;
  state.failed = state.stats[mainStat(state.role).key] <= 0;

  renderScenario();
  updateSidebar();
  updateStatusBar();
  renderLog();
  const fb = $('feedback-area');
  if (fb.firstElementChild) fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const nb = $('next-btn');
  if (nb) nb.focus({ preventScroll: true });
}

function nextScenario() {
  if (!state.answered) return;
  if (state.failed) return endGame(false);
  if (state.idx >= state.role.scenarios.length - 1) return endGame(true);
  state.idx++;
  state.answered = false;
  renderScenario();
  updateSidebar();
  updateStatusBar();
  $('screen-game').scrollIntoView({ block: 'start' });
  window.scrollTo({ top: 0 });
}

// ---------- paneles ----------
function updateSidebar() {
  const { role } = state;
  $('pl-icon').textContent = role.icon;
  $('pl-role-name').textContent = tr(role.name);
  $('pl-role-name').style.color = role.color;
  $('pl-stats').innerHTML = role.stats.map((s, i) => {
    const v = Math.round(state.stats[s.key]);
    return `<div class="stat-bar-wrap">
      <div class="stat-bar-label"><span>${esc(tr(s.label))}${s.main ? ' ★' : ''}</span><span>${v}</span></div>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${v}%;background:${STAT_COLORS[i % 4]}"></div></div>
    </div>`;
  }).join('');
  $('inv-list').innerHTML = role.tools.map(x => `<div class="inv-item">▸ ${esc(tr(x))}</div>`).join('');
  const done = state.decisions.length;
  $('phase-list').innerHTML = role.scenarios.map((sc, i) => {
    const st = i < done ? 'done' : i === state.idx ? 'active' : '';
    return `<div class="phase-item ${st}"><div class="phase-dot"></div>${esc(tr(sc.phase))}</div>`;
  }).join('');
}

function updateStatusBar() {
  const { role } = state;
  const ms = mainStat(role);
  const v = Math.round(state.stats[ms.key]);
  $('sb-role').textContent = tr(role.name);
  $('sb-phase').textContent = tr(role.scenarios[state.idx].phase);
  $('sb-progress').textContent = `${state.decisions.length}/${role.scenarios.length}`;
  $('sb-xp').textContent = state.xp;
  $('sb-main-label').textContent = tr(ms.label) + ':';
  $('sb-main').textContent = v;
  $('sb-main-chip').className = 'stat-chip' + (v < 30 ? ' danger' : v < 60 ? ' warn' : ' success');
}

function renderLog() {
  const pad = (n) => String(n).padStart(2, '0');
  $('game-log').innerHTML = state.log.slice(0, 12).map(e => {
    const sc = state.role.scenarios[e.idx];
    const c = sc.choices[e.choice];
    const txt = tr(c.t);
    const short = txt.length > 60 ? txt.slice(0, 57) + '…' : txt;
    return `<div class="log-entry ${LOG_CLASS[c.risk]}"><span class="ts">[${pad(e.ts.getHours())}:${pad(e.ts.getMinutes())}:${pad(e.ts.getSeconds())}]</span>[${esc(tr(sc.phase))}] ${esc(short)} +${c.xp}XP</div>`;
  }).join('');
}

// ---------- final ----------
function endGame(win) {
  state.win = win;
  setScreen('end');
  renderEnd();
}

function gradeFor(pct) {
  return pct >= 90 ? 'S' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D';
}

function renderEnd() {
  const { role, win } = state;
  const ms = mainStat(role);
  const total = role.scenarios.length;
  const hits = state.decisions.filter(d => d.choice === bestIndex(role.scenarios[d.idx])).length;
  const pct = Math.round(100 * state.xp / maxXp(role));
  const grade = win ? gradeFor(pct) : 'F';

  $('end-icon').textContent = win ? (grade === 'S' || grade === 'A' ? '🏆' : '🏁') : '💀';
  $('end-title').textContent = win ? t('winTitle') : t('loseTitle');
  $('end-title').className = 'end-title ' + (win ? 'win' : 'lose');
  $('end-grade').innerHTML = `${grade}<small>${t('grade')} · ${pct}%</small>`;
  $('end-summary').textContent = win ? t('winSummary')(tr(role.name)) : t('loseSummary')(tr(ms.label));

  const statRows = role.stats.map(s =>
    `<div class="end-stat"><span class="es-label">${esc(tr(s.label))}</span><span class="es-val">${Math.round(state.stats[s.key])}</span></div>`).join('');
  $('end-stats').innerHTML = `
    <div class="end-stat"><span class="es-label">${t('esRole')}</span><span class="es-val">${esc(tr(role.name))}</span></div>
    <div class="end-stat"><span class="es-label">${t('esXp')}</span><span class="es-val">${state.xp} / ${maxXp(role)}</span></div>
    <div class="end-stat"><span class="es-label">${t('esPhases')}</span><span class="es-val">${state.decisions.length}/${total}</span></div>
    <div class="end-stat"><span class="es-label">${t('esAcc')}</span><span class="es-val">${hits}/${state.decisions.length}</span></div>
    ${statRows}`;

  $('end-review').innerHTML = `<h3>${t('review')}</h3>` + state.decisions.map(d => {
    const sc = role.scenarios[d.idx];
    const c = sc.choices[d.choice];
    const bi_ = bestIndex(sc);
    const b = sc.choices[bi_];
    const ok = d.choice === bi_;
    return `<div class="review-item" style="--rv-color:${RISK_COLORS[c.risk]}">
      <div class="rv-phase">${esc(tr(sc.phase))} — ${esc(tr(sc.title))}</div>
      <div>${ok ? '✔' : '✘'} <strong>${t('youChose')}</strong> ${esc(tr(c.t))} <span class="fb-risk risk-${c.risk}">+${c.xp} XP</span></div>
      <div class="rv-why">${esc(tr(c.f))}</div>
      ${ok ? '' : `<div class="rv-best">★ <strong>${t('bestWas')}</strong> ${esc(tr(b.t))} (+${b.xp} XP)</div><div class="rv-why">${esc(tr(b.f))}</div>`}
    </div>`;
  }).join('');
}

function restartGame() {
  state = { screen: 'intro' };
  setScreen('intro');
}

// ---------- eventos ----------
$('startBtn').addEventListener('click', showRoles);
$('themeBtn').addEventListener('click', toggleTheme);
$('langBtn').addEventListener('click', toggleLang);
$('restartTopBtn').addEventListener('click', restartGame);
$('retryBtn').addEventListener('click', () => selectRole(state.role.id));
$('newGameBtn').addEventListener('click', showRoles);

document.addEventListener('keydown', (e) => {
  if (!state || state.screen !== 'game' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
  if (!state.answered && /^[1-4]$/.test(e.key)) {
    const ci = state.order[state.idx][+e.key - 1];
    if (ci !== undefined) { e.preventDefault(); makeChoice(ci); }
  } else if (state.answered && e.key === 'Enter' && document.activeElement?.id !== 'next-btn') {
    e.preventDefault();
    nextScenario();
  }
});

applyStaticTexts();
setScreen('intro');
