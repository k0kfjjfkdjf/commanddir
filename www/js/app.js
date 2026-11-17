/* CommandDir — офлайн-шпаргалка по командам Linux / macOS / Windows */
(function () {
  'use strict';

  const KD = window.KD || { commands: [], concepts: [], recipes: [] };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- справочники ---------- */
  const CATS = {
    nav: 'Навигация и файлы', view: 'Просмотр файлов', text: 'Обработка текста', search: 'Поиск',
    perm: 'Права и пользователи', proc: 'Процессы', sys: 'Система и железо', disk: 'Диски и ФС',
    net: 'Сеть', pkg: 'Пакеты и ПО', arch: 'Архивы и сжатие', svc: 'Службы и загрузка',
    shell: 'Оболочка и окружение', dev: 'Разработка и Git', sec: 'Безопасность'
  };
  const OS_NAME = { l: 'Linux', m: 'macOS', w: 'Windows' };
  const SHELL_NAME = { sh: 'sh/bash', bash: 'bash', zsh: 'zsh', cmd: 'cmd.exe', ps: 'PowerShell' };
  const CONCEPT_GROUPS = {
    io: 'Ввод-вывод и конвейеры', logic: 'Логика и управление', vars: 'Переменные и подстановки',
    glob: 'Шаблоны и кавычки', script: 'Скрипты', jobs: 'Задачи и сигналы', regex: 'Регулярные выражения', base: 'Основы'
  };

  /* ---------- состояние ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('commanddir.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('commanddir.' + k, JSON.stringify(v)); } catch (e) { /* приватный режим */ } }
  };
  const state = {
    os: store.get('os', 'all'),
    cat: 'all',
    cgroup: 'all',
    q: '',
    favs: new Set(store.get('favs', [])),
    recent: store.get('recent', []),
    theme: store.get('theme', null)
  };

  const byId = {}; const byName = {};
  KD.commands.forEach(c => {
    byId['c:' + c.id] = c;
    const names = [c.n].concat(c.al || []);
    names.forEach(n => {
      n.split(/\s*\/\s*|\s*,\s*/).forEach(x => {
        const key = x.trim().toLowerCase().split(' ')[0];
        if (key) (byName[key] = byName[key] || []).push(c);
      });
    });
  });
  KD.concepts.forEach(c => { byId['k:' + c.id] = c; });
  KD.recipes.forEach(r => { byId['r:' + r.id] = r; });

  /* ---------- утилиты ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  function md(s) {
    if (!s) return '';
    return String(s).split(/\n{2,}/).map(p => {
      let h = esc(p).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
      return '<p>' + h + '</p>';
    }).join('');
  }
  const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е');
  function hl(text, q) {
    const t = esc(text); if (!q) return t;
    const i = norm(text).indexOf(norm(q));
    if (i < 0) return t;
    const raw = String(text);
    return esc(raw.slice(0, i)) + '<mark>' + esc(raw.slice(i, i + q.length)) + '</mark>' + esc(raw.slice(i + q.length));
  }
  const osMatch = os => state.os === 'all' || (os || '').includes(state.os);
  const badges = (os, extra) => '<span class="badges">' + (extra || '') + (os || '').split('').map(o => `<span class="badge ${o}">${OS_NAME[o]}</span>`).join('') + '</span>';
  const COPY_SVG = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  const codeBlock = cmd => `<div class="code"><span>${esc(cmd)}</span><button class="copy" data-copy="${esc(cmd)}" aria-label="Скопировать">${COPY_SVG}</button></div>`;

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1500);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Скопировано'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Скопировано'); } catch (_) { toast('Не удалось скопировать'); }
      ta.remove();
    }
  }

  function score(item, q, fields) {
    const nq = norm(q); let s = 0;
    const name = norm(fields.name);
    if (name === nq) s += 100; else if (name.startsWith(nq)) s += 60; else if (name.includes(nq)) s += 40;
    if (norm(fields.short).includes(nq)) s += 25;
    if (norm(fields.kw).includes(nq)) s += 20;
    if (norm(fields.body).includes(nq)) s += 6;
    // поиск по нескольким словам
    if (!s && nq.includes(' ')) {
      const words = nq.split(/\s+/).filter(Boolean);
      const all = norm([fields.name, fields.short, fields.kw, fields.body].join(' '));
      if (words.every(w => all.includes(w))) s += 10;
    }
    return s;
  }
  const cmdFields = c => ({
    name: c.n + ' ' + (c.al || []).join(' '), short: c.s, kw: (c.k || '') + ' ' + (CATS[c.c] || ''),
    body: [c.d, c.syn, (c.o || []).map(o => o.join(' ')).join(' '), (c.e || []).map(e => e.join(' ')).join(' ')].join(' ')
  });
  const conFields = c => ({ name: c.t, short: c.s, kw: (c.k || '') + ' ' + (c.sym || ''), body: [c.d, (c.e || []).map(e => e.join(' ')).join(' ')].join(' ') });
  const recFields = r => ({ name: r.t, short: r.s, kw: r.k || '', body: [r.cmd, (r.steps || []).map(s => s.join(' ')).join(' ')].join(' ') });

  /* ---------- рендер элементов списков ---------- */
  function cmdItem(c, q) {
    const extra = (c.sh && c.sh !== 'sh' ? `<span class="badge shell">${SHELL_NAME[c.sh] || c.sh}</span>` : '') +
      (c.w ? '<span class="badge danger">опасно</span>' : '') + (c.root ? '<span class="badge root">root</span>' : '');
    return `<a class="item" href="#/cmd/${encodeURIComponent(c.id)}">
      <div class="item-head"><span class="item-name">${hl(c.n, q)}</span>${badges(c.os, extra)}</div>
      <div class="item-short">${hl(c.s, q)}</div>
      ${c.syn ? `<div class="item-syn">${esc(c.syn.split('\n')[0])}</div>` : ''}
    </a>`;
  }
  function conItem(c, q) {
    return `<a class="item" href="#/concept/${encodeURIComponent(c.id)}">
      <div class="item-head"><span class="item-name">${esc(c.sym || '')}</span>${badges('', (c.sh || []).map(s => `<span class="badge shell">${SHELL_NAME[s] || s}</span>`).join(''))}</div>
      <div class="item-short"><b>${hl(c.t, q)}</b> — ${hl(c.s, q)}</div>
    </a>`;
  }
  function recItem(r, q) {
    return `<a class="item" href="#/recipe/${encodeURIComponent(r.id)}">
      <div class="item-head"><span class="item-short" style="margin:0;font-weight:700">${hl(r.t, q)}</span>${badges(r.os)}</div>
      <div class="item-syn">${esc(r.cmd.split('\n')[0])}</div>
    </a>`;
  }

  /* ---------- экраны ---------- */
  const view = () => $('#view');
  function setTitle(t, back) {
    $('#title').innerHTML = t || '<span class="brand-prompt">&gt;_</span> CommandDir';
    $('#backBtn').hidden = !back;
  }
  function setTab(tab) { $$('#tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab)); }
  function showSearch(show) { $('#searchWrap').hidden = !show; $('#osSwitch').hidden = !show; }

  function renderGlobalSearch() {
    const q = state.q.trim();
    const cmds = KD.commands.filter(c => osMatch(c.os)).map(c => [c, score(c, q, cmdFields(c))]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    const cons = KD.concepts.filter(c => state.os === 'all' || conOs(c).includes(state.os)).map(c => [c, score(c, q, conFields(c))]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    const recs = KD.recipes.filter(r => osMatch(r.os)).map(r => [r, score(r, q, recFields(r))]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    let h = '';
    if (!cmds.length && !cons.length && !recs.length) {
      h = `<div class="empty"><b>Ничего не найдено</b>Попробуйте другое слово: «удалить», «порт», «процесс», «архив»…${state.os !== 'all' ? '<br>Или переключите фильтр ОС на «Все».' : ''}</div>`;
    } else {
      if (cmds.length) h += `<div class="section-title">Команды · ${cmds.length}</div><div class="list grid">${cmds.slice(0, 80).map(c => cmdItem(c, q)).join('')}</div>`;
      if (cons.length) h += `<div class="section-title">Конструкции · ${cons.length}</div><div class="list">${cons.map(c => conItem(c, q)).join('')}</div>`;
      if (recs.length) h += `<div class="section-title">Рецепты · ${recs.length}</div><div class="list">${recs.map(r => recItem(r, q)).join('')}</div>`;
    }
    view().innerHTML = h;
  }

  function renderCommands() {
    setTab('commands'); setTitle(); showSearch(true);
    if (state.q.trim()) return renderGlobalSearch();
    const pool = KD.commands.filter(c => osMatch(c.os));
    const counts = {}; pool.forEach(c => { counts[c.c] = (counts[c.c] || 0) + 1; });
    const cats = Object.keys(CATS).filter(k => counts[k]);
    if (state.cat !== 'all' && !counts[state.cat]) state.cat = 'all';
    let h = '';
    if (!store.get('introSeen', false)) {
      h += `<div class="intro" id="intro"><b>Как пользоваться.</b> Выберите ОС сверху, категорию — ниже, нажмите на команду, чтобы увидеть опции, примеры и связи с другими командами. Вкладка <b>«Разбор»</b> объясняет любую вставленную строку по частям. Всё работает офлайн. <button class="chip" id="introClose" style="margin-top:8px">Понятно</button></div>`;
    }
    h += `<div class="chips" id="cats"><button class="chip ${state.cat === 'all' ? 'active' : ''}" data-cat="all">Все<span class="cnt">${pool.length}</span></button>` +
      cats.map(k => `<button class="chip ${state.cat === k ? 'active' : ''}" data-cat="${k}">${CATS[k]}<span class="cnt">${counts[k]}</span></button>`).join('') + '</div>';
    if (state.cat === 'all' && state.recent.length) {
      const rec = state.recent.map(id => byId[id]).filter(Boolean).filter(x => !x.n || osMatch(x.os)).slice(0, 6);
      if (rec.length) h += `<div class="section-title">Недавние</div><div class="links">${rec.map(x => x.n ? `<a class="link-chip" href="#/cmd/${x.id}">${esc(x.n)}</a>` : x.sym !== undefined ? `<a class="link-chip" href="#/concept/${x.id}">${esc(x.sym || x.t)}</a>` : `<a class="link-chip" href="#/recipe/${x.id}">${esc(x.t)}</a>`).join('')}</div>`;
    }
    const list = pool.filter(c => state.cat === 'all' || c.c === state.cat);
    if (state.cat === 'all') {
      cats.forEach(k => {
        const items = list.filter(c => c.c === k).sort((a, b) => a.n.localeCompare(b.n));
        h += `<div class="section-title">${CATS[k]} · ${items.length}</div><div class="list grid">${items.map(c => cmdItem(c)).join('')}</div>`;
      });
    } else {
      h += `<div class="list grid">${list.sort((a, b) => a.n.localeCompare(b.n)).map(c => cmdItem(c)).join('')}</div>`;
    }
    view().innerHTML = h;
    const ic = $('#introClose'); if (ic) ic.onclick = () => { store.set('introSeen', true); $('#intro').remove(); };
  }

  function conOs(c) {
    const sh = c.sh || []; let o = '';
    if (sh.some(s => ['bash', 'sh', 'zsh'].includes(s))) o += 'lm';
    if (sh.some(s => ['cmd', 'ps'].includes(s))) o += 'w';
    if (sh.includes('ps')) o += 'lm'; // PowerShell 7 кроссплатформенный
    return o;
  }

  function renderConcepts() {
    setTab('concepts'); setTitle('Конструкции оболочек'); showSearch(true);
    if (state.q.trim()) return renderGlobalSearch();
    const pool = KD.concepts.filter(c => state.os === 'all' || conOs(c).includes(state.os));
    const groups = Object.keys(CONCEPT_GROUPS).filter(g => pool.some(c => c.c === g));
    let h = `<div class="chips"><button class="chip ${state.cgroup === 'all' ? 'active' : ''}" data-cgroup="all">Все</button>` +
      groups.map(g => `<button class="chip ${state.cgroup === g ? 'active' : ''}" data-cgroup="${g}">${CONCEPT_GROUPS[g]}</button>`).join('') + '</div>';
    groups.filter(g => state.cgroup === 'all' || state.cgroup === g).forEach(g => {
      h += `<div class="section-title">${CONCEPT_GROUPS[g]}</div><div class="list">${pool.filter(c => c.c === g).map(c => conItem(c)).join('')}</div>`;
    });
    view().innerHTML = h || '<div class="empty"><b>Пусто</b></div>';
  }

  function renderRecipes() {
    setTab('recipes'); setTitle('Рецепты и связки'); showSearch(true);
    if (state.q.trim()) return renderGlobalSearch();
    const pool = KD.recipes.filter(r => osMatch(r.os));
    const groups = {};
    pool.forEach(r => { (groups[r.g || 'Разное'] = groups[r.g || 'Разное'] || []).push(r); });
    let h = '<div class="intro">Готовые связки команд с <b>пошаговым разбором</b>: как вывод одной команды становится входом другой.</div>';
    Object.keys(groups).forEach(g => { h += `<div class="section-title">${esc(g)}</div><div class="list">${groups[g].map(r => recItem(r)).join('')}</div>`; });
    view().innerHTML = h;
  }

  function renderFavorites() {
    setTab('favorites'); setTitle('Избранное'); showSearch(false);
    const items = Array.from(state.favs).map(id => byId[id]).filter(Boolean);
    if (!items.length) { view().innerHTML = '<div class="empty"><b>Здесь пока пусто</b>Нажмите «☆ В избранное» на странице команды, конструкции или рецепта.</div>'; return; }
    const c = items.filter(x => x.n), k = items.filter(x => x.sym !== undefined && !x.n), r = items.filter(x => x.cmd);
    let h = '';
    if (c.length) h += `<div class="section-title">Команды</div><div class="list grid">${c.map(x => cmdItem(x)).join('')}</div>`;
    if (k.length) h += `<div class="section-title">Конструкции</div><div class="list">${k.map(x => conItem(x)).join('')}</div>`;
    if (r.length) h += `<div class="section-title">Рецепты</div><div class="list">${r.map(x => recItem(x)).join('')}</div>`;
    view().innerHTML = h;
  }

  function favBtn(key) {
    const on = state.favs.has(key);
    return `<button class="fav-btn ${on ? 'on' : ''}" data-fav="${key}"><svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>${on ? 'В избранном' : 'В избранное'}</button>`;
  }
  function pushRecent(key) {
    state.recent = [key].concat(state.recent.filter(x => x !== key)).slice(0, 12);
    store.set('recent', state.recent);
  }
  function linkTo(id) {
    let c = byId['c:' + id];
    if (!c && !byId['k:' + id] && !byId['r:' + id]) {
      const cands = byName[String(id).toLowerCase()];
      if (cands && cands.length) { c = cands.find(x => osMatch(x.os)) || cands[0]; id = c.id; }
    } if (c) return `<a class="link-chip" href="#/cmd/${encodeURIComponent(id)}">${esc(c.n)}<small>${(c.os || '').split('').map(o => OS_NAME[o]).join(' · ')}</small></a>`;
    const k = byId['k:' + id]; if (k) return `<a class="link-chip" href="#/concept/${encodeURIComponent(id)}">${esc(k.sym || k.t)}<small>${esc(k.t)}</small></a>`;
    const r = byId['r:' + id]; if (r) return `<a class="link-chip" href="#/recipe/${encodeURIComponent(id)}">${esc(r.t)}</a>`;
    return '';
  }

  function renderCommand(id) {
    const c = byId['c:' + id];
    if (!c) return notFound();
    pushRecent('c:' + id); setTab('commands');
    setTitle(esc(c.n), true); showSearch(false);
    let h = '<article class="detail">';
    h += `<h2>${esc(c.n)}</h2>`;
    h += `<div class="meta">${(c.os || '').split('').map(o => `<span class="badge ${o}">${OS_NAME[o]}</span>`).join('')}${c.sh ? `<span class="badge shell">${SHELL_NAME[c.sh] || c.sh}</span>` : ''}<span class="badge shell">${CATS[c.c] || ''}</span>${c.root ? '<span class="badge root">нужны права администратора</span>' : ''}</div>`;
    h += `<p class="lead">${esc(c.s)}</p>`;
    if (c.al && c.al.length) h += `<p style="color:var(--muted);font-size:14px">Синонимы/псевдонимы: <code>${c.al.map(esc).join('</code>, <code>')}</code></p>`;
    h += `<div class="row">${favBtn('c:' + id)}</div>`;
    if (c.syn) h += `<div class="block"><h3>Синтаксис</h3>${c.syn.split('\n').map(codeBlock).join('')}</div>`;
    if (c.d) h += `<div class="block prose"><h3>Описание</h3>${md(c.d)}</div>`;
    if (c.w) h += `<div class="block note danger prose"><h3>⚠ Осторожно</h3>${md(c.w)}</div>`;
    if (c.o && c.o.length) h += `<div class="block"><h3>Опции и ключи</h3><table class="opts">${c.o.map(o => `<tr><td>${esc(o[0])}</td><td>${md(o[1]).replace(/^<p>|<\/p>$/g, '')}</td></tr>`).join('')}</table></div>`;
    if (c.e && c.e.length) h += `<div class="block"><h3>Примеры</h3>${c.e.map(e => `<div class="ex">${codeBlock(e[0])}<div class="ex-desc">${md(e[1]).replace(/^<p>|<\/p>$/g, '')}</div></div>`).join('')}</div>`;
    if (c.nt) h += `<div class="block note prose"><h3>Нюансы и отличия</h3>${md(c.nt)}</div>`;
    if (c.eq) {
      const rows = Object.keys(c.eq).map(o => `<span class="os-l badge ${o}">${OS_NAME[o]}</span><div>${String(c.eq[o]).split(',').map(x => { x = x.trim(); if (byId['c:' + x]) return linkTo(x);
        const k = x.toLowerCase().split(' ')[0]; const cs = byName[k];
        const t = cs && (cs.find(z => z.os.includes(o)) || cs[0]);
        return t ? `<a class="link-chip" href="#/cmd/${encodeURIComponent(t.id)}">${esc(x)}</a>` : `<code class="link-chip" style="color:var(--text)">${esc(x)}</code>`; }).join(' ')}</div>`).join('');
      h += `<div class="block"><h3>Аналоги в других ОС</h3><div class="equiv">${rows}</div></div>`;
    }
    const rel = (c.r || []).map(linkTo).filter(Boolean);
    const inRecipes = KD.recipes.filter(r => (r.r || []).includes(c.id) || new RegExp('(^|[\\s|;&(`])' + c.n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|$)', 'm').test(r.cmd));
    if (rel.length) h += `<div class="block"><h3>Работает вместе с</h3><div class="links">${rel.join('')}</div></div>`;
    if (inRecipes.length) h += `<div class="block"><h3>Используется в рецептах</h3><div class="list">${inRecipes.slice(0, 8).map(r => recItem(r)).join('')}</div></div>`;
    h += '</article>';
    view().innerHTML = h; window.scrollTo(0, 0);
  }

  function renderConcept(id) {
    const c = byId['k:' + id];
    if (!c) return notFound();
    pushRecent('k:' + id); setTab('concepts');
    setTitle(esc(c.t), true); showSearch(false);
    let h = '<article class="detail">';
    if (c.sym) h += `<h2>${esc(c.sym)}</h2>`;
    h += `<div class="meta">${(c.sh || []).map(s => `<span class="badge shell">${SHELL_NAME[s] || s}</span>`).join('')}<span class="badge shell">${CONCEPT_GROUPS[c.c] || ''}</span></div>`;
    h += `<p class="lead"><b>${esc(c.t)}</b> — ${esc(c.s)}</p><div class="row">${favBtn('k:' + id)}</div>`;
    if (c.syn) h += `<div class="block"><h3>Синтаксис</h3>${c.syn.split('\n').map(codeBlock).join('')}</div>`;
    if (c.d) h += `<div class="block prose"><h3>Как это работает</h3>${md(c.d)}</div>`;
    if (c.e && c.e.length) h += `<div class="block"><h3>Примеры</h3>${c.e.map(e => `<div class="ex">${codeBlock(e[0])}<div class="ex-desc">${md(e[1]).replace(/^<p>|<\/p>$/g, '')}</div></div>`).join('')}</div>`;
    if (c.cmp && c.cmp.length) h += `<div class="block"><h3>В разных оболочках</h3><table class="opts">${c.cmp.map(x => `<tr><td>${esc(x[0])}</td><td><code>${esc(x[1])}</code></td></tr>`).join('')}</table></div>`;
    if (c.nt) h += `<div class="block note prose"><h3>Подводные камни</h3>${md(c.nt)}</div>`;
    const rel = (c.r || []).map(linkTo).filter(Boolean);
    if (rel.length) h += `<div class="block"><h3>См. также</h3><div class="links">${rel.join('')}</div></div>`;
    h += '</article>';
    view().innerHTML = h; window.scrollTo(0, 0);
  }

  function renderRecipe(id) {
    const r = byId['r:' + id];
    if (!r) return notFound();
    pushRecent('r:' + id); setTab('recipes');
    setTitle('Рецепт', true); showSearch(false);
    let h = `<article class="detail"><p class="lead" style="font-size:20px;font-weight:700;margin-top:6px">${esc(r.t)}</p>`;
    h += `<div class="meta">${(r.os || '').split('').map(o => `<span class="badge ${o}">${OS_NAME[o]}</span>`).join('')}${r.sh ? `<span class="badge shell">${SHELL_NAME[r.sh]}</span>` : ''}</div>`;
    h += `<div class="row">${favBtn('r:' + id)}<a class="fav-btn" href="#/explain?c=${encodeURIComponent(r.cmd)}">Разобрать в «Разборе»</a></div>`;
    if (r.s) h += `<p>${esc(r.s)}</p>`;
    h += `<div class="block"><h3>Команда</h3>${r.cmd.split('\n').map(codeBlock).join('')}</div>`;
    if (r.steps) h += `<div class="block"><h3>Пошагово</h3><ol class="steps">${r.steps.map(s => `<li><code>${esc(s[0])}</code><div>${md(s[1]).replace(/^<p>|<\/p>$/g, '')}</div></li>`).join('')}</ol></div>`;
    if (r.alt && r.alt.length) h += `<div class="block"><h3>Варианты и аналоги</h3>${r.alt.map(a => `<div class="ex">${codeBlock(a[0])}<div class="ex-desc">${esc(a[1])}</div></div>`).join('')}</div>`;
    if (r.nt) h += `<div class="block note prose"><h3>Обратите внимание</h3>${md(r.nt)}</div>`;
    const rel = (r.r || []).map(linkTo).filter(Boolean);
    if (rel.length) h += `<div class="block"><h3>Команды в рецепте</h3><div class="links">${rel.join('')}</div></div>`;
    h += '</article>';
    view().innerHTML = h; window.scrollTo(0, 0);
  }

  /* ---------- «Разбор» строки ---------- */
  const OPS = [
    ['2>&1', 'Перенаправляет поток ошибок (stderr, 2) туда же, куда идёт обычный вывод (stdout, 1).', 'redirect'],
    ['&>>', 'Дописывает и вывод, и ошибки в конец файла (bash).', 'redirect'],
    ['&>', 'Перенаправляет и вывод, и ошибки в файл (bash). То же, что `> файл 2>&1`.', 'redirect'],
    ['2>>', 'Дописывает поток ошибок в конец файла.', 'redirect'],
    ['2>', 'Перенаправляет поток ошибок (stderr) в файл, перезаписывая его.', 'redirect'],
    ['>>', 'Дописывает вывод в конец файла (файл создаётся, если его нет).', 'redirect'],
    ['||', 'ИЛИ: следующая команда выполнится, только если предыдущая завершилась с ошибкой (код ≠ 0).', 'andor'],
    ['&&', 'И: следующая команда выполнится, только если предыдущая завершилась успешно (код 0).', 'andor'],
    ['|&', 'Конвейер вывода и ошибок одновременно (bash: то же, что `2>&1 |`).', 'pipe'],
    ['<<<', 'Here-string: передаёт строку на стандартный ввод команды.', 'heredoc'],
    ['<<', 'Here-document: передаёт многострочный текст до слова-маркера на ввод команды.', 'heredoc'],
    ['>', 'Перенаправляет вывод (stdout) в файл, ПЕРЕЗАПИСЫВАЯ его содержимое.', 'redirect'],
    ['<', 'Берёт стандартный ввод команды из файла.', 'redirect'],
    ['|', 'Конвейер (pipe): вывод левой команды становится вводом правой. Команды работают одновременно.', 'pipe'],
    [';', 'Разделитель: команды выполняются по очереди, независимо от успеха предыдущей.', 'seq'],
    ['&', 'Запуск в фоне: оболочка не ждёт завершения команды и сразу возвращает приглашение.', 'jobs']
  ];
  function splitLine(line) {
    const parts = []; let cur = ''; let i = 0; let q = null; let depth = 0;
    while (i < line.length) {
      const ch = line[i];
      if (q) { cur += ch; if (ch === q && line[i - 1] !== '\\') q = null; i++; continue; }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; i++; continue; }
      if (ch === '$' && line[i + 1] === '(') { depth++; cur += '$('; i += 2; continue; }
      if (ch === '(' && depth) { depth++; cur += ch; i++; continue; }
      if (ch === ')' && depth) { depth--; cur += ch; i++; continue; }
      if (!depth) {
        const op = OPS.find(o => line.startsWith(o[0], i));
        if (op && !(op[0] === '&' && line[i - 1] === '>')) {
          if (cur.trim()) parts.push({ t: 'cmd', v: cur.trim() });
          parts.push({ t: 'op', v: op[0], d: op[1], k: op[2] });
          cur = ''; i += op[0].length; continue;
        }
      }
      cur += ch; i++;
    }
    if (cur.trim()) parts.push({ t: 'cmd', v: cur.trim() });
    return parts;
  }
  function tokenize(s) {
    const out = []; const re = /"([^"\\]|\\.)*"|'[^']*'|\$\([^)]*\)|\S+/g; let m;
    while ((m = re.exec(s))) out.push(m[0]);
    return out;
  }
  const PREFIX = { sudo: 'Выполнить следующую команду от имени администратора (root).', doas: 'Аналог sudo (OpenBSD/Alpine/Arch).', time: 'Замерить время выполнения следующей команды.', nohup: 'Не завершать команду при закрытии терминала.', env: 'Запустить команду с изменённым окружением.', exec: 'Заменить текущую оболочку командой.', watch: 'Повторять команду каждые N секунд.', xargs: null, nice: 'Запустить с изменённым приоритетом.', command: 'Вызвать именно команду, а не функцию/псевдоним.', builtin: 'Вызвать встроенную команду оболочки.' };
  function findOpt(c, tok) {
    if (!c.o) return null;
    const flag = tok.split('=')[0];
    const lc = flag.toLowerCase();
    for (const o of c.o) {
      const variants = o[0].split(/,\s*|\s+\|\s+|\s*\/\s*/).map(v => v.trim().split(/[\s=\[<]/)[0]);
      if (variants.some(v => v === flag || (c.sh === 'ps' || c.sh === 'cmd') && v.toLowerCase() === lc)) return o;
    }
    // склеенные короткие ключи: -lah
    if (/^-[a-zA-Z]{2,}$/.test(tok)) {
      const res = tok.slice(1).split('').map(ch => { const o = c.o.find(o => o[0].split(/,\s*/).some(v => v.trim().split(/[\s=]/)[0] === '-' + ch)); return o ? `<code>-${ch}</code> — ${esc(o[1])}` : `<code>-${ch}</code> — <span class="unk">нет в справке приложения</span>`; });
      return ['__multi', res.join('<br>')];
    }
    return null;
  }
  function explainSegment(seg) {
    const toks = tokenize(seg);
    const rows = [];
    let i = 0;
    while (i < toks.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(toks[i])) { rows.push([toks[i], 'Временная переменная окружения только для этой команды.']); i++; }
    while (i < toks.length && PREFIX[toks[i]] !== undefined && PREFIX[toks[i]] !== null) { rows.push([toks[i], PREFIX[toks[i]]]); i++; if (toks[i - 1] === 'nice' && toks[i] === '-n') { rows.push([toks[i] + ' ' + toks[i + 1], 'Значение приоритета.']); i += 2; } }
    if (i >= toks.length) return rows;
    const name = toks[i];
    const key = name.toLowerCase().replace(/\.exe$/, '');
    const cands = byName[key] || byName[name] || [];
    const c = cands.find(x => osMatch(x.os)) || cands[0];
    if (c) rows.push([name, `<a href="#/cmd/${c.id}">${esc(c.s)}</a>`]);
    else rows.push([name, '<span class="unk">Команда не найдена в справочнике. Попробуйте <code>man ' + esc(name) + '</code>, <code>' + esc(name) + ' --help</code> или <code>Get-Help ' + esc(name) + '</code>.</span>']);
    i++;
    // подкоманды (git commit, systemctl restart, apt install …)
    if (c && c.sub && toks[i] && c.sub[toks[i]]) { rows.push([toks[i], esc(c.sub[toks[i]])]); i++; }
    for (; i < toks.length; i++) {
      const t = toks[i];
      const winCmd = c && (c.sh === 'cmd' || c.sh === 'ps' || c.os === 'w');
      if (c && c.o && !/^[-\/]/.test(t)) {
        const bare = c.o.find(o => o[0].split(/,\s*|\s+/)[0] === t);
        if (bare) { rows.push([t, esc(bare[1])]); continue; }
      }
      if (c && t.length > 1 && (t[0] === '-' || (t[0] === '/' && winCmd && /^\/[\w?:-]+$/.test(t)))) {
        const o = findOpt(c, t);
        if (o && o[0] === '__multi') rows.push([t, o[1]]);
        else if (o) {
          rows.push([t, esc(o[1])]);
          if (/[\s=](N|FILE|ФАЙЛ|ЧИСЛО|DIR|ПАТТЕРН|\S*<)/.test(o[0]) && !t.includes('=') && toks[i + 1] && !/^-/.test(toks[i + 1])) { rows.push([toks[i + 1], 'Значение для ' + esc(t)]); i++; }
        }
        else rows.push([t, '<span class="unk">Ключ команды (нет в справке приложения)</span>']);
      } else if (/^\$\(/.test(t)) rows.push([t, 'Подстановка команды: сюда вставится вывод внутренней команды.']);
      else if (/^["']/.test(t)) rows.push([t, 'Строка в кавычках — передаётся как один аргумент.' + (t[0] === "'" ? ' В одинарных кавычках переменные НЕ раскрываются.' : ' В двойных кавычках $переменные раскрываются.')]);
      else if (/[*?]/.test(t) && !/^['"]/.test(t)) rows.push([t, 'Шаблон (glob): оболочка заменит его списком подходящих файлов.']);
      else if (/^\$/.test(t)) rows.push([t, 'Переменная — подставится её значение.']);
      else if (/^~/.test(t)) rows.push([t, 'Путь от домашнего каталога (~ = /home/пользователь).']);
      else rows.push([t, 'Аргумент (файл, путь, шаблон или значение).']);
    }
    return rows;
  }
  function renderExplain(prefill) {
    setTab('explain'); setTitle('Разбор команды'); showSearch(false);
    const last = prefill || store.get('lastExplain', 'ps aux | grep -i nginx | awk \'{print $2}\' | xargs sudo kill -9');
    const samples = ['find . -name "*.log" -mtime +7 -delete', 'tar -czvf backup.tar.gz ~/docs && echo OK || echo FAIL', 'du -sh * 2>/dev/null | sort -h | tail -n 5', 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 5', 'netstat -ano | findstr :8080'];
    view().innerHTML = `<div class="intro">Вставьте строку из терминала, инструкции или Stack Overflow — приложение разобьёт её на части и объяснит каждую: команды, ключи, конвейеры, перенаправления.</div>
      <textarea class="explain-input" id="exIn" spellcheck="false" autocapitalize="off" autocorrect="off">${esc(last)}</textarea>
      <div class="row"><button class="btn" id="exGo">Разобрать</button><button class="btn ghost" id="exClr">Очистить</button></div>
      <div class="chips">${samples.map(s => `<button class="chip" data-sample="${esc(s)}">${esc(s.length > 34 ? s.slice(0, 32) + '…' : s)}</button>`).join('')}</div>
      <div id="exOut"></div>`;
    const go = () => {
      const v = $('#exIn').value.trim(); store.set('lastExplain', v);
      if (!v) { $('#exOut').innerHTML = ''; return; }
      const parts = splitLine(v.replace(/\\\n/g, ' '));
      let h = '';
      let n = 0;
      parts.forEach(p => {
        if (p.t === 'op') {
          const link = p.k ? linkTo({ pipe: 'pipe', redirect: 'redirect', andor: 'andor', seq: 'andor', jobs: 'jobs', heredoc: 'heredoc' }[p.k]) : '';
          h += `<div class="block" style="padding:10px 14px"><div class="tok"><div class="tok-k op">${esc(p.v)}</div><div class="tok-v">${md(p.d).replace(/^<p>|<\/p>$/g, '')} ${link}</div></div></div>`;
        } else {
          n++;
          const rows = explainSegment(p.v);
          h += `<div class="block"><h3>Часть ${n}</h3>${codeBlock(p.v)}${rows.map(r => `<div class="tok"><div class="tok-k">${esc(r[0])}</div><div class="tok-v">${r[1]}</div></div>`).join('')}</div>`;
        }
      });
      $('#exOut').innerHTML = h;
    };
    $('#exGo').onclick = go;
    $('#exClr').onclick = () => { $('#exIn').value = ''; $('#exOut').innerHTML = ''; $('#exIn').focus(); };
    $$('[data-sample]').forEach(b => b.onclick = () => { $('#exIn').value = b.dataset.sample; go(); });
    go();
  }

  function notFound() { view().innerHTML = '<div class="empty"><b>Не найдено</b><a href="#/commands">К списку команд</a></div>'; }

  /* ---------- роутер ---------- */
  let lastList = '#/commands';
  function route() {
    const h = location.hash || '#/commands';
    const [path, qs] = h.slice(2).split('?');
    const [p, id] = path.split('/');
    const arg = id ? decodeURIComponent(id) : null;
    if (['commands', 'concepts', 'recipes', 'favorites', 'explain'].includes(p)) lastList = '#/' + p;
    switch (p) {
      case 'cmd': return renderCommand(arg);
      case 'concept': return renderConcept(arg);
      case 'recipe': return renderRecipe(arg);
      case 'concepts': return renderConcepts();
      case 'recipes': return renderRecipes();
      case 'favorites': return renderFavorites();
      case 'explain': {
        const m = /(?:^|&)c=([^&]*)/.exec(qs || '');
        return renderExplain(m ? decodeURIComponent(m[1]) : null);
      }
      default: return renderCommands();
    }
  }

  /* ---------- события ---------- */
  function applyTheme() {
    const t = state.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = t;
  }
  applyTheme();
  $('#themeBtn').onclick = () => {
    state.theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    store.set('theme', state.theme); applyTheme();
  };
  $$('#osSwitch button').forEach(b => {
    b.classList.toggle('active', b.dataset.os === state.os);
    b.onclick = () => { state.os = b.dataset.os; store.set('os', state.os); $$('#osSwitch button').forEach(x => x.classList.toggle('active', x === b)); route(); };
  });
  $$('#tabbar button').forEach(b => b.onclick = () => { location.hash = '#/' + b.dataset.tab; });
  $('#backBtn').onclick = () => { if (history.length > 1) history.back(); else location.hash = lastList; };
  const search = $('#search');
  let st;
  search.addEventListener('input', () => {
    state.q = search.value; $('#clearSearch').hidden = !state.q;
    clearTimeout(st); st = setTimeout(() => { if (!/^#\/(commands|concepts|recipes)?$/.test(location.hash || '#/')) location.hash = '#/commands'; else route(); }, 120);
  });
  $('#clearSearch').onclick = () => { search.value = ''; state.q = ''; $('#clearSearch').hidden = true; route(); search.focus(); };
  document.addEventListener('click', e => {
    const cp = e.target.closest('[data-copy]'); if (cp) { e.preventDefault(); copy(cp.dataset.copy); return; }
    const cat = e.target.closest('[data-cat]'); if (cat) { state.cat = cat.dataset.cat; renderCommands(); return; }
    const cg = e.target.closest('[data-cgroup]'); if (cg) { state.cgroup = cg.dataset.cgroup; renderConcepts(); return; }
    const fv = e.target.closest('[data-fav]');
    if (fv) {
      const k = fv.dataset.fav;
      if (state.favs.has(k)) state.favs.delete(k); else state.favs.add(k);
      store.set('favs', Array.from(state.favs));
      fv.outerHTML = favBtn(k); toast(state.favs.has(k) ? 'Добавлено в избранное' : 'Убрано из избранного');
    }
  });
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
