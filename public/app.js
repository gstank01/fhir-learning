(function () {
  'use strict';

  const STUDIED_KEY = 'fhirprep.studied.v1';
  const OVERVIEW = 'overview';
  const AXIS_MAX = 40; // percent, for the weighting chart

  const state = {
    data: null,
    admin: false,
    adminConfigured: false,
    route: OVERVIEW,
    filter: '',
    resourceFilter: '',
    lastCategory: 'all',
    maturityFilter: 'any',
    user: null, // signed-in visitor's email
    accountsAvailable: false,
    myNotes: {}, // pageId -> { markdown, updatedAt }
    myDrafts: {}, // pageId -> text typed but not yet saved
    myStatus: {}, // pageId -> 'saving' | 'saved' | 'error: …'
    myPane: {}, // pageId -> 'write' | 'preview'
    myFilter: '',
    accountMode: 'login',
    cards: { deck: 'scenario', category: 'all', hideKnown: false, order: [], index: 0, flipped: false, key: '' },
    cardMarks: loadCardMarks(), // cardId -> 'known' | 'learning'
    randomCard: null, // { index, revealed }
    studiedFilter: 'any',
    resourceIndex: null,
    studied: loadStudied(),
    editing: null, // { id, original, draft, pane, busy, error, confirmRestore }
  };

  const $ = (sel) => document.querySelector(sel);
  const els = {
    nav: $('#nav'), main: $('#main'), progress: $('#progress'), adminBox: $('#admin-box'),
    sidebar: $('#sidebar'), scrim: $('#scrim'), menuBtn: $('#menu-btn'), filter: $('#topic-filter'),
    dialog: $('#login-dialog'), loginForm: $('#login-form'), loginPassword: $('#login-password'),
    loginError: $('#login-error'), loginSubmit: $('#login-submit'), loginCancel: $('#login-cancel'),
    toast: $('#toast'), resourceBar: $('#resource-bar'),
    accountDialog: $('#account-dialog'), accountForm: $('#account-form'), accountEmail: $('#account-email'),
    accountPassword: $('#account-password'), accountError: $('#account-error'), accountSubmit: $('#account-submit'),
    accountHelp: $('#account-help'), accountHint: $('#account-hint'), accountTitle: $('#account-title'),
    deleteDialog: $('#delete-dialog'), deleteForm: $('#delete-form'), deletePassword: $('#delete-password'),
    deleteError: $('#delete-error'), deleteSubmit: $('#delete-submit'),
  };

  // ---------- Helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function loadStudied() {
    try { return new Set(JSON.parse(localStorage.getItem(STUDIED_KEY) || '[]')); } catch { return new Set(); }
  }
  function loadCardMarks() {
    try { return JSON.parse(localStorage.getItem('fhirprep.cards.v1') || '{}') || {}; } catch { return {}; }
  }
  function saveCardMarks() {
    try { localStorage.setItem('fhirprep.cards.v1', JSON.stringify(state.cardMarks)); } catch { /* storage unavailable */ }
  }
  function saveStudied() {
    try { localStorage.setItem(STUDIED_KEY, JSON.stringify([...state.studied])); } catch { /* storage unavailable */ }
  }
  function range(w) { return `${w[0]}–${w[1]}%`; }
  function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
  }

  if (window.DOMPurify) {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') || '')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }
  function renderMarkdown(md) {
    if (!md || !md.trim()) return '<p class="notes-empty">No notes yet.</p>';
    const html = DOMPurify.sanitize(marked.parse(md, { gfm: true }));
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('table').forEach((t) => {
      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      t.replaceWith(wrap);
      wrap.appendChild(t);
    });
    const div = document.createElement('div');
    div.appendChild(tpl.content);
    return div.innerHTML;
  }

  let toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2600);
  }

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      credentials: 'same-origin',
      ...opts,
      headers: { ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
    });
    let body = null;
    try { body = await res.json(); } catch { /* not JSON */ }
    if (!res.ok) {
      const err = new Error((body && body.error) || `The server answered ${res.status}.`);
      err.status = res.status;
      throw err;
    }
    return body;
  }

  // ---------- Data helpers ----------
  function topicList() {
    const list = [{ id: OVERVIEW, title: 'Exam overview', domain: null }];
    state.data.domains.forEach((d) => d.topics.forEach((t) => list.push({ ...t, domain: d })));
    return list;
  }
  function findTopic(id) {
    return topicList().find((t) => t.id === id) || null;
  }
  function studyTopics() {
    return topicList().filter((t) => t.id !== OVERVIEW);
  }

  // ---------- Sidebar ----------
  function renderNav() {
    const q = state.filter.trim().toLowerCase();
    const match = (t, d) => !q || t.title.toLowerCase().includes(q) || d.title.toLowerCase().includes(q);
    const link = (id, title, weight) => {
      const current = state.route === id ? ' aria-current="page"' : '';
      const done = state.studied.has(id);
      return `<a class="nav-link" href="#${id}"${current}>
        <span class="dot${done ? ' done' : ''}" title="${done ? 'Studied' : 'Not studied yet'}"></span>
        <span class="label">${esc(title)}</span>
        ${weight ? `<span class="weight">${range(weight)}</span>` : ''}
      </a>`;
    };

    let html = '';
    if (!q || 'exam overview'.includes(q)) {
      html += `<div class="nav-overview">${link(OVERVIEW, 'Exam overview')}</div>`;
    }
    state.data.domains.forEach((d) => {
      const topics = d.topics.filter((t) => match(t, d));
      if (!topics.length) return;
      html += `<section class="nav-domain" aria-label="${esc(d.title)}">
        <div class="nav-domain-head">
          <span class="nav-domain-title">${esc(d.title)}</span>
          ${d.weight ? `<span class="nav-domain-weight">${range(d.weight)}</span>` : `<span class="nav-domain-label">${esc(d.label || '')}</span>`}
        </div>
        ${topics.map((t) => link(t.id, t.title, t.weight)).join('')}
      </section>`;
    });
    els.nav.innerHTML = html || '<p class="nav-empty">No topics match that filter.</p>';
  }

  function renderProgress() {
    const topics = studyTopics();
    const done = topics.filter((t) => state.studied.has(t.id)).length;
    const pct = Math.round((done / topics.length) * 100);
    els.progress.innerHTML = `
      <div class="progress-label"><span>Studied</span><span>${done} of ${topics.length}</span></div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${topics.length}" aria-valuenow="${done}" aria-label="Topics studied">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>`;
  }

  function renderAdminBox() {
    if (!state.user && !state.admin) {
      els.adminBox.innerHTML = `<button class="btn small primary" type="button" data-action="account-open">Sign in</button>`;
      return;
    }
    const label = state.user || 'Admin';
    const initial = esc(label.charAt(0).toUpperCase());
    const items = [];
    if (state.user) {
      items.push(`<p class="menu-who">Signed in as<br><strong>${esc(state.user)}</strong></p>`);
      items.push('<a class="menu-item" href="#my-notes">My notes</a>');
      items.push('<button class="menu-item" type="button" data-action="account-logout">Sign out</button>');
      items.push('<button class="menu-item danger" type="button" data-action="account-delete">Delete account…</button>');
    } else {
      items.push('<button class="menu-item" type="button" data-action="account-open">Sign in to your account</button>');
    }
    if (state.admin) {
      items.push('<p class="menu-who admin-line"><span class="pip"></span>Admin editing is on</p>');
      items.push('<button class="menu-item" type="button" data-action="logout">Admin sign out</button>');
    }
    els.adminBox.innerHTML = `<details class="account-menu">
      <summary aria-label="Account menu"><span class="avatar${state.admin ? ' admin' : ''}" aria-hidden="true">${initial}</span><span class="account-name">${esc(label)}</span></summary>
      <div class="menu">${items.join('')}</div>
    </details>`;
  }

  function renderSidebar() {
    renderNav();
    renderProgress();
    renderAdminBox();
  }

  // ---------- FHIR resources ----------
  const RESOURCE_PREFIX = 'resource-';
  const CATEGORY_PREFIX = 'resources-';

  function resourceCategories() {
    return state.data.resources.categories;
  }
  function allResources() {
    if (!state.resourceIndex) {
      state.resourceIndex = resourceCategories().flatMap((c) =>
        c.groups.flatMap((g) => g.resources.map((r) => ({ ...r, category: c, group: g.title, groupDescription: g.description }))),
      );
    }
    return state.resourceIndex;
  }
  function findResource(name) {
    return allResources().find((r) => r.name === name) || null;
  }
  function resourceCount(c) {
    return c.groups.reduce((n, g) => n + g.resources.length, 0);
  }

  function maturityBadge(m) {
    if (m === 'N') return '<span class="mat normative" title="Normative: stable content">Normative</span>';
    const level = Number(m);
    const bars = [1, 2, 3, 4, 5].map((i) => `<i class="${i <= level ? 'on' : ''}"></i>`).join('');
    return `<span class="mat" title="Trial use, FHIR Maturity Model level ${level} of 5">FMM ${level} <span class="mat-scale" aria-hidden="true">${bars}</span></span>`;
  }

  // Horizontal bar under the header: "All" plus one tab per category, then the
  // resources of the selected tab in one scrolling row.
  function renderResourceBar(route) {
    const bar = els.resourceBar;
    if (route.section !== 'resources') {
      bar.hidden = true;
      bar.innerHTML = '';
      return;
    }
    const active = route.category; // null = All
    const tab = (href, label, count, current) =>
      `<a href="#${href}"${current ? ' aria-current="true"' : ''}>${esc(label)} <span class="count">${count}</span></a>`;
    const cats = tab('resources', 'All', allResources().length, !active)
      + resourceCategories().map((c) => tab(CATEGORY_PREFIX + c.id, c.title, resourceCount(c), active && c.id === active.id)).join('');
    const link = (r) => {
      const id = RESOURCE_PREFIX + r.name;
      const cur = route.resource && route.resource.name === r.name ? ' aria-current="page"' : '';
      const done = state.studied.has(id);
      return `<a href="#${id}"${cur}><span class="dot${done ? ' done' : ''}"></span>${esc(r.name)}</a>`;
    };
    const strip = active
      ? active.groups.map((g) => `<span class="grp" title="${esc(g.description || '')}">${esc(g.title)}</span>` + g.resources.map(link).join('')).join('')
      : resourceCategories().map((c) => `<span class="grp">${esc(c.title)}</span>`
        + c.groups.flatMap((g) => g.resources).map(link).join('')).join('');
    bar.innerHTML = `<div class="res-cats">${cats}</div><div class="res-strip">${strip}</div>`;
    bar.hidden = false;
    const cur = bar.querySelector('.res-strip [aria-current="page"]');
    if (cur) {
      const s = bar.querySelector('.res-strip');
      s.scrollLeft = cur.offsetLeft - s.clientWidth / 2 + cur.offsetWidth / 2;
    }
  }

  function resourceCard(r) {
    const done = state.studied.has(RESOURCE_PREFIX + r.name);
    return `<a class="res-card" href="#${RESOURCE_PREFIX}${esc(r.name)}">
      <span class="res-card-top">
        <span class="dot${done ? ' done' : ''}" title="${done ? 'Studied' : 'Not studied yet'}"></span>
        <span class="name">${esc(r.name)}</span>${maturityBadge(r.maturity)}
      </span>
      <span class="desc">${esc(r.description)}</span>
    </a>`;
  }

  const MATURITY_FILTERS = [['any', 'Any'], ['N', 'Normative'], ['trial', 'Trial use']];
  const STUDIED_FILTERS = [['any', 'Any'], ['todo', 'Not studied'], ['done', 'Studied']];

  function filtersActive() {
    return Boolean(state.resourceFilter.trim()) || state.maturityFilter !== 'any' || state.studiedFilter !== 'any';
  }

  function filteredResources(route) {
    const q = state.resourceFilter.trim().toLowerCase();
    let list = allResources();
    if (route.category) list = list.filter((r) => r.category.id === route.category.id);
    if (state.maturityFilter === 'N') list = list.filter((r) => r.maturity === 'N');
    if (state.maturityFilter === 'trial') list = list.filter((r) => r.maturity !== 'N');
    if (state.studiedFilter !== 'any') {
      const want = state.studiedFilter === 'done';
      list = list.filter((r) => state.studied.has(RESOURCE_PREFIX + r.name) === want);
    }
    if (q) {
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
      list = [...list].sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)));
    }
    return list;
  }

  function groupedSection(c, headingLevel) {
    const head = headingLevel === 2
      ? `<div class="res-cat-head"><h2>${esc(c.title)}</h2><p>${esc(c.description)}</p></div>`
      : '';
    return `<section class="res-category">${head}
      ${c.groups.map((g) => `<section class="res-group">
        <h3>${esc(g.title)} <span class="n">${g.resources.length}</span></h3>
        ${g.description ? `<p class="res-group-desc">${esc(g.description)}</p>` : ''}
        <div class="res-grid">${g.resources.map((r) => resourceCard({ ...r, category: c, group: g.title })).join('')}</div>
      </section>`).join('')}</section>`;
  }

  function renderResourceResults(route) {
    const scope = route.category ? route.category.title : 'all categories';
    if (!filtersActive()) {
      if (route.category) return groupedSection(route.category, 2);
      return resourceCategories().map((c) => groupedSection(c, 2)).join('');
    }
    const hits = filteredResources(route);
    const parts = [];
    if (state.resourceFilter.trim()) parts.push(`matching “${esc(state.resourceFilter.trim())}”`);
    if (state.maturityFilter === 'N') parts.push('normative');
    if (state.maturityFilter === 'trial') parts.push('trial use');
    if (state.studiedFilter === 'done') parts.push('studied');
    if (state.studiedFilter === 'todo') parts.push('not studied yet');
    return `<div class="res-cat-head"><h2>${hits.length} ${hits.length === 1 ? 'resource' : 'resources'}</h2>
        <p>In ${esc(scope)}, ${parts.join(', ')}. <button class="link-btn" type="button" data-action="res-clear">Clear filters</button></p></div>
      ${hits.length ? `<div class="res-grid">${hits.map(resourceCard).join('')}</div>`
        : '<p class="res-empty">No resource matches these filters. Try a shorter word, or pick All at the top.</p>'}`;
  }

  function filterChips(key, options, current, label) {
    return `<div class="seg" role="group" aria-label="${esc(label)}"><span class="seg-label">${esc(label)}</span>${options.map(([v, t]) =>
      `<button type="button" class="seg-btn" data-action="res-filter" data-key="${key}" data-value="${v}" aria-pressed="${v === current}">${esc(t)}</button>`).join('')}</div>`;
  }

  function renderResourceFilters() {
    return `${filterChips('maturityFilter', MATURITY_FILTERS, state.maturityFilter, 'Maturity')}
      ${filterChips('studiedFilter', STUDIED_FILTERS, state.studiedFilter, 'Progress')}`;
  }

  function renderResourceIndex(route) {
    const all = allResources();
    const done = all.filter((r) => state.studied.has(RESOURCE_PREFIX + r.name)).length;
    const title = route.category ? route.category.title : 'All FHIR resources';
    return `<article class="page wide">
      <header class="page-head">
        <p class="eyebrow">FHIR R4 (4.0.1) · ${all.length} resources · ${done} studied</p>
        <h1 class="page-title">${esc(title)}</h1>
        <p class="lead">Every resource in FHIR R4, grouped the way the specification’s
          <a href="${esc(state.data.resources.specBase)}resourcelist.html" target="_blank" rel="noopener noreferrer">resource list</a> groups them.
          Narrow the list with a category above, or with search and the filters below.</p>
      </header>
      <div class="res-tools">
        <label for="resource-filter" class="visually-hidden">Search resources</label>
        <input id="resource-filter" type="search" placeholder="Search by name or definition" autocomplete="off" value="${esc(state.resourceFilter)}">
        <div class="res-filters" id="resource-filters">${renderResourceFilters()}</div>
      </div>
      <div id="resource-results">${renderResourceResults(route)}</div>
    </article>`;
  }

  function refreshResourceResults() {
    const route = parseRoute(state.route);
    const box = document.getElementById('resource-results');
    const f = document.getElementById('resource-filters');
    if (box) box.innerHTML = renderResourceResults(route);
    if (f) f.innerHTML = renderResourceFilters();
  }

  function renderResourcePage(route) {
    const r = route.resource;
    const id = RESOURCE_PREFIX + r.name;
    const note = state.data.notes[id] || { markdown: '', edited: false };
    const list = allResources();
    const i = list.findIndex((x) => x.name === r.name);
    const prev = list[i - 1];
    const next = list[i + 1];
    const studied = state.studied.has(id);
    const editing = state.editing && state.editing.id === id;
    const specUrl = state.data.resources.specBase + r.page;
    const hasNotes = note.markdown && note.markdown.trim();

    let notesBody;
    if (editing) notesBody = renderEditor();
    else if (hasNotes) notesBody = `<div class="notes">${renderMarkdown(note.markdown)}</div>`;
    else notesBody = `<div class="empty-notes"><p>No study notes for ${esc(r.name)} yet.</p>
      ${state.admin ? `<button class="btn small primary" type="button" data-action="edit" data-id="${id}">Add notes</button>` : ''}</div>`;

    return `<article class="page">
      <header class="page-head">
        <p class="eyebrow">${esc(r.category.title)} · ${esc(r.group)}</p>
        <h1 class="page-title res-title">${esc(r.name)}</h1>
        <div class="meta-row">
          ${maturityBadge(r.maturity)}
          ${notesMeta(note)}
          <span class="spacer"></span>
          <a class="btn small" href="${esc(specUrl)}" target="_blank" rel="noopener noreferrer">Open in the R4 spec ↗</a>
        </div>
      </header>
      ${storageNotice()}
      <section class="definition" aria-labelledby="def-${esc(r.name)}">
        <h2 id="def-${esc(r.name)}">Definition</h2>
        <p>${esc(r.description)}</p>
        <span class="src">From the FHIR R4 specification.</span>
      </section>
      <section class="res-context" aria-label="Where ${esc(r.name)} fits">
        <p class="res-context-path"><a href="#resources-${esc(r.category.id)}">${esc(r.category.title)}</a> › ${esc(r.group)}</p>
        ${r.groupDescription ? `<p>${esc(r.groupDescription)}</p>` : ''}
      </section>
      <section aria-label="Study notes">
        <div class="notes-head"><h2>Study notes</h2>${!editing && hasNotes ? editButton(id) : ''}</div>
        ${notesBody}
      </section>
      ${renderMyNotesPanel(id)}
      <footer class="topic-foot">
        <label class="studied-toggle${studied ? ' on' : ''}">
          <input type="checkbox" id="studied-${esc(id)}" data-action="studied" data-id="${esc(id)}"${studied ? ' checked' : ''}>
          <span>${studied ? 'Studied. Nice work.' : 'Mark as studied'}</span>
        </label>
        <nav class="pager" aria-label="Previous and next resource">
          ${prev ? `<a class="prev" href="#${RESOURCE_PREFIX}${esc(prev.name)}"><span class="dir">Previous</span><span class="t">${esc(prev.name)}</span></a>` : ''}
          ${next ? `<a class="next" href="#${RESOURCE_PREFIX}${esc(next.name)}"><span class="dir">Next</span><span class="t">${esc(next.name)}</span></a>` : ''}
        </nav>
      </footer>
    </article>`;
  }

  // ---------- Pages ----------
  function storageNotice() {
    if (!state.admin) return '';
    const d = state.data;
    if (d.storageError) return `<div class="notice error">${esc(d.storageError)}</div>`;
    if (d.storage === 'read-only') return '<div class="notice">No database is connected, so edits can’t be saved. Add <code>DATABASE_URL</code> in Vercel and redeploy.</div>';
    if (d.storage === 'memory') return '<div class="notice">Local preview: edits are kept in memory and are lost when the dev server stops.</div>';
    return '';
  }

  function notesMeta(note) {
    return note && note.edited && note.updatedAt
      ? `<span class="chip edited" title="These notes were edited by the admin">Updated ${esc(formatDate(note.updatedAt))}</span>`
      : '';
  }

  function editButton(id) {
    return state.admin ? `<span class="spacer"></span><button class="btn small" type="button" data-action="edit" data-id="${id}">Edit notes</button>` : '';
  }

  function renderOverview() {
    const { exam, domains, notes } = state.data;
    const note = notes[OVERVIEW];
    const ticks = [0, 10, 20, 30, 40];
    const pos = (v) => `${(v / AXIS_MAX) * 100}%`;
    const rows = domains.filter((d) => d.weight).map((d) => {
      const done = d.topics.filter((t) => state.studied.has(t.id)).length;
      return `<a class="weight-row" href="#${d.topics[0].id}">
        <span class="weight-name">${esc(d.title)}<small>${d.topics.length} topics · ${done} studied</small></span>
        <span class="weight-track" aria-label="${range(d.weight)} of the exam">
          ${ticks.map((t) => `<span class="weight-grid" style="left:${pos(t)}"></span>`).join('')}
          <span class="weight-bar" style="left:${pos(d.weight[0])};width:${pos(d.weight[1] - d.weight[0])}"></span>
          <span class="weight-label" style="left:${pos(d.weight[1])}">${range(d.weight)}</span>
        </span>
      </a>`;
    }).join('');

    return `<article class="page">
      <header class="page-head">
        <p class="eyebrow">HL7 FHIR ${esc(exam.fhirVersion)} certification</p>
        <h1 class="page-title">${esc(exam.name)} exam</h1>
        <div class="meta-row">${notesMeta(note)}${state.editing && state.editing.id === OVERVIEW ? '' : editButton(OVERVIEW)}</div>
      </header>
      ${storageNotice()}
      <div class="stats">
        <div class="stat"><div class="v">${exam.questions}</div><div class="k">multiple-choice questions</div></div>
        <div class="stat"><div class="v">${exam.minutes / 60} h</div><div class="k">to finish the exam</div></div>
        <div class="stat"><div class="v">${exam.passPercent}%</div><div class="k">needed to pass</div></div>
        <div class="stat"><div class="v">${esc(exam.fhirVersion)}</div><div class="k">FHIR version tested</div></div>
      </div>
      <div id="random-card-box">${renderRandomCard()}</div>
      <h2 class="section-title">Where the marks are</h2>
      <p class="section-sub">Share of exam questions for each competency, from HL7’s study guide.</p>
      <div class="weights">
        ${rows}
        <div class="weight-axis" aria-hidden="true"><span></span>
          <span class="ticks">${ticks.map((t) => `<span class="tick" style="left:${pos(t)}">${t}%</span>`).join('')}</span>
        </div>
      </div>
      ${state.editing && state.editing.id === OVERVIEW ? renderEditor() : `<div class="notes overview-notes">${renderMarkdown(note.markdown)}</div>`}
    </article>`;
  }

  function renderTopic(t) {
    const note = state.data.notes[t.id];
    const list = topicList();
    const i = list.findIndex((x) => x.id === t.id);
    const prev = list[i - 1];
    const next = list[i + 1];
    const studied = state.studied.has(t.id);
    const editing = state.editing && state.editing.id === t.id;

    return `<article class="page">
      <header class="page-head">
        <p class="eyebrow">${esc(t.domain.title)}${t.domain.weight ? ` · ${range(t.domain.weight)}` : ''}</p>
        <h1 class="page-title">${esc(t.title)}</h1>
        <div class="meta-row">
          ${t.weight ? `<span class="chip" title="Share of exam questions">${range(t.weight)} of exam</span>` : '<span class="chip">Background for every exam area</span>'}
          ${notesMeta(note)}
          ${editing ? '' : editButton(t.id)}
        </div>
      </header>
      ${storageNotice()}
      <section class="objectives" aria-labelledby="obj-${t.id}">
        <h2 id="obj-${t.id}">${t.weight ? 'What the exam expects' : 'What you’ll learn'}</h2>
        <ul>${t.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
      </section>
      ${editing ? renderEditor() : `<div class="notes">${renderMarkdown(note.markdown)}</div>`}
      ${renderMyNotesPanel(t.id)}
      <footer class="topic-foot">
        <label class="studied-toggle${studied ? ' on' : ''}">
          <input type="checkbox" id="studied-${t.id}" data-action="studied" data-id="${t.id}"${studied ? ' checked' : ''}>
          <span>${studied ? 'Studied. Nice work.' : 'Mark as studied'}</span>
        </label>
        <nav class="pager" aria-label="Previous and next topic">
          ${prev ? `<a class="prev" href="#${prev.id}"><span class="dir">Previous</span><span class="t">${esc(prev.title)}</span></a>` : ''}
          ${next ? `<a class="next" href="#${next.id}"><span class="dir">Next</span><span class="t">${esc(next.title)}</span></a>` : ''}
        </nav>
      </footer>
    </article>`;
  }

  function renderEditor() {
    const e = state.editing;
    const note = state.data.notes[e.id];
    const dirty = e.draft !== e.original;
    return `<section class="editor" data-pane="${e.pane}" aria-label="Edit notes">
      <div class="editor-bar">
        <div class="editor-tabs" role="group" aria-label="Editor view">
          <button class="btn small" type="button" data-action="pane" data-pane="write" aria-pressed="${e.pane === 'write'}">Write</button>
          <button class="btn small" type="button" data-action="pane" data-pane="preview" aria-pressed="${e.pane === 'preview'}">Preview</button>
        </div>
        <span class="spacer"></span>
        ${note.edited ? '<button class="btn small ghost danger" type="button" data-action="restore-ask">Restore original notes</button>' : ''}
        <button class="btn small" type="button" data-action="cancel">Cancel</button>
        <button class="btn small primary" type="button" data-action="save"${e.busy || !dirty ? ' disabled' : ''}>${e.busy ? 'Saving…' : 'Save notes'}</button>
      </div>
      ${e.confirmRestore ? `<div class="notice confirm">This replaces your edits with the original study notes.
          <button class="btn small danger" type="button" data-action="restore">Restore original</button>
          <button class="btn small ghost" type="button" data-action="restore-cancel">Keep my edits</button></div>` : ''}
      ${e.error ? `<div class="notice error" role="alert">${esc(e.error)}</div>` : ''}
      <div class="editor-panes">
        <div>
          <label class="visually-hidden" for="editor-text">Notes in Markdown</label>
          <textarea id="editor-text" spellcheck="true">${esc(e.draft)}</textarea>
        </div>
        <div class="preview notes" id="editor-preview" aria-live="off">${renderMarkdown(e.draft)}</div>
      </div>
      <p class="editor-help">Write in Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>- list</code>, <code>| tables |</code>, <code>\`code\`</code> and fenced code blocks. Press Ctrl+S (⌘S on Mac) to save.</p>
    </section>`;
  }

  // ---------- My notes (signed-in visitors) ----------
  function pageInfo(id) {
    if (id.startsWith(RESOURCE_PREFIX)) {
      const r = findResource(id.slice(RESOURCE_PREFIX.length));
      return r ? { title: r.name, where: `FHIR resources · ${r.category.title}`, mono: true } : null;
    }
    const t = findTopic(id);
    if (!t) return null;
    return { title: t.title, where: t.domain ? `Study guide · ${t.domain.title}` : 'Study guide' };
  }

  function myNoteText(id) {
    if (Object.prototype.hasOwnProperty.call(state.myDrafts, id)) return state.myDrafts[id];
    return state.myNotes[id] ? state.myNotes[id].markdown : '';
  }

  function myStatusText(id) {
    const st = state.myStatus[id];
    if (st === 'saving') return 'Saving…';
    if (st === 'pending') return 'Unsaved changes';
    if (st && st.startsWith('error:')) return `Not saved: ${st.slice(6)}`;
    const n = state.myNotes[id];
    return n && n.updatedAt ? `Saved ${formatDate(n.updatedAt)}` : '';
  }

  function renderMyNotesPanel(id) {
    const head = `<div class="my-notes-head"><h2>My notes</h2><span class="chip private">Only you can see these</span></div>`;
    if (!state.accountsAvailable) {
      return `<section class="my-notes" aria-label="My notes">${head}
        <p class="empty-notes">Personal notes aren’t available on this site yet.</p></section>`;
    }
    if (!state.user) {
      return `<section class="my-notes" aria-label="My notes">${head}
        <div class="empty-notes"><p>Create a free account to keep your own notes on this page. They’re saved to your account, so they’re there on any device.</p>
          <div class="confirm"><button class="btn small primary" type="button" data-action="account-open" data-mode="signup">Create account</button>
          <button class="btn small" type="button" data-action="account-open" data-mode="login">Sign in</button></div></div></section>`;
    }
    const text = myNoteText(id);
    const pane = state.myPane[id] || 'write';
    const err = (state.myStatus[id] || '').startsWith('error:');
    return `<section class="my-notes" aria-label="My notes">${head}
      <div class="my-notes-bar">
        <div class="editor-tabs show" role="group" aria-label="My notes view">
          <button class="btn small" type="button" data-action="my-pane" data-id="${esc(id)}" data-pane="write" aria-pressed="${pane === 'write'}">Write</button>
          <button class="btn small" type="button" data-action="my-pane" data-id="${esc(id)}" data-pane="preview" aria-pressed="${pane === 'preview'}">Preview</button>
        </div>
        <span class="my-status${err ? ' error' : ''}" id="my-status" aria-live="polite">${esc(myStatusText(id))}</span>
        ${err ? `<button class="btn small" type="button" data-action="my-retry" data-id="${esc(id)}">Try again</button>` : ''}
      </div>
      ${pane === 'write'
        ? `<label class="visually-hidden" for="my-notes-text">My notes</label>
           <textarea id="my-notes-text" class="my-textarea" data-id="${esc(id)}" placeholder="Write anything that helps you remember: mnemonics, examples, exam traps. Markdown works. Notes save automatically.">${esc(text)}</textarea>`
        : `<div class="notes my-preview">${text.trim() ? renderMarkdown(text) : '<p class="notes-empty">Nothing written yet.</p>'}</div>`}
    </section>`;
  }

  function updateMyStatus(id) {
    const el = document.getElementById('my-status');
    const ta = document.getElementById('my-notes-text');
    if (el && (!ta || ta.dataset.id === id)) {
      el.textContent = myStatusText(id);
      el.classList.toggle('error', (state.myStatus[id] || '').startsWith('error:'));
    }
  }

  const saveTimers = {};
  function scheduleMySave(id) {
    state.myStatus[id] = 'pending';
    updateMyStatus(id);
    clearTimeout(saveTimers[id]);
    saveTimers[id] = setTimeout(() => saveMyNote(id), 900);
  }

  async function saveMyNote(id) {
    clearTimeout(saveTimers[id]);
    delete saveTimers[id];
    if (!Object.prototype.hasOwnProperty.call(state.myDrafts, id)) return;
    const text = state.myDrafts[id];
    state.myStatus[id] = 'saving';
    updateMyStatus(id);
    try {
      const saved = await api(`/api/my-notes?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ markdown: text }) });
      if (saved.markdown) state.myNotes[id] = { markdown: saved.markdown, updatedAt: saved.updatedAt };
      else delete state.myNotes[id];
      if (state.myDrafts[id] === text) { delete state.myDrafts[id]; delete state.myStatus[id]; }
      else scheduleMySave(id);
    } catch (err) {
      if (err.status === 401) {
        state.user = null;
        renderAdminBox();
        state.myStatus[id] = 'error:you were signed out. Copy your text, sign in again, and paste it back.';
      } else {
        state.myStatus[id] = `error:${err.message}`;
      }
    }
    updateMyStatus(id);
    const retry = document.querySelector('[data-action="my-retry"]');
    if (retry && !(state.myStatus[id] || '').startsWith('error:')) retry.remove();
  }

  function flushMySaves() {
    Object.keys(saveTimers).forEach((id) => saveMyNote(id));
  }

  function renderMyNotesPage() {
    const head = `<header class="page-head">
        <p class="eyebrow">Private to you</p>
        <h1 class="page-title">My notes</h1>
        <p class="lead">Everything you’ve written on the study guide and resource pages, newest first.</p>
      </header>`;
    if (!state.accountsAvailable) {
      return `<article class="page">${head}<div class="notice">Personal notes need a database. Add <code>DATABASE_URL</code> in Vercel and redeploy.</div></article>`;
    }
    if (!state.user) {
      return `<article class="page">${head}<div class="empty-notes">
        <p>Create a free account to keep your own notes on any topic or resource. Your notes are private and saved to your account.</p>
        <div class="confirm"><button class="btn small primary" type="button" data-action="account-open" data-mode="signup">Create account</button>
        <button class="btn small" type="button" data-action="account-open" data-mode="login">Sign in</button></div></div></article>`;
    }
    const ids = Object.keys(state.myNotes).filter((id) => pageInfo(id));
    if (!ids.length) {
      return `<article class="page">${head}<div class="empty-notes">
        <p>You haven’t written any notes yet. Open a topic in the study guide or a FHIR resource and use the <strong>My notes</strong> box at the bottom of the page.</p>
        <div class="confirm"><a class="btn small" href="#ig-select-profiles">Go to the first topic</a><a class="btn small" href="#resource-Patient">Open Patient</a></div></div></article>`;
    }
    return `<article class="page">${head}
      <div class="res-tools"><label for="my-filter" class="visually-hidden">Search my notes</label>
        <input id="my-filter" type="search" placeholder="Search my notes" autocomplete="off" value="${esc(state.myFilter)}"></div>
      <div id="my-results">${renderMyNotesList()}</div>
    </article>`;
  }

  function renderMyNotesList() {
    const q = state.myFilter.trim().toLowerCase();
    const rows = Object.entries(state.myNotes)
      .map(([id, n]) => ({ id, n, info: pageInfo(id) }))
      .filter((x) => x.info && (!q || x.n.markdown.toLowerCase().includes(q) || x.info.title.toLowerCase().includes(q)))
      .sort((a, b) => String(b.n.updatedAt).localeCompare(String(a.n.updatedAt)));
    if (!rows.length) return '<p class="res-empty">None of your notes match that search.</p>';
    return `<p class="my-count">${rows.length} ${rows.length === 1 ? 'page' : 'pages'} with notes</p><div class="my-list">${rows.map(({ id, n, info }) => {
      const excerpt = n.markdown.replace(/[#*`>|_-]+/g, ' ').replace(/\s+/g, ' ').trim();
      return `<a class="my-item" href="#${esc(id)}">
        <span class="my-where">${esc(info.where)}</span>
        <span class="my-title${info.mono ? ' mono' : ''}">${esc(info.title)}</span>
        <span class="my-excerpt">${esc(excerpt.length > 220 ? excerpt.slice(0, 220) + '…' : excerpt)}</span>
        <span class="my-date">Updated ${esc(formatDate(n.updatedAt))}</span>
      </a>`;
    }).join('')}</div>`;
  }

  // ---------- Study cards ----------
  const DECKS = [
    { id: 'scenario', title: 'Which resource?', blurb: 'Real-life situations. Name the resource you would use.' },
    { id: 'definition', title: 'Definition → resource', blurb: 'The official definition from the spec, with the resource name hidden.' },
    { id: 'reverse', title: 'Resource → what it’s for', blurb: 'See the resource name and recall what it’s used for.' },
  ];

  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function maskName(text, name) {
    const spaced = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    const escRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.split(name).join('_____').replace(new RegExp(escRe(spaced), 'gi'), '_____');
  }

  function deckCards(deckId) {
    if (deckId === 'scenario') {
      return (state.data.cards || []).map((c, i) => ({ id: `s${i}:${c.resource}`, r: findResource(c.resource), prompt: c.scenario, note: c.note }))
        .filter((c) => c.r);
    }
    return allResources().map((r) => ({
      id: `${deckId === 'definition' ? 'd' : 'r'}:${r.name}`, r,
      prompt: deckId === 'definition' ? maskName(r.description, r.name) : r.name,
    }));
  }

  function cardPool() {
    const c = state.cards;
    return deckCards(c.deck).filter((x) => (c.category === 'all' || x.r.category.id === c.category)
      && (!c.hideKnown || state.cardMarks[x.id] !== 'known'));
  }

  function reshuffle() {
    const c = state.cards;
    c.order = shuffle(cardPool().map((x) => x.id));
    c.index = 0;
    c.flipped = false;
    c.key = `${c.deck}|${c.category}|${c.hideKnown}`;
  }

  function currentCard() {
    const c = state.cards;
    if (c.key !== `${c.deck}|${c.category}|${c.hideKnown}` || !c.order.length) reshuffle();
    const pool = new Map(deckCards(c.deck).map((x) => [x.id, x]));
    return pool.get(c.order[c.index]) || null;
  }

  function exampleFor(name) {
    const ex = (state.data.cards || []).find((c) => c.resource === name);
    return ex ? ex.scenario : '';
  }

  function cardFaces(card) {
    const deck = state.cards.deck;
    const r = card.r;
    const where = `${esc(r.category.title)} › ${esc(r.group)}`;
    const link = `<a class="card-link" href="#${RESOURCE_PREFIX}${esc(r.name)}">Open ${esc(r.name)} →</a>`;
    if (deck === 'scenario') {
      return {
        front: `<p class="card-label">Which resource would you use?</p><p class="card-prompt">${esc(card.prompt)}</p>`,
        back: `<p class="card-label">Answer</p><p class="card-answer">${esc(r.name)}</p><p class="card-where">${where}</p>
          <p class="card-note">${esc(card.note || '')}</p>${link}`,
      };
    }
    if (deck === 'definition') {
      return {
        front: `<p class="card-label">Which resource is this?</p><p class="card-prompt small">${esc(card.prompt)}</p>`,
        back: `<p class="card-label">Answer</p><p class="card-answer">${esc(r.name)}</p><p class="card-where">${where}</p>${link}`,
      };
    }
    const ex = exampleFor(r.name);
    return {
      front: `<p class="card-label">What is this resource for?</p><p class="card-answer">${esc(r.name)}</p><p class="card-where">${where}</p>`,
      back: `<p class="card-label">${esc(r.name)}</p><p class="card-prompt small">${esc(r.description)}</p>
        ${ex ? `<p class="card-note"><strong>Example:</strong> ${esc(ex)}</p>` : ''}${link}`,
    };
  }

  function renderCardsPage() {
    const c = state.cards;
    const card = currentCard();
    const pool = c.order.length;
    const all = deckCards(c.deck).filter((x) => c.category === 'all' || x.r.category.id === c.category);
    const known = all.filter((x) => state.cardMarks[x.id] === 'known').length;
    const learning = all.filter((x) => state.cardMarks[x.id] === 'learning').length;
    const deck = DECKS.find((d) => d.id === c.deck);
    const chip = (key, value, label, pressed) =>
      `<button type="button" class="seg-btn" data-action="card-set" data-key="${key}" data-value="${value}" aria-pressed="${pressed}">${label}</button>`;

    let body;
    if (!card) {
      body = `<div class="empty-notes"><p>${c.hideKnown && all.length ? `You know all ${all.length} cards in this set. Nice work.` : 'There are no cards in this set.'}</p>
        <div class="confirm">${c.hideKnown ? '<button class="btn small primary" type="button" data-action="card-set" data-key="hideKnown" data-value="false">Show all cards again</button>' : ''}
        <button class="btn small" type="button" data-action="card-reset">Reset progress for this set</button></div></div>`;
    } else {
      const faces = cardFaces(card);
      const mark = state.cardMarks[card.id];
      body = `<div class="flashcard${c.flipped ? ' flipped' : ''}" role="button" tabindex="0" data-action="card-flip"
          aria-label="${c.flipped ? 'Card answer. Press to show the question' : 'Card question. Press to show the answer'}">
          <div class="card-inner">
            <div class="face front" aria-hidden="${c.flipped}">${faces.front}<span class="card-hint">Click or press Space to flip</span></div>
            <div class="face back" aria-hidden="${!c.flipped}">${faces.back}</div>
          </div>
          ${mark ? `<span class="card-mark ${mark}">${mark === 'known' ? 'Known' : 'Still learning'}</span>` : ''}
        </div>
        <div class="card-controls">
          <button class="btn" type="button" data-action="card-prev"${c.index === 0 ? ' disabled' : ''}>← Previous</button>
          ${c.flipped
            ? `<button class="btn learn" type="button" data-action="card-mark" data-value="learning">Still learning <kbd>1</kbd></button>
               <button class="btn primary" type="button" data-action="card-mark" data-value="known">I knew it <kbd>2</kbd></button>`
            : '<button class="btn primary" type="button" data-action="card-flip">Show answer</button>'}
          <button class="btn" type="button" data-action="card-next"${c.index >= pool - 1 ? ' disabled' : ''}>Next →</button>
        </div>`;
    }

    return `<article class="page cards-page">
      <header class="page-head">
        <p class="eyebrow">Study cards · ${esc(deck.title)}</p>
        <h1 class="page-title">Study cards</h1>
        <p class="lead">${esc(deck.blurb)} Cards come in random order. Mark each one so you can focus on the ones you’re still learning.</p>
      </header>
      <div class="card-settings">
        <div class="seg" role="group" aria-label="Deck"><span class="seg-label">Deck</span>
          ${DECKS.map((d) => chip('deck', d.id, `${esc(d.title)} <span class="count">${deckCards(d.id).length}</span>`, d.id === c.deck)).join('')}</div>
        <div class="seg" role="group" aria-label="Category"><span class="seg-label">Category</span>
          ${chip('category', 'all', 'All', c.category === 'all')}
          ${resourceCategories().map((cat) => chip('category', cat.id, esc(cat.title), c.category === cat.id)).join('')}</div>
        <div class="seg" role="group" aria-label="Which cards"><span class="seg-label">Show</span>
          ${chip('hideKnown', 'false', 'All cards', !c.hideKnown)}${chip('hideKnown', 'true', 'Hide cards I know', c.hideKnown)}</div>
      </div>
      <div class="card-progress">
        <span>${card ? `Card ${c.index + 1} of ${pool}` : 'No cards to show'}</span>
        <span class="tally"><span class="known">${known} known</span> · <span class="learning">${learning} still learning</span> · ${all.length} in set</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${all.length ? Math.round((known / all.length) * 100) : 0}%"></div></div>
      <div class="card-stage">${body}</div>
      <div class="card-foot">
        <button class="link-btn" type="button" data-action="card-shuffle">Shuffle again</button>
        <span class="kbd-help">Keys: <kbd>Space</kbd> flip · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>1</kbd> still learning · <kbd>2</kbd> I knew it</span>
      </div>
    </article>`;
  }

  function cardAction(action, value) {
    const c = state.cards;
    const card = currentCard();
    if (action === 'flip' && card) c.flipped = !c.flipped;
    else if (action === 'next' && c.index < c.order.length - 1) { c.index += 1; c.flipped = false; }
    else if (action === 'prev' && c.index > 0) { c.index -= 1; c.flipped = false; }
    else if (action === 'mark' && card) {
      state.cardMarks[card.id] = value;
      saveCardMarks();
      if (c.hideKnown && value === 'known') {
        c.order.splice(c.index, 1);
        if (c.index >= c.order.length) c.index = Math.max(0, c.order.length - 1);
      } else if (c.index < c.order.length - 1) c.index += 1;
      c.flipped = false;
    } else if (action === 'shuffle') reshuffle();
    else if (action === 'reset') {
      deckCards(c.deck).filter((x) => c.category === 'all' || x.r.category.id === c.category).forEach((x) => delete state.cardMarks[x.id]);
      saveCardMarks();
      c.hideKnown = false;
      reshuffle();
    }
    renderMain();
    const fc = document.querySelector('.flashcard');
    if (fc && (action === 'flip' || action === 'next' || action === 'prev' || action === 'mark')) fc.focus({ preventScroll: true });
  }

  // A random scenario card on the overview page.
  function renderRandomCard() {
    const cards = state.data.cards || [];
    if (!cards.length) return '';
    if (!state.randomCard) state.randomCard = { index: Math.floor(Math.random() * cards.length), revealed: false };
    const rc = state.randomCard;
    const card = cards[rc.index];
    const r = findResource(card.resource);
    return `<section class="random-card" aria-label="Random study card">
      <div class="random-head"><span class="card-label">Random study card</span>
        <span class="random-actions"><button class="link-btn" type="button" data-action="random-next">Another card</button>
        <a class="link-btn" href="#cards">All study cards</a></span></div>
      <p class="random-q"><strong>Which resource would you use?</strong> ${esc(card.scenario)}</p>
      ${rc.revealed && r
        ? `<p class="random-a"><a class="res-chip" href="#${RESOURCE_PREFIX}${esc(r.name)}">${esc(r.name)}</a> ${esc(card.note)}</p>`
        : '<button class="btn small" type="button" data-action="random-reveal">Show answer</button>'}
    </section>`;
  }

  function renderMain() {
    if (!state.data) return;
    const route = parseRoute(state.route);
    let title = 'FHIR Foundational Prep';
    if (route.section === 'cards') {
      els.main.innerHTML = renderCardsPage();
      document.title = 'Study cards · FHIR Foundational Prep';
      return;
    }
    if (route.section === 'mine') {
      els.main.innerHTML = renderMyNotesPage();
      document.title = 'My notes · FHIR Foundational Prep';
      return;
    }
    if (route.section === 'resources') {
      if (route.resource) {
        els.main.innerHTML = renderResourcePage(route);
        title = `${route.resource.name} · FHIR resources`;
      } else {
        els.main.innerHTML = renderResourceIndex(route);
        title = route.category ? `FHIR resources · ${route.category.title}` : 'FHIR resources';
      }
    } else {
      const t = route.topic;
      els.main.innerHTML = t.id === OVERVIEW ? renderOverview() : renderTopic(t);
      if (t.id !== OVERVIEW) title = `${t.title} · FHIR Foundational Prep`;
    }
    document.title = title;
  }

  function renderHeader(route) {
    document.body.dataset.section = route.section;
    document.querySelectorAll('.section-nav a').forEach((a) => {
      if (a.dataset.section === route.section) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    renderResourceBar(route);
    measureHeader();
  }

  function render() {
    renderHeader(parseRoute(state.route));
    renderSidebar();
    renderMain();
  }

  // ---------- Routing ----------
  // #overview and #<topic-id>            study guide
  // #resources, #resources-<category>    resource index
  // #resource-<Name>                     one FHIR resource
  function parseRoute(id) {
    const cats = resourceCategories();
    if (id === 'my-notes') return { section: 'mine', key: id };
    if (id === 'cards') return { section: 'cards', key: id };
    if (id === 'resources') {
      return { section: 'resources', key: id, category: null, resource: null };
    }
    if (id.startsWith(CATEGORY_PREFIX)) {
      const c = cats.find((x) => CATEGORY_PREFIX + x.id === id);
      if (c) return { section: 'resources', key: id, category: c, resource: null };
      return { section: 'resources', key: 'resources', category: null, resource: null };
    }
    if (id.startsWith(RESOURCE_PREFIX)) {
      const r = findResource(id.slice(RESOURCE_PREFIX.length));
      if (r) {
        // Keep the bar on the tab the visitor came from: All, or the resource's own category.
        const category = state.lastCategory === 'all' ? null : r.category;
        return { section: 'resources', key: id, category, resource: r };
      }
    }
    const t = findTopic(id) || findTopic(OVERVIEW);
    return { section: 'guide', key: t.id, topic: t };
  }

  function routeFromHash() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    const route = parseRoute(id || OVERVIEW);
    if (route.section === 'resources' && !route.resource) state.lastCategory = route.category ? route.category.id : 'all';
    return route.key;
  }

  // Keep --header-h in sync so the sidebar and drawer sit right under the header.
  function measureHeader() {
    const h = document.getElementById('site-header').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-h', `${Math.round(h)}px`);
  }
  window.addEventListener('resize', measureHeader);

  function isDirty() {
    return state.editing && state.editing.draft !== state.editing.original;
  }

  window.addEventListener('hashchange', () => {
    if (!state.data) return;
    const next = routeFromHash();
    if (next === state.route) return;
    if (isDirty()) {
      history.replaceState(null, '', `#${state.route}`);
      state.editing.error = 'You have unsaved changes. Save them or press Cancel before leaving this page.';
      renderMain();
      closeDrawer();
      return;
    }
    flushMySaves();
    state.editing = null;
    state.route = next;
    render();
    closeDrawer();
    window.scrollTo(0, 0);
    els.main.focus({ preventScroll: true });
  });

  window.addEventListener('beforeunload', (ev) => {
    Object.keys(saveTimers).forEach((id) => {
      try {
        fetch(`/api/my-notes?id=${encodeURIComponent(id)}`, {
          method: 'PUT', keepalive: true, credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markdown: state.myDrafts[id] }),
        });
      } catch { /* best effort */ }
    });
    if (isDirty()) { ev.preventDefault(); ev.returnValue = ''; }
  });

  // ---------- Drawer (phones) ----------
  function openDrawer() {
    els.sidebar.classList.add('open');
    els.scrim.hidden = false;
    els.menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    els.sidebar.classList.remove('open');
    els.scrim.hidden = true;
    els.menuBtn.setAttribute('aria-expanded', 'false');
  }
  els.menuBtn.addEventListener('click', () => (els.sidebar.classList.contains('open') ? closeDrawer() : openDrawer()));
  els.scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeDrawer();
    const typing = ev.target.closest && ev.target.closest('input, textarea, select, dialog, [contenteditable]');
    if (!typing && !ev.ctrlKey && !ev.metaKey && !ev.altKey && state.data && parseRoute(state.route).section === 'cards') {
      const onButton = ev.target.closest && ev.target.closest('button, a');
      if ((ev.key === ' ' || ev.key === 'Enter') && !onButton) { ev.preventDefault(); cardAction('flip'); return; }
      if ((ev.key === ' ' || ev.key === 'Enter') && ev.target.classList.contains('flashcard')) { ev.preventDefault(); cardAction('flip'); return; }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); cardAction('next'); return; }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); cardAction('prev'); return; }
      if ((ev.key === '1' || ev.key === '2') && state.cards.flipped) { cardAction('mark', ev.key === '1' ? 'learning' : 'known'); return; }
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 's' && state.editing) {
      ev.preventDefault();
      saveEdit();
    }
  });

  els.filter.addEventListener('input', () => {
    state.filter = els.filter.value;
    renderNav();
  });

  // ---------- Visitor accounts ----------
  function showDialog(d) {
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  function hideDialog(d) {
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }
  document.querySelectorAll('dialog [data-close]').forEach((b) => b.addEventListener('click', () => hideDialog(b.closest('dialog'))));

  function setAccountMode(mode) {
    state.accountMode = mode;
    const signup = mode === 'signup';
    document.getElementById('tab-login').setAttribute('aria-selected', String(!signup));
    document.getElementById('tab-signup').setAttribute('aria-selected', String(signup));
    els.accountTitle.textContent = signup ? 'Create account' : 'Sign in';
    els.accountHelp.textContent = signup
      ? 'Create a free account to keep your own private study notes on every page.'
      : 'Sign in to see and edit your own study notes.';
    els.accountSubmit.textContent = signup ? 'Create account' : 'Sign in';
    els.accountPassword.autocomplete = signup ? 'new-password' : 'current-password';
    els.accountHint.hidden = !signup;
    els.accountError.hidden = true;
  }
  document.querySelectorAll('.dialog-tabs [data-mode]').forEach((b) => b.addEventListener('click', () => setAccountMode(b.dataset.mode)));

  function openAccount(mode) {
    closeMenus();
    setAccountMode(mode || 'login');
    els.accountPassword.value = '';
    if (!state.accountsAvailable) {
      els.accountError.textContent = 'Accounts aren’t available yet: the site owner needs to connect a database.';
      els.accountError.hidden = false;
    }
    showDialog(els.accountDialog);
    (els.accountEmail.value ? els.accountPassword : els.accountEmail).focus();
  }

  els.accountForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = els.accountEmail.value.trim();
    const password = els.accountPassword.value;
    if (!email || !password) {
      els.accountError.textContent = 'Enter your email and password.';
      els.accountError.hidden = false;
      return;
    }
    els.accountSubmit.disabled = true;
    els.accountError.hidden = true;
    try {
      const res = await api('/api/account', { method: 'POST', body: JSON.stringify({ action: state.accountMode, email, password }) });
      state.user = res.user.email;
      await loadMyNotes();
      hideDialog(els.accountDialog);
      els.accountPassword.value = '';
      render();
      toast(state.accountMode === 'signup' ? 'Account created. Your notes now save to your account.' : 'Signed in');
    } catch (err) {
      els.accountError.textContent = err.message;
      els.accountError.hidden = false;
    } finally {
      els.accountSubmit.disabled = false;
    }
  });

  async function loadMyNotes() {
    try {
      const res = await api('/api/my-notes');
      state.myNotes = res.notes || {};
    } catch {
      state.myNotes = {};
    }
  }

  function forgetUser() {
    Object.keys(saveTimers).forEach((id) => clearTimeout(saveTimers[id]));
    Object.keys(saveTimers).forEach((id) => delete saveTimers[id]);
    state.user = null;
    state.myNotes = {};
    state.myDrafts = {};
    state.myStatus = {};
    state.myPane = {};
  }

  async function accountLogout() {
    closeMenus();
    flushMySaves();
    try { await api('/api/account', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }); } catch { /* already signed out */ }
    forgetUser();
    render();
    toast('Signed out');
  }

  function openDelete() {
    closeMenus();
    els.deletePassword.value = '';
    els.deleteError.hidden = true;
    showDialog(els.deleteDialog);
    els.deletePassword.focus();
  }
  els.deleteForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    els.deleteSubmit.disabled = true;
    els.deleteError.hidden = true;
    try {
      await api('/api/account', { method: 'POST', body: JSON.stringify({ action: 'delete', password: els.deletePassword.value }) });
      hideDialog(els.deleteDialog);
      forgetUser();
      render();
      toast('Your account and notes were deleted');
    } catch (err) {
      els.deleteError.textContent = err.message;
      els.deleteError.hidden = false;
    } finally {
      els.deleteSubmit.disabled = false;
    }
  });

  function closeMenus() {
    document.querySelectorAll('details.account-menu[open]').forEach((d) => d.removeAttribute('open'));
  }
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('details.account-menu')) closeMenus();
  });

  // ---------- Admin ----------
  function openLogin() {
    els.loginError.hidden = true;
    els.loginPassword.value = '';
    if (!state.adminConfigured) {
      els.loginError.textContent = 'Admin sign-in isn’t set up yet. Add ADMIN_PASSWORD in Vercel’s environment variables and redeploy.';
      els.loginError.hidden = false;
    }
    if (typeof els.dialog.showModal === 'function') els.dialog.showModal();
    else els.dialog.setAttribute('open', '');
    els.loginPassword.focus();
  }
  function closeLogin() {
    if (typeof els.dialog.close === 'function') els.dialog.close();
    else els.dialog.removeAttribute('open');
  }
  els.loginCancel.addEventListener('click', closeLogin);
  els.loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    els.loginSubmit.disabled = true;
    els.loginError.hidden = true;
    try {
      await api('/api/auth', { method: 'POST', body: JSON.stringify({ password: els.loginPassword.value }) });
      state.admin = true;
      closeLogin();
      await reload();
      toast('Signed in. Use “Edit notes” on any topic.');
    } catch (err) {
      els.loginError.textContent = err.message;
      els.loginError.hidden = false;
    } finally {
      els.loginSubmit.disabled = false;
    }
  });

  async function logout() {
    closeMenus();
    if (isDirty()) {
      state.editing.error = 'Save or cancel your edits before signing out.';
      renderMain();
      return;
    }
    try { await api('/api/auth', { method: 'DELETE' }); } catch { /* cookie may already be gone */ }
    state.admin = false;
    state.editing = null;
    render();
    toast('Admin signed out');
  }

  function startEdit(id) {
    const md = state.data.notes[id].markdown;
    state.editing = { id, original: md, draft: md, pane: 'write', busy: false, error: null, confirmRestore: false };
    renderMain();
    const ta = document.getElementById('editor-text');
    if (ta) ta.focus();
  }

  async function saveEdit() {
    const e = state.editing;
    if (!e || e.busy || e.draft === e.original) return;
    e.busy = true; e.error = null;
    renderMain();
    try {
      const saved = await api(`/api/topics?id=${encodeURIComponent(e.id)}`, { method: 'PUT', body: JSON.stringify({ markdown: e.draft }) });
      state.data.notes[e.id] = { markdown: saved.markdown, edited: saved.edited, updatedAt: saved.updatedAt };
      state.editing = null;
      renderMain();
      toast('Notes saved');
    } catch (err) {
      e.busy = false;
      if (err.status === 401) {
        state.admin = false;
        renderAdminBox();
        e.error = 'Your admin session has ended. Your text is still here: sign in again from the sidebar, then save.';
      } else {
        e.error = err.message;
      }
      renderMain();
    }
  }

  async function restoreOriginal() {
    const e = state.editing;
    if (!e) return;
    e.busy = true;
    try {
      const saved = await api(`/api/topics?id=${encodeURIComponent(e.id)}`, { method: 'DELETE' });
      state.data.notes[e.id] = { markdown: saved.markdown, edited: false, updatedAt: null };
      state.editing = null;
      renderMain();
      toast('Original notes restored');
    } catch (err) {
      e.busy = false; e.confirmRestore = false; e.error = err.message;
      renderMain();
    }
  }

  // ---------- Event delegation ----------
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.tagName === 'INPUT') return;
    const action = el.dataset.action;
    const e = state.editing;
    if (action === 'login') openLogin();
    else if (action === 'admin-login') { hideDialog(els.accountDialog); openLogin(); }
    else if (action === 'account-open') openAccount(el.dataset.mode);
    else if (action === 'account-logout') accountLogout();
    else if (action === 'account-delete') openDelete();
    else if (action === 'my-pane') {
      const ta = document.getElementById('my-notes-text');
      if (ta) state.myDrafts[ta.dataset.id] = ta.value;
      state.myPane[el.dataset.id] = el.dataset.pane;
      if (state.myDrafts[el.dataset.id] === (state.myNotes[el.dataset.id] ? state.myNotes[el.dataset.id].markdown : '')) delete state.myDrafts[el.dataset.id];
      renderMain();
    }
    else if (action === 'my-retry') saveMyNote(el.dataset.id);
    else if (action === 'card-flip') { if (!ev.target.closest('a')) cardAction('flip'); }
    else if (action === 'card-next') cardAction('next');
    else if (action === 'card-prev') cardAction('prev');
    else if (action === 'card-mark') cardAction('mark', el.dataset.value);
    else if (action === 'card-shuffle') cardAction('shuffle');
    else if (action === 'card-reset') cardAction('reset');
    else if (action === 'card-set') {
      const k = el.dataset.key;
      state.cards[k] = k === 'hideKnown' ? el.dataset.value === 'true' : el.dataset.value;
      renderMain();
    }
    else if (action === 'random-reveal') { state.randomCard.revealed = true; document.getElementById('random-card-box').innerHTML = renderRandomCard(); }
    else if (action === 'random-next') {
      const n = (state.data.cards || []).length;
      let i = Math.floor(Math.random() * n);
      if (n > 1 && i === state.randomCard.index) i = (i + 1) % n;
      state.randomCard = { index: i, revealed: false };
      document.getElementById('random-card-box').innerHTML = renderRandomCard();
    }
    else if (action === 'logout') logout();
    else if (action === 'edit') startEdit(el.dataset.id);
    else if (action === 'cancel') { state.editing = null; renderMain(); }
    else if (action === 'save') saveEdit();
    else if (action === 'pane' && e) { e.pane = el.dataset.pane; renderMain(); }
    else if (action === 'restore-ask' && e) { e.confirmRestore = true; renderMain(); }
    else if (action === 'restore-cancel' && e) { e.confirmRestore = false; renderMain(); }
    else if (action === 'restore') restoreOriginal();
    else if (action === 'res-filter') { state[el.dataset.key] = el.dataset.value; refreshResourceResults(); }
    else if (action === 'res-clear') {
      state.resourceFilter = ''; state.maturityFilter = 'any'; state.studiedFilter = 'any';
      const input = document.getElementById('resource-filter');
      if (input) input.value = '';
      refreshResourceResults();
    }
  });

  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.dataset && el.dataset.action === 'studied') {
      if (el.checked) state.studied.add(el.dataset.id); else state.studied.delete(el.dataset.id);
      saveStudied();
      renderSidebar();
      renderResourceBar(parseRoute(state.route));
      const label = el.closest('.studied-toggle');
      label.classList.toggle('on', el.checked);
      label.querySelector('span').textContent = el.checked ? 'Studied. Nice work.' : 'Mark as studied';
    }
  });

  let previewTimer;
  document.addEventListener('input', (ev) => {
    if (ev.target.id === 'my-notes-text') {
      state.myDrafts[ev.target.dataset.id] = ev.target.value;
      scheduleMySave(ev.target.dataset.id);
      return;
    }
    if (ev.target.id === 'my-filter') {
      state.myFilter = ev.target.value;
      const box = document.getElementById('my-results');
      if (box) box.innerHTML = renderMyNotesList();
      return;
    }
    if (ev.target.id === 'resource-filter') {
      state.resourceFilter = ev.target.value;
      refreshResourceResults();
      return;
    }
    if (ev.target.id !== 'editor-text' || !state.editing) return;
    const e = state.editing;
    e.draft = ev.target.value;
    const saveBtn = document.querySelector('[data-action="save"]');
    if (saveBtn) saveBtn.disabled = e.busy || e.draft === e.original;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const p = document.getElementById('editor-preview');
      if (p) p.innerHTML = renderMarkdown(e.draft);
    }, 150);
  });

  // ---------- Start ----------
  async function reload() {
    const [data, auth, account] = await Promise.all([
      api('/api/topics'),
      api('/api/auth').catch(() => ({ admin: false, configured: false })),
      api('/api/account').catch(() => ({ user: null, available: false })),
    ]);
    state.data = data;
    state.accountsAvailable = Boolean(account.available);
    state.user = account.user ? account.user.email : null;
    if (state.user) await loadMyNotes();
    state.resourceIndex = null;
    state.admin = Boolean(data.admin);
    state.adminConfigured = Boolean(auth.configured);
    state.route = routeFromHash();
    render();
  }

  reload().catch((err) => {
    els.main.innerHTML = `<div class="page"><div class="notice error" role="alert">
      The topics couldn’t be loaded: ${esc(err.message)} Check that the site is running on Vercel (or with <code>npm run dev</code>) so the <code>/api</code> routes are available.
    </div></div>`;
  });
})();
